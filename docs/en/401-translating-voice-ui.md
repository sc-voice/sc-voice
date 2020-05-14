### Translating Voice User Interface
Voice supports many contemporary languages
and the list of supported languages is growing.
If the Voice web page doesn't support your language,
please do consider helping us translate the Voice web pages
to your own native language. 

Help us build a bridge for the world to hear and see 
the words of the Buddha recorded and translated on 
[https://suttacentral.net](SuttaCentral). 
Furthermore, since Voice is designed to be audio accessible,
you will be helping to build a bridge especially for 
those with visual disabilities.

### Overview
The process of web pages in different languages is known as **internationalization**, which is such a large mouthful of letters that some of us affectionately refer to this as **i18n**, omitting eighteen of the mouthful of letters. Voice uses the [Vuetify 2.0](https://vuetifyjs.com/en/) Javascript web framework, which was released in 2019 with i18n support. 

For each language, Vuetify relies on a single dictionary file for that language to look up the local translation for an i18n phrase. This process is called [localization (l10n?)](https://www.w3.org/International/questions/qa-i18n). Indeed, you will be creating the localization file for your own language. Let's see how this works.

The first localization (**l10n**?) file created was the English [i18n/vuetify/en.ts](https://github.com/sc-voice/sc-voice/blob/master/src/i18n/vuetify/en.ts). That localization file is written in the [JSON](https://www.json.org/) language, which is just a formal way to represent information for both machines and humans. You will be programming in JSON. All that really means is that you'll need to be careful and mindful writing correct JSON--one misplaced character can crash the server.  Although you can certainly use any text editor or word processor to edit JSON, you may find it helpful to use an editor that will guide your JSON editing. For example, you could use [http://jsoneditoronline.org/](http://jsoneditoronline.org/).

All Voice needs to support your language is that localization file. For example, the localization file for Deutsch created by Anagarika Sabbamitta is [i18n/vuetify/de.ts](https://github.com/sc-voice/sc-voice/blob/master/src/i18n/vuetify/de.ts)

For further guidelines and resources check [this thread on Voice UI translation](https://discourse.suttacentral.net/t/wanted-translator-for-sc-voice-interface/13928) on our discussion forum. You may also benefit from others' questions.

### Localization JSON
The localization file format is:

```
{
     ...
    "translation-group" : {
        "phraseA": "translation-for-phraseA",
        "phraseB": "translation-for-phraseB",
        ...
        "phraseZ": "translation-for-phraseZ"
    }, 
    ...
}
```

To make your own translation file, just copy [i18n/vuetify/en.ts](https://github.com/sc-voice/sc-voice/blob/master/src/i18n/vuetify/en.ts) and change all the text to the right of each colon. That's it!

### Saving your file

There are several options for saving your ongoing work:

* Save to a file on your computer. This is least work for you. Send us your file when you are ready. That's it!
* Become an [SC Voice Administrator](/sc-voice/en/SuttaCentral-Voice-Administration) and save your file directly to Github. This is least work for us and you will also be able to help out with day-to-day Voice activities. Contact Anagarika Sabbamita (@sabbamitta on [SuttaCentral's discussion forum](https://discourse.suttacentral.net/)) for more information.

### Testing your work

It may be fun to collaborate with others in translating your language. You will be able to cross-check your work with other native speakers. An alternative is to ask for help from non-native speakers who would use Google translate to review your work. 

All work to be tested goes on the [Voice staging server](https://35.176.116.11/scv/index.html#/sutta). Ignore the security warning--we could probably make it go away, but nobody has had the time to deal with SSL certificates for staging. The charm of using a staging server is that we can make frequent releases for testing. This is also why being an SC Voice adminstrator will be helpful, since it is the admins who perform each release on a Voice server.

### Questions

Contact any Voice administrator in [SuttaCentral Discuss & Discover](https://discourse.suttacentral.net/t/wanted-translator-for-sc-voice-interface/13928/11) for more information.

And once again...

Thank you!

The Voice administrators

🙏 

@sabbamitta
@aminah
@michaelh
@karl_lew




