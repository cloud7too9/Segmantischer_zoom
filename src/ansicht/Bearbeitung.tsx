/**
 * Bearbeitungsleiste: Knoten und Inhaltsblöcke zur Laufzeit pflegen.
 *
 * README Nr. 30: Navigation und Bearbeitung sind zwei Seiten desselben
 * Modells. Die Leiste zeigt immer den Knoten, auf dem der Zoom gerade
 * steht, und erlaubt, auf dieser Ebene einen neuen anzulegen. Alle
 * Schreibzugriffe laufen über kern/registry.ts — die Leiste kennt die
 * Validierungsregeln nicht, sie zeigt nur deren Mängel an.
 */
import { useState, type FormEvent } from 'react'
import type { Ebenendaten } from '../kern/laden'
import { deaktivierterKnotenAmOrt } from '../kern/baum'
import {
  aendereKnoten,
  aktiviereKnoten,
  deaktiviereKnoten,
  ergaenzeKnoten,
  holeKnoten,
} from '../kern/registry'
import type { Inhalt, Knoten, Knotenart, Universum } from '../kern/typen'
import { kennung } from '../kern/kennung'

const ARTEN: readonly { id: Knotenart; titel: string }[] = [
  { id: 'kategorie', titel: 'Kategorie' },
  { id: 'traeger', titel: 'Träger' },
  { id: 'facette', titel: 'Facette' },
  { id: 'konzept', titel: 'Konzept' },
  { id: 'erklaerung', titel: 'Erklärung' },
]

// ---------------------------------------------------------------------------
// Umwandlung Formular <-> Modell
// ---------------------------------------------------------------------------

interface InhaltFelder {
  text: string
  punkte: string
  sprache: string
  quelltext: string
  warnung: string
}

function inhaltZuFeldern(i: Inhalt | undefined): InhaltFelder {
  return {
    text: i?.text ?? '',
    punkte: i?.punkte?.join('\n') ?? '',
    sprache: i?.code?.sprache ?? '',
    quelltext: i?.code?.quelltext ?? '',
    warnung: i?.warnung ?? '',
  }
}

/** Leere Felder fallen weg, damit das Modell nicht mit '' zuwächst. */
function felderZuInhalt(f: InhaltFelder): Inhalt {
  const punkte = f.punkte.split('\n').map((p) => p.trim()).filter(Boolean)
  return {
    ...(f.text.trim() ? { text: f.text.trim() } : {}),
    ...(punkte.length ? { punkte } : {}),
    ...(f.quelltext.trim() ? { code: { sprache: f.sprache.trim() || 'text', quelltext: f.quelltext } } : {}),
    ...(f.warnung.trim() ? { warnung: f.warnung.trim() } : {}),
  }
}

function steckbriefZuText(s: Knoten['steckbrief']): string {
  return s?.map(([k, v]) => `${k}: ${v}`).join('\n') ?? ''
}

function textZuSteckbrief(text: string): Knoten['steckbrief'] {
  const zeilen = text
    .split('\n')
    .map((z) => z.trim())
    .filter(Boolean)
    .map((z): readonly [string, string] => {
      const i = z.indexOf(':')
      return i < 0 ? [z, ''] : [z.slice(0, i).trim(), z.slice(i + 1).trim()]
    })
  return zeilen.length ? zeilen : undefined
}

function fehlertext(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="feld">
      <span className="feld__label">{label}</span>
      {children}
    </label>
  )
}

function InhaltFelderFormular({
  felder,
  setFelder,
}: {
  felder: InhaltFelder
  setFelder: (f: InhaltFelder) => void
}) {
  const setze = (k: keyof InhaltFelder) => (e: { target: { value: string } }) =>
    setFelder({ ...felder, [k]: e.target.value })
  return (
    <>
      <Feld label="Text">
        <textarea rows={4} value={felder.text} onChange={setze('text')} />
      </Feld>
      <Feld label="Punkte (eine je Zeile)">
        <textarea rows={3} value={felder.punkte} onChange={setze('punkte')} />
      </Feld>
      <div className="feld-reihe">
        <Feld label="Code-Sprache">
          <input value={felder.sprache} onChange={setze('sprache')} placeholder="sql" />
        </Feld>
      </div>
      <Feld label="Code">
        <textarea rows={3} className="mono" value={felder.quelltext} onChange={setze('quelltext')} spellCheck={false} />
      </Feld>
      <Feld label="Warnung">
        <input value={felder.warnung} onChange={setze('warnung')} />
      </Feld>
    </>
  )
}

function Meldung({ fehler, erfolg }: { fehler?: string; erfolg?: string }) {
  if (fehler) return <pre className="meldung meldung--fehler">{fehler}</pre>
  if (erfolg) return <p className="meldung meldung--erfolg" role="status">{erfolg}</p>
  return null
}

// ---------------------------------------------------------------------------
// Bestehenden Knoten bearbeiten
// ---------------------------------------------------------------------------

