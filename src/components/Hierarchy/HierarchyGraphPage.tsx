import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import type { HierarchyLevel } from '../../types';

const HierarchyGraphPage: React.FC = () => {
    const { hierarchy, getHierarchyPath, employees, relationships } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize state from location.state if available (restoring context)
    const initialState = location.state as {
        selectedLevel?: number | 'Employee' | null;
        selectedValue?: string;
        onlyWithColleagues?: boolean;
        subFilterValue?: string;
    } | null;

    const [selectedLevel, setSelectedLevel] = useState<number | 'Employee' | null>(initialState?.selectedLevel ?? null);
    const [selectedValue, setSelectedValue] = useState<string>(initialState?.selectedValue ?? '');
    const [onlyWithColleagues, setOnlyWithColleagues] = useState(initialState?.onlyWithColleagues ?? true);
    const [subFilterValue, setSubFilterValue] = useState(initialState?.subFilterValue ?? '');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Get unique levels
    const levels = useMemo(() => {
        return Array.from(new Set(hierarchy.map(h => h.level))).sort((a, b) => a - b);
    }, [hierarchy]);

    // Get values for selected level
    const levelValues = useMemo(() => {
        if (!selectedLevel || selectedLevel === 'Employee') return [];
        return hierarchy.filter(h => h.level === selectedLevel);
    }, [selectedLevel, hierarchy]);

    // Filtered Employees List
    const filteredEmployees = useMemo(() => {
        if (selectedLevel !== 'Employee') return [];

        return employees.filter(emp => {
            // Filter by "only with linked employees"
            if (onlyWithColleagues) {
                const hasLinks = relationships.some(r =>
                    r.ownerInitials === emp.initials || r.targetInitials === emp.initials
                );
                if (!hasLinks) return false;
            }

            // Filter by Sub-filter (Role)
            if (subFilterValue && subFilterValue !== 'All' && emp.role !== subFilterValue) {
                return false;
            }

            return true;
        }).sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [selectedLevel, employees, relationships, onlyWithColleagues, subFilterValue]);

    // Roles for the sub-filter
    const roles = ['All', 'Region Head', 'Team Head', 'Rel', 'Assistant'];

    // Build graph data
    const graphData = useMemo(() => {
        if (selectedLevel === 'Employee') {
            // No graph nodes needed for table view, return empty
            return { nodes: [], links: [] };
        }

        if (!selectedValue) return { nodes: [], links: [] };
        // ... rest of the existing graphData logic (kept but logic moved inside the return below)

        const selectedNode = hierarchy.find(h => h.id === selectedValue);
        if (!selectedNode) return { nodes: [], links: [] };

        // Get all descendants
        const getDescendants = (nodeId: string): HierarchyLevel[] => {
            const children = hierarchy.filter(h => h.parentId === nodeId);
            return children.concat(children.flatMap(c => getDescendants(c.id)));
        };

        // Get all ancestors
        const path = getHierarchyPath(selectedValue);
        const descendants = getDescendants(selectedValue);

        const allNodes = [...path, ...descendants];
        const uniqueNodes = Array.from(new Map(allNodes.map(n => [n.id, n])).values());

        // Create links
        const links = uniqueNodes
            .filter(n => n.parentId)
            .map(n => ({
                source: n.parentId!,
                target: n.id
            }));

        return { nodes: uniqueNodes, links };
    }, [selectedValue, hierarchy, getHierarchyPath]);

    // Draw graph
    useEffect(() => {
        if (!canvasRef.current || graphData.nodes.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Level colors
        const levelColors: Record<number, string> = {
            3: '#ef4444',
            4: '#f97316',
            5: '#f59e0b',
            6: '#10b981',
            7: '#3b82f6',
            8: '#8b5cf6',
            9: '#ec4899',
            99: '#6366f1' // Indigo for employees
        };

        const nodePositions = new Map<string, { x: number; y: number }>();

        if (selectedLevel !== 'Employee') {
            // ORIGINAL TREE LAYOUT
            const levelGroups = new Map<number, HierarchyLevel[]>();

            // Group by level
            graphData.nodes.forEach(node => {
                if (!levelGroups.has(node.level)) {
                    levelGroups.set(node.level, []);
                }
                levelGroups.get(node.level)!.push(node);
            });

            // Position nodes
            const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
            const levelHeight = height / (sortedLevels.length + 1);

            sortedLevels.forEach((level, levelIndex) => {
                const nodes = levelGroups.get(level)!;
                const levelWidth = width / (nodes.length + 1);

                nodes.forEach((node, nodeIndex) => {
                    nodePositions.set(node.id, {
                        x: levelWidth * (nodeIndex + 1),
                        y: levelHeight * (levelIndex + 1)
                    });
                });
            });

            // Draw links first (behind nodes)
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 2;
            graphData.links.forEach(link => {
                const source = nodePositions.get(link.source);
                const target = nodePositions.get(link.target);
                if (source && target) {
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.stroke();
                }
            });

            // Draw nodes
            graphData.nodes.forEach(node => {
                const pos = nodePositions.get(node.id);
                if (!pos) return;

                const radius = 40;
                const color = levelColors[node.level] || '#6b7280';

                // Draw circle
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
                ctx.fill();

                // Draw border
                ctx.strokeStyle = node.id === selectedValue ? '#fff' : color;
                ctx.lineWidth = node.id === selectedValue ? 4 : 2;
                ctx.stroke();

                // Draw text
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const lines = node.name.split(' - ');
                lines.forEach((line, i) => {
                    ctx.fillText(line, pos.x, pos.y - 10 + i * 15, radius * 1.8);
                });
            });
        }
    }, [graphData, selectedValue, selectedLevel]);

    return (
        <div className="hierarchy-graph-page container">
            <div className="page-header glass-panel">
                <h1>Hierarchy Visualization</h1>
                <p className="subtitle">Interactive organizational structure graph</p>
            </div>

            <div className="filters-panel glass-panel">
                <select
                    value={selectedLevel || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Employee') {
                            setSelectedLevel('Employee');
                        } else {
                            setSelectedLevel(val ? Number(val) : null);
                        }
                        setSelectedValue('');
                    }}
                    className="level-selector"
                >
                    <option value="">-- Select Level --</option>
                    {levels.map(level => (
                        <option key={level} value={level}>Level {level}</option>
                    ))}
                    <option value="Employee">Employee</option>
                </select>

                {selectedLevel === 'Employee' ? (
                    <>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={onlyWithColleagues}
                                onChange={(e) => setOnlyWithColleagues(e.target.checked)}
                            />
                            Only employees with links
                        </label>

                        <select
                            value={subFilterValue}
                            onChange={(e) => setSubFilterValue(e.target.value)}
                            className="value-selector"
                        >
                            <option value="">-- Select Role --</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </>
                ) : selectedLevel && (
                    <select
                        value={selectedValue}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="value-selector"
                    >
                        <option value="">-- Select Value --</option>
                        {levelValues.map(val => (
                            <option key={val.id} value={val.id}>{val.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className={`graph-container glass-panel ${selectedLevel === 'Employee' ? 'no-padding' : ''}`}>
                {selectedLevel === 'Employee' ? (
                    filteredEmployees.length > 0 ? (
                        <div className="table-container">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th className="text-center">Initials</th>
                                        <th>Last Name</th>
                                        <th>First Name</th>
                                        <th>Role</th>
                                        <th>L6</th>
                                        <th>L9</th>
                                        <th className="text-center"># Employees</th>
                                        <th className="text-center"># Bosses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => {
                                        // Count Employees (Subordinates): People who work for THIS employee
                                        // If I am Owner, I am Boss (if type is 'works for' or 'boss of').
                                        const subordinatCount = relationships.filter(r =>
                                            r.ownerInitials === emp.initials && (r.type === 'works for' || r.type === 'boss of')
                                        ).length;

                                        // Count Bosses (Managers): People THIS employee works for
                                        // If I am Target, I am Subordinate (if type is 'works for' or 'boss of').
                                        const bossCount = relationships.filter(r =>
                                            r.targetInitials === emp.initials && (r.type === 'works for' || r.type === 'boss of')
                                        ).length;

                                        const roleClass = `role-${emp.role.toLowerCase().replace(' ', '-')}`;
                                        // Get Level 6 (parent of L9)
                                        const l9Node = hierarchy.find(h => h.name === emp.level9 && h.level === 9);
                                        const l6Node = l9Node ? hierarchy.find(h => h.id === l9Node.parentId) : null;
                                        const l6Name = l6Node ? l6Node.name : '-';

                                        return (
                                            <tr
                                                key={emp.id}
                                                onClick={() => navigate(`/employee/${emp.id}`, {
                                                    state: {
                                                        from: 'hierarchy',
                                                        hierarchyState: {
                                                            selectedLevel,
                                                            selectedValue,
                                                            onlyWithColleagues,
                                                            subFilterValue
                                                        }
                                                    }
                                                })}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td className="text-center">
                                                    <div className="flex-center" style={{ justifyContent: 'center' }}>
                                                        <div className={`emp-avatar-sm ${roleClass}`}>
                                                            {emp.initials}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="font-medium">{emp.lastName}</td>
                                                <td className="font-medium">{emp.firstName}</td>
                                                <td><span className={`badge ${roleClass}`}>{emp.role}</span></td>
                                                <td>{l6Name}</td>
                                                <td>{emp.level9}</td>
                                                <td className="text-center font-bold">{subordinatCount}</td>
                                                <td className="text-center font-bold">{bossCount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No employees found matching the current filters.</p>
                        </div>
                    )
                ) : (selectedValue) ? (
                    <canvas
                        ref={canvasRef}
                        width={1200}
                        height={600}
                        className="hierarchy-canvas"
                    />
                ) : (
                    <div className="empty-state">
                        <p>Select a level and value to view the hierarchy graph</p>
                    </div>
                )}
            </div>

            <style>{`
                .hierarchy-graph-page {
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

                .filters-panel {
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    display: flex;
                    gap: var(--space-md);
                    align-items: center;
                }

                .level-selector, .value-selector {
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-main);
                    font-size: 1rem;
                    min-width: 200px;
                }

                .graph-container {
                    padding: var(--space-xl);
                    border-radius: var(--radius-lg);
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .hierarchy-canvas {
                    max-width: 100%;
                    height: auto;
                }

                .empty-state {
                    text-align: center;
                    color: var(--text-muted);
                    padding: var(--space-xl);
                }

                .no-padding {
                    padding: 0 !important;
                    overflow: hidden;
                }

                .table-container {
                    width: 100%;
                    overflow-x: auto;
                }

                .employee-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .employee-table th, .employee-table td {
                    padding: var(--space-md);
                    text-align: left;
                    border-bottom: 1px solid var(--border);
                }

                .employee-table th {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .employee-table tr:last-child td {
                    border-bottom: none;
                }

                .employee-table tr:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .emp-avatar-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.75rem;
                    color: white;
                }
                
                .role-region-head { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .role-team-head { background: linear-gradient(135deg, #f97316, #ea580c); }
                .role-rel { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                .role-assistant { background: linear-gradient(135deg, #10b981, #059669); }
                
                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default HierarchyGraphPage;
