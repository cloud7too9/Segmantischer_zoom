import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const H = 'datenbanken'
const TYP = 'relational'
const TRAEGER = 'sqlite'

const { facette, konzept } = baukasten(TYP, TRAEGER)

/* ------------------------------------------------------------ Ebene 2: Träger */

const traeger: Knoten = {
  id: 'sqlite',
  titel: 'SQLite',
  kurz: 'Relational, eingebettet, eine Datei',
  heimat: H,
  koordinate: { typ: TYP, traeger: TRAEGER },
  art: 'traeger',
  gruppe: 'sql',
  steckbrief: [
    ['Autor', 'D. Richard Hipp'],
    ['Erschienen', 'August 2000'],
    ['Lizenz', 'Public Domain'],
    ['Implementiert in', 'C'],
    ['Server', 'keiner — Bibliothek im Prozess'],
    ['Speicherform', 'eine einzelne Datei'],
  ],
  kern: {
    text: 'Keine Serveranwendung, sondern eine Bibliothek, die im Prozess der Anwendung läuft. Die gesamte Datenbank ist eine Datei. Damit ist SQLite die mit Abstand am häufigsten eingesetzte Datenbank überhaupt — in Browsern, Telefonen, Flugzeugen und Messgeräten.',
    warnung:
      'Die richtige Vergleichsgröße ist nicht PostgreSQL, sondern fopen(). SQLite ersetzt nicht den Datenbankserver, sondern das selbstgebaute Dateiformat.',
  },
}

/* ------------------------------------------------------- Ebene 3: Facetten */

const facetten: Knoten[] = [
  facette('datenmodell', 'Datenmodell', 'Typaffinität, STRICT, Constraints', {
    text: 'SQLite typisiert Werte, nicht Spalten. Diese Eigenheit ist historisch gewachsen und für Umsteiger die größte Überraschung — seit 3.37 lässt sie sich abschalten.',
  }),
  facette('abfragen', 'Abfragen', 'SQL-Dialekt, Indexe, FTS5', {
    text: 'Der SQL-Umfang ist größer, als die Größe der Bibliothek vermuten lässt: Fensterfunktionen, rekursive CTEs, UPSERT und Volltextsuche sind vorhanden. Fehlend sind vor allem Teile von ALTER TABLE und einige Typen.',
  }),
  facette('architektur', 'Architektur', 'Eine Datei, ein Prozess', {
    text: 'Kein Netzwerk, kein Serverprozess, keine Verbindungsverwaltung. Der gesamte Zugriff geht über Dateisperren — daraus folgen Stärken und Grenzen gleichermaßen.',
  }),
  facette('konsistenz', 'Konsistenz', 'ACID über Dateisperren', {
    text: 'Vollständig ACID, auch bei Stromausfall. Der Preis: Nebenläufigkeit beim Schreiben gibt es nicht — im WAL-Modus genau ein Schreiber neben beliebig vielen Lesern.',
  }),
  facette('sicherheit', 'Sicherheit', 'Dateirechte statt Benutzer', {
    text: 'Es gibt kein Benutzer- und Rechtesystem. Wer die Datei lesen darf, liest alles. Das verlagert Sicherheit vollständig ins Dateisystem und in die Anwendung.',
  }),
  facette('betrieb', 'Betrieb', 'PRAGMAs, Backup, Prüfung', {
    text: 'Betrieb heißt hier vor allem: die richtigen PRAGMAs beim Verbindungsaufbau setzen und ein Backup-Verfahren wählen, das eine offene Datenbank verträgt.',
  }),
]

/* -------------------------------------------------------- Ebene 4: Konzepte */

