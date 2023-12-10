function updateDiensteAndVisibility() {
    // Check if elements exist
    if (!document.getElementById('MoDo') || !document.getElementById('totalBDsDisplay')) {
        console.error('Required elements are missing');
        return;
    }
    
    // Calculate the total number of Dienste
    const MoDo = parseInt(document.getElementById('MoDo').value);
    const Fr = parseInt(document.getElementById('Fr').value);
    const Sa = parseInt(document.getElementById('Sa').value);
    const So = parseInt(document.getElementById('So').value);
    const Feiertag = parseInt(document.getElementById('Feiertag').value);
    const totalBDs = MoDo + Fr + Sa + So + Feiertag;

    // Debugging: Log the values
    // console.log(`MoDo: ${MoDo}, Fr: ${Fr}, Sa: ${Sa}, So: ${So}, Feiertag: ${Feiertag}, Total BDs: ${totalBDs}`);

    // Check if totalBDs exceeds 9
    if (totalBDs > 9) {
        document.getElementById('errorDisplay').textContent = 'Der Rechner ist aktuell auf eine maximale Anzahl von 9 BDs programmiert. Bitte Reset und Neueingabe.';
        document.getElementById('errorDisplayContainer').style.display = 'block';
        return; // Optionally, you can stop further execution
    } else {
        document.getElementById('errorDisplayContainer').style.display = 'none';
    }

    // Update the display for total Dienste
    document.getElementById('totalBDsDisplay').textContent = 'Total Dienste: ' + totalBDs;

    // Show or hide additional on-call fields based on totalBDs
    for (let i = 1; i <= 5; i++) {
        const container = document.getElementById(`additionalOnCall${i}Container`);
        if (totalBDs >= i + 4) {  // Adjusted condition
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
    }

    // Set up event listeners outside the function
    ['MoDo', 'Fr', 'Sa', 'So', 'Feiertag'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateDiensteAndVisibility);
    });


// Event listener for short notice work
document.getElementById('shortNoticeYesNo').addEventListener('change', function() {
    const shortNoticeAnswer = this.value;
    if (shortNoticeAnswer === 'Ja') {
        document.getElementById('labelNumFlexDienste').style.display = 'block';
        document.getElementById('numFlexDienste').style.display = 'block';
    } else {
        document.getElementById('labelNumFlexDienste').style.display = 'none';
        document.getElementById('numFlexDienste').style.display = 'none';
        document.getElementById('flexDiensteContainer').innerHTML = '';
        document.getElementById('flexDiensteContainer').style.display = 'none';
    }
});

// Event listener for number of Flex Dienste
document.getElementById('numFlexDienste').addEventListener('change', function() {
    const numFlexDienste = parseInt(this.value);
    const flexDiensteContainer = document.getElementById('flexDiensteContainer');
    flexDiensteContainer.innerHTML = ''; // Clear previous entries

    for (let i = 1; i <= numFlexDienste; i++) {
        const flexDienstHtml = `
            <div class="flexDienstRow">
                <label>${i}. Flex Dienst - Wie kurzfristig?</label>
                <select id="flexDienstDuration${i}">
                    <option value="FlexGreater96">>96h vorher</option>
                    <option value="Flex48To96">48-96h vorher</option>
                    <option value="FlexLess48"><48h vorher</option>
                </select>
                <label>An welchem Tag?</label>
                <select id="flexDienstDay${i}">
                    <option value="MoDo">Montag-Donnerstag</option>
                    <option value="Fr">Freitag</option>
                    <option value="Sa">Samstag</option>
                    <option value="So">Sonntag</option>
                    <option value="Feiertag">Feiertag</option>
                </select>
            </div>`;
        flexDiensteContainer.innerHTML += flexDienstHtml;
    }

    flexDiensteContainer.style.display = numFlexDienste > 0 ? 'block' : 'none';
});

