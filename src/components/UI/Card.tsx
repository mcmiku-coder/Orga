
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
    return (
        <div className={`card ${hover ? 'hoverable' : ''} ${className}`}>
            {children}
            <style>{`
        .card {
          background: white;
          border-radius: var(--radius);
          padding: var(--space-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
        }
        .card.hoverable:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: var(--primary-focus);
        }
      `}</style>
        </div>
    );
};

export default Card;
