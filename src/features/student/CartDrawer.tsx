import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onProceed: () => void;
}

export const CartDrawer = ({ isOpen, onClose, items, onRemove, onProceed }: CartDrawerProps) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="cart-drawer" style={drawerStyle} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
            Shopping Cart
          </h2>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', padding: '0 24px 16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          {items.length} {items.length === 1 ? 'Course' : 'Courses'} in Cart
        </div>

        {/* ITEMS LIST */}
        <div style={itemListStyle}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '600' }}>Your cart is empty</p>
              <p style={{ color: '#cbd5e1', fontSize: '13px' }}>Add courses to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={itemCardStyle}>
                {/* Course Thumbnail */}
                <div style={thumbnailStyle}>
                  <span style={{ fontSize: '28px' }}>🏥</span>
                </div>

                {/* Course Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>
                    {item.title}
                  </p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#64748b' }}>
                    By Nursing Achievers
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                      ₹{(item.price + 3000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemove(item.id)}
                  style={removeButtonStyle}
                  title="Remove"
                >
                  <Trash2 size={15} color="#ef4444" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div style={footerStyle}>

            {/* SAVINGS */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4caf50' }}>
                You Save <span style={{ fontWeight: 'bold' }}>₹{(items.length * 3000).toLocaleString()}</span> on this order!
              </p>
            </div>

            {/* TOTAL */}
            <div style={totalRow}>
              <span style={{ fontSize: '15px', color: '#475569' }}>Total Payable:</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                ₹{total.toLocaleString()}/-
              </span>
            </div>

            {/* PROCEED BUTTON */}
            <button style={payButtonStyle} onClick={onProceed}>
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end'
};

const drawerStyle: React.CSSProperties = {
  width: '100%', maxWidth: '400px', height: '100%', backgroundColor: '#fff',
  padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)'
};

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const itemListStyle = { flex: 1, overflowY: 'auto' as 'auto' };
const itemCardStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '15px' 
};

const footerStyle = { borderTop: '1px solid #e2e8f0', paddingTop: '20px' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '20px', marginBottom: '20px' };

const closeButtonStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 0
};

const thumbnailStyle = {
  width: '60px', height: '60px', backgroundColor: '#e2e8f0', borderRadius: '12px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '28px'
};

const removeButtonStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 0
};

const payButtonStyle = {
  width: '100%', padding: '16px', background: '#2563eb', color: '#fff', 
  border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};