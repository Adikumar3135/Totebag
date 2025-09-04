// ✅ Smooth scroll to section
function scrollToSection(id) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: "smooth" });
}

// ================================
// HAMBURGER MENU LOGIC (Merged)
// ================================
function setupHamburger() {
  const hamburger = document.getElementById("menu-icon"); // Hamburger icon
  const navLinks = document.getElementById("nav-links"); // Navigation links container

  // Toggle menu open/close when hamburger clicked
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    // Change icon between bars and times
    if (navLinks.classList.contains("active")) {
      hamburger.classList.remove("fa-bars");
      hamburger.classList.add("fa-times");
    } else {
      hamburger.classList.remove("fa-times");
      hamburger.classList.add("fa-bars");
    }
  });

  // Close menu automatically when clicking a nav link
  document.querySelectorAll("#nav-links li").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.classList.remove("fa-times");
      hamburger.classList.add("fa-bars");
    });
  });
}

// ================================
// CART SYSTEM WITH LOCALSTORAGE
// ================================
let cart = [];

// ✅ Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ✅ Load cart from localStorage
function loadCart() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }
}

// ✅ Render Products
function renderProducts() {
  const productGrid = document.getElementById("product-list");
  productGrid.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
}

// ✅ Add to Cart
function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  saveCart();
  updateCart();
}

// ✅ Update Cart
function updateCart() {
  document.getElementById("cart-count").innerText = cart.length;
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>
        </div>
        <span class="remove-btn" onclick="removeFromCart(${index})">Remove</span>
      </div>
    `;
  });
  document.getElementById("cart-total").innerText = `Total: ₹${total}`;
}

// ✅ Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

// ✅ Modals
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}
document.getElementById("cart").addEventListener("click", () => openModal("cart-modal"));

// ✅ Checkout
function handlePurchase(event) {
  event.preventDefault();
  alert("🎉 Purchase successful! Thank you for shopping with Tote Adventure.");
  cart = [];
  saveCart();
  updateCart();
  closeModal("checkout-modal");
  closeModal("cart-modal");
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  setupHamburger();
  loadCart();   // <-- Load cart from localStorage
  renderProducts();
});
