import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paymentsAPI } from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PaymentRequest {
  _id?: string;
  id?: string;
  studentEmail: string;
  studentName: string;
  courses: { title: string; price: number }[];
  total: number;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  createdAt?: string;
  reviewedAt?: string;
}

interface PaymentContextType {
  payments: PaymentRequest[];
  loading: boolean;
  submitPayment: (p: Omit<PaymentRequest, '_id' | 'id' | 'status' | 'submittedAt' | 'createdAt'>) => Promise<void>;
  updatePaymentStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  getStudentPayments: (email: string) => PaymentRequest[];
  refreshPayments: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// ─── Provider (MongoDB API-backed) ──────────────────────────────────────────
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentsAPI.getAll();
      setPayments(data);
    } catch { /* API not available */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshPayments(); }, [refreshPayments]);

  const submitPayment = async (p: Omit<PaymentRequest, '_id' | 'id' | 'status' | 'submittedAt' | 'createdAt'>) => {
    try {
      const newPayment = await paymentsAPI.create({ ...p, status: 'pending' });
      setPayments(prev => [newPayment, ...prev]);
    } catch (err) {
      console.error('Payment submission failed:', err);
      throw err;
    }
  };

  const updatePaymentStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await paymentsAPI.update(id, { status });
      setPayments(prev => prev.map(p => (p._id === id ? updated : p)));
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  const getStudentPayments = (email: string) =>
    payments.filter(p => p.studentEmail?.toLowerCase() === email.toLowerCase());

  return (
    <PaymentContext.Provider value={{ payments, loading, submitPayment, updatePaymentStatus, getStudentPayments, refreshPayments }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used within <PaymentProvider>');
  return ctx;
};
