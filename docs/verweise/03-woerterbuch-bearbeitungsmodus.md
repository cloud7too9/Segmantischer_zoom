# Wörterbuch und Bearbeitungsmodus

Stand: 06.10.2026 · rekonstruiert aus einem verlorenen Gespräch

## Wörterbuch

- Ein **eigener Bereich** in der Anwendung.
- Die **zentrale Quelle** für alle Begriffe und Themengebiete samt ihren Definitionen.
- Die Pflege geschieht **zur Laufzeit über die grafische Oberfläche**. Für ein neues Themengebiet oder einen neuen Begriff muss kein Code angefasst werden.
- Die Erkennungslogik (siehe `02-erkennungslogik.md`) baut ihren Index aus dem Wörterbuch.

## Bearbeitungsmodus

- Zeigt **am gerenderten Text**, welche Wörter erkannt wurden und wo Verweise eingebaut werden.
- Zweck: Fehlerkennungen und übersehene Varianten sofort sehen, z. B. ein Adjektiv, das fälschlich als Begriff markiert wurde, oder eine Beugungsform, die nicht erkannt wurde.
- Vorschlag: unterschiedliche Hervorhebung je Art, also eine Farbe für Themengebiet-Verweise und eine andere für Begriffs-Verweise.

## Korrekturen laufen über das Wörterbuch

Entschieden: Es gibt **keine Ja/Nein-Entscheidungen pro Textstelle**. Wird etwas falsch oder gar nicht erkannt, wird der Eintrag im Wörterbuch angelegt oder angepasst. Der Bearbeitungsmodus ist die Sicht zum Prüfen. Die eigentliche Pflege passiert im Wörterbuch.

## Nächster Schritt

**Das Datenmodell eines Wörterbucheintrags festlegen**, also welche Felder ein Eintrag braucht, damit die Erkennung zuverlässig funktioniert. Kandidaten aus der bisherigen Diskussion sind Art (Begriff oder Themengebiet), Wort, Lemma, Wortart und Definition.
