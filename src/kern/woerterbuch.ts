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
import type { Woerterbucheintrag, Wortart } from './typen'
import { holeUniversum } from './registry'

const eintraege = new Map<string, Woerterbucheintrag>()
const abonnenten = new Set<() => void>()
let stand = 0

function melde(): void {
  stand++
  for (const a of abonnenten) a()
}

export const WORTARTEN: readonly Wortart[] = ['nomen', 'adjektiv', 'verb', 'eigenname']

/** Mängel eines Eintrags; leer = gültig. */
export function pruefeEintrag(e: Woerterbucheintrag): string[] {
  const maengel: string[] = []
  if (!e.id?.trim()) maengel.push('Eintrag braucht eine ID.')
  if (!e.wort?.trim()) maengel.push(`Eintrag „${e.id}" braucht ein Wort.`)
  if (!e.lemma?.trim()) maengel.push(`Eintrag „${e.id}" braucht ein Lemma.`)
  if (!WORTARTEN.includes(e.wortart)) maengel.push(`Eintrag „${e.id}": unbekannte Wortart „${e.wortart}".`)
  if (!e.definition?.trim()) maengel.push(`Eintrag „${e.id}" braucht eine Definition.`)
  if (e.art === 'themengebiet') {
    if (!e.universum) maengel.push(`Themengebiet „${e.id}" braucht ein Ziel-Universum.`)
    else if (!holeUniversum(e.universum)) maengel.push(`Themengebiet „${e.id}": Universum „${e.universum}" ist unbekannt.`)
  } else if ((e as { art: string }).art !== 'begriff') {
    maengel.push(`Eintrag „${e.id}": unbekannte Art.`)
  }
  return maengel
}

function wirfBeiMaengeln(maengel: string[]): void {
  if (maengel.length) throw new Error(maengel.join('\n'))
}

/**
 * Erweiterungsfunktion zur Laufzeit: legt Einträge an oder ersetzt sie.
 * Gleiche ID = derselbe Eintrag (MH-DEC-001: die ID ist stabil, das
 * sichtbare Wort darf sich ändern). Alle werden erst geprüft, dann übernommen.
 */
export function ergaenzeWoerterbuch(...liste: readonly Woerterbucheintrag[]): void {
  if (liste.length === 0) return
  wirfBeiMaengeln(liste.flatMap(pruefeEintrag))
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
  const neu = { ...alt, ...aenderung } as Woerterbucheintrag
  wirfBeiMaengeln(pruefeEintrag(neu))
  eintraege.set(id, neu)
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

/** Ersetzt den gesamten Bestand — für den Speicher und den Import. */
export function uebernehmeWoerterbuch(liste: readonly Woerterbucheintrag[]): void {
  wirfBeiMaengeln(liste.flatMap(pruefeEintrag))
  eintraege.clear()
  for (const e of liste) eintraege.set(e.id, e)
  melde()
}

/** Für Proben: alles verwerfen. */
export function leereWoerterbuch(): void {
  eintraege.clear()
  melde()
}
