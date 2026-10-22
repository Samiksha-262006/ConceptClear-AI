import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="var(--success-green)" />,
    error: <AlertTriangle size={18} color="var(--danger-red)" />,
    warning: <AlertCircle size={18} color="var(--warning-amber)" />,
    info: <Info size={18} color="var(--primary-blue)" />
  };

  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {iconMap[t.type] || iconMap.info}
          <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
