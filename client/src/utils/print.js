import jsPDF from "jspdf";

export const print = (
  einschraenkungen,
  hinweise,
  computationResult,
  screenshot,
  image_bal,
  image_unbal,
  cadastralData,
  warnings = false
) => {
  let spaceBetween = 5;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let today = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.text("erstellt am " + today, 190, 10, { align: "right" });
  doc.setFontSize(14);
  doc.text("Standortbasierter Bericht", 105, 20, {
    align: "center",
  });

  doc.addImage(screenshot, "PNG", 20, 30, 170, 85);

  if (cadastralData) {
    doc.autoTable({
      html: "#cadastral-data-table",
      rowPageBreak: "avoid",
      startY: 120,
      styles: { halign: "center" },
      willDrawCell: function (data) {
        if (data.section === "body") {
          doc.setFillColor(255, 255, 255);
        }
      },
    });
  }

  let finalY;
  if (cadastralData) {
    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#address-table",
      rowPageBreak: "avoid",
      startY: finalY,
      styles: { halign: "center" },
      willDrawCell: function (data) {
        if (data.section === "body") {
          doc.setFillColor(255, 255, 255);
        }
      },
    });
  } else {
    doc.autoTable({
      html: "#address-table",
      rowPageBreak: "avoid",
      startY: 120,
      styles: { halign: "center" },
      willDrawCell: function (data) {
        if (data.section === "body") {
          doc.setFillColor(255, 255, 255);
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (computationResult && warnings) {
    doc.autoTable({
      html: "#warnings-table",
      rowPageBreak: "avoid",
      startY: finalY,
      willDrawCell: function (data) {
        if (data.section === "body" && data.cell.text[0] !== "") {
          doc.setFillColor(255, 251, 214);
          doc.setTextColor(113, 81, 0);
        } else {
          doc.setFillColor(255, 255, 255);
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#resources-table",
    rowPageBreak: "avoid",
    showHead: "firstPage",
    startY: finalY + 5,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Ressourcen";
      }
    },
  });

  doc.addPage();
  if (einschraenkungen) {
    doc.autoTable({
      html: "#einschraenkungen-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: 20,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Einschränkungen";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (hinweise) {
    doc.autoTable({
      html: "#hinweise-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: einschraenkungen ? finalY + spaceBetween : 20,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Hinweise";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    if (hinweise) {
      doc.addPage();
    }
    doc.autoTable({
      html: "#calculations-output-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: hinweise ? 20 : finalY + spaceBetween,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Berechnungsergebnis";
        }

        if (data.cell.text[0] === "Gewählte Parameter") {
          doc.setFillColor(255, 255, 255);
          data.cell.styles.halign = "center";
        }

        if (data.cell.text[0] === "Berechnungsergebnis") {
          doc.setFillColor(255, 255, 255);
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  let height = 0;
  if (image_unbal) {
    const imgProps = doc.getImageProperties(image_unbal.current);
    const width = doc.internal.pageSize.getWidth() - 60;
    const totalHeight = doc.internal.pageSize.getHeight();
    height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY - 10) {
      doc.addPage();
      doc.addImage(image_unbal.current, "PNG", 30, 20, width, height);
    } else {
      doc.addImage(image_unbal.current, "PNG", 30, finalY + 5, width, height);
    }
  }

  finalY = doc.lastAutoTable.finalY;
  let startY = 0;
  // if (pageAdded) {
  //   startY = height + 30;
  // } else {
  //   startY = finalY + height + 10;
  // }
  if (computationResult && image_bal) {
    doc.addPage();
    doc.autoTable({
      html: "#calculations-bal-output-table",
      rowPageBreak: "avoid",
      showHead: "firstPage",
      startY: startY + 20,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Berechnungsergebnis (bilanzierter Betrieb)";
        }

        if (data.cell.text[0].startsWith("Für einen bilanzierten")) {
          doc.setFillColor(255, 255, 255);
        }

        if (data.cell.text[0] === "Gewählte Parameter") {
          doc.setFillColor(255, 255, 255);
          data.cell.styles.halign = "center";
        }

        if (data.cell.text[0] === "Berechnungsergebnis") {
          doc.setFillColor(255, 255, 255);
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  height = 0;
  if (image_bal) {
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

  doc.addPage();
  doc.autoTable({
    html: "#disclaimer",
    rowPageBreak: "avoid",
    showHead: "firstPage",
    startY: 20,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Haftungsausschluss";
      }
      if (data.section === "body") {
        doc.setFillColor(255, 255, 255);
      }
    },
  });

  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#contact",
    rowPageBreak: "avoid",
    showHead: "firstPage",
    startY: finalY + spaceBetween,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Kontakt";
      }
      if (data.section === "body") {
        doc.setFillColor(255, 255, 255);
      }
    },
  });

  // print the page number and the total pages
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