function KnotenFormular({ knoten, universum }: { knoten: Knoten; universum: Universum }) {
  const [titel, setTitel] = useState(knoten.titel)
  const [kurz, setKurz] = useState(knoten.kurz ?? '')
  const [art, setArt] = useState<Knotenart>(knoten.art)
  const [gruppe, setGruppe] = useState(knoten.gruppe ?? '')
  const [steckbrief, setSteckbrief] = useState(steckbriefZuText(knoten.steckbrief))
  const [kern, setKern] = useState(inhaltZuFeldern(knoten.kern))
  const [overlay, setOverlay] = useState(inhaltZuFeldern(knoten.overlays?.[universum.id]))
  const [fehler, setFehler] = useState<string>()
  const [erfolg, setErfolg] = useState<string>()

  function speichern(e: FormEvent) {
    e.preventDefault()
    setFehler(undefined)
    setErfolg(undefined)
    const overlays: Record<string, Inhalt> = { ...holeKnoten(knoten.id)?.overlays }
    const overlayInhalt = felderZuInhalt(overlay)
    if (Object.keys(overlayInhalt).length) overlays[universum.id] = overlayInhalt
    else delete overlays[universum.id]
    try {
      aendereKnoten(knoten.id, {
        titel: titel.trim(),
        kurz: kurz.trim() || undefined,
        art,
        gruppe: gruppe || undefined,
        steckbrief: textZuSteckbrief(steckbrief),
        kern: felderZuInhalt(kern),
        overlays: Object.keys(overlays).length ? overlays : undefined,
      })
      setErfolg('Gespeichert.')
    } catch (f) {
      setFehler(fehlertext(f))
    }
  }

  return (
    <form className="formular" onSubmit={speichern}>
      <h2 className="bearbeitung__titel">Dieser Knoten</h2>
      <p className="bearbeitung__id">{knoten.id}</p>

      <Feld label="Titel">
        <input value={titel} onChange={(e) => setTitel(e.target.value)} required />
      </Feld>
      <Feld label="Kurz">
        <input value={kurz} onChange={(e) => setKurz(e.target.value)} />
      </Feld>
      <div className="feld-reihe">
        <Feld label="Art">
          <select value={art} onChange={(e) => setArt(e.target.value as Knotenart)}>
            {ARTEN.map((a) => (
              <option key={a.id} value={a.id}>{a.titel}</option>
            ))}
          </select>
        </Feld>
        {universum.gruppen && (
          <Feld label="Gruppe">
            <select value={gruppe} onChange={(e) => setGruppe(e.target.value)}>
              <option value="">keine</option>
              {universum.gruppen.map((g) => (
                <option key={g.id} value={g.id}>{g.titel}</option>
              ))}
            </select>
          </Feld>
        )}
      </div>
      <Feld label="Steckbrief (Schlüssel: Wert, eine Zeile je Eintrag)">
        <textarea rows={3} value={steckbrief} onChange={(e) => setSteckbrief(e.target.value)} />
      </Feld>

      <h3 className="bearbeitung__abschnitt">Kern</h3>
      <InhaltFelderFormular felder={kern} setFelder={setKern} />

      <h3 className="bearbeitung__abschnitt">Overlay „{universum.titel}"</h3>
      <InhaltFelderFormular felder={overlay} setFelder={setOverlay} />

      <Meldung fehler={fehler} erfolg={erfolg} />

      <div className="knopfreihe">
        <button type="submit" className="knopf knopf--akzent">Speichern</button>
        {knoten.deaktiviert ? (
          <button type="button" className="knopf" onClick={() => aktiviereKnoten(knoten.id)}>
            Reaktivieren
          </button>
        ) : (
          <button
            type="button"
            className="knopf knopf--gefahr"
            onClick={() => {
              if (window.confirm(`„${knoten.titel}" deaktivieren? Der Knoten verschwindet aus dem Zoom, bleibt aber gespeichert.`)) {
                deaktiviereKnoten(knoten.id)
              }
            }}
          >
            Deaktivieren
          </button>
        )}
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Neuen Knoten auf dieser Ebene anlegen
// ---------------------------------------------------------------------------

/** Vorbelegung der Art aus der Achse; sonst nach Tiefe. */
function artFuerAchse(achse: string, tiefe: number): Knotenart {
  if (ARTEN.some((a) => a.id === achse)) return achse as Knotenart
  return (['kategorie', 'traeger', 'facette', 'konzept'] as const)[Math.min(tiefe, 3)]
}

function NeuerKnotenFormular({ daten }: { daten: Ebenendaten }) {
  const { universum, ort, knoten: eltern } = daten
  const achse = universum.achsen[ort.werte.length]
  const istFacette = achse === 'facette' && universum.facetten.length > 0

  const [titel, setTitel] = useState('')
  const [wert, setWert] = useState('')
  const [wertVonHand, setWertVonHand] = useState(false)
  const [facette, setFacette] = useState(universum.facetten[0]?.id ?? '')
  const [kurz, setKurz] = useState('')
  const [art, setArt] = useState<Knotenart>(artFuerAchse(achse ?? '', ort.werte.length))
  const [gruppe, setGruppe] = useState('')
  const [text, setText] = useState('')
  const [fehler, setFehler] = useState<string>()
  const [erfolg, setErfolg] = useState<string>()

  if (!achse) return null

  const wertEffektiv = istFacette ? facette : wertVonHand ? wert : kennung(titel)
  const titelEffektiv = istFacette && !titel ? universum.facetten.find((f) => f.id === facette)?.titel ?? '' : titel
  const id = eltern ? `${eltern.id}-${wertEffektiv}` : `${achse}-${wertEffektiv}`

  function anlegen(e: FormEvent) {
    e.preventDefault()
    setFehler(undefined)
    setErfolg(undefined)
    const koordinate: Record<string, string> = {}
    universum.achsen.forEach((a, i) => {
      if (ort.werte[i] !== undefined) koordinate[a] = ort.werte[i]
    })
    koordinate[achse!] = wertEffektiv
    if (holeKnoten(id)) {
      setFehler(`Es gibt schon einen Knoten mit der ID „${id}".`)
      return
    }
    try {
      ergaenzeKnoten({
        id,
        titel: titelEffektiv.trim(),
        kurz: kurz.trim() || undefined,
        heimat: universum.id,
        koordinate,
        art,
        gruppe: gruppe || undefined,
        kern: { text: text.trim() },
      })
      setErfolg(`„${titelEffektiv}" angelegt.`)
      setTitel('')
      setWert('')
      setWertVonHand(false)
      setKurz('')
      setText('')
    } catch (f) {
      setFehler(fehlertext(f))
    }
  }

  return (
    <form className="formular" onSubmit={anlegen}>
      <h2 className="bearbeitung__titel">Neu auf dieser Ebene</h2>
      <p className="bearbeitung__id">
        Achse „{achse}" · ID {id || '…'}
      </p>

      {istFacette ? (
        <Feld label="Facette (laut Schema des Universums)">
          <select value={facette} onChange={(e) => setFacette(e.target.value)}>
            {universum.facetten.map((f) => (
              <option key={f.id} value={f.id}>{f.titel}</option>
            ))}
          </select>
        </Feld>
      ) : null}
      <Feld label={istFacette ? 'Titel (leer = Facettentitel)' : 'Titel'}>
        <input value={titel} onChange={(e) => setTitel(e.target.value)} required={!istFacette} />
      </Feld>
      {!istFacette && (
        <Feld label={`Wert auf Achse „${achse}" (Pfadsegment)`}>
          <input
            className="mono"
            value={wertVonHand ? wert : kennung(titel)}
            onChange={(e) => {
              setWertVonHand(true)
              setWert(kennung(e.target.value))
            }}
            required
          />
        </Feld>
      )}
      <Feld label="Kurz">
        <input value={kurz} onChange={(e) => setKurz(e.target.value)} />
      </Feld>
      <div className="feld-reihe">
        <Feld label="Art">
          <select value={art} onChange={(e) => setArt(e.target.value as Knotenart)}>
            {ARTEN.map((a) => (
              <option key={a.id} value={a.id}>{a.titel}</option>
            ))}
          </select>
        </Feld>
        {universum.gruppen && (
          <Feld label="Gruppe">
            <select value={gruppe} onChange={(e) => setGruppe(e.target.value)}>
              <option value="">keine</option>
              {universum.gruppen.map((g) => (
                <option key={g.id} value={g.id}>{g.titel}</option>
              ))}
            </select>
          </Feld>
        )}
      </div>
      <Feld label="Kern-Text (muss allein lesbar sein)">
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} required />
      </Feld>

      <Meldung fehler={fehler} erfolg={erfolg} />

      <div className="knopfreihe">
        <button type="submit" className="knopf knopf--akzent">Anlegen</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Leiste
// ---------------------------------------------------------------------------

export function Bearbeitung({ daten, aufSchliessen }: { daten: Ebenendaten; aufSchliessen: () => void }) {
  // Ein deaktivierter Knoten ist aus dem Baum verschwunden, nicht aus den
  // Daten: an seinem Ort bleibt er bearbeitbar, sonst käme man nie zurück.
  const knoten = daten.knoten ?? deaktivierterKnotenAmOrt(daten.ort, daten.universum)
  return (
    <aside className="bearbeitung" aria-label="Bearbeiten">
      <div className="bearbeitung__kopf">
        <span>Bearbeiten</span>
        <button type="button" className="knopf" onClick={aufSchliessen}>
          Schließen
        </button>
      </div>
      {knoten?.deaktiviert && (
        <p className="meldung meldung--fehler">
          Dieser Knoten ist deaktiviert. Er erscheint nicht im Zoom, bis er reaktiviert wird.
        </p>
      )}
      {knoten ? (
        <KnotenFormular key={knoten.id + (knoten.deaktiviert ? ':aus' : '')} knoten={knoten} universum={daten.universum} />
      ) : (
        <p className="bearbeitung__hinweis">
          Auf Universumsebene gibt es keinen Knoten. Unten lässt sich einer anlegen.
        </p>
      )}
      <NeuerKnotenFormular key={'neu:' + daten.ort.werte.join('/')} daten={daten} />
    </aside>
  )
}
