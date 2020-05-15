---
next: 'Using Voice'
next_href: '200-using-voice'
next_aria: 'using voice'
---

## Understanding Search

<details><summary><h3>Search by Sutta</h3></summary>
To show a specific sutta, enter the sutta acronym, such as: 
<kbd>AN12.23</kbd>

For a longer playlist, enter a comma separated list of suttas such as:
<kbd>SN12.22, SN12.23</kbd>

Use a dash to indicate a range of suttas such as:
<kbd>SN12.22-23</kbd>

![picture of playlist example](https://github.com/sc-voice/sc-voice/blob/master/src/assets/play-all-de.png?raw=true)

You can listen to the suttas listed in the search results. Just click "Play" directly under the result summary.

##### Language and Translator
Suttas have multiple translations in different languages 
and by different translators.
Voice lets you specify language as well as translator.
sutta identifier, language, translator.
For example, following are designations for different documents:

* `mn1/en/sujato` is the English translation of MN 1 by Bhikkhu Sujato
* `mn1/en/bodhi` is the English translation of MN 1 by Bhikku Bodhi

The above notation is a SuttaCentral convention 
that is convenient for its terseness.
You can also use commonly accepted abbreviations with 
spaces and alternate capitalization:

* `MN 1/en/sujato`
* `MN 1/en/bodhi`
* `Sn 1.1/en/sujato`

The language and translator name can be omitted. 
The default language is English (i.e., 'en').
The default translator is inferred from the first 
Supported translation (see [[Support Policy]]).
A Legacy translation is only returned if there is no 
Supported translation and may contain mispronunciations or misspellings.
Lastly, language and translator are taken as preferences, 
and in case the combination entered will not lead to a result,
alternates will be provided if found:

* `MN 1` is equivalent to `mn1/en/sujato` (Supported)
* `Sn1.1` is equivalent to `sn1.1/en/sujato` (Supported)
* `sn12.3/de/sujato` is equivalent to `sn12.3/de/geiger` (Alternate)

Sutta documents sometimes combine multiple short suttas into a single document. You can enter the specific sutta directly by number or use the entire range:

* `AN 1.1-10` returns the document having suttas AN 1.1 through AN 1.10
* `AN 1.2` also returns the document having suttas AN 1.1 through AN 1.10
* `an1.2` also returns the document having suttas AN 1.1 through AN 1.10

You can also enter a list of suttas for a playlist. When multiple suttas are returned, they are normally shown alphabetically. However, in this case, the suttas returned will be ordered as requested:

* `MN1, SN2.3, AN1.1`
</details><!--COMMENT: Sutta Search-->

<details><summary><h3>Search by Phrase</h3></summary>

Enter an exact phrase in upper or lower case 
to find suttas with that phrase. 
For example: <kbd>root of suffering</kbd>.

For Pali searches, enter the romanized phrase such as:
<kbd>nandi dukkhassa mulan</kbd>

Enter partial phrases if you are uncertain about word endings:
<kbd>nandi dukkha</kbd>
</details><!--COMMENT: Phrase Search-->

<details><summary><h3>Search by Keyword</h3></summary>

If you can't remember the exact phrase, 
simply enter the words you know separated by spaces. 
Voice will find the suttas having all the search words.
For example: <kbd>suffering root</kbd>.

Keyword search is slower than phrase search and will return more results.
</details><!--COMMENT: Keyword search-->

<details><summary><h3>Search Results</h3></summary>

Search results are sorted by relevance.
The relevance score is simply the sum of the number of matches plus 
the fraction of matching segments.
Suttas densely packed with search terms have highest relevance.

Voice normally returns up to 5 search results.
Use [Settings](201-settings) to increase the maximum search results.
It takes longer to show more results.
</details><!--COMMENT:Number of Search Results-->

<details>><summary><h3>Advanced Search</h3></summary>

#### Regular expressions

Many people on SuttaCentral have been using `grep` for search. 
The `grep` program is very powerful and supports the ability to match 
[regular expressions](https://www.google.com/search?q=grep+-E+option). 
SuttaCentral Voice supports grep regular expressions (e.g., `root.*suffering`).

#### Search Parameters

You can customize search with advanced settings. 
Advanced settings are prefixed with a minus sign, "-":

* **-sl ISO_LANG_2**  Set search language, e.g.: <kbd>-sl de</kbd> chooses Deutsch
* **-d NUMBER**  Set maximum result documents, e.g.: <kbd>-d 50</kbd> finds up to 50 suttas
* **-ml 3**  Require trilingual results.
* **-tc:mn** Restrict search results to Majjhima Nikaya. 

| Parameter | Search |
| :-----: | :-----: |
| -tc:ab | Abhidhamma |
| -tc:an | Aṅguttara Nikāya |
| -tc:as | Adhikaraṇasamatha |
| -tc:ay | Aniyata |
| -tc:bi | Bhikkhuni |
| -tc:bu | Bhikkhu |
| -tc:dn | Dīgha Nikāya |
| -tc:kd | Khandhaka |
| -tc:kn | Khuddaka Nikāya |
| -tc:mn | Majjhima Nikāya |
| -tc:ms | Mahasaṅgīti Tipiṭaka |
| -tc:np | Nissaggiya Pācittiya |
| -tc:pc | Pācittiya |
| -tc:pd | Pātidesanīya |
| -tc:pj | Pārājika |
| -tc:pvr | Parivāra | 
| -tc:prv | Parivāra | 
| -tc:sk | Sekhiya |
| -tc:sn | Saṃyutta Nikāya |
| -tc:ss | Saṅghādisesa |
| -tc:su | Sutta |
| -tc:thag | Theragāthā |
| -tc:thig | Therīgāthā |
| -tc:tv | Theravāda |
| -tc:vb | Vibhaṅga |
| -tc:vin | Vinaya |
</details>

<details><summary><h3>Frequently Asked Questions</h3></summary>
#### Why are my results different than SuttaCentral.net search?
**SuttaCentral Voice search includes only supported texts; legacy texts are not being searched.**
SuttaCentral Voice search is different than SuttaCentral.net search. By design, SuttaCentral Voice search only shows suttas with topmost relevance score and will not show all the results shown by SuttaCentral.net search. Unlike SuttaCentral.net, SuttaCentral Voice search does not return results from outside the four main Nikayas of the Pali canon and the early parts of the Khuddaka Nikaya. (The Vinaya texts will be included as soon as they are available in segmented form.) Since visual scanning of search results is difficult or impossible for the assisted user, the design prioritizes simple utility over exhaustive results to avoid overwhelming the user.
</details>

