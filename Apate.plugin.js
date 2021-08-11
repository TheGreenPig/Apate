/**
 * @name Apate
 * @version 0.0.2
 * @updateUrl https://github.com/TheGreenPig/Apate/blob/main/Apate.plugin.js
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
			const keyStyle =
				`.encriptionKey {` +
				`	transition: all 300ms ease;` +
				`	width: 2em;` +
				`	height: 2em;` +
				`}` +
				`.encriptionKey:hover {` +
				`	font-size: 1.5em;` +
				`	fill: mediumSpringGreen;` +
				`	animation: rotate 0.5s ease;` +
				`	animation-iteration-count: 1; ` +
				`}` +
				`.encriptionKey:active {` +
				`	font-size: 1.5em;` +
				`	fill: mediumSlateBlue;` +
				`	animation: shake 0.2s;` +
				`	animation-iteration-count: infinite; ` +
				`}` +
				`@keyframes rotate {` +
				`	0%   { transform: rotate(0deg);   }` +
				`	100% { transform: rotate(360deg); }` +
				`}` +
				`@keyframes shake {` +
				`	0%   { transform: rotate(0deg);   }` +
				`	30%  { transform: rotate(25deg);  }` +
				`	70%  { transform: rotate(-25deg); }` +
				`	100% { transform: rotate(0deg);   }`;
			`}`;

			const buttonHTML =
				`<div class="buttonContainer-28fw2U da-buttonContainer keyButton">` +
				`	<button aria-label="Send Message" tabindex="0" type="button" ` +
				`			class="buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus"` +
				`	>` +
				`		<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">` +
				`			<svg xmlns="http://www.w3.org/2000/svg" class="encriptionKey icon-3D60ES da-icon" viewBox="0 0 24 24" aria-hidden="false" fill="currentColor">` +
				`				<path d="M0 0h24v24H0z" fill="none" />` +
				`				<path d="M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,` +
				`					1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z" ` +
				`				/>` +
				`			</svg>` +
				`		</div>` +
				`	</button>` +
				`</div>`;

			document.querySelector("#keyStyleEl")?.remove();

			let keyStyleEl = document.createElement("style");
			keyStyleEl.textContent = keyStyle;
			keyStyleEl.id = "keyStyleEl";
			document.head.append(keyStyleEl);

			const {
				DiscordSelectors,
				getInternalInstance,
			} = { ...Api, ...BdApi };
			let stegCloak;

			const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
			Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });

			const worker = async () => {
				console.log("hi, i am the worker");

				self.importScripts("https://stegcloak.surge.sh/bundle.js");
				const stegCloak = new StegCloak();

				self.addEventListener("message", async (evt) => {
					const data = evt.data;

					if (data.hide) {
						const stegCloakedMsg = (() => {
							try {
								return stegCloak.hide(data.hiddenMsg, "", data.coverMsg);
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
								return stegCloak.reveal(data.stegCloakedMsg, "");
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
				worker;
				start() {
					console.clear();
					console.log(`%cApate has started.`, `font-size: 1.2em; color: lime; background-color: black; padding: 1em; border-radius: 1em; border: 0.1em solid #fff`);
					const form = document.querySelector(DiscordSelectors.TitleWrap.form.value);

					function stegCloakLoaded() {
						stegCloak = new StegCloak();
						console.log("%cStegcloak%c is sucessfully installed!", "color: Crimson; font-size: 1.1em; text-decoration: underline;", "color: greenyellow; font-size: 1.1em");
					}

					if (typeof StegCloak === "undefined") {
						let stegCloakScript = document.createElement("script");
						stegCloakScript.src = "https://stegcloak.surge.sh/bundle.js";
						stegCloakScript.addEventListener("load", (evt) => {
							stegCloakLoaded();
						});
						document.head.append(stegCloakScript);
					} else {
						stegCloakLoaded();
					}

					this.addKeyButton();

					{
						// setup worker

						const code = worker.toString();
						const blob = new Blob([`(${code})();`]);
						this.worker = new Worker(URL.createObjectURL(blob));
					}

					{
						this.worker.addEventListener("message", (evt) => {
							const data = evt.data;
							const messageContainer = document.querySelector(`[data-apate-id="${data.id}"]`);

							if (data.reveal && messageContainer && !messageContainer.hasAttribute("data-hidden-message-revealed")) {
								const messageWrapper = messageContainer.querySelector(`div[role="document"]`);

								let hiddenMessageDiv = document.createElement("div");
								hiddenMessageDiv.textContent = data?.hiddenMsg;
								hiddenMessageDiv.style.backgroundColor = "black";
								hiddenMessageDiv.style.border = "2px dotted white";
								hiddenMessageDiv.style.padding = ".5em";
								hiddenMessageDiv.style.margin = ".3em 0";
								hiddenMessageDiv.style.borderRadius = ".8em";
								hiddenMessageDiv.style.color = "white";
								hiddenMessageDiv.style.height = "0";
								messageWrapper.append(hiddenMessageDiv);
								messageWrapper.setAttribute("data-hidden-message-revealed", "");

								window.requestAnimationFrame(() => {
									window.requestAnimationFrame(() => {
										hiddenMessageDiv.style.height = "auto";
									});
								});
							}
						});
					}
				};

				stop() {
					console.log(`%cApate has stopped.`, `font-size: 1.2em; color: red; background-color: black; padding: 1em; border-radius: 1em; border: 0.1em solid #fff`);
				};

				addKeyButton() {
					const form = document.querySelector(DiscordSelectors.TitleWrap.form.value);

					if (!form || form.querySelector(".keyButton")) return;
					let button = document.createElement("div");

					form.querySelector(DiscordSelectors.Textarea.buttons).append(button);
					button.outerHTML = buttonHTML;

					button = form.querySelector(".keyButton");

					button.addEventListener("click", () => {
						if (typeof stegCloak === "undefined") return;
						const textareaWrapper = form.querySelector(DiscordSelectors.Textarea.textArea);
						if (!textareaWrapper) return;
						const textarea = textareaWrapper.children?.[0];
						if (!textarea) return;

						const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
						const editor = getInternalInstance(textArea).return.stateNode.editorRef;
						let input = textArea.querySelector(`span`).textContent;

						let RegExpGroups = (
							(/^(?<coverMessage>([^\*]+))\*(?<hiddenMessage>([^\*]+))\*(?<invalidEndString>(.*))$/)
								.exec(input.trim())?.groups
						);

						let coverMessage = RegExpGroups?.coverMessage?.trim();
						let hiddenMessage = RegExpGroups?.hiddenMessage?.trim();
						let invalidEndString = RegExpGroups?.invalidEndString?.trim();

						if (!coverMessage || !hiddenMessage) {
							BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message as *italic*!");
							return;
						}
						if (invalidEndString) {
							BdApi.alert("Invalid input!", "There can't be a string after the hidden message!");
							return;
						}
						if (!coverMessage?.includes(" ")) {
							BdApi.alert("Invalid input!", "Cover message must have at least one space! (Or else the message can't be hidden...)");
							return;
						}

						console.log({ coverMessage, hiddenMessage });

						let output = "\u200B" + stegCloak.hide(hiddenMessage, "", coverMessage);

						editor.moveToRangeOfDocument();
						editor.delete();
						editor.insertText(output);

						window.setTimeout(() => textarea.dispatchEvent(press), 100);
					});
				};

				addHiddenMessageBanners() {
					const messageContainers = document.querySelectorAll(
						`${DiscordSelectors.TitleWrap.chatContent.value
						} div[data-list-id="chat-messages"] > div[class*="message-"]:not([apate-seen])`
					);

					if (!messageContainers) return;

					// document.body.

					for (const messageContainer of [...messageContainers].reverse()) {
						messageContainer.setAttribute("apate-seen", "");

						const textContent = messageContainer.querySelector(`div[class*="markup-"][class*="messageContent-"]`).textContent;

						if (textContent?.startsWith("\u200b") && !messageContainer.hasAttribute("data-contains-hidden-message")) {
							const id = `apate-${new Date().getTime().toString(36)}-${Math.floor(Math.random() * 1e16).toString(36)}`;
							messageContainer.setAttribute("data-contains-hidden-message", "");
							messageContainer.setAttribute("data-apate-id", id);
							this.worker.postMessage({
								id,
								reveal: true,
								stegCloakedMsg: textContent.replace(/^\u200b/, ""),
							});
						}
					}
				}
				observer(mutationRecord) {
					if (!mutationRecord.addedNodes) return;
					this.addHiddenMessageBanners();
					this.addKeyButton();
				}

			};
		};
		return plugin(Plugin, Api);;
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
