const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const parkRoutes = require('./routes/parkRoutes');
const activityRoutes = require('./routes/activityRoutes');
const touristRoutes = require('./routes/touristRoutes');
const packageRoutes = require('./routes/packageRoutes');
const handoffRoutes = require('./routes/handoffRoutes');
const packageSpendingRoutes = require('./routes/packageSpendingRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Thiqa API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/handoffs', handoffRoutes);
app.use('/api/package-spending', packageSpendingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/salary-payments', salaryRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

module.exports = app;
