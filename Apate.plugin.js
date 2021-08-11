/**
 * @name Apate
 * @version 0.0.2
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
			version: "1.0.0",
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
			const keyStyle = `${""
				}.encriptionKey {${"\n"
				}	transition: all 300ms ease;${"\n"
				}	width: 2em;${"\n"
				}	height: 2em;${"\n"
				}}${"\n"
				}${"\n"
				}.encriptionKey:hover {${"\n"
				}	font-size: 1.5em;${"\n"
				}	fill: mediumSpringGreen;${"\n"
				}	animation: rotate 0.5s ease;${"\n"
				}	animation-iteration-count: 1; ${"\n"
				}}${"\n"
				}.encriptionKey:active {${"\n"
				}	font-size: 1.5em;${"\n"
				}	fill: mediumSlateBlue;${"\n"
				}	animation: shake 0.2s;${"\n"
				}	animation-iteration-count: infinite; ${"\n"
				}}${"\n"
				}@keyframes rotate {${"\n"
				}	0% 	{ transform: rotate(0deg); }${"\n"
				}	100% { transform: rotate(360deg); }${"\n"
				}}${"\n"
				}@keyframes shake {${"\n"
				}	0% 	{ transform: rotate(0deg); }${"\n"
				}	30% { transform: rotate(25deg); }${"\n"
				}	70% { transform: rotate(-25deg); }${"\n"
				}	100% { transform: rotate(0deg); }${"\n"
				}}${"\n"

				}`;


			// width="1.5em" height="1.5em"

			const buttonHTML = `${""
				}<div class="buttonContainer-28fw2U da-buttonContainer sendButton">${"\n"
				}	<button aria-label="Send Message" tabindex="0" type="button" class="buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus">${"\n"
				}		<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">${"\n"
				}			<svg xmlns="http://www.w3.org/2000/svg" class="encriptionKey icon-3D60ES da-icon" viewBox="0 0 24 24" aria-hidden="false" fill="currentColor" >${"\n"
				}				<path d="M0 0h24v24H0z" fill="none" />${"\n"
				}				<path d="M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z" />${"\n"
				}			</svg>${"\n"
				}		</div>${"\n"
				}	</button>${"\n"
				}</div>`;

			document.querySelector("#keyStyleEl")?.remove();

			let keyStyleEl = document.createElement("style");
			keyStyleEl.textContent = keyStyle;
			keyStyleEl.id = "keyStyleEl";
			document.head.append(keyStyleEl);




			const {
				DiscordSelectors,
				// PluginUtilities,
				DOMTools,
				// Logger,
				getInternalInstance,
				// Patcher,
				// WebpackModules
			} = { ...Api, ...BdApi };
			let stegCloak;

			const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
			Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });

			return class Apate extends Plugin {
				start() {
					console.clear();
					console.log(`%cApate has started.`, `font - size: 2em; color: lime; background - color: black; padding: 1em; border - radius: 1em; `);
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
				}

				stop() {
					console.log(`%cApate has stopped.`, `font - size: 2em; color: red; background - color: black; padding: 1em; border - radius: 1em; `);
				}

				addKeyButton() {
					const form = document.querySelector(DiscordSelectors.TitleWrap.form.value);
					if (!form || form.querySelector(".sendButton")) return;
					const button = DOMTools.createElement(buttonHTML);
					// button.innerHTML = buttonHTML;
					form.querySelector(DiscordSelectors.Textarea.buttons).append(button);
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
				}

				addHiddenMessageBanners() {
					const messageContainers = document.querySelectorAll(
						`${DiscordSelectors.TitleWrap.chatContent.value
						} div[data-list-id="chat-messages"] > div[class*="message-"]:not(.apate-seen)`
					);
					console.log(`adding hidden message banners (${messageContainers.length} messageContainers)`);
					for (const messageContainer of messageContainers) {
						console.log(`adding hidden message banner`);
						messageContainer.classList.add("apate-seen");

						const messageMarkup = messageContainer?.querySelector(`div[class*="markup-"][class*="messageContent-"]`);
						const messageWrapper = messageContainer?.querySelector(`div[role="document"]`);

						if (messageMarkup?.textContent?.startsWith("\u200b") && !messageContainer?.querySelector(".hiddenMessage")) {
							try {
								let hiddenMessageDiv = document.createElement("div");
								hiddenMessageDiv.textContent = stegCloak.reveal(messageMarkup.textContent.replace(/^\u200b/, ""), "");
								hiddenMessageDiv.className = "hiddenMessage";
								hiddenMessageDiv.style.backgroundColor = "black";
								hiddenMessageDiv.style.border = "2px dotted white";
								hiddenMessageDiv.style.padding = ".5em";
								hiddenMessageDiv.style.margin = ".3em 0";
								hiddenMessageDiv.style.borderRadius = ".8em";
								hiddenMessageDiv.style.color = "white";
								messageWrapper.append(hiddenMessageDiv);
							}
							catch { }
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
