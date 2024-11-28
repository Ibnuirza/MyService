const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 3000;
const path = require('path');

// Enable CORS for all routes
app.use(cors());

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname)));

// Middleware to read data from HTML form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nusantara22!',
  database: 'myservice', // Change this to your actual database name
});

db.connect((err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to the database!');
  }
});

// Handle login request (without bcrypt)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM `user` WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      // Successful login, respond with success
      res.json({
        user_id: results[0].user_id,   // Send the user_id back
      });
    } else {
      // Failed login, send error message
      res.json({ message: 'Email atau password salah.' });
    }
  });
});

// Handle signup request (no hashing)
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  const checkQuery = 'SELECT * FROM `user` WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.json({ message: 'Email sudah terdaftar.' });
    }

    const insertQuery = 'INSERT INTO `user` (username, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, email, password], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true });
    });
  });
});

// Retrieve user data by user_id
app.get('/getUserData/:user_id', (req, res) => {
  const userId = req.params.user_id;

  const query = 'SELECT * FROM `user` WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({
        name: user.username,
        email: user.email,
        birthdate: user.birthdate,
        phone: user.phone_number,
        sex: user.sex,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Update user data
app.put('/updateUserData', (req, res) => {
  const { user_id, name, email, birthdate, phone, sex } = req.body;

  if (!user_id) {
      return res.status(400).json({ message: 'User ID is required.' });
  }

  const query = `
      UPDATE user 
      SET 
          username = COALESCE(?, username), 
          email = COALESCE(?, email), 
          birthdate = COALESCE(?, birthdate), 
          phone_number = COALESCE(?, phone_number), 
          sex = COALESCE(?, sex) 
      WHERE user_id = ?`;

  db.query(
      query,
      [name, email, birthdate, phone, sex, user_id],
      (err, result) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, message: 'Profile updated successfully.' });
      }
  );
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
