
import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';

import Select from '../UI/Select';
import Card from '../UI/Card';

type ReportType = 'all' | 'by-status' | 'by-level' | 'TEAM_HEADS' | 'REGION_HEADS' | 'RELS_BY_L9' | 'ASSISTANTS' | 'ALL_RELATIONSHIPS';

const ReportsPage: React.FC = () => {
  const { employees, relationships, hierarchy, getHierarchyPath } = useData();
  const [reportType, setReportType] = useState<ReportType>('all');
  const [selectedL9, setSelectedL9] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedLevelValue, setSelectedLevelValue] = useState<string>('');


  // Get all Level 9s for the dropdown
  const level9Options = useMemo(() => {
    return hierarchy
      .filter(h => h.level === 9)
      .map(h => ({ label: h.name, value: h.id }));
  }, [hierarchy]);

  // Helper to get Level 6 from Level 9
  // Helper to get Level 6 from Level 9
  const getLevel6 = (l9NameOrId: string) => {
    // Current data often has Names in emp.level9? Or IDs?
    // Let's rely on finding the L9 node first.
    // Wait, getHierarchyPath expects an ID?
    // HierarchyGraphPage uses emp.level9 as Name.
    // If emp.level9 is Name, we need to find ID first.

    const l9Node = hierarchy.find(h => h.name === l9NameOrId && h.level === 9);
    if (!l9Node) return { name: '-', id: '-' };

    const path = getHierarchyPath(l9Node.id);
    const l6 = path.find(h => h.level === 6);
    return { name: l6?.name || '-', id: l6?.id || '-' };
  };

  const getLevel9Id = (l9Name: string) => {
    const l9Node = hierarchy.find(h => h.name === l9Name && h.level === 9);
    return l9Node ? l9Node.id : l9Name;
  };

  // Get employees for selected level value
  const getLevelMembers = () => {
    if (!selectedLevelValue) return [];

    // Find all employees whose hierarchy path includes this level
    return employees.filter(emp => {
      const path = getHierarchyPath(emp.level9);
      return path.some(h => h.id === selectedLevelValue);
    }).sort((a, b) => a.lastName.localeCompare(b.lastName));
  };

  const reportData = useMemo(() => {
    switch (reportType) {
      case 'all':
        return [...employees].sort((a, b) => a.lastName.localeCompare(b.lastName)).map(e => {
          const l6Info = getLevel6(e.level9);
          return {
            Initials: e.initials,
            LastName: e.lastName,
            FirstName: e.firstName,
            Role: e.role,
            Level6: l6Info.id,
            Level9: getLevel9Id(e.level9),
            Status: e.status
          };
        });
      case 'by-status':
        return employees
          .filter(e => e.status === selectedLevelValue)
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(e => {
            const l6Info = getLevel6(e.level9);
            return {
              Initials: e.initials,
              LastName: e.lastName,
              FirstName: e.firstName,
              Role: e.role,
              Level6: l6Info.id,
              Level9: getLevel9Id(e.level9),
              Status: e.status
            };
          });
      case 'by-level':
        return getLevelMembers().map(e => {
          const l6Info = getLevel6(e.level9);
          return {
            Initials: e.initials,
            LastName: e.lastName,
            FirstName: e.firstName,
            Role: e.role,
            Level6: l6Info.id,
            Level9: getLevel9Id(e.level9),
            Status: e.status
          };
        });
      case 'TEAM_HEADS':
        return employees
          .filter(e => e.role === 'Team Head')
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(e => {
            const l6Info = getLevel6(e.level9);
            return {
              Initials: e.initials,
              LastName: e.lastName,
              FirstName: e.firstName,
              Role: e.role,
              Level6: l6Info.id,
              Level9: getLevel9Id(e.level9),
              Status: e.status
            };
          });

      case 'REGION_HEADS':
        return employees
          .filter(e => e.role === 'Region Head')
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(e => {
            const l6Info = getLevel6(e.level9);
            return {
              Initials: e.initials,
              LastName: e.lastName,
              FirstName: e.firstName,
              Role: e.role,
              Level6: l6Info.id,
              Level9: getLevel9Id(e.level9)
            };
          });

      case 'RELS_BY_L9':
        if (!selectedL9) return [];
        return employees
          .filter(e => e.role === 'Rel' && e.level9 === selectedL9)
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(e => {
            const l6Info = getLevel6(e.level9);
            return {
              LastName: e.lastName,
              FirstName: e.firstName,
              Initials: e.initials,
              Role: e.role,
              Level6: l6Info.id,
              Level9: getLevel9Id(e.level9),
              Status: e.status
            };
          });

      case 'ASSISTANTS':
        return employees
          .filter(e => e.role === 'Assistant')
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(e => {
            const l6Info = getLevel6(e.level9);
            return {
              LastName: e.lastName,
              FirstName: e.firstName,
              Role: e.role,
              Level6: l6Info.id,
              Level9: getLevel9Id(e.level9)
            };
          });

      case 'ALL_RELATIONSHIPS':
        return relationships.map(r => {
          // Find owner details
          const owner = employees.find(e => e.initials === r.ownerInitials);
          return {
            'Owner Initials': r.ownerInitials,
            'Owner Name': owner ? `${owner.lastName} ${owner.firstName}` : 'Unknown',
            'Type': r.type,
            'Target Name': `${r.targetLastName} ${r.targetFirstName}`,
            'Target Initials': r.targetInitials,
            'Target L9': r.targetLevel9,
            'Start Date': r.startDate,
            'End Date': r.endDate || ''
          };
        });

      default:
        return [];
    }
  }, [reportType, selectedL9, selectedLevel, selectedLevelValue, employees, relationships, hierarchy]);

  const columns = useMemo(() => {
    if (reportData.length === 0) return [];
    return Object.keys(reportData[0]);
  }, [reportData]);

  const handleExport = () => {
    if (reportData.length === 0) return;

    const headers = columns.join(',');
    const rows = reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const levelOptions = useMemo(() => {
    const levels = Array.from(new Set(hierarchy.map(h => h.level))).sort((a, b) => a - b);
    return levels.map(level => ({ label: `Level ${level}`, value: String(level) }));
  }, [hierarchy]);

  const levelValueOptions = useMemo(() => {
    if (selectedLevel === null) return [];
    return hierarchy
      .filter(h => h.level === selectedLevel)
      .map(h => ({ label: h.name, value: h.id }));
  }, [hierarchy, selectedLevel]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(employees.map(e => e.status))).filter(Boolean);
    return statuses.map(status => ({ label: status, value: status }));
  }, [employees]);

  return (
    <div className="reports-page container">
      <div className="reports-header glass-panel">
        <div className="header-left">
          <div className="icon-box"><FileSpreadsheet size={24} /></div>
          <div>
            <h1>Reports & Extraction</h1>
            <p className="text-muted">Generate and export organizational data</p>
          </div>
        </div>

        <div className="filters">
          <Select
            options={[
              { label: 'All Employees', value: 'all' },
              { label: 'Employees by Status', value: 'by-status' },
              { label: 'Employees by Level', value: 'by-level' },
              { label: 'All Team Heads', value: 'TEAM_HEADS' },
              { label: 'All Region Heads (+ L6)', value: 'REGION_HEADS' },
              { label: 'All Assistants (+ L9/L6)', value: 'ASSISTANTS' },
              { label: 'Rels by Level 9', value: 'RELS_BY_L9' },
              { label: 'All Relationships', value: 'ALL_RELATIONSHIPS' },
            ]}
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as ReportType);
              setSelectedLevel(null);
              setSelectedLevelValue('');
              setSelectedL9('');
            }}
            className="report-select"
          />

          {reportType === 'by-level' && (
            <>
              <Select
                options={[{ label: 'Select Level...', value: '' }, ...levelOptions]}
                value={selectedLevel !== null ? String(selectedLevel) : ''}
                onChange={(e) => {
                  setSelectedLevel(e.target.value ? Number(e.target.value) : null);
                  setSelectedLevelValue('');
                }}
                className="level-selector"
              />
              {selectedLevel !== null && (
                <Select
                  options={[{ label: 'Select Value...', value: '' }, ...levelValueOptions]}
                  value={selectedLevelValue}
                  onChange={(e) => setSelectedLevelValue(e.target.value)}
                  className="value-selector"
                />
              )}
            </>
          )}

          {reportType === 'by-status' && (
            <Select
              options={[{ label: 'Select Status...', value: '' }, ...statusOptions]}
              value={selectedLevelValue} // Reusing selectedLevelValue for status
              onChange={(e) => setSelectedLevelValue(e.target.value)}
              className="value-selector"
            />
          )}

          {reportType === 'RELS_BY_L9' && (
            <Select
              options={[{ label: 'Select Level 9 Unit...', value: '' }, ...level9Options]}
              value={selectedL9}
              onChange={(e) => setSelectedL9(e.target.value)}
              className="l9-select"
            />
          )}

          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={reportData.length === 0}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <Card className="results-card">
        <div className="table-responsive">
          {reportData.length === 0 ? (
            <div className="empty-state">
              <Filter size={48} className="text-light" />
              <p>No data found for the selected criteria</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([key, val], vIdx) => (
                      <td key={vIdx}>
                        {key === 'Initials' ? (
                          <div className={`emp-avatar role-${(row as any).Role?.toLowerCase().replace(' ', '-')}`}>
                            {val}
                          </div>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <style>{`
        .reports-page { padding-top: var(--space-xl); }
        .reports-header {
          padding: var(--space-xl);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-lg);
          border-radius: var(--radius-lg);
        }
        .header-left { display: flex; align-items: center; gap: var(--space-md); }
        .icon-box {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--warning), orange);
          color: white;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow);
        }
        .filters {
          display: flex;
          gap: var(--space-md);
          align-items: center;
          flex-wrap: wrap;
        }
        .report-select { min-width: 250px; }
        .l9-select { min-width: 200px; }
        
        .results-card {
          min-height: 400px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-muted);
          gap: var(--space-md);
        }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: var(--space-md); border-bottom: 2px solid var(--border); font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); }
        td { padding: var(--space-md); border-bottom: 1px solid var(--border-light); font-size: 0.95rem; }
        tr:hover { background: var(--surface-alt); }
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.6rem 1.2rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 500;
        }
        .btn:disabled { background: var(--text-light); cursor: not-allowed; }
        .text-light { color: var(--text-light); }
        
        .emp-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          color: white;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
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
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
