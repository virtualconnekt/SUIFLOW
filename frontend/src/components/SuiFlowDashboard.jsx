import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import img01 from "../res/logo2.png";
import { FaRegUserCircle } from "react-icons/fa";
import { getApiUrl } from '../services/api.js';
import "./SuiFlowDashboard.css";
console.log("SuiFlowDashboard component loaded");

// Icons (using Lucide-style icons)
const DashboardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const PaymentIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const WebhookIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const TransactionsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 12l2 2 4-4"></path>
    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const SwapIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
    <line x1="5" y1="9" x2="19" y2="9"></line>
  </svg>
);

const WidgetIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="4" width="16" height="16" rx="4"></rect>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const SuiFlowDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    priceInSui: "",
    description: "",
    redirectURL: "",
    webhookURL: "",
  });
  const [productError, setProductError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  async function checkAuthentication() {
    console.log("Checking authentication...");
    console.log("Is authenticated:", authService.isAuthenticated());
    console.log("Token:", authService.getToken());

    if (!authService.isAuthenticated()) {
      console.log("Not authenticated, redirecting to login...");
      navigate("/");
      return;
    }

    try {
      console.log("Fetching profile...");
      const profileData = await authService.getProfile();
      console.log("Profile data:", profileData);
      setMerchant(profileData.merchant);
      await fetchData();
    } catch (error) {
      console.error("Authentication failed:", error);
      authService.logout();
      navigate("/");
    } finally {
      setAuthLoading(false);
    }
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  // Refresh payments every 30 seconds to show new transactions
  useEffect(() => {
    if (merchant) {
      const interval = setInterval(() => {
        fetchPayments();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [merchant]);

  async function fetchData() {
    if (!merchant) return;
    await Promise.all([fetchProducts(), fetchPayments()]);
  }

  async function fetchProducts() {
    try {
      const token = authService.getToken();
      const res = await fetch(getApiUrl("/api/products"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function fetchPayments() {
    try {
      const token = authService.getToken();
      console.log(
        "Fetching payments with token:",
        token ? "Token exists" : "No token"
      );

      const res = await fetch(getApiUrl("/api/payments"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Payments API response status:", res.status);

      if (res.ok) {
        const paymentsData = await res.json();
        console.log("Payments data received:", paymentsData);
        console.log("Number of payments:", paymentsData.length);
        console.log(
          "Payment statuses:",
          paymentsData.map((p) => ({
            id: p._id,
            status: p.status,
            amount: p.amountInSui,
          }))
        );
        setPayments(paymentsData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Payments API error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }

  async function addProduct(e) {
    e.preventDefault();
    setLoading(true);
    setProductError("");
    try {
      const token = authService.getToken();
      const productData = {
        ...newProduct,
        priceInSui: parseFloat(newProduct.priceInSui),
        merchantAddress: merchant.walletAddress,
      };

      if (isNaN(productData.priceInSui) || productData.priceInSui <= 0) {
        setProductError("Please enter a valid price greater than 0");
        setLoading(false);
        return;
      }

      const res = await fetch(getApiUrl("/api/products"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const data = await res.json();
        setProductError(data.message || "Failed to add product.");
        setLoading(false);
        return;
      }

      setNewProduct({
        name: "",
        priceInSui: "",
        description: "",
        redirectURL: "",
        webhookURL: "",
      });
      await fetchProducts();
    } catch (e) {
      setProductError("Failed to add product.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const token = authService.getToken();
      await fetch(getApiUrl(`/api/products/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  function getStatusColor(status) {
    switch (status) {
      case "completed":
        return "var(--success)";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "var(--error)";
      default:
        return "var(--text-tertiary)";
    }
  }

  if (authLoading) {
    return (
      <div className="sui-loading-container">
        <div className="sui-loading-spinner"></div>
        <p>Loading SuiFlow Dashboard...</p>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="sui-loading-container">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="sui-dashboard-container">
      {/* Sidebar */}
      <div className="sui-sidebar">
        <div className="sui-sidebar-header">
          <div className="sui-logo">
            <img
              src={img01}
              alt="SuiFlow Logo"
              className="sui-logo-image"
              style={{ width: "80px", height: "auto", marginTop: "10px" }}
            />
          </div>
        </div>

        <nav className="sui-nav">
          <button
            className={`sui-nav-item ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </button>

          <button
            className={`sui-nav-item ${
              activeTab === "payments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("payments")}
          >
            <PaymentIcon />
            <span>Payment Links</span>
          </button>

          <button
            className={`sui-nav-item ${activeTab === "widget" ? "active" : ""}`}
            onClick={() => setActiveTab("widget")}
          >
            <WidgetIcon />
            <span>Payment Widget</span>
          </button>

          <button
            className={`sui-nav-item ${
              activeTab === "transactions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            <TransactionsIcon />
            <span>Transactions</span>
          </button>

          <button
            className={`sui-nav-item ${
              activeTab === "flowx" ? "active" : ""
            }`}
            onClick={() => {window.location.href = "/flowx"}}
          >
            <SwapIcon />
            <span>FlowX Swap</span>
          </button>

          <button
            className={`sui-nav-item ${
              activeTab === "webhooks" ? "active" : ""
            }`}
            onClick={() => setActiveTab("webhooks")}
          >
            <WebhookIcon />
            <span>Webhooks</span>
          </button>

          <button
            className={`sui-nav-item ${
              activeTab === "settings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sui-sidebar-footer">
          <button className="sui-nav-item" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="sui-main">
        <div className="sui-header">
          <div className="sui-header-content">
            <h1 className="sui-page-title">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "payments" && "Payment Links"}
              {activeTab === "widget" && "Payment Widget"}
              {activeTab === "transactions" && "Transactions"}
              {activeTab === "webhooks" && "Webhooks"}
              {activeTab === "settings" && "Settings"}
            </h1>
            <div className="sui-merchant-info">
              <div className="sui-merchant-details">
                <span className="sui-merchant-name">
                  {merchant.businessName}
                </span>
                <span className="sui-merchant-email">{merchant.email}</span>
              </div>
              <span
                onClick={fetchData}
                className="sui-refresh-button"
                title="Refresh data"
              >
                <FaRegUserCircle className="user-icon" />
              </span>
            </div>
          </div>
        </div>

        <div className="sui-content">
          {activeTab === "dashboard" && (
            <div className="sui-dashboard-grid">
              <div className="sui-stats-card">
                <div className="sui-stat">
                  <h3>Total Products</h3>
                  <span className="sui-stat-number">{products.length}</span>
                </div>
                <div className="sui-stat">
                  <h3>Total Transactions</h3>
                  <span className="sui-stat-number">{payments.length}</span>
                </div>
                <div className="sui-stat">
                  <h3>Success Rate</h3>
                  <span className="sui-stat-number">
                    {payments.length > 0
                      ? Math.round(
                          (payments.filter((p) => p.status === "completed")
                            .length /
                            payments.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="sui-recent-transactions">
                <h3>Recent Transactions</h3>
                <div className="sui-transactions-list">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment._id} className="sui-transaction-item">
                      <div className="sui-transaction-info">
                        <span className="sui-transaction-amount">
                          {payment.amountInSui} SUI
                        </span>
                        <span className="sui-transaction-date">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      <span
                        className="sui-transaction-status"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="sui-payments-section">
              <div className="sui-create-payment">
                <h3>Create Payment Link</h3>
                <form onSubmit={addProduct} className="sui-payment-form">
                  <div className="sui-form-group">
                    <input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      type="text"
                      placeholder="Product Name"
                      className="sui-input"
                      required
                    />
                  </div>

                  <div className="sui-form-group">
                    <input
                      value={newProduct.priceInSui}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          priceInSui: e.target.value,
                        }))
                      }
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Price (SUI)"
                      className="sui-input"
                      required
                    />
                  </div>

                  <div className="sui-form-group">
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description"
                      className="sui-textarea"
                    />
                  </div>

                  <div className="sui-form-group">
                    <input
                      value={newProduct.redirectURL}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          redirectURL: e.target.value,
                        }))
                      }
                      type="url"
                      placeholder="Redirect URL (optional)"
                      className="sui-input"
                    />
                  </div>

                  <div className="sui-form-group">
                    <input
                      value={newProduct.webhookURL}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          webhookURL: e.target.value,
                        }))
                      }
                      type="url"
                      placeholder="Webhook URL (optional)"
                      className="sui-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sui-button sui-button-primary"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Payment Link"}
                  </button>
                </form>
                {productError && (
                  <div className="sui-error">{productError}</div>
                )}
              </div>

              <div className="sui-products-list">
                <h3>Your Payment Links</h3>
                {products.length === 0 && (
                  <div className="sui-empty-state">
                    <p>No payment links created yet.</p>
                  </div>
                )}
                {products.map((product) => (
                  <div key={product._id} className="sui-product-card">
                    <div className="sui-product-info">
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <div className="sui-product-meta">
                        <span className="sui-price">
                          {parseFloat(product.priceInSui).toFixed(4)} SUI
                        </span>
                        <span className="sui-merchant-address">
                          {product.merchantAddress}
                        </span>
                      </div>
                    </div>
                    <div className="sui-product-actions">
                      <button
                        onClick={() => copyLink(product.paymentLink)}
                        className="sui-button sui-button-secondary"
                      >
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="sui-button sui-button-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "widget" && (
            <div className="sui-widget-section">
              <div className="sui-widget-header">
                <h3>Payment Widget Integration</h3>
                <p>
                  Integrate SuiFlow payments directly into your website with our
                  customizable widget.
                </p>
              </div>

              <div className="sui-widget-demo">
                <h4>Live Demo</h4>
                <div className="sui-widget-demo-container">
                  <div className="sui-form-group">
                    <label>Amount (SUI)</label>
                    <input
                      id="demo-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      className="sui-input"
                      style={{
                        width: "200px",
                        display: "inline-block",
                        marginRight: "10px",
                      }}
                    />
                    <button
                      className="sui-button sui-button-primary"
                      onClick={() => {
                        const amount =
                          document.getElementById("demo-amount").value;
                        if (amount && parseFloat(amount) > 0) {
                          window.Suiflow?.payWithWidget({
                            merchantId: merchant._id,
                            amount: parseFloat(amount),
                            onSuccess: function (txHash, paidAmount) {
                              alert(
                                `Payment successful! Amount: ${paidAmount} SUI, Tx: ${txHash}`
                              );
                              // Refresh payments after successful payment
                              setTimeout(() => fetchPayments(), 2000);
                            },
                          });
                        } else {
                          alert("Please enter a valid amount");
                        }
                      }}
                    >
                      Pay with Widget
                    </button>
                  </div>
                </div>
              </div>

              <div className="sui-widget-code">
                <h4>Implementation Code</h4>
                <div className="sui-code-section">
                  <h5>1. Include the SuiFlow SDK</h5>
                  <div className="sui-code-block">
                    <code>{`<script src="https://your-domain.com/sdk/dist/index.js"></script>`}</code>
                    <button 
                      className="sui-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(`<script src="https://your-domain.com/sdk/dist/index.js"></script>`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="sui-code-section">
                  <h5>2. HTML Structure</h5>
                  <div className="sui-code-block">
                    <pre>
                      <code>{`<div>
  <input type="number" id="amount" placeholder="Enter amount" min="0.01" step="0.01" />
  <button onclick="payWithSuiFlow()">Pay with SuiFlow</button>
</div>`}</code>
                    </pre>
                    <button
                      className="sui-copy-btn"
                      onClick={() => {
                        const htmlCode = `<div>
  <input type="number" id="amount" placeholder="Enter amount" min="0.01" step="0.01" />
  <button onclick="payWithSuiFlow()">Pay with SuiFlow</button>
</div>`;
                        navigator.clipboard.writeText(htmlCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="sui-code-section">
                  <h5>3. JavaScript Integration</h5>
                  <div className="sui-code-block">
                    <pre>
                      <code>{`function payWithSuiFlow() {
  const amount = parseFloat(document.getElementById('amount').value);
  
  Suiflow.payWithWidget({
    merchantId: '${merchant._id}', // Your merchant ID
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
      alert('Payment successful! Amount: ' + paidAmount + ', Tx: ' + txHash);
      // Handle successful payment
      // You can call your backend API to update user balance, etc.
    }
  });
}`}</code>
                    </pre>
                    <button
                      className="sui-copy-btn"
                      onClick={() => {
                        const jsCode = `function payWithSuiFlow() {
  const amount = parseFloat(document.getElementById('amount').value);
  
  Suiflow.payWithWidget({
    merchantId: '${merchant._id}',
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
      alert('Payment successful! Amount: ' + paidAmount + ', Tx: ' + txHash);
      // Handle successful payment
      // You can call your backend API to update user balance, etc.
    }
  });
}`;
                        navigator.clipboard.writeText(jsCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                        }}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      </div>
                    </div>
                    </div>

                    <div className="sui-widget-info">
                    <h4>Widget Features</h4>
                    <ul className="sui-feature-list">
                      <li>✅ Customizable payment amounts</li>
                      <li>✅ Secure wallet integration</li>
                      <li>✅ Real-time blockchain verification</li>
                      <li>✅ Mobile-responsive design</li>
                      <li>✅ Easy integration with any website</li>
                      <li>✅ Automatic transaction tracking</li>
                    </ul>
                    </div>
                  </div>
                  )}

                  {activeTab === "transactions" && (
                  <div className="sui-transactions-section">
                    <div className="sui-transactions-header">
                    <h3>Transaction History</h3>
                    <div className="sui-transactions-stats">
                      <div className="sui-stat-item">
                      <span className="sui-stat-label">Total Transactions</span>
                      <span className="sui-stat-value">{payments.length}</span>
                      </div>
                      <div className="sui-stat-item">
                      <span className="sui-stat-label">Successful</span>
                      <span className="sui-stat-value success">
                        {
                        payments.filter(
                          (p) => p.status === "completed" || p.status === "paid"
                        ).length
                        }
                      </span>
                      </div>
                      <div className="sui-stat-item">
                      <span className="sui-stat-label">Pending</span>
                      <span className="sui-stat-value pending">
                        {payments.filter((p) => p.status === "pending").length}
                      </span>
                      </div>
                      <div className="sui-stat-item">
                      <span className="sui-stat-label">Failed</span>
                      <span className="sui-stat-value failed">
                        {payments.filter((p) => p.status === "failed").length}
                      </span>
                      </div>
                    </div>
                    </div>

                    <div className="sui-transactions-list">
                    {payments.length === 0 ? (
                      <div className="sui-empty-state">
                      <div className="sui-empty-icon">📊</div>
                      <h4>No Transactions Yet</h4>
                      <p>
                        Your transaction history will appear here once you receive
                        payments.
                      </p>
                      </div>
                    ) : (
                      payments.map((payment) => (
                      <div key={payment._id} className="sui-transaction-card">
                        <div className="sui-transaction-header">
                        <div className="sui-transaction-info">
                          <h4>{payment.product?.name || "Unknown Product"}</h4>
                          <span className="sui-transaction-id">
                          #{payment._id.slice(-8)}
                          </span>
                        </div>
                        <div
                          className={`sui-transaction-status ${payment.status}`}
                        >
                          {payment.status === "completed" ||
                          payment.status === "paid"
                          ? "✅ Completed"
                          : payment.status === "pending"
                          ? "⏳ Pending"
                          : payment.status === "failed"
                          ? "❌ Failed"
                          : payment.status}
                        </div>
                        </div>

                        <div className="sui-transaction-details">
                        <div className="sui-transaction-row">
                          <span className="sui-transaction-label">Amount:</span>
                          <span className="sui-transaction-value">
                          {parseFloat(
                            payment.amountInSui || payment.amount
                          ).toFixed(4)}{" "}
                          SUI
                          </span>
                        </div>

                        {payment.txnHash && (
                          <div className="sui-transaction-row">
                          <span className="sui-transaction-label">
                            Transaction Hash:
                          </span>
                          <span className="sui-transaction-value sui-hash">
                            {payment.txnHash.slice(0, 8)}...
                            {payment.txnHash.slice(-8)}
                          </span>
                          </div>
                        )}

                        {payment.customerWallet && (
                          <div className="sui-transaction-row">
                          <span className="sui-transaction-label">
                            Customer Wallet:
                          </span>
                          <span className="sui-transaction-value sui-hash">
                            {payment.customerWallet.slice(0, 8)}...
                            {payment.customerWallet.slice(-8)}
                          </span>
                          </div>
                        )}

                        <div className="sui-transaction-row">
                          <span className="sui-transaction-label">Date:</span>
                          <span className="sui-transaction-value">
                          {formatDate(payment.createdAt)}
                          </span>
                        </div>

                        {payment.paidAt && (
                          <div className="sui-transaction-row">
                          <span className="sui-transaction-label">
                            Paid At:
                          </span>
                          <span className="sui-transaction-value">
                            {formatDate(payment.paidAt)}
                          </span>
                          </div>
                        )}
                        </div>

                        {payment.description && (
                        <div className="sui-transaction-description">
                          <span className="sui-transaction-label">
                          Description:
                          </span>
                          <p>{payment.description}</p>
                        </div>
                        )}
                      </div>
                      ))
                    )}
                    </div>
                  </div>
                  )}

                  {activeTab === "webhooks" && (
                  <div className="sui-webhooks-section">
                    <h3>Webhook Configuration</h3>
                    <p>
                    Configure webhooks to receive real-time payment notifications.
                    </p>
                    <div className="sui-webhook-config">
                    <div className="sui-form-group">
                      <label>Webhook URL</label>
                      <input
                      type="url"
                      placeholder="https://your-domain.com/webhook"
                      className="sui-input"
                      />
                    </div>
                    <div className="sui-form-group">
                      <label>Secret Key</label>
                      <input
                      type="text"
                      placeholder="Your webhook secret"
                      className="sui-input"
                      />
                    </div>
                    <button className="sui-button sui-button-primary">
                      Save Webhook
                    </button>
                    </div>
                  </div>
                  )}

                  {activeTab === "settings" && (
                  <div className="sui-settings-section">
                    <h3>Account Settings</h3>
                    <div className="sui-settings-grid">
                    <div className="sui-setting-card">
                      <h4>Business Information</h4>
                      <div className="sui-form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        value={merchant.businessName || ""}
                        className="sui-input"
                        readOnly
                      />
                      </div>
                      <div className="sui-form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={merchant.email || ""}
                        className="sui-input"
                        readOnly
                      />
                      </div>
                      <div className="sui-form-group">
                      <label>Merchant ID</label>
                      <input
                        type="text"
                        value={merchant._id || ""}
                        className="sui-input"
                        readOnly
                      />
                      </div>
                    </div>

                    <div className="sui-setting-card">
                      <h4>Wallet Address</h4>
                      <div className="sui-wallet-display">
                      <span className="sui-wallet-address">
                        {merchant.walletAddress}
                      </span>
                      <button className="sui-button sui-button-secondary">
                        Copy
                      </button>
                      </div>
                    </div>
                    {/* Removed USDTRateSettings and any naira conversion info */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuiFlowDashboard;
