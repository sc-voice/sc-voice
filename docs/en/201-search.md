---
prev: 'Using Voice'
prev_href: '200-using-voice'
prev_aria: 'using voice'
---

## Understanding Search

<details><summary><h3>Suttas, Phrases and Keywords</h3></summary>
Voice searches for suttas, phrases or keywords in 
translated or Pali documents.

<details><summary><h4>Sutta Search</h4></summary>
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

<details><summary><h4>Phrase Search</h4></summary>
Enter an exact phrase in upper or lower case to find suttas with that phrase. For example: <kbd>root of suffering</kbd>. For Pali searches, enter the romanized phrase such as: <kbd>nandi dukkhassa mulan</kbd>
</details><!--COMMENT: Phrase Search-->

<details><summary><h4>Keyword Search</h4></summary>
If you can't remember the exact phrase, 
simply enter the words you know separated by spaces. 
Voice will find the suttas having all the search words.
For example: <kbd>suffering root</kbd>.
Keyword search is slower than phrase search and will return more results.
</details><!--COMMENT: Keyword search-->
</details><!--COMMENT: Suttas, phrases and keywords-->

<details><summary><h3>Search Results</h3></summary>
<details><summary><h4>Sorting Search Results</h4></summary>
Search results are sorted in descending order by relevance score. Relevance is calculated based on:

* *M*: The more matches, the more relevance. This will be 1 or greater for a matching sutta.
* *F*: The fraction of matching translation segments. A short sutta with a few matches is more relevant than a larger suttas with the same number of matches. This number will always be less than 1.

The relevance score is simply **M+F**. For example, a 100 segment sutta with 2 matching segments would have a relevance score of: 

```
2 + 2/100 = 2 + 0.02 = 2.02
``` 

NOTE: Segments are the smallest units of text such as a single sentence, phrase or short paragraph structured according to semantic units in the root text (Pali).  (See [Segmentation Technology](/sc-voice/en/301-segmentation))
</details><!--COMMENT: Sorting Search Results-->

<details><summary><h4>Number of Search Results </h4></summary>
Voice normally returns up to 5 search results.
Use [Settings](201-settings) to increase the maximum search results.
It takes longer to show more results.
</details><!--COMMENT:Number of Search Results-->
</details><!--COMMENT: Search Results-->


<details><h3><summary>Advanced Search</h3></summary>
#### Regular expressions
Many people on SuttaCentral have been using `grep` for search. 
The `grep` program is very powerful and supports the ability to match 
[regular expressions](https://www.google.com/search?q=grep+-E+option). 
SuttaCentral Voice supports grep regular expressions (e.g., `root.*suffering`).

#### Alternate spellings
Keyword searches are normally restrictive in that all keywords must be present 
for a sutta to qualify as a search result.
Sometimes however, one needs to search for all alternate spellings.
For example, the search for "bodhisattva" and the search for "bodhisatta" both
return results, but the search for "bodhisattva bodhisatta" returns nothing because
no sutta uses both spellings.

To search for all alternate spellings, use the vertical bar "|" to separate
alternates. For example, searching for "bodhisattva|bodhisatta" returns
all suttas with either spelling.
</details><!--COMMENT: Advanced Search-->

<details>
    <summary><h3>Advanced Search</h3></summary>
You can customize search with advanced settings. 
Advanced settings are prefixed with a minus sign, "-":

* **-sl ISO_LANG_2**  Set search language, e.g.: <kbd>-sl de</kbd> chooses Deutsch
* **-d NUMBER**  Set maximum result documents, e.g.: <kbd>-d 50</kbd> finds up to 50 suttas
* **-ml 3**  Require trilingual results.
* **-tc:mn** Restrict search results to Majjhima Nikaya. See [[Tipitaka Categories]]

##### Tipitaka category
Voice search can filter results by *Tipitaka category*. 
To search by Tipitaka category, you 
will need to use the `-tc` option in your search string. 
For example, to search Digha Nikaya and Saṃyutta Nikāya.

```
-tc:dn,sn root of suffering
```

| Abbreviation | Tipitaka Category |
| :-----: | :-----: |
| ab | Abhidhamma |
| an | Aṅguttara Nikāya |
| as | Adhikaraṇasamatha |
| ay | Aniyata |
| bi | Bhikkhuni |
| bu | Bhikkhu |
| dn | Dīgha Nikāya |
| kd | Khandhaka |
| kn | Khuddaka Nikāya |
| mn | Majjhima Nikāya |
| ms | Mahasaṅgīti Tipiṭaka |
| np | Nissaggiya Pācittiya |
| pc | Pācittiya |
| pd | Pātidesanīya |
| pj | Pārājika |
| pvr | Parivāra | 
| prv | Parivāra | 
| sk | Sekhiya |
| sn | Saṃyutta Nikāya |
| ss | Saṅghādisesa |
| su | Sutta |
| thag | Theragāthā |
| thig | Therīgāthā |
| tv | Theravāda |
| vb | Vibhaṅga |
| vin | Vinaya |
</details>

### FAQ
##### Why are my results different than SuttaCentral.net search?
**SuttaCentral Voice search includes only supported texts; legacy texts are not being searched.**
SuttaCentral Voice search is different than SuttaCentral.net search. By design, SuttaCentral Voice search only shows suttas with topmost relevance score and will not show all the results shown by SuttaCentral.net search. Unlike SuttaCentral.net, SuttaCentral Voice search does not return results from outside the four main Nikayas of the Pali canon and the early parts of the Khuddaka Nikaya. (The Vinaya texts will be included as soon as they are available in segmented form.) Since visual scanning of search results is difficult or impossible for the assisted user, the design prioritizes simple utility over exhaustive results to avoid overwhelming the user.

##### Why can't I find the search term in one of my search results?
SuttaCentral Voice searches sutta text as well as annotational text (i.e., "blurbs") attached to the sutta. For example, searching for "study" returns SN55.53, which has "study" only in the editorial annotation.
