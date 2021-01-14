## Manage examples and word exceptions
### Manage examples
Add example in https://github.com/sc-voice/scv-static/tree/main/src/examples in your selected language.

At pre-scheduled times, scv-static will run a new build and deploy any changes to https://sc-voice.github.io/scv-static. No action is required by the manager.
### Manage word exceptions
- Add new exception, i.e. "stamm", on GitHub https://github.com/sc-voice/scv-bilara/blob/master/src/assets/words-en-exceptions.txt
- Pull changes to your computer
- Run scripts/train in scv-bilara
- Commit back to GitHub
- Reboot Voice server
- Both scv-bilara and Voice recognize "stamm" as a German word now.
