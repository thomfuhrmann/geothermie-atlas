import "./ui.css";

let setEHZ, setEKL, setPHZ, setPKL, setCOPWP;

export const initializeCollapsibleGWWP = () => {
  // create collapsible
  const collapsible = document.createElement("div");
  collapsible.classList = "collapsible-container";

  // button for collapsible
  const button = document.createElement("button");
  button.classList = "collapsible-button";
  button.innerHTML = "Parameter";
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

  // Jahresheizenergie
  const eHZInput = document.createElement("input");
  eHZInput.id = "ehz-input";
  eHZInput.type = "number";
  eHZInput.min = 0;
  eHZInput.placeholder = "Wert größer gleich 0";
  eHZInput.onchange = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setEHZ(parseInt(event.target.value));
  };
  const eHZLabel = document.createElement("label");
  eHZLabel.for = "ehz-input";
  eHZLabel.innerText = "Jahresheizenergie (optional)";

  const eHZInputDiv = document.createElement("div");
  eHZInputDiv.className = "input-section";

  eHZInputDiv.appendChild(eHZLabel);
  eHZInputDiv.appendChild(eHZInput);

  content.appendChild(eHZInputDiv);

  // Jahreskühlenergie
  const eKLInput = document.createElement("input");
  eKLInput.id = "ekl-input";
  eKLInput.type = "number";
  eKLInput.min = 0;
  eKLInput.placeholder = "Wert größer gleich 0";
  eKLInput.onchange = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setEKL(parseInt(event.target.value));
  };
  const eKLLabel = document.createElement("label");
  eKLLabel.for = "ekl-input";
  eKLLabel.innerText = "Jahresheizenergie (optional)";

  const eKLInputDiv = document.createElement("div");
  eKLInputDiv.className = "input-section";

  eKLInputDiv.appendChild(eKLLabel);
  eKLInputDiv.appendChild(eKLInput);

  content.appendChild(eKLInputDiv);

  // Leistung Heizen
  const pHZInput = document.createElement("input");
  pHZInput.id = "pHZ-input";
  pHZInput.type = "number";
  pHZInput.min = 0;
  pHZInput.placeholder = "Wert größer gleich 0";
  pHZInput.onchange = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setPHZ(parseInt(event.target.value));
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
  const pKLInput = document.createElement("input");
  pKLInput.id = "pKL-input";
  pKLInput.type = "number";
  pKLInput.min = 0;
  pKLInput.placeholder = "Wert größer gleich 0";
  pKLInput.onchange = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setPKL(parseInt(event.target.value));
  };
  const pKLLabel = document.createElement("label");
  pKLLabel.for = "pKL-input";
  pKLLabel.innerText = "Kühlleistung in kW (optional)";

  const pKLInputDiv = document.createElement("div");
  pKLInputDiv.className = "input-section";

  pKLInputDiv.appendChild(pKLLabel);
  pKLInputDiv.appendChild(pKLInput);

  content.appendChild(pKLInputDiv);

  // durchschnittliche Leistungszahl der Wärmepumpen
  const copWPInput = document.createElement("input");
  copWPInput.id = "cop-wp-input";
  copWPInput.type = "number";
  copWPInput.min = 0;
  copWPInput.placeholder = "Wert größer gleich 0";
  copWPInput.onchange = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setCOPWP(parseInt(event.target.value));
  };
  const copWPLabel = document.createElement("label");
  copWPLabel.for = "cop-wp-input";
  copWPLabel.innerText =
    "durchschnittliche Leistungszahl der Wärmepumpen (optional)";

  const copWPInputDiv = document.createElement("div");
  copWPInputDiv.className = "input-section";

  copWPInputDiv.appendChild(copWPLabel);
  copWPInputDiv.appendChild(copWPInput);

  content.appendChild(copWPInputDiv);

  return collapsible;
};

export function initializeParameterMenuHandlers(
  setEHZCallback,
  setEKLCallback,
  setPHZCallback,
  setPKLCallback,
  setCOPWPCallback
) {
  setEHZ = setEHZCallback;
  setEKL = setEKLCallback;
  setPHZ = setPHZCallback;
  setPKL = setPKLCallback;
  setCOPWP = setCOPWPCallback;
}
