import React from 'react';
import { Network, FileBarChart, Info, Layers, Database, Search } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="about-page container fade-in">
            <div className="about-header glass-panel">
                <div className="header-icon">
                    <Info size={32} />
                </div>
                <div>
                    <h1>About MyORG</h1>
                    <p className="subtitle">Comprehensive Organizational Management System</p>
                </div>
            </div>

            <div className="content-grid">
                <section className="glass-panel main-intro">
                    <h2>Platform Overview</h2>
                    <p>
                        MyORG is a sophisticated organizational management tool designed to visualize, track, and analyze
                        complex corporate structures. It serves as a central hub for understanding both the formal
                        hierarchy (reporting lines) and the informal or functional networks that drive the business.
                    </p>
                </section>

                <section className="glass-panel feature-card">
                    <div className="feature-icon"><Layers size={24} /></div>
                    <h3>Hierarchy Visualization</h3>
                    <p>
                        Explore the company's structure through an interactive 7-level tree graph, ranging from
                        top-level divisions (L3) down to granular operational units (L9).
                    </p>
                    <ul className="feature-list">
                        <li><strong>Deep Navigation:</strong> Drill down through Levels 3 to 9 to understand organizational width and depth.</li>
                        <li><strong>Dynamic Rendering:</strong> The visualization automatically adjusts to display complex structures without overlapping.</li>
                        <li><strong>Employee Integration:</strong> Switch seamlessly between structural views and employee lists for specific units.</li>
                    </ul>
                </section>

                <section className="glass-panel feature-card">
                    <div className="feature-icon"><Network size={24} /></div>
                    <h3>Relationship Mapping</h3>
                    <p>
                        Go beyond simple org charts by mapping the complex web of interpersonal and professional connections.
                    </p>
                    <ul className="feature-list">
                        <li><strong>Bi-Directional Graph:</strong> Visualize distinct "Works For" relationships with clear directional flows (Subordinate → Boss).</li>
                        <li><strong>Contextual Insights:</strong> See an employee's immediate network, including managers, subordinates, and functional colleagues.</li>
                        <li><strong>Smart Filtering:</strong> Focus on employees with active links to identify key network nodes.</li>
                    </ul>
                </section>

                <section className="glass-panel feature-card">
                    <div className="feature-icon"><Search size={24} /></div>
                    <h3>Employee Management</h3>
                    <p>
                        A robust directory and profile system that puts employee data at your fingertips.
                    </p>
                    <ul className="feature-list">
                        <li><strong>Rapid Search:</strong> Instantly find personnel by Name or Initials.</li>
                        <li><strong>Detailed Profiles:</strong> Access comprehensive views including Roles, Status, and Hierarchy location (L6/L9).</li>
                        <li><strong>Seamless Navigation:</strong> Jump between list views, detailed profiles, and structural graphs with persistent context.</li>
                    </ul>
                </section>

                <section className="glass-panel feature-card">
                    <div className="feature-icon"><FileBarChart size={24} /></div>
                    <h3>Reports & Analytics</h3>
                    <p>
                        Transform organizational data into actionable insights with powerful extraction tools.
                    </p>
                    <ul className="feature-list">
                        <li><strong>Specialized Reports:</strong> Generate instant lists for Team Heads, Region Heads, Assistants, and more.</li>
                        <li><strong>Smart Columns:</strong> Auto-populated fields including Level 6 and Level 9 codes for precise data alignment.</li>
                        <li><strong>CSV Export:</strong> One-click capabilities to export any dataset for external analysis.</li>
                    </ul>
                </section>

                <section className="glass-panel feature-card">
                    <div className="feature-icon"><Database size={24} /></div>
                    <h3>Reference Data</h3>
                    <p>
                        Manage the foundational building blocks of the organization.
                    </p>
                    <ul className="feature-list">
                        <li><strong>Structure Control:</strong> Maintain the integrity of Hierarchy Levels and their parent-child relationships.</li>
                        <li><strong>Data Governance:</strong> Ensure consistency across all organizational units and definitions.</li>
                    </ul>
                </section>
            </div>

            <style>{`
                .about-page {
                    padding: var(--space-xl);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }

                .about-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                    border-radius: var(--radius-lg);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                }

                .header-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }

                .subtitle {
                    color: var(--text-light);
                    font-size: 1.1rem;
                    margin-top: 4px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: var(--space-lg);
                }

                .main-intro {
                    grid-column: 1 / -1;
                    padding: var(--space-xl);
                    border-left: 4px solid var(--primary);
                }

                .main-intro h2 {
                    margin-bottom: var(--space-md);
                    color: var(--text-main);
                }

                .main-intro p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                }

                .feature-card {
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .feature-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--primary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--space-md);
                }

                .feature-card h3 {
                    font-size: 1.25rem;
                    margin-bottom: var(--space-md);
                    color: var(--text-main);
                }

                .feature-card p {
                    color: var(--text-muted);
                    margin-bottom: var(--space-md);
                    line-height: 1.5;
                }

                .feature-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .feature-list li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: var(--text-light);
                    font-size: 0.95rem;
                    line-height: 1.4;
                }

                .feature-list li::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: var(--primary);
                    font-weight: bold;
                }

                .feature-list strong {
                    color: var(--text-main);
                }
            `}</style>
        </div>
    );
};

export default AboutPage;
