
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

function calculateAdditionalOnCalls() {
    let totalBonus = 0;
    const bonuses = [0.2, 0.4, 0.6, 0.8, 1.0]; // Bonuses for 5th to 9th on-calls

    for (let i = 0; i < bonuses.length; i++) {
        const onCallInput = document.getElementById(`${i + 5}thOnCall`);
        const dayTypeSelect = document.getElementById(`${i + 5}thDayType`);

        if (onCallInput && dayTypeSelect) {
            const onCallDays = parseInt(onCallInput.value, 10) || 0;
            const dayType = dayTypeSelect.value;
            const rate = rates[dayType] ? rates[dayType].BD : 0;

            totalBonus += onCallDays * rate * bonuses[i];
        }
    }

    return totalBonus;
}

document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    const standardHours = calculateHours({ MoDo, Fr, Sa, So, Feiertag });
    const additionalBonus = calculateAdditionalOnCalls();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;">
                <td>BD</td>
                <td>${standardHours.BD.toFixed(2)}</td>
            </tr>
            <!-- ... other result rows ... -->
            <tr>
                <td>Zusätzlicher Bonus</td>
                <td>${additionalBonus.toFixed(2)}</td>
            </tr>
        </table>
    `;
});