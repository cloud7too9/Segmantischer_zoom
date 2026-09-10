import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const { verzeichnis, datei } = baukasten('kernelsicht')

/* ------------------------------------------------- Ebene 3: Verzeichnisse */

const verzeichnisse: Knoten[] = [
  verzeichnis('proc', '/proc', 'Der Systemzustand als Textdatei', {
    text: 'Die Dateien direkt in /proc beantworten Fragen über das ganze System: Auslastung, Speicher, Prozessoren, Laufzeit, eingehängte Dateisysteme. Sie werden im Moment des Lesens erzeugt — deshalb ist jede Antwort eine Momentaufnahme und nie ein gespeicherter Wert.',
    punkte: [
      'Größe 0 und Änderungszeitpunkt jetzt sind bedeutungslos',
      'free, uptime und top lesen ausschließlich von hier',
      'Alles ist Text, damit auch ohne Werkzeuge auswertbar',
    ],
  }),
  verzeichnis('prozess', '/proc/<PID>', 'Ein Prozess von innen', {
    text: 'Zu jedem laufenden Prozess gibt es ein Verzeichnis mit seiner Nummer. Darin steht alles, was der Kernel über ihn weiß: Aufrufzeile, Umgebung, offene Dateien, Speicherabbild, Grenzen, verbrauchte Ein- und Ausgabe. Wo ps an seine Grenzen kommt, geht es hier weiter.',
    punkte: [
      '/proc/self zeigt immer auf den lesenden Prozess selbst',
      'Die Rechte gehören dem Eigentümer des Prozesses',
      'Verschwindet der Prozess, verschwindet das Verzeichnis beim nächsten Zugriff',
    ],
  }),
  verzeichnis('sysctl', '/proc/sys', 'Die Stellschrauben des Kernels', {
    text: 'Der einzige Teil von /proc, der beschreibbar ist. Jede Datei hier ist ein Parameter des laufenden Kernels: Ein echo hinein ändert das Verhalten sofort, ein cat liest den aktuellen Wert. sysctl ist nur eine bequemere Schreibweise für dieselben Dateien.',
    punkte: [
      'Der Pfad unter /proc/sys ist der Parametername mit Punkten statt Schrägstrichen',
      'Änderungen wirken sofort und sind nach dem Neustart weg',
      'Dauerhaft wird ein Wert erst durch /etc/sysctl.d/',
    ],
  }),
  verzeichnis('sysclass', '/sys/class', 'Geräte nach Art sortiert', {
    text: 'sysfs bildet die Gerätehierarchie des Kernels ab. /sys/class ist die nach Geräteart sortierte Sicht darauf: alle Netzschnittstellen, alle Blockgeräte, alle Temperaturfühler. Die Einträge sind Symlinks in den eigentlichen Gerätebaum unter /sys/devices.',
    punkte: [
      'Je Eigenschaft eine Datei — meist mit genau einem Wert',
      'Was schreibbar ist, ist ein Steuerknopf des Treibers',
      'Werkzeuge wie ip, lsblk und sensors lesen von hier',
    ],
  }),
  verzeichnis('cgroup', '/sys/fs/cgroup', 'Grenzen für Prozessgruppen', {
    text: 'Control Groups sind der Mechanismus, mit dem der Kernel Prozessgruppen Speicher, Rechenzeit und Ein-/Ausgabe zuteilt. systemd legt für jeden Dienst eine solche Gruppe an — was in einer Unit als MemoryMax steht, landet als Zahl in einer Datei hier.',
    punkte: [
      'Version 2 hat eine einzige Hierarchie, nicht mehr eine je Ressource',
      'Der Baum spiegelt die Slices und Units von systemd wider',
      'systemd-cgtop zeigt die Auslastung je Gruppe',
    ],
  }),
]

/* ------------------------------------------------------ Ebene 4: /proc */

