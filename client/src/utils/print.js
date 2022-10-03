import jsPDF from "jspdf";

export const print = (
  einschraenkungenEWS,
  einschraenkungenGWWP,
  hinweiseEWS,
  hinweiseGWWP,
  computationResult,
  screenshot,
  image_bal,
  image_unbal,
  cadastralData
) => {
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
  doc.autoTable({
    html: "#ews-table",
    rowPageBreak: "avoid",
    startY: finalY + 10,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Ressourcen für Erdwärmesonden";
      }
    },
  });

  finalY = doc.lastAutoTable.finalY;
  if (hinweiseEWS) {
    doc.autoTable({
      html: "#hinweise-0-table",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Hinweise Erdwärmesonden";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (einschraenkungenEWS) {
    doc.autoTable({
      html: "#einschraenkungen-0-table",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Einschränkungen Erdwärmesonden";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    doc.autoTable({
      html: "#calculations-output-table",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Berechnungsergebnis für Erdwärmesonden";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  let height = 0;
  if (computationResult) {
    const imgProps = doc.getImageProperties(image_unbal.current);
    const width = doc.internal.pageSize.getWidth() - 40;
    const totalHeight = doc.internal.pageSize.getHeight();
    height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY) {
      doc.addPage();
      doc.addImage(image_unbal.current, "PNG", 20, 20, width, height);
    } else {
      doc.addImage(image_unbal.current, "PNG", 20, finalY, width, height);
    }
  }

  finalY = doc.lastAutoTable.finalY;
  if (computationResult) {
    doc.autoTable({
      html: "#calculations-bal-output-table",
      rowPageBreak: "avoid",
      startY: finalY + height + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text =
            "Berechnungsergebnis für Erdwärmesonden (bilanzierter Betrieb)";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  height = 0;
  if (computationResult) {
    const imgProps = doc.getImageProperties(image_bal.current);
    const width = doc.internal.pageSize.getWidth() - 40;
    const totalHeight = doc.internal.pageSize.getHeight();
    height = (imgProps.height * width) / imgProps.width;
    if (height > totalHeight - finalY) {
      doc.addPage();
      doc.addImage(image_bal.current, "PNG", 20, 20, width, height);
    } else {
      doc.addImage(image_bal.current, "PNG", 20, finalY, width, height);
    }
  }

  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#gwwp-table",
    rowPageBreak: "avoid",
    startY: finalY + height + 10,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Ressourcen für thermische Grundwassernutzung";
      }
    },
  });

  finalY = doc.lastAutoTable.finalY;
  if (hinweiseGWWP) {
    doc.autoTable({
      html: "#hinweise-1-table",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Hinweise thermische Grundwassernutzung";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  if (einschraenkungenGWWP) {
    doc.autoTable({
      html: "#einschraenkungen-1-table",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Einschränkungen thermische Grundwassernutzung";
        }
      },
    });
  }

  finalY = doc.lastAutoTable.finalY;
  doc.autoTable({
    html: "#disclaimer",
    rowPageBreak: "avoid",
    startY: finalY + 10,
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
    startY: finalY + 10,
    willDrawCell: function (data) {
      if (data.section === "head") {
        data.cell.text = "Kontakt";
      }
      if (data.section === "body") {
        doc.setFillColor(255, 255, 255);
      }
    },
  });

  doc.save("Bericht.pdf");
};
