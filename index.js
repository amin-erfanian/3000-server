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
mongoose.connect(`mongodb://localhost:${DB_PORT}/3000`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const authMiddleware = require('./middlewares/authorization');

const authRoutes = require('./routes/authentication');

// E-commerce routes
const brandRoutes = require('./routes/brands');
const colorRoutes = require('./routes/colors');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const sellerRoutes = require('./routes/sellers');
const variantRoutes = require('./routes/variants');
const warrantyRoutes = require('./routes/warranties');

app.use('/auth', authRoutes);

// E-commerce routes (public GET routes)
app.use('/brands', brandRoutes);
app.use('/colors', colorRoutes);
app.use('/products', productRoutes);
app.use('/reviews', reviewRoutes);
app.use('/sellers', sellerRoutes);
app.use('/variants', variantRoutes);
app.use('/warranties', warrantyRoutes);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const cronRunner = require('./cron');
cronRunner();
