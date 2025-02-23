// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
  getFirestore, collection, onSnapshot, doc, updateDoc, getDoc, addDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

// Define admin email (for simplicity; consider custom claims for production)
const adminEmail = "admin@zindagiperfumes.com";

// Utility: Show loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// --- Sidebar Navigation ---
const navLinks = document.querySelectorAll('.sidebar nav ul li a');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('data-section');
    navLinks.forEach(n => n.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(sectionId).classList.add('active');
  });
});

// --- Authentication Check ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    if (user.email !== adminEmail) {
      alert("Access denied. Admins only.");
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    } else {
      // Load dashboard stats and data
      loadDashboardStats();
      loadProducts();
      loadOrders();
      loadContacts();
      loadSubscribers();
    }
  }
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// --- Dashboard Stats ---
function loadDashboardStats() {
  // Count products, orders, contacts, subscribers
  onSnapshot(collection(db, "products"), (snapshot) => {
    document.getElementById("totalProducts").textContent = snapshot.size;
  });
  onSnapshot(collection(db, "orders"), (snapshot) => {
    document.getElementById("totalOrders").textContent = snapshot.size;
  });
  onSnapshot(collection(db, "contacts"), (snapshot) => {
    document.getElementById("totalContacts").textContent = snapshot.size;
  });
  onSnapshot(collection(db, "subscribers"), (snapshot) => {
    document.getElementById("totalSubscribers").textContent = snapshot.size;
  });
}

// --- Load Products with Edit & Delete ---
function loadProducts() {
  const productsDiv = document.getElementById("productsList");
  showLoader();
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
        <button class="delete-btn" data-id="${product.id}">Delete</button>
      `;
      productsDiv.appendChild(productDiv);
    });
    hideLoader();
    // Attach event listeners for edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        openEditModal(productId);
      });
    });
    // Attach event listeners for delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this product?")) {
          deleteDoc(doc(db, "products", productId))
            .then(() => alert("Product deleted successfully."))
            .catch(err => {
              console.error("Delete error:", err);
              alert("Failed to delete product.");
            });
        }
      });
    });
  });
}

// --- Load Orders ---
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

// --- Load Contacts ---
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

// --- Load Subscribers ---
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

// --- Edit Product Modal ---
const editModal = document.getElementById("editProductModal");
const closeEditModalBtn = document.getElementById("closeEditModal");
const editProductForm = document.getElementById("editProductForm");

closeEditModalBtn.addEventListener("click", () => {
  closeModal(editModal);
});

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
        openModal(editModal);
      } else {
        alert("Product not found.");
      }
    })
    .catch(err => {
      console.error("Error fetching product:", err);
      alert("Failed to load product details.");
    });
}

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
      closeModal(editModal);
    })
    .catch(err => {
      console.error("Error updating product:", err);
      alert("Failed to update product. Please try again.");
    });
});

// --- Add Product Modal ---
const addModal = document.getElementById("addProductModal");
const closeAddModalBtn = document.getElementById("closeAddModal");
const addProductForm = document.getElementById("addProductForm");

closeAddModalBtn.addEventListener("click", () => {
  closeModal(addModal);
});
document.getElementById("addProductBtn").addEventListener("click", () => {
  addProductForm.reset();
  openModal(addModal);
});

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newProduct = {
    name: document.getElementById("addProductName").value,
    price: parseFloat(document.getElementById("addProductPrice").value),
    description: document.getElementById("addProductDesc").value,
    imageUrl: document.getElementById("addProductImage").value
  };
  addDoc(collection(db, "products"), newProduct)
    .then(() => {
      alert("Product added successfully!");
      closeModal(addModal);
    })
    .catch(err => {
      console.error("Error adding product:", err);
      alert("Failed to add product. Please try again.");
    });
});

// --- Modal Utility Functions ---
function openModal(modal) {
  modal.style.display = "flex";
  modal.classList.add("active");
  modal.focus();
}
function closeModal(modal) {
  modal.style.display = "none";
  modal.classList.remove("active");
}
