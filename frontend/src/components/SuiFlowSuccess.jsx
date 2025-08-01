import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './SuiFlowSuccess.css';
import { getApiUrl } from '../services/api.js';

// Icons
const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const SuiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15,3 21,3 21,9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const SuiFlowSuccess = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get transaction data from URL params or localStorage
    const paymentId = searchParams.get('paymentId');
    const txHash = searchParams.get('txHash');
    const amount = searchParams.get('amount');
    const redirectURL = searchParams.get('redirectURL');

    if (paymentId) {
      // Fetch transaction details from API
      fetchTransactionDetails(paymentId);
    } else {
      // Use data from URL params
      setTransactionData({
        amount: amount || '0.0000',
        txHash: txHash || 'N/A',
        paymentId: paymentId,
        redirectURL: redirectURL,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }

    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const fetchTransactionDetails = async (paymentId) => {
    try {
      const response = await fetch(getApiUrl(`/api/payments/${paymentId}`));
      if (response.ok) {
        const data = await response.json();
        setTransactionData({
          amount: data.amountInSui,
          txHash: data.transactionHash,
          paymentId: paymentId,
          redirectURL: data.redirectURL,
          timestamp: data.createdAt,
          fromAddress: data.customerWallet,
          toAddress: data.merchantAddress
        });
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="sui-success-page">
        <div className="sui-loading-container">
          <div className="sui-loading-spinner"></div>
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sui-success-page">
      <div className="sui-success-container">
        <div className="sui-success-header">
          <div className="sui-logo">
            <img src="/logo.png" alt="SuiFlow Logo" className="sui-logo-image" />
          </div>
          <div className="sui-success-badge">
            <CheckIcon />
            <span>Payment Successful</span>
          </div>
        </div>

        <div className="sui-success-content">
          <div className={`sui-success-animation ${animationComplete ? 'animate' : ''}`}>
            <div className="sui-checkmark-circle">
              <CheckIcon />
            </div>
            <h1>Payment Complete!</h1>
            <p>Your transaction has been processed successfully on the Sui blockchain.</p>
          </div>

          <div className="sui-transaction-summary">
            <h2>Transaction Summary</h2>
            
            <div className="sui-summary-grid">
              <div className="sui-summary-item">
                <span className="sui-summary-label">Amount Paid</span>
                <div className="sui-summary-value">
                  <SuiIcon />
                  <span>{transactionData?.amount || '0.0000'} SUI</span>
                </div>
              </div>

              <div className="sui-summary-item">
                <span className="sui-summary-label">Transaction Hash</span>
                <div className="sui-summary-value sui-hash">
                  <code>{transactionData?.txHash || 'N/A'}</code>
                  <button 
                    onClick={() => copyToClipboard(transactionData?.txHash)}
                    className="sui-copy-button"
                    title="Copy to clipboard"
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>

              {transactionData?.fromAddress && (
                <div className="sui-summary-item">
                  <span className="sui-summary-label">From Address</span>
                  <div className="sui-summary-value">
                    <code>{formatAddress(transactionData.fromAddress)}</code>
                  </div>
                </div>
              )}

              {transactionData?.toAddress && (
                <div className="sui-summary-item">
                  <span className="sui-summary-label">To Address</span>
                  <div className="sui-summary-value">
                    <code>{formatAddress(transactionData.toAddress)}</code>
                  </div>
                </div>
              )}

              <div className="sui-summary-item">
                <span className="sui-summary-label">Date & Time</span>
                <div className="sui-summary-value">
                  <span>{formatDate(transactionData?.timestamp || new Date())}</span>
                </div>
              </div>

              <div className="sui-summary-item">
                <span className="sui-summary-label">Network</span>
                <div className="sui-summary-value">
                  <span className="sui-network-badge">Sui Mainnet</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sui-success-actions">
            {transactionData?.redirectURL && (
              <button 
                onClick={() => window.location.href = transactionData.redirectURL}
                className="sui-button sui-button-primary"
              >
                <ExternalLinkIcon />
                Return to Merchant
              </button>
            )}
            
            <button 
              onClick={() => window.close()}
              className="sui-button sui-button-secondary"
            >
              Close Window
            </button>
          </div>

          <div className="sui-additional-info">
            <div className="sui-info-card">
              <h3>What's Next?</h3>
              <ul>
                <li>Your payment has been confirmed on the Sui blockchain</li>
                <li>The merchant will receive the funds instantly</li>
                <li>You can view this transaction on Sui Explorer</li>
                <li>Keep this transaction hash for your records</li>
              </ul>
            </div>

            <div className="sui-info-card">
              <h3>Need Help?</h3>
              <p>If you have any questions about this transaction, please contact the merchant or our support team.</p>
              <div className="sui-support-links">
                <a href="#" className="sui-link">Contact Support</a>
                <a href="#" className="sui-link">View on Explorer</a>
              </div>
            </div>
          </div>
        </div>

        <div className="sui-success-footer">
          <p>Powered by SuiFlow - Secure Crypto Payments</p>
          <div className="sui-footer-links">
            <a href="#" className="sui-footer-link">Privacy Policy</a>
            <a href="#" className="sui-footer-link">Terms of Service</a>
          </div>
        </div>
      </div>

      {copied && (
        <div className="sui-toast">
          <CheckIcon />
          <span>Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default SuiFlowSuccess; 