import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const H = 'datenbanken'
const TYP = 'relational'
const TRAEGER = 'postgresql'

const { facette, konzept } = baukasten(TYP, TRAEGER)

/* ------------------------------------------------------------ Ebene 2: Träger */

const traeger: Knoten = {
  id: 'postgresql',
  titel: 'PostgreSQL',
  kurz: 'Relational, erweiterbar, mit Dokumentmodell nebenan',
  heimat: H,
  koordinate: { typ: TYP, traeger: TRAEGER },
  art: 'traeger',
  gruppe: 'sql',
  steckbrief: [
    ['Hersteller', 'PostgreSQL Global Development Group'],
    ['Erschienen', '1996 (Vorläufer ab 1986)'],
    ['Lizenz', 'PostgreSQL-Lizenz (BSD-artig)'],
    ['Implementiert in', 'C'],
    ['Standard-Port', '5432'],
    ['Prozessmodell', 'Ein Prozess je Verbindung'],
  ],
  kern: {
    text: 'Relationale Datenbank mit sehr ausgereiften Transaktionen und einem vollwertigen Dokumentmodell (JSONB) daneben. Die eigentliche Besonderheit ist die Erweiterbarkeit: eigene Typen, Operatoren, Indexarten und Erweiterungen machen aus PostgreSQL für viele Anwendungsfälle eine Spezialdatenbank.',
  },
}

/* ------------------------------------------------------- Ebene 3: Facetten */

const facetten: Knoten[] = [
  facette('datenmodell', 'Datenmodell', 'Typen, Constraints, JSONB', {
    text: 'Das Schema ist verbindlich und wird per DDL geändert. Anders als bei den meisten relationalen Systemen ist das Typsystem aber offen: eigene Typen, Domänen und Erweiterungen erweitern das Modell, ohne es zu verlassen.',
  }),
  facette('abfragen', 'Abfragen', 'SQL, CTEs, Indexarten', {
    text: 'Vollständiges SQL mit Fensterfunktionen, rekursiven CTEs und Volltextsuche. Die Auswahl der richtigen Indexart ist hier reichhaltiger als anderswo — B-Tree ist nur einer von sechs.',
  }),
  facette('architektur', 'Architektur', 'MVCC, WAL, Replikation', {
    text: 'Ein Prozess je Verbindung, MVCC über Tupelversionen und ein Write-Ahead-Log als Fundament für Wiederherstellung und Replikation. VACUUM ist kein Wartungsdetail, sondern Teil des Modells.',
  }),
  facette('konsistenz', 'Konsistenz', 'Isolationsstufen, Sperren', {
    text: 'ACID ist Kernkompetenz, nicht Zusatz. Vier Isolationsstufen, davon drei tatsächlich unterschiedlich, und mit Serializable eine echte Serialisierbarkeitsgarantie über Snapshot Isolation.',
  }),
  facette('sicherheit', 'Sicherheit', 'pg_hba, Rollen, RLS', {
    text: 'Der Zugriff wird an zwei Stellen entschieden: pg_hba.conf regelt, wer sich überhaupt verbinden darf, das Rollensystem regelt, was er dann tun kann. Row Level Security geht bis auf die Zeile herunter.',
  }),
  facette('betrieb', 'Betrieb', 'Backup, Vacuum, Monitoring', {
    text: 'Der Betrieb dreht sich um drei Dinge: funktionierende Backups mit Point-in-Time-Recovery, ein Autovacuum, das mit der Änderungsrate mithält, und Sichtbarkeit auf langsame Abfragen.',
  }),
]

/* -------------------------------------------------------- Ebene 4: Konzepte */

