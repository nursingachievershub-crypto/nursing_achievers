import React from 'react';

// --- MAIN PORTAL VIEW ---
export const AchieversPortal = () => {
  const handleEnroll = (data: { title: string; price: number }) => {
    alert(`Enrolling in ${data.title} for ₹${data.price}`);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '40px', backgroundColor: '#f8fafc', flexWrap: 'wrap' }}>
      
      {/* 1. THE NEW PRIME CARD (No Discount) */}
      <div className="glass-card" style={cardStyle}>
        <div style={primeBadgeStyle}>PREMIUM ACCESS</div>
        <h3 style={titleStyle}>ACHIEVERS'S PRIME: NORCET11</h3>
        <div style={{ marginBottom: '20px' }}>
          <span style={primePriceStyle}>₹10,000</span>
        </div>
        <button 
          onClick={() => handleEnroll({ title: "NORCET11", price: 10000 })} 
          style={buttonStyle}
        >
          Enroll Now
        </button>
      </div>

      {/* 2. THE ORIGINAL DISCOUNT CARD (With Strike-through) */}
      <div className="glass-card" style={cardStyle}>
        <div style={badgeStyle}>SAVE ₹3,000</div>
        <h3 style={titleStyle}>NURSING FOUNDATION BUNDLE</h3>
        <div style={{ marginBottom: '20px' }}>
          <span style={originalPriceStyle}>₹13,000</span>
          <span style={discountPriceStyle}>₹10,000</span>
        </div>
        <button 
          onClick={() => handleEnroll({ title: "Foundation Bundle", price: 10000 })} 
          style={buttonStyle}
        >
          Enroll Now
        </button>
      </div>

    </div>
  );
};

// --- SHARED STYLES ---
const cardStyle: React.CSSProperties = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '350px',
  padding: '30px 24px',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  position: 'relative',
};

const titleStyle: React.CSSProperties = { 
  fontSize: '20px', 
  marginBottom: '12px', 
  color: '#1e293b',
  fontWeight: '700'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  padding: '12px 20px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '16px',
};

// --- PRIME SPECIFIC (NORCET11) ---
const primeBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  right: '20px',
  background: '#dbeafe',
  color: '#1e40af',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '800',
  border: '1px solid #bfdbfe',
};

const primePriceStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: '900',
  color: '#1e293b',
};

// --- DISCOUNT SPECIFIC ---
const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  right: '20px',
  background: '#fee2e2',
  color: '#ef4444',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '800',
  border: '1px solid #fecaca',
};

const originalPriceStyle: React.CSSProperties = {
  textDecoration: 'line-through',
  color: '#94a3b8',
  fontSize: '16px',
  marginRight: '12px',
};

const discountPriceStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: '900',
  color: '#059669',
};

export default AchieversPortal;