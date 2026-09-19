MindHub

Connecting Knowledge

MindHub ist ein wissensorientiertes System zur strukturierten Erfassung, Verknüpfung, Navigation und Darstellung von Wissen.

Die zentrale Idee besteht darin, zwei scheinbar gegensätzliche Anforderungen in einem gemeinsamen Wissensmodell zu verbinden:

* Nachschlagen: Ein bekanntes Thema soll schnell und gezielt erreichbar sein.
* Lernen: Ein unbekanntes oder größeres Themengebiet soll zusammenhängend, ausführlich und explorativ durchlaufen werden können.

MindHub versucht daher nicht, zwischen einem klassischen Wiki und einem klassischen Fachbuch zu wählen. Stattdessen werden beide Nutzungsformen aus demselben strukturierten Wissensbestand erzeugt.

⸻

1. Zielsetzung

Technisches Wissen besitzt häufig mehrere Betrachtungsebenen.

Ein technisches System kann beispielsweise gleichzeitig aus Sicht der Softwareentwicklung, der Systemintegration, der Datenbankadministration oder des Netzbetriebs betrachtet werden.

Diese Perspektiven überschneiden sich teilweise, unterscheiden sich aber in ihren Fragestellungen und ihrem Detailwissen.

Ein Beispiel ist PostgreSQL.

Grundsätzliches Wissen

* Was ist PostgreSQL?
* Was ist ein relationales Datenbankmanagementsystem?
* Was sind Tabellen?
* Was ist SQL?
* Was sind Transaktionen?

Sicht der Softwareentwicklung

* Datenmodellierung
* Queries
* Transaktionen
* ORM
* Connection Pooling
* Migrationen
* API-Anbindung

Sicht der Systemintegration

* Installation
* Dienstverwaltung
* Netzwerk
* Ports
* Benutzer und Berechtigungen
* Konfiguration
* Backup und Recovery
* Monitoring
* Updates

MindHub soll diese Informationen nicht als voneinander isolierte Wissenssammlungen behandeln.

Stattdessen wird ein gemeinsamer Wissensgegenstand beschrieben und um kontextabhängige Informationen ergänzt.

⸻

2. Die Kernidee: Wiki und Buch

MindHub kombiniert zwei klassische Formen der Wissensvermittlung.

2.1 Wiki-Modus – gezieltes Nachschlagen

Im Wiki-Modus kennt der Benutzer das gesuchte Thema bereits.

Beispielsweise:

„Ich möchte etwas über PostgreSQL nachschlagen.“

Der Benutzer navigiert direkt zum entsprechenden Wissensgegenstand.

Dort werden die für diesen Gegenstand relevanten Informationen dargestellt.

Der Fokus liegt auf:

* schneller Orientierung
* direktem Zugriff
* relevanten Informationen
* Querverweisen
* gezielter Navigation

Der Benutzer muss nicht das gesamte Themengebiet durchlaufen.

⸻

2.2 Buch-Modus – zusammenhängendes Lernen

Im Lernmodus kennt der Benutzer möglicherweise noch nicht die konkrete Information, nach der er sucht.

Stattdessen möchte er ein Themengebiet verstehen.

Beispielsweise:

„Ich möchte Datenbanken verstehen.“

Hier soll MindHub nicht nur einzelne Artikel anzeigen.

Der Benutzer kann sich durch das Themengebiet bewegen:

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

Die Navigation bildet dabei einen inhaltlichen Zusammenhang ab.

Der Benutzer kann dadurch Wissen explorativ aufnehmen, ohne bereits wissen zu müssen, wonach er konkret suchen muss.

⸻

3. Das zugrunde liegende Problem

Ein klassisches Wiki ist primär auf das Nachschlagen einzelner Informationen ausgelegt.

Ein Buch ist dagegen primär auf eine zusammenhängende Wissensvermittlung ausgelegt.

Beide Ansätze haben unterschiedliche Stärken:

