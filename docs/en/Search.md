**SuttaCentral Voice search includes only supported texts; legacy texts are not being searched.**

The simplest instruction for using search is "just type what you want."
When that no longer suffices, this document may help.

### Understanding search
SuttaCentral Voice search comprises different search strategies prioritized as follows:

1. **Sutta Search:** if you enter the acronym for a sutta, it will be returned. E.g., "mn1", "MN 1".
1. **Phrase Search:** if you enter text that is not an acronym for a sutta, that text is used for a verbatim phrase search. E.g., "blue, yellow", "root of suffering".
1. **Keyword Search:** if a verbatim search is unsuccessful, the search text will be broken up into "words" as separated by spaces. Suttas having ALL the words will be shown. For example, there are no suttas having the phrases "blue yellow" or "what is the root of suffering". The text in these examples cannot be found verbatim, but there are suttas that have both "blue" and "yellow". There are also suttas containing all the words: "what", "is", "the", "root", "of", and "suffering". Since the words found can be anywhere in the sutta, keyword search often returns suttas unrelated to a desired search topic.

Since there are multiple search strategies, what you type affects your search results.
Sutta search is fastest and keyword search is the slowest 
(because the other two search strategies will have been tried and failed).
Phrase search is surgically precise while keyword search is generally helpful in its loose interpretation of what is relevant.

#### Sutta Search
Suttas are uniquely identified by the combination of _sutta_uid, language, translator_. For example, following are designations for different documents:

* `mn1/en/sujato` is the English translation of MN 1 by Bhikkhu Sujato
* `mn1/en/bodhi` is the English translation of MN 1 by Bhikku Bodhi

The above notation is a SuttaCentral convention that is convenient for its terseness. You can also use commonly accepted abbreviations with spaces and alternate capitalization:

* `MN 1/en/sujato`
* `MN 1/en/bodhi`
* `Sn 1.1/en/sujato`

The language and translator name can be omitted. The default language is English (i.e., 'en'). The default translator is inferred from the first Supported translation (see [[Support Policy]]). A Legacy translation is only returned if there is no Supported translation and may contain mispronunciations or misspellings. Lastly, language and translator are taken as preferences, and in case the combination entered will not lead to a result, alternates will be provided if found:

* `MN 1` is equivalent to `mn1/en/sujato` (Supported)
* `Sn1.1` is equivalent to `sn1.1/en/sujato` (Supported)
* `sn12.3/de/sujato` is equivalent to `sn12.3/de/geiger` (Alternate)


Sutta documents sometimes combine multiple short suttas into a single document. You can enter the specific sutta directly by number or use the entire range:

* `AN 1.1-10` returns the document having suttas AN 1.1 through AN 1.10
* `AN 1.2` also returns the document having suttas AN 1.1 through AN 1.10
* `an1.2` also returns the document having suttas AN 1.1 through AN 1.10

You can also enter a list of suttas for a playlist. When multiple suttas are returned, they are normally shown alphabetically. However, in this case, the suttas returned will be ordered as requested:

* `MN1, SN2.3, AN1.1`

#### Search for Pali text
When entering Pali text in the search box the diacritical marks don't matter for the search result. However the number and order of letters need to be correct.

#### Scoring relevance
Search results are prioritized in descending order by relevance score. Relevance is calculated based on:

* *M*: The more matches, the more relevance. This will be 1 or greater for a matching sutta.
* *F*: The fraction of matching translation segments. A short sutta with a few matches is more relevant than a larger suttas with the same number of matches. This number will always be less than 1.

The relevance score is simply **M+F**. For example, a 100 segment sutta with 2 matching segments would have a relevance score of: 

```
2 + 2/100 = 2 + 0.02 = 2.02
``` 

NOTE: Segments are the smallest units of text such as a single sentence, phrase or short paragraph structured according to semantic units in the root text (Pali).  (See [Segmentation Technology](/sc-voice/en/Segmentation-Technology))

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

#### Number of Search Results 
The number of search results is constrained initially to 5. Limiting search results gives you something useful quickly. 
If you need more search results, just change the maximum in 
_Settings:Search results_

#### Sutta Playlists
![download link](https://github.com/sc-voice/sc-voice/blob/master/src/assets/play-all-de.png?raw=true)

You can listen to the suttas listed in the search results. Just click "Play" directly under the result summary.

#### Advanced Search
You can customize search with advanced settings. Advanced settings are prefixed with a minus sign, "-":

* **-sl ISO_LANG_2**  Set search language, e.g.: <kbd>-sl de</kbd> chooses Deutsch
* **-d NUMBER**  Set maximum result documents, e.g.: <kbd>-d 50</kbd> finds up to 50 suttas
* **-ml 3**  Require trilingual results.
* **-tc:mn** Restrict search results to Majjhima Nikaya. See [[Tipitaka Categories]]

### FAQ
##### Why are my results different than SuttaCentral.net search?
SuttaCentral Voice search is different than SuttaCentral.net search. By design, SuttaCentral Voice search only shows suttas with topmost relevance score and will not show all the results shown by SuttaCentral.net search. Unlike SuttaCentral.net, SuttaCentral Voice search does not return results from outside the four main Nikayas of the Pali canon and the early parts of the Khuddaka Nikaya. (The Vinaya texts will be included as soon as they are available in segmented form.) Since visual scanning of search results is difficult or impossible for the assisted user, the design prioritizes simple utility over exhaustive results to avoid overwhelming the user.

##### Why can't I find the search term in one of my search results?
SuttaCentral Voice searches sutta text as well as annotational text (i.e., "blurbs") attached to the sutta. For example, searching for "study" returns SN55.53, which has "study" only in the editorial annotation.
