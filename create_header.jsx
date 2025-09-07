/*
  After Effects ExtendScript – Header mit Menüleisten
  Menüeinträge: Dashboard, Outbound, Customization, Stats
  Monochrom, dunkles Design, gleicher Schriftstil (Monospace-Fallbacks)

  Nutzung:
  - After Effects → File → Scripts → Run Script File… → diese Datei wählen
  - Erstellt Komposition "Header_Design" (1920x200)
*/

(function CreateHeader() {
  app.beginUndoGroup("Header erstellen");

  var proj = app.project || app.newProject();
  var W = 1920, H = 200, DUR = 12;
  var comp = proj.items.addComp("Header_Design", W, H, 1.0, DUR, 30);

  // Farben (monochrom dunkel)
  var bg = [0,0,0];
  var bar = [12/255,12/255,14/255];
  var stroke = [36/255,36/255,38/255];
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
    rect.property("ADBE Vector Rect Roundness").setValue(r||0);
    var fill = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(color);
    return s;
  }

  // Header-Bar
  var barH = 116;
  var header = roundedRect("HeaderBar", W, barH, bar, 0);
  header.property("Position").setValue([W/2, barH/2]);
  var bottomStroke = roundedRect("HeaderStroke", W, 1, stroke, 0);
  bottomStroke.property("Position").setValue([W/2, barH]);
  bottomStroke.opacity.setValue(70);

  // Menüeinträge
  var items = ["Dashboard","Outbound","Customization","Stats"];
  var M = 60; // linker Rand
  var gap = 220; // Abstand zwischen Einträgen
  var y = 70;

  function menuItem(label, x, active){
    var col = active ? textBright : textDim;
    var t = addText(label, 28, col, [x, y], ParagraphJustification.LEFT_JUSTIFY);
    if (active) {
      // dezente Unterstreichung
      var ul = roundedRect(label+"_underline", label.length*12, 2, textBright, 0);
      ul.property("Position").setValue([x + (label.length*6), y+18]);
      ul.opacity.setValue(70);
    }
    return t;
  }

  var x0 = M;
  for (var i=0;i<items.length;i++) {
    menuItem(items[i], x0 + i*gap, i===0); // erstes Item als aktiv
  }

  app.endUndoGroup();
})();



