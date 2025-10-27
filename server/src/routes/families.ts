import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/families - Get all families
router.get('/', async (req, res) => {
  try {
    const families = await prisma.family.findMany({
      include: {
        members: true,
        head: true
      }
    });
    res.json(families);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

// GET /api/families/:id - Get family by ID
router.get('/:id', async (req, res) => {
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
        head: true
      }
    });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json(family);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family' });
  }
});

// POST /api/families - Create new family
router.post('/', async (req, res) => {
  try {
    const family = await prisma.family.create({
      data: req.body,
      include: {
        members: true,
        head: true
      }
    });
    res.status(201).json(family);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family' });
  }
});

// PUT /api/families/:id - Update family
router.put('/:id', async (req, res) => {
  try {
    const family = await prisma.family.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        members: true,
        head: true
      }
    });
    res.json(family);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Family not found' });
    }
    res.status(500).json({ error: 'Failed to update family' });
  }
});

// DELETE /api/families/:id - Delete family
router.delete('/:id', async (req, res) => {
  try {
    await prisma.family.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Family not found' });
    }
    res.status(500).json({ error: 'Failed to delete family' });
  }
});

export default router;
