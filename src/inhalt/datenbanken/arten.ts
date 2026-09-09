import type { Knoten } from '../../kern/typen'

const H = 'datenbanken'

/**
 * Ebene 1: Arten. Acht gleichrangige Kategorien plus ein Erklärungsknoten.
 * README Nr. 6: SQL/NoSQL ist hier ein Geschwister, kein Behälter darüber.
 */
export const arten: Knoten[] = [
  {
    id: 'typ-relational',
    titel: 'Relational',
    kurz: 'Tabellen, Zeilen, Fremdschlüssel',
    heimat: H,
    koordinate: { typ: 'relational' },
    art: 'kategorie',
    gruppe: 'sql',
    kern: {
      text: 'Daten liegen in Tabellen mit festem Schema. Beziehungen werden über Fremdschlüssel ausgedrückt und beim Lesen per JOIN aufgelöst. Die Datenbank erzwingt Integrität, nicht die Anwendung.',
      punkte: [
        'Schema ist verbindlich und wird per DDL geändert',
        'Referenzielle Integrität liegt in der Datenbank',
        'Ausgereifte Transaktionen als Kernkompetenz',
      ],
    },
  },
  {
    id: 'typ-dokument',
    titel: 'Dokument',
    kurz: 'Verschachtelte Datensätze',
    heimat: H,
    koordinate: { typ: 'dokument' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Ein Datensatz ist ein in sich geschlossenes, verschachteltes Dokument. Was zusammen gelesen wird, wird zusammen gespeichert — Beziehungen werden eingebettet statt verknüpft.',
      punkte: [
        'Schema optional, Änderungen ohne Migration',
        'JOINs sind möglich, aber teuer',
        'Gut bei heterogenen oder früh iterierenden Strukturen',
      ],
    },
  },
  {
    id: 'typ-key-value',
    titel: 'Key-Value',
    kurz: 'Schlüssel auf Wert',
    heimat: H,
    koordinate: { typ: 'key-value' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Das einfachste Modell überhaupt: ein Schlüssel zeigt auf einen Wert. Die Datenbank kennt die Struktur des Wertes nicht und muss sie nicht kennen — das macht Zugriffe extrem schnell.',
      punkte: [
        'Zugriff in konstanter Zeit über den Schlüssel',
        'Keine Abfragen über Werteinhalte',
        'Typisch für Cache, Session, Sperren, Warteschlangen',
      ],
    },
  },
  {
    id: 'typ-wide-column',
    titel: 'Wide-Column',
    kurz: 'Partitionierte Zeilen, flexible Spalten',
    heimat: H,
    koordinate: { typ: 'wide-column' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Zeilen werden über einen Partition Key auf Knoten verteilt; innerhalb einer Partition darf jede Zeile andere Spalten haben. Der Zugriff läuft über den Partition Key — wer ihn nicht kennt, muss den ganzen Cluster fragen.',
      punkte: [
        'Auf Schreibdurchsatz und lineare Skalierung ausgelegt',
        'Das Abfragemuster bestimmt das Schema, nicht umgekehrt',
        'Denormalisierung ist Absicht, nicht Kompromiss',
      ],
      warnung:
        'Nicht zu verwechseln mit spaltenorientierter Speicherung für Analysen (ClickHouse, DuckDB). Dort liegen Spaltenwerte physisch beieinander, um wenige Spalten über viele Zeilen zu scannen — ein anderes Ziel, ähnlicher Name.',
    },
  },
  {
    id: 'typ-graph',
    titel: 'Graph',
    kurz: 'Knoten und Kanten',
    heimat: H,
    koordinate: { typ: 'graph' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Beziehungen sind eigenständige Objekte mit Eigenschaften, nicht ein Nebenprodukt von Fremdschlüsseln. Der Sprung von Knoten zu Nachbar kostet konstante Zeit, unabhängig von der Gesamtgröße.',
      punkte: [
        'Tiefe Traversierungen ohne wachsende JOIN-Kosten',
        'Eigene Abfragesprachen wie Cypher oder Gremlin',
        'Stark bei Empfehlungen, Netzwerken, Abhängigkeiten',
      ],
    },
  },
  {
    id: 'typ-zeitreihen',
    titel: 'Zeitreihen',
    kurz: 'Messwerte über die Zeit',
    heimat: H,
    koordinate: { typ: 'zeitreihen' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Auf die Annahme optimiert, dass Daten zeitlich geordnet eintreffen, praktisch nie geändert werden und nach Zeitfenstern abgefragt werden.',
      punkte: [
        'Automatische Aggregation und Verdichtung alter Daten',
        'Ablauffristen als eingebautes Konzept',
        'Typisch für Messwerte, Metriken, IoT',
      ],
    },
  },
  {
    id: 'typ-vektor',
    titel: 'Vektor',
    kurz: 'Ähnlichkeit statt Gleichheit',
    heimat: H,
    koordinate: { typ: 'vektor' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Gespeichert werden hochdimensionale Zahlenvektoren. Gesucht wird nicht nach Übereinstimmung, sondern nach Nähe — die Antwort ist "das Ähnlichste", nicht "das Passende".',
      punkte: [
        'Näherungssuche (ANN) statt exakter Treffer',
        'Grundlage für semantische Suche und RAG',
        'Ergebnisqualität hängt am Einbettungsmodell, nicht an der Datenbank',
      ],
    },
  },
  {
    id: 'typ-suchindex',
    titel: 'Suchindex',
    kurz: 'Volltext und Relevanz',
    heimat: H,
    koordinate: { typ: 'suchindex' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Ein invertierter Index bildet Wörter auf Dokumente ab. Ergebnisse sind nicht nur richtig oder falsch, sondern nach Relevanz sortiert.',
      punkte: [
        'Sprachanalyse: Stemming, Synonyme, Tokenisierung',
        'Meist Ergänzung zur Hauptdatenbank, kein Ersatz',
        'Konsistenz ist verzögert, nicht sofort',
      ],
    },
  },

  // Erklärungsknoten — die wichtigste Unterscheidung des Gebiets bekommt
  // Prominenz, ohne dass jeder Weg zu jeder Datenbank durch sie hindurchmuss.
  {
    id: 'begriff-sql-nosql',
    titel: 'SQL und NoSQL',
    kurz: 'Warum die Grenze erodiert',
    heimat: H,
    koordinate: { typ: 'sql-und-nosql' },
    art: 'erklaerung',
    kern: {
      text: 'NoSQL ist eine Negativdefinition — "alles, was nicht relational ist". Als Denkhilfe brauchbar, als Kategorie schwach: Die Gruppe umfasst Modelle, die untereinander weniger gemeinsam haben als mit relationalen Datenbanken.',
      punkte: [
        'PostgreSQL speichert Dokumente in JSONB, mit Index',
        'MongoDB kennt Multi-Dokument-Transaktionen seit 4.0',
        'Die nützlichere Frage ist das Datenmodell, nicht das Etikett',
      ],
      warnung:
        'Deshalb ist SQL/NoSQL hier Farbe und Filter statt einer eigenen Zoomebene.',
    },
  },
]
