import React, { useState, useEffect } from 'react';
import './MerchantUSDTSettings.css';
import { getApiUrl } from '../services/api.js';

const MerchantUSDTSettings = ({ merchantId }) => {
  const [settings, setSettings] = useState(null);
  const [newUSDTRate, setNewUSDTRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [livePrices, setLivePrices] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch merchant settings and live prices
  useEffect(() => {
    if (merchantId) {
      fetchSettings();
      fetchLivePrices();
      
      // Set up auto-refresh for live prices every 30 seconds
      const interval = setInterval(fetchLivePrices, 30000);
      return () => clearInterval(interval);
    }
  }, [merchantId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/payments/merchant-settings/${merchantId}`));
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setNewUSDTRate(data.settings.usdtToNgnRate.toString());
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (err) {
      setError('Failed to load merchant settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivePrices = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/payments/live-prices?merchantId=${merchantId}`));
      if (response.ok) {
        const data = await response.json();
        setLivePrices(data.prices);
      }
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
    }
  };

  const updateUSDTRate = async () => {
    if (!newUSDTRate || isNaN(newUSDTRate) || parseFloat(newUSDTRate) <= 0) {
      setError('Please enter a valid USDT rate');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/payments/merchant-settings/${merchantId}/usdt-rate`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          usdtRate: parseFloat(newUSDTRate)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuccess(`USDT rate updated successfully! Change: ${data.newRate.changePercent}%`);
        
        // Refresh live prices to see updated conversions
        setTimeout(fetchLivePrices, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update rate');
      }
    } catch (err) {
      setError('Failed to update USDT rate: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    } else if (currency === 'USDT') {
      return `$${amount.toFixed(4)} USDT`;
    } else if (currency === 'SUI') {
      return `${amount.toFixed(6)} SUI`;
    }
    return `${amount} ${currency}`;
  };

  const calculateEquivalent = (baseAmount, rate) => {
    return baseAmount * rate;
  };

  if (loading) {
    return (
      <div className="usdt-settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usdt-settings-container">
      <div className="settings-header">
        <h2>💱 Currency Exchange Settings</h2>
        <p>Manage your USDT to Naira exchange rate for live price calculations</p>
      </div>

      {/* Live Price Display */}
      {livePrices && (
        <div className="live-prices-section">
          <h3>📊 Live Market Data</h3>
          <div className="price-cards">
            <div className="price-card sui-price">
              <div className="price-header">
                <span className="currency-icon">🔵</span>
                <span className="currency-name">SUI/USDT</span>
              </div>
              <div className="price-value">
                ${livePrices.sui.currentPrice?.toFixed(4) || 'Loading...'}
              </div>
              {livePrices.sui.priceChangePercent24h !== null && (
                <div className={`price-change ${livePrices.sui.priceChangePercent24h >= 0 ? 'positive' : 'negative'}`}>
                  {livePrices.sui.priceChangePercent24h >= 0 ? '+' : ''}
                  {livePrices.sui.priceChangePercent24h?.toFixed(2)}% (24h)
                </div>
              )}
              <div className="price-source">Source: {livePrices.sui.source}</div>
            </div>

            <div className="price-card conversion-card">
              <div className="price-header">
                <span className="currency-icon">🇳🇬</span>
                <span className="currency-name">Your Rate</span>
              </div>
              <div className="price-value">
                ₦{settings?.usdtToNgnRate?.toLocaleString() || 'Loading...'}
              </div>
              <div className="price-change neutral">
                1 USDT = ₦{settings?.usdtToNgnRate || '0'}
              </div>
              <div className="price-source">Last updated: {new Date(settings?.rateLastUpdated).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Live Conversion Example */}
          {livePrices.conversions && (
            <div className="conversion-example">
              <h4>📈 Live Conversion Example</h4>
              <div className="conversion-flow">
                <div className="conversion-step">
                  <span className="amount">₦10,000</span>
                  <span className="arrow">→</span>
                </div>
                <div className="conversion-step">
                  <span className="amount">
                    ${(10000 / settings.usdtToNgnRate).toFixed(4)} USDT
                  </span>
                  <span className="arrow">→</span>
                </div>
                <div className="conversion-step">
                  <span className="amount">
                    {((10000 / settings.usdtToNgnRate) / livePrices.sui.currentPrice).toFixed(6)} SUI
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USDT Rate Settings */}
      <div className="rate-settings-section">
        <h3>⚙️ USDT Exchange Rate Settings</h3>
        
        <div className="current-rate">
          <label>Current Rate:</label>
          <div className="rate-display">
            <span className="rate-value">1 USDT = {formatCurrency(settings?.usdtToNgnRate || 0, 'NGN')}</span>
            {settings?.getRateChangePercent && settings.getRateChangePercent() !== '0.00' && (
              <span className={`rate-change ${parseFloat(settings.getRateChangePercent()) >= 0 ? 'positive' : 'negative'}`}>
                ({settings.getRateChangePercent()}% from last update)
              </span>
            )}
          </div>
        </div>

        <div className="rate-input-section">
          <label htmlFor="usdtRate">New USDT to NGN Rate:</label>
          <div className="input-group">
            <span className="input-prefix">₦</span>
            <input
              id="usdtRate"
              type="number"
              min="100"
              max="10000"
              step="0.01"
              value={newUSDTRate}
              onChange={(e) => setNewUSDTRate(e.target.value)}
              placeholder="e.g., 1500"
              disabled={updating}
            />
            <span className="input-suffix">per USDT</span>
          </div>
          
          {/* Rate Examples */}
          <div className="rate-examples">
            <p>Common rates:</p>
            <div className="rate-buttons">
              <button onClick={() => setNewUSDTRate('1400')} className="rate-btn">₦1,400</button>
              <button onClick={() => setNewUSDTRate('1500')} className="rate-btn">₦1,500</button>
              <button onClick={() => setNewUSDTRate('1600')} className="rate-btn">₦1,600</button>
            </div>
          </div>

          <button 
            onClick={updateUSDTRate} 
            disabled={updating || !newUSDTRate}
            className="update-btn"
          >
            {updating ? (
              <>
                <div className="btn-spinner"></div>
                Updating...
              </>
            ) : (
              <>
                💾 Update Rate
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {error && <div className="message error">❌ {error}</div>}
        {success && <div className="message success">✅ {success}</div>}
      </div>

      {/* Rate History */}
      {settings?.rateHistory && settings.rateHistory.length > 0 && (
        <div className="rate-history-section">
          <h3>📊 Rate History</h3>
          <div className="history-list">
            {settings.rateHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className="history-item">
                <div className="history-rate">₦{entry.rate.toLocaleString()}</div>
                <div className="history-details">
                  <span className="history-date">
                    {new Date(entry.updatedAt).toLocaleDateString()} at {new Date(entry.updatedAt).toLocaleTimeString()}
                  </span>
                  <span className="history-source">by {entry.updatedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <h4>ℹ️ How It Works</h4>
        <div className="info-content">
          <p><strong>Live Pricing:</strong> SUI prices are fetched real-time from Binance API</p>
          <p><strong>Your Rate:</strong> Set your preferred USDT to Naira exchange rate</p>
          <p><strong>Conversion:</strong> NGN → USDT → SUI using live market prices</p>
          <p><strong>Updates:</strong> Prices refresh every 30 seconds automatically</p>
        </div>
      </div>
    </div>
  );
};

export default MerchantUSDTSettings;
