/**
 * Diskreter Zoom mit Übergang (README Nr. 18–20).
 *
 * Ablauf eines Wechsels:
 *   1. Zielebene laden (synchron aus der Registry)
 *   2. beide Ebenen mounten, --zoom-t = 0
 *   3. ein Frame warten, dann --zoom-t = 1 transitionen
 *   4. nach Ablauf die alte Ebene entfernen
 *
 * Schritt 1 vor Schritt 3 ist die Regel "der Übergang wartet nie auf Daten".
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ladeEbene, bereiteVor, useWissensStand, type Ebenendaten } from '../kern/laden'
import { heraus, hinein, type Ort } from '../kern/pfad'
import { useOrt, letzteRichtungLesen, type Richtung } from '../kern/route'
import type { Knoten } from '../kern/typen'
import { Ebene } from './Ebene'
import { Bearbeitung } from './Bearbeitung'

const DAUER = 280
const SPALTEN_SCHMAL = 2
const SPALTEN_BREIT = 3

/**
 * Deklarativer Zoom-Ursprung aus der Rasterposition (README Nr. 22).
 * Das Raster ist auf die Lesebreite begrenzt und beginnt am linken Rand;
 * der Ursprung rechnet deshalb mit derselben Breite wie das Stylesheet
 * (--textbreite, --rand-x) statt mit der vollen Schichtbreite — gemessen
 * wird nichts.
 */
function ursprungAusSpalte(index: number): { x: string; y: string } {
  const spalten =
    typeof window !== 'undefined' && window.innerWidth >= 620
      ? SPALTEN_BREIT
      : SPALTEN_SCHMAL
  const spalte = index % spalten
  const reihe = Math.floor(index / spalten)
  const anteil = (spalte + 0.5) / spalten
  return {
    x: `calc(var(--rand-x) + ${anteil} * min(var(--textbreite), 100% - var(--rand-x) - var(--rand-rechts)))`,
    y: `${Math.min(20 + reihe * 14, 80)}%`,
  }
}

interface Uebergang {
  alt: Ebenendaten
  richtung: Richtung
  ursprung: { x: string; y: string }
}

export function Zoomflaeche({ startOrt }: { startOrt: Ort }) {
  const { ort, gehe, ersetze } = useOrt()
  const [uebergang, setUebergang] = useState<Uebergang | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const [bearbeiten, setBearbeiten] = useState(false)
  const letzterOrt = useRef<Ort | null>(null)
  const letzterUrsprung = useRef({ x: '50%', y: '30%' })

  // Wurzel auf das einzige Universum umlenken — der Renderer bekommt
  // dadurch trotzdem keine Sonderbehandlung (README Nr. 17).
  useEffect(() => {
    if (!ort.universum) ersetze(startOrt)
  }, [ort.universum, ersetze, startOrt])

  // Ein zur Laufzeit ergänzter Knoten erscheint sofort (README Nr. 30).
  useWissensStand()
  const daten = ladeEbene(ort)

  useLayoutEffect(() => {
    const vorher = letzterOrt.current
    letzterOrt.current = ort
    if (!vorher || !daten) return
    if (vorher.universum === ort.universum && vorher.werte.join('/') === ort.werte.join('/')) return

    const alt = ladeEbene(vorher)
    if (!alt) return

    setUebergang({
      alt,
      richtung: letzteRichtungLesen(),
      ursprung: letzterUrsprung.current,
    })
    setLaeuft(false)
  }, [ort, daten])

  // Erst rendern, dann animieren.
  useEffect(() => {
    if (!uebergang) return
    const frame = requestAnimationFrame(() => setLaeuft(true))
    const zeit = window.setTimeout(() => {
      setUebergang(null)
      setLaeuft(false)
    }, DAUER + 20)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(zeit)
    }
  }, [uebergang])

  // Esc zoomt heraus.
  useEffect(() => {
    function beiTaste(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      // In der Bearbeitungsleiste gehört Esc dem Formular, nicht dem Zoom.
      if (e.target instanceof Element && e.target.closest('.bearbeitung')) return
      const ziel = heraus(ort)
      if (ziel && ziel.universum) {
        letzterUrsprung.current = { x: '50%', y: '30%' }
        gehe(ziel, 'heraus')
      }
    }
    window.addEventListener('keydown', beiTaste)
    return () => window.removeEventListener('keydown', beiTaste)
  }, [ort, gehe])

  if (!daten) return null

  function beiHinein(knoten: Knoten, spalte: number) {
    if (!daten) return
    const achse = daten.universum.achsen[ort.werte.length]
    const wert = knoten.koordinate[achse]
    if (!wert) return
    letzterUrsprung.current = ursprungAusSpalte(spalte)
    bereiteVor(hinein(ort, wert))
    gehe(hinein(ort, wert), 'hinein')
  }

  function beiSprung(ziel: Ort) {
    letzterUrsprung.current = { x: '50%', y: '30%' }
    const tieferAlsZiel = ziel.werte.length < ort.werte.length
    gehe(ziel, tieferAlsZiel ? 'heraus' : 'sprung')
  }

  const richtung = uebergang?.richtung ?? 'sprung'
  const stil = {
    ['--zoom-t' as string]: laeuft || !uebergang ? 1 : 0,
    ['--ursprung-x' as string]: uebergang?.ursprung.x ?? '50%',
    ['--ursprung-y' as string]: uebergang?.ursprung.y ?? '30%',
  } as React.CSSProperties

  return (
    <div
      className={
        'zoomflaeche ' +
        richtung +
        (laeuft ? ' zoomflaeche--laeuft' : '') +
        (bearbeiten ? ' zoomflaeche--bearbeitung' : '')
      }
      style={stil}
    >
      {bearbeiten ? (
        <Bearbeitung daten={daten} aufSchliessen={() => setBearbeiten(false)} />
      ) : (
        <button
          type="button"
          className="knopf knopf--schwebend"
          onClick={() => setBearbeiten(true)}
        >
          Bearbeiten
        </button>
      )}
      {uebergang && (
        <div
          className="zoomflaeche__schicht zoomflaeche__schicht--alt"
          aria-hidden="true"
        >
          <Ebene
            daten={uebergang.alt}
            aufHinein={() => {}}
            aufSprung={() => {}}
          />
        </div>
      )}
      <div className="zoomflaeche__schicht zoomflaeche__schicht--neu">
        <Ebene
          daten={daten}
          aufHinein={beiHinein}
          aufSprung={beiSprung}
          filterVorbelegt={ort.werte.length === 0 ? erstbesuchFilter() : undefined}
        />
      </div>
    </div>
  )
}

/**
 * Beim allerersten Besuch ist die vertraute Zweiteilung vorbelegt —
 * ein guter Lerneinstieg, der danach nie wieder stört. Anders als eine
 * Zoomebene, durch die man dauerhaft hindurchmüsste.
 */
function erstbesuchFilter(): string | undefined {
  try {
    if (localStorage.getItem('matrix.besucht')) return undefined
    localStorage.setItem('matrix.besucht', '1')
    return 'sql'
  } catch {
    return undefined
  }
}
