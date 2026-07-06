import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Route imports
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import habitRoutes from './routes/habits.js';
import goalRoutes from './routes/goals.js';
import wealthRoutes from './routes/wealth.js';
import feedbackRoutes from './routes/feedback.js';
import billRoutes from './routes/bills.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Helmet HTTP Security Headers Shield
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for local development to allow inline Swagger JS/CSS assets
  })
);

// Swagger Documentation Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinSight API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API documentation and interactive test sandboxes for fin-sight.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate limiting security configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Connect to MongoDB & Start Schedulers
import { Transaction } from './models/Schemas.js';

const processRecurringTransactions = async () => {
  try {
    const recurringTxs = await Transaction.find({ recurring: true, recurringPeriod: { $ne: 'none' } });
    if (recurringTxs.length === 0) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    let count = 0;

    for (const tx of recurringTxs) {
      const matches = await Transaction.find({
        userId: tx.userId,
        category: tx.category,
        note: tx.note,
        type: tx.type
      }).sort({ date: -1 });

      const latestTx = matches[0];
      if (!latestTx) continue;

      const latestDate = new Date(latestTx.date);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - latestDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let shouldDuplicate = false;
      if (tx.recurringPeriod === 'daily' && diffDays >= 1) {
        shouldDuplicate = true;
      } else if (tx.recurringPeriod === 'weekly' && diffDays >= 7) {
        shouldDuplicate = true;
      } else if (tx.recurringPeriod === 'monthly' && diffDays >= 30) {
        shouldDuplicate = true;
      }

      if (shouldDuplicate) {
        const newTx = new Transaction({
          userId: tx.userId,
          date: todayStr,
          amount: tx.amount,
          category: tx.category,
          type: tx.type,
          note: tx.note,
          recurring: true,
          recurringPeriod: tx.recurringPeriod
        });
        await newTx.save();
        count++;
      }
    }
    if (count > 0) {
      console.log(`[RECURRING SCHEDULER] Auto-processed and duplicated ${count} active recurring transactions.`);
    }
  } catch (err) {
    console.error('Failed to run recurring transactions scheduler:', err.message);
  }
};

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight')
  .then(() => {
    console.log('Connected to MongoDB database successfully');
    processRecurringTransactions();
  })
  .catch((err) => {
    console.error('MongoDB database connection error:', err.message);
    console.log('Ensure MongoDB service is running locally, or supply a valid MONGODB_URI in server/.env');
  });

// Bind routers to API namespaces
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/wealth', wealthRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bills', billRoutes);

// Server status endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
