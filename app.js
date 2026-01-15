// Form submission handler - COMPLETE VERSION
document.getElementById('calculator-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get all form values
    const formData = {
        geometry: geometrySelect.value,
        fluid: document.getElementById('fluid').value,
        velocity: parseFloat(document.getElementById('velocity').value),
        length: parseFloat(document.getElementById('length').value),
        inletTemperature: parseFloat(document.getElementById('inlet-temperature').value),
        wallTemperature: parseFloat(document.getElementById('wall-temperature').value),
        convectionType: document.querySelector('input[name="convection-type"]:checked').value
    };
    
    // Get geometry-specific dimensions
    switch(formData.geometry) {
        case 'circular':
            formData.diameter = parseFloat(document.getElementById('diameter').value);
            if (!formData.diameter || formData.diameter <= 0) {
                alert("Please enter a valid diameter");
                return;
            }
            break;
            
        case 'square':
            formData.sideLength = parseFloat(document.getElementById('side-length').value);
            if (!formData.sideLength || formData.sideLength <= 0) {
                alert("Please enter a valid side length");
                return;
            }
            break;
            
        case 'rectangular':
            formData.width = parseFloat(document.getElementById('width').value);
            formData.height = parseFloat(document.getElementById('height').value);
            if (!formData.width || formData.width <= 0 || !formData.height || formData.height <= 0) {
                alert("Please enter valid width and height");
                return;
            }
            break;
    }
    
    // --- START OF CORRECT CALCULATIONS ---
    
    // Calculate average temperature for fluid properties
    const avgTemp = (formData.inletTemperature + formData.wallTemperature) / 2;
    
    // Fluid properties (simplified but accurate enough for calculation)
    let rho, mu, k, Pr; // density, viscosity, thermal conductivity, Prandtl number
    
    if (formData.fluid === 'air') {
        // Air properties at average temperature
        if (avgTemp < 350) {
            rho = 1.2; // kg/m³ (approx at 300K)
            mu = 1.8e-5; // Pa·s (viscosity)
            k = 0.026; // W/m·K (thermal conductivity)
            Pr = 0.7; // Prandtl number
        } else {
            rho = 1.0; // kg/m³ (approx at 350K)
            mu = 2.0e-5; // Pa·s
            k = 0.03; // W/m·K
            Pr = 0.7;
        }
    } else { // water
        // Water properties
        if (avgTemp < 310) {
            rho = 1000; // kg/m³
            mu = 1.0e-3; // Pa·s
            k = 0.6; // W/m·K
            Pr = 7.0;
        } else {
            rho = 980; // kg/m³
            mu = 0.8e-3; // Pa·s
            k = 0.65; // W/m·K
            Pr = 5.0;
        }
    }
    
    // Calculate hydraulic diameter
    let Dh = 0;
    let geometryInfo = "";
    
    switch(formData.geometry) {
        case 'circular':
            Dh = formData.diameter;
            geometryInfo = `Circular, Diameter: ${formData.diameter.toFixed(4)} m`;
            break;
        case 'square':
            Dh = formData.sideLength;
            geometryInfo = `Square, Side Length: ${formData.sideLength.toFixed(4)} m`;
            break;
        case 'rectangular':
            const area = formData.width * formData.height;
            const perimeter = 2 * (formData.width + formData.height);
            Dh = (4 * area) / perimeter;
            geometryInfo = `Rectangular, Width: ${formData.width.toFixed(4)} m, Height: ${formData.height.toFixed(4)} m`;
            break;
    }
    
    // 1. Calculate Reynolds Number CORRECTLY: Re = (ρ * V * D) / μ
// CORRECT NEW CODE:
const Re = (fluidProps.density * data.velocity * Dh) / fluidProps.viscosity;
// This gives: (~1.2 * 2 * 0.05) / ~0.000018 = ~6,667    console.log(`Re calculation: (${rho} * ${formData.velocity} * ${Dh}) / ${mu} = ${Re}`);
    
    // 2. Determine flow regime
    let flowRegime = "Laminar";
    if (Re > 4000) {
        flowRegime = "Turbulent";
    } else if (Re > 2300) {
        flowRegime = "Transition";
    }
    
    // 3. Calculate Nusselt Number based on convection type and flow regime
    let Nu = 0;
    
    if (formData.convectionType === 'internal') {
        // Internal flow (pipe/duct flow)
        if (Re < 2300) {
            // Laminar flow in pipe - constant wall temperature
            Nu = 3.66;
        } else if (Re > 10000) {
            // Turbulent flow - Dittus-Boelter equation
            const n = (formData.wallTemperature > formData.inletTemperature) ? 0.4 : 0.3;
            Nu = 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, n);
        } else {
            // Transition flow - simplified correlation
            Nu = 0.021 * Math.pow(Re, 0.8) * Math.pow(Pr, 0.4);
        }
    } else {
        // External flow (flow over surface)
        if (Re < 5e5) {
            // Laminar flow over flat plate
            Nu = 0.664 * Math.pow(Re, 0.5) * Math.pow(Pr, 1/3);
        } else {
            // Turbulent flow over flat plate
            Nu = 0.037 * Math.pow(Re, 0.8) * Math.pow(Pr, 1/3);
        }
    }
    
    // 4. Calculate Heat Transfer Coefficient: h = (Nu * k) / D
    const h = (Nu * k) / Dh;
    
    // 5. Calculate surface area for heat transfer
    let surfaceArea = 0;
    if (formData.convectionType === 'internal') {
        // Internal flow: A = π * D * L (pipe surface area)
        surfaceArea = Math.PI * Dh * formData.length;
    } else {
        // External flow: A = L * characteristic length
        surfaceArea = formData.length * Dh;
    }
    
    // 6. Calculate heat transfer rate: q = h * A * ΔT
    const deltaT = formData.wallTemperature - formData.inletTemperature;
    const q = h * surfaceArea * deltaT;
    
    // Display results
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');
    
    resultsContent.innerHTML = `
        <h3>Calculation Results</h3>
        <p><strong>Geometry:</strong> ${geometryInfo}</p>
        <p><strong>Fluid Type:</strong> ${formData.fluid.charAt(0).toUpperCase() + formData.fluid.slice(1)}</p>
        <p><strong>Convection Type:</strong> ${formData.convectionType.charAt(0).toUpperCase() + formData.convectionType.slice(1)}</p>
        <p><strong>Flow Regime:</strong> ${flowRegime}</p>
        <p><strong>Average Temperature:</strong> ${avgTemp.toFixed(1)} K</p>
        <hr>
        <p><strong>Calculated Values:</strong></p>
        <p><strong>Hydraulic Diameter (Dh):</strong> ${Dh.toFixed(4)} m</p>
        <p><strong>Reynolds Number (Re):</strong> ${Re.toFixed(0)}</p>
        <p><strong>Prandtl Number (Pr):</strong> ${Pr.toFixed(3)}</p>
        <p><strong>Nusselt Number (Nu):</strong> ${Nu.toFixed(2)}</p>
        <p><strong>Heat Transfer Coefficient (h):</strong> ${h.toFixed(2)} W/m²·K</p>
        <p><strong>Surface Area (A):</strong> ${surfaceArea.toFixed(4)} m²</p>
        <p><strong>Temperature Difference (ΔT):</strong> ${deltaT.toFixed(1)} K</p>
        <p><strong>Heat Transfer Rate (q):</strong> ${q.toFixed(2)} W</p>
        <hr>
        <p><strong>Input Parameters:</strong></p>
        <p>Velocity: ${formData.velocity} m/s</p>
        <p>Length: ${formData.length} m</p>
        <p>Inlet Temperature (Ti): ${formData.inletTemperature} K</p>
        <p>Wall Temperature (Tw): ${formData.wallTemperature} K</p>
    `;
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Debug output to console
    console.log("=== CALCULATION RESULTS ===");
    console.log("Geometry:", formData.geometry);
    console.log("Fluid:", formData.fluid);
    console.log("Velocity:", formData.velocity, "m/s");
    console.log("Dh:", Dh, "m");
    console.log("Density (ρ):", rho, "kg/m³");
    console.log("Viscosity (μ):", mu, "Pa·s");
    console.log("Re = (ρ * V * D) / μ =", Re);
    console.log("k:", k, "W/m·K");
    console.log("Pr:", Pr);
    console.log("Nu:", Nu);
    console.log("h = (Nu * k) / D =", h, "W/m²·K");
    console.log("========================");
});