Ansatz	Stärke	Schwäche
Wiki	Schneller Zugriff auf bekannte Informationen	Weniger geeignet für lineares Lernen
Buch	Zusammenhängender Wissensaufbau	Langsamer Zugriff auf einzelne Informationen
MindHub	Kombination beider Eigenschaften	Erfordert ein strukturiertes Wissensmodell

MindHub verfolgt deshalb nicht das Ziel, eine dieser beiden Formen zu imitieren.

Stattdessen wird ein gemeinsames semantisches Wissensmodell aufgebaut, aus dem unterschiedliche Navigations- und Darstellungsformen entstehen.

⸻

4. Wissensgegenstände statt Seiten

Die grundlegende Einheit von MindHub ist nicht zwingend eine klassische „Seite“.

Ein Wissensgegenstand besitzt Eigenschaften, Beziehungen und kontextabhängige Informationen.

Vereinfacht:

Wissensgegenstand
│
├── Grundinformationen
│
├── Eigenschaften
│
├── Beziehungen
│
└── Kontextabhängige Aspekte
    ├── Universum A
    ├── Universum B
    └── Universum C

Dadurch wird ein Thema nicht ausschließlich über seinen Platz in einer Hierarchie definiert.

Seine Position innerhalb einer bestimmten Navigation ist vielmehr eine Interpretation des Wissensmodells.

⸻

5. Grundwissen und perspektivisches Wissen

Eine zentrale Modellierungsentscheidung ist die Trennung zwischen grundlegenden Eigenschaften und perspektivischen beziehungsweise universumsspezifischen Aspekten.

5.1 Grundlegende Eigenschaften

Grundlegende Eigenschaften beschreiben den Wissensgegenstand unabhängig von einer bestimmten Perspektive.

Beispiel:

PostgreSQL
├── Typ: relationales Datenbankmanagementsystem
├── SQL-Unterstützung
├── Tabellen
├── Relationen
├── Transaktionen
└── ...

Diese Informationen bilden die gemeinsame Grundlage.

⸻

5.2 Universumsspezifische Aspekte

Ein Universum beschreibt einen bestimmten fachlichen Kontext oder eine bestimmte Perspektive.

Beispielsweise:

Universum: Softwareentwicklung

und:

Universum: Systemintegration

Beide Universen können denselben Wissensgegenstand referenzieren, benötigen jedoch unterschiedliche Ergänzungen.

PostgreSQL
│
├── Grundwissen
│
├── Softwareentwicklung
│   ├── ORM
│   ├── Migrationen
│   ├── Connection Pooling
│   └── API-Anbindung
│
└── Systemintegration
    ├── Installation
    ├── Netzwerk
    ├── Ports
    ├── Benutzer/Rechte
    ├── Backup
    └── Monitoring

Die perspektivischen Informationen werden dabei explizit als solche gekennzeichnet.

Damit bleibt erkennbar, welche Aussage zum allgemeinen Verständnis gehört und welche Aussage aus einer bestimmten fachlichen Perspektive relevant ist.

⸻

6. Universen

Ein Universum beschreibt einen inhaltlichen Betrachtungsraum.

Es definiert insbesondere:

* welche fachlichen Dimensionen relevant sind
* welche Beziehungen zwischen Wissensgegenständen bestehen
* welche Perspektiven betrachtet werden
* wie Wissen innerhalb dieses Kontextes navigiert werden kann

Ein Universum muss dabei nicht zwingend eine vollständig unabhängige Wissenssammlung darstellen.

Es kann vielmehr eine andere Projektion auf einen gemeinsamen Wissensbestand sein.

Gemeinsamer Wissensbestand
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
Software-     System-
entwicklung   integration
Universum     Universum

Dadurch können mehrere Universen dieselben Wissensgegenstände verwenden, ohne deren grundlegende Informationen zu duplizieren.

⸻

7. Kontextabhängige Informationen

Nicht jede Information ist für jede Perspektive gleich relevant.

Deshalb soll MindHub Informationen nicht ausschließlich als globale Eigenschaften eines Gegenstands modellieren.

