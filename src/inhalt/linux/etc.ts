import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const { verzeichnis, datei } = baukasten('konfiguration')

/* ------------------------------------------------- Ebene 3: Verzeichnisse */

/**
 * Sechs Verzeichnisse. Das erste ist die Wurzelebene von /etc selbst — die
 * Dateien, die dort ohne Unterverzeichnis liegen. Sie brauchen einen Ort,
 * und ein eigener Cluster wäre für sie zu hoch gegriffen.
 */
const verzeichnisse: Knoten[] = [
  verzeichnis('stamm', '/etc', 'Die Dateien ohne Unterverzeichnis', {
    text: 'Was direkt in /etc liegt, betrifft das System als Ganzes: wer sich anmelden darf, was beim Start eingehängt wird, wie Namen aufgelöst werden. Es sind die ältesten Dateien des Systems und die einzigen, deren Format man auf jeder Unix-Variante wiederfindet.',
    punkte: [
      'Fast alle sind zeilenorientiert und mit Doppelpunkt getrennt',
      'Keine davon braucht einen Neustart, um zu wirken',
      'Die Reihenfolge der Zeilen ist bei mehreren fast immer bedeutsam',
    ],
  }),
  verzeichnis('ssh', '/etc/ssh', 'Der einzige Weg auf den Server', {
    text: 'Auf einem Server ohne Bildschirm ist SSH nicht ein Dienst unter vielen, sondern der Zugang. Eine falsche Zeile hier schließt einen aus dem eigenen Rechner aus — deshalb wird hier grundsätzlich geprüft, bevor neu geladen wird, und die bestehende Sitzung bleibt offen.',
    punkte: [
      'Serverkonfiguration und Clientkonfiguration liegen nebeneinander',
      'Die Hostschlüssel sind die Identität des Servers, nicht ein Detail',
      'sshd -t prüft, sshd -T zeigt die tatsächlich wirksamen Werte',
    ],
  }),
  verzeichnis('systemd', '/etc/systemd', 'Dienste, Zeitpläne, Systemdienste', {
    text: 'systemd ist auf einem aktuellen Server der Init-Prozess, der Dienstverwalter, der Zeitplaner, der Protokollsammler und der Resolver. /etc/systemd ist die lokale Ebene dieser Konfiguration: Was hier steht, schlägt die Vorgaben der Pakete unter /usr/lib/systemd.',
    punkte: [
      'Drei Ebenen: /usr/lib (Paket), /run (flüchtig), /etc (lokal, gewinnt)',
      'Unit-Dateien sind INI mit festen Abschnittsnamen',
      'Nach jeder Änderung: systemctl daemon-reload',
    ],
  }),
  verzeichnis('apt', '/etc/apt', 'Woher Software kommt und wem vertraut wird', {
    text: 'Die Paketquellen entscheiden, welchem Schlüssel das System beim Installieren vertraut. Das macht /etc/apt zu einem sicherheitsrelevanten Verzeichnis: Wer hier eine Quelle einträgt, gibt deren Betreiber Schreibzugriff auf das gesamte System.',
    punkte: [
      'Neues Format .sources (deb822) statt der alten einzeiligen .list',
      'Signaturschlüssel gehören nach /etc/apt/keyrings, nicht in den globalen Bund',
      'Optionen aus apt.conf.d werden in lexikografischer Reihenfolge gelesen',
    ],
  }),
  verzeichnis('pam', '/etc/pam.d', 'Was bei jeder Anmeldung passiert', {
    text: 'PAM ist die Stelle, an der ein Dienst fragt „darf dieser Benutzer herein" — und die Antwort ist eine Kette von Modulen, keine einzelne Prüfung. Jede Datei hier gehört zu einem Dienst; die gemeinsamen Bausteine liegen in den common-Dateien und werden eingebunden.',
    punkte: [
      'Vier Typen: auth, account, password, session',
      'Die Kontrollflagge entscheidet, ob ein Fehlschlag die Kette beendet',
      'Reihenfolge ist Programm — die Kette wird von oben nach unten abgearbeitet',
    ],
  }),
  verzeichnis('security', '/etc/security', 'Grenzen für Konten und Sitzungen', {
    text: 'Die Gegenstücke zu /etc/pam.d: Hier stehen die Werte, mit denen die PAM-Module arbeiten. Ressourcengrenzen, Passwortregeln, Sperren nach Fehlversuchen. Ohne den passenden Eintrag in /etc/pam.d bleibt eine Datei hier wirkungslos — das ist die häufigste Fehlerquelle.',
    punkte: [
      'Jede Datei gehört zu genau einem PAM-Modul',
      'Grenzen wirken erst bei der nächsten Anmeldung, nicht sofort',
      'Für Dienste unter systemd gelten stattdessen die Unit-Direktiven',
    ],
  }),
]

/* --------------------------------------------- Ebene 4: /etc (Wurzelebene) */

