/*
  After Effects ExtendScript: Telefon-KI Dashboard (dark UI)
  - Erstellt ein schwarzes Dashboard mit Panels, KPIs und einem Sprachen-Widget ("90 Sprachen")
  - Kompatibel mit AE CC 2020+
  Nutzung:
    1) In After Effects: File > Scripts > Run Script File... und diese Datei wählen
    2) Projekt wird gebaut und als "TelefonKI_Dashboard.aep" gespeichert
*/

(function TelefonKIDashboard() {
  app.beginUndoGroup("Telefon-KI Dashboard");

  var proj = app.project || app.newProject();

  // Helper
  function solid(comp, name, color, w, h) {
    var layer = comp.layers.addSolid(color, name, w, h, 1.0);
    return layer;
  }

  function addText(comp, text, size, color, pos, align) {
    var textLayer = comp.layers.addText(text);
    var td = textLayer.property("Source Text").value;

    // Robust: PostScript-Namen ohne Leerzeichen, mit Fallbacks
    var candidates = [
      "FiraCode-Regular",
      "FiraCode-Medium",
      "Menlo-Regular",
      "Monaco",
      "Consolas",
      "CourierNewPSMT"
    ];
    for (var i = 0; i < candidates.length; i++) {
      try { td.font = candidates[i]; break; } catch (e) {}
    }

    td.fontSize = size;
    td.applyFill = true;
    td.fillColor = color;
    td.justification = align || ParagraphJustification.LEFT_JUSTIFY;
    textLayer.property("Source Text").setValue(td);
    textLayer.property("Position").setValue(pos);
    return textLayer;
  }

  function roundedRect(comp, name, w, h, color, roundness) {
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = name;
    var contents = shapeLayer.property("ADBE Root Vectors Group");
    var rectGroup = contents.addProperty("ADBE Vector Group");
    rectGroup.name = name + " Group";
    var rect = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w, h]);
    rect.property("ADBE Vector Rect Roundness").setValue(roundness || 16);
    var fill = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(color);
    return shapeLayer;
  }

  // Farben (dunkler, monochrom)
  var bg = [0/255, 0/255, 0/255];
  var panel = [10/255, 10/255, 12/255];
  var panelAlt = [14/255, 14/255, 16/255];
  var stroke = [34/255, 34/255, 36/255];
  var textDim = [0.70, 0.72, 0.75];
  var textBright = [0.92, 0.93, 0.95];

  // Komp anlegen
  var W = 1920, H = 1080, DUR = 12;
  var comp = proj.items.addComp("TelefonKI_Dashboard", W, H, 1.0, DUR, 30);
  var bgLayer = solid(comp, "Background", bg, W, H);

  // Layout-Konstanten
  var M = 24;              // Margin
  var headerH = 96;        // Header-Höhe
  var sidebarW = 320;      // Sidebar-Breite
  var contentTop = headerH + M;
  var contentH = H - headerH - (2*M);
  var mainX = M*2 + sidebarW;               // Start X des Hauptbereichs
  var mainW = W - mainX - M;                // Breite des Hauptbereichs
  var rightW = 400;                          // Rechte Spalte (Sprachen)
  var leftW = mainW - rightW - M;           // Linke Spalte (KPIs + Anrufliste)

  // Grid subtle
  var grid = roundedRect(comp, "Grid", W, H, [0.06,0.06,0.07], 0);
  grid.blendingMode = BlendingMode.OVERLAY;
  grid.opacity.setValue(35);

  // Header Bar
  var header = roundedRect(comp, "Header", W, headerH, panel, 0);
  header.property("Position").setValue([W/2, headerH/2]);
  var headerLine = roundedRect(comp, "Header Stroke", W, 1, stroke, 0); headerLine.property("Position").setValue([W/2, headerH]); headerLine.opacity.setValue(60);

  // Hinweis: Kein Titel oder Firmenname im Header gewünscht → bewusst leer

  // Left Sidebar (Nav)
  var sidebar = roundedRect(comp, "Sidebar", sidebarW, contentH, panel, 24);
  sidebar.property("Position").setValue([M + sidebarW/2, contentTop + contentH/2]);
  // Vertikale Icons statt Text (monochrom)
  function navIcon(y) {
    var ic = roundedRect(comp, "NavIcon", 28, 28, [0.15,0.15,0.17], 6);
    ic.property("Position").setValue([M + 48, y]);
    var dot = roundedRect(comp, "NavDot", 6, 6, [0.55,0.55,0.58], 3); // kleiner Punkt als Akzent (heller grau)
    dot.property("Position").setValue([M + 80, y]);
  }
  var iconStart = contentTop + 60;
  var iconGap = 56;
  for (var ni=0; ni<6; ni++) { navIcon(iconStart + ni*iconGap); }

  // Main Panels
  var KPIH = 160;
  var panelKPI = roundedRect(comp, "Panel KPIs", leftW, KPIH, panelAlt, 18);
  panelKPI.property("Position").setValue([mainX + leftW/2, contentTop + KPIH/2]);
  addText(comp, "KPIs", 18, textDim, [mainX + 20, contentTop + 22], ParagraphJustification.LEFT_JUSTIFY);

  // KPI Items (3 Spalten)
  function kpi(x, title, value) {
    addText(comp, title, 18, textDim, [x, contentTop + 56], ParagraphJustification.LEFT_JUSTIFY);
    addText(comp, value, 36, textBright, [x, contentTop + 100], ParagraphJustification.LEFT_JUSTIFY);
  }
  var kpiCols = 3;
  var kpiGap = Math.floor((leftW - 3*240) / (kpiCols-1));
  var kx = [mainX + 20, mainX + 20 + 240 + kpiGap, mainX + 20 + 2*(240 + kpiGap)];
  kpi(kx[0], "Aktive Leitungen", "08");
  kpi(kx[1], "Antwortzeit (ms)", "124");
  kpi(kx[2], "Erfolgsquote", "98%");

  // Middle: Call Timeline / Log
  var logTop = contentTop + KPIH + M;
  var logH = contentH - KPIH - M;
  var panelLog = roundedRect(comp, "Panel Log", leftW, logH, panelAlt, 18);
  panelLog.property("Position").setValue([mainX + leftW/2, logTop + logH/2]);
  addText(comp, "Anrufliste", 18, textDim, [mainX + 20, logTop + 22], ParagraphJustification.LEFT_JUSTIFY);
  // Tabellen-Header
  var cols = [mainX + 20, mainX + 160, mainX + 480, mainX + leftW - 140];
  addText(comp, "Zeit", 16, textDim, [cols[0], logTop + 56], ParagraphJustification.LEFT_JUSTIFY);
  addText(comp, "Anrufer", 16, textDim, [cols[1], logTop + 56], ParagraphJustification.LEFT_JUSTIFY);
  addText(comp, "Intention", 16, textDim, [cols[2], logTop + 56], ParagraphJustification.LEFT_JUSTIFY);
  addText(comp, "Status", 16, textDim, [cols[3], logTop + 56], ParagraphJustification.RIGHT_JUSTIFY);
  // Datenzeilen
  var rows = [
    ["12:01", "+49 30 1234 567", "Termin buchen", "erfolgreich"],
    ["12:03", "+49 160 9876 543", "Rezept anfragen", "weitergeleitet"],
    ["12:05", "+41 44 555 22", "Öffnungszeiten", "beantwortet"],
    ["12:06", "+49 351 222 11", "Arzt sprechen", "in Warteschleife"]
  ];
  var rowY = logTop + 88;
  for (var r=0; r<rows.length; r++) {
    var y = rowY + r*36;
    addText(comp, rows[r][0], 16, textBright, [cols[0], y], ParagraphJustification.LEFT_JUSTIFY);
    addText(comp, rows[r][1], 16, textBright, [cols[1], y], ParagraphJustification.LEFT_JUSTIFY);
    addText(comp, rows[r][2], 16, textDim,    [cols[2], y], ParagraphJustification.LEFT_JUSTIFY);
    addText(comp, rows[r][3], 16, textDim,    [cols[3], y], ParagraphJustification.RIGHT_JUSTIFY);
  }

  // Right: Sprachen-Widget (90 Sprachen)
  var panelLang = roundedRect(comp, "Panel Sprachen", rightW, contentH, panelAlt, 18);
  panelLang.property("Position").setValue([mainX + leftW + M + rightW/2, contentTop + contentH/2]);
  var langTitleY = contentTop + 22;
  addText(comp, "Sprachen", 18, textDim, [mainX + leftW + M + 20, langTitleY], ParagraphJustification.LEFT_JUSTIFY);
  var detected = "Deutsch (DE)";
  addText(comp, "Erkannt: " + detected, 16, textBright, [mainX + leftW + M + 20, langTitleY + 30], ParagraphJustification.LEFT_JUSTIFY);

  // Liste realer Sprachen (Auszug)
  var languages = [
    "Deutsch (DE)", "English (EN)", "Español (ES)", "Français (FR)", "Italiano (IT)",
    "Türkçe (TR)", "Português (PT)", "Polski (PL)", "Nederlands (NL)", "Русский (RU)",
    "العربية (AR)", "中文 (ZH)", "日本語 (JA)", "한국어 (KO)", "हिन्दी (HI)",
    "বাংলা (BN)", "ਪੰਜਾਬੀ (PA)", "Tiếng Việt (VI)", "Ελληνικά (EL)", "Українська (UK)"
  ];
  var chipStartX = mainX + leftW + M + 20;
  var chipStartY = contentTop + 80;
  var chipDx = 180, chipDy = 36; // 2 Spalten
  for (var li=0; li<languages.length; li++) {
    var col = li % 2;
    var row = Math.floor(li / 2);
    var cx = chipStartX + col*chipDx;
    var cy = chipStartY + row*chipDy;
    var isDetected = (languages[li] === detected);
    var fillC = isDetected ? [0.20,0.20,0.22] : [0.13,0.13,0.15];
    var chip = roundedRect(comp, "LangChip"+li, 160, 26, fillC, 8);
    chip.property("Position").setValue([cx+80, cy]);
    addText(comp, languages[li], 14, isDetected ? textBright : textDim, [cx+14, cy-8], ParagraphJustification.LEFT_JUSTIFY);
  }

  // Footer
  var footerLine = roundedRect(comp, "Footer Stroke", W, 1, stroke, 0); footerLine.property("Position").setValue([W/2, H-60]); footerLine.opacity.setValue(60);
  addText(comp, "System: online   |   Leitungen: 08   |   Fehler: 0", 16, textDim, [M*2, H-44], ParagraphJustification.LEFT_JUSTIFY);

  // Kleine Intro-Animationen (Opacity-Fades)
  function fadeIn(layer, t) {
    var o = layer.property("Opacity");
    o.setValueAtTime(t, 0);
    o.setValueAtTime(t+0.6, 100);
    try { layer.motionBlur = true; } catch(e) {}
  }
  var layers = []; for (var li=1; li<=comp.numLayers; li++) layers.push(comp.layer(li));
  for (var j=0; j<layers.length; j++) fadeIn(layers[j], Math.min(0.1*j, 2.0));

  // Speichern
  var savePath = Folder("~/Desktop/Cursor-Spielereien/TelefonKI_Dashboard.aep");
  try { proj.save(savePath); } catch (e) {}

  app.endUndoGroup();
})();


