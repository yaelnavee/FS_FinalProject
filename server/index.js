const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
console.log("Trying to load /api/orders route...");//
app.use('/api/orders', orderRoutes);

app.use('/api/test', (req, res) => {
  res.json({ msg: "Hello from test" });
});



// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Pizza Shop API is running!' });
});

const s = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