const stamm: Knoten[] = [
  datei('stamm', {
    id: 'passwd',
    titel: 'passwd',
    pfad: '/etc/passwd',
    zweck: 'Führt jedes Konto des Systems mit Nummer, Heimatverzeichnis und Anmelde-Shell. Trotz des Namens steht hier kein Passwort — das liegt seit Jahrzehnten in /etc/shadow.',
    format: 'Eine Zeile je Konto, sieben Felder, getrennt durch Doppelpunkte',
    rechte: '0644 root:root — für alle lesbar, und das ist Absicht',
    gelesenVon: 'Der Namensdienst (NSS) für jedes Programm, das aus einer Nummer einen Namen macht — ls, ps, sshd',
    betrieb: 'Wirkt sofort. Anlegen mit useradd, ändern mit usermod, im Notfall mit vipw',
    punkte: [
      'Felder: Name : x : UID : GID : Klartextname : Heimat : Shell',
      'Das x im zweiten Feld verweist auf den Hash in /etc/shadow',
      'UID 0 ist root, alles unter 1000 sind Systemkonten',
      '/usr/sbin/nologin als Shell verhindert die interaktive Anmeldung',
    ],
    beispiel: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
deploy:x:1001:1001:Deploy-Konto,,,:/home/deploy:/bin/bash`,
    warnung:
      'Ein zweites Konto mit UID 0 ist ein vollwertiger root-Zugang und fällt beim Überfliegen nicht auf. Prüfen mit: awk -F: \'$3 == 0\' /etc/passwd',
  }),
  datei('stamm', {
    id: 'shadow',
    titel: 'shadow',
    pfad: '/etc/shadow',
    zweck: 'Enthält die Passwort-Hashes und die Alterungsregeln je Konto. Die Trennung von /etc/passwd existiert genau deshalb: Die Kontoliste muss für alle lesbar sein, die Hashes dürfen es nicht.',
    format: 'Eine Zeile je Konto, neun Felder, getrennt durch Doppelpunkte',
    rechte: '0640 root:shadow — für normale Benutzer nicht lesbar',
    gelesenVon: 'pam_unix bei jeder Anmeldung; chage liest und schreibt die Alterungsfelder',
    betrieb: 'Wirkt sofort. Bearbeiten mit passwd, chage oder vipw -s, nie mit einem Editor',
    punkte: [
      'Felder: Name : Hash : letzte Änderung : min : max : Warnfrist : inaktiv : Ablauf : reserviert',
      'Alle Datumsangaben sind Tage seit dem 1. Januar 1970',
      'Hash-Präfix $y$ ist yescrypt, $6$ ist SHA-512',
      'Ausrufezeichen oder Stern statt Hash bedeutet: keine Anmeldung per Passwort',
    ],
    beispiel: `root:!:19875:0:99999:7:::
deploy:$y$j9T$Xk2vQ4…$8Rn1…:20134:0:90:14:::
backup:*:19875:0:99999:7:::`,
    warnung:
      'Ein leeres zweites Feld bedeutet Anmeldung ohne Passwort — nicht „gesperrt". Der Unterschied zwischen Ausrufezeichen und Leerstring entscheidet hier über den Zugang.',
  }),
  datei('stamm', {
    id: 'fstab',
    titel: 'fstab',
    pfad: '/etc/fstab',
    zweck: 'Die Liste der Dateisysteme, die beim Start eingehängt werden. systemd erzeugt daraus zur Laufzeit .mount-Units — die Datei ist also keine Skriptvorlage, sondern eine Deklaration.',
    format: 'Eine Zeile je Einhängepunkt, sechs Felder, durch Leerraum getrennt',
    rechte: '0644 root:root',
    gelesenVon: 'systemd-fstab-generator beim Start, mount und findmnt im Betrieb',
    betrieb: 'systemctl daemon-reload, danach mount -a — beides vor dem nächsten Neustart',
    punkte: [
      'Felder: Quelle, Ziel, Typ, Optionen, Dump, Prüfreihenfolge',
      'UUID= statt /dev/sda1 — Gerätenamen können sich beim Start verschieben',
      'Prüfreihenfolge: 1 für die Wurzel, 2 für alle anderen, 0 für keine Prüfung',
      'nofail verhindert, dass ein fehlendes Gerät den Start blockiert',
    ],
    beispiel: `# <Quelle>                  <Ziel>      <Typ>  <Optionen>                     <D> <P>
UUID=1e3a9c74-…            /           ext4   errors=remount-ro               0   1
UUID=A1B2-C3D4             /boot/efi   vfat   umask=0077                      0   1
/dev/mapper/vg0-var        /var        ext4   defaults,noatime                0   2
tmpfs                      /tmp        tmpfs  defaults,nosuid,nodev,size=2G   0   0`,
    warnung:
      'Ein Tippfehler hier endet in der Notfall-Shell, ohne Netz und ohne SSH. Bei entferntem Zugriff gilt: erst mount -a, dann neu starten — nie umgekehrt.',
  }),
  datei('stamm', {
    id: 'hosts',
    titel: 'hosts',
    pfad: '/etc/hosts',
    zweck: 'Die statische Namenszuordnung des Rechners. Sie wird vor jeder DNS-Anfrage ausgewertet und ist damit die schnellste und die letzte verlässliche Auflösung, wenn das Netz nicht mehr funktioniert.',
    format: 'Eine Zeile je Adresse: IP-Adresse, dann ein oder mehrere Namen, durch Leerraum getrennt',
    rechte: '0644 root:root',
    gelesenVon: 'Die Resolver-Bibliothek über /etc/nsswitch.conf — dort steht, dass files vor dns kommt',
    betrieb: 'Wirkt sofort, ohne Neuladen. Prüfen mit getent hosts <name>',
    punkte: [
      'Der erste Name nach der Adresse ist der kanonische, die weiteren sind Aliase',
      'Der eigene Rechnername gehört hierher, sonst hängen Programme beim Auflösen',
      '127.0.1.1 statt 127.0.0.1 für den eigenen Namen ist eine Debian-Eigenheit',
    ],
    beispiel: `127.0.0.1       localhost
127.0.1.1       web01.example.net web01
::1             localhost ip6-localhost ip6-loopback

10.0.3.14       db01.internal db01
10.0.3.15       cache01.internal`,
    warnung:
      'dig und nslookup fragen den DNS-Server direkt und sehen /etc/hosts nicht. Wer einen Eintrag hier testen will, nimmt getent hosts — sonst prüft man am Programm vorbei.',
  }),
  datei('stamm', {
    id: 'resolv-conf',
    titel: 'resolv.conf',
    pfad: '/etc/resolv.conf',
    zweck: 'Sagt der Resolver-Bibliothek, welchen DNS-Server sie fragen soll. Auf modernen Systemen ist die Datei nur noch ein Zeiger auf den lokalen Stub-Resolver und wird nicht mehr von Hand gepflegt.',
    format: 'Schlüsselwort und Wert je Zeile: nameserver, search, options',
    rechte: '0644 root:root — meist ein Symlink nach ../run/systemd/resolve/stub-resolv.conf',
    gelesenVon: 'Jedes Programm, das über die C-Bibliothek auflöst',
    betrieb: 'Wirkt sofort. Die tatsächlich benutzten Server zeigt resolvectl status',
    punkte: [
      'Höchstens drei nameserver-Zeilen werden ausgewertet, der Rest wird ignoriert',
      '127.0.0.53 ist der Stub von systemd-resolved, kein echter Server',
      'search hängt die Domäne an unvollständige Namen an',
    ],
    beispiel: `# Diese Datei wird verwaltet — Änderungen gehen verloren.
nameserver 127.0.0.53
options edns0 trust-ad
search internal.example.net`,
    warnung:
      'Wo systemd-resolved, cloud-init oder NetworkManager laufen, wird eine Änderung hier beim nächsten Start überschrieben. Der richtige Ort ist /etc/systemd/resolved.conf oder die Netzkonfiguration.',
  }),
  datei('stamm', {
    id: 'os-release',
    titel: 'os-release',
    pfad: '/etc/os-release',
    zweck: 'Die maschinenlesbare Antwort auf die Frage, welches System hier läuft. Sie ist der einzige distributionsübergreifend verlässliche Ort dafür — lsb_release ist ein Zusatzpaket und oft nicht installiert.',
    format: 'Shell-kompatible Zuweisungen KEY=WERT, eine je Zeile, Werte bei Bedarf in Anführungszeichen',
    rechte: '0644 root:root — Symlink nach ../usr/lib/os-release',
    gelesenVon: 'Skripte per Punkt-Einbindung, Konfigurationsverwaltung, Paketwerkzeuge',
    betrieb: 'Wird von der Distribution gepflegt und bei einem Versionswechsel ersetzt',
    punkte: [
      'ID und VERSION_ID sind die Felder für Vergleiche, PRETTY_NAME ist für Menschen',
      'ID_LIKE nennt die Elterndistribution — ubuntu ist debian-artig',
      'Das Format ist absichtlich per . /etc/os-release direkt einlesbar',
    ],
    beispiel: `PRETTY_NAME="Ubuntu 24.04.1 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.1 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian`,
    sprache: 'sh',
  }),
  datei('stamm', {
    id: 'sudoers',
    titel: 'sudoers',
    pfad: '/etc/sudoers',
    zweck: 'Legt fest, wer welche Befehle als welcher Benutzer ausführen darf. Damit ist es die Datei, die aus einem normalen Konto einen Administrator macht — und die einzige, deren Syntaxfehler jeden Weg zu root versperrt.',
    format: 'Regelzeilen „wer wo = (als wem) welche Befehle", dazu Defaults-Zeilen und Einbindungen',
    rechte: '0440 root:root — sudo verweigert den Dienst bei anderen Rechten',
    gelesenVon: 'sudo bei jedem Aufruf, vor der Passwortabfrage',
    betrieb: 'Ausschließlich mit visudo bearbeiten; visudo -c prüft eine bestehende Datei',
    punkte: [
      'Eigene Regeln gehören nach /etc/sudoers.d, nicht in diese Datei',
      'NOPASSWD gilt genau für die Befehle, die in derselben Zeile stehen',
      '%gruppe adressiert eine Gruppe, ein einfacher Name ein Konto',
      'Bei mehreren passenden Regeln gewinnt die letzte, nicht die erste',
    ],
    beispiel: `Defaults        env_reset
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

root    ALL=(ALL:ALL) ALL
%sudo   ALL=(ALL:ALL) ALL
deploy  ALL=(root) NOPASSWD: /usr/bin/systemctl restart app.service

@includedir /etc/sudoers.d`,
    warnung:
      'Ein Befehlspfad mit Platzhalter oder ein Editoraufruf in einer NOPASSWD-Regel ist ein Weg zu einer root-Shell. Nur vollständige Pfade auf Programme freigeben, die nichts anderes starten können.',
  }),
]

/* --------------------------------------------------- Ebene 4: /etc/ssh */

const ssh: Knoten[] = [
  datei('ssh', {
    id: 'sshd-config',
    titel: 'sshd_config',
    pfad: '/etc/ssh/sshd_config',
    zweck: 'Die Konfiguration des SSH-Servers: welche Anmeldeverfahren gelten, wer sich verbinden darf, was weitergeleitet werden darf. Auf einem Server ohne Konsole entscheidet diese Datei über die Erreichbarkeit des Rechners.',
    format: 'Schlüsselwort und Wert je Zeile; für den Server gilt der ZUERST gefundene Wert',
    rechte: '0644 root:root',
    gelesenVon: 'sshd beim Start und beim Neuladen — bestehende Verbindungen behalten ihre alte Konfiguration',
    betrieb: 'sshd -t prüft die Syntax, systemctl reload ssh übernimmt sie',
    punkte: [
      'Die Include-Zeile steht ganz oben, weil der erste Wert gewinnt',
      'Ein Match-Block gilt bis zum nächsten Match oder bis zum Dateiende',
      'sshd -T zeigt die tatsächlich wirksame Konfiguration, aufgelöst und vollständig',
      'AllowGroups ist die wirksamste Einschränkung: alles andere wird abgewiesen',
    ],
    beispiel: `Include /etc/ssh/sshd_config.d/*.conf

Port 22
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
X11Forwarding no
AllowGroups ssh-nutzer

Match Group backup
    ForceCommand /usr/local/bin/nur-rsync
    PermitTTY no`,
    warnung:
      'Die Einstellung wirkt nicht, wenn in /etc/ssh/sshd_config.d bereits etwas anderes steht — der erste Wert gewinnt, und das Include steht oben. Vor dem Neuladen immer sshd -T | grep -i passwordauthentication gegenprüfen und die bestehende Sitzung offen lassen.',
  }),
  datei('ssh', {
    id: 'sshd-config-d',
    titel: 'sshd_config.d/60-haertung.conf',
    pfad: '/etc/ssh/sshd_config.d/60-haertung.conf',
    zweck: 'Eine Ergänzungsdatei für den SSH-Server. Sie hält eigene Entscheidungen von der Paketdatei getrennt, sodass ein Update sshd_config ersetzen kann, ohne die Härtung mitzunehmen.',
    format: 'Dasselbe Format wie sshd_config; die Dateien werden in lexikografischer Reihenfolge eingebunden',
    rechte: '0644 root:root',
    gelesenVon: 'sshd über die Include-Zeile am Anfang von sshd_config',
    betrieb: 'sshd -t, danach systemctl reload ssh',
    punkte: [
      'Die Nummer im Namen bestimmt die Reihenfolge — kleiner wird früher gelesen',
      'Weil der erste Wert gewinnt, schlägt eine kleine Nummer alles Spätere',
      'Cloud-Anbieter legen hier eigene Dateien ab, oft mit 50- oder 60-Präfix',
    ],
    beispiel: `# Eigene Härtung, überlebt Paketupdates von sshd_config
PasswordAuthentication no
PermitRootLogin no
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 2`,
  }),
  datei('ssh', {
    id: 'hostkey',
    titel: 'ssh_host_ed25519_key',
    pfad: '/etc/ssh/ssh_host_ed25519_key',
    zweck: 'Der private Hostschlüssel — die Identität des Servers. Mit ihm beweist der Server bei jedem Verbindungsaufbau, dass er derselbe ist wie beim letzten Mal. Er ist kein Benutzerschlüssel und gehört niemandem außer diesem Rechner.',
    format: 'OpenSSH-eigenes Schlüsselformat, Base64 zwischen BEGIN- und END-Zeile',
    rechte: '0600 root:root — sshd startet nicht, wenn die Datei weiter lesbar ist',
    gelesenVon: 'sshd beim Start',
    betrieb: 'Wird beim Installieren des Pakets einmalig erzeugt und danach nie wieder angefasst',
    punkte: [
      'Ed25519 ist das Verfahren der Wahl; RSA nur noch für alte Gegenstellen',
      'Der Fingerabdruck kommt aus ssh-keygen -lf auf die zugehörige .pub-Datei',
      'Aus einem Abbild geklonte Server teilen sich denselben Schlüssel — neu erzeugen',
    ],
    beispiel: `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
c2gtZWQyNTUxOQAAACD8jK1qU3v2mQ1nJhX0aB7cRk9pLzE4vYw2sN6tQeH0fA
…
-----END OPENSSH PRIVATE KEY-----`,
    sprache: 'text',
    warnung:
      'Wird der Schlüssel neu erzeugt, meldet jeder Client beim nächsten Verbindungsversuch einen möglichen Angriff und verweigert die Verbindung. Bei einem geplanten Wechsel gehört der neue Fingerabdruck vorher an alle Nutzer verteilt.',
  }),
  datei('ssh', {
    id: 'hostkey-pub',
    titel: 'ssh_host_ed25519_key.pub',
    pfad: '/etc/ssh/ssh_host_ed25519_key.pub',
    zweck: 'Der öffentliche Teil des Hostschlüssels. Er ist das, was ein Client beim ersten Verbindungsaufbau zu sehen bekommt und in seiner known_hosts speichert.',
    format: 'Eine einzige Zeile: Verfahren, Base64-Schlüssel, Kommentar',
    rechte: '0644 root:root — öffentlich, wie der Name sagt',
    gelesenVon: 'sshd; und von Menschen, die einen Fingerabdruck abgleichen',
    betrieb: 'ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub zeigt den Fingerabdruck',
    punkte: [
      'Der Kommentar am Ende ist üblicherweise der Rechnername beim Erzeugen',
      'Derselbe Fingerabdruck steht auf der Clientseite in ~/.ssh/known_hosts',
      'Für automatische Verteilung eignet sich ein SSHFP-Eintrag im DNS',
    ],
    beispiel: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL9dK3vQmZ4nB1xY7pR2sT8uWc0eF6gH5jK4mN3oP2qR root@web01

# ssh-keygen -lf ssh_host_ed25519_key.pub
256 SHA256:9xL2…7Qs root@web01 (ED25519)`,
    sprache: 'text',
  }),
  datei('ssh', {
    id: 'ssh-config',
    titel: 'ssh_config',
    pfad: '/etc/ssh/ssh_config',
    zweck: 'Die systemweiten Voreinstellungen für ausgehende SSH-Verbindungen. Auf einem Server ist das relevant, sobald er selbst irgendwohin verbindet — für Sicherungen, Bereitstellungen oder Git.',
    format: 'Host-Blöcke mit eingerückten Schlüsselwörtern; auch hier gewinnt der erste Treffer',
    rechte: '0644 root:root',
    gelesenVon: 'ssh, scp, sftp und alles, was sie aufruft — nach ~/.ssh/config',
    betrieb: 'Wirkt bei der nächsten Verbindung. ssh -G <ziel> zeigt die aufgelöste Konfiguration',
    punkte: [
      'Die Benutzerdatei ~/.ssh/config wird zuerst gelesen und gewinnt damit',
      'Host * am Ende ist der Auffangblock für alle Ziele',
      'StrictHostKeyChecking accept-new nimmt unbekannte Server an, geänderte nicht',
    ],
    beispiel: `Host git.internal
    User git
    IdentityFile /etc/deploy/id_ed25519
    IdentitiesOnly yes

Host *
    StrictHostKeyChecking accept-new
    ServerAliveInterval 60
    HashKnownHosts yes`,
  }),
  datei('ssh', {
    id: 'moduli',
    titel: 'moduli',
    pfad: '/etc/ssh/moduli',
    zweck: 'Die Sammlung von Primzahlgruppen für den Diffie-Hellman-Schlüsselaustausch. Der Server wählt daraus zufällig eine Gruppe, wenn der Client group-exchange verlangt.',
    format: 'Eine Zeile je Gruppe, sieben durch Leerraum getrennte Felder; das fünfte ist die Bitlänge',
    rechte: '0644 root:root',
    gelesenVon: 'sshd beim Aushandeln des Schlüsselaustauschs',
    betrieb: 'Kommt aus dem Paket; nach dem Kürzen genügt systemctl reload ssh',
    punkte: [
      'Zeilen mit weniger als 3072 Bit gelten als zu schwach und werden entfernt',
      'Der Datumsstempel im ersten Feld ist der Zeitpunkt der Erzeugung',
      'Ohne diese Datei fallen manche Clients auf feste, schwächere Gruppen zurück',
    ],
    beispiel: `# Zeit Typ Test Versuche Größe Generator Modulus
20240115033216 2 6 100 3071 2 F4A9…
20240115041002 2 6 100 4095 2 C31D…

# Schwache Gruppen entfernen:
awk '$1 ~ /^#/ || $5 >= 3071' /etc/ssh/moduli > /etc/ssh/moduli.neu`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------ Ebene 4: /etc/systemd */

const systemd: Knoten[] = [
  datei('systemd', {
    id: 'unit-service',
    titel: 'system/app.service',
    pfad: '/etc/systemd/system/app.service',
    zweck: 'Beschreibt einen Dienst: was gestartet wird, unter welchem Konto, mit welchen Grenzen, und was bei einem Absturz geschehen soll. Eine Unit-Datei ist eine Deklaration, kein Startskript — systemd leitet daraus alles Weitere ab.',
    format: 'INI mit drei festen Abschnitten: [Unit], [Service], [Install]',
    rechte: '0644 root:root',
    gelesenVon: 'systemd beim daemon-reload; die wirksame Fassung zeigt systemctl cat app.service',
    betrieb: 'systemctl daemon-reload, dann systemctl restart app.service',
    punkte: [
      'Diese Ebene schlägt eine gleichnamige Datei unter /usr/lib/systemd/system',
      'After= legt nur die Reihenfolge fest, Requires= die Abhängigkeit — beides zusammen ist meist gemeint',
      'WantedBy=multi-user.target im Abschnitt [Install] entscheidet über den Start beim Hochfahren',
      'Die Protect-Direktiven sind billige Härtung; systemd-analyze security app.service bewertet sie',
    ],
    beispiel: `[Unit]
Description=Anwendungsserver
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=notify
User=app
Group=app
ExecStart=/opt/app/bin/server --config /etc/app/server.toml
Restart=on-failure
RestartSec=5s
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
StateDirectory=app

[Install]
WantedBy=multi-user.target`,
    warnung:
      'Ohne daemon-reload startet systemctl restart weiterhin die alte Fassung — ohne Fehlermeldung. Wer das einmal übersehen hat, sucht den Fehler im Programm statt in der Unit.',
  }),
  datei('systemd', {
    id: 'drop-in',
    titel: 'system/app.service.d/override.conf',
    pfad: '/etc/systemd/system/app.service.d/override.conf',
    zweck: 'Ändert einzelne Direktiven einer Unit, ohne sie zu kopieren. Das ist der richtige Weg, um an einer Paket-Unit etwas anzupassen: Das Update bleibt wirksam, die eigene Änderung bleibt bestehen.',
    format: 'INI, nur die Abschnitte und Zeilen, die abweichen sollen',
    rechte: '0644 root:root',
    gelesenVon: 'systemd nach der Hauptdatei; systemctl cat zeigt beide untereinander',
    betrieb: 'systemctl edit app.service legt die Datei an und lädt anschließend selbst neu',
    punkte: [
      'Mehrfach setzbare Direktiven wie ExecStart müssen erst mit einer leeren Zuweisung geleert werden',
      'Einfach setzbare Direktiven wie User werden schlicht überschrieben',
      'Der Verzeichnisname ist der Unitname plus .d — die Datei darin darf heißen, wie sie will',
    ],
    beispiel: `# systemctl edit app.service
[Service]
ExecStart=
ExecStart=/opt/app/bin/server --config /etc/app/server.toml --workers 8
Environment=RUST_LOG=info
MemoryMax=2G`,
    warnung:
      'Ohne die leere ExecStart-Zeile hat die Unit zwei Startbefehle, und systemd verweigert den Dienst mit „Service has more than one ExecStart". Das gilt für jede Direktive, die mehrfach vorkommen darf.',
  }),
  datei('systemd', {
    id: 'timer',
    titel: 'system/backup.timer',
    pfad: '/etc/systemd/system/backup.timer',
    zweck: 'Der systemd-Ersatz für einen Cron-Eintrag. Ein Timer startet eine gleichnamige .service-Unit zu festgelegten Zeiten und protokolliert das Ergebnis im Journal — anders als cron, das nur E-Mails schreibt.',
    format: 'INI mit den Abschnitten [Unit], [Timer] und [Install]',
    rechte: '0644 root:root',
    gelesenVon: 'systemd; die nächste Ausführung zeigt systemctl list-timers',
    betrieb: 'systemctl daemon-reload, dann systemctl enable --now backup.timer',
    punkte: [
      'OnCalendar versteht Ausdrücke wie daily, weekly oder *-*-* 03:15:00',
      'Persistent=true holt einen verpassten Lauf nach dem Einschalten nach',
      'RandomizedDelaySec verteilt gleichzeitige Läufe vieler Server',
      'systemd-analyze calendar "…" rechnet einen Ausdruck in echte Zeitpunkte um',
    ],
    beispiel: `[Unit]
Description=Nächtliche Sicherung

[Timer]
OnCalendar=*-*-* 03:15:00
RandomizedDelaySec=900
Persistent=true
Unit=backup.service

[Install]
WantedBy=timers.target`,
  }),
  datei('systemd', {
    id: 'journald',
    titel: 'journald.conf',
    pfad: '/etc/systemd/journald.conf',
    zweck: 'Bestimmt, wie das Journal Protokolle speichert: im Arbeitsspeicher oder auf der Platte, wie viel Platz es belegen darf und wie lange es aufhebt. Ohne Persistenz sind die Protokolle nach dem Neustart weg — genau dann, wenn man sie braucht.',
    format: 'INI mit einem Abschnitt [Journal]; auskommentierte Zeilen zeigen die Voreinstellung',
    rechte: '0644 root:root',
    gelesenVon: 'systemd-journald beim Start und beim Neuladen',
    betrieb: 'systemctl restart systemd-journald; Belegung prüfen mit journalctl --disk-usage',
    punkte: [
      'Storage=persistent legt /var/log/journal an und überlebt damit den Neustart',
      'SystemMaxUse begrenzt den Gesamtplatz, MaxRetentionSec die Aufbewahrungsdauer',
      'Eigene Ergänzungen gehören besser nach /etc/systemd/journald.conf.d/',
      'Ohne Grenze nimmt das Journal bis zu zehn Prozent der Partition ein',
    ],
    beispiel: `[Journal]
Storage=persistent
Compress=yes
SystemMaxUse=2G
SystemMaxFileSize=128M
MaxRetentionSec=30day
ForwardToSyslog=no`,
  }),
  datei('systemd', {
    id: 'resolved',
    titel: 'resolved.conf',
    pfad: '/etc/systemd/resolved.conf',
    zweck: 'Der tatsächliche Ort für die DNS-Konfiguration auf einem System mit systemd-resolved. Was in /etc/resolv.conf steht, ist nur das Ergebnis dessen, was hier und in der Netzkonfiguration festgelegt wurde.',
    format: 'INI mit einem Abschnitt [Resolve]',
    rechte: '0644 root:root',
    gelesenVon: 'systemd-resolved',
    betrieb: 'systemctl restart systemd-resolved, danach resolvectl status zur Kontrolle',
    punkte: [
      'DNS= sind die globalen Server, FallbackDNS= greift nur, wenn sonst nichts gesetzt ist',
      'Vom Netz gelieferte Server haben Vorrang vor DNS= aus dieser Datei',
      'DNSStubListener=yes ist der Grund für den Eintrag 127.0.0.53 in resolv.conf',
      'Domains=~example.net leitet nur diese Zone an die genannten Server',
    ],
    beispiel: `[Resolve]
DNS=10.0.0.53 10.0.0.54
FallbackDNS=
Domains=~internal.example.net
DNSSEC=allow-downgrade
DNSStubListener=yes
Cache=yes`,
  }),
  datei('systemd', {
    id: 'timesyncd',
    titel: 'timesyncd.conf',
    pfad: '/etc/systemd/timesyncd.conf',
    zweck: 'Legt die Zeitserver für die einfache Uhrensynchronisation fest. Eine falsch gehende Uhr lässt TLS-Verbindungen fehlschlagen, Protokolle unbrauchbar werden und zeitbasierte Anmeldeverfahren scheitern — auf einem Server ist Zeit keine Nebensache.',
    format: 'INI mit einem Abschnitt [Time]; mehrere Server durch Leerzeichen getrennt',
    rechte: '0644 root:root',
    gelesenVon: 'systemd-timesyncd',
    betrieb: 'systemctl restart systemd-timesyncd, Zustand mit timedatectl show-timesync',
    punkte: [
      'timesyncd ist ein reiner Client — es stellt keine Zeit für andere bereit',
      'Wer Genauigkeit im Millisekundenbereich braucht, nimmt chrony statt timesyncd',
      'Die Zeitzone steht nicht hier, sondern in /etc/localtime (timedatectl set-timezone)',
    ],
    beispiel: `[Time]
NTP=ntp1.internal.example.net ntp2.internal.example.net
FallbackNTP=ntp.ubuntu.com
RootDistanceMaxSec=5
PollIntervalMinSec=32`,
  }),
]

/* ---------------------------------------------------- Ebene 4: /etc/apt */

const apt: Knoten[] = [
  datei('apt', {
    id: 'sources-list',
    titel: 'sources.list',
    pfad: '/etc/apt/sources.list',
    zweck: 'Die Hauptquellen der Distribution im alten einzeiligen Format. Jede Zeile nennt einen Spiegelserver, eine Veröffentlichung und die Bereiche, aus denen installiert werden darf.',
    format: 'Eine Zeile je Quelle: deb <URL> <Suite> <Komponenten>',
    rechte: '0644 root:root',
    gelesenVon: 'apt update; das Ergebnis landet in /var/lib/apt/lists',
    betrieb: 'apt update liest neu ein — ohne das bleibt jede Änderung folgenlos',
    punkte: [
      'deb sind Binärpakete, deb-src sind Quellpakete',
      'Die Suite -security ist die wichtigste Zeile auf einem Server',
      'Auf neueren Systemen ist die Datei leer und alles liegt in .sources-Dateien',
    ],
    beispiel: `deb http://de.archive.ubuntu.com/ubuntu noble main restricted universe
deb http://de.archive.ubuntu.com/ubuntu noble-updates main restricted universe
deb http://security.ubuntu.com/ubuntu noble-security main restricted universe`,
    sprache: 'text',
  }),
  datei('apt', {
    id: 'sources-d',
    titel: 'sources.list.d/docker.sources',
    pfad: '/etc/apt/sources.list.d/docker.sources',
    zweck: 'Eine zusätzliche Paketquelle im neuen Format deb822. Es ist mehrzeilig, kennt benannte Felder und nennt vor allem den Signaturschlüssel direkt bei der Quelle statt im systemweiten Vertrauensbund.',
    format: 'Absätze aus Feld: Wert, getrennt durch Leerzeilen — dasselbe Format wie Debian-Steuerdateien',
    rechte: '0644 root:root',
    gelesenVon: 'apt update',
    betrieb: 'apt update; welche Quelle ein Paket liefert, zeigt apt policy <paket>',
    punkte: [
      'Signed-By bindet den Schlüssel an genau diese Quelle',
      'Eine Fremdquelle darf jedes Paket ersetzen — auch systemnahe',
      'Ohne Pinning in /etc/apt/preferences.d gewinnt schlicht die höhere Version',
    ],
    beispiel: `Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: amd64
Signed-By: /etc/apt/keyrings/docker.asc`,
    sprache: 'text',
    warnung:
      'Eine Fremdquelle einzutragen heißt, deren Betreiber Schreibrechte auf dem gesamten System zu geben. Jede Quelle braucht einen eigenen Schlüssel unter Signed-By — nie den globalen Vertrauensbund erweitern.',
  }),
  datei('apt', {
    id: 'keyrings',
    titel: 'keyrings/docker.asc',
    pfad: '/etc/apt/keyrings/docker.asc',
    zweck: 'Der öffentliche Signaturschlüssel einer einzelnen Paketquelle. Er ersetzt den früheren globalen Vertrauensbund, bei dem jeder eingetragene Schlüssel für jede Quelle galt.',
    format: 'OpenPGP-Schlüssel in ASCII-Panzerung (.asc) oder binär (.gpg)',
    rechte: '0644 root:root — muss für den Benutzer _apt lesbar sein',
    gelesenVon: 'apt beim Prüfen der Release-Signatur, verwiesen aus Signed-By',
    betrieb: 'Wirkt beim nächsten apt update; der Fingerabdruck lässt sich mit gpg --show-keys prüfen',
    punkte: [
      'apt-key ist abgekündigt und in neuen Versionen entfernt',
      'Der Fingerabdruck gehört gegen die Herstellerangabe geprüft, nicht blind übernommen',
      'Läuft der Schlüssel ab, schlägt apt update mit EXPKEYSIG fehl',
    ],
    beispiel: `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBFit2ioBEADhWpZ8/wvZ6hUTiXOwQHXMAlaFHcPH9hAtr4F1y2+OYdbtMuth
…
-----END PGP PUBLIC KEY BLOCK-----`,
    sprache: 'text',
  }),
  datei('apt', {
    id: 'auto-upgrades',
    titel: 'apt.conf.d/20auto-upgrades',
    pfad: '/etc/apt/apt.conf.d/20auto-upgrades',
    zweck: 'Der Schalter für automatische Updates. Zwei Zeilen entscheiden, ob die Paketlisten regelmäßig erneuert und ob Sicherheitsupdates selbsttätig eingespielt werden.',
    format: 'APT-Konfigurationssyntax: Optionspfad in Anführungszeichen, Wert, Semikolon',
    rechte: '0644 root:root',
    gelesenVon: 'Die systemd-Timer apt-daily.timer und apt-daily-upgrade.timer',
    betrieb: 'Wirkt beim nächsten Timerlauf; sofortiger Test mit unattended-upgrade --dry-run -d',
    punkte: [
      '"1" heißt täglich, "0" schaltet ab — es ist ein Intervall in Tagen, kein Wahrheitswert',
      'Update-Package-Lists allein lädt nur Listen, installiert nichts',
      'Die Dateien in apt.conf.d werden lexikografisch gelesen, spätere überschreiben frühere',
    ],
    beispiel: `APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";`,
    sprache: 'text',
  }),
  datei('apt', {
    id: 'unattended',
    titel: 'apt.conf.d/50unattended-upgrades',
    pfad: '/etc/apt/apt.conf.d/50unattended-upgrades',
    zweck: 'Die Regeln für unbeaufsichtigte Updates. Sie legen fest, welche Quellen automatisch eingespielt werden, was ausgenommen bleibt und ob dabei neu gestartet werden darf — auf einem Server ist das die Entscheidung über den Umgang mit Sicherheitslücken.',
    format: 'APT-Konfigurationssyntax mit Listen in geschweiften Klammern',
    rechte: '0644 root:root',
    gelesenVon: 'unattended-upgrade, ausgelöst durch apt-daily-upgrade.timer',
    betrieb: 'unattended-upgrade --dry-run -d zeigt, was passieren würde; Protokoll in /var/log/unattended-upgrades/',
    punkte: [
      'Voreingestellt ist nur -security — Funktionsupdates bleiben außen vor',
      'Package-Blacklist nimmt einzelne Pakete aus, etwa die Datenbank',
      'Automatic-Reboot startet den Server neu, sobald der Kernel es verlangt',
    ],
    beispiel: `Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
};

Unattended-Upgrade::Package-Blacklist {
    "postgresql-16";
};

Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "root";`,
    sprache: 'text',
    warnung:
      'Automatic-Reboot "true" startet den Server ohne Rückfrage neu, sobald /var/run/reboot-required existiert. Auf einem Dienst ohne Ausfallreserve gehört stattdessen Automatic-Reboot-Time und ein geplantes Fenster gesetzt.',
  }),
]

/* -------------------------------------------------- Ebene 4: /etc/pam.d */

const pam: Knoten[] = [
  datei('pam', {
    id: 'sshd',
    titel: 'sshd',
    pfad: '/etc/pam.d/sshd',
    zweck: 'Die PAM-Kette für Anmeldungen über SSH. Sie entscheidet, was nach der erfolgreichen Schlüsselprüfung noch passiert: Kontosperren, Sitzungsaufbau, Ressourcengrenzen, Begrüßungstext.',
    format: 'Eine Zeile je Schritt: Typ, Kontrollflagge, Modul, Argumente',
    rechte: '0644 root:root',
    gelesenVon: 'sshd über die PAM-Bibliothek, bei jedem Anmeldeversuch',
    betrieb: 'Wirkt sofort für neue Anmeldungen — kein Neuladen nötig',
    punkte: [
      'Die vier Typen: auth (wer bist du), account (darfst du), password (Wechsel), session (Umgebung)',
      '@include zieht die gemeinsamen Ketten aus den common-Dateien herein',
      'pam_limits.so ist der Grund, warum /etc/security/limits.conf überhaupt wirkt',
      'sshd braucht UsePAM yes in sshd_config, sonst wird diese Datei nie gelesen',
    ],
    beispiel: `# PAM configuration for the Secure Shell service
auth       required     pam_env.so
@include common-auth
account    required     pam_nologin.so
@include common-account
session [success=ok ignore=ignore module_unknown=ignore default=bad] pam_selinux.so close
session    required     pam_loginuid.so
session    optional     pam_motd.so motd=/run/motd.dynamic
session    required     pam_limits.so
@include common-session
@include common-password`,
    sprache: 'text',
    warnung:
      'Ein Tippfehler in einer auth-Zeile kann jede Anmeldung verhindern — auch die eigene. Bei Änderungen an PAM gilt dieselbe Regel wie bei sshd: eine zweite Sitzung offen lassen und mit ihr prüfen.',
  }),
  datei('pam', {
    id: 'common-auth',
    titel: 'common-auth',
    pfad: '/etc/pam.d/common-auth',
    zweck: 'Die gemeinsame Authentisierungskette aller Dienste. Wer hier ein Modul ergänzt — etwa eine Sperre nach Fehlversuchen oder einen zweiten Faktor —, ändert es für Anmeldungen an der Konsole, über SSH und über su gleichzeitig.',
    format: 'Wie jede PAM-Datei: Typ, Kontrollflagge, Modul, Argumente; hier durchgängig auth',
    rechte: '0644 root:root',
    gelesenVon: 'Alle Dienste, die @include common-auth verwenden',
    betrieb: 'Wirkt sofort. Auf Debian erzeugt pam-auth-update die Datei aus Vorlagen',
    punkte: [
      'requisite bricht sofort ab, required merkt sich den Fehler und läuft weiter',
      'Die eckige Klammer ist die ausführliche Form der Kontrollflagge',
      'success=1 überspringt genau eine Folgezeile — Zeilen einzufügen verschiebt die Sprünge',
      'pam_deny.so am Ende ist der Riegel, falls keine Zeile davor Erfolg gemeldet hat',
    ],
    beispiel: `auth   [success=1 default=ignore]  pam_unix.so nullok
auth   requisite                   pam_deny.so
auth   required                    pam_permit.so
auth   optional                    pam_cap.so`,
    sprache: 'text',
    warnung:
      'Die Sprungweiten in success=N zählen Zeilen. Wer ein Modul mittendrin einfügt, verschiebt das Ziel des Sprungs und öffnet damit unter Umständen die Kette — Änderungen gehören an den Anfang oder ans Ende.',
  }),
  datei('pam', {
    id: 'common-password',
    titel: 'common-password',
    pfad: '/etc/pam.d/common-password',
    zweck: 'Die Kette für den Passwortwechsel. Hier hängt pam_pwquality, das neue Passwörter gegen die Regeln aus /etc/security/pwquality.conf prüft, und hier steht das Hash-Verfahren, mit dem gespeichert wird.',
    format: 'PAM-Zeilen vom Typ password',
    rechte: '0644 root:root',
    gelesenVon: 'passwd, chpasswd und jeder erzwungene Wechsel bei der Anmeldung',
    betrieb: 'Wirkt beim nächsten Passwortwechsel; bestehende Hashes bleiben unverändert',
    punkte: [
      'retry=3 gibt drei Versuche, bevor der Wechsel abgebrochen wird',
      'yescrypt ist auf aktuellen Systemen das Vorgabeverfahren, davor sha512',
      'obscure prüft auf Ähnlichkeit zum alten Passwort',
      'Regeln greifen nicht, wenn root das Passwort setzt — root darf alles',
    ],
    beispiel: `password  requisite   pam_pwquality.so retry=3
password  [success=1 default=ignore]  pam_unix.so obscure use_authtok try_first_pass yescrypt
password  requisite   pam_deny.so
password  required    pam_permit.so`,
    sprache: 'text',
  }),
  datei('pam', {
    id: 'common-session',
    titel: 'common-session',
    pfad: '/etc/pam.d/common-session',
    zweck: 'Alles, was beim Aufbau und beim Abbau einer Sitzung passiert: Heimatverzeichnis anlegen, Ressourcengrenzen setzen, den Prozess in eine systemd-Sitzung einhängen, den Vorgang protokollieren.',
    format: 'PAM-Zeilen vom Typ session',
    rechte: '0644 root:root',
    gelesenVon: 'Jeder Dienst mit @include common-session',
    betrieb: 'Wirkt für neue Sitzungen; laufende bleiben unberührt',
    punkte: [
      'pam_systemd.so erzeugt die Sitzung, die loginctl anzeigt',
      'pam_mkhomedir.so legt fehlende Heimatverzeichnisse beim ersten Anmelden an',
      'Was hier hängen bleibt, verzögert jede einzelne Anmeldung spürbar',
    ],
    beispiel: `session  [default=1]  pam_permit.so
session  requisite    pam_deny.so
session  required     pam_permit.so
session  optional     pam_umask.so
session  required     pam_unix.so
session  optional     pam_systemd.so
session  optional     pam_mkhomedir.so skel=/etc/skel umask=0077`,
    sprache: 'text',
  }),
  datei('pam', {
    id: 'sudo',
    titel: 'sudo',
    pfad: '/etc/pam.d/sudo',
    zweck: 'Die Kette, die sudo durchläuft, bevor es einen Befehl als anderer Benutzer ausführt. Sie erklärt, warum sudo überhaupt nach einem Passwort fragt — die Regel steht in /etc/sudoers, die Prüfung selbst passiert hier.',
    format: 'PAM-Zeilen, meist nur Einbindungen der common-Dateien',
    rechte: '0644 root:root',
    gelesenVon: 'sudo bei jedem Aufruf ohne gültiges Zeitfenster',
    betrieb: 'Wirkt sofort beim nächsten sudo-Aufruf',
    punkte: [
      'Das Zeitfenster, in dem sudo nicht erneut fragt, steht in sudoers (timestamp_timeout)',
      'Hier lässt sich ein zweiter Faktor genau für Rechteerhöhung einhängen',
      'pam_faillock in dieser Kette sperrt Konten auch bei sudo-Fehlversuchen',
    ],
    beispiel: `#%PAM-1.0
session    required   pam_env.so readenv=1 user_readenv=0
session    required   pam_env.so readenv=1 envfile=/etc/default/locale user_readenv=0
@include common-auth
@include common-account
@include common-session-noninteractive`,
    sprache: 'text',
  }),
]

