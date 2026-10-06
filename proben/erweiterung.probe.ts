/**
 * Probe der Erweiterungslogik: Themen und Inhaltsblöcke wachsen zur
 * Laufzeit, ohne dass Code angefasst wird (README Nr. 24–29). Geprüft
 * gegen kern/registry.ts, kern/speicher.ts und die Baumberechnung.
 */
import {
  aendereKnoten,
  aktiviereKnoten,
  deaktiviereKnoten,
  entferneOverlay,
  ergaenzeInhalt,
  ergaenzeKnoten,
  ergaenzeUniversum,
  holeKnoten,
  laufzeitAenderungen,
  pruefeKnoten,
  registriereKnoten,
  registriereUniversum,
  setzeInhalt,
  verwerfeLaufzeitaenderungen,
  wissensStand,
} from '../src/kern/registry'
import { exportiereAenderungen, gedaechtnisSpeicher, importiereAenderungen, verbindeSpeicher } from '../src/kern/speicher'
import { datenbanken, datenbankKnoten } from '../src/inhalt/datenbanken'
import { kinder, knotenAmOrt, sichtbarerInhalt } from '../src/kern/baum'
import { ladeEbene } from '../src/kern/laden'
import type { Knoten, Universum } from '../src/kern/typen'

registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

let fehler = 0
function pruefe(name: string, ist: unknown, soll: unknown) {
  const ok = JSON.stringify(ist) === JSON.stringify(soll)
  if (!ok) fehler++
  console.log(`${ok ? 'OK  ' : 'FEHL'}  ${name}` + (ok ? '' : ` — erwartet ${JSON.stringify(soll)}, ist ${JSON.stringify(ist)}`))
}
function wirft(name: string, tu: () => void, erwartetImText: string) {
  try {
    tu()
    fehler++
    console.log(`FEHL  ${name} — hat nicht geworfen`)
  } catch (e) {
    const text = e instanceof Error ? e.message : String(e)
    pruefe(name, text.includes(erwartetImText), true)
  }
}

const U = datenbanken
const ort = (...werte: string[]) => ({ universum: U.id, werte })
const standVorher = wissensStand()

