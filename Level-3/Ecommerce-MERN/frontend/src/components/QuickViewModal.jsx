import React from 'react';
import { X, ShoppingBag } from 'lucide-react';

function QuickViewModal({ selectedProduct, setSelectedProduct, addToCart }) {
  if (!selectedProduct) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
      <div className="quickview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="quickview-category">{selectedProduct.category}</span>
          <button className="close-btn" onClick={() => setSelectedProduct(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="quickview-body">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name} 
            className="quickview-image" 
          />
          <div className="quickview-details">
            <h2 className="quickview-title">{selectedProduct.name}</h2>
            <p className="quickview-desc">{selectedProduct.description}</p>
            <div className="quickview-price">₹{selectedProduct.price}</div>
            <button 
              className="quickview-add-btn"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              <ShoppingBag size={18} /> Add to Cart & Open Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;