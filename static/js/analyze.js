// static/js/analyze.js
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    
    analyzeBtn.addEventListener('click', () => {
        // Simulation chargement
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse en cours...';
        
        // Mock des résultats après 2s
        setTimeout(() => {
            displayResults({
                diagnosis: "Nævus atypique",
                confidence: 0.78,
                riskLevel: "medium",
                imageUrl: "static/images/mock-lesion.jpg"
            });
            analyzeBtn.textContent = "Analyser";
        }, 2000);
    });
});

function displayResults(data) {
    document.getElementById('result-diag').textContent = data.diagnosis;
    document.getElementById('result-confidence').textContent = `${data.confidence * 100}%`;
    document.getElementById('result-image').src = data.imageUrl;
    document.getElementById('risk-level').className = `risk-level ${data.riskLevel}-risk`;
    
    // Afficher la section résultats
    document.getElementById('results-section').classList.remove('hidden');
}