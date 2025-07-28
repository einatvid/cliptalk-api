const express = require('express');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// In-memory storage for demo purposes
let users = [];
let inventory = [];
let workReports = [];
let reminders = [];
let customerReports = [];

// User authentication
app.post('/api/register', (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'המשתמש כבר קיים' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, hash this
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.json({ message: 'המשתמש נרשם בהצלחה', user: { ...newUser, password: undefined } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'פרטי התחברות שגויים' });
  }
  
  res.json({ message: 'התחברות מוצלחת', user: { ...user, password: undefined } });
});

// Inventory management
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const { name, serialNumber, status, quantity } = req.body;
  
  const newItem = {
    id: Date.now().toString(),
    name,
    serialNumber,
    status,
    quantity: quantity || 1,
    createdAt: new Date().toISOString()
  };
  
  inventory.push(newItem);
  res.json(newItem);
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  inventory = inventory.filter(item => item.id !== id);
  res.json({ message: 'הפריט הוסר בהצלחה' });
});

// Work documentation
app.post('/api/work-reports', upload.single('photo'), (req, res) => {
  const { clientName, address, description, signature } = req.body;
  
  const newReport = {
    id: Date.now().toString(),
    clientName,
    address,
    description,
    signature,
    photo: req.file ? req.file.filename : null,
    createdAt: new Date().toISOString()
  };
  
  workReports.push(newReport);
  res.json(newReport);
});

app.get('/api/work-reports', (req, res) => {
  res.json(workReports);
});

// Reminders
app.post('/api/reminders', (req, res) => {
  const { content, date } = req.body;
  
  const newReminder = {
    id: Date.now().toString(),
    content,
    date,
    createdAt: new Date().toISOString()
  };
  
  reminders.push(newReminder);
  res.json(newReminder);
});

app.get('/api/reminders', (req, res) => {
  res.json(reminders);
});

// Customer reports
app.post('/api/customer-reports', (req, res) => {
  const { title, description } = req.body;
  
  const newReport = {
    id: Date.now().toString(),
    title,
    description,
    status: 'פתוח',
    createdAt: new Date().toISOString()
  };
  
  customerReports.push(newReport);
  res.json(newReport);
});

app.get('/api/customer-reports', (req, res) => {
  res.json(customerReports);
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Catch all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});