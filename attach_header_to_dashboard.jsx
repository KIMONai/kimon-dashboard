/*
  After Effects ExtendScript – Header & Liste an Dashboard-Bewegung anheften
  - Erzeugt eine Master-Komposition und fügt `Header_Design` und `Telefonliste_Design` als Precomps ein
  - Erstellt ein Null `Dashboard_CTRL` und parentet beide Layer daran → eine Bewegung steuert alles

  Nutzung:
  - AE → File → Scripts → Run Script File… → diese Datei wählen
  - Voraussetzung: Kompositionen `Header_Design` und `Telefonliste_Design` existieren (durch die anderen Skripte)
*/

(function AttachHeaderAndList(){
  app.beginUndoGroup("Attach Header & List");

  var proj = app.project || app.newProject();

  function findComp(name){
    for (var i=1;i<=proj.numItems;i++){
      var it = proj.item(i);
      if (it instanceof CompItem && it.name === name) return it;
    }
    return null;
  }

  var headerComp = findComp("Header_Design");
  var listComp   = findComp("Telefonliste_Design");
  if (!headerComp || !listComp) { alert("Bitte zuerst die Skripte für Header und Telefonliste ausführen."); app.endUndoGroup(); return; }

  var W = 1920, H = 1080;
  var DUR = Math.max(headerComp.duration, listComp.duration);
  var main = proj.items.addComp("Dashboard_MAIN", W, H, 1.0, DUR, 30);

  // Hintergrund (schwarz)
  main.layers.addSolid([0,0,0], "Background", W, H, 1);

  // Precomps platzieren
  var headerLayer = main.layers.add(headerComp);
  var listLayer   = main.layers.add(listComp);

  // Positionen anhand Quellhöhen
  var headerH = headerComp.height; // erwartet 200
  headerLayer.property("Position").setValue([W/2, headerH/2]);

  var margin = 24; // Abstand zwischen Header und Liste
  var listY = headerH + margin + listComp.height/2;
  listLayer.property("Position").setValue([W/2, listY]);

  // Null-Controller als Parent
  var ctrl = main.layers.addNull();
  ctrl.name = "Dashboard_CTRL";
  ctrl.source.width = W; ctrl.source.height = H; // groß, damit gut anklickbar
  ctrl.property("Position").setValue([W/2, H/2]);

  headerLayer.parent = ctrl;
  listLayer.parent   = ctrl;

  // Optional: einfache Einfahr-Animation über das Null
  var p = ctrl.property("Position");
  var t0 = 0, t1 = 0.8;
  var startPos = [W/2, H/2 + 80];
  p.setValueAtTime(t0, startPos);
  p.setValueAtTime(t1, [W/2, H/2]);
  ctrl.property("Opacity").setValueAtTime(t0, 0);
  ctrl.property("Opacity").setValueAtTime(t1, 100);

  app.endUndoGroup();
})();



