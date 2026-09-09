/**
 * Pfad <-> Koordinate. README Nr. 16: Der Zustand IST der Pfad.
 * Deep Links, Zurueck-Button und Brotkrume fallen damit ohne Zusatzarbeit an.
 */
import type { Koordinate, Universum } from './typen'

export interface Ort {
  /** undefined = Wurzelebene (Liste der Universen). */
  readonly universum?: string
  /** Achswerte in Achsenreihenfolge, ohne Luecken. */
  readonly werte: readonly string[]
}

export function ortAusPfad(pfad: string): Ort {
  const teile = pfad.split('/').filter(Boolean).map(decodeURIComponent)
  if (teile.length === 0) return { werte: [] }
  return { universum: teile[0], werte: teile.slice(1) }
}

export function pfadAusOrt(ort: Ort): string {
  if (!ort.universum) return '/'
  return '/' + [ort.universum, ...ort.werte].map(encodeURIComponent).join('/')
}

/** Tiefe = Anzahl bestimmter Achsen. 0 = Universumsebene. */
export function tiefe(ort: Ort): number {
  return ort.werte.length
}

export function hinein(ort: Ort, wert: string): Ort {
  return { universum: ort.universum, werte: [...ort.werte, wert] }
}

export function heraus(ort: Ort): Ort | undefined {
  if (!ort.universum) return undefined
  if (ort.werte.length === 0) return { werte: [] }
  return { universum: ort.universum, werte: ort.werte.slice(0, -1) }
}

/** Koordinate des Ortes gemaess der Achsenreihenfolge des Universums. */
export function koordinateAusOrt(ort: Ort, universum: Universum): Koordinate {
  const k: Record<string, string | undefined> = {}
  universum.achsen.forEach((achse, i) => {
    k[achse] = ort.werte[i]
  })
  return k
}
