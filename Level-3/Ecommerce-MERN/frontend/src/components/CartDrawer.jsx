import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';

function CartDrawer({ 
  isCartOpen, 
  setIsCartOpen, 
  cart, 
  totalItemsCount, 
  updateQuantity, 
  totalAmount, 
  handleProceedCheckout 
}) {
  if (!isCartOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>Shopping Cart ({totalItemsCount})</h3>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Your cart is empty.</div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">₹{item.price}</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item._id, -1)}>
                      <Minus size={12} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item._id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button 
                  className="close-btn" 
                  onClick={() => updateQuantity(item._id, -item.quantity)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>
            <button className="checkout-btn" onClick={handleProceedCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;