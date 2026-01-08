
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { type Relationship, type Employee } from '../../types';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import Input from '../UI/Input';


const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employees, relationships, addRelationship, updateRelationship, deleteRelationship, getHierarchyPath } = useData();

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

    const employeeRelationships = relationships.filter(r =>
        r.ownerInitials === employee.initials || r.targetInitials === employee.initials
    );

    // Get Level 6 for an employee
    const getLevel6 = (level9Id: string) => {
        const path = getHierarchyPath(level9Id);
        const l6 = path.find(h => h.level === 6);
        return l6 ? l6.name : '-';
    };

    const handleOpenModal = (rel?: Relationship) => {
        if (rel) {
            setEditingRel(rel);
            setFormData(rel);
        } else {
            setEditingRel(null);
            setFormData({
                type: 'works for',
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
                    <div className={`profile-avatar role-${employee.role.toLowerCase().replace(' ', '-')}`}>{employee.initials}</div>
                    <div className="header-main">
                        <h1>{employee.lastName} {employee.firstName}</h1>
                        <div className="badges-container">
                            <div className="badge-row">
                                <span className="badge role">{employee.role}</span>
                                <span className={`badge status ${employee.status.toLowerCase()}`}>{employee.status}</span>
                                <span className="badge-outline-sm">ID: {employee.id}</span>
                            </div>
                            <div className="badge-row secondary">
                                <span className="info-tag"><MapPin size={14} /> {getLevel6(employee.level9)}</span>
                                <span className="info-tag"><MapPin size={14} /> {employee.level9}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RelationshipGraph employee={employee} relationships={relationships} employees={employees} />

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
                                    <th className="text-center">Employee</th>
                                    <th>Last Name</th>
                                    <th>First Name</th>
                                    <th>Level 9</th>
                                    <th className="text-center">Type</th>
                                    <th className="text-center">Manager</th>
                                    <th>Dates</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeRelationships.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted p-4">No relationships recorded</td>
                                    </tr>
                                ) : (
                                    employeeRelationships.map(rel => {
                                        // Determine who is Subordinate (Employee) and who is Boss (Manager)
                                        // Logic: 'works for' means Target works for Owner.
                                        // So Owner = Boss, Target = Subordinate.

                                        // Legacy 'boss of': Owner is boss of Target. Same structure: Owner=Boss, Target=Sub.

                                        const bossInitials = rel.ownerInitials; // Owner is Boss
                                        const subInitials = rel.targetInitials; // Target is Subordinate

                                        // Get actual Employee objects to display details
                                        const bossEmp = employees.find(e => e.initials === bossInitials);
                                        const subEmp = employees.find(e => e.initials === subInitials);

                                        // Safe fallbacks if person not found (shouldn't happen)
                                        const subLastName = rel.targetLastName;
                                        const subFirstName = rel.targetFirstName;
                                        const subLevel9 = rel.targetLevel9;

                                        const subRoleClass = subEmp ? `role-${subEmp.role.toLowerCase().replace(' ', '-')}` : '';
                                        const bossRoleClass = bossEmp ? `role-${bossEmp.role.toLowerCase().replace(' ', '-')}` : '';

                                        return (
                                            <tr key={rel.id}>
                                                {/* Employee (Subordinate) Column */}
                                                <td className="text-center">
                                                    <div className="flex-center" style={{ justifyContent: 'center' }}>
                                                        <div className={`emp-avatar-sm ${subRoleClass}`}>
                                                            {subInitials}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="font-medium">{subLastName}</td>
                                                <td className="font-medium">{subFirstName}</td>
                                                <td>{subLevel9}</td>

                                                {/* Type Column */}
                                                <td className="text-center"><span className="badge-outline">works for</span></td>

                                                {/* Manager (Boss) Column */}
                                                <td className="text-center">
                                                    <div className="flex-center" style={{ justifyContent: 'center' }}>
                                                        <div className={`emp-avatar-sm ${bossRoleClass}`}>
                                                            {bossInitials}
                                                        </div>
                                                    </div>
                                                </td>

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
                                        );
                                    })
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
                    {/* <Select
                        label="Relationship Type"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                        options={[
                            { label: 'works for', value: 'works for' },
                        ]}
                        disabled={true}
                    /> */}
                    <div className="info-block" style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--surface-alt)', borderRadius: '4px' }}>
                        <strong>Relationship:</strong> Target Person works for {employee.initials}
                    </div>

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
          padding: var(--space-lg) var(--space-xl);
          margin-bottom: var(--space-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          padding-bottom: var(--space-lg);
        }
        .header-main {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .badges-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .badge-row {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            flex-wrap: wrap;
        }
        .badge-outline-sm {
            padding: 2px 8px;
            border: 1px solid var(--border);
            border-radius: 4px;
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-tag {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.85rem;
            color: var(--text-muted);
            background: rgba(255,255,255,0.05);
            padding: 2px 10px;
            border-radius: 100px;
        }

                .profile-avatar {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 700;
                    box-shadow: var(--shadow-lg);
                }
                .profile-avatar.role-region-head {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }
                .profile-avatar.role-team-head {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                }
                .profile-avatar.role-rel {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }
                .profile-avatar.role-assistant {
                    background: linear-gradient(135deg, #10b981, #059669);
        }

        .badges {
          display: flex;
          gap: var(--space-sm);
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

        .emp-avatar-sm {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 700;
            color: white;
            border: 2px solid rgba(255,255,255,0.2);
            box-shadow: var(--shadow-sm);
        }
        .emp-avatar-sm.role-region-head { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .emp-avatar-sm.role-team-head { background: linear-gradient(135deg, #f97316, #ea580c); }
        .emp-avatar-sm.role-rel { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .emp-avatar-sm.role-assistant { background: linear-gradient(135deg, #10b981, #059669); }

        .graph-section {
          margin-top: var(--space-md);
          padding: var(--space-md) var(--space-xl);
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .graph-section h2 { margin-bottom: var(--space-sm); align-self: flex-start; }
        .relationship-canvas {
          background: var(--surface-alt);
          border-radius: var(--radius);
          box-shadow: inset var(--shadow-sm);
          max-width: 100%;
        }
      `}</style>
        </div>
    );
};

interface GraphProps {
    employee: Employee;
    relationships: Relationship[];
    employees: Employee[];
}

const RelationshipGraph: React.FC<GraphProps> = ({ employee, relationships, employees }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const graphData = useMemo(() => {
        // Fetch all relationships involving the employee
        const relatedRels = relationships.filter(r =>
            r.ownerInitials === employee.initials || r.targetInitials === employee.initials
        );

        const nodes = [
            {
                id: employee.initials,
                name: `${employee.lastName} ${employee.initials}`,
                role: employee.role,
                isCenter: true
            }
        ];

        const links: { source: string; target: string; type: string }[] = [];

        relatedRels.forEach(rel => {
            // Identify the "Other" person in the relationship to add their node
            const isOwner = rel.ownerInitials === employee.initials;
            const otherInitials = isOwner ? rel.targetInitials : rel.ownerInitials;

            // Get Other Person details safely
            // For target, we have fields. For owner, we must find in employees list.
            let otherName = '';
            let otherRole: any = 'Rel'; // Default

            if (isOwner) {
                // I am Owner. Other is Target.
                otherName = `${rel.targetLastName} ${rel.targetInitials}`;
                const targetEmp = employees.find(e => e.initials === rel.targetInitials);
                if (targetEmp) otherRole = targetEmp.role;
            } else {
                // I am Target. Other is Owner.
                const ownerEmp = employees.find(e => e.initials === rel.ownerInitials);
                if (ownerEmp) {
                    otherName = `${ownerEmp.lastName} ${ownerEmp.initials}`;
                    otherRole = ownerEmp.role;
                } else {
                    otherName = otherInitials; // Fallback
                }
            }

            nodes.push({
                id: otherInitials,
                name: otherName,
                role: otherRole,
                isCenter: false
            });

            // Determine Arrow Direction based on Hierarchical Role
            // 'works for' means Target works for Owner.
            // Boss = Owner. Sub = Target.
            // Arrow: Boss -> Sub (Hierarchy Down).

            if (rel.type === 'works for' || rel.type === 'boss of') {
                // Boss -> Sub
                links.push({ source: rel.ownerInitials, target: rel.targetInitials, type: 'arrow' });
            } else {
                // Colleague/Other
                links.push({ source: rel.ownerInitials, target: rel.targetInitials, type: 'line' });
            }
        });

        // Deduplicate nodes
        const uniqueNodes = Array.from(new Map(nodes.map(n => [n.id, n])).values());

        return { nodes: uniqueNodes, links };
    }, [employee, relationships, employees]);

    useEffect(() => {
        if (!canvasRef.current || graphData.nodes.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const startX = 100;
        const centerY = height / 2;
        const radius = 35;
        const columnWidth = 220;

        const roleColors: Record<string, string[]> = {
            'Region Head': ['#ef4444', '#dc2626'],
            'Team Head': ['#f97316', '#ea580c'],
            'Rel': ['#3b82f6', '#2563eb'],
            'Assistant': ['#10b981', '#059669']
        };

        const nodePositions = new Map<string, { x: number; y: number }>();

        // Group nodes by their relative position
        // Managers: Nodes that are Source of an arrow pointing TO current employee (Boss -> Me)
        // Subordinates: Nodes that are Target of an arrow originating FROM current employee (Me -> Sub)

        const managers = graphData.links.filter(l => l.target === employee.initials && l.type === 'arrow').map(l => l.source);
        const subordinates = graphData.links.filter(l => l.source === employee.initials && l.type === 'arrow').map(l => l.target);

        // Colleagues: No arrow or line
        const colleagues = graphData.nodes.filter(n => !n.isCenter && !managers.includes(n.id) && !subordinates.includes(n.id)).map(n => n.id);

        // Determine horizontal positions
        const managerX = startX;
        const employeeX = managers.length > 0 ? startX + columnWidth : startX;
        const rightSideX = employeeX + columnWidth;

        // Position central node
        nodePositions.set(employee.initials, { x: employeeX, y: centerY });

        // Position Managers on the LEFT
        managers.forEach((id, i) => {
            const total = managers.length;
            const y = centerY + (i - (total - 1) / 2) * 110;
            nodePositions.set(id, { x: managerX, y });
        });

        // Position Subordinates/Colleagues on the RIGHT
        const rightSideNodes = [...subordinates, ...colleagues];
        rightSideNodes.forEach((id, i) => {
            const total = rightSideNodes.length;
            const y = centerY + (i - (total - 1) / 2) * 110;
            nodePositions.set(id, { x: rightSideX, y });
        });

        // Draw links
        ctx.lineWidth = 2;
        graphData.links.forEach(link => {
            const start = nodePositions.get(link.source);
            const end = nodePositions.get(link.target);
            if (!start || !end) return;

            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const startX = start.x + radius * Math.cos(angle);
            const startY = start.y + radius * Math.sin(angle);
            const endX = end.x - radius * Math.cos(angle);
            const endY = end.y - radius * Math.sin(angle);

            ctx.beginPath();
            ctx.strokeStyle = '#94a3b8';
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            if (link.type === 'arrow') {
                // Arrow head
                ctx.beginPath();
                ctx.fillStyle = '#94a3b8';
                const headlen = 12;
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
            }
        });

        // Draw nodes
        graphData.nodes.forEach(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return;

            const colors = roleColors[node.role] || ['#64748b', '#475569'];

            // Outer glow for center
            if (node.isCenter) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 6, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }

            // Circle
            const gradient = ctx.createLinearGradient(pos.x - radius, pos.y - radius, pos.x + radius, pos.y + radius);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Initials
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, pos.x, pos.y);

            // Name below
            ctx.fillStyle = '#f1f5f9'; // Bright text for dark mode
            ctx.font = 'bold 12px Inter';
            ctx.fillText(node.name, pos.x, pos.y + radius + 18);
        });

    }, [graphData, employee.initials]);

    return (
        <div className="graph-section glass-panel">
            <h2>Relationship Network</h2>
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="relationship-canvas"
            />
        </div>
    );
};

export default ProfilePage;
