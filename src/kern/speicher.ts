/**
 * Persistenz der Laufzeitänderungen (README Nr. 22: der Wissensbestand
 * liegt persistent, die Anwendung kennt nur die Regeln).
 *
 * Gespeichert wird NUR, was zur Laufzeit angelegt oder geändert wurde —
 * der statische Grundbestand aus src/inhalt bleibt im Code. Der Speicher
 * ist eine Naht: heute localStorage, später eine Datenbank hinter einer
 * API (README Nr. 23), ohne dass sich Registry oder Oberfläche ändern.
 */
import { abonniereWissen, laufzeitAenderungen, uebernehmeAenderungen, type Aenderungen } from './registry'
import { abonniereWoerterbuch, alleEintraege, uebernehmeWoerterbuch } from './woerterbuch'
import type { Woerterbucheintrag } from './typen'

/** Ein Speicher für einen Teilbestand. Was er hält, ist ihm egal. */
export interface Speicher<T> {
  lade(): T | undefined
  speichere(inhalt: T): void
}

/** Flüchtig — für Proben und als Rückfall, wenn kein localStorage da ist. */
export function gedaechtnisSpeicher<T>(): Speicher<T> {
  let inhalt: T | undefined
  return {
    lade: () => inhalt,
    speichere: (neu) => {
      inhalt = neu
    },
  }
}

/** Browser-Speicher. Jeder Zugriff ist abgesichert: privates Fenster, Quota, gesperrte Daten. */
export function lokalerSpeicher<T>(schluessel: string, lesen: (text: string) => T | undefined): Speicher<T> {
  return {
    lade() {
      try {
        const text = localStorage.getItem(schluessel)
        return text ? lesen(text) : undefined
      } catch {
        return undefined
      }
    },
    speichere(inhalt) {
      try {
        localStorage.setItem(schluessel, JSON.stringify(inhalt))
      } catch {
        /* nicht speicherbar — die Sitzung läuft trotzdem weiter */
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Wissensbestand (Universen, Knoten, Inhaltsblöcke)
// ---------------------------------------------------------------------------

function liesAenderungen(text: string): Aenderungen | undefined {
  const a = JSON.parse(text) as Partial<Aenderungen> | null
  if (!a || typeof a !== 'object') return undefined
  return { universen: a.universen ?? [], knoten: a.knoten ?? [] }
}

export function lokalerWissensspeicher(schluessel = 'matrix.wissen'): Speicher<Aenderungen> {
  return lokalerSpeicher(schluessel, liesAenderungen)
}

/**
 * Verbindet den Wissensbestand mit einem Speicher: lädt einmal die
 * gespeicherten Änderungen und schreibt danach jede weitere zurück.
 * Rückgabe ist die Trennfunktion.
 */
export function verbindeSpeicher(speicher: Speicher<Aenderungen>): () => void {
  const gespeichert = speicher.lade()
  if (gespeichert) uebernehmeAenderungen(gespeichert)
  return abonniereWissen(() => speicher.speichere(laufzeitAenderungen()))
}

// ---------------------------------------------------------------------------
// Wörterbuch — hat keinen statischen Grundbestand, der ganze Bestand ist Daten
// ---------------------------------------------------------------------------

function liesWoerterbuch(text: string): Woerterbucheintrag[] | undefined {
  const liste = JSON.parse(text) as unknown
  return Array.isArray(liste) ? (liste as Woerterbucheintrag[]) : undefined
}

export function lokalerWoerterbuchspeicher(schluessel = 'matrix.woerterbuch'): Speicher<readonly Woerterbucheintrag[]> {
  return lokalerSpeicher(schluessel, liesWoerterbuch)
}

export function verbindeWoerterbuchSpeicher(speicher: Speicher<readonly Woerterbucheintrag[]>): () => void {
  const gespeichert = speicher.lade()
  if (gespeichert) uebernehmeWoerterbuch(gespeichert)
  return abonniereWoerterbuch(() => speicher.speichere(alleEintraege()))
}

// ---------------------------------------------------------------------------
// Sicherung von Hand: beide Teile in einer Datei
// ---------------------------------------------------------------------------

const FORMAT = 2

interface Sicherung {
  readonly format: number
  readonly aenderungen: Aenderungen
  readonly woerterbuch?: readonly Woerterbucheintrag[]
}

export function exportiereAenderungen(): string {
  const sicherung: Sicherung = { format: FORMAT, aenderungen: laufzeitAenderungen(), woerterbuch: alleEintraege() }
  return JSON.stringify(sicherung, null, 2)
}

/** Spielt eine Sicherung ein. Wirft bei ungültigem Format oder Mängeln. Format 1 kannte kein Wörterbuch. */
export function importiereAenderungen(text: string): void {
  const s = JSON.parse(text) as Partial<Sicherung> | null
  if (!s || (s.format !== 1 && s.format !== FORMAT) || !s.aenderungen) {
    throw new Error('Unbekanntes Format der Sicherung.')
  }
  uebernehmeAenderungen({ universen: s.aenderungen.universen ?? [], knoten: s.aenderungen.knoten ?? [] })
  if (s.woerterbuch) uebernehmeWoerterbuch(s.woerterbuch)
}
