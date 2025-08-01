import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WalletProvider, ConnectButton, useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const WidgetPayContent = () => {
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get('merchantId');
  const initialAmount = searchParams.get('amount');
  const [amount, setAmount] = useState(initialAmount || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const [merchantAddress, setMerchantAddress] = useState('');

  // Fetch merchant address when merchantId or amount changes
  React.useEffect(() => {
    async function fetchMerchantAddress() {
      if (!merchantId || !amount) return;
      try {
        const res = await fetch('http://localhost:4000/api/widget-payments/create', {
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
      // 1. Create payment entry in backend
      const createRes = await fetch('http://localhost:4000/api/widget-payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          merchantId, 
          amount: parseFloat(amount), // Always send SUI amount to backend
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || 'Failed to create payment entry.');
      const { paymentId, merchantAddress } = createData;
      if (!merchantAddress) throw new Error('No merchant address returned.');

      // 2. Build and send SUI transaction
      const txb = new TransactionBlock();
      const amountInMist = Math.floor(parseFloat(amount) * 1_000_000_000);
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
      const verifyRes = await fetch(`http://localhost:4000/api/widget-payments/verify/${paymentId}`, {
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
          Amount (SUI) *
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={!!initialAmount}
          placeholder="Enter amount in SUI"
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 14
          }}
        />
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