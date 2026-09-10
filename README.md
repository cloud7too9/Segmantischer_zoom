# Wissensmatrix

Zoomable User Interface mit semantischem Zoom für strukturiertes IT-Wissen.
Zwei Universen: Datenbanken und Linux-Server.

**Status:** v0.4.0 — Datenbanken: PostgreSQL, SQLite und MongoDB vollständig,
Redis als Steckbrief. Linux-Server: /etc, /var und die Kernel-Schnittstellen
bis auf die Blattebene, die übrigen sechs Cluster als Steckbrief
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
npm run probe      # beide Universen gegen die Baumlogik
npm run probe:linux    # nur das Universum Linux-Server
npm run build      # nur Typprüfung + Build
```

## Nutzung / Start

```
npm run dev
```

Klick auf eine Kachel zoomt hinein, <kbd>Esc</kbd> oder die Brotkrume
zoomen heraus. Jeder Zustand ist eine eigene URL. Auf der obersten Ebene
steht die Wahl des Universums — ein Sprung zur Seite, keine Ebene darüber.

## Funktionen & Architektur

| Verzeichnis | Aufgabe |
|---|---|
| `src/kern/` | Typen, Registry, Baumberechnung, Pfad, Routing, Laden |
| `src/ansicht/` | Zoomfläche, Ebenen-Renderer, Kachel, Brotkrume, Inhaltsblock |
| `src/inhalt/datenbanken/` | Universum Datenbanken, je Träger eine Datei |
| `src/inhalt/linux/` | Universum Linux-Server, je Cluster eine Datei |
| `src/stile/` | Designtokens und Übergangsmechanik |
| `proben/` | Je Universum eine Probe gegen die Baumlogik |

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

## Die beiden Universen

**Datenbanken** — vier Achsen: Typ, Träger, Facette, Konzept. Die Facetten
sind hier eine eigene Zoomebene.

**Linux-Server** — drei Achsen, vier Ebenen:

| Ebene | Achse | Was dort steht | Beispiel |
|---|---|---|---|
| 1 | — | das Universum | Linux-Server |
| 2 | `cluster` | die Wurzelverzeichnisse, nach Zweck gebündelt | Konfiguration (`/etc`) |
| 3 | `verzeichnis` | ein Unterverzeichnis daraus | `/etc/ssh` |
| 4 | `datei` | das Informationsblatt einer Datei | `sshd_config` |

Der FHS kennt achtzehn Wurzelverzeichnisse — zu viele für eine Ebene
(Regel Nr. 2). Neun Cluster bündeln sie nach Zweck, vollständig und
überschneidungsfrei; die Probe prüft das nach.

Das Facettenschema ist hier keine Zoomachse, sondern die feste Rubrik jedes
Informationsblatts: Zweck, Format, Beispielinhalt, Einordnung, Sicherheit,
Betrieb. Durchgesetzt wird sie vom Baukasten — ein Blatt ohne Format oder
ohne Beispielinhalt lässt sich nicht anlegen. Die drei Facetten mit `imKern`
tragen dieselben Kennungen wie im Universum Datenbanken; das ist der
Belastungstest aus Regel Nr. 23.

Bezugssystem der Inhalte ist ein Debian/Ubuntu-Server mit systemd.

## Daten & Speicherung

Inhalte liegen statisch im Bündel. `localStorage` hält nur ein Merkmal
je Universum: ob der Erstbesuch schon stattgefunden hat. Welche Gruppe dann
vorbelegt wird, steht als `erstbesuchGruppe` am Universum — SQL bei den
Datenbanken, „überlebt den Neustart" beim Linux-Server.

## Abhängigkeiten

React 18, Vite 5, TypeScript 5. Kein CSS-Framework — reine Custom Properties.

## Roadmap / Ausblick

1. Die sechs verbliebenen Linux-Cluster ausarbeiten — zuerst `/usr` und die
   Benutzerdaten, weil beide auf Servern täglich gebraucht werden
2. MySQL/MariaDB und Microsoft SQL Server — die relationale Familie vervollständigen
3. Cassandra, Elasticsearch, Neo4j, InfluxDB, CouchDB — die Modelle, die das
   Facettenschema wirklich stressen
4. Suchindex und Befehlspalette (Strg+K) als Nachschlage-Zugang — mit zwei
   Universen wird die gebietsübergreifende Bündelung erstmals prüfbar
5. Geteilte Knoten (Kern plus Overlay) tatsächlich einsetzen: TLS und
   Zugriffsrechte berühren beide Universen
6. Kontinuierlicher Übergang zwischen zwei Ebenen — hinter Flag, auf eigenem Branch

Offen für später: ein eigener Typ für analytisch-spaltenorientierte Datenbanken
(ClickHouse, DuckDB), sobald ein Vertreter dafür da ist. Die Typenebene liegt
dann bei zehn Kacheln und verletzt Regel 2 — das ist dann zu entscheiden, nicht
jetzt vorwegzunehmen.

## Lizenz

offen
