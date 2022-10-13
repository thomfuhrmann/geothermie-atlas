import "./ui.css";

export const initializeCollapsibleEWS = () => {
  // create collapsible
  const collapsible = document.createElement("div");
  collapsible.classList = "collapsible-container";

  // button for collapsible
  const button = document.createElement("button");
  button.classList = "collapsible-button";
  button.innerHTML = "Berechnungen";
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

  return collapsible;
};