Stattdessen können Informationen einen Kontext besitzen.

Beispiel:

PostgreSQL
Grundsätzlich:
    Relationales Datenbankmanagementsystem
Kontext:
    Softwareentwicklung
        → Datenzugriff
        → ORM
        → Transaktionen
Kontext:
    Systemintegration
        → Installation
        → Netzwerk
        → Dienstverwaltung
        → Backup

Dadurch kann dieselbe Information innerhalb eines Universums relevant sein, während sie in einem anderen Universum nicht oder nur am Rand benötigt wird.

⸻

8. Navigation als Projektion des Wissens

Eine wesentliche Eigenschaft von MindHub ist die Trennung von Wissensstruktur und Navigationsstruktur.

Das Wissen selbst ist nicht identisch mit dem Baum, durch den der Benutzer navigiert.

Der Baum ist vielmehr eine Darstellung beziehungsweise Projektion des Wissensmodells.

Wissensmodell
      │
      ▼
┌─────────────────────┐
│ Universum / Achsen  │
│ Kontext / Perspektive│
│ Koordinaten          │
└──────────┬──────────┘
           │
           ▼
     Navigationsbaum
           │
           ▼
      Benutzeroberfläche

Dadurch kann derselbe Wissensbestand unter unterschiedlichen Bedingungen unterschiedlich navigierbar sein.

⸻

9. Architekturentscheidung für die nächste Version

Knoten werden über Eigenschaften und Koordinaten beschrieben

Für die nächste Version wird bewusst entschieden, dass Knoten ihre fachliche Identität nicht primär über eine fest gespeicherte Baumstruktur erhalten.

Stattdessen werden Knoten über ihre Eigenschaften, semantischen Merkmale und Koordinaten innerhalb eines Universums beschrieben.

Nicht:

Datenbanken
└── Relationale Datenbanken
    └── PostgreSQL
        └── Transaktionen

als fest gespeicherte children-Beziehungen.

Sondern:

PostgreSQL
{
    Eigenschaften: ...,
    Koordinate: ...,
    Kontext: ...
}

Die hierarchische Struktur wird daraus berechnet.

⸻

9.1 Begründung

Eine fest gespeicherte Baumstruktur würde die Hierarchie selbst zu einem Bestandteil des Wissens machen.

Das würde die Flexibilität einschränken.

Wenn sich beispielsweise die fachlichen Achsen eines Universums ändern, müsste der Baum manuell angepasst werden.

Bei einer koordinaten- und eigenschaftsbasierten Beschreibung kann dagegen dieselbe Menge an Wissensgegenständen unter einer anderen Struktur interpretiert werden.

Beispiel:

Achsen A:
Typ
↓
Technologie
↓
Eigenschaft

kann zu einer anderen Struktur führen als:

Achsen B:
Technologie
↓
Typ
↓
Eigenschaft

Die zugrunde liegenden Knoten bleiben dabei dieselben.

Nur die Projektion des Wissens verändert sich.

⸻

10. Konsequenz für das Datenmodell

Das Datenmodell soll deshalb möglichst deklarativ aufgebaut sein.

Ein Knoten beschreibt:

* seine Identität
* seine fachlichen Eigenschaften
* seine semantische Einordnung
* seine Koordinaten
* seine kontextabhängigen Informationen

Der Baum beschreibt dagegen nicht die Daten selbst.

Er ist ein berechnetes Ergebnis.

Knoten + Eigenschaften + Koordinaten
                │
                ▼
       Struktur-Berechnung
                │
                ▼
       Navigationsstruktur

Dadurch werden Datenmodell und Darstellung entkoppelt.

⸻

11. Beispiel für dieselben Daten in unterschiedlichen Kontexten

Angenommen, der Wissensbestand enthält:

PostgreSQL
Docker
Linux
TCP/IP
SQL
Transaktionen

Im Universum Softwareentwicklung könnte daraus beispielsweise folgende Navigation entstehen:

