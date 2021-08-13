/**
 * @name Apate
 * @version 0.0.2
 * @source https://github.com/TheGreenPig/Apate/blob/main/Apate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js
*/

module.exports = (() => {
	const config = {
		info: {
			name: "Apate",
			authors: [{
				name: "Aster",
				discord_id: "534335982200291328",
				github_username: "BenjaminAster",
				website: "https://benjaminaster.com/"
			}, {
				name: "AGreenPig",
				discord_id: "427179231164760066",
				github_username: "TheGreenPig"
			}],
			version: "0.0.2",
			description: "Apate lets you hide messages in other messages! - Usage: coverText *hiddenText*",
		},
	};

	return !global.ZeresPluginLibrary ? class {
		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: async () => {
					const zeresPluginLib = await (await globalThis.fetch("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js")).text();

					await new Promise(
						resolve => require("fs").writeFile(
							require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
							zeresPluginLib,
							resolve,
						),
					);
				},
			});
		};
		start() { };
		stop() { };
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {

			const globalStyle =
				`.apateKeyButtonContainer {` +
				`	display: flex;` +
				`	justify-content: center;` +
				`	align-items: center;` +
				`}` +
				`.apateEncryptionKeyButton {` +
				`	transition: all 300ms ease;` +
				`	overflow: hidden;` +
				`	font-size: 1rem;` +
				`	display: flex;` +
				`	justify-content: center;` +
				`	align-items: center;` +
				`	clip-path: inset(0);` +
				`	width: 3em;` +
				`	height: 2.8em;` +
				`}` +
				`.apateEncryptionKeyButton:hover {` +
				`	width: 4em;` +
				`}` +
				`.apateEncryptionKeyContainer {` +
				`	padding: 0;` +
				`	width: 5rem;` +
				`	height: 5rem;` +
				`}` +
				`.apateEncryptionKey {` +
				`	transition: all 300ms ease;` +
				`	font-size: 1.3rem;` +
				`	width: 2em;` +
				`	height: 2em;` +
				`}` +
				`.apateEncryptionKey:hover {` +
				`	font-size: 2em;` +
				`	fill: dodgerBlue;` +
				`	animation: apateRotate 0.5s ease;` +
				`	animation-iteration-count: 1; ` +
				`}` +
				`.apateEncryptionKey.calculating {` +
				`	fill: orange;` +
				`	animation: apateRotate 1s linear;` +
				`	animation-direction: reverse;` +
				`	animation-iteration-count: infinite;` +
				`}` +
				`@keyframes apateRotate {` +
				`	0%   { transform: rotate(0deg);   }` +
				`	100% { transform: rotate(360deg); }` +
				`}` +
				`.apateHiddenMessage {` +
				`	border: 2px solid var(--interactive-muted);` +
				`	color: var(--text-normal);` +
				`	padding: .5em;` +
				`	margin: .3em 0;` +
				`	width: fit-content;` +
				`	border-radius: 0 .8em .8em .8em;` +
				`	background-image: ` +
				`		repeating-linear-gradient(-45deg, ` +
				`		var(--background-tertiary) 0em, ` +
				`		var(--background-tertiary) 1em, ` +
				`		var(--background-floating) 1em, ` +
				`		var(--background-floating) 2em);` +
				`}` +
				`.apateHiddenMessage.loading {` +
				`	font-style: italic;` +
				`	color: var(--text-muted);` +
				`}` +
				`.apateHiddenMessage.loading::after {` +
				`	content: "[loading hidden message...]";` +
				`}`;

			const buttonHTML =
				`<div class="apateKeyButtonContainer buttonContainer-28fw2U da-buttonContainer keyButton">` +
				`	<button aria-label="Send Message" tabindex="0" type="button" ` +
				`			class="apateEncryptionKeyButton buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button ` +
				`				lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus"` +
				`	>` +
				`		<div class="apateEncryptionKeyContainer contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">` +
				`			<svg xmlns="http://www.w3.org/2000/svg" class="apateEncryptionKey icon-3D60ES da-icon" viewBox="0 0 24 24" fill="currentColor">` +
				`				<path d="M0 0h24v24H0z" fill="none" />` +
				`				<path d="M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,` +
				`					1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z" ` +
				`				/>` +
				`			</svg>` +
				`		</div>` +
				`	</button>` +
				`</div>`;


			const {
				DiscordSelectors,
				getInternalInstance,
			} = { ...Api, ...BdApi };


			const worker = (stegCloakBlobURL) => {
				self.importScripts(stegCloakBlobURL);
				const stegCloak = new StegCloak();

				self.addEventListener("message", (evt) => {
					const data = evt.data;

					if (data.hide) {
						const stegCloakedMsg = (() => {
							try {
								let password = data.coverMsg.replace(data.coverMsg.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064]*/, ""), "");
								return stegCloak.hide(data.hiddenMsg, password, data.coverMsg);
							} catch {
								return;
							}
						})();
						self.postMessage({
							id: data.id,
							hide: true,
							stegCloakedMsg,
						});
					} else if (data.reveal) {
						const hiddenMsg = (() => {
							try {
								//\uFFFD = � --> wrong password
								//try to reveal with password
								let password = data.stegCloakedMsg.replace(data.stegCloakedMsg.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064]*/, ""), "");
								let revealedMessage = stegCloak.reveal(data.stegCloakedMsg, password);
								if (!revealedMessage.includes("\uFFFD")) {
									return revealedMessage;
								}
								//try to reveal without password (for older messages that aren't encrypted)
								revealedMessage = stegCloak.reveal(cloaked, "");
								if (!revealedMessage.includes("\uFFFD")) {
									return revealedMessage;
								}
								console.error(`%c"${cloaked}"%c had a %cfaulty password%c! Output: %c"${revealedMessage}"`, "color: Fuchsia", "color: white", "color:red", "color: white", "color: DarkGreen");
								return;
							} catch {
								return;
							}
						})();
						self.postMessage({
							id: data.id,
							reveal: true,
							hiddenMsg,
						});
					}
				});
			};

			return class Apate extends Plugin {
				revealWorkers = [];
				hideWorker;
				lastWorkerId = 0;
				numOfWorkers = 16;
				discordEmojis;

				async start() {
					{
						this.checkForUpdates();
						// console
						console.clear();
						console.log(
							`%c\u2004\u2004\u2004%c\n%cMade By Aster & AGreenPig`,
							'font-size: 160px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg) no-repeat; backdround-size: contain;',
							``,
							`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
						);
					}

					{
						// global style
						document.querySelector("#globalStyleEl")?.remove();

						let globalStyleEl = document.createElement("style");
						globalStyleEl.textContent = globalStyle;
						globalStyleEl.id = "globalStyleEl";
						document.head.append(globalStyleEl);
					}
					{
						// key button
						this.addKeyButton();
					}

					{
						// workers
						const workerCode = worker.toString();

						const stegCloakBlobURL = URL.createObjectURL(new Blob([
							await (await window.fetch("https://raw.githubusercontent.com/KuroLabs/stegcloak/master/dist/stegcloak.min.js")).text()
						]));

						for (let i in [...Array(this.numOfWorkers)]) {
							const worker = new window.Worker(URL.createObjectURL(new Blob(
								[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
							)));

							worker.addEventListener("message", (evt) => {
								const data = evt.data;
								const messageContainer = document.querySelector(`[data-apate-id="${data.id}"]`);

								if (data.reveal && messageContainer && !messageContainer.hasAttribute("data-apate-hidden-message-revealed")) {
									const hiddenMessageDiv = messageContainer.querySelector(`.apateHiddenMessage`);
									hiddenMessageDiv.textContent = data.hiddenMsg;
									hiddenMessageDiv.classList.remove("loading");
									messageContainer.setAttribute("data-apate-hidden-message-revealed", "");
								}
							});

							this.revealWorkers.push(worker);
						}


						this.hideWorker = new window.Worker(URL.createObjectURL(new Blob(
							[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
						)));

						this.hideWorker.addEventListener("message", (evt) => {
							const data = evt.data;
							if (data.hide) {
								let output = "\u200B" + data.stegCloakedMsg;
								const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
								const editor = getInternalInstance(textArea).return.stateNode.editorRef;

								editor.moveToRangeOfDocument();
								editor.delete();
								editor.insertText(output);

								const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
								Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });
								window.setTimeout(() => textArea.children[0].dispatchEvent(press), 100);

								document.querySelector(".apateEncryptionKey")?.classList.remove("calculating");
							}
						});
					}
					{
						// Discord emojis

						this.discordEmojis = await (await window.fetch(
							`https://raw.githubusercontent.com/TheGreenPig/Apate/main/discord-emojis.json?anti-cache=${Date.now().toString(36)}`
						)).json();
					}
				}
				async checkForUpdates() {
					const developerMode = false;
					if (!developerMode) {
						const localScript = new TextDecoder().decode(
							await new Promise((resolve) =>
								require("fs").readFile(
									require("path").join(BdApi.Plugins.folder, "Apate.plugin.js"),
									{},
									(err, data) => resolve(data),
								),
							),
						);

						const gitHubScript = await (await window.fetch(
							`https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js?anti-cache=${Date.now().toString(36)}`
						)).text();

						const localFileHash = (
							[...(
								new Uint8Array(
									await window.crypto.subtle.digest(
										'SHA-256',
										new TextEncoder().encode(localScript),
									),
								)
							)].map(
								(byte) => byte.toString(16).padStart(2, '0')
							).join('')
						);

						const gitHubFileHash = (
							[...(
								new Uint8Array(
									await window.crypto.subtle.digest(
										'SHA-256',
										new TextEncoder().encode(gitHubScript),
									),
								)
							)].map(
								(byte) => byte.toString(16).padStart(2, '0')
							).join('')
						);
						let localVersion = config.info.version;
						let gitHubVersion = gitHubScript.match(/version:.*"/)[0].replace(/(\"*)([^\d\.]*)/g, ""); //we need a better way to get the github version

						// console.log(`Local Version: ${localVersion}, Github Version: ${gitHubVersion}, upToDate?: ${this.upToDate(localVersion, gitHubVersion)}`);

						eval(gitHubScript);
						if (localFileHash !== gitHubFileHash && !this.upToDate(localVersion, gitHubVersion)) {
							console.log(
								`%cNew Update ${gitHubVersion} for Apate avalible!`,
								`color: aqua;background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
							);
							console.log({
								localScript,
								gitHubScript,
								localFileHash,
								gitHubFileHash,
							});
							BdApi.showConfirmationModal("New Update", `There is a new update for ${config.info.name}! (Current version: \`${localVersion}\`, Newest Version: \`${gitHubVersion}\`). Please click \`Download Now\` to install it.`, {
								confirmText: "Download Now",
								cancelText: "Cancel",
								onConfirm: async () => {
									await new Promise(
										(resolve) => require("fs").writeFile(
											require("path").join(BdApi.Plugins.folder, "Apate.plugin.js"),
											gitHubScript,
											resolve,
										),
									);
								},
							});
						}
					}
				}
				upToDate(local, remote) {
					var VPAT = /^\d+(\.\d+){0,2}$/;
					if (!local || !remote || local.length === 0 || remote.length === 0)
						return false;
					if (local == remote)
						return true;
					if (VPAT.test(local) && VPAT.test(remote)) {
						var lparts = local.split('.');
						while (lparts.length < 3)
							lparts.push("0");
						var rparts = remote.split('.');
						while (rparts.length < 3)
							rparts.push("0");
						for (var i = 0; i < 3; i++) {
							var l = parseInt(lparts[i], 10);
							var r = parseInt(rparts[i], 10);
							if (l === r)
								continue;
							return l > r;
						}
						return true;
					} else {
						return local >= remote;
					}
				}
				hideMessage() {
					const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
					let input = (() => {
						const textSegments = textArea?.querySelectorAll(`div > div > span[data-slate-object]`);
						let input = "";

						console.log(textSegments);

						for (let textSegment of textSegments) {
							switch (textSegment.getAttribute("data-slate-object")) {
								case ("text"): {
									input += textSegment.textContent;
									break;
								}
								case ("inline"): {
									const emojiName = textSegment.querySelector("img.emoji")?.alt?.replace(/:/g, "");
									if (!this.discordEmojis?.[emojiName]) {
										BdApi.alert("Unsupported Emoji", ":" + emojiName + ": is not supported and will be sent as ```[?]```!");
									}
									input += this.discordEmojis?.[emojiName] || "[?]";
									break;
								}
							}
						}

						return input;
					})();

					if (!input) return;

					let RegExpGroups = (
						(/^(?<coverMessage>([^\*]+))\*(?<hiddenMessage>([^\*]+))\*(?<invalidEndString>(.*))$/)
							.exec(input.trim())?.groups
					);

					let coverMessage = RegExpGroups?.coverMessage?.trim();
					let hiddenMessage = RegExpGroups?.hiddenMessage?.trim();
					let invalidEndString = RegExpGroups?.invalidEndString?.trim();

					const editor = getInternalInstance(textArea).return.stateNode.editorRef;
					if (!coverMessage || !hiddenMessage) {
						BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message as *italic*!");
						return;
					}
					if (invalidEndString) {
						BdApi.alert("Invalid input!", "There can't be a string after the hidden message!");
						editor.moveToRangeOfDocument();
						editor.delete();
						editor.insertText(coverMessage + "*" + hiddenMessage + "*");
						return;
					}
					if (!/ ./.test(coverMessage)) {
						coverMessage += " \u200b";
					}


					editor.moveToRangeOfDocument();
					editor.delete();

					coverMessage = this.getPassword() + coverMessage;

					document.querySelector(".apateEncryptionKey")?.classList.add("calculating");

					this.hideWorker?.postMessage({
						id: `apate-hide-${Date.now().toString(36)}`,
						hide: true,
						hiddenMsg: hiddenMessage,
						coverMsg: coverMessage,
					});
				}
				getPassword() {
					//makes a 4 character Long password that gets added to the start of the cover Text for some encryption
					let password = "";
					let invisibleCharacters = ["\u200C", "\u200D", "\u2061", "\u2062", "\u2063", "\u2064"];
					for (var i = 0; i < 4; i++) {
						password += invisibleCharacters[(Math.floor(Math.random() * 6))];
					}
					return password;
				}

				addKeyButton() {
					const form = document.querySelector(DiscordSelectors.TitleWrap.form.value);

					if (!form || form.querySelector(".keyButton")) return;
					let button = document.createElement("div");

					form.querySelector(DiscordSelectors.Textarea.buttons).append(button);
					button.outerHTML = buttonHTML;

					button = form.querySelector(".keyButton");

					form.addEventListener("keyup", (evt) => {
						if (evt.key === "Enter" && evt.ctrlKey) {
							evt.preventDefault();
							this.hideMessage();
						}
					});

					button.addEventListener("click", () => this.hideMessage());
				};

				addHiddenMessageBanners() {
					const messageContainers = document.querySelectorAll(
						`${DiscordSelectors.TitleWrap.chatContent.value
						} div[data-list-id="chat-messages"] > div[class*="message-"]:not([data-apate-seen])`
					);

					if (!messageContainers || !this.revealWorkers.length) return;

					const randomStr = Math.floor(Math.random() * 1e16).toString(36);
					const timeStr = Date.now().toString(36);

					for (const [i, messageContainer] of [...messageContainers].reverse().entries()) {
						messageContainer.setAttribute("data-apate-seen", "");

						const textContent = messageContainer.querySelector(
							`div[class*="contents-"][role="document"] > div[class*="markup-"][class*="messageContent-"]`
						).textContent;

						if (textContent?.startsWith("\u200b") && !messageContainer.hasAttribute("data-apate-contains-hidden-message")) {
							const id = `apate-${timeStr}-${randomStr}-${i}`;

							messageContainer.setAttribute("data-apate-contains-hidden-message", "");
							messageContainer.setAttribute("data-apate-id", id);

							this.revealWorkers[this.lastWorkerId]?.postMessage({
								id,
								reveal: true,
								stegCloakedMsg: textContent.replace(/^\u200b/, ""),
							});
							this.lastWorkerId++;
							this.lastWorkerId %= this.numOfWorkers;

							{
								const messageWrapper = messageContainer.querySelector(`div[role="document"]`);

								let hiddenMessageDiv = document.createElement("div");
								hiddenMessageDiv.classList.add("apateHiddenMessage", "loading");
								messageWrapper.append(hiddenMessageDiv);
							}
						}
					}
				};
				observer(mutationRecord) {
					if (!mutationRecord.addedNodes) return;
					this.addHiddenMessageBanners();
					this.addKeyButton();
				};
				stop() {
					for (const worker of this.revealWorkers) {
						worker.terminate();
					}
				};
			};
		};
		return plugin(Plugin, Api);;
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
