Ein Stolperstein für alle, die buddhistische Texte studieren, ist es, wie man sich darin zurechtfinden soll. Wie kommt man zu dem Sutta, zu dem man will? Das Problem entsteht zum Teil dadurch, dass es einfach so viele Texte sind, und zum Teil, weil es von jedem Text verschiedene Ausgaben gibt. Auf SuttaCentral verschärft sich das Problem noch, da wir Texte aus vielen verschiedenen kanonischen Quellen einbeziehen, die nie zuvor in einer kombinierten Ausgabe vorgelegt wurden.

Wir versuchen, den einfachsten, logischsten und einheitlichsten Ansatz für unser primäres Nummerierungssystem zu benutzen. Das erfüllt den Zweck für die meisten Menschen, und wir empfehlen das auch, wenn jemand unsere Texte weiterleiten oder zitieren will. Manche Studierende werden aber Verweise in anderen Quellen nachschlagen wollen, daher geben wir zusätzliche Referenzen an, um es ihnen zu erleichtern.

Hier sind die allgemeinen Prinzipien, an denen wir uns orientieren:

* Die weiter akzeptierten Nummerierungssysteme werden vorgezogen.
* Semantische Nummerierung, die einer sinnvollen Strukturierung des Inhalts folgt (Kapitel/Abschnitt), wird vorgezogen vor Strukturen gedruckter Ausgaben (Band/Seite).
* Alte Nummerierungssysteme werden durch mehr Detailgenauigkeit aufgewertet, ohne sie inkompatibel zu machen.
* Wo es sinnvoll ist, werden verschiedene Referenzsysteme bereitgestellt.
* Das primäre Nummerierungssystem wird für die URLs verwendet, die einfach, stabil und sinnvoll sind.

## Segmentierte Texte

Wir führen Texte auf der Basis von Segmenten ein. Das heißt, dass der Quelltext in kurze Stücke unterteilt ist — typischerweise ein Satz oder so —, die mit einer Kennziffer versehen sind. Spätere Übersetzungen werden Segment für Segment mit dem Original gepaart; dabei muss die Beziehung zwischen Text und Übersetzung für ein bestimmtes Segment nicht ganz exakt sein.

Diese segmentierten Texte werden zuerst für Bhikkhu Sujatos neue englische Übersetzungen der vier Nikāyas eingeführt sowie für Bhikkhu Brahmalis Vinaya-Übersetzung. Sie werden nach und nach auf andere Texte ausgeweitet. Diese sind als Grundlage für eine neue Generation von Übersetzungen gedacht, die entstehen soll. Man beachte, dass es nicht leicht ist, eine alte Übersetzung im Nachhinein mit den neuen Segmenten zu paaren; es muss alles Segment für Segment von Hand gemacht werden. Daher werden wir auf absehbare Zeit auch unsegmentierte Texte behalten.

Die segmentierten Texte tragen zu den bestehenden Referenzsystemen zusätzliche Detailgenauigkeit bei. Schauen wir uns das anhand eines Beispiels aus DN 1 Brahmajala an. Dieser Text hat die Abschnittsnummerierung von der Ausgabe der Pali Text Society übernommen. Es handelt sich hier um den zehnten Abschnitt, der dn1.10 benannt ist. Er wird nun in vier Segmente unterteilt, die dn1.10.1, dn1.10.2 usw. benannt sind. Die gleichen Segmentnummern gelten sowohl für den Palitext als auch für die Übesetzung. In der zugrundeliegenden Datei, die den Dateityp PO des Open Source-gettext-Übersetzungssystems verwendet, sieht das so aus:

```
#msgctxt "dn1:10.1"
msgid "‘Bījagāmabhūtagāmasamārambhā paṭivirato samaṇo gotamo’ti—"
msgstr "‘The ascetic Gotama refrains from injuring plants and seeds.’"

#msgctxt "dn1:10.2"
msgid "iti vā hi, bhikkhave … pe …."
msgstr ""

#msgctxt "dn1:10.3" #. VAR: virato → vikālabhojanā paṭivirato (pts1) | paṭivirato (katthaci)
msgid "‘Ekabhattiko samaṇo gotamo rattūparato virato vikālabhojanā …."
msgstr "‘He eats in one part of the day, abstaining from eating at night and food at the wrong time.’"

#msgctxt "dn1:10.4"
msgid "Naccagītavāditavisūkadassanā paṭivirato samaṇo gotamo …."
msgstr "‘He refrains from dancing, singing, music, and seeing shows.’"
```