const datenmodell: Knoten[] = [
  konzept('datenmodell', 'typen', 'Typen und Domänen', 'Mehr als die SQL-Standardtypen', {
    punkte: [
      'Arrays sind ein eigener Typ, kein Umweg über eine Zwischentabelle',
      'Bereichstypen (int4range, tstzrange) mit eigenen Operatoren',
      'uuid, inet, cidr, macaddr, point, interval als eingebaute Typen',
      'DOMAIN legt einen Typ mit Prüfung fest und macht Regeln wiederverwendbar',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE DOMAIN auftragsnummer AS text
  CHECK (VALUE ~ '^A-[0-9]{4}-[0-9]{3}$');

CREATE TABLE auftraege (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nummer        auftragsnummer NOT NULL UNIQUE,
  tags          text[] DEFAULT '{}',
  laufzeit      tstzrange
);`,
    },
    warnung:
      'timestamptz statt timestamp verwenden. timestamp ohne Zeitzone speichert eine Uhrzeit ohne Bezugspunkt und ist fast immer ein Fehler.',
  }),
  konzept('datenmodell', 'constraints', 'Constraints', 'Integrität gehört in die Datenbank', {
    punkte: [
      'PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK als Grundausstattung',
      'EXCLUDE verhindert Überlappungen — etwa doppelte Maschinenbelegung',
      'ON DELETE CASCADE / RESTRICT steuert das Verhalten bei Löschungen',
      'DEFERRABLE verschiebt die Prüfung ans Transaktionsende',
    ],
    code: {
      sprache: 'sql',
      quelltext: `-- keine zwei Belegungen derselben Maschine zur selben Zeit
ALTER TABLE belegung ADD CONSTRAINT keine_ueberlappung
  EXCLUDE USING gist (
    maschine_id WITH =,
    zeitraum    WITH &&
  );`,
    },
    warnung:
      'Eine Regel, die nur in der Anwendung steht, gilt nicht für den zweiten Client, das Migrationsskript und die manuelle Korrektur um 2 Uhr nachts.',
  }),
  konzept('datenmodell', 'jsonb', 'JSONB', 'Dokumente im relationalen Haus', {
    text: 'jsonb speichert zerlegt und indizierbar, json speichert den Text unverändert. Für alles außer exakter Wiedergabe des Originals ist jsonb die richtige Wahl.',
    punkte: [
      'GIN-Index macht Suchen im Dokument schnell',
      'Operatoren: -> liefert JSON, ->> liefert Text, @> prüft Enthaltensein',
      'jsonb_path_query für JSONPath-Ausdrücke',
      'Gut für variable Attribute — schlecht als Ersatz für ein Schema',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE INDEX ON artikel USING gin (merkmale);

SELECT * FROM artikel
 WHERE merkmale @> '{"werkstoff": "1.4301"}';

SELECT merkmale ->> 'werkstoff' FROM artikel;`,
    },
  }),
  konzept('datenmodell', 'schemas', 'Schemas und search_path', 'Namensräume in der Datenbank', {
    punkte: [
      'Ein Schema ist ein Namensraum innerhalb einer Datenbank, nicht die Datenbank selbst',
      'public ist nur die Voreinstellung, kein Sonderfall',
      'search_path bestimmt, welches Schema ohne Präfix gilt',
      'Mandantentrennung per Schema ist möglich, skaliert aber nicht über hunderte Mandanten',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE SCHEMA werkstatt;
SET search_path TO werkstatt, public;`,
    },
    warnung:
      'Ein veränderbarer search_path ist eine Angriffsfläche in SECURITY DEFINER-Funktionen — dort immer explizit setzen.',
  }),
  konzept('datenmodell', 'partitionierung', 'Partitionierung', 'Große Tabellen aufteilen', {
    punkte: [
      'Deklarativ seit 10: RANGE, LIST und HASH',
      'Der Planer schließt nicht passende Partitionen aus (partition pruning)',
      'Alte Partitionen lassen sich per DETACH in Sekunden entfernen',
      'Der Partitionsschlüssel muss Teil jedes Unique-Constraints sein',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE TABLE messwerte (
  gemessen_am timestamptz NOT NULL,
  maschine_id bigint,
  wert        double precision
) PARTITION BY RANGE (gemessen_am);

CREATE TABLE messwerte_2026_09 PARTITION OF messwerte
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');`,
    },
  }),
]

