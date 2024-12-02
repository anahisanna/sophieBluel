document.addEventListener("DOMContentLoaded", () => {
    // Fonctionnalité de connexion
    const logForm = document.getElementById("loginForm");
    if (logForm) {
        logForm.addEventListener("submit", event => {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
                .then(response => {
                    if (!response.ok) throw new Error("Erreur d’authentification");
                    return response.json();
                })
                .then(data => {
                    localStorage.setItem("authToken", data.token);
                    window.location.href = "index.html";
                })
                .catch(() => alert("Informations utilisateur/mot de passe incorrectes"));
        });
    }

    // Vérifier l'authentification
    const isAuthenticated = !!localStorage.getItem("authToken");
    const filters = document.getElementById("filters");
    const modifierButton = document.getElementById("modifier-btn");

    // Afficher ou masquer des éléments en fonction de l'authentification
    const authentification = () => {
        if (isAuthenticated) {
            if (modifierButton) modifierButton.style.display = "block";
            if (filters) filters.style.display = "none";
        } else {
            if (modifierButton) modifierButton.style.display = "none";
            if (filters) filters.style.display = "flex";
        }
    };

    authentification(); // Appel initial pour configurer les éléments
    const loginLogout = document.getElementById("loginLogout");
    if (localStorage.getItem("authToken") && loginLogout) {
        loginLogout.textContent = "logout";
        loginLogout.href = "#";
        loginLogout.addEventListener("click", () => {
            localStorage.removeItem("authToken");
            loginLogout.textContent = "login";
            loginLogout.href = "login.html";
            alert("Vous êtes déconnecté");
        });
    }

});

