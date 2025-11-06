const API = "http://localhost:8000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa fazer login para acessar esta página.");
  window.location.href = "login.html";
}

const catalogContainer = document.getElementById("catalog");

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  alert("Você saiu da sua conta.");
  window.location.href = "login.html";
}

// Carregar produtos
async function loadProducts() {
  try {
    const response = await fetch(`${API}/products/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      throw new Error("Erro ao buscar produtos.");
    }

    const products = await response.json();
    catalogContainer.innerHTML = "";

    products.forEach(prod => {
      if (!prod.active) return;
      const imageUrl = prod.image_url || "https://via.placeholder.com/250";
      const card = document.createElement("div");
      card.className = "cupcake-card";
      card.innerHTML = `
        <img src="${imageUrl}" alt="${prod.name}" />
        <h3>${prod.name}</h3>
        <p>${prod.description}</p>
        <div class="price">R$ ${prod.price.toFixed(2)}</div>
        <button class="btn" onclick="addToCart(${prod.id}, ${prod.stock})">Adicionar ao carrinho</button>
      `;
      catalogContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    catalogContainer.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
  }
}

// Adiciona ao carrinho (localStorage)
function addToCart(productId, stock) {
  const quantity = parseInt(prompt(`Quantos deseja? (estoque: ${stock})`));
  if (isNaN(quantity) || quantity <= 0) return alert("Quantidade inválida.");
  if (quantity > stock) return alert(`Quantidade maior que o estoque disponível (${stock})`);

  // Carrega carrinho atual
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Busca o produto na lista do catálogo
  const productCard = [...document.querySelectorAll(".cupcake-card")].find(c =>
    c.querySelector("button").getAttribute("onclick").includes(`addToCart(${productId}`)
  );
  if (!productCard) return alert("Produto não encontrado.");

  const name = productCard.querySelector("h3").textContent;
  const price = parseFloat(productCard.querySelector(".price").textContent.replace("R$ ", ""));
  const image = productCard.querySelector("img").src;

  // Verifica se já existe no carrinho
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, name, price, image, quantity });
  }

  // Salva no localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Produto adicionado ao carrinho!");
}


loadProducts();
