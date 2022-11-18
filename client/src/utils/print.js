import jsPDF from "jspdf";

export const print = (
  einschraenkungen,
  hinweise,
  computationResult,
  screenshot,
  image_bal,
  image_userdefined,
  cadastralData,
  warnings = false,
  image_borefield,
  calculationMode,
  theme,
  resources
) => {
  // space between tables
  let spaceBetween = 5;

  // create new pdf document object
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // add date to top right corner
  let today = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.text("erstellt am " + today, 190, 10, { align: "right" });

  // add heading
  doc.setFontSize(14);
  doc.text("Standortbasierter Bericht", 105, 20, {
    align: "center",
  });

  // screenshot of the map
  doc.addImage(screenshot, "PNG", 20, 30, 170, 85);

  // cadastral data
  if (cadastralData) {
    doc.autoTable({
      html: "#cadastral-data-table",
      rowPageBreak: "avoid",
      startY: 120,
      styles: { halign: "center" },
      columnStyles: { 0: { fillColor: [255, 255, 255] } },
    });
  }

  // address table
  let finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#address-table",
    rowPageBreak: "avoid",
    startY: cadastralData ? finalY : 120,
    styles: { halign: "center" },
    columnStyles: { 0: { fillColor: [255, 255, 255] } },
  });

  // legend for parcel boundary lines
  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    doc.autoTable({
      startY: finalY,
      head: [],
      body: [
        ["                  ", "Grundstücksgrenze"],
        theme === "EWS" && [
          "                  ",
          "2,5-Meter-Abstand zur Grundstückgsrenze",
        ],
      ],
      willDrawCell: () => {
        doc.setFillColor(255, 255, 255);
      },
      didDrawCell: function (data) {
        let rowCenterY = data.row.height / 2;
        doc.setLineWidth(0.5);
        if (
          computationResult &&
          data.row.index === 0 &&
          data.column.index === 0
        ) {
          doc.setDrawColor("blue");
          doc.line(
            data.cursor.x + 5,
            data.cursor.y + rowCenterY,
            data.cursor.x + 40,
            data.cursor.y + rowCenterY
          );
        }

        if (
          computationResult &&
          theme === "EWS" &&
          data.row.index === 1 &&
          data.column.index === 0
        ) {
          doc.setDrawColor("#00890c");
          doc.line(
            data.cursor.x + 5,
            data.cursor.y + rowCenterY,
            data.cursor.x + 40,
            data.cursor.y + rowCenterY
          );
        }
      },
    });
  }

  // warnings table
  if (computationResult && warnings) {
    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#warnings-table",
      rowPageBreak: "avoid",
      startY: finalY,
      willDrawCell: function (data) {
        if (data.section === "body" && data.cell.text !== "") {
          doc.setFillColor(255, 251, 214);
          doc.setTextColor(113, 81, 0);
        } else {
          doc.setFillColor(255, 255, 255);
        }
      },
    });
  }

  // resources table
  if (resources) {
    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#resources-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: finalY + spaceBetween,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Ressourcen";
        }

        if (
          data.cell.text.length > 0 &&
          (data.cell.text[0].startsWith("Ressourcen") ||
            data.cell.text[0].startsWith("Standortabhängige"))
        ) {
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  // restrictions table
  if (einschraenkungen) {
    // start at second page
    doc.addPage();

    doc.autoTable({
      html: "#einschraenkungen-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: 20,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          data.cell.text = "Einschränkungen";
        }
      },
    });
  }

  // hints table
  finalY = doc.lastAutoTable.finalY;
  if (hinweise) {
    doc.autoTable({
      html: "#hinweise-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: einschraenkungen ? finalY + spaceBetween : 20,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Hinweise";
        }
      },
    });
  }

  // calculations input table
  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    if (einschraenkungen || hinweise) {
      doc.addPage();
    }

    doc.autoTable({
      html: "#calculations-input-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: hinweise ? 20 : finalY + spaceBetween,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text[0] = "Berechnungsergebnisse";
        }

        if (
          data.cell.text[0] === "Berechnungsvorgaben" ||
          data.cell.text[0] === "Benutzereingabe" ||
          data.cell.text[0] === "Standortabhängige Parameter"
        ) {
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  // borefield map
  finalY = doc.lastAutoTable.finalY;
  if (computationResult && image_borefield) {
    const imgProps = doc.getImageProperties(image_borefield.current);
    const width = doc.internal.pageSize.getWidth() - 100;
    const totalHeight = doc.internal.pageSize.getHeight();
    let height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY - 10) {
      doc.addPage();
      doc.addImage(image_borefield.current, "PNG", 50, 20, width, height);
    } else {
      doc.addImage(
        image_borefield.current,
        "PNG",
        50,
        finalY + 5,
        width,
        height
      );
    }
  }

  // start new page if theme is EWS
  // user input table is longer than for GWWP
  if (computationResult && theme === "EWS") {
    doc.addPage();
  }
  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    doc.autoTable({
      html: "#calculations-output-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: theme === "EWS" ? 20 : finalY + spaceBetween,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: (data) => {
        if (data.cell.text[0] === "Benutzerdefinierte Vorgaben") {
          data.cell.styles.halign = "center";
        }

        if (
          data.cell.text[0].startsWith("Berechnungsergebnisse") ||
          data.cell.text[0].startsWith("Heizbetrieb") ||
          data.cell.text[0].startsWith("Kühlbetrieb")
        ) {
          doc.setFillColor(255, 255, 255);
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  // plot graph for user defined input
  finalY = doc.lastAutoTable.finalY;
  let height = 0;
  if (computationResult && image_userdefined) {
    const imgProps = doc.getImageProperties(image_userdefined.current);
    const width = doc.internal.pageSize.getWidth() - 60;
    const totalHeight = doc.internal.pageSize.getHeight();
    height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY - 10) {
      doc.addPage();
      doc.addImage(image_userdefined.current, "PNG", 30, 20, width, height);
    } else {
      doc.addImage(
        image_userdefined.current,
        "PNG",
        30,
        finalY + 5,
        width,
        height
      );
    }
  }

  // calculations output for automatic input
  finalY = doc.lastAutoTable.finalY;
  if (computationResult && image_bal) {
    doc.addPage();
    doc.autoTable({
      html: "#calculations-bal-output-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: 20,
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          data.cell.text[0] =
            "Berechnungsergebnisse für den saisonalen Speicherbetrieb";
        }

        if (
          data.cell.text[0] === "Berechnungsergebnisse" ||
          data.cell.text[0].startsWith("Heizbetrieb") ||
          data.cell.text[0].startsWith("Kühlbetrieb")
        ) {
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  // plot graph for automatic input
  finalY = doc.lastAutoTable.finalY;
  if (computationResult && image_bal) {
    const imgProps = doc.getImageProperties(image_bal.current);
    const width = doc.internal.pageSize.getWidth() - 60;
    const totalHeight = doc.internal.pageSize.getHeight();
    height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY - 10) {
      doc.addPage();
      doc.addImage(image_bal.current, "PNG", 30, 20, width, height);
    } else {
      doc.addImage(image_bal.current, "PNG", 30, finalY + 5, width, height);
    }
  }

  // show glossary
  doc.addPage();
  if (computationResult && theme === "EWS") {
    doc.autoTable({
      startY: 20,
      head: [
        [
          {
            content: "Glossar",
            colSpan: 2,
          },
        ],
      ],
      body: [
        [
          "COP",
          "Leistungszahl der Wärmepumpe im Heizbetrieb (Coefficient of Performance)",
        ],
        [
          "JAZ",
          "Jahresarbeitszahl oder saisonale Leistungszahl der Wärmepumpe im Heizbetrieb",
        ],
        [
          "EER",
          "Leistungszahl der Wärmepumpe im Kühlbetrieb (Energy Efficiency Rating)",
        ],
        [
          "SEER",
          "Saisonale Leistungszahl der Wärmepumpe im Kühlbetrieb (Seasonal Energy Efficiency Rating)",
        ],
      ],
      columnStyles: {
        0: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
        1: {
          lineWidth: { bottom: 0.1 },
          lineColor: "#d1d1d1",
          fillColor: [255, 255, 255],
        },
      },
    });
  }

  // disclaimer
  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#disclaimer",
    rowPageBreak: "avoid",
    startY: computationResult && theme === "EWS" ? finalY + spaceBetween : 20,
    columnStyles: { 0: { fillColor: [255, 255, 255] } },
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Haftungsausschluss";
      }
    },
  });

  // contact
  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#contact",
    rowPageBreak: "avoid",
    startY: finalY + spaceBetween,
    columnStyles: { 0: { fillColor: [255, 255, 255] } },
    willDrawCell: (data) => {
      if (data.section === "head") {
        data.cell.text = "Kontakt";
      }
    },
  });

  // print page numbers and number of total pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    // go to page i
    doc.setPage(i);

    // set font size
    doc.setFontSize(8);

    // print text
    doc.text("Seite " + i, 190, 283, {
      align: "right",
    });
  }

  doc.save("Bericht.pdf");
};
