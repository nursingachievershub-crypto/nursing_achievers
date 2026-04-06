import React, { useState, useRef } from 'react';
import qrImage from '../../assets/qr.png';
import { usePayments } from '../../context/PaymentContext';
import { useAuth } from '../../context/AuthContext';

interface CartItem {
  id: string;
  title: string;
  price: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  onPaymentSubmitted?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, total, cartItems, onPaymentSubmitted }: PaymentModalProps) => {
  const { user } = useAuth();
  const { submitPayment } = usePayments();
  const fileRef = useRef<HTMLInputElement>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileName, setFileName]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB allowed.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      setError('Please upload your payment screenshot first.');
      return;
    }
    if (!user) {
      setError('You must be logged in.');
      return;
    }
    setSubmitting(true);
    try {
      await submitPayment({
        studentEmail: user.email,
        studentName: user.name,
        courses: cartItems.map(c => ({ title: c.title, price: c.price })),
        total,
        screenshot,
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitted && onPaymentSubmitted) onPaymentSubmitted();
    setScreenshot(null);
    setFileName('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  // ── SUCCESS STATE ──
  if (submitted) {
    return (
      <div style={overlayStyle} onClick={handleClose}>
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(5,150,105,0.3)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Payment Submitted!</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 6px', lineHeight: 1.6 }}>
              Your screenshot has been sent for verification.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 28px' }}>
              You'll get access once the admin approves it.
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>📋</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>Order Summary</span>
              </div>
              {cartItems.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '4px 0' }}>
                  <span>{c.title}</span>
                  <span style={{ fontWeight: '600' }}>₹{c.price.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #bbf7d0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#059669' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleClose} style={{ ...doneButtonStyle, background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              Done ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN MODAL ──
  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={{ ...modalStyle, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Complete Payment</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Scan QR → Pay → Upload screenshot</p>
          </div>
          <button onClick={handleClose} style={closeButtonStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* AMOUNT */}
        <div style={amountBoxStyle}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Amount to Pay</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>₹{total.toLocaleString()}</p>
        </div>

        {/* QR CODE */}
        <div style={qrContainerStyle}>
          <img src={qrImage} alt="UPI QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px' }} />
        </div>

        {/* STEPS */}
        <div style={stepsStyle}>
          {[
            'Open any UPI app (GPay, PhonePe, Paytm)',
            'Scan the QR code above',
            `Pay ₹${total.toLocaleString()}`,
            'Upload payment screenshot below',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: i === 3 ? '#2563eb' : '#eff6ff', color: i === 3 ? '#fff' : '#2563eb', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: i === 3 ? '#1e293b' : '#64748b', lineHeight: '1.5', fontWeight: i === 3 ? '700' : '400' }}>{step}</p>
            </div>
          ))}
        </div>

        {/* ── SCREENSHOT UPLOAD ── */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Upload Payment Screenshot</span>
          </div>

          {!screenshot ? (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '32px 20px',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                background: '#fff',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📸</div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                Tap to upload screenshot
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                JPG, PNG — Max 5MB
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={screenshot}
                alt="Payment Screenshot"
                style={{ width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0', maxHeight: '280px', objectFit: 'contain', background: '#fff' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>{fileName}</span>
                </div>
                <button
                  onClick={() => { setScreenshot(null); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }}
                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#ef4444', fontWeight: '500', textAlign: 'center' }}>
            ⚠ {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !screenshot}
          style={{
            ...doneButtonStyle,
            opacity: (!screenshot || submitting) ? 0.5 : 1,
            cursor: (!screenshot || submitting) ? 'not-allowed' : 'pointer',
            background: screenshot ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#94a3b8',
          }}
        >
          {submitting ? 'Submitting…' : screenshot ? 'Submit Payment Proof →' : 'Upload screenshot to continue'}
        </button>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: '16px' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const closeButtonStyle: React.CSSProperties = { background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const amountBoxStyle: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const qrContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #cbd5e1' };
const stepsStyle: React.CSSProperties = { marginBottom: '20px' };
const doneButtonStyle: React.CSSProperties = { width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' };
