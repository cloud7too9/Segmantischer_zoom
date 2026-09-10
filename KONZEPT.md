# Wissensmatrix

Ein Zoomable User Interface mit semantischem Zoom für strukturiertes IT-Wissen. Ausgangspunkt und erstes Universum ist das Themengebiet Datenbanken.

**Status:** Umgesetzt — zwei Universen: Datenbanken und Linux-Server
**Typ:** Konzept-README (Idee, Modell und Regelwerk; Stand der Umsetzung siehe `README.md`)

---

## Die Idee

Wissen wird üblicherweise in zwei Formen abgelegt, und beide haben denselben Mangel: Sie zeigen entweder Überblick oder Detail, nie den Zusammenhang zwischen beidem. Ein Wiki hat eine Navigation links und Inhalt rechts — der Sprung zwischen Ebenen ist ein Seitenwechsel, der Kontext geht verloren. Ein Buch hat eine Reihenfolge, aber keine Übersicht.

Dieses Projekt geht anders vor: **Die Zoomstufe ist die Abstraktionsstufe.** Man beginnt weit oben mit den Themengebieten, zoomt in eines hinein, sieht dort die Arten, zoomt in eine Art, sieht die konkreten Vertreter, zoomt in einen Vertreter, sieht dessen Facetten — und ganz unten liegt die Regel, das Codebeispiel, das Anti-Pattern.

Entscheidend ist das Wort *semantisch*. Beim Hineinzoomen wird nichts größer, sondern anders. Jede Stufe zeigt eine andere Art von Information, nicht dieselbe in höherer Auflösung. Ein Knoten ist auf mittlerer Stufe ein Steckbrief und auf naher Stufe eine Sammlung von Facetten — dasselbe Objekt, andere Darstellung.

Der Gewinn daraus: Man weiß immer, wo man ist. Die Tiefe im Baum ist sichtbar, statt aus einer Breadcrumb-Zeile gelesen werden zu müssen. Und weil jede Datenbank dieselben sechs Facetten hat, ist die Struktur nach dem zweiten Knoten vorhersagbar.

### Zwei Zugänge, ein Datenbestand

Das System dient zwei Zwecken, die sich widersprechen. **Lernen** will einen Weg: Kontext, Reihenfolge, schrittweises Aufdecken. **Nachschlagen** will einen Sprung: Man weiß schon, was man sucht, und jeder Zwischenschritt ist Reibung.

Das wird nicht durch einen Kompromiss gelöst, sondern durch zwei Ansichten auf dasselbe Modell:

- **Der Zoom ist der Lernpfad.** Von oben nach unten, mit allem Kontext dazwischen.
- **Die globale Suche ist der Nachschlage-Zugang.** Sie springt direkt auf jede Koordinate und bündelt Treffer über alle Universen hinweg, gegliedert nach Gebiet und Facette.

Damit beides funktioniert, sind die Inhalte arbeitsteilig geschrieben: Obere Ebenen erklären (warum es das gibt, wann man es nimmt, wogegen es sich abgrenzt) — das liest man einmal. Die Blattebene ist reine Referenz ohne Prosa — die liest man zwanzigmal.

### Universen, Koordinaten, Overlays

Datenbanken sind der Anfang, nicht das Ganze. Später kommen weitere Themengebiete dazu — Netzwerke, Betriebssysteme, Sicherheit. Jedes ist ein **Universum** mit eigenem Facettenschema, das auf einem gemeinsamen Kern aufsetzt.

Damit die globale Suche gebietsübergreifend bündeln kann, ist das Modell **kein Baum, sondern ein Graph mit hierarchischer Sicht darauf.** Ein Knoten liegt nicht an einer Stelle, er *hat Koordinaten* — Universum, Facette, Tiefe. Der Zoombaum wird daraus berechnet. Das ist die Voraussetzung dafür, die Matrix später frei wählen zu können: Man bestimmt, welche Koordinate die Zoomachse bildet, ohne die Daten anzufassen.

Themen, die mehrere Universen berühren, werden nicht dupliziert, sondern nach dem **Kern-plus-Overlay-Prinzip** abgelegt:

```
knoten/tls
  kern                Was TLS ist, Handshake, Zertifikate, Versionen
  overlay/netzwerke   Protokollschicht, Cipher Suites, Terminierung
  overlay/datenbanken TLS in mongod.conf, Client-Zertifikate, Treiber
```

Der Kern wird immer gerendert, das Overlay des aktuellen Universums darunter. Eine Wahrheit, kein Abgleich zwischen Kopien — und in der globalen Suche erscheint TLS als *ein* Treffer mit mehreren Zuordnungen statt als drei konkurrierende Einträge.

