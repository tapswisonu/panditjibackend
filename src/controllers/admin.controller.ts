import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const createPoojaPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, durationMinutes, panditsRequired } = req.body;

    const pooja = await prisma.poojaPackage.create({
      data: {
        name,
        description,
        price,
        durationMinutes,
        panditsRequired,
      },
    });

    res.status(201).json({ message: 'Pooja package created', pooja });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pooja package' });
  }
};

export const getUnverifiedPandits = async (req: Request, res: Response): Promise<void> => {
  try {
    const pandits = await prisma.panditProfile.findMany({
      where: { isVerified: false },
      include: {
        user: { select: { name: true, phone: true, email: true } }
      }
    });
    res.json({ pandits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pandits' });
  }
};

export const verifyPandit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }
    const profile = await prisma.panditProfile.update({
      where: { id },
      data: { isVerified: true },
    });
    res.json({ message: 'Pandit verified successfully', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify pandit' });
  }
};
