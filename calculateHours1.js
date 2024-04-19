// Initialize the display and visibility on page load
updateDiensteAndVisibility();

// Gehaltsstufendefinition
const wageValues = {
    'Ä1': 5298, 'Ä2': 5563, 'Ä3': 5829, 'Ä4': 6095, 'Ä5': 6361, 'Ä6': 6627,
    'FÄ1': 6991, 'FÄ2': 7284, 'FÄ3': 7578, 'FÄ4': 8092, 'FÄ5': 8757, 'FÄ6': 9271,
    'OÄ1': 8757, 'OÄ2': 9271, 'OÄ3': 9839,
    'CA': 10301
};

const categoryNamesMapping = {
    BD: "Bereitschaft 95%",
    Nacht25: "Nachtarbeit BD 25%",
    Sonntag: "Sonntagsarbeit",
    Nacht40: "Nachtarbeit BD 40%",
    SamstagBD30: "Samstag BD 30% (ab 2024)", 
    SonntagBD: "Sonntagsarbeit BD 25%",
    FeiertagAktiv35: "Feiertag m. FZA 35%",
    Feiertag25: "Feiertagsarbeit BD 25%"
};

// Define the base rates
const rates = {
    MoDo: { BD: 11.75, Rate25: 5, Rate40: 4, TotalTime: 11.75 + 8 },
    Fr: { BD: 13.25, Rate25: 5, Rate40: 4, SamstagBD30: 9.25, TotalTime: 13.25 + 8 },
    Sa: { BD: 19, Rate25: 5, Rate40: 4, SamstagExtra: 0.5, SamstagBD25: 8.75, SamstagBD30: 10.25, TotalTime: 19 + 5.25 }, // SamstagBD25 = die Sonntagsstunden durch einen Samstagsdienst!!!!
    So: { BD: 18, Rate25: 5, Rate40: 4, Sonntag: 4.25, SonntagBD: 10.25, TotalTime: 18 + 5.25 },
    Feiertag: { BD: 18, Rate25: 5, Rate40: 4, Feiertag35: 4.75, Feiertag25: 10.25, TotalTime: 18 + 5.25 }
};

// Define factors and hourly wage
const factors = {
    BD: 0.95, 
    Nacht25: 0.25,
    Nacht40: 0.4, 
    SonntagBD: 0.25,
    Sonntag: 0.25, 
    Feiertag: 0.35,
    SamstagBD30: 0.30
};

const tooltipExplanations = {
    anzahlFaktor: `<p>Die Gehaltsabrechnungen sind hier inkohärent. Bei BD 95% und bei BD+X wird die Zeit entsprechend multipliziert, 
    sodass in der Abrechnung diese Zahl geringer ausfällt als hier in der Simulation.</p>
    <p>Bei allen anderen Lohnarten wird der Stundenlohn mit dem Faktor multipliziert; die Zeit bleibt unberührt.</p>
    <p>Ich habe mich dafür entschieden, hier einmal beide Wege nachzuzeichen, auch wenn es dadurch leider etwas unübersichtlicher wurde.</p>`,

    faktorBetrag: `<p>Die Gehaltsabrechnungen sind hier inkohärent. Bei BD 95% und bei BD+X wird die Zeit entsprechend multipliziert, 
    sodass in der Abrechnung diese Zahl geringer ausfällt als hier in der Simulation.</p>
    <p>Bei allen anderen Lohnarten wird der Stundenlohn mit dem Faktor multipliziert; die Zeit bleibt unberührt.</p>
    <p>Ich habe mich dafür entschieden, hier einmal beide Wege nachzuzeichen, auch wenn es dadurch leider etwas unübersichtlicher wurde.</p>`
};


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

