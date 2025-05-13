// static/js/analyze.js
document.addEventListener("DOMContentLoaded", () => {
    const lesionsList = document.getElementById("lesions-list");

    // 1. Charger les prédictions de l'utilisateur connecté
    if (lesionsList) {
        fetch("/myhistory")
            .then((response) => {
                if (!response.ok) throw new Error("Erreur lors du chargement de l'historique.");
                return response.json();
            })
            .then((data) => {
                if (data.length === 0) {
                    lesionsList.innerHTML = `<p class="text-gray-500">Aucune analyse enregistrée pour le moment.</p>`;
                    return;
                }

                lesionsList.innerHTML = "";
                data.forEach((entry, index) => {
                    const html = `
                        <div class="border rounded-lg p-4 lesion-entry" data-id="${entry.id}">
                            <div class="flex justify-between">
                                <h4 class="font-bold">Lésion #${index + 1}</h4>
                                <span class="text-sm text-gray-500">${entry.date}</span>
                            </div>
                            <div class="flex mt-2">
                                <span class="px-2 py-1 text-xs bg-${getColor(entry.diagnostic)}-100 text-${getColor(entry.diagnostic)}-800 rounded-full mr-2">${entry.diagnostic}</span>
                                <span class="text-sm text-gray-600">Score : ${parseFloat(entry.confiance).toFixed(2)}%</span>
                            </div>
                            <button class="mt-2 text-blue-600 text-sm flex items-center view-detail">
                                <i class="fas fa-eye mr-1"></i> Voir détails
                            </button>
                        </div>`;
                    lesionsList.innerHTML += html;
                });
            })
            .catch((err) => {
                lesionsList.innerHTML = `<p class="text-red-500">${err.message}</p>`;
            });
    }

    // 2. Déterminer la couleur du badge
    function getColor(diagnostic) {
        if (diagnostic.includes("Mélanome")) return "red";
        if (diagnostic.includes("suspecte") || diagnostic.includes("précancéreuse")) return "yellow";
        return "green";
    }

    // 3. Analyse et affichage des résultats
    const confirmBtn = document.getElementById("confirm-zone");
    const analyzeSection = document.getElementById("analyse-section");
    const analyzeForm = document.getElementById("analyze-form");
    const imageInput = document.getElementById("lesion-image");
    const resultsContainer = document.getElementById("result-container");
    const placeholder = document.getElementById("results-placeholder");

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            analyzeSection.classList.remove("hidden");
            window.scrollTo({ top: analyzeSection.offsetTop, behavior: "smooth" });
        });
    }

    if (analyzeForm) {
        analyzeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(analyzeForm);

            try {
                const response = await fetch("/analyze", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error("Erreur lors de l’analyse.");
                const data = await response.json();

                document.getElementById("result-diagnostic").textContent = data.diagnostic;
                document.getElementById("result-confidence").textContent = data.confiance;
                document.getElementById("result-explication").textContent = data.explication;
                document.getElementById("result-date").textContent = data.date;
                document.getElementById("result-location").textContent = data.location;
                document.getElementById("analyse-zone").textContent = data.location || "Non précisée";

                placeholder.classList.add("hidden");
                resultsContainer.classList.remove("hidden");

                // Activation du bouton Enregistrer
                const saveBtn = document.getElementById("save-result");
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.addEventListener("click", async () => {
                        const imageFile = document.getElementById("lesion-image").files[0];
                        const payload = {
                            image_name: imageFile ? imageFile.name : "inconnu.jpg",
                            diagnostic: data.diagnostic,
                            confiance: data.confiance,
                            explication: data.explication,
                            date: data.date,
                            location: data.location || document.getElementById("hidden-location").value
                        };

                        try {
                            const res = await fetch("/save-result", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(payload)
                            });

                            const result = await res.json();
                            if (result.success) {
                                showToast("Résultat enregistré !");
                                saveBtn.disabled = true;
                            } else {
                                alert("Échec de l’enregistrement.");
                            }
                        } catch (err) {
                            alert("Erreur réseau : " + err.message);
                        }
                    });
                }

            } catch (error) {
                alert("Erreur : " + error.message);
            }
        });
    }
});
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded text-white shadow-lg z-50 transition-opacity duration-500 bg-${type === "success" ? "green" : "red"}-600`;
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => toast.remove(), 500);  // attendre transition
    }, 3000);
}
