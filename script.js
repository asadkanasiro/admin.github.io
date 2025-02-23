// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration (same as public site)
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

// Define admin email (this could be replaced with a more robust role-check)
const adminEmail = "admin@zindagiperfumes.com";

// --- Navigation between sections ---
const navLinks = document.querySelectorAll('.sidebar nav ul li a');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('data-section');
    // Remove active classes
    navLinks.forEach(n => n.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    // Set active for current
    link.classList.add('active');
    document.getElementById(sectionId).classList.add('active');
  });
});

// --- Authentication Check ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in: redirect to public page
    window.location.href = "index.html";
  } else {
    if (user.email !== adminEmail) {
      alert("Access denied. Admins only.");
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    } else {
      // If user is admin, load admin data
      loadProducts();
      loadOrders();
      loadContacts();
      loadSubscribers();
    }
  }
});

// --- Logout Functionality ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// --- Load Data Functions ---

// Products: Render product list with an Edit button for each.
function loadProducts() {
  const productsDiv = document.getElementById("productsList");
  onSnapshot(collection(db, "products"), (snapshot) => {
    productsDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const product = { id: docSnap.id, ...docSnap.data() };
      const productDiv = document.createElement("div");
      productDiv.classList.add("product-item");
      productDiv.innerHTML = `
        <strong>${product.name}</strong> - PKR ${product.price}<br>
        ${product.description || ''}<br>
        <button class="edit-btn" data-id="${product.id}">Edit</button>
      `;
      productsDiv.appendChild(productDiv);
    });
    // Attach event listeners for edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        openEditModal(productId);
      });
    });
  });
}

// Orders: Render a simple list of orders.
function loadOrders() {
  const ordersDiv = document.getElementById("ordersList");
  onSnapshot(collection(db, "orders"), (snapshot) => {
    ordersDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order-item");
      orderDiv.textContent = `Order ${order.orderId} by ${order.customerEmail} - Total: PKR ${order.amount}`;
      ordersDiv.appendChild(orderDiv);
    });
  });
}

// Contacts: Render submitted contacts.
function loadContacts() {
  const contactsDiv = document.getElementById("contactsList");
  onSnapshot(collection(db, "contacts"), (snapshot) => {
    contactsDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const contact = docSnap.data();
      const contactDiv = document.createElement("div");
      contactDiv.classList.add("contact-item");
      contactDiv.textContent = `${contact.name} (${contact.email}): ${contact.message}`;
      contactsDiv.appendChild(contactDiv);
    });
  });
}

// Subscribers: Render list of subscriber emails.
function loadSubscribers() {
  const subsDiv = document.getElementById("subscribersList");
  onSnapshot(collection(db, "subscribers"), (snapshot) => {
    subsDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const subscriber = docSnap.data();
      const subDiv = document.createElement("div");
      subDiv.classList.add("subscriber-item");
      subDiv.textContent = subscriber.email;
      subsDiv.appendChild(subDiv);
    });
  });
}

// --- Edit Product Modal Functionality ---
const editModal = document.getElementById("editProductModal");
const closeEditModalBtn = document.getElementById("closeEditModal");
const editProductForm = document.getElementById("editProductForm");

closeEditModalBtn.addEventListener("click", () => {
  closeEditModal();
});

// Opens the modal and populates it with product data.
function openEditModal(productId) {
  const productRef = doc(db, "products", productId);
  getDoc(productRef)
    .then(docSnap => {
      if (docSnap.exists()) {
        const product = docSnap.data();
        document.getElementById("editProductId").value = productId;
        document.getElementById("editProductName").value = product.name;
        document.getElementById("editProductPrice").value = product.price;
        document.getElementById("editProductDesc").value = product.description || "";
        showModal(editModal);
      } else {
        alert("Product not found.");
      }
    })
    .catch(err => {
      console.error("Error fetching product:", err);
      alert("Failed to load product details.");
    });
}

// Update product on form submission.
editProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const productId = document.getElementById("editProductId").value;
  const updatedData = {
    name: document.getElementById("editProductName").value,
    price: parseFloat(document.getElementById("editProductPrice").value),
    description: document.getElementById("editProductDesc").value,
  };
  const productRef = doc(db, "products", productId);
  updateDoc(productRef, updatedData)
    .then(() => {
      alert("Product updated successfully!");
      closeEditModal();
    })
    .catch(err => {
      console.error("Error updating product:", err);
      alert("Failed to update product. Please try again.");
    });
});

// Utility functions to show/hide modals.
function showModal(modal) {
  modal.style.display = "flex";
  modal.classList.add("active");
}

function closeEditModal() {
  editModal.style.display = "none";
  editModal.classList.remove("active");
}