const abfragen: Knoten[] = [
  konzept('abfragen', 'cte', 'CTEs und Fensterfunktionen', 'Lesbarkeit ohne Umweg', {
    punkte: [
      'WITH gliedert eine Abfrage in benannte Schritte',
      'WITH RECURSIVE löst Hierarchien und Stücklisten auf',
      'Fensterfunktionen rechnen über eine Zeilengruppe, ohne zu gruppieren',
      'Seit 12 werden CTEs standardmäßig inline eingesetzt — MATERIALIZED erzwingt das alte Verhalten',
    ],
    code: {
      sprache: 'sql',
      quelltext: `SELECT nummer,
       menge,
       SUM(menge) OVER (PARTITION BY kunde_id
                        ORDER BY erstellt_am) AS laufend
  FROM auftraege;`,
    },
  }),
  konzept('abfragen', 'indexarten', 'Indexarten', 'B-Tree ist nur einer von sechs', {
    punkte: [
      'B-Tree: Standard, für Gleichheit und Bereiche',
      'GIN: für zusammengesetzte Werte — jsonb, Arrays, Volltext',
      'GiST: für Geometrie, Bereiche und Ausschluss-Constraints',
      'BRIN: winzig, für sehr große und physisch sortierte Tabellen',
      'Partielle und Ausdrucksindexe sparen Platz und treffen genauer',
    ],
    code: {
      sprache: 'sql',
      quelltext: `-- nur die offenen Aufträge indizieren
CREATE INDEX ON auftraege (erstellt_am)
  WHERE status = 'offen';

-- Ausdrucksindex für Suche ohne Groß-/Kleinschreibung
CREATE INDEX ON kunden (lower(name));

CREATE INDEX CONCURRENTLY ON messwerte USING brin (gemessen_am);`,
    },
    warnung:
      'CREATE INDEX sperrt die Tabelle für Schreibvorgänge. Im Betrieb immer CONCURRENTLY — dauert länger, blockiert aber nicht.',
  }),
  konzept('abfragen', 'volltext', 'Volltextsuche', 'Eingebaut, ohne zweites System', {
    punkte: [
      'tsvector ist der zerlegte Text, tsquery die Suchanfrage',
      'Sprachkonfiguration steuert Stemming und Stoppwörter',
      'ts_rank sortiert nach Relevanz',
      'Für einfache bis mittlere Ansprüche reicht das — darüber Elasticsearch',
    ],
    code: {
      sprache: 'sql',
      quelltext: `ALTER TABLE artikel ADD COLUMN suche tsvector
  GENERATED ALWAYS AS (to_tsvector('german', bezeichnung)) STORED;

CREATE INDEX ON artikel USING gin (suche);

SELECT * FROM artikel
 WHERE suche @@ to_tsquery('german', 'welle & edelstahl');`,
    },
  }),
  konzept('abfragen', 'abfrageplan', 'Abfrageplan lesen', 'EXPLAIN ANALYZE', {
    punkte: [
      'EXPLAIN zeigt den geplanten Weg, ANALYZE führt aus und misst',
      'Seq Scan ist nicht per se schlecht — bei kleinen Tabellen ist er schneller',
      'Große Abweichung zwischen rows geschätzt und tatsächlich deutet auf veraltete Statistiken',
      'BUFFERS zeigt, wie viel aus dem Cache und wie viel von der Platte kam',
    ],
    code: {
      sprache: 'sql',
      quelltext: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM auftraege WHERE status = 'offen';

ANALYZE auftraege;   -- Statistiken auffrischen`,
    },
    warnung:
      'EXPLAIN ANALYZE führt die Abfrage wirklich aus. Bei UPDATE oder DELETE nur innerhalb einer Transaktion, die anschließend zurückgerollt wird.',
  }),
]

const architektur: Knoten[] = [
  konzept('architektur', 'prozessmodell', 'Prozessmodell', 'Ein Prozess je Verbindung', {
    text: 'PostgreSQL startet für jede Verbindung einen eigenen Betriebssystemprozess. Das ist robust, macht Verbindungen aber teuer.',
    punkte: [
      'Verbindungsaufbau kostet spürbar mehr als bei threadbasierten Systemen',
      'max_connections zu hoch zu setzen verschiebt das Problem nur',
      'PgBouncer oder ein Pool in der Anwendung ist ab wenigen hundert Verbindungen Pflicht',
      'Transaction Pooling ist der übliche Modus — verträgt sich nicht mit Prepared Statements ohne Konfiguration',
    ],
  }),
  konzept('architektur', 'mvcc', 'MVCC und VACUUM', 'Warum Aufräumen zum Modell gehört', {
    text: 'Ein UPDATE schreibt eine neue Tupelversion und markiert die alte als tot. Leser sehen weiterhin ihre Version — Leser und Schreiber blockieren sich nie.',
    punkte: [
      'Tote Tupel belegen Platz, bis VACUUM sie freigibt',
      'Autovacuum erledigt das laufend, muss aber mit der Änderungsrate mithalten',
      'Bloat entsteht, wenn es das nicht tut — die Tabelle wächst ohne mehr Daten',
      'VACUUM FULL schreibt die Tabelle neu und sperrt sie dabei vollständig',
    ],
    code: {
      sprache: 'sql',
      quelltext: `SELECT relname, n_dead_tup, last_autovacuum
  FROM pg_stat_user_tables
 ORDER BY n_dead_tup DESC LIMIT 10;`,
    },
    warnung:
      'Transaction ID Wraparound: Bleibt Vacuum über sehr lange Zeit aus, schaltet PostgreSQL zum Selbstschutz in den Nur-Lese-Modus. Die Warnungen im Log vorher ernst nehmen.',
  }),
  konzept('architektur', 'wal', 'Write-Ahead-Log', 'Grundlage für alles Weitere', {
    punkte: [
      'Änderungen gehen erst ins WAL, dann in die Datendateien',
      'Der Checkpoint schreibt geänderte Seiten gesammelt zurück',
      'Aus dem WAL entstehen Wiederherstellung, Replikation und PITR',
      'wal_level bestimmt, ob logische Replikation möglich ist',
    ],
  }),
  konzept('architektur', 'replikation', 'Replikation', 'Physisch oder logisch', {
    punkte: [
      'Streaming-Replikation überträgt das WAL — der Standby ist eine byteweise Kopie',
      'Hot Standby erlaubt Lesen auf dem Standby',
      'Synchron oder asynchron pro Verbindung einstellbar',
      'Logische Replikation überträgt Zeilenänderungen und kann einzelne Tabellen und Versionssprünge',
      'Automatisches Failover braucht ein zusätzliches Werkzeug wie Patroni',
    ],
    warnung:
      'PostgreSQL bringt kein automatisches Failover mit. Wer Hochverfügbarkeit braucht, baut sie mit Patroni, repmgr oder einem verwalteten Dienst dazu.',
  }),
  konzept('architektur', 'erweiterungen', 'Erweiterungen', 'Die eigentliche Besonderheit', {
    punkte: [
      'PostGIS: vollwertige Geodatenbank',
      'pgvector: Vektorsuche für Embeddings',
      'TimescaleDB: Zeitreihen mit automatischer Verdichtung',
      'pg_stat_statements: Statistik über alle Abfragen — praktisch immer sinnvoll',
      'Citus: verteilt PostgreSQL über mehrere Knoten',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT * FROM pg_available_extensions ORDER BY name;`,
    },
  }),
]