// Initialize the display and visibility on page load
updateDiensteAndVisibility();

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

    // Reset and hide Flex Dienste fields
    document.getElementById('shortNoticeYesNo').value = 'Nein';
    document.getElementById('labelNumFlexDienste').style.display = 'none';
    document.getElementById('numFlexDienste').style.display = 'none';
    document.getElementById('numFlexDienste').value = '0';
    document.getElementById('flexDiensteContainer').innerHTML = '';
    document.getElementById('flexDiensteContainer').style.display = 'none';


    // Clear the results div
    document.getElementById('results').innerHTML = '';

    // Hide and reset the error message
    document.getElementById('errorDisplayContainer').style.display = 'none';
    document.getElementById('errorDisplay').textC

    // Recalculate total BDs
    updateDiensteAndVisibility();

    event.preventDefault();
});


// Define the base rates
const rates = {
    MoDo: { BD: 11.75, Rate25: 5, Rate40: 4, TotalTime: 11.75 + 8 },
    Fr: { BD: 13.25, Rate25: 5, Rate40: 4, TotalTime: 13.25 + 8 },
    Sa: { BD: 19, Rate25: 5, Rate40: 4, SamstagExtra: 0.5, SamstagBD25: 8.75, TotalTime: 19 + 5.25 },
    So: { BD: 18, Rate25: 5, Rate40: 4, Sonntag: 4.75, SonntagBD: 10.25, TotalTime: 18 + 5.25 },
    Feiertag: { BD: 18, Rate25: 5, Rate40: 4, Feiertag35: 4.25, Feiertag25: 10.25, TotalTime: 18 + 5.25 }
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
        AdditionalOnCallBonuses: [],
        FlexDiensteResults: []
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
    
    
    // Handling Flex Dienste
    const shortNoticeAnswer = document.getElementById('shortNoticeYesNo').value;

    if (shortNoticeAnswer === 'Ja') {
        const numFlexDienste = parseInt(document.getElementById('numFlexDienste').value, 10);
        let flexDienste = [];

        for (let i = 1; i <= numFlexDienste; i++) {
            const flexDuration = document.getElementById(`flexDienstDuration${i}`).value;
            const flexDay = document.getElementById(`flexDienstDay${i}`).value;
            let multiplier = 0;

            switch (flexDuration) {
                case 'FlexGreater96':
                    multiplier = 0.05;
                    break;
                case 'Flex48To96':
                    multiplier = 0.15;
                    break;
                case 'FlexLess48':
                    multiplier = 0.3;
                    break;
            }

            const rate = rates[flexDay];
            const totalHours = rate ? rate.TotalTime : 0;
            const result = totalHours * multiplier;

            flexDienste.push({
                name: `FLEX ${i}`,
                factor: multiplier,
                totalHours: totalHours,
                result: result
            });
        }

        output.FlexDiensteResults = flexDienste;
    }
    return output;

}

// Event listener for form submission
document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Log and check each element before accessing its value
    // console.log('MoDo Element:', document.getElementById('MoDo'));
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;

    // console.log('Fr Element:', document.getElementById('Fr'));
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;

    // console.log('Sa Element:', document.getElementById('Sa'));
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;

    // console.log('So Element:', document.getElementById('So'));
    const So = parseInt(document.getElementById('So').value, 10) || 0;

    // console.log('Feiertag Element:', document.getElementById('Feiertag'));
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Include additional on-call days in the input   
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        // console.log(`additionalOnCallSelect${i} Element:`, document.getElementById(`additionalOnCallSelect${i}`));
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
    // console.log(document.getElementById('MoDo'));
    // console.log(document.getElementById('additionalOnCallSelect1'));
    // Add similar console logs for other elements
    
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;


    // console.log(document.getElementById('shortNoticeDay'));
    
    // Include additional on-call days in the input
    // Include additional on-call days in the input
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        const onCallElement = document.getElementById(`additionalOnCallSelect${i}`);
        if (onCallElement) {
            additionalOnCalls[`additionalOnCallSelect${i}`] = onCallElement.value;
        } else {
            console.log(`Element additionalOnCallSelect${i} not found`);
        }
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

    // Adding Flex Dienste results to the HTML
    result.FlexDiensteResults.forEach(flexDienst => {
        resultsHTML += `
            <tr>
                <td>${flexDienst.name}</td>
                <td>Faktor: ${flexDienst.factor}</td>
                <td>${flexDienst.totalHours} Stunden</td>
                <td>${flexDienst.result.toFixed(2)}</td>
            </tr>
        `;
    });

    resultsHTML += `</table>`;
    document.getElementById('results').innerHTML = resultsHTML;
});



