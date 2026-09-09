/**
 * Registry aller Universen und Knoten. Bewusst schlank gehalten:
 * das Laden geht ueber laden.ts, damit Mounten und Laden getrennt bleiben
 * (README Nr. 22, Vorbereitung fuer den kontinuierlichen Uebergang).
 */
import type { Knoten, Universum } from './typen'

const universen = new Map<string, Universum>()
const knoten = new Map<string, Knoten>()

export function registriereUniversum(u: Universum): void {
  universen.set(u.id, u)
}

export function registriereKnoten(...liste: Knoten[]): void {
  for (const k of liste) knoten.set(k.id, k)
}

export function holeUniversum(id: string): Universum | undefined {
  return universen.get(id)
}

export function alleUniversen(): Universum[] {
  return [...universen.values()]
}

export function alleKnoten(): Knoten[] {
  return [...knoten.values()]
}

export function holeKnoten(id: string): Knoten | undefined {
  return knoten.get(id)
}
