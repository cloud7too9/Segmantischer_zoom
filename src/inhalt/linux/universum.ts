import type { Universum } from '../../kern/typen'

/**
 * Universum Linux-Server.
 *
 * Die Matrix ist das Dateisystem selbst:
 *
 *   Ebene 1  Universum          das Themengebiet
 *   Ebene 2  Cluster            die Wurzelverzeichnisse, nach Zweck gebündelt
 *   Ebene 3  Verzeichnis        ein Unterverzeichnis daraus
 *   Ebene 4  Datei              das Informationsblatt: Zweck, Format, Beispiel
 *
 * Drei Achsen unter dem Universum — das ist die Obergrenze aus README Nr. 7,
 * und sie wird hier ausgereizt, nicht überschritten.
 *
 * Warum Cluster und nicht die Wurzelverzeichnisse selbst: Der FHS kennt
 * achtzehn davon. Achtzehn Kacheln verletzen README Nr. 2 und sind auf einen
 * Blick nicht erfassbar. Neun Cluster fassen sie nach Zweck zusammen —
 * jedes Wurzelverzeichnis liegt in genau einem, keines fällt heraus.
 *
 * Bezugssystem ist ein Debian/Ubuntu-Server mit systemd. Pfade sind
 * distributionsabhängig; ohne festen Bezug wäre jedes Informationsblatt
 * eine Aufzählung von Ausnahmen statt einer Referenz.
 */
export const linux: Universum = {
  id: 'linux',
  titel: 'Linux-Server',
  kurz: 'Das Dateisystem als Ordnung des Wissens',
  achsen: ['cluster', 'verzeichnis', 'datei'],

  /**
   * README Nr. 6: Die Unterscheidung ist positiv formuliert — was einen
   * Neustart überlebt und was der Kernel beim Start neu erzeugt. Sie ist
   * die wichtigste Eigenschaft eines Pfades im Betrieb und trotzdem keine
   * Ebene: man navigiert nicht danach, man erkennt sie.
   */
  gruppen: [
    { id: 'dauerhaft', titel: 'Überlebt den Neustart', marke: 'voll' },
    { id: 'fluechtig', titel: 'Beim Start erzeugt', marke: 'hohl' },
  ],

  erstbesuchGruppe: 'dauerhaft',

  /**
   * README Nr. 9/10: dasselbe Schema für jedes Blatt dieses Universums.
   *
   * Hier ist das Facettenschema keine Zoomachse, sondern die Rubrik des
   * Informationsblatts: Jede Datei wird nach denselben sechs Gesichtspunkten
   * beschrieben, in derselben Reihenfolge, ohne Ausnahme. Der Baukasten
   * setzt das durch, die Probe prüft es nach.
   *
   * Die drei Facetten mit imKern tragen dieselben Kennungen wie im Universum
   * Datenbanken — das ist der Belastungstest aus README Nr. 23: Trägt der
   * gemeinsame Kern über zwei Gebiete hinweg, kann die globale Suche später
   * gebietsübergreifend bündeln.
   */
  facetten: [
    { id: 'zweck', titel: 'Zweck', kurz: 'Wofür die Datei existiert', imKern: false },
    { id: 'format', titel: 'Format', kurz: 'Syntax, Felder, Trennzeichen', imKern: false },
    { id: 'beispiel', titel: 'Beispielinhalt', kurz: 'Ein echter Ausschnitt', imKern: false },
    { id: 'architektur', titel: 'Einordnung', kurz: 'Wer schreibt, wer liest', imKern: true },
    { id: 'sicherheit', titel: 'Sicherheit', kurz: 'Rechte, Geheimnisse, Fallen', imKern: true },
    { id: 'betrieb', titel: 'Betrieb', kurz: 'Wirksam werden und prüfen', imKern: true },
  ],
}
