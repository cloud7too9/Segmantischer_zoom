import type { Knoten } from '../../kern/typen'
import { cluster } from './bausteine'

/**
 * Ebene 2: die Wurzelverzeichnisse als neun Cluster.
 *
 * Gebündelt wird nach Zweck, nicht nach Namen — deshalb liegen /bin, /sbin
 * und /lib bei /usr (auf jedem aktuellen System sind sie Symlinks dorthin)
 * und /proc bei /sys (beides Sichten des Kernels, keine Datenträger).
 *
 * Die Bündelung ist vollständig: Jedes Wurzelverzeichnis des FHS liegt in
 * genau einem Cluster. Die Probe prüft das nach.
 *
 * README Nr. 1: Ein Cluster, der ins Leere führt, wäre eine verschenkte
 * Stufe. Wo die Unterverzeichnisse noch nicht ausgearbeitet sind, trägt der
 * Cluster deshalb mindestens einen belastbaren Steckbrief — wie Redis im
 * Universum Datenbanken.
 */
export const clusterKnoten: Knoten[] = [
  cluster(
    'konfiguration',
    'Konfiguration',
    'Wie sich dieser eine Rechner verhält',
    'dauerhaft',
    ['/etc'],
    {
      text: '/etc enthält die Entscheidungen, die diesen Rechner von einem baugleichen unterscheiden: Benutzer, Netz, Dienste, Zugriff. Alles darin ist textbasiert, versionierbar und maschinenlesbar — der Grund, warum sich ein Linux-Server überhaupt aus einer Sicherung wiederherstellen lässt.',
      punkte: [
        'Nur lokale Konfiguration — keine Programme, keine veränderlichen Daten',
        'Paketupdates fassen geänderte Dateien nicht an, sondern fragen nach',
        'Fast alles hier ist die erste Anlaufstelle nach einem Vorfall',
      ],
    },
  ),
  cluster(
    'zustand',
    'Veränderliche Daten',
    'Was der Betrieb schreibt und behält',
    'dauerhaft',
    ['/var'],
    {
      text: '/var ist der Gegenpol zu /usr: Hier schreiben Dienste im laufenden Betrieb. Protokolle, Warteschlangen, Paketdatenbanken, Zwischenspeicher. Der Inhalt wächst, deshalb ist /var auf Servern häufig eine eigene Partition — ein vollgelaufenes /var legt Dienste lahm, ein vollgelaufenes / legt das System lahm.',
      punkte: [
        'Überlebt den Neustart, im Gegensatz zu /run',
        'Wächst unbegrenzt, wenn niemand rotiert oder aufräumt',
        'Enthält mit /var/log die erste Quelle bei jeder Störung',
      ],
    },
  ),
  cluster(
    'software',
    'Installierte Software',
    'Programme, Bibliotheken, mitgelieferte Daten',
    'dauerhaft',
    ['/usr', '/bin', '/sbin', '/lib', '/lib32', '/lib64', '/libx32'],
    {
      text: '/usr enthält alles, was die Paketverwaltung installiert hat, und nichts, was dieser Rechner selbst entschieden hat. Es ließe sich schreibgeschützt einhängen und zwischen baugleichen Systemen teilen. /bin, /sbin und /lib sind seit dem usr-merge nur noch Symlinks nach /usr/bin, /usr/sbin und /usr/lib.',
      punkte: [
        'Ändert sich nur durch Paketvorgänge, nie durch den Betrieb',
        '/usr/local ist der Bereich für händisch Installiertes',
        '/usr/share trägt Dokumentation, Zeitzonen, Icons, Übersetzungen',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
  cluster(
    'benutzer',
    'Benutzerdaten',
    'Persönliche Verzeichnisse und ihre Konfiguration',
    'dauerhaft',
    ['/home', '/root'],
    {
      text: 'Ein Heimatverzeichnis ist die dritte Konfigurationsebene neben den Voreinstellungen des Pakets und /etc: Was hier steht, gilt nur für diesen einen Benutzer und schlägt die Systemvorgabe. /root liegt bewusst außerhalb von /home, damit der Administrator sich auch dann anmelden kann, wenn /home nicht eingehängt ist.',
      punkte: [
        'Punktdateien (~/.bashrc, ~/.ssh/) sind Konfiguration je Benutzer',
        '~/.ssh/authorized_keys entscheidet über den Zugang zum Server',
        'Auf Servern liegen hier oft die einzigen unwiederbringlichen Daten',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
  cluster(
    'kernelsicht',
    'Kernel-Schnittstellen',
    'Der Kernel als Dateisystem',
    'fluechtig',
    ['/proc', '/sys'],
    {
      text: 'Hier liegt keine einzige echte Datei. Was aussieht wie eine Textdatei, ist ein Aufruf in den Kernel, der seine Antwort beim Lesen erzeugt. /proc zeigt Prozesse und Systemzustand, /sys zeigt Geräte, Treiber und Steuerknöpfe. Wer das versteht, braucht für die meisten Fragen kein Werkzeug mehr, sondern nur cat.',
      punkte: [
        'Größe 0, Änderungszeitpunkt jetzt — beides bedeutungslos',
        'Schreiben in eine Datei ist ein Kommando an den Kernel',
        'top, ps, free und uptime lesen alle nur von hier',
      ],
    },
  ),
  cluster(
    'geraete',
    'Geräte',
    'Hardware als Datei',
    'fluechtig',
    ['/dev'],
    {
      text: 'Der älteste Trick von Unix: Ein Gerät ist eine Datei, die man öffnen, lesen und schreiben kann. /dev wird beim Start als devtmpfs im Arbeitsspeicher angelegt und von udev gepflegt — die Einträge entstehen und verschwinden mit der Hardware.',
      punkte: [
        'Blockgeräte (/dev/sda, /dev/nvme0n1) und Zeichengeräte (/dev/tty)',
        'Stabile Namen über /dev/disk/by-uuid statt über /dev/sdX',
        '/dev/null, /dev/zero und /dev/urandom sind reine Softwaregeräte',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
  cluster(
    'laufzeit',
    'Laufzeit und Flüchtiges',
    'Was seit dem letzten Start entstanden ist',
    'fluechtig',
    ['/run', '/tmp'],
    {
      text: '/run ist ein tmpfs im Arbeitsspeicher und enthält den Zustand laufender Dienste: Sockets, PID-Dateien, die tatsächlich benutzte resolv.conf. Beim Neustart ist alles davon weg — und genau das ist die Eigenschaft, die man von diesem Cluster will. /tmp ist derselbe Mechanismus für Anwendungen.',
      punkte: [
        '/var/run und /var/lock sind nur noch Symlinks nach /run',
        'systemd-tmpfiles räumt /tmp nach Regeln auf, nicht der Neustart allein',
        'Wer hier konfiguriert, hat die Änderung beim nächsten Start verloren',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
  cluster(
    'start',
    'Systemstart',
    'Was vor dem laufenden System da ist',
    'dauerhaft',
    ['/boot', '/efi'],
    {
      text: '/boot enthält den Kernel, die initramfs und die Konfiguration des Bootloaders — alles, was gebraucht wird, bevor das eigentliche Wurzeldateisystem zur Verfügung steht. Auf UEFI-Systemen liegt daneben die EFI-Systempartition, ein FAT32-Dateisystem, weil die Firmware nichts anderes lesen kann.',
      punkte: [
        'Meist eine eigene, kleine Partition — und deshalb regelmäßig voll',
        'Alte Kernel bleiben liegen, bis sie ausdrücklich entfernt werden',
        'Ein fehlerhaftes Update hier macht den Rechner unbootbar',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
  cluster(
    'fremd',
    'Zusatzsoftware und Dienstdaten',
    'Was nicht aus der Paketverwaltung kommt',
    'dauerhaft',
    ['/opt', '/srv', '/mnt', '/media'],
    {
      text: 'Vier Verzeichnisse mit einer gemeinsamen Eigenschaft: Die Distribution rührt sie nicht an. /opt nimmt geschlossene Fremdsoftware in einem eigenen Baum auf, /srv die Daten, die dieser Server ausliefert, /mnt und /media die Einhängepunkte für zusätzliche Datenträger.',
      punkte: [
        '/opt/<hersteller>/ bringt seine eigene Verzeichnisstruktur mit',
        '/srv trennt ausgelieferte Daten sauber von /var/www',
        '/mnt für händisches Einhängen, /media für automatisch erkannte Medien',
      ],
      warnung: 'Unterverzeichnisse noch nicht ausgearbeitet.',
    },
  ),
]
