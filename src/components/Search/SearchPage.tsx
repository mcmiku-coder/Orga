import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
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

      <div className="results-list">
        <div className="list-header item-row">
          <div className="col-avatar"></div>
          <div className="col-name">Name</div>
          <div className="col-role">Role</div>
          <div className="col-level">Level 9</div>
          <div className="col-status">Status</div>
          <div className="col-arrow"></div>
        </div>

        {filteredEmployees.map(emp => (
          <div
            key={emp.id}
            className="item-row hoverable"
            onClick={() => navigate(`/employee/${emp.id}`)}
          >
            <div className="col-avatar">
              <div className="emp-avatar">{emp.initials}</div>
            </div>
            <div className="col-name">
              <strong>{emp.lastName}</strong> {emp.firstName}
            </div>
            <div className="col-role">
              <span className="role-badge">{emp.role}</span>
            </div>
            <div className="col-level">{emp.level9}</div>
            <div className="col-status">
              <div className={`status-dot ${emp.status.toLowerCase()}`}></div>
            </div>
            <div className="col-arrow">→</div>
          </div>
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
          padding-bottom: var(--space-xl);
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
        
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-row {
          display: grid;
          grid-template-columns: 60px 2fr 1.5fr 1.5fr 80px 40px;
          align-items: center;
          padding: 12px var(--space-md);
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          color: var(--text-main);
          transition: background 0.2s;
        }
        
        .list-header {
          background: transparent;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 2px solid var(--border);
        }

        .item-row.hoverable { cursor: pointer; }
        .item-row.hoverable:hover {
          background: var(--surface-alt);
        }
        
        .col-avatar { display: flex; justify-content: center; }
        .col-name { font-size: 1rem; }
        .col-role { display: flex; }
        .col-status { display: flex; justify-content: center; }
        .col-arrow { color: var(--text-light); opacity: 0; transition: opacity 0.2s; }
        .item-row:hover .col-arrow { opacity: 1; }

        .emp-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
        }
        
        .role-badge {
          font-size: 0.75rem;
          background: var(--surface-alt);
          color: var(--text-light);
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .item-row:hover .role-badge {
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.active { background: var(--success); box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
        .status-dot.inactive { background: var(--text-light); }
        
        .no-results {
          text-align: center;
          color: var(--text-muted);
          padding: var(--space-xl);
          font-style: italic;
          background: var(--surface);
          border-radius: var(--radius);
        }
      `}</style>
    </div>
  );
};


export default SearchPage;
