/*
  After Effects ExtendScript – Telefonlistenbereich (Design, statisch)
  Anforderungen:
  - Container mit 40er Rundung, schwarzer Hintergrund
  - Spalten: Uhrzeit, Anrufername, Anrufernummer, Zusammenfassung, Status
  - Pfeil-Indikator bei Zusammenfassung (nur visuell)
  - 20 Anrufe, monochromes, dunkles Design

  Nutzung:
  - After Effects → File → Scripts → Run Script File… → diese Datei wählen
  - Erstellt Komposition "Telefonliste_Design" (1920x1080)
*/

(function CreateCallList() {
  app.beginUndoGroup("Telefonliste erstellen");

  var proj = app.project || app.newProject();
  var W = 1920, H = 1080, DUR = 12;
  var comp = proj.items.addComp("Telefonliste_Design", W, H, 1.0, DUR, 30);

  // Farben (monochrom)
  var bg = [0,0,0];
  var panelFill = [0,0,0];
  var panelStroke = [38/255, 38/255, 40/255];
  var rowFillA = [16/255,16/255,18/255];
  var rowFillB = [12/255,12/255,14/255];
  var textBright = [0.92,0.93,0.95];
  var textDim = [0.70,0.72,0.75];

  // Background
  comp.layers.addSolid(bg, "Background", W, H, 1);

  // Helper
  function addText(text, size, color, pos, align) {
    var t = comp.layers.addText(text);
    var td = t.property("Source Text").value;
    var candidates = ["FiraCode-Regular","Menlo-Regular","Monaco","Consolas","CourierNewPSMT"];
    for (var i=0;i<candidates.length;i++){ try{ td.font = candidates[i]; break; }catch(e){} }
    td.fontSize = size; td.applyFill = true; td.fillColor = color; td.justification = align || ParagraphJustification.LEFT_JUSTIFY;
    t.property("Source Text").setValue(td);
    t.property("Position").setValue(pos);
    return t;
  }
  function roundedRect(name, w, h, color, r){
    var s = comp.layers.addShape(); s.name = name;
    var g = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    g.name = name + " Group";
    var rect = g.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w,h]);
    rect.property("ADBE Vector Rect Roundness").setValue(r||40);
    var fill = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(color);
    return s;
  }
  function strokeOn(layer, color, width){
    var g = layer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
    var st = g.addProperty("ADBE Vector Graphic - Stroke");
    st.property("ADBE Vector Stroke Color").setValue(color);
    st.property("ADBE Vector Stroke Width").setValue(width);
  }

  // Layout-Konstanten
  var M = 48;               // Außen-Margin
  var panelW = W - M*2;     // volle Breite mit Margin
  var rowH = 44;            // Zeilenhöhe
  var headerH = 60;         // Tabellen-Kopf
  var rowsCount = 20;       // 20 Anrufe
  var panelH = headerH + rowsCount*rowH + 40; // zusätzlicher Innenabstand unten
  var panelX = W/2, panelY = H/2;

  // Panel
  var listPanel = roundedRect("Telefonliste Panel", panelW, panelH, panelFill, 40);
  listPanel.property("Position").setValue([panelX, panelY]);
  strokeOn(listPanel, panelStroke, 1);

  // Spalten-Offsets relativ zum Panel-Left
  var left = (W - panelW)/2;
  var top = (H - panelH)/2;
  var colTime = left + 40;
  var colName = left + 180;
  var colNum  = left + 520;
  var colSum  = left + 820;
  var colStat = left + panelW - 100;
  var colArrow = colSum - 24;

  // Header (monochrom)
  addText("Uhrzeit", 18, textDim, [colTime, top + 26], ParagraphJustification.LEFT_JUSTIFY);
  addText("Anrufername", 18, textDim, [colName, top + 26], ParagraphJustification.LEFT_JUSTIFY);
  addText("Nummer", 18, textDim, [colNum,  top + 26], ParagraphJustification.LEFT_JUSTIFY);
  addText("Zusammenfassung", 18, textDim, [colSum,  top + 26], ParagraphJustification.LEFT_JUSTIFY);
  addText("Status", 18, textDim, [colStat, top + 26], ParagraphJustification.RIGHT_JUSTIFY);

  // Dummy-Daten (20 Einträge)
  var calls = [
    ["08:01","Anna Weber","+49 30 1234 567","Termin buchen","erfolgreich"],
    ["08:05","Jonas Klein","+49 160 9876 543","Rezept anfragen","weitergeleitet"],
    ["08:10","Dr. Krämer","+41 44 555 22","Rückruf erbeten","offen"],
    ["08:12","M. Lehmann","+49 351 222 11","Öffnungszeiten","beantwortet"],
    ["08:18","S. Roth","+49 221 9988 77","Arzt sprechen","in Warteschleife"],
    ["08:22","Elif Kaya","+90 532 111 22","Befund besprechen","weitergeleitet"],
    ["08:26","P. Müller","+49 211 333 44","Versicherung","beantwortet"],
    ["08:31","N. Wagner","+49 89 444 55","Termin verschieben","erfolgreich"],
    ["08:36","K. Hoffmann","+49 69 1010 20","Adresse ändern","beantwortet"],
    ["08:40","L. Becker","+49 40 222 66","Impfung","erfolgreich"],
    ["08:44","R. Schmitt","+49 711 4321","Überweisung","weitergeleitet"],
    ["08:49","T. Fischer","+49 203 7788","Krankschreibung","offen"],
    ["08:53","O. Braun","+49 521 333","Termin bestätigen","erfolgreich"],
    ["08:57","I. Schäfer","+49 202 9090","Laborwerte","weitergeleitet"],
    ["09:01","V. Koch","+49 30 1122","Beschwerden","in Warteschleife"],
    ["09:05","Z. Meier","+49 40 7788","Nachsorge","beantwortet"],
    ["09:09","E. Richter","+49 341 123","Allgemeine Anfrage","beantwortet"],
    ["09:12","A. Seidel","+49 721 551","Rückruf","offen"],
    ["09:15","Y. Wolf","+49 89 222","Termin Erstgespräch","erfolgreich"],
    ["09:18","H. Neumann","+49 69 999","Rezept verlängern","weitergeleitet"]
  ];

  // Zeilen rendern
  var y0 = top + headerH; // Start unter dem Header
  for (var i=0; i<calls.length; i++) {
    var y = y0 + i*rowH + rowH/2;
    var fill = (i % 2 === 0) ? rowFillA : rowFillB;
    var row = roundedRect("Row"+(i+1), panelW - 32, rowH-6, fill, 14);
    row.property("Position").setValue([W/2, y]);

    // Inhalte
    addText(calls[i][0], 18, textBright, [colTime, y-10], ParagraphJustification.LEFT_JUSTIFY);
    addText(calls[i][1], 18, textBright, [colName, y-10], ParagraphJustification.LEFT_JUSTIFY);
    addText(calls[i][2], 18, textBright, [colNum,  y-10], ParagraphJustification.LEFT_JUSTIFY);
    // Pfeil-Indikator + Zusammenfassung
    addText(">", 22, textDim, [colArrow, y-12], ParagraphJustification.CENTER_JUSTIFY);
    addText(calls[i][3], 18, textDim, [colSum,  y-10], ParagraphJustification.LEFT_JUSTIFY);
    // Status rechtsbündig
    addText(calls[i][4], 18, textDim, [colStat, y-10], ParagraphJustification.RIGHT_JUSTIFY);
  }

  app.endUndoGroup();
})();



