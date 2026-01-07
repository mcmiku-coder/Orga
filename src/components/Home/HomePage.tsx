import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page container">
            <div className="hero-section glass-panel">
                <div className="hero-content">
                    <h1>My<span className="text-primary">ORG</span></h1>
                    <p className="hero-subtitle">
                        Advanced Organization & Relationship Management System
                    </p>
                    <p className="hero-desc">
                        Manage your organization's hierarchy, track employee relationships, and visualize connections efficiently.
                    </p>

                </div>
            </div>

            <div className="features-grid">
                <div className="feature-card glass-panel" onClick={() => navigate('/search')}>
                    <div className="icon-box"><Search size={32} /></div>
                    <h3>Linking</h3>
                    <p>Manage employee relationships and visualize organizational connections.</p>
                </div>
                <div className="feature-card glass-panel" onClick={() => navigate('/hierarchy')}>
                    <div className="icon-box"><Users size={32} /></div>
                    <h3>Hierarchy Overview</h3>
                    <p>View and manage the complete organizational structure from L9 to L3.</p>
                </div>
                <div className="feature-card glass-panel" onClick={() => navigate('/reports')}>
                    <div className="icon-box"><Activity size={32} /></div>
                    <h3>Detailed Reports</h3>
                    <p>Analyze organization data and export reports to CSV.</p>
                </div>
            </div>

            <style>{`
                .home-page {
                    padding: var(--space-xl) var(--space-md);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xl);
                }

                .hero-section {
                    padding: 4rem 2rem;
                    text-align: center;
                    border-radius: var(--radius-lg);
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
                }

                .text-primary { color: var(--primary); }

                .hero-subtitle {
                    font-size: 1.5rem;
                    color: var(--text-main);
                    margin: var(--space-md) 0;
                    font-weight: 300;
                }

                .hero-desc {
                    color: var(--text-muted);
                    max-width: 600px;
                    margin: 0 auto var(--space-xl);
                    line-height: 1.6;
                    font-size: 1.1rem;
                }

                .cta-btn {
                    padding: 1rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-full);
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px var(--primary-light);
                }

                .cta-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px var(--primary-light);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: var(--space-lg);
                }

                .feature-card {
                    padding: var(--space-xl);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    border-radius: var(--radius-lg);
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                }

                .icon-box {
                    width: 64px;
                    height: 64px;
                    background: var(--surface-alt);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    margin-bottom: var(--space-md);
                }

                .feature-card h3 {
                    margin-bottom: var(--space-sm);
                    color: var(--text-main);
                }

                .feature-card p {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
