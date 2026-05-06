const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const mongoose = require('mongoose');

const DB_PORT = process.env.DB_PORT;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

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
const categoryRoutes = require('./routes/categories');

// Modular panel routes
const buyerProductRoutes = require('./routes/buyer/products');
const buyerVariantRoutes = require('./routes/buyer/variants');
const sellerProductRoutes = require('./routes/seller/products');
const sellerVariantRoutes = require('./routes/seller/variants');
const adminProductRoutes = require('./routes/admin/products');
const adminVariantRoutes = require('./routes/admin/variants');

app.use('/auth', authRoutes);

// E-commerce routes (public GET routes)
app.use('/brands', brandRoutes);
app.use('/colors', colorRoutes);
app.use('/products', productRoutes);
app.use('/reviews', reviewRoutes);
app.use('/sellers', sellerRoutes);
app.use('/variants', variantRoutes);
app.use('/warranties', warrantyRoutes);
app.use('/categories', categoryRoutes);

// Modular panel routes
app.use('/buyer/products', buyerProductRoutes);
app.use('/buyer/variants', buyerVariantRoutes);
app.use('/seller/products', sellerProductRoutes);
app.use('/seller/variants', sellerVariantRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/admin/variants', adminVariantRoutes);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
