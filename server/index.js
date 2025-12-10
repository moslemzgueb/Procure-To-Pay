const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Import Routes
const authRoutes = require('./routes/authRoutes');
const requisitionRoutes = require('./routes/requisitionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const validatorRoutes = require('./routes/validatorRoutes');
const adminRoutes = require('./routes/adminRoutes'); // New
const userRoutes = require('./routes/userRoutes');
const entityRoutes = require('./routes/entityRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/validators', validatorRoutes);
app.use('/api/admin', adminRoutes); // New
app.use('/api/users', userRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/tasks', taskRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.use((req, res) => {
        // Don't interfere with API routes (though they are defined above, so this is safe)
        // If route hasn't been matched by API above, serve React app
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
} else {
    // Basic route for dev
    app.get('/', (req, res) => {
        res.send('Procure to Pay API');
    });
}

// Sync database and start server
sequelize.sync({ alter: false }).then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
    console.error(err.original); // Print original SQL error if available
    process.exit(1);
});
