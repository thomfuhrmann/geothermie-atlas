import "./ui.css";

// create collapsible
export const collapsible = document.createElement("div");
collapsible.classList = "collapsible-container";

// button for collapsible
const button = document.createElement("button");
button.classList = "collapsible-button";
button.innerHTML = "Parameter Erdwärmesonden";
button.addEventListener("click", () => {
  button.classList.toggle("active");
  var content = button.nextElementSibling;
  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
});
collapsible.appendChild(button);

// content of collapsible
const content = document.createElement("div");
content.className = "collapsible-content";
collapsible.appendChild(content);

let gridSpacingHandler;
const gridSpacingInput = document.createElement("input");
gridSpacingInput.id = "gridspacing-input";
gridSpacingInput.type = "number";
gridSpacingInput.min = 5;
gridSpacingInput.max = 15;
gridSpacingInput.value = 10;
gridSpacingInput.onchange = (event) => {
  if (event.target.value < 5) {
    event.target.value = 5;
  } else if (event.target.value > 15) {
    event.target.value = 15;
  }
  gridSpacingHandler(parseInt(event.target.value));
};

const gridSpacingLabel = document.createElement("label");
gridSpacingLabel.for = "gridspacing-input";
gridSpacingLabel.innerText = "Sondenabstand in Meter";

const gridSpacingInputDiv = document.createElement("div");
gridSpacingInputDiv.className = "input-section";

gridSpacingInputDiv.appendChild(gridSpacingLabel);
gridSpacingInputDiv.appendChild(gridSpacingInput);

content.appendChild(gridSpacingInputDiv);

// Sondentiefe
let bohrtiefeHandler;
const bohrtiefeInput = document.createElement("input");
bohrtiefeInput.id = "sondentiefe-input";
bohrtiefeInput.type = "number";
bohrtiefeInput.min = 80;
bohrtiefeInput.max = 250;
bohrtiefeInput.value = 100;
bohrtiefeInput.onchange = (event) => {
  if (event.target.value > 250) {
    event.target.value = 250;
  } else if (event.target.value < 80) {
    event.target.value = 80;
  }
  bohrtiefeHandler(parseInt(event.target.value));
};
const bohrtiefeLabel = document.createElement("label");
bohrtiefeLabel.for = "sondentiefe-input";
bohrtiefeLabel.innerText = "Sondentiefe in Meter";

const bohrtiefeInputDiv = document.createElement("div");
bohrtiefeInputDiv.className = "input-section";

bohrtiefeInputDiv.appendChild(bohrtiefeLabel);
bohrtiefeInputDiv.appendChild(bohrtiefeInput);

content.appendChild(bohrtiefeInputDiv);

// Betriebsstunden Heizen
let BS_HZHandler;
const bsHZInput = document.createElement("input");
bsHZInput.id = "bshz-input";
bsHZInput.type = "number";
bsHZInput.min = 0;
bsHZInput.max = 4379;
bsHZInput.onchange = (event) => {
  if (event.target.value > 4379) {
    event.target.value = 4379;
  } else if (event.target.value < 0) {
    event.target.value = 0;
  }
  BS_HZHandler(parseInt(event.target.value));
};
const bsHZLabel = document.createElement("label");
bsHZLabel.for = "bshz-input";
bsHZLabel.innerText = "Betriebsstunden Heizen pro Jahr (optional)";

const bsHZInputDiv = document.createElement("div");
bsHZInputDiv.className = "input-section";

bsHZInputDiv.appendChild(bsHZLabel);
bsHZInputDiv.appendChild(bsHZInput);

content.appendChild(bsHZInputDiv);

// Betriebsstunden Kühlen
let BS_KLHandler;
const bsKLInput = document.createElement("input");
bsKLInput.id = "bskl-input";
bsKLInput.type = "number";
bsKLInput.min = 0;
bsKLInput.max = 4379;
bsKLInput.onchange = (event) => {
  if (event.target.value > 4379) {
    event.target.value = 4379;
  } else if (event.target.value < 0) {
    event.target.value = 0;
  }
  BS_KLHandler(parseInt(event.target.value));
};
const bsKLLabel = document.createElement("label");
bsKLLabel.for = "bskl-input";
bsKLLabel.innerText = "Betriebsstunden Kühlen pro Jahr (optional)";

const bsKLInputDiv = document.createElement("div");
bsKLInputDiv.className = "input-section";

bsKLInputDiv.appendChild(bsKLLabel);
bsKLInputDiv.appendChild(bsKLInput);

content.appendChild(bsKLInputDiv);

// Leistung Heizen
let P_HZHandler;
const pHZInput = document.createElement("input");
pHZInput.id = "pHZ-input";
pHZInput.type = "number";
pHZInput.min = 0;
pHZInput.onchange = (event) => {
  if (event.target.value < 0) {
    event.target.value = 0;
  }
  P_HZHandler(parseInt(event.target.value));
};
const pHZLabel = document.createElement("label");
pHZLabel.for = "pHZ-input";
pHZLabel.innerText = "Heizleistung in kW (optional)";

const pHZInputDiv = document.createElement("div");
pHZInputDiv.className = "input-section";

pHZInputDiv.appendChild(pHZLabel);
pHZInputDiv.appendChild(pHZInput);

content.appendChild(pHZInputDiv);

// Leistung Kühlen
let P_KLHandler;
const pKLInput = document.createElement("input");
pKLInput.id = "pKL-input";
pKLInput.type = "number";
pKLInput.min = 0;
pKLInput.onchange = (event) => {
  if (event.target.value < 0) {
    event.target.value = 0;
  }
  P_KLHandler(parseInt(event.target.value));
};
const pKLLabel = document.createElement("label");
pKLLabel.for = "pKL-input";
pKLLabel.innerText = "Kühlleistung in kW (optional)";

const pKLInputDiv = document.createElement("div");
pKLInputDiv.className = "input-section";

pKLInputDiv.appendChild(pKLLabel);
pKLInputDiv.appendChild(pKLInput);

content.appendChild(pKLInputDiv);

export function initializeParameterMenuHandlers(
  setGridSpacingCallback,
  setBohrtiefeCallback,
  setBS_HZCallback,
  setBS_KLCallback,
  setP_HZCallback,
  setP_KLCallback
) {
  gridSpacingHandler = setGridSpacingCallback;
  bohrtiefeHandler = setBohrtiefeCallback;
  BS_HZHandler = setBS_HZCallback;
  BS_KLHandler = setBS_KLCallback;
  P_HZHandler = setP_HZCallback;
  P_KLHandler = setP_KLCallback;
}
