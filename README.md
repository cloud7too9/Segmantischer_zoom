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