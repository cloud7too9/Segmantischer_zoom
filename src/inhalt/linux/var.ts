import type { Knoten } from '../../kern/typen'
import { baukasten } from './bausteine'

const { verzeichnis, datei } = baukasten('zustand')

/* ------------------------------------------------- Ebene 3: Verzeichnisse */

const verzeichnisse: Knoten[] = [
  verzeichnis('log', '/var/log', 'Was das System aufgeschrieben hat', {
    text: 'Die erste Anlaufstelle bei jeder Störung. Auf einem System mit systemd gibt es zwei Protokollwelten nebeneinander: das binäre Journal und die klassischen Textdateien, die rsyslog daraus schreibt. Beide enthalten weitgehend dasselbe, werden aber verschieden gelesen, rotiert und aufbewahrt.',
    punkte: [
      'Textdateien werden von logrotate rotiert, das Journal begrenzt sich selbst',
      'Ein volles /var/log legt Dienste lahm, die nicht mehr schreiben können',
      'Zugriff meist über die Gruppe adm, nicht nur für root',
    ],
  }),
  verzeichnis('lib', '/var/lib', 'Der Zustand, den Dienste behalten müssen', {
    text: 'Hier liegen die Daten, die ein Dienst zwischen zwei Starts braucht: die Paketdatenbank, Zähler, Merker, Datenbankdateien. Anders als /var/cache ist nichts davon entbehrlich — wer /var/lib löscht, verliert den Zustand des Systems, nicht nur Geschwindigkeit.',
    punkte: [
      'Je Paket ein Unterverzeichnis, benannt nach dem Dienst',
      'Gehört in jede Sicherung; /var/cache gehört es nicht',
      'Datenbanken liegen hier, solange nichts anderes eingestellt wurde',
    ],
  }),
  verzeichnis('spool', '/var/spool', 'Warteschlangen mit Auftragscharakter', {
    text: 'Ein Spool ist eine Warteschlange: Aufträge liegen als Dateien darin, bis ein Dienst sie abarbeitet und die Datei entfernt. Das ist der älteste Warteschlangenmechanismus von Unix und immer noch der, auf dem Cron, Mail und Druck laufen.',
    punkte: [
      'Der Inhalt ist per Bauart flüchtig gemeint, überlebt aber den Neustart',
      'Eine wachsende Warteschlange ist immer ein Alarmzeichen',
      'Rechte sind hier eng gesetzt: die Aufträge enthalten fremde Daten',
    ],
  }),
  verzeichnis('cache', '/var/cache', 'Wiederherstellbare Zwischenstände', {
    text: 'Alles hier lässt sich neu erzeugen — langsamer, aber vollständig. Das ist die Zusicherung des Verzeichnisses und der Grund, warum es der erste Ort ist, an dem man Platz schafft. Nichts davon gehört in eine Sicherung.',
    punkte: [
      'apt clean leert den größten Posten, die heruntergeladenen Pakete',
      'Löschen ist ungefährlich, kostet aber Zeit beim nächsten Zugriff',
      'Wächst still vor sich hin, bis die Partition voll ist',
    ],
  }),
  verzeichnis('backups', '/var/backups', 'Die stillen Sicherheitskopien von Debian', {
    text: 'Ein Debian-Eigenheit, die schon manche Nacht gerettet hat: Die kritischen Systemdateien werden automatisch kopiert, bevor sie sich ändern. Wer /etc/passwd zerschossen hat, findet hier die Fassung von gestern — ohne dass je eine Sicherung eingerichtet worden wäre.',
    punkte: [
      'Die Kopien entstehen durch /etc/cron.daily/, nicht durch ein Sicherungswerkzeug',
      '.0 ist die jüngste Kopie, .1.gz und weiter sind die älteren',
      'Ersetzt keine Sicherung: alles liegt auf derselben Platte',
    ],
  }),
]

/* -------------------------------------------------- Ebene 4: /var/log */

