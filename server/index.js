// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler.middleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
db.sequelize.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });

// Routes
require('./routes/auth.routes')(app);
require('./routes/course.routes')(app);
require('./routes/user.routes')(app);
require('./routes/evaluation.routes')(app);
require('./routes/report.routes')(app);

// Catch-all handler for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initial data seeding (for development)
const initData = async () => {
  try {
    // Check if admin user exists
    const adminExists = await db.users.findOne({
      where: { username: 'admin' }
    });

    if (!adminExists) {
      // Create admin user
      await db.users.create({
        username: 'admin',
        email: 'admin@marabes.academy',
        password: require('bcryptjs').hashSync('admin123', 8),
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Demo data creation for evaluation template
    // ...
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

// Run data seeding after database sync
db.sequelize.sync().then(() => {
  initData();
});