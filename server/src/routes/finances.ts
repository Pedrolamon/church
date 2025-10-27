import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/finances/donations - Get all donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        member: true,
        ministry: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// GET /api/finances/donations/:id - Get donation by ID
router.get('/donations/:id', async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: {
        member: true,
        ministry: true
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// POST /api/finances/donations - Create new donation
router.post('/donations', async (req, res) => {
  try {
    const donation = await prisma.donation.create({
      data: req.body,
      include: {
        member: true,
        ministry: true
      }
    });
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// GET /api/finances/expenses - Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        ministry: true,
        approved: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/finances/expenses - Create new expense
router.post('/expenses', async (req, res) => {
  try {
    const expense = await prisma.expense.create({
      data: req.body,
      include: {
        ministry: true,
        approved: true
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// GET /api/finances/budgets - Get all ministry budgets
router.get('/budgets', async (req, res) => {
  try {
    const budgets = await prisma.ministryBudget.findMany({
      include: {
        ministry: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/finances/budgets - Create new budget
router.post('/budgets', async (req, res) => {
  try {
    const budget = await prisma.ministryBudget.create({
      data: req.body,
      include: {
        ministry: true
      }
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// GET /api/finances/reports/summary - Get financial summary
router.get('/reports/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = startDate && endDate ? {
      date: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    } : {};

    const [totalDonations, totalExpenses, donationsByType, expensesByCategory] = await Promise.all([
      prisma.donation.aggregate({
        where: dateFilter,
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: dateFilter,
        _sum: { amount: true }
      }),
      prisma.donation.groupBy({
        by: ['type'],
        where: dateFilter,
        _sum: { amount: true }
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: dateFilter,
        _sum: { amount: true }
      })
    ]);

    res.json({
      totalDonations: totalDonations._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      balance: (totalDonations._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      donationsByType,
      expensesByCategory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate financial summary' });
  }
});

// GET /api/finances/reports/ministry-breakdown - Get ministry financial breakdown
router.get('/reports/ministry-breakdown', async (req, res) => {
  try {
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const ministries = await prisma.ministry.findMany({
      include: {
        donations: {
          where: {
            date: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          }
        },
        expenses: {
          where: {
            date: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          }
        },
        budgets: {
          where: {
            year: currentYear,
            month: currentMonth
          }
        }
      }
    });

    const breakdown = ministries.map(ministry => ({
      ministry: ministry.name,
      donations: ministry.donations.reduce((sum, d) => sum + d.amount, 0),
      expenses: ministry.expenses.reduce((sum, e) => sum + e.amount, 0),
      budget: ministry.budgets[0]?.allocated || 0,
      balance: ministry.donations.reduce((sum, d) => sum + d.amount, 0) - ministry.expenses.reduce((sum, e) => sum + e.amount, 0)
    }));

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ministry breakdown' });
  }
});

export default router;
