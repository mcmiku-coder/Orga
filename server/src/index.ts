import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../../dist')));

// API Routes
app.get('/api/data', async (req, res) => {
    try {
        const [employees, relationships, hierarchy] = await Promise.all([
            prisma.employee.findMany(),
            prisma.relationship.findMany(),
            prisma.hierarchyLevel.findMany()
        ]);
        res.json({ employees, relationships, hierarchy });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { id, ...data } = req.body; // Ignore incoming ID if any
        const employee = await prisma.employee.create({ data });
        res.json(employee);
    } catch (error) {
        console.error('Failed to create employee:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await prisma.employee.delete({
            where: { id: Number(req.params.id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.post('/api/relationships', async (req, res) => {
    try {
        const relationship = await prisma.relationship.create({ data: req.body });
        res.json(relationship);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add relationship' });
    }
});

app.delete('/api/relationships/:id', async (req, res) => {
    try {
        await prisma.relationship.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete relationship' });
    }
});

app.put('/api/hierarchy/:id', async (req, res) => {
    try {
        const level = await prisma.hierarchyLevel.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update hierarchy' });
    }
});

app.post('/api/hierarchy', async (req, res) => {
    try {
        const level = await prisma.hierarchyLevel.create({ data: req.body });
        res.json(level);
    } catch (error) {
        console.error('Failed to create hierarchy level:', error);
        res.status(500).json({ error: 'Failed to create hierarchy level' });
    }
});

app.delete('/api/hierarchy/:id', async (req, res) => {
    try {
        await prisma.hierarchyLevel.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete hierarchy level' });
    }
});

// Fallback to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
