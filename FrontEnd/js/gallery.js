document.addEventListener("DOMContentLoaded", () => {
    // Récupérer les données depuis l'API
    fetch("http://localhost:5678/api/works")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            return response.json();
        })
        .then(data => {
            const gallery = document.getElementById("gallery");
            const modalGallery = document.getElementById("modal-gallery");

            // Fonction pour afficher les travaux dans la galerie
            const showWorks = works => {
                gallery.innerHTML = "";
                works.forEach(travail => {
                    const workElement = document.createElement("figure");
                    workElement.setAttribute("data-id", travail.id);
                    workElement.classList.add("work-item");
                    workElement.innerHTML = `
                        <img src="${travail.imageUrl}" alt="${travail.title}">
                        <figcaption>${travail.title}</figcaption>
                    `;
                    gallery.appendChild(workElement);
                });
            };

            // Initialiser la galerie avec tous les travaux
            if (gallery) showWorks(data);

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

            if (modalGallery) showWorksModal(data);
            return data;
        })
        .catch(error => console.error("Erreur:", error));

    const resetForm = () => {
        formAjout.reset(); // Restablece los campos del formulario
        validerButton.disabled = true; // Desactiva el botón "Valider"
        validerButton.classList.remove("enabled"); // Elimina cualquier estilo activo en el botón
        imagePreview.innerHTML = ""; // Limpia la vista previa de la imagen
        placeholderImage.style.display = ""; // Restaura la imagen de marcador de posición
        uploadButton.style.display = ""; // Restaura el botón de carga
        infoText.style.display = ""; // Restaura el texto informativo
    };

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
            closeModalAjout.addEventListener("click", () => {
                modalAjout.classList.remove("modal--show");
                resetForm(); // Resetea el formulario al cerrar la modal
            });
        }

        const retourModifier = document.getElementById("retour-modifier");
        if (retourModifier) {
            retourModifier.addEventListener("click", () => {
                modalAjout.classList.remove("modal--show");
                modalModifier.classList.add("modal--show");
                resetForm();
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
                resetForm();
            }
        }
    });
    setupModals();

    // Ajouter une fonctionnalité de suppression pour la modale
    const addDeleteEventListeners = () => {
        const trashIcons = document.querySelectorAll(".trash-icon");
        trashIcons.forEach(icon => {
            icon.addEventListener("click", event => {
                const workElement = event.target.closest(".modal-image-wrapper");
                const workId = workElement.getAttribute("data-id");
                const galleryItem = document.querySelector(`#gallery figure[data-id="${workId}"]`);
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
                                galleryItem.remove();
                            } else {
                                throw new Error("Erreur lors de la suppression du projet.");
                            }
                        })
                        .catch(error => alert("Une erreur est survenue lors de la suppression."));
                }
            });
        });
    };

    // Barre edition
    const adminBar = document.getElementById("admin-bar");
    const header = document.querySelector("header");
    const isAuthenticated = !!localStorage.getItem("authToken");

    if (isAuthenticated) {
        adminBar.classList.remove("hidden");
        header.classList.add("with-admin-bar");
    } else {
        header.classList.remove("with-admin-bar");
    }

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

    // Configuration de la galerie modale
    const modalGallery = document.getElementById("modal-gallery");
    const showWorksModal = works => {
        if (modalGallery) {
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
        }
    };

    const updateModalGallery = () => {
        fetch("http://localhost:5678/api/works")
            .then((response) => {
                if (!response.ok) throw new Error("Erreur lors de la récupération des travaux.");
                return response.json();
            })
            .then((works) => {
                showWorksModal(works);
            })
            .catch((error) => console.error("Erreur lors de la mise à jour de la galerie modale :", error));
    };

    // Ajouter un nouveau travail
    const formAjout = document.getElementById("form-ajout");
    const validerButton = document.getElementById("valider");
    const titreInput = document.getElementById("text-titre");
    const categorieInput = document.getElementById("categorie-text");

    if (formAjout) {
        const validateForm = () => {
            const isTitleValid = titreInput.value.trim() !== ""; // Título no vacío
            const isCategoryValid = categorieInput.value !== ""; // Categoría seleccionada
            const isFileValid = fileInput.files.length > 0; // Archivo seleccionado

            if (isTitleValid && isCategoryValid && isFileValid) {
                validerButton.disabled = false; // Habilita el botón
                validerButton.classList.add("enabled"); // Cambia el color
            } else {
                validerButton.disabled = true; // Deshabilita el botón
                validerButton.classList.remove("enabled"); // Quita el color
            }
        };
        titreInput.addEventListener("input", validateForm);
        categorieInput.addEventListener("change", validateForm);
        fileInput.addEventListener("change", validateForm);

        formAjout.addEventListener("submit", event => {
            event.preventDefault();

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
                    // reset upload div
                    document.getElementById("upload-button").style.display = "flex";
                    document.getElementById("image-preview").innerHTML = "";
                    document.querySelector(".background-photo img").style.display = "flex";
                    document.getElementById("jpg-size").style.display = "flex";
                    // mettre à jour la galerie dans la modal
                    updateModalGallery();
                    // ajout du nouveau projet dans le portfolio
                    const newFigure = document.createElement("figure");
                    newFigure.innerHTML = `
                        <img src="${newProject.imageUrl}" alt="${newProject.title}">
                        <figcaption>${newProject.title}</figcaption>
                    `;
                    gallery.appendChild(newFigure);
                    alert("Projet ajouté avec succès !");
                    formAjout.reset();
                    validateForm(); // Vuelve a deshabilitar el botón
                })
                .catch(() => {
                    alert("Une erreur est survenue lors de l'envoi du projet.");
                    formAjout.reset();
                });
        });
    }
});

