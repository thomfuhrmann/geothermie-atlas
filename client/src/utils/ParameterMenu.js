import "./ui.css";

// create drop down menu for selection of grid spacing
let gridSpacingHandler;
export const userInputDiv = document.createElement("div");
userInputDiv.className = "input-container";

const dropDownDiv = document.createElement("div");
dropDownDiv.className = "input-section";

const dropDown = document.createElement("select");
dropDown.id = "grid-spacing";
dropDown.className = "spacing-dropdown";
dropDown.onchange = (event) => {
    gridSpacingHandler(parseInt(event.target.value));
};

const option1 = document.createElement("option");
option1.value = 5;
option1.innerText = "5 Meter";

const option2 = document.createElement("option");
option2.value = 10;
option2.innerText = "10 Meter";

dropDown.appendChild(option2);
dropDown.appendChild(option1);

const spacingLabel = document.createElement("label");
spacingLabel.innerText = "Abstand der Sonden";
spacingLabel.for = "grid-spacing";

dropDownDiv.appendChild(spacingLabel);
dropDownDiv.appendChild(dropDown);

userInputDiv.appendChild(dropDownDiv);

// Sondentiefe
let bohrtiefeHandler;
const bohrtiefeInput = document.createElement("input");
bohrtiefeInput.id = "sondentiefe-input";
bohrtiefeInput.type = "number";
bohrtiefeInput.min = 80;
bohrtiefeInput.max = 300;
bohrtiefeInput.value = 100;
bohrtiefeInput.onchange = (event) => {
    bohrtiefeHandler(parseInt(event.target.value));
};
const bohrtiefeLabel = document.createElement("label");
bohrtiefeLabel.for = "sondentiefe-input";
bohrtiefeLabel.innerText = "Sondentiefe in Meter";

const bohrtiefeInputDiv = document.createElement("div");
bohrtiefeInputDiv.className = "input-section";

bohrtiefeInputDiv.appendChild(bohrtiefeLabel);
bohrtiefeInputDiv.appendChild(bohrtiefeInput);

userInputDiv.appendChild(bohrtiefeInputDiv);

// Betriebsstunden Heizen
let BS_HZHandler;
const bsHZInput = document.createElement("input");
bsHZInput.id = "bshz-input";
bsHZInput.type = "number";
bsHZInput.min = 0;
bsHZInput.onchange = (event) => {
    BS_HZHandler(parseInt(event.target.value));
};
const bsHZLabel = document.createElement("label");
bsHZLabel.for = "bshz-input";
bsHZLabel.innerText = "Betriebsstunden Heizen pro Jahr (optional)";

const bsHZInputDiv = document.createElement("div");
bsHZInputDiv.className = "input-section";

bsHZInputDiv.appendChild(bsHZLabel);
bsHZInputDiv.appendChild(bsHZInput);

userInputDiv.appendChild(bsHZInputDiv);

// Betriebsstunden Kühlen
let BS_KLHandler;
const bsKLInput = document.createElement("input");
bsKLInput.id = "bskl-input";
bsKLInput.type = "number";
bsKLInput.min = 0;
bsKLInput.onchange = (event) => {
    BS_KLHandler(parseInt(event.target.value));
};
const bsKLLabel = document.createElement("label");
bsKLLabel.for = "bskl-input";
bsKLLabel.innerText = "Betriebsstunden Kühlen pro Jahr (optional)";

const bsKLInputDiv = document.createElement("div");
bsKLInputDiv.className = "input-section";

bsKLInputDiv.appendChild(bsKLLabel);
bsKLInputDiv.appendChild(bsKLInput);

userInputDiv.appendChild(bsKLInputDiv);

// Leistung Heizen
let P_HZHandler;
const pHZInput = document.createElement("input");
pHZInput.id = "pHZ-input";
pHZInput.type = "number";
pHZInput.min = 0;
pHZInput.onchange = (event) => {
    P_HZHandler(parseInt(event.target.value));
};
const pHZLabel = document.createElement("label");
pHZLabel.for = "pHZ-input";
pHZLabel.innerText = "Heizleistung in kW (optional)";

const pHZInputDiv = document.createElement("div");
pHZInputDiv.className = "input-section";

pHZInputDiv.appendChild(pHZLabel);
pHZInputDiv.appendChild(pHZInput);

userInputDiv.appendChild(pHZInputDiv);

// Leistung Kühlen
let P_KLHandler;
const pKLInput = document.createElement("input");
pKLInput.id = "pKL-input";
pKLInput.type = "number";
pKLInput.min = 0;
pKLInput.onchange = (event) => {
    P_KLHandler(parseInt(event.target.value));
};
const pKLLabel = document.createElement("label");
pKLLabel.for = "pKL-input";
pKLLabel.innerText = "Kühlleistung in kW (optional)";

const pKLInputDiv = document.createElement("div");
pKLInputDiv.className = "input-section";

pKLInputDiv.appendChild(pKLLabel);
pKLInputDiv.appendChild(pKLInput);

userInputDiv.appendChild(pKLInputDiv);

export function initializeParameterMenuHandlers(setGridSpacingCallback, setBohrtiefeCallback, setBS_HZCallback, setBS_KLCallback, setP_HZCallback, setP_KLCallback) {
    gridSpacingHandler = setGridSpacingCallback;
    bohrtiefeHandler = setBohrtiefeCallback;
    BS_HZHandler = setBS_HZCallback;
    BS_KLHandler = setBS_KLCallback;
    P_HZHandler = setP_HZCallback;
    P_KLHandler = setP_KLCallback;
}