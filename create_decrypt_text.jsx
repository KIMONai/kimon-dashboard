/*
  After Effects ExtendScript – Decrypting Text Animation (Code-Stil)

  Erzeugt eine Komposition mit API-ähnlichem Codesnippet und
  animierten Text-Strings, die kurz verschlüsselt (scramble) starten
  und sich dann entziffern (decrypt).

  Nutzung:
    - AE → File → Scripts → Run Script File… → diese Datei wählen
    - Komposition: "Decrypt_Snippet"

  Anpassungen unten bei texts[] und Layout-Konstanten möglich.
*/

(function CreateDecryptText(){
  app.beginUndoGroup("Create Decrypt Text");

  var proj = app.project || app.newProject();
  var W = 1920, H = 1080, FPS = 30, DUR = 10;
  var comp = proj.items.addComp("Decrypt_Snippet", W, H, 1.0, DUR, FPS);

  // Farben (wie in den Referenz-PNGs, VSCode/Prism-ähnlich)
  var bg = [0,0,0];
  var codeGray = [0.65,0.68,0.72];          // Standard
  var commentCol = [0.41,0.44,0.59];        // Kommentar
  var keywordCol = [0.78,0.57,0.92];        // Keywords (import, from, const, await)
  var identCol = [0.65,0.70,0.80];          // Variablen/Objekte
  var funcCol = [0.51,0.67,1.00];           // Funktionen
  var stringCol = [0.76,0.91,0.55];         // Strings (#c3e88d)
  var punctCol = [0.36,0.39,0.44];          // Klammern/Kommas

  // Hintergrund (nur falls gebraucht)
  comp.layers.addSolid(bg, "Background", W, H, 1.0).opacity.setValue(0); // unsichtbar; Panel existiert extern

  // Code-Card (größer, mit Rundung)
  function roundedRect(name, w, h, color, r){
    var s = comp.layers.addShape(); s.name = name;
    var g = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    g.name = name + " Group";
    var rect = g.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w,h]);
    rect.property("ADBE Vector Rect Roundness").setValue(r||28);
    var fill = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue([0.07,0.07,0.08]);
    var st = g.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    st.property("ADBE Vector Stroke Color").setValue([1,1,1]);
    st.property("ADBE Vector Stroke Opacity").setValue(12);
    st.property("ADBE Vector Stroke Width").setValue(2);
    return s;
  }

  function addTextLayer(text, size, color, x, y, align){
    var t = comp.layers.addText(text);
    var td = t.property("Source Text").value;
    var candidates = ["FiraCode-Regular","Menlo-Regular","Monaco","Consolas","CourierNewPSMT"];
    for (var i=0;i<candidates.length;i++){ try{ td.font = candidates[i]; break; } catch(e){} }
    td.fontSize = size; td.applyFill = true; td.fillColor = color; td.justification = align || ParagraphJustification.LEFT_JUSTIFY;
    t.property("Source Text").setValue(td);
    t.property("Position").setValue([x,y]);
    return t;
  }

  // Kurze Decrypt-Animation für Codezeilen
  function addDecryptLine(lineText, size, color, x, y, inTime, duration){
    var t = addTextLayer("", size, color, x, y, ParagraphJustification.LEFT_JUSTIFY);
    t.inPoint = inTime; t.outPoint = DUR;
    var safe = (lineText+"").replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    var expr = ''+
      'var final = "' + safe + '";\n' +
      'var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789#$%&*+-_/<>|";\n' +
      'var pre = 0.00;\n' +
      'var dur = ' + (duration||0.45).toFixed(2) + ';\n' +
      'var t = time - inPoint;\n' +
      'function clamp01(v,a,b){return Math.min(b, Math.max(a, v));}\n' +
      'var prog = clamp01((t)/dur, 0, 1);\n' +
      'var reveal = Math.floor(prog * final.length);\n' +
      'function randChar(i){seedRandom(i + Math.floor(time*18), true); return chars.charAt(Math.floor(random(chars.length)));}\n' +
      'var out = "";\n' +
      'for (var i=0; i<final.length; i++){ var c = final.charAt(i); if (c===" ") {out+=" "; continue;} out += (i<reveal)?c:randChar(i);}\n' +
      'out;\n';
    t.property("Source Text").expression = expr;
    return t;
  }

  function addDecryptString(finalText, size, color, x, y, inTime, duration){
    var t = addTextLayer("", size, color, x, y, ParagraphJustification.LEFT_JUSTIFY);
    t.inPoint = inTime; t.outPoint = Math.max(inTime + duration + 0.5, inTime + 1.0);
    // Expression: Scramble → Decrypt (ohne JSON.stringify; sicherer Escape)
    var safe = (finalText+"").replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    var expr = ''+
      'var final = "' + safe + '";\n' +
      'var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789#$%&*+-_/<>|";\n' +
      'var pre = 0.08;            // Vorlauf Scramble (s)\n' +
      'var dur = ' + duration.toFixed(2) + ';  // Decrypt-Dauer (s)\n' +
      'var t = time - inPoint;\n' +
      'function clamp01(v,a,b){return Math.min(b, Math.max(a, v));}\n' +
      'var prog = clamp01((t - pre)/dur, 0, 1);\n' +
      'var reveal = Math.floor(prog * final.length);\n' +
      'function randChar(i){\n' +
      '  seedRandom(i + Math.floor(time*18), true);\n' +
      '  return chars.charAt(Math.floor(random(chars.length)));\n' +
      '}\n' +
      'var out = "";\n' +
      'for (var i=0; i<final.length; i++){\n' +
      '  var c = final.charAt(i);\n' +
      '  if (c === " ") { out += " "; continue; }\n' +
      '  out += (i < reveal) ? c : randChar(i);\n' +
      '}\n' +
      'out;\n';
    t.property("Source Text").expression = expr;
    return t;
  }

  // Layout
  var cardW = 1120, cardH = 420;
  var card = roundedRect("CodeCard", cardW, cardH, [0.07,0.07,0.08], 28);
  card.property("Position").setValue([W/2, H/2 + 30]);

  var baseX = Math.floor(W/2 - cardW/2 + 36);   // linke Einrückung im Card
  var baseY = Math.floor(H/2 - cardH/2 + 90);   // erste Codezeile im Card
  var lh = 40;                                   // line-height
  var codeSize = 26;
  var strSize = 26;

  // Hilfsfunktion: Top-Left-Anker für präzise Spans
  function setTopLeftAnchor(layer){
    layer.property("Anchor Point").expression = 'var r=sourceRectAtTime(time,false); [r.left, r.top]';
  }

  // Spans in einer Codezeile (mehrfarbig)
  function addCodeSpan(text, color, x, y, size){
    var t = addTextLayer(text, size||codeSize, color, 0, 0, ParagraphJustification.LEFT_JUSTIFY);
    setTopLeftAnchor(t);
    t.property("Position").setValue([x, y]);
    var r = t.sourceRectAtTime(0,false);
    return x + r.width; // next x
  }

  function addCodeLine(spans, y){
    var x = baseX;
    for (var i=0;i<spans.length;i++){
      x = addCodeSpan(spans[i][0], spans[i][1], x, y, spans[i][2]);
    }
    return x;
  }

  // Code-Skelett (statisch)
  // Mehrfarbige Codezeilen (statisch)
  // 1) import { KimonClient, play } from "@kimon/telephony-js";
  addCodeLine([
    ['import ', keywordCol],
    ['{ ', punctCol], ['KimonClient', funcCol], [', ', punctCol], ['play', funcCol], [' } ', punctCol],
    ['from ', keywordCol],
    ['"@kimon/telephony-js"', stringCol], [';', punctCol]
  ], baseY - 2*lh);

  // 2) const kimon = new KimonClient({ apiKey: process.env.KIMON_API_KEY });
  addCodeLine([
    ['const ', keywordCol], ['kimon', identCol], [' = ', punctCol], ['new ', keywordCol],
    ['KimonClient', funcCol], ['({ ', punctCol], ['apiKey', identCol], [': ', punctCol],
    ['process', identCol], ['.', punctCol], ['env', identCol], ['.', punctCol], ['KIMON_API_KEY', identCol],
    [' })', punctCol], [';', punctCol]
  ], baseY - 1*lh);

  // 3) await kimon.narration.play({ locale: 'de-DE', text: "" });
  var speechX1 = addCodeLine([
    ['await ', keywordCol], ['kimon', identCol], ['.', punctCol], ['narration', identCol], ['.', punctCol], ['play', funcCol],
    ['({ ', punctCol], ['locale', identCol], [': ', punctCol], ['\'de-DE\'', stringCol], [', ', punctCol], ['text', identCol], [': ', punctCol]
  ], baseY + 0*lh);
  addCodeSpan('""', stringCol, speechX1, baseY + 0*lh, strSize);
  addCodeSpan(' });', punctCol, speechX1 + 40, baseY + 0*lh, codeSize);

  // 4) // phonetic match → name
  addCodeLine([["// phonetic match → name", commentCol, codeSize-4]], baseY + 1*lh);

  // 5) await kimon.narration.play({ text: "" });
  var speechX2 = addCodeLine([
    ['await ', keywordCol], ['kimon', identCol], ['.', punctCol], ['narration', identCol], ['.', punctCol], ['play', funcCol],
    ['({ ', punctCol], ['text', identCol], [': ', punctCol]
  ], baseY + 2*lh);
  addCodeSpan('""', stringCol, speechX2, baseY + 2*lh, strSize);
  addCodeSpan(' });', punctCol, speechX2 + 40, baseY + 2*lh, codeSize);

  // Overlay-Decryption der Codezeilen (länger)
  var ct = 0.0;
  addDecryptLine('import { KimonClient, play } from "@kimon/telephony-js";', codeSize, codeGray, baseX, baseY - 2*lh, ct+0.00, 0.9);
  addDecryptLine('const kimon = new KimonClient({ apiKey: process.env.KIMON_API_KEY });', codeSize, codeGray, baseX, baseY - 1*lh, ct+0.15, 0.9);
  addDecryptLine('await kimon.narration.play({ locale: "de-DE", text: "" });', codeSize, codeGray, baseX, baseY + 0*lh, ct+0.30, 0.9);
  addDecryptLine('// phonetic match → name', codeSize-4, commentCol, baseX, baseY + 1*lh, ct+0.45, 0.7);
  addDecryptLine('await kimon.narration.play({ text: "" });', codeSize, codeGray, baseX, baseY + 2*lh, ct+0.60, 0.9);

  // Animierte Strings (decrypt)
  // Eine einzige Sprach-Zeile, die nacheinander erscheint (gleiche Position)
  var speechX = speechX1; // exakt am Ende des Prefixes
  var speechY1 = baseY + 0*lh;
  var speechY2 = baseY + 2*lh;

  var t0 = 1.4; // nach längerer Code-Decrypt-Phase
  var l1 = addDecryptString('"Lernen Sie Kimon kennen. Eine Plattform, die ihre Praxis rund die Uhr am Laufen hält."', strSize, stringCol, speechX, speechY1, t0, 0.8);
  l1.outPoint = 2.1; // endet bevor nächster beginnt

  var t1 = 2.1;
  var l2a = addDecryptString('"Kimons künstliche Intelligenz erkennt Anrufer mit absoluter Treffsicherheit über phonetische Namenserkennung"', strSize, stringCol, speechX - 260, baseY + 0*lh, t1, 1.0);
  l2a.outPoint = 3.5;
  // Phonetic Zusatzzeile direkt darunter
  var l2b = addDecryptString('phonetic: [/ˈkiːmɔn/ → "Kimon"]', strSize-2, stringCol, speechX - 420, baseY + 0.8*lh, t1+0.2, 0.6);
  l2b.outPoint = 3.5;

  var t2 = 3.5;
  var l3 = addDecryptString('"spricht in der Sprache des Patienten und vergibt Termine eigenständig."', strSize, stringCol, speechX - 120, speechY2, t2, 0.8);
  l3.outPoint = DUR;

  app.endUndoGroup();
})();


