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
        Feiertag25: 0
    };

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

function calculateAdditionalOnCalls() {
    let totalBonus = 0;
    const bonuses = [0.2, 0.4, 0.6, 0.8, 1.0]; // Bonuses for 5th to 9th on-calls

    for (let i = 5; i <= 9; i++) {
        const onCallInput = document.getElementById(`${i}thOnCall`);
        const dayTypeSelect = document.getElementById(`${i}thDayType`);

        if (onCallInput && dayTypeSelect) {
            const onCallDays = parseInt(onCallInput.value, 10) || 0;
            const dayType = dayTypeSelect.value;
            const rate = rates[dayType] ? rates[dayType].BD : 0;
            const bonusIndex = i - 5; // 0 for 5th, 1 for 6th, etc.

            totalBonus += onCallDays * rate * bonuses[bonusIndex];
        }
    }

    return totalBonus;
}

document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Standard day inputs
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    const standardHours = calculateHours({ MoDo, Fr, Sa, So, Feiertag });
    const additionalBonus = calculateAdditionalOnCalls();

    // Construct the results table
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <table>
            <tr><td>BD</td><td>${standardHours.BD.toFixed(2)}</td></tr>
            <tr><td>Nacht 25%</td><td>${standardHours.Nacht25.toFixed(2)}</td></tr>
            <tr><td>Nacht 40%</td><td>${standardHours.Nacht40.toFixed(2)}</td></tr>
            <tr><td>Sonntag</td><td>${standardHours.Sonntag.toFixed(2)}</td></tr>
            <tr><td>Sonntag BD</td><td>${standardHours.SonntagBD.toFixed(2)}</td></tr>
            <tr><td>Feiertag aktiv 35%</td><td>${standardHours.FeiertagAktiv35.toFixed(2)}</td></tr>
            <tr><td>Feiertag 25%</td><td>${standardHours.Feiertag25.toFixed(2)}</td></tr>
            <tr><td>Zusätzlicher Bonus</td><td>${additionalBonus.toFixed(2)}</td></tr>
        </table>
    `;
});