/* ----------------------------------------------- Ebene 4: /etc/security */

const security: Knoten[] = [
  datei('security', {
    id: 'limits-conf',
    titel: 'limits.conf',
    pfad: '/etc/security/limits.conf',
    zweck: 'Setzt Ressourcengrenzen je Benutzer oder Gruppe: offene Dateien, Prozesse, Speicher. Auf Servern ist die Grenze für offene Dateien der häufigste Grund für den Fehler „Too many open files" unter Last.',
    format: 'Vier Spalten: Ziel, Typ (soft/hard), Merkmal, Wert',
    rechte: '0644 root:root',
    gelesenVon: 'pam_limits.so bei der Anmeldung — nicht vom Kernel direkt',
    betrieb: 'Wirkt erst bei der nächsten Anmeldung; Kontrolle mit ulimit -n als der Benutzer',
    punkte: [
      'soft ist die änderbare Grenze, hard die Obergrenze dafür',
      'Der Stern gilt für alle Benutzer außer root — root braucht eine eigene Zeile',
      'Für Dienste unter systemd gilt die Datei nicht: dort zählt LimitNOFILE in der Unit',
      'Eigene Einträge besser in eine Datei unter limits.d legen',
    ],
    beispiel: `#<Ziel>    <Typ>   <Merkmal>   <Wert>
*          soft    nofile      8192
*          hard    nofile      65535
@app       soft    nofile      65535
@app       hard    nproc       4096
root       soft    nofile      65535`,
    sprache: 'text',
    warnung:
      'Für einen von systemd gestarteten Dienst ist diese Datei wirkungslos — es findet keine Anmeldung statt, also läuft pam_limits nie. Dort gehört die Grenze als LimitNOFILE in die Unit.',
  }),
  datei('security', {
    id: 'limits-d',
    titel: 'limits.d/90-app.conf',
    pfad: '/etc/security/limits.d/90-app.conf',
    zweck: 'Eine Ergänzungsdatei zu limits.conf für ein einzelnes Konto oder eine Anwendung. Sie hält eigene Grenzen von der Paketdatei getrennt und macht sie einzeln entfernbar.',
    format: 'Dasselbe Vierspaltenformat wie limits.conf',
    rechte: '0644 root:root',
    gelesenVon: 'pam_limits.so, nach limits.conf und in lexikografischer Reihenfolge',
    betrieb: 'Wirkt bei der nächsten Anmeldung des betroffenen Kontos',
    punkte: [
      'Später gelesene Dateien überschreiben frühere Werte für dasselbe Ziel',
      'Die Nummer im Namen ist die einzige Steuerung der Reihenfolge',
      'Eine Datei je Anwendung ist übersichtlicher als eine gewachsene limits.conf',
    ],
    beispiel: `# Grenzen für das Konto der Anwendung
app   soft   nofile   65535
app   hard   nofile   65535
app   soft   nproc    8192
app   hard   nproc    8192`,
    sprache: 'text',
  }),
  datei('security', {
    id: 'pwquality',
    titel: 'pwquality.conf',
    pfad: '/etc/security/pwquality.conf',
    zweck: 'Die Regeln, gegen die ein neues Passwort geprüft wird: Mindestlänge, Zeichenklassen, Ähnlichkeit zum Benutzernamen, Wörterbuchtreffer.',
    format: 'Schlüssel = Wert, eine Zuweisung je Zeile',
    rechte: '0644 root:root',
    gelesenVon: 'pam_pwquality.so aus /etc/pam.d/common-password',
    betrieb: 'Wirkt beim nächsten Passwortwechsel; prüfen mit pwscore',
    punkte: [
      'minlen ist keine reine Zeichenzahl, sondern ein Punktwert mit Gutschriften',
      'Negative Werte bei dcredit oder ucredit fordern Zeichen, positive belohnen sie',
      'dictcheck=1 verhindert Wörterbuchwörter und ist wirksamer als jede Zeichenklassenregel',
      'Für root gelten die Regeln nur mit enforce_for_root',
    ],
    beispiel: `minlen = 12
minclass = 3
dcredit = -1
ucredit = -1
lcredit = -1
ocredit = 0
maxrepeat = 3
usercheck = 1
dictcheck = 1
enforce_for_root`,
    sprache: 'ini',
  }),
  datei('security', {
    id: 'faillock',
    titel: 'faillock.conf',
    pfad: '/etc/security/faillock.conf',
    zweck: 'Sperrt ein Konto nach einer Anzahl fehlgeschlagener Anmeldeversuche für eine bestimmte Zeit. Das ist die Antwort auf systematisches Durchprobieren von Passwörtern — wirkungslos allerdings, wo ohnehin nur Schlüssel erlaubt sind.',
    format: 'Schlüssel = Wert, eine Zuweisung je Zeile; reine Schalter stehen allein',
    rechte: '0644 root:root',
    gelesenVon: 'pam_faillock.so in der auth-Kette',
    betrieb: 'faillock zeigt die Zähler, faillock --user <name> --reset setzt sie zurück',
    punkte: [
      'deny ist die Anzahl der Versuche, unlock_time die Sperrdauer in Sekunden',
      'even_deny_root bezieht root ein — sonst bleibt gerade dieses Konto ungeschützt',
      'Die Zähler liegen unter /var/run/faillock und sind damit nach einem Neustart weg',
      'Ohne den passenden Eintrag in /etc/pam.d bleibt die Datei folgenlos',
    ],
    beispiel: `deny = 5
fail_interval = 900
unlock_time = 900
even_deny_root
root_unlock_time = 60
audit`,
    sprache: 'ini',
    warnung:
      'Eine zu scharfe Sperre ist selbst eine Angriffsfläche: Wer den Benutzernamen kennt, kann ein Konto durch absichtliche Fehlversuche dauerhaft aussperren. Auf Servern mit Schlüsselanmeldung ist der Nutzen gering, das Risiko bleibt.',
  }),
  datei('security', {
    id: 'access',
    titel: 'access.conf',
    pfad: '/etc/security/access.conf',
    zweck: 'Eine Zugriffsliste, die Anmeldungen nach Konto, Gruppe und Herkunft erlaubt oder verweigert. Sie greift dort, wo der Dienst selbst keine solche Einschränkung kennt.',
    format: 'Drei durch Doppelpunkt getrennte Felder: Erlaubnis (+/-), Konten, Herkunft',
    rechte: '0644 root:root',
    gelesenVon: 'pam_access.so in der account-Kette',
    betrieb: 'Wirkt sofort für neue Anmeldungen',
    punkte: [
      'Die erste passende Zeile entscheidet — die Reihenfolge ist die Logik',
      'Die letzte Zeile ist üblicherweise eine ausdrückliche Verweigerung für alle',
      'Als Herkunft sind Rechnername, Netzbereich, LOCAL und ALL erlaubt',
      'Für SSH ist AllowGroups in sshd_config die direktere Lösung',
    ],
    beispiel: `# Administratoren nur aus dem Verwaltungsnetz
+ : root : 10.0.9.0/24
+ : @sudo : 10.0.9.0/24
+ : @app : ALL
+ : ALL : LOCAL
- : ALL : ALL`,
    sprache: 'text',
  }),
]

/* ------------------------------------------------------------- Bündelung */

export const konfigurationKnoten: Knoten[] = [
  ...verzeichnisse,
  ...stamm,
  ...ssh,
  ...systemd,
  ...apt,
  ...pam,
  ...security,
]