function calculateHourlyWage() {
    console.log("Element check:", document.getElementById('hourlyWageSelection')); // Debugging line

    const selectedOption = document.getElementById('hourlyWageSelection').value;
    console.log("Selected wage option:", selectedOption); // Debugging line

    // Check for special cases and manually set hourly wage
    if (selectedOption === 'Ä2') {
        console.log("Calculated hourly wage for Ä2:", 30.47);
        return 30.47;
    } else if (selectedOption === 'FÄ1') {
        console.log("Calculated hourly wage for FÄ1:", 38.29);
        return 38.29;
    }

    // For all other options, calculate normally
    const wage = wageValues[selectedOption];
    console.log("Wage from wageValues:", wage); // Debugging line

    if (wage && !isNaN(wage)) {
        const hourlyWage = Number((wage / 182.62).toFixed(2));
        console.log("Calculated hourly wage:", hourlyWage); // Debugging line
        return hourlyWage;
    } else {
        console.error("Invalid wage or option selected:", wage, selectedOption);
        return 0; // Return a default value or handle the error as needed
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
                <div class="dropdown-container">
                    <label>${i}. Flex Dienst - Wie kurzfristig?</label>
                    <select id="flexDienstDuration${i}">
                        <option value="FlexGreater96">>96h vorher</option>
                        <option value="Flex48To96">48-96h vorher</option>
                        <option value="FlexLess48"><48h vorher</option>
                    </select>
                </div>
                <div class="dropdown-container">
                    <label>An welchem Tag?</label>
                    <select id="flexDienstDay${i}">
                        <option value="MoDo">Montag-Donnerstag</option>
                        <option value="Fr">Freitag</option>
                        <option value="Sa">Samstag</option>
                        <option value="So">Sonntag</option>
                        <option value="Feiertag">Feiertag</option>
                    </select>
                </div>
            </div>`;
        flexDiensteContainer.innerHTML += flexDienstHtml;
    }

    flexDiensteContainer.style.display = numFlexDienste > 0 ? 'block' : 'none';
});

// Event listener for Überstunden
document.getElementById('overtimeCalculation').addEventListener('change', function() {
    const overtimeSelection = this.value;
    const overtimeInput = document.getElementById('AnzahlUeberstunden');
    overtimeInput.style.display = (overtimeSelection === 'berechnen') ? 'block' : 'none';
});

// Event listener for vacationSickDays dropdown
document.getElementById('vacationSickDays').addEventListener('change', function() {
    const vacationSickDaysSelection = this.value;
    const vacationSickDaysInput = document.getElementById('AnzahlKU');
    vacationSickDaysInput.style.display = (vacationSickDaysSelection === 'berechnen') ? 'block' : 'none';
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

function calculateBdPlusBonuses(inputDays, hourlyWage) {
    const additionalOnCallFactors = [0.2, 0.4, 0.6, 0.8, 1.0];
    let bdPlusResultsArray = [];

    for (let i = 0; i < additionalOnCallFactors.length; i++) {
        const bdPlusType = `BD+${i + 1}`;
        const onCallDay = inputDays[`additionalOnCallSelect${i + 1}`];

        console.log(`Calculating: ${bdPlusType}, Day: ${onCallDay}`);

        if (onCallDay && rates[onCallDay]) {
            const hoursWorked = rates[onCallDay].BD;
            const resultValue = rates[onCallDay].BD * additionalOnCallFactors[i] * hourlyWage;

            console.log(`BD+${i + 1} Hours Worked: ${hoursWorked}, Value: ${resultValue}`);

            bdPlusResultsArray.push({
                type: bdPlusType,
                hoursWorked,
                factor: additionalOnCallFactors[i],
                value: resultValue
            });
        } else {
            console.log(`BD+${i + 1} has no value or invalid day.`);
            bdPlusResultsArray.push({
                type: bdPlusType,
                hoursWorked: 0,
                factor: additionalOnCallFactors[i],
                value: 0
            });
        }
    }

    console.log("BD+ Results Array:", bdPlusResultsArray);
    return bdPlusResultsArray;
}

// FLEX
function calculateFlexDienste(hourlyWage) {
    const numFlexDienste = parseInt(document.getElementById('numFlexDienste').value, 10);
    let flexDiensteResults = [];

    for (let i = 1; i <= numFlexDienste; i++) {
        const flexDuration = document.getElementById(`flexDienstDuration${i}`).value;
        const flexDay = document.getElementById(`flexDienstDay${i}`).value;
        let multiplier = 0;

        switch (flexDuration) {
            case 'FlexGreater96': multiplier = 0.05; break;
            case 'Flex48To96': multiplier = 0.15; break;
            case 'FlexLess48': multiplier = 0.3; break;
        }

        const rate = rates[flexDay];
        const totalHours = rate ? rate.TotalTime : 0;
        const result = totalHours * multiplier * hourlyWage;

        console.log(`Flex Dienst ${i}:`, { Day: flexDay, Duration: flexDuration, Hours: totalHours, Multiplier: multiplier, Result: result });

        flexDiensteResults.push({
            type: `Flex Dienst ${i}`,
            hoursWorked: totalHours,
            factor: multiplier,
            result: result
        });
    }

    console.log("Flex Dienste Results:", flexDiensteResults);
    return flexDiensteResults;
}

// Feiertag
function calculateFeiertag(inputDays, hourlyWage) {
    const feiertagResult = { FeiertagAktiv35: 0, Feiertag25: 0, HoursFeiertag35: 0, HoursFeiertag25: 0 };
    if (inputDays.Feiertag > 0) {
        const rate = rates.Feiertag;
        feiertagResult.HoursFeiertag35 = inputDays.Feiertag * rate.Feiertag35;
        feiertagResult.HoursFeiertag25 = inputDays.Feiertag * rate.Feiertag25;
        feiertagResult.FeiertagAktiv35 = feiertagResult.HoursFeiertag35 * factors.Feiertag * hourlyWage;
        feiertagResult.Feiertag25 = feiertagResult.HoursFeiertag25 * factors.Feiertag * hourlyWage;
    }
    return feiertagResult;
}

// Function to calculate hours and bonuses
function calculateHours(inputDays, hourlyWage) {
    let output = {
        BD: 0,
        Nacht25: 0,
        Nacht40: 0,
        SamstagBD30: 0, 
        Sonntag: 0,
        SonntagBD: 0,
        FeiertagAktiv35: 0,
        Feiertag25: 0,
        AdditionalOnCallBonuses: [],
        FlexDiensteResults: [],
        BDPlusResults: [],
        ratesUsed: {}, // Initialize ratesUsed as an empty object
        hoursWorked: {} // New object to store hours worked in each category
    };

    let ratesUsed = { // Initialize the ratesUsed object
        MoDo: {},
        Fr: {},
        Sa: {},
        So: {},
        Feiertag: {}
    };

    const additionalOnCallFactors = [0.2, 0.4, 0.6, 0.8, 1.0];

    console.log("Hourly Wage in calculateHours:", hourlyWage);
    if (isNaN(hourlyWage)) {
        console.error("Hourly wage is not a number", hourlyWage);
        // Handle the error case, maybe return or set a default value
    }

    for (const key in inputDays) {
        if (isNaN(inputDays[key])) {
            console.log(`Invalid number for ${key}:`, inputDays[key]);
        }
    }
    
    
    for (const dayType in inputDays) {
        const days = inputDays[dayType];
        const rate = rates[dayType];

        if (rate) {
            output.BD += days * rate.BD;
            output.Nacht25 += days * rate.Rate25;
            output.Nacht40 += days * rate.Rate40;

            // Initialize hoursWorked entries if they don't exist
            output.hoursWorked.BD = (output.hoursWorked.BD || 0) + days * rate.BD;
            output.hoursWorked.Nacht25 = (output.hoursWorked.Nacht25 || 0) + days * rate.Rate25;
            output.hoursWorked.Nacht40 = (output.hoursWorked.Nacht40 || 0) + days * rate.Rate40;

            // Specific logic for Fridays contributing to Saturday
            if (dayType === 'Fr') {
                const samstagFromFriday = days * rate.SamstagBD30;
                output.SamstagBD30 = (output.SamstagBD30 || 0) + samstagFromFriday;
                output.hoursWorked.SamstagBD30 = (output.hoursWorked.SamstagBD30 || 0) + days * rate.SamstagBD30;
                console.log(`Calculated Samstag BD 30% durch Freitag: ${samstagFromFriday}`);
            }
            
            if (dayType === 'Sa') {
                output.Sonntag += days * rate.SamstagExtra;
                output.SonntagBD += days * rate.SamstagBD25;
                output.SamstagBD30 = (output.SamstagBD30 || 0) + days * rate.SamstagBD30;
                
                output.hoursWorked.Sonntag = (output.hoursWorked.Sonntag || 0) + days * rate.SamstagExtra;
                output.hoursWorked.SonntagBD = (output.hoursWorked.SonntagBD || 0) + days * rate.SamstagBD25;
                output.hoursWorked.SamstagBD30 = (output.hoursWorked.SamstagBD30 || 0) + days * rate.SamstagBD30;
                console.log(`Calculated Samstag BD 30%: ${output.SamstagBD30}`);
            }
            

            if (dayType === 'So') {
                output.Sonntag += days * rate.Sonntag;
                output.SonntagBD += days * rate.SonntagBD;
                output.hoursWorked.Sonntag = (output.hoursWorked.Sonntag || 0) + days * rate.Sonntag;
                output.hoursWorked.SonntagBD = (output.hoursWorked.SonntagBD || 0) + days * rate.SonntagBD;
            }

            if (dayType === 'Feiertag') {
                output.FeiertagAktiv35 += days * rate.Feiertag35;
                output.Feiertag25 += days * rate.Feiertag25;
                output.hoursWorked.FeiertagAktiv35 = (output.hoursWorked.FeiertagAktiv35 || 0) + days * rate.Feiertag35;
                output.hoursWorked.Feiertag25 = (output.hoursWorked.Feiertag25 || 0) + days * rate.Feiertag25;
            }
        };
    }
    
    // Calculate totalBDs excluding additionalOnCallSelect keys
    const totalBDs = Object.values(inputDays).reduce((total, value, index) => {
        // Check if the property is not one of the additionalOnCallSelect keys
        if (!isNaN(value) && !/^additionalOnCallSelect\d+$/.test(Object.keys(inputDays)[index])) {
            return total + parseInt(value || 0);
        }
        return total;
    }, 0);
    console.log('Calculated totalBDs inside calculate hours:', totalBDs);     
    
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
    
    // Calculate BD Plus results based on totalBDs
    let bdPlusResults = [];
    for (let i = 1; i <= 5; i++) { // Adjust to loop through 5 possible BD+ values
        const bdPlusType = `BD+${i}`;
        const onCallDay = inputDays[`additionalOnCallSelect${i}`];
        if (onCallDay && rates[onCallDay] && i <= totalBDs - 4) { // Check if the day exists and totalBDs is enough for BD+
            bdPlusResults.push({ type: bdPlusType, value: rates[onCallDay].BD * additionalOnCallFactors[i - 1] * hourlyWage });
        } else {
            bdPlusResults.push({ type: bdPlusType, value: 0 });
        }
    }
    output.BDPlusResults = bdPlusResults;

    output.BDPlusResults.forEach((bdPlus, index) => {
        console.log(`BD+${index + 1}:`, bdPlus);
    });
    
    // Apply factors and calculate results
    // Apply factors and calculate results for each category
    for (const category in output) {
        if (factors[category]) {
            const value = output[category];
            output[category] = {
                factor: factors[category],
                hourlyWage: hourlyWage,
                result: value * factors[category] * hourlyWage
            };
        }
    }
    // At the end of the calculateHours function
    output.results = {
        BD: output.BD,
        Nacht25: output.Nacht25,
        Sonntag: output.Sonntag,
        Nacht40: output.Nacht40,
        SamstagBD30: output.SamstagBD30,
        SonntagBD: output.SonntagBD,
        FeiertagAktiv35: output.FeiertagAktiv35,
        Feiertag25: output.Feiertag25
    };

    // Logging individual output.X values
    // console.log("BD value:", output.BD);
    // console.log("Nacht25 value:", output.Nacht25);
    // console.log("Nacht40 value:", output.Nacht40);
    // console.log("Sonntag value:", output.Sonntag);
    // console.log("SonntagBD value:", output.SonntagBD);
    // console.log("FeiertagAktiv35 value:", output.FeiertagAktiv35);
    // console.log("Feiertag25 value:", output.Feiertag25);

    // Log the rates used for each day type
    // console.log("Rates used ANZAHL?:", output.ratesUsed);
    
    console.log("Final output result:", output);
 
    return { output, ratesUsed };
}

// Function to toggle Entgeltfortzahlung inputs
function toggleEntgeltfortzahlungInputs() {
    const vacationSickDaysSelection = document.getElementById('vacationSickDays').value;
    const entgeltfortzahlungInputs = document.getElementById('entgeltfortzahlungInputs');
    entgeltfortzahlungInputs.style.display = (vacationSickDaysSelection === 'berechnen') ? 'block' : 'none';
}

function calculateHoursFromForm() {
    // Retrieve values from form elements
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Include additional on-call days in the input
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        const onCallElement = document.getElementById(`additionalOnCallSelect${i}`);
        if (onCallElement) {
            additionalOnCalls[`additionalOnCallSelect${i}`] = onCallElement.value;
        }
    }

    // Calculate the hourly wage
    const hourlyWage = calculateHourlyWage();

    // Call the function to calculate hours and bonuses
    const { output, ratesUsed } = calculateHours({
        MoDo, Fr, Sa, So, Feiertag, ...additionalOnCalls
    }, hourlyWage);

    // Correctly return the output, hourlyWage, and ratesUsed
    return { output, hourlyWage, ratesUsed };
}

// Function to calculate the amount per day for Entgeltfortzahlung
function calculateAmountPerDay() {
    // Retrieve input values and calculate their sums
    const sumNachberechnung = sumInputValues(['sumNachberechnung1', 'sumNachberechnung2', 'sumNachberechnung3']);
    const zeitzuschlag = sumInputValues(['zeitzuschlag1', 'zeitzuschlag2', 'zeitzuschlag3']);
    const leistungsentgelte = sumInputValues(['leistungsentgelte1', 'leistungsentgelte2', 'leistungsentgelte3']);
    const jahressonder = sumInputValues(['jahressonder1', 'jahressonder2', 'jahressonder3']);
    const sonderzahlung23 = sumInputValues(['sonderzahlung23_1', 'sonderzahlung23_2', 'sonderzahlung23_3']);
    const urlaubsaufschlag = sumInputValues(['urlaubsaufschlag1', 'urlaubsaufschlag2', 'urlaubsaufschlag3']);
    const krankenlohnaufschlag = sumInputValues(['krankenlohnaufschlag1', 'krankenlohnaufschlag2', 'krankenlohnaufschlag3']);

    // Calculate the total subtract amount
    const totalSubtract = zeitzuschlag + leistungsentgelte + jahressonder + sonderzahlung23 + urlaubsaufschlag + krankenlohnaufschlag;

    // Log the totalSubtract
    console.log('Total subtract amount:', totalSubtract);

    // Calculate the per unit amount (amount per day)
    const amountPerDay = (sumNachberechnung - totalSubtract) / 65;
    
    // Log the amountPerDay
    console.log('Amount per day:', amountPerDay);

    return amountPerDay;
}

// Helper function to sum input values
function sumInputValues(ids) {
    return ids.reduce((sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0), 0);
}

// Event listener for form submission
document.getElementById('hoursForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Retrieve values from form elements
    const MoDo = parseInt(document.getElementById('MoDo').value, 10) || 0;
    const Fr = parseInt(document.getElementById('Fr').value, 10) || 0;
    const Sa = parseInt(document.getElementById('Sa').value, 10) || 0;
    const So = parseInt(document.getElementById('So').value, 10) || 0;
    const Feiertag = parseInt(document.getElementById('Feiertag').value, 10) || 0;

    // Include additional on-call days in the input
    const additionalOnCalls = {};
    for (let i = 1; i <= 5; i++) {
        const onCallElement = document.getElementById(`additionalOnCallSelect${i}`);
        if (onCallElement) {
            additionalOnCalls[`additionalOnCallSelect${i}`] = onCallElement.value;
        }
    }

    // Define inputDays here so it's accessible to the entire function
    const inputDays = { MoDo, Fr, Sa, So, Feiertag, ...additionalOnCalls };

    // Calculate the hourly wage
    const hourlyWage = calculateHourlyWage();

    // Call the function to calculate hours and bonuses
    const { output } = calculateHours(inputDays, hourlyWage);
    const feiertagResults = calculateFeiertag(inputDays, hourlyWage);

    // Include conditional calculations
    output.FeiertagResult = calculateFeiertag(inputDays, hourlyWage);
    output.FlexDiensteResult = calculateFlexDienste(hourlyWage);
    console.log(`Flex Dienste Result: ${output.FlexDiensteResult}`);
    output.BDPlusResults = calculateBdPlusBonuses(inputDays, hourlyWage);

    // Include conditional calculations for Feiertag
    const feiertagResult = calculateFeiertag(inputDays, hourlyWage);
    console.log("Feiertag Result:", feiertagResult);


    // Initialize resultsHTML at the beginning
    let resultsHTML = `
    <div class="table-responsive">
        <table style="width:100%; border-collapse: collapse;">
            <tr>
                <th>Lohnart</th>
                <th>Anzahl</th>
                <th>Faktor</th>
                <th><span class="tooltip">Anzahl * Faktor <sup>1</sup><span class="tooltiptext">${tooltipExplanations.anzahlFaktor}</span></span></th>
                <th><span class="tooltip">Faktor * Betrag <sup>2</sup><span class="tooltiptext">${tooltipExplanations.faktorBetrag}</span></span></th>
                <th>Betrag/E.</th>
                <th>Produkt ("Betrag")</th>
            </tr>`;
            
    let sumOfResults = 0; // Initialize sum of results

    // Generate table rows for each category, excluding BDPlusResults
    for (const category in output.results) {
        if (category !== "BDPlusResults" && category !== "AdditionalOnCallBonuses" && 
        !(category === "FeiertagAktiv35" || category === "Feiertag25")) {
                
            const categoryHoursWorked = output.hoursWorked[category] || 0; // Get the hours worked for each category
            const categoryFactor = factors[category] || 0;
            const categoryResult = output.results[category].result || 0; // Using the calculated result
            const product = categoryHoursWorked * categoryFactor; // Calculate the product of Anzahl and Faktor
            const faktorBetragProduct = categoryFactor * hourlyWage; // Calculate the product of Faktor and Betrag/E.

            console.log(`Category: ${category}, Hours Worked: ${categoryHoursWorked}, Factor: ${categoryFactor}, Product: ${product}, Result: ${categoryResult}`);
            sumOfResults += categoryResult; // Add to the sum

            // Use the mapping to get the display name
            const displayName = categoryNamesMapping[category] || category; // Fallback to original category name if not mapped

            resultsHTML += `
                <tr>
                    <td>${displayName}</td>
                    <td>${categoryHoursWorked.toFixed(2)}</td> <!-- Display Hours Worked -->
                    <td>${categoryFactor.toFixed(2)}</td>
                    <td>${product.toFixed(2)}</td> <!-- New column for the product -->
                    <td>${faktorBetragProduct.toFixed(2)}</td> <!-- New column for Faktor * Betrag -->
                    <td>${hourlyWage.toFixed(2)}</td>
                    <td>${categoryResult.toFixed(2)}</td>
                </tr>`;
        }
       
    }

    // Calculate BD+ bonuses separately
    const bdPlusResults = calculateBdPlusBonuses(inputDays, hourlyWage);

    // Include conditional BD+ rows
    bdPlusResults.forEach(bdPlusResult => {
        const bdPlusFactorBetragProduct = bdPlusResult.factor * hourlyWage; // Calculate product of factor and hourly wage
        if (bdPlusResult.value > 0) {
            resultsHTML += `
                <tr>
                    <td>${bdPlusResult.type}</td>
                    <td>${bdPlusResult.hoursWorked.toFixed(2)}</td> <!-- Include Anzahl for BD+ entries -->
                    <td>${bdPlusResult.factor.toFixed(2)}</td>
                    <td>${(bdPlusResult.hoursWorked * bdPlusResult.factor).toFixed(2)}</td> <!-- Product of Anzahl and Faktor -->
                    <td>${bdPlusFactorBetragProduct.toFixed(2)}</td> <!-- Placeholder for Faktor * Betrag -->
                    <td>${hourlyWage.toFixed(2)}</td>
                    <td>${bdPlusResult.value.toFixed(2)}</td>
                </tr>`;
            sumOfResults += bdPlusResult.value;
        }
    });

    // Handle Feiertag results
    if (feiertagResults.FeiertagAktiv35 > 0) {
        const feiertagAktiv35FactorBetragProduct = factors.Feiertag * hourlyWage;
        const feiertagAktiv35AnzahlFaktorProduct = feiertagResults.HoursFeiertag35 * factors.Feiertag;

        resultsHTML += `
            <tr>
                <td>${categoryNamesMapping['FeiertagAktiv35']}</td>
                <td>${feiertagResults.HoursFeiertag35.toFixed(2)}</td>
                <td>${factors.Feiertag.toFixed(2)}</td>
                <td>${feiertagAktiv35AnzahlFaktorProduct.toFixed(2)}</td>
                <td>${feiertagAktiv35FactorBetragProduct.toFixed(2)}</td>
                <td>${hourlyWage.toFixed(2)}</td>
                <td>${feiertagResults.FeiertagAktiv35.toFixed(2)}</td>
            </tr>`;
        sumOfResults += feiertagResults.FeiertagAktiv35;
    }
    if (feiertagResults.Feiertag25 > 0) {
        const feiertag25FactorBetragProduct = factors.Feiertag * hourlyWage;
        const feiertag25AnzahlFaktorProduct = feiertagResults.HoursFeiertag25 * factors.Feiertag;    
        resultsHTML += `
            <tr>
                <td>${categoryNamesMapping['Feiertag25']}</td>
                <td>${feiertagResults.HoursFeiertag25.toFixed(2)}</td>
                <td>${factors.Feiertag.toFixed(2)}</td>
                <td>${feiertag25AnzahlFaktorProduct.toFixed(2)}</td>
                <td>${feiertag25FactorBetragProduct.toFixed(2)}</td>
                <td>${hourlyWage.toFixed(2)}</td>
                <td>${feiertagResults.Feiertag25.toFixed(2)}</td>
            </tr>`;
        sumOfResults += feiertagResults.Feiertag25;
    }

    // Add rows for Flex Dienste if result > 0
    output.FlexDiensteResults = calculateFlexDienste(hourlyWage);
    console.log("Flex Dienste Results in output:", output.FlexDiensteResults);

    // Add rows for Flex Dienste
    output.FlexDiensteResults.forEach(flexDienst => {
        sumOfResults += flexDienst.result;
        const flexDienstFactorBetragProduct = flexDienst.factor * hourlyWage; // Calculate product of factor and hourly wage
        if (flexDienst.result > 0) {
            console.log("Adding row for", flexDienst.type);

            resultsHTML += `
                <tr>
                    <td>${flexDienst.type}</td>
                    <td>${flexDienst.hoursWorked.toFixed(2)}</td>
                    <td>${flexDienst.factor.toFixed(2)}</td>
                    <td>${(flexDienst.hoursWorked * flexDienst.factor).toFixed(2)}</td> <!-- Product of Anzahl and Faktor -->
                    <td>${flexDienstFactorBetragProduct.toFixed(2)}</td> <!-- Placeholder for Faktor * Betrag -->
                    <td>${hourlyWage.toFixed(2)}</td>
                    <td>${flexDienst.result.toFixed(2)}</td>
                </tr>`;
        }
    });
    
    // Retrieve and parse AnzahlKU
    const AnzahlKUInput = document.getElementById('AnzahlKU');
    const AnzahlKU = AnzahlKUInput && AnzahlKUInput.style.display !== 'none' ? parseFloat(AnzahlKUInput.value) || 0 : 0;

    // Check for NaN and log the value
    if (isNaN(AnzahlKU)) {
        console.error("AnzahlKU is not a valid number:", AnzahlKU);
    } else {
        console.log("Anzahl der Urlaubstage/Krankheitstage:", AnzahlKU.toFixed(2));
    }
    const AnzahlUeberstunden = document.getElementById('AnzahlUeberstunden').style.display !== 'none' ? parseFloat(document.getElementById('AnzahlUeberstunden').value) || 0 : 0;
    const overtimeCalculationChoice = document.getElementById('overtimeCalculation').value;
    console.log("Anzahl der Überstunden:", AnzahlUeberstunden.toFixed(2));
    console.log("Anzahl der Urlaubstage/Krankheitstage:", AnzahlKU.toFixed(2));
    
    // Calculate additional money for Überstunden if 'berechnen' is selected
    let additionalMoneyForUeberstunden = 0;
    if (overtimeCalculationChoice === 'berechnen') {
        additionalMoneyForUeberstunden = AnzahlUeberstunden * hourlyWage * 0.15;
        console.log("Additional Money for Überstunden:", additionalMoneyForUeberstunden.toFixed(2));

        // Calculate Faktor * Betrag for Überstunden
        const faktorBetragForUeberstunden = 0.15 * hourlyWage;

        // Add line to results for Überstunden
        resultsHTML += `
            <tr>
                <td>Zeitzuschlag für Überstunden</td>
                <td>${AnzahlUeberstunden.toFixed(2)}</td>
                <td>0.15</td>
                <td>${(AnzahlUeberstunden * 0.15).toFixed(2)}</td> <!-- Anzahl * Faktor -->
                <td>${faktorBetragForUeberstunden.toFixed(2)}</td> <!-- Faktor * Betrag -->
                <td>${hourlyWage.toFixed(2)}</td> <!-- Display Hourly Wage -->
                <td>${additionalMoneyForUeberstunden.toFixed(2)}</td>
            </tr>`;
        sumOfResults += additionalMoneyForUeberstunden; // Add to the total sum
    }
    // Check if Entgeltfortzahlung should be calculated
    const vacationSickDaysChoice = document.getElementById('vacationSickDays').value;
    if (vacationSickDaysChoice === 'berechnen') {
        // Call your function to calculate Entgeltfortzahlung
        const amountPerDay = calculateAmountPerDay();

        // Retrieve the number of holidays/sick days
        const holidays = parseFloat(document.getElementById('AnzahlKU').value) || 0;

        // Calculate the full sum
        const fullSum = amountPerDay * holidays;

        // Add Entgeltfortzahlung results to your results HTML
        resultsHTML += `
            <tr>
                <td>Entgeltfortzahlung</td>
                <td>${holidays} Tage</td>
                <td>N/A</td> <!-- Faktor is not applicable here -->
                <td>N/A</td> <!-- Anzahl * Faktor is not applicable -->
                <td>N/A</td> <!-- Faktor * Betrag is not applicable -->
                <td>${amountPerDay.toFixed(2)} €</td> <!-- Betrag/E. -->
                <td>${fullSum.toFixed(2)} €</td> <!-- Produkt ("Betrag") -->
            </tr>
        `;
        sumOfResults += fullSum;
    }
    document.getElementById('results').innerHTML = resultsHTML;

    resultsHTML += `
    <tr class="total-sum-row">
        <td colspan="6">Summe der Nachberechnungen</td>
        <td>${sumOfResults.toFixed(2)}</td>
    </tr>`;

    // Close the table and update the HTML
    resultsHTML += `</table>`;
    // Close the responsive div
    resultsHTML += `</div>`;
    document.getElementById('results').innerHTML = resultsHTML;
});
