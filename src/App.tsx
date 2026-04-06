import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { CartDrawer } from './features/student/CartDrawer';
import { NursingAchieversPortal } from './features/student/StudentPortal';
import { StudentLogin } from './features/student/StudentLogin';
import { PaymentModal } from './features/student/PaymentModal';
import { AdminDashboard } from './features/admin/AdminDashboard';

// ─── Student portal wrapped with cart/payment logic ───────────────────────────
const StudentApp = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const [isDrawerOpen, setIsDrawerOpen]     = useState(false);
  const [isPaymentOpen, setIsPaymentOpen]   = useState(false);

  const handleEnroll = (data: { title: string; price: number }) => {
    addToCart({ id: data.title, ...data });
    setIsDrawerOpen(true);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <NursingAchieversPortal
        cartCount={cart.length}
        onEnroll={handleEnroll}
        onOpenCart={() => setIsDrawerOpen(true)}
      />
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={cart}
        onRemove={(id) => removeFromCart(id)}
        onProceed={() => { setIsDrawerOpen(false); setIsPaymentOpen(true); }}
      />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        cartItems={cart}
        onPaymentSubmitted={() => { clearCart(); }}
      />
    </div>
  );
};

// ─── Auth gates ───────────────────────────────────────────────────────────────

/** Shown at "/" — redirects admins to dashboard, shows login if not signed in */
const StudentGate = () => {
  const { user, isAdmin } = useAuth();
  if (!user)    return <StudentLogin />;
  if (isAdmin)  return <Navigate to="/admin/dashboard" replace />;
  return <StudentApp />;
};

/** Shown at "/admin/dashboard" — redirects non-admins away */
const AdminGate = () => {
  const { user, isAdmin } = useAuth();
  if (!user)   return <StudentLogin />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

// ─── Router ───────────────────────────────────────────────────────────────────
const App = () => (
  <Routes>
    <Route path="/"                element={<StudentGate />} />
    <Route path="/admin/dashboard" element={<AdminGate />} />
    {/* Legacy admin login path — redirect to main */}
    <Route path="/admin"           element={<Navigate to="/" replace />} />
    <Route path="*"                element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;