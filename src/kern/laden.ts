/**
 * Laden ist vom Mounten getrennt (README Nr. 22).
 *
 * Im Prototyp liegt der Inhalt statisch in der Registry, die Naht ist aber
 * schon da: Sobald Knoten als JSON nachgeladen werden, wird hier ein fetch
 * daraus — und der Prefetch für einen späteren kontinuierlichen Übergang
 * hängt sich an dieselbe Stelle, ohne dass eine Komponente sich ändert.
 */
import type { Ort } from './pfad'
import { holeUniversum } from './registry'
import { kinder, knotenAmOrt } from './baum'
import type { Knoten, Universum } from './typen'

export interface Ebenendaten {
  readonly ort: Ort
  readonly universum: Universum
  readonly knoten?: Knoten
  readonly kinder: readonly Knoten[]
}

/** Synchron, weil bereits geladen — die Signatur bleibt trotzdem stabil. */
export function ladeEbene(ort: Ort): Ebenendaten | undefined {
  if (!ort.universum) return undefined
  const universum = holeUniversum(ort.universum)
  if (!universum) return undefined
  return {
    ort,
    universum,
    knoten: knotenAmOrt(ort, universum),
    kinder: kinder(ort, universum),
  }
}

/**
 * Platzhalter für den späteren Prefetch. Wird vom Übergang aufgerufen,
 * bevor animiert wird — README Nr. 18: der Übergang wartet nie auf Daten.
 */
export function bereiteVor(ort: Ort): void {
  void ladeEbene(ort)
}
