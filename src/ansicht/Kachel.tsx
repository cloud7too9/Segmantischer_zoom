import type { Gruppe, Knoten } from '../kern/typen'

export function Kachel({
  knoten,
  gruppe,
  spalte,
  aufKlick,
}: {
  knoten: Knoten
  gruppe?: Gruppe
  /** Rasterposition — deklarativ von der Ebene geliefert (README Nr. 22).
   *  Sie muss bestimmbar sein, bevor die Kindebene existiert; deshalb wird
   *  sie durchgereicht und nicht am DOM gemessen. */
  spalte: number
  aufKlick: (knoten: Knoten, spalte: number) => void
}) {
  return (
    <button
      type="button"
      className={
        'kachel' + (knoten.art === 'erklaerung' ? ' kachel--erklaerung' : '')
      }
      onClick={() => aufKlick(knoten, spalte)}
    >
      <span className="kachel__kopf">
        {gruppe && (
          <span
            className={'marke marke--' + gruppe.marke}
            title={gruppe.titel}
            aria-hidden="true"
          />
        )}
        <span className="kachel__titel">{knoten.titel}</span>
      </span>
      {knoten.kurz && <span className="kachel__kurz">{knoten.kurz}</span>}
    </button>
  )
}
