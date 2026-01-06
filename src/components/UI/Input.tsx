
import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="input-field">
            {label && <label className="label">{label}</label>}
            <input className={`input ${className}`} {...props} />
            <style>{`
        .input-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          width: 100%;
        }
        .label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--secondary);
        }
        .input {
          padding: 0.625rem var(--space-md);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.95rem;
          transition: all 0.2s;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }
      `}</style>
        </div>
    );
};

export default Input;
