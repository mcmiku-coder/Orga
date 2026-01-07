
import React, { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { label: string; value: string }[];
}

const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
    return (
        <div className="input-field">
            {label && <label className="label">{label}</label>}
            <div className="select-wrapper">
                <select className={`input select ${className}`} {...props}>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            <style>{`
        .select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em;
          padding-right: 3rem;
          height: 3.5rem; /* Bigger height */
          font-size: 1.1rem; /* Bigger text */
          background-color: var(--surface);
          color: var(--text-main);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding-left: var(--space-md);
          width: 100%;
          cursor: pointer;
        }
        .select:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-light);
        }
      `}</style>
        </div>
    );
};

export default Select;
