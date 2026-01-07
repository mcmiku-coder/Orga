
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Employee, type Relationship, type HierarchyLevel } from '../types';


interface DataContextType {
    employees: Employee[];
    relationships: Relationship[];
    hierarchy: HierarchyLevel[];
    addRelationship: (rel: Relationship) => void;
    deleteRelationship: (id: string) => void;
    updateRelationship: (rel: Relationship) => void;
    addEmployee: (emp: Employee) => void;
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    deleteEmployee: (id: number) => void;

    // Hierarchy Management
    updateHierarchyLevel: (levelId: string, newName: string) => void;
    addHierarchyLevel: (level: HierarchyLevel) => void;
    deleteHierarchyLevel: (id: string) => void;
    updateHierarchyParent: (id: string, newParentId: string | undefined) => void;
    getHierarchyPath: (levelId: string) => HierarchyLevel[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE = ''; // Same origin

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/data`);
                const data = await res.json();
                setEmployees(data.employees || []);
                setRelationships(data.relationships || []);
                setHierarchy(data.hierarchy || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addRelationship = async (rel: Relationship) => {
        try {
            const res = await fetch(`${API_BASE}/api/relationships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rel)
            });
            const newRel = await res.json();
            setRelationships(prev => [...prev, newRel]);
        } catch (error) {
            console.error('Failed to add relationship:', error);
        }
    };

    const deleteRelationship = async (id: string) => {
        try {
            await fetch(`${API_BASE}/api/relationships/${id}`, { method: 'DELETE' });
            setRelationships(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete relationship:', error);
        }
    };

    const updateRelationship = async (rel: Relationship) => {
        // Not implemented in backend yet, but would be PUT /api/relationships/:id
        setRelationships(prev => prev.map(r => r.id === rel.id ? rel : r));
    };

    const addEmployee = async (emp: Employee) => {
        try {
            const res = await fetch(`${API_BASE}/api/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emp)
            });
            const newEmp = await res.json();
            setEmployees(prev => [...prev, newEmp]);
        } catch (error) {
            console.error('Failed to add employee:', error);
        }
    };

    const updateEmployee = async (id: string, updates: Partial<Employee>) => {
        try {
            const res = await fetch(`${API_BASE}/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const updatedEmp = await res.json();
            setEmployees(prev => prev.map(e => String(e.id) === String(id) ? updatedEmp : e));
        } catch (error) {
            console.error('Failed to update employee:', error);
        }
    };

    const deleteEmployee = async (id: number) => {
        try {
            await fetch(`${API_BASE}/api/employees/${id}`, { method: 'DELETE' });
            setEmployees(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete employee:', error);
        }
    };

    const getHierarchyPath = (levelId: string): HierarchyLevel[] => {
        const path: HierarchyLevel[] = [];
        let current = hierarchy.find(l => l.id === levelId);
        while (current) {
            path.push(current);
            if (!current.parentId) break;
            current = hierarchy.find(l => l.id === current!.parentId);
        }
        return path.reverse();
    };

    const updateHierarchyLevel = async (levelId: string, newName: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/hierarchy/${levelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            const updatedLevel = await res.json();
            setHierarchy(prev => prev.map(h => h.id === levelId ? updatedLevel : h));
        } catch (error) {
            console.error('Failed to update hierarchy:', error);
        }
    };

    const addHierarchyLevel = async (level: HierarchyLevel) => {
        // Mocked as single update in backend for now
        setHierarchy(prev => [...prev, level]);
    };

    const deleteHierarchyLevel = async (id: string) => {
        setHierarchy(prev => prev.filter(h => h.id !== id));
    };

    const updateHierarchyParent = async (id: string, newParentId: string | undefined) => {
        try {
            const res = await fetch(`${API_BASE}/api/hierarchy/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: newParentId })
            });
            const updatedLevel = await res.json();
            setHierarchy(prev => prev.map(h => h.id === id ? updatedLevel : h));
        } catch (error) {
            console.error('Failed to update hierarchy parent:', error);
        }
    };

    if (loading) return <div className="loading-overlay">Connecting to database...</div>;

    return (
        <DataContext.Provider value={{
            employees,
            relationships,
            hierarchy,
            addRelationship,
            deleteRelationship,
            updateRelationship,
            addEmployee,
            updateEmployee,
            deleteEmployee,
            getHierarchyPath,
            updateHierarchyLevel,
            addHierarchyLevel,
            deleteHierarchyLevel,
            updateHierarchyParent
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
