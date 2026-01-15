document.getElementById('calculator-form').addEventListener('submit', function(event) {
  event.preventDefault();
  console.log('Button clicked!');

  // Get inputs
  const velocity = parseFloat(document.getElementById('velocity').value);
  const diameter = parseFloat(document.getElementById('diameter').value);
  const temperature = parseFloat(document.getElementById('temperature').value);
  const viscosity = parseFloat(document.getElementById('viscosity').value);
  const fluidType = document.getElementById('fluid-type').value;
  const convectionType = document.querySelector('input[name="convection-type"]:checked').value;

  // Constants (just example values, can adjust as needed)
  const densityAir = 1.225;  // for air in kg/m^3
  const cpAir = 1005;  // Specific heat for air in J/kg·K
  const kAir = 0.0257;  // Thermal conductivity for air in W/m·K

  // Calculate Reynolds Number
  const reynolds = (densityAir * velocity * diameter) / viscosity;

  let nusselt, heatTransferCoefficient;

  // Based on convection type
  if (convectionType === 'external') {
    // Nusselt number for external flow (example formula)
    nusselt = 0.023 * Math.pow(reynolds, 0.8);
  } else {
    // Nusselt number for internal flow (example formula)
    nusselt = 0.023 * Math.pow(reynolds, 0.8);
  }

  // Calculate heat transfer coefficient
  heatTransferCoefficient = (nusselt * kAir) / diameter;

  // Display results
  document.getElementById('heat-transfer-coefficient').textContent = `Heat Transfer Coefficient: ${heatTransferCoefficient.toFixed(2)} W/m²·K`;

  // Generate a more realistic temperature distribution based on the convection model
  const temperatureDistribution = [];
  const distanceIncrement = 5; // e.g., the total distance is 5 meters, with a point every 1 meter

  for (let i = 0; i <= distanceIncrement; i++) {
    // Adjust this formula to better reflect the convection model
    let temp = temperature + (i * heatTransferCoefficient);  // Modify with more accurate temp change formula
    temperatureDistribution.push(temp);
  }

  // Get the canvas element (Make sure the canvas is in your HTML)
  const ctx = document.getElementById('temperature-graph').getContext('2d');

  // Generate the graph using Chart.js
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5], // X-axis values (Distance)
      datasets: [{
        label: 'Temperature Distribution',
        data: temperatureDistribution,  // Y-axis values (Temperature)
        borderColor: 'rgb(75, 192, 192)',
        fill: false
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Distance (m)'  // X-axis label
          }
        },
        y: {
          title: {
            display: true,
            text: 'Temperature (K)'  // Y-axis label
          }
        }
      }
    }
  });

  // Show the results section
  document.getElementById('results').style.display = 'block';
});
