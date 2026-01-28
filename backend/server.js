require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { swaggerUi, swaggerSpec } = require("./config/swagger.js");
const app = express();
const multer = require('multer');
const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger UI setup
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', require('./apps/routes/employe.route'));
app.use('/api', require('./apps/routes/ppn.route.js'));
app.use('/api', require('./apps/routes/rapport.route.js'))

// Testing API
app.get('/', (req, res) => {
    res.json({ message: 'Hello from API' });
});

// Database Sync
const db = require('./apps/models/index.js');

// Port
const PORT = process.env.PORT || 8001;
const HOST = process.env.HOST || 'localhost';

// Server
db.sequelize.sync({ force: false }).then(() => {
    console.log('connected...');
    console.log('yes re-sync done!');
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}/api/docs`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
});