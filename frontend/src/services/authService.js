const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://suiflow-8zsg.onrender.com";

class AuthService {
  // Send OTP to email for registration
  async sendRegistrationOTP(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    
    return data;
  }

  // Verify OTP and complete registration
  async verifyOTPAndRegister(email, otp, password, businessName, walletAddress, webhookUrl) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        password,
        businessName,
        walletAddress,
        webhookUrl,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP and register');
    }
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('merchant', JSON.stringify(data.merchant));
    }
    
    return data;
  }

  // Login
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('merchant', JSON.stringify(data.merchant));
    }
    
    return data;
  }

  // Resend OTP
  async resendOTP(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }
    
    return data;
  }

  // Get merchant profile
  async getProfile() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error(data.message || 'Failed to fetch profile');
    }
    
    return data;
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('merchant');
    localStorage.removeItem('adminLoggedIn');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get stored merchant data
  getMerchant() {
    const merchantData = localStorage.getItem('merchant');
    return merchantData ? JSON.parse(merchantData) : null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();
