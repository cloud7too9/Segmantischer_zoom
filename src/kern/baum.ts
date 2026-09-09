/**
 * Der Baum wird BERECHNET (README Nr. 8).
 *
 * Eine Ebene entsteht aus den DISTINKTEN WERTEN der naechsten Achse — nicht
 * daraus, wie viele Achsen ein Knoten zufaellig gesetzt hat. Dieser
 * Unterschied ist der Grund, warum die Achsenreihenfolge frei umsortiert
 * werden kann: `universum.achsen` bestimmt die Matrix, dieselben Knoten
 * ergeben einen anderen Baum, ohne dass ein Datensatz angefasst wird.
 *
 * Ein Wert wird durch den Knoten mit den WENIGSTEN gesetzten Achsen
 * vertreten: bei typ=dokument ist das der Kategorieknoten "Dokument" und
 * nicht MongoDB, das denselben Wert nur mittraegt.
 */
import type { Knoten, Universum } from './typen'
import { alleKnoten } from './registry'
import type { Ort } from './pfad'

/** Wie viele Achsen sind ueberhaupt gesetzt — reihenfolgeunabhaengig. */
function achsenzahl(k: Knoten, u: Universum): number {
  return u.achsen.reduce((n, a) => (k.koordinate[a] === undefined ? n : n + 1), 0)
}

/** Traegt der Knoten alle bereits festgelegten Achswerte des Ortes? */
function passtZuOrt(k: Knoten, u: Universum, ort: Ort): boolean {
  if (k.heimat !== u.id) return false
  return ort.werte.every((wert, i) => k.koordinate[u.achsen[i]] === wert)
}

/** Der sparsamste Knoten gewinnt — er vertritt den Wert, statt ihn nur zu tragen. */
function sparsamer(a: Knoten, b: Knoten, u: Universum): Knoten {
  return achsenzahl(a, u) <= achsenzahl(b, u) ? a : b
}

/** Direkte Kinder des Ortes: ein Eintrag je distinktem Wert der naechsten Achse. */
export function kinder(ort: Ort, u: Universum): Knoten[] {
  const achse = u.achsen[ort.werte.length]
  if (!achse) return []

  const nachWert = new Map<string, Knoten>()
  for (const k of alleKnoten()) {
    if (!passtZuOrt(k, u, ort)) continue
    const wert = k.koordinate[achse]
    if (wert === undefined) continue
    const bisher = nachWert.get(wert)
    nachWert.set(wert, bisher ? sparsamer(bisher, k, u) : k)
  }
  return [...nachWert.values()]
}

/**
 * Der Knoten, auf dem der Ort selbst steht: der sparsamste unter allen,
 * die zum Ort passen. Auf Universumsebene gibt es keinen.
 */
export function knotenAmOrt(ort: Ort, u: Universum): Knoten | undefined {
  if (ort.werte.length === 0) return undefined
  let treffer: Knoten | undefined
  for (const k of alleKnoten()) {
    if (!passtZuOrt(k, u, ort)) continue
    treffer = treffer ? sparsamer(treffer, k, u) : k
  }
  return treffer
}

/** Kette vom Universum bis zum aktuellen Ort — Grundlage der Brotkrume. */
export function ahnen(ort: Ort, u: Universum): { ort: Ort; titel: string }[] {
  const kette: { ort: Ort; titel: string }[] = [
    { ort: { universum: u.id, werte: [] }, titel: u.titel },
  ]
  for (let i = 1; i <= ort.werte.length; i++) {
    const teilOrt: Ort = { universum: u.id, werte: ort.werte.slice(0, i) }
    const k = knotenAmOrt(teilOrt, u)
    kette.push({ ort: teilOrt, titel: k?.titel ?? ort.werte[i - 1] })
  }
  return kette
}

/**
 * Sichtbarer Inhalt eines Knotens: Kern immer, Overlay des aktuellen
 * Universums zusaetzlich (README Nr. 12/13). Der Kern muss allein tragen.
 */
export function sichtbarerInhalt(k: Knoten, universumId: string) {
  return { kern: k.kern, overlay: k.overlays?.[universumId] }
}
