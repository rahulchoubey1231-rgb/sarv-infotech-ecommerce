import React from 'react';
import { ShoppingCart, ShieldCheck, ArrowLeft, LogOut, User, LogIn } from 'lucide-react';

function Navbar({ 
  currentView, 
  handleAdminPanelAccess, 
  handleAdminLogout, 
  setCurrentView, 
  fetchProducts, 
  totalItemsCount, 
  setIsCartOpen,
  currentUser,
  handleOpenCustomerAuth,
  handleCustomerLogout
}) {
  return (
    <header className="navbar">
      <div className="logo">Rahul Cart</div>
      
      <div className="nav-actions">
        {currentView === 'store' ? (
          <>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="user-logged-badge">
                  <User size={15} />
                  <span>{currentUser.name}</span>
                </div>
                <button className="customer-auth-btn" onClick={handleCustomerLogout} title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button className="customer-auth-btn" onClick={handleOpenCustomerAuth}>
                <LogIn size={15} /> Login / Register
              </button>
            )}

            <button className="toggle-view-btn" onClick={handleAdminPanelAccess}>
              <ShieldCheck size={16} /> Admin Panel
            </button>
          </>
        ) : (
          <>
            <button className="toggle-view-btn" onClick={() => { setCurrentView('store'); fetchProducts(); }}>
              <ArrowLeft size={16} /> Back to Store
            </button>
            <button className="logout-btn" onClick={handleAdminLogout}>
              <LogOut size={16} /> Logout Admin
            </button>
          </>
        )}

        {currentView === 'store' && (
          <div className="cart-indicator" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={18} />
            <span>Cart ({totalItemsCount})</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;