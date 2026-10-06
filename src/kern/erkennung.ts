/**
 * Erkennungslogik für Verweise (docs/verweise/02).
 *
 * Texte werden einfach heruntergeschrieben; nichts wird von Hand markiert.
 * Beim Rendern wird jedes Wort normalisiert und gegen den Index aus dem
 * Wörterbuch abgeglichen. Treffer werden zu Verweisen (docs/verweise/01).
 *
 * Der Index entsteht aus `lemma`, `wort` und `formen` jedes aktiven
 * Eintrags. Beide Seiten — Wörterbuch und Text — laufen durch DENSELBEN
 * Lemmatisierer, deshalb reicht es, wenn er konsistent ist; er muss nicht
 * linguistisch korrekt sein. Der eingebaute ist ein Endungsabschneider, der
 * „Datenbanken" und „Datenbank" oder „relationale" und „relational" auf
 * dieselbe Form bringt. Ein besserer (JS-Bibliothek, Vorverarbeitung) wird
 * mit `setzeLemmatisierer` eingehängt, ohne dass sich sonst etwas ändert.
 */
import type { Verweis, VerweisArt, Woerterbucheintrag, Wortart } from './typen'
import { aktiveEintraege, woerterbuchStand } from './woerterbuch'

/** Ergebnis der Lemmatisierung eines Wortes. Wortart ist optional (Ansatz 3). */
export interface Lemma {
  readonly lemma: string
  readonly wortart?: Wortart
}

export type Lemmatisierer = (wort: string) => Lemma

/** Ein Stück Text: entweder reiner Text oder ein erkannter Verweis. */
export interface Segment {
  readonly text: string
  readonly verweis?: Verweis
  readonly eintrag?: Woerterbucheintrag
}

// ---------------------------------------------------------------------------
// Lemmatisierung
// ---------------------------------------------------------------------------

/** Deutsche Beugungsendungen, längste zuerst. */
const ENDUNGEN = ['ern', 'en', 'er', 'es', 'em', 'e', 'n', 's'] as const
const MINDESTSTAMM = 3

/**
 * Eingebauter Lemmatisierer: Kleinschreibung plus Abschneiden von
 * Beugungsendungen, solange genug Stamm übrig bleibt. Er schneidet
 * WIEDERHOLT, damit das Ergebnis idempotent ist: „Transaktionen" und
 * „Transaktion" landen beide bei „transaktio", obwohl die Grundform selbst
 * auf eine Endung ausgeht. Bewusst grob — er überlemmatisiert eher, was
 * unschädlich ist, solange beide Seiten gleich behandelt werden. Was er
 * nicht trifft („Indizes"), wird über `formen` im Eintrag gepflegt.
 */
export function einfacherLemmatisierer(wort: string): Lemma {
  let stamm = wort.toLocaleLowerCase('de')
  let gekuerzt = true
  while (gekuerzt) {
    gekuerzt = false
    for (const endung of ENDUNGEN) {
      if (stamm.length - endung.length >= MINDESTSTAMM && stamm.endsWith(endung)) {
        stamm = stamm.slice(0, -endung.length)
        gekuerzt = true
        break
      }
    }
  }
  return { lemma: stamm }
}

let lemmatisiere: Lemmatisierer = einfacherLemmatisierer
let lemmatisiererStand = 0

export function setzeLemmatisierer(l: Lemmatisierer): void {
  lemmatisiere = l
  lemmatisiererStand++
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

interface Kandidat {
  /** Lemmata der Wörter dieser Form, in Reihenfolge. */
  readonly folge: readonly string[]
  readonly eintrag: Woerterbucheintrag
}

interface Index {
  /** Erstes Lemma -> alle Kandidaten, längste Folge zuerst. */
  readonly nachAnfang: ReadonlyMap<string, readonly Kandidat[]>
}

/** Wörter im Text: Buchstaben und Ziffern, Umlaute eingeschlossen. */
const WORT = /[\p{L}\p{N}]+/gu

function zerlege(text: string): string[] {
  return text.match(WORT) ?? []
}

/** Bei Gleichstand entscheidet die Art: Begriff vor Themengebiet (s. `erkenne`). */
const RANG: Record<VerweisArt, number> = { begriff: 0, themengebiet: 1 }

function baueIndex(): Index {
  const nachAnfang = new Map<string, Kandidat[]>()
  for (const eintrag of aktiveEintraege()) {
    const formen = new Set<string>([eintrag.lemma, eintrag.wort, ...(eintrag.formen ?? [])])
    for (const form of formen) {
      const folge = zerlege(form).map((w) => lemmatisiere(w).lemma)
      if (folge.length === 0) continue
      const liste = nachAnfang.get(folge[0]) ?? []
      liste.push({ folge, eintrag })
      nachAnfang.set(folge[0], liste)
    }
  }
  for (const liste of nachAnfang.values()) {
    liste.sort((a, b) => b.folge.length - a.folge.length || RANG[a.eintrag.art] - RANG[b.eintrag.art])
  }
  return { nachAnfang }
}

let index: Index | undefined
let indexStand = ''

/** Index liegt im Cache, bis sich Wörterbuch oder Lemmatisierer ändern. */
export function holeIndex(): Index {
  const stand = `${woerterbuchStand()}/${lemmatisiererStand}`
  if (!index || indexStand !== stand) {
    index = baueIndex()
    indexStand = stand
  }
  return index
}

// ---------------------------------------------------------------------------
// Erkennung
// ---------------------------------------------------------------------------

function verweisFuer(e: Woerterbucheintrag): Verweis {
  return e.art === 'themengebiet'
    ? { art: 'themengebiet', zielId: e.universum }
    : { art: 'begriff', zielId: e.id }
}

/** Passt der Kandidat ab Wort i? Wortart wird nur geprüft, wenn beide Seiten eine kennen. */
function passt(k: Kandidat, lemmata: readonly Lemma[], i: number): boolean {
  if (i + k.folge.length > lemmata.length) return false
  for (let j = 0; j < k.folge.length; j++) {
    const l = lemmata[i + j]
    if (l.lemma !== k.folge[j]) return false
    if (l.wortart && l.wortart !== k.eintrag.wortart) return false
  }
  return true
}

/**
 * Zerlegt einen Text in Segmente. Zwischenräume und Satzzeichen bleiben
 * erhalten, sodass die Segmente aneinandergehängt wieder den Text ergeben.
 *
 * Regeln bei Konkurrenz:
 * - Der längste Treffer gewinnt („relationale Datenbank" vor „Datenbank").
 * - Bei gleicher Länge gewinnt der Begriff vor dem Themengebiet: die
 *   Definition zu zeigen ist der kleinere Eingriff als ein Kontextwechsel.
 *   (Vorläufige Regel für den offenen Punkt „Mehrdeutigkeit" in 02.)
 */
export function erkenne(text: string): Segment[] {
  const { nachAnfang } = holeIndex()
  const segmente: Segment[] = []
  const woerter = [...text.matchAll(WORT)]
  const lemmata = woerter.map((m) => lemmatisiere(m[0]))

  let pos = 0
  let i = 0
  while (i < woerter.length) {
    const treffer = nachAnfang.get(lemmata[i].lemma)?.find((k) => passt(k, lemmata, i))
    if (!treffer) {
      i++
      continue
    }
    const von = woerter[i].index
    const letztes = woerter[i + treffer.folge.length - 1]
    const bis = letztes.index + letztes[0].length
    if (von > pos) segmente.push({ text: text.slice(pos, von) })
    segmente.push({
      text: text.slice(von, bis),
      verweis: verweisFuer(treffer.eintrag),
      eintrag: treffer.eintrag,
    })
    pos = bis
    i += treffer.folge.length
  }
  if (pos < text.length) segmente.push({ text: text.slice(pos) })
  return segmente
}

/** Nur die Treffer — für den Bearbeitungsmodus und für Proben. */
export function erkannteVerweise(text: string): Segment[] {
  return erkenne(text).filter((s) => s.verweis !== undefined)
}
