import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/inventory/categories - Get all inventory categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/inventory/categories - Create new category
router.post('/categories', async (req, res) => {
  try {
    const category = await prisma.inventoryCategory.create({
      data: req.body
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/inventory/categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await prisma.inventoryCategory.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/inventory/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    await prisma.inventoryCategory.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// GET /api/inventory/items - Get all inventory items
router.get('/items', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        category: true,
        movements: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/inventory/items/:id - Get item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        movements: {
          include: {
            performed: true,
            event: true,
            ministry: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/inventory/items - Create new item
router.post('/items', async (req, res) => {
  try {
    const { categoryId, name, description, minStock, maxStock, unit, location, supplier, unitCost } = req.body;

    const item = await prisma.inventoryItem.create({
      data: {
        categoryId,
        name,
        description,
        minStock: minStock || 0,
        maxStock,
        unit: unit || 'unidade',
        location,
        supplier,
        unitCost,
        totalValue: unitCost ? 0 : null
      },
      include: {
        category: true
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/inventory/items/:id - Update item
router.put('/items/:id', async (req, res) => {
  try {
    const { name, description, categoryId, minStock, maxStock, unit, location, supplier, unitCost } = req.body;

    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        categoryId,
        minStock,
        maxStock,
        unit,
        location,
        supplier,
        unitCost,
        totalValue: unitCost ? undefined : null // Will be recalculated
      },
      include: {
        category: true
      }
    });

    res.json(item);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/inventory/items/:id - Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.inventoryItem.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/inventory/items/:id/movements - Record inventory movement
router.post('/items/:id/movements', async (req, res) => {
  try {
    const { type, quantity, reason, notes, eventId, ministryId, performedBy } = req.body;

    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Calculate new stock
    let newStock = item.currentStock;
    if (type === 'IN' || type === 'RETURN') {
      newStock += quantity;
    } else if (type === 'OUT' || type === 'ADJUST') {
      newStock -= quantity;
      if (newStock < 0) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }

    // Create movement
    const movement = await prisma.inventoryMovement.create({
      data: {
        itemId: req.params.id,
        type,
        quantity,
        reason,
        notes,
        eventId,
        ministryId,
        performedBy
      },
      include: {
        performed: true,
        event: true,
        ministry: true
      }
    });

    // Update item stock and total value
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: {
        currentStock: newStock,
        totalValue: item.unitCost ? newStock * item.unitCost : null
      }
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record movement' });
  }
});

// GET /api/inventory/items/:id/movements - Get item movements
router.get('/items/:id/movements', async (req, res) => {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: { itemId: req.params.id },
      include: {
        performed: true,
        event: true,
        ministry: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// GET /api/inventory/movements - Get all movements
router.get('/movements', async (req, res) => {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        item: {
          include: {
            category: true
          }
        },
        performed: true,
        event: true,
        ministry: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// GET /api/inventory/stats/overview - Get inventory statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalItems, totalCategories, lowStockItems, totalValue] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryCategory.count(),
      prisma.inventoryItem.count({
        where: {
          currentStock: {
            lte: prisma.inventoryItem.fields.minStock
          }
        }
      }),
      prisma.inventoryItem.aggregate({
        _sum: {
          totalValue: true
        }
      })
    ]);

    const stats = {
      totalItems,
      totalCategories,
      lowStockItems,
      totalValue: totalValue._sum.totalValue || 0,
      itemsByCategory: await prisma.inventoryCategory.findMany({
        include: {
          _count: {
            select: { items: true }
          }
        }
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory statistics' });
  }
});

// GET /api/inventory/alerts/low-stock - Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        currentStock: {
          lte: prisma.inventoryItem.fields.minStock
        }
      },
      include: {
        category: true
      },
      orderBy: {
        currentStock: 'asc'
      }
    });

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// POST /api/inventory/items/:id/adjust-stock - Adjust stock quantity
router.post('/items/:id/adjust-stock', async (req, res) => {
  try {
    const { newStock, reason, notes, performedBy } = req.body;

    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const difference = newStock - item.currentStock;

    // Create adjustment movement
    const movement = await prisma.inventoryMovement.create({
      data: {
        itemId: req.params.id,
        type: 'ADJUST',
        quantity: Math.abs(difference),
        reason: reason || 'Ajuste de estoque',
        notes,
        performedBy
      }
    });

    // Update item stock
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: {
        currentStock: newStock,
        totalValue: item.unitCost ? newStock * item.unitCost : null
      },
      include: {
        category: true
      }
    });

    res.json({
      item: updatedItem,
      movement,
      adjustment: difference
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

export default router;
