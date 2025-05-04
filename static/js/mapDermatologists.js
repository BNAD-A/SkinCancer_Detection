// Variable globale pour stocker l'instance de la carte
let mapInstance = null;

// Fonction d'initialisation appelée au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupFilterListeners();
});

// Données des dermatologues
const dermatologists = [
    {
        id: 1,
        name: "Dr. Maha ALJ",
        specialty: "Dermatologie générale, Oncologie cutanée",
        address: "Hay Mohammadi. Ain Borja. Casablanca",
        phone: "+212 5 22 60 13 06",
        email: "dr.alj.dermato@gmail.com",
        lat: 33.58075, 
        lng: -7.56344,
        city: "casablanca",
        specialities: ["generale"],
        photo: "/static/img/Maha.jpg"
    },
    {
        id: 2,
        name: "Dr. Sofia EL MESBAHI",
        specialty: "Dermatologie pédiatrique",
        address: "6 Boulevard Al-Quods, Casablanca",
        phone: "+212 5 22 38 05 59",
        email: "S.ElMesbahi.Dermato@gmail.ma",
        lat: 33.53708, 
        lng: -7.60572,
        city: "casablanca",
        specialities: ["pediatrique"],
        photo: "/static/img/Sofia.jpg"
    },
    {
        id: 3,
        name: "Dr. Imane ALOUANI",
        specialty: "Dermatologie générale",
        address: "Angle Bd Mohammed Belakhdar, Oujda",
        phone: "+212 5 36 68 16 33",
        email: "dr.alouani@gmail.ma",
        lat: 34.67, 
        lng: -1.92047,
        city: "oujda",
        specialities: ["generale"],
        photo: "/static/img/Imane.jpg"
    },
    {
        id: 4,
        name: "Dr. Ryme DASSOULI",
        specialty: "Oncologie cutanée",
        address: "22 Avenue des FAR, Fès",
        phone: "+212 5 38 92 56 20",
        email: "r.dassouli@outlook.ma",
        lat: 34.0373, 
        lng: -4.996,
        city: "fes",
        specialities: ["oncologique"],
        photo: "/static/img/Ryme.jpg"
    },
    {
        id: 5,
        name: "Dr. Karim LAKHSSASSI",
        specialty: "Dermatologie pédiatrique, Dermatologie générale",
        address: "10 Av. DES FORCES ARMEES ROYALES, Fès",
        phone: "+212 5 35 65 62 61",
        email: "Dr.Karim.Lakhssassi@gmail.com",
        lat: 34.03651, 
        lng: -5.003,
        city: "fes",
        specialities: ["pediatrique", "generale"],
        photo: "/static/img/Karin.png"
    },
    {
        id: 6,
        name: "Dr. Nourdinne KOURDI",
        specialty: "Dermatologie générale",
        address: "30, Rue Khalid B. Oualid, Tanger",
        phone: "+212 5 39 33 14 36",
        email: "N.kourdi@gmail.com",
        lat: 35.76727, 
        lng: -5.7997,
        city: "tanger",
        specialities: ["generale"],
        photo: "/static/img/Kourdi.jpg"
    },
    {
        id: 7,
        name: "Dr. Naoual JAADA",
        specialty: "Oncologie Cutanée",
        address: " Place Moulay Ali Chérif Hassan, Rabat",
        phone: "+212 5 37 76 76 39",
        email: "N.jaada@gmail.com",
        lat: 34.0148, 
        lng: -6.82917,
        city: "rabat",
        specialities: ["oncologie"],
        photo: "/static/img/najoua.jpg"
    },
    {
        id: 8,
        name: "Dr. Hasnaa DOBLALI",
        specialty: "Oncologie Cutanée",
        address: "Technolope 2 Agadir Bay Founty, Agadir",
        phone: "+212 5 28 84 64 84",
        email: "SkinSlim.Doblali@gmail.com",
        lat: 30.40353, 
        lng: -9.58673,
        city: "agadir",
        specialities: ["oncologie"],
        photo: "/static/img/Hasnaa.jpg"
    }
];