---

## Regeln und Richtlinien

### Struktur

1. **Jede Zoomstufe muss die Informationsdichte erhöhen.** Eine Stufe, die zwei Kacheln freilegt, ist ein verschenkter Schritt. Wenn eine Ebene weniger zeigt als die darüber, gehört sie nicht in den Zoom.
2. **Fünf bis neun gleichrangige Elemente pro Ebene.** Genug für Substanz, wenig genug für einen Blick.
3. **Elemente einer Ebene müssen gleichrangig sein.** Gleiche Art, gleiche Granularität. Eine Dokumentgliederung ist keine Zoomebene.
4. **Beziehungen zwischen Geschwistern gehören eine Ebene höher, nie als Container darüber.** Ein Vergleich zweier Datenbanken ist keine Eigenschaft einer davon. Nistet man ihn ein, dupliziert sich derselbe Inhalt in jedem Knoten.
5. **Der Steckbrief ist der Knoten selbst, kein Kind.** Metadaten sind die Darstellung des Objekts auf mittlerer Zoomstufe. Als eigene Kachel wird aus dem Zoom eine Baumnavigation.
6. **Keine Negativdefinition als Strukturelement.** Eine Kategorie, die sich über ein Fehlen definiert („alles, was nicht X ist"), altert schlecht und trägt keine Navigation. Solche Unterscheidungen werden zu Farbe, Legende und Filter — nicht zur Ebene.
7. **Maximal drei bis vier Ebenen unter dem Universum.** Darüber hinaus kippt die Orientierung.

### Datenmodell

8. **Koordinaten liegen am Knoten, der Baum wird berechnet.** Position ist abgeleitet, nicht gespeichert. Das hält die Matrix frei wählbar.
9. **Innerhalb eines Universums gilt für alle Knoten dasselbe Facettenschema.** Das macht die Navigation vorhersagbar und erlaubt Vergleiche auf gleicher Zoomkoordinate.
10. **Das Facettenschema hängt am Universum, nicht im Renderer.** Der Renderer rendert „n Facetten laut Schema". Ein gemeinsamer Kern (Architektur, Sicherheit, Betrieb) trägt die gebietsübergreifende Bündelung, universumsspezifische Ergänzungen den Zuschnitt.
11. **Jeder Knoten hat genau ein Heimat-Universum.** Er darf in mehreren erscheinen, aber der Breadcrumb braucht eine eindeutige Antwort auf „wo bin ich".
12. **Overlays erweitern, sie widersprechen nie.** Müsste ein Overlay eine Kernaussage korrigieren, gehört die Aussage nicht in den Kern.
13. **Der Kern muss allein lesbar sein.** Test: Alle Overlays ausblenden — ergibt der Knoten noch Sinn? Wenn nicht, ist zu viel ins Overlay gerutscht.
14. **Kern und Overlay getrennt speichern und laden**, nicht in einer Datei mit Filterung beim Rendern.
15. **Geteilte Knoten sind im Format erkennbar**, nicht implizit an der Anwesenheit eines Overlay-Feldes. Sonst rutschen mit der Zeit alle Blätter in den geteilten Zustand, weil es bequem ist.

### Verhalten

16. **Der Zustand ist der Pfad.** Damit gibt es Deep Links, Zurück-Button und Breadcrumb ohne Zusatzarbeit.
17. **Ein Renderer für alle Ebenen.** Weil die Struktur uniform ist, gibt es keine ebenenspezifischen Ansichten — und keine Sonderbehandlung für das Wurzel-Universum.
18. **Der Übergang wartet nie auf Daten.** Erst rendern, dann animieren. Ein Ladezustand mitten in der Bewegung zerstört den Effekt.
19. **Hinein und heraus sind exakt invers.** Asymmetrie fällt sofort unangenehm auf.
20. **Nur `transform` und `opacity` animieren**, 250–300 ms, `ease-out`. Bei `prefers-reduced-motion` reiner Crossfade.
21. **Obere Ebenen erklären, die Blattebene referenziert.** Vermischt man beides, funktioniert weder Lernen noch Nachschlagen.

### Vorbereitung ohne Vorbau

22. **Vier Vorkehrungen für einen späteren kontinuierlichen Übergang** — jetzt billig, später teuer: Transform über eine CSS-Variable statt über Klassenwechsel fahren; Kachelgeometrie deklarativ im Modell statt gemessen; Ebenen-Renderer zustandsfrei halten (zwei gleichzeitig gemountete Ebenen müssen möglich sein); Laden vom Mounten trennen, damit Prefetch möglich ist.
23. **Ein zweites Universum ist der eigentliche Test.** Ob der Facettenkern trägt, zeigt sich nie an einem einzelnen Gebiet. Erst das zweite bringt den ersten echten Kern-plus-Overlay-Fall.

---

## Das zweite Universum: Linux-Server

Regel Nr. 23 sagt, dass sich der Facettenkern erst am zweiten Gebiet zeigt.
Das ist eingelöst: Neben den Datenbanken steht das Universum Linux-Server —
und es ist absichtlich so weit vom ersten entfernt wie möglich, weil ein
zweites Datenbankgebiet nichts bewiesen hätte.

Vier Ebenen, drei Achsen unter dem Universum:

```
Ebene 1   Universum       Linux-Server
Ebene 2   cluster         die Wurzelverzeichnisse, nach Zweck gebündelt
Ebene 3   verzeichnis     ein Unterverzeichnis daraus
Ebene 4   datei           das Informationsblatt: Zweck, Format, Beispiel
```

Drei Entscheidungen fielen dabei an, alle drei aus dem Regelwerk:

**Cluster statt Wurzelverzeichnisse.** Der FHS kennt achtzehn davon, Regel
Nr. 2 erlaubt neun. Sie werden deshalb nach Zweck gebündelt — /bin, /sbin
und /lib liegen bei /usr, weil sie dorthin zeigen; /proc bei /sys, weil
beides Sichten des Kernels sind. Die Bündelung ist vollständig und
überschneidungsfrei, sonst wäre sie eine Auswahl und keine Ordnung.

**Dauerhaft und flüchtig werden Farbe, nicht Ebene.** Ob ein Pfad den
Neustart überlebt, ist die wichtigste Eigenschaft im Betrieb — und trotzdem
keine Zoomstufe (Regel Nr. 6). Man navigiert nicht danach, man erkennt sie.
Die Unterscheidung ist zudem positiv formuliert, nicht als „alles, was
nicht dauerhaft ist".

**Das Facettenschema wird zur Rubrik.** Im Universum Datenbanken sind die
Facetten eine eigene Zoomebene. Hier sind sie es nicht — sie sind die feste
Gliederung jedes Informationsblatts: Zweck, Format, Beispielinhalt,
Einordnung, Sicherheit, Betrieb. Das war der eigentliche Test von Regel
Nr. 10: Das Schema hängt am Universum, und was der Renderer daraus macht,
darf sich unterscheiden, solange es je Universum gleich bleibt. Die drei
Facetten mit `imKern` tragen dieselben Kennungen wie im ersten Universum —
das ist die Naht, an der die globale Suche später bündeln wird.

Was der zweite Anlauf am Kern verändert hat, ist wenig: eine Knotenart
`blatt` für die Referenzebene und ein Feld `erstbesuchGruppe` am Universum,
damit die Vorbelegung des Filters nicht im Renderer steht. Der
Ebenen-Renderer selbst blieb unberührt.

---

## Bewusste Nicht-Ziele

- **Kontinuierlicher Zoom über alle Ebenen.** Datenbanken haben keine natürliche räumliche Ordnung; das räumliche Gedächtnis, das Kontinuität einbringt, zahlt sich hier nicht aus. Ein kontinuierlicher Übergang zwischen zwei benachbarten Ebenen bleibt als spätere Option offen (siehe Regel 22).
- **Ein umschaltbarer Übergangsmodus als Nutzeroption.** Zwei Codepfade, doppelte Fehlerklassen, und niemand stellt so etwas um. Der diskrete Pfad bleibt ohnehin bestehen, weil er für `prefers-reduced-motion` gebraucht wird.
- **Frei wählbare Matrix zur Laufzeit.** Die anspruchsvollste Anforderung und die mit den wenigsten Vorbildern. Wird nicht mitgebaut — nur nicht verbaut. Liegen die Koordinaten am Knoten, ist sie später ein neuer Ableiter über bestehende Daten statt einer Migration.
- **Ein zweites Verweissystem neben den Overlays.** Overlays *sind* der Mechanismus für Verbindungen zwischen Universen.

---

## Ausblick

1. Facetten-Aufteilung für die verbleibenden fünf Facetten unter der Datenbank-Ebene festlegen
2. Datenmodell (Koordinaten, Kern/Overlay-Format) definieren
3. Ebenen-Renderer und Routing
4. Übergangsanimation
5. Farbcodierung und Filter auf der Typenebene
6. Suchindex und Palette
7. ~~Zweites Universum als Belastungstest des Facettenkerns~~ — umgesetzt,
   siehe oben

## Voraussetzungen, Installation, Build, Nutzung, Abhängigkeiten

keine — noch kein Code.

## Lizenz

offen
