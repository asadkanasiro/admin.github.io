// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Use the same Firebase configuration as the public site
const firebaseConfig = {
  apiKey: "AIzaSyC-sMxHYSiwld_U5GO7oGtHPw5CaVY_16s",
  authDomain: "zindagi-334b7.firebaseapp.com",
  databaseURL: "https://zindagi-334b7-default-rtdb.firebaseio.com",
  projectId: "zindagi-334b7",
  storageBucket: "zindagi-334b7.firebasestorage.app",
  messagingSenderId: "936307521870",
  appId: "1:936307521870:web:619c050d865cff2ac9861f",
  measurementId: "G-B4HP267SJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Define the admin's email address (this could also be retrieved from your database)
const adminEmail = "admin@zindagiperfumes.com";

// Ensure only authenticated admins can access this page.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in—redirect to the public index page
    window.location.href = "index.html";
  } else {
    // Simple check: if the authenticated user's email does not match the admin email, deny access.
    if (user.email !== adminEmail) {
      alert("Access denied. Admins only.");
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    } else {
      // The user is an admin; load all the admin data.
      loadProducts();
      loadOrders();
      loadContacts();
      loadSubscribers();
    }
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// Load and render products from Firestore
function loadProducts() {
  const productsDiv = document.getElementById("productsList");
  onSnapshot(collection(db, "products"), (snapshot) => {
    productsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const product = doc.data();
      const div = document.createElement("div");
      div.textContent = `${product.name} - PKR ${product.price}`;
      // Optionally, add Edit/Delete buttons here.
      productsDiv.appendChild(div);
    });
  });
}

// Load and render orders from Firestore
function loadOrders() {
  const ordersDiv = document.getElementById("ordersList");
  onSnapshot(collection(db, "orders"), (snapshot) => {
    ordersDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const order = doc.data();
      const div = document.createElement("div");
      div.textContent = `Order ${order.orderId} by ${order.customerEmail} - Total: PKR ${order.amount}`;
      ordersDiv.appendChild(div);
    });
  });
}

// Load and render contacts from Firestore
function loadContacts() {
  const contactsDiv = document.getElementById("contactsList");
  onSnapshot(collection(db, "contacts"), (snapshot) => {
    contactsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const contact = doc.data();
      const div = document.createElement("div");
      div.textContent = `${contact.name} (${contact.email}): ${contact.message}`;
      contactsDiv.appendChild(div);
    });
  });
}

// Load and render subscribers from Firestore
function loadSubscribers() {
  const subsDiv = document.getElementById("subscribersList");
  onSnapshot(collection(db, "subscribers"), (snapshot) => {
    subsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const subscriber = doc.data();
      const div = document.createElement("div");
      div.textContent = subscriber.email;
      subsDiv.appendChild(div);
    });
  });
}