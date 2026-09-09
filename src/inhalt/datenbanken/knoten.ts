import type { Knoten } from '../../kern/typen'

const H = 'datenbanken'

/* ---------------------------------------------------------------- Ebene 1
 * Typen. Acht gleichrangige Kategorien plus ein Erklärungsknoten.
 * README Nr. 6: SQL/NoSQL ist hier ein Geschwister, kein Behälter darüber.
 */
const typen: Knoten[] = [
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
    id: 'typ-spaltenorientiert',
    titel: 'Spaltenorientiert',
    kurz: 'Spalten statt Zeilen gespeichert',
    heimat: H,
    koordinate: { typ: 'spaltenorientiert' },
    art: 'kategorie',
    gruppe: 'nosql',
    kern: {
      text: 'Die Werte einer Spalte liegen physisch beieinander statt zeilenweise. Eine Auswertung über wenige Spalten und Millionen Zeilen liest damit nur einen Bruchteil der Daten.',
      punkte: [
        'Sehr hohe Kompression durch gleichartige Nachbarwerte',
        'Analysen statt Einzelsatzzugriff',
        'Schlecht für viele kleine Schreibvorgänge',
      ],
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

/* ---------------------------------------------------------------- Ebene 2
 * Träger — konkrete Datenbanken.
 * Der Steckbrief ist die Darstellung des Knotens selbst (README Nr. 5),
 * keine Kachel auf der Ebene darunter.
 */
const traeger: Knoten[] = [
  {
    id: 'mongodb',
    titel: 'MongoDB',
    kurz: 'Dokumentorientiert, horizontal skalierbar',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb' },
    art: 'traeger',
    gruppe: 'nosql',
    steckbrief: [
      ['Hersteller', 'MongoDB, Inc.'],
      ['Erschienen', 'Februar 2009'],
      ['Aktuell', '8.0 (LTS-Serie)'],
      ['Lizenz', 'SSPL v1.0'],
      ['Speicher-Engine', 'WiredTiger'],
      ['Standard-Port', '27017'],
    ],
    kern: {
      text: 'Dokumentendatenbank mit BSON als Speicherformat. Sharding und automatischer Failover sind eingebaut statt nachgerüstet. Die Schemafreiheit ist der große Vorteil und die größte Fehlerquelle zugleich.',
    },
  },
  {
    id: 'postgresql',
    titel: 'PostgreSQL',
    kurz: 'Relational, mit Dokumentfähigkeiten',
    heimat: H,
    koordinate: { typ: 'relational', traeger: 'postgresql' },
    art: 'traeger',
    gruppe: 'sql',
    steckbrief: [
      ['Hersteller', 'PostgreSQL Global Development Group'],
      ['Erschienen', '1996'],
      ['Lizenz', 'PostgreSQL-Lizenz'],
      ['Standard-Port', '5432'],
    ],
    kern: {
      text: 'Relationale Datenbank mit sehr ausgereiften Transaktionen und mit JSONB einem vollwertigen Dokumentmodell nebenan. Deckt damit einen großen Teil der Dokument-Anwendungsfälle ab, ohne die relationale Stärke aufzugeben.',
    },
  },
  {
    id: 'redis',
    titel: 'Redis',
    kurz: 'In-Memory, Datenstrukturen',
    heimat: H,
    koordinate: { typ: 'key-value', traeger: 'redis' },
    art: 'traeger',
    gruppe: 'nosql',
    steckbrief: [
      ['Erschienen', '2009'],
      ['Standard-Port', '6379'],
    ],
    kern: {
      text: 'Hält Daten im Arbeitsspeicher und bietet nicht nur Werte, sondern Datenstrukturen: Listen, Mengen, sortierte Mengen, Zähler, Streams.',
    },
  },
]

/* ---------------------------------------------------------------- Ebene 3
 * Facetten von MongoDB. Für jeden Träger dieselben sechs (README Nr. 9).
 */
function facette(
  traegerId: string,
  facetteId: string,
  titel: string,
  kurz: string,
  kern: Knoten['kern'],
  typId: string,
): Knoten {
  return {
    id: `${traegerId}-${facetteId}`,
    titel,
    kurz,
    heimat: H,
    koordinate: { typ: typId, traeger: traegerId, facette: facetteId },
    art: 'facette',
    kern,
  }
}

const mongoFacetten: Knoten[] = [
  facette('mongodb', 'datenmodell', 'Datenmodell', 'BSON, Embedding, Schema', {
    text: 'Die zentrale Designentscheidung in MongoDB ist nicht das Schema, sondern die Frage, was eingebettet und was referenziert wird. Sie entscheidet über Lesekosten, Dokumentgröße und Änderungsaufwand gleichermaßen.',
  }, 'dokument'),
  facette('mongodb', 'abfragen', 'Abfragen', 'MQL, Aggregation, Indexe', {
    text: 'MQL für den Alltag, die Aggregation Pipeline für Auswertungen. Beides steht und fällt mit den Indexen — ohne passenden Index wird aus jeder Abfrage ein vollständiger Durchlauf der Collection.',
  }, 'dokument'),
  facette('mongodb', 'architektur', 'Architektur', 'Replica Set, Sharding', {
    text: 'WiredTiger als Speicher-Engine, Replica Sets für Verfügbarkeit, Sharding für horizontale Skalierung. Der Shard Key ist die folgenreichste Entscheidung im ganzen Betrieb.',
  }, 'dokument'),
  facette('mongodb', 'konsistenz', 'Konsistenz', 'Concerns, Transaktionen', {
    text: 'Einzelne Dokumente sind immer atomar. Alles darüber hinaus wird über Write Concern, Read Concern und Read Preference eingestellt — Konsistenz ist hier eine Stellschraube, keine Konstante.',
  }, 'dokument'),
  facette('mongodb', 'sicherheit', 'Sicherheit', 'Auth, RBAC, Injection', {
    text: 'Authentifizierung ist bei einer Selbstinstallation nicht automatisch aktiv. Das ist der Ursprung der bekannten Vorfälle — und der praktisch häufigere Fehler sitzt in der Anwendung, nicht im Server.',
  }, 'dokument'),
  facette('mongodb', 'betrieb', 'Betrieb', 'Backup, Monitoring', {
    text: 'Logische Dumps, Dateisystem-Snapshots oder verwaltetes Backup. Entscheidend ist weniger die Methode als der getestete Restore.',
  }, 'dokument'),
]

/* ---------------------------------------------------------------- Ebene 4
 * Blätter der Facette Datenmodell. README Nr. 21: hier keine Prosa —
 * Regel, Beispiel, Anti-Pattern. Das ist die Nachschlage-Ebene.
 */
const mongoDatenmodell: Knoten[] = [
  {
    id: 'mongodb-bson',
    titel: 'BSON und Datentypen',
    kurz: 'Binäres JSON mit Zusatztypen',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb', facette: 'datenmodell', konzept: 'bson' },
    art: 'konzept',
    kern: {
      punkte: [
        'ObjectId: 12 Byte, enthält Zeitstempel — grob nach Erstellzeit sortierbar',
        'Decimal128 für Geldbeträge — niemals Double',
        'Date wird als UTC-Millisekunden gespeichert',
        'Binary und Regex existieren als eigene Typen',
      ],
      code: {
        sprache: 'javascript',
        quelltext: `db.auftraege.insertOne({
  auftragsnummer: "A-2026-118",
  preis: NumberDecimal("149.95"),
  erstelltAm: new Date(),
  menge: NumberInt(12)
})`,
      },
      warnung: 'Ein JavaScript-Number ist ein Double. Ohne NumberDecimal entstehen Rundungsfehler bei Beträgen.',
    },
  },
  {
    id: 'mongodb-dokumente',
    titel: 'Dokumente und Collections',
    kurz: 'Begriffe gegenüber SQL',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb', facette: 'datenmodell', konzept: 'dokumente' },
    art: 'konzept',
    kern: {
      punkte: [
        'Collection entspricht der Tabelle, Dokument der Zeile, Feld der Spalte',
        'Eingebettetes Dokument ersetzt den JOIN',
        '$lookup entspricht dem JOIN, ist aber deutlich teurer',
        'Collections werden beim ersten Schreibvorgang implizit angelegt',
      ],
    },
  },
  {
    id: 'mongodb-embedding',
    titel: 'Embedding oder Referenzieren',
    kurz: 'Die zentrale Entscheidung',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb', facette: 'datenmodell', konzept: 'embedding' },
    art: 'konzept',
    kern: {
      text: 'Faustregel: Was zusammen gelesen wird, wird zusammen gespeichert.',
      punkte: [
        'Einbetten bei 1:n mit begrenzter Anzahl — Positionen eines Auftrags',
        'Einbetten, wenn das Teilobjekt kein eigenes Leben hat',
        'Referenzieren bei n:m',
        'Referenzieren, wenn die Liste unbegrenzt wachsen kann',
      ],
      code: {
        sprache: 'javascript',
        quelltext: `// Eingebettet — Positionen gehören zum Auftrag
{
  auftragsnummer: "A-2026-118",
  positionen: [
    { artikel: "Welle 8mm", menge: 40 },
    { artikel: "Buchse M6",  menge: 120 }
  ]
}`,
      },
      warnung: 'Anti-Pattern: unbegrenzt wachsende Arrays. Alle Maschinenlogs in einem Dokument laufen in die 16-MB-Grenze.',
    },
  },
  {
    id: 'mongodb-validierung',
    titel: 'Schema-Validierung',
    kurz: 'Schemafrei heißt nicht schemalos',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb', facette: 'datenmodell', konzept: 'validierung' },
    art: 'konzept',
    kern: {
      text: 'MongoDB erzwingt kein Schema, aber die Anwendung hat trotzdem eines — es ist nur implizit. Ab 3.6 lässt es sich explizit machen.',
      code: {
        sprache: 'javascript',
        quelltext: `db.createCollection("auftraege", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["auftragsnummer", "status"],
      properties: {
        status: { enum: ["offen", "in_arbeit", "fertig"] }
      }
    }
  },
  validationAction: "error"
})`,
      },
    },
  },
  {
    id: 'mongodb-grenzen',
    titel: 'Grenzen',
    kurz: 'Harte Limits des Modells',
    heimat: H,
    koordinate: { typ: 'dokument', traeger: 'mongodb', facette: 'datenmodell', konzept: 'grenzen' },
    art: 'konzept',
    kern: {
      punkte: [
        'Dokument maximal 16 MB — größere Inhalte in GridFS oder Objektspeicher',
        'Aggregation-Stage maximal 100 MB ohne allowDiskUse',
        'Verschachtelung maximal 100 Ebenen tief',
        'Indexschlüssel maximal 1024 Byte',
      ],
    },
  },
]

export const datenbankKnoten: Knoten[] = [
  ...typen,
  ...traeger,
  ...mongoFacetten,
  ...mongoDatenmodell,
]
