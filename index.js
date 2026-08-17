const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();
const mongoose = require('mongoose');

const DB_PORT = process.env.DB_PORT;
const DB_PASS = process.env.DB_PASS;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(`mongodb://admin:${DB_PASS}@localhost:${DB_PORT}/store3000?authSource=admin`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const authMiddleware = require('./middlewares/authorization');

// Auth routes
const buyerAuthRoutes = require('./routes/authentication');
const sellerAuthRoutes = require('./routes/seller/authentication');
const adminAuthRoutes = require('./routes/admin/authentication');

app.use('/auth', buyerAuthRoutes);
app.use('/seller/auth', sellerAuthRoutes);
app.use('/admin/auth', adminAuthRoutes);

// Public routes
const brandRoutes = require('./routes/brands');
const colorRoutes = require('./routes/colors');
const reviewRoutes = require('./routes/reviews');
const warrantyRoutes = require('./routes/warranties');
const categoryRoutes = require('./routes/categories');
const buyerProductRoutes = require('./routes/buyer/products');
const buyerVariantRoutes = require('./routes/buyer/variants');
const processRuleRoutes = require('./routes/process-rule');

app.use('/brands', brandRoutes);
app.use('/colors', colorRoutes);
app.use('/reviews', reviewRoutes);
app.use('/warranties', warrantyRoutes);
app.use('/categories', categoryRoutes);
app.use('/process-rules', processRuleRoutes);
app.use('/products', buyerProductRoutes);
app.use('/variants', buyerVariantRoutes);

// Seller routes
const sellerProductRoutes = require('./routes/seller/products');
const sellerVariantRoutes = require('./routes/seller/variants');
const sellerProfileRoutes = require('./routes/seller/profile');
const sellerStorageRoutes = require('./routes/seller/storage');

app.use('/seller/products', sellerProductRoutes);
app.use('/seller/variants', sellerVariantRoutes);
app.use('/seller/profile', sellerProfileRoutes);
app.use('/seller/storage', sellerStorageRoutes);

// Admin routes
const adminProductRoutes = require('./routes/admin/products');
const adminVariantRoutes = require('./routes/admin/variants');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminAttributeRoutes = require('./routes/admin/attributes');
const adminProcessRuleRoutes = require('./routes/admin/process-rule');

app.use('/admin/products', adminProductRoutes);
app.use('/admin/variants', adminVariantRoutes);
app.use('/admin/categories', adminCategoryRoutes);
app.use('/admin/attributes', adminAttributeRoutes);
app.use('/admin/process-rules', adminProcessRuleRoutes);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
