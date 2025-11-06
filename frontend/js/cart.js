const API = "http://localhost:8000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa fazer login para acessar esta página.");
  window.location.href = "login.html";
}

const tbody = document.querySelector("#cart-table tbody");
const totalElem = document.getElementById("total");

let cupcakes = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Carrega os produtos para mostrar nome e preço
async function loadCupcakes() {
  try {
    const response = await fetch(`${API}/products/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erro ao buscar produtos");
    cupcakes = await response.json();
    renderCart();
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar produtos.</td></tr>`;
  }
}

// Renderiza o carrinho local
function renderCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  tbody.innerHTML = "";

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Seu carrinho está vazio.</td></tr>`;
    totalElem.textContent = "Total: R$ 0.00";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const cupcake = cupcakes.find(c => c.id === item.id);
    if (!cupcake) return;

    const subtotal = cupcake.price * item.quantity;
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cupcake.name}</td>
      <td>
        <input type="number" min="1" max="${cupcake.stock}" 
          value="${item.quantity}" 
          onchange="updateQuantity(${item.id}, this.value)">
      </td>
      <td>R$ ${cupcake.price.toFixed(2)}</td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td><button class="btn" onclick="removeFromCart(${item.id})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalElem.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Atualiza quantidade localmente
function updateQuantity(id, quantity) {
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity <= 0) quantity = 1;

  const cupcake = cupcakes.find(c => c.id === id);
  if (cupcake && quantity > cupcake.stock) {
    alert(`Quantidade máxima: ${cupcake.stock}`);
    quantity = cupcake.stock;
  }

  const item = cart.find(i => i.id === id);
  if (item) item.quantity = quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Remove item do carrinho
function removeFromCart(id) {
  if (!confirm("Deseja remover este item?")) return;
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Finaliza pedido — envia para o backend e limpa o carrinho
async function checkout() {
  const user = JSON.parse(localStorage.getItem("user"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!user || !token) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let total = 0;
  const items = cart.map(item => {
    const cupcake = cupcakes.find(c => c.id === item.id);
    if (cupcake) {
      total += cupcake.price * item.quantity;
      return { id: item.id, quantity: item.quantity };
    }
  }).filter(Boolean);

  try {
    const response = await fetch(`${API}/orders/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        total,
        items
      })
    });

    if (response.ok) {
      localStorage.removeItem("cart");
      alert("Pedido criado com sucesso!");
      window.location.href = "orders.html";
    } else {
      const data = await response.json();
      alert(`Erro: ${data.detail || "Erro ao criar pedido."}`);
    }
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    alert("Erro ao finalizar pedido.");
  }
}

// Inicializa a página
loadCupcakes();
