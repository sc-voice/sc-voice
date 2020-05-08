1. [Hintergrund](/sc-voice/de/Methodik-und-Quellen#Hintergrund)
1. [Suttaparallelen](/sc-voice/de/Methodik-und-Quellen#Suttaparallelen)
1. [Vinayaparallelen](/sc-voice/de/Methodik-und-Quellen#Vinayaparallelen)
1. [Textquellen](/sc-voice/de/Methodik-und-Quellen#Textquellen)
1. [Markup](/sc-voice/de/Methodik-und-Quellen#Markup)
1. [Bibliografie](/sc-voice/de/Methodik-und-Quellen#Bibliografie)

## Hintergrund

Seit dem 19. Jahrhundert haben Wissenschaftler erkannt, dass viele buddhistische Texte, die man im Palikanon findet, Gegenstücke oder Parallelen in den chinesischen und anderen Sammlungen haben. Die erste Dokumentation dieser Parallelen wurde von Nanjio Bunyiu (Nanjō Bun’yū, 南條文雄) in seinem Werk *A Catalogue of the Chinese Translation of the Buddhist Tripiṭaka* von 1883 publiziert. Nanjio führte 24 Dīgha Nikāya-Lehrreden als Parallelen zum chinesischen Dīrghāgama auf. Diese keimhaften Tabellen stellen einen wichtigen ersten Schritt dar, zeigen sie doch, dass der Vergleich der chinesischen *Āgamas* mit den Pali-*Nikāyas* ein fruchtbares Unterfangen sein kann. Ein Jahr später beschrieb Samuel Beal Ähnlichkeiten zwischen verschiedenen buddhistischen Texten auf Pali und Chinesisch und bemerkte:

>„Es ist offensichtlich, sowohl von ihren Übereinstimmungen als auch von den feinen Unterschieden her, die durchgängig vorkommen, dass diese Lehrreden von einer gemeinsamen Quelle herstammen; nicht dem Original, aber von Versionen, die vom Original stammen. Von einer dieser Versionen wurde die chinesische Übersetzung gemacht.“ (*„Buddhism in China“*, S. 25.)

1908 veröffentlichte Masaharu Anesaki *The Four Buddhist Āgamas in Chinese: A Concordance of their Parts and the Corresponding Counterparts in the Pāli Nikāyas*, dem 1929 Chizen Akanumas *The Comparative Catalogue of Chinese Āgamas & Pāli Nikāyas* folgte. Letzteres wurde zum Standard-Referenzwerk in dem Fachgebiet und wurde in den folgenden Jahrzehnten von einer Reihe meist japanischer und taiwanesischer Wissenschaftler korrigiert und verbessert. In den 1990er Jahren unternahm es Rod Bucknell, die neuesten Versionen dieser Parallelentabellen zu digitalisieren. Zusätzlich arbeitete er mit dem Ehrwürdigen Anālayo daran, den Umfang weiter zu verbessern und zu erweitern. Diese Tabellen wurden zur Grundlage für die Parallelen zu den vier Haupt-*Nikāyas/Āgamas* auf SuttaCentral.

2014 erstellte Bhikkhu Sujato einen Parallelensatz für den Vinaya, der zu SuttaCentral hinzugefügt wurde, und 2016 fügte Ayya Vimala Versparallelen zu den Dhammapadas hinzu.

Die Daten zu den Parallelen werden in einer einzigen Datei verwaltet, [parallels.json](https://github.com/suttacentral/sc-data/blob/master/relationship/parallels.json), die sich im [GitHub-Depot von SuttaCentral](https://github.com/suttacentral) befindet.

Neben den Parallelen beherbergt SuttaCentral Originaltexte und Übersetzungen, sofern verfügbar. Eine kurze Notiz zu den Quellen dieser Texte findet sich weiter unten.

## Suttaparallelen

*Rod Bucknell, aktualisiert von Sujato*

### Arten von Parallelen

Ursprünglich folgte man der einfachen Klassifikation, wie sie in Akanuma (1929) eingeführt worden war; damit gab es in den Daten auf SuttaCentral zwei Arten von Parallelen:

* **Vollständige Parallele:** Vollständige Parallelen unterscheiden sich im Inhalt zu einem gewissen Grad, aber sie sind so ähnlich, dass sie mit hoher Wahrscheinlichkeit von einem gemeinsamen Vorläufer abstammen.
* **Teilparallele:** Teilparallelen zeigen eine merklich unvollständige Übereinstimmung. Gewöhnlich hat eine *Teilparallele* lediglich einen verhältnismäßig kleinen *Teil* mit der anderen Lehrrede gemeinsam, eine Situation, die durch mancherlei verschiedene historische Entwicklungen zustande gekommen sein kann.

Zwischen einer vollständigen Parallele und einer Teilparallele zu unterscheiden ist mit einem gewissen Maß an Subjektivität verbunden. Daher sollte es eher als eine hilfreiche Anleitung verstanden werden denn als ein endgültiges Urteil über die Beziehung zwischen den beiden Texten.

Manuskriptfragmente auf Sanskrit oder in anderen Sprachen sind keine „Teilparallelen“ in diesem Sinn. Sie werden stattdessen als Fragmente bezeichnet.

Für das Upgrade von SuttaCentral im Jahr 2018 haben wir dieses Modell mit einer Reihe von Verfeinerungen und Verbesserungen ausgestattet. Jetzt zeigen wir folgende Arten von Beziehungen:

* **Vollständige Parallele:** Wie vorher, mit der Ergänzung, dass eine vollständige Parallele nicht nur auf ganze Suttas zutreffen kann, sondern auf alles, was auf SuttaCentral mit einer Kennziffer (ID) versehen ist. So kann ein „Abschnitt“ eines Textes oder aber eine „Reihe“ von mehreren Texten als eine vollständige Parallele betrachtet werden. Nehmen wir den Fall des Dhammacakkappavattana-Sutta. Unter den zahlreichen Parallelen finden wir eine Paliversion im ersten Vinaya-Khandhaka. Dort macht es nur einen kleinen Abschnitt des gesamten Textes aus, aber es ist klar eine vollständige Parallele zu dem Text in SN 56.11. Da wir den Inhalt dieses Abschnittes vollständig mit Kennziffern definieren können, gilt das als eine vollständige Parallele.
* **Ähnliche Parallele:** Diese Kategorie umfasst Texte, die einander „ähneln“, bei denen jedoch die parallelen Abschnitte nicht weiter präzisiert sind. Standardmäßig sind die alten „Teil“-parallelen hier enthalten, sofern die parallelen Abschnitte nicht vollständig mit Kennziffern versehen sind; in diesem Fall gelten sie als „vollständig“. Ein gutes Beispiel für ein Paar von „ähnlichen“ Parallelen sind MN 10 Satipaṭṭhāna und MN 119 Kāyagatāsati. Diese Suttas haben Vieles gemeinsam, insbesondere eine erweiterte Auflistung von Meditationsthemen, die nirgendwo sonst vorkommt. Zugleich haben sie auch viele systematische Unterschiede, und es ist nicht möglich oder praktisch durchführbar, vollständig zu bestimmen, welche Teile beiden gemeinsam sind. Daher ist das Beste, was wir sagen können, dass diese Texte sich „ähneln“; und wenn man einen davon studiert, wird man vielleicht auch den anderen studieren wollen.
* **Nennung:** Diese Kategorie deckt Fälle ab, in denen eine Passage eine andere „nennt“. In solchen Fällen schließt die „Nennung“ den eigentlichen Text nicht ein und kann somit nicht als Parallele betrachtet werden. Dennoch stellt sie einen bedeutsamen Bezugspunkt zwischen den Texten dar. Ein Beispiel wäre SN 41.3, das sich auf die „zweiundsechzig“ Ansichten bezieht, die im Brahmajāla-Sutta (DN 1) zu finden sind.
* **Nacherzählung:** Das bezieht sich auf Fälle, in denen die gleichen oder ähnliche Ereignisse an mehr als einer Stelle im Kanon „nacherzählt“ werden. Die Geschichte von Baka dem Brahmā ist ein gutes Beispiel. Sie kommt in SN 6.4 und MN 49 vor. Die beiden Texte sind sehr verschieden und gelten nicht als Parallelen. Dennoch scheint es, dass es sich in gewisser Weise um die gleiche oder eine nahe verwandte Geschichte handelt, so dass man eine Verbindung erkennen kann. Diese Art von Verbindung wird auch für die „Nacherzählung“ der Lebensgeschichten von Mönchen und Nonnen in den Gāthās und Apadānas benutzt.

Die „Nennungen“ und „Nacherzählungen“ sind zumeist von den Metadaten zu den Querverweisen hergeleitet, die im Mahāsaṅgīti-Text enthalten sind, geordnet und zu SuttaCentral hinzugefügt von Ayya Vimala.

### Implizite Parallelen

Von Lehrreden, die vollständige Parallelen zu einer bestimmten Pali-Lehrrede sind, kann zuverlässig angenommen werden, dass sie auch untereinander vollständige Parallelen sind. Zum Beispiel wurde für DN 22 gezeigt, dass es vollständige Parallelen in MN 10, MA 98 und EA 12.1 hat; daraus kann man zuverlässig folgern, dass MA 98 eine vollständige Parallele zu MN 10 und EA 12.1 ist.

Hingegen kann man solche Schlussfolgerungen nicht für Lehrreden ziehen, die als Teilparallelen zu einer bestimmten Pali-Lehrrede aufgeführt sind. Zum Beispiel wurde für DN 22 gezeigt, dass es Teilparallelen in MN 141, MA 31 und T 32 hat. Daraus kann man nicht auf irgendeine Entsprechung zwischen MA 31 und T 32 schließen (tatsächlich sind die beiden vollständige Parallelen), oder zwischen MA 31 und EA 12.1 (die tatsächlich keine Verwandtschaft aufweisen).

## Vinayaparallelen

*Bhikkhu Sujato*

Hier wird die Methode kurz dargestellt, mit der die Entsprechungen zwischen den Vinayatexten zusammengestellt wurden.

Meine ursprüngliche Quelle war Nishimotos Papier über den Vergleich von Pātimokkha-Regeln von 1928. Ich spreche zwar kein Japanisch, konnte aber mit seinen Tabellen etwas anfangen, die mir freundlicherweise von Shayne Clarke zur Verfügung gestellt wurden. Ich verglich diese mit Pachows *Comparative Study of the Pratimoksa* von 1955, das offenbar ohne Kenntnis von Nishimotos früherem Werk erstellt worden war. Diese beiden Arbeiten ermöglichen dadurch eine gute wechselseitige Überprüfung. Für die Regeln der Nonnen war die Hauptquelle Waldschmidts *Bruchstücke des Bhikṣuṇī-Prātimokṣa der Sarvāstivādins* von 1928. Dieses enthält Tabellen von Pātimokkha-Konkordanzen für Pali, die fünf wichtigsten chinesischen Vinayas, die tibetische Version, eine Sarvāstivada-Version auf Sanskrit und den Mahāvyutpatti. Zusätzlich wurden eine Reihe speziellerer Studien herangezogen.

Die meisten dieser Werke gehen davon aus, dass die Vinayaregeln einer Schule im Vibhaṅga und im Pātimokkha die gleichen sind, außer da, wo viele einzelne Texte vorliegen wie beim Sarvāstivāda. Ich fand jedoch bei meinem Vorgehen, dass der Vibhaṅga und der Pātimokkha, besonders bei den chinesischen Vinayas, in manchen Fällen kleine Abweichungen in der Nummerierung hatten. Daher beschloss ich, jeden einzelnen Text als eine separate Einheit zu betrachten, obwohl in manchen Fällen, namentlich im Pali, die Nummerierung der Regeln identisch ist.

Deswegen und wegen anderer kleinerer Differenzen ergab jede Quelle, die ich herangezogen habe, eine etwas andere Nummerierung für die Regeln. Fast alle dieser Variationen betreffen die *Sekhiya*-Regeln, wohingegen die restlichen Vinayaregeln fast völlig unproblematisch sind. Tatsächlich habe ich mehr Zeit mit den *Sekhiya*-Regeln zugebracht als mit dem ganzen restlichen Vinaya, und die Aufgabe brachte mich wiederholt an den Rand der Verzweiflung. Die Regeln sind kurz und stehen in keinem Kontext, und sie benutzen unklare Begriffe mit unterschiedlichen Schreibweisen in den verschiedenen Texten. Meine Suche in Sanskrit-Wörterbüchern führte oft zu der Entdeckung, dass dies die einzige Stelle ist, wo das Wort vorkommt, und dass seine Bedeutung und Herkunft unbekannt sind. Ohne Zweifel hatten die chinesischen Übersetzer mit ähnlichen Schwierigkeiten zu kämpfen. In Extremfällen kann eine Regel mit einem einzigen chinesischen Schriftzeichen dargestellt sein. Es schien mir, dass das Unterfangen an die Grenzen dessen rührte, was mit Parallelen möglich ist. Das Einzige, das mich aufrecht hielt, war der Gedanke, dass meine Vorgänger es für wert gehalten hatten und bereits so weit gekommen waren. Dennoch bin ich mir bei weitem nicht sicher, dass diese Regeln richtig zugeordnet sind. Behandeln Sie also bitte die Entsprechungen der *Sekhiya*-Regeln mit Vorsicht!

In Fällen, in denen sich meine Quellen unterschieden, zog ich die chinesischen und Sanskrit-Originaltexte zu Rate; dabei benutzte ich die Texte, wie sie auf SuttaCentral publiziert sind. In diese Entscheidungen fließt offenkundig ein gewisses Maß an Subjektivität ein, und im Ganzen war ich tendenziell wahrscheinlich mit dem Zuschreiben von Entsprechungen ein wenig großzügiger als Nishimoto oder Pachow. Das kam hauptsächlich dadurch, dass ich eine größere Bandbreite an Quellen benutzte, besonders aus dem Sanskrit, und manchmal zeigen sich Ähnlichkeiten, die bloß aus den chinesischen Texten nicht ersichtlich sind. Gleichwohl, wie bereits gesagt, fast alle diese Grenzfälle betreffen die *Sekhiyas*.

Bei der großen Zahl paralleler Regeln in verschiedenen Texten musste ich einen Weg finden, wie ich jedem Fall jeder Regel eine einmalige Kennziffer (ID) zuweisen konnte. Diese Kennziffern werden nicht nur benutzt, um jede Regel zu benennen, sie bilden auch die URLs, die die Webseite für diese Regel kennzeichnen. Diese IDs sind Abkürzungen, die einer Reihe von Bedingungen unterliegen: Sie müssen auf SuttaCentral einzig sein, müssen unabhängig von Großbuchstaben sein und dürfen keine Sonderzeichen enthalten. Die Methode mag zunächst ein wenig mysteriös erscheinen, aber wenn man sich erst einmal ein paar Abkürzungen gemerkt hat, ist alles wirklich recht einfach. Pli Tv Bu Pm Pj 1 ist „Pali Theravāda Bhikkhu Pātimokkha Pārājika 1“; Lzh Sv Bi Vb Ss 3 ist „Chinesisch Sarvāstivāda Bhikkhunī Vibhaṅga Saṅghādisesa 3“, und so weiter.

Ich versuche, durchgängig Palinamen für die Überschriften, Namen der Regeln usw. zu verwenden. Dabei geht es darum, die Einheitlichkeit zu wahren, nicht um einen Glauben, dass Pali die ursprüngliche Sprache dieser Texte war. Im Gegenteil, jeder Text oder jede Schule wird einen etwas anderen Dialekt benutzt haben. Manchmal finden wir abweichende Schreibweisen selbst innerhalb eines Textes. Mehr noch, in vielen Texten ist es schwierig, zu ermitteln, wie der traditionelle Titel der Regel lautete, oder ob es überhaupt einen gab, da solche Informationen gewöhnlich lediglich aus den Zusammenfassungen oder *Uddānas* hergeleitet sind. In Fällen, in denen es keinen Palititel gibt, füge ich wenn möglich einen Sanskrittitel zu. Diese stehen nicht für einen bestimmten Sanskrittext, sondern werden einfach danach ausgewählt, was am klarsten erscheint. Sehr selten füge ich einer Regel, die auf Pali nicht existiert, einen Titel in Paliform zu; und zwar in solchen Fällen, in denen eine Regel mit einer beinahe identischen Regel gepaart ist, die im Pali vorhanden ist. Wo es weder Pali noch Sanskrit gibt, habe ich einen englischen Titel zugeteilt. In allen Fällen sollten diese Titel, und das gilt generell für Überschriften in buddhistischen Texten, lediglich als Hilfen für den Leser betrachtet werden, die von historischen oder modernen Bearbeitern zugeteilt wurden, und nicht als zum eigentlichen Text gehörig.

Neben den Entsprechungen zwischen den Pātimokkhas führen wir auch, wesentlich weniger ausführlich, Entsprechungen zwischen den Khandhakas auf. Diese beruhen auf den Angaben, die Frauwallner in seiner klassischen Studie vorlegt. Ich war versucht, seine genauere Aufschlüsselung aufzunehmen, die Parallelen in verschiedenen Abschnitten innerhalb jedes Khandhaka zeigten; am Ende beließ ich es aber bei den Entsprechungen auf Kapitel- oder Khandhaka-Ebene. Diese sind im Ganzen viel einfacher zu handhaben als die Pātimokkha-Entsprechungen, obwohl es, wie immer, unerwartete Schwierigkeiten und problematische Ausnahmen gibt.

In diesem Fall ist die wichtigste Ausnahme der Mahāsaṅghika-Vinaya, der überhaupt keinen wirklichen Khandhaka-Abschnitt hat. Frauwallner behandelt ihn als einen Khandhaka, wiewohl als einen, der von späteren Bearbeitern drastisch umgestaltet worden war, aber Clarke hat in jüngerer Zeit gezeigt, dass das nicht der Fall ist. Die genaue Beziehung zwischen diesem und anderen Vinayas bleibt unklar, obwohl es mir wahrscheinlich erscheint, dass Frauwallner Recht hatte, ihn als eine spätere Neustrukturierung von Material zu behandeln, das früher den Khandhakas ähnlicher war. Wie auch immer, trotz der großen Unterschiede in der Form haben die Themen, die in verschiedenen Abschnitten des Mahāsaṅghika-Vinaya diskutiert werden, vieles mit den entsprechenden Kapiteln in den Khandhakas gemeinsam. Da der Hauptzweck, zu dem SuttaCentral Entsprechungen vorlegt, darin besteht, dem Leser zu helfen, ähnliche Passagen zum Vergleichen zu finden, habe ich so viel wie möglich von Frauwallners Entsprechungen zum Mahāsaṅghika-Vinaya beibehalten. Wegen der Art, wie diese Passagen im Text verstreut sind, war es jedoch nicht möglich, alles zu zeigen.

Man beachte, dass es aufgrund der Natur der Vinayatexte keine Notwendigkeit für die verschiedenen Arten von Beziehungen gibt, wie sie für die Suttas definiert wurden. In fast allen Fällen ist es klar, dass eine bestimmte Regel eine vollständige Parallele zu anderen Regeln ist, in dem Sinn, dass sie verschiedene Versionen derselben „Sache“ sind. Es gibt dazu natürlich gelegentliche Ausnahmen, aber ich denke nicht, dass etwas gewonnen würde, wenn man versuchen würde, diese wenigen Grenzfälle in den Daten zu präzisieren.

## Textquellen

### Pali

Der Palitext auf SuttaCentral ist die Mahāsaṅgīti-Ausgabe, manchmal als „Welt-Tipitaka“ bezeichnet. Es ist eine Version des Textes des Sechsten Konzils, die von der *Dhamma Society of Bangkok* bearbeitet und herausgegeben wurde. Sie basiert auf dem digitalen Text, den das *Vipassana Research Institute* zur Verfügung gestellt hat. Die *Dhamma Society* hat den Text umfassend revidiert und im Vergleich mit mehreren gedruckten Ausgaben korrigiert. Als Hauptquelle zogen sie die erste Ausgabe des Textes des Sechsten Konzils heran, die die Tradition burmesischer Manuskripte vertritt. Wir glauben, dass das die genaueste, einheitlichste und am besten bearbeitete digitale Ausgabe des Palikanon ist, die verfügbar ist.

Die erste Version von SuttaCentral hatte Links zur Webseite der *Dhamma Society*. Diese wurde jedoch vom Netz abgeschaltet, und wir beschlossen, den Text selbst auf unsere Webseite aufzunehmen. Zum Glück hatte der Ehrwürdige Yuttadhammo eine vollständige Kopie des Mahāsaṅgīti für seinen *Digital Pali Reader* gemacht, und er stellte uns freundlicherweise die Quelltexte zur Verfügung.

Wir haben den Mahāsaṅgīti-Text um die Pātimokkhas von der VRI-Ausgabe sowohl für Mönche als auch für Nonnen ergänzt.

Am Text der Mahāsaṅgīti-Ausgabe haben wir nichts geändert. Allerdings haben wir ein paar kleinere Korrekturen an der Nummerierung und der Zeichensetzung vorgenommen.

Zusätzlich zum Text nutzen wir das kritische Instrumentarium des Mahāsaṅgīti, das abweichende Schreibweisen, Kennziffern und Querverweise umfasst. Letztere bilden die Grundlage für die meisten unserer Pali-Pali-Parallelen.

### Chinesisch

Die endgültige Ausgabe des chinesischen buddhistischen Kanon ist der Tripiṭaka Koreana. Das ist ein äußerst genauer und gut erhaltener Satz von 81.258 Holzblöcken aus dem 13. Jahrhundert. Er wurde als ursprüngliche Quelle für die moderne Taishō-Ausgabe verwendet, von Takakusu Junjiro und anderen bearbeitet und im frühen 20. Jahrhundert von der Univesität Taishō in Japan veröffentlicht. Er wurde von CBETA digitalisiert, von wo unsere chinesischen Texte stammen.

### Tibetisch

Unsere tibetischen Texte sind vom *Tibetan and Himalayan Library Text*, welcher auf der Derge-Ausgabe des Kangyur beruht. Man beachte, dass die elementaren Textnummern, die von THLIB benutzt werden, von den Nummern auf SuttaCentral und anderswo gewöhnlich um eins abweichen. Die Nummern, die SuttaCentral verwendet, entsprechen der „Masterkatalog-Nummer“ auf THLIB.

### Sanskrit und andere

Da die Texte auf Sanskrit und in anderen indischen Sprachen keinen zusammenhängenden Kanon bilden, sondern aus vielen zufälligen Funden bezogen wurden, gibt es keine einheitliche Quelle. Die Ausgaben sind wie in den Texten angegeben. Digitale Texte sind meist aus dem *Göttingen Register of Electronic Texts in Indian Languages* (GRETIL).

### Übersetzungen

Übersetzungen stammen aus vielen verschiedenen Quellen, wie in jedem Text angegeben.

## Markup

Die Texte auf SuttaCentral haben ein klares, akkurates und ausführliches Markup und benutzen gültiges semantisches Normen-kompatibles HTML5. Es war eine unserer größten Aufgaben, die vielen Texte, die wir aus verschiedenen Quellen geerbt haben, umzuwandeln und sie alle in das gleiche Format zu bringen. Das ist außerordentlich komplex, da die Quelltexte selten ein irgendwie geartetes klares semantisches Markup haben. Sie reichen von nicht markiertem gewöhnlichem Text bis zu wortreichem Durcheinander, wie es von Textverarbeitungsprogrammen produziert wird. Unser Ziel ist, diese ganze komplexe Mischung in ein klares und einfaches Markup zu bringen, ohne dass Elemente verlorengehen.

Einige Schwesterprojekte von SuttaCentral — insbesondere CBETA — nutzen den akademischen *Text Encoding Initiative* (TEI)-XML-Standard für das Markup. Obwohl wir die Vorteile eines XML-Ansatzes schätzen, hat sich für uns herausgestellt, dass modernes HTML uns alle Möglichkeiten gibt, die wir brauchen. Gleichzeitig ist es beträchtlich einfacher in der Handhabung und den Einsatzmöglichkeiten. Unsere Quelltexte können so wie sie sind ohne Vorverarbeitung in einem Browser dargestellt werden. Aber obwohl wir TEI nicht benutzen, übernehmen wir viele Namen und Semantik-Elemente von TEI für textkritisches Markup.

Hier werde ich einen kurzen Überblick über die weniger offensichtlichen Details geben.

### Quellenangaben

Unsere Textdateien enthalten komplexe Daten zu Verweisen. Zur Zeit führen wir über hundert verschiedene Bezugsquellen auf. Für buddhistische Texte gibt es kein zentralisiertes, ausführliches und einheitliches Referenzsystem, daher haben wir es so gut wie möglich gemacht. Die Daten sind in leeren Tags kodiert und können optional mit Javascript dargestellt werden.

### Textkritische Informationen

Unsere Texte in Originalsprachen enthalten eine Reihe textkritischer Informationen, die für Wissenschaftler interessant sind. Wir versuchen, diese auf eine Art zu präsentieren, die für Leser nicht aufdringlich ist, aber informativ, wenn man näher hinschaut. Herkömmliche digitale Dateien benutzen oft Gepflogenheiten aus dem Druck wie [Klammern], um solche Inhalte zu kennzeichnen. Aber das ist hässlich und unterbricht den Lesefluss. Schlimmer noch, es ist wenig informativ. Es ist oft schwierig, herauszufinden, was diese verschiedenen Markierungen bedeuten; tatsächlich mussten wir manchmal auf gelehrtes Rätselraten zurückgreifen.

Textkritische Informationen sind in den Dateien mit Klassen markiert wie „var“ für abweichende Lesarten, „supplied“ für hinzugefügten Text usw. Typischerweise machen wir das optisch über den Stil erkennbar und zeigen ein Pop-up-Fenster, das die Bedeutung erklärt. Das meiste kann optional aktiviert werden.

[Siehe Liste der textkritischen Markup-Klassen](https://suttacentral.net/zz1/zz/test) (englisch).

### Strukturmerkmale und Sonstiges

Wir benutzen semantisches Markup mit etwa hundert verschiedenen Klassen, um die genaue Struktur der Texte zu bezeichnen. Dazu gehören Dinge wie:

* Überschriften, richtig strukturiert mit hX-Tags. Palitexte haben eine so detaillierte Hierarchie, dass wir in manchen Fällen alle Tags bis zu h6 benutzen.
* *Uddānas*, die Vaggas und ähnliche Struktureinheiten zusammenfassen.
* Verschiedene Arten von Nummern wie etwa für Regeln.
* Verse.
* Titel am Ende eines Sutta oder Abschnittes. Buddhistische Texte haben gewöhnlich den Titel am Ende eines Abschnittes, statt der modernen Überschrift.

[Siehe Liste der Markup-Klassen für Strukturmerkmale und Sonstiges](https://suttacentral.net/zz3/zz/test) (englisch).

## Bibliografie

### Suttaparallelen
Hier sind die wichtigsten bibliografischen Quellen, die von Rod Bucknell bereitgestellt wurden; sie stellen die primären Bezugsquellen für die Suttaparallelen und die Ausgaben der verschiedenen Texte dar. Man beachte, dass diese Bibliografie nicht als umfassend oder gleichbleibend gedacht ist. Sie zeigt vielmehr eine Momentaufnahme des akademischen Hintergrunds für Rods grundlegende Recherche.

* Akanuma, Chizen 1929. *The Comparative Catalogue of Chinese Āgamas & Pāli Nikāyas.* Nagoya: Hajinkaku-shobō. Reprinted 1990, Delhi: Sri Satguru Publications.
* Allon, Mark 2001. *Three Gāndhārī Ekottarikāgama-Type Sūtras: British Library Kharoṣṭhī Fragments 12 and 14.* Seattle: University of Washington Press.
* Allon, Mark 2008. A Gāndhārī Version of the Simile of the Turtle and the Hole in the Yoke. *Journal of the Pali Text Society* 29: 229–262.
* Allon, Mark & Salomon, Richard 2000. Kharoṣṭhī Fragments of a Gāndhārī Version of the Mahāparinirvāṇasūtra. In Braarvig, Jens (ed). *Buddhist Manuscripts* vol. I (= *Manuscripts in the Schøyen Collection* 1), Oslo: Hermes Publishing, 242–284.
* Anālayo, Bhikkhu 2012. On the Five Aggregates (1): A translation of Saṃyukta-āgama Discourses 1 to 32. *Dharma Drum Journal of Buddhist Studies* 11: 1–61.
* Anālayo and Bucknell, Roderick S. 2006. Correspondence Table for Parallels to the Discourses of *Majjhima Nikāya*: Toward a Revision of Akanuma’s *Comparative Catalogue. Journal of the Centre for Buddhist Studies, Sri Lanka* 4: 215–238.
* Anesaki, Masaharu 1905. Le *Sagātha-vagga* du *Saṃyutta-nikāya* et ses versions chinoises. *Le Muséon* (nouvelle série) 24: 23–37.
* Anesaki, Masaharu 1908. The Four Buddhist Āgamas in Chinese: A Concordance of their Parts and the Corresponding Counterparts in the Pāli Nikāyas. *Transactions of the Asiatic Society of Japan* 35.3: 1–149.
* Bapat, P.V. 1949. Another Valuable Collection of Buddhist Sanskrit Manuscripts. *Annals of the Bhandarkar Oriental Research Institute* 30: 241–253.
* Basak, Radhagovinda 1963. *Mahāvastu Avadāna*, vol. 1 (*Calcutta Sanskrit College Research Series*). Calcutta: Sanskrit College.
* Basak, Radhagovinda 1965. *Mahāvastu Avadāna*, vol. 2 (*Calcutta Sanskrit College Research Series*). Calcutta: Sanskrit College.
* Basak, Radhagovinda 2004. *Mahāvastu Avadāna*, vol. 3. Darbhanga: Mithila Institute.
* Beckh, Hermann 1911. *Udānavarga, Eine Sammlung buddhistischer Sprüche in tibetischer Sprache, nach dem Kanjur und Tanjur mit Anmerkungen herausgegeben*. Berlin: Reimer.
* Benveniste, E. 1940. *Textes Sogdiens, édités, traduits et commentés* (*Mission Pelliot en Asie Centrale, series in-quarto*). Paris: Paul Geuthner.
* Bernhard, Franz 1965. *Udānavarga* (= S*anskrittexte aus den Turfanfunden X*). Göttingen: Vandenhoeck & Ruprecht.
* Bersing, Siegfried 1930. *Das Chung-tsi-king des chinesischen Dīrghāgama, Übersetztung und Anmerkungen*. Leipzig: Asia Major.
* Bingenheimer, Marcus 2011. *Studies in Āgama Literature: With special reference to the Shorter Chinese Saṃyuktāgama*. (*Dharma Drum Buddhist College Special Series*) Taipei: Xin Wen Feng.
* Bodhi, Bhikkhu 2000. *The Connected Discourses of the Buddha: A New Translation of the Saṃyutta Nikāya*. Boston: Wisdom Publications.
* Bollée, Willem 2002. *The Story of Paesi*. Wiesbaden: Harrassowitz.
* Bongard-Levin, Gregory 1989. Three New Fragments of the Bodharājakumārasūtra from Eastern Turkestan. *Journal of the American Oriental Society* 109: 509–512.
* Bongard-Levin, Gregory et al. 1996. The Nagaropamasūtra: An Apotropaic Text from the Saṃyuktāgama. In *Sanskrit Wörterbuch der Buddhistischen Texte aus den Turfan Funden*, Beiheft 6: 7–103.
* Brekke, Torkel 2000. The Caṃgīsūtra of the Mahāsaṃghika-Lokottaravādins. In Braarvig, Jens (ed.) *Buddhist Manuscripts* vol. 1 (= *Manuscripts in the Schøyen Collection* I), Oslo: Hermes Publishing, 53–62.
* Brough, John 1962/2001. *The Gāndhārī Dharmapada, edited with an Introduction and Commentary* (= *Buddhist Tradition Series*, vol. 43) Delhi: Motilal Banarsidass.
* Chakravarti, N. p. 1930. *L’Udānavarga sanskrit: Texte sanscrit en transcription, avec traduction et annotations, suivi d’une étude critique et de planches* (*Mission Pelliot en Asie Centrale*, série petit in-octavo, vol. iv). Paris: Paul Geuthner.
* Choong, Mun-keat 2004. *Annotated Translations of Sutras from the Chinese Saṃyuktāgama Relevant to the Early Buddhist Teachings on Emptiness and the Middle Way*. Penang: Chee Khoon Printings.
* Chung, Jin-il 2008. *A Survey of the Sanskrit Fragments Corresponding to the Chinese Saṃyuktāgama*. Tokyo: Sankibō Busshorin.
* Chung, Jin-il and Fukita, Takamichi 2011. *A Survey of the Sanskrit Fragments Corresponding to the Chinese Madhyamāgama (including references to Sanskrit parallels, citations, numerical categories of doctrinal concepts, and stock phrases)*. Tokyo: Sankibō Busshorin.
* Cone, Margaret 1989. Patna Dharmapada. *Journal of the Pali Text Society* 13: 101–217.
* Cooper, John M. 1980. A fragment of the Nidānasūtra. *Pali Buddhist Review* 5.3: 53–58.
* Cowell, E. B. et al. 1886. *The Divyāvadāna, a Collection of Early Buddhist Legends*. Cambridge: Cambridge University Press.
* Devacandra 1996. *Gaṅ po la sogs pa’i rtogs pa brjod pa brgya pa*. Xining.
* Dhammadinnā 2012. A Translation of the Quotations in Śamathadeva’s Abhidharmakośopāyikā-ṭīkā Parallel to the Chinese Saṃyukta-āgama Discourses 8, 9, 11, 12, 17 and 28. *Dharma Drum Journal of Buddhist Studies* 11: 63–96.
* Dietz, Siglinde 2002. Fragments of the Andhasūtra, of the Sūtra on the Three Moral Defects of Devadatta, and of the Kavikumārāvadāna. In Braarvig, Jens (ed.) *Buddhist Manuscripts* vol. II (= *Manuscripts in the Schøyen Collection* III), Oslo: Hermes Publishing, 25–36.
* Dutt, Nalinaksha 1984a (part 1), 1984b (part 2). *Gilgit Manuscripts* (= *Bibliotheca Indo-Buddhica No. 16, No. 17*). Delhi: Sri Satguru, vol. 3.
* Eimer, Helmut 1983. Rab tu ''byuṅ ba''i gźi. *Die Tibetische Übersetzung des Pravrajyāvastu im Vinaya der Mūlasarvāstivādins*. Wiesbaden: Harrasowitz. vol. 2.
* Enomoto, Fumio 1985. Zōagon-gyō kankei no Bonbun shahon danpen [Sanskrit fragments relating to the Saṃyuktāgama. Identification of some fragments of SHT5]. *Bukkyō Kenkyū* 15 (Dec.): 81–93.
* Enomoto, Fumio 1989. Sanskrit fragments from the Saṃyuktāgama discovered in Bamiyan and Eastern Turkestan. In Enomoto Fumio, Hartmann, Jens-Uwe, and Matsumura Hisashi (eds) Sanskrit-Texte aus dem buddhistischen Kanon: Neuentdeckungen und Neueditionen (= Sanskrit-Wörterbuch der buddhistischen Texte aus den Turfan-Funden, Beiheft 2), Göttingen: 7–16.
* Enomoto, Fumio 1994. A comprehensive study of the Chinese Saṃyuktāgama: Indic texts corresponding to the Chinese Saṃyuktāgama as found in the Sarvāstivāda-Mūlasarvāstivāda literature. Part 1: * Saṃgītanipāta. Kyoto: Kacho Junior College.
* Enomoto, Fumio 1997. Sanskrit Fragments from the Saṃgītanipāta of the Saṃyuktāgama. In Kieffer-Pülz, Petra and Hartmann, Jens-Uwe (eds), Bauddhavidyasudhakarah: Studies in Honour of Heinz Bechert on the Occasion of his 65th birthday, Swisstal-Odendorf, India et Tibetica 30: 91–105.
* Feer, Léon 1883. Fragments extraits du Kanjour (= Annales du Musée Guimet, tome 5). Paris: E. Leroux.
* Foguang 1972–1987. Foguang Dazangjing, Ahan zang: Za Ahan (1972), Zhong Ahan (1984), Chang Ahan (1985), Zengyi Ahan (1987) [Foguang Tripiṭaka, Āgama: Saṃyuktāgama (1972), Madhyamāgama (1984), Dīrghāgama (1985), Ekottarikāgama (1987)]. Kaohsiung: Foguang.
* Fukita, Takamichi 1982. Bonbun Daihongyō engisetsu no fukugen ni tsuite [On a restoration of the pratītyasamutpāda in the Mahāvadānasūtra]. *Bukkyō Shigaku Kenkyū* 24/2: 26–43.
* Fukita, Takamichi 1985a. The Mahāvadāna sūtra: A reconstruction of chapters IV and V. *Bukkyō Daigaku Daigakuin Kenkyū Kiyō* 13: 17–52.
* Fukita, Takamichi 1985b. Bonbun Daihongyō no fukugen ni kansuru jakkan no mondai [Some problems relating to the reconstruction of the Sanskrit Mahāvadānasūtra]. *Indogaku Bukkyōgaku Kenkyū* 33.2 (Mar): 547–548.
* Fukita, Takamichi 1987a. Bonbun Daihongyō dai-ni shō oboegaki [A note on chapter 2 of the Mahāvadānasūtra]. *Bukkyō Ronsō* 31 (Sep): 121–124.
* Fukita, Takamichi 1987b. Bonbun Daihongyō shahon Cat. No. 498 (= MAV 82, 83) ni kansuru chūkan hōkoku [Provisional report on the MAV Ms. Cat. No. 498]. *Bukkyō Bunka Kenkyūsho Shohō* 4: 20–19.
* Fukita, Takamichi 1987c. Vipaśyin-Butsu ichie sanga no ninzū o megutte: Bonbun Daihongyō dai-jusshō kessonbubun no fukugen [On the number of bhikṣus in Buddha Vipaśyin’s first Sangha: A reconstruction of the lost part of chapter 10 of the Mahāvadānasūtra]. *Jōdo-shū Kyōgakuin Kenkyūsho-hō* 9: 22–26.
* Fukita, Takamichi 1988a. Daihongyō to Hasōji ni miru kyōtsū no dentō to chihōteki hensen, tokuni Bosatsu-tanjō-densetsu o chūshin to shite [Common tradition and local development of the Mahāvadānasūtra and the Saṃghabhedavastu, particularly focusing on the Bodhisattva’s birth legend]. *Hōnen Gakkai Ronsō* 6: 5–22.
* Fukita, Takamichi 1988b. Higashi Torukisutan Ubu no dokuju kyōten—Nagaropanavyākaraṇa (= Nagarasūtra)—to mayoke [A recitation of the Sarvāstivādins in Eastern Turkestan—the Nagaropamavyākaraṇa (= Nagarasūtra)—and a charm]. *Sankō Bunka Kenkyūsho Nenpō* 20: 27–49.
* Fukita, Takamichi 2003. *The Mahāvadānasūtra: A new edition based on manuscripts discovered in northern Turkestan* (= *Sanskrit-Wörterbuch der buddhistischen Texte aus den Turfan-Funden*, Beiheft 10). Göttingen: Vandenhoeck & Ruprecht.
* Glass, Andrew. 2007. *Four Gāndhārī Saṃyuktāgama sūtras: Senior Kharoṣṭhī fragment 5.* (= *Gandhāran Buddhist Texts, vol. 4*). Seattle and London: University of Washington Press.
* Gnoli, Raniero 1977. *The Gilgit manuscript of the Saṅghabhedavastu: Being the 17th and last section of the Vinaya of the Mūlasarvāstivādin*, Part I (= *Serie Orientale Roma*, XLIX, 1). Roma: Istituto Italiano per il Medio ed Estremo Oriente.
* Gnoli, Raniero 1978. *The Gilgit manuscript of the Saṅghabhedavastu: Being the 17th and last section of the Vinaya of the Mūlasarvāstivādin*, Part II (= *Serie Orientale Roma*, XLIX, 2). Roma: Istituto Italiano per il Medio ed Estremo Oriente.
* Habata, Hiromi 2007. *Die zentralasiatischen Sanskrit-Fragmente des Mahāparinirvāna-Mahāsūtra: Kritische Ausgabe des Sanskrittextes und seiner tibetischen Übertragung im Vergleich mit den chinesischen Übersetzungen*. Marburg: Indica et Tibetica.
* Hahlweg, Klaus 1954. *Das Mahāgovinda-Sūtra, eine vergleichende Analyse der indischen und chinesischen Versionen*, dissertation, University of München.
* Hahn, Michael 1977. Das Saptamaithunasaṃyuktasūtra: Ein Sūtra des Ekottarikāgama. In Härtel, Herbert (ed.), *Beiträge zur Indienforschung, Ernst Waldschmidt zum 80. Geburtstag gewidmet*, Berlin: Museum für indische Kunst, 205–224.
* Harrison, Paul 1997. The Ekottarikāgama Translations of An Shigao. In Bauddhavidyasudhakarah: Studies in Honour of Heinz Bechert. Kieffer-Pülz, Petra. and Hartmann, Jens-Uwe (eds). Swisstal-Oldendorf, pp. 261–283.
* Harrison, Paul 2002. Another Addition to the An Shigao Corpus? Preliminary Notes on an Early Chinese Saṃyuktāgama Translation. In Sakurabe Ronshu Committee (ed.), *Early Buddhism and Abhidharma Thought: In Honor of Doctor Hajime Sakurabe on His Seventy-seventh Birthday*, Kyoto: Heirakuji Shoten, 1–32.
* Hartmann, Jens-Uwe 1989. Fragmente aus dem Dīrghāgama der Sarvāstivādins. In Enomoto Fumio, Hartmann, Jens-Uwe, and Matsumura Hisashi (eds), Sanskrit-Texte aus dem buddhistischen Kanon: Neuentdeckungen und Neueditionen (= Sanskrit-Wörterbuch der buddhistischen Texte aus den Turfan-Funden, Beiheft 2), Göttingen: Vandenhoeck & Ruprecht, 37–67.
* Hartmann, Jens-Uwe 1991. *Untersuchungen zum Dīrghāgama der Sarvāstivādins*. Habilitationsschrift. Göttingen: Georg-August-Universität.
* Hartmann, Jens-Uwe 1998. Sanskrit Fragments from the *Āgamas* (I): The Aṅgulimālāsūtra. *Indologica Taurinensia* 23/24: 351–362.
* Hartmann, Jens-Uwe 2000. Zu einer neuen Handschrift des Dīrghāgama. In Vividharatnakaraṇḍaka: *Festgabe für Adelheid Mette (= Indica et Tibetica: Monographien zu den Sprachen und Literaturen des indo-tibetischen Kulturraumes Band 37)*. C Chojnacki et al. (eds). Swisstal-Odendorf: Indica und Tibetica, pp. 359–367.
* Hartmann, Jens-Uwe 2002. More Fragments of the Caṅgīsūtra. In Braarvig, Jens (ed). *Buddhist Manuscripts* vol. II (= *Manuscripts in the Schøyen Collection* III), Oslo: Hermes Publishing, 1–16.
* Hartmann, Jens-Uwe 2004. Contents and structure of the Dīrghāgama of the (Mūla)-Sarvāstivādins. *Annual report of the International Research Institute for Advanced Buddhology at Soka University* 7: 119–137.
* Hoernle, A. F. Rudolf 1916. *Manuscript remains of Buddhist literature found in Eastern Turkestan: Facsimiles of manuscripts in Sanskrit, Khotanese, Kuchean, Tibetan and Chinese, with transcripts, translations and notes, edited in conjunction with other scholars, with critical introductions and vocabularies*, vol. 1. Oxford. Reprinted 1970, St. Leonards: Ad Orientem.
* Hoffmann, Helmut 1939. Bruchstücke des Ātāṭātikasūtra aus dem zentralasiatischen Sanskritkanon der Buddhisten (= *Kleinere Sanskrit-Texte* V). Leipzig: F. A. Brockhaus. Reprinted 1987 in Sander, Lore (ed.), Nachträge zu *“Kleinere Sanskrit-Texte, Heft V”* (= *Monographien zur indischen Archäologie, Kunst und Philologie*, 3), Wiesbaden: Franz Steiner.
* Honjō, Yoshifumi 1984. *A Table of Āgama-Citations in the Abhidharmakośa and the Abhidharmakośopāyikā*. Kyoto.
* Hosoda, Noriaki 1989a. Sanskrit fragments from the Parivrājakasaṃyukta of the Saṃyuktāgama (1). In *Indian Philosophy and Buddhism: Essays in honour of Professor Kotatsu Fujita on his sixtieth birthday*: 185–206. Kyoto.
* Hosoda, Noriaki 1989b. Bonbun Zōagongyō Busshosetsuhon Gedōsōō (2) [Sanskrit fragments from the Parivrājakasaṃyukta of the Saṃyuktāgama (2)]. *Hokkaidō Journal of Indological and Buddhist Studies* 4: 140–153.
* Hosoda, Noriaki 1989c. Torufan shōrai mokuhansatsu Bonbun Zōagongyō danken: R. Pischel kōhyō Bonbun danken ni tsuite [Fragmentary woodblock mss of the Sanskrit Saṃyuktāgama from Turfan: On Sanskrit fragments published by R. Pischel]. *Indogaku Bukkyōgaku Kenkyū* 37.2: 540–546.
* Hosoda, Noriaki 1991. Bonbun Zōagongyō Busshosetsuhon Gedōsōō (3) [Sanskrit fragments from the Parivrājakasaṃyukta of the Saṃyuktāgama (3)]. *Hokkaidō Journal of Indological and Buddhist Studies* 6: 172–191.
* Johnston, E. H. 1995. *Aśvaghoṣa’s Buddhacarita or Acts of the Buddha*. Delhi: Munshiram Manoharlal.
* Kuan, Tse-Fu 2007. Annotated Translation of the Chinese Version of the Kāyagatāsati Sutta. *Indian International Journal of Buddhist Studies* 8: 175–194.
* Kuan, Tse-Fu 2008. *Mindfulness in Early Buddhism: New Approaches through Psychology and Textual Analysis of Pali, Chinese, and Sanskrit Sources* (*Routledge Critical Studies in Buddhism*) London: Routledge.
* Kudara, Kōgi et al. 1983. Uigurische Āgama-Fragmente (1). *Altorientalische Forschungen* 10: 269–309.
* Kudara, Kōgi et al. 1990. Uigurische Āgama-Fragmente (2). *Altorientalische Forschungen* 17: 130–145.
* Kudara, Kōgi et al. 1995. Uigurische Āgama-Fragmente (3). *Bukkyō Bunka Kenkyū sho Kiyō* 34: 23–84.
* Kudo, Noriyuki 2004. *The Karmavibhaṅga. Transliterations and Annotations of the Original Sanskrit Manuscripts from Nepal*. Tokyo: Soka University.
* Kudo, Noriyuki et al. 2006a. The First Three Folios of Manuscript B of the Karmavibhanga. *Annual Report of the International Research Institute for Advanced Buddhology at Soka University*, vol. 9 pp. 33–42.
* Kudo, Noriyuki 2006b. One More Manuscript of the Karmavibhanga in the National Archives of Nepal, Kathmandu: Transliteration of Manuscript E (1). *Annual Report of the International Research Institute for Advanced Buddhology at Soka University*, vol. 9 pp. 43–60.
* La Vallée Poussin, Louis de 1907. Mss. Cecil Bendall. *Journal of the Royal Asiatic Society of Great Britain and Ireland*: 375–379.
* La Vallée Poussin, Louis de 1911. Documents Sanscrits de la Second Collection M. Stein. *Journal of the Royal Asiatic Society*: 759–777 and 1063–1079.
* La Vallée Poussin, Louis de 1913. Documents sanskrit de la seconde collection M. A. Stein. Fragments du Saṃyuktakāgama. *Journal of the Royal Asiatic Society of Great Britain and Ireland*: 569–580.
* Lefmann, S. 1902. *Lalita Vistara: Leben und Lehre des Çakya-Buddha, Textausgabe mit Varianten-, Metren- und Wörterverzeichnis*. Halle: Verlag der Buchhandlung des Waisenhauses.
* Lévi, Sylvain 1904. Le Saṃyuktāgama sanscrit et les feuillets Grünwedel. *T’oung Pao* II 5: 297–307.
* Lévi, Sylvain 1910. Documents de l’Asie Central (Mission Pelliot). Textes sanscrits de Touen-Houang: Nidâna-Sûtra, Daçabala-Sûtra, Dharmapada, Hymne de Mâtṛceṭa. *Journal Asiatique*, sér. 10, 16: 433–456.
* Lévi, Sylvain 1925. Notes Indiennes. *Journal Asiatique* 206: 17–35.
* Lévi, Sylvain 1932. *Mahākarmavibhaṅga (La Grande Classification des Actes) et Karmavibhaṅgopadeśa (Discussion sur le Mahā Karmavibhaṅga), Textes sanscrits rapportés du Népal, édités et traduits avec les textes parallèles en Sanscrit, en Pali, en Tibétain, en Chinois et en Koutchéen*. Paris: Librairie Ernest Leroux.
* Lévi, Sylvain 1933. *Fragments de Textes Koutchéens: Udānavarga, Udānastotra, Udānālaṃkāra et Karmavibhaṅga, Publiés et traduits avec un vocabulaire et une introduction sur le ‘Tocharien’ (Cahiers de la Société Asiatique, Première Série)*. Paris: Imprimerie Nationale.
* Maggi, Mauro 1995. *The Khotanese Karmavibhaṅga* (= *Serie Orientale Roma*, LXXIV). Roma: Istituto Italiano per il Medio ed Estremo Oriente.
* Matsuda, Kazunobu 1996. Bonbun Chū-agon no Katomandō dankan (New Sanskrit fragments of the Madhyamāgama from the Cecil Bendall mss. in the National Archives, Kathmandu). *Indogaku Bukkyōgaku Kenkyū* 44/2 (Mar), 868–862 (113–119).
* Matsumura, Hisashi 1985. Raitawarakyō no tenkai no ichi danmen [One aspect of the development of the Rāṣṭrapālasūtra]. *Bukkyō Kenkyū* 15: 39–62.
* Matsumura, Hisashi 1988. *The Mahāsudarśanāvadāna and the Mahāsudarśanasūtra* (= *Bibliotheca Indo-Buddhica* No. 47). Delhi: Sri Satguru Publications.
* Maue, Dieter 1985. Sanskrit-uigurische Fragmente des Āṭānāṭikasūtra und des Āṭānāṭiyahṛdaya. *Ural-Altaische Jahrbücher* 5: 98–122.
* Meltzer, Gudrun 2006. *Ein Abschnitt aus dem Dīrghāgama*. PhD thesis. München: Ludwig-Maximilians-Universität.
* Minayeff, I. P. and Oldenburg, S. 1983. *Buddhist Texts from Kashgar and Nepal*. New Delhi.
* Mitra, Raj. (ed & trl) 1877. The Lalita Vistara or Memoirs of the Early Life of Śākya Siñha. (= Biliotheca Indica vol. 15). Calcutta: C. B. Lewis.
* Mittal, Kusum 1957. *Dogmatische Begriffsreihen im älteren Buddhismus I*: Fragmente des Daśottarasūtra aus zentralasiatischen Sanskrit-Handschriften [i–viii] (= *Sanskrittexte aus den Turfanfunden IV*). Berlin: Akademie-Verlag.
* Miyasaka, Yusho 1970. Mahāsamayasūtra, *Acta Indologica* I: 109–135.
* Nagashima, Jundo 2009. The Sanskrit Fragments Or. 15009/51–90 in the Hoernle Collection. In *Buddhist Manuscripts from Central Asia: The British Library Sanskrit Fragments*. S. Karashima et al. (eds). Tokyo: The International Research Institute for Advanced Buddhology, Soka University, vol. 2, pp. 128–159.
* Nakatani, Hideaki 1986. Un fragment xylographique de l’Upāli-sūtra conservé au Musée Guimet. *Bulletin d’Études Indiennes* 4: 305–319.
* Neumann, Karl Eugen 1896/1995. *Die Reden des Buddha: Mittlere Sammlung, aus dem Pāli-Kanon übersetzt*. Herrnschrot: Beyerlein & Steinschulte.
* Oberlies, Thomas 2003. Ein bibliographischer Überblick über die kanonischen Texte der Śrāvakayāna-Schulen des Buddhismus (ausgenommen der des Mahāvihāra-Theravāda). *Wiener Zeitschrift für die Kunde Südasiens* 47: 37–84.
* Ōkubo, Yusen 1982. The Ekottara-āgama Fragments of the Gilgit Manuscript: Romanized Text. *Bukkyōgaku Seminā* 35: 120–91.
* Pāsādika, Bhikkhu 1989: *Kanonische Zitate im Abhidharmakośabhāṣya des Vasubandhu*. Göttingen: Vandenhoeck & Ruprecht.
* Pauly, Bernard 1957–1967. Fragments Sanskrits de Haute Asie (Mission Pelliot), *Journal Asiatique* vol. 245 (1957) pp. 281–307; vol. 247 (1959) pp. 203–249; vol. 248 (1960) pp. 213–258 and pp. 509–538; vol. 249 (1961) pp. 333–410; vol. 250 (1962) pp. 593–612; vol. 252 (1964) pp. 197–271; vol. 253 (1965) pp. 83–121 and 183–187; vol. 254 (1966) pp. 245–304; vol. 255 (1967) pp. 231–241.
* Pauly, Bernard 1959. Fragments sanskrits de Haute Asie (Mission Pelliot). Journal Asiatique (Année 1959): 247, 203–249.
* Peipina, Lita 2008. *The Piṅgalātreya sūtra of the (Mūla-)sarvāstivādins: Its Edition and Study. Investigation of the Piṃgalātreya sūtra’s status within the Dīrghāgama “Collection of Long (Discourses of the Buddha)”*. MA thesis, University of Oslo.
* Peyrot, Michael 2008. More Sanskrit, Tocharian B Bilingual Udānavarga Fragments. *Indogermanische Forschungen, Zeitschrift für Indogermanistik und allgemeine Sprachwissenschaft* 113: 83–125.
* Pischel, R. 1904a. Bruchstücke des Sanskritkanons der Buddhisten aus Idykutšari, Chinesisch-Turkestan. *Sitzungsberichte der Königlich Preussischen Akademie der Wissenschaften in Berlin* 25: 807–827.
* Pischel, R. 1904b. Neue Bruchstücke des Sanskritkanons der Buddhisten aus Idykutšari, Chinesisch-Turkestan. *Sitzungsberichte der Königlich Preussischen Akademie der Wissenschaften in Berlin* 25: 1138–1145.
* Rosenberg, F. 1920. Deux fragments sogdien-bouddhiques du Ts’ien-fo-tong de Touen-Houang, II: Fragment d’un Sūtra. *Izvestija Rossijskoj akademii nauk*: 399–420.
* Salomon, Richard 2000. *A Gāndhārī Version of the Rhinoceros Sūtra, British Library Kharoṣṭhī Fragment 5B* (= *Gandhāran Buddhist Texts 1*) Seattle: University of Washington Press.
* Salomon, Richard 2003. The Senior Manuscripts: Another Collection of Gandhāran Buddhist Scrolls. *Journal of the American Oriental Society* 123/1: 73–92.
* Sander, Lore 1987. *Nachträge zu “Kleine Sanskrit-Texte Heft iii–v”* (= *Monographien zur indischen Archäologie, Kunst und Philologie*, 3). Wiesbaden: Franz Steiner.
* Schlingloff, Dieter 1961. Zum Mahāgovindasūtra. *Mitteilungen des Instituts für Orientforschung, Deutsche Akademie der Wissenschaften zu Berlin* 7: 32–50.
* Schlingloff, Dieter 1962. *Dogmatische Begriffsreihen im älteren Buddhismus Ia*: Daśottarasūtra ix–x (= *Sanskrittexte aus den Turfanfunden*, IVa). Berlin: Akademie-Verlag.
* Schlingloff, Dieter 1963. Zum Mahāgovindasūtra. *Mitteilungen des Instituts für Orientforschung, Deutsche Akademie der Wissenschaften zu Berlin* 8: 38–44.
* Schlingloff, Dieter 1964. *Ein Buddhistisches Yogalehrbuch: Textband*. (= Sanskrittexte aus den Turfanfunden VII). Berlin: Akademie-Verlag.
* Schmidt, I. J. 1843. *Der Weise und der Thor, aus dem Tibetischen übersetzt und mit dem Originaltexte herausgegeben*. St. Petersburg: Kaiserliche Akademie der Wissenschaften.
* Senart, Emile 1882. *Le Mahāvastu* (vol. 1): *Texte sanscrit publié pour la première fois et accompagné d’introductions et d’un commentaire (Société Asiatique, Collection d’Ouvrages Orientaux, Seconde série*. Paris: Imprimerie Nationale.
* Senart, Emile 1890. *Le Mahāvastu* (vol. 2): *Texte sanscrit publié pour la première fois et accompagné d’introductions et d’un commentaire (Société Asiatique, Collection d’Ouvrages Orientaux, Seconde série*. Paris: Imprimerie Nationale.
* Senart, Emile 1897. *Le Mahāvastu* (vol. 3): *Texte sanscrit publié pour la première fois et accompagné d’introductions et d’un commentaire (Société Asiatique, Collection d’Ouvrages Orientaux, Seconde série*. Paris: Imprimerie Nationale.
* Shōgaito, Masahiro 1998. Three Fragments of Uighur Āgama. In Laut and Ölmez (eds.), *Bahşi Ögdisi, Festschrift für Klaus Röhrborn, Freiburg/Istanbul*, 363–378.
* Shōgaito, Masahiro 2002. Fragments of Uighur Daśabala Sūtra. In *Splitter aus der Gegend von Turfan: Festschrift für Peter Zieme* (*Türk Dilleri Arastirmalari Dizisi*, 35). M. Ölmez et al. (eds). Berlin pp. 291–297.
* SHT, *Sanskrithandschriften aus den Turfanfunden*. 1965 (vol. i) ed. W. Clawiter, L. Holzmann, E. Waldschmidt; 1968 (vol. ii) ed. idem; 1971 (vol. iii) ed. idem; 1980 (vol. iv) ed. L. Sander, E. Waldschmidt; 1985 (vol. v) ed. idem; 1989 (vol. vi) ed. H. Bechert, K. Wille; 1995 (vol. vii) ed. idem; 2000 (vol. viii) ed. idem; 2004 (vol. ix) ed. idem; 2008 (vol. x) ed. K. Wille. Wiesbaden/Stuttgart: Franz Steiner.
* Sieg, E. 1938. Die Kutschischen Karmavibhaṅga Texte der Bibliothèque Nationale in Paris. *Zeitschrift für Vergleichende Sprachforschung auf dem Gebiete der Indogermanischen Sprachen*, 65: 165–172.
* Sieg, E. et al. 1949. *Tocharische Sprachreste, Sprache B. Die Udānālaṅkāra-Fragmente*. Göttingen: Vandenhoeck & Ruprecht.
* Silverlock, Blair 2009. *An Edition, Translation, and Study of the Bodha-sūtra from the Manuscript of the Gilgit Dīrghāgama of the (Mūla-)Sarvāstivādins*. BA thesis, University of Sydney.
* Simon, Walther 1970. A Note on the Tibetan Version of the Karmavibhaṅga Preserved in the MS Kanjur of the British Museum. *Bulletin of the School of Oriental and African Studies* 33: 161–166.
* Skilling, Peter 1994. *Mahāsūtras: Great Discourses of the Buddha*, Volume I: Texts. Oxford: Pali Text Society.
* Skilling, Peter 1997. Discourse on the Four Kinds of Karma. *Journal of Religious Studies* 7: 86–91.
* Skilling, Peter 2000. Vasubandhu and the Vyākhāyukti Literature. *Journal of the International Association of Buddhist Studies* 23,2: 297–350.
* Skilling, Peter 2011. Discourse on the Twenty-two Faculties, Translated from Śamathadeva’s Upāyikā-ṭīkā. In *Felicitation Volume for Professor Samtani*. L. Shravak (ed.) (forthcoming).
* Somaratne, G. A. 1999. *Saṃyutta-nikāya Vol. I*. Oxford: Pali Text Society.
* Speyer, J. S. 1970a (1906). *Avadānaśataka: A Century of Edifying Tales Belonging to the Hīnayāna, vol. 1 (Bibliotheca Buddhica III)*. Osnabrück: Biblio Verlag.
* Speyer, J. S. 1970b (1909). *Avadānaśataka: A Century of Edifying Tales Belonging to the Hīnayāna, vol. 2 (Bibliotheca Buddhica III)*. Osnabrück: Biblio Verlag.
* Stache-Rosen, Valentina 1968. *Dogmatische Begriffsreihen im älteren Buddhismus II: Das Saṅgītisūtra und sein Kommentar Saṅgītiparyāya, nach Vorarbeiten von Kusum Mittal bearbeitet*. Teil 1–2 (= *Sanskrittexte aus den Turfanfunden* IX). Berlin: Akademie-Verlag.
* Tekin, Şinasi 1980. *Maitrisimit nom bitig. Die Uigurische Übersetzung eines Werkes der Buddhistischen Vaibhāṣika Schule*. Berlin: Akademie Verlag.
* Thich, Minh Chau 1964. *The Chinese Madhyama Āgama and the Pāli Majjhima Nikāya: A Comparative Study*. Reprinted 1991, Delhi: Motilal Banarsidass.
* Thich, Nhat Hanh 1996. *Breathe! You are Alive: Sutra on the Full Awareness of Breathing*. Berkeley: Parallax Press.
* Thich Huyen-vi and Pāsādiko Bhikkhu 1984–2004. [Partial Translation of Ekottarikāgama, T125]. *Buddhist Studies Review* 1.2 onwards.
* Tripāṭhi, Chandrabhal 1962. Fünfundzwanzig Sūtras des Nidānasaṃyukta (= *Sanskrittexte aus den Turfanfunden* VIII). Berlin: Akademie-Verlag.
* Tripāṭhi, Chandrabhal 1980. Die Einleitung des Daśottarasūtra. *Indianisme et Bouddhisme* 23: 353–358.
* Tripāṭhi, Chandrabhal 1985. Saṅgīti-Sūtra, Nipāta II, und Ekottarāgama-Parallelen. In Bechert, Heinz (ed.), *Die Sprache der ältesten buddhistischen Überlieferung*, Göttingen: Vandenhoeck & Ruprecht, 191–199.
* Tripāṭhi, Chandrabhal 1995. *Ekottarāgama-Fragmente der Gilgit-Handschrift*. Reinbek: Dr Inge Wezler Verlag für Orientalistische Fachpublikationen.
* Vaidya, P. L. 1958a. *Avadāna-śataka (Buddhist Sanskrit Texts No. 19)*. Darbhanga: Mithila Institute.
* Vaidya, P. L. 1958b. *Lalita-vistaraḥ (Buddhist Sanskrit Texts No. 1)*. Darbhanga: Mithila Institute.
* Vaidya, P. L. 1999. *Divyāvadāna (Buddhist Sanskrit Texts No. 20)*. Darbhanga: Mithila Institute.
* Von Criegern, Oliver 2002. *Das Kūṭatāṇḍyasūtra, nach dem Dīrghāgama Manuskript herausgegeben und übersetzt*. MA thesis. München: Ludwig-Maximilians-Universität.
* Waldschmidt, Ernst 1932. *Bruchstücke buddhistischer Sūtras aus dem zentralasiatischen Sanskritkanon, I, herausgegeben und im Zusammenhang mit ihren Parallelversionen bearbeitet* (= *Kleinere Sanskrit-Texte*, IV). Leipzig: Deutsche Morgenländishe Gesellschaft. Reprinted 1979, Wiesbaden: Franz Steiner.
* Waldschmidt, Ernst 1950–1951. *Das Mahāparinirvāṇasūtra: Text in Sanskrit und Tibetisch, verglichen mit dem Pali nebst einer Übersetzung der chinesischen Entsprechung im Vinaya der Mūlasarvāstivādins, auf Grund von Turfan-handschriften*. Teil i–iii. *Abhandlungen der Deutschen Akademie der Wissenschaften zu Berlin, Klasse für Sprachen, Literatur und Kunst*, 1949/1, 1950/2, 1950/3. Berlin: Akademie-Verlag.
* Waldschmidt, Ernst 1952a. Zur Śroṇakoṭikarṇa-Legende. *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1952/6: 129–151.
* Waldschmidt, Ernst 1952b. *Das Catuṣpariṣatsūtra, eine Kanonische Lehrschrift über die Begründung der Buddhistischen Gemeinde. Text in Sanskrit und Tibetisch, verglichen mit dem Pali nebst einer Übersetzung der chinesischen Entsprechung im Vinaya der Mūlasarvāstivādins. Auf Grund von Turfan-Handschriten herausgegeben und bearbeitet*. Teil I. Berlin: Akademie-Verlag = *Abhandlungen der Deutschen Akademie der Wissenschaften zu Berlin, Klasse für Sprachen, Literatur und Kunst*, 1952/2.
* Waldschmidt, Ernst 1953. *Das Mahāvadānasūtra: Ein kanonischer Text über die sieben letzten Buddhas. Sanskrit, verglichen mit dem Pāli nebst einer Analyse der in chinesischer Übersetzung überlieferten Parallelversionen. Auf Grund von Turfan-Handschriften herausgegeben*. Teil i–ii. *Abhandlungen der deutschen Akademie der Wissenschaften zu Berlin, Klasse für Sprachen, Literatur und Kunst*, 1952/8, 1954/3.
* Waldschmidt, Ernst 1955a. Zu einigen Bilinguen aus den Turfan-Funden. *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1955/1: 1–20. Reprinted 1967 in Bechert, Heinz (ed.). *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 238–257.
* Waldschmidt, Ernst 1955b. Die Einleitung des Saṅgītisūtra. *Zeitschrift der deutschen morgenländischen Gesellschaft* 105: 298–318. Reprinted 1967 in B Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 258–278.
* Waldschmidt, Ernst 1956a. Ein Fragment des Saṃyuktāgama aus den “Turfan-Funden” (M476). *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1956/3: 45–53. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 279–287.
* Waldschmidt, Ernst 1956b. A fragment from the Saṃyuktāgama found in Chinese-Turkestan (“Turfan”). *Adyar Library Bulletin* 20: 213–228. (Revised translation of Waldschmidt 1956a).
* Waldschmidt, Ernst 1957a. Identifizierung einer Handschrift des Nidānasaṃyukta aus den Turfanfunden. *Zeitschrift der deutschen morgenländischen Gesellschaft* 107: 372–401. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 288–317.
* Waldschmidt, Ernst 1957b. Sūtra 25 of the Nidānasaṃyukta. *Bulletin of the School of Oriental and African Studies* 20: 569–579. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 318–328.
* Waldschmidt, Ernst 1957c. Das Upasenasūtra, ein Zauber gegen Schlangenbiss aus dem Saṃyuktāgama. *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1957/2: 27–44. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 329–346.
* Waldschmidt, Ernst 1957d. *Das Catuṣpariṣatsūtra, eine Kanonische Lehrschrift über die Begründung der Buddhistischen Gemeinde. Text in Sanskrit und Tibetisch, verglichen mit dem Pali nebst einer Übersetzung der chinesischen Entsprechung im Vinaya der Mūlasarvāstivādins. Auf Grund von Turfan-Handschriten herausgegeben und bearbeitet*. Teil II. Berlin: Akademie-Verlag = A*bhandlungen der Deutschen Akademie der Wissenschaften zu Berlin, Klasse für Sprachen, Literatur und Kunst*, 1956/1.
* Waldschmidt, Ernst 1958. Ein Zweites Daśabalasūtra. *Mitteilungen des Instituts für Orientforschung* 6: 382–405. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 347–370.
* Waldschmidt, Ernst 1959a. Kleine Brahmi-Schriftrolle. *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1959/1: 1–25. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 371–395.
* Waldschmidt, Ernst 1959b. The Upasenasūtra, a charm against snake-bites from the Saṃyuktāgama. In *Jñānamuktāvaī, Commemoration volume in honour of Johannes Nobel*, New Delhi, 234–253.
* Waldschmidt, Ernst 1961a. Der Buddha preist die Verehrungswürdigkeit seiner Reliquien. *Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse* 1961.11: 375–385. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 417–427.
* Waldschmidt, Ernst 1961b. Über ein der Turfan-Handschrift TM 361 fälschlich zugeteiltes Sanskritfragment. *Ural-Altäische Jahrbücher* 33: 199–203. Reprinted 1967 in Bechert, Heinz (ed.), *Ernst Waldschmidt, Von Ceylon bis Turfan, Schriften zur Geschichte, Literatur, Religion und Kunst des indischen Kulturraumes. Festgabe zum 70. Geburtstag am 15. Juli 1967*, Göttingen: Vandenhoeck & Ruprecht, 412–416.
* Waldschmidt, Ernst 1962. *Das Catuṣpariṣatsūtra, eine Kanonische Lehrschrift über die Begründung der Buddhistischen Gemeinde. Text in Sanskrit und Tibetisch, verglichen mit dem Pali nebst einer Übersetzung der chinesischen Entsprechung im Vinaya der Mūlasarvāstivādins. Auf Grund von Turfan-Handschriten herausgegeben und bearbeitet*. Teil III. Berlin: Akademie-Verlag = *Abhandlungen der Deutschen Akademie der Wissenschaften zu Berlin, Klasse für Sprachen, Literatur und Kunst*, 1960/1.
* Waldschmidt, Ernst 1968a. Drei Fragmente buddhistischer Sūtras aus den Turfan-handschriften. Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse 1968.1, 3–26. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner Verlag, 232–255.
* Waldschmidt, Ernst 1968b. Ein Beitrag zur Überlieferung vom Sthavira Śroṇa Koṭiviṃśa. In Mélanges d’indianisme. À la mémoire de Louis Renou (= Publications de l’Institut de Civilisation Indienne, Fasc. 28). Paris: E. de Boccard, 773–787. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner Verlag, 217–231.
* Waldschmidt, Ernst 1968c. A Note on Names and Surnames of Indra in a Fragment of a Buddhist Canonical Sanskrit Text from Central Asia, Journal of the Bihar Research Society, 54: 33–39. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner Verlag, 256–264.
* Waldschmidt, Ernst 1970a. Buddha frees the disc of the moon (Candrasūtra). Bulletin of the School of Oriental and African Studies 33: 179–183. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 296–301.
* Waldschmidt, Ernst 1970b. Fragment of a Buddhist Sanskrit text on cosmogony. In Tilakasiri, J. (ed.), Añjali. Papers on Indology and Buddhism. O. H. Vijesekera felicitation volume: 40–45. Peradeniya. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 290–295.
* Waldschmidt, Ernst 1972. A contribution to our knowledge of Sthavira Sroṇa Koṭhiviṃśa. In Hazra, R. C. & Banerji, S. C. (eds), S. K. De memorial volume, Calcutta, 107–116.
* Waldschmidt, Ernst 1976. “Teufeleien” in den Turfan-Sanskrittexten. In Franke, H., Heissig, W. & Treue, W. (eds), Folia rara, Wolfgang Voigt LXV. diem natalem celebranti: 140–147. Wiesbaden: Franz Steiner. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 312–319.
* Waldschmidt, Ernst 1978. Mahāmaudgalyāyana’s sermon on the letting-in and not letting-in (of sensitive influences). Journal of the International Association of Buddhist Studies 1: 25–33. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 320–328.
* Waldschmidt, Ernst 1979. The Varṇaśatam. An eulogy of hundred epitheta of Lord Buddha spoken by the gṛhapati Upāli(n). Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse 1979.1: 1–19. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 329–345.
* Waldschmidt, Ernst 1980a. Central Asian sūtra fragments and their relation to the Chinese āgamas. In Bechert, Heinz (ed.), Die Sprache der ältesten buddhistischen Überlieferung. Göttingen: Vandenhoeck & Ruprecht, 136–174. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften. Stuttgart: Franz Steiner, 370–408.
* Waldschmidt, Ernst 1980b. The Rāṣṭrapālasūtra in Sanskrit remnants from Central Asia. In Indianisme et Bouddhisme: Mélanges offerts à Mgr. Étienne Lamotte: 359–374. Louvain-la-Neuve: Institut Orientaliste de l’Université Catholique, Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 346–361.
* Waldschmidt, Ernst 1980c. On a Sanskrit version of the Verahaccāni Sutta of the Saṃyuttanikāya. Nachrichten der Akademie der Wissenschaften in Göttingen, Philologisch-Historische Klasse 1980.4: 69–76. Reprinted 1989 in Bechert, Heinz & Kieffer-Pülz, Petra (eds), Ernst Waldschmidt, Ausgewählte kleine Schriften, Stuttgart: Franz Steiner, 362–369.
* Weller, Friedrich, 1935. Das tibetische Brahmajālasūtra. *Zeitschrift für Indologie und Iranistik*, 10: 1–61.
* Wille, Klaus 2002. Fragments of the Mahāparinirvāṇasūtra. In Braarvig, Jens (ed.) *Buddhist Manuscripts* vol. II (= *Manuscripts in the Schøyen Collection* III): 17–24. Oslo: Hermes Publishing.
* Wille, Klaus 2005. Survey of the Sanskrit Manuscripts in the Turfan Collection. Vortrag anlässlich des Workshops *Digitalisierung der chinesischen, tibetischen, syrischen und Sanskrit-Texte der Berliner Turfansammlung*, Berlin, 02.06.2005.
* Wille, Klaus 2006. The Sanskrit Fragments Or. 15003 in the Hoernle Collection. *Buddhist Manuscripts from Central Asia, The British Library Sanskrit Fragments*, S. Karashima et al. (ed.), Tokyo: Soka University, vol. 1 pp 65–153.
* Yinshun 1971. *Yuanshi Fojiao shengdian zhi jicheng* [The Compilation of the Scriptures of Early Buddhism]. Reprinted 1988, Taipei: Zhengwen.
* Yinshun 1983. *Za Ahan jing lun huibian* [Saṃyuktāgama Sūtra and Commentary] (3 vols.). Taipei: Zhengwen.
* Zhang, Lixiang 2003. *Das Śaṃkarakasūtra: Eine Übersetzung des Sanskrit-Textes im Vergleich mit der Pāli-Fassung*. München.
* Zhou, Chungyang 2008. *Das Kaivartisūtra der neuentdeckten Dīrghāgama-Handschrift: Eine Edition und Rekonstruction des Textes*. MA thesis. Göttingen: Georg-August-Universität.
* Zongtse, Champa Thupten 1990. Udānavarga Band III. Der tibetische Text, unter Mitarbeit von Siglinde Dietz herausgegeben von Champa Tupten Zongtse (*Sanskrittexte aus den Turfanfunden X, 3. Abhandlungen der Akademie der Wissenschaften in Göttingen, Philologisch-historische Klasse, Dritte Folge, Nr. 187*). Göttingen: Vandenhoeck & Ruprecht.
* Zürcher, Erik 1995. Obscure Texts on Favourite Topics. Dao’an’s Anonymous Scriptures. In H. Schmidt-Glintzer (ed.), *Das andere China*. Wiesbaden: Harrassowitz, pp. 161–181.

### Vinayaparallelen

* Banerjee, Anukul Chandra. *Sarvāstivāda Literature*, The World Press Private Limited, 1979.
* Banerjee, Anukul Chandra. *Two Buddhist Vinaya Texts in Sanskrit (Prātimokṣa sūtra and Bhikṣukarmavākya)*, The World Press Private Limited, 1977.  
[skt-mu-bu-pm-gbm3.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/5/5cc698a7147e40ce8e6efa6354cf4e63bf4289df.pdf) (11.7 MB)  
SC ID: skt-mu-bu-pm-gbm3.
* Beal, Samuel. *A Catena of Buddhist Scriptures from the Chinese*, Trubner & Co., 1871.
* Chandra, Lokesh. *Unpublished Gilgit Fragment of the Prātimokṣa Sūtra*  
[skt-mu-bu-pm-gbm2.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/a/a36850452675e4fabea360d3ad601ba496920bce.pdf) (3.0 MB)  
SC ID: skt-mu-bu-pm-gbm2.
* Clarke, Shayne. *Vinaya Mātṛkā—Mother of the Monastic codes, or Just Another Set of Lists?*, Indo-Iranian Journal, 44: 77–120, 2004.
* Finot, Louis. *Le Prātimokṣasūtra des Sarvāstivādins*, Journale Asiatique, Nov–Dec, 1913, 465–558. (Including fragment of *bhikṣuṇī prātimokṣa*.)  
[skt-sv-bu-pm-finot.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/0/0de2b67dae51dcec8e29eee49c6890037253de88.pdf) (3.4 MB)
SC ID: skt-sv-bu-pm-finot.
* Frauwallner, E. *The Earliest Vinaya and the Beginnings of Buddhist Literature*, Is. M.E.O. 1956.
* Akira Hirakawa, in collaboration with Zenno Ikuno and Paul Groner: *Monastic Discipline for the Buddhist Nuns, an English translation of the Chinese text of the Mahāsaṁghika Bhiksuṇī Vinaya*, K. P. Jayaswal Research Institute, Patna, 1982.
* Horner, I. B. *The Book of the Discipline*, Pali Text Society, vols. 1–6.
* Kabalsingh, Chatsumarn. *The Bhikkhunī Patimokkha of the Six Schools*, Thammasat University, 1991.
* R. Nishimoto, *Rajū-yaku Jūju Bikuni Haradaimokusha Kaihon no Shutsugen narabini Shobu Sō-Ni Kaihon no Taishō Kenkyū* (a recently discovered Bhipra of the Sarvāstivādins, translated by Kumārajīva, and a comparative study with the Bhipras of the other schools), Ōtani Gakuhō 9.2, 1928, pp. 27 (245)–60 (278) (with comprehensive comparative charts).  
[nishimoto-all-compressed.zip](https://discourse.suttacentral.net/uploads/default/original/2X/9/9cd49b0ed139b2af3457c2475b155edd801bc72e.zip) (27.3 MB).
* Nolot, Edith. *Regles de Discipline des Nonnes Bouddhistes*, College de France, 1991.
* Prebish, Charles S. *A Survey of Vinaya Literature*, Jin Luen Publishing House, Taipei, 1994.
* Pachow, W. *A Comparative Study of the Pratimoksa: On the Basis of its Chinese, Tibetan, Sanskrit and Pali Versions* , Motilal Banarsidass Publishers, 1955.
* Rosen, Valentina. *Comparative Tables of Pratimoksha*  
[Valentina Rosen, comparative tables of pratimoksa.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/6/69e671680c0d219e7d14585209abae0b384c8809.pdf) (1.6 MB).
* Tsomo, Karma Lekshe. *Sisters in Solitude*, State University of New York Press, 1996.
* Rosen, Valentina. *Upāliparipṛcchāsūtra*, Vandenhoeck & Ruprecht, 1984.
* Roth, Gustav. *Bhikṣuṇī Vinaya, including Bhikhṣuṇī Prakīrṇaka and a summary of the Bhikhṣu Prakīrṇaka of the Ārya Mahāsaṁghika Lokuttaravādin*, K. P. Jayaswal Research Institute, Patna, 1970.
* Singh and Kenryo Minow, Sanghasen. *A Critical Edition and Translation of Abhisamācārikā Nāma Bhikhṣu-Prakīrṇakaḥ*, Buddhist Studies, Department of Buddhist Studies, University of Delhi, Vol. XII, 1988.  
[Abhisamacarika ed with trs by Sanghasen and Minowa.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/7/75496923e12ba733c684fa6a55f98653a0dc48e6.pdf) (13.8 MB).
* Tathaaloka, Ayya. *Vinaya Matrix—Reference key to precept numbering*, 2003.
* Vidyabhusana, Satis Chandra. *So-sor-thar-pa; or, a Code of Buddhist Monastic Laws: Being the Tibetan version of Prātimokṣa of the Mūlasarvāstivāda School*, Journal of the Asiatic Society of Bengal, vol. xi, 1915, p. 29ff.  
[bo-mu-bu-pm.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/a/a8a6be946f3ea0bf2dec552df8c15952f241c9bf.pdf) (9.0 MB).
* Waldschmidt, Ernst. *Bruchstücke des Bhikṣuṇī- Prātimokṣa der Sarvāstivādins, mit einer darstellung der Überlieferung des Bhikṣuṇī-Prātimokṣa in den verschiedenen Schulen*, Leipzig, 1926.  
[(Google books)](https://books.google.com.tw/books/about/Bruchst%C3%BCcke_des_Bhik%E1%B9%A3u%E1%B9%87%C4%AB_Pr%C4%81timok.html?id=7UvhOwAACAAJ&redir_esc=y)  
[Waldschmidt, Bruchstucke der Bhiksunipratimoksa.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/9/96f85c4e0d8d1f9105e9c34334adfede261ad383.pdf) (55.2 MB).
* Wille, Klaus. *Survey of the Sanskrit Manuscripts in the Turfan Collection*, Vortrag anläßlich des Workshops Digitalisierung der chinesischen, tibetischen, syrischen und Sanskrit-Texte der Berliner Turfansammlung, Berlin, 02.06.2005  
[Willie - Survey of Buddhist manuscripts in the Turfan collection.pdf](https://discourse.suttacentral.net/uploads/default/original/2X/9/9e4ffab8ef1fb6d9614c00d84d3164efedc0a513.pdf) (96.2 KB).

### Dhammapadaparallelen

* Ānandajoti, Bhikkhu. *Parallels to the Dhammapada Verses* (version 2.3, June 2016). Available, with a list of sources, on the author’s website:  
[www.ancient-buddhist-texts.net/Buddhist-Texts/K2-Dhammapada-Parallels/index.htm](https://www.ancient-buddhist-texts.net/Buddhist-Texts/K2-Dhammapada-Parallels/index.htm).
* Su, Ken. *Correspondence Tables of Chinese Verses among T210, T212 and T213*. Āgama research group.  
[http://yifertwtw.blogspot.tw/](http://yifertwtw.blogspot.com/).
* Bollée, Willem B. *Reverse Index of the Dhammapada, Suttanipāta, Thera- and Therīgāthā Pādas with Parallels from the Āyāraṅga, Sūyagaḍa, Uttarajjhāyā Dasaveyāliya and Isibhāsiyāiṁ*.. Verlag für Orientalistische Fachpublikationen,
Reinbek 1983.
* Falk, Harry. *A new Gāndhārī Dharmapada (Texts from the Split Collection 3)*. [Annual Report of the International Research Institute for Advanced Buddhology, at Soka University for the Academic Year 2014. Vol. XVIII (2015)](iriab.soka.ac.jp/content/pdf/aririab/Vol.%20XVIII%20(2015).pdf).
* Braarvig, Jens & Liland, Fredrik. University of Oslo, Faculty of Humanities.  
[Udānavarga](https://www2.hf.uio.no/polyglotta/index.php?page=volume&vid=71).
