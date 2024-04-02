// public/login.js

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        alert('Login successful!');
        window.location.href = 'index.html'; // Redirect to the main page on successful login
    } else {
        const error = await response.text();
        alert(`Login failed: ${error}`);
    }
});