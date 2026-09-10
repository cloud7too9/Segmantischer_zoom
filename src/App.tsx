import { Zoomflaeche } from './ansicht/Zoomflaeche'
import { registriereKnoten, registriereUniversum } from './kern/registry'
import { datenbanken, datenbankKnoten } from './inhalt/datenbanken'
import { linux, linuxKnoten } from './inhalt/linux'
import type { Ort } from './kern/pfad'

// Registrierung beim Modulstart. Ein weiteres Universum ist genau das:
// zwei Zeilen hier. Der Renderer bleibt unberuehrt (README Nr. 17).
registriereUniversum(datenbanken)
registriereKnoten(...datenbankKnoten)

registriereUniversum(linux)
registriereKnoten(...linuxKnoten)

const start: Ort = { universum: datenbanken.id, werte: [] }

export default function App() {
  return <Zoomflaeche startOrt={start} />
}
