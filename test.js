const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs'); 
const mysql = require('mysql2');
const session = require('express-session');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Initialize session middleware


// Database connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', 
  password: '12812', 
  database: 'exam', 
  port: 3307
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Session check middleware
const sessionChecker = (req, res, next) => {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Login route
app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/dashboard');
  } else {
    res.render('index'); 
  }
});

// Dashboard route
app.get('/dashboard', sessionChecker, (req, res) => {
  res.render('dashboard'); 
});

// Login history route
app.get('/login-history', sessionChecker, (req, res) => {
  res.render('login-history'); 
});

// Logout API
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Add department API
app.post('/api/adddepartment', sessionChecker, (req, res) => {
  // Add department logic
});

// Add user API
app.post('/api/adduser', sessionChecker, (req, res) => {
  // Add user logic
});

// Delete user API
app.post('/api/deleteuser', sessionChecker, (req, res) => {
  // Delete user logic
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  connection.query("SELECT * FROM Employees where Username = ? AND Password = ? ", [username, password], (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Error fetching users' });
    } else if (results.length > 0){
      req.session.loggedin = true;
      req.session.username = username;
      // Add login to log table
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
