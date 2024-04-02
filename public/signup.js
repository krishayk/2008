document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const businessName = document.getElementById('businessName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, businessName, email, password })
    });

    if (response.ok) {
        alert('Signup successful!');
        window.location.href = 'login.html'; // Redirect to login page on successful signup
    } else {
        const error = await response.text();
        alert(`Signup failed: ${error}`);
    }
});