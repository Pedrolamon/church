import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/communication/messages - Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/communication/messages/:id - Get message by ID
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: {
        sender: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// POST /api/communication/messages - Create new message
router.post('/messages', async (req, res) => {
  try {
    const message = await prisma.message.create({
      data: req.body,
      include: {
        sender: true
      }
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// PUT /api/communication/messages/:id - Update message
router.put('/messages/:id', async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        sender: true
      }
    });
    res.json(message);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE /api/communication/messages/:id - Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/communication/messages/:id/send - Send message
router.post('/messages/:id/send', async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: {
        status: 'SENT',
        sentAt: new Date()
      },
      include: {
        sender: true
      }
    });

    // Here you would integrate with email/SMS services
    // For now, just mark as sent
    res.json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/communication/events - Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: true,
        ministry: true,
        group: true,
        attendees: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/communication/events/:id - Get event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: true,
        ministry: true,
        group: true,
        attendees: {
          include: {
            member: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/communication/events - Create new event
router.post('/events', async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: req.body,
      include: {
        organizer: true,
        ministry: true,
        group: true
      }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/communication/events/:id - Update event
router.put('/events/:id', async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        organizer: true,
        ministry: true,
        group: true,
        attendees: {
          include: {
            member: true
          }
        }
      }
    });
    res.json(event);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/communication/events/:id - Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/communication/events/:id/attendees - Add attendee to event
router.post('/events/:id/attendees', async (req, res) => {
  try {
    const { memberId, status } = req.body;
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: req.params.id,
        memberId,
        status: status || 'PENDING'
      },
      include: {
        member: true,
        event: true
      }
    });
    res.status(201).json(attendee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attendee' });
  }
});

// PUT /api/communication/events/:id/attendees/:memberId - Update attendee status
router.put('/events/:id/attendees/:memberId', async (req, res) => {
  try {
    const { status } = req.body;
    const attendee = await prisma.eventAttendee.update({
      where: {
        eventId_memberId: {
          eventId: req.params.id,
          memberId: req.params.memberId
        }
      },
      data: { status },
      include: {
        member: true,
        event: true
      }
    });
    res.json(attendee);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    res.status(500).json({ error: 'Failed to update attendee status' });
  }
});

// DELETE /api/communication/events/:id/attendees/:memberId - Remove attendee
router.delete('/events/:id/attendees/:memberId', async (req, res) => {
  try {
    await prisma.eventAttendee.delete({
      where: {
        eventId_memberId: {
          eventId: req.params.id,
          memberId: req.params.memberId
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    res.status(500).json({ error: 'Failed to remove attendee' });
  }
});

// GET /api/communication/calendar - Get calendar events for a date range
router.get('/calendar', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const events = await prisma.event.findMany({
      where: {
        startDate: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      include: {
        organizer: true,
        ministry: true,
        group: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// POST /api/communication/events/:id/register - Register for an event
router.post('/events/:id/register', async (req, res) => {
  try {
    const { memberId, formData } = req.body;

    // Check if event allows registration
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event?.allowRegistration) {
      return res.status(400).json({ error: 'Event does not allow registration' });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if event is full
    const registrationCount = await prisma.eventRegistration.count({
      where: { eventId: req.params.id, status: 'APPROVED' }
    });

    if (event.maxAttendees && registrationCount >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: req.params.id,
        memberId,
        formData: formData ? JSON.stringify(formData) : null,
        paymentAmount: event.registrationFee || undefined
      },
      include: {
        member: true,
        event: true
      }
    });

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// GET /api/communication/events/:id/registrations - Get event registrations
router.get('/events/:id/registrations', async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      include: {
        member: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// PUT /api/communication/events/:id/registrations/:registrationId - Update registration status
router.put('/events/:id/registrations/:registrationId', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.registrationId },
      data: {
        status,
        paymentStatus,
        paymentDate: paymentStatus === 'PAID' ? new Date() : undefined
      },
      include: {
        member: true,
        event: true
      }
    });

    res.json(registration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// POST /api/communication/events/:id/checkin - Check-in attendee
router.post('/events/:id/checkin', async (req, res) => {
  try {
    const { memberId, visitorName, checkedInBy, notes } = req.body;

    const checkIn = await prisma.checkIn.create({
      data: {
        eventId: req.params.id,
        memberId: memberId || null,
        visitorName: visitorName || null,
        checkedInBy,
        notes,
        isVisitor: !memberId
      },
      include: {
        member: true,
        event: true
      }
    });

    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-in attendee' });
  }
});

// PUT /api/communication/events/:id/checkin/:checkInId/checkout - Check-out attendee
router.put('/events/:id/checkin/:checkInId/checkout', async (req, res) => {
  try {
    const checkIn = await prisma.checkIn.update({
      where: { id: req.params.checkInId },
      data: {
        checkOutTime: new Date()
      },
      include: {
        member: true,
        event: true
      }
    });

    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-out attendee' });
  }
});

// GET /api/communication/events/:id/checkins - Get event check-ins
router.get('/events/:id/checkins', async (req, res) => {
  try {
    const checkIns = await prisma.checkIn.findMany({
      where: { eventId: req.params.id },
      include: {
        member: true
      },
      orderBy: {
        checkInTime: 'desc'
      }
    });

    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

// GET /api/communication/events/:id/stats - Get event statistics
router.get('/events/:id/stats', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        registrations: true,
        checkIns: true,
        attendees: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const stats = {
      totalRegistrations: event.registrations.length,
      approvedRegistrations: event.registrations.filter(r => r.status === 'APPROVED').length,
      pendingRegistrations: event.registrations.filter(r => r.status === 'PENDING').length,
      totalCheckIns: event.checkIns.length,
      currentAttendees: event.checkIns.filter(c => !c.checkOutTime).length,
      totalRevenue: event.registrations
        .filter(r => r.paymentStatus === 'PAID')
        .reduce((sum, r) => sum + (r.paymentAmount || 0), 0),
      capacity: event.maxAttendees || 0,
      spotsRemaining: event.maxAttendees ?
        Math.max(0, event.maxAttendees - event.registrations.filter(r => r.status === 'APPROVED').length) : null
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event statistics' });
  }
});

export default router;
