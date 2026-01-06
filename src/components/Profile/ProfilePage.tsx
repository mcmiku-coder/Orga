
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { type Relationship, type Employee } from '../../types';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';

const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employees, relationships, addRelationship, updateRelationship, deleteRelationship } = useData();

    const employee = employees.find(e => e.id === Number(id));

    // Relationship Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRel, setEditingRel] = useState<Relationship | null>(null);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<Employee[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<'lastName' | 'initials' | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Relationship>>({
        type: 'colleague of',
        targetLastName: '',
        targetFirstName: '',
        targetInitials: '',
        targetLevel9: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    if (!employee) {
        return (
            <div className="container p-8 text-center">
                <h2>Employee not found</h2>
                <button onClick={() => navigate('/search')} className="btn btn-primary mt-4">Back to Search</button>
            </div>
        );
    }

    const employeeRelationships = relationships.filter(r => r.ownerInitials === employee.initials);

    const handleOpenModal = (rel?: Relationship) => {
        if (rel) {
            setEditingRel(rel);
            setFormData(rel);
        } else {
            setEditingRel(null);
            setFormData({
                type: 'colleague of',
                targetLastName: '',
                targetFirstName: '',
                targetInitials: '',
                targetLevel9: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: ''
            });
        }
        setIsModalOpen(true);
        setSuggestions([]);
        setShowSuggestions(null);
    };

    const handleFieldChange = (field: keyof Relationship, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'targetLastName' || field === 'targetInitials') {
            if (value.length < 2) {
                setSuggestions([]);
                setShowSuggestions(null);
                return;
            }

            const lowerVal = value.toLowerCase();
            const matches = employees.filter(e => {
                if (field === 'targetLastName') return e.lastName.toLowerCase().includes(lowerVal);
                if (field === 'targetInitials') return e.initials.toLowerCase().includes(lowerVal);
                return false;
            }).slice(0, 5); // Limit to 5 suggestions

            setSuggestions(matches);
            setShowSuggestions(field === 'targetLastName' ? 'lastName' : 'initials');
        }
    };

    const selectSuggestion = (emp: Employee) => {
        setFormData(prev => ({
            ...prev,
            targetLastName: emp.lastName,
            targetFirstName: emp.firstName,
            targetInitials: emp.initials,
            targetLevel9: emp.level9
        }));
        setSuggestions([]);
        setShowSuggestions(null);
    };

    const handleSave = () => {
        if (!formData.targetLastName || !formData.targetInitials || !formData.targetFirstName) {
            alert('Please fill in required fields');
            return;
        }

        const relData = {
            ...formData,
            ownerInitials: employee.initials,
            id: editingRel ? editingRel.id : crypto.randomUUID(),
        } as Relationship;

        if (editingRel) {
            updateRelationship(relData);
        } else {
            addRelationship(relData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this relationship?')) {
            deleteRelationship(id);
        }
    };

    return (
        <div className="profile-page container fade-in">
            <button onClick={() => navigate('/search')} className="back-link">
                <ArrowLeft size={16} /> Back to Search
            </button>

            <div className="profile-header glass-panel">
                <div className="header-content">
                    <div className="avatar-large">{employee.initials}</div>
                    <div>
                        <h1>{employee.lastName} {employee.firstName}</h1>
                        <div className="badges">
                            <span className="badge role">{employee.role}</span>
                            <span className={`badge status ${employee.status.toLowerCase()}`}>{employee.status}</span>
                        </div>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">ID</span>
                        <span className="value">{employee.id}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Level 9 Unit</span>
                        <span className="value flex-center"><MapPin size={16} /> {employee.level9}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Initials</span>
                        <span className="value flex-center"><User size={16} /> {employee.initials}</span>
                    </div>
                </div>
            </div>

            <div className="relationships-section">
                <div className="section-header">
                    <h2>Relationships</h2>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add Relationship
                    </button>
                </div>

                <Card className="table-card">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Initials</th>
                                    <th>Level 9</th>
                                    <th>Dates</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeRelationships.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted p-4">No relationships recorded</td>
                                    </tr>
                                ) : (
                                    employeeRelationships.map(rel => (
                                        <tr key={rel.id}>
                                            <td><span className="badge-outline">{rel.type}</span></td>
                                            <td className="font-medium">{rel.targetLastName} {rel.targetFirstName}</td>
                                            <td>{rel.targetInitials}</td>
                                            <td>{rel.targetLevel9}</td>
                                            <td className="text-sm text-muted">
                                                {rel.startDate} {rel.endDate ? `— ${rel.endDate}` : '(Current)'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="action-buttons">
                                                    <button onClick={() => handleOpenModal(rel)} className="icon-btn-sm edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(rel.id)} className="icon-btn-sm delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRel ? "Edit Relationship" : "Add Relationship"}
            >
                <div className="form-grid">
                    <Select
                        label="Relationship Type"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                        options={[
                            { label: 'works for', value: 'works for' },
                            { label: 'boss of', value: 'boss of' },
                            { label: 'colleague of', value: 'colleague of' },
                        ]}
                    />

                    <div className="divider">Target Person Details</div>

                    <div className="row-2 relative-container">
                        <div className="input-group">
                            <Input
                                label="Last Name"
                                value={formData.targetLastName}
                                onChange={e => handleFieldChange('targetLastName', e.target.value)}
                                autoComplete="off"
                            />
                            {showSuggestions === 'lastName' && suggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map(emp => (
                                        <li key={emp.id} onClick={() => selectSuggestion(emp)}>
                                            <strong>{emp.lastName}</strong> {emp.firstName} ({emp.initials})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Input
                            label="First Name"
                            value={formData.targetFirstName}
                            onChange={e => handleFieldChange('targetFirstName', e.target.value)}
                        />
                    </div>

                    <div className="row-2 relative-container">
                        <div className="input-group">
                            <Input
                                label="Initials"
                                value={formData.targetInitials}
                                onChange={e => handleFieldChange('targetInitials', e.target.value)}
                                autoComplete="off"
                            />
                            {showSuggestions === 'initials' && suggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map(emp => (
                                        <li key={emp.id} onClick={() => selectSuggestion(emp)}>
                                            {emp.initials} - {emp.lastName}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Input
                            label="Level 9"
                            value={formData.targetLevel9}
                            onChange={e => handleFieldChange('targetLevel9', e.target.value)}
                        />
                    </div>

                    <div className="row-2">
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <Input
                            label="End Date (Optional)"
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={18} /> Save Relationship
                        </button>
                    </div>
                </div>
            </Modal>

            <style>{`
        .profile-page {
          padding-top: var(--space-lg);
          padding-bottom: var(--space-xl);
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-muted);
          background: none;
          border: none;
          font-size: 0.9rem;
          margin-bottom: var(--space-md);
          cursor: pointer;
        }
        .back-link:hover { color: var(--primary); }

        .profile-header {
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          border-radius: var(--radius-lg);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          margin-bottom: var(--space-xl);
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-xl);
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          box-shadow: var(--shadow);
        }

        .badges {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-xs);
        }
        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .badge.role { background: var(--secondary); color: white; }
        .badge.active { background: #dcfce7; color: #166534; }
        .badge.inactive { background: #f1f5f9; color: #64748b; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-lg);
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-item .label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .info-item .value { font-weight: 600; font-size: 1.1rem; }
        .flex-center { display: flex; align-items: center; gap: 6px; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: var(--shadow); }
        .btn-secondary { background: var(--secondary-light); color: var(--secondary); }
        .btn-secondary:hover { background: #e2e8f0; }

        .table-responsive {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        th {
          text-align: left;
          padding: var(--space-md);
          color: var(--text-muted);
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-light);
        }
        tr:last-child td { border-bottom: none; }
        
        .badge-outline {
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          background: var(--surface-alt);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .icon-btn-sm {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .edit { background: var(--secondary-light); color: var(--secondary); }
        .edit:hover { background: #cbd5e1; }
        .delete { background: #fee2e2; color: #ef4444; }
        .delete:hover { background: #fecaca; }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }
        .divider {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-light);
          margin-top: var(--space-sm);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .text-center { text-align: center; }
        .p-4 { padding: var(--space-md); }
        .text-sm { font-size: 0.85rem; }

        .relative-container { position: relative; overflow: visible; }
        .input-group { position: relative; }
        
        .suggestions-list {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 50;
            max-height: 200px;
            overflow-y: auto;
            list-style: none;
            margin-top: 4px;
        }
        .suggestions-list li {
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-light);
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text-main);
        }
        .suggestions-list li:last-child { border-bottom: none; }
        .suggestions-list li:hover {
            background: var(--surface-alt);
            color: var(--primary);
        }
      `}</style>
        </div>
    );
};

export default ProfilePage;
