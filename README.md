

<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate" width="200" align="center">
</h1>
 <h4 align="center">Hide your secret Discord messages in other messages!</h4>

<a href="https://github.com/KuroLabs/stegcloak" style="position: absolute; top: 100px; right: 20px; padding: 0 0 20px 20px;"><img src="https://raw.githubusercontent.com/KuroLabs/stegcloak/master/assets/stegCloakIcon.svg" alt="JavaScript Standard Style" width="80" align="right"></a>

Apate is a tool based on [StegCloak](https://github.com/KuroLabs/stegcloak) that allows you to send and read invisible hidden messages through [BetterDiscord](https://betterdiscord.app/). It hides the message using zero width unicode characters and a indicator character at the start of the string. It then goes through all the messages in chat and tries to insert a new `div` with the hidden message.




## Installing
Make sure you have [BetterDiscord](https://betterdiscord.app/) installed. Then just download the Plugin [here](https://betterdiscord.app/Download?id=446) and pull it into your plugins Folder. If you are asked to download the ZeresPluginLibrary, download it. If you see a `There is an update for Apate avalible!` Banner message, click it to fully update Apate. 

## Usage
<img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/demo.gif" alt="Demo" width="500">
</br>

Syntax:
>Cover text \*hidden message*

Click the key button or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send the message.

**Note:**
- There can't be a string after the hidden message. The second `*` should be the last character.

## Passwords
In Apate you can set your own password and then only people that have your password in their list can read your messages. 

**To set your password:** 

Go into `Settings > Plugins > Apate Settings (Cogwheel) > Encryption` and enter the password you want into the Textbox. This will be your default password and all your messages will be encrypted with it, as long as you have Encrpytion on. If you don't want to generate a password yourself, you can hit the `Generate Password` Button. It will create a password out of three english words and then random symbols to make the password both secure and easy to identify.

**To  manage your password list:** 

Go into `Settings > Plugins > Apate Settings (Cogwheel) > Passwords`. 
<br>If you want to add a password, enter it into the Textbox and press `Add Password`. The password should appear in the list below and then Apate should decrypt all messages with that specific password automatically. To remove a password, press the ❌ Symbol.

**Import / Export Password list:**

In case you want to save your password list to make sure you don't lose it you can press the `Download Password list` button. It will promt you to save your list as a `.txt` file. If you then want to import that password list, simply press `Import Password list` and select your file. Notice **ALL YOUR PASSWORDS WILL BE LOST** when you import a new list. Save your password list before importing a new one, just to be sure you dont loose anything. 
Note:
- Your personal password is always automatically in your list (if you used it at least once).
- The more passwords you have in your list, the longer the decryption prosses will take.
- The higher up a password is, the more priority it has (passwords you use often will automatically move up the list).

## Quickly changing between passwords 
By default, the message will be sent with your chosen password (if encrpytion is turned on). If you want to send a message with a different (or no) password once, you can right-click the key on the bottom right to select a password. This will **NOT** change your default password.

## Authors

<img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate Logo" width="80" align="right"></img>
><a href="https://github.com/TheGreenPig"><img src="https://github.com/thegreenpig.png?size=60"><p>TheGreenPig</p></a>
><a href="https://github.com/fabJunior"><img width="60" height="60" src="https://cdn.discordapp.com/avatars/517142662231359488/a_575e07e409428a9ceb90022d0443d304.webp?size=256"><p>Kehto</p></a>
><a href="https://github.com/BenjaminAster"><img src="https://github.com/BenjaminAster.png?size=60"><p>BenjaminAster</p></a>

## Contributors
><img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate Logo" width="80" align="right"></img>
><a href="https://github.com/gurrrrrrett3"><img width="60" height="60" src="https://github.com/gurrrrrrett3.png?size=60"><p>gurrrrrrett3</p></a>



