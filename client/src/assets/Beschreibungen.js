export const ews_erklaerungen = {
  0: [
    `Die flächenspezifische Jahresenergie eines Sondenfelds mit 7 x 7 Sonden in 5 m Abstand und einer Tiefe von jeweils 100 m, das als Speicher verwendet wird (es wird eine ausgeglichene Jahresbilanz angenommen, das bedeutet, die im Winter zur Heizung entzogene Wärme wird im Sommer vollständig wieder zurückgegeben), beträgt rund `,
    " kWh/m²/a.",
  ],
  1: [
    `Die flächenspezifische Jahresenergie eines Sondenfelds mit 4 x 4 Sonden in 10 m Abstand und einer Tiefe von jeweils 100 m, das primär als Wärmequelle dient wobei ein Teil im Sommer durch Gebäudekühlung entsprechend des Bedarfs wieder regeneriert wird, 
  (der Heiz- und Kühlbedarf ist klimaabhängig von der Jahresmitteltemperatur (Normbetriebsstunden)) beträgt rund `,
    " kWh/m²/a.",
  ],
  2: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde, die als Speicher mit einer ausgeglichenen Jahresbilanz (im Winter entzogene Wärme wird im Sommer wieder vollständig zurück gegeben) betrieben wird, beträgt am Grundstück ",
    " W/lfm.",
  ],
  3: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde, die primär als Wärmequelle dient wobei ein Teil im Sommer durch Gebäudekühlung entsprechend des Bedarfs wieder regeneriert wird (je nach klimaabhängigen Normbetriebsstunden), beträgt am Grundstück ",
    " W/lfm.",
  ],
  4: [
    "Die mittlere jährliche Bodentemperatur beträgt laut Satellitendaten (MODIS) ",
    " °C.",
  ],
  5: [
    "Die mittlere Temperatur des Untergrunds für eine Tiefe von 0 bis 100 m beträgt ",
    " °C.",
  ],
  6: [
    "Die mittlere konduktive Wärmeleitfähigkeit des Untergrunds für eine Tiefe von 0 bis 100 m beträgt ",
    " W/m/K.",
  ],
};

export const hinweise = {
  Grundwasserchemismus: {
    "Eisen- und Manganausfällung": `Am Standort kann es zu Eisen- und Manganausfällungen in den Brunnen kommen. 
    Diese können mit bestimmten technischen Maßnahmen wie der Luftfreihaltung des Systems von der Entnahme bis zur Rückgabe des Wassers reduziert oder vermieden werden. 
    Jedenfalls wird im Vorfeld eine chemische Analyse des Grundwassers am Standort empfohlen.`,
    Metallkorrosion: `Am Standort kann es zur Metallkorrosion in den Brunnen kommen. Dies kann mit bestimmten technischen Maßnahmen, wie einem Wärmetauscher aus rostfreiem Stahl bzw. einem zusätzlichen Trennwärmetauscher reduziert oder vermieden werden. 
    Jedenfalls wird im Vorfeld eine chemische Analyse des Grundwassers am Standort empfohlen.`,
    "Keine Daten": `Auf Grund fehlender chemischer Wasseranalysen können keine Aussagen zur Grundwasserchemie getroffen werden.`,
    "Kein Risiko durch GW-Chemismus": "Kein Risiko durch GW-Chemismus",
  },
  Naturdenkmal: `Am Standort gibt es Naturdenkmäler, die eine Nutzung der Oberflächennahen Geothermie eventuell beschränken können.`,
  "Gespannte Grundwasserzone": `Am Standort können gespannte Grundwasserverhältnisse auftreten. Bei der Planung und Durchführung zukünftiger Bohrungen in diesem Bereich muss dies berücksichtigt werden.`,
  "Vorkommen brennbarer Gase": `Am Standort können oberflächennahe Gasvorkommen nicht ausgeschlossen werden. Bei der Planung und Durchführung zukünftiger Bohrungen in diesem Bereich muss dies berücksichtigt werden.`,
  "Mehrere Grundwasserstockwerke": `Am Standort können mehrere Grundwasserstockwerke angetroffen werden.`,
};

export const einschraenkungen = {
  Naturschutz: `Sind durch ein Vorhaben ein Schutzgebiet (z.B. Nationalpark, Europaschutzgebiet, Landschaftsschutzgebiet, Naturschutzgebiet, geschützter Landschafsteil), 
  ein Schutzobjekt (Naturdenkmal) oder streng (geschützte) Tier- und Pflanzenarten betroffen, ist jedenfalls rechtzeitig mit der Magistratsabteilung 22 - Umweltschutz Kontakt aufzunehmen, 
  um eine allfällige naturschutzbehördliche Bewilligungspflicht abklären zu können. Auf folgenden Seiten sind sämtliche Informationen zu Schutzgebieten und –objekten sowie zu den Artenschutzbestimmungen zu finden:`,
  Naturschutz_links: [
    "https://www.wien.gv.at/umweltschutz/naturschutz/gebiet/schutzgebiete.html#schutzgebiete",
    "https://www.wien.gv.at/umweltschutz/naturschutz/biotop/artenschutz.html",
  ],
  "Artesisch gespannte Brunnen": `In einem Umkreis von 100 m Radius wurde mit Bohrungen artesisch gespanntes Grundwasser angetroffen. Bei der Planung und Durchführung zukünftiger Bohrungen in diesem Bereich muss dies berücksichtigt werden.`,
  "Verkarstungsfähige Gesteine": `Am Standort treten verkarstungsfähige Gesteine auf. Bohrungen können daher Hohlräume antreffen.`,
  Altlasten: `Es befindet sich eine Altlast am Standort. Weitere Informationen über die Altlasten sind im Altlasten-GIS unter folgendem Link zu finden: `,
  Altlasten_links:
    "https://secure.umweltbundesamt.at/altlasten/?servicehandler=publicgis",
  "Unterirdische Bauwerke": `In einem Umkreis von 2 m befindet sich ein unterirdisches Verkehrsbauwerk (entsprechend Digitalem Verkehrsgraph - GIP). Auf diesen Flächen und im Nahbereich ist der Einsatz von Erdwärmesonden ausgeschlossen. 
  Es kann jedoch noch weitere unterirdische Bauwerke wie Tiefgaragen, Verbindungsgänge oder Einbauten im restlichen Stadtgebiet geben, die den Einsatz von Erdwärmesonden beschränken können.`,
};