const log: Knoten[] = [
  datei('log', {
    id: 'syslog',
    titel: 'syslog',
    pfad: '/var/log/syslog',
    zweck: 'Das allgemeine Systemprotokoll: alles, was nicht in eine der Spezialdateien gehört. Auf Debian und Ubuntu ist es die Datei, in die rsyslog den Großteil des Journals als Text ausleitet.',
    format: 'Eine Zeile je Ereignis: Zeitstempel, Rechnername, Programm mit PID, Text',
    rechte: '0640 syslog:adm',
    gelesenVon: 'Menschen mit less und grep; Auswertungen mit awk; Sammler wie Promtail oder Filebeat',
    betrieb: 'Wird von /etc/logrotate.d/rsyslog rotiert, üblicherweise täglich mit sieben Ständen',
    punkte: [
      'Der Zeitstempel hat traditionell keine Jahreszahl und keine Zeitzone',
      'Der Name in eckigen Klammern ist die Prozessnummer des Absenders',
      'Ohne rsyslog gibt es diese Datei nicht — dann bleibt nur journalctl',
    ],
    beispiel: `Sep 10 04:17:01 web01 CRON[2411]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)
Sep 10 04:22:09 web01 systemd[1]: Starting Daily apt download activities...
Sep 10 04:22:11 web01 systemd[1]: apt-daily.service: Deactivated successfully.
Sep 10 04:31:44 web01 kernel: [86400.113] TCP: request_sock_TCP: Possible SYN flooding on port 443.`,
    sprache: 'text',
  }),
  datei('log', {
    id: 'auth-log',
    titel: 'auth.log',
    pfad: '/var/log/auth.log',
    zweck: 'Jede Anmeldung, jeder Anmeldeversuch, jeder sudo-Aufruf. Nach einem Sicherheitsvorfall ist das die erste Datei, die gelesen wird — und die erste, die ein Angreifer zu verändern versucht.',
    format: 'Syslog-Zeilenformat, gespeist aus der Einrichtung auth und authpriv',
    rechte: '0640 syslog:adm',
    gelesenVon: 'fail2ban, Einbruchserkennung, Prüfer nach einem Vorfall',
    betrieb: 'Rotation über logrotate; für Beweiszwecke gehört sie auf einen anderen Rechner gespiegelt',
    punkte: [
      '„Accepted publickey" nennt den Fingerabdruck des benutzten Schlüssels',
      '„Failed password" in Serie ist systematisches Durchprobieren',
      'Jeder sudo-Aufruf steht mit Benutzer, Arbeitsverzeichnis und Befehl darin',
      'Auf RPM-Systemen heißt dieselbe Datei /var/log/secure',
    ],
    beispiel: `Sep 10 09:14:02 web01 sshd[3312]: Accepted publickey for deploy from 10.0.9.24 port 51344 ssh2: ED25519 SHA256:9xL2…7Qs
Sep 10 09:14:02 web01 systemd-logind[812]: New session 42 of user deploy.
Sep 10 09:15:37 web01 sudo:   deploy : TTY=pts/0 ; PWD=/home/deploy ; USER=root ; COMMAND=/usr/bin/systemctl restart app.service
Sep 10 09:41:18 web01 sshd[3390]: Failed password for invalid user admin from 203.0.113.7 port 40122 ssh2`,
    sprache: 'text',
    warnung:
      'Wer diese Datei nur lokal führt, hat nach einem erfolgreichen Einbruch keine verlässliche Spur mehr — Schreibrechte auf dem System schließen Schreibrechte auf das Protokoll ein.',
  }),
  datei('log', {
    id: 'journal',
    titel: 'journal/…/system.journal',
    pfad: '/var/log/journal/<machine-id>/system.journal',
    zweck: 'Das Journal von systemd: das vollständige, strukturierte Protokoll des Systems. Jeder Eintrag ist ein Satz von Feldern, nicht eine Textzeile — deshalb lässt sich danach filtern statt darin zu suchen.',
    format: 'Binäres, indiziertes und gesiegeltes Journalformat — mit cat nicht lesbar',
    rechte: '2755 root:systemd-journal, Dateien 0640',
    gelesenVon: 'Ausschließlich journalctl und die Bibliothek dahinter',
    betrieb: 'journalctl -u <unit>, journalctl -p err -b; Platzbedarf mit journalctl --disk-usage',
    punkte: [
      'Existiert das Verzeichnis nicht, protokolliert journald nur nach /run und verliert alles beim Neustart',
      'Felder wie _UID, _SYSTEMD_UNIT oder _BOOT_ID sind direkt filterbar',
      'journalctl --vacuum-size=1G räumt gezielt auf',
      'Der Verzeichnisname ist die Maschinenkennung aus /etc/machine-id',
    ],
    beispiel: `# Struktur eines Eintrags, sichtbar gemacht:
journalctl -u ssh -n 1 -o json-pretty

{
    "__REALTIME_TIMESTAMP" : "1757491442113000",
    "_HOSTNAME" : "web01",
    "_SYSTEMD_UNIT" : "ssh.service",
    "PRIORITY" : "6",
    "MESSAGE" : "Server listening on 0.0.0.0 port 22."
}`,
    sprache: 'sh',
  }),
  datei('log', {
    id: 'dpkg-log',
    titel: 'dpkg.log',
    pfad: '/var/log/dpkg.log',
    zweck: 'Die lückenlose Aufzeichnung jedes Paketvorgangs: was wann installiert, aktualisiert oder entfernt wurde, mit alter und neuer Version. Die Antwort auf „seit wann geht das nicht mehr" steht fast immer hier.',
    format: 'Eine Zeile je Zustandswechsel: Datum, Zeit, Vorgang, Paket, alte Version, neue Version',
    rechte: '0644 root:root',
    gelesenVon: 'Menschen bei der Fehlersuche; /var/log/apt/history.log ist die lesbarere Zusammenfassung',
    betrieb: 'Rotation monatlich über logrotate; nur lesen, nie bearbeiten',
    punkte: [
      'Vorgänge: install, upgrade, remove, purge, status',
      'Zu jedem Paket erscheinen mehrere status-Zeilen für die Zwischenschritte',
      'Die Zeitstempel haben hier volles Datum — anders als im Syslog-Format',
    ],
    beispiel: `2026-09-08 03:12:44 upgrade openssl:amd64 3.0.13-0ubuntu3.4 3.0.13-0ubuntu3.5
2026-09-08 03:12:45 status half-configured openssl:amd64 3.0.13-0ubuntu3.5
2026-09-08 03:12:45 status installed openssl:amd64 3.0.13-0ubuntu3.5
2026-09-08 03:12:51 install jq:amd64 <keine> 1.7.1-3build1`,
    sprache: 'text',
  }),
  datei('log', {
    id: 'nginx-access',
    titel: 'nginx/access.log',
    pfad: '/var/log/nginx/access.log',
    zweck: 'Das Zugriffsprotokoll des Webservers. Es steht stellvertretend für jedes Dienstprotokoll unter /var/log/<dienst>/ und zeigt, wie ein Dienst sein eigenes Format mitbringt, statt sich dem Syslog-Format zu fügen.',
    format: 'Combined Log Format: Herkunft, Kennung, Benutzer, Zeit, Anfrage, Status, Bytes, Verweis, Programmkennung',
    rechte: '0640 www-data:adm',
    gelesenVon: 'Auswertungen wie GoAccess; awk für schnelle Zählungen',
    betrieb: 'Rotation über /etc/logrotate.d/nginx mit anschließendem Signal an den Dienst',
    punkte: [
      'Das Format ist in nginx.conf frei definierbar — Auswertungen brechen daran',
      'Hinter einem Proxy steht in Feld 1 dessen Adresse, nicht die des Besuchers',
      'Nach der Rotation muss der Dienst die Datei neu öffnen, sonst schreibt er ins Leere',
    ],
    beispiel: `10.0.9.24 - - [10/Sep/2026:09:12:44 +0200] "GET /api/status HTTP/1.1" 200 118 "-" "curl/8.5.0"
203.0.113.7 - - [10/Sep/2026:09:12:51 +0200] "POST /login HTTP/1.1" 401 0 "-" "python-requests/2.31"

# Die zehn häufigsten Herkunftsadressen:
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head`,
    sprache: 'sh',
    warnung:
      'Ohne das Signal nach der Rotation schreibt der Dienst weiter in die inzwischen umbenannte Datei. Der Platz wird dann nie frei, und im neuen Protokoll steht nichts — ein Fehler, der erst auffällt, wenn die Partition voll ist.',
  }),
]

