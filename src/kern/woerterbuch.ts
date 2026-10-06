/**
 * Das Wörterbuch: zentrale Quelle für alle Begriffe und Themengebiete
 * (docs/verweise/03). Es wird ZUR LAUFZEIT erweitert, nie im Code —
 * ein neuer Eintrag ist Daten, kein neuer Programmcode (README Nr. 24/29).
 *
 * Jede Änderung erhöht eine Version und benachrichtigt Abonnenten. Die
 * Erkennung (erkennung.ts) baut ihren Index daraus neu, und weil sie beim
 * Rendern läuft, wirkt ein neuer Eintrag sofort in allen bestehenden Texten
 * (docs/verweise/02).
 */
import type { Woerterbucheintrag } from './typen'

const eintraege = new Map<string, Woerterbucheintrag>()
const abonnenten = new Set<() => void>()
let stand = 0

function melde(): void {
  stand++
  for (const a of abonnenten) a()
}

/**
 * Erweiterungsfunktion zur Laufzeit: legt Einträge an oder ersetzt sie.
 * Gleiche ID = derselbe Eintrag (MH-DEC-001: die ID ist stabil, das
 * sichtbare Wort darf sich ändern).
 */
export function ergaenzeWoerterbuch(...liste: readonly Woerterbucheintrag[]): void {
  if (liste.length === 0) return
  for (const e of liste) eintraege.set(e.id, e)
  melde()
}

/** Teilweise Änderung eines bestehenden Eintrags, z. B. eine nachgetragene Wortform. */
export function aendereEintrag(
  id: string,
  aenderung: Partial<Omit<Woerterbucheintrag, 'id' | 'art'>>,
): boolean {
  const alt = eintraege.get(id)
  if (!alt) return false
  eintraege.set(id, { ...alt, ...aenderung } as Woerterbucheintrag)
  melde()
  return true
}

/** MH-DEC-001: deaktivieren statt löschen — bestehende Daten bleiben gültig. */
export function deaktiviereEintrag(id: string): boolean {
  return aendereEintrag(id, { deaktiviert: true })
}

export function aktiviereEintrag(id: string): boolean {
  return aendereEintrag(id, { deaktiviert: false })
}

export function holeEintrag(id: string): Woerterbucheintrag | undefined {
  return eintraege.get(id)
}

export function alleEintraege(): Woerterbucheintrag[] {
  return [...eintraege.values()]
}

/** Nur die Einträge, die Verweise erzeugen dürfen. */
export function aktiveEintraege(): Woerterbucheintrag[] {
  return alleEintraege().filter((e) => !e.deaktiviert)
}

/** Monoton wachsend; ändert sich bei jeder Erweiterung. Grundlage für Caches. */
export function woerterbuchStand(): number {
  return stand
}

/**
 * Abonnement für Oberflächen (passt auf React `useSyncExternalStore`):
 * Rückgabe ist die Abmeldefunktion.
 */
export function abonniereWoerterbuch(hoerer: () => void): () => void {
  abonnenten.add(hoerer)
  return () => {
    abonnenten.delete(hoerer)
  }
}

/** Für Proben: alles verwerfen. */
export function leereWoerterbuch(): void {
  eintraege.clear()
  melde()
}
