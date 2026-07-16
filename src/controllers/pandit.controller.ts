import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { expertise, experienceYears, bio } = req.body;

    const profile = await prisma.panditProfile.update({
      where: { userId },
      data: {
        expertise,
        experienceYears,
        bio,
      },
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const profile = await prisma.panditProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { panditId: profile.id },
      include: {
        poojaPackage: true,
        customer: { select: { name: true, phone: true } }
      }
    });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const acceptBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    if (typeof bookingId !== 'string') {
      res.status(400).json({ error: 'Invalid Booking ID' });
      return;
    }
    const userId = (req as any).user.userId;
    
    const profile = await prisma.panditProfile.findUnique({ where: { userId } });

    // Validate that the booking belongs to this pandit
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.panditId !== profile?.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    res.json({ message: 'Booking accepted', booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept booking' });
  }
};