const datenmodell: Knoten[] = [
  konzept('datenmodell', 'affinitaet', 'Typaffinität', 'Die größte Eigenheit', {
    text: 'Eine Spalte hat keinen Typ, sondern eine Affinität — eine Neigung, Werte umzuwandeln. Passt ein Wert nicht, wird er trotzdem gespeichert.',
    punkte: [
      'Fünf Speicherklassen: NULL, INTEGER, REAL, TEXT, BLOB',
      'Fünf Affinitäten: TEXT, NUMERIC, INTEGER, REAL, BLOB',
      'Ein unbekannter Typname ergibt NUMERIC-Affinität statt eines Fehlers',
      'INTEGER PRIMARY KEY ist ein Sonderfall: es ist die interne rowid',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE TABLE t (menge INTEGER);
INSERT INTO t VALUES ('abc');   -- wird gespeichert, als TEXT
SELECT typeof(menge) FROM t;    -- 'text'`,
    },
  }),
  konzept('datenmodell', 'strict', 'STRICT-Tabellen', 'Die Eigenheit abschalten', {
    text: 'Seit 3.37 lässt sich pro Tabelle echte Typprüfung einschalten. Für neue Projekte ist das die richtige Voreinstellung.',
    code: {
      sprache: 'sql',
      quelltext: `CREATE TABLE auftraege (
  id      INTEGER PRIMARY KEY,
  nummer  TEXT NOT NULL,
  menge   INTEGER NOT NULL
) STRICT;

INSERT INTO auftraege (nummer, menge) VALUES ('A-1', 'viel');
-- Error: cannot store TEXT value in INTEGER column`,
    },
    punkte: [
      'Erlaubte Typen in STRICT: INT, INTEGER, REAL, TEXT, BLOB, ANY',
      'Lässt sich mit WITHOUT ROWID kombinieren',
      'Bestehende Tabellen müssen dafür neu angelegt werden',
    ],
  }),
  konzept('datenmodell', 'constraints', 'Constraints und Fremdschlüssel', 'Standardmäßig aus', {
    warnung:
      'Fremdschlüssel werden aus Gründen der Rückwärtskompatibilität nicht erzwungen, solange PRAGMA foreign_keys nicht gesetzt ist — und die Einstellung gilt nur für die aktuelle Verbindung.',
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA foreign_keys = ON;   -- bei JEDER Verbindung neu`,
    },
    punkte: [
      'PRIMARY KEY, UNIQUE, NOT NULL, CHECK funktionieren wie erwartet',
      'CHECK darf keine Unterabfragen enthalten',
      'Generated Columns seit 3.31, virtuell oder gespeichert',
    ],
  }),
  konzept('datenmodell', 'aenderungen', 'Schemaänderungen', 'ALTER TABLE ist eingeschränkt', {
    punkte: [
      'Möglich: RENAME TABLE, RENAME COLUMN, ADD COLUMN, DROP COLUMN (ab 3.35)',
      'Nicht möglich: Typ ändern, Constraint hinzufügen, Spaltenreihenfolge ändern',
      'Der übliche Weg: neue Tabelle anlegen, Daten kopieren, umbenennen',
      'Migrationswerkzeuge machen genau das im Hintergrund',
    ],
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA foreign_keys = OFF;
BEGIN;
CREATE TABLE auftraege_neu (...);
INSERT INTO auftraege_neu SELECT ... FROM auftraege;
DROP TABLE auftraege;
ALTER TABLE auftraege_neu RENAME TO auftraege;
COMMIT;
PRAGMA foreign_keys = ON;`,
    },
  }),
]

const abfragen: Knoten[] = [
  konzept('abfragen', 'dialekt', 'SQL-Dialekt', 'Was da ist und was fehlt', {
    punkte: [
      'Vorhanden: Fensterfunktionen, rekursive CTEs, UPSERT, RETURNING (ab 3.35)',
      'RIGHT und FULL OUTER JOIN erst ab 3.39',
      'Kein natives DATE oder BOOLEAN — Datum als TEXT (ISO-8601) oder INTEGER',
      'Keine gespeicherten Prozeduren, keine benutzerdefinierten Typen',
    ],
    code: {
      sprache: 'sql',
      quelltext: `INSERT INTO kunden (nummer, name) VALUES ('K-1042', 'Meier GmbH')
ON CONFLICT (nummer) DO UPDATE SET name = excluded.name
RETURNING id;`,
    },
  }),
  konzept('abfragen', 'indexe', 'Indexe und Abfrageplan', 'Klein, aber vorhanden', {
    punkte: [
      'B-Tree-Indexe, partiell und über Ausdrücke',
      'EXPLAIN QUERY PLAN zeigt lesbar, welcher Index greift',
      'ANALYZE füllt sqlite_stat1 und verbessert die Planung deutlich',
      'SCAN im Plan ist das Warnsignal, SEARCH das Ziel',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE INDEX idx_offen ON auftraege (erstellt_am)
  WHERE status = 'offen';

EXPLAIN QUERY PLAN
SELECT * FROM auftraege WHERE status = 'offen';`,
    },
  }),
  konzept('abfragen', 'fts5', 'Volltextsuche mit FTS5', 'Eingebautes Modul', {
    text: 'FTS5 legt eine virtuelle Tabelle mit invertiertem Index an. Für lokale Suche in einer Anwendung reicht das weit.',
    code: {
      sprache: 'sql',
      quelltext: `CREATE VIRTUAL TABLE artikel_fts USING fts5(
  bezeichnung, beschreibung, content='artikel', content_rowid='id'
);

SELECT * FROM artikel_fts WHERE artikel_fts MATCH 'welle AND edelstahl'
 ORDER BY rank;`,
    },
    warnung:
      'Die externe Inhaltstabelle wird nicht automatisch synchron gehalten — dafür braucht es Trigger auf INSERT, UPDATE und DELETE.',
  }),
  konzept('abfragen', 'json', 'JSON-Funktionen', 'Ohne eigenen Typ', {
    punkte: [
      'JSON wird als TEXT gespeichert, ab 3.45 zusätzlich als kompaktes JSONB-Format',
      'Operatoren -> und ->> wie in PostgreSQL und MySQL',
      'json_each und json_tree zerlegen ein Dokument in Zeilen',
      'Indizierbar über Ausdrucksindexe auf einzelne Felder',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE INDEX ON artikel (json_extract(merkmale, '$.werkstoff'));

SELECT merkmale ->> '$.werkstoff' FROM artikel;`,
    },
  }),
]

const architektur: Knoten[] = [
  konzept('architektur', 'eingebettet', 'Eingebettet statt Server', 'Das Grundprinzip', {
    punkte: [
      'Die Bibliothek läuft im Prozess der Anwendung — kein Netzwerk, keine Latenz',
      'Die gesamte Datenbank ist eine portable Datei, plattformübergreifend gleich',
      'Kein Verbindungsaufbau, keine Benutzerverwaltung, keine Konfigurationsdatei',
      'Rückwärtskompatibles Dateiformat, zugesagt bis mindestens 2050',
    ],
  }),
  konzept('architektur', 'wal', 'Journal-Modus', 'DELETE oder WAL', {
    text: 'Der Journal-Modus bestimmt, wie Änderungen abgesichert werden — und damit, wie gut gleichzeitige Zugriffe funktionieren.',
    punkte: [
      'DELETE ist die Voreinstellung: Rollback-Journal, Schreiber sperrt Leser aus',
      'WAL: Leser und ein Schreiber arbeiten gleichzeitig — für Anwendungen fast immer besser',
      'WAL erzeugt zwei Nebendateien (-wal und -shm)',
      'Die Einstellung ist dauerhaft in der Datei gespeichert, nicht pro Verbindung',
    ],
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;   -- mit WAL sicher und deutlich schneller`,
    },
    warnung:
      'WAL funktioniert nicht zuverlässig über Netzwerkdateisysteme. SQLite auf einem NFS- oder SMB-Share ist ein bekannter Weg zu beschädigten Datenbanken.',
  }),
  konzept('architektur', 'seiten', 'Seiten und Speicherung', 'Wie die Datei aufgebaut ist', {
    punkte: [
      'Die Datei besteht aus gleich großen Seiten, Standardgröße 4096 Byte',
      'Jede Tabelle und jeder Index ist ein B-Tree über diese Seiten',
      'WITHOUT ROWID speichert die Tabelle direkt im Index des Primärschlüssels',
      'Gelöschter Platz wird als Freiliste wiederverwendet, nicht zurückgegeben',
    ],
  }),
  konzept('architektur', 'grenzen', 'Grenzen', 'Wo Schluss ist', {
    punkte: [
      'Theoretisch 281 TB Dateigröße — praktisch begrenzt das Dateisystem',
      'Ein Schreiber gleichzeitig, unabhängig vom Journal-Modus',
      'Kein Netzwerkzugriff — Zugriff von mehreren Rechnern ist nicht vorgesehen',
      'Maximal 64 Tabellen in einem JOIN, 2000 Spalten je Tabelle',
    ],
    warnung:
      'Der begrenzende Faktor ist fast nie die Datenmenge, sondern die Schreibnebenläufigkeit. Viele parallele Schreiber sind das Ausschlusskriterium.',
  }),
]

const konsistenz: Knoten[] = [
  konzept('konsistenz', 'acid', 'ACID über Dateisperren', 'Auch bei Stromausfall', {
    punkte: [
      'Transaktionen sind vollständig atomar und dauerhaft',
      'Die Absicherung läuft über das Journal beziehungsweise das WAL',
      'Bei Absturz stellt der nächste Zugriff den konsistenten Zustand her',
      'Die Testsuite ist umfangreicher als die Bibliothek selbst',
    ],
  }),
  konzept('konsistenz', 'nebenlaeufigkeit', 'Nebenläufigkeit', 'Ein Schreiber', {
    text: 'Im WAL-Modus lesen beliebig viele Verbindungen gleichzeitig, aber nur eine schreibt. Weitere Schreibversuche warten oder scheitern.',
    punkte: [
      'SQLITE_BUSY bedeutet: eine andere Verbindung schreibt gerade',
      'busy_timeout lässt SQLite warten statt sofort abzubrechen',
      'Ohne gesetzten Timeout ist SQLITE_BUSY der häufigste Produktionsfehler',
      'Schreibvorgänge bündeln statt einzeln absetzen',
    ],
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA busy_timeout = 5000;   -- 5 Sekunden warten`,
    },
  }),
  konzept('konsistenz', 'transaktionen', 'Transaktionsarten', 'DEFERRED, IMMEDIATE, EXCLUSIVE', {
    punkte: [
      'DEFERRED ist die Voreinstellung: die Sperre wird erst beim ersten Zugriff genommen',
      'IMMEDIATE nimmt die Schreibsperre sofort — verhindert Upgrade-Deadlocks',
      'Wer in einer Transaktion liest und danach schreibt, sollte IMMEDIATE nehmen',
      'Savepoints erlauben verschachtelte Teilrücknahmen',
    ],
    code: {
      sprache: 'sql',
      quelltext: `BEGIN IMMEDIATE;
UPDATE auftraege SET status = 'fertig' WHERE id = 42;
COMMIT;`,
    },
    warnung:
      'Der klassische Fehler: DEFERRED beginnen, lesen, dann schreiben wollen — und mit SQLITE_BUSY scheitern, obwohl die Transaktion längst läuft.',
  }),
  konzept('konsistenz', 'integritaet', 'Integrität prüfen', 'Wenn doch etwas schiefging', {
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA integrity_check;
PRAGMA foreign_key_check;`,
    },
    punkte: [
      'integrity_check durchläuft die gesamte Datei und meldet Strukturfehler',
      'quick_check ist deutlich schneller und findet die meisten Probleme',
      'foreign_key_check findet verwaiste Verweise nachträglich',
      'Häufigste Ursache für Beschädigung: Netzwerkdateisystem oder abgewürgter Prozess',
    ],
  }),
]

const sicherheit: Knoten[] = [
  konzept('sicherheit', 'dateirechte', 'Dateirechte sind das Rechtemodell', 'Kein Benutzersystem', {
    text: 'SQLite kennt keine Benutzer, keine Rollen und keine Rechte. Wer Leserecht auf die Datei hat, liest die gesamte Datenbank.',
    punkte: [
      'Zugriffskontrolle passiert im Dateisystem und in der Anwendung',
      'Die Datei nicht in ein per Webserver ausgeliefertes Verzeichnis legen',
      'Bei WAL müssen auch -wal und -shm geschützt sein',
      'Auf Mobilgeräten übernimmt die Sandbox des Betriebssystems diese Rolle',
    ],
  }),
  konzept('sicherheit', 'verschluesselung', 'Verschlüsselung', 'Nur als Erweiterung', {
    punkte: [
      'Die freie Version verschlüsselt nicht',
      'SQLCipher ist die verbreitete quelloffene Erweiterung',
      'SEE ist die kommerzielle Variante der SQLite-Autoren',
      'Alternative: das ganze Dateisystem verschlüsseln statt die Datei',
    ],
  }),
  konzept('sicherheit', 'injection', 'SQL-Injection', 'Gilt hier genauso', {
    code: {
      sprache: 'javascript',
      quelltext: `// VERWUNDBAR
db.prepare(\`SELECT * FROM kunden WHERE name = '\${name}'\`).all()

// RICHTIG
db.prepare('SELECT * FROM kunden WHERE name = ?').all(name)`,
    },
    warnung:
      'Dass SQLite lokal läuft, macht Injection nicht harmlos: ATTACH DATABASE kann fremde Dateien einbinden, und über load_extension lässt sich Code nachladen.',
  }),
  konzept('sicherheit', 'fremde-dateien', 'Fremde Datenbankdateien', 'Eine unterschätzte Angriffsfläche', {
    text: 'Eine SQLite-Datei ist kein passives Datenformat. Sie enthält Schema-Definitionen, die beim Öffnen ausgewertet werden.',
    punkte: [
      'Präparierte Dateien können über Trigger und Views Verhalten auslösen',
      'Nutzerhochgeladene Datenbankdateien niemals ungeprüft öffnen',
      'Erweiterungsladen (load_extension) standardmäßig deaktiviert lassen',
      'defensive-Modus per SQLITE_DBCONFIG_DEFENSIVE einschalten',
    ],
  }),
]

const betrieb: Knoten[] = [
  konzept('betrieb', 'pragmas', 'PRAGMAs für den Produktivbetrieb', 'Die wichtigste Einstellungsarbeit', {
    text: 'Die Voreinstellungen stammen aus einer Zeit, in der Rückwärtskompatibilität wichtiger war als Leistung. Diese vier gehören in jeden Verbindungsaufbau.',
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA journal_mode = WAL;      -- dauerhaft in der Datei
PRAGMA synchronous = NORMAL;    -- mit WAL sicher
PRAGMA foreign_keys = ON;       -- je Verbindung!
PRAGMA busy_timeout = 5000;     -- je Verbindung!`,
    },
    warnung:
      'journal_mode wird einmal in der Datei gespeichert, foreign_keys und busy_timeout gelten nur für die aktuelle Verbindung. Beim Pooling also bei jeder Verbindung erneut setzen.',
  }),
  konzept('betrieb', 'backup', 'Backup', 'Nicht einfach kopieren', {
    punkte: [
      'cp auf eine offene Datenbank kann eine unbrauchbare Kopie erzeugen',
      'VACUUM INTO schreibt eine konsistente, verdichtete Kopie',
      'Die Online-Backup-API kopiert im laufenden Betrieb seitenweise',
      '.backup in der CLI nutzt dieselbe API',
    ],
    code: {
      sprache: 'sql',
      quelltext: `VACUUM INTO '/backup/werkstatt_2026-09-09.db';`,
    },
  }),
  konzept('betrieb', 'wartung', 'Wartung', 'Selten, aber nicht nie', {
    punkte: [
      'VACUUM gibt freien Platz an das Dateisystem zurück und defragmentiert',
      'ANALYZE aktualisiert die Statistiken für den Planer',
      'PRAGMA optimize vor dem Schließen langlebiger Verbindungen',
      'WAL-Datei wächst bis zum Checkpoint — wal_autocheckpoint steuert das',
    ],
    code: {
      sprache: 'sql',
      quelltext: `PRAGMA optimize;
VACUUM;`,
    },
  }),
  konzept('betrieb', 'eignung', 'Wann SQLite passt', 'Und wann nicht', {
    punkte: [
      'Passt: Desktop- und Mobilanwendungen, Konfiguration, Caches, Messdaten',
      'Passt: Websites mit hohem Leseanteil und wenigen Schreibern',
      'Passt nicht: viele parallele Schreiber',
      'Passt nicht: Zugriff von mehreren Rechnern über ein Netzlaufwerk',
    ],
    warnung:
      'Die Entscheidung fällt an der Schreibnebenläufigkeit, nicht an der Datenmenge. Eine 200-GB-SQLite-Datei mit einem Schreiber ist unproblematisch, eine 50-MB-Datei mit dreißig ist es nicht.',
  }),
]

export const sqlite: Knoten[] = [
  traeger,
  ...facetten,
  ...datenmodell,
  ...abfragen,
  ...architektur,
  ...konsistenz,
  ...sicherheit,
  ...betrieb,
]
