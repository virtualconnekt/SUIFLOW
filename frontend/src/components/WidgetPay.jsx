import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WalletProvider, ConnectButton, useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { getApiUrl } from '../services/api.js';

const WidgetPayContent = () => {
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get('merchantId');
  const initialAmount = searchParams.get('amount');
  const [amount, setAmount] = useState(initialAmount || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [exchangeRate, setExchangeRate] = useState(1500);
  const [convertedAmount, setConvertedAmount] = useState('');
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const [merchantAddress, setMerchantAddress] = useState('');

  // Fetch exchange rate on component mount
  React.useEffect(() => {
    async function fetchExchangeRate() {
      try {
        // Try to get merchant-specific live pricing first
        if (merchantId) {
          const merchantResponse = await fetch(getApiUrl(`/api/payments/merchant-settings/${merchantId}`));
          if (merchantResponse.ok) {
            const merchantData = await merchantResponse.json();
            const merchantUSDTRate = merchantData.settings?.usdtToNgnRate || 1550;
            
            // Get live SUI price
            const liveResponse = await fetch(getApiUrl('/api/payments/live-prices'));
            if (liveResponse.ok) {
              const liveData = await liveResponse.json();
              if (liveData.prices?.sui?.currentPrice) {
                // Use live SUI price with merchant-specific USDT rate
                const suiPriceUSD = liveData.prices.sui.currentPrice;
                const liveRate = suiPriceUSD * merchantUSDTRate;
                console.log(`🎯 Using merchant rate: 1 USDT = ₦${merchantUSDTRate}, SUI price: $${suiPriceUSD}, Final rate: 1 SUI = ₦${liveRate.toFixed(2)}`);
                setExchangeRate(liveRate);
                return;
              }
            }
          }
        }
        
        // Fallback: Try general live pricing
        const liveResponse = await fetch(getApiUrl('/api/payments/live-prices'));
        if (liveResponse.ok) {
          const liveData = await liveResponse.json();
          if (liveData.prices?.sui?.currentPrice) {
            // Use live SUI price with default USDT rate (1550 NGN/USDT)
            const suiPriceUSD = liveData.prices.sui.currentPrice;
            const defaultUSDTRate = 1550; // Default USDT to NGN rate
            const liveRate = suiPriceUSD * defaultUSDTRate;
            console.log(`📊 Using default rate: 1 USDT = ₦${defaultUSDTRate}, SUI price: $${suiPriceUSD}, Final rate: 1 SUI = ₦${liveRate.toFixed(2)}`);
            setExchangeRate(liveRate);
            return;
          }
        }
        
        // Fallback to static exchange rate
        const response = await fetch(getApiUrl('/api/payments/exchange-rate'));
        if (response.ok) {
          const data = await response.json();
          // Handle both old and new response formats
          const rate = data.exchangeRate || 
                      data.rates?.static?.suiToNgn || 
                      data.rates?.live?.rates?.suiNgn;
          if (rate && typeof rate === 'number') {
            console.log(`📈 Using fallback static rate: 1 SUI = ₦${rate}`);
            setExchangeRate(rate);
          }
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Keep the default value (1500) if fetch fails
      }
    }
    fetchExchangeRate();
  }, [merchantId]); // Add merchantId as dependency

  // Convert amount when currency or amount changes
  React.useEffect(() => {
    if (amount && !isNaN(amount)) {
      convertCurrency(parseFloat(amount), selectedCurrency, selectedCurrency === 'NGN' ? 'SUI' : 'NGN');
    }
  }, [amount, selectedCurrency, exchangeRate]);

  const convertCurrency = async (inputAmount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(inputAmount.toString());
      return;
    }

    setCurrencyLoading(true);
    try {
      // Try live conversion with merchant ID first
      if (merchantId) {
        const liveResponse = await fetch(getApiUrl('/api/payments/convert-currency-live'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: inputAmount,
            fromCurrency,
            toCurrency,
            merchantId
          })
        });

        if (liveResponse.ok) {
          const liveData = await liveResponse.json();
          const convertedValue = liveData.convertedAmount || liveData.conversion?.converted?.amount;
          if (convertedValue) {
            console.log(`💰 Live conversion: ${inputAmount} ${fromCurrency} → ${convertedValue} ${toCurrency} (Merchant: ${merchantId})`);
            setConvertedAmount(convertedValue.toString());
            return;
          }
        }
      }

      // Fallback to regular conversion API
      const response = await fetch(getApiUrl('/api/payments/convert-currency'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: inputAmount,
          fromCurrency,
          toCurrency
        })
      });

      if (response.ok) {
        const data = await response.json();
        const convertedValue = data.conversion?.converted?.amount || data.convertedAmount;
        if (convertedValue) {
          console.log(`📊 Fallback conversion: ${inputAmount} ${fromCurrency} → ${convertedValue} ${toCurrency}`);
          setConvertedAmount(convertedValue.toString());
          return;
        }
      }
      
      throw new Error('Currency conversion failed');
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Fallback calculation
      console.log(`🔄 Using fallback calculation with rate: ${exchangeRate || 1500}`);
      if (fromCurrency === 'SUI' && toCurrency === 'NGN') {
        setConvertedAmount((inputAmount * (exchangeRate || 1500)).toString());
      } else if (fromCurrency === 'NGN' && toCurrency === 'SUI') {
        setConvertedAmount((inputAmount / (exchangeRate || 1500)).toString());
      }
    } finally {
      setCurrencyLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    const numAmount = parseFloat(amount);
    if (currency === 'NGN') {
      return `₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === 'SUI') {
      return `${numAmount.toFixed(6)} SUI`;
    }
    return `${amount} ${currency}`;
  };

  const getSUIAmount = () => {
    // Always return SUI amount for blockchain transaction
    if (selectedCurrency === 'SUI') {
      return parseFloat(amount);
    } else {
      return parseFloat(convertedAmount) || (parseFloat(amount) / (exchangeRate || 1500));
    }
  };

  // Fetch merchant address when merchantId or amount changes
  React.useEffect(() => {
    async function fetchMerchantAddress() {
      if (!merchantId || !amount) return;
      try {
        const res = await fetch(getApiUrl('/api/widget-payments/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantId, amount })
        });
        const data = await res.json();
        if (res.ok && data.merchantAddress) {
          setMerchantAddress(data.merchantAddress);
        }
      } catch (e) {
        // ignore for now
      }
    }
    fetchMerchantAddress();
  }, [merchantId, amount]);

  const handlePay = async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first!');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setPaying(true);
    setError('');
    
    try {
      // Get the SUI amount for blockchain transaction
      const suiAmount = getSUIAmount();
      
      // 1. Create payment entry in backend with currency information
      const createRes = await fetch(getApiUrl('/api/widget-payments/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          merchantId, 
          amount: suiAmount, // Always send SUI amount to backend
          currency: selectedCurrency,
          originalAmount: parseFloat(amount),
          exchangeRate: exchangeRate || 1500
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || 'Failed to create payment entry.');
      const { paymentId, merchantAddress } = createData;
      if (!merchantAddress) throw new Error('No merchant address returned.');

      // 2. Build and send SUI transaction
      const txb = new TransactionBlock();
      const amountInMist = Math.floor(suiAmount * 1_000_000_000);
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountInMist)]);
      txb.transferObjects([coin], txb.pure(merchantAddress, 'address'));
      txb.setGasBudget(100_000_000);
      const response = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });
      if (!response || !response.digest) throw new Error('Payment failed: No transaction hash returned.');
      setTxHash(response.digest);

      // 3. Verify payment with backend
      const verifyRes = await fetch(getApiUrl(`/api/widget-payments/verify/${paymentId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          txnHash: response.digest, 
          customerWallet: wallet.account?.address,
          customerEmail: customerEmail // Include email for receipt
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed.');
      setSuccess(true);
      // 4. Notify parent and close
      window.opener && window.opener.postMessage({ suiflowSuccess: true, txHash: response.digest, amount }, '*');
      setTimeout(() => window.close(), 1500);
    } catch (e) {
      setError(e.message || 'Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ padding: 24, minWidth: 320, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#4A90E2', marginBottom: 20 }}>Pay with SuiFlow</h2>
      <div style={{ marginBottom: 16, color: '#666' }}>Merchant: {merchantId}</div>
      
      <div style={{ margin: '16px 0', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
          Email Address *
        </label>
        <input
          type="email"
          placeholder="Enter your email for receipt"
          value={customerEmail}
          onChange={e => setCustomerEmail(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 14,
            marginBottom: 4
          }}
        />
        <div style={{ fontSize: 12, color: '#666' }}>
          We'll send you a payment receipt after successful transaction
        </div>
      </div>
      
      <div style={{ margin: '16px 0', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
          Currency *
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setSelectedCurrency('NGN')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: selectedCurrency === 'NGN' ? '2px solid #4A90E2' : '1px solid #ddd',
              borderRadius: 6,
              backgroundColor: selectedCurrency === 'NGN' ? '#E3F2FD' : 'white',
              color: selectedCurrency === 'NGN' ? '#4A90E2' : '#666',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: selectedCurrency === 'NGN' ? 'bold' : 'normal'
            }}
          >
            ₦ NGN
          </button>
          <button
            type="button"
            onClick={() => setSelectedCurrency('SUI')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: selectedCurrency === 'SUI' ? '2px solid #4A90E2' : '1px solid #ddd',
              borderRadius: 6,
              backgroundColor: selectedCurrency === 'SUI' ? '#E3F2FD' : 'white',
              color: selectedCurrency === 'SUI' ? '#4A90E2' : '#666',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: selectedCurrency === 'SUI' ? 'bold' : 'normal'
            }}
          >
            SUI
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          1 SUI = ₦{(exchangeRate || 1500).toLocaleString()}
        </div>
      </div>
      
      <div style={{ margin: '16px 0', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
          Amount ({selectedCurrency}) *
        </label>
        <input
          type="number"
          min="0.01"
          step={selectedCurrency === 'SUI' ? '0.01' : '1'}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={!!initialAmount}
          placeholder={`Enter amount in ${selectedCurrency}`}
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 14
          }}
        />
        {amount && convertedAmount && selectedCurrency !== 'SUI' && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            {currencyLoading ? (
              'Converting...'
            ) : (
              `≈ ${formatCurrency(convertedAmount, 'SUI')} (blockchain amount)`
            )}
          </div>
        )}
        {amount && convertedAmount && selectedCurrency === 'SUI' && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            ≈ {formatCurrency(convertedAmount, 'NGN')}
          </div>
        )}
      </div>
      
      <div style={{ margin: '8px 0', fontSize: 13, color: '#666' }}>
        {merchantAddress && (
          <>Paying to: <span style={{ fontFamily: 'monospace' }}>{merchantAddress.slice(0, 8)}...{merchantAddress.slice(-8)}</span></>
        )}
      </div>
      
      <div style={{ margin: '16px 0' }}>
        <ConnectButton />
        {wallet.connected && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Connected: {wallet.account?.address?.slice(0, 8)}...{wallet.account?.address?.slice(-8)}
          </div>
        )}
      </div>
      
      <button 
        onClick={handlePay} 
        disabled={!amount || !customerEmail || paying || !wallet.connected}
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: (!amount || !customerEmail || paying || !wallet.connected) ? '#ccc' : '#4A90E2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: (!amount || !customerEmail || paying || !wallet.connected) ? 'not-allowed' : 'pointer',
          marginTop: 10
        }}
      >
        {paying ? 'Processing Payment...' : `Pay ${amount || '0'} SUI`}
      </button>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: 16, 
          padding: 10, 
          backgroundColor: '#ffe6e6', 
          borderRadius: 6,
          fontSize: 14 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'green', 
          marginTop: 16, 
          padding: 10, 
          backgroundColor: '#e6ffe6', 
          borderRadius: 6,
          fontSize: 14 
        }}>
          ✅ Payment successful! Receipt sent to {customerEmail}
          <br />
          <small>Tx: {txHash.slice(0, 8)}...{txHash.slice(-8)}</small>
        </div>
      )}
    </div>
  );
};

const WidgetPay = () => (
  <WalletProvider>
    <WidgetPayContent />
  </WalletProvider>
);

export default WidgetPay; 