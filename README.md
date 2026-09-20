# MindHub

> **Connecting Knowledge**

MindHub ist ein wissensorientiertes System zur strukturierten Erfassung, Verknüpfung, Navigation und Darstellung von Wissen.

Die zentrale Idee besteht darin, zwei scheinbar gegensätzliche Anforderungen in einem gemeinsamen Wissensmodell zu verbinden:

- **Nachschlagen:** Ein bekanntes Thema soll schnell und gezielt erreichbar sein.
- **Lernen:** Ein unbekanntes oder größeres Themengebiet soll zusammenhängend, ausführlich und explorativ durchlaufen werden können.

MindHub versucht daher nicht, zwischen einem klassischen Wiki und einem klassischen Fachbuch zu wählen. Stattdessen werden beide Nutzungsformen aus **demselben strukturierten Wissensbestand** erzeugt.

---

# 1. Zielsetzung

Technisches Wissen besitzt häufig mehrere Betrachtungsebenen.

Ein technisches System kann beispielsweise gleichzeitig aus Sicht der Softwareentwicklung, der Systemintegration, der Datenbankadministration oder des Netzbetriebs betrachtet werden.

Diese Perspektiven überschneiden sich teilweise, unterscheiden sich aber in ihren Fragestellungen und ihrem Detailwissen.

Ein Beispiel ist **PostgreSQL**.

### Grundsätzliches Wissen

- Was ist PostgreSQL?
- Was ist ein relationales Datenbankmanagementsystem?
- Was sind Tabellen?
- Was ist SQL?
- Was sind Transaktionen?

### Sicht der Softwareentwicklung

- Datenmodellierung
- Queries
- Transaktionen
- ORM
- Connection Pooling
- Migrationen
- API-Anbindung

### Sicht der Systemintegration

- Installation
- Dienstverwaltung
- Netzwerk
- Ports
- Benutzer und Berechtigungen
- Konfiguration
- Backup und Recovery
- Monitoring
- Updates

MindHub soll diese Informationen **nicht als voneinander isolierte Wissenssammlungen** behandeln.

Stattdessen wird ein gemeinsamer Wissensgegenstand beschrieben und um kontextabhängige Informationen ergänzt.

---

# 2. Die Kernidee: Wiki und Buch

MindHub kombiniert zwei klassische Formen der Wissensvermittlung.

## 2.1 Wiki-Modus – gezieltes Nachschlagen

Im Wiki-Modus kennt der Benutzer das gesuchte Thema bereits.

Beispielsweise:

> „Ich möchte etwas über PostgreSQL nachschlagen.“

Der Benutzer navigiert direkt zum entsprechenden Wissensgegenstand.

Dort werden die für diesen Gegenstand relevanten Informationen dargestellt.

Der Fokus liegt auf:

- schneller Orientierung
- direktem Zugriff
- relevanten Informationen
- Querverweisen
- gezielter Navigation

Der Benutzer muss nicht das gesamte Themengebiet durchlaufen.

---

## 2.2 Buch-Modus – zusammenhängendes Lernen

Im Lernmodus kennt der Benutzer möglicherweise noch nicht die konkrete Information, nach der er sucht.

Stattdessen möchte er ein Themengebiet verstehen.

Beispielsweise:

> „Ich möchte Datenbanken verstehen.“

Hier soll MindHub nicht nur einzelne Artikel anzeigen.

Der Benutzer kann sich durch das Themengebiet bewegen:

```text
Datenbanken
    ↓
Datenbankmodelle
    ↓
Relationale Datenbanken
    ↓
PostgreSQL
    ↓
Datenmodell
    ↓
Tabellen
    ↓
Relationen
    ↓
Transaktionen

21. Laufzeitfähiges Wissensmodell

Eine zentrale Voraussetzung für MindHub ist die Erweiterbarkeit zur Laufzeit.

MindHub soll nicht ausschließlich mit einem statisch im Quellcode definierten Wissensbestand funktionieren.

Die Anwendung stellt vielmehr das Wissensmodell, die Regeln und die Navigationslogik bereit, während die eigentlichen Wissensinhalte persistent gespeichert und zur Laufzeit erstellt, verändert und erweitert werden können.

Damit wird zwischen System und Wissensbestand unterschieden.

MindHub-Anwendung
│
├── Wissensmodell
├── Validierungsregeln
├── Navigationslogik
├── Darstellungslogik
└── API
        │
        ▼
   Wissensdatenbank
        │
        ├── Universen
        ├── Knoten
        ├── Eigenschaften
        ├── Inhalte
        ├── Beziehungen
        └── Kontextinformationen

Die Anwendung kennt damit nicht zwangsläufig jedes konkrete Thema.

Sie kennt die Regeln, wie ein Thema beschrieben werden kann.

⸻

22. Datenbank als persistenter Wissensbestand

Der Wissensbestand soll persistent in einer Datenbank gespeichert werden.

Die Datenbank ist dabei nicht lediglich ein technischer Speicher für statische Inhalte.

Sie bildet den veränderbaren Wissensbestand von MindHub.

Beispielsweise können folgende Informationen persistent gespeichert werden:

Universum
├── Identität
├── Name
├── Beschreibung
└── Konfiguration
Knoten
├── Identität
├── Bezeichnung
├── Koordinaten
├── Eigenschaften
└── Zugehörigkeit
Inhalt
├── Grundinformationen
├── Beschreibungen
├── Detailinformationen
└── kontextabhängige Inhalte
Beziehungen
├── Knoten ↔ Knoten
├── Knoten ↔ Universum
└── Knoten ↔ Kontext

Die konkrete Datenstruktur kann sich mit der Weiterentwicklung von MindHub verändern. Entscheidend ist die Trennung zwischen Datenmodell und konkreten Inhalten.

⸻

23. CRUD als Grundlage

Der Wissensbestand muss vollständig über grundlegende Datenoperationen verwaltbar sein.

MindHub benötigt daher insbesondere:

* Create – neue Wissensobjekte erstellen
* Read – vorhandene Wissensobjekte lesen
* Update – Wissensobjekte bearbeiten
* Delete – Wissensobjekte entfernen

Diese Operationen bilden die Grundlage für die Verwaltung des Wissensbestands.

Beispiel:

CREATE
    neues Thema „PostgreSQL“
READ
    PostgreSQL anzeigen
UPDATE
    Beschreibung von PostgreSQL ändern
DELETE
    Thema entfernen

Die CRUD-Ebene sollte dabei nicht direkt an die Benutzeroberfläche gekoppelt sein.

Die fachliche Manipulation erfolgt über eine zentrale API beziehungsweise eine entsprechende Serviceschicht.

UI
 │
 ▼
API
 │
 ▼
Domain / Services
 │
 ▼
Datenbank

Dadurch kann später neben der Weboberfläche auch eine andere Oberfläche auf denselben Wissensbestand zugreifen.

⸻

24. Laufzeit-Erweiterbarkeit

Ein wesentliches Ziel ist, dass die Erweiterung des Wissensbestands keine Änderung des Anwendungscodes erfordert.

Beispielsweise soll ein Benutzer nach der Installation von MindHub ein neues Thema anlegen können:

Datenbanken
    └── PostgreSQL

und später:

Datenbanken
    ├── PostgreSQL
    ├── MySQL
    └── Microsoft SQL Server

ohne dass dafür neue TypeScript-Dateien kompiliert oder neue Komponenten implementiert werden müssen.

Die Anwendung stellt lediglich die notwendigen Strukturen und Editiermöglichkeiten bereit.

⸻

25. Dynamische Universen

Auch Universen sollen langfristig nicht ausschließlich fest im Quellcode definiert sein.

Ein Universum kann selbst ein verwaltbares Wissensobjekt werden.

Beispielsweise:

Universen
├── Softwareentwicklung
├── Systemintegration
├── Datenbankadministration
└── Cloud Computing

Ein neues Universum kann dadurch perspektivisch über die Anwendung angelegt werden.

Neues Universum
        │
        ├── Name
        ├── Beschreibung
        ├── Achsen
        └── Konfiguration

Dadurch kann MindHub mit der persönlichen Wissensbasis wachsen.

⸻

26. Dynamische Knoten

Knoten sollen ebenfalls vollständig zur Laufzeit verwaltet werden können.

Ein neuer Knoten besteht nicht aus einer fest programmierten React-Komponente.

Stattdessen wird er als Datenobjekt angelegt.

Beispielsweise:

{
    id: "postgresql",
    bezeichnung: "PostgreSQL",
    koordinate: {
        typ: "datenbank",
        traeger: "postgresql"
    }
}

Die Anwendung interpretiert diese Daten und erzeugt daraus die entsprechende Darstellung.

Dadurch gilt:

Neue Inhalte sind Daten, kein neuer Programmcode.

⸻

27. Dynamische Eigenschaften

Auch Eigenschaften sollen grundsätzlich datengetrieben sein.

Ein Wissensgegenstand kann beispielsweise Eigenschaften besitzen wie:

PostgreSQL
Typ:
    relationales DBMS
Lizenz:
    PostgreSQL License
Entwicklungsmodell:
    Open Source
Abfragesprache:
    SQL

Die Eigenschaften gehören zum Wissensmodell und sollen nicht zwingend als feste Felder einer einzelnen UI-Komponente implementiert werden.

Damit können neue Eigenschaften ergänzt werden, ohne dass für jede neue Eigenschaft die gesamte Darstellung angepasst werden muss.

⸻

28. Grundinformationen und Kontextinformationen

Die Laufzeitverwaltung muss die bereits definierte Trennung zwischen allgemeinem und perspektivischem Wissen berücksichtigen.

Beispielsweise:

PostgreSQL
│
├── Grundinformationen
│   ├── Was ist PostgreSQL?
│   ├── Typ
│   └── grundlegende Eigenschaften
│
├── Softwareentwicklung
│   ├── ORM
│   ├── Connection Pooling
│   └── Migrationen
│
└── Systemintegration
    ├── Installation
    ├── Netzwerk
    └── Backup

Beim Bearbeiten eines Wissensgegenstands muss deshalb erkennbar sein, zu welchem Kontext eine Information gehört.

⸻

29. Datenmodell statt fest verdrahteter Inhalte

Eine zentrale Architekturregel lautet:

Der Code beschreibt das Wissenssystem. Die Datenbank beschreibt den aktuellen Wissensbestand.

Nicht:

Code
 └── PostgreSQL
      ├── SQL
      ├── Transaktionen
      └── ...

sondern:

Code
 └── beschreibt:
      ├── Was ist ein Knoten?
      ├── Was ist ein Universum?
      ├── Was ist eine Koordinate?
      ├── Wie wird eine Struktur berechnet?
      └── Wie werden Daten validiert?
Datenbank
 └── enthält:
      ├── PostgreSQL
      ├── SQL
      ├── Transaktionen
      ├── weitere Themen
      └── weitere Universen

Dadurch wird MindHub zu einer datengetriebenen Anwendung.

⸻

30. Bearbeitung und Navigation sind zwei Seiten desselben Modells

Die Benutzeroberfläche soll nicht zwischen einer „Ansicht“ und einer vollständig unabhängigen „Datenverwaltung“ unterscheiden.

Die Navigation zeigt den aktuellen Wissensbestand.

Der Editor verändert genau diesen Wissensbestand.

                  Wissensdatenbank
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
         Navigation               Editor
             │                       │
       „Was existiert?“       „Was soll existieren?“
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
                  gleicher Datenbestand

Wenn beispielsweise ein neuer Knoten erstellt wird, soll dieser nach erfolgreicher Speicherung automatisch Teil der entsprechenden Navigationsstruktur werden.

Wenn ein Knoten verschoben oder seine Koordinaten geändert werden, verändert sich entsprechend die daraus berechnete Struktur.

⸻

31. Koordinaten als veränderbare Daten

Die Entscheidung für koordinatenbasierte Knoten gewinnt durch die Laufzeit-Erweiterbarkeit zusätzliche Bedeutung.

Die Position eines Knotens in der Wissensstruktur muss nicht fest programmiert werden.

Sie kann als Datenwert verändert werden.

Beispiel:

Vorher:
PostgreSQL
Koordinate:
    typ = datenbank
    traeger = relationale_datenbank

Nach einer Änderung:

PostgreSQL
Koordinate:
    typ = datenbank
    traeger = backend

Die Anwendung muss nicht wissen, dass PostgreSQL „verschoben“ wurde.

Sie berechnet die Navigationsstruktur anhand der neuen Daten erneut.

Damit können strukturelle Änderungen zur Laufzeit erfolgen.

⸻

32. Editor als zukünftiger Bestandteil

Die Laufzeitfähigkeit erfordert langfristig einen eigenen Verwaltungsbereich innerhalb von MindHub.

Dieser Bereich muss unter anderem ermöglichen:

* Universen erstellen
* Universen bearbeiten
* Knoten erstellen
* Knoten bearbeiten
* Knoten löschen
* Eigenschaften bearbeiten
* Koordinaten ändern
* Kontextinformationen hinzufügen
* Beziehungen verwalten
* Inhalte bearbeiten

Der Editor ist dabei kein separates Wissenssystem.

Er ist die Bearbeitungsoberfläche für das zugrunde liegende Wissensmodell.

⸻

33. Validierung

Da die Wissensstruktur dynamisch verändert werden kann, muss die Anwendung die Konsistenz des Wissensmodells sicherstellen.

Beispielsweise müssen beim Erstellen oder Bearbeiten eines Knotens Regeln geprüft werden:

* Ist die ID eindeutig?
* Existiert das referenzierte Universum?
* Sind die Koordinaten gültig?
* Ist der erforderliche Kontext vorhanden?
* Sind Beziehungen gültig?
* Entstehen ungültige Strukturen?
* Sind erforderliche Eigenschaften vorhanden?

Damit wird verhindert, dass beliebige Datenänderungen die Navigationslogik beschädigen.

Editor
   │
   ▼
Validierung
   │
   ├── ungültig → Fehler
   │
   └── gültig
          │
          ▼
       Datenbank
          │
          ▼
   Struktur neu berechnen

⸻

34. Trennung von Schema und Inhalt

Eine besonders wichtige langfristige Eigenschaft von MindHub ist die Trennung zwischen:

Schema

Beschreibt:

Was kann MindHub darstellen?

Beispielsweise:

* Knoten
* Eigenschaften
* Universen
* Koordinaten
* Beziehungen
* Kontexte

Inhalt

Beschreibt:

Was weiß MindHub aktuell?

Beispielsweise:

* PostgreSQL
* SQLite
* MongoDB
* Linux
* TCP/IP
* Docker

Diese Trennung ermöglicht es, den Wissensbestand kontinuierlich zu erweitern, ohne die grundlegende Anwendung jedes Mal neu entwickeln zu müssen.

⸻

35. Zielarchitektur

Das langfristige Zielbild lässt sich damit folgendermaßen darstellen:

                         MINDHUB
                            │
              ┌─────────────┴─────────────┐
              │                           │
        Wissensmodell                 Benutzer
              │                           │
              │                    ┌──────┴──────┐
              │                    │             │
              │                Navigation      Editor
              │                    │             │
              │                    └──────┬──────┘
              │                           │
              └──────────────┬────────────┘
                             │
                            API
                             │
                      Domain / Services
                             │
                       Persistenzschicht
                             │
                        Wissensdatenbank

Die Anwendung stellt dabei die Regeln und Mechanismen bereit.

Die Datenbank enthält den aktuellen Wissensstand.

Der Editor verändert diesen Wissensstand.

Die Navigation interpretiert denselben Wissensstand.

⸻

36. Konsequenz für die nächste Version

Für die nächste Version bedeutet dies:

Die Knoten werden weiterhin über Eigenschaften und Koordinaten beschrieben. Die Baumstruktur wird nicht fest gespeichert, sondern aus diesen Informationen berechnet. Gleichzeitig werden diese Knoten und ihre Eigenschaften nicht mehr ausschließlich statisch im Quellcode definiert, sondern als persistente Daten verwaltet.

Damit entstehen drei voneinander getrennte Ebenen:

1. Wissensmodell
   ↓
   Was kann beschrieben werden?
2. Wissensdaten
   ↓
   Was ist aktuell bekannt?
3. Projektion / Navigation
   ↓
   Wie wird dieses Wissen dargestellt?

Diese Trennung ist die Grundlage für die gewünschte Laufzeit-Erweiterbarkeit.

⸻

37. Ziel

MindHub soll langfristig ein System sein, bei dem gilt:

Neue Erkenntnisse werden zu neuen Daten – nicht zu neuem Programmcode.

Das Programm stellt die Struktur bereit.

Die Datenbank enthält das Wissen.

Der Editor erweitert und verändert das Wissen.

Die Navigationslogik erzeugt daraus die jeweils passende Sicht.

Damit kann MindHub gleichzeitig:

* als persönliches Nachschlagewerk,
* als persönliches Fachbuch,
* als Lernsystem,
* als Wissensdatenbank
* und als dynamisch wachsender Wissensbestand

verwendet werden.