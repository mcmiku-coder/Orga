import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, Plus } from 'lucide-react';
import type { HierarchyLevel } from '../../types';

type ReferenceType = 'Employee' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9';

const ReferencesPage: React.FC = () => {
    const { hierarchy, employees, addHierarchyLevel, deleteHierarchyLevel, updateHierarchyParent } = useData();
    const [selectedType, setSelectedType] = useState<ReferenceType>('L9');
    const [newItemName, setNewItemName] = useState('');
    const [newItemParent, setNewItemParent] = useState<string>('');

    // Get level number from type
    const getLevelNumber = (type: ReferenceType): number | null => {
        if (type === 'Employee') return null;
        return parseInt(type.substring(1));
    };

    // Get parent level options
    const getParentOptions = (type: ReferenceType): HierarchyLevel[] => {
        if (type === 'Employee' || type === 'L3') return [];
        const levelNum = getLevelNumber(type);
        if (levelNum === null) return hierarchy.filter(h => h.level === 9);
        return hierarchy.filter(h => h.level === levelNum - 1);
    };

    // Get current data based on selected type
    const currentData = useMemo(() => {
        if (selectedType === 'Employee') {
            return employees.map(emp => ({
                id: String(emp.id),
                name: `${emp.lastName} ${emp.firstName}`,
                parentId: emp.level9,
                type: 'Employee' as const
            }));
        }
        const levelNum = getLevelNumber(selectedType);
        return hierarchy
            .filter(h => h.level === levelNum)
            .map(h => ({
                id: h.id,
                name: h.name,
                parentId: h.parentId,
                type: 'Hierarchy' as const
            }));
    }, [selectedType, hierarchy, employees]);

    const parentOptions = getParentOptions(selectedType);

    const handleAddNew = () => {
        if (!newItemName.trim()) return;

        if (selectedType === 'Employee') {
            // For employees, we'd need to add via addEmployee function
            // Skipping for now as it requires more fields
            alert('Employee creation requires more fields. Use the profile page.');
            return;
        }

        const levelNum = getLevelNumber(selectedType);
        if (levelNum === null) return;

        const newId = `${selectedType}-${newItemName.replace(/\s+/g, '')}`;
        const newLevel: HierarchyLevel = {
            id: newId,
            name: newItemName,
            level: levelNum,
            parentId: newItemParent || undefined
        };

        addHierarchyLevel(newLevel);
        setNewItemName('');
        setNewItemParent('');
    };

    const handleDelete = (id: string) => {
        if (selectedType === 'Employee') {
            alert('Employee deletion should be done from the profile page.');
            return;
        }
        if (confirm(`Delete this ${selectedType} level?`)) {
            deleteHierarchyLevel(id);
        }
    };

    const handleParentChange = (id: string, newParentId: string) => {
        if (selectedType === 'Employee') {
            // Would need updateEmployee
            return;
        }
        updateHierarchyParent(id, newParentId || undefined);
    };

    return (
        <div className="references-page container">
            <div className="page-header glass-panel">
                <h1>References Management</h1>
                <p className="subtitle">Manage hierarchy levels and organizational structure</p>
            </div>

            <div className="selector-panel glass-panel">
                <label htmlFor="type-selector">Select Reference Type:</label>
                <select
                    id="type-selector"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as ReferenceType)}
                    className="type-selector"
                >
                    <option value="Employee">Employee</option>
                    <option value="L3">Level 3 (Global)</option>
                    <option value="L4">Level 4</option>
                    <option value="L5">Level 5</option>
                    <option value="L6">Level 6</option>
                    <option value="L7">Level 7</option>
                    <option value="L8">Level 8</option>
                    <option value="L9">Level 9 (Unit)</option>
                </select>
            </div>

            <div className="data-table-panel glass-panel">
                <table className="references-table">
                    <thead>
                        <tr>
                            <th>{selectedType} Name</th>
                            <th>Parent Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>
                                    {parentOptions.length > 0 ? (
                                        <select
                                            value={item.parentId || ''}
                                            onChange={(e) => handleParentChange(item.id, e.target.value)}
                                            className="parent-selector"
                                        >
                                            <option value="">-- None --</option>
                                            {parentOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="no-parent">Root Level</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedType !== 'Employee' && (
                    <div className="add-new-section">
                        <input
                            type="text"
                            placeholder={`New ${selectedType} name...`}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="new-item-input"
                        />
                        {parentOptions.length > 0 && (
                            <select
                                value={newItemParent}
                                onChange={(e) => setNewItemParent(e.target.value)}
                                className="new-item-parent"
                            >
                                <option value="">-- Select Parent --</option>
                                {parentOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            className="add-btn"
                            onClick={handleAddNew}
                            disabled={!newItemName.trim()}
                        >
                            <Plus size={20} /> Add New
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .references-page {
                    padding: var(--space-xl);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }
                
                .page-header {
                    padding: var(--space-xl);
                    border-radius: var(--radius-lg);
                }
                
                .subtitle {
                    color: var(--text-muted);
                    margin-top: var(--space-xs);
                }

                .selector-panel {
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .selector-panel label {
                    font-weight: 600;
                    color: var(--text-main);
                }

                .type-selector {
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-main);
                    font-size: 1rem;
                    min-width: 250px;
                }

                .data-table-panel {
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                }

                .references-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .references-table th {
                    text-align: left;
                    padding: var(--space-md);
                    border-bottom: 2px solid var(--border);
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }

                .references-table td {
                    padding: var(--space-md);
                    border-bottom: 1px solid var(--border-light);
                    color: var(--text-main);
                }

                .parent-selector {
                    padding: 6px 10px;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    background: var(--surface-alt);
                    color: var(--text-main);
                    width: 100%;
                    max-width: 300px;
                }

                .no-parent {
                    color: var(--text-light);
                    font-style: italic;
                }

                .delete-btn {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    padding: 6px 10px;
                    border-radius: var(--radius);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                }

                .delete-btn:hover {
                    background: #ef4444;
                    border-color: #ef4444;
                    color: white;
                }

                .add-new-section {
                    margin-top: var(--space-lg);
                    padding-top: var(--space-lg);
                    border-top: 2px solid var(--border);
                    display: flex;
                    gap: var(--space-md);
                    align-items: center;
                }

                .new-item-input, .new-item-parent {
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-main);
                    font-size: 1rem;
                }

                .new-item-input {
                    flex: 1;
                }

                .new-item-parent {
                    min-width: 200px;
                }

                .add-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: var(--space-sm) var(--space-lg);
                    border-radius: var(--radius);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .add-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }

                .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ReferencesPage;