/* -------------------------------------------------- Ebene 4: /var/lib */

const lib: Knoten[] = [
  datei('lib', {
    id: 'dpkg-status',
    titel: 'dpkg/status',
    pfad: '/var/lib/dpkg/status',
    zweck: 'Die Paketdatenbank des Systems: welche Pakete in welcher Version installiert sind, in welchem Zustand, mit welchen Abhängigkeiten. Ohne diese Datei weiß das System nicht mehr, was auf ihm installiert ist.',
    format: 'Absätze im Debian-Steuerformat, getrennt durch Leerzeilen — dasselbe Format wie .sources-Dateien',
    rechte: '0644 root:root',
    gelesenVon: 'dpkg und apt bei jedem Vorgang; dpkg-query stellt Fragen daran',
    betrieb: 'Nur über dpkg und apt ändern; die Vortagesfassung liegt in /var/backups/dpkg.status.0',
    punkte: [
      'Das Feld Status hat drei Teile: Auswahl, Fehlermerker, Zustand',
      '„install ok installed" ist der Normalfall, alles andere verlangt Aufmerksamkeit',
      '„rc" bedeutet entfernt, aber Konfiguration noch vorhanden',
      'dpkg -l ist nichts anderes als eine Ansicht auf diese Datei',
    ],
    beispiel: `Package: openssh-server
Status: install ok installed
Priority: optional
Section: net
Installed-Size: 1892
Maintainer: Ubuntu Developers <…>
Architecture: amd64
Version: 1:9.6p1-3ubuntu13.5
Depends: openssh-client (= 1:9.6p1-3ubuntu13.5), libc6, libpam0g
Conffiles:
 /etc/ssh/sshd_config 8f1a…9c2b`,
    sprache: 'text',
  }),
  datei('lib', {
    id: 'extended-states',
    titel: 'apt/extended_states',
    pfad: '/var/lib/apt/extended_states',
    zweck: 'Merkt sich, welche Pakete nur als Abhängigkeit mitinstalliert wurden. Genau daraus leitet apt autoremove ab, was wieder verschwinden darf — die Datei entscheidet also, welche Pakete beim Aufräumen fallen.',
    format: 'Absätze im Steuerformat mit den Feldern Package, Architecture und Auto-Installed',
    rechte: '0644 root:root',
    gelesenVon: 'apt bei autoremove und bei jeder Abhängigkeitsauflösung',
    betrieb: 'Ändern mit apt-mark auto <paket> beziehungsweise apt-mark manual <paket>',
    punkte: [
      'Auto-Installed: 1 heißt „darf gehen, wenn niemand mehr davon abhängt"',
      'Eine verlorene Datei führt dazu, dass autoremove nichts mehr findet',
      'apt-mark showauto listet den Inhalt in lesbarer Form',
    ],
    beispiel: `Package: libpam0g
Architecture: amd64
Auto-Installed: 1

Package: nginx
Architecture: amd64
Auto-Installed: 0`,
    sprache: 'text',
  }),
  datei('lib', {
    id: 'logrotate-status',
    titel: 'logrotate/status',
    pfad: '/var/lib/logrotate/status',
    zweck: 'Der Merker, wann jede Protokolldatei zuletzt rotiert wurde. logrotate hat kein Gedächtnis außer dieser Datei — sie ist der Grund, warum ein täglicher Lauf nicht zwölfmal am Tag rotiert.',
    format: 'Kopfzeile mit Versionsangabe, danach je Zeile Pfad in Anführungszeichen und Zeitstempel',
    rechte: '0644 root:root',
    gelesenVon: 'logrotate, ausgelöst durch logrotate.timer',
    betrieb: 'logrotate -d /etc/logrotate.conf probt trocken, ohne die Datei zu ändern',
    punkte: [
      'Wer die Zeile löscht, erzwingt beim nächsten Lauf eine Rotation',
      'Ein Datum in der Zukunft blockiert die Rotation dauerhaft',
      'Bei „rotiert nicht mehr" ist diese Datei die erste Prüfstelle',
    ],
    beispiel: `logrotate state -- version 2
"/var/log/syslog" 2026-9-10-3:0:0
"/var/log/auth.log" 2026-9-10-3:0:0
"/var/log/nginx/access.log" 2026-9-8-3:0:0`,
    sprache: 'text',
  }),
  datei('lib', {
    id: 'random-seed',
    titel: 'systemd/random-seed',
    pfad: '/var/lib/systemd/random-seed',
    zweck: 'Ein gespeicherter Zufallsvorrat für den Systemstart. Er wird beim Herunterfahren geschrieben und beim Start wieder in den Zufallszahlengenerator des Kernels eingespeist, damit der Rechner nicht jedes Mal mit derselben schwachen Entropie beginnt.',
    format: 'Rohe Binärdaten, üblicherweise 512 Byte',
    rechte: '0600 root:root',
    gelesenVon: 'systemd-random-seed.service beim Start und beim Herunterfahren',
    betrieb: 'Wird vollständig von systemd verwaltet; nach dem Klonen eines Abbilds gehört sie gelöscht',
    punkte: [
      'Sie ist kein Zufall, sondern ein Startwert — ihr Wert liegt in der Einmaligkeit',
      'Geklonte virtuelle Maschinen starten sonst mit identischem Zustand',
      'Moderne Kernel holen sich zusätzlich Entropie aus der Hardware',
    ],
    beispiel: `# Nicht lesbar, nur prüfbar:
ls -l /var/lib/systemd/random-seed
-rw------- 1 root root 512 Sep 10 04:02 /var/lib/systemd/random-seed

# Nach dem Klonen eines Abbilds:
rm -f /var/lib/systemd/random-seed /etc/machine-id`,
    sprache: 'sh',
  }),
  datei('lib', {
    id: 'dpkg-lock',
    titel: 'dpkg/lock-frontend',
    pfad: '/var/lib/dpkg/lock-frontend',
    zweck: 'Die Sperrdatei, die verhindert, dass zwei Paketvorgänge gleichzeitig laufen. Sie ist der Grund für die bekannteste Fehlermeldung der Debian-Welt: „Could not get lock".',
    format: 'Leere Datei; die Sperre selbst ist eine flock-Sperre auf dem geöffneten Dateiverweis',
    rechte: '0640 root:root',
    gelesenVon: 'apt und dpkg zu Beginn jedes Vorgangs',
    betrieb: 'fuser -v /var/lib/dpkg/lock-frontend zeigt, wer sie hält — meist unattended-upgrade',
    punkte: [
      'Die Datei ist immer 0 Byte groß, ihr Inhalt spielt keine Rolle',
      'Die Sperre endet mit dem Prozess, nicht mit der Datei',
      'Löschen hilft daher nicht, solange der Prozess läuft — es hebelt nur den Schutz aus',
      'Meist genügt es, den automatischen Update-Lauf abzuwarten',
    ],
    beispiel: `E: Could not get lock /var/lib/dpkg/lock-frontend.
   It is held by process 4711 (unattended-upgr)

$ fuser -v /var/lib/dpkg/lock-frontend
                     USER    PID ACCESS COMMAND
/var/lib/dpkg/lock-frontend:
                     root   4711 F.... unattended-upgr`,
    sprache: 'sh',
    warnung:
      'Die Sperrdatei zu löschen, während dpkg läuft, kann die Paketdatenbank in einen halb geänderten Zustand bringen. Der Ausweg heißt warten, nicht löschen.',
  }),
]

