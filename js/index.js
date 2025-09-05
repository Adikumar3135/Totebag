// ✅ Smooth scroll to section
function scrollToSection(id) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: "smooth" });
}

// ================================
// HAMBURGER MENU LOGIC
// ================================
function setupHamburger() {
  const hamburger = document.getElementById("menu-icon");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("fa-times");
    hamburger.classList.toggle("fa-bars");
  });

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

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }
}

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

function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  saveCart();
  updateCart();
}

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

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

// ================================
// MODALS
// ================================
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}
document.getElementById("cart").addEventListener("click", () => openModal("cart-modal"));

// ================================
// CHECKOUT + RAZORPAY
// ================================
async function handlePurchase(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email")?.value || '';
  const contact = document.getElementById("contact_no")?.value || ''; // fixed ID here
  const paymentMethod = document.getElementById("payment").value;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (paymentMethod === "cod") {
    alert("🎉 Order placed successfully (Cash on Delivery). Thank you!");
    cart = [];
    saveCart();
    updateCart();
    closeModal("checkout-modal");
    closeModal("cart-modal");
    return;
  }

  // Replace with your deployed backend URL
  const BACKEND_URL = "https://your-app-name.herokuapp.com";

  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, amount: total, email, contact })
    });

    const data = await res.json();
    if (!data || !data.orderId) throw new Error('Order creation failed');

    const options = {
      key: "rzp_test_ABC1234567890", // Replace with your Razorpay Key ID (public key)
      amount: data.amount,
      currency: "INR",
      name: "BlueBell Totes",
      description: "Tote Bag Purchase",
      order_id: data.orderId,
      handler: async function (response) {
        const verifyRes = await fetch(`${BACKEND_URL}/api/orders/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            name, address, email, contact
          })
        });
        const verifyJson = await verifyRes.json();
        if (verifyJson.success) {
          alert("🎉 Payment successful and verified. Thank you!");
          cart = [];
          saveCart();
          updateCart();
          closeModal("checkout-modal");
          closeModal("cart-modal");
        } else {
          alert("Payment completed but verification failed. Please contact support.");
        }
      },
      prefill: { name, email, contact },
      theme: { color: "#3399cc" }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment failed: " + err.message);
  }
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  setupHamburger();
  loadCart();
  renderProducts();
});

// Limit contact_no input to 10 digits
const input = document.getElementById("contact_no");
if (input) {
  input.addEventListener("input", () => {
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  });
}