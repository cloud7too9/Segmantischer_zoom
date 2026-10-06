/**
 * Der Wissensbestand: alle Universen und Knoten samt Inhaltsblöcken.
 *
 * README Nr. 29: Der Code beschreibt das Wissenssystem, die Daten den
 * aktuellen Wissensbestand. Deshalb gibt es hier zwei Wege hinein:
 *
 *   - `registriere*`  — der statische Grundbestand aus src/inhalt, beim
 *                        Modulstart. Er zählt nicht als Laufzeitänderung.
 *   - `ergaenze*`, `aendere*`, `deaktiviere*`, `setzeInhalt` — die
 *                        Erweiterung zur Laufzeit (README Nr. 24–27).
 *                        Jede Änderung wird geprüft, als Laufzeitänderung
 *                        gemerkt (für speicher.ts) und gemeldet, damit die
 *                        Oberfläche neu rendert.
 *
 * Das Laden bleibt in laden.ts, damit Mounten und Laden getrennt sind
 * (README Nr. 22).
 */
import type { Inhalt, Knoten, Knotenart, Universum } from './typen'

const universen = new Map<string, Universum>()
const knoten = new Map<string, Knoten>()

/** Der statische Grundbestand, unverändert — zum Wiederherstellen nach Verwerfen. */
const grundUniversen = new Map<string, Universum>()
const grundKnoten = new Map<string, Knoten>()

/** IDs, die zur Laufzeit angelegt oder geändert wurden — nur die werden gespeichert. */
const laufzeitUniversen = new Set<string>()
const laufzeitKnoten = new Set<string>()

const abonnenten = new Set<() => void>()
let stand = 0

function melde(): void {
  stand++
  for (const a of abonnenten) a()
}

// ---------------------------------------------------------------------------
// Statischer Grundbestand
// ---------------------------------------------------------------------------

export function registriereUniversum(u: Universum): void {
  universen.set(u.id, u)
  grundUniversen.set(u.id, u)
}

export function registriereKnoten(...liste: Knoten[]): void {
  for (const k of liste) {
    knoten.set(k.id, k)
    grundKnoten.set(k.id, k)
  }
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

export function holeUniversum(id: string): Universum | undefined {
  return universen.get(id)
}

export function alleUniversen(): Universum[] {
  return [...universen.values()]
}

export function aktiveUniversen(): Universum[] {
  return alleUniversen().filter((u) => !u.deaktiviert)
}

export function alleKnoten(): Knoten[] {
  return [...knoten.values()]
}

/** Nur die Knoten, die im Baum erscheinen dürfen. */
export function aktiveKnoten(): Knoten[] {
  return alleKnoten().filter((k) => !k.deaktiviert)
}

export function holeKnoten(id: string): Knoten | undefined {
  return knoten.get(id)
}

/** Monoton wachsend; ändert sich bei jeder Laufzeitänderung. */
export function wissensStand(): number {
  return stand
}

/** Abonnement für Oberflächen und den Speicher. Rückgabe ist die Abmeldefunktion. */
export function abonniereWissen(hoerer: () => void): () => void {
  abonnenten.add(hoerer)
  return () => {
    abonnenten.delete(hoerer)
  }
}

// ---------------------------------------------------------------------------
// Validierung (README Nr. 21: die Anwendung kennt die Regeln, nicht die Themen)
// ---------------------------------------------------------------------------

const KNOTENARTEN: readonly Knotenart[] = ['kategorie', 'traeger', 'facette', 'konzept', 'erklaerung']

function istLeer(inhalt: Inhalt | undefined): boolean {
  return !inhalt || (!inhalt.text && !(inhalt.punkte && inhalt.punkte.length) && !inhalt.code && !inhalt.warnung)
}

/** Mängel eines Universums; leer = gültig. */
export function pruefeUniversum(u: Universum): string[] {
  const maengel: string[] = []
  if (!u.id?.trim()) maengel.push('Universum braucht eine ID.')
  if (!u.titel?.trim()) maengel.push('Universum braucht einen Titel.')
  if (!u.achsen?.length) maengel.push('Universum braucht mindestens eine Achse.')
  if (new Set(u.achsen).size !== u.achsen?.length) maengel.push('Achsen müssen eindeutig sein.')
  const facetten = u.facetten?.map((f) => f.id) ?? []
  if (new Set(facetten).size !== facetten.length) maengel.push('Facetten-IDs müssen eindeutig sein.')
  const gruppen = u.gruppen?.map((g) => g.id) ?? []
  if (new Set(gruppen).size !== gruppen.length) maengel.push('Gruppen-IDs müssen eindeutig sein.')
  return maengel
}

/**
 * Mängel eines Knotens gegen den aktuellen Bestand; leer = gültig.
 * `neueUniversen` erlaubt, Universum und Knoten in einem Zug zu prüfen.
 */
export function pruefeKnoten(k: Knoten, neueUniversen: readonly Universum[] = []): string[] {
  const maengel: string[] = []
  if (!k.id?.trim()) maengel.push('Knoten braucht eine ID.')
  if (!k.titel?.trim()) maengel.push(`Knoten „${k.id}" braucht einen Titel.`)
  if (!KNOTENARTEN.includes(k.art)) maengel.push(`Knoten „${k.id}": unbekannte Art „${k.art}".`)

  const heimat = neueUniversen.find((u) => u.id === k.heimat) ?? universen.get(k.heimat)
  if (!heimat) {
    maengel.push(`Knoten „${k.id}": Heimat-Universum „${k.heimat}" ist unbekannt (README Nr. 11).`)
  } else {
    for (const achse of Object.keys(k.koordinate ?? {})) {
      if (!heimat.achsen.includes(achse)) {
        maengel.push(`Knoten „${k.id}": Achse „${achse}" gibt es in „${heimat.id}" nicht.`)
      }
    }
    if (k.gruppe && !heimat.gruppen?.some((g) => g.id === k.gruppe)) {
      maengel.push(`Knoten „${k.id}": Gruppe „${k.gruppe}" gibt es in „${heimat.id}" nicht.`)
    }
    const facette = k.koordinate?.facette
    if (facette && !heimat.facetten.some((f) => f.id === facette)) {
      maengel.push(`Knoten „${k.id}": Facette „${facette}" steht nicht im Schema von „${heimat.id}" (README Nr. 9).`)
    }
  }

  if (istLeer(k.kern)) maengel.push(`Knoten „${k.id}": der Kern muss allein lesbar sein, ist aber leer (README Nr. 13).`)
  for (const id of Object.keys(k.overlays ?? {})) {
    if (!universen.has(id) && !neueUniversen.some((u) => u.id === id)) {
      maengel.push(`Knoten „${k.id}": Overlay für unbekanntes Universum „${id}".`)
    }
  }
  return maengel
}

function wirfBeiMaengeln(maengel: string[]): void {
  if (maengel.length) throw new Error(maengel.join('\n'))
}

// ---------------------------------------------------------------------------
// Erweiterung zur Laufzeit: Themen
// ---------------------------------------------------------------------------

/** Legt Universen an oder ersetzt sie. Gleiche ID = dasselbe Universum. */
export function ergaenzeUniversum(...liste: readonly Universum[]): void {
  if (liste.length === 0) return
  wirfBeiMaengeln(liste.flatMap(pruefeUniversum))
  for (const u of liste) {
    universen.set(u.id, u)
    laufzeitUniversen.add(u.id)
  }
  melde()
}

export function aendereUniversum(id: string, aenderung: Partial<Omit<Universum, 'id'>>): boolean {
  const alt = universen.get(id)
  if (!alt) return false
  const neu = { ...alt, ...aenderung }
  wirfBeiMaengeln(pruefeUniversum(neu))
  universen.set(id, neu)
  laufzeitUniversen.add(id)
  melde()
  return true
}

/** Legt Knoten an oder ersetzt sie. Alle werden erst geprüft, dann übernommen. */
export function ergaenzeKnoten(...liste: readonly Knoten[]): void {
  if (liste.length === 0) return
  wirfBeiMaengeln(liste.flatMap((k) => pruefeKnoten(k)))
  for (const k of liste) {
    knoten.set(k.id, k)
    laufzeitKnoten.add(k.id)
  }
  melde()
}

export function aendereKnoten(id: string, aenderung: Partial<Omit<Knoten, 'id'>>): boolean {
  const alt = knoten.get(id)
  if (!alt) return false
  const neu = { ...alt, ...aenderung }
  wirfBeiMaengeln(pruefeKnoten(neu))
  knoten.set(id, neu)
  laufzeitKnoten.add(id)
  melde()
  return true
}

/** MH-DEC-001: deaktivieren statt löschen. Pfade und Verweise bleiben gültig. */
export function deaktiviereKnoten(id: string): boolean {
  return aendereKnoten(id, { deaktiviert: true })
}

export function aktiviereKnoten(id: string): boolean {
  return aendereKnoten(id, { deaktiviert: false })
}

export function deaktiviereUniversum(id: string): boolean {
  return aendereUniversum(id, { deaktiviert: true })
}

// ---------------------------------------------------------------------------
// Erweiterung zur Laufzeit: Inhaltsblöcke
// ---------------------------------------------------------------------------

/** Wohin ein Inhaltsblock gehört: in den Kern oder in das Overlay eines Universums. */
export type Inhaltsbereich = 'kern' | { readonly overlay: string }

/** Ersetzt den Inhaltsblock eines Bereichs. Ein leeres Overlay wird entfernt. */
export function setzeInhalt(knotenId: string, bereich: Inhaltsbereich, inhalt: Inhalt): boolean {
  const alt = knoten.get(knotenId)
  if (!alt) return false
  if (bereich === 'kern') return aendereKnoten(knotenId, { kern: inhalt })

  const overlays: Record<string, Inhalt> = { ...alt.overlays }
  if (istLeer(inhalt)) delete overlays[bereich.overlay]
  else overlays[bereich.overlay] = inhalt
  return aendereKnoten(knotenId, { overlays: Object.keys(overlays).length ? overlays : undefined })
}

/**
 * Ergänzt einen Inhaltsblock feldweise: gesetzte Felder ersetzen, nicht
 * gesetzte bleiben. Ein Overlay, das es noch nicht gibt, entsteht dabei.
 */
export function ergaenzeInhalt(knotenId: string, bereich: Inhaltsbereich, teil: Partial<Inhalt>): boolean {
  const alt = knoten.get(knotenId)
  if (!alt) return false
  const bisher = bereich === 'kern' ? alt.kern : alt.overlays?.[bereich.overlay]
  return setzeInhalt(knotenId, bereich, { ...bisher, ...teil })
}

export function entferneOverlay(knotenId: string, universumId: string): boolean {
  return setzeInhalt(knotenId, { overlay: universumId }, {})
}

// ---------------------------------------------------------------------------
// Laufzeitänderungen für den Speicher
// ---------------------------------------------------------------------------

export interface Aenderungen {
  readonly universen: readonly Universum[]
  readonly knoten: readonly Knoten[]
}

/** Alles, was zur Laufzeit angelegt oder geändert wurde — der statische Bestand nicht. */
export function laufzeitAenderungen(): Aenderungen {
  return {
    universen: [...laufzeitUniversen].map((id) => universen.get(id)).filter((u): u is Universum => !!u),
    knoten: [...laufzeitKnoten].map((id) => knoten.get(id)).filter((k): k is Knoten => !!k),
  }
}

/** Spielt gespeicherte Änderungen über den Grundbestand. Universen zuerst, damit Knoten sie finden. */
export function uebernehmeAenderungen(a: Aenderungen): void {
  wirfBeiMaengeln([
    ...a.universen.flatMap(pruefeUniversum),
    ...a.knoten.flatMap((k) => pruefeKnoten(k, a.universen)),
  ])
  for (const u of a.universen) {
    universen.set(u.id, u)
    laufzeitUniversen.add(u.id)
  }
  for (const k of a.knoten) {
    knoten.set(k.id, k)
    laufzeitKnoten.add(k.id)
  }
  melde()
}

/**
 * Laufzeitänderungen verwerfen: zur Laufzeit Angelegtes verschwindet,
 * zur Laufzeit Geändertes fällt auf die Code-Fassung zurück.
 */
export function verwerfeLaufzeitaenderungen(): void {
  for (const id of laufzeitUniversen) {
    const grund = grundUniversen.get(id)
    if (grund) universen.set(id, grund)
    else universen.delete(id)
  }
  for (const id of laufzeitKnoten) {
    const grund = grundKnoten.get(id)
    if (grund) knoten.set(id, grund)
    else knoten.delete(id)
  }
  laufzeitUniversen.clear()
  laufzeitKnoten.clear()
  melde()
}
