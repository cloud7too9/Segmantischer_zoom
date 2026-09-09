/**
 * README Nr. 16: Der Zustand IST der Pfad.
 * Damit fallen Deep Links, Zurück-Button und Brotkrume ohne Zusatzarbeit an.
 */
import { useCallback, useSyncExternalStore } from 'react'
import { ortAusPfad, pfadAusOrt, type Ort } from './pfad'

type Horcher = () => void
const horcher = new Set<Horcher>()

function melden(): void {
  for (const h of horcher) h()
}

function abonniere(h: Horcher): () => void {
  horcher.add(h)
  window.addEventListener('popstate', melden)
  return () => {
    horcher.delete(h)
    if (horcher.size === 0) window.removeEventListener('popstate', melden)
  }
}

function lesePfad(): string {
  return window.location.pathname
}

/** Richtung des letzten Wechsels — der Übergang muss invers sein (Nr. 19). */
export type Richtung = 'hinein' | 'heraus' | 'sprung'

let letzteRichtung: Richtung = 'sprung'

export function richtungMerken(r: Richtung): void {
  letzteRichtung = r
}

export function letzteRichtungLesen(): Richtung {
  return letzteRichtung
}

export function useOrt(): {
  ort: Ort
  gehe: (ziel: Ort, richtung: Richtung) => void
  ersetze: (ziel: Ort) => void
} {
  const pfad = useSyncExternalStore(abonniere, lesePfad, () => '/')

  const gehe = useCallback((ziel: Ort, richtung: Richtung) => {
    richtungMerken(richtung)
    window.history.pushState(null, '', pfadAusOrt(ziel))
    melden()
  }, [])

  const ersetze = useCallback((ziel: Ort) => {
    richtungMerken('sprung')
    window.history.replaceState(null, '', pfadAusOrt(ziel))
    melden()
  }, [])

  return { ort: ortAusPfad(pfad), gehe, ersetze }
}
