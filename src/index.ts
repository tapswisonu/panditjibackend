import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pandit Ji API is running ✅', port: PORT });
});

// Routes
app.use('/api/v1/auth', authRoutes);

const server = app.listen(PORT, () => {
  console.log(`🚀 Pandit Ji API running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill other processes and retry.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
