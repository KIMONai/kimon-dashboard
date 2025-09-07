### Telefon-KI Dashboard (dark UI) – Anleitung

Diese Dateien wurden erstellt:
- `create_dashboard.jsx` – Script, das in After Effects ein fertiges Dashboard-Projekt erzeugt
- Ausgabe: `TelefonKI_Dashboard.aep` auf dem Desktop im Ordner `Cursor-Spielereien`

#### Voraussetzungen
- Adobe After Effects CC 2020 oder neuer
- Schriftart empfohlen: "Fira Code" (alternativ jede Monospace-Schrift)

#### Ausführen
1. After Effects öffnen
2. Menü: File → Scripts → Run Script File…
3. `create_dashboard.jsx` auswählen (im Ordner `Cursor-Spielereien`)
4. Das Projekt wird erzeugt und automatisch gespeichert als `TelefonKI_Dashboard.aep`

#### Inhalt des Dashboards
- Schwarzer Hintergrund, dezentes Grid, keine Titel/Firmenbezeichnung
- Linke Sidebar mit generischer Navigation
- KPI-Panel (Aktive Leitungen, Antwortzeit, Erfolgsquote)
- Anruf-Log mit Beispielzeilen (inkl. `[amazed]`, `[excited]` Markern im ElevenLabs-Stil)
- Sprachen-Widget: Balken + Grid für "90/90 Sprachen"
- Subtile Fade-In-Animationen

#### Anpassungen in AE
- Farben: über jeweilige Shape-Layer Fill anpassen
- Texte: Doppelklick auf Text-Layer → Inhalt ändern
- Layout: Shape-Layer Größe/Position (Rect Size/Position) ändern
- Dauer/FPS: Komposition `TelefonKI_Dashboard` anpassen

#### Export
- Composition → Add to Render Queue / Media Encoder

Viel Erfolg beim Animieren!


