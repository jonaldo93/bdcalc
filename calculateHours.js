
// Define the base rates
const rates = {
    MoDo: { BD: 11.75, Rate25: 5, Rate40: 4 },
    Fr: { BD: 13.25, Rate25: 5, Rate40: 4 },
    Sa: { BD: 19, Rate25: 5, Rate40: 4, SamstagExtra: 0.5, SamstagBD25: 8.75 },
    So: { BD: 18, Rate25: 5, Rate40: 4, Sonntag: 4.75, SonntagBD: 10.25 },
    Feiertag: { BD: 18, Rate25: 5, Rate40: 4, Feiertag35: 4.25, Feiertag25: 10.25 }
};

function calculateHours(inputDays) {
    let output = {
        BD: 0,
        Nacht25: 0,
        Nacht40: 0,
        Sonntag: 0,
        SonntagBD: 0,
        FeiertagAktiv35: 0,
        Feiertag25: 0,
        ZusatzBonus: 0
    };

    for (const dayType in inputDays) {
        const days = inputDays[dayType];
        const rate = rates[dayType];

        if (rate) {
            output.BD += days * rate.BD;
            output.Nacht25 += days * rate.Rate25;
            output.Nacht40 += days * rate.Rate40;
            // ... other calculations ...
        }
    }

    // Calculate the additional bonus for more than four on-calls
    const totalOnCalls = inputDays['fifthOnCall'] + inputDays['sixthOnCall'] + inputDays['seventhOnCall'] + inputDays['eighthOnCall'] + inputDays['ninthOnCall'];
    if (totalOnCalls > 4) {
        const additionalCalls = totalOnCalls - 4;
        output.ZusatzBonus = additionalCalls * (output.Nacht25 * 0.25 + output.Nacht40 * 0.4);
    }

    return output;
}

document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Standard day inputs
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Additional on-calls
    const fifthOnCall = parseInt(document.getElementById('fifthOnCall').value, 10) || 0;
    const sixthOnCall = parseInt(document.getElementById('sixthOnCall').value, 10) || 0;
    const seventhOnCall = parseInt(document.getElementById('seventhOnCall').value, 10) || 0;
    const eighthOnCall = parseInt(document.getElementById('eighthOnCall').value, 10) || 0;
    const ninthOnCall = parseInt(document.getElementById('ninthOnCall').value, 10) || 0;

    // Calculate the hours
    const result = calculateHours({ MoDo, Fr, Sa, So, Feiertag, fifthOnCall, sixthOnCall, seventhOnCall, eighthOnCall, ninthOnCall });

    // Display the results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;"><td>BD</td><td>${result.BD.toFixed(2)}</td></tr>
            <tr><td>Nacht 25%</td><td>${result.Nacht25.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Nacht 40%</td><td>${result.Nacht40.toFixed(2)}</td></tr>
            <tr><td>Sonntag</td><td>${result.Sonntag.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Sonntag BD</td><td>${result.SonntagBD.toFixed(2)}</td></tr>
            <td>Feiertag aktiv 35%</td><td>${result.FeiertagAktiv35.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Feiertag 25%</td><td>${result.Feiertag25.toFixed(2)}</td></tr>
            <tr><td>Zusätzlicher Bonus</td><td>${result.ZusatzBonus.toFixed(2)}</td></tr>
        </table>
    `;
});