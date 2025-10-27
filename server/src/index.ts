import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import memberRoutes from './routes/members.js';
import familyRoutes from './routes/families.js';
import groupRoutes from './routes/groups.ts';
import ministryRoutes from './routes/ministries.js';
import financeRoutes from './routes/finances.js';
import communicationRoutes from './routes/communication.js';
import volunteerRoutes from './routes/volunteers.js';
import inventoryRoutes from './routes/inventory.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { prisma };