const konsistenz: Knoten[] = [
  konzept('konsistenz', 'isolation', 'Isolationsstufen', 'Drei, die sich unterscheiden', {
    punkte: [
      'Read Committed ist die Voreinstellung: jede Anweisung sieht einen frischen Snapshot',
      'Repeatable Read hält den Snapshot über die ganze Transaktion',
      'Serializable ergänzt Serializable Snapshot Isolation und erkennt echte Konflikte',
      'Read Uncommitted existiert nominell, verhält sich aber wie Read Committed',
    ],
    code: {
      sprache: 'sql',
      quelltext: `BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ...
COMMIT;`,
    },
    warnung:
      'Unter Serializable kann eine Transaktion mit serialization_failure abbrechen, obwohl inhaltlich alles korrekt war. Die Anwendung muss den Wiederholungsversuch beherrschen.',
  }),
  konzept('konsistenz', 'sperren', 'Sperren', 'Zeile, Tabelle, freiwillig', {
    punkte: [
      'SELECT ... FOR UPDATE sperrt gelesene Zeilen bis zum Transaktionsende',
      'FOR UPDATE SKIP LOCKED baut eine Warteschlange ohne zusätzliches System',
      'Advisory Locks sind freiwillige Sperren mit anwendungseigener Bedeutung',
      'ALTER TABLE nimmt eine ACCESS EXCLUSIVE-Sperre — im Betrieb heikel',
    ],
    code: {
      sprache: 'sql',
      quelltext: `-- Auftragswarteschlange ohne Konkurrenz
SELECT * FROM auftraege
 WHERE status = 'offen'
 ORDER BY erstellt_am
 LIMIT 1
 FOR UPDATE SKIP LOCKED;`,
    },
  }),
  konzept('konsistenz', 'deadlocks', 'Deadlocks', 'Erkannt, nicht verhindert', {
    punkte: [
      'PostgreSQL erkennt Deadlocks und bricht eine der Transaktionen ab',
      'Häufigste Ursache: zwei Transaktionen sperren dieselben Zeilen in anderer Reihenfolge',
      'Gegenmittel: Sperren immer in derselben Reihenfolge anfordern',
      'log_lock_waits macht sie im Log sichtbar, bevor sie auffallen',
    ],
  }),
  konzept('konsistenz', 'upsert', 'Upsert und Nebenläufigkeit', 'Prüfen und Einfügen ist ein Rennen', {
    text: 'Ein SELECT, gefolgt von einem INSERT, ist kein atomarer Vorgang. Zwischen beiden kann ein anderer Client einfügen.',
    code: {
      sprache: 'sql',
      quelltext: `INSERT INTO kunden (nummer, name)
VALUES ('K-1042', 'Meier GmbH')
ON CONFLICT (nummer)
DO UPDATE SET name = EXCLUDED.name;`,
    },
    warnung:
      'ON CONFLICT braucht einen passenden Unique-Constraint. Ohne ihn gibt es keinen Konflikt, den PostgreSQL erkennen könnte.',
  }),
]

