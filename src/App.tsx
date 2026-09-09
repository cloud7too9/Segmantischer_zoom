import { Zoomflaeche } from './ansicht/Zoomflaeche'
import { registriereKnoten, registriereUniversum } from './kern/registry'
import { datenbanken, datenbankKnoten } from './inhalt/datenbanken'
import type { Ort } from './kern/pfad'

// Registrierung beim Modulstart. Kommen später weitere Universen dazu,
// wird hier nur ergaenzt — der Renderer bleibt unberuehrt.
registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

const start: Ort = { universum: datenbanken.id, werte: [] }

export default function App() {
  return <Zoomflaeche startOrt={start} />
}