Softwareentwicklung
└── Backend
    └── Datenbanken
        └── PostgreSQL
            ├── SQL
            ├── Datenmodell
            └── Transaktionen

Im Universum Systemintegration könnte derselbe Wissensbestand anders strukturiert werden:

Systemintegration
└── Server
    ├── Linux
    ├── Docker
    ├── Netzwerk
    │   └── TCP/IP
    └── Datenbanken
        └── PostgreSQL
            ├── Installation
            ├── Netzwerk
            └── Backup

Die Knoten sind nicht zwingend unterschiedlich.

Die Perspektive und Strukturierung ist unterschiedlich.

⸻

12. Zwei Zugangsrichtungen

MindHub unterstützt damit zwei grundlegend unterschiedliche Navigationsrichtungen.

Vom Thema zum Kontext

Ich kenne den Gegenstand.
        ↓
PostgreSQL
        ↓
Grundinformationen
        ↓
relevante Perspektiven
        ↓
Detailwissen

Dies entspricht primär dem Nachschlagewerk-Modus.

⸻

Vom Kontext zum Thema

Ich möchte einen Bereich verstehen.
        ↓
Systemintegration
        ↓
Server
        ↓
Datenbanken
        ↓
PostgreSQL
        ↓
Installation / Netzwerk / Rechte / Backup

Dies entspricht primär dem Buch- beziehungsweise Lernmodus.

⸻

13. Der eigentliche Nutzen

MindHub soll nicht lediglich Informationen speichern.

Es soll Wissen navigierbar machen.

Der Benutzer kann:

* ein konkretes Thema nachschlagen
* ein komplettes Themengebiet erkunden
* Zusammenhänge erkennen
* unterschiedliche Perspektiven vergleichen
* vom allgemeinen Wissen in spezifische Aspekte wechseln
* von einem konkreten Thema zurück in den übergeordneten Kontext navigieren
* Wissenslücken während der Navigation erkennen

Besonders wichtig ist dabei die Möglichkeit, denselben Gegenstand aus mehreren fachlichen Perspektiven zu betrachten.

⸻

14. MindHub als Lernsystem

MindHub ist gleichzeitig eine persönliche Lernumgebung.

Das Erweitern des Wissensbestands erfordert eine tatsächliche Auseinandersetzung mit dem jeweiligen Thema.

Ein neuer Wissensgegenstand kann nicht sinnvoll integriert werden, ohne unter anderem folgende Fragen zu beantworten:

* Was ist das?
* Wo gehört es hin?
* Welche Eigenschaften besitzt es?
* Welche Beziehungen besitzt es?
* Welche Perspektiven betrachten es?
* Was ist allgemein gültig?
* Was ist nur in einem bestimmten Kontext relevant?
* Wie unterscheidet es sich von verwandten Gegenständen?

Dadurch wird die Strukturierung selbst Teil des Lernprozesses.

Der Aufbau von MindHub ist somit nicht nur Dokumentation des bereits vorhandenen Wissens, sondern gleichzeitig eine Methode, neues Wissen zu erschließen und zu überprüfen.

⸻

15. Abgrenzung zu einem klassischen Wiki

MindHub ist kein klassisches Wiki mit einer Sammlung unabhängiger Seiten.

Ein klassisches Wiki betrachtet häufig:

Seite → Links → andere Seite

MindHub betrachtet stärker:

Wissensgegenstand
    ↓
Eigenschaften
    ↓
Beziehungen
    ↓
Kontext
    ↓
Projektion
    ↓
Navigation

Eine einzelne Darstellung ist damit nur eine mögliche Sicht auf einen strukturierten Wissensbestand.

⸻

16. Abgrenzung zu einem klassischen Buch

MindHub besitzt gleichzeitig Buchcharakter, ist aber nicht linear.

Ein klassisches Buch legt die Reihenfolge der Wissensvermittlung weitgehend fest.

MindHub lässt den Benutzer dagegen selbst entscheiden, welchem Pfad er folgt.

