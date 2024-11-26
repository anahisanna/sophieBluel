document.addEventListener("DOMContentLoaded", () => {
    // Récupérer les données depuis l'API
    fetch("http://localhost:5678/api/works")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            return response.json();
        })
        .then(data => { //Reçoit les données JSON et les passe à la prochaine étape pour un traitement supplémentaire.
            const gallery = document.getElementById("gallery");
            const modalGallery = document.getElementById("modal-gallery");

            // Fonction pour afficher les travaux dans la galerie
            const showWorks = works => {
                gallery.innerHTML = "";
                works.forEach(travail => {
                    const workElement = document.createElement("figure");
                    workElement.classList.add("work-item");
                    workElement.innerHTML = `
                        <img src="${travail.imageUrl}" alt="${travail.title}">
                        <figcaption>${travail.title}</figcaption>
                    `;
                    gallery.appendChild(workElement);
                });
            };

            // Fonction pour filtrer les travaux
            const filterWorks = categoryId => {
                const filteredWorks = categoryId === "all"
                    ? data
                    : data.filter(travail => travail.categoryId === categoryId);
                showWorks(filteredWorks);
            };

            // Ajouter des event listeners pour les filtres
            const filters = document.getElementById("filters");
            if (filters) {
                const buttons = filters.querySelectorAll("button");
                buttons.forEach(button => {
                    button.addEventListener("click", () => {
                        buttons.forEach(btn => btn.classList.remove("active"));
                        button.classList.add("active");
                        const categoryId = button.getAttribute("data-category");
                        filterWorks(categoryId === "all" ? "all" : parseInt(categoryId));
                    });
                });
            }

            // Initialiser la galerie avec tous les travaux
            if (gallery) showWorks(data);

            // Configuration de la galerie modale
            const showWorksModal = works => {
                modalGallery.innerHTML = "";
                works.forEach(travail => {
                    const workElement = document.createElement("div");
                    workElement.classList.add("modal-image-wrapper");
                    workElement.setAttribute("data-id", travail.id);
                    workElement.innerHTML = `
                        <img src="${travail.imageUrl}" alt="${travail.title}">
                        <i class="fa-solid fa-trash-can trash-icon"></i>
                    `;
                    modalGallery.appendChild(workElement);
                });

                addDeleteEventListeners();
            };

            // Ajouter une fonctionnalité de suppression pour la modale
            const addDeleteEventListeners = () => {
                const trashIcons = document.querySelectorAll(".trash-icon");
                trashIcons.forEach(icon => {
                    icon.addEventListener("click", event => {
                        const workElement = event.target.closest(".modal-image-wrapper");
                        const workId = workElement.getAttribute("data-id");
                        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
                            fetch(`http://localhost:5678/api/works/${workId}`, {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("authToken")}`
                                }
                            })
                                .then(response => {
                                    if (response.ok) {
                                        workElement.remove();
                                    } else {
                                        throw new Error("Erreur lors de la suppression du projet.");
                                    }
                                })
                                .catch(error => alert("Une erreur est survenue lors de la suppression."));
                        }
                    });
                });
            };

            if (modalGallery) showWorksModal(data);

            //Interactions avec la modale
            const setupModals = () => {
                const modalModifier = document.getElementById("modal-modifier");
                const modalAjout = document.getElementById("modal-ajout");

                const openModal = document.getElementById("modifier-btn");
                if (openModal) {
                    openModal.addEventListener("click", () => modalModifier.classList.add("modal--show"));
                }

                const closeModalModifier = document.getElementById("modal-close-modifier");
                if (closeModalModifier) {
                    closeModalModifier.addEventListener("click", () => modalModifier.classList.remove("modal--show"));
                }

                const ajoutPhoto = document.getElementById("add-photo");
                if (ajoutPhoto) {
                    ajoutPhoto.addEventListener("click", () => {
                        modalModifier.classList.remove("modal--show");
                        modalAjout.classList.add("modal--show");
                    });
                }

                const closeModalAjout = document.getElementById("modal-close-ajout");
                if (closeModalAjout) {
                    closeModalAjout.addEventListener("click", () => modalAjout.classList.remove("modal--show"));
                }

                const retourModifier = document.getElementById("retour-modifier");
                if (retourModifier) {
                    retourModifier.addEventListener("click", () => {
                        modalAjout.classList.remove("modal--show");
                        modalModifier.classList.add("modal--show");
                    });
                }
            };
            // Permettre de fermer la modale en cliquant en dehors de celle-ci
            document.addEventListener("click", (event) => {
                const modalModifier = document.getElementById("modal-modifier");
                const modalAjout = document.getElementById("modal-ajout");

                if (modalModifier && modalModifier.classList.contains("modal--show")) {
                    if (event.target === modalModifier) {
                        modalModifier.classList.remove("modal--show");
                    }
                }

                if (modalAjout && modalAjout.classList.contains("modal--show")) {
                    if (event.target === modalAjout) {
                        modalAjout.classList.remove("modal--show");
                    }
                }
            });


            setupModals();
        })
        .catch(error => console.error("Erreur:", error));

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
    authentification(); // Appel initial pour configurer les éléments
    const loginLogout = document.getElementById("loginLogout");
    if (localStorage.getItem("authToken")) {
        loginLogout.textContent = "logout";
        loginLogout.href = "#";
        loginLogout.addEventListener("click", () => {
            localStorage.removeItem("authToken");
            loginLogout.textContent = "login";
            loginLogout.href = "login.html";
            alert("Vous êtes déconnecté");
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


    // Téléchargement de photo
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const imagePreview = document.getElementById("image-preview");
    const placeholderImage = document.querySelector(".background-photo img");
    const infoText = document.getElementById("jpg-size");

    if (uploadButton) {
        uploadButton.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (file && file.type.startsWith("image/") && file.size <= 4 * 1024 * 1024) {
                placeholderImage.style.display = "none";
                uploadButton.style.display = "none";
                infoText.style.display = "none";

                const reader = new FileReader();
                reader.onload = e => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Aperçu de l'image" class="custom-preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                alert("Le fichier doit être une image et inférieur à 4 Mo.");
                fileInput.value = "";
            }
        });
    }

    // Ajouter un nouveau travail
    const formAjout = document.getElementById("form-ajout");
    if (formAjout) {
        formAjout.addEventListener("submit", event => {
            event.preventDefault();
            const titreInput = document.getElementById("text-titre");
            const categorieInput = document.getElementById("categorie-text");

            if (!titreInput.value || !categorieInput.value || !fileInput.files[0]) {
                alert("Veuillez remplir tous les champs et ajouter une image.");
                return;
            }

            const formData = new FormData();
            formData.append("title", titreInput.value);
            formData.append("category", categorieInput.value);
            formData.append("image", fileInput.files[0]);

            fetch("http://localhost:5678/api/works", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error("Erreur lors de l'envoi du projet.");
                    return response.json();
                })
                .then(newProject => {
                    const newFigure = document.createElement("figure");
                    newFigure.innerHTML = `
                        <img src="${newProject.imageUrl}" alt="${newProject.title}">
                        <figcaption>${newProject.title}</figcaption>
                    `;
                    gallery.appendChild(newFigure);
                    alert("Projet ajouté avec succès !");
                })
                .catch(() => alert("Une erreur est survenue lors de l'envoi du projet."));
        });
    }
});