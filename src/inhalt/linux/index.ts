import type { Knoten } from '../../kern/typen'
import { clusterKnoten } from './cluster'
import { konfigurationKnoten } from './etc'
import { zustandKnoten } from './var'
import { kernelsichtKnoten } from './kernel'

export { linux } from './universum'

/**
 * Drei der neun Cluster sind bis auf die Blattebene ausgearbeitet. Die
 * übrigen tragen vorerst nur ihren Steckbrief — dieselbe Staffelung wie
 * im Universum Datenbanken, wo Redis ohne Facetten steht.
 */
export const linuxKnoten: Knoten[] = [
  ...clusterKnoten,
  ...konfigurationKnoten,
  ...zustandKnoten,
  ...kernelsichtKnoten,
]
