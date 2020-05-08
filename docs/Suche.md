**Die SuttaCentral Voice-Suche umfasst nur unterstützte Texte; Alttexte werden nicht durchsucht.**

Die einfachste Anleitung für die Suchfunktion lautet: „Tippe ein, was du hören möchtest.“ Wenn das nicht ausreicht, kann dieses Dokument helfen.

### Die Suchfunktion verstehen
Die Suche auf SuttaCentral Voice umfasst verschiedene Suchstrategien in folgender Rangfolge:

1. **Suche nach einem Sutta:** Wenn Sie das Kürzel für ein Sutta kennen, erscheint dieses Sutta als Ergebnis; z. B. „mn1“, „MN 1“.
1. **Suche nach einer Wendung:** Geben Sie Text ein, der kein Kürzel für ein Sutta darstellt, wird nach dieser Wendung im Wortlaut gesucht; z. B. „Gold und Silber“, „wurzel des leidens“ (Groß- oder Kleinschreibung spielt keine Rolle).
1. **Suche nach Schlüsselwörtern:** Führt eine Suche nach dem Wortlaut nicht zum Erfolg, wird der Suchtext anhand der Leerzeichen in einzelne Wörter zerlegt, und es werden Suttas angezeigt, die ALLE Wörter enthalten; z. B. „gold silber“, „was ist die wurzel des leidens“. Der in den Beispielen angegebene Text kann nicht als Wendung im Wortlaut gefunden werden, aber es können Ergebnisse gefunden werden, die sowohl „gold“ als auch „silber“ enthalten, bzw. „was“, „ist“, „die“, „wurzel“, „des“ und „leidens“. Da die einzelnen Wörter an unterschiedlichen Stellen im Sutta auftreten können, kann es sein, dass das Suchergebnis nicht dem gesuchten Thema entspricht.

Da mehrere Suchstrategien ablaufen, beeinflusst Ihre Eingabe das Suchergebnis. Suche nach einem Sutta ist die schnellste und Suche nach Schlüsselwörtern die langsamste Suchstrategie (da die beiden anderen Strategien zuvor ohne Erfolg versucht worden sind). Suche nach einer Wendung ist chirurgisch genau, wohingegen Suche nach Schlüsselwörtern ein breiteres Spektrum an Möglichkeiten abdeckt.

#### Suche nach einem Sutta
Suttas sind unverwechselbar gekennzeichnet durch die Kombination von *Sutta-UID, Sprache und Übersetzer*. Im Folgenden einige Beispiele:

* `sn12.2/de/sabbamitta` ist das zweite Sutta im zwölften Samyutta des Samyutta Nikaya (SN 12.2) in Anagarika Sabbamittas deutscher Übersetzung.
* `sn12.2/de/geiger` ist das zweite Sutta im zwölften Samyutta des Samyutta Nikaya (SN 12.2) in Wilhelm Geigers deutscher Übersetzung.

Die gezeigte Darstellungsart wird auf SuttaCentral benutzt und ist wegen ihrer Knappheit zweckdienlich. Sie können auch die häufig übliche Schreibweise mit Großbuchstaben und Leerzeichen verwenden:

* `SN 12.2/de/sabbamitta`
* `SN 12.2/de/geiger`

Sprache und Übersetzername können ausgelassen werden. Die voreingestellte Sprache ist Deutsch („de“). Die Voreinstellung für den Übersetzer wird von der ersten unterstützten Übersetzung in der jeweiligen Sprache hergeleitet (siehe [Support-Richtlinien](https://github.com/sc-voice/sc-voice/wiki/Support%E2%80%90Richtlinien)). Eine Alt-Übersetzung wird gezeigt, wenn es keine unterstützte Übersetzung gibt, und kann Aussprache- oder Schreibfehler enthalten. (Alt-Übersetzungen werden sukzessive durch unterstützte Übersetzungen ersetzt, sobald diese vorliegen.) Sprache und Übersetzer werden als Prioritäten behandelt, und wenn die eingegebene Kombination zu keinem Ergebnis führt, werden Alternativen angeboten, wenn welche gefunden werden.

Beispiele:

* `SN 12.2` ist äquivalent zu `sn12.2/de/sabbamitta` (unterstützt)
* `MN 1` ist zur Zeit noch äquivalent zu `mn1/de/mettiko` (Alt)
* `sn12.2/de/sujato` ist zur Zeit noch äquivalent zu `sn12.2/de/geiger` (Alternative)

Manchmal besteht ein Suttadokument aus mehreren kurzen Suttas. Sie können die ID eines bestimmten Suttas eingeben oder die einer ganzen Reihe und erhalten jeweils das gleiche Ergebnis:

* `AN 1.1-10` zeigt das Dokument, das die Suttas von AN 1.1 bis AN 1.10 enthält.
* `AN 1.2` zeigt ebenfalls das Dokument, das die Suttas von AN 1.1 bis AN 1.10 enthält.
* `an1.2` zeigt ebenfalls das Dokument, das die Suttas von AN 1.1 bis AN 1.10 enthält.

Sie können auch mehrere Suttas für Ihre persönliche Wiedergabeliste zusammenstellen. Wenn mehrere Suttas als Ergebnis angezeigt werden, sind sie normalerweise alphabetisch geordnet. In diesem Fall werden sie jedoch in der gewünschten Reihenfolge angezeigt:

* `MN23, SN12.3, AN4.85`

#### Suche nach Palitext
Wenn Sie Palitext in das Suchfeld eingeben, spielen diakritische Zeichen für das Suchergebnis keine Rolle. Die Anzahl und Reihenfolge der Buchstaben muss jedoch korrekt sein.

#### Anordnung nach Relevanz
Suchergebnisse werden nach Relevanzwert in absteigender Reihenfolge angeordnet. Der Relevanzwert berechnet sich folgendermaßen:

* *T (Treffer)*: Je mehr Treffer, umso höher der Relevanzwert. Dieser Wert ist stets eine ganze Zahl und ist 1 oder größer für jedes Sutta mit Treffer(n).
* *V (Verhältnis)*: Das Verhältnis zwischen Anzahl der Treffer und Anzahl der Segmente. Ein kurzes Sutta mit einigen Treffern hat eine höhere Relevanz als ein langes Sutta mit der gleichen Anzahl an Treffern. Dieser Wert ist immer ein Bruchteil von 1. Ein Sutta mit 100 Segmenten, das 2 Treffer für den Suchbegriff enthält, hätte einen V-Wert von zwei Hundertstel.

Der Relevanzwert ergibt sich einfach als **Summe T + V**. Ein Sutta mit 100 Segmenten, das 2 Treffer für den Suchbegriff enthält, hätte dann:

`2 + 2/100 = 2 + 0,02 = 2,02`

ANMERKUNG: Segmente sind die kleinsten Texteinheiten wie ein Satz, eine Wendung oder ein kurzer Abschnitt und sind nach den semantischen Einheiten des Quelltextes (Pali) gegliedert (siehe [Segmentierungstechnik](https://github.com/sc-voice/sc-voice/wiki/Segmentierungstechnik)).

#### Reguläre Ausdrücke
Viele Benutzer von SuttaCentral nutzen Grep für die Suche. Das Grep-Programm ist sehr leistungsstark und unterstützt auch die Möglichkeit, Treffer über [reguläre Ausdrücke](https://www.google.com/search?q=grep+-E+option) zu finden. SuttaCentral Voice unterstützt Grep mit regulären Ausdrücken (z. B. `wurzel.*leiden`).

#### Alternative Schreibweisen
Die Suche nach Schlüsselwörtern hat normalerweise die Einschränkung, dass alle Schlüsselwörter vorkommen müssen, damit ein Sutta als Suchergebnis in Frage kommt. Manchmal muss man jedoch nach verschiedenen alternativen Schreibweisen suchen, von denen dann nur eine in einem bestimmten Sutta vorkommt. Zum Beispiel bringt sowohl die Suche nach „bodhisattva“ als auch die nach „bodhisatta“ Ergebnisse, nicht aber die Suche nach „bodhisattva bodhisatta“, da nirgends beide Schreibweisen vorkommen.

Um nach allen alternativen Schreibweisen zu suchen, fügen Sie bitte den senkrechen Strich „|“ zwischen die Alternativen ein. Die Suche nach „bodhisattva|bodhisatta“ zum Beispiel zeigt alle Suttas, in denen eine der beiden Schreibweisen vokommt.

#### Anzahl der Suchergebnisse
Die Anzahl der Suchergebnisse ist zunächst auf 5 begrenzt. Die Ergebnisse zu begrenzen, bringt Ihnen rasch ein Ergebnis. Wenn Sie mehr Suchergebnisse wünschen, können Sie die maximale Anzahl in den Einstellungen ändern: *Einstellungen:Suchergebnisse*.

#### Sutta-Wiedergabelisten

![download link](https://github.com/sc-voice/sc-voice/blob/master/src/assets/wiedergabeliste.png)

Sie können die Suttas hören, die als Suchergebnisse aufgeführt sind. Klicken Sie einfach auf „Wiedergabe“ direkt unter der Zusammenfassung der Suchergebnisse.

#### Erweiterte Suche
Sie können die Suche mit erweiterten Einstellungen anpassen. Erweiterten Einstellungen wird ein Minuszeichen vorangestellt: „-“.

* **-sl ISO_LANG_2**  Legt die Sprache für die Suche fest, z. B.: <kbd>-sl de</kbd> wählt Deutsch
* **-d NUMBER**  Legt die maximale Zahl der Ergebnisse fest, z. B.: <kbd>-d 50</kbd> findet bis zu 50 Suttas
* **-ml 3**  Ergebnisse müssen in drei Sprachen vorliegen

### FAQ
##### Warum unterscheiden sich meine Suchergebnisse von denen auf SuttaCentral.net?
Die SuttaCentral Voice-Suche unterscheidet sich von der Suche auf SuttaCentral.net. Bei SuttaCentral Voice ist die Suche so angelegt, dass nur Suttas mit den höchsten Relevanzwerten gezeigt werden. Anders als SuttaCentral.net zeigt SuttaCentral Voice auch keine Ergebnisse von außerhalb der vier Hauptnikayas des Palikanon und der frühen Teile des Khuddaka Nikaya. (Die Vinaya-Texte sollen eingeschlossen werden, soblad sie in segmentierter Form vorliegen.) Da für Benutzer, die auf Zugangshilfen angewiesen sind, ein visuelles Überfliegen der Suchergebnisse mühsam oder unmöglich ist, räumt das Design von Voice der leichten Benutzbarkeit Vorrang ein vor der Vollständigkeit der Ergebnisse, um Benutzer nicht zu überfluten.

##### Weshalb kann ich den Suchbegriff in einem meiner Suchergebnisse nicht finden?
SuttaCentral Voice durchsucht sowohl den Suttatext als auch den Einführungstext, der dem Sutta beigefügt ist. Zum Beispiel zeigt der Suchbegriff „Glieder“ SN 12.2 an, bei dem der Begriff nur in der redaktionellen Einführung vorkommt.