/**
 * Probe der Erkennungslogik gegen kern/erkennung.ts und kern/woerterbuch.ts.
 * Sichert ab: Verweise werden nie von Hand gesetzt, sondern beim Rendern
 * aus dem Wörterbuch erkannt — und das Wörterbuch wächst zur Laufzeit.
 */
import { erkenne, erkannteVerweise, setzeLemmatisierer, einfacherLemmatisierer } from '../src/kern/erkennung'
import { aendereEintrag, deaktiviereEintrag, ergaenzeWoerterbuch, leereWoerterbuch } from '../src/kern/woerterbuch'

let fehler = 0
function pruefe(name: string, ist: unknown, soll: unknown) {
  const ok = JSON.stringify(ist) === JSON.stringify(soll)
  if (!ok) fehler++
  console.log(`${ok ? 'OK  ' : 'FEHL'}  ${name}` + (ok ? '' : ` — erwartet ${JSON.stringify(soll)}, ist ${JSON.stringify(ist)}`))
}

const treffer = (text: string) => erkannteVerweise(text).map((s) => `${s.text}→${s.verweis!.art}:${s.verweis!.zielId}`)

leereWoerterbuch()
ergaenzeWoerterbuch(
  { id: 'datenbank', art: 'begriff', wort: 'Datenbank', lemma: 'datenbank', wortart: 'nomen', definition: 'Organisierte Sammlung von Daten.' },
  { id: 'transaktion', art: 'begriff', wort: 'Transaktion', lemma: 'transaktion', wortart: 'nomen', definition: 'Unteilbare Folge von Operationen.' },
  { id: 'relationale-datenbank', art: 'begriff', wort: 'relationale Datenbank', lemma: 'relational datenbank', wortart: 'nomen', definition: 'Datenbank nach dem Relationenmodell.' },
  { id: 'netzwerke', art: 'themengebiet', wort: 'Netzwerk', lemma: 'netzwerk', wortart: 'nomen', definition: 'Themengebiet Netzwerke.', universum: 'netzwerke' },
)

pruefe('Grundform wird erkannt', treffer('Eine Datenbank speichert.'), ['Datenbank→begriff:datenbank'])
pruefe('Plural wird erkannt', treffer('Viele Datenbanken speichern.'), ['Datenbanken→begriff:datenbank'])
pruefe('Groß-/Kleinschreibung egal', treffer('DATENBANK und datenbank'), ['DATENBANK→begriff:datenbank', 'datenbank→begriff:datenbank'])
pruefe('Beugung mit -en', treffer('Transaktionen sind atomar.'), ['Transaktionen→begriff:transaktion'])
pruefe('Mehrwortbegriff, längster Treffer gewinnt', treffer('Eine relationale Datenbank nutzt SQL.'), ['relationale Datenbank→begriff:relationale-datenbank'])
pruefe('Teilwort allein bleibt der kurze Begriff', treffer('Die Datenbank ist relational.'), ['Datenbank→begriff:datenbank'])
pruefe('Themengebiet zielt auf das Universum', treffer('Über Netzwerke reden.'), ['Netzwerke→themengebiet:netzwerke'])
pruefe('Kein Treffer in fremden Wörtern', treffer('Datenbankadministrator'), [])
pruefe('Segmente ergeben wieder den Text', erkenne('A Datenbank, B Netzwerk!').map((s) => s.text).join(''), 'A Datenbank, B Netzwerk!')
pruefe('Text ohne Treffer ist ein Segment', erkenne('Nichts hier.').length, 1)
pruefe('Leerer Text', erkenne(''), [])

// Laufzeit-Erweiterung: ein neuer Eintrag wirkt sofort in bestehenden Texten.
const text = 'Ein Index beschleunigt Indizes nicht.'
pruefe('Vorher unbekannt', treffer(text), [])
ergaenzeWoerterbuch({ id: 'index', art: 'begriff', wort: 'Index', lemma: 'index', wortart: 'nomen', definition: 'Zugriffsstruktur.' })
pruefe('Nach Ergänzung erkannt', treffer(text), ['Index→begriff:index'])
pruefe('Unregelmäßige Form noch nicht', treffer('Indizes').length, 0)
aendereEintrag('index', { formen: ['Indizes'] })
pruefe('Gepflegte Wortform greift', treffer(text), ['Index→begriff:index', 'Indizes→begriff:index'])

// MH-DEC-001: deaktivieren statt löschen.
deaktiviereEintrag('index')
pruefe('Deaktiviert erzeugt keinen Verweis', treffer(text), [])

// Mehrdeutigkeit: gleiches Wort als Begriff und Themengebiet — Begriff gewinnt.
ergaenzeWoerterbuch({ id: 'netzwerk-begriff', art: 'begriff', wort: 'Netzwerk', lemma: 'netzwerk', wortart: 'nomen', definition: 'Verbund von Rechnern.' })
pruefe('Bei Gleichstand gewinnt der Begriff', treffer('Das Netzwerk.'), ['Netzwerk→begriff:netzwerk-begriff'])

// Austauschbarer Lemmatisierer: Wortart aus dem Lemmatisierer schließt Fehltreffer aus.
setzeLemmatisierer((w) => ({ ...einfacherLemmatisierer(w), wortart: w === 'relational' ? 'adjektiv' : 'nomen' }))
pruefe('Wortart-Konflikt verhindert Treffer', treffer('relational Datenbank'), ['Datenbank→begriff:datenbank'])
setzeLemmatisierer(einfacherLemmatisierer)
pruefe('Index wird nach Lemmatisiererwechsel neu gebaut', treffer('relationale Datenbank'), ['relationale Datenbank→begriff:relationale-datenbank'])

console.log(fehler === 0 ? '\nAlle Proben bestanden.' : `\n${fehler} Probe(n) fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
