import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, Lock, CheckCircle2, AlertCircle, Info, CreditCard, Shield, User, Mail, Phone, MapPin } from 'lucide-react';
import './App.css';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import AdminView from './components/AdminView';

// Live Production Render Backend API URL
const API_BASE_URL = 'https://sarv-infotech-ecommerce.onrender.com/api';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState('store');

  // Customer Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('RahulChart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [authError, setAuthError] = useState('');

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem('nexstore_admin') === 'true'
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Toast System State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  // Payment Gateway Modal State
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Add Product Form State
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Quick View Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/products`)
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        showToast('Error fetching products', 'error');
        setLoading(false);
      });
  };

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/orders`)
      .then(response => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        showToast('Error fetching orders', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Customer Auth Handlers
  const handleOpenCustomerAuth = () => {
    setAuthError('');
    setAuthForm({ name: '', email: '', password: '', phone: '', address: '' });
    setIsCustomerAuthOpen(true);
  };

  const handleCustomerAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authTab === 'login' ? '/login' : '/signup';

    try {
      const res = await axios.post(`${API_BASE_URL}/auth${endpoint}`, authForm);
      localStorage.setItem('nexstore_token', res.data.token);
      localStorage.setItem('nexstore_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      setIsCustomerAuthOpen(false);
      showToast(res.data.message, 'success');

      // Pre-fill checkout form if empty
      setFormData({
        name: res.data.user.name || '',
        phone: res.data.user.phone || '',
        address: res.data.user.address || ''
      });
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('nexstore_token');
    localStorage.removeItem('nexstore_user');
    setCurrentUser(null);
    showToast('Customer logged out', 'info');
  };

  // Admin Auth Handlers
  const handleAdminPanelAccess = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin');
      fetchOrders();
    } else {
      setLoginError('');
      setLoginForm({ username: '', password: '' });
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      localStorage.setItem('nexstore_admin', 'true');
      setIsAdminLoggedIn(true);
      setIsLoginModalOpen(false);
      setCurrentView('admin');
      fetchOrders();
      showToast('Admin logged in successfully', 'success');
    } else {
      setLoginError('Invalid credentials (Use: admin / admin123)');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('nexstore_admin');
    setIsAdminLoggedIn(false);
    setCurrentView('store');
    fetchProducts();
    showToast('Admin logged out', 'info');
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item._id === product._id);
      if (existing) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`, 'success');
    setIsCartOpen(true);
  };

  const updateQuantity = (id, amount) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item._id === id) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProceedCheckout = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
    setIsCartOpen(false);
    setIsModalOpen(true);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    setIsPaymentGatewayOpen(true);
  };

  const handleCompleteTransaction = async () => {
    setProcessingPayment(true);
    const generatedPaymentId = `pay_rzp_${Date.now().toString().slice(-8)}`;

    const orderPayload = {
      customer: formData,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      paymentId: generatedPaymentId
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/orders/verify-and-save`, orderPayload);
      setCart([]);
      setIsPaymentGatewayOpen(false);
      if (!currentUser) setFormData({ name: '', phone: '', address: '' });
      showToast(`🎉 Payment Verified! Order #${res.data.order._id.slice(-6)} placed.`, 'success');
    } catch (err) {
      showToast('Error verifying payment with server.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setAddingProduct(true);

    try {
      await axios.post(`${API_BASE_URL}/products`, productForm);
      setProductForm({ name: '', price: '', category: '', image: '', description: '' });
      setShowAddProductForm(false);
      showToast('New product added to catalog', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding product', 'error');
    } finally {
      setAddingProduct(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(ord => ord._id === orderId ? { ...ord, status: newStatus } : ord));
      showToast(`Order status updated to ${newStatus}`, 'info');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteOrder = (orderId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Order Record',
      message: 'Are you sure you want to permanently delete this order?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
          setOrders(orders.filter(ord => ord._id !== orderId));
          showToast('Order record deleted', 'info');
        } catch (err) {
          showToast('Failed to delete order', 'error');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleDeleteProduct = (productId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to remove this product from the store?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/products/${productId}`);
          setProducts(products.filter(p => p._id !== productId));
          showToast('Product removed from catalog', 'info');
        } catch (err) {
          showToast('Failed to delete product', 'error');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <div>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
            {toast.type === 'info' && <Info size={18} color="#3b82f6" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Navbar Component */}
      <Navbar 
        currentView={currentView}
        handleAdminPanelAccess={handleAdminPanelAccess}
        handleAdminLogout={handleAdminLogout}
        setCurrentView={setCurrentView}
        fetchProducts={fetchProducts}
        totalItemsCount={totalItemsCount}
        setIsCartOpen={setIsCartOpen}
        currentUser={currentUser}
        handleOpenCustomerAuth={handleOpenCustomerAuth}
        handleCustomerLogout={handleCustomerLogout}
      />

      {/* Main Container */}
      <main className="main-container">
        {currentView === 'store' ? (
          <>
            <div className="controls-bar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="category-filters">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="page-title">Featured Products</h1>

            {loading ? (
              <div className="status-msg">Loading catalog from database...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="status-msg">No products found matching your search.</div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((item) => (
                  <div 
                    key={item._id} 
                    className="product-card"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <img src={item.image} alt={item.name} className="product-image" />
                    <div className="product-info">
                      <span className="product-category">{item.category}</span>
                      <h2 className="product-name">{item.name}</h2>
                      <p className="product-desc">{item.description}</p>
                      <div className="product-footer">
                        <span className="product-price">₹{item.price}</span>
                        <button 
                          className="add-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <ShoppingBag size={16} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <AdminView 
            showAddProductForm={showAddProductForm}
            setShowAddProductForm={setShowAddProductForm}
            handleAddProductSubmit={handleAddProductSubmit}
            productForm={productForm}
            setProductForm={setProductForm}
            addingProduct={addingProduct}
            loading={loading}
            orders={orders}
            handleStatusChange={handleStatusChange}
            handleDeleteOrder={handleDeleteOrder}
            products={products}
            handleDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        totalItemsCount={totalItemsCount}
        updateQuantity={updateQuantity}
        totalAmount={totalAmount}
        handleProceedCheckout={handleProceedCheckout}
      />

      {/* Quick View Modal */}
      <QuickViewModal 
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        addToCart={addToCart}
      />

      {/* Customer Login / Register Modal */}
      {isCustomerAuthOpen && (
        <div className="modal-overlay">
          <div className="auth-modal-card">
            <div className="modal-header" style={{ marginBottom: '10px' }}>
              <h3>Customer Portal</h3>
              <button className="close-btn" onClick={() => setIsCustomerAuthOpen(false)}>✕</button>
            </div>

            <div className="auth-tabs">
              <button 
                type="button" 
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthTab('signup'); setAuthError(''); }}
              >
                Register
              </button>
            </div>

            {authError && <div className="auth-error">{authError}</div>}

            <form onSubmit={handleCustomerAuthSubmit} className="checkout-form">
              {authTab === 'signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. John Doe"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Enter secure password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              {authTab === 'signup' && (
                <>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="10-digit mobile number"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Address</label>
                    <textarea 
                      rows="2" 
                      placeholder="Street, City, Pincode"
                      value={authForm.address}
                      onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="submit-order-btn" style={{ marginTop: '10px' }}>
                {authTab === 'login' ? 'Sign In to Account' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="auth-modal-card">
            <div className="auth-header">
              <div className="auth-icon-badge">
                <Lock size={22} />
              </div>
              <h3>Admin Authorization</h3>
              <p>Sign in to manage catalog and customer orders</p>
            </div>

            {loginError && <div className="auth-error">{loginError}</div>}

            <form onSubmit={handleLoginSubmit} className="checkout-form">
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                Default demo: <strong>admin</strong> / <strong>admin123</strong>
              </div>

              <div className="form-actions" style={{ marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsLoginModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-order-btn" style={{ margin: 0 }}>
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delivery Details</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleProceedToPayment} className="checkout-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Shipping Address</label>
                <textarea 
                  required 
                  rows="3" 
                  placeholder="House/Street, Area, City, Pin"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="order-summary-box">
                <span>Total Payable:</span>
                <span>₹{totalAmount}</span>
              </div>

              <button 
                type="submit" 
                className="submit-order-btn" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CreditCard size={18} /> Proceed to Pay ₹{totalAmount}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Payment Gateway Modal */}
      {isPaymentGatewayOpen && (
        <div className="modal-overlay">
          <div className="payment-gateway-modal">
            <div className="pg-header">
              <div className="pg-brand">
                <span>Secure Checkout</span>
                <span>Rahul Store Gateway</span>
              </div>
              <div className="pg-amount">
                ₹{totalAmount}
              </div>
            </div>

            <div className="pg-body">
              <div className="pg-tabs">
                <button 
                  type="button" 
                  className={`pg-tab-btn ${paymentMethodTab === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethodTab('card')}
                >
                  Cards
                </button>
                <button 
                  type="button" 
                  className={`pg-tab-btn ${paymentMethodTab === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethodTab('upi')}
                >
                  UPI / QR
                </button>
                <button 
                  type="button" 
                  className={`pg-tab-btn ${paymentMethodTab === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethodTab('netbanking')}
                >
                  NetBanking
                </button>
              </div>

              {paymentMethodTab === 'card' && (
                <div className="pg-form">
                  <input type="text" className="pg-input" defaultValue="4111 •••• •••• 1111" readOnly />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" className="pg-input" defaultValue="12/28" readOnly />
                    <input type="password" className="pg-input" defaultValue="•••" readOnly />
                  </div>
                  <input type="text" className="pg-input" defaultValue={formData.name || 'Cardholder Name'} readOnly />
                </div>
              )}

              {paymentMethodTab === 'upi' && (
                <div className="pg-form">
                  <input type="text" className="pg-input" defaultValue={`${formData.phone || 'customer'}@upi`} readOnly />
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Instant verification via UPI App (GPay / PhonePe / Paytm)</p>
                </div>
              )}

              {paymentMethodTab === 'netbanking' && (
                <div className="pg-form">
                  <input type="text" className="pg-input" defaultValue="State Bank of India / HDFC Bank" readOnly />
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Redirecting to secure banking portal</p>
                </div>
              )}

              <button 
                type="button" 
                className="pg-pay-btn" 
                style={{ width: '100%' }}
                onClick={handleCompleteTransaction}
                disabled={processingPayment}
              >
                {processingPayment ? 'Authorizing & Processing...' : `Pay Now ₹${totalAmount}`}
              </button>

              <div className="pg-secure-badge">
                <Shield size={14} /> 256-Bit SSL Encrypted Test Mode
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsPaymentGatewayOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel and return to store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal-card">
            <h4>{confirmDialog.title}</h4>
            <p>{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={confirmDialog.onConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;