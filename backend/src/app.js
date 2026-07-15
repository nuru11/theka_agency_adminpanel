const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const touristRoutes = require('./routes/touristRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const parkRoutes = require('./routes/parkRoutes');
const packageRoutes = require('./routes/packageRoutes');
const userRoutes = require('./routes/userRoutes');
const handoffRoutes = require('./routes/handoffRoutes');
const walletRoutes = require('./routes/walletRoutes');
const packageSpendingRoutes = require('./routes/packageSpendingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Thiqa API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/handoffs', handoffRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/package-spendings', packageSpendingRoutes);

app.use(errorHandler);

module.exports = app;
