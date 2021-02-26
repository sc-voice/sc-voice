## Editing Pronunciation
With the example of a Pali word for a German voice.

#### A. In Voice (Chrome):
- Ctrl + Shift + i  
- Network  
- Clear all  
- Play sutta, stop as soon as you come to the segment you want to work on.  
- Copy URL underneath "Aditi" and paste in new browser tab.  
  --> audio player that plays this segment isolated from the sutta.  
- Verify the pronunciation you hear is what you want to fix.

#### B. Voice "Sounds" admin page  
- Paste the sound URL from step A into the respective field.  
- Copy the phoneme chunk you need, e.g. `<phoneme alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>`, paste in AWS Polly.

#### C. AWS Polly  
- Use SSML tab.  
- Find prosody of the voice you're editing in sc-voice/words/voices.json.  
  ```
  <speak>
  <prosody rate="-20%" pitch="-10%">
  <phoneme alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>.
  <phoneme alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>.
  </prosody>
  </speak>
  ```

#### D. Phoneme table  
- https://docs.aws.amazon.com/polly/latest/dg/ph-table-german.html  
- Use column "IPA".  
- Be creative!

#### E. (admin) SC-Voice/sc-voice on computer  
- Edit sc-voice/words/voices.json.

#### F. (admin) Update version  
- git pull  
- Edit verdsion in SC-Voice/sc-voice/package.json on computer  
- git commit -am "pacetana"  
- git push  
- Update vesion in Voice staging

---
German voices prosody:
- Marlene: `<prosody rate="-0%" pitch="-0%">`
- Vicki: `<prosody rate="-15%" pitch="-10%">`
- Hans: `<prosody rate="-20%" pitch="-0%">`
