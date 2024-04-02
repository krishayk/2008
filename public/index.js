document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupDropdownDelay();
    attachEventListeners();
});

function checkLoginStatus() {
    fetch('/login/status')
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            window.location.href = 'login.html';
        } else {
            adjustNavForLoggedInUser(data.username);
        }
    })
    .catch(error => console.error('Error checking login status:', error));
}

function adjustNavForLoggedInUser(username) {
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    const userArea = document.getElementById('userArea');
    const accountName = document.getElementById('accountName');

    if (signupLink) signupLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';
    userArea.style.display = 'block';
    accountName.textContent = username;
}

function logout() {
    fetch('/logout', { method: 'POST' })
    .then(response => {
        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            alert('Logout failed. Please try again.');
        }
    })
    .catch(error => console.error('Error logging out:', error));
}

let dropdownTimeout;
function setupDropdownDelay() {
    const userArea = document.getElementById('userArea');
    const userDropdown = document.getElementById('userDropdown');

    userArea.addEventListener('mouseover', () => {
        clearTimeout(dropdownTimeout);
        userDropdown.style.display = 'block';
    });

    userArea.addEventListener('mouseleave', () => {
        dropdownTimeout = setTimeout(() => {
            userDropdown.style.display = 'none';
        }, 500);
    });

    userDropdown.addEventListener('mouseover', () => {
        clearTimeout(dropdownTimeout);
    });

    userDropdown.addEventListener('mouseleave', () => {
        dropdownTimeout = setTimeout(() => {
            userDropdown.style.display = 'none';
        }, 500);
    });
}

function attachEventListeners() {
    const postSubmitButton = document.getElementById('postSubmitButton');
    if (postSubmitButton) {
        postSubmitButton.addEventListener('click', submitPost);
    }
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}

function submitPost() {
    const contentElement = document.getElementById('postContent'); // Ensure this ID matches your textarea for post content
    const content = contentElement.value;
    fetch('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Post submitted successfully');
        loadPosts(); // Refresh the list of posts
    })
    .catch(error => console.error('Error submitting post:', error));
}

function submitComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const content = commentInput.value;
    fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Comment submitted successfully');
        loadComments(postId); // Reload comments for the post
    })
    .catch(error => console.error('Error submitting comment:', error));
}

function deletePost(postId) {
    fetch(`/posts/${postId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        console.log('Post deleted successfully');
        loadPosts(); // Refresh the list of posts
    })
    .catch(error => console.error('Error deleting post:', error));
}

function deleteComment(commentId, postId) {
    fetch(`/comments/${commentId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        console.log('Comment deleted successfully');
        loadComments(postId); // Refresh the comments for the post
    })
    .catch(error => console.error('Error deleting comment:', error));
}

function loadPosts() {
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = ''; // Clear existing posts
        posts.forEach(post => {
            // Implement the logic to add each post to the DOM
            // This is an example, adjust according to your HTML structure
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p>`;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error loading posts:', error));
}

function loadComments(postId) {
    fetch(`/posts/${postId}/comments`)
    .then(response => response.json())
    .then(comments => {
        const commentsList = document.getElementById(`comments-${postId}`);
        commentsList.innerHTML = ''; // Clear existing comments
        comments.forEach(comment => {
            // Implement the logic to add each comment to the DOM
            // This is an example, adjust according to your HTML structure
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `<p>${comment.content}</p>`;
            commentsList.appendChild(commentElement);
        });
    })
    .catch(error => console.error('Error loading comments:', error));
}
