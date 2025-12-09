import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/members - Get all members
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        family: true,
        groups: {
          include: {
            group: true
          }
        },
        ministries: {
          include: {
            ministry: true
          }
        },
        participationHistory: true
      }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        family: true,
        groups: {
          include: {
            group: true
          }
        },
        ministries: {
          include: {
            ministry: true
          }
        },
        participationHistory: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const {birthDate, baptismDate,familyId, consecrationDate, ...rest} = req.body

    const member = await prisma.member.create({
      data:{
        ...rest,
        birthDate: birthDate ? new Date(birthDate) :null,
        baptismDate: baptismDate ? new Date(baptismDate) : null,
        consecrationDate: consecrationDate ? new Date(consecrationDate): null,
        familyId: familyId || null,
      },
      include: {
        family: true,
        groups: {
          include: {
            group: true
          }
        },
        ministries: {
          include: {
            ministry: true
          }
        }
      }
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        family: true,
        groups: {
          include: {
            group: true
          }
        },
        ministries: {
          include: {
            ministry: true
          }
        }
      }
    });
    res.json(member);
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;
