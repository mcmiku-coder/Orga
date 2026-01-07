
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Employee, type Relationship, type HierarchyLevel } from '../types';
import { INITIAL_EMPLOYEES, HIERARCHY_LEVELS } from '../data/mockData';

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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>(HIERARCHY_LEVELS);

    useEffect(() => {
        // Load from local storage or initialize
        const storedEmps = localStorage.getItem('ors_employees');
        const storedRels = localStorage.getItem('ors_relationships');
        const storedHierarchy = localStorage.getItem('ors_hierarchy');

        if (storedEmps) {
            setEmployees(JSON.parse(storedEmps));
        } else {
            setEmployees(INITIAL_EMPLOYEES);
            localStorage.setItem('ors_employees', JSON.stringify(INITIAL_EMPLOYEES));
        }

        if (storedRels) {
            setRelationships(JSON.parse(storedRels));
        }

        if (storedHierarchy) {
            const parsed = JSON.parse(storedHierarchy);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setHierarchy(parsed);
            } else {
                // Fallback if stored is empty/invalid
                setHierarchy(HIERARCHY_LEVELS);
                localStorage.setItem('ors_hierarchy', JSON.stringify(HIERARCHY_LEVELS));
            }
        } else {
            setHierarchy(HIERARCHY_LEVELS);
            localStorage.setItem('ors_hierarchy', JSON.stringify(HIERARCHY_LEVELS));
        }
    }, []);

    const saveEmployees = (emps: Employee[]) => {
        setEmployees(emps);
        localStorage.setItem('ors_employees', JSON.stringify(emps));
    };

    const saveRelationships = (rels: Relationship[]) => {
        setRelationships(rels);
        localStorage.setItem('ors_relationships', JSON.stringify(rels));
    };

    const saveHierarchy = (levels: HierarchyLevel[]) => {
        setHierarchy(levels);
        localStorage.setItem('ors_hierarchy', JSON.stringify(levels));
    };

    const addRelationship = (rel: Relationship) => {
        saveRelationships([...relationships, rel]);
    };

    const deleteRelationship = (id: string) => {
        saveRelationships(relationships.filter(r => r.id !== id));
    };

    const updateRelationship = (rel: Relationship) => {
        saveRelationships(relationships.map(r => r.id === rel.id ? rel : r));
    };

    const addEmployee = (emp: Employee) => {
        saveEmployees([...employees, emp]);
    };

    const updateEmployee = (id: string, updates: Partial<Employee>) => {
        saveEmployees(employees.map(e => String(e.id) === String(id) ? { ...e, ...updates } : e));
    };

    const deleteEmployee = (id: number) => {
        saveEmployees(employees.filter(e => String(e.id) !== String(id)));
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

    const updateHierarchyLevel = (levelId: string, newName: string) => {
        saveHierarchy(hierarchy.map(h => h.id === levelId ? { ...h, name: newName } : h));
    };

    const addHierarchyLevel = (level: HierarchyLevel) => {
        saveHierarchy([...hierarchy, level]);
    };

    const deleteHierarchyLevel = (id: string) => {
        saveHierarchy(hierarchy.filter(h => h.id !== id));
    };

    const updateHierarchyParent = (id: string, newParentId: string | undefined) => {
        saveHierarchy(hierarchy.map(h => h.id === id ? { ...h, parentId: newParentId } : h));
    };

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
