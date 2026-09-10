/**
 * DER Ebenen-Renderer (README Nr. 17): eine Komponente für jede Zoomstufe,
 * keine Sonderbehandlung für das Wurzel-Universum.
 *
 * Strikt zustandsfrei (README Nr. 22): kein Zugriff auf Routing, kein
 * globaler Zustand, kein Fokus-Grab beim Mounten. Das ist die Bedingung
 * dafür, dass zwei Ebenen gleichzeitig gemountet sein dürfen — heute für
 * den Übergang, später für einen kontinuierlichen Zoom.
 */
import { useMemo, useState } from 'react'
import type { Ebenendaten } from '../kern/laden'
import { ahnen, sichtbarerInhalt } from '../kern/baum'
import { alleUniversen } from '../kern/registry'
import type { Knoten } from '../kern/typen'
import type { Ort } from '../kern/pfad'
import { Brotkrume } from './Brotkrume'
import { Kachel } from './Kachel'
import { Inhaltsblock } from './Inhaltsblock'

export function Ebene({
  daten,
  aufHinein,
  aufSprung,
  filterVorbelegt,
}: {
  daten: Ebenendaten
  aufHinein: (knoten: Knoten, spalte: number) => void
  aufSprung: (ort: Ort) => void
  filterVorbelegt?: string
}) {
  const { universum, knoten, kinder, ort } = daten
  const [filter, setFilter] = useState<string | undefined>(filterVorbelegt)

  const kette = useMemo(() => ahnen(ort, universum), [ort, universum])

  // Filter gilt nur, wo eine Gruppe überhaupt vergeben ist (Typenebene).
  const gefiltert = useMemo(() => {
    if (!filter) return kinder
    return kinder.filter((k) => !k.gruppe || k.gruppe === filter)
  }, [kinder, filter])

  const zeigeFilter =
    (universum.gruppen?.length ?? 0) > 0 && kinder.some((k) => k.gruppe)

  /**
   * Der Wechsel zwischen Universen ist ein Sprung zur Seite, keine Ebene
   * darüber: Ebene 1 bleibt das Universum selbst. Deshalb steht die Wahl
   * nur dort, wo man ohnehin ganz oben ist — und sieht aus wie der Filter,
   * weil sie dasselbe tut: die Menge einschränken, nicht hineinzoomen.
   */
  const universen = useMemo(() => alleUniversen(), [])
  const zeigeUniversumswahl = ort.werte.length === 0 && universen.length > 1

  const inhalt = knoten ? sichtbarerInhalt(knoten, universum.id) : undefined

  return (
    <>
      <Brotkrume kette={kette} aufSprung={aufSprung} />

      <header className="kopf">
        <h1 className="kopf__titel">{knoten?.titel ?? universum.titel}</h1>
        <p className="kopf__kurz">{knoten?.kurz ?? universum.kurz}</p>

        {knoten?.steckbrief && (
          <dl className="steckbrief">
            {knoten.steckbrief.map(([schluessel, wert]) => (
              <div key={schluessel} style={{ display: 'contents' }}>
                <dt>{schluessel}</dt>
                <dd>{wert}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {inhalt && (
        <>
          <Inhaltsblock inhalt={inhalt.kern} />
          {inhalt.overlay && (
            <Inhaltsblock inhalt={inhalt.overlay} marke={universum.titel} />
          )}
        </>
      )}

      {zeigeUniversumswahl && (
        <div className="filter" role="group" aria-label="Universum wechseln">
          {universen.map((u) => (
            <button
              key={u.id}
              type="button"
              className="filter__knopf"
              aria-pressed={u.id === universum.id}
              onClick={() => aufSprung({ universum: u.id, werte: [] })}
            >
              {u.titel}
            </button>
          ))}
        </div>
      )}

      {zeigeFilter && universum.gruppen && (
        <div className="filter" role="group" aria-label="Nach Art filtern">
          {universum.gruppen.map((g) => (
            <button
              key={g.id}
              type="button"
              className="filter__knopf"
              aria-pressed={filter === g.id}
              onClick={() => setFilter(filter === g.id ? undefined : g.id)}
            >
              <span className={'marke marke--' + g.marke} aria-hidden="true" />
              {g.titel}
            </button>
          ))}
          <button
            type="button"
            className="filter__knopf"
            aria-pressed={filter === undefined}
            onClick={() => setFilter(undefined)}
          >
            Alle
          </button>
        </div>
      )}

      {gefiltert.length > 0 && (
        <div className="raster">
          {gefiltert.map((k, i) => (
            <Kachel
              key={k.id}
              knoten={k}
              gruppe={universum.gruppen?.find((g) => g.id === k.gruppe)}
              aufKlick={aufHinein}
              spalte={i}
            />
          ))}
        </div>
      )}

      {ort.werte.length > 0 && (
        <p className="tastaturhinweis">
          <kbd>Esc</kbd> zoomt eine Ebene heraus
        </p>
      )}
    </>
  )
}
