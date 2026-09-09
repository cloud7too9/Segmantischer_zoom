import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const H = 'datenbanken'
const TYP = 'dokument'
const TRAEGER = 'mongodb'

const { facette, konzept } = baukasten(TYP, TRAEGER)

/* ------------------------------------------------------------ Ebene 2: Träger
 * Der Steckbrief ist die Darstellung des Knotens selbst (README Nr. 5),
 * keine Kachel auf der Ebene darunter.
 */
const traeger: Knoten = {
  id: 'mongodb',
  titel: 'MongoDB',
  kurz: 'Dokumentorientiert, horizontal skalierbar',
  heimat: H,
  koordinate: { typ: TYP, traeger: TRAEGER },
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
}

/* ------------------------------------------------------- Ebene 3: Facetten */

const facetten: Knoten[] = [
  facette('datenmodell', 'Datenmodell', 'BSON, Embedding, Schema', {
    text: 'Die zentrale Designentscheidung in MongoDB ist nicht das Schema, sondern die Frage, was eingebettet und was referenziert wird. Sie entscheidet über Lesekosten, Dokumentgröße und Änderungsaufwand gleichermaßen.',
  }),
  facette('abfragen', 'Abfragen', 'MQL, Aggregation, Indexe', {
    text: 'MQL für den Alltag, die Aggregation Pipeline für Auswertungen. Beides steht und fällt mit den Indexen — ohne passenden Index wird aus jeder Abfrage ein vollständiger Durchlauf der Collection.',
  }),
  facette('architektur', 'Architektur', 'Replica Set, Sharding', {
    text: 'WiredTiger als Speicher-Engine, Replica Sets für Verfügbarkeit, Sharding für horizontale Skalierung. Der Shard Key ist die folgenreichste Entscheidung im ganzen Betrieb.',
  }),
  facette('konsistenz', 'Konsistenz', 'Concerns, Transaktionen', {
    text: 'Einzelne Dokumente sind immer atomar. Alles darüber hinaus wird über Write Concern, Read Concern und Read Preference eingestellt — Konsistenz ist hier eine Stellschraube, keine Konstante.',
  }),
  facette('sicherheit', 'Sicherheit', 'Auth, RBAC, Injection', {
    text: 'Authentifizierung ist bei einer Selbstinstallation nicht automatisch aktiv. Das ist der Ursprung der bekannten Vorfälle — und der praktisch häufigere Fehler sitzt in der Anwendung, nicht im Server.',
  }),
  facette('betrieb', 'Betrieb', 'Backup, Monitoring', {
    text: 'Logische Dumps, Dateisystem-Snapshots oder verwaltetes Backup. Entscheidend ist weniger die Methode als der getestete Restore.',
  }),
]

/* -------------------------------------------------------- Ebene 4: Konzepte
 * README Nr. 21: hier keine Prosa — Regel, Beispiel, Anti-Pattern.
 * Das ist die Nachschlage-Ebene, die zwanzigmal gelesen wird.
 */

const datenmodell: Knoten[] = [
  konzept('datenmodell', 'bson', 'BSON und Datentypen', 'Binäres JSON mit Zusatztypen', {
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
    warnung:
      'Ein JavaScript-Number ist ein Double. Ohne NumberDecimal entstehen Rundungsfehler bei Beträgen.',
  }),
  konzept('datenmodell', 'dokumente', 'Dokumente und Collections', 'Begriffe gegenüber SQL', {
    punkte: [
      'Collection entspricht der Tabelle, Dokument der Zeile, Feld der Spalte',
      'Eingebettetes Dokument ersetzt den JOIN',
      '$lookup entspricht dem JOIN, ist aber deutlich teurer',
      'Collections werden beim ersten Schreibvorgang implizit angelegt',
    ],
  }),
  konzept('datenmodell', 'embedding', 'Embedding oder Referenzieren', 'Die zentrale Entscheidung', {
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
    warnung:
      'Anti-Pattern: unbegrenzt wachsende Arrays. Alle Maschinenlogs in einem Dokument laufen in die 16-MB-Grenze.',
  }),
  konzept('datenmodell', 'validierung', 'Schema-Validierung', 'Schemafrei heißt nicht schemalos', {
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
  }),
  konzept('datenmodell', 'grenzen', 'Grenzen', 'Harte Limits des Modells', {
    punkte: [
      'Dokument maximal 16 MB — größere Inhalte in GridFS oder Objektspeicher',
      'Aggregation-Stage maximal 100 MB ohne allowDiskUse',
      'Verschachtelung maximal 100 Ebenen tief',
      'Indexschlüssel maximal 1024 Byte',
    ],
  }),
]

