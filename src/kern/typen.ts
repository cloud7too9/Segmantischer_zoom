/**
 * Kern-Typen der Wissensmatrix.
 *
 * Zentrale Regel (README Nr. 8): Ein Knoten hat KOORDINATEN, keine Position.
 * Der Zoombaum wird daraus berechnet — er ist eine Sicht, keine Speicherstruktur.
 */

/** Eine Achse ist eine Dimension des Universums, z. B. "typ" oder "traeger". */
export type AchsenId = string

/** Koordinate = Achse -> Wert. Nicht gesetzte Achsen sind noch nicht bestimmt. */
export type Koordinate = Readonly<Record<AchsenId, string | undefined>>

/** Inhaltsbaustein eines Knotens. Kern und Overlay haben dieselbe Form. */
export interface Inhalt {
  readonly text?: string
  readonly punkte?: readonly string[]
  readonly code?: { readonly sprache: string; readonly quelltext: string }
  readonly warnung?: string
}

/** Rolle eines Knotens auf seiner Ebene — steuert nur die Darbietung. */
export type Knotenart = 'kategorie' | 'traeger' | 'facette' | 'konzept' | 'erklaerung'

export interface Knoten {
  readonly id: string
  readonly titel: string
  /** Einzeiler für die Kachel und den Steckbrief-Zustand des Knotens. */
  readonly kurz?: string
  /** README Nr. 11: genau ein Heimat-Universum. */
  readonly heimat: string
  readonly koordinate: Koordinate
  readonly art: Knotenart
  /** Sekundäre Einordnung für Farbe und Filter, z. B. "sql" / "nosql". */
  readonly gruppe?: string
  /** README Nr. 13: der Kern muss allein lesbar sein. */
  readonly kern: Inhalt
  /** README Nr. 12: Overlays erweitern, sie widersprechen nie. */
  readonly overlays?: Readonly<Record<string, Inhalt>>
  /** Steckbrief-Zeilen — die Darstellung des Knotens selbst (README Nr. 5). */
  readonly steckbrief?: readonly (readonly [string, string])[]
}

export interface Facette {
  readonly id: string
  readonly titel: string
  readonly kurz: string
  /** true = Teil des gebietsübergreifenden Kerns (README Nr. 10). */
  readonly imKern: boolean
}

export interface Gruppe {
  readonly id: string
  readonly titel: string
  /**
   * Unterscheidung über die Markenform, nicht über eine zweite Akzentfarbe:
   * das Designsystem kennt genau einen Akzent, und Form plus Farbe ist
   * ohnehin die barrierefreiere Kodierung als Farbe allein.
   */
  readonly marke: 'voll' | 'hohl'
}

export interface Universum {
  readonly id: string
  readonly titel: string
  readonly kurz: string
  /**
   * Die Standard-Matrix: Reihenfolge der Achsen von außen nach innen.
   * Wird diese Liste umsortiert, entsteht eine andere Matrix —
   * ohne dass ein einziger Knoten angefasst werden muss (README Nr. 8).
   */
  readonly achsen: readonly AchsenId[]
  /** README Nr. 9/10: Facettenschema hängt am Universum, nicht am Renderer. */
  readonly facetten: readonly Facette[]
  /** Sekundärachse für Farbe und Filter statt für eine eigene Ebene (Nr. 6). */
  readonly gruppen?: readonly Gruppe[]
}

// ---------------------------------------------------------------------------
// Verweise und Wörterbuch (docs/verweise/01–03)
// ---------------------------------------------------------------------------

/**
 * Art eines Verweises. Beide Arten laufen über dieselbe Zoom-Animation;
 * nur was danach gerendert wird, hängt von der Art ab (docs/verweise/01).
 */
export type VerweisArt = 'themengebiet' | 'begriff'

/** Ein erkannter Verweis im Text — wird nie von Hand gesetzt, sondern beim Rendern erzeugt. */
export interface Verweis {
  readonly art: VerweisArt
  /** 'themengebiet': ID des Universums. 'begriff': ID des Wörterbucheintrags. */
  readonly zielId: string
}

/**
 * Wortart eines Wörterbucheintrags. Zusammen mit dem Lemma der Schlüssel
 * der Erkennung: „Relation" (Nomen) und „relational" (Adjektiv) sind zwei
 * Einträge, nicht einer (docs/verweise/02, Ansatz 3).
 */
export type Wortart = 'nomen' | 'adjektiv' | 'verb' | 'eigenname'

/** Felder, die Begriff und Themengebiet im Wörterbuch gemeinsam haben. */
interface WoerterbuchBasis {
  /** Stabile ID (Logs MH-DEC-001). Das sichtbare Wort darf sich später ändern, die ID nicht. */
  readonly id: string
  /** Anzeigeform, so wie der Eintrag im Wörterbuch steht, z. B. „Datenbank". */
  readonly wort: string
  /**
   * Grundform in Kleinschreibung, gegen die der Erkennungsindex vergleicht,
   * z. B. „datenbank". Mehrwortbegriffe tragen die Lemmata ihrer Wörter
   * durch Leerzeichen getrennt: „relational datenbank".
   */
  readonly lemma: string
  readonly wortart: Wortart
  /**
   * Gepflegte Wortformen als Ersatz oder Ergänzung für eine Lemmatisierung
   * im Browser (offener Punkt in docs/verweise/02), z. B. ["Datenbanken"].
   * Vergleich ohne Beachtung der Groß-/Kleinschreibung.
   */
  readonly formen?: readonly string[]
  /** Wird nach dem Zoom hinein angezeigt. */
  readonly definition: string
  /** MH-DEC-001: deaktivieren statt löschen. Deaktivierte Einträge erzeugen keine Verweise. */
  readonly deaktiviert?: boolean
}

/** Ein Begriff: der Verweis zeigt die Definition, es gibt keinen Kontextwechsel. */
export interface Begriffseintrag extends WoerterbuchBasis {
  readonly art: 'begriff'
}

/** Ein Themengebiet: der Verweis wechselt in das genannte Universum. */
export interface Themengebietseintrag extends WoerterbuchBasis {
  readonly art: 'themengebiet'
  /** ID des Universums, in das der Verweis führt. */
  readonly universum: string
}

/**
 * Ein Eintrag im Wörterbuch — die zentrale Quelle für alle Begriffe und
 * Themengebiete (docs/verweise/03). Wird zur Laufzeit gepflegt, nie im Code.
 * Die Erkennung baut ihren Index aus `lemma`, `wortart` und `formen`.
 */
export type Woerterbucheintrag = Begriffseintrag | Themengebietseintrag
