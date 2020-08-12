## Editing Pronunciation
With the example of a Pali word for a German voice.

A. In Voice (Chrome): Ctrl + Shift + i
Network
Clear all
Play sutta, stop as soon as you come to the segment you want to work on
Copy URL underneath "Aditi" and past in new browser tab
--> audio player that plays this segment isolatred from the sutta
Verify the pronunciation you hear is what you want to fix.

B. Voice logs
Current date, scroll to the bottom, look for "serviceSynthesize"
Copy phoneme chunk you need, e.g. <phoneme alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>, paste in AWS Polly (remove back slashes)

C. AWS Polly
Use SSML tab
Find prosody of the voice you're editing in sc-voice/words/voices.json
<speak>
<prosody rate="-20%" pitch="-10%">
<phoneme>alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>.
<phoneme>alphabet="ipa" ph="pɐcetɐna">Pacetana</phoneme>.
</prosody>
</speak>

D. Phoneme table
https://docs.aws.amazon.com/polly/latest/dg/ph-table-german.html
Be creative!

E. SC-Voice/sc-voice on computer
Edit sc-voice/words/voices.json

F. Update version
git pull
Edit verdsion in SC-Voice/sc-voice/package.json on computer
git commit -am "pacetana"
git push
Update vesion in Voice staging
