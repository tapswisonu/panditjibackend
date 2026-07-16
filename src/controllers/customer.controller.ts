import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAvailablePoojas = async (req: Request, res: Response): Promise<void> => {
  try {
    const poojas = await prisma.poojaPackage.findMany();
    res.json({ poojas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch poojas' });
  }
};

export const searchPandits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { expertise } = req.query;
    
    // We can add filtering by expertise later
    const pandits = await prisma.panditProfile.findMany({
      where: {
        isVerified: true,
      },
      include: {
        user: {
          select: { name: true, phone: true }
        },
        reviewsReceived: true,
      }
    });

    res.json({ pandits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search pandits' });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { poojaPackageId, panditId, scheduledDate, locationType, address } = req.body;
    // req.user is added by auth middleware
    const customerId = (req as any).user.userId;

    const pooja = await prisma.poojaPackage.findUnique({ where: { id: poojaPackageId } });
    if (!pooja) {
      res.status(404).json({ error: 'Pooja package not found' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        customerId,
        poojaPackageId,
        panditId, // Can be null if customer wants auto-assignment
        scheduledDate: new Date(scheduledDate),
        locationType,
        address: locationType === 'HOME_VISIT' ? address : null,
        totalAmount: pooja.price,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
