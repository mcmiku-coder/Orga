import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../UI/Card';
import Input from '../UI/Input';

const SearchPage: React.FC = () => {
  const { employees, hierarchy, getHierarchyPath } = useData();
  const [query, setQuery] = useState('');
  const [levelQuery, setLevelQuery] = useState('');
  const navigate = useNavigate();

  const filteredEmployees = useMemo(() => {

    // 1. Filter by Name/Initials
    let filtered = employees;

    if (query) {
      const lowerQ = query.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.lastName.toLowerCase().includes(lowerQ) ||
        emp.firstName.toLowerCase().includes(lowerQ) ||
        emp.initials.toLowerCase().includes(lowerQ)
      );
    }

    // 2. Filter by Level Hierarchy
    if (levelQuery) {
      const lowerL = levelQuery.toLowerCase();

      // Find all hierarchy nodes that match the query
      const matchedLevels = hierarchy.filter(h =>
        h.name.toLowerCase().includes(lowerL) ||
        h.id.toLowerCase().includes(lowerL)
      );

      const matchedLevelIds = new Set(matchedLevels.map(h => h.id));

      // Find all valid L9 IDs that belong to these matched levels
      const validL9s = new Set<string>();

      // Get all L9 nodes from hierarchy
      const allL9s = hierarchy.filter(h => h.level === 9);

      for (const l9 of allL9s) {
        // If the L9 itself matches, add it
        if (matchedLevelIds.has(l9.id)) {
          validL9s.add(l9.id);
          continue;
        }

        // Check ancestors
        const path = getHierarchyPath(l9.id);
        const hasAncestorMatch = path.some(node => matchedLevelIds.has(node.id));

        if (hasAncestorMatch) {
          validL9s.add(l9.id);
        }
      }

      filtered = filtered.filter(emp => validL9s.has(emp.level9));
    }

    return filtered;
  }, [query, levelQuery, employees, hierarchy, getHierarchyPath]);

  return (
    <div className="search-page container">
      <div className="search-header glass-panel">
        <h1>Search Employees</h1>
        <p className="subtitle">Find anyone in the organization by name or initials.</p>

        <div className="search-bar-container">
          <Input
            placeholder="Type name or initials (e.g. MAM)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          <SearchIcon className="search-icon-absolute" size={20} />

          <div style={{ marginTop: '1rem' }}>
            <Input
              placeholder="Filter by Level (e.g. Paris, France, EMEA)..."
              value={levelQuery}
              onChange={(e) => setLevelQuery(e.target.value)}
              className="level-input"
            />
          </div>
        </div>
      </div>

      <div className="results-grid">
        {filteredEmployees.map(emp => (
          <Card
            key={emp.id}
            hover
            className="employee-card"
          >
            <div className="card-content" onClick={() => navigate(`/employee/${emp.id}`)}>
              <div className="emp-avatar">{emp.initials}</div>
              <div className="emp-details">
                <h3>{emp.lastName} {emp.firstName}</h3>
                <span className="role-badge">{emp.role}</span>
                <span className="meta">{emp.level9}</span>
              </div>
              <div className={`status-dot ${emp.status.toLowerCase()}`}></div>
            </div>
          </Card>
        ))}

        {((query || levelQuery) && filteredEmployees.length === 0) && (
          <div className="no-results">
            No employees found matching your criteria.
          </div>
        )}
      </div>

      <style>{`
        .search-page {
          padding-top: var(--space-xl);
        }
        .search-header {
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        .subtitle {
          color: var(--text-muted);
          margin-bottom: var(--space-lg);
        }
        .search-bar-container {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }
        .search-input {
          padding-left: 3rem !important;
          height: 3.5rem;
          font-size: 1.1rem;
        }
        .search-icon-absolute {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-md);
          padding-bottom: var(--space-xl);
        }
        
        .employee-card {
          cursor: pointer;
        }
        .card-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .emp-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--primary-light), white);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          border: 1px solid var(--border);
        }
        .emp-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .emp-details h3 {
          font-size: 1rem;
          margin-bottom: 2px;
        }
        .role-badge {
          font-size: 0.75rem;
          background: var(--secondary-light);
          color: var(--secondary);
          padding: 2px 8px;
          border-radius: 12px;
          align-self: flex-start;
          margin-bottom: 4px;
        }
        .meta {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .status-dot.active { background: var(--success); box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(16, 185, 129, 0.2); }
        .status-dot.inactive { background: var(--text-light); }
        
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-muted);
          padding: var(--space-xl);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};


export default SearchPage;
