import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : 'toast-error'}`}>
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
