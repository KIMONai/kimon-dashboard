/*
  After Effects ExtendScript – Glass-Dashboard (Frosted / Milchglas)
  Thema: KI füllt frei gewordene Termine automatisch, indem wartende Patienten angerufen werden.

  Eigenschaften:
  - Glas-Panel mit stark abgerundeten Ecken, transluzent (Milchglas) – Hintergrund schimmert durch
  - Linker großer „Medien“-Ausschnitt (Loch) → Hintergrund komplett sichtbar (kein Foto nötig)
  - Rechte Inhaltsspalte mit Titel, 3 KPIs, Beschreibungstext und Buttons
  - Untere Sektion „Pipeline“ mit kleiner Karte/Status

  Nutzung:
  - AE → File → Scripts → Run Script File… → create_glass_dashboard.jsx
  - Erstellt Komposition „Glass_TerminDispatcher“ (1920x1080)
*/

(function GlassDashboard(){
  app.beginUndoGroup("Create Glass Dashboard");

  var proj = app.project || app.newProject();
  var W = 1920, H = 1080, FPS = 30, DUR = 12;
  var comp = proj.items.addComp("Glass_TerminDispatcher", W, H, 1.0, DUR, FPS);

  // Farbwerte (0..1)
  var white = [1,1,1];
  var glassFill = [1,1,1];         // wird via Fill-Opacity abgesenkt
  var glassStroke = [1,1,1];
  var strokeSoft = [0.9,0.95,1.0];
  var textBright = [0.95,0.97,1.0];
  var textDim = [0.70,0.74,0.80];
  var pillBg = [1,1,1];            // milchig

  // Helpers
  function addText(txt, size, col, x, y, align){
    var t = comp.layers.addText(txt);
    var td = t.property("Source Text").value; // TextDocument
    // Monospace/clean fallback
    var fonts = ["Inter-Regular","SF Pro Text","Menlo-Regular","FiraCode-Regular","Monaco","Consolas","CourierNewPSMT"];
    for (var i=0;i<fonts.length;i++){ try{ td.font = fonts[i]; break; }catch(e){} }
    td.fontSize = size; td.applyFill = true; td.fillColor = col; td.justification = align || ParagraphJustification.LEFT_JUSTIFY;
    t.property("Source Text").setValue(td);
    // Top-Left anchor
    t.property("Anchor Point").expression = 'var r=sourceRectAtTime(time,false); [r.left, r.top]';
    t.property("Position").setValue([x, y]);
    return t;
  }

  function shapeGroup(layer){ return layer.property("ADBE Root Vectors Group"); }

  function addRoundedRect(layer, name, w, h, round){
    var grp = shapeGroup(layer).addProperty("ADBE Vector Group");
    grp.name = name;
    var rect = grp.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w, h]);
    rect.property("ADBE Vector Rect Roundness").setValue(round||32);
    return grp;
  }

  function addFill(grp, col, opacity){
    var fill = grp.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(col);
    if (typeof opacity === 'number') fill.property("ADBE Vector Fill Opacity").setValue(opacity);
    return fill;
  }

  function addStroke(grp, col, width, opacity){
    var st = grp.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    st.property("ADBE Vector Stroke Color").setValue(col);
    st.property("ADBE Vector Stroke Width").setValue(width);
    if (typeof opacity === 'number') st.property("ADBE Vector Stroke Opacity").setValue(opacity);
    return st;
  }

  function dropShadow(layer, d, softness, opacity){
    // Immer gültige Zahlen verwenden
    var op = (typeof opacity === 'number') ? opacity : 30;      // 0..100
    var dist = (typeof d === 'number') ? d : 8;
    var soft = (typeof softness === 'number') ? softness : 24;
    try {
      var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
      fx.property("ADBE Drop Shadow-0001").setValue(op);      // Opacity (Percent)
      fx.property("ADBE Drop Shadow-0002").setValue(white);   // Color
      fx.property("ADBE Drop Shadow-0003").setValue(dist);    // Distance
      fx.property("ADBE Drop Shadow-0004").setValue(soft);    // Softness
    } catch (e) {
      // Fallback: Layer Style Drop Shadow
      try {
        var ls = layer.layerStyles;
        var ds = ls.addProperty("dropShadow");
        ds.property("opacity").setValue(op);
        ds.property("color").setValue(white);
        ds.property("distance").setValue(dist);
        ds.property("size").setValue(soft);
      } catch (_) {
        // not fatal – weiter ohne Schatten
      }
    }
  }

  // Haupt-Glass-Panel (ohne Medienbereich)
  var card = comp.layers.addShape(); card.name = "GlassCard";
  var rightW = 820, rightH = 560; // rechte Spalte (wie im Beispiel)
  var gap = 40;                   // Abstand vom Rand
  var mediaW = 1120, mediaH = 620; // linker Medienbereich (Loch)

  // 1) Rechter Glasbereich
  var grpRight = addRoundedRect(card, "CardRight", rightW, rightH, 36);
  addFill(grpRight, glassFill, 22); // 22% Fill → milchig
  addStroke(grpRight, glassStroke, 2, 14);
  // Positionieren via Transform-Gruppen-Anker
  grpRight.property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue([W - gap - rightW/2, 240 + rightH/2]);

  // 2) Untere Glasleiste (Pipeline)
  var barW = 1260, barH = 200;
  var grpBottom = addRoundedRect(card, "CardBottom", barW, barH, 28);
  addFill(grpBottom, glassFill, 18);
  addStroke(grpBottom, strokeSoft, 2, 10);
  grpBottom.property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue([gap + barW/2, H - gap - barH/2]);

  // sanftes Glühen
  dropShadow(card, 10, 40, 20);

  // Titel & Inhalte (rechte Spalte)
  var xR = W - gap - rightW + 36;
  var yR = 220;
  addText("Termin-Dispatcher", 64, textBright, xR, yR);
  addText("KI füllt frei gewordene Termine automatisch", 28, textDim, xR, yR + 70);

  // KPI-Reihe
  function kpi(label, value, x, y){
    addText(label, 20, textDim, x, y);
    addText(value, 34, textBright, x, y+30);
  }
  var kx = xR, ky = yR + 120, dx = 240;
  kpi("Abgesagte Termine (letzte 24h)", "17", kx, ky);
  kpi("Wartelisten-Patienten", "42", kx+dx, ky);
  kpi("Freie Slots heute", "9", kx+2*dx, ky);

  // Beschreibung
  var desc = "Bei Absage ruft die KI automatisch den nächsten passenden Patienten von der Warteliste an und belegt den Slot – ohne Wartezeit.";
  addText(desc, 20, textDim, xR, ky + 110);

  // Buttons (Pills)
  function pill(label, x, y){
    var s = comp.layers.addShape(); s.name = label+"_pill";
    var g = addRoundedRect(s, "pill", 220, 56, 28);
    addFill(g, pillBg, 20); addStroke(g, white, 2, 18);
    g.property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue([x+110, y+28]);
    addText(label, 20, textBright, x+24, y+16);
    dropShadow(s, 6, 24, 18);
  }
  pill("Wartenden anrufen", xR, ky + 170);
  pill("Vorschau", xR + 250, ky + 170);

  // Untere Pipeline-Karte (Beispielstatus)
  var px = gap + 40, py = H - gap - barH + 28;
  addText("Trail level", 18, textDim, px, py);
  addText("Estimated time", 18, textDim, px + barW - 320, py);
  addText("3 hr 15 min", 20, textBright, px + barW - 160, py-2, ParagraphJustification.RIGHT_JUSTIFY);

  // Linker Medienbereich – kein Shape: Hintergrund bleibt komplett sichtbar (Loch)
  // Optional: dünner Rahmen um das „Loch“ (nur Kontur)
  var media = comp.layers.addShape(); media.name = "MediaHoleOutline";
  var gM = addRoundedRect(media, "MediaHole", mediaW, mediaH, 48);
  addStroke(gM, strokeSoft, 2, 16);
  gM.property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue([gap + mediaW/2, 260 + mediaH/2]);
  dropShadow(media, 8, 36, 14);

  app.endUndoGroup();
})();


