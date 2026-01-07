import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Input from '../UI/Input';

const SearchPage: React.FC = () => {
  const { employees, hierarchy, getHierarchyPath, updateEmployee } = useData();
  const [query, setQuery] = useState('');
  const [levelQuery, setLevelQuery] = useState('');
  const navigate = useNavigate();

  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);

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
      const matchedLevels = hierarchy.filter(h =>
        h.name.toLowerCase().includes(lowerL) ||
        h.id.toLowerCase().includes(lowerL)
      );
      const matchedLevelIds = new Set(matchedLevels.map(h => h.id));
      const validL9s = new Set<string>();
      const allL9s = hierarchy.filter(h => h.level === 9);

      for (const l9 of allL9s) {
        if (matchedLevelIds.has(l9.id)) {
          validL9s.add(l9.id);
          continue;
        }
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

  const handleUpdate = (id: number | string, field: keyof typeof employees[0], value: string) => {
    updateEmployee(String(id), { [field]: value });
    setEditingId(null);
    setEditField(null);
  };

  const startEdit = (e: React.MouseEvent, id: number | string, field: string) => {
    e.stopPropagation(); // Prevent row click navigation
    setEditingId(String(id));
    setEditField(field);
  };

  const renderEditableCell = (emp: typeof employees[0], field: 'role' | 'level9' | 'status') => {
    const isEditing = editingId === String(emp.id) && editField === field;

    if (isEditing) {
      if (field === 'role') {
        return (
          <select
            className="inline-edit-input"
            autoFocus
            defaultValue={emp.role}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleUpdate(emp.id, field, e.target.value)}
            onBlur={() => { setEditingId(null); setEditField(null); }}
          >
            <option value="Region Head">Region Head</option>
            <option value="Team Head">Team Head</option>
            <option value="Rel">Rel</option>
            <option value="Assistant">Assistant</option>
          </select>
        );
      }
      if (field === 'status') {
        return (
          <select
            className="inline-edit-input"
            autoFocus
            defaultValue={emp.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleUpdate(emp.id, field, e.target.value)}
            onBlur={() => { setEditingId(null); setEditField(null); }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        );
      }
      // Level 9 Autocomplete
      return (
        <InlineLevel9Select
          initialValue={emp.level9}
          onSave={(newValue) => handleUpdate(emp.id, field, newValue)}
          onCancel={() => { setEditingId(null); setEditField(null); }}
          hierarchy={hierarchy}
        />
      );
    }

    // Render Read-Only View
    if (field === 'role') {
      return (
        <span
          className="role-badge"
          onClick={(e) => startEdit(e, emp.id, field)}
        >
          {emp.role}
        </span>
      );
    }
    if (field === 'status') {
      return (
        <div
          className={`status-dot ${emp.status.toLowerCase()}`}
          onClick={(e) => startEdit(e, emp.id, field)}
        ></div>
      );
    }
    // Level 9
    return (
      <span onClick={(e) => startEdit(e, emp.id, field)} className="editable-text">
        {emp.level9}
      </span>
    );
  };

  return (
    <div className="search-page container">
      <div className="search-header glass-panel">
        <h1>Search</h1>

        <div className="search-grid">
          <div className="search-group">
            <label>Employee Search</label>
            <div className="input-wrapper">
              <Input
                placeholder="Type name or initials..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <SearchIcon className="search-icon-absolute" size={20} />
            </div>
          </div>

          <div className="search-group">
            <label>Level Search</label>
            <div className="input-wrapper">
              <Input
                placeholder="Filter by Level..."
                value={levelQuery}
                onChange={(e) => setLevelQuery(e.target.value)}
                className="search-input"
              />
            </div>
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
              <div className={`emp-avatar role-${emp.role.toLowerCase().replace(' ', '-')}`}>{emp.initials}</div>
            </div>
            <div className="col-name">
              <strong>{emp.lastName}</strong> {emp.firstName}
            </div>
            <div className="col-role">
              {renderEditableCell(emp, 'role')}
            </div>
            <div className="col-level">
              {renderEditableCell(emp, 'level9')}
            </div>
            <div className="col-status">
              {renderEditableCell(emp, 'status')}
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
        
        .search-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-xl);
            max-width: 900px;
            margin: var(--space-lg) auto 0;
            text-align: left;
        }

        .search-group label {
            display: block;
            margin-bottom: var(--space-xs);
            font-weight: 500;
            color: var(--text-light);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-wrapper {
            position: relative;
        }

        .search-input {
          padding-left: 1rem; 
          height: 3.5rem;
          font-size: 1.1rem;
        }
        /* First input needs padding for icon */
        .search-group:first-child .search-input {
             padding-left: 3rem;
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
        }
        .emp-avatar.role-region-head {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .emp-avatar.role-team-head {
          background: linear-gradient(135deg, #f97316, #ea580c);
        }
        .emp-avatar.role-rel {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        .emp-avatar.role-assistant {
          background: linear-gradient(135deg, #10b981, #059669);
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
          font-size: 0.85rem;
          background: var(--surface-alt);
          color: var(--text-light);
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 12px;
          cursor: pointer;
        }
        .role-badge:hover {
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .status-dot:hover {
            transform: scale(1.2);
        }
        .status-dot.active { background: var(--success); box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
        .status-dot.inactive { background: var(--text-light); }

        .editable-text {
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 4px;
        }
        .editable-text:hover {
            background: var(--surface-alt);
            color: var(--primary);
        }

        .inline-edit-input {
            width: 100%;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--primary);
            background: var(--surface-alt);
            color: var(--text-main);
            font-size: 0.9rem;
        }
        
        .no-results {
          text-align: center;
          color: var(--text-muted);
          padding: var(--space-xl);
          font-style: italic;
          background: var(--surface);
          border-radius: var(--radius);
        }

        .inline-autocomplete-wrapper {
            position: relative;
            width: 100%;
        }
        .inline-suggestions-list {
            position: absolute;
            top: 100%;
            left: 0;
            width: 250px; /* Wider than input to show details */
            max-height: 200px;
            overflow-y: auto;
            background: var(--surface);
            border: 1px solid var(--primary);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 100;
            list-style: none;
            padding: 0;
            margin: 4px 0 0 0;
        }
        .inline-suggestions-list li {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid var(--border-light);
            font-size: 0.9rem;
            color: var(--text-main);
        }
        .inline-suggestions-list li:last-child { border-bottom: none; }
        .inline-suggestions-list li:hover {
            background: var(--primary-light);
            color: white;
        }
      `}</style>
    </div>
  );
};



const InlineLevel9Select: React.FC<{
  initialValue: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  hierarchy: any[];
}> = ({ initialValue, onSave, onCancel, hierarchy }) => {
  const [value, setValue] = useState(initialValue);

  // Filter only Level 9 items
  const l9Options = useMemo(() => hierarchy.filter(h => h.level === 9), [hierarchy]);

  const suggestions = useMemo(() => {
    if (!value) return l9Options;
    const lower = value.toLowerCase();
    return l9Options.filter(h =>
      h.id.toLowerCase().includes(lower) ||
      h.name.toLowerCase().includes(lower)
    );
  }, [value, l9Options]);

  return (
    <div className="inline-autocomplete-wrapper">
      <input
        className="inline-edit-input"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // If exact match exists or just save as is? User said "selection from L9".
            // Let's try to find an exact match or first suggestion
            if (suggestions.length > 0) {
              onSave(suggestions[0].id);
            } else {
              // Fallback or prevent save? Let's prevent save if invalid?
              // User said "must be a selection". 
              // If exact match typed, use it.
              const exact = l9Options.find(opt => opt.id === value || opt.name === value);
              if (exact) onSave(exact.id);
            }
          }
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={() => {
          // Check if valid
          const exact = l9Options.find(opt => opt.id === value);
          if (exact) onSave(exact.id);
          else onCancel(); // Revert if invalid
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {suggestions.length > 0 && (
        <ul className="inline-suggestions-list">
          {suggestions.map(s => (
            <li
              key={s.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                onSave(s.id);
              }}
            >
              {s.id} <span style={{ opacity: 0.7, fontSize: '0.8em' }}>({s.name})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;
