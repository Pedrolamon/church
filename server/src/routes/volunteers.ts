import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/volunteers/service-areas - Get all service areas
router.get('/service-areas', async (req, res) => {
  try {
    const serviceAreas = await prisma.serviceArea.findMany({
      include: {
        ministry: true,
        volunteers: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(serviceAreas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service areas' });
  }
});

// GET /api/volunteers/service-areas/:id - Get service area by ID
router.get('/service-areas/:id', async (req, res) => {
  try {
    const serviceArea = await prisma.serviceArea.findUnique({
      where: { id: req.params.id },
      include: {
        ministry: true,
        volunteers: {
          include: {
            member: true,
            assignments: {
              include: {
                event: true
              }
            }
          }
        }
      }
    });

    if (!serviceArea) {
      return res.status(404).json({ error: 'Service area not found' });
    }

    res.json(serviceArea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service area' });
  }
});

// POST /api/volunteers/service-areas - Create new service area
router.post('/service-areas', async (req, res) => {
  try {
    const serviceArea = await prisma.serviceArea.create({
      data: req.body,
      include: {
        ministry: true
      }
    });
    res.status(201).json(serviceArea);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Service area name already exists' });
    }
    res.status(500).json({ error: 'Failed to create service area' });
  }
});

// PUT /api/volunteers/service-areas/:id - Update service area
router.put('/service-areas/:id', async (req, res) => {
  try {
    const serviceArea = await prisma.serviceArea.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        ministry: true
      }
    });
    res.json(serviceArea);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Service area not found' });
    }
    res.status(500).json({ error: 'Failed to update service area' });
  }
});

// DELETE /api/volunteers/service-areas/:id - Delete service area
router.delete('/service-areas/:id', async (req, res) => {
  try {
    await prisma.serviceArea.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Service area not found' });
    }
    res.status(500).json({ error: 'Failed to delete service area' });
  }
});

// GET /api/volunteers - Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        member: true,
        serviceArea: {
          include: {
            ministry: true
          }
        },
        assignments: {
          include: {
            event: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// GET /api/volunteers/:id - Get volunteer by ID
router.get('/:id', async (req, res) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: req.params.id },
      include: {
        member: true,
        serviceArea: {
          include: {
            ministry: true
          }
        },
        assignments: {
          include: {
            event: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

// POST /api/volunteers - Register as volunteer
router.post('/', async (req, res) => {
  try {
    const { memberId, serviceAreaId, availability, skills, experience } = req.body;

    const volunteer = await prisma.volunteer.create({
      data: {
        memberId,
        serviceAreaId,
        availability: availability ? JSON.stringify(availability) : null,
        skills: skills ? JSON.stringify(skills) : null,
        experience
      },
      include: {
        member: true,
        serviceArea: {
          include: {
            ministry: true
          }
        }
      }
    });

    res.status(201).json(volunteer);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Member is already registered for this service area' });
    }
    res.status(500).json({ error: 'Failed to register volunteer' });
  }
});

// PUT /api/volunteers/:id - Update volunteer
router.put('/:id', async (req, res) => {
  try {
    const { availability, skills, experience, status } = req.body;

    const volunteer = await prisma.volunteer.update({
      where: { id: req.params.id },
      data: {
        availability: availability ? JSON.stringify(availability) : undefined,
        skills: skills ? JSON.stringify(skills) : undefined,
        experience,
        status
      },
      include: {
        member: true,
        serviceArea: {
          include: {
            ministry: true
          }
        }
      }
    });

    res.json(volunteer);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

// DELETE /api/volunteers/:id - Remove volunteer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.volunteer.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.status(500).json({ error: 'Failed to remove volunteer' });
  }
});

// POST /api/volunteers/:id/assignments - Create volunteer assignment
router.post('/:id/assignments', async (req, res) => {
  try {
    const { eventId, task, date, startTime, endTime, notes } = req.body;

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        volunteerId: req.params.id,
        eventId,
        task,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes
      },
      include: {
        volunteer: {
          include: {
            member: true,
            serviceArea: true
          }
        },
        event: true
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// PUT /api/volunteers/:id/assignments/:assignmentId - Update assignment
router.put('/:id/assignments/:assignmentId', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const assignment = await prisma.volunteerAssignment.update({
      where: { id: req.params.assignmentId },
      data: {
        status,
        notes
      },
      include: {
        volunteer: {
          include: {
            member: true,
            serviceArea: true
          }
        },
        event: true
      }
    });

    res.json(assignment);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// DELETE /api/volunteers/:id/assignments/:assignmentId - Delete assignment
router.delete('/:id/assignments/:assignmentId', async (req, res) => {
  try {
    await prisma.volunteerAssignment.delete({
      where: { id: req.params.assignmentId }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// GET /api/volunteers/stats/overview - Get volunteer statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalVolunteers, activeVolunteers, serviceAreaStats, upcomingAssignments] = await Promise.all([
      prisma.volunteer.count(),
      prisma.volunteer.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.serviceArea.findMany({
        include: {
          _count: {
            select: { volunteers: true }
          }
        }
      }),
      prisma.volunteerAssignment.count({
        where: {
          date: {
            gte: new Date()
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      })
    ]);

    const stats = {
      totalVolunteers,
      activeVolunteers,
      serviceAreaBreakdown: serviceAreaStats.map(area => ({
        name: area.name,
        count: area._count.volunteers
      })),
      upcomingAssignments
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
  }
});

// GET /api/volunteers/availability/:memberId - Get member availability
router.get('/availability/:memberId', async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      where: { memberId: req.params.memberId },
      include: {
        serviceArea: true
      }
    });

    const availability = volunteers.map(volunteer => ({
      serviceArea: volunteer.serviceArea.name,
      availability: volunteer.availability ? JSON.parse(volunteer.availability) : null,
      skills: volunteer.skills ? JSON.parse(volunteer.skills) : null
    }));

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member availability' });
  }
});

// PUT /api/volunteers/availability/:memberId - Update member availability
router.put('/availability/:memberId', async (req, res) => {
  try {
    const { serviceAreaId, availability, skills } = req.body;

    const volunteer = await prisma.volunteer.upsert({
      where: {
        memberId_serviceAreaId: {
          memberId: req.params.memberId,
          serviceAreaId
        }
      },
      update: {
        availability: availability ? JSON.stringify(availability) : null,
        skills: skills ? JSON.stringify(skills) : null
      },
      create: {
        memberId: req.params.memberId,
        serviceAreaId,
        availability: availability ? JSON.stringify(availability) : null,
        skills: skills ? JSON.stringify(skills) : null
      },
      include: {
        serviceArea: true
      }
    });

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

export default router;
