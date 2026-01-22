/**
 * Wine Cultivar Prediction System - JavaScript
 * Handles form submission, prediction API calls, and results display
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        makePrediction();
    });
});

/**
 * Make prediction by sending data to the Flask backend
 */
function makePrediction() {
    // Get form data
    const formData = new FormData(document.getElementById('predictionForm'));
    
    const data = {
        alcohol: formData.get('alcohol'),
        malic_acid: formData.get('malic_acid'),
        ash: formData.get('ash'),
        total_phenols: formData.get('total_phenols'),
        flavanoids: formData.get('flavanoids'),
        color_intensity: formData.get('color_intensity')
    };

    // Validate data
    if (!validateInput(data)) {
        showError('Please fill in all fields with valid values.');
        return;
    }

    // Show loading spinner
    showLoadingSpinner(true);
    hideError();

    // Make API request
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        showLoadingSpinner(false);
        if (result.success) {
            displayResults(result);
        } else {
            showError('Prediction failed: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        showLoadingSpinner(false);
        console.error('Error:', error);
        showError('An error occurred: ' + error.message);
    });
}

/**
 * Validate input data
 */
function validateInput(data) {
    for (let key in data) {
        const value = parseFloat(data[key]);
        if (isNaN(value)) {
            return false;
        }
    }
    return true;
}

/**
 * Display prediction results
 */
function displayResults(result) {
    // Update predicted cultivar
    document.getElementById('predictedCultivar').textContent = result.predicted_cultivar;
    
    // Update confidence
    const confidence = result.confidence.toFixed(2);
    document.getElementById('confidence').textContent = `Confidence: ${confidence}%`;

    // Display probabilities
    displayProbabilities(result.probabilities);

    // Display input summary
    displayInputSummary(result.input_features);

    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Display probability distribution
 */
function displayProbabilities(probabilities) {
    const container = document.getElementById('probabilitiesContainer');
    container.innerHTML = '';

    for (let cultivar in probabilities) {
        const probability = probabilities[cultivar];
        
        const barElement = document.createElement('div');
        barElement.className = 'probability-bar';
        
        barElement.innerHTML = `
            <div class="probability-label">
                <span>${cultivar}</span>
                <span class="probability-value">${probability.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%">
                    <span></span>
                </div>
            </div>
        `;
        
        container.appendChild(barElement);

        // Animate progress bar
        setTimeout(() => {
            const progressFill = barElement.querySelector('.progress-fill');
            progressFill.style.width = probability + '%';
            if (probability > 0) {
                progressFill.querySelector('span').textContent = probability.toFixed(1) + '%';
            }
        }, 50);
    }
}

/**
 * Display input features summary
 */
function displayInputSummary(features) {
    const container = document.getElementById('inputSummary');
    container.innerHTML = '';

    const featureLabels = {
        'alcohol': 'Alcohol (%)',
        'malic_acid': 'Malic Acid (g/dm³)',
        'ash': 'Ash (g/dm³)',
        'total_phenols': 'Total Phenols (g/dm³)',
        'flavanoids': 'Flavanoids (g/dm³)',
        'color_intensity': 'Color Intensity'
    };

    for (let feature in features) {
        const value = features[feature];
        const label = featureLabels[feature] || feature;

        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div class="summary-label">${label}</div>
            <div class="summary-value">${value.toFixed(3)}</div>
        `;
        
        container.appendChild(itemElement);
    }
}

/**
 * Show loading spinner
 */
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
        document.getElementById('predictionForm').style.opacity = '0.5';
        document.getElementById('predictionForm').style.pointerEvents = 'none';
    } else {
        spinner.classList.add('hidden');
        document.getElementById('predictionForm').style.opacity = '1';
        document.getElementById('predictionForm').style.pointerEvents = 'auto';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = '❌ Error: ' + message;
    errorElement.classList.remove('hidden');
    errorElement.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.classList.add('hidden');
    errorElement.classList.remove('show');
}

/**
 * Sample data for testing (can be used in console)
 */
function loadSampleData() {
    document.getElementById('alcohol').value = 13.2;
    document.getElementById('malic_acid').value = 2.8;
    document.getElementById('ash').value = 2.3;
    document.getElementById('total_phenols').value = 2.5;
    document.getElementById('flavanoids').value = 2.3;
    document.getElementById('color_intensity').value = 5.0;
    console.log('Sample data loaded. Click Predict to test the model.');
}
