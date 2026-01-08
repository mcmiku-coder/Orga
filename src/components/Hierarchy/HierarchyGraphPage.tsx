import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import type { HierarchyLevel } from '../../types';

const HierarchyGraphPage: React.FC = () => {
    const { hierarchy, getHierarchyPath, employees, relationships } = useData();
    const [selectedLevel, setSelectedLevel] = useState<number | 'Employee' | null>(null);
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [onlyWithColleagues, setOnlyWithColleagues] = useState(true);
    const [subFilterValue, setSubFilterValue] = useState('');
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
            // Filter by "only with colleagues"
            if (onlyWithColleagues) {
                const hasColleagues = relationships.some(r =>
                    r.ownerInitials === emp.initials && r.type === 'colleague of'
                );
                if (!hasColleagues) return false;
            }

            // Filter by Sub-filter (Level 9)
            if (subFilterValue && emp.level9 !== subFilterValue) {
                return false;
            }

            return true;
        }).sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [selectedLevel, employees, relationships, onlyWithColleagues, subFilterValue]);

    // Level 9 Units for the sub-filter
    const l9Units = useMemo(() => {
        return hierarchy.filter(h => h.level === 9).sort((a, b) => a.name.localeCompare(b.name));
    }, [hierarchy]);

    // Build graph data
    const graphData = useMemo(() => {
        if (selectedLevel === 'Employee') {
            const nodes = filteredEmployees.map(emp => ({
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                level: 99, // Special level for styling
                parentId: null,
                // Add extra properties we might need for rendering
                initials: emp.initials,
                role: emp.role,
                status: emp.status
            }));
            return { nodes, links: [] };
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

        if (selectedLevel === 'Employee') {
            // GRID LAYOUT FOR EMPLOYEES
            const padding = 60;
            const nodeRadius = 35;
            const gap = 20;
            const cols = Math.floor((width - padding * 2) / (nodeRadius * 2 + gap));

            graphData.nodes.forEach((node, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);

                const x = padding + col * (nodeRadius * 2 + gap) + nodeRadius;
                const y = padding + row * (nodeRadius * 2 + gap) + nodeRadius;

                nodePositions.set(node.id, { x, y });

                // Draw Employee Node
                ctx.beginPath();
                ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
                ctx.fillStyle = levelColors[99];
                ctx.fill();

                // Border
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // Initials
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // @ts-ignore - visuals property we added
                ctx.fillText(node.initials || node.name.substring(0, 2).toUpperCase(), x, y);

                // Name below
                ctx.fillStyle = '#e5e7eb';
                ctx.font = '12px Inter';
                const nameParts = node.name.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                ctx.fillText(lastName, x, y + nodeRadius + 15);
            });

            // Adjust canvas height if needed for scrolling (not supported in simple canvas, but we can clamp)
            // For now, we fit in fixed height or need to make canvas dynamic. 
            // Fixed height is 600 in JSX.

        } else {
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
                            Only employees with linked colleagues
                        </label>

                        <select
                            value={subFilterValue}
                            onChange={(e) => setSubFilterValue(e.target.value)}
                            className="value-selector"
                        >
                            <option value="">-- All Level 9 Units --</option>
                            {l9Units.map(unit => (
                                <option key={unit.id} value={unit.name}>{unit.name}</option>
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

            <div className="graph-container glass-panel">
                {(selectedValue || (selectedLevel === 'Employee' && filteredEmployees.length > 0)) ? (
                    <canvas
                        ref={canvasRef}
                        width={1200}
                        height={600}
                        className="hierarchy-canvas"
                    />
                ) : (
                    <div className="empty-state">
                        {selectedLevel === 'Employee' ? (
                            <p>No employees found matching the current filters.</p>
                        ) : (
                            <p>Select a level and value to view the hierarchy graph</p>
                        )}
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
            `}</style>
        </div>
    );
};

export default HierarchyGraphPage;
