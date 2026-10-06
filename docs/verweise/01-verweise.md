# Verweise im semantischen Zoom

Stand: 06.10.2026 · rekonstruiert aus einem verlorenen Gespräch

## Kontext

Das ZUI nutzt **diskreten Zoom**, also einen Ebenenwechsel mit Übergang statt eines stufenlosen Zooms. Datenbanken sind das erste Themengebiet. Später soll das ZUI Teil eines größeren Systems mit mehreren Themengebieten („Universen“) werden.

## Zwei Arten von Verweisen

| Art | Ziel | Wirkung |
|---|---|---|
| **Themengebiet** | ein anderes Themengebiet | Themen- bzw. Kontextwechsel |
| **Begriff** | ein Eintrag im Wörterbuch | zeigt die Definition, **kein** Kontextwechsel |

## Gemeinsames Animationsmuster

Beide Arten laufen über **dieselbe Animation: den Zoom hinein**. Für den Nutzer fühlt sich jeder Verweis gleich an. Der Unterschied liegt nur darin, was nach dem Zoom angezeigt wird.

## Technisch: im Kern beides Verweise

Beide Arten sind Verweise und nutzen denselben Mechanismus. Sie unterscheiden sich nur im Ziel.

**Vorschlag (noch nicht festgelegt):** ein einziger Verweis-Typ mit einem Attribut für die Art.

```ts
type VerweisArt = "themengebiet" | "begriff";

interface Verweis {
  art: VerweisArt;
  zielId: string; // ID des Themengebiets bzw. des Wörterbucheintrags
}
```

- Die Animation ist für beide Arten identisch.
- Was nach dem Zoom gerendert wird, hängt von `art` ab.

Verweise werden **nicht von Hand im Text gesetzt**, sondern automatisch erkannt. Siehe `02-erkennungslogik.md`.
