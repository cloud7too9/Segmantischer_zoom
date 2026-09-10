import type { Universum } from '../../kern/typen'

/**
 * Universum Datenbanken.
 *
 * `achsen` ist die Standard-Matrix. Umsortieren ergibt eine andere Sicht
 * auf dieselben Knoten — z. B. ['facette','typ','traeger'] würde nach
 * Sicherheit/Architektur/Betrieb gliedern statt nach Datenbanktyp.
 * Nicht gebaut, nur nicht verbaut (README, Nicht-Ziele).
 */
export const datenbanken: Universum = {
  id: 'datenbanken',
  titel: 'Datenbanken',
  kurz: 'Arten, Vertreter und ihre Eigenschaften',
  achsen: ['typ', 'traeger', 'facette', 'konzept'],

  // README Nr. 6: SQL/NoSQL wird Farbe, Legende und Filter — keine Ebene.
  gruppen: [
    { id: 'sql', titel: 'Relational (SQL)', marke: 'voll' },
    { id: 'nosql', titel: 'Nicht-relational (NoSQL)', marke: 'hohl' },
  ],

  // Beim allerersten Besuch ist die vertraute Zweiteilung vorbelegt.
  erstbesuchGruppe: 'sql',

  // README Nr. 9/10: gilt für jeden Träger dieses Universums.
  // imKern = gebietsübergreifend, trägt später die globale Bündelung.
  facetten: [
    { id: 'datenmodell', titel: 'Datenmodell', kurz: 'Wie Daten strukturiert sind', imKern: false },
    { id: 'abfragen', titel: 'Abfragen', kurz: 'Sprache, Auswertung, Indexe', imKern: false },
    { id: 'architektur', titel: 'Architektur', kurz: 'Speicherung und Verteilung', imKern: true },
    { id: 'konsistenz', titel: 'Konsistenz', kurz: 'Garantien und Transaktionen', imKern: false },
    { id: 'sicherheit', titel: 'Sicherheit', kurz: 'Zugriff, Härtung, Angriffe', imKern: true },
    { id: 'betrieb', titel: 'Betrieb', kurz: 'Installation, Backup, Monitoring', imKern: true },
  ],
}
