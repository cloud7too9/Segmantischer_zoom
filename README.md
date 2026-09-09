# Wissensmatrix

Zoomable User Interface mit semantischem Zoom für strukturiertes IT-Wissen.
Erstes Universum: Datenbanken.

**Status:** v0.3.0 — PostgreSQL, SQLite und MongoDB vollständig; Redis als Steckbrief
**Typ:** Web-App (Vite + React + TypeScript)

Die Idee, das Modell und das vollständige Regelwerk stehen in `KONZEPT.md`.
Verweise wie „README Nr. 8" in den Quelldateien zeigen dorthin.

## Voraussetzungen

Node.js 18 oder neuer.

## Installation

```
npm install
```

## Build / Vorbereitung

```
npm run pruefe     # Proben + Typprüfung + Build — vor jedem Commit
npm run probe      # nur die Baumproben
npm run build      # nur Typprüfung + Build
```

## Nutzung / Start

```
npm run dev
```

Klick auf eine Kachel zoomt hinein, <kbd>Esc</kbd> oder die Brotkrume
zoomen heraus. Jeder Zustand ist eine eigene URL.

## Funktionen & Architektur

| Verzeichnis | Aufgabe |
|---|---|
| `src/kern/` | Typen, Registry, Baumberechnung, Pfad, Routing, Laden |
| `src/ansicht/` | Zoomfläche, Ebenen-Renderer, Kachel, Brotkrume, Inhaltsblock |
| `src/inhalt/` | Universumsdefinitionen und Knoten, je Träger eine Datei |
| `src/stile/` | Designtokens und Übergangsmechanik |
| `proben/` | Proben gegen die Baumlogik |

Tragende Punkte:

- **Ein Ebenen-Renderer** für jede Zoomstufe, ohne Sonderfall für die Wurzel
- **Der Baum wird berechnet**, nicht gespeichert — aus den Koordinaten der Knoten
- **Der Zustand ist der Pfad** — Deep Links, Zurück-Button und Brotkrume ohne Zusatzcode
- **Der Übergang läuft über eine einzige CSS-Variable** `--zoom-t`; hinein und heraus sind exakt invers

## Datenmodell / Konfiguration

Ein Knoten hat Koordinaten, keine Position:

```ts
{
  id: 'mongodb',
  heimat: 'datenbanken',
  koordinate: { typ: 'dokument', traeger: 'mongodb' },
  kern: { … },
  overlays: { … }   // erweitern nie widersprechen
}
```

`universum.achsen` legt die Matrix fest. Wird die Liste umsortiert, entsteht
aus denselben Knoten ein anderer Baum — die Probe `Andere Achsenreihenfolge`
sichert das ab.

## Daten & Speicherung

Inhalte liegen statisch im Bündel. `localStorage` hält nur ein Merkmal:
ob der Erstbesuch schon stattgefunden hat (Vorbelegung des SQL-Filters).

## Abhängigkeiten

React 18, Vite 5, TypeScript 5. Kein CSS-Framework — reine Custom Properties.

## Roadmap / Ausblick

1. MySQL/MariaDB und Microsoft SQL Server — die relationale Familie vervollständigen
2. Cassandra, Elasticsearch, Neo4j, InfluxDB, CouchDB — die Modelle, die das
   Facettenschema wirklich stressen
3. Suchindex und Befehlspalette (Strg+K) als Nachschlage-Zugang
4. Zweites Universum als Belastungstest des Facettenkerns
5. Kontinuierlicher Übergang zwischen zwei Ebenen — hinter Flag, auf eigenem Branch

Offen für später: ein eigener Typ für analytisch-spaltenorientierte Datenbanken
(ClickHouse, DuckDB), sobald ein Vertreter dafür da ist. Die Typenebene liegt
dann bei zehn Kacheln und verletzt Regel 2 — das ist dann zu entscheiden, nicht
jetzt vorwegzunehmen.

## Lizenz

offen
