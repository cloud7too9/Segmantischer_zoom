import { Zoomflaeche } from './ansicht/Zoomflaeche'
import { registriereKnoten, registriereUniversum } from './kern/registry'
import { lokalerSpeicher, verbindeSpeicher } from './kern/speicher'
import { datenbanken, datenbankKnoten } from './inhalt/datenbanken'
import type { Ort } from './kern/pfad'

// Registrierung beim Modulstart. Kommen später weitere Universen dazu,
// wird hier nur ergaenzt — der Renderer bleibt unberuehrt.
registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

// Laufzeitänderungen überleben den Neustart (README Nr. 22). Was im
// Speicher ungültig geworden ist, darf den Start nicht verhindern.
try {
  verbindeSpeicher(lokalerSpeicher())
} catch (fehler) {
  console.warn('Gespeicherte Änderungen nicht übernommen:', fehler)
}

const start: Ort = { universum: datenbanken.id, werte: [] }

export default function App() {
  return <Zoomflaeche startOrt={start} />
}
