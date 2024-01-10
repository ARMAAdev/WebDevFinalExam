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

app.use(session({
    secret: 'finalexam',
    resave: false,
    saveUninitialized: true
  }));
 
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

const sessionChecker = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }};

app.get('/login', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/dashboard');
    } else {
        res.render('index'); 
    }
    });

app.get('/dashboard', sessionChecker, (req, res) => {
    res.render('dashboard'); 
    });
      

app.get('/login-history', sessionChecker, (req, res) => {
    res.render('login-history'); 
    });


app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true  });
    });



    
  app.post('/api/adduser', sessionChecker, (req, res) => {
    const { username, password, departmentId } = req.body;
    const query = 'INSERT INTO users (username, password, department_id) VALUES (?, ?, ?)';
  
    connection.query(query, [username, password, departmentId], (err, result) => {
      if (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ success: false, message: 'Error adding user' });
      } else {
        res.json({ success: true, message: 'User added successfully', userId: result.insertId });
      }
    });
  });
  

  app.post('/api/adddepartment', sessionChecker, (req, res) => {
    const { departmentName } = req.body;
    const query = 'INSERT INTO departments (Name) VALUES (?)';
  
    connection.query(query, [departmentName], (err, result) => {
      if (err) {
        console.error('Error adding department:', err);
        res.status(500).json({ success: false, message: 'Error adding department' });
      } else {
        res.json({ success: true, message: 'Department added successfully', departmentId: result.insertId });
      }
    });
  });
  

  app.post('/api/deleteuser', sessionChecker, (req, res) => {
    const { userId } = req.body;
    const query = 'DELETE FROM users WHERE id = ?';
  
    connection.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Error deleting user' });
      } else if (result.affectedRows > 0) {
        res.json({ success: true, message: 'User deleted successfully' });
      } else {
        res.json({ success: false, message: 'User not found' });
      }
    });
  });
  

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    connection.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
      } else if (results.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
  
        connection.query('INSERT INTO log (Username, LoginDate) VALUES (?, NOW())', [username], (err, result) => {
          if (err) {
            console.error('Error inserting log:', err);
            res.status(500).json({ success: false, message: 'Error logging login' });
          } else {
            res.json({ success: true, message: 'Login successful' });
          }
        });
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
    });
  });
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("http://localhost:3000");
});
