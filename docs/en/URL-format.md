### Sutta Web Page (v0.5.0)
The SC-Voice URL path for a sutta web page specifies the sutta id and settings. The path has the following format:
```
/scv/#/?iVoice=0&showId=false&search=mn1%2Fen%2Fsujato
```
In the above, we have:

 | Parameter | Description | Required | Values |
 | :---- | :---- | :---: | :---- |
 | **iVoice** | The voice index | -- | 0, 1 |
 | **lang** | Preferred langage | -- | `en` |
 | **showId** | Show SuttaCentral ID option | -- | false, true |
 | **search** | SuttaCentral reference for a specific sutta | yes | E.g., `mn1/en/sujato` |
 | scid | SuttaCentral ID of a sutta | DEPRECATED | mn1, an2.1-10, ... |

Most settings are optional, so the following are valid:
```
/scv/#/?search=mn1%2Fen%2Fsujato
/scv/#/?search=an2.1-10
```