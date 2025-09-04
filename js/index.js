

// ✅ Smooth scroll to section
function scrollToSection(id) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: "smooth" });
}

// ✅ Setup hamburger menu
function setupHamburger() {
  const menu = document.getElementById("menu-icon");
  const links = document.getElementById("nav-links");
  menu.addEventListener("click", () => {
    links.classList.toggle("active");
    menu.classList.toggle("fa-bars");
    menu.classList.toggle("fa-times");
  });
}

// ✅ Product Data
const products = [
  { id: 1, name: "Classic Tote", price: 799, img: "https://via.placeholder.com/300x300?text=Classic+Tote" },
  { id: 2, name: "Eco Tote", price: 999, img: "https://via.placeholder.com/300x300?text=Eco+Tote" },
  { id: 3, name: "Travel Tote", price: 1199, img: "https://via.placeholder.com/300x300?text=Travel+Tote" },
  { id: 4, name: "Premium Tote", price: 1499, img: "https://via.placeholder.com/300x300?text=Premium+Tote" }
];

let cart = [];

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
  updateCart();
  closeModal("checkout-modal");
  closeModal("cart-modal");
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  setupHamburger();
  renderProducts();
});
