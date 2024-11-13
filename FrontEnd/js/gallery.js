document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5678/api/works")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            return response.json();
        })
        .then(data => {
            const gallery = document.getElementById("gallery");


            // Función para mostrar los trabajos en la galería
            const showWorks = (works) => {
                gallery.innerHTML = ""; // Limpiar la galería antes de agregar nuevos trabajos
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

            // Mostrar todos los trabajos al cargar
            showWorks(data);


            // Función para filtrar trabajos
            const filterWorks = (categoryId) => {
                if (categoryId === "all") {
                    showWorks(data); // Mostrar todos los trabajos
                } else {
                    const filteredWorks = data.filter(travail => travail.categoryId === categoryId);
                    showWorks(filteredWorks); // Mostrar trabajos filtrados
                }
            };

            // Añadir eventos a los botones de filtrado
            document.getElementById("filter-all").addEventListener("click", () => filterWorks("all"));
            document.getElementById("filter-objets").addEventListener("click", () => filterWorks(1)); // id 1 para "Objets"
            document.getElementById("filter-appartements").addEventListener("click", () => filterWorks(2)); // id 2 para "Appartements"
            document.getElementById("filter-hotels").addEventListener("click", () => filterWorks(3)); // id 3 para "Hotels & restaurants"
        })
        .catch(error => console.error("Erreur:", error));
});

