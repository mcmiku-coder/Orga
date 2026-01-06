
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
    updateEmployee: (emp: Employee) => void;
    deleteEmployee: (id: number) => void;
    getHierarchyPath: (levelId: string) => HierarchyLevel[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);

    useEffect(() => {
        // Load from local storage or initialize
        const storedEmps = localStorage.getItem('ors_employees');
        const storedRels = localStorage.getItem('ors_relationships');

        if (storedEmps) {
            setEmployees(JSON.parse(storedEmps));
        } else {
            setEmployees(INITIAL_EMPLOYEES);
            localStorage.setItem('ors_employees', JSON.stringify(INITIAL_EMPLOYEES));
        }

        if (storedRels) {
            setRelationships(JSON.parse(storedRels));
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

    const updateEmployee = (emp: Employee) => {
        saveEmployees(employees.map(e => e.id === emp.id ? emp : e));
    };

    const deleteEmployee = (id: number) => {
        saveEmployees(employees.filter(e => e.id !== id));
    };

    const getHierarchyPath = (levelId: string): HierarchyLevel[] => {
        const path: HierarchyLevel[] = [];
        let current = HIERARCHY_LEVELS.find(l => l.id === levelId);
        while (current) {
            path.push(current);
            if (!current.parentId) break;
            current = HIERARCHY_LEVELS.find(l => l.id === current!.parentId);
        }
        return path.reverse();
    };

    return (
        <DataContext.Provider value={{
            employees,
            relationships,
            hierarchy: HIERARCHY_LEVELS,
            addRelationship,
            deleteRelationship,
            updateRelationship,
            addEmployee,
            updateEmployee,
            deleteEmployee,
            getHierarchyPath
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
