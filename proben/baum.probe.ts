/**
 * Probe der Baumberechnung gegen die echte Logik aus kern/baum.ts.
 * Sichert die tragende Regel ab: der Baum faellt aus den Koordinaten,
 * er ist nirgends gespeichert (README Nr. 8).
 */
import { registriereKnoten, registriereUniversum } from '../src/kern/registry'
import { datenbanken, datenbankKnoten } from '../src/inhalt/datenbanken'
import { ahnen, kinder, knotenAmOrt } from '../src/kern/baum'
import { ortAusPfad, pfadAusOrt } from '../src/kern/pfad'

registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

let fehler = 0
function pruefe(name: string, ist: unknown, soll: unknown) {
  const ok = JSON.stringify(ist) === JSON.stringify(soll)
  if (!ok) fehler++
  console.log(`${ok ? 'OK  ' : 'FEHL'}  ${name}` + (ok ? '' : ` — erwartet ${JSON.stringify(soll)}, ist ${JSON.stringify(ist)}`))
}

const U = datenbanken
const ort = (...werte: string[]) => ({ universum: U.id, werte })

pruefe('Typenebene: 8 Typen + 1 Erklaerungsknoten', kinder(ort(), U).length, 9)
pruefe('unter Dokument: MongoDB', kinder(ort('dokument'), U).map((k) => k.id), ['mongodb'])
pruefe('MongoDB: sechs Facetten', kinder(ort('dokument', 'mongodb'), U).length, 6)
pruefe('Facetten in Schemareihenfolge', kinder(ort('dokument', 'mongodb'), U).map((k) => k.koordinate.facette), U.facetten.map((f) => f.id))
pruefe('Datenmodell: fuenf Konzepte', kinder(ort('dokument', 'mongodb', 'datenmodell'), U).length, 5)

// Jede Facette muss Konzepte tragen — sonst ist die Zoomstufe eine Sackgasse
// statt einer Ebene (README Nr. 1).
const ausgebauteTraeger: [string, string][] = [
  ['dokument', 'mongodb'],
  ['relational', 'postgresql'],
  ['relational', 'sqlite'],
]

for (const [typ, traeger] of ausgebauteTraeger) {
  const eigene = kinder(ort(typ, traeger), U)
  pruefe(`${traeger}: alle sechs Facetten`, eigene.map((k) => k.koordinate.facette), U.facetten.map((f) => f.id))
  for (const f of U.facetten) {
    const anzahl = kinder(ort(typ, traeger, f.id), U).length
    pruefe(`${traeger}/${f.id} hat Konzepte`, anzahl > 0, true)
    pruefe(`${traeger}/${f.id} bleibt ueberschaubar (<= 9)`, anzahl <= 9, true)
  }
}

// Die Typenebene darf nicht ueber neun Kacheln wachsen (README Nr. 2).
pruefe('Typenebene bleibt bei hoechstens 9 Kacheln', kinder(ort(), U).length <= 9, true)

pruefe('Blattebene hat keine Kinder mehr', kinder(ort('dokument', 'mongodb', 'sicherheit', 'injection'), U).length, 0)
pruefe('unter Relational: PostgreSQL und SQLite', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite'])

// Kein Knoten darf zwei Heimaten haben (README Nr. 11), und IDs sind eindeutig.
const ids = datenbankKnoten.map((k) => k.id)
pruefe('IDs sind eindeutig', new Set(ids).size, ids.length)
pruefe('alle Knoten haben dieselbe Heimat', new Set(datenbankKnoten.map((k) => k.heimat)).size, 1)
pruefe('Knoten am Ort', knotenAmOrt(ort('dokument', 'mongodb'), U)?.id, 'mongodb')
pruefe('Universumsebene hat keinen eigenen Knoten', knotenAmOrt(ort(), U), undefined)

pruefe('Brotkrume MongoDB', ahnen(ort('dokument', 'mongodb'), U).map((a) => a.titel), ['Datenbanken', 'Dokument', 'MongoDB'])
pruefe('Brotkrume Blatt', ahnen(ort('dokument', 'mongodb', 'datenmodell', 'embedding'), U).map((a) => a.titel), ['Datenbanken', 'Dokument', 'MongoDB', 'Datenmodell', 'Embedding oder Referenzieren'])

const p = '/datenbanken/dokument/mongodb/datenmodell/embedding'
pruefe('Pfad ist verlustfrei umkehrbar', pfadAusOrt(ortAusPfad(p)), p)

// Der eigentliche Beweis: Achsenreihenfolge tauschen ergibt eine andere
// Matrix aus denselben Knoten — ohne Datenmigration (README, Nicht-Ziele).
const andereMatrix = { ...U, achsen: ['traeger', 'typ', 'facette', 'konzept'] as const }
pruefe(
  'Andere Achsenreihenfolge ergibt andere Wurzelebene',
  kinder(ort(), andereMatrix).map((k) => k.id).sort(),
  ['mongodb', 'postgresql', 'redis', 'sqlite'],
)

console.log(fehler === 0 ? '\nAlle Proben bestanden.' : `\n${fehler} Probe(n) fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
