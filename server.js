const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'smb-connect',
    password: 'Robo()bot1456',
    port: 5432,
});

// Add this inside your server.js

app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the main page if logged in
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve the login page if not logged in
    }
});

// ... rest of your server.js routes ...


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'zJ+wGTq5X1oqrp4awTewyNMFBX//mQUBztnO+7BmBdo=',
    resave: false,
    saveUninitialized: false,
}));

// Routes

// GET users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT email, name FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET posts
app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
        res.json(result.rows); // Sends the posts data as JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login status check route
app.get('/login/status', (req, res) => {
    if (req.session.userId) {
      res.json({ loggedIn: true, username: req.session.userName });
    } else {
      res.json({ loggedIn: false });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Could not log out.');
      }
      res.send('Logout successful');
    });
});

// Signup route
app.post('/signup', async (req, res) => {
    const { name, businessName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (name, business_name, email, password) VALUES ($1, $2, $3, $4)', [name, businessName, email, hashedPassword]);
        res.status(201).send('User created successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});
3
// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                req.session.businessName = user.business_name; // Save business name in session
                req.session.userName = user.name; // Save user's name in session
                res.send('Login successful.');
            } else {
                res.status(400).send('Incorrect password.');
            }
        } else {
            res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// POST submission route
app.post('/posts', async (req, res) => {
    if (!req.session.userId) return res.status(401).send('Please log in.');
    const { content } = req.body;
    try {
        await pool.query('INSERT INTO posts (user_id, username, business_name, content) VALUES ($1, $2, $3, $4)', [req.session.userId, req.session.userName, req.session.businessName, content]);
        res.status(201).send('Post created.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// DELETE post
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        res.send('Post deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// DELETE user
app.delete('/users/:email', async (req, res) => {
    const { email } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        res.send('User deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// DELETE comment
app.delete('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    try {
        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
        res.send('Comment deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Insert this route into your server.js file

app.post('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Insert the comment and return the new comment's ID
        const commentInsertResult = await pool.query(
            'INSERT INTO comments (post_id, user_id, content, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [postId, req.session.userId, content]
        );
        const newCommentId = commentInsertResult.rows[0].id;

        // Fetch the newly inserted comment along with user details
        const result = await pool.query(`
            SELECT comments.content, comments.timestamp, users.name, users.business_name
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.id = $1
        `, [newCommentId]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



// GET comments for a post
app.get('/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT comments.id, comments.post_id, comments.user_id, comments.content, comments.timestamp, users.name as username, users.business_name
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE post_id = $1
            ORDER BY comments.id DESC`, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
