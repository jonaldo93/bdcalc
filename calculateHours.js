document.addEventListener('DOMContentLoaded', function() {
    // Function to update the visibility of additional on-call fields
    function updateAdditionalOnCallsVisibility() {
        var totalBDs = parseInt(document.getElementById('totalBDs').value);

        // Hide all additional on-call fields initially
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`additionalOnCall${i}Container`).style.display = 'none';
        }

        // Show the required number of additional on-call fields
        for (let i = 1; i <= totalBDs - 4; i++) {
            document.getElementById(`additionalOnCall${i}Container`).style.display = 'block';
        }
    }

    // Event listener for totalBDs change
    document.getElementById('totalBDs').addEventListener('change', updateAdditionalOnCallsVisibility);

    // Call the function on page load to set the initial state
    updateAdditionalOnCallsVisibility();

    // Event listener for short notice work
    document.getElementById('shortNoticeYesNo').addEventListener('change', function() {
        if (this.value === 'Ja') {
            document.getElementById('shortNoticeDetails').style.display = 'block';
        } else {
            document.getElementById('shortNoticeDetails').style.display = 'none';
        }
    });
});


// Event listener for reset button
document.getElementById('resetButton').addEventListener('click', function(event) {
    // Reset standard day inputs
    document.getElementById('MoDo').value = 0;
    document.getElementById('Fr').value = 0;
    document.getElementById('Sa').value = 0;
    document.getElementById('So').value = 0;
    document.getElementById('Feiertag').value = 0;

    // Reset additional on-call fields and hide their containers
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`additionalOnCallSelect${i}`).selectedIndex = 0;
        document.getElementById(`additionalOnCall${i}Container`).style.display = 'none';
    }

    // Clear the results div
    document.getElementById('results').innerHTML = '';

    event.preventDefault();
});


// Define the base rates
const rates = {
    MoDo: { BD: 11.75, Rate25: 5, Rate40: 4 },
    Fr: { BD: 13.25, Rate25: 5, Rate40: 4 },
    Sa: { BD: 19, Rate25: 5, Rate40: 4, SamstagExtra: 0.5, SamstagBD25: 8.75 },
    So: { BD: 18, Rate25: 5, Rate40: 4, Sonntag: 4.75, SonntagBD: 10.25 },
    Feiertag: { BD: 18, Rate25: 5, Rate40: 4, Feiertag35: 4.25, Feiertag25: 10.25 }
};

// Function to calculate hours and bonuses
function calculateHours(inputDays) {
    let output = {
        BD: 0,
        Nacht25: 0,
        Nacht40: 0,
        Sonntag: 0,
        SonntagBD: 0,
        FeiertagAktiv35: 0,
        Feiertag25: 0,
        AdditionalOnCallBonuses: []
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
    // Calculate additional on-call bonuses
    const additionalOnCallFactors = [0.2, 0.4, 0.6, 0.8, 1.0];
    additionalOnCallFactors.forEach((factor, index) => {
        const onCallDay = inputDays[`additionalOnCallSelect${index + 1}`];
        if (onCallDay && rates[onCallDay]) {
            output.AdditionalOnCallBonuses.push({
                bonusType: `BD+${index + 1}`,
                value: rates[onCallDay].BD * factor
            });
        } else {
            output.AdditionalOnCallBonuses.push({
                bonusType: `BD+${index + 1}`,
                value: 0
            });
        }
    });
    
    // Check for short notice work
    const shortNoticeAnswer = document.getElementById('shortNoticeYesNo').value;
    if (shortNoticeAnswer === 'Ja') {
        const shortNoticeDuration = document.getElementById('shortNoticeDuration').value;
        const shortNoticeDay = document.getElementById('shortNoticeDay').value;
    
        let multiplier = 0;
        switch (shortNoticeDuration) {
            case 'FlexGreater96':
                multiplier = 0.05;
                break;
            case 'Flex48To96':
                multiplier = 0.15;
                break;
            case 'FlexLess48':
                multiplier = 0.30;
                break;
        }
    
        const dayHours = rates[shortNoticeDay] ? rates[shortNoticeDay].BD : 0;
        output.ShortNoticeBonus = dayHours * multiplier;
    }
    

    return output;
}

// Event listener for form submission
document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Include additional on-call days in the input   
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        additionalOnCalls[`additionalOnCallSelect${i}`] = document.getElementById(`additionalOnCallSelect${i}`).value;
    }

    const result = calculateHours({ MoDo, Fr, Sa, So, Feiertag, ...additionalOnCalls });

    let resultsHTML = `<table style="width:100%; border-collapse: collapse;">...`;

    document.getElementById('results').innerHTML = resultsHTML;
});

// Event listener for form submission
document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Log the elements to check if they are correctly selected
    console.log(document.getElementById('MoDo'));
    console.log(document.getElementById('additionalOnCallSelect1'));
    // Add similar console logs for other elements
    
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;


    console.log(document.getElementById('shortNoticeDay'));
    
    // Include additional on-call days in the input
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        additionalOnCalls[`additionalOnCall${i}`] = document.getElementById(`additionalOnCall${i}`).value;
    }


    // ... existing code for getting input values ...

    const result = calculateHours({ MoDo, Fr, Sa, So, Feiertag, ...additionalOnCalls });

    let resultsHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;"><td>BD</td><td>${result.BD.toFixed(2)}</td></tr>
            <tr><td>Nacht 25%</td><td>${result.Nacht25.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Nacht 40%</td><td>${result.Nacht40.toFixed(2)}</td></tr>
            <tr><td>Sonntag</td><td>${result.Sonntag.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Sonntag BD</td><td>${result.SonntagBD.toFixed(2)}</td></tr>
            <tr><td>Feiertag aktiv 35%</td><td>${result.FeiertagAktiv35.toFixed(2)}</td></tr>
            <tr style="background-color: #f2f2f2;"><td>Feiertag 25%</td><td>${result.Feiertag25.toFixed(2)}</td></tr>`;

    // Add additional on-call bonuses to the results
    result.AdditionalOnCallBonuses.forEach(bonus => {
        resultsHTML += `<tr><td>${bonus.bonusType}</td><td>${bonus.value.toFixed(2)}</td></tr>`;
    });

    // Add short notice bonus to the results
    if (result.ShortNoticeBonus !== undefined) {
        resultsHTML += `<tr><td>Kurzfristig Bonus</td><td>${result.ShortNoticeBonus.toFixed(2)}</td></tr>`;
    }

    resultsHTML += `</table>`;
    document.getElementById('results').innerHTML = resultsHTML;
});



