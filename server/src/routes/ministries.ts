import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/ministries - Get all ministries
router.get('/', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: {
        members: {
          include: {
            member: true
          }
        },
        leader: true
      }
    });
    res.json(ministries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ministries' });
  }
});

// GET /api/ministries/:id - Get ministry by ID
router.get('/:id', async (req, res) => {
  try {
    const ministry = await prisma.ministry.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            member: true
          }
        },
        leader: true
      }
    });

    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    res.json(ministry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ministry' });
  }
});

// POST /api/ministries - Create new ministry
router.post('/', async (req, res) => {
  try {
    const ministry = await prisma.ministry.create({
      data: req.body,
      include: {
        members: {
          include: {
            member: true
          }
        },
        leader: true
      }
    });
    res.status(201).json(ministry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ministry' });
  }
});

// PUT /api/ministries/:id - Update ministry
router.put('/:id', async (req, res) => {
  try {
    const ministry = await prisma.ministry.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        members: {
          include: {
            member: true
          }
        },
        leader: true
      }
    });
    res.json(ministry);
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.status(500).json({ error: 'Failed to update ministry' });
  }
});

// DELETE /api/ministries/:id - Delete ministry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.ministry.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.status(500).json({ error: 'Failed to delete ministry' });
  }
});

// POST /api/ministries/:id/members - Add member to ministry
router.post('/:id/members', async (req, res) => {
  try {
    const { memberId } = req.body;
    const memberMinistry = await prisma.memberMinistry.create({
      data: {
        memberId,
        ministryId: req.params.id
      },
      include: {
        member: true,
        ministry: true
      }
    });
    res.status(201).json(memberMinistry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member to ministry' });
  }
});

// DELETE /api/ministries/:id/members/:memberId - Remove member from ministry
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    await prisma.memberMinistry.delete({
      where: {
        memberId_ministryId: {
          memberId: req.params.memberId,
          ministryId: req.params.id
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Member not found in ministry' });
    }
    res.status(500).json({ error: 'Failed to remove member from ministry' });
  }
});

export default router;
