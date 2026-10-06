import { Zoomflaeche } from './ansicht/Zoomflaeche'
import { Woerterbuch } from './ansicht/Woerterbuch'
import { useOrt } from './kern/route'
import { registriereKnoten, registriereUniversum } from './kern/registry'
import { lokalerWissensspeicher, lokalerWoerterbuchspeicher, verbindeSpeicher, verbindeWoerterbuchSpeicher } from './kern/speicher'
import { datenbanken, datenbankKnoten } from './inhalt/datenbanken'
import type { Ort } from './kern/pfad'

// Registrierung beim Modulstart. Kommen später weitere Universen dazu,
// wird hier nur ergaenzt — der Renderer bleibt unberuehrt.
registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

// Laufzeitänderungen überleben den Neustart (README Nr. 22). Was im
// Speicher ungültig geworden ist, darf den Start nicht verhindern.
try {
  verbindeSpeicher(lokalerWissensspeicher())
} catch (fehler) {
  console.warn('Gespeicherte Änderungen nicht übernommen:', fehler)
}
try {
  verbindeWoerterbuchSpeicher(lokalerWoerterbuchspeicher())
} catch (fehler) {
  console.warn('Gespeichertes Wörterbuch nicht übernommen:', fehler)
}

const start: Ort = { universum: datenbanken.id, werte: [] }

/** Reservierter Pfad für den eigenen Bereich Wörterbuch — kein Universum. */
export const WOERTERBUCH_PFAD = 'woerterbuch'

export default function App() {
  const { ort, gehe } = useOrt()
  if (ort.universum === WOERTERBUCH_PFAD) {
    return <Woerterbuch aufZurueck={() => gehe(start, 'sprung')} />
  }
  return <Zoomflaeche startOrt={start} />
}
