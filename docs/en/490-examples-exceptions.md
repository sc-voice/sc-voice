## Manage examples and word exceptions
### Manage examples
- Add example in <a href="https://github.com/sc-voice/scv-static/tree/main/src/examples" target="_blank">https://github.com/sc-voice/scv-static/tree/main/src/examples</a> in your selected language.
- At pre-scheduled times, scv-static will run a new build and deploy any changes to <a href="https://sc-voice.github.io/scv-static" target="_blank">https://sc-voice.github.io/scv-static</a>. No action is required by the manager.
- Post new examples in the current Voice development thread on D&D to inform other devs.
- In case you want to run a new build manually in scv-static, make sure you run `git pull` and `npm install` first. Then run `scripts/build`.

In order to bring new examples to Voice:
- After they are properly added to scv-static, update content in Voice.
- Reboot server.
- Examples are also updated on version update.

### Manage word exceptions
- Add new exception, i.e. "stamm", on GitHub <a href="https://github.com/sc-voice/scv-bilara/blob/master/src/assets/words-en-exceptions.txt" target="_blank">https://github.com/sc-voice/scv-bilara/blob/master/src/assets/words-en-exceptions.txt</a>
- Pull changes to your computer
- Run `scripts/train` in scv-bilara
- Commit back to GitHub
- Reboot Voice server
- Both scv-bilara and Voice recognize "stamm" as a German word now.
