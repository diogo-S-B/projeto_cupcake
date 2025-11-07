const API = "https://projeto-cupcake-12.onrender.com";

//  Verificação de login e permissão
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || !user.is_admin) {
  alert("Acesso negado! Faça login como administrador primeiro.");
  window.location.href = "login.html";
}

// Logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const pedidosBody = document.getElementById("pedidos-body");

  // Carregar pedidos
  async function carregarPedidos() {
    try {
      const resp = await fetch(`${API}/admin/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        throw new Error("Falha ao carregar pedidos");
      }

      const pedidos = await resp.json();
      pedidosBody.innerHTML = "";

      pedidos.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.user_id}</td>
          <td>${p.items.map(i => `${i.quantity}x ${i.product.name}`).join(", ")}</td>
          <td>R$ ${p.total.toFixed(2)}</td>
          <td>${p.status}</td>
          <td>
            <button class="btn entregue" onclick="alterarStatus(${p.id}, 'Entregue')">✅ Entregue</button>
            <button class="btn aberto" onclick="alterarStatus(${p.id}, 'Pendente')">🔄 Pendente</button>
          </td>
        `;
        pedidosBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar pedidos. Verifique se você está autenticado.");
    }
  }

  // 🛠️ Alterar status
  window.alterarStatus = async function (id, status) {
    try {
      const resp = await fetch(`${API}/admin/orders/${id}?status=${status}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.detail || "Erro ao atualizar status!");
      }

      alert(`Pedido ${id} atualizado para ${status}!`);
      carregarPedidos();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  carregarPedidos();
});
