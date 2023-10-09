// Function to save changes to Local Storage
function saveChanges() {
    try {
        const content = document.getElementById('content').value;
        if (content.trim() !== "") {
            localStorage.setItem('userChanges', content);
        } else {
            localStorage.removeItem('userChanges'); // Remove if content is empty
        }
    } catch (error) {
        console.error('Error saving changes:', error);
    }
}

// Function to load saved changes from Local Storage
function loadChanges() {
    try {
        const content = localStorage.getItem('userChanges');
        if (content) {
            document.getElementById('content').value = content;
        }
    } catch (error) {
        console.error('Error loading changes:', error);
    }
}

// Check if this is the 'index.html' page
const isIndexPage = window.location.pathname.includes('index.html');

// Function to check if the user's name is stored in local storage
function isUserNameStored() {
    if (isIndexPage) {
        return false; // Disable this function on 'index.html'
    }
    return !!localStorage.getItem('userName');
}

// Function to get the user's name from local storage
function getUserName() {
    if (isIndexPage) {
        return ''; // Disable this function on 'index.html'
    }
    return localStorage.getItem('userName') || '';
}

// Function to save the user's name in local storage
function saveUserName(userName) {
    if (!isIndexPage) {
        localStorage.setItem('userName', userName);
    }
}

// Function to save the user's cart with their profile name as the key
function saveCart(userName, cart) {
    if (!isIndexPage) {
        localStorage.setItem(userName, JSON.stringify(cart));
    }
}

// Function to load the user's cart based on their profile name
function loadCart(userName) {
    const cartData = localStorage.getItem(userName);
    return cartData ? JSON.parse(cartData) : [];
}

// Function to add a product to the cart
function addToCart(userName, productName, productPrice) {
    const cart = loadCart(userName); // Load the user's cart
    cart.push({ name: productName, price: productPrice });
    saveCart(userName, cart); // Save the updated cart
}

// Function to load and display the user's cart
function loadUserCart(userName) {
    const cart = loadCart(userName);
    // Update the cart display with the loaded cart data
    updateCartDisplay(cart);
}

// Function to display the user's name on the profile page
function displayUserName() {
    if (isIndexPage) {
        return; // Disable this function on 'index.html'
    }
    const userInfo = document.getElementById('user-info');
    const userName = getUserName();

    userInfo.textContent = userName ? `Welcome, ${userName}!` : 'Welcome to Your Profile';
}

// Function to open index.html if the user's name is saved
function openIndexIfNameSaved() {
    if (isUserNameStored() && !isIndexPage) {
        window.location.href = 'index.html';
    }
}

// Check if this is the profile page and display the user's name
if (!isIndexPage && window.location.pathname.includes('profile.html')) {
    displayUserName();
    openIndexIfNameSaved();
}

// Check if this is the splash page
const nameForm = document.getElementById('name-form');
if (!isIndexPage && nameForm) {
    if (isUserNameStored()) {
        // If the user's name is already stored, hide the form and display the profile directly
        nameForm.style.display = 'none';
        redirectToProfile();
    } else {
        nameForm.addEventListener('submit', handleFormSubmission);
    }
}

// Function to redirect to the profile page if the user is logged in
function redirectToProfile() {
    if (isIndexPage) {
        return; // Disable this function on 'index.html'
    }
    if (isUserNameStored() && !window.location.pathname.includes('profile.html')) {
        window.location.href = 'profile.html';
    }
}
