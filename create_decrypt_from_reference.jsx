/*
  After Effects ExtendScript – Decrypt aus Referenzdatei (Format exakt beibehalten)
  - Liest den Code aus code_snippet_reference.txt
  - Rendert ihn als EINEN Textlayer (Monospace, Top-Left-Anker) → Zeilenumbrüche/Einrückungen bleiben 1:1 erhalten
  - Längere Decrypt-Animation über den gesamten Block
  - Fügt nacheinander eine gelbe Sprach-Textzeile an den Stellen von text: "..." ein

  Nutzung:
    AE → File → Scripts → Run Script File… → create_decrypt_from_reference.jsx
    Voraussetzung: Datei code_snippet_reference.txt liegt im selben Ordner
*/

(function CreateDecryptFromFile(){
  app.beginUndoGroup("Decrypt From Reference File");

  var proj = app.project || app.newProject();
  var W = 1920, H = 1080, FPS = 30, DUR = 12;
  var comp = proj.items.addComp("Decrypt_From_Reference", W, H, 1.0, DUR, FPS);

  // Farben
  var cardFill = [0.07,0.07,0.08];
  var cardStroke = [1,1,1];
  var codeCol = [0.73,0.77,0.82]; // hellgrau (gut lesbar)
  var stringCol = [0.93,0.77,0.55]; // strings (gelblich)
  var keywordCol = [0.78,0.57,0.92]; // keywords (lila)
  var commentCol = [0.41,0.44,0.59]; // comments (graublau)
  var funcCol = [0.51,0.67,1.00];     // funktionen (blau)

  // Layout
  var cardW = 1200, cardH = 480;
  var baseX = Math.floor(W/2 - cardW/2 + 36);
  var baseY = Math.floor(H/2 - cardH/2 + 68);
  var lh = 40;         // line-height
  var fontSize = 26;

  // Helpers
  function roundedRect(name, w, h, r){
    var s = comp.layers.addShape(); s.name = name;
    var g = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var rect = g.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w,h]);
    rect.property("ADBE Vector Rect Roundness").setValue(r||28);
    var fill = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(cardFill);
    var st = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    st.property("ADBE Vector Stroke Color").setValue(cardStroke);
    st.property("ADBE Vector Stroke Opacity").setValue(12);
    st.property("ADBE Vector Stroke Width").setValue(2);
    s.property("Position").setValue([W/2, H/2 + 20]);
    return s;
  }

  function addTextLayer(text, size, color){
    var t = comp.layers.addText(text);
    var td = t.property("Source Text").value;
    var candidates = ["Menlo-Regular","FiraCode-Regular","Monaco","Consolas","CourierNewPSMT"];
    for (var i=0;i<candidates.length;i++){ try{ td.font = candidates[i]; break; }catch(e){} }
    td.fontSize = size; td.applyFill = true; td.fillColor = color; td.justification = ParagraphJustification.LEFT_JUSTIFY;
    t.property("Source Text").setValue(td);
    // Top-Left-Anker
    t.property("Anchor Point").expression = 'var r=sourceRectAtTime(time,false); [r.left, r.top]';
    return t;
  }

  function measure(prefix){
    var tmp = addTextLayer(prefix, fontSize, codeCol);
    tmp.property("Position").setValue([baseX, baseY]);
    var w = tmp.sourceRectAtTime(0,false).width;
    try { tmp.remove(); } catch(e) { try { tmp.locked = false; tmp.enabled = false; tmp.name = "_measure"; } catch(_) {} }
    return w;
  }

  // Codekarte
  roundedRect("CodeCard", cardW, cardH, 28);

  // Referenzdatei lesen (robust relativ zum Skriptordner)
  var scriptFolder = File($.fileName).parent; // Ordner dieser JSX-Datei
  var f = new File(scriptFolder.fsName + "/code_snippet_reference.txt");
  if (!f.exists) {
    // Fallback: Nutzer wählen lassen
    f = File.openDialog("Bitte 'code_snippet_reference.txt' wählen");
    if (!f) { alert("Abgebrochen: Referenzdatei nicht gewählt."); app.endUndoGroup(); return; }
  }
  f.open('r'); var full = f.read(); f.close();

  // Codekarte
  roundedRect("CodeCard", cardW, cardH, 28);

  // 1) Decrypt-Layer (monochrom)
  var code = addTextLayer(full, fontSize, codeCol);
  code.name = "CodeDecrypt";
  code.property("Position").setValue([baseX, baseY]);
  // Keyframe-basierte Decrypt-Animation (ohne Expressions)
  function setDecryptKeys(layer, finalText, startTime, duration, steps){
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789#$%&*+-_/<>|";
    var td = layer.property("Source Text").value; // TextDocument
    function randChar(){ return chars.charAt(Math.floor(Math.random()*chars.length)); }
    for (var s=0; s<=steps; s++){
      var prog = s/steps;
      var reveal = Math.floor(prog * finalText.length);
      var out = "";
      for (var i=0; i<finalText.length; i++){
        var c = finalText.charAt(i);
        if (c === "\n" || c === "\r" || c === " ") { out += c; continue; }
        out += (i < reveal) ? c : randChar();
      }
      td.text = out;
      layer.property("Source Text").setValueAtTime(startTime + prog*duration, td);
    }
  }
  setDecryptKeys(code, full, 0.0, 2.2, 26);

  // 2) Statischer Code in Farbe (format 1:1) – wird nach Decrypt eingeblendet
  var staticCode = addTextLayer(full, fontSize, codeCol);
  staticCode.name = "CodeStaticBase";
  staticCode.property("Position").setValue([baseX, baseY]);
  staticCode.opacity.setValueAtTime(0.0, 0);
  staticCode.opacity.setValueAtTime(2.2, 0);
  staticCode.opacity.setValueAtTime(2.6, 100);

  // Syntax-Highlight-Overlays (Strings, Comments, Keywords, Funktionen)
  var lines = full.split('\n');
  function addSpan(lineIdx, colStart, text, color){
    var prefix = lines[lineIdx].substring(0, colStart);
    var x = baseX + measure(prefix);
    var y = baseY + lineIdx * lh;
    var tSpan = addTextLayer(text, fontSize, color);
    tSpan.property("Position").setValue([x, y]);
    tSpan.opacity.setValueAtTime(0.0, 0);
    tSpan.opacity.setValueAtTime(2.2, 0);
    tSpan.opacity.setValueAtTime(2.6, 100);
  }
  // Strings ("..." and '...')
  for (var li=0; li<lines.length; li++){
    var s = lines[li];
    var i = 0;
    while (i < s.length){
      var ch = s.charAt(i);
      if (ch == '"' || ch == "'"){
        var q = ch; var j = i+1; var buf = ch;
        while (j < s.length && s.charAt(j) != q){ buf += s.charAt(j); j++; }
        if (j < s.length){ buf += q; addSpan(li, i, buf, stringCol); i = j+1; continue; }
      }
      i++;
    }
  }
  // Kommentare // ...
  for (var li=0; li<lines.length; li++){
    var s = lines[li];
    var cidx = s.indexOf('//');
    if (cidx >= 0){ addSpan(li, cidx, s.substring(cidx), commentCol); }
  }
  // Keywords (import, from, const, new, await)
  var kw = ['import','from','const','new','await','return'];
  for (var li=0; li<lines.length; li++){
    var s = lines[li];
    for (var k=0;k<kw.length;k++){
      var rx = new RegExp('\\b'+kw[k]+'\\b');
      var m = s.match(rx);
      if (m){ addSpan(li, m.index, m[0], keywordCol); }
    }
  }
  // Funktionen / Klassen (KimonClient, play)
  var fn = ['KimonClient','play'];
  for (var li=0; li<lines.length; li++){
    var s = lines[li];
    for (var k=0;k<fn.length;k++){
      var rx = new RegExp('\\b'+fn[k]+'\\b');
      var m = s.match(rx);
      if (m){ addSpan(li, m.index, m[0], funcCol); }
    }
  }

  // Crossfade: Decrypt → Farbe
  code.opacity.setValueAtTime(0.0, 100);
  code.opacity.setValueAtTime(2.2, 100);
  code.opacity.setValueAtTime(2.6, 0);

  app.endUndoGroup();
})();


