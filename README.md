

<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate" width="200" align="center">
</h1>
 <h4 align="center">Hide your secret Discord messages in other messages!</h4>

<a href="https://github.com/KuroLabs/stegcloak" style="position: absolute; top: 100px; right: 20px; padding: 0 0 20px 20px;"><img src="https://raw.githubusercontent.com/KuroLabs/stegcloak/master/assets/stegCloakIcon.svg" alt="JavaScript Standard Style" width="80" align="right"></a>

Apate is a tool based on [StegCloak](https://github.com/KuroLabs/stegcloak) that allows you to send and read invisible hidden messages through [BetterDiscord](https://betterdiscord.app/). It hides the message using zero width unicode characters and a indicator character at the start of the string. It then goes through all the messages in chat and tries to insert a new `div` with the hidden message.




## Installing
Make sure you have [BetterDiscord](https://betterdiscord.app/) installed. Then just download the Plugin [here](https://github.com/TheGreenPig/Apate/releases/latest/download/Apate.plugin.js) and pull it into your plugins Folder. If you are asked to download the ZeresPluginLibrary, download it. Then go to the Pluin settings and turn both Apate and ZeresPluginLibrary on. Then restart (<kbd>Ctrl</kbd> + <kbd>R</kbd>).

## Usage
![Demo](https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/demo.gif)

Syntax:
>Cover text \*hidden message*

Click the key button or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send the message.

**Note:**

 - The hidden message should turn *italic* if you did it right
 - There can't be a string after the hidden message. The second `*` should be the last character
 - Most settings in the App dont require a restart, but it might help


## Authors

<img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate Logo" width="80" align="right"></img>
><a href="https://github.com/BenjaminAster"><img src="https://github.com/BenjaminAster.png?size=60"><p>BenjaminAster</p></a>
><a href="https://github.com/TheGreenPig"><img src="https://github.com/thegreenpig.png?size=60"><p>TheGreenPig</p></a>



