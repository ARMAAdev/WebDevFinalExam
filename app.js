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

app.post('/api/add_department', (req, res) => {
    const { department_name } = req.body;
  
    connection.query(
      'INSERT INTO departments (departments) VALUES (?)',
      [department_name],
      (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).json({ error: 'Error inserting data' });
          return;
        }
  
        if(result.affectedRows == 1)
          res.status(200).json({ success: true, id: result.insertId, departmentName: department_name });
      }
    );
  
  });

  app.get('/api/deleteuser', (req, res) => {
    connection.query('DELETE FROM employees WHERE Id = ?', [req.params.EmployeeID], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
        return;
      }
      res.redirect('/dashboard');
    });
  });

  app.post('/api/adduser', (req, res) => {
    const { department_name } = req.body;
  
    connection.query(
      'INSERT INTO employees (Username, Password, DepartmentID) VALUES (?, ?, ?)',
      [Username, Password, DepartmentID],
      (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).json({ error: 'Error inserting data' });
          return;
        }
  
        if(result.affectedRows == 1)
          res.status(200).json({ success: true, id: result.insertId, departmentName: department_name });
      }
    );
  });



app.post('/api/add_department', (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM Employees where Username = ? AND Password = ? ", [username, password], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/users'); 
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
      
    });
});


  
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM Employees where Username = ? AND Password = ? ", [username, password], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        connection.query(
            'INSERT INTO log ( Username, LoginDate) VALUES (?, NOW())',
            [username],
            (err, result) => {
              if (err) {
                console.error('Error inserting data:', err);
                res.status(500).json({ error: 'Error inserting data' });
                return;
              }
        });
        req.session.username = username;
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
