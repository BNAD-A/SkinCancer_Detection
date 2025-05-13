document.addEventListener("DOMContentLoaded", () => {
    const isHistoryPage = window.location.pathname.includes("history");
    const isAnalyzePage = window.location.pathname.includes("analyze");
    let isFront = true;

    const bodyImage = document.getElementById("body-image");
    const switchBtn = document.getElementById("switch-view");
    const container = bodyImage?.parentElement;

    const confirmModal = document.getElementById("confirm-modal");
    const confirmOk = document.getElementById("confirm-ok");
    const confirmCancel = document.getElementById("confirm-cancel");

    let deleteTargetId = null;
    let deleteTargetBlock = null;

    if (!bodyImage || !switchBtn || !container) return;

    const locationMapping = {
        "visage": { view: "face", top: "10%", left: "50%" },
        "bras gauche": { view: "face", top: "35%", left: "25%" },
        "bras droit": { view: "face", top: "35%", left: "75%" },
        "torse": { view: "face", top: "32%", left: "50%" },
        "abdomen": { view: "face", top: "45%", left: "50%" },
        "jambe gauche": { view: "face", top: "65%", left: "40%" },
        "jambe droite": { view: "face", top: "65%", left: "60%" },
        "pied gauche": { view: "face", top: "95%", left: "40%" },
        "pied droit": { view: "face", top: "95%", left: "60%" },
        "nuque": { view: "back", top: "12%", left: "50%" },
        "épaule gauche": { view: "back", top: "35%", left: "25%" },
        "épaule droite": { view: "back", top: "35%", left: "75%" },
        "dos supérieur": { view: "back", top: "32%", left: "50%" },
        "dos inférieur": { view: "back", top: "45%", left: "50%" },
        "cuisse arrière gauche": { view: "back", top: "65%", left: "40%" },
        "cuisse arrière droite": { view: "back", top: "65%", left: "60%" },
        "talon gauche": { view: "back", top: "95%", left: "40%" },
        "talon droit": { view: "back", top: "95%", left: "60%" }
    };

    function getClassByDiagnostic(diagnostic) {
        const diag = diagnostic.toLowerCase();
        if (diag.includes("mélanome")) return "malignant";
        if (diag.includes("suspect") || diag.includes("pré")) return "suspect";
        return "benign";
    }

    function showAlert(message, type = "success") {
        let alertBox = document.getElementById("custom-alert");
        if (!alertBox) {
            alertBox = document.createElement("div");
            alertBox.id = "custom-alert";
            alertBox.className = "fixed top-5 right-5 z-50 px-4 py-2 rounded text-white font-semibold shadow-lg";
            document.body.appendChild(alertBox);
        }

        alertBox.textContent = message;
        alertBox.className = `fixed top-5 right-5 z-50 px-4 py-2 rounded text-white font-semibold shadow-lg ${type === "success" ? "bg-green-600" : "bg-red-600"}`;
        alertBox.classList.remove("hidden");

        setTimeout(() => {
            alertBox.classList.add("hidden");
        }, 3000);
    }

    function renderMarkers(view) {
        document.querySelectorAll(".lesion-marker, .zone-selector").forEach(el => el.remove());

        if (isHistoryPage) {
            fetch("/myhistory")
                .then(res => res.json())
                .then(data => {
                    const groupedByLocation = {};

                    data.forEach(pred => {
                        const key = pred.location?.toLowerCase();
                        if (!key) return;
                        if (!groupedByLocation[key]) groupedByLocation[key] = [];
                        groupedByLocation[key].push(pred);
                    });

                    for (const [location, preds] of Object.entries(groupedByLocation)) {
                        const mapping = locationMapping[location];
                        if (!mapping || mapping.view !== view) continue;

                        const marker = document.createElement("div");
                        marker.className = `lesion-marker ${getClassByDiagnostic(preds.at(-1).diagnostic)}`;
                        marker.dataset.location = location;
                        Object.assign(marker.style, {
                            position: "absolute",
                            top: mapping.top,
                            left: mapping.left
                        });

                        marker.addEventListener("click", () => {
                            document.querySelectorAll(".lesion-marker").forEach(m => m.classList.remove("active"));
                            marker.classList.add("active");

                            const container = document.getElementById("lesion-details");
                            container.innerHTML = "<h3 class='text-xl font-semibold mb-4'>Détails de la lésion</h3>";

                            preds.forEach(pred => {
                                const risk = parseFloat(pred.confiance.replace("%", ""));
                                const riskColor = risk < 30 ? "bg-green-600" : risk < 70 ? "bg-yellow-500" : "bg-red-600";
                                const statusClass = getClassByDiagnostic(pred.diagnostic);
                                const badgeClass =
                                    statusClass === "malignant" ? "bg-red-100 text-red-800" :
                                    statusClass === "suspect" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-green-100 text-green-800";

                                const block = document.createElement("div");
                                block.className = "mb-6 border-b pb-4 lesion-block";
                                block.dataset.id = pred.id;

                                block.innerHTML = `
                                    <div class="flex justify-between mb-2">
                                        <h4 class="font-bold text-md">Lésion #${pred.id}</h4>
                                        <span class="text-sm text-gray-500">${pred.date}</span>
                                    </div>
                                    <p><strong>Localisation :</strong> ${pred.location}</p>
                                    <p><strong>Diagnostic :</strong> <span class="px-2 py-1 text-xs rounded-full ${badgeClass}">${pred.diagnostic}</span></p>
                                    <p><strong>Confiance :</strong> ${pred.confiance}</p>
                                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1 mb-2">
                                        <div class="${riskColor} h-2 rounded-full" style="width:${pred.confiance}"></div>
                                    </div>
                                    <p><strong>Notes :</strong> ${pred.explication || '-'}</p>
                                    <button class="btn-supprimer mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm" data-id="${pred.id}">
                                        <i class="fas fa-trash-alt mr-1"></i> Supprimer
                                    </button>
                                `;

                                container.appendChild(block);
                            });
                        });

                        container.appendChild(marker);
                    }
                });
        } else if (isAnalyzePage) {
            for (const [location, mapping] of Object.entries(locationMapping)) {
                if (mapping.view !== view) continue;

                const marker = document.createElement("div");
                marker.className = "zone-selector";
                marker.dataset.zone = location;
                Object.assign(marker.style, {
                    position: "absolute",
                    top: mapping.top,
                    left: mapping.left,
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "2px dashed #4285f4",
                    backgroundColor: "rgba(66, 133, 244, 0.3)",
                    cursor: "pointer"
                });

                marker.addEventListener("click", () => {
                    document.querySelectorAll(".zone-selector").forEach(z => {
                        z.style.backgroundColor = "rgba(66, 133, 244, 0.3)";
                    });
                    marker.style.backgroundColor = "rgba(66, 133, 244, 0.7)";
                    const zoneName = marker.dataset.zone;
                    const display = document.getElementById("selected-zone");
                    const input = document.getElementById("hidden-location");
                    const confirmBtn = document.getElementById("confirm-zone");

                    if (display) display.textContent = zoneName;
                    if (input) input.value = zoneName;
                    if (confirmBtn) confirmBtn.disabled = false;
                });

                container.appendChild(marker);
            }
        }
    }

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".btn-supprimer");
        if (!btn) return;

        deleteTargetId = btn.dataset.id;
        deleteTargetBlock = btn.closest(".lesion-block");
        confirmModal.classList.remove("hidden");
    });

    confirmCancel?.addEventListener("click", () => {
        confirmModal.classList.add("hidden");
    });

    confirmOk?.addEventListener("click", () => {
        confirmModal.classList.add("hidden");

        fetch(`/delete-prediction/${deleteTargetId}`, { method: "DELETE" })
            .then(res => res.json())
            .then(data => {
                if (data.success && deleteTargetBlock) {
                    deleteTargetBlock.remove();
                    showAlert("✔️ Prédiction supprimée", "success");
                } else {
                    showAlert("❌ Échec de suppression", "error");
                }
            })
            .catch(() => showAlert("❌ Erreur réseau", "error"));
    });

    renderMarkers("face");

    switchBtn.addEventListener("click", () => {
        isFront = !isFront;
        bodyImage.src = isFront ? "/static/img/Face.jpg" : "/static/img/Dos.jpg";
        switchBtn.innerHTML = `<i class="fas fa-sync-alt mr-1"></i> ${isFront ? "Dos" : "Face"}`;
        renderMarkers(isFront ? "face" : "back");
    });
});