function initializeMap() {
    // Vérification que l'élément #map existe
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log("L'élément #map n'existe pas dans le DOM");
        return;
    }

    console.log("Initialisation de la carte...");

    // Si une carte existe déjà, la nettoyer correctement
    if (mapInstance) {
        console.log("Le conteneur de carte contient déjà une instance Leaflet. Nettoyage...");
        mapInstance.remove();  // Supprimer l'instance existante
        mapInstance = null;    // Réinitialiser la variable
    }

    // Initialisation de la carte
    try {
        // Créer une nouvelle instance de carte
        mapInstance = L.map('map').setView([31.7917, -7.0926], 6); // Vue centrée sur le Maroc

        // Ajout des tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mapInstance);

        // Ajouter tous les marqueurs initialement
        addMarkers(dermatologists);
        
        console.log("Carte initialisée avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
    }
}

// Fonction pour ajouter les marqueurs
function addMarkers(doctors) {
    if (!mapInstance) {
        console.error("Impossible d'ajouter des marqueurs: l'instance de carte n'existe pas");
        return;
    }
    
    // Supprimer tous les marqueurs existants d'abord
    mapInstance.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            mapInstance.removeLayer(layer);
        }
    });
    
    console.log(`Ajout de ${doctors.length} marqueurs sur la carte`);
    
    // Créer et ajouter les nouveaux marqueurs
    doctors.forEach(doctor => {
        const marker = L.marker([doctor.lat, doctor.lng]).addTo(mapInstance);

        marker.bindPopup(`
            <div class="popup-content">
                <img src="${doctor.photo}" alt="${doctor.name}" width="80" height="80" class="rounded-full">
                <h3 class="font-bold text-lg mt-2">${doctor.name}</h3>
                <p class="text-gray-600 text-sm">${doctor.specialty}</p>
                <p class="text-gray-700 text-sm mt-2">${doctor.address}</p>
                <div class="mt-3">
                    <a href="tel:${doctor.phone}" class="text-blue-500 text-sm">
                        <i class="fas fa-phone mr-1"></i> ${doctor.phone}
                    </a>
                </div>
                <a href="mailto:${doctor.email}" 
                   class="inline-block mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    <i class="fas fa-envelope mr-1"></i> Envoyer un email
                </a>
            </div>
        `);
    });
}

// Configuration des écouteurs d'événements pour les filtres
function setupFilterListeners() {
    const applyFiltersButton = document.getElementById('apply-filters');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }
}

// Appliquer les filtres sélectionnés
function applyFilters() {
    // Récupérer la ville sélectionnée
    const citySelect = document.getElementById('city-filter');
    const selectedCity = citySelect ? citySelect.value : 'all';
    
    // Récupérer les spécialités sélectionnées
    const specialityCheckboxes = document.querySelectorAll('.speciality-filter:checked');
    const selectedSpecialities = Array.from(specialityCheckboxes).map(checkbox => checkbox.value);
    
    // Filtrer les dermatologues
    let filteredDoctors = dermatologists;
    
    // Filtrer par ville si nécessaire
    if (selectedCity !== 'all') {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.city === selectedCity);
    }
    
    // Filtrer par spécialité si des spécialités sont sélectionnées
    if (selectedSpecialities.length > 0) {
        filteredDoctors = filteredDoctors.filter(doctor => 
            doctor.specialities.some(spec => selectedSpecialities.includes(spec))
        );
    }
    
    console.log(`Affichage de ${filteredDoctors.length} dermatologues après filtrage`);
    
    // Ajouter les marqueurs filtrés à la carte
    addMarkers(filteredDoctors);
    
    // Si aucun résultat, afficher un message
    if (filteredDoctors.length === 0) {
        alert("Aucun dermatologue ne correspond à vos critères de recherche. Essayez d'élargir vos filtres.");
    }
}