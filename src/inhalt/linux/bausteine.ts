import type { Inhalt, Knoten } from '../../kern/typen'

const H = 'linux'

/**
 * Baukasten für das Universum Linux-Server.
 *
 * Wie im Universum Datenbanken werden die Koordinaten hier gesetzt und nicht
 * in den Inhaltsdateien — eine Inhaltsdatei kann sie damit nicht inkonsistent
 * vergeben, und eine umbenannte Achse ist eine Änderung an einer Stelle.
 *
 * Der zweite Zweck ist neu: Der Baukasten setzt das Facettenschema durch.
 * Ein Informationsblatt entsteht nur aus einem vollständigen `Blatt` — alle
 * sechs Rubriken sind Pflichtfelder des Typs. Eine Datei ohne Format oder
 * ohne Beispielinhalt lässt sich nicht anlegen, statt später aufzufallen.
 */

/**
 * Das Informationsblatt einer Datei — Ebene 4.
 *
 * Die Feldnamen bilden das Facettenschema des Universums ab:
 *
 *   zweck        -> Facette 'zweck'         Fließtext des Knotens
 *   format       -> Facette 'format'        Steckbriefzeile
 *   beispiel     -> Facette 'beispiel'      Codeblock
 *   gelesenVon   -> Facette 'architektur'   Steckbriefzeile
 *   rechte       -> Facette 'sicherheit'    Steckbriefzeile (plus Warnung)
 *   betrieb      -> Facette 'betrieb'       Steckbriefzeile
 */
export interface Blatt {
  /** Letztes Pfadsegment, kleingeschrieben — wird Teil der URL. */
  readonly id: string
  readonly titel: string
  /** Absoluter Pfad, so wie er auf dem Server steht. */
  readonly pfad: string
  /** Wofür die Datei existiert. README Nr. 21: knapp, ohne Erzählung. */
  readonly zweck: string
  /** Syntax, Felder, Trennzeichen — so genau, dass man sie lesen kann. */
  readonly format: string
  /** Übliche Rechte und Eigentümer, in der Schreibweise von `ls -l`. */
  readonly rechte: string
  /** Wer die Datei schreibt und wer sie auswertet. */
  readonly gelesenVon: string
  /** Wie eine Änderung wirksam wird oder wie man den Inhalt ausliest. */
  readonly betrieb: string
  /** Ein echter Ausschnitt, gekürzt aber nicht erfunden. */
  readonly beispiel: string
  /** Voreinstellung 'ini' — die Codebox hebt ohnehin nicht hervor. */
  readonly sprache?: string
  readonly punkte?: readonly string[]
  readonly warnung?: string
}

/**
 * Der erste Satz des Zwecks ist die Zeile fuer die Kachel und die
 * Unterzeile des Informationsblatts, der Rest der Fliesstext darunter —
 * sonst stuende derselbe Satz zweimal untereinander. Bleibt zu wenig
 * uebrig, traegt der Fliesstext den vollstaendigen Zweck.
 */
function teileZweck(zweck: string): [kurz: string, rumpf: string] {
  const schnitt = zweck.indexOf('. ')
  if (schnitt < 0) return [kachelzeile(zweck.replace(/\.$/, '')), zweck]

  const ersterSatz = zweck.slice(0, schnitt)
  const rest = zweck.slice(schnitt + 2)

  // Nur wenn der erste Satz vollstaendig als Kachelzeile taugt, faellt er
  // aus dem Fliesstext heraus. Sonst traegt der Fliesstext den ganzen Zweck.
  if (ersterSatz.length > 80 || rest.length < 40) return [kachelzeile(ersterSatz), zweck]
  return [ersterSatz, rest]
}

/**
 * Ein langer Satz wird auf seinen Kopf gekuerzt — bis zum Doppelpunkt oder
 * bis zum Gedankenstrich. Was dahinter steht, ist die Ausfuehrung und steht
 * ohnehin im Fliesstext darunter.
 */
function kachelzeile(satz: string): string {
  if (satz.length <= 80) return satz
  for (const trenner of [': ', ' — ']) {
    const stelle = satz.indexOf(trenner)
    if (stelle > 8) return satz.slice(0, stelle)
  }
  return satz
}

/** Ebene 2: ein Cluster von Wurzelverzeichnissen. */
export function cluster(
  id: string,
  titel: string,
  kurz: string,
  gruppe: 'dauerhaft' | 'fluechtig',
  wurzeln: readonly string[],
  kern: Inhalt,
): Knoten {
  return {
    id: `cluster-${id}`,
    titel,
    kurz,
    heimat: H,
    koordinate: { cluster: id },
    art: 'kategorie',
    gruppe,
    steckbrief: [['Wurzelverzeichnisse', wurzeln.join(', ')]],
    kern,
  }
}

/**
 * Ebene 3 und 4 für einen Cluster. Nimmt die Clusterkennung einmal
 * entgegen und liefert die beiden Erzeuger.
 */
export function baukasten(clusterId: string) {
  return {
    /** Ebene 3: ein Unterverzeichnis. */
    verzeichnis(id: string, titel: string, kurz: string, kern: Inhalt): Knoten {
      return {
        id: `${clusterId}-${id}`,
        titel,
        kurz,
        heimat: H,
        koordinate: { cluster: clusterId, verzeichnis: id },
        art: 'traeger',
        steckbrief: [['Pfad', titel]],
        kern,
      }
    },

    /** Ebene 4: das Informationsblatt einer Datei. */
    datei(verzeichnisId: string, blatt: Blatt): Knoten {
      const [kurz, rumpf] = teileZweck(blatt.zweck)
      return {
        id: `${clusterId}-${verzeichnisId}-${blatt.id}`,
        titel: blatt.titel,
        kurz,
        heimat: H,
        koordinate: {
          cluster: clusterId,
          verzeichnis: verzeichnisId,
          datei: blatt.id,
        },
        art: 'blatt',
        steckbrief: [
          ['Pfad', blatt.pfad],
          ['Format', blatt.format],
          ['Rechte', blatt.rechte],
          ['Gelesen von', blatt.gelesenVon],
          ['Im Betrieb', blatt.betrieb],
        ],
        kern: {
          text: rumpf,
          punkte: blatt.punkte,
          code: { sprache: blatt.sprache ?? 'ini', quelltext: blatt.beispiel },
          warnung: blatt.warnung,
        },
      }
    },
  }
}
