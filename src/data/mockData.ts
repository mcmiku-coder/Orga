```typescript
import { type Employee, type HierarchyLevel } from '../types';

export const HIERARCHY_LEVELS: HierarchyLevel[] = [
    // Level 3 - Global
    { id: 'L3-Global', name: 'L3 - Global', level: 3 },
    
    // Level 4 - Regions
    { id: 'L4-EMEA', name: 'L4 - EMEA', level: 4, parentId: 'L3-Global' },
    { id: 'L4-Americas', name: 'L4 - Americas', level: 4, parentId: 'L3-Global' },
    
    // Level 5 - Sub-regions
    { id: 'L5-WesternEurope', name: 'L5 - Western Europe', level: 5, parentId: 'L4-EMEA' },
    { id: 'L5-NorthAmerica', name: 'L5 - North America', level: 5, parentId: 'L4-Americas' },
    
    // Level 6 - Countries
    { id: 'L6-France', name: 'L6 - France', level: 6, parentId: 'L5-WesternEurope' },
    { id: 'L6-Germany', name: 'L6 - Germany', level: 6, parentId: 'L5-WesternEurope' },
    { id: 'L6-USA', name: 'L6 - USA', level: 6, parentId: 'L5-NorthAmerica' },
    
    // Level 7 - Areas
    { id: 'L7-IleDeFrance', name: 'L7 - Ile de France', level: 7, parentId: 'L6-France' },
    { id: 'L7-Bavaria', name: 'L7 - Bavaria', level: 7, parentId: 'L6-Germany' },
    { id: 'L7-California', name: 'L7 - California', level: 7, parentId: 'L6-USA' },
    
    // Level 8 - Divisions
    { id: 'L8-ParisNorth', name: 'L8 - Paris North', level: 8, parentId: 'L7-IleDeFrance' },
    { id: 'L8-ParisSouth', name: 'L8 - Paris South', level: 8, parentId: 'L7-IleDeFrance' },
    { id: 'L8-Munich', name: 'L8 - Munich', level: 8, parentId: 'L7-Bavaria' },
    { id: 'L8-SanFrancisco', name: 'L8 - San Francisco', level: 8, parentId: 'L7-California' },
    
    // Level 9 - Units
    { id: 'L9-Paris', name: 'L9 - Paris', level: 9, parentId: 'L8-ParisNorth' },
    { id: 'L9-Versailles', name: 'L9 - Versailles', level: 9, parentId: 'L8-ParisSouth' },
    { id: 'L9-MunichCenter', name: 'L9 - Munich Center', level: 9, parentId: 'L8-Munich' },
    { id: 'L9-SFDowntown', name: 'L9 - SF Downtown', level: 9, parentId: 'L8-SanFrancisco' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
    { id: 10001, lastName: 'Muster', firstName: 'Max', initials: 'MAM', role: 'Rel', level9: 'L9-Bruxelles', status: 'Active' },
    { id: 10002, lastName: 'Bing', firstName: 'Jack', initials: 'JAB', role: 'Team Head', level9: 'L9-Bruxelles', status: 'Active' },
    { id: 10003, lastName: 'Black', firstName: 'John', initials: 'JOB', role: 'Rel', level9: 'L9-Bruxelles', status: 'Active' },
    // Generated Data
    { id: 10004, lastName: 'Smith', firstName: 'Alice', initials: 'ALS', role: 'Region Head', level9: 'L9-London', status: 'Active' },
    { id: 10005, lastName: 'Doe', firstName: 'Bob', initials: 'BOD', role: 'Assistant', level9: 'L9-London', status: 'Active' },
    { id: 10006, lastName: 'Dupont', firstName: 'Jean', initials: 'JED', role: 'Team Head', level9: 'L9-Paris', status: 'Active' },
    { id: 10007, lastName: 'Martin', firstName: 'Sophie', initials: 'SOM', role: 'Rel', level9: 'L9-Paris', status: 'Active' },
    { id: 10008, lastName: 'Rossi', firstName: 'Mario', initials: 'MAR', role: 'Region Head', level9: 'L9-Milan', status: 'Active' },
    { id: 10009, lastName: 'Bianchi', firstName: 'Luigi', initials: 'LUB', role: 'Assistant', level9: 'L9-Milan', status: 'Active' },
    { id: 10010, lastName: 'Mueller', firstName: 'Klaus', initials: 'KLM', role: 'Team Head', level9: 'L9-Luxembourg', status: 'Active' },
    { id: 10011, lastName: 'Weber', firstName: 'Hans', initials: 'HAW', role: 'Rel', level9: 'L9-Luxembourg', status: 'Active' },
    { id: 10012, lastName: 'Peeters', firstName: 'Jan', initials: 'JAP', role: 'Rel', level9: 'L9-Bruxelles', status: 'Active' },
    { id: 10013, lastName: 'Dubois', firstName: 'Marie', initials: 'MAD', role: 'Assistant', level9: 'L9-Paris', status: 'Active' },
    { id: 10014, lastName: 'Jones', firstName: 'Sarah', initials: 'SAJ', role: 'Team Head', level9: 'L9-London', status: 'Active' },
    { id: 10015, lastName: 'Wilson', firstName: 'Tom', initials: 'TOW', role: 'Rel', level9: 'L9-London', status: 'Active' },
    { id: 10016, lastName: 'Ferrari', firstName: 'Enzo', initials: 'ENF', role: 'Rel', level9: 'L9-Milan', status: 'Active' },
    { id: 10017, lastName: 'Romano', firstName: 'Giulia', initials: 'GIR', role: 'Rel', level9: 'L9-Milan', status: 'Active' },
    { id: 10018, lastName: 'Klein', firstName: 'Emma', initials: 'EMK', role: 'Rel', level9: 'L9-Luxembourg', status: 'Inactive' },
    { id: 10019, lastName: 'Wagner', firstName: 'Paul', initials: 'PAW', role: 'Rel', level9: 'L9-Bruxelles', status: 'Inactive' },
    { id: 10020, lastName: 'Brown', firstName: 'Charlie', initials: 'CHB', role: 'Rel', level9: 'L9-London', status: 'Active' },
    { id: 10021, lastName: 'Leclerc', firstName: 'Charles', initials: 'CHL', role: 'Rel', level9: 'L9-Paris', status: 'Active' },
    { id: 10022, lastName: 'Verstappen', firstName: 'Max', initials: 'MAV', role: 'Rel', level9: 'L9-Bruxelles', status: 'Active' },
    { id: 10023, lastName: 'Norris', firstName: 'Lando', initials: 'LAN', role: 'Rel', level9: 'L9-London', status: 'Active' },
    { id: 10024, lastName: 'Sainz', firstName: 'Carlos', initials: 'CAS', role: 'Rel', level9: 'L9-Milan', status: 'Active' },
];

export const INITIAL_RELATIONSHIPS: any[] = []; // Start empty or add some samples if needed