Ein Verweis auf DN 1.10 würde diese ganze Passage bezeichnen, wie in älteren Ausgaben. Aber wir fügen die Möglichkeit hinzu, auf kleinere Segmente zu verweisen. Man beachte, dass sich in dn1:10.3 eine abweichende Lesart findet. So können die Segmentnummern als geeignete allgemeine Adresse für Abweichungen, Kommentare und Ähnliches dienen, das dann alles leicht zwischen Text und Übersetzung jeder Sprache übertragbar ist.

## Pali

In den meisten Fällen ist die Nummerierung der Pali-Suttas einfach und über verschiedenen Ausgaben hinweg einheitlich. „DN 2“ ist immer die zweite Lehrrede des Dīgha Nikāya, d. h. das Sāmaññaphala-Sutta. Aber es gibt ein paar Grenzfälle, wo Unterschiede vorkommen. Das hängt oft damit zusammen, dass es in den kürzeren Suttas viele Abkürzungen und Wiederholungen gibt, so dass nicht immer klar ist, wie die Texte genau zu zählen sind.

Im Allgemeinen folgen wir der Nummerierung, wie sie in unserer Paliausgabe zu finden ist, dem Mahāsaṅgīti-Text des Sechsten Konzils, der von der *Dhamma Society* angefertigt wurde. Das ist eine revidierte und korrigierte Version der digitalen Ausgabe des Sechsten Konzils, die vom *Vipassana Research Institute* angefertigt wurde, und folgt dem gleichen Nummerierungssystem. In den meisten Fällen stimmt es mit der Nummerierung überein, die in den Ausgaben der *Pali Text Society* (PTS) benutzt wird. Allerdings kann in den weniger gebräuchlichen Texten wie dem Abhidhamma die Nummerierung von der der PTS abweichen. Zusätzlich sind im Bereich der Hauptnikāyas die folgenden Punkte zu beachten:

### Zwei Ebenen, keine drei, für AN 1 und AN 2

In den ersten beiden Nipātas des AN unterscheidet die PTS-Nummerierung drei Ordnungsebenen (*Nipāta*, *Vagga*, *Sutta*). Wir folgen in diesen Fällen der weit akzeptierten Praxis, die zweite Ebene wegzulassen. Das führt zu einem einfachen mechanischen Prinzip, wie in den folgenden Beispielen illustriert:

* AN 1.1.6 wird zu AN 1.6
* AN 1.8.1 wird zu AN 1.71
* AN 2.2.9 wird zu AN 2.19

Dennoch behalten wir auch die Drei-Ebenen-PTS-Nummern zu Referenzzwecken bei.

### Zwei Ausgaben für SN Band 1

Für den ersten Band des SN, den Sagātha-Vagga, gibt es für jedes Sutta zwei Sätze von Nummern für Band/Seite. Der Grund ist, dass dieser Text ursprünglich 1884 von Feer herausgegeben wurde und 1998 in einer neuen Ausgabe von Somaratne.

### Die Bodhi-Nummerierung für SN und AN

Im SN und AN folgen wir durchgängig der Suttanummerierung, die in Bhikkhu Bodhis englischen Übersetzungen übernommen wurde und die in manchen Abschnitten von der PTS-Nummerierung abweicht. Sie ist ein rationaleres System, das sich hauptsächlich auf das stützt, was man in Ausgaben in lokalen Schriften und in der Chaṭṭha Saṅgāyana-Ausgabe findet. Auch hier werden da, wo sie verschieden sind, beide Nummern gezeigt. Die folgenden Abschnitte sind davon betroffen:

* SN: von SN 22.150 [SN 22.149] bis zum Ende des *Saṁyutta*
* von SN 35.136 [SN 35.135] bis zum Ende des *Saṁyutta*
* von SN 36.26 [SN 36.25] bis zum Ende des *Saṁyutta*
* AN: von AN 1.98 [AN 1.10.1] bis zum Ende des *Nipāta*
* von AN 2.23 [AN 2.3.3 + 2.3.4] bis zum Ende des *Nipāta*
* von AN 3.34 [AN 3.33] bis zum Ende des *Nipāta*
* von AN 4.227 [AN 4.226] bis zum Ende des *Nipāta*
* von AN 7.19 [AN 7.17] bis zum Ende des *Nipāta*
* von AN 10.211 [AN 10.200] bis zum Ende des *Nipāta*
* von AN 11.8 [AN 11.9] bis zum Ende des *Nipāta*

