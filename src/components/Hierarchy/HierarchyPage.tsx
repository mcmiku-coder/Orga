
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ChevronRight } from 'lucide-react';

const HierarchyPage: React.FC = () => {
    const { hierarchy, updateHierarchyLevel, getHierarchyPath } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Pivot Data: Get all L9 nodes and build their row data (L9 -> L8 ... -> L3)
    const tableData = useMemo(() => {
        const l9Nodes = hierarchy.filter(h => h.level === 9);

        return l9Nodes.map(l9 => {
            const path = getHierarchyPath(l9.id);
            // Path is usually [L3, L4, ..., L9] or [L9, ..., L3] depending on getHierarchyPath impl.
            // getHierarchyPath returns path.reverse() at end, which means [L3, L4, ... L9]?
            // Let's verify: 
            // - traversal goes child -> parent (L9 -> L8 -> ... -> L3).
            // - path.push(current) (L9 first, then L8, etc)
            // - return path.reverse() -> So it returns [L3, L4, ..., L9].

            // Map levels to columns
            const row: Record<string, any> = { l9Node: l9 };
            path.forEach(node => {
                row[`L${node.level}`] = node;
            });
            return row;
        });
    }, [hierarchy, getHierarchyPath]);

    const handleEditStart = (id: string) => {
        setEditingId(id);
    };

    const handleEditSave = (id: string, newName: string) => {
        updateHierarchyLevel(id, newName);
        setEditingId(null);
    };

    const renderCell = (node: any) => {
        if (!node) return <span className="empty-cell">-</span>;

        if (editingId === node.id) {
            return (
                <input
                    className="inline-edit-input"
                    autoFocus
                    defaultValue={node.name}
                    onBlur={(e) => handleEditSave(node.id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(node.id, e.currentTarget.value);
                        if (e.key === 'Escape') setEditingId(null);
                    }}
                />
            );
        }

        return (
            <span
                className="editable-cell"
                onClick={() => handleEditStart(node.id)}
                title="Click to edit"
            >
                {node.name}
            </span>
        );
    };

    return (
        <div className="hierarchy-page container">
            <div className="page-header glass-panel">
                <h1>Organization Hierarchy</h1>
                <p className="subtitle">View and edit the organization structure from Level 9 up to Level 3.</p>
            </div>

            <div className="table-container glass-panel">
                {tableData.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hierarchy data found or loading... <br />
                        (Try refreshing or checking console if this persists)
                    </div>
                ) : (
                    <table className="hierarchy-table">
                        <thead>
                            <tr>
                                <th>Level 9 (Unit)</th>
                                <th>Level 8</th>
                                <th>Level 7</th>
                                <th>Level 6</th>
                                <th>Level 5</th>
                                <th>Level 4</th>
                                <th>Level 3 (Global)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map(row => (
                                <tr key={row.l9Node.id}>
                                    <td className="highlight-col">{renderCell(row.L9)}</td>
                                    <td>{renderCell(row.L8)}</td>
                                    <td>{renderCell(row.L7)}</td>
                                    <td>{renderCell(row.L6)}</td>
                                    <td>{renderCell(row.L5)}</td>
                                    <td>{renderCell(row.L4)}</td>
                                    <td>{renderCell(row.L3)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .hierarchy-page {
                    padding: var(--space-xl);
                }
                .page-header {
                    padding: var(--space-xl);
                    margin-bottom: var(--space-xl);
                    border-radius: var(--radius-lg);
                }
                .subtitle { color: var(--text-muted); }
                
                .table-container {
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    overflow-x: auto;
                }

                .hierarchy-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                
                .hierarchy-table th {
                    text-align: left;
                    padding: var(--space-md);
                    border-bottom: 2px solid var(--border);
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }

                .hierarchy-table td {
                    padding: var(--space-md);
                    border-bottom: 1px solid var(--border-light);
                    color: var(--text-main);
                }
                
                .highlight-col {
                    background: rgba(var(--primary-rgb), 0.05); /* Slight highlight for L9 */
                    font-weight: 500;
                    color: var(--primary);
                }

                .editable-cell {
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    display: inline-block;
                    min-width: 100px;
                }
                .editable-cell:hover {
                    background: var(--surface-alt);
                    color: var(--primary);
                    box-shadow: 0 0 0 1px var(--primary);
                }

                .inline-edit-input {
                    padding: 4px 8px;
                    border: 1px solid var(--primary);
                    border-radius: 4px;
                    background: var(--surface);
                    color: var(--text-main);
                    width: 100%;
                }
                
                .empty-cell { color: var(--text-light); font-style: italic; }
            `}</style>
        </div>
    );
};

export default HierarchyPage;
