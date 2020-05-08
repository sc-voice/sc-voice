### Staging server crashes when updating software

1. Contact developer about staging server crash
2. Developer will diagnose and provide a new release


Once a new software release is available, 
we'll need to update the server software manually since we don't have the Voice Admin page:

3. Open a new terminal window and login to staging server. For example:
```
ssh -i ~/.aws/sabbamitta-ssh2.pem ubuntu@54.67.25.233
```

4. Type the following:

```
cd sc-voice
./scripts/update-latest -r
```

If everything updated without errors, the server will reboot itself.

After 30 seconds, the staging server should be up and available
