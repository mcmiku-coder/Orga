import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HIERARCHY_LEVELS = [
    { id: 'L3-Global', name: 'L3 - Global', level: 3 },
    { id: 'L4-EMEA', name: 'L4 - EMEA', level: 4, parentId: 'L3-Global' },
    { id: 'L4-Americas', name: 'L4 - Americas', level: 4, parentId: 'L3-Global' },
    { id: 'L5-WesternEurope', name: 'L5 - Western Europe', level: 5, parentId: 'L4-EMEA' },
    { id: 'L5-NorthAmerica', name: 'L5 - North America', level: 5, parentId: 'L4-Americas' },
    { id: 'L6-France', name: 'L6 - France', level: 6, parentId: 'L5-WesternEurope' },
    { id: 'L6-Germany', name: 'L6 - Germany', level: 6, parentId: 'L5-WesternEurope' },
    { id: 'L6-USA', name: 'L6 - USA', level: 6, parentId: 'L5-NorthAmerica' },
    { id: 'L7-IleDeFrance', name: 'L7 - Ile de France', level: 7, parentId: 'L6-France' },
    { id: 'L7-Bavaria', name: 'L7 - Bavaria', level: 7, parentId: 'L6-Germany' },
    { id: 'L7-California', name: 'L7 - California', level: 7, parentId: 'L6-USA' },
    { id: 'L8-ParisNorth', name: 'L8 - Paris North', level: 8, parentId: 'L7-IleDeFrance' },
    { id: 'L8-ParisSouth', name: 'L8 - Paris South', level: 8, parentId: 'L7-IleDeFrance' },
    { id: 'L8-Munich', name: 'L8 - Munich', level: 8, parentId: 'L7-Bavaria' },
    { id: 'L8-SanFrancisco', name: 'L8 - San Francisco', level: 8, parentId: 'L7-California' },
    { id: 'L9-Paris', name: 'L9 - Paris', level: 9, parentId: 'L8-ParisNorth' },
    { id: 'L9-Versailles', name: 'L9 - Versailles', level: 9, parentId: 'L8-ParisSouth' },
    { id: 'L9-MunichCenter', name: 'L9 - Munich Center', level: 9, parentId: 'L8-Munich' },
    { id: 'L9-SFDowntown', name: 'L9 - SF Downtown', level: 9, parentId: 'L8-SanFrancisco' },
];

const INITIAL_EMPLOYEES = [
    { id: 10001, lastName: 'Muster', firstName: 'Max', initials: 'MAM', role: 'Rel', level9: 'L9-Paris', status: 'Active' },
    { id: 10002, lastName: 'Bing', firstName: 'Jack', initials: 'JAB', role: 'Team Head', level9: 'L9-Paris', status: 'Active' },
    { id: 10003, lastName: 'Black', firstName: 'John', initials: 'JOB', role: 'Rel', level9: 'L9-Paris', status: 'Active' },
    { id: 10004, lastName: 'Smith', firstName: 'Alice', initials: 'ALS', role: 'Region Head', level9: 'L9-Paris', status: 'Active' },
    { id: 10005, lastName: 'Doe', firstName: 'Bob', initials: 'BOD', role: 'Assistant', level9: 'L9-Paris', status: 'Active' },
];

async function main() {
    console.log('Start seeding...');

    // Non-destructive check for Hierarchy
    for (const h of HIERARCHY_LEVELS) {
        const exists = await prisma.hierarchyLevel.findUnique({ where: { id: h.id } });
        if (!exists) {
            await prisma.hierarchyLevel.create({ data: h });
            console.log(`Created hierarchy level: ${h.name}`);
        }
    }

    // Non-destructive check for Employees
    for (const e of INITIAL_EMPLOYEES) {
        const exists = await prisma.employee.findUnique({ where: { initials: e.initials } });
        if (!exists) {
            await prisma.employee.create({ data: e });
            console.log(`Created initial employee: ${e.lastName} (${e.initials})`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