const abfragen: Knoten[] = [
  konzept('abfragen', 'mql', 'MQL — Filter und Projektion', 'Der Alltag', {
    punkte: [
      'Vergleich: $eq $ne $gt $gte $lt $lte $in $nin',
      'Logik: $and $or $not $nor — $and ist bei mehreren Feldern implizit',
      'Punktnotation greift in verschachtelte Felder',
      'Ein Array-Feld trifft bereits, wenn ein einzelnes Element passt',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.auftraege.find({ status: "in_arbeit" })
db.auftraege.find({ menge: { $gte: 100, $lt: 500 } })
db.auftraege.find({ "kunde.ort": "Viernau" })
db.auftraege.find({ tags: "eilig" })      // Array enthält Wert

// Projektion: nur diese Felder, ohne _id
db.auftraege.find({ status: "offen" },
                  { auftragsnummer: 1, kunde: 1, _id: 0 })`,
    },
  }),
  konzept('abfragen', 'aggregation', 'Aggregation Pipeline', 'Auswertungen in Stufen', {
    text: 'Dokumente durchlaufen mehrere Stufen. Jede Stufe bekommt, was die vorige ausgibt.',
    punkte: [
      '$match und $sort so früh wie möglich — nur dann greifen Indexe',
      'Jede Stufe hat 100 MB Speicherlimit, darüber { allowDiskUse: true }',
      '$lookup ist kein echter Hash-Join und deutlich langsamer als in SQL',
      '$facet erlaubt mehrere Auswertungen über denselben Eingabestrom',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.auftraege.aggregate([
  { $match:  { erstelltAm: { $gte: ISODate("2026-01-01") } } },
  { $group:  { _id: "$kundeId",
               anzahl: { $sum: 1 },
               menge:  { $sum: "$menge" } } },
  { $sort:   { menge: -1 } },
  { $limit:  10 }
])`,
    },
  }),
  konzept('abfragen', 'indexe', 'Indexe', 'Typen und die ESR-Regel', {
    punkte: [
      'Single Field, Compound, Multikey (auf Arrays), Text, 2dsphere, Hashed',
      'TTL löscht automatisch nach Ablaufzeit — Sessions, Logs',
      'Partial und Sparse indizieren nur eine Teilmenge',
      'ESR-Regel für Compound: Equality, dann Sort, dann Range',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `// Equality -> Sort -> Range
db.auftraege.createIndex({ status: 1, erstelltAm: -1, menge: 1 })

db.sessions.createIndex({ erstelltAm: 1 }, { expireAfterSeconds: 3600 })
db.auftraege.createIndex({ auftragsnummer: 1 }, { unique: true })
db.auftraege.getIndexes()`,
    },
    warnung:
      'Jeder Index kostet Schreibleistung und Speicher. Ungenutzte Indexe sind kein neutraler Zustand.',
  }),
  konzept('abfragen', 'abfrageplan', 'Abfrageplan lesen', 'explain und Profiler', {
    punkte: [
      'COLLSCAN im Plan ist das Warnsignal, IXSCAN das Ziel',
      'totalDocsExamined nahe an nReturned bedeutet einen passenden Index',
      'Der Profiler schneidet langsame Abfragen dauerhaft mit',
      'Ergebnisse landen in system.profile und lassen sich abfragen',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.auftraege.find({ status: "offen" }).explain("executionStats")

db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)`,
    },
  }),
]

const architektur: Knoten[] = [
  konzept('architektur', 'wiredtiger', 'WiredTiger', 'Die Speicher-Engine', {
    punkte: [
      'MVCC — Leser blockieren Schreiber nicht',
      'Sperren auf Dokumentebene statt auf Collection-Ebene',
      'Snappy-Kompression für Daten, Prefix-Kompression für Indexe',
      'Cache standardmäßig 50 % des RAM minus 1 GB',
      'Journal als Write-Ahead-Log, alle 100 ms auf Platte',
    ],
  }),
  konzept('architektur', 'replica-set', 'Replica Set', 'Der Produktionsstandard', {
    text: 'Ein Primary nimmt alle Schreibvorgänge entgegen, Secondaries folgen über das Oplog.',
    punkte: [
      'Oplog ist eine capped collection mit idempotenten Operationen',
      'Automatische Wahl eines neuen Primary, typisch in 10 bis 12 Sekunden',
      'Ungerade Knotenzahl für den Mehrheitsentscheid',
      'Voraussetzung für Multi-Dokument-Transaktionen und Change Streams',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `rs.status()
rs.conf()
db.printSecondaryReplicationInfo()   // Replikations-Lag`,
    },
    warnung:
      'Arbiter (stimmberechtigt, ohne Daten) gelten als günstiger dritter Knoten, werden aber nicht mehr empfohlen — sie können keine Mehrheit für w:"majority" liefern.',
  }),
  konzept('architektur', 'sharding', 'Sharding', 'Horizontale Skalierung', {
    punkte: [
      'mongos ist der Router, an den sich die Anwendung verbindet',
      'Config Server halten als eigenes Replica Set die Metadaten',
      'Jeder Shard ist selbst ein vollständiges Replica Set',
      'Der Balancer verteilt Chunks zwischen den Shards',
    ],
    warnung:
      'Sharding erst bei echtem Bedarf. Ein Replica Set auf ausreichender Hardware trägt sehr weit und ist deutlich einfacher zu betreiben.',
  }),
  konzept('architektur', 'shard-key', 'Shard Key wählen', 'Die folgenreichste Entscheidung', {
    punkte: [
      'Ranged: gut für Bereichsabfragen, Hotspot-Risiko bei monoton steigenden Werten',
      'Hashed: gleichmäßige Verteilung, aber Bereichsabfragen treffen alle Shards',
      'Ein guter Key hat hohe Kardinalität, geringe Häufung und passt zum Abfragemuster',
      'Seit 5.0 ist Resharding möglich, bleibt aber eine teure Operation',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `sh.shardCollection("werkstatt.auftraege", { kundeId: "hashed" })
sh.status()`,
    },
    warnung:
      'Ein ObjectId oder Zeitstempel als Ranged Key schreibt alles auf denselben Shard — der klassische Hotspot.',
  }),
]

