const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandlerMiddleware = require('./middlewares/error-handler');

require('dotenv').config();
const mongoose = require('mongoose');

const DB_PORT = process.env.DB_PORT;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(`mongodb://localhost:${DB_PORT}/wallet`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const authMiddleware = require('./middlewares/authorization');

const subscriptionRoutes = require('./routes/subscriptions');
const appInfoRoutes = require('./routes/app-info');
const ticketRoutes = require('./routes/ticket');
const assetsValueRoutes = require('./routes/assets-value');
const assetsRoutes = require('./routes/assets');
const transactionRoutes = require('./routes/transactions');
const debtsRoutes = require('./routes/debts');
const categoryRoutes = require('./routes/categories');
const contactRoutes = require('./routes/contacts');
const resourceRoutes = require('./routes/resources');
const authRoutes = require('./routes/authentication');
const profileRoutes = require('./routes/profile');
const loanRoutes = require('./routes/loans');
const budgetRoutes = require('./routes/budget');

app.use('/', subscriptionRoutes);
app.use('/auth', authRoutes);
app.use('/app-info', appInfoRoutes);
app.use('/ticket', ticketRoutes);
app.use('/assets', assetsValueRoutes);
app.use('/assets', authMiddleware, assetsRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/transactions', authMiddleware, transactionRoutes);
app.use('/debts', authMiddleware, debtsRoutes);
app.use('/categories', authMiddleware, categoryRoutes);
app.use('/contacts', authMiddleware, contactRoutes);
app.use('/resources', authMiddleware, resourceRoutes);
app.use('/loans', authMiddleware, loanRoutes);
app.use('/budgets', authMiddleware, budgetRoutes);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const cronRunner = require('./cron');
cronRunner();
