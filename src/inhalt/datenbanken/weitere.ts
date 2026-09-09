import type { Knoten } from '../../kern/typen'

const H = 'datenbanken'

/**
 * Weitere Traeger, vorerst ohne Facetten. Sie halten die Typenebene
 * begehbar — eine Kategorie, die ins Leere fuehrt, ist schlimmer als
 * eine, die vorerst nur einen Steckbrief zeigt.
 */
export const weitereTraeger: Knoten[] = [
  {
    id: 'redis',
    titel: 'Redis',
    kurz: 'In-Memory, Datenstrukturen',
    heimat: H,
    koordinate: { typ: 'key-value', traeger: 'redis' },
    art: 'traeger',
    gruppe: 'nosql',
    steckbrief: [
      ['Erschienen', '2009'],
      ['Standard-Port', '6379'],
    ],
    kern: {
      text: 'Hält Daten im Arbeitsspeicher und bietet nicht nur Werte, sondern Datenstrukturen: Listen, Mengen, sortierte Mengen, Zähler, Streams.',
      warnung: 'Facetten noch nicht ausgearbeitet.',
    },
  },
]