const konsistenz: Knoten[] = [
  konzept('konsistenz', 'atomaritaet', 'Atomarität', 'Was ohne Transaktion sicher ist', {
    text: 'Ein einzelnes Dokument wird immer atomar geschrieben — auch bei verschachtelten Feldern und mehreren Operatoren in einem Update.',
    punkte: [
      'Gutes Schema-Design macht viele Transaktionen überflüssig',
      '$inc, $push und $set in einem Update sind gemeinsam atomar',
      'findAndModify liest und schreibt in einem Schritt',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `// atomar, obwohl zwei Felder betroffen sind
db.auftraege.updateOne(
  { auftragsnummer: "A-2026-118" },
  { $set: { status: "in_arbeit" }, $inc: { versuche: 1 } }
)`,
    },
  }),
  konzept('konsistenz', 'write-concern', 'Write Concern', 'Wie viel Bestätigung ein Schreibvorgang braucht', {
    punkte: [
      'w: 1 — nur der Primary bestätigt, Datenverlust bei Failover möglich',
      'w: "majority" — Mehrheit der Knoten, Standard seit 5.0',
      'j: true — erst nach Schreiben ins Journal',
      'wtimeout begrenzt die Wartezeit, verhindert aber kein Schreiben',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.auftraege.insertOne(
  { auftragsnummer: "A-2026-119" },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
)`,
    },
  }),
  konzept('konsistenz', 'read-concern', 'Read Concern und Preference', 'Wie aktuell und von wo gelesen wird', {
    punkte: [
      'Read Concern: local, available, majority, linearizable, snapshot',
      'Read Preference: primary (Standard), primaryPreferred, secondary, nearest',
      'Lesen von Secondaries skaliert, liefert aber möglicherweise veraltete Daten',
      'majority liest nur, was mehrheitlich bestätigt ist — kein Rollback sichtbar',
    ],
    warnung:
      'secondary als Read Preference ist kein kostenloser Durchsatz. Wer danach schreibt, arbeitet unter Umständen auf veraltetem Stand.',
  }),
  konzept('konsistenz', 'transaktionen', 'Multi-Dokument-Transaktionen', 'Möglich, aber teuer', {
    punkte: [
      'Seit 4.0 auf Replica Sets, seit 4.2 auch über Shards hinweg',
      'Standardlimit 60 Sekunden Laufzeit',
      'Deutlich teurer als in relationalen Datenbanken',
      'Erste Wahl bleibt ein Schema, das ohne sie auskommt',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `const sitzung = db.getMongo().startSession()
sitzung.startTransaction()
try {
  // ... mehrere Schreibvorgänge ...
  sitzung.commitTransaction()
} catch (e) {
  sitzung.abortTransaction()
} finally {
  sitzung.endSession()
}`,
    },
  }),
]

const sicherheit: Knoten[] = [
  konzept('sicherheit', 'auth', 'Authentifizierung aktivieren', 'Die historische Schwachstelle', {
    text: 'Eine frische Selbstinstallation startet ohne Authentifizierung. In Kombination mit bindIp 0.0.0.0 führte das 2017 zu einer massenhaften Ransomware-Welle.',
    punkte: [
      'Seit 3.6 bindet MongoDB standardmäßig nur an 127.0.0.1',
      'Authentifizierung ist trotzdem weiterhin nicht automatisch aktiv',
      'Administrator-Benutzer anlegen, bevor die Auth aktiviert wird',
      'Port 27017 zusätzlich per Firewall abschotten',
    ],
    code: {
      sprache: 'yaml',
      quelltext: `# mongod.conf
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1
  port: 27017`,
    },
    warnung:
      'Reihenfolge beachten: Wird die Auth vor dem Anlegen des Administrators aktiviert, sperrt man sich aus.',
  }),
  konzept('sicherheit', 'rbac', 'Rollen und Rechte', 'Minimal vergeben', {
    punkte: [
      'SCRAM-SHA-256 ist der Standardmechanismus',
      'x.509-Zertifikate, LDAP und Kerberos in der Enterprise-Variante',
      'Eingebaute Rollen: read, readWrite, dbAdmin, clusterAdmin, root',
      'Eine Anwendung bekommt readWrite auf genau ihre Datenbank — nie root',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.createUser({
  user: "werkstatt_app",
  pwd: passwordPrompt(),
  roles: [{ role: "readWrite", db: "werkstatt" }]
})`,
    },
  }),
  konzept('sicherheit', 'verschluesselung', 'Verschlüsselung', 'Transport, Ruhe, Feldebene', {
    punkte: [
      'Transport: TLS 1.2 oder neuer, auch zwischen den Cluster-Knoten',
      'At Rest: WiredTiger Encryption (Enterprise) oder LUKS auf Dateisystemebene',
      'CSFLE verschlüsselt einzelne Felder im Treiber — der Server sieht nur Chiffrat',
      'Queryable Encryption ist seit 7.0 allgemein verfügbar: verschlüsselt und trotzdem durchsuchbar',
    ],
  }),
  konzept('sicherheit', 'injection', 'NoSQL-Injection', 'Der häufigste Anwendungsfehler', {
    text: 'Wird ein JSON-Body ungeprüft in eine Query gesteckt, kann ein Angreifer Operatoren einschleusen.',
    code: {
      sprache: 'javascript',
      quelltext: `// VERWUNDBAR
db.benutzer.findOne({
  name: req.body.name,
  passwort: req.body.passwort
})

// Angreifer sendet:
// { "name": "admin", "passwort": { "$ne": null } }
// -> Login umgangen`,
    },
    warnung:
      'Gegenmaßnahmen: Eingaben typisieren und validieren, niemals rohe Request-Objekte in Filter geben, Passwörter grundsätzlich per Hash-Vergleich in der Anwendung prüfen.',
  }),
  konzept('sicherheit', 'haertung', 'Härtungs-Checkliste', 'Vor dem Produktivgang', {
    punkte: [
      'authorization aktiviert, Administrator vorher angelegt',
      'bindIp auf konkrete Adressen begrenzt, Port per Firewall geschlossen',
      'TLS für Client- und Cluster-Verbindungen aktiv',
      'Rollen minimal vergeben, keine Anwendung mit root',
      'Patchstand aktuell — MongoBleed (CVE-2025-14847) betraf ältere Stände',
      'Backups getestet und außerhalb des Servers gelagert',
    ],
  }),
]

