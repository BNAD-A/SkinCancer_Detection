document.addEventListener("DOMContentLoaded", function() {
    console.log("Script interactiveMap.js chargé");
    
    // Détection de la page actuelle
    const isAnalyzePage = document.getElementById('analyse-section') !== null;
    const isHistoriquePage = document.getElementById('front-view') !== null;
    
    console.log("Page d'analyse:", isAnalyzePage);
    console.log("Page d'historique:", isHistoriquePage);
    
    // Switch between front and back views (Dos / Face)
    const switchViewButton = document.getElementById('switch-view');
    
    if (switchViewButton) {
        console.log("Bouton switch-view trouvé");
        
        switchViewButton.addEventListener('click', function() {
            console.log("Clic sur le bouton switch-view");
            
            if (isHistoriquePage) {
                // Logique pour la page historique
                const frontView = document.getElementById('front-view');
                const backView = document.getElementById('back-view');
                
                if (frontView.classList.contains('hidden')) {
                    frontView.classList.remove('hidden');
                    backView.classList.add('hidden');
                    switchViewButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Dos';
                    console.log("Vue changée: Face affichée");
                } else {
                    frontView.classList.add('hidden');
                    backView.classList.remove('hidden');
                    switchViewButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Face';
                    console.log("Vue changée: Dos affiché");
                }
            } else {
                // Logique pour la page analyze
                const bodyImage = document.getElementById('body-image');
                
                if (bodyImage) {
                    if (bodyImage.src.includes('Face.jpg')) {
                        bodyImage.src = bodyImage.src.replace('Face.jpg', 'Dos.jpg');
                        switchViewButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Face';
                        console.log("Image changée: Dos affiché");
                        
                        // Update zone positions for back view
                        updateZonePositionsForBackView();
                    } else {
                        bodyImage.src = bodyImage.src.replace('Dos.jpg', 'Face.jpg');
                        switchViewButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Dos';
                        console.log("Image changée: Face affichée");
                        
                        // Update zone positions for front view
                        updateZonePositionsForFrontView();
                    }
                } else {
                    console.log("Élément body-image non trouvé");
                }
            }
        });
    } else {
        console.log("Bouton switch-view NON trouvé");
    }

    // Functions to update zone positions based on the current view
    function updateZonePositionsForFrontView() {
        const zoneSelectors = document.querySelectorAll('.zone-selector');
        
        // Reset zone positions for front view
        zoneSelectors.forEach(zone => {
            const zoneType = zone.getAttribute('data-zone');
            
            switch(zoneType) {
                case 'visage':
                    setZonePosition(zone, 10, 50);
                    break;
                case 'cou':
                    setZonePosition(zone, 17, 50);
                    break;
                case 'epaule gauche':
                    setZonePosition(zone, 22, 35);
                    break;
                case 'epaule droite':
                    setZonePosition(zone, 22, 65);
                    break;
                case 'bras gauche':
                    setZonePosition(zone, 35, 25);
                    break;
                case 'bras droit':
                    setZonePosition(zone, 35, 75);
                    break;
                case 'torse':
                    setZonePosition(zone, 32, 50);
                    break;
                case 'abdomen':
                    setZonePosition(zone, 45, 50);
                    break;
                case 'jambe avant gauche':
                    setZonePosition(zone, 65, 40);
                    break;
                case 'jambe avant droite':
                    setZonePosition(zone, 65, 60);
                    break;
                case 'genou gauche':
                    setZonePosition(zone, 75, 40);
                    break;
                case 'genou droit':
                    setZonePosition(zone, 75, 60);
                    break;
                case 'jambe arriere gauche':
                    setZonePosition(zone, 85, 40);
                    break;
                case 'jambe arriere droite':
                    setZonePosition(zone, 85, 60);
                    break;
            }
        });
    }
    
    function updateZonePositionsForBackView() {
        const zoneSelectors = document.querySelectorAll('.zone-selector');
        
        // Update zone positions for back view
        zoneSelectors.forEach(zone => {
            const zoneType = zone.getAttribute('data-zone');
            
            switch(zoneType) {
                case 'visage':
                    // Hide or reposition as needed
                    zone.style.display = 'none';
                    break;
                case 'cou':
                    setZonePosition(zone, 5, 10);
                    break;
                case 'epaule gauche':
                    setZonePosition(zone, 22, 35);
                    break;
                case 'epaule droite':
                    setZonePosition(zone, 22, 65);
                    break;
                case 'bras gauche':
                    setZonePosition(zone, 35, 25);
                    break;
                case 'bras droit':
                    setZonePosition(zone, 35, 75);
                    break;
                case 'torse':
                    // Reposition to match back
                    setZonePosition(zone, 32, 50);
                    zone.setAttribute('data-zone', 'dos supérieur');
                    break;
                case 'abdomen':
                    // Reposition to match back
                    setZonePosition(zone, 45, 50);
                    zone.setAttribute('data-zone', 'dos inférieur');
                    break;
                case 'jambe avant gauche':
                    // Reposition to match back view
                    setZonePosition(zone, 65, 40);
                    zone.setAttribute('data-zone', 'jambe arrière gauche');
                    break;
                case 'jambe avant droite':
                    // Reposition to match back view
                    setZonePosition(zone, 65, 60);
                    zone.setAttribute('data-zone', 'jambe arrière droite');
                    break;
                case 'genou gauche':
                    // Reposition to match back view
                    setZonePosition(zone, 75, 40);
                    break;
                case 'genou droit':
                    // Reposition to match back view
                    setZonePosition(zone, 75, 60);
                    break;
                case 'jambe arriere gauche':
                    // Reposition to match back view
                    setZonePosition(zone, 85, 40);
                    break;
                case 'jambe arriere droite':
                    // Reposition to match back view
                    setZonePosition(zone, 85, 60);
                    break;
            }
        });
    }
    
    function setZonePosition(element, top, left) {
        element.style.top = top + '%';
        element.style.left = left + '%';
        element.style.display = 'block';
    }

    // Initialize front view positions on page load
    if (document.getElementById('body-image')) {
        updateZonePositionsForFrontView();
    }

    // Handle clicks on the clickable zones (pour la page analyze)
    const zoneSelectors = document.querySelectorAll('.zone-selector');
    if (zoneSelectors.length > 0) {
        console.log(`${zoneSelectors.length} zones sélectionnables trouvées`);
        
        zoneSelectors.forEach(zone => {
            zone.addEventListener('click', function() {
                const selectedZone = this.getAttribute('data-zone');
                console.log(`Zone sélectionnée: ${selectedZone}`);
                
                const selectedZoneElement = document.getElementById('selected-zone');
                if (selectedZoneElement) {
                    selectedZoneElement.textContent = selectedZone;
                }
                
                const confirmZoneButton = document.getElementById('confirm-zone');
                if (confirmZoneButton) {
                    confirmZoneButton.disabled = false;
                }
                
                // Highlight the selected zone
                zoneSelectors.forEach(z => z.style.backgroundColor = 'rgba(66, 133, 244, 0.3)');
                this.style.backgroundColor = 'rgba(66, 133, 244, 0.7)';
            });
        });
    } else {
        console.log("Aucune zone sélectionnable trouvée");
    }

    // Confirmer et analyser button functionality (pour la page analyze)
    const confirmButton = document.getElementById('confirm-zone');
    if (confirmButton) {
        console.log("Bouton confirm-zone trouvé");
        
        confirmButton.addEventListener('click', function() {
            console.log("Clic sur le bouton confirm-zone");
            
            const zoneSelectionElement = document.getElementById('zone-selection');
            const analyseSection = document.getElementById('analyse-section');
            
            if (zoneSelectionElement && analyseSection) {
                zoneSelectionElement.classList.add('hidden');
                analyseSection.classList.remove('hidden');
                console.log("Section d'analyse affichée");
                
                const analyseZoneElement = document.getElementById('analyse-zone');
                const selectedZoneElement = document.getElementById('selected-zone');
                
                if (analyseZoneElement && selectedZoneElement) {
                    analyseZoneElement.textContent = selectedZoneElement.textContent;
                    console.log(`Zone analysée définie: ${selectedZoneElement.textContent}`);
                }
            } else {
                console.log("Éléments zone-selection ou analyse-section non trouvés");
            }
        });
    } else {
        console.log("Bouton confirm-zone NON trouvé");
    }

    // Handle adding new markers (pour la page historique)
    const addMarkerButton = document.getElementById('add-marker-btn');
    if (addMarkerButton) {
        console.log("Bouton add-marker trouvé");
        
        addMarkerButton.addEventListener('click', function() {
            console.log("Clic sur le bouton add-marker");
            alert("Mode ajout activé : cliquez sur la carte pour placer un nouveau marqueur");
        });
    }

    // Handle clicks on existing markers to display details (pour la page historique)
    const lesionMarkers = document.querySelectorAll('.lesion-marker');
    if (lesionMarkers.length > 0) {
        console.log(`${lesionMarkers.length} marqueurs de lésion trouvés`);
        
        lesionMarkers.forEach(marker => {
            marker.addEventListener('click', function() {
                const lesionId = this.getAttribute('data-id');
                console.log(`Clic sur le marqueur de lésion #${lesionId}`);
                updateLesionDetails(lesionId);
            });
        });
    } else {
        console.log("Aucun marqueur de lésion trouvé");
    }

    // Update lesion details based on the marker clicked
    function updateLesionDetails(id) {
        console.log(`Mise à jour des détails pour la lésion #${id}`);
        
        const lesions = {
            '1': {
                title: "Lésion #1",
                date: "30/04/2025",
                location: "Bras gauche",
                status: "benign",
                risk: 15,
                notes: "Lésion stable depuis le dernier contrôle."
            },
            '2': {
                title: "Lésion #2",
                date: "28/04/2025",
                location: "Poitrine",
                status: "suspect",
                risk: 65,
                notes: "À surveiller - légère augmentation de taille."
            },
            '3': {
                title: "Lésion #3",
                date: "25/04/2025",
                location: "Dos",
                status: "malignant",
                risk: 87,
                notes: "Consultation dermatologique programmée."
            }
        };

        const lesion = lesions[id];
        if (!lesion) {
            console.log(`Lésion #${id} non trouvée dans les données`);
            return;
        }

        console.log("Données de lésion trouvées:", lesion);

        // Mise à jour des éléments d'interface
        const detailElements = {
            title: document.getElementById('lesion-title'),
            date: document.getElementById('lesion-date'),
            location: document.getElementById('lesion-location'),
            riskPercent: document.getElementById('risk-percent'),
            riskBar: document.getElementById('risk-bar'),
            notes: document.getElementById('lesion-notes'),
            status: document.getElementById('lesion-status'),
            detailContent: document.getElementById('detail-content')
        };

        // Mise à jour des éléments s'ils existent
        if (detailElements.title) detailElements.title.textContent = lesion.title;
        if (detailElements.date) detailElements.date.textContent = lesion.date;
        if (detailElements.location) detailElements.location.textContent = lesion.location;
        if (detailElements.riskPercent) detailElements.riskPercent.textContent = lesion.risk + '%';
        if (detailElements.riskBar) {
            detailElements.riskBar.style.width = lesion.risk + '%';
            
            // Réinitialiser les classes de couleur
            detailElements.riskBar.className = 'h-2.5 rounded-full';
            
            // Appliquer la classe appropriée
            if (lesion.risk < 30) {
                detailElements.riskBar.classList.add('bg-green-600');
            } else if (lesion.risk < 70) {
                detailElements.riskBar.classList.add('bg-yellow-500');
            } else {
                detailElements.riskBar.classList.add('bg-red-600');
            }
        }
        if (detailElements.notes) detailElements.notes.textContent = lesion.notes;

        if (detailElements.status) {
            detailElements.status.innerHTML = '';

            let statusClass = '';
            let statusText = '';
            
            if (lesion.status === 'benign') {
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Bénin';
            } else if (lesion.status === 'suspect') {
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusText = 'Suspect';
            } else {
                statusClass = 'bg-red-100 text-red-800';
                statusText = 'Malin';
            }

            const statusBadge = document.createElement('span');
            statusBadge.className = `px-2 py-1 text-xs ${statusClass} rounded-full`;
            statusBadge.textContent = statusText;
            detailElements.status.appendChild(statusBadge);
        }

        // Afficher les détails
        const infoMessage = document.querySelector('#lesion-details > .text-center');
        if (infoMessage) infoMessage.classList.add('hidden');
        if (detailElements.detailContent) detailElements.detailContent.classList.remove('hidden');
        
        console.log("Détails de la lésion mis à jour avec succès");
    }

    // Ajouter une gestion pour les entrées de lésion dans la liste historique
    const lesionEntries = document.querySelectorAll('.lesion-entry');
    if (lesionEntries.length > 0) {
        console.log(`${lesionEntries.length} entrées de lésion trouvées dans la liste`);
        
        lesionEntries.forEach(entry => {
            const viewDetailBtn = entry.querySelector('.view-detail');
            if (viewDetailBtn) {
                viewDetailBtn.addEventListener('click', function() {
                    const lesionId = entry.getAttribute('data-id');
                    console.log(`Clic sur "Voir détails" pour la lésion #${lesionId}`);
                    updateLesionDetails(lesionId);
                });
            }
        });
    }
});