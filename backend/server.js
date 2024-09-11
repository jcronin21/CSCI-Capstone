const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://croninjazz21:12302409Jc!@cluster0.9kcvxym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Example route
app.get('/', (req, res) => {
  res.send('Hello from the backend connected to MongoDB Atlas!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
