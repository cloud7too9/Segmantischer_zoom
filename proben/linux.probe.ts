/**
 * Probe des Universums Linux-Server gegen die echte Baumlogik.
 *
 * Sie sichert zwei Dinge ab, die sich beim Schreiben von Inhalt leise
 * verlieren: die Grenzen aus dem Regelwerk (fuenf bis neun Kacheln je
 * Ebene, hoechstens vier Ebenen) und die Vollstaendigkeit des
 * Informationsblatts — jedes Blatt traegt alle sechs Rubriken des
 * Facettenschemas, ohne Ausnahme (README Nr. 9 und Nr. 21).
 */
import { registriereKnoten, registriereUniversum } from '../src/kern/registry'
import { linux, linuxKnoten } from '../src/inhalt/linux'
import { ahnen, kinder, knotenAmOrt } from '../src/kern/baum'
import { ortAusPfad, pfadAusOrt } from '../src/kern/pfad'
import type { Knoten } from '../src/kern/typen'

registriereUniversum(linux)
registriereKnoten(...linuxKnoten)

let fehler = 0
function pruefe(name: string, ist: unknown, soll: unknown) {
  const ok = JSON.stringify(ist) === JSON.stringify(soll)
  if (!ok) fehler++
  console.log(`${ok ? 'OK  ' : 'FEHL'}  ${name}` + (ok ? '' : ` — erwartet ${JSON.stringify(soll)}, ist ${JSON.stringify(ist)}`))
}

const U = linux
const ort = (...werte: string[]) => ({ universum: U.id, werte })

/* ------------------------------------------------- Ebene 2: die Cluster */

const cluster = kinder(ort(), U)
pruefe('Clusterebene: neun Cluster', cluster.length, 9)
pruefe('Clusterebene bleibt bei hoechstens 9 Kacheln (Nr. 2)', cluster.length <= 9, true)
pruefe('Clusterebene hat mindestens 5 Kacheln (Nr. 2)', cluster.length >= 5, true)
pruefe(
  'jeder Cluster traegt eine Gruppe fuer Farbe und Filter (Nr. 6)',
  cluster.every((k) => k.gruppe === 'dauerhaft' || k.gruppe === 'fluechtig'),
  true,
)

// Die Buendelung muss vollstaendig und ueberschneidungsfrei sein: jedes
// Wurzelverzeichnis liegt in genau einem Cluster.
const fhs = [
  '/bin', '/boot', '/dev', '/efi', '/etc', '/home', '/lib', '/lib32', '/lib64',
  '/libx32', '/media', '/mnt', '/opt', '/proc', '/root', '/run', '/sbin',
  '/srv', '/sys', '/tmp', '/usr', '/var',
]
const zugeordnet = cluster.flatMap((k) =>
  (k.steckbrief?.find(([s]) => s === 'Wurzelverzeichnisse')?.[1] ?? '').split(', '),
)
pruefe('kein Wurzelverzeichnis liegt in zwei Clustern', new Set(zugeordnet).size, zugeordnet.length)
pruefe('jedes Wurzelverzeichnis ist einem Cluster zugeordnet', [...zugeordnet].sort(), [...fhs].sort())

/* ------------------------------------ Ebene 3 und 4 der fertigen Cluster */

const ausgebaut = ['konfiguration', 'zustand', 'kernelsicht']

for (const c of ausgebaut) {
  const verzeichnisse = kinder(ort(c), U)
  pruefe(`${c}: fuenf bis neun Verzeichnisse`, verzeichnisse.length >= 5 && verzeichnisse.length <= 9, true)

  for (const v of verzeichnisse) {
    const id = v.koordinate.verzeichnis as string
    const dateien = kinder(ort(c, id), U)
    pruefe(`${c}/${id}: fuenf bis neun Dateien`, dateien.length >= 5 && dateien.length <= 9, true)
    pruefe(`${c}/${id}: Blattebene hat keine Kinder mehr`, kinder(ort(c, id, dateien[0].koordinate.datei as string), U).length, 0)
  }
}

/* --------------------------------- Das Informationsblatt ist vollstaendig */

const rubriken = ['Pfad', 'Format', 'Rechte', 'Gelesen von', 'Im Betrieb']
const blaetter = linuxKnoten.filter((k) => k.art === 'blatt')

pruefe('es gibt Blattknoten', blaetter.length > 0, true)

function unvollstaendig(pruefung: (k: Knoten) => boolean): string[] {
  return blaetter.filter((k) => !pruefung(k)).map((k) => k.id)
}

pruefe(
  'jedes Blatt traegt genau die fuenf Steckbriefzeilen des Schemas',
  unvollstaendig((k) => JSON.stringify(k.steckbrief?.map(([s]) => s)) === JSON.stringify(rubriken)),
  [],
)
pruefe('jedes Blatt hat einen Zweck', unvollstaendig((k) => (k.kern.text ?? '').length > 40), [])
pruefe('jedes Blatt hat einen Beispielinhalt', unvollstaendig((k) => (k.kern.code?.quelltext ?? '').length > 10), [])
pruefe('kein Steckbriefeintrag ist leer', unvollstaendig((k) => (k.steckbrief ?? []).every(([, w]) => w.trim().length > 0)), [])

// README Nr. 1: Ein Cluster ohne Kinder muss wenigstens tragen, was er
// verspricht — sonst ist die Zoomstufe eine Sackgasse ohne Ansage.
for (const k of cluster) {
  const id = k.koordinate.cluster as string
  if (ausgebaut.includes(id)) continue
  pruefe(`${id}: Sackgasse ist als solche gekennzeichnet`, (k.kern.warnung ?? '').length > 0, true)
  pruefe(`${id}: traegt trotzdem einen Steckbrief`, (k.steckbrief?.length ?? 0) > 0, true)
}

/* ------------------------------------------------ Modell und Navigation */

const ids = linuxKnoten.map((k) => k.id)
pruefe('IDs sind eindeutig', new Set(ids).size, ids.length)
pruefe('alle Knoten haben dieselbe Heimat (Nr. 11)', new Set(linuxKnoten.map((k) => k.heimat)).size, 1)
pruefe('hoechstens drei Ebenen unter dem Universum (Nr. 7)', U.achsen.length <= 4, true)
pruefe(
  'Knoten am Ort',
  knotenAmOrt(ort('konfiguration', 'ssh', 'sshd-config'), U)?.id,
  'konfiguration-ssh-sshd-config',
)
pruefe('Universumsebene hat keinen eigenen Knoten', knotenAmOrt(ort(), U), undefined)
pruefe(
  'Brotkrume bis zum Informationsblatt',
  ahnen(ort('konfiguration', 'ssh', 'sshd-config'), U).map((a) => a.titel),
  ['Linux-Server', 'Konfiguration', '/etc/ssh', 'sshd_config'],
)

const p = '/linux/kernelsicht/prozess/cmdline'
pruefe('Pfad ist verlustfrei umkehrbar', pfadAusOrt(ortAusPfad(p)), p)

// Derselbe Beweis wie im Universum Datenbanken: die Matrix haengt an der
// Achsenreihenfolge, nicht an den Daten (README Nr. 8).
const andereMatrix = { ...U, achsen: ['verzeichnis', 'cluster', 'datei'] as const }
pruefe(
  'Achsen tauschen ergibt Verzeichnisse als Wurzelebene',
  kinder(ort(), andereMatrix).length,
  16,
)

console.log(fehler === 0 ? '\nAlle Proben bestanden.' : `\n${fehler} Probe(n) fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