// --- Neuer Träger im bestehenden Universum ---------------------------------
const mysql: Knoten = {
  id: 'mysql',
  titel: 'MySQL',
  kurz: 'Weit verbreitetes relationales DBMS',
  heimat: U.id,
  koordinate: { typ: 'relational', traeger: 'mysql' },
  art: 'traeger',
  gruppe: 'sql',
  kern: { text: 'MySQL ist ein relationales Datenbanksystem.' },
}
pruefe('MySQL fehlt vorher', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite'])
ergaenzeKnoten(mysql)
pruefe('MySQL erscheint sofort im Baum', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite', 'mysql'])
pruefe('Stand hat sich erhöht', wissensStand() > standVorher, true)
pruefe('Knoten am neuen Ort', knotenAmOrt(ort('relational', 'mysql'), U)?.titel, 'MySQL')

// --- Inhaltsblöcke ---------------------------------------------------------
ergaenzeInhalt('mysql', 'kern', { punkte: ['InnoDB als Standard-Engine'] })
pruefe('Kern feldweise ergänzt, Text bleibt', holeKnoten('mysql')?.kern, {
  text: 'MySQL ist ein relationales Datenbanksystem.',
  punkte: ['InnoDB als Standard-Engine'],
})
setzeInhalt('mysql', { overlay: U.id }, { text: 'Overlay-Text' })
pruefe('Overlay angelegt', sichtbarerInhalt(holeKnoten('mysql')!, U.id).overlay?.text, 'Overlay-Text')
ergaenzeInhalt('mysql', { overlay: U.id }, { warnung: 'Achtung' })
pruefe('Overlay feldweise ergänzt', holeKnoten('mysql')?.overlays?.[U.id], { text: 'Overlay-Text', warnung: 'Achtung' })
entferneOverlay('mysql', U.id)
pruefe('Overlay entfernt', holeKnoten('mysql')?.overlays, undefined)
pruefe('Statischen Knoten ändern', aendereKnoten('mongodb', { kurz: 'geändert' }), true)
pruefe('Änderung sichtbar', holeKnoten('mongodb')?.kurz, 'geändert')
pruefe('Unbekannter Knoten: false', aendereKnoten('gibt-es-nicht', { kurz: 'x' }), false)

// --- Validierung -----------------------------------------------------------
pruefe('Gültiger Knoten hat keine Mängel', pruefeKnoten(mysql), [])
wirft('Unbekannte Heimat wird abgelehnt', () => ergaenzeKnoten({ ...mysql, id: 'x1', heimat: 'nirgends' }), 'Heimat-Universum')
wirft('Fremde Achse wird abgelehnt', () => ergaenzeKnoten({ ...mysql, id: 'x2', koordinate: { typ: 'relational', farbe: 'rot' } }), 'Achse „farbe"')
wirft('Leerer Kern wird abgelehnt', () => ergaenzeKnoten({ ...mysql, id: 'x3', kern: {} }), 'allein lesbar')
wirft('Unbekannte Facette wird abgelehnt', () => ergaenzeKnoten({ ...mysql, id: 'x4', koordinate: { typ: 'relational', traeger: 'mysql', facette: 'kosten' } }), 'Facette „kosten"')
wirft('Unbekannte Gruppe wird abgelehnt', () => ergaenzeKnoten({ ...mysql, id: 'x5', gruppe: 'graph' }), 'Gruppe „graph"')
wirft('Overlay für unbekanntes Universum', () => ergaenzeKnoten({ ...mysql, id: 'x6', overlays: { mars: { text: 'x' } } }), 'Overlay')
pruefe('Abgelehnte Knoten wurden nicht übernommen', ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'].some((id) => holeKnoten(id)), false)
wirft('Universum ohne Achsen wird abgelehnt', () => ergaenzeUniversum({ id: 'leer', titel: 'Leer', kurz: '', achsen: [], facetten: [] }), 'Achse')

// --- Neues Universum zur Laufzeit -------------------------------------------
const netzwerke: Universum = {
  id: 'netzwerke',
  titel: 'Netzwerke',
  kurz: 'Schichten, Protokolle, Geräte',
  achsen: ['schicht', 'protokoll'],
  facetten: [],
}
ergaenzeUniversum(netzwerke)
ergaenzeKnoten({
  id: 'schicht-transport',
  titel: 'Transport',
  heimat: 'netzwerke',
  koordinate: { schicht: 'transport' },
  art: 'kategorie',
  kern: { text: 'Ende-zu-Ende-Verbindungen.' },
})
pruefe('Neues Universum ladbar', ladeEbene({ universum: 'netzwerke', werte: [] })?.kinder.map((k) => k.id), ['schicht-transport'])
pruefe('Overlay auf das neue Universum ist jetzt erlaubt', setzeInhalt('mysql', { overlay: 'netzwerke' }, { text: 'MySQL über TCP 3306' }), true)

// --- Deaktivieren statt löschen (MH-DEC-001) ---------------------------------
deaktiviereKnoten('mysql')
pruefe('Deaktiviert: nicht im Baum', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite'])
pruefe('Deaktiviert: Datensatz bleibt', holeKnoten('mysql')?.deaktiviert, true)
aktiviereKnoten('mysql')
pruefe('Reaktiviert: wieder im Baum', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite', 'mysql'])

// --- Speicher: nur Laufzeitänderungen, Rundlauf -----------------------------
const a = laufzeitAenderungen()
pruefe('Gespeichert werden nur Laufzeitänderungen', [a.universen.map((u) => u.id), a.knoten.map((k) => k.id).sort()], [['netzwerke'], ['mongodb', 'mysql', 'schicht-transport']])

const sicherung = exportiereAenderungen()
verwerfeLaufzeitaenderungen()
pruefe('Nach Verwerfen: Grundbestand', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite'])
pruefe('Nach Verwerfen: MongoDB fällt auf die Code-Fassung zurück', holeKnoten('mongodb')?.kurz, datenbankKnoten.find((k) => k.id === 'mongodb')?.kurz)
importiereAenderungen(sicherung)
pruefe('Import stellt alles wieder her', kinder(ort('relational'), U).map((k) => k.id), ['postgresql', 'sqlite', 'mysql'])
pruefe('Import: Universum und Knoten', ladeEbene({ universum: 'netzwerke', werte: [] })?.kinder.length, 1)
wirft('Import mit falschem Format', () => importiereAenderungen('{"format":99}'), 'Format')

verwerfeLaufzeitaenderungen()
const speicher = gedaechtnisSpeicher()
speicher.speichere(a)
const trennen = verbindeSpeicher(speicher)
pruefe('Verbinden lädt den Speicher', holeKnoten('mysql')?.titel, 'MySQL')
aendereKnoten('mysql', { titel: 'MySQL 8' })
pruefe('Jede Änderung wird zurückgeschrieben', speicher.lade()?.knoten.find((k) => k.id === 'mysql')?.titel, 'MySQL 8')
trennen()
aendereKnoten('mysql', { titel: 'MySQL 9' })
pruefe('Nach Trennen nicht mehr', speicher.lade()?.knoten.find((k) => k.id === 'mysql')?.titel, 'MySQL 8')

console.log(fehler === 0 ? '\nAlle Proben bestanden.' : `\n${fehler} Probe(n) fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