Zum Beispiel ist in der PTS-Ausgabe das Sutta mit dem Titel „Etaṁ mama“ im Khandha-Saṁyutta als SN 22.150 nummeriert; und in Bhikkhu Bodhis englischer Übersetzung (wie auch in mehreren Palitext-Ausgaben in lokalen Schriften) ist dieses Sutta stattdessen als SN 22.151 nummeriert. In den meisten Fällen gibt es keine solchen Mehrdeutigkeiten und daher keine alternativen Nummern.

### Mehrere Sätze von Versnummern

Versnummern für Texte wie den Dhammapada, das Sutta Nipāta, die Thera- und Therīgāthā weichen leicht von der PTS-Ausgabe ab. Das hängt manchmal mit unterschiedlichen Entscheidungen der Herausgeber zusammen, wie Verse unterteilt werden sollen, und manchmal mit unterschiedlicher Handhabung von Abkürzungen. Wir schließen zu Referenzzwecken die PTS-Nummern ein.

Man beachte auch, dass für das Sutta Nipāta Verweise entweder durch fortlaufende Zählung der Verse vom Anfang der Sammlung an erfolgen können oder mit Kapitel- und Suttanummer, und Zählung der Verse pro Sutta.

### Nummerierung von Abschnitten

Unsere Texte übernehmen das System zur Nummerierung der Abschnitte, das zuerst von der Paliausgabe der PTS für den DN und von Bhikkhu Ñāṇamoḷi für den MN eingeführt und von Bhikkhu Bodhi übernommen wurde. Für den Vinaya übernehmen wir ebenfalls die Nummerierung der Abschnitte von der PTS-Ausgabe.

Für andere Texte verwenden die PTS-Ausgaben im Allgemeinen kein System für Abschnitte. Hier nummerieren wir nach Absätzen. Damit übernehmen wir das System, das in der Mahāsaṅgīti-Ausgabe benutzt wird, obwohl wir es einfacher ausführen.

## Chinesisch

Heute stützen sich Verweise für chinesische Texte fast immer auf die Taishō-Ausgabe. Das ist insofern zweckmäßig, als es einen einheitlichen Ansatz ermöglicht und mit dem Gebrauch von Zeilennummern auch eine feinkörnigere Bezugnahme erlaubt. Der Nachteil ist, dass es an eine bestimmte gedruckte Ausgabe gebunden ist. Zeilenbezüge haben keine Beziehung zu der semantischen Struktur des Textes. Zusätzlich haben Referenzen zu Taishō-Texten typischerweise Dopplungen, da sie sowohl Band/Seite als auch Sūtra-Nummer angeben. Das kann in einer gedruckten Ausgabe hilfreich sein, aber in einem digitalen Text macht es die Handhabung schwerfällig. Darüber hinaus stützt sich der Taishō stark auf den *Juan*, das „Blatt“, um Texte zu strukturieren, was ebenfalls eine Übereinkunft aus dem Druck ist.

Unsere chinesischen Texte sind angepasste Texte von CBETA, einer digitalen Ausgabe des Taishō-Kanon. Wir übernehmen das klassische Taishō-System, und es ist in vollem Umfang verfügbar. Allerdings organisieren wir die Texte für unsere primäre Nummerierung nach der semantischen Struktur, so dass sie mit ihren Parallelen auf Pali und in anderen Sprachen abgestimmt werden können. Hier ist eine Übersicht über die wichtigsten Texte:

* Für die Hauptāgamas geben wir die Sūtranummern mit den Āgamas an. So ist DA 1 das erste Sūtra im Dīrghāgama, das ist Band eins, Sūtra eins des Taishō.
* Für Texte außerhalb der Āgamas wie etwa „unabhängige“ Sūtras geben wir die Taishō-Sūtranummer an.
* Den Vinayatexten weisen wir jeweils eine Kennziffer zu, die die Schule, die Abteilung und die Sprache bezeichnet. So ist lzh-mg-bu-vb-pj1 „der chinesische Text des Mahāsaṅghika Bhikkhu Vibhaṅga, erste *Pārājika*-Regel“.

## Tibetisch

Für Tibetisch benutzen wir die Nummerierung der Derge-Ausgabe und stützen uns auf die Online-Ausgaben. Allerdings wenden wir, wie beim Chinesischen, semantische Unterteilungen an, wo das sinnvoll ist, ganz besonders im Upāyika. Dort folgen wir der Sūtra-Nummerierung.

## Sanskrit und Sonstige

Die anderen Texte auf der Webseite stammen von einer Vielzahl verschiedener Quellen und stellen keinen zusammenhängenden Kanon dar. Daher gibt es kein einfaches Nummerierungssystem, das durchgängig zuträfe. Hier beziehen wir uns auf Texte mittels unseres eigenen willkürlich gewählten Systems.