const sicherheit: Knoten[] = [
  konzept('sicherheit', 'pg-hba', 'pg_hba.conf', 'Wer sich überhaupt verbinden darf', {
    text: 'Die Datei wird von oben nach unten gelesen, die erste passende Zeile entscheidet. Sie steht vor jeder Rechteprüfung.',
    punkte: [
      'Spalten: Verbindungsart, Datenbank, Benutzer, Adresse, Methode',
      'scram-sha-256 ist die richtige Methode — md5 gilt als überholt',
      'trust bedeutet: keine Prüfung. Nirgends außer in einem Wegwerf-Container',
      'Änderungen brauchen ein Neuladen, keinen Neustart',
    ],
    code: {
      sprache: 'text',
      quelltext: `# TYPE  DATABASE   USER          ADDRESS         METHOD
host    werkstatt  werkstatt_app 10.0.0.0/24     scram-sha-256
host    all        all           0.0.0.0/0       reject`,
    },
  }),
  konzept('sicherheit', 'rollen', 'Rollen und Rechte', 'Benutzer und Gruppen sind dasselbe', {
    punkte: [
      'Eine Rolle mit LOGIN ist ein Benutzer, ohne LOGIN eine Gruppe',
      'Rechte werden per GRANT vergeben und sind vererbbar',
      'Ab Version 15 hat public kein CREATE-Recht mehr im Schema public',
      'DEFAULT PRIVILEGES setzen Rechte für künftig erstellte Objekte',
    ],
    code: {
      sprache: 'sql',
      quelltext: `CREATE ROLE werkstatt_lesen;
GRANT SELECT ON ALL TABLES IN SCHEMA werkstatt TO werkstatt_lesen;

CREATE ROLE anna LOGIN PASSWORD :'pw';
GRANT werkstatt_lesen TO anna;`,
    },
  }),
  konzept('sicherheit', 'rls', 'Row Level Security', 'Rechte bis auf die Zeile', {
    text: 'Eine Policy filtert automatisch, welche Zeilen eine Rolle sieht oder ändern darf — unabhängig davon, welche Abfrage gestellt wird.',
    code: {
      sprache: 'sql',
      quelltext: `ALTER TABLE auftraege ENABLE ROW LEVEL SECURITY;

CREATE POLICY nur_eigene ON auftraege
  USING (mandant_id = current_setting('app.mandant')::bigint);`,
    },
    warnung:
      'Der Tabelleneigentümer umgeht RLS standardmäßig. FORCE ROW LEVEL SECURITY gilt auch für ihn.',
  }),
  konzept('sicherheit', 'injection', 'SQL-Injection', 'Parametrisieren, nicht zusammensetzen', {
    code: {
      sprache: 'javascript',
      quelltext: `// VERWUNDBAR
client.query(\`SELECT * FROM kunden WHERE name = '\${name}'\`)

// RICHTIG — der Wert erreicht den Parser nie als Code
client.query('SELECT * FROM kunden WHERE name = $1', [name])`,
    },
    punkte: [
      'Parametrisierte Abfragen lösen das Problem vollständig',
      'Tabellen- und Spaltennamen lassen sich nicht parametrisieren — dort mit Positivliste arbeiten',
      'format() mit %I und %L quotiert in PL/pgSQL korrekt',
    ],
  }),
  konzept('sicherheit', 'tls', 'TLS und Verschlüsselung', 'Transport und Ruhe', {
    punkte: [
      'ssl = on in der Konfiguration, sslmode=verify-full auf Clientseite',
      'sslmode=require prüft das Zertifikat nicht — schützt nicht vor Man-in-the-Middle',
      'Verschlüsselung im Ruhezustand über das Dateisystem (LUKS), nicht in PostgreSQL selbst',
      'pgcrypto verschlüsselt einzelne Spalten, verlagert die Schlüsselfrage aber nur',
    ],
  }),
]

