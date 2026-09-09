import type { Inhalt, Knoten } from '../../kern/typen'

/**
 * Baukasten fuer einen Traeger. Nimmt Typ und Traeger einmal entgegen und
 * liefert die beiden Erzeuger fuer Facetten und Konzepte.
 *
 * Die Koordinaten werden hier gesetzt — dadurch kann eine Inhaltsdatei sie
 * nicht versehentlich inkonsistent vergeben, und ein spaeteres Umbenennen
 * einer Achse ist eine Aenderung an genau einer Stelle.
 */
export function baukasten(typ: string, traeger: string, heimat = 'datenbanken') {
  return {
    facette(id: string, titel: string, kurz: string, kern: Inhalt): Knoten {
      return {
        id: `${traeger}-${id}`,
        titel,
        kurz,
        heimat,
        koordinate: { typ, traeger, facette: id },
        art: 'facette',
        kern,
      }
    },
    konzept(
      facetteId: string,
      id: string,
      titel: string,
      kurz: string,
      kern: Inhalt,
    ): Knoten {
      return {
        id: `${traeger}-${facetteId}-${id}`,
        titel,
        kurz,
        heimat,
        koordinate: { typ, traeger, facette: facetteId, konzept: id },
        art: 'konzept',
        kern,
      }
    },
  }
}
