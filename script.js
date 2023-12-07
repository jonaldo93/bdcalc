// Define the base rates
const rates = {
    MoDo: { BD: 11.75, Rate25: 5, Rate40: 4 },
    Fr: { BD: 13.25, Rate25: 5, Rate40: 4 },
    Sa: { BD: 19, Rate25: 5, Rate40: 4, SamstagExtra: 0.5, SamstagBD25: 8.75 },
    So: { BD: 18, Rate25: 5, Rate40: 4, Sonntag: 4.75, SonntagBD: 10.25 },
    Feiertag: { BD: 18, Rate25: 5, Rate40: 4, Feiertag35: 4.25, Feiertag25: 10.25 }
};

// This function calculates the total hours based on the input days
function calculateHours(inputDays) {
    let output = {
        BD: 0,
        Nacht25: 0,
        Nacht40: 0,
        Sonntag: 0,
        SonntagBD: 0,
        FeiertagAktiv35: 0,
        Feiertag25: 0
    };

    // Calculate hours for each category
    for (const dayType in inputDays) {
        const days = inputDays[dayType];
        const rate = rates[dayType];

        if (rate) {
            output.BD += days * rate.BD;
            output.Nacht25 += days * rate.Rate25;
            output.Nacht40 += days * rate.Rate40;

            if (dayType === 'Sa') {
                output.Sonntag += days * rate.SamstagExtra;
                output.SonntagBD += days * rate.SamstagBD25;
            }

            if (dayType === 'So') {
                output.Sonntag += days * rate.Sonntag;
                output.SonntagBD += days * rate.SonntagBD;
            }

            if (dayType === 'Feiertag') {
                output.FeiertagAktiv35 += days * rate.Feiertag35;
                output.Feiertag25 += days * rate.Feiertag25;
            }
        }
    }

    return output;
}

// Event listener for form submission
document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from the form
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Calculate the hours for each category
    const result = calculateHours({ MoDo, Fr, Sa, So, Feiertag });

    // Display the results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p>BD: ${result.BD.toFixed(2)}</p>
                            <p>Nacht 25%: ${result.Nacht25.toFixed(2)}</p>
                            <p>Nacht 40%: ${result.Nacht40.toFixed(2)}</p>
                            <p>Sonntag: ${result.Sonntag.toFixed(2)}</p>
                            <p>Sonntag BD: ${result.SonntagBD.toFixed(2)}</p>
                            <p>Feiertag aktiv 35%: ${result.FeiertagAktiv35.toFixed(2)}</p>
                            <p>Feiertag 25%: ${result.Feiertag25.toFixed(2)}</p>`;
});
