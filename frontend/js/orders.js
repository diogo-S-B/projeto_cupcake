const token = localStorage.getItem("token");
if (!token) {
  alert("Você precisa fazer login para acessar esta página.");
  window.location.href = "index.html"; // volta para o login
}

const ordersBody = document.getElementById("orders-body");

async function fetchOrders() {
    try {
        const userId = 1;  // Substitua pelo ID do usuário logado
        const response = await fetch(`http://127.0.0.1:8000/orders/user/${userId}`);
        
        if (!response.ok) {
            ordersBody.innerHTML = `<tr><td colspan="5">Não foi possível carregar os pedidos.</td></tr>`;
            return;
        }

        const orders = await response.json();
        if (orders.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>`;
            return;
        }
        console.log(orders)
        ordersBody.innerHTML = ""; // Limpa a mensagem de "Carregando"

        orders.forEach(order => {
            // Verifique se 'items' existe e é um array
            const items = (order.items && Array.isArray(order.items)) 
                ? order.items.map(i => `${i.quantity} x  ${i.product?.name}`).join(", ")
                : "Nenhum item encontrado"; // Caso não tenha itens

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${items}</td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td class="status-${order.status.toLowerCase()}">${order.status}</td>
                <td>${new Date(order.created_at).toLocaleString()}</td>
            `;
            ordersBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        ordersBody.innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos.</td></tr>`;
    }
}

// Carrega os pedidos ao abrir a página
fetchOrders();
