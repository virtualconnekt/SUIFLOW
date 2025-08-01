import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Seamless SUI Token Payments",
      description: "Accept SUI and other Sui ecosystem tokens with lightning-fast transactions"
    },
    {
      icon: "💸",
      title: "Instant Merchant Payouts",
      description: "Receive payments directly to your wallet with zero delays"
    },
    {
      icon: "🔧",
      title: "Developer SDK & Smart Contracts",
      description: "Easy integration with our comprehensive SDK and battle-tested smart contracts"
    },
    {
      icon: "📊",
      title: "On-chain Transaction History",
      description: "Complete transparency with verifiable transaction records on Sui blockchain"
    },
    {
      icon: "🪙",
      title: "Accept Payment from All Tokens",
      description: "Support for all major tokens in the Sui ecosystem with automatic conversion"
    },
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description: "Bank-grade security with multi-signature wallets and audit trail"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "<1s", label: "Transaction Time" },
    { value: "0.01%", label: "Network Fees" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <div className="logo-container">
              <div className="logo-icon">⚡</div>
              <span className="brand-text">SuiFlow</span>
            </div>
            <span className="brand-tagline">Web3 Payment Gateway</span>
          </div>
          
          <div className="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a href="https://github.com/virtualconnekt/SUIFLOW" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-glow"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Built on Sui Blockchain</span>
            </div>
            
            <h1 className="hero-title">
              The Payment Gateway of
              <span className="gradient-text"> Web3</span>
              <br />
              <span className="typing-text">Built on Sui</span>
            </h1>
            
            <p className="hero-subtitle">
              Accept cryptocurrency payments instantly with SuiFlow. 
              Lightning-fast transactions, developer-friendly APIs, and seamless integration 
              for the next generation of commerce.
            </p>
            
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Get Started Free</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                <span>Login to Dashboard</span>
              </Link>
            </div>

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="payment-card">
              <div className="card-header">
                <div className="card-icon">💳</div>
                <span>SuiFlow Payment</span>
                <div className="status-indicator"></div>
              </div>
              <div className="card-amount">
                <span className="amount">125.50</span>
                <span className="currency">SUI</span>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span>From:</span>
                  <span className="address">0x1a2b...c3d4</span>
                </div>
                <div className="detail-row">
                  <span>To:</span>
                  <span className="address">0x5e6f...7g8h</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-success">✅ Confirmed</span>
                </div>
              </div>
              <div className="transaction-hash">
                Tx: 0x9a8b7c6d5e4f3g2h1i0j...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose <span className="gradient-text">SuiFlow</span>?
            </h2>
            <p className="section-subtitle">
              The most advanced Web3 payment infrastructure built for modern businesses
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="integration">
        <div className="container">
          <div className="integration-content">
            <div className="integration-text">
              <h2 className="section-title">
                Integrate in <span className="gradient-text">Minutes</span>
              </h2>
              <p className="section-subtitle">
                Get started with our simple SDK and start accepting payments today
              </p>
              
              <div className="integration-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Install SDK</h4>
                    <p>npm install suiflow-sdk</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Initialize</h4>
                    <p>Configure with your merchant ID</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Accept Payments</h4>
                    <p>Start receiving crypto payments</p>
                  </div>
                </div>
              </div>

              <div className="integration-actions">
                <a href="https://www.npmjs.com/package/suiflow-sdk" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  View Documentation
                </a>
                <a href="https://github.com/virtualconnekt/SUIFLOW" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  GitHub Repo
                </a>
              </div>
            </div>

            <div className="integration-code">
              <div className="code-window">
                <div className="code-header">
                  <div className="code-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="code-title">payment.js</span>
                </div>
                <div className="code-content">
                  <pre>{`import SuiFlow from 'suiflow-sdk';

// Initialize SuiFlow
const suiflow = new SuiFlow({
  merchantId: 'your-merchant-id',
  baseUrl: 'https://suiflow-api.com'
});

// Create payment
await suiflow.payWithWidget({
  amount: 100.5,
  onSuccess: (txHash) => {
    console.log('Payment successful!', txHash);
    // Handle success
  },
  onError: (error) => {
    console.error('Payment failed:', error);
    // Handle error
  }
});`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">
                About <span className="gradient-text">SuiFlow</span>
              </h2>
              <p className="about-description">
                SuiFlow is a cutting-edge Web3 payment gateway built on the Sui blockchain, 
                designed to revolutionize how businesses accept cryptocurrency payments. 
                Our platform combines the speed and security of Sui with an intuitive 
                developer experience.
              </p>
              
              <div className="about-features">
                <div className="about-feature">
                  <h4>🚀 Lightning Fast</h4>
                  <p>Sub-second transaction finality powered by Sui's innovative consensus</p>
                </div>
                <div className="about-feature">
                  <h4>🔒 Ultra Secure</h4>
                  <p>Smart contract-based payments with multi-signature security</p>
                </div>
                <div className="about-feature">
                  <h4>🌐 Global Scale</h4>
                  <p>Built to handle millions of transactions with minimal fees</p>
                </div>
                <div className="about-feature">
                  <h4>👩‍💻 Developer First</h4>
                  <p>Comprehensive SDK, APIs, and documentation for seamless integration</p>
                </div>
              </div>
            </div>

            <div className="about-visual">
              <div className="tech-stack">
                <div className="tech-item">
                  <div className="tech-icon">⚡</div>
                  <span>Sui Blockchain</span>
                </div>
                <div className="tech-item">
                  <div className="tech-icon">📱</div>
                  <span>React SDK</span>
                </div>
                <div className="tech-item">
                  <div className="tech-icon">🔗</div>
                  <span>Smart Contracts</span>
                </div>
                <div className="tech-item">
                  <div className="tech-icon">🛡️</div>
                  <span>Multi-sig Wallets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">
                Get in <span className="gradient-text">Touch</span>
              </h2>
              <p className="section-subtitle">
                Ready to revolutionize your payment system? Let's talk!
              </p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <div>
                    <h4>Email Us</h4>
                    <a href="mailto:support@suiflow.com">support@suiflow.com</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">💬</div>
                  <div>
                    <h4>Discord</h4>
                    <a href="#" target="_blank" rel="noopener noreferrer">Join our community</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">🐦</div>
                  <div>
                    <h4>Twitter</h4>
                    <a href="#" target="_blank" rel="noopener noreferrer">@SuiFlowPayments</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form className="form">
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Company (Optional)" />
                </div>
                <div className="form-group">
                  <textarea placeholder="Tell us about your project..." rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-container">
                <div className="logo-icon">⚡</div>
                <span className="brand-text">SuiFlow</span>
              </div>
              <p className="footer-description">
                The future of Web3 payments, built on Sui blockchain.
              </p>
              <div className="social-links">
                <a href="https://github.com/virtualconnekt/SUIFLOW" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://www.npmjs.com/package/suiflow-sdk" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.377h-3.456L12.04 19.17H5.113z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="https://www.npmjs.com/package/suiflow-sdk" target="_blank" rel="noopener noreferrer">SDK Documentation</a>
                <a href="/dashboard">Dashboard</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <a href="/blog">Blog</a>
                <a href="/careers">Careers</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
                <a href="/security">Security</a>
                <a href="/compliance">Compliance</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="/help">Help Center</a>
                <a href="/status">Status</a>
                <a href="mailto:support@suiflow.com">Email Support</a>
                <a href="/community">Community</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 SuiFlow. All rights reserved.</p>
            <p>Built with ❤️ for the Web3 community</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;