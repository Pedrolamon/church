import { Router } from 'express';
import { prisma } from '../index.js';


const router = Router();

// GET /api/groups/meetings - Get all group meetings
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await prisma.groupMeeting.findMany({
      include: {
        group: {
          include: {
            leader: true
          }
        },
        attendance: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        meetingDate: 'desc'
      }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// GET /api/groups/:groupId/meetings - Get meetings for a specific group
router.get('/:groupId/meetings', async (req, res) => {
  try {
    const meetings = await prisma.groupMeeting.findMany({
      where: { groupId: req.params.groupId },
      include: {
        attendance: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        meetingDate: 'desc'
      }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group meetings' });
  }
});

// POST /api/groups/:groupId/meetings - Create new meeting
router.post('/:groupId/meetings', async (req, res) => {
  try {
    const { title, description, meetingDate, location, agenda, notes } = req.body;

    const meeting = await prisma.groupMeeting.create({
      data: {
        groupId: req.params.groupId,
        title,
        description,
        meetingDate: new Date(meetingDate),
        location,
        agenda: agenda ? JSON.stringify(agenda) : null,
        notes
      },
      include: {
        group: {
          include: {
            leader: true
          }
        }
      }
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// PUT /api/groups/meetings/:meetingId - Update meeting
router.put('/meetings/:meetingId', async (req, res) => {
  try {
    const { title, description, meetingDate, location, agenda, notes } = req.body;

    const meeting = await prisma.groupMeeting.update({
      where: { id: req.params.meetingId },
      data: {
        title,
        description,
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
        location,
        agenda: agenda ? JSON.stringify(agenda) : undefined,
        notes
      },
      include: {
        group: {
          include: {
            leader: true
          }
        },
        attendance: {
          include: {
            member: true
          }
        }
      }
    });

    res.json(meeting);
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// DELETE /api/groups/meetings/:meetingId - Delete meeting
router.delete('/meetings/:meetingId', async (req, res) => {
  try {
    await prisma.groupMeeting.delete({
      where: { id: req.params.meetingId }
    });
    res.status(204).send();
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// POST /api/groups/meetings/:meetingId/attendance - Record attendance
router.post('/meetings/:meetingId/attendance', async (req, res) => {
  try {
    const { memberId, status, notes } = req.body;

    const attendance = await prisma.groupAttendance.create({
      data: {
        meetingId: req.params.meetingId,
        memberId,
        status: status || 'PRESENT',
        notes
      },
      include: {
        member: true,
        meeting: {
          include: {
            group: true
          }
        }
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    if ((error as { code: string }).code === 'P2002') {
      return res.status(400).json({ error: 'Attendance already recorded for this member' });
    }
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// PUT /api/groups/meetings/:meetingId/attendance/:memberId - Update attendance
router.put('/meetings/:meetingId/attendance/:memberId', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const attendance = await prisma.groupAttendance.update({
      where: {
        meetingId_memberId: {
          meetingId: req.params.meetingId,
          memberId: req.params.memberId
        }
      },
      data: {
        status,
        notes
      },
      include: {
        member: true,
        meeting: {
          include: {
            group: true
          }
        }
      }
    });

    res.json(attendance);
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// DELETE /api/groups/meetings/:meetingId/attendance/:memberId - Remove attendance
router.delete('/meetings/:meetingId/attendance/:memberId', async (req, res) => {
  try {
    await prisma.groupAttendance.delete({
      where: {
        meetingId_memberId: {
          meetingId: req.params.meetingId,
          memberId: req.params.memberId
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    if ((error as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(500).json({ error: 'Failed to remove attendance' });
  }
});

// GET /api/groups/meetings/:meetingId/attendance - Get meeting attendance
router.get('/meetings/:meetingId/attendance', async (req, res) => {
  try {
    const attendance = await prisma.groupAttendance.findMany({
      where: { meetingId: req.params.meetingId },
      include: {
        member: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// GET /api/groups/stats/overview - Get group statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalGroups, totalMeetings, totalAttendance, groupStats] = await Promise.all([
      prisma.group.count(),
      prisma.groupMeeting.count(),
      prisma.groupAttendance.count(),
      prisma.group.findMany({
        include: {
          _count: {
            select: {
              members: true,
              meetings: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalGroups,
      totalMeetings,
      totalAttendance,
      averageAttendance: totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0,
      groups: groupStats.map(group => ({
        id: group.id,
        name: group.name,
        type: group.type,
        members: group._count.members,
        meetings: group._count.meetings
      }))
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group statistics' });
  }
});

// POST /api/groups/meetings/:meetingId/quick-attendance - Quick attendance recording
router.post('/meetings/:meetingId/quick-attendance', async (req, res) => {
  try {
    const { presentMemberIds, absentMemberIds, lateMemberIds } = req.body;

    // Get all group members
    const meeting = await prisma.groupMeeting.findUnique({
      where: { id: req.params.meetingId },
      include: {
        group: {
          include: {
            members: {
              include: {
                member: true
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const attendanceRecords: any[] = [];

    // Record attendance for all group members
    for (const groupMember of meeting.group.members) {
      let status = 'ABSENT';

      if (presentMemberIds?.includes(groupMember.memberId)) {
        status = 'PRESENT';
      } else if (lateMemberIds?.includes(groupMember.memberId)) {
        status = 'LATE';
      } else if (absentMemberIds?.includes(groupMember.memberId)) {
        status = 'ABSENT';
      }

      const attendance = await prisma.groupAttendance.upsert({
        where: {
          meetingId_memberId: {
            meetingId: req.params.meetingId,
            memberId: groupMember.memberId
          }
        },
        update: {
          status: status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
        },
        create: {
          meetingId: req.params.meetingId,
          memberId: groupMember.memberId,
          status: status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
        },
        include: {
          member: true
        }
      });
      

      attendanceRecords.push(attendance);
    }

    res.json({
      message: 'Attendance recorded successfully',
      records: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record quick attendance' });
  }
});

export default router;
