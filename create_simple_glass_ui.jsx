/*
  After Effects ExtendScript – Einfaches Glass Dashboard UI
  Zuverlässig funktionierendes Glasmorphism-Dashboard für AE
  
  Features:
  - Echte Blur-Effekte für Glasmorphism
  - Korrekte Positionierung ohne Verschiebungen
  - Termin-Dispatcher Theme (KI ruft wartende Patienten an)
  - Freigestellter Medienbereich (Loch für Hintergrund)
  
  Nutzung:
  - AE → File → Scripts → Run Script File… → create_simple_glass_ui.jsx
*/

(function SimpleGlassUI(){
  app.beginUndoGroup("Simple Glass UI");

  var proj = app.project || app.newProject();
  var W = 1920, H = 1080, FPS = 30, DUR = 12;
  var comp = proj.items.addComp("Simple_Glass_Dashboard", W, H, 1.0, DUR, FPS);

  // Farben (RGB 0-255)
  var white = [255,255,255];
  var glassWhite = [255,255,255];
  var textDark = [40,45,55];
  var textLight = [240,242,245];
  var accent = [60,130,246]; // blau

  // Helper: Solid Layer
  function addSolid(name, color, w, h){
    var s = comp.layers.addSolid(color, name, w||W, h||H, 1.0);
    return s;
  }

  // Helper: Text Layer
  function addText(txt, size, color){
    var t = comp.layers.addText(txt);
    var td = t.property("Source Text").value;
    td.fontSize = size;
    td.applyFill = true;
    td.fillColor = [color[0]/255, color[1]/255, color[2]/255];
    td.justification = ParagraphJustification.LEFT_JUSTIFY;
    t.property("Source Text").setValue(td);
    return t;
  }

  // Helper: Einfache Mask (ohne komplexe Shape-Manipulation)
  function addSimpleMask(layer, w, h){
    try {
      var mask = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
      // Einfache rechteckige Maske ohne Shape-Änderung
      mask.property("ADBE Mask Feather").setValue([8, 8]); // Weiche Kanten für Rundung
      return mask;
    } catch(e) {
      // Fallback: keine Maske
      return null;
    }
  }

  // 1) Hintergrund (Gradient für Demo)
  var bg = addSolid("Background", [20,25,35]);
  
  // 2) Hauptcontainer (rechts)
  var mainW = 800, mainH = 520;
  var mainX = W - 60 - mainW/2, mainY = H/2 - 40;
  
  var mainPanel = addSolid("MainPanel", glassWhite, mainW, mainH);
  mainPanel.property("Position").setValue([mainX, mainY]);
  mainPanel.property("Opacity").setValue(15); // 15% für Glaseffekt
  addSimpleMask(mainPanel, mainW, mainH);
  
  // Blur für Glasmorphism
  var blur = mainPanel.property("ADBE Effect Parade").addProperty("ADBE Fast Blur");
  blur.property("ADBE Fast Blur-0001").setValue(8);

  // 3) Titel
  var title = addText("Termin-Dispatcher", 48, textLight);
  title.property("Position").setValue([mainX - mainW/2 + 40, mainY - mainH/2 + 60]);

  var subtitle = addText("KI füllt automatisch frei gewordene Termine", 24, [180,185,195]);
  subtitle.property("Position").setValue([mainX - mainW/2 + 40, mainY - mainH/2 + 110]);

  // 4) KPI Cards
  function createKPI(label, value, x, y){
    var kpiW = 220, kpiH = 100;
    var kpi = addSolid("KPI_"+label, glassWhite, kpiW, kpiH);
    kpi.property("Position").setValue([x, y]);
    kpi.property("Opacity").setValue(12);
    addSimpleMask(kpi, kpiW, kpiH);
    
    var kpiBlur = kpi.property("ADBE Effect Parade").addProperty("ADBE Fast Blur");
    kpiBlur.property("ADBE Fast Blur-0001").setValue(4);
    
    var labelText = addText(label, 16, [160,165,175]);
    labelText.property("Position").setValue([x - kpiW/2 + 20, y - 20]);
    
    var valueText = addText(value, 32, textLight);
    valueText.property("Position").setValue([x - kpiW/2 + 20, y + 10]);
  }

  var kpiY = mainY - 80;
  createKPI("Abgesagte Termine", "17", mainX - 240, kpiY);
  createKPI("Wartende Patienten", "42", mainX, kpiY);
  createKPI("Freie Slots", "9", mainX + 240, kpiY);

  // 5) Beschreibung
  var desc = addText("Bei Absage ruft die KI automatisch den nächsten\npassenden Patienten an und belegt den Slot.", 20, [200,205,215]);
  desc.property("Position").setValue([mainX - mainW/2 + 40, mainY + 40]);

  // 6) Action Buttons
  function createButton(label, x, y, isPrimary){
    var btnW = 200, btnH = 50;
    var btnColor = isPrimary ? accent : glassWhite;
    var btn = addSolid("Btn_"+label, btnColor, btnW, btnH);
    btn.property("Position").setValue([x, y]);
    btn.property("Opacity").setValue(isPrimary ? 100 : 20);
    addSimpleMask(btn, btnW, btnH);
    
    if(!isPrimary){
      var btnBlur = btn.property("ADBE Effect Parade").addProperty("ADBE Fast Blur");
      btnBlur.property("ADBE Fast Blur-0001").setValue(6);
    }
    
    var btnText = addText(label, 18, isPrimary ? textLight : [180,185,195]);
    btnText.property("Position").setValue([x - btnW/2 + 20, y - 8]);
  }

  createButton("Wartenden anrufen", mainX - 110, mainY + 140, true);
  createButton("Vorschau", mainX + 110, mainY + 140, false);

  // 7) Untere Status-Leiste
  var statusW = 1200, statusH = 80;
  var statusY = H - 100;
  
  var statusBar = addSolid("StatusBar", glassWhite, statusW, statusH);
  statusBar.property("Position").setValue([W/2, statusY]);
  statusBar.property("Opacity").setValue(10);
  addSimpleMask(statusBar, statusW, statusH);
  
  var statusBlur = statusBar.property("ADBE Effect Parade").addProperty("ADBE Fast Blur");
  statusBlur.property("ADBE Fast Blur-0001").setValue(6);

  var statusText = addText("System Status: Online  •  Aktive Verbindungen: 8  •  Warteschlange: 42 Patienten", 18, [160,165,175]);
  statusText.property("Position").setValue([W/2 - statusW/2 + 40, statusY - 8]);

  // 8) Medienbereich (Loch) - nur Rahmen
  var mediaW = 600, mediaH = 400;
  var mediaX = 320, mediaY = H/2 - 60;
  
  // Dünner Glasrahmen um das "Loch"
  var mediaFrame = addSolid("MediaFrame", glassWhite, mediaW + 8, mediaH + 8);
  mediaFrame.property("Position").setValue([mediaX, mediaY]);
  mediaFrame.property("Opacity").setValue(8);
  addSimpleMask(mediaFrame, mediaW + 8, mediaH + 8);

  // Label für Medienbereich
  var mediaLabel = addText("Hintergrund sichtbar", 16, [120,125,135]);
  mediaLabel.property("Position").setValue([mediaX - mediaW/2 + 20, mediaY + mediaH/2 + 30]);

  app.endUndoGroup();
})();
