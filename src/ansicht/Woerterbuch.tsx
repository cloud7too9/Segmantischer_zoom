/**
 * Das Wörterbuch als eigener Bereich (docs/verweise/03): die zentrale
 * Quelle für Begriffe und Themengebiete, gepflegt zur Laufzeit über die
 * Oberfläche. Korrekturen an der Erkennung laufen ausschließlich hier —
 * es gibt keine Ja/Nein-Entscheidungen pro Textstelle.
 *
 * Die Erkennungsprobe unten ist die Prüfsicht dazu: Sie zeigt am
 * eingegebenen Text, was erkannt würde, mit einer Hervorhebung je Art.
 */
import { useMemo, useState, type FormEvent } from 'react'
import { erkenne } from '../kern/erkennung'
import { kennung } from '../kern/kennung'
import { useWissensStand, useWoerterbuchStand } from '../kern/laden'
import { aktiveUniversen } from '../kern/registry'
import { exportiereAenderungen, importiereAenderungen } from '../kern/speicher'
import type { VerweisArt, Woerterbucheintrag, Wortart } from '../kern/typen'
import {
  WORTARTEN,
  aendereEintrag,
  aktiviereEintrag,
  alleEintraege,
  deaktiviereEintrag,
  ergaenzeWoerterbuch,
} from '../kern/woerterbuch'

const ARTEN: readonly { id: VerweisArt; titel: string }[] = [
  { id: 'begriff', titel: 'Begriff' },
  { id: 'themengebiet', titel: 'Themengebiet' },
]

const WORTART_TITEL: Record<Wortart, string> = {
  nomen: 'Nomen',
  adjektiv: 'Adjektiv',
  verb: 'Verb',
  eigenname: 'Eigenname',
}

function fehlertext(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="feld">
      <span className="feld__label">{label}</span>
      {children}
    </label>
  )
}

// ---------------------------------------------------------------------------
// Formular: neu oder bestehend
// ---------------------------------------------------------------------------

