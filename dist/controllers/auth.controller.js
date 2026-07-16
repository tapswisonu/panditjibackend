import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
export const register = async (req, res) => {
    try {
        const { phone, email, name, password, role } = req.body;
        if (!phone || !password || !name) {
            res.status(400).json({ error: 'Phone, name, and password are required' });
            return;
        }
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ phone }, { email: email || undefined }],
            },
        });
        if (existingUser) {
            res.status(400).json({ error: 'User with this phone or email already exists' });
            return;
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create User
        const newUser = await prisma.user.create({
            data: {
                phone,
                email: email || null,
                name,
                password: hashedPassword,
                role: role || 'CUSTOMER',
            },
        });
        if (newUser.role === 'PANDIT') {
            await prisma.panditProfile.create({
                data: {
                    userId: newUser.id,
                },
            });
        }
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            res.status(400).json({ error: 'Phone and password are required' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=auth.controller.js.map