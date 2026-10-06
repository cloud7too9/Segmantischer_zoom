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

export interface Speicher {
  lade(): Aenderungen | undefined
  speichere(a: Aenderungen): void
}

const FORMAT = 1

interface Ablage {
  readonly format: number
  readonly aenderungen: Aenderungen
}

export function serialisiere(a: Aenderungen): string {
  const ablage: Ablage = { format: FORMAT, aenderungen: a }
  return JSON.stringify(ablage)
}

export function deserialisiere(text: string): Aenderungen | undefined {
  const ablage = JSON.parse(text) as Partial<Ablage>
  if (ablage.format !== FORMAT || !ablage.aenderungen) return undefined
  const a = ablage.aenderungen
  return { universen: a.universen ?? [], knoten: a.knoten ?? [] }
}

/** Flüchtig — für Proben und als Rückfall, wenn kein localStorage da ist. */
export function gedaechtnisSpeicher(): Speicher {
  let inhalt: Aenderungen | undefined
  return {
    lade: () => inhalt,
    speichere: (a) => {
      inhalt = a
    },
  }
}

/** Browser-Speicher. Jeder Zugriff ist abgesichert: privates Fenster, Quota, gesperrte Daten. */
export function lokalerSpeicher(schluessel = 'matrix.wissen'): Speicher {
  return {
    lade() {
      try {
        const text = localStorage.getItem(schluessel)
        return text ? deserialisiere(text) : undefined
      } catch {
        return undefined
      }
    },
    speichere(a) {
      try {
        localStorage.setItem(schluessel, serialisiere(a))
      } catch {
        /* nicht speicherbar — die Sitzung läuft trotzdem weiter */
      }
    },
  }
}

/**
 * Verbindet den Wissensbestand mit einem Speicher: lädt einmal die
 * gespeicherten Änderungen und schreibt danach jede weitere zurück.
 * Rückgabe ist die Trennfunktion.
 */
export function verbindeSpeicher(speicher: Speicher): () => void {
  const gespeichert = speicher.lade()
  if (gespeichert) uebernehmeAenderungen(gespeichert)
  return abonniereWissen(() => speicher.speichere(laufzeitAenderungen()))
}

/** Sicherung von Hand: alle Laufzeitänderungen als JSON. */
export function exportiereAenderungen(): string {
  return serialisiere(laufzeitAenderungen())
}

/** Spielt eine Sicherung ein. Wirft bei ungültigem Format oder Mängeln. */
export function importiereAenderungen(text: string): void {
  const a = deserialisiere(text)
  if (!a) throw new Error('Unbekanntes Format der Sicherung.')
  uebernehmeAenderungen(a)
}
