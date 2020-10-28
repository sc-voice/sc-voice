---
prev: 'Using Voice'
prev_href: '200-using-voice'
prev_aria: 'using voice'
next: 'Sutta Player'
next_href: '201-sutta-player'
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

You can listen to or download audio for the 
suttas listed in the search results. 

##### Language and Translator

If you need a specific translation,
specify the language and translator. For example:

* <kbd>mn1/en/sujato</kbd> is the English translation of MN 1 by Bhikkhu Sujato
* <kbd>mn1/en/bodhi</kbd> is the English translation of MN 1 by Bhikku Bodhi

To search for a different language, change the 
Translation language in Voice Settings.

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

<details><summary><h3>Advanced Search</h3></summary>

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
Voice only searches segmented texts. 
Segmented texts whose verses have been numbered for reference
across multiple translations.
Voice does not search all translations available in SuttaCentral,
however many are working to add more segmented texts.

</details>

