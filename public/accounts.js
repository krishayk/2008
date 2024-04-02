function loadAccounts() {
    fetch('/users')
    .then(response => response.json())
    .then(users => {
        const accountsContainer = document.getElementById('accounts');
        accountsContainer.innerHTML = '<h2>User Accounts</h2>';
        users.forEach(user => {
            const accountElement = document.createElement('div');
            accountElement.className = 'account';
            accountElement.innerHTML = `
                <p>${user.email} - ${user.name}</p>
                <button onclick="deleteAccount('${user.email}')">Delete</button>
            `;
            accountsContainer.appendChild(accountElement);
        });
    })
    .catch(error => console.error('Error loading accounts:', error));
}

function deleteAccount(email) {
    fetch(`/users/${email}`, {
        method: 'DELETE',
    })
    .then(() => loadAccounts()) // Reload accounts after deletion
    .catch(error => console.error('Error deleting account:', error));
}

// Load accounts when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
});
