import React, { useState } from 'react';
import authService from '../services/authService';
import './Registration.css';

const Registration = ({ onRegistrationSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Account Details
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    walletAddress: '',
    webhookUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.sendRegistrationOTP(formData.email);
      setSuccess('OTP sent to your email address');
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.resendOTP(formData.email);
      setSuccess('OTP resent to your email address');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setStep(3);
    setSuccess('OTP verified! Please complete your account details');
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.businessName || !formData.walletAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.verifyOTPAndRegister(
        formData.email,
        formData.otp,
        formData.password,
        formData.businessName,
        formData.walletAddress,
        formData.webhookUrl
      );

      setSuccess('Account created successfully! Welcome to SuiFlow');
      
      // Call the success callback
      if (onRegistrationSuccess) {
        onRegistrationSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="registration-form">
            <h2>Create Merchant Account</h2>
            <p className="step-description">Enter your email address to get started</p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          required
          disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>

            <p className="switch-auth">
              Already have an account? 
              <button type="button" onClick={onSwitchToLogin} className="btn-link">
          Sign In
              </button>
            </p>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="registration-form">
            <h2>Verify Your Email</h2>
            <p className="step-description">
              We've sent a 6-digit verification code to {formData.email}
            </p>
            
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading}
                className="otp-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button 
                type="button" 
                onClick={handleResendOTP} 
                className="btn-secondary"
                disabled={loading}
              >
                Resend Code
              </button>
            </div>

            <button type="button" onClick={() => setStep(1)} className="btn-back">
              Back to Email
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleCompleteRegistration} className="registration-form">
            <h2>Complete Your Account</h2>
            <p className="step-description">Set up your merchant account details</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="walletAddress">SUI Wallet Address</label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="Enter your SUI wallet address"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="webhookUrl">Webhook URL (Optional)</label>
              <input
                type="url"
                id="webhookUrl"
                name="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleInputChange}
                placeholder="https://your-site.com/webhook"
                disabled={loading}
              />
              <small>URL to receive payment notifications</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button type="button" onClick={() => setStep(2)} className="btn-back">
              Back to Verification
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default Registration;