const betrieb: Knoten[] = [
  konzept('betrieb', 'docker', 'Installation per Docker', 'Der schnellste Einstieg', {
    code: {
      sprache: 'yaml',
      quelltext: `services:
  mongo:
    image: mongo:8.0
    restart: unless-stopped
    ports:
      - "127.0.0.1:27017:27017"   # nur lokal erreichbar
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_pw
    volumes:
      - mongo-daten:/data/db
    secrets:
      - mongo_pw

volumes:
  mongo-daten:

secrets:
  mongo_pw:
    file: ./secrets/mongo_pw.txt`,
    },
    warnung:
      'Ohne die Bindung an 127.0.0.1 veröffentlicht Docker den Port an allen Schnittstellen — vorbei an einer UFW-Regel.',
  }),
  konzept('betrieb', 'backup', 'Backup und Restore', 'Methode zweitrangig, Restore entscheidend', {
    punkte: [
      'mongodump und mongorestore: logisch, einfach, für klein bis mittel',
      'Dateisystem-Snapshot: für große Datenmengen, konsistent nur mit Journal auf demselben Volume',
      'Ops Manager oder Atlas: Point-in-Time-Recovery, kommerziell',
    ],
    code: {
      sprache: 'bash',
      quelltext: `mongodump --uri="mongodb://user:pw@localhost:27017" \\
          --db=werkstatt --out=/backup/$(date +%F)

mongorestore --uri="mongodb://user:pw@localhost:27017" \\
             --db=werkstatt /backup/2026-09-09/werkstatt`,
    },
    warnung: 'Ein Backup ohne getesteten Restore ist kein Backup.',
  }),
  konzept('betrieb', 'monitoring', 'Monitoring', 'Was im Blick bleiben muss', {
    punkte: [
      'Werkzeuge: mongostat, mongotop, db.serverStatus(), db.currentOp()',
      'Prometheus über den mongodb_exporter für dauerhafte Reihen',
      'Kennzahlen: Cache-Trefferquote, Replikations-Lag, Verbindungsanzahl',
      'Warnsignal: steigende Zahl an COLLSCANs oder wachsende Queue-Längen',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.serverStatus().connections
db.serverStatus().wiredTiger.cache["bytes currently in the cache"]
db.currentOp({ secs_running: { $gt: 5 } })`,
    },
  }),
  konzept('betrieb', 'wartung', 'Wartung', 'Wiederkehrende Handgriffe', {
    punkte: [
      'db.collection.stats() zeigt Größe, Indexgröße und Dokumentzahl',
      'compact gibt belegten Platz an das Dateisystem zurück — sperrt dabei',
      'Ungenutzte Indexe über $indexStats finden und entfernen',
      'Versionssprünge nur eine Major-Stufe auf einmal',
    ],
    code: {
      sprache: 'javascript',
      quelltext: `db.auftraege.aggregate([{ $indexStats: {} }])
db.auftraege.stats().totalIndexSize`,
    },
  }),
]

export const mongodb: Knoten[] = [
  traeger,
  ...facetten,
  ...datenmodell,
  ...abfragen,
  ...architektur,
  ...konsistenz,
  ...sicherheit,
  ...betrieb,
]
