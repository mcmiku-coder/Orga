
import { type Employee, type HierarchyLevel } from '../types';

export const HIERARCHY_LEVELS: HierarchyLevel[] = [
    // L3
    { id: 'L3-Global', name: 'Global Head', level: 3 },

    // L4
    { id: 'L4-EMEA', name: 'EMEA', parentId: 'L3-Global', level: 4 },

    // L5
    { id: 'L5-WestEurope', name: 'West Europe', parentId: 'L4-EMEA', level: 5 },

    // L6
    { id: 'L6-FraBeLux', name: 'FraBeLux', parentId: 'L5-WestEurope', level: 6 },
    { id: 'L6-SouthEurope', name: 'South Europe', parentId: 'L5-WestEurope', level: 6 },
    { id: 'L6-UK', name: 'UK & Ireland', parentId: 'L5-WestEurope', level: 6 },

    // L7
    { id: 'L7-FranceZone', name: 'France Zone', parentId: 'L6-FraBeLux', level: 7 },
    { id: 'L7-BeneluxZone', name: 'Benelux Zone', parentId: 'L6-FraBeLux', level: 7 },
    { id: 'L7-ItalyZone', name: 'Italy Zone', parentId: 'L6-SouthEurope', level: 7 },
    { id: 'L7-UKZone', name: 'UK Zone', parentId: 'L6-UK', level: 7 },

    // L8
    { id: 'L8-France', name: 'France Country', parentId: 'L7-FranceZone', level: 8 },
    { id: 'L8-Belgique', name: 'Belgium Country', parentId: 'L7-BeneluxZone', level: 8 },
    { id: 'L8-Luxembourg', name: 'Luxembourg Country', parentId: 'L7-BeneluxZone', level: 8 },
    { id: 'L8-Italy', name: 'Italy Country', parentId: 'L7-ItalyZone', level: 8 },
    { id: 'L8-UK', name: 'UK Country', parentId: 'L7-UKZone', level: 8 },

    // L9 (Units)
    { id: 'L9-Paris', name: 'Paris Unit', parentId: 'L8-France', level: 9 },
    { id: 'L9-Bruxelles', name: 'Brussels Unit', parentId: 'L8-Belgique', level: 9 },
    { id: 'L9-Luxembourg', name: 'Luxembourg Unit', parentId: 'L8-Luxembourg', level: 9 },
    { id: 'L9-Milan', name: 'Milan Unit', parentId: 'L8-Italy', level: 9 },
    { id: 'L9-London', name: 'London Unit', parentId: 'L8-UK', level: 9 },
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