const proc: Knoten[] = [
  datei('proc', {
    id: 'loadavg',
    titel: 'loadavg',
    pfad: '/proc/loadavg',
    zweck: 'Die Systemlast der letzten Minute, fünf Minuten und fünfzehn Minuten. Anders als bei anderen Unix-Systemen zählt Linux dabei nicht nur rechnende, sondern auch auf Ein- und Ausgabe wartende Prozesse — hohe Last kann also auch eine langsame Platte bedeuten.',
    format: 'Eine Zeile mit fünf Feldern: drei Mittelwerte, laufende/gesamte Prozesse, letzte PID',
    rechte: '0444 root:root — lesbar für alle, schreibbar für niemanden',
    gelesenVon: 'uptime, top, w und jedes Überwachungswerkzeug',
    betrieb: 'cat /proc/loadavg — die Werte gehören durch die Anzahl der Kerne geteilt',
    punkte: [
      'Ein Wert von 4,0 ist auf vier Kernen Volllast und auf sechzehn Kernen Langeweile',
      'Das vierte Feld lautet laufend/gesamt und ist oft aufschlussreicher als die Mittelwerte',
      'Dauerhaft hohe Last bei niedriger Prozessorauslastung heißt: Warten auf Ein-/Ausgabe',
    ],
    beispiel: `$ cat /proc/loadavg
0.42 0.58 0.61 2/431 28914

# 0.42  Mittel über 1 Minute
# 0.58  Mittel über 5 Minuten
# 0.61  Mittel über 15 Minuten
# 2/431 zwei laufende von 431 Prozessen
# 28914 zuletzt vergebene Prozessnummer`,
    sprache: 'sh',
  }),
  datei('proc', {
    id: 'meminfo',
    titel: 'meminfo',
    pfad: '/proc/meminfo',
    zweck: 'Die vollständige Speicherbuchhaltung des Kernels. Die entscheidende Zeile ist MemAvailable: Sie schätzt, wie viel Speicher neuen Programmen tatsächlich zur Verfügung steht — einschließlich dessen, was der Kernel für Zwischenspeicher hält und jederzeit freigeben kann.',
    format: 'Je Zeile ein Merkmal: Name, Doppelpunkt, Wert, Einheit kB',
    rechte: '0444 root:root',
    gelesenVon: 'free, top, vmstat und jede Speicherüberwachung',
    betrieb: 'cat /proc/meminfo; free -h ist dieselbe Auskunft in bequem',
    punkte: [
      'MemFree ist nicht der freie Speicher — ungenutzter Speicher wäre verschwendeter Speicher',
      'Buffers und Cached werden bei Bedarf sofort freigegeben',
      'Dirty zeigt, wie viel noch nicht auf die Platte geschrieben wurde',
      'Ein dauerhaft niedriges MemAvailable kündigt den OOM-Killer an',
    ],
    beispiel: `MemTotal:        8039412 kB
MemFree:          412884 kB
MemAvailable:    5218364 kB
Buffers:          198432 kB
Cached:          4712208 kB
SwapTotal:       2097148 kB
SwapFree:        2097148 kB
Dirty:              1284 kB`,
    sprache: 'text',
  }),
  datei('proc', {
    id: 'cpuinfo',
    titel: 'cpuinfo',
    pfad: '/proc/cpuinfo',
    zweck: 'Ein Abschnitt je logischem Prozessor. Er nennt Modell, Takt und die unterstützten Befehlssatzerweiterungen — auf virtuellen Maschinen verrät die Liste der Merkmale, welche Hardware darunterliegt.',
    format: 'Absätze aus Feld : Wert, getrennt durch Leerzeilen, einer je logischem Kern',
    rechte: '0444 root:root',
    gelesenVon: 'lscpu, nproc, Übersetzungswerkzeuge beim Erkennen der Zielarchitektur',
    betrieb: 'lscpu fasst zusammen; grep -c ^processor /proc/cpuinfo zählt die Kerne',
    punkte: [
      '„processor" zählt logische Kerne, also auch Hyperthreads',
      'Die Zeile flags nennt jede Erweiterung — aes, avx2, vmx',
      'Der Wert bei „cpu MHz" ist ein Momentanwert, kein Nennwert',
      'Ein Prozessorfehler wird über die Zeile bugs sichtbar',
    ],
    beispiel: `processor	: 0
vendor_id	: GenuineIntel
model name	: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz
cpu MHz		: 2000.000
cache size	: 49152 KB
siblings	: 8
cpu cores	: 4
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep aes avx2
bugs		: spectre_v1 spectre_v2 mds`,
    sprache: 'text',
  }),
  datei('proc', {
    id: 'uptime',
    titel: 'uptime',
    pfad: '/proc/uptime',
    zweck: 'Zwei Zahlen: wie lange das System läuft und wie viel Zeit alle Prozessorkerne zusammengerechnet im Leerlauf verbracht haben. Aus dem Verhältnis der beiden lässt sich die durchschnittliche Auslastung seit dem Start berechnen.',
    format: 'Eine Zeile, zwei Fließkommazahlen in Sekunden, durch Leerzeichen getrennt',
    rechte: '0444 root:root',
    gelesenVon: 'uptime, w, Überwachungsdienste zum Erkennen von Neustarts',
    betrieb: 'cat /proc/uptime; uptime -s nennt stattdessen den Startzeitpunkt',
    punkte: [
      'Die zweite Zahl summiert über alle Kerne und ist daher oft größer als die erste',
      'Ein unerwartet kleiner Wert ist der beste Hinweis auf einen ungeplanten Neustart',
      'Die Zeit läuft auch im Ruhezustand weiter, anders als bei mancher Hardwareuhr',
    ],
    beispiel: `$ cat /proc/uptime
1284736.42 9847213.88

# Laufzeit: 1284736 s = 14 Tage 20 Stunden
# Leerlauf über 8 Kerne: 9847213 s`,
    sprache: 'sh',
  }),
  datei('proc', {
    id: 'mounts',
    titel: 'mounts',
    pfad: '/proc/mounts',
    zweck: 'Die Liste der tatsächlich eingehängten Dateisysteme — nicht die geplante aus /etc/fstab, sondern der Ist-Zustand des Kernels. Der Unterschied zwischen beiden ist die Antwort auf viele Störungen.',
    format: 'Wie /etc/fstab: sechs Felder je Zeile, durch Leerzeichen getrennt',
    rechte: '0444 root:root — Symlink von /etc/mtab hierher',
    gelesenVon: 'df, findmnt, mount ohne Argumente',
    betrieb: 'findmnt zeigt dasselbe als Baum und ist lesbarer',
    punkte: [
      'Die Optionsspalte nennt die wirksamen Optionen, auch die nicht angegebenen',
      'ro statt rw bedeutet: Das Dateisystem hat sich nach einem Fehler selbst geschützt',
      '/proc/self/mountinfo enthält dieselben Angaben ausführlicher, mit Einhängekennungen',
    ],
    beispiel: `/dev/vda1 / ext4 rw,relatime,errors=remount-ro 0 0
proc /proc proc rw,nosuid,nodev,noexec,relatime 0 0
tmpfs /run tmpfs rw,nosuid,nodev,noexec,relatime,size=804680k,mode=755 0 0
/dev/mapper/vg0-var /var ext4 rw,noatime 0 0`,
    sprache: 'text',
    warnung:
      'Steht bei einem Dateisystem ro, obwohl in /etc/fstab rw eingetragen ist, hat der Kernel wegen eines Fehlers umgeschaltet. Dann gehört zuerst dmesg gelesen und nicht neu eingehängt.',
  }),
  datei('proc', {
    id: 'cmdline',
    titel: 'cmdline',
    pfad: '/proc/cmdline',
    zweck: 'Die Befehlszeile, mit der der laufende Kernel gestartet wurde. Sie beantwortet, welches Wurzeldateisystem gesucht wurde, welche Sicherheitsmerkmale abgeschaltet sind und was der Bootloader tatsächlich übergeben hat.',
    format: 'Eine einzige Zeile mit durch Leerzeichen getrennten Parametern',
    rechte: '0444 root:root',
    gelesenVon: 'Menschen; systemd wertet einige Parameter beim Start aus',
    betrieb: 'cat /proc/cmdline — dauerhaft geändert wird sie in /etc/default/grub',
    punkte: [
      'Der Unterschied zur GRUB-Konfiguration zeigt, ob update-grub je gelaufen ist',
      'mitigations=off schaltet Gegenmaßnahmen gegen Prozessorlücken ab — sichtbar nur hier',
      'Nicht zu verwechseln mit /proc/<PID>/cmdline, der Aufrufzeile eines Prozesses',
    ],
    beispiel: `$ cat /proc/cmdline
BOOT_IMAGE=/vmlinuz-6.8.0-45-generic root=UUID=1e3a9c74-… ro console=tty1 console=ttyS0`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------ Ebene 4: /proc/<PID> */

const prozess: Knoten[] = [
  datei('prozess', {
    id: 'status',
    titel: 'status',
    pfad: '/proc/<PID>/status',
    zweck: 'Der Steckbrief eines Prozesses in lesbarer Form: Zustand, Elternprozess, tatsächliche und wirksame Benutzernummer, Speicherverbrauch, Anzahl der Fäden. Was ps in Spalten presst, steht hier vollständig.',
    format: 'Je Zeile ein Feld: Name, Doppelpunkt, Tabulator, Wert',
    rechte: '0444, Eigentümer ist der Benutzer des Prozesses',
    gelesenVon: 'ps, top, htop und jedes Werkzeug zur Prozessanalyse',
    betrieb: 'cat /proc/<PID>/status; /proc/self/status für den eigenen Prozess',
    punkte: [
      'VmRSS ist der tatsächlich belegte Arbeitsspeicher, VmSize nur der reservierte Adressraum',
      'Uid nennt vier Werte: real, effektiv, gespeichert, Dateisystem',
      'State Z bedeutet Zombie — der Prozess wartet darauf, dass der Elternprozess ihn abholt',
      'Threads zählt die Fäden, die alle dieselbe PID-Gruppe teilen',
    ],
    beispiel: `Name:	nginx
State:	S (sleeping)
Tgid:	1284
Pid:	1284
PPid:	1
Uid:	33	33	33	33
VmSize:	  212048 kB
VmRSS:	   18432 kB
Threads:	1`,
    sprache: 'text',
  }),
  datei('prozess', {
    id: 'cmdline',
    titel: 'cmdline',
    pfad: '/proc/<PID>/cmdline',
    zweck: 'Die vollständige Aufrufzeile eines Prozesses, ungekürzt. Wo ps die Anzeige beschneidet oder der Prozess seinen eigenen Namen überschrieben hat, steht hier, womit er wirklich gestartet wurde.',
    format: 'Argumente hintereinander, jeweils durch ein Nullbyte getrennt, ohne abschließenden Zeilenumbruch',
    rechte: '0444, Eigentümer ist der Benutzer des Prozesses',
    gelesenVon: 'ps, pgrep, jede Suche nach einem laufenden Programm',
    betrieb: "tr '\\0' ' ' < /proc/<PID>/cmdline — sonst klebt alles aneinander",
    punkte: [
      'Bei Kernel-Fäden ist die Datei leer — das ist das Erkennungsmerkmal',
      'Passwörter in Aufrufzeilen sind hier für jeden Benutzer lesbar',
      'xargs -0 verarbeitet die Nullbytes direkt weiter',
    ],
    beispiel: `$ tr '\\0' ' ' < /proc/1284/cmdline; echo
nginx: master process /usr/sbin/nginx -g daemon on; master_process on;

$ cat /proc/2/cmdline
(leer — kthreadd ist ein Kernel-Faden)`,
    sprache: 'sh',
    warnung:
      'Ein Passwort als Befehlszeilenargument ist auf dem ganzen System sichtbar, auch nachdem das Programm gestartet ist. Geheimnisse gehören in eine Datei oder eine Umgebungsvariable, nie in die Aufrufzeile.',
  }),
  datei('prozess', {
    id: 'fd',
    titel: 'fd/',
    pfad: '/proc/<PID>/fd/',
    zweck: 'Je offener Datei ein Symlink, benannt nach der Dateinummer. Damit lässt sich sehen, welche Dateien, Netzverbindungen und Sockets ein Prozess gerade offen hält — und Platz zurückgewinnen, den eine gelöschte, aber noch offene Datei belegt.',
    format: 'Symlinks auf Pfade; bei Sockets und Pipes eine Ersatzangabe in eckigen Klammern',
    rechte: '0500, nur für den Eigentümer des Prozesses und für root',
    gelesenVon: 'lsof, fuser — beide sind Ansichten auf dieses Verzeichnis',
    betrieb: 'ls -l /proc/<PID>/fd/ zeigt alles Offene mit Ziel',
    punkte: [
      '0, 1 und 2 sind Eingabe, Ausgabe und Fehlerausgabe',
      '„(deleted)" heißt: gelöscht, aber noch offen — der Platz wird erst beim Schließen frei',
      'Über den Symlink lässt sich eine gelöschte Datei zurückholen',
      'Die Zahl der Einträge ist der aktuelle Stand gegen die Grenze aus limits',
    ],
    beispiel: `$ ls -l /proc/1284/fd/
lrwx------ 1 www-data www-data 64 Sep 10 09:14 0 -> /dev/null
l-wx------ 1 www-data www-data 64 Sep 10 09:14 2 -> /var/log/nginx/error.log.1 (deleted)
lrwx------ 1 www-data www-data 64 Sep 10 09:14 6 -> 'socket:[28914]'

# Platz belegt, Datei weg: Dienst neu laden statt neu starten
cp /proc/1284/fd/2 /var/log/nginx/gerettet.log`,
    sprache: 'sh',
  }),
  datei('prozess', {
    id: 'limits',
    titel: 'limits',
    pfad: '/proc/<PID>/limits',
    zweck: 'Die Ressourcengrenzen, die für diesen Prozess tatsächlich gelten. Sie beendet jede Diskussion darüber, ob ein Eintrag in limits.conf oder in der systemd-Unit angekommen ist: Hier steht der wirksame Wert.',
    format: 'Tabelle mit vier Spalten: Grenze, weiches Limit, hartes Limit, Einheit',
    rechte: '0444, Eigentümer ist der Benutzer des Prozesses',
    gelesenVon: 'Menschen bei der Fehlersuche; prlimit liest und setzt dieselben Werte',
    betrieb: 'cat /proc/<PID>/limits; prlimit --pid <PID> zeigt es kompakter',
    punkte: [
      '„Max open files" ist die Grenze hinter dem Fehler „Too many open files"',
      'Grenzen werden beim Start des Prozesses festgelegt und vererbt',
      'prlimit kann sie im laufenden Betrieb erhöhen, ohne Neustart des Dienstes',
      'Für systemd-Dienste stammt der Wert aus LimitNOFILE, nicht aus limits.conf',
    ],
    beispiel: `Limit                     Soft Limit  Hard Limit  Units
Max cpu time              unlimited   unlimited   seconds
Max processes             31678       31678       processes
Max open files            65535       65535       files
Max locked memory         8388608     8388608     bytes
Max core file size        0           unlimited   bytes`,
    sprache: 'text',
  }),
  datei('prozess', {
    id: 'io',
    titel: 'io',
    pfad: '/proc/<PID>/io',
    zweck: 'Zählt, wie viele Bytes ein Prozess seit seinem Start gelesen und geschrieben hat — getrennt nach dem, was durch die Systemaufrufe ging, und dem, was tatsächlich die Platte berührt hat.',
    format: 'Je Zeile ein Zähler: Name, Doppelpunkt, Wert in Bytes',
    rechte: '0400, nur für den Eigentümer des Prozesses und für root',
    gelesenVon: 'iotop, pidstat -d',
    betrieb: 'Zweimal lesen und die Differenz bilden — die Werte sind Summen seit dem Start',
    punkte: [
      'read_bytes und write_bytes zählen nur echte Plattenzugriffe',
      'rchar und wchar zählen alles, auch aus dem Zwischenspeicher bediente Zugriffe',
      'cancelled_write_bytes zählt Geschriebenes, das vor dem Ausschreiben gelöscht wurde',
      'Der große Abstand zwischen rchar und read_bytes ist der Beweis, dass der Cache wirkt',
    ],
    beispiel: `rchar: 8412398471
wchar: 1284736182
syscr: 2841923
syscw: 1284736
read_bytes: 412398848
write_bytes: 1284736512
cancelled_write_bytes: 4096`,
    sprache: 'text',
  }),
  datei('prozess', {
    id: 'environ',
    titel: 'environ',
    pfad: '/proc/<PID>/environ',
    zweck: 'Die Umgebungsvariablen, mit denen ein Prozess gestartet wurde. Sie zeigt, was ein Dienst tatsächlich sieht — und erklärt die häufigste Ursache dafür, dass ein Programm von Hand läuft, als Dienst aber nicht.',
    format: 'NAME=WERT hintereinander, jeweils durch ein Nullbyte getrennt',
    rechte: '0400, nur für den Eigentümer des Prozesses und für root',
    gelesenVon: 'Menschen bei der Fehlersuche',
    betrieb: "tr '\\0' '\\n' < /proc/<PID>/environ",
    punkte: [
      'Der Inhalt ist die Umgebung beim Start, spätere Änderungen im Prozess erscheinen nicht',
      'systemd startet Dienste mit einer sehr kleinen Umgebung — kein PATH aus der Anmeldung',
      'Zugangsdaten aus Environment= in einer Unit sind hier für root sichtbar',
    ],
    beispiel: `$ sudo tr '\\0' '\\n' < /proc/1284/environ
LANG=C.UTF-8
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
INVOCATION_ID=8f1a9c2b4d6e4f0a
JOURNAL_STREAM=8:28914`,
    sprache: 'sh',
    warnung:
      'Geheimnisse aus Environment= oder EnvironmentFile= stehen hier im Klartext. Für Zugangsdaten sind LoadCredential= oder eine Datei mit engen Rechten der bessere Weg.',
  }),
]

/* -------------------------------------------------- Ebene 4: /proc/sys */

const sysctl: Knoten[] = [
  datei('sysctl', {
    id: 'ip-forward',
    titel: 'net/ipv4/ip_forward',
    pfad: '/proc/sys/net/ipv4/ip_forward',
    zweck: 'Der Schalter, der aus einem Rechner einen Router macht. Ohne ihn verwirft der Kernel jedes Paket, das nicht an ihn selbst gerichtet ist — und jede Container- oder VPN-Weiterleitung schlägt stillschweigend fehl.',
    format: 'Eine Zahl: 0 aus, 1 an, mit abschließendem Zeilenumbruch',
    rechte: '0644 root:root — eine der wenigen beschreibbaren Dateien unter /proc',
    gelesenVon: 'Der Netzwerkteil des Kernels bei jedem weitergeleiteten Paket',
    betrieb: 'sysctl -w net.ipv4.ip_forward=1 wirkt sofort; dauerhaft über /etc/sysctl.d/',
    punkte: [
      'Der Pfad ist der Parametername: net/ipv4/ip_forward ist net.ipv4.ip_forward',
      'Für IPv6 gibt es einen eigenen Schalter unter net/ipv6/conf/all/forwarding',
      'Docker und libvirt setzen den Wert beim Start selbst und überschreiben die Einstellung',
      'Ohne Eintrag in /etc/sysctl.d ist der Wert nach dem Neustart wieder 0',
    ],
    beispiel: `$ cat /proc/sys/net/ipv4/ip_forward
0

$ sysctl -w net.ipv4.ip_forward=1
net.ipv4.ip_forward = 1

# Dauerhaft:
echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/99-router.conf
sysctl --system`,
    sprache: 'sh',
  }),
  datei('sysctl', {
    id: 'swappiness',
    titel: 'vm/swappiness',
    pfad: '/proc/sys/vm/swappiness',
    zweck: 'Die Neigung des Kernels zum Auslagern. Der Wert bestimmt, wie bereitwillig Speicherseiten ausgelagert werden, statt Zwischenspeicher zu verwerfen — er ist keine Schwelle in Prozent, deshalb bedeutet 0 nicht „niemals auslagern".',
    format: 'Eine Zahl zwischen 0 und 200',
    rechte: '0644 root:root',
    gelesenVon: 'Die Speicherverwaltung des Kernels bei Speicherdruck',
    betrieb: 'sysctl -w vm.swappiness=10; dauerhaft über /etc/sysctl.d/',
    punkte: [
      'Voreinstellung 60 ist auf Arbeitsplatzrechner zugeschnitten',
      'Datenbankserver fahren meist mit 1 bis 10 besser',
      '0 heißt „so spät wie möglich", nicht „gar nicht" — der OOM-Killer bleibt die Alternative',
      'Werte über 100 gewichten Auslagerung stärker als das Verwerfen von Zwischenspeicher',
    ],
    beispiel: `$ cat /proc/sys/vm/swappiness
60

$ sysctl -w vm.swappiness=10
vm.swappiness = 10

$ grep -E 'Swap(Total|Free)' /proc/meminfo
SwapTotal:       2097148 kB
SwapFree:        2097148 kB`,
    sprache: 'sh',
  }),
  datei('sysctl', {
    id: 'hostname',
    titel: 'kernel/hostname',
    pfad: '/proc/sys/kernel/hostname',
    zweck: 'Der Rechnername, wie ihn der Kernel führt. Er ist die Quelle für den Befehl hostname und unabhängig von /etc/hostname — die Datei wird nur beim Start einmal hier hineingeschrieben.',
    format: 'Eine Zeile mit dem Namen, ohne Domänenteil',
    rechte: '0644 root:root',
    gelesenVon: 'Die Bibliotheksfunktion gethostname(2) und damit praktisch jedes Programm',
    betrieb: 'hostnamectl set-hostname web01 ändert Kernel und /etc/hostname zugleich',
    punkte: [
      'Ein direktes echo hierher wirkt sofort, überlebt aber den Neustart nicht',
      'Der vollständige Name entsteht erst über /etc/hosts oder DNS',
      'Laufende Dienste merken den Wechsel nicht — sie kennen ihren Namen vom Start',
    ],
    beispiel: `$ cat /proc/sys/kernel/hostname
web01

$ hostnamectl set-hostname web02
$ cat /proc/sys/kernel/hostname
web02`,
    sprache: 'sh',
  }),
  datei('sysctl', {
    id: 'file-max',
    titel: 'fs/file-max',
    pfad: '/proc/sys/fs/file-max',
    zweck: 'Die Obergrenze offener Dateien für das gesamte System. Sie ist die zweite Grenze neben der je Prozess aus limits — beide müssen stimmen, sonst hilft die eine nicht.',
    format: 'Eine Zahl',
    rechte: '0644 root:root',
    gelesenVon: 'Der Dateisystemteil des Kernels bei jedem Öffnen',
    betrieb: 'sysctl -w fs.file-max=2097152; der aktuelle Stand steht in fs/file-nr',
    punkte: [
      'Auf aktuellen Kerneln ist der Vorgabewert bereits sehr hoch und selten das Problem',
      'fs/file-nr nennt drei Werte: belegt, frei belegt, Maximum',
      'Die Grenze je Prozess ist die häufigere Ursache — sie steht in /proc/<PID>/limits',
    ],
    beispiel: `$ cat /proc/sys/fs/file-max
9223372036854775807

$ cat /proc/sys/fs/file-nr
4832	0	9223372036854775807
# belegt, frei belegt, Maximum`,
    sprache: 'sh',
  }),
  datei('sysctl', {
    id: 'syncookies',
    titel: 'net/ipv4/tcp_syncookies',
    pfad: '/proc/sys/net/ipv4/tcp_syncookies',
    zweck: 'Schützt gegen SYN-Fluten: Läuft die Warteschlange halboffener Verbindungen über, antwortet der Kernel mit einem kryptografisch erzeugten Cookie statt Zustand zu speichern. Verbindungen kommen weiter zustande, ohne dass Speicher belegt wird.',
    format: 'Eine Zahl: 0 aus, 1 bei Überlauf, 2 immer',
    rechte: '0644 root:root',
    gelesenVon: 'Der TCP-Teil des Kernels beim Verbindungsaufbau',
    betrieb: 'sysctl -w net.ipv4.tcp_syncookies=1; Meldungen erscheinen im Syslog',
    punkte: [
      'Auf allen gängigen Distributionen bereits auf 1 voreingestellt',
      'Bei aktiven Cookies gehen einige TCP-Erweiterungen der Verbindung verloren',
      'Die Meldung „Possible SYN flooding" im Protokoll heißt: Der Schutz hat gegriffen',
      'Die Warteschlangenlänge selbst steht in net/ipv4/tcp_max_syn_backlog',
    ],
    beispiel: `$ cat /proc/sys/net/ipv4/tcp_syncookies
1

$ grep -i 'syn flooding' /var/log/syslog
Sep 10 04:31:44 web01 kernel: TCP: request_sock_TCP: Possible SYN flooding on port 443. Sending cookies.`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------- Ebene 4: /sys/class */

const sysclass: Knoten[] = [
  datei('sysclass', {
    id: 'mac',
    titel: 'net/eth0/address',
    pfad: '/sys/class/net/eth0/address',
    zweck: 'Die MAC-Adresse einer Netzschnittstelle. Sie ist die verlässlichste Kennung einer Schnittstelle über Neustarts hinweg und die Grundlage der vorhersagbaren Gerätenamen wie enp3s0.',
    format: 'Eine Zeile: sechs Byte hexadezimal, mit Doppelpunkten getrennt',
    rechte: '0444 root:root',
    gelesenVon: 'ip link, systemd-networkd bei der Zuordnung von Netzkonfiguration',
    betrieb: 'cat /sys/class/net/eth0/address; ip -br link zeigt alle auf einmal',
    punkte: [
      'Das Verzeichnis /sys/class/net ist die vollständige Liste aller Schnittstellen',
      'Auch lo, Brücken und Container-Schnittstellen erscheinen dort',
      'Eine per MAC gebundene Lizenz oder DHCP-Reservierung liest genau diesen Wert',
    ],
    beispiel: `$ cat /sys/class/net/eth0/address
52:54:00:8f:1a:9c

$ ls /sys/class/net/
docker0  eth0  lo  veth8f1a9c`,
    sprache: 'sh',
  }),
  datei('sysclass', {
    id: 'operstate',
    titel: 'net/eth0/operstate',
    pfad: '/sys/class/net/eth0/operstate',
    zweck: 'Der Betriebszustand einer Schnittstelle in einem Wort. Zusammen mit der Nachbardatei carrier trennt sie die beiden Fälle, die gern verwechselt werden: administrativ abgeschaltet oder kein Kabel.',
    format: 'Eine Zeile mit einem Wort: up, down, dormant oder unknown',
    rechte: '0444 root:root',
    gelesenVon: 'ip link, Überwachungsskripte, systemd-networkd-wait-online',
    betrieb: 'cat /sys/class/net/eth0/operstate; ip -br link fasst zusammen',
    punkte: [
      'carrier ist 1, solange ein Signal anliegt — unabhängig vom Zustand hier',
      'unknown ist bei virtuellen Schnittstellen normal und kein Fehler',
      'Eine Schnittstelle kann up sein und trotzdem keine Adresse haben',
    ],
    beispiel: `$ cat /sys/class/net/eth0/operstate
up

$ cat /sys/class/net/eth0/carrier
1

$ ip -br link
lo     UNKNOWN  00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>
eth0   UP       52:54:00:8f:1a:9c <BROADCAST,MULTICAST,UP,LOWER_UP>`,
    sprache: 'sh',
  }),
  datei('sysclass', {
    id: 'rx-bytes',
    titel: 'net/eth0/statistics/rx_bytes',
    pfad: '/sys/class/net/eth0/statistics/rx_bytes',
    zweck: 'Der Zähler empfangener Bytes seit dem Start der Schnittstelle. Die Dateien in diesem Verzeichnis sind die Quelle jeder Durchsatzmessung — der Durchsatz selbst wird immer als Differenz zweier Messungen berechnet.',
    format: 'Eine Zahl ohne Einheit: Bytes, als vorzeichenlose 64-Bit-Zahl',
    rechte: '0444 root:root',
    gelesenVon: 'ip -s link, node_exporter, jedes Werkzeug zur Netzüberwachung',
    betrieb: 'Zweimal im Abstand einer Sekunde lesen und die Differenz bilden',
    punkte: [
      'Daneben liegen tx_bytes, rx_packets, rx_errors, rx_dropped',
      'rx_dropped in Bewegung heißt: Der Rechner nimmt Pakete nicht schnell genug an',
      'Der Zähler beginnt bei 0, wenn die Schnittstelle neu aufgesetzt wird',
    ],
    beispiel: `$ cat /sys/class/net/eth0/statistics/rx_bytes
84123984712

$ ls /sys/class/net/eth0/statistics/
rx_bytes  rx_dropped  rx_errors  rx_packets  tx_bytes  tx_dropped  tx_errors  tx_packets`,
    sprache: 'sh',
  }),
  datei('sysclass', {
    id: 'scheduler',
    titel: 'block/sda/queue/scheduler',
    pfad: '/sys/class/block/sda/queue/scheduler',
    zweck: 'Der Ein-/Ausgabeplaner eines Blockgeräts. Die Datei zeigt alle verfügbaren Verfahren und markiert das aktive in eckigen Klammern — und sie lässt sich beschreiben, um im laufenden Betrieb umzuschalten.',
    format: 'Eine Zeile mit allen Verfahren, das aktive in eckigen Klammern',
    rechte: '0644 root:root',
    gelesenVon: 'Der Blockgeräteteil des Kernels',
    betrieb: 'echo mq-deadline > …/scheduler wirkt sofort; dauerhaft über eine udev-Regel',
    punkte: [
      'none ist bei NVMe-Geräten richtig — die Hardware ordnet selbst',
      'mq-deadline eignet sich für klassische Platten und virtuelle Datenträger',
      'Daneben stehen weitere Stellschrauben wie nr_requests und read_ahead_kb',
      'In virtuellen Maschinen bringt Umschalten meist wenig — der Wirt entscheidet',
    ],
    beispiel: `$ cat /sys/class/block/sda/queue/scheduler
[none] mq-deadline kyber bfq

$ echo mq-deadline > /sys/class/block/sda/queue/scheduler
$ cat /sys/class/block/sda/queue/scheduler
none [mq-deadline] kyber bfq`,
    sprache: 'sh',
  }),
  datei('sysclass', {
    id: 'temp',
    titel: 'thermal/thermal_zone0/temp',
    pfad: '/sys/class/thermal/thermal_zone0/temp',
    zweck: 'Die Temperatur eines Fühlers. Auf Blech ist sie das Frühwarnzeichen für eine Drosselung des Prozessors, die sich sonst nur als unerklärlicher Leistungseinbruch zeigt.',
    format: 'Eine Zahl in Tausendstel Grad Celsius',
    rechte: '0444 root:root',
    gelesenVon: 'sensors, Überwachungsdienste',
    betrieb: 'cat …/temp und durch 1000 teilen; sensors rechnet selbst um',
    punkte: [
      'Die Nachbardatei type nennt, welcher Fühler das ist',
      'In virtuellen Maschinen fehlt das Verzeichnis meist ganz',
      'Die Schwellen, ab denen gedrosselt wird, stehen in den trip_point-Dateien',
    ],
    beispiel: `$ cat /sys/class/thermal/thermal_zone0/temp
47000

$ cat /sys/class/thermal/thermal_zone0/type
x86_pkg_temp

# 47000 = 47,0 Grad Celsius`,
    sprache: 'sh',
  }),
]

/* ---------------------------------------------- Ebene 4: /sys/fs/cgroup */

const cgroup: Knoten[] = [
  datei('cgroup', {
    id: 'controllers',
    titel: 'cgroup.controllers',
    pfad: '/sys/fs/cgroup/cgroup.controllers',
    zweck: 'Nennt, welche Ressourcenarten in dieser Ebene des Baums überhaupt gesteuert werden können. Fehlt ein Controller hier, sind alle zugehörigen Dateien in den Untergruppen wirkungslos — das ist die erste Prüfung, wenn eine Grenze nicht greift.',
    format: 'Eine Zeile mit durch Leerzeichen getrennten Namen',
    rechte: '0444 root:root',
    gelesenVon: 'systemd beim Anlegen von Slices und Units',
    betrieb: 'cat /sys/fs/cgroup/cgroup.controllers; freigegeben wird über cgroup.subtree_control',
    punkte: [
      'Ein Controller muss in der Elterngruppe freigegeben sein, damit das Kind ihn hat',
      'systemd gibt cpu, memory, pids und io von sich aus weiter',
      'Version 1 und 2 nebeneinander erkennt man an /sys/fs/cgroup/unified',
    ],
    beispiel: `$ cat /sys/fs/cgroup/cgroup.controllers
cpuset cpu io memory hugetlb pids rdma misc

$ cat /sys/fs/cgroup/system.slice/cgroup.subtree_control
cpu io memory pids`,
    sprache: 'sh',
  }),
  datei('cgroup', {
    id: 'memory-current',
    titel: 'memory.current',
    pfad: '/sys/fs/cgroup/system.slice/app.service/memory.current',
    zweck: 'Der Speicherverbrauch eines Dienstes in genau dem Maß, in dem auch seine Grenze gilt. Er zählt anders als der Wert in ps: Zwischenspeicher für Dateien, die dieser Dienst geöffnet hat, gehört dazu.',
    format: 'Eine Zahl in Bytes',
    rechte: '0444 root:root',
    gelesenVon: 'systemctl status, systemd-cgtop, Überwachungsdienste',
    betrieb: 'systemctl status app.service zeigt denselben Wert unter „Memory"',
    punkte: [
      'Der Wert liegt regelmäßig über dem RSS aus ps — der Seitenzwischenspeicher zählt mit',
      'memory.stat daneben schlüsselt auf, woraus die Summe besteht',
      'Nähert er sich memory.max, beginnt der Kernel zurückzufordern',
    ],
    beispiel: `$ cat /sys/fs/cgroup/system.slice/app.service/memory.current
1284736512

$ systemctl status app.service | grep Memory
     Memory: 1.2G (max: 2.0G available: 800.0M)`,
    sprache: 'sh',
  }),
  datei('cgroup', {
    id: 'memory-max',
    titel: 'memory.max',
    pfad: '/sys/fs/cgroup/system.slice/app.service/memory.max',
    zweck: 'Die harte Speichergrenze einer Gruppe. Wird sie erreicht und lässt sich nichts mehr zurückfordern, beendet der Kernel einen Prozess in dieser Gruppe — nicht irgendeinen auf dem System.',
    format: 'Eine Zahl in Bytes oder das Wort max für „keine Grenze"',
    rechte: '0644 root:root',
    gelesenVon: 'Die Speicherverwaltung des Kernels bei jedem Zuteilen',
    betrieb: 'In der Unit als MemoryMax= setzen, dann daemon-reload und Neustart des Dienstes',
    punkte: [
      'memory.high daneben drosselt, statt zu beenden — der sanftere Weg',
      'Ein Treffer erscheint im Journal als „Killed process … in cgroup"',
      'Direktes Schreiben wirkt sofort, wird aber vom nächsten daemon-reload überschrieben',
      'Die Begrenzung schützt das übrige System vor einem einzelnen Dienst',
    ],
    beispiel: `$ cat /sys/fs/cgroup/system.slice/app.service/memory.max
2147483648

# In der Unit statt direkt in der Datei:
[Service]
MemoryHigh=1500M
MemoryMax=2G`,
    sprache: 'sh',
  }),
  datei('cgroup', {
    id: 'cpu-max',
    titel: 'cpu.max',
    pfad: '/sys/fs/cgroup/system.slice/app.service/cpu.max',
    zweck: 'Die Rechenzeitgrenze einer Gruppe als Bruchteil: so viele Mikrosekunden Rechenzeit je Zeitfenster. Damit lässt sich ein Dienst auf einen halben Kern begrenzen, ohne ihn an bestimmte Kerne zu binden.',
    format: 'Zwei durch Leerzeichen getrennte Werte: Kontingent und Fenster in Mikrosekunden; max heißt unbegrenzt',
    rechte: '0644 root:root',
    gelesenVon: 'Der Prozessplaner des Kernels',
    betrieb: 'In der Unit als CPUQuota=50% setzen — systemd rechnet es in diese Werte um',
    punkte: [
      '50000 100000 bedeutet 50 Prozent eines Kerns',
      '200000 100000 bedeutet zwei volle Kerne',
      'cpu.stat zählt mit, wie oft die Gruppe deshalb gebremst wurde',
      'Drosselung sieht in der Anwendung aus wie ein langsamer Server, nicht wie ein Fehler',
    ],
    beispiel: `$ cat /sys/fs/cgroup/system.slice/app.service/cpu.max
50000 100000

$ cat /sys/fs/cgroup/system.slice/app.service/cpu.stat
usage_usec 84123984
nr_throttled 1284
throttled_usec 41239884`,
    sprache: 'sh',
  }),
  datei('cgroup', {
    id: 'pids-max',
    titel: 'pids.max',
    pfad: '/sys/fs/cgroup/system.slice/app.service/pids.max',
    zweck: 'Die Obergrenze an Prozessen und Fäden in einer Gruppe. Sie ist die wirksamste Bremse gegen eine Anwendung, die sich unbegrenzt vervielfältigt und sonst das ganze System lahmlegt.',
    format: 'Eine Zahl oder das Wort max',
    rechte: '0644 root:root',
    gelesenVon: 'Der Kernel bei jedem fork und jedem neuen Faden',
    betrieb: 'In der Unit als TasksMax= setzen; der aktuelle Stand steht in pids.current',
    punkte: [
      'systemd setzt eine Voreinstellung, sichtbar in systemctl show -p TasksMax <unit>',
      'Beim Erreichen der Grenze scheitert fork mit EAGAIN — die Anwendung meldet oft nur „Resource temporarily unavailable"',
      'pids.events zählt, wie oft die Grenze schon gegriffen hat',
    ],
    beispiel: `$ cat /sys/fs/cgroup/system.slice/app.service/pids.max
512

$ cat /sys/fs/cgroup/system.slice/app.service/pids.current
34

$ systemctl show -p TasksMax app.service
TasksMax=512`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------------------- Bündelung */

export const kernelsichtKnoten: Knoten[] = [
  ...verzeichnisse,
  ...proc,
  ...prozess,
  ...sysctl,
  ...sysclass,
  ...cgroup,
]
