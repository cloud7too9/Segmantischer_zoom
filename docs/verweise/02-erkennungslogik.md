# Erkennungslogik für Verweise

Stand: 06.10.2026 · rekonstruiert aus einem verlorenen Gespräch

## Ziel

Texte werden einfach heruntergeschrieben. Es soll **keine manuelle Markierung** von Begriffen oder Themengebieten nötig sein. Das System erkennt selbst, welche Wörter bereits im Wörterbuch stehen, und baut daraus automatisch Verweise.

## Zeitpunkt: zur Anzeigezeit

Die Erkennung läuft **beim Rendern**, nicht einmalig beim Speichern des Textes. Ein neu angelegter Wörterbucheintrag wirkt damit sofort in allen bestehenden Texten.

## Das Kernproblem: Wortvarianten

Ein Begriff taucht im Text selten genau so auf, wie er im Wörterbuch steht:

- Groß- und Kleinschreibung
- Plural und Beugung („Datenbank“ → „Datenbanken“)
- Wortart: als Nomen oder als Adjektiv („Relation“ → „relationale“)

## Ansätze (von einfach nach robust)

1. **Exakte Textsuche:** Die Begriffe werden wörtlich im Text gesucht. Das scheitert sofort an den Varianten oben.
2. **Normalisierung über Lemmatisierung:** Jedes Wort wird vor dem Vergleich auf seine Grundform (Lemma) zurückgeführt. Aus „Datenbanken“ und „Datenbank“ wird dann jeweils `datenbank`. Für Deutsch kann z. B. spaCy mit dem deutschen Modell die Grundform und die Wortart bestimmen.
3. **Lemma + Wortart je Eintrag (robustester Ansatz):** Jeder Wörterbucheintrag speichert neben dem Wort auch sein Lemma und seine Wortart. Beim Rendern wird jedes Wort im Text lemmatisiert und gegen den Wörterbuch-Index abgeglichen.

## Offene Punkte

- **Lemmatisierung im Browser:** spaCy läuft in Python, der Stack ist aber Vite + React + TypeScript. Mögliche Wege sind eine JS-Bibliothek, eine Vorverarbeitung außerhalb des Browsers oder eine gepflegte Liste von Wortformen je Wörterbucheintrag. Das ist noch nicht entschieden.
- **Mehrwortbegriffe:** Wie werden Begriffe aus mehreren Wörtern erkannt (z. B. „relationale Datenbank“)?
- **Mehrdeutigkeit:** Was passiert, wenn ein Wort sowohl Begriff als auch Themengebiet ist?