Buch:
Kapitel 1 → Kapitel 2 → Kapitel 3 → Kapitel 4
MindHub:
              ┌── Thema A
              │
Themenbereich ├── Thema B ── Thema C
              │       │
              └───────┴── Thema D

Die Zusammenhänge bleiben erhalten, ohne den Benutzer auf einen einzigen Lernpfad festzulegen.

⸻

17. Grundprinzipien

Die weitere Entwicklung von MindHub orientiert sich an folgenden Prinzipien:

1. Wissen vor Darstellung

Der Wissensgegenstand darf nicht von der aktuellen UI-Struktur abhängig sein.

2. Eine Wissensbasis, mehrere Perspektiven

Grundinformationen sollen nicht unnötig dupliziert werden.

3. Kontext explizit machen

Perspektivische Informationen müssen als solche erkennbar sein.

4. Navigation aus Wissen ableiten

Die Navigationsstruktur soll möglichst aus den Eigenschaften und Koordinaten der Knoten entstehen.

5. Nachschlagen und Lernen ermöglichen

Das System soll sowohl gezielten Zugriff als auch exploratives Lernen unterstützen.

6. Keine unnötige Redundanz

Wenn zwei Universen denselben Sachverhalt benötigen, soll dieser nicht ohne Grund doppelt gepflegt werden.

7. Struktur ist eine Sicht auf das Wissen

Die Hierarchie ist eine Darstellung des Wissensmodells und nicht zwingend dessen primäre Speicherung.

⸻

18. Zielbild

Das langfristige Ziel ist eine persönliche technische Wissensbasis, die sich gleichzeitig wie ein Nachschlagewerk und wie ein Fachbuch verwenden lässt.

                         MINDHUB
                    "Connecting Knowledge"
                              │
                ┌─────────────┴─────────────┐
                │                           │
          NACHschlagen                    LERNEN
                │                           │
         „Was ist X?“              „Ich möchte Y verstehen.“
                │                           │
                └─────────────┬─────────────┘
                              │
                       GEMEINSAMES
                       WISSENSMODELL
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Grundwissen          Perspektiven
                                        │
                           ┌────────────┼────────────┐
                           │            │            │
                         Uni A        Uni B        Uni C

MindHub soll damit nicht lediglich eine große Sammlung von Informationen werden.

Es soll eine strukturierte, mehrperspektivische und navigierbare Repräsentation technischen Wissens bilden.

Der Benutzer kann entscheiden, ob er ein Thema gezielt aufsuchen oder ein Themengebiet zusammenhängend erkunden möchte.

Beide Wege greifen auf denselben Wissensbestand zurück.

⸻

19. Nächster konzeptioneller Schritt

Für die nächste Version wird deshalb die bisherige Idee weitergeführt und konkretisiert:

Knoten werden über Eigenschaften und Koordinaten beschrieben. Die Baumstruktur wird nicht fest gespeichert, sondern aus diesen Informationen berechnet.

Damit wird MindHub von einer fest definierten Hierarchie zu einem deklarativen Wissensmodell, aus dem unterschiedliche Navigationsstrukturen erzeugt werden können.

Diese Entscheidung bildet eine Grundlage dafür, die beiden Kernziele — Nachschlagen und Lernen — nicht durch zwei getrennte Systeme lösen zu müssen, sondern durch unterschiedliche Sichten auf ein gemeinsames Modell.

⸻

20. Kurzfassung

MindHub ist:

Eine persönliche, strukturierte Wissensbasis, die die Eigenschaften eines Wissensgegenstands von seinen fachlichen Perspektiven trennt und daraus sowohl gezieltes Nachschlagen als auch zusammenhängendes Lernen ermöglicht.

Die zentrale technische Idee lautet:

Das Wissen definiert die Knoten.
Das Universum definiert die Perspektive.
Die Koordinaten und Eigenschaften definieren die Beziehungen.
Die Navigation wird daraus berechnet.

MindHub — Connecting Knowledge