const API = "http://localhost:8000";

// Função de login
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Preencha todos os campos.");
  }

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return alert(data.detail || "Erro ao fazer login.");
    }

    // Salva token e dados do usuário
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("user_id", data.user.id);

    alert("Login realizado com sucesso!");

    // Redireciona conforme o tipo de usuário
    if (data.user.is_admin) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "catalog.html";
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// Função de cadastro
async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    return alert("Preencha todos os campos.");
  }

  try {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return alert(data.detail || "Erro ao registrar usuário.");
    }

    alert("Cadastro realizado com sucesso! Faça login para continuar.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erro ao registrar:", error);
    alert("Erro de conexão com o servidor.");
  }
}