function EintragFormular({
  eintrag,
  aufFertig,
}: {
  /** undefined = neuer Eintrag */
  eintrag?: Woerterbucheintrag
  aufFertig: (id: string | undefined) => void
}) {
  const universen = aktiveUniversen()
  const [art, setArt] = useState<VerweisArt>(eintrag?.art ?? 'begriff')
  const [wort, setWort] = useState(eintrag?.wort ?? '')
  const [lemma, setLemma] = useState(eintrag?.lemma ?? '')
  const [lemmaVonHand, setLemmaVonHand] = useState(!!eintrag)
  const [wortart, setWortart] = useState<Wortart>(eintrag?.wortart ?? 'nomen')
  const [formen, setFormen] = useState(eintrag?.formen?.join('\n') ?? '')
  const [definition, setDefinition] = useState(eintrag?.definition ?? '')
  const [universum, setUniversum] = useState(
    (eintrag?.art === 'themengebiet' ? eintrag.universum : undefined) ?? universen[0]?.id ?? '',
  )
  const [fehler, setFehler] = useState<string>()
  const [erfolg, setErfolg] = useState<string>()

  const lemmaEffektiv = lemmaVonHand ? lemma : wort.trim().toLocaleLowerCase('de')
  const id = eintrag?.id ?? `${art}-${kennung(wort)}`

  function speichern(e: FormEvent) {
    e.preventDefault()
    setFehler(undefined)
    setErfolg(undefined)
    const basis = {
      id,
      wort: wort.trim(),
      lemma: lemmaEffektiv.trim(),
      wortart,
      formen: formen.split('\n').map((f) => f.trim()).filter(Boolean),
      definition: definition.trim(),
    }
    try {
      if (eintrag) {
        aendereEintrag(eintrag.id, { ...basis, ...(eintrag.art === 'themengebiet' ? { universum } : {}) })
        setErfolg('Gespeichert.')
      } else {
        ergaenzeWoerterbuch(
          art === 'themengebiet' ? { ...basis, art, universum } : { ...basis, art },
        )
        aufFertig(id)
      }
    } catch (f) {
      setFehler(fehlertext(f))
    }
  }

  return (
    <form className="formular" onSubmit={speichern}>
      <h2 className="bearbeitung__titel">{eintrag ? 'Eintrag' : 'Neuer Eintrag'}</h2>
      <p className="bearbeitung__id">{id || '…'}</p>

      <div className="feld-reihe">
        <Feld label="Art">
          <select value={art} onChange={(e) => setArt(e.target.value as VerweisArt)} disabled={!!eintrag}>
            {ARTEN.map((a) => (
              <option key={a.id} value={a.id}>{a.titel}</option>
            ))}
          </select>
        </Feld>
        <Feld label="Wortart">
          <select value={wortart} onChange={(e) => setWortart(e.target.value as Wortart)}>
            {WORTARTEN.map((w) => (
              <option key={w} value={w}>{WORTART_TITEL[w]}</option>
            ))}
          </select>
        </Feld>
      </div>
      <Feld label="Wort (Anzeigeform)">
        <input value={wort} onChange={(e) => setWort(e.target.value)} required autoFocus={!eintrag} />
      </Feld>
      <Feld label="Lemma (Grundform, klein; Mehrwortbegriffe mit Leerzeichen)">
        <input
          className="mono"
          value={lemmaEffektiv}
          onChange={(e) => {
            setLemmaVonHand(true)
            setLemma(e.target.value)
          }}
          required
        />
      </Feld>
      <Feld label="Weitere Wortformen (eine je Zeile, z. B. unregelmäßige Beugungen)">
        <textarea rows={2} value={formen} onChange={(e) => setFormen(e.target.value)} />
      </Feld>
      {art === 'themengebiet' && (
        <Feld label="Ziel-Universum">
          <select value={universum} onChange={(e) => setUniversum(e.target.value)}>
            {universen.map((u) => (
              <option key={u.id} value={u.id}>{u.titel}</option>
            ))}
          </select>
        </Feld>
      )}
      <Feld label="Definition">
        <textarea rows={4} value={definition} onChange={(e) => setDefinition(e.target.value)} required />
      </Feld>

      {fehler && <pre className="meldung meldung--fehler">{fehler}</pre>}
      {erfolg && <p className="meldung meldung--erfolg" role="status">{erfolg}</p>}

      <div className="knopfreihe">
        <button type="submit" className="knopf knopf--akzent">{eintrag ? 'Speichern' : 'Anlegen'}</button>
        {eintrag &&
          (eintrag.deaktiviert ? (
            <button type="button" className="knopf" onClick={() => aktiviereEintrag(eintrag.id)}>
              Reaktivieren
            </button>
          ) : (
            <button type="button" className="knopf knopf--gefahr" onClick={() => deaktiviereEintrag(eintrag.id)}>
              Deaktivieren
            </button>
          ))}
        {eintrag && (
          <button type="button" className="knopf" onClick={() => aufFertig(undefined)}>
            Neuer Eintrag
          </button>
        )}
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Erkennungsprobe: Hervorhebung je Art (docs/verweise/03)
// ---------------------------------------------------------------------------

function Erkennungsprobe() {
  const [text, setText] = useState(
    'Eine relationale Datenbank speichert Transaktionen in Tabellen. Im Netzwerk läuft sie über TCP.',
  )
  const segmente = useMemo(() => erkenne(text), [text])
  const treffer = segmente.filter((s) => s.verweis)

  return (
    <section className="probe">
      <h2 className="bearbeitung__titel">Erkennungsprobe</h2>
      <p className="bearbeitung__hinweis" style={{ marginTop: 4 }}>
        So würde dieser Text gerendert. Falsche oder fehlende Treffer werden über den Eintrag korrigiert, nicht hier.
      </p>
      <textarea className="probe__eingabe" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      <p className="probe__ausgabe">
        {segmente.map((s, i) =>
          s.verweis ? (
            <mark key={i} className={'erkannt erkannt--' + s.verweis.art} title={`${s.verweis.art}: ${s.eintrag?.wort}`}>
              {s.text}
            </mark>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </p>
      <p className="probe__legende">
        <mark className="erkannt erkannt--begriff">Begriff</mark> <mark className="erkannt erkannt--themengebiet">Themengebiet</mark>
        <span> · {treffer.length} Treffer</span>
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sicherung
// ---------------------------------------------------------------------------

function Sicherung() {
  const [meldung, setMeldung] = useState<string>()

  function exportieren() {
    const blob = new Blob([exportiereAenderungen()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wissensmatrix-sicherung.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importieren(datei: File | undefined) {
    if (!datei) return
    try {
      importiereAenderungen(await datei.text())
      setMeldung('Sicherung eingespielt.')
    } catch (f) {
      setMeldung('Fehler: ' + fehlertext(f))
    }
  }

  return (
    <div className="knopfreihe sicherung">
      <button type="button" className="knopf" onClick={exportieren}>Sicherung exportieren</button>
      <label className="knopf">
        Sicherung importieren
        <input type="file" accept="application/json" hidden onChange={(e) => importieren(e.target.files?.[0])} />
      </label>
      {meldung && <span className="meldung" role="status">{meldung}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Seite
// ---------------------------------------------------------------------------

export function Woerterbuch({ aufZurueck }: { aufZurueck: () => void }) {
  const stand = useWoerterbuchStand()
  useWissensStand()
  const [suche, setSuche] = useState('')
  const [gewaehlt, setGewaehlt] = useState<string>()

  const eintraege = useMemo(() => {
    const s = suche.trim().toLocaleLowerCase('de')
    return alleEintraege()
      .filter((e) => !s || [e.wort, e.lemma, e.definition, ...(e.formen ?? [])].some((t) => t.toLocaleLowerCase('de').includes(s)))
      .sort((a, b) => a.wort.localeCompare(b.wort, 'de'))
  }, [suche, stand])

  const eintrag = gewaehlt ? alleEintraege().find((e) => e.id === gewaehlt) : undefined

  return (
    <main className="woerterbuch">
      <header className="woerterbuch__kopf">
        <div>
          <h1 className="kopf__titel">Wörterbuch</h1>
          <p className="kopf__kurz">Begriffe und Themengebiete, die im Text automatisch zu Verweisen werden.</p>
        </div>
        <button type="button" className="knopf" onClick={aufZurueck}>Zurück zum Zoom</button>
      </header>

      <div className="woerterbuch__spalten">
        <section className="woerterbuch__liste">
          <input
            className="suche"
            type="search"
            placeholder="Suchen …"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            aria-label="Einträge durchsuchen"
          />
          {eintraege.length === 0 ? (
            <p className="bearbeitung__hinweis">Noch keine Einträge. Rechts den ersten anlegen.</p>
          ) : (
            <ul className="eintraege">
              {eintraege.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className={'eintrag' + (e.id === gewaehlt ? ' eintrag--aktiv' : '') + (e.deaktiviert ? ' eintrag--aus' : '')}
                    onClick={() => setGewaehlt(e.id)}
                  >
                    <span className="eintrag__wort">{e.wort}</span>
                    <span className={'abzeichen abzeichen--' + e.art}>{e.art === 'begriff' ? 'Begriff' : 'Thema'}</span>
                    <span className="eintrag__meta">
                      {WORTART_TITEL[e.wortart]}
                      {e.deaktiviert ? ' · deaktiviert' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Sicherung />
        </section>

        <section className="woerterbuch__formular">
          <EintragFormular key={eintrag?.id ?? 'neu'} eintrag={eintrag} aufFertig={setGewaehlt} />
        </section>
      </div>

      <Erkennungsprobe />
    </main>
  )
}
