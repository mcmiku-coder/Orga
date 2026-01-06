
export type Role = 'Region Head' | 'Team Head' | 'Rel' | 'Assistant';
export type Status = 'Active' | 'Inactive';
export type RelationshipType = 'works for' | 'boss of' | 'colleague of';

export interface Employee {
    id: number;
    lastName: string;
    firstName: string;
    initials: string;
    role: Role;
    level9: string; // e.g., 'L9-Paris'
    status: Status;
}

export interface Relationship {
    id: string; // unique ID for the relationship record
    ownerInitials: string; // The person "owning" this relationship view
    type: RelationshipType;
    targetLastName: string;
    targetInitials: string;
    targetFirstName: string;
    targetLevel9: string;
    startDate: string; // ISO Date string YYYY-MM-DD
    endDate?: string; // ISO Date string YYYY-MM-DD, optional
}

export interface HierarchyLevel {
    id: string;
    name: string;
    parentId?: string;
    level: number; // 3 to 9
}

// Helper types for the hierarchy structure if needed
export interface HierarchyNode {
    id: string;
    name: string;
    children: HierarchyNode[];
    level: number;
}
