// ------------------------------
// Backend URL auto-detect
// ------------------------------
const BACKEND_URL = (function () {
  const hostname = window.location.hostname;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://your-backend-app.onrender.com"; // replace with actual backend URL
})();

// Smooth scroll
function scrollToSection(id) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: "smooth" });
}

// Hamburger
function setupHamburger() {
  const hamburger = document.getElementById("menu-icon");
  const navLinks = document.getElementById("nav-links");
  if (!hamburger) return;
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

// cart
let cart = [];
function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }
function loadCart(){ const s = localStorage.getItem("cart"); if(s){ cart = JSON.parse(s); updateCart(); } }

function renderProducts(){
  const productGrid = document.getElementById("product-list");
  productGrid.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" 
           onerror="this.src='images/placeholder.png'" 
           style="width:100%;height:120px;object-fit:cover" />
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
}
function addToCart(id){ const product = products.find(p=>p.id===id); cart.push(product); saveCart(); updateCart(); }
function updateCart(){
  document.getElementById("cart-count").innerText = cart.length;
  const cartItems = document.getElementById("cart-items");
  if(!cartItems) return;
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item,index)=>{
    total += item.price;
    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" 
             onerror="this.src='images/placeholder.png'" 
             style="width:60px;height:60px;object-fit:cover"/>
        <div>
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>
        </div>
        <button onclick="removeFromCart(${index})">Remove</button>
      </div>`;
  });
  const totalEl = document.getElementById("cart-total");
  if(totalEl) totalEl.innerText = `Total: ₹${total}`;
}
function removeFromCart(index){ cart.splice(index,1); saveCart(); updateCart(); }

// modals
function openModal(id){ document.getElementById(id).classList.add("active"); }
function closeModal(id){ document.getElementById(id).classList.remove("active"); }
document.addEventListener("DOMContentLoaded", ()=>{
  const cartBtn = document.getElementById("cart");
  if(cartBtn) cartBtn.addEventListener("click", ()=> openModal("cart-modal"));
});

// checkout + razorpay + cod
async function handlePurchase(event){
  event.preventDefault();
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email")?.value || '';
  const contact = document.getElementById("contact_no")?.value || '';
  const paymentMethod = document.getElementById("payment").value;
  const total = cart.reduce((s,i)=>s+i.price,0);
  const productsStr = cart.map(i=>i.name+" x1").join(", ");

  if(paymentMethod === "cod"){
    try{
      const res = await fetch(`${BACKEND_URL}/api/orders/save-cod`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ name, address, email, contact, products: productsStr, amount: total })
      });
      const data = await res.json();
      if(data.success){
        alert("🎉 COD order placed successfully! Thank you.");
        cart = []; saveCart(); updateCart();
        closeModal("checkout-modal"); closeModal("cart-modal");
      } else {
        console.error("COD backend returned error:", data);
        alert("❌ COD order failed. Please try again.");
      }
    } catch(err){
      console.error("COD order error:", err);
      alert("❌ Could not place COD order. Please try again.");
    }
    return;
  }

  // online payment flow
  try{
    const res = await fetch(`${BACKEND_URL}/api/orders/create-order`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name, address, amount: total, email, contact })
    });
    const data = await res.json();
    if(!data || !data.orderId) throw new Error("Order creation failed");

    const options = {
      key: "rzp_test_ABC1234567890", // replace with your key
      amount: data.amount,
      currency: "INR",
      name: "BlueBell Totes",
      description: "Tote Bag Purchase",
      order_id: data.orderId,
      handler: async function(response){
        const verifyRes = await fetch(`${BACKEND_URL}/api/orders/verify`, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            name, address, email, contact, products: productsStr, amount: total
          })
        });
        const verifyJson = await verifyRes.json();
        if(verifyJson.success){
          alert("🎉 Payment successful and verified. Thank you!");
          cart=[]; saveCart(); updateCart(); closeModal("checkout-modal"); closeModal("cart-modal");
        } else {
          alert("❌ Payment completed but verification failed. Please contact support.");
        }
      },
      prefill:{ name, email, contact },
      theme:{ color:"#3399cc" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  } catch(err){
    console.error("Payment error:", err);
    alert("❌ Payment failed: "+err.message);
  }
}

// init
document.addEventListener("DOMContentLoaded", ()=>{
  setupHamburger();
  loadCart();
  renderProducts();
});

// limit contact
const input = document.getElementById("contact_no");
if(input){
  input.addEventListener("input", ()=>{ if(input.value.length>10) input.value = input.value.slice(0,10); });
}
