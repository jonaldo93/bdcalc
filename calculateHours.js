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

    // ... (existing code to get input values and calculate hours)

    // Generate table HTML with the results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;">
                <td>BD</td>
                <td>${result.BD.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Nacht 25%</td>
                <td>${result.Nacht25.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
                <td>Nacht 40%</td>
                <td>${result.Nacht40.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Sonntag</td>
                <td>${result.Sonntag.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
                <td>Sonntag BD</td>
                <td>${result.SonntagBD.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Feiertag aktiv 35%</td>
                <td>${result.FeiertagAktiv35.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
                <td>Feiertag 25%</td>
                <td>${result.Feiertag25.toFixed(2)}</td>
            </tr>
        </table>
    `;
});