/* ------------------------------------------------ Ebene 4: /var/spool */

const spool: Knoten[] = [
  datei('spool', {
    id: 'crontab-root',
    titel: 'cron/crontabs/root',
    pfad: '/var/spool/cron/crontabs/root',
    zweck: 'Die persönliche Zeitplantabelle eines Benutzers — hier die von root. Sie ist der Ort, an dem crontab -e landet, und der Grund, warum eigene Cron-Einträge nach einer Wiederherstellung von /etc allein fehlen.',
    format: 'Fünf Zeitfelder (Minute, Stunde, Tag, Monat, Wochentag), danach der Befehl',
    rechte: '0600 root:crontab — von cron erzwungen, sonst wird die Tabelle ignoriert',
    gelesenVon: 'Der cron-Dienst, der das Verzeichnis auf Änderungen überwacht',
    betrieb: 'Ausschließlich über crontab -e bearbeiten; crontab -l zeigt den Inhalt',
    punkte: [
      'Anders als /etc/crontab gibt es hier keine Benutzerspalte — der Dateiname ist der Benutzer',
      'Cron startet mit einer sehr kurzen PATH-Variable; Befehle brauchen volle Pfade',
      'Ein Prozentzeichen im Befehl bedeutet Zeilenumbruch und muss geschützt werden',
      'Ausgaben gehen per Mail an den Benutzer, wenn MAILTO nichts anderes sagt',
    ],
    beispiel: `# DO NOT EDIT THIS FILE - edit the master and reinstall.
SHELL=/bin/bash
MAILTO=root

# Minute Stunde Tag Monat Wochentag  Befehl
15      2      *   *     *          /usr/local/sbin/sichern.sh >> /var/log/sichern.log 2>&1
*/10    *      *   *     *          /usr/local/bin/pruefe-zertifikate --leise`,
    sprache: 'sh',
    warnung:
      'Diese Datei wird von einer Sicherung von /etc nicht erfasst. Wer eigene Zeitpläne dauerhaft und nachvollziehbar halten will, legt sie stattdessen als Datei nach /etc/cron.d oder als systemd-Timer an.',
  }),
  datei('spool', {
    id: 'anacron',
    titel: 'anacron/cron.daily',
    pfad: '/var/spool/anacron/cron.daily',
    zweck: 'Ein Zeitstempel, der festhält, wann die täglichen Aufgaben zuletzt gelaufen sind. Damit holt anacron einen Lauf nach, der ausgefallen ist, weil der Rechner zu dieser Zeit aus war.',
    format: 'Eine einzige Zeile mit dem Datum im Format JJJJMMTT',
    rechte: '0600 root:root',
    gelesenVon: 'anacron, gestartet über einen systemd-Timer oder /etc/cron.d/anacron',
    betrieb: 'anacron -d -n führt sofort aus; der Zeitstempel wird danach fortgeschrieben',
    punkte: [
      'Je Aufgabe eine Datei: cron.daily, cron.weekly, cron.monthly',
      'Nur das Datum, keine Uhrzeit — die Auflösung ist ein Tag',
      'Auf durchlaufenden Servern übernimmt meist cron statt anacron',
    ],
    beispiel: `$ cat /var/spool/anacron/cron.daily
20260910

$ ls /var/spool/anacron/
cron.daily  cron.monthly  cron.weekly`,
    sprache: 'sh',
  }),
  datei('spool', {
    id: 'postfix-deferred',
    titel: 'postfix/deferred/',
    pfad: '/var/spool/postfix/deferred/',
    zweck: 'Die Warteschlange der fehlgeschlagenen Zustellungen. Jede Nachricht liegt darin, bis ein späterer Versuch gelingt oder die Frist abläuft — eine wachsende Anzahl ist eines der verlässlichsten Frühwarnzeichen auf einem Server.',
    format: 'Je Nachricht eine Datei im Postfix-Warteschlangenformat, verteilt auf Unterverzeichnisse nach dem ersten Zeichen der Kennung',
    rechte: '0700 postfix:root, Dateien 0700 postfix:postfix',
    gelesenVon: 'Der Postfix-Warteschlangenverwalter',
    betrieb: 'mailq zählt, postqueue -f erzwingt einen neuen Versuch, postsuper -d löscht',
    punkte: [
      'Weitere Warteschlangen daneben: incoming, active, hold, corrupt',
      'Der Wiederholungsabstand wächst mit jedem Fehlversuch',
      'postcat -q <kennung> zeigt eine einzelne Nachricht im Klartext',
      'Postfix läuft in einer chroot-Umgebung — daher die eigene Kopie von /etc darin',
    ],
    beispiel: `$ mailq
-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------
A1B2C3D4E5*    2841 Thu Sep 10 04:17:02  root@web01.example.net
                 (connect to mx.example.com: Connection timed out)
                                         alarm@example.com

-- 2 Kbytes in 1 Request.`,
    sprache: 'sh',
  }),
  datei('spool', {
    id: 'mail-benutzer',
    titel: 'mail/deploy',
    pfad: '/var/spool/mail/deploy',
    zweck: 'Der klassische Posteingang eines lokalen Benutzers. Auf Servern landen hier die Ausgaben fehlgeschlagener Cron-Läufe — oft ungelesen, obwohl sie die Ursache einer Störung beschreiben.',
    format: 'mbox: alle Nachrichten in einer Datei, jede beginnt mit einer Zeile „From "',
    rechte: '0600 deploy:mail',
    gelesenVon: 'mail, mutt und jedes Programm, das MAIL auswertet',
    betrieb: 'mail -u deploy liest; /var/mail ist auf Debian ein Symlink hierher',
    punkte: [
      'Eine Zeile im Text, die mit „From " beginnt, wird beim Speichern mit > geschützt',
      'Die Trennzeile hat kein Doppelpunkt — sie ist kein Kopffeld',
      'Maildir speichert stattdessen je Nachricht eine eigene Datei und ist robuster',
    ],
    beispiel: `From root@web01.example.net  Thu Sep 10 04:17:02 2026
Return-Path: <root@web01.example.net>
From: root@web01.example.net (Cron Daemon)
To: deploy@web01.example.net
Subject: Cron <root@web01> /usr/local/sbin/sichern.sh

/usr/local/sbin/sichern.sh: Zeile 12: rclone: Kommando nicht gefunden.`,
    sprache: 'text',
  }),
  datei('spool', {
    id: 'atjobs',
    titel: 'cron/atjobs/a00001…',
    pfad: '/var/spool/cron/atjobs/a000010192c3d4',
    zweck: 'Ein einmalig geplanter Auftrag von at. Anders als bei cron ist der Auftrag selbst die Datei: Sie enthält die vollständige Umgebung des Aufrufers und verschwindet nach der Ausführung.',
    format: 'Ausführbares Shell-Skript mit vorangestellten Umgebungsvariablen; die Ausführungszeit steckt im Dateinamen',
    rechte: '0700 root:daemon',
    gelesenVon: 'atd, der das Verzeichnis überwacht',
    betrieb: 'atq listet, at -c <nummer> zeigt den Inhalt, atrm <nummer> entfernt',
    punkte: [
      'Der erste Buchstabe ist die Warteschlange, danach folgt die Zeit in Minuten seit 1970 hexadezimal',
      'Die Umgebung wird beim Einplanen eingefroren, nicht bei der Ausführung gelesen',
      'Nach dem Lauf ist die Datei weg — daher gehört die Ausgabe umgeleitet',
    ],
    beispiel: `#!/bin/sh
# atrun uid=0 gid=0
# mail root 0
umask 22
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin; export PATH
cd /root || exit 1

systemctl restart app.service`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------ Ebene 4: /var/cache */

const cache: Knoten[] = [
  datei('cache', {
    id: 'apt-archives',
    titel: 'apt/archives/*.deb',
    pfad: '/var/cache/apt/archives/',
    zweck: 'Die heruntergeladenen Paketdateien der letzten Installationen. Auf einem länger laufenden Server ist das regelmäßig der größte einzelne Posten unter /var — und der, der sich gefahrlos löschen lässt.',
    format: 'Debian-Pakete: ein ar-Archiv aus debian-binary, control.tar und data.tar',
    rechte: '0644 root:root im Verzeichnis 0755 root:root',
    gelesenVon: 'apt beim Installieren; danach von niemandem mehr',
    betrieb: 'apt clean leert vollständig, apt autoclean nur die veralteten Stände',
    punkte: [
      'du -sh /var/cache/apt/archives ist der erste Handgriff bei knappem Platz',
      'dpkg-deb -c <datei> listet den Inhalt eines Pakets, ohne es zu installieren',
      'Auf Systemen mit vielen gleichen Servern spart ein Proxy mehr als der Zwischenspeicher',
    ],
    beispiel: `$ ls -la /var/cache/apt/archives/ | head -4
-rw-r--r-- 1 root root  1284616 Sep  8 03:12 openssl_3.0.13-0ubuntu3.5_amd64.deb
-rw-r--r-- 1 root root   402388 Sep  8 03:12 jq_1.7.1-3build1_amd64.deb

$ apt clean && du -sh /var/cache/apt/archives
0	/var/cache/apt/archives`,
    sprache: 'sh',
  }),
  datei('cache', {
    id: 'pkgcache',
    titel: 'apt/pkgcache.bin',
    pfad: '/var/cache/apt/pkgcache.bin',
    zweck: 'Der binäre Zwischenspeicher der Paketlisten. apt baut ihn aus den Dateien unter /var/lib/apt/lists auf, damit es Abhängigkeiten auflösen kann, ohne jedes Mal Textdateien einzulesen.',
    format: 'Binäres Abbild der internen Paketstruktur, an Version und Architektur gebunden',
    rechte: '0644 root:root',
    gelesenVon: 'apt, apt-cache und alle Werkzeuge derselben Familie',
    betrieb: 'Wird bei apt update neu gebaut; Löschen ist folgenlos, es entsteht neu',
    punkte: [
      'srcpkgcache.bin daneben ist derselbe Zwischenspeicher für Quellpakete',
      'Nach einem Versionswechsel von apt wird die Datei automatisch verworfen',
      '„The package cache file is corrupted" löst man durch Löschen und apt update',
    ],
    beispiel: `$ file /var/cache/apt/pkgcache.bin
/var/cache/apt/pkgcache.bin: APT cache data, version 16.0, little-endian

# Bei Beschädigung:
rm -f /var/cache/apt/*.bin && apt update`,
    sprache: 'sh',
  }),
  datei('cache', {
    id: 'debconf',
    titel: 'debconf/config.dat',
    pfad: '/var/cache/debconf/config.dat',
    zweck: 'Die Antworten auf alle Fragen, die Pakete bei der Installation gestellt haben. Sie sind der Grund, warum ein Paket beim erneuten Einrichten nicht wieder fragt — und die Quelle für vorab hinterlegte Antworten bei automatischer Installation.',
    format: 'Absätze aus Name, Wert und Merkern, getrennt durch Leerzeilen',
    rechte: '0600 root:root — kann Passwörter im Klartext enthalten',
    gelesenVon: 'debconf während jedes Paketvorgangs',
    betrieb: 'debconf-get-selections liest, debconf-set-selections schreibt vorab',
    punkte: [
      'templates.dat daneben enthält die Fragen, config.dat die Antworten',
      'dpkg-reconfigure <paket> fragt trotz gespeicherter Antwort erneut',
      'Für unbeaufsichtigte Installationen werden die Antworten vorab eingespielt',
    ],
    beispiel: `Name: postfix/main_mailer_type
Template: postfix/main_mailer_type
Value: Internet Site
Owners: postfix
Flags: seen

Name: mysql-server/root_password
Template: mysql-server/root_password
Owners: mysql-server-8.0`,
    sprache: 'text',
    warnung:
      'Manche Pakete legen hier Passwörter im Klartext ab. Die Datei gehört deshalb nicht in ein Abbild, das weitergegeben wird, und die Rechte 0600 sind kein Zufall.',
  }),
  datei('cache', {
    id: 'man-index',
    titel: 'man/index.db',
    pfad: '/var/cache/man/index.db',
    zweck: 'Der Suchindex über alle Handbuchseiten des Systems. Ohne ihn liefern apropos und whatis nichts — der häufigste Grund für „nothing appropriate" auf einem frisch aufgesetzten Server.',
    format: 'Binäre Schlüssel-Wert-Datenbank (GDBM oder Berkeley DB, je nach Bau)',
    rechte: '0644 man:man',
    gelesenVon: 'apropos, whatis und man -k',
    betrieb: 'mandb baut den Index neu; ein Timer erledigt das sonst täglich',
    punkte: [
      'Der Index wird nach jedem Paketvorgang veraltet, bis mandb wieder läuft',
      'In sehr schlanken Abbildern fehlen die Handbuchseiten ganz — dann hilft auch der Index nicht',
      'Je Sprache und Abschnitt ein eigener Bereich in derselben Datenbank',
    ],
    beispiel: `$ apropos hostname
apropos: nothing appropriate.

$ sudo mandb
Purging old database entries in /usr/share/man...
0 man subdirectories contained newer manual pages.
1832 manual pages were added.`,
    sprache: 'sh',
  }),
  datei('cache', {
    id: 'ldconfig',
    titel: 'ldconfig/aux-cache',
    pfad: '/var/cache/ldconfig/aux-cache',
    zweck: 'Ein Hilfsspeicher von ldconfig. Er beschleunigt den Aufbau des Bibliotheksverzeichnisses; das Verzeichnis selbst liegt in /etc/ld.so.cache und entscheidet, welche Bibliothek ein Programm beim Start findet.',
    format: 'Binär, versionsgebunden, nicht zum Lesen gedacht',
    rechte: '0644 root:root',
    gelesenVon: 'ldconfig beim Neuaufbau',
    betrieb: 'ldconfig baut neu, ldconfig -p zeigt den Inhalt des eigentlichen Verzeichnisses',
    punkte: [
      'Nach dem Ablegen einer Bibliothek in /usr/local/lib muss ldconfig laufen',
      'Löschen ist ungefährlich — es wird beim nächsten Lauf neu erzeugt',
      'Bei „cannot open shared object file" ist ldconfig -p die erste Prüfung',
    ],
    beispiel: `$ ldconfig -p | grep libssl
	libssl.so.3 (libc6,x86-64) => /lib/x86_64-linux-gnu/libssl.so.3

# Nach dem Hinzufügen einer eigenen Bibliothek:
echo /opt/app/lib > /etc/ld.so.conf.d/app.conf && ldconfig`,
    sprache: 'sh',
  }),
]

/* ---------------------------------------------- Ebene 4: /var/backups */

const backups: Knoten[] = [
  datei('backups', {
    id: 'dpkg-status-0',
    titel: 'dpkg.status.0',
    pfad: '/var/backups/dpkg.status.0',
    zweck: 'Die Kopie der Paketdatenbank vom Vortag. Wenn /var/lib/dpkg/status beschädigt ist, ist das die Datei, mit der sich das System wieder in einen bekannten Zustand bringen lässt.',
    format: 'Identisch zu /var/lib/dpkg/status: Absätze im Debian-Steuerformat',
    rechte: '0644 root:root',
    gelesenVon: 'Nur von Menschen im Notfall',
    betrieb: 'Erzeugt von /etc/cron.daily/dpkg; ältere Stände als .1.gz bis .6.gz daneben',
    punkte: [
      '.0 ist unkomprimiert, alle älteren Stände sind gzip-komprimiert',
      'diff gegen die aktuelle Datei zeigt, was sich seit gestern geändert hat',
      'Auch dpkg.diversions.0 und dpkg.statoverride.0 werden mitgesichert',
    ],
    beispiel: `# Was hat sich seit gestern an der Paketauswahl geändert?
diff <(grep '^Package:' /var/backups/dpkg.status.0) \\
     <(grep '^Package:' /var/lib/dpkg/status)

> Package: jq`,
    sprache: 'sh',
  }),
  datei('backups', {
    id: 'passwd-bak',
    titel: 'passwd.bak',
    pfad: '/var/backups/passwd.bak',
    zweck: 'Die letzte Fassung von /etc/passwd vor der jüngsten Änderung. Sie entsteht nicht nach Zeitplan, sondern immer dann, wenn sich die Kontoliste tatsächlich geändert hat.',
    format: 'Identisch zu /etc/passwd: sieben Felder je Zeile, mit Doppelpunkt getrennt',
    rechte: '0644 root:root',
    gelesenVon: 'Nur von Menschen im Notfall',
    betrieb: 'Erzeugt von /etc/cron.daily/passwd, sobald sich die Datei unterscheidet',
    punkte: [
      'Ein diff zeigt sofort, welches Konto hinzugekommen oder verschwunden ist',
      'Wird nur bei tatsächlicher Änderung geschrieben — der Zeitstempel ist eine Information',
      'Ein unerwartet neues Konto in der Differenz ist ein ernstes Zeichen',
    ],
    beispiel: `$ diff /var/backups/passwd.bak /etc/passwd
> monitor:x:1002:1002::/home/monitor:/usr/sbin/nologin

$ ls -l /var/backups/passwd.bak
-rw-r--r-- 1 root root 2841 Sep  9 06:25 /var/backups/passwd.bak`,
    sprache: 'sh',
  }),
  datei('backups', {
    id: 'shadow-bak',
    titel: 'shadow.bak',
    pfad: '/var/backups/shadow.bak',
    zweck: 'Die Kopie der Passwort-Hashes vor der letzten Änderung. Sie rettet den Zugang, wenn ein fehlgeschlagenes Skript /etc/shadow überschrieben hat — und sie ist aus demselben Grund ein lohnendes Ziel.',
    format: 'Identisch zu /etc/shadow: neun Felder je Zeile',
    rechte: '0600 root:root — enger als das Original, das die Gruppe shadow lesen darf',
    gelesenVon: 'Nur von Menschen im Notfall',
    betrieb: 'Erzeugt von /etc/cron.daily/passwd zusammen mit passwd.bak',
    punkte: [
      'Beim Zurückspielen unbedingt die Rechte prüfen: 0640 root:shadow',
      'pwck prüft passwd und shadow auf Stimmigkeit zueinander',
      'Ein lesbares shadow.bak ist gleichwertig zu einem lesbaren /etc/shadow',
    ],
    beispiel: `# Zurückspielen nach einem zerstörten /etc/shadow:
cp -a /var/backups/shadow.bak /etc/shadow
chown root:shadow /etc/shadow
chmod 0640 /etc/shadow
pwck -r`,
    sprache: 'sh',
    warnung:
      'Die Datei enthält dieselben Hashes wie /etc/shadow. Wer bei einer Prüfung nur die Rechte von /etc/shadow kontrolliert, übersieht die Kopie hier.',
  }),
  datei('backups', {
    id: 'group-bak',
    titel: 'group.bak',
    pfad: '/var/backups/group.bak',
    zweck: 'Die letzte Fassung von /etc/group. Da Gruppenmitgliedschaften über Rechte entscheiden — sudo, adm, docker —, ist die Differenz zum aktuellen Stand eine der aussagekräftigsten Prüfungen überhaupt.',
    format: 'Identisch zu /etc/group: Name, Passwort, GID, Mitgliederliste mit Komma getrennt',
    rechte: '0644 root:root',
    gelesenVon: 'Nur von Menschen im Notfall',
    betrieb: 'Erzeugt von /etc/cron.daily/passwd; gshadow.bak liegt daneben',
    punkte: [
      'Die Gruppe docker ist faktisch gleichbedeutend mit root-Rechten',
      'Ein neues Mitglied in sudo oder adm gehört erklärt, nicht hingenommen',
      'grpck prüft group und gshadow auf Stimmigkeit',
    ],
    beispiel: `$ diff /var/backups/group.bak /etc/group
< sudo:x:27:deploy
> sudo:x:27:deploy,monitor`,
    sprache: 'sh',
  }),
  datei('backups', {
    id: 'extended-states-0',
    titel: 'apt.extended_states.0',
    pfad: '/var/backups/apt.extended_states.0',
    zweck: 'Die Kopie der Merkliste, welche Pakete automatisch installiert wurden. Geht das Original verloren, hält apt autoremove entweder alles oder will zu viel entfernen — diese Datei stellt die Unterscheidung wieder her.',
    format: 'Identisch zu /var/lib/apt/extended_states: Absätze mit Package, Architecture, Auto-Installed',
    rechte: '0644 root:root',
    gelesenVon: 'Nur von Menschen im Notfall',
    betrieb: 'Erzeugt von /etc/cron.daily/apt-compat; ältere Stände als .1.gz und weiter',
    punkte: [
      'Vor jedem größeren autoremove lohnt der Blick auf die Differenz',
      'Zurückspielen heißt: Datei kopieren, apt braucht keinen Neustart',
      'Die Liste ist der einzige Ort, an dem „automatisch installiert" überhaupt steht',
    ],
    beispiel: `$ diff <(zcat -f /var/backups/apt.extended_states.0) \\
        /var/lib/apt/extended_states | head

< Package: libjq1
< Auto-Installed: 1`,
    sprache: 'sh',
  }),
]

/* ------------------------------------------------------------- Bündelung */

export const zustandKnoten: Knoten[] = [
  ...verzeichnisse,
  ...log,
  ...lib,
  ...spool,
  ...cache,
  ...backups,
]
