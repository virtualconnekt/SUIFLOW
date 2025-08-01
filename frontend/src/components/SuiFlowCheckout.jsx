import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { WalletProvider, ConnectButton, useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SwapWidget } from '@flowx-finance/swap-widget';
import "@mysten/dapp-kit/dist/index.css";
import "@flowx-finance/swap-widget/index.esm.css";
import './SuiFlowCheckout.css';


const SuiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
    <path d="M18 12a2 2 0 0 0-2 2v2h2v-2a2 2 0 0 1 2-2h2v-2h-2a2 2 0 0 0-2 2v2h-2v-2a2 2 0 0 1 2-2h2v-2h-2z"></path>
  </svg>
);

const SwapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
    <line x1="5" y1="9" x2="19" y2="9"></line>
  </svg>
);

const PaymentStep = ({ step, currentStep, title, children }) => (
  <div className={`sui-payment-step ${currentStep >= step ? 'active' : ''}`}>
    <div className="sui-step-header">
      <div className="sui-step-number">{step}</div>
      <h3>{title}</h3>
    </div>
    {currentStep >= step && <div className="sui-step-content">{children}</div>}
  </div>
);

const CheckoutContent = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Widget payment parameters
  const merchantId = searchParams.get('merchantId');
  const initialAmount = searchParams.get('amount');

  // Determine if this is a widget payment or product payment
  const isWidgetPayment = !productId && merchantId;

  // Widget amount (parsed from initialAmount)
  const widgetAmount = isWidgetPayment ? parseFloat(initialAmount) || 0 : 0;
  
  const wallet = useWallet();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txnHash, setTxnHash] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailValidated, setEmailValidated] = useState(false);
  // Remove currency selection and exchange rate
  // const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  // const [exchangeRate, setExchangeRate] = useState(1500);
  // const [convertedAmount, setConvertedAmount] = useState(null);
  // const [currencyLoading, setCurrencyLoading] = useState(false);
  const [showFlowXWidget, setShowFlowXWidget] = useState(false);
  
  // Widget-specific state
  const [merchantAddress, setMerchantAddress] = useState('');

  console.log('CheckoutContent rendered with productId:', productId, 'merchantId:', merchantId, 'isWidgetPayment:', isWidgetPayment);

  useEffect(() => {
    async function fetchProductOrSetupWidget() {
      setError('');
      
      if (isWidgetPayment) {
        // For widget payments, create a mock product object
        setProduct({
          name: `Payment to ${merchantId}`,
          description: 'Widget Payment',
          priceInSui: initialAmount || '0',
          merchantAddress: '', // Will be fetched separately
          paymentLink: '',
          redirectURL: null
        });
        return;
      }
      
      if (!productId) {
        setError('No product ID provided');
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:4000/api/products/${productId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Product not found');
        }
        const productData = await res.json();
        setProduct(productData);
      } catch (e) {
        setError('Failed to load product: ' + e.message);
      }
    }
    fetchProductOrSetupWidget();
  }, [productId, merchantId, initialAmount, isWidgetPayment]);

  // Remove exchange rate fetching
  // useEffect(() => {
  //   async function fetchExchangeRate() {
  //     try {
  //       const response = await fetch('http://localhost:4000/api/payments/exchange-rate');
  //       if (response.ok) {
  //         const data = await response.json();
  //         setExchangeRate(data.exchangeRate);
  //       }
  //     } catch (error) {
  //       // Use default rate if fetch fails
  //     }
  //   }
  //   fetchExchangeRate();
  // }, []);

  // Fetch merchant address for widget payments
  useEffect(() => {
    async function fetchMerchantAddress() {
      if (!isWidgetPayment || !merchantId || !initialAmount) return;
      try {
        const res = await fetch('http://localhost:4000/api/widget-payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantId, amount: initialAmount })
        });
        const data = await res.json();
        if (res.ok && data.merchantAddress) {
          setMerchantAddress(data.merchantAddress);
          // Update the mock product with the merchant address
          setProduct(prev => prev ? { ...prev, merchantAddress: data.merchantAddress } : null);
        }
      } catch (e) {
        console.error('Failed to fetch merchant address:', e);
      }
    }
    fetchMerchantAddress();
  }, [isWidgetPayment, merchantId, initialAmount]);

  // Remove currency conversion logic
  // useEffect(() => {
  //   const priceToConvert = isWidgetPayment ? widgetAmount : (product?.priceInSui);
  //   if (priceToConvert) {
  //     convertCurrency(priceToConvert, 'SUI', selectedCurrency);
  //   }
  // }, [selectedCurrency, product, exchangeRate, isWidgetPayment, widgetAmount]);

  // Remove convertCurrency function

  // Remove handleCurrencyChange and formatCurrency functions

  // Update getDisplayAmount to only show SUI
  const getDisplayAmount = () => {
    if (isWidgetPayment) {
      return `${widgetAmount} SUI`;
    }
    if (!product) return '';
    return `${product.priceInSui} SUI`;
  };

  const getActualPaymentAmount = () => {
    // Always pay in SUI on blockchain
    if (isWidgetPayment) {
      return widgetAmount || 0;
    }
    return product ? product.priceInSui : 0;
  };

  const getMerchantAddress = () => {
    if (isWidgetPayment) {
      return merchantAddress;
    }
    return product ? product.merchantAddress : '';
  };

  useEffect(() => {
    if (wallet.connected && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [wallet.connected, currentStep]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCustomerEmail(email);
    setEmailValidated(validateEmail(email));
    setError(''); // Clear any existing errors
  };

  const handleConnectWallet = () => {
    setCurrentStep(2);
  };

  const handlePay = async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first!');
      return;
    }

    if (!customerEmail || !emailValidated) {
      setError('Please enter a valid email address to receive your payment receipt.');
      return;
    }
    
    setPaymentProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      let paymentData, paymentId;
      
      if (isWidgetPayment) {
        // Widget payment flow
        const createRes = await fetch('http://localhost:4000/api/widget-payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            merchantId, 
            amount: parseFloat(product.priceInSui),
            currency: selectedCurrency,
            originalAmount: parseFloat(product.priceInSui),
            exchangeRate: exchangeRate || 1500
          })
        });
        
        paymentData = await createRes.json();
        if (!createRes.ok) {
          setError(paymentData.message || 'Failed to create payment entry.');
          setPaymentProcessing(false);
          return;
        }
        paymentId = paymentData.paymentId;
        
      } else {
        // Product payment flow
        const paymentRes = await fetch('http://localhost:4000/api/payments/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ productId })
        });
        
        paymentData = await paymentRes.json();
        if (!paymentRes.ok) {
          setError(paymentData.message || 'Failed to create payment entry.');
          setPaymentProcessing(false);
          return;
        }
        paymentId = paymentData.paymentId;
      }
      
      console.log('Payment created successfully:', paymentData);
      console.log('Payment ID for verification:', paymentId);
      
      // Validate payment ID format (MongoDB ObjectId is 24 characters)
      if (!paymentId || paymentId.length !== 24) {
        setError('Invalid payment ID received from server');
        setPaymentProcessing(false);
        return;
      }
      
      const txb = new TransactionBlock();
      const amountInMist = Math.floor(parseFloat(getActualPaymentAmount()) * 1_000_000_000);
      
      console.log(`Transferring ${getActualPaymentAmount()} SUI (${amountInMist} MIST) to ${getMerchantAddress()}`);
      
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountInMist)]);
      txb.transferObjects([coin], txb.pure(getMerchantAddress(), 'address'));
      txb.setGasBudget(100_000_000);
      
      const response = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });
      
      if (!response || !response.digest) {
        setError('Payment failed: No transaction hash returned.');
        setPaymentProcessing(false);
        return;
      }
      
      setTxnHash(response.digest);
      
      console.log('Payment successful, waiting for blockchain confirmation...');
      console.log('Payment ID:', paymentId);
      console.log('Transaction Hash:', response.digest);
      console.log('Customer Wallet:', wallet.account?.address);
      
      // Wait for transaction to be processed on blockchain
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Payment successful, verifying with backend...');
      console.log('Payment ID:', paymentId);
      console.log('Transaction Hash:', response.digest);
      console.log('Customer Wallet:', wallet.account?.address);
      
      // Use different verify endpoints based on payment type
      const verifyEndpoint = isWidgetPayment 
        ? `http://localhost:4000/api/widget-payments/verify/${paymentId}`
        : `http://localhost:4000/api/payments/verify/${paymentId}`;
      
      const verifyRes = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnHash: response.digest,
          customerWallet: wallet.account?.address,
          customerEmail: customerEmail, // Include customer email for receipt
        }),
      });
      
      console.log('Verification URL:', verifyEndpoint);
      console.log('Verification request body:', {
        txnHash: response.digest,
        customerWallet: wallet.account?.address,
      });
      console.log('Verification response status:', verifyRes.status);
      
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        console.log('Payment verification successful:', verifyData);
        setSuccess('Payment successful!');
        setCurrentStep(3);
        
        // Handle redirect from backend response
        if (verifyData.redirectURL) {
          console.log('Redirecting to:', verifyData.redirectURL);
          setTimeout(() => {
            if (window.parent !== window) {
              // If in iframe, redirect parent window
              window.parent.location.href = verifyData.redirectURL;
            } else {
              // Regular redirect
              window.location.href = verifyData.redirectURL;
            }
          }, 2000); // 2 second delay to show success message
        }
      } else {
        const verifyError = await verifyRes.json().catch(() => ({}));
        console.error('Payment verification failed:', verifyError);
        console.error('Verification error details:', verifyError);
        setError('Payment verification failed: ' + (verifyError.message || 'Unknown error'));
        return;
      }
      
      if (window.parent !== window) {
        window.parent.postMessage({ suiflowSuccess: true, txHash: response.digest }, '*');
      }
      
    } catch (e) {
      setError('Payment failed: ' + (e.message || e.toString()));
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!productId && !isWidgetPayment) {
    return (
      <div className="sui-checkout-container">
        <div className="sui-checkout-header">
          <div className="sui-logo">
            <img src="/logo.png" alt="SuiFlow Logo" className="sui-logo-image" />
          </div>
        </div>
        <div className="sui-checkout-content">
          <div className="sui-error-message">
            <h2>Invalid Checkout Link</h2>
            <p>No product ID or widget payment parameters provided. Please use a valid checkout link.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product && !isWidgetPayment) {
    return (
      <div className="sui-checkout-container">
        <div className="sui-checkout-header">
          <div className="sui-logo">
            <img src="/logo.png" alt="SuiFlow Logo" className="sui-logo-image" />
          </div>
        </div>
        <div className="sui-checkout-content">
          <div className="sui-checkout-loading">
            <div className="sui-loading-spinner"></div>
            <p>Loading checkout...</p>
            {error && <p className="sui-error-text">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sui-checkout-container">
      <div className="sui-checkout-header">
        <div className="sui-logo">
          <img src="/logo.png" alt="SuiFlow Logo" className="sui-logo-image" />
        </div>
        <div className="sui-secure-badge">
          <CheckIcon />
          <span>Secure Payment</span>
        </div>
      </div>

      <div className="sui-checkout-content">
        <div className="sui-product-card">
          <div className="sui-product-image">
            <SuiIcon />
          </div>
          <div className="sui-product-details">
            <h2>{isWidgetPayment ? 'Widget Payment' : product.name}</h2>
            <p>{isWidgetPayment ? `Payment to ${merchantId || 'merchant'}` : product.description}</p>
            
            {/* Remove Currency Selection */}
            {/* <div className="sui-currency-selector">
              <label className="sui-currency-label">Display Price In:</label>
              <div className="sui-currency-options">
                <button
                  className={`sui-currency-btn ${selectedCurrency === 'NGN' ? 'active' : ''}`}
                  onClick={() => handleCurrencyChange('NGN')}
                  disabled={currencyLoading}
                >
                  ₦ NGN
                </button>
                <button
                  className={`sui-currency-btn ${selectedCurrency === 'SUI' ? 'active' : ''}`}
                  onClick={() => handleCurrencyChange('SUI')}
                  disabled={currencyLoading}
                >
                  SUI
                </button>
              </div>
            </div> */}
            
            <div className="sui-product-price">
              <div className="sui-price-display">
                <span className="sui-price-amount">{getDisplayAmount()}</span>
              </div>
              {/* Remove Exchange Rate Info */}
            </div>
          </div>
        </div>

        <div className="sui-payment-steps">
          <PaymentStep step={1} currentStep={currentStep} title="Enter Email & Connect Wallet">
            <div className="sui-email-collection">
              <div className="sui-form-group">
                <label htmlFor="customer-email" className="sui-form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customer-email"
                  className={`sui-form-input ${emailValidated && customerEmail ? 'valid' : customerEmail && !emailValidated ? 'invalid' : ''}`}
                  placeholder="Enter your email to receive receipt"
                  value={customerEmail}
                  onChange={handleEmailChange}
                  required
                />
                <p className="sui-form-help">
                  We'll send you a payment receipt after successful transaction
                </p>
                {customerEmail && !emailValidated && (
                  <span className="sui-form-error">Please enter a valid email address</span>
                )}
              </div>
              
              {emailValidated && (
                <div className="sui-connect-wallet">
                  <p>Now connect your Sui wallet to proceed with payment</p>
                  <ConnectButton className="sui-connect-button" />
                </div>
              )}
            </div>
          </PaymentStep>

          <PaymentStep step={2} currentStep={currentStep} title="Review & Pay">
            {wallet.connected && emailValidated && (
              <div className="sui-payment-review">
                <div className="sui-email-confirmation">
                  <div className="sui-email-display">
                    <span className="sui-email-label">Receipt will be sent to:</span>
                    <span className="sui-email-value">{customerEmail}</span>
                  </div>
                </div>
                
                <div className="sui-wallet-info">
                  <WalletIcon />
                  <div>
                    <span className="sui-wallet-name">{wallet.name}</span>
                    <span className="sui-wallet-address">{wallet.account?.address}</span>
                  </div>
                </div>
                
                <div className="sui-payment-summary">
                  <div className="sui-summary-item">
                    <span>{isWidgetPayment ? 'Widget Payment' : 'Product'}</span>
                    <span>{isWidgetPayment ? `Payment to ${merchantId || 'merchant'}` : product.name}</span>
                  </div>
                  <div className="sui-summary-item">
                    <span>Amount</span>
                    <span>{parseFloat(getActualPaymentAmount()).toFixed(4)} SUI</span>
                  </div>
                  <div className="sui-summary-item sui-total">
                    <span>Total</span>
                    <span>{parseFloat(getActualPaymentAmount()).toFixed(4)} SUI</span>
                  </div>
                </div>
                
                <div className="sui-flowx-option">
                  <button
                    onClick={() => setShowFlowXWidget(!showFlowXWidget)}
                    className={`sui-flowx-toggle ${showFlowXWidget ? 'active' : ''}`}
                    type="button"
                  >
                    <SwapIcon />
                    {showFlowXWidget ? 'Hide Swap Widget' : 'Swap Your Crypto to SUI via FlowX'}
                  </button>
                  
                  {showFlowXWidget && (
                    <div className="sui-flowx-widget-container">
                      <div className="sui-flowx-header">
                        <h4>FlowX Token Swap</h4>
                        <p className="sui-flowx-info">
                          Don't have SUI? No problem! Use FlowX to swap your tokens to SUI before making payment.
                        </p>
                      </div>
                      
                      <div className="sui-flowx-iframe-container">
                        <SwapWidget 
                          config={{
                            defaultAmount: getActualPaymentAmount() || 1,
                            defaultInputToken: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::USDC',
                            defaultOutputToken: '0x2::sui::SUI',
                            network: 'testnet',
                            referrer: 'suiflow',
                            slippage: 0.5,
                            theme: 'dark'
                          }}
                        />
                      </div>

                      <div className="sui-flowx-instructions">
                        <div className="sui-flowx-step">
                          <div className="sui-flowx-step-number">1</div>
                          <div className="sui-flowx-step-text">Select the token you want to swap from</div>
                        </div>
                        <div className="sui-flowx-step">
                          <div className="sui-flowx-step-number">2</div>
                          <div className="sui-flowx-step-text">Enter the amount or use the suggested amount</div>
                        </div>
                        <div className="sui-flowx-step">
                          <div className="sui-flowx-step-number">3</div>
                          <div className="sui-flowx-step-text">Connect your wallet and approve the transaction</div>
                        </div>
                        <div className="sui-flowx-step">
                          <div className="sui-flowx-step-number">4</div>
                          <div className="sui-flowx-step-text">Once completed, continue with your SUI payment</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handlePay} 
                  className="sui-pay-button"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="sui-loading-spinner-small"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <SuiIcon />
                      Pay {parseFloat(getActualPaymentAmount()).toFixed(4)} SUI
                    </>
                  )}
                </button>
              </div>
            )}
          </PaymentStep>

          <PaymentStep step={3} currentStep={currentStep} title="Payment Complete">
            <div className="sui-success-content">
              <div className="sui-success-checkmark">
                <CheckIcon />
              </div>
              <h3>Payment Successful!</h3>
              <p>Your transaction has been processed successfully.</p>
              <p className="sui-email-confirmation-text">
                A receipt has been sent to <strong>{customerEmail}</strong>
              </p>
              
              {txnHash && (
                <div className="sui-transaction-details">
                  <span>Transaction Hash:</span>
                  <code>{txnHash}</code>
                </div>
              )}
              
              <div className="sui-success-actions">
                <button 
                  onClick={() => window.close()} 
                  className="sui-button sui-button-secondary"
                >
                  Close Window
                </button>
                {product && product.redirectURL && (
                  <button 
                    onClick={() => window.location.href = product.redirectURL}
                    className="sui-button sui-button-primary"
                  >
                    Return to Merchant
                  </button>
                )}
              </div>
            </div>
          </PaymentStep>
        </div>
      </div>

      {error && (
        <div className="sui-error-message">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const SuiFlowCheckout = () => {
  return (
    <WalletProvider>
      <CheckoutContent />
    </WalletProvider>
  );
};

export default SuiFlowCheckout;