const betrieb: Knoten[] = [
  konzept('betrieb', 'docker', 'Installation per Docker', 'Schneller Einstieg', {
    code: {
      sprache: 'yaml',
      quelltext: `services:
  db:
    image: postgres:17
    restart: unless-stopped
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_DB: werkstatt
      POSTGRES_USER: werkstatt
      POSTGRES_PASSWORD_FILE: /run/secrets/pg_pw
    volumes:
      - pg-daten:/var/lib/postgresql/data
    secrets:
      - pg_pw

volumes:
  pg-daten:

secrets:
  pg_pw:
    file: ./secrets/pg_pw.txt`,
    },
    warnung:
      'Das offizielle Image legt die Datenbank nur beim ersten Start an. Spätere Änderungen an POSTGRES_DB bleiben wirkungslos.',
  }),
  konzept('betrieb', 'backup', 'Backup und PITR', 'Logisch oder physisch', {
    punkte: [
      'pg_dump: logisch, versionsübergreifend, gut für einzelne Datenbanken',
      'pg_basebackup: physische Kopie des gesamten Clusters',
      'Point-in-Time-Recovery braucht Basisbackup plus fortlaufende WAL-Archivierung',
      'pgBackRest oder barman nehmen einem die Verwaltung ab',
    ],
    code: {
      sprache: 'bash',
      quelltext: `pg_dump -Fc -d werkstatt -f werkstatt_$(date +%F).dump
pg_restore -d werkstatt_neu werkstatt_2026-09-09.dump

pg_basebackup -D /backup/basis -Ft -z -P`,
    },
    warnung: 'Ein Backup ohne getesteten Restore ist kein Backup.',
  }),
  konzept('betrieb', 'monitoring', 'Monitoring', 'Wo es klemmt', {
    punkte: [
      'pg_stat_activity zeigt laufende Abfragen und Wartezustände',
      'pg_stat_statements summiert Laufzeiten über alle Aufrufe — die wichtigste Erweiterung',
      'pg_stat_user_tables zeigt Scans, tote Tupel und Vacuum-Zeitpunkte',
      'Kennzahlen: Cache-Trefferquote, Replikations-Lag, älteste offene Transaktion',
    ],
    code: {
      sprache: 'sql',
      quelltext: `SELECT query, calls, mean_exec_time
  FROM pg_stat_statements
 ORDER BY mean_exec_time DESC LIMIT 10;

SELECT pid, state, wait_event, query
  FROM pg_stat_activity WHERE state <> 'idle';`,
    },
  }),
  konzept('betrieb', 'wartung', 'Wartung', 'Was regelmäßig fällig ist', {
    punkte: [
      'Autovacuum überwachen statt manuell vacuumieren',
      'ANALYZE nach großen Datenänderungen, damit der Planer richtig schätzt',
      'REINDEX CONCURRENTLY gegen aufgeblähte Indexe',
      'Ungenutzte Indexe über pg_stat_user_indexes finden und entfernen',
    ],
    code: {
      sprache: 'sql',
      quelltext: `SELECT relname, indexrelname, idx_scan
  FROM pg_stat_user_indexes
 WHERE idx_scan = 0 ORDER BY relname;`,
    },
  }),
  konzept('betrieb', 'upgrade', 'Versionssprünge', 'Major ist kein Neustart', {
    punkte: [
      'Nebenversionen (17.2 auf 17.3): Paket tauschen, neu starten',
      'Hauptversionen: pg_upgrade oder Dump und Restore',
      'pg_upgrade --link ist schnell, aber ohne Rückweg',
      'Jede Hauptversion wird fünf Jahre gepflegt',
    ],
  }),
]

export const postgresql: Knoten[] = [
  traeger,
  ...facetten,
  ...datenmodell,
  ...abfragen,
  ...architektur,
  ...konsistenz,
  ...sicherheit,
  ...betrieb,
]
