import React from 'react';
import { PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';

function AdminView({
  showAddProductForm,
  setShowAddProductForm,
  handleAddProductSubmit,
  productForm,
  setProductForm,
  addingProduct,
  loading,
  orders,
  handleStatusChange,
  handleDeleteOrder,
  products,
  handleDeleteProduct
}) {
  return (
    <>
      <div className="admin-header-row">
        <h1 className="page-title" style={{ margin: 0 }}>Admin Management</h1>
        <button 
          className="add-product-toggle-btn"
          onClick={() => setShowAddProductForm(!showAddProductForm)}
        >
          <PlusCircle size={18} /> {showAddProductForm ? 'Close Form' : 'Add New Product'}
        </button>
      </div>

      {showAddProductForm && (
        <div className="add-product-card">
          <h3>Create New Product</h3>
          <form onSubmit={handleAddProductSubmit}>
            <div className="product-form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Mechanical Keyboard"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 2999"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Electronics, Gaming"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  rows="2"
                  placeholder="Product specifications or details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddProductForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-order-btn" 
                style={{ margin: 0 }}
                disabled={addingProduct}
              >
                {addingProduct ? 'Adding...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders Section */}
      <div className="admin-subheading">
        <span>Customer Orders ({orders.length})</span>
      </div>

      {loading ? (
        <div className="status-msg">Fetching data from MongoDB...</div>
      ) : orders.length === 0 ? (
        <div className="status-msg">No orders placed yet.</div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Details</th>
                <th>Purchased Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status Action</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id.slice(-6)}</td>
                  <td>
                    <div className="order-customer">
                      <span className="customer-name">{order.customer.name}</span>
                      <span className="customer-contact">📞 {order.customer.phone}</span>
                      <span className="customer-contact">📍 {order.customer.address}</span>
                    </div>
                  </td>
                  <td>
                    <div className="order-items-list">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="order-item-chip">
                          {it.name} × <strong>{it.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong>₹{order.totalAmount}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <CheckCircle2 size={13} /> {order.paymentStatus || 'Paid'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        ID: {order.razorpayPaymentId?.slice(-8) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`status-select status-${order.status.toLowerCase()}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="delete-action-btn"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Catalog Management */}
      <div className="admin-subheading">
        <span>Manage Products Catalog ({products.length})</span>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <div className="product-name-cell">
                    <img src={product.image} alt={product.name} className="product-row-thumb" />
                    <span style={{ fontWeight: 600 }}>{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>
                  <button 
                    className="delete-action-btn"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminView;