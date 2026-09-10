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

/**
 * Rolle eines Knotens auf seiner Ebene — steuert nur die Darbietung.
 * Die Liste ist universumsübergreifend: 'traeger' ist im Universum
 * Datenbanken ein DBMS, im Universum Linux-Server ein Verzeichnis.
 * 'blatt' ist die Referenzebene — dort steht keine Prosa mehr (Nr. 21).
 */
export type Knotenart =
  | 'kategorie'
  | 'traeger'
  | 'facette'
  | 'konzept'
  | 'blatt'
  | 'erklaerung'

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
  /**
   * Gruppe, die beim allerersten Besuch dieses Universums vorbelegt ist.
   * Steht am Universum, nicht im Renderer — sonst müsste die Zoomfläche
   * Universumskennungen kennen (README Nr. 10).
   */
  readonly erstbesuchGruppe?: string
}
