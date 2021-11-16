/**
 * @name Apate
 * @author TheGreenPig, fabJunior, Aster
 * @source https://github.com/TheGreenPig/Apate/blob/main/Apate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js
 * @authorLink https://github.com/TheGreenPig
 */
const request = require("request");
const fs = require("fs");
const path = require("path");
/* 
 * BetterDiscord BdApi documentation:
 *   https://github.com/BetterDiscord/BetterDiscord/wiki/Creating-Plugins
 * 
 * BetterDiscord file structure documentation:
 *   https://github.com/BetterDiscord/documentation/blob/main/plugins/file_structure.md
 *  
 * Zere's Plugin Library documentation:
 * 	 https://rauenzi.github.io/BDPluginLibrary/docs/
 *  
 * Cryptico documentation:
 * 	 https://github.com/wwwtyro/cryptico#overview
 */
module.exports = (() => {
	const config = {
		info: {
			name: "Apate",
			authors: [{
				name: "AGreenPig",
				discord_id: "427179231164760066",
				github_username: "TheGreenPig"
			},
			{
				name: "fabJunior",
				discord_id: "517142662231359488",
				github_username: "fabJunior",
			},
			{
				name: "Aster",
				discord_id: "534335982200291328",
				github_username: "BenjaminAster",
				website: "https://benjaminaster.com/"
			},


			],
			version: "1.4.8",
			description: "Apate lets you hide messages in other messages! - Usage: `cover message \*hidden message\*`",
			github_raw: "https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js",
			github: "https://github.com/TheGreenPig/Apate"
		},
		changelog: [
			{
				title: "Fixed",
				type: "fixed",
				items: [
					"Fixed some syle issues to (hopefully) support more themes.",
					"Fixed problems when turning on encryption, but not choosing a password.",
					"Small typo.",
				]
			},
		],
	};
	class HTMLWrapper extends BdApi.React.Component {
		componentDidMount() {
			this.refs.element.appendChild(this.props.children);
		}

		render() {
			return BdApi.React.createElement("div", {
				className: "react-wrapper",
				ref: "element"
			});
		}
	}


	return !global.ZeresPluginLibrary ? class {
		load() {
			BdApi.showConfirmationModal("Library plugin is needed",
				`The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
						if (error)
							return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

						fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
					});
				}
			});
		};
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			//All modules needed. All are found at the start because finding modules can be resource intensive.
			const AccountUpdateModule = BdApi.findModuleByProps('setPendingBio');
			const BIO_MAX_LENGTH = BdApi.findModuleByProps("BIO_MAX_LENGTH").BIO_MAX_LENGTH;
			const ButtonClassesModule = BdApi.findModuleByProps('button', 'contents');
			const ButtonContainerClassesModule = BdApi.findModuleByProps('buttonContainer', 'buttons');
			const ButtonLooksModule = ZLibrary.DiscordModules.ButtonData;
			const ButtonWrapperClassesModule = BdApi.findModuleByProps('buttonWrapper', 'buttonContent');
			const ChannelTextAreaContainerModule = BdApi.findModule(m => m.type?.render?.displayName === "ChannelTextAreaContainer");
			const ChannelTextAreaUploadModule = BdApi.findModuleByProps("channelTextAreaUpload");
			const CompactCozyModule = BdApi.findModuleByProps("compact", "cozy");
			const ComponentDispatchModule = BdApi.findModuleByProps("ComponentDispatch");
			const ComputePermissionsModule = BdApi.findModuleByProps("computePermissions");
			const DirtyDispatcherModule = BdApi.findModuleByProps("dirtyDispatch");
			const DiscordConstants = BdApi.findModuleByProps("API_HOST");
			const EditMessageModule = BdApi.findModuleByProps("editMessage");
			const EmojiModule = BdApi.findModule(m => m.Emoji && m.default.getByName);
			const EndEditMessageModule = BdApi.findModuleByProps("endEditMessage");
			const GetChannelModule = ZLibrary.DiscordModules.ChannelStore;
			const GetMessageModule = ZLibrary.DiscordModules.MessageStore;
			const HeaderBar = BdApi.findModule(m => m?.default?.displayName === "HeaderBar");
			const InstantBatchUploadModule = BdApi.findModuleByProps("instantBatchUpload");
			const MessageContent = BdApi.findModule(m => m.type?.displayName === "MessageContent");
			const MiniPopover = BdApi.findModule((m) => m?.default?.displayName === "MiniPopover");
			const RenderMessageMarkupToASTModule = BdApi.findModuleByProps("renderMessageMarkupToAST");
			const SendMessageModule = BdApi.findModuleByProps('sendMessage');
			const SlateTextAreaClassModule = BdApi.findModuleByProps('slateTextArea').slateTextArea;
			const StartEditMessageModule = BdApi.findModuleByProps("startEditMessage");
			const TooltipContainer = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;
			const TooltipWrapper = BdApi.findModuleByPrototypes("renderTooltip");
			const UserInfoBase = BdApi.findModule(m => m.default.displayName === "UserInfoBase");
			const UserPopout = BdApi.findModule(m => m.default.displayName === "UserPopoutBody");
			const UserStoreModule = BdApi.findModuleByProps("getUsers");

			/**
			 * Apate banner which is displayed under some message which contains hidden text
			 */
			class ApateMessage extends BdApi.React.Component {
				state = { processing: true, message: undefined, usedPassword: undefined, images: [] }

				componentDidMount() {
					this.processMessage();

					const handleUpdate = state => {
						if (state.id !== this.props.message.id) {
							return
						}

						this.props.message.apateHiddenMessage = state.message === undefined ? null : state.message;
						this.props.message.apateUsedPassword = state.password;
						this.setState({ processing: false, message: state.message, usedPassword: state.password });
					};

					DirtyDispatcherModule.subscribe("APATE_MESSAGE_REVEALED", handleUpdate);

					DirtyDispatcherModule.subscribe("APATE_MESSAGE_FORCE_UPDATE", state => {
						if (state.id === this.props.message.id) {
							this.setState({ processing: true, message: undefined, usedPassword: undefined, images: [] });
							this.processMessage();
						}
					});
				}

				processMessage() {
					if (this.props.message.apateHiddenMessage !== undefined) {
						return this.setState({ processing: false, message: this.props.message.apateHiddenMessage, usedPassword: this.props.message.apateUsedPassword });
					}

					let interceptedPasswordList = this.props.apate.settings.passwords;

					let strong = this.props.apate.getStrong();
					let useseE2E = this.props.apate.usesE2E()
					//intercept passwordList
					if (useseE2E) {
						interceptedPasswordList.unshift(strong);
					}

					this.props.apate.revealWorkers[this.props.apate.lastWorkerId]?.postMessage({
						channelId: this.props.message.channel_id,
						id: this.props.message.id,
						reveal: true,
						stegCloakedMsg: this.props.message.content.replace(/^\u200b/, ""),
						passwords: interceptedPasswordList,
					});
					if (useseE2E) {
						this.props.apate.settings.passwords.shift();
					}
					this.props.apate.lastWorkerId++;
					this.props.apate.lastWorkerId %= this.props.apate.numOfWorkers;
				}

				acceptE2E(userId, pubKey) {
					if (userId === UserStoreModule.getCurrentUser()?.id) {
						BdApi.alert("You can't accept yourself!", "Please wait until the other user has accepted your request.");
						return;
					}
					if (this.props.apate.usesE2E(userId)) {
						BdApi.alert("E2E already on!", "You have already activated End to End encryption for this channel.");
						return;
					} else {
						let strongPassword = this.props.apate.makePhrase(60);
						let strongChannelEntry = { id: userId, strong: strongPassword };

						this.props.apate.settings.strongChannelIndex.push(strongChannelEntry);
						this.props.apate.saveSettings(this.props.apate.settings);
						ZLibrary.ReactTools.getOwnerInstance(document.querySelector(".title-3qD0b-")).forceUpdate();

						let strongPasswordEncrypted = cryptico.encrypt(strongPassword, pubKey.replace("[pubKey]", "")).cipher;
						this.props.apate.hideMessage(`\u200b \u200b*[strongPass]${strongPasswordEncrypted}*`, "").then(stegCloakedMsg => {
							SendMessageModule.sendMessage(this.props.apate.getCurrentChannel()?.id, { content: stegCloakedMsg })
						}).catch((e) => {
							if (e !== undefined) Logger.error(e);
						}).finally(() => {
							document.querySelectorAll(".apateEncryptionKey").forEach(el => {
								el.classList.remove("calculating");
							});
						});

						BdApi.showToast(`Set up End to End encryption with ${UserStoreModule.getUser(userId).username}!`, { type: "success" });
					}
				}
				processStrongPass(userId, encryptedStrong) {
					if (!this.props.apate.usesE2E(userId) && userId !== UserStoreModule.getCurrentUser()?.id && this.props.apate.settings.pendingList.includes(userId)) {
						let privateKey = cryptico.generateRSAKey(this.props.apate.settings.privKey, 1024);
						let strongPassword = cryptico.decrypt(encryptedStrong.replace("[strongPass]", ""), privateKey).plaintext;

						let strongChannelEntry = { id: userId, strong: strongPassword };

						this.props.apate.settings.strongChannelIndex.push(strongChannelEntry);
						var index = this.props.apate.settings.pendingList.indexOf(userId);
						if (index !== -1) {
							this.props.apate.settings.pendingList.splice(index, 1);
						}
						this.props.apate.saveSettings(this.props.apate.settings);
						ZLibrary.ReactTools.getOwnerInstance(document.querySelector(".title-3qD0b-"))?.forceUpdate();
					}
				}
				formatHiddenMessage() {
					if (this.state.message == null) {
						return "";
					}

					let emojiRegex = /\[(?<name>[a-zA-Z_~\d+-ñ]+):(?:(?<id>\d+)\.(?<ext>png|gif)|default)\]/g; // +-ñ are for 3 discord default emojis (ñ for "piñata", + for "+1" and - for "-1")
					let emojiModule = EmojiModule.default;

					let m = Object.assign({}, this.props.message);

					let channel = this.props.apate.getCurrentChannel();

					m.content = this.state.message.replace(/\\n/g, "\n");

					let author = this.props.message.author;
					// Convert emojis in Apate's old format for backward compatibility
					
					m.content = m.content.replace(emojiRegex, (match, name, id, ext) => {
						if (ext) {
							return `<${ext === "gif" ? "a" : ""}:${name}:${id}>`;
						} else {
							return emojiModule.convertNameToSurrogate(name);
						}
					});

					let { content } = RenderMessageMarkupToASTModule.default(m, { renderMediaEmbeds: true, formatInline: false, isInteracting: true });


					if (this.props.apate.settings.displayImage) {
						let nbLinksScanned = 0;

						let analyseChildren = (children) => {
							for (var i = 0; i < children.length; i++) {
								let child = children[i];
								if (child?.type !== "a" && !child?.type?.displayName?.endsWith("Link")) {
									// If the current element has children, recursively look for images
									if (child?.props?.children) {
										child.props.children = analyseChildren(child.props.children);
									}

									continue;
								}

								if (nbLinksScanned < 3) { //only scan the first 3 links
									nbLinksScanned++;
									//Message has image link
									let imageLink = new URL(child.props.href);

									let url;
									if (imageLink.hostname.endsWith("discordapp.net") || imageLink.hostname.endsWith("discordapp.com")) {
										url = imageLink.href;
									} else {
										url = `https://images.weserv.nl/?url=${encodeURIComponent(imageLink.href)}&n=-1`
									}

									if (this.state.images[imageLink.href] !== undefined) {
										if (this.state.images[imageLink.href]) {
											let linkIdx = children.indexOf(child);

											let isBrBefore = children[linkIdx - 1]?.type === "br";
											let isBrAfter = children[linkIdx + 1]?.type === "br";

											// If there is a new line before and after the link, then we remove one of them to avoid having an empty line
											// we also remove on if there is a new line after the link which is the first child OR a new line before the link which is the last child
											let img = BdApi.React.createElement("div", { className: "apateHiddenImgWrapper" }, BdApi.React.createElement("img", { className: "apateHiddenImg", src: url }));

											if ((isBrBefore && isBrAfter) || (isBrAfter && linkIdx === 0)) {
												children.splice(linkIdx, 2, img);
											} else if (isBrBefore && linkIdx === children.length - 1) {
												children.splice(linkIdx - 1, 2, img);
											} else {
												children.splice(linkIdx, 1, img);
											}
										}
									} else {
										this.props.apate.testImage(url).then(() => {
											let newImages = { ...this.state.images };
											newImages[imageLink.href] = true;

											this.setState({ images: newImages });
										}).catch(() => {
											let newImages = { ...this.state.images };
											newImages[imageLink.href] = false;

											this.setState({ images: newImages });
										});
									}
								}
							}

							return children
						}

						content = analyseChildren(content);
					}
					if (channel.type === DiscordConstants.ChannelTypes.DM) {
						if (/\[pubKey\][a-zA-Z\d+=?/]+/g.test(this.state.message)) {
							//Is e2e request, need better formatting here (button etc.)
							let requestMessage = BdApi.React.createElement("div", {
								class: "apateE2ERequestMessage",
							}, BdApi.React.createElement("b", {}, author.username), ` wants to set up End to End encryption for this channel!`,
								BdApi.React.createElement(ButtonLooksModule.default, {
									color: ButtonLooksModule.ButtonColors.BRAND,

									onClick: () => this.acceptE2E(author.id, this.state.message),
								}, "Accept"),
							)
							
							return requestMessage;
						}
						else if (/\[strongPass\][a-zA-Z\d+=?/]+/g.test(this.state.message)) {
							//Is e2e confirm, need better formatting here (button etc.)
							let acceptMessage = BdApi.React.createElement("div", {
								class: "apateE2ERequestMessage",
							}, BdApi.React.createElement("b", {}, author.username), ` accepted the End to End encryption!`);
							this.processStrongPass(author.id, this.state.message);
							return acceptMessage;
						}
						else if (this.state.message === "[deleteE2E]") {
							//delete confirm
							let deleteMessage = BdApi.React.createElement("div", {
								class: "apateE2ERequestMessage",
							}, BdApi.React.createElement("b", {}, author.username), ` has turned off E2E for this chat!`,
								BdApi.React.createElement(ButtonLooksModule.default, {
									color: ButtonLooksModule.ButtonColors.RED,
									onClick: () => this.props.apate.displayE2EPopUp(author.id, true, false),
								}, "Turn off as well"))
							return deleteMessage;
						}
					}

					return content;
				}

				render() {
					let useBorder = this.formatHiddenMessage()?.props?.class !== "apateE2ERequestMessage";
					let message = BdApi.React.createElement("div",
						{ className: `${useBorder ? "apateHiddenMessage border" : "apateE2ERequestMessageWrapper"} ${this.state.processing ? "loading" : ""}` },
						this.formatHiddenMessage()
					);
					return this.state.message === null ? null : message
				}
			}

			let apateCSS = 
				`.apateKeyButtonContainer {
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.apateEncryptionKeyButton {
					transition: all 300ms ease;
					overflow: hidden;
					font-size: 1rem;
					display: flex;
					justify-content: center;
					align-items: center;
					clip-path: inset(0);
					width: 3em;
					height: 100%;
				}
				.apateEncryptionKeyContainer {
					padding: 0;
					width: 4rem;
					height: 100%;
				}
				.apateEncryptionKey {
					transition: all 300ms ease;
					font-size: 1rem;
					width: 3em;
					height: 100%;
				}
				.apateHiddenImgWrapper {
					margin: 10px;
					max-width: 500px;
					max-height: 400px;
				}
				.apateHiddenImg {
					border-radius: 0.3em;
					max-width: 100%;
					max-height: inherit;
				}
				@keyframes apateRotate {
					0%   { transform: rotate(0deg);   }
					100% { transform: rotate(360deg); }
				}
				.apateHiddenMessage {
					color: var(--text-normal);
					padding: 0.4em 0.5em;
					line-height: normal;
					margin: .3em 0;
					width: fit-content;
					border-radius: 0 .8em .8em .8em;
					max-width: 100%;
					box-sizing: border-box;
					background-image: 
						repeating-linear-gradient(-45deg, 
						var(--background-tertiary) 0em, 
						var(--background-tertiary) 1em, 
						var(--background-floating) 1em, 
						var(--background-floating) 2em);
				}
				.apateHiddenMessage.border {
					border: 2px solid var(--interactive-muted);
				}
				.apateHiddenMessage.loading {
					font-style: italic;
					color: var(--text-muted);
				}
				.apateHiddenMessage.loading::after {
					content: "[encrypting hidden message...]";
					animation: changeLetter 1s linear infinite;
				}
				.apateHiddenMessage pre {
					margin-right: 4rem;
				}
				.apateAboutMeHidden {
					max-width: 90%;
					font-size: 14px;
					margin-top: -0.6rem;
					margin-bottom: 0.6rem;
				}
				.apateE2ERequestMessage {
					font-size: 1em;
					padding: 1em;
					color: white;
				}
				.apateE2ERequestMessage > button {
					float: right;
					position: relative;
					text-algin: right;
					margin-top: -8px;
				}
				.apateE2ERequestMessageWrapper{
					background-color: var(--background-secondary);
					box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
					border-radius: 4px;
				}
			`;

			let apateLeftKeyCSS = `
				.apateKeyButtonContainer {
					margin-left: -0.6rem;
					margin-right: 0.1rem;
					height: 2.8em;
					width: 3em;
					align-items: flex-start;
				}
				.${ChannelTextAreaUploadModule.channelTextAreaUpload} .apateKeyButtonContainer, .apateKeyButtonContainer.edit {
					margin-left: 0.3rem;
					margin-right: -0.8rem;
				}
			`;


			let apateNoLoadingCSS = `
				.apateHiddenMessage.loading {
					display: none;
				}
				.apateHiddenMessage.loading::after {
				display: none;
				}
			`;

			let apatePasswordCSS = `
				.form-control{
					margin-bottom: 10px;
				}
				.btn-add{
					background-color: var(--brand-experiment);
					color: var(--text-normal);
					padding: 0.3em;
					font-size: 1em;
					margin-bottom: 10px;
					border-radius: .25rem;
				}
				.downloadUploadListStyle{
					background-color: var(--background-accent);
					color: var(--text-normal);
					padding: 0.3em;
					font-size: 1em;
					margin-bottom: 10px;
					border-radius: .25rem;
				}
				.btn-passwords{
					font-size: 1.3em;
					padding: 0em;
					background-color: transparent;
				}
				.dynamic-list{
					display: flex;
					-ms-flex-direction: column;
					flex-direction: column;
					padding-left: 0;
					margin-bottom: 0;
				}
				.passwordLi{
					width: fit-content;
					text-align: left;
					font-weight: bold;
					padding: 0.4em 0.5em;
					line-height: normal;
					margin-bottom: 10px;
					background-color: var(--background-secondary);
					border: 1px solid rgba(0,0,0,.125);
					border-radius: .25rem;
				}
				.ownPassword{
					color: var(--text-normal);
					background-color: transparent;
					border: none;
				}
				.selectedPassword{
					background-color: var(--background-accent);
				}
			`;

			let apateSimpleCSS = `
				.apateHiddenMessage {
					background: none;
				}
			`;


			let apateAnimateCSS = `
				.apateEncryptionKey:hover {
					fill: dodgerBlue;
					animation: apateRotate 0.5s ease;
					animation-iteration-count: 1; 
				}
				.apateEncryptionKey.calculating {
					fill: orange;
					animation: apateRotate 1s linear;
					animation-direction: reverse;
					animation-iteration-count: infinite;
				}
				.apateEncryptionKeyButton:hover {
					width: 3em;
				}
				@keyframes changeLetter {
					0%   { content: "[encrypting hidden message]";   }
					33%  { content: "[encrypting hidden message.]";  }
					66%  { content: "[encrypting hidden message..]"; }
					100% { content: "[encrypting hidden message...]";}
				}
			`;

			const colors = [
				"MediumVioletRed",
				"PaleVioletRed",
				"LightPink",
				"Red",
				"IndianRed",
				"OrangeRed",
				"DarkOrange",
				"DarkKhaki",
				"Gold",
				"Yellow",
				"Chocolate",
				"RosyBrown",
				"DarkGreen",
				"ForestGreen",
				"Olive",
				"LimeGreen",
				"MediumSeaGreen",
				"SpringGreen",
				"Chartreuse",
				"Teal",
				"LightSeaGreen",
				"DarkTurquoise",
				"Aquamarine",
				"MediumBlue",
				"DeepSkyBlue",
				"LightBlue",
				"Purple",
				"DarkViolet",
				"Fuchsia",
				"Orchid",
				"Plum",
			];
			const {
				DiscordSelectors,
				Settings,
				Tooltip,
				Logger
			} = { ...Api, ...BdApi };
			const { SettingPanel, SettingGroup, RadioGroup, Switch, Textbox } = Settings;


			const options = [
				{
					name: 'Encryption On',
					desc: 'Your messages will be encrypted.',
					value: 0
				},
				{
					name: 'Encryption Off',
					desc: 'Your messages will NOT be encrypted.',
					value: 1
				}
			];
			const keyPositions = [
				{
					name: 'Right',
					desc: 'The key will be on the right.',
					value: 0
				},
				{
					name: 'Left',
					desc: 'The key will be on the left.',
					value: 1
				},
				{
					name: 'No Key',
					desc: 'The key will be not be displayed',
					value: 2
				}
			];

			const worker = (stegCloakBlobURL) => {
				self.importScripts(stegCloakBlobURL);
				const stegCloak = new StegCloak();
				self.addEventListener("message", ({ data }) => {
					if (data.hide) {
						const stegCloakedMsg = (() => {
							try {
								return stegCloak.hide(data.hiddenMessage, data.password, data.coverMessage);
							} catch {
								return;
							}
						})();
						self.postMessage({
							hide: true,
							stegCloakedMsg,
						});
					} else if (data.reveal) {
						let usedPassword = "";

						const hiddenMessage = (() => {
							try {
								let revealedMessage = "";
								revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.stegCloakedMsg.replace(data.stegCloakedMsg.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064]*/, ""), ""));

								//check no password
								if (revealedMessage.endsWith("\u200b")) {
									//has indicator character
									return revealedMessage.slice(0, -1);
								}

								//check all other passwords
								for (var i = 0; i < data.passwords.length; i++) {
									revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.passwords[i]);
									if (revealedMessage.endsWith("\u200b")) {
										//has indicator character
										usedPassword = data.passwords[i];
										return revealedMessage.slice(0, -1);
									}
								}
							} catch {
								return;
							}
						})();

						self.postMessage({
							channelId: data.channelId,
							id: data.id,
							reveal: true,
							password: usedPassword,
							hiddenMessage,
						});
					}
				});
			};

			return class Apate extends Plugin {
				revealWorkers = [];
				hideWorker;
				lastWorkerId = 0;
				numOfWorkers = 16;

				default = {
					encryption: 1,
					ctrlToSend: true,
					animate: true,
					displayImage: true,
					displayLock: true,
					password: "",
					passwords: [],
					passwordColorTable: ['white'],
					showLoading: true,
					showInfo: true,
					saveCurrentPassword: false,
					showChoosePasswordConfirm: true,
					hiddenAboutMe: false,
					hiddenAboutMeText: "",
					keyPosition: 0,
					shiftNoEncryption: true,
					altChoosePassword: true,
					privKey: undefined,
					pubKey: undefined,
					strongChannelIndex: [],
					pendingList: [],
					devMode: false
				};
				settings = null;


				addColor() {
					let newColor = colors[Math.floor(Math.random() * colors.length)];
					while (this.settings.passwordColorTable.some(e => e === newColor)) {
						newColor = colors[Math.floor(Math.random() * colors.length)];
					}
					this.settings.passwordColorTable.push(newColor);
				}
				addPasswordFromInput() {
					var candidate = document.getElementById("candidate");
					candidate.value = candidate.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "")
					if (this.settings.passwords.indexOf(candidate.value) !== -1) {
						BdApi.alert("Password already in list.", "This password is already in your list!");
						return;
					}
					if (this.settings.passwords.length >= 31) { //we dont count the first one 
						BdApi.alert("Too many passwords.", "You can only have 30 passwords in your list.");
						return;
					}
					if (candidate.value === "") {
						BdApi.alert("Invalid input.", "Please enter a valid password in the Textbox!");
						return;
					}
					if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(candidate.value)) {
						BdApi.alert("Weak Password!", "Warning! This password is not very strong. Strong passwords have at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.");
					}

					this.settings.passwords.push(candidate.value);
					this.saveSettings(this.settings);
					this.updatePasswords();

				}
				addPassword(item) {
					var ul = document.getElementById("dynamic-list");
					var li = document.createElement("li");
					li.setAttribute('id', item);

					var copyButton = document.createElement("button");
					copyButton.textContent = `📋`
					copyButton.classList.add("btn-passwords");
					copyButton.setAttribute("title", "Copy Password")
					copyButton.addEventListener("click", () => {
						navigator.clipboard.writeText(item);
						BdApi.showToast("Copied password!", { type: "success" });
					});

					var revButton = document.createElement("button");
					revButton.textContent = `❌`
					revButton.classList.add("btn-passwords");
					revButton.setAttribute("title", "Remove Password")
					revButton.addEventListener("click", () => this.removePassword(item));

					if (this.settings.passwords[0] === item) {
						//first entry aka own password
						li.classList.add("passwordLi", "ownPassword");
						if (this.settings.encryption === 1) {
							item = "-Encryption is off-";
						}

						li.appendChild(document.createTextNode("Own password: " + item));
						li.appendChild(copyButton);


					} else {
						li.classList.add("passwordLi")
						li.appendChild(document.createTextNode(item));


						li.appendChild(revButton);
						li.appendChild(copyButton);
					}
					let colorLen = this.settings.passwordColorTable.length;
					let passwordLen = this.settings.passwords.length;

					if (colorLen > passwordLen) {
						//need to remove colors
						for (var i = 0; i < colorLen - passwordLen; i++) {
							this.settings.passwordColorTable.pop();
						}
						this.saveSettings(this.settings);
					}
					if (colorLen < passwordLen) {
						//need to add colors
						for (var i = 0; i < passwordLen - colorLen; i++) {
							this.addColor()
						}
						this.saveSettings(this.settings);
					}

					let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
					//Dont force the own password to be white
					if(color!=="white") {
						li.setAttribute('style', `color:${color}`);
					}
					ul.appendChild(li);
				}
				removePassword(password) {
					if (this.settings.passwords.indexOf(password) !== -1) {
						let index = this.settings.passwords.indexOf(password)
						this.settings.passwords.splice(index, 1);
						this.settings.passwordColorTable.splice(index, 1);
					}
					this.saveSettings(this.settings);
					this.updatePasswords();
				}
				updatePasswords() {
					if (this.settings.passwords[0] !== this.settings.password && this.settings.password !== "") {
						if (this.settings.passwords.indexOf(this.settings.password) !== -1) {
							this.removePassword(this.settings.password);
						}
						if (!this.settings.saveCurrentPassword) {
							this.settings.passwords.shift();
						}
						this.settings.passwords.unshift(this.settings.password);
						this.saveSettings(this.settings);
					}
					var ul = document.getElementById("dynamic-list");
					ul.innerHTML = "";
					for (var i = 0; i < this.settings.passwords.length; i++) {
						this.addPassword(this.settings.passwords[i]);
					}
					let download = document.querySelector(".downloadListButton");
					if (download) {
						download.href = `data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}`;
					}
				}

				refreshCSS() {
					let compact, animate, noLoading, simpleBackground, leftKey, aboutMe, noKey;
					animate = noLoading = simpleBackground = leftKey = aboutMe = noKey = "";

					let compactClass = CompactCozyModule.compact;
					compact = `.${compactClass} .apateHiddenMessage {
						   text-indent: 0;
					 }`;
					if (this.settings.animate) {
						animate = apateAnimateCSS;
					}
					if (!this.settings.showLoading) {
						noLoading = apateNoLoadingCSS;
					}
					if (this.settings.simpleBackground) {
						simpleBackground = apateSimpleCSS;
					}
					if (this.settings.keyPosition === 1) {
						leftKey = apateLeftKeyCSS;
					} else if (this.settings.keyPosition === 2) {
						noKey = `.apateKeyButtonContainer {display: none;`
					}
					if (!this.settings.hiddenAboutMe) {
						aboutMe = `.apateAboutMeSettings { display: none;}`;
					}
					if (this.settings.encryption === 1) {
						aboutMe = `.apateEncrpytionSettings { display: none;}`;
					}
					BdApi.clearCSS("apateCSS")
					BdApi.injectCSS("apateCSS", apateCSS + compact + animate + simpleBackground + apatePasswordCSS + noLoading + leftKey + aboutMe + noKey);

					//Thanks Strencher <3
					ComponentDispatchModule.ComponentDispatch.dispatchToLastSubscribed("TEXTAREA_FOCUS")
					ZLibrary.ReactTools.getOwnerInstance(document.querySelector(".title-3qD0b-"))?.forceUpdate();


				}

				/**
				 * Tests if the given url is a valid image url
				 * @param  {string} url			The url
				 * @param  {int}	timeoutT	Number of milliseconds before returning a timeout error (default 5 000)
				 * @return {string}				Returns "success", "error" or "timeout"
				 */
				testImage(url, timeoutT) {
					return new Promise(function (resolve, reject) {
						var timeout = timeoutT || 5000;
						var timer, img = new Image();
						img.onerror = img.onabort = function () {
							clearTimeout(timer);
							reject("error");
						};
						img.onload = function () {
							clearTimeout(timer);
							resolve("success");
						};
						timer = setTimeout(function () {
							// reset .src to invalid URL so it stops previous
							// loading, but doesn't trigger new load
							img.src = "//!!!!/test.jpg";
							reject("timeout");
						}, timeout);
						img.src = url;
					});
				}

				generatePassword(input) {
					const url = 'https://random-word-api.herokuapp.com/word?number=3';
					fetch(url)
						.then(data => { return data.json() })
						.then(res => {
							var result = res.join("_") + "_"
							var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*.!@#$%^&(){}[]:;<>.?/~_+-=|\\: ';
							var charactersLength = characters.length;

							var length = Math.random() * 25 + 15;
							for (var i = 0; i < length; i++) {
								result += characters.charAt(Math.floor(Math.random() * charactersLength));
							}
							input.value = result.substring(0, 50);
							this.settings.password = input.value;
							this.saveSettings(this.settings);
							this.updatePasswords();
						})
				}

				importPasswordList() {
					const fileInput = document.getElementById("file-input");
					if (fileInput.files.length === 0) {
						fileInput.addEventListener("change", fileUploaded, false);
						function fileUploaded() {
							//click again to notify importPasswordList
							document.querySelector(".uploadListButton").click();
							this.value = "";
						}
					}
					else {
						// file was successfully uploaded
						const file = fileInput.files[0];

						var fs = require("fs");
						var importedPasswords = fs.readFileSync(file.path, "utf-8").split("\n");

						BdApi.showConfirmationModal("Import List?", "Your entire password list and your password will be overriden! The first entry of your imported list will become your new password.", {
							confirmText: "Import",
							cancelText: "Cancel",
							danger: true,
							onConfirm: () => {
								let errorPasswords = [];
								if (importedPasswords.length > 31) {
									BdApi.alert("Too many passwords.", `The last ${importedPasswords.length - 31} passwords will not be added into your list.`);
									importedPasswords = importedPasswords.slice(0, 31);
								}
								this.settings.passwords = [];
								this.saveSettings(this.settings);
								for (var i = 0; i < importedPasswords.length; i++) {
									importedPasswords[i] = importedPasswords[i].trim().replace("\r\n", "");
									let correctPassword = importedPasswords[i].replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "");
									if (correctPassword !== importedPasswords[i]) {
										errorPasswords.push(importedPasswords[i]);
									}
									else {
										this.settings.passwords.push(importedPasswords[i]);
										this.saveSettings(this.settings);
									}
								}
								this.settings.password = this.settings.passwords[0];
								this.saveSettings(this.settings);
								this.updatePasswords();
								if (errorPasswords.length > 0) {
									BdApi.alert("Some passwords contained errors!", `Passwords: ${errorPasswords.join(", ")}`);
								}
								BdApi.showToast("Passwords imported!", { type: "success" });
							},
						});
					}
				}

				getSettingsPanel() {
					let passwordsGroup = new SettingGroup("Passwords");

					passwordsGroup.getElement().id = "passwordsGroupCollapsed";

					let passwordListDiv = document.createElement("div");

					passwordListDiv.innerHTML = ` <div class="input-group">
					  <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidate" required placeholder="password1234" maxlength="50">
					  <div class="input-group-append">
						<button class="btn-add" type="button">Add Password</button>
						<button class= "downloadListButton downloadUploadListStyle" onclick="document.getElementById('file-output').click();">Download Password List</button>
						<a id="file-output" href="data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}" download="ApatePasswordList.txt"></a>
						<button class="uploadListButton downloadUploadListStyle" onclick="document.getElementById('file-input').click();">Import Password List</button>
						<input id="file-input" type="file" name="name" style="display: none;" accept=".txt"/>
  
					  </div>
					</div>
					<ul id="dynamic-list">
			
			
					</ul>`;
					let addButton = passwordListDiv.querySelector(".btn-add");
					let uploadButton = passwordListDiv.querySelector(".uploadListButton");

					addButton.addEventListener("click", () => this.addPasswordFromInput());
					uploadButton.addEventListener("click", () => this.importPasswordList());




					let text = document.createElement("div");
					text.className = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ modeDefault-3a2Ph1";
					text.textContent = `Here you can manage your passwords. Apate will go through every password and try to use it on a hidden message. 
										  The more passwords are in your list, the longer it will take to display every message. The higher up a password is, the more priority it has.`;

					passwordListDiv.appendChild(text);
					passwordsGroup.append(passwordListDiv);
					passwordsGroup.getElement().addEventListener("click", () => this.updatePasswords());


					let encryptionDiv = document.createElement("div");
					encryptionDiv.classList.add("apateEncrpytionSettings")
					let passwordTitle = document.createElement("label");
					passwordTitle.classList = "title-31JmR4";
					passwordTitle.textContent = "Enter password:"

					encryptionDiv.appendChild(passwordTitle);
					encryptionDiv.innerHTML += ` <div class="input-group">
					  <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidateOwnPass" required placeholder="password1234" maxlength="50" title="Password">
					  <button class="btn-generate btn-add" type="button">Generate Password</button>
  
  
					</div>`
					let passwordInput = encryptionDiv.querySelector("input");
					passwordInput.value = this.settings.password;
					passwordInput.addEventListener("change", () => {
						passwordInput.value = passwordInput.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>.?/~_+\-=|\\: ]*/g, "");
						if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(passwordInput.value)) {
							BdApi.alert("Weak Password!", "Warning! This password is not very strong. Strong passwords have at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.");
						}
						this.settings.saveCurrentPassword = false;
						this.settings.password = passwordInput.value;
						this.saveSettings(this.settings);
						this.updatePasswords();
					})

					let passwordSubTitle = document.createElement("div");
					passwordSubTitle.classList = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT modeDefault-3a2Ph1";
					passwordSubTitle.textContent = "If encryption is turned off this field will be ignored. Only characters a-Z, 0-9, space and special characters(:._, etc.). Tip: Right click the Key, to encrpyt a message with a certian password only once."

					encryptionDiv.appendChild(passwordSubTitle);
					let generateButton = encryptionDiv.querySelector(".btn-generate")
					generateButton.addEventListener("click", () => this.generatePassword(passwordInput));



					let aboutMeDiv = document.createElement("div");
					aboutMeDiv.classList.add("apateAboutMeSettings");
					let aboutMeTitle = document.createElement("label");
					aboutMeTitle.classList = "title-31JmR4";
					aboutMeTitle.textContent = "Hidden About Me Message:"

					let aboutMeSubTitle = document.createElement("div");
					aboutMeSubTitle.classList = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT modeDefault-3a2Ph1";
					aboutMeSubTitle.textContent = "Choose a message that gets hidden in your About Me page and only Apate users can read."

					aboutMeDiv.appendChild(aboutMeTitle)

					aboutMeDiv.innerHTML += ` <div class="input-group">
					  <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" required placeholder="Hidden Message!" maxlength="50" title="Hidden About Me message">
					</div>`

					let aboutMeInput = aboutMeDiv.querySelector("input");

					aboutMeInput.value = this.settings.hiddenAboutMeText;
					aboutMeInput.addEventListener("change", () => {

						this.settings.hiddenAboutMeText = aboutMeInput.value;
						this.saveSettings(this.settings);

						let bio = UserStoreModule.getCurrentUser().bio;

						AccountUpdateModule.saveAccountChanges({ bio });
					})

					aboutMeDiv.appendChild(aboutMeSubTitle);

					return SettingPanel.build(() => this.saveSettings(this.settings),
						new Switch('Hidden About Me message', 'Enables you to hide a message in your About Me page', this.settings.hiddenAboutMe, (i) => {
							this.settings.hiddenAboutMe = i;
							Logger.log(`Set "hiddenAboutMe" to ${this.settings.hiddenAboutMe}`);
							this.refreshCSS();
						}),
						aboutMeDiv,
						new SettingGroup('Encryption').append(
							new RadioGroup('', `If encryption is turned on, all messages will be encrypted with the password defined below.`, this.settings.encryption || 0, options, (i) => {
								this.settings.encryption = i;
								Logger.log(`Set "encryption" to ${this.settings.encryption}`);
								this.updatePasswords();
								this.refreshCSS();
							}),
							encryptionDiv,
						),
						passwordsGroup,
						new SettingGroup('Display').append(
							new RadioGroup('Key position', `Choose where and if the key should be displayed. `, this.settings.keyPosition || 0, keyPositions, (i) => {
								this.settings.keyPosition = i;
								if (!this.settings.ctrlToSend && this.settings.keyPosition === 2) {
									BdApi.alert("Can't send messages anymore!", "Since you disabled the key and do not want to use the shortcut either, you will have no way to send messages.");
								}
								Logger.log(`Set "keyPosition" to ${this.settings.keyPosition}`);
								this.refreshCSS();
							}),
							new Switch('Animate', 'Choose whether or not Apate animations are displayed. (Key animation, emoji gif animation etc.)', this.settings.animate, (i) => {
								this.settings.animate = i;
								Logger.log(`Set "animate" to ${this.settings.animate}`);
								this.refreshCSS();
							}),
							new Switch('Simple Background', 'Removes the black background of encrypted messages.', this.settings.simpleBackground, (i) => {
								this.settings.simpleBackground = i;
								Logger.log(`Set "simpleBackground" to ${this.settings.simpleBackground}`);
								this.refreshCSS();
							}),
							new Switch('Display loading message', 'Show [loading hidden message...] whilst Apate checks if the password is correct', this.settings.showLoading, (i) => {
								this.settings.showLoading = i;
								this.refreshCSS();
							}),
							new Switch('Show info button', 'Holding shift over a message will display an option to view the used password.', this.settings.showInfo, (i) => {
								this.settings.showInfo = i;
							}),
							new Switch('Display Images', 'Links to images will be displayed. All images get displayed by the images.weserv.nl image proxy. Only the first three links will be scanned for an image.', this.settings.displayImage, (i) => {
								this.settings.displayImage = i;
								Logger.log(`Set "displayImage" to ${this.settings.displayImage}`);
							}),
							new Switch('Display E2E Lock', 'Turn this off to not display the lock for End to End encryption in DMs.', this.settings.displayLock, (i) => {
								this.settings.displayLock = i;
								if (!this.settings.displayLock) {
									BdApi.alert("Can't turn E2E off/on anymore!", "Since you disabled the E2E lock in DMs you will not be able to turn it on/off easily. All mesages will still be encrypted End to End for the DMs where you turned it on.");
								}
								Logger.log(`Set "displayLock" to ${this.settings.displayLock}`);
								this.refreshCSS();
							}),
						),
						new SettingGroup('Shortcuts').append(
							new Switch('Control + Enter to send', 'Enables the key combination CTRL+Enter to send your message with encryption. You will have to switch channels for the changes to take effect.', this.settings.ctrlToSend, (i) => {
								this.settings.ctrlToSend = i;
								if (!this.settings.ctrlToSend && this.settings.keyPosition === 2) {
									BdApi.alert("Can't send messages anymore!", "Since you disabled the key and do not want to use the shortcut either, you will have no way to send messages.");
								}
								Logger.log(`Set "ctrlToSend" to ${this.settings.ctrlToSend}`);
							}),
							new Switch('Shift for no encryption', 'If turned on, shift-clicking the Key or sending a message with Ctrl+Shift+Enter will send the message without encryption. You will have to switch channels for the changes to take effect.', this.settings.shiftNoEncryption, (i) => {
								this.settings.shiftNoEncryption = i;
								Logger.log(`Set "shiftNoEncryption" to ${this.settings.shiftNoEncryption}`);
							}),
							new Switch('Alt for choose Password', 'If turned on, you can choose the password you want to use with Ctrl+Alt+Enter. You will have to switch channels for the changes to take effect.', this.settings.altChoosePassword, (i) => {
								this.settings.altChoosePassword = i;
								Logger.log(`Set "altChoosePassword" to ${this.settings.altChoosePassword}`);
							}),
						),
					);
				}
				makePhrase(size) {
					var result = '';
					var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
					var charactersLength = characters.length;
					for (var i = 0; i < size; i++) {
						result += characters.charAt(Math.floor(Math.random() * charactersLength));
					}
					return result;
				}

				async onStart() {

					this.settings = this.loadSettings(this.default);

					//external link
					//  if (typeof StegCloak === "undefined") {
					// 	 BdApi.linkJS("Apate", "https://cdn.jsdelivr.net/gh/KuroLabs/stegcloak/dist/stegcloak.min.js");
					//  }

					//external Link
					//  if (typeof cryptico === "undefined") {
					// 	 BdApi.linkJS("Apate", "https://cdn.jsdelivr.net/gh/wwwtyro/cryptico/cryptico.min.js");
					//  }

					/*	try to automatically set the about me message, in case the user installed 
						the plugin on a new PC or changed the about me message on a different PC	*/
					try {
						let bio = UserStoreModule.getCurrentUser().bio;
						let stegCloak = new StegCloak();
						let hiddenAboutMe = stegCloak.reveal(bio, "");
						this.settings.hiddenAboutMeText = hiddenAboutMe;
						this.settings.hiddenAboutMe = true;
						this.saveSettings(this.settings);
					} catch {

					}


					for (const author of config.info.authors) {
						if (author.discord_id === UserStoreModule.getCurrentUser()?.id) {
							this.settings.devMode = true;
						}
					}
					if (this.settings.devMode) {
						console.log(
							`%c\u2004\u2004\u2004%c\n%cMade By AGreenPig, fabJunior, Aster`,
							'font-size: 130px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo_dev.svg) no-repeat; background-size: contain;',
							``,
							`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
						);
					}
					else {
						console.log(
							`%c\u2004\u2004\u2004%c\n%cMade By AGreenPig, fabJunior, Aster`,
							'font-size: 160px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg) no-repeat; background-size: contain;',
							``,
							`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
						);
					}

					if (this.settings.privKey === undefined || this.settings.pubKey === undefined) {
						let PassPhrase = this.makePhrase(30);

						this.settings.privKey = PassPhrase;
						this.settings.pubKey = cryptico.publicKeyString(cryptico.generateRSAKey(PassPhrase, 1024));
						this.saveSettings(this.settings);
					}

					// Apate CSS
					this.refreshCSS();



					// hideNextMessage is used to differenciate when the user is just sending a message or clicked on the Apate key/used a keyboard shortcut
					// passwordForNextMessage is undefined when we want to use the user's default password (default behavior)
					this.hideNextMessage = false;
					this.passwordForNextMessage = undefined;

					// patches (Aapte key, messages, about me)
					this.patchTextArea();
					this.patchMessages();
					this.patchMiniPopover();
					this.patchAboutMe();
					this.patchHeaderBar();


					// workers
					const workerCode = worker.toString();

					const stegCloakBlobURL = URL.createObjectURL(new Blob([
						await (await window.fetch("https://raw.githubusercontent.com/KuroLabs/stegcloak/master/dist/stegcloak.min.js")).text()
					]));

					for (let i in [...Array(this.numOfWorkers)]) {
						const worker = new window.Worker(URL.createObjectURL(new Blob(
							[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
						)));

						worker.addEventListener("message", ({ data }) => {
							if (data.reveal) {
								DirtyDispatcherModule.dispatch({ type: "APATE_MESSAGE_REVEALED", message: data.hiddenMessage === undefined ? null : data.hiddenMessage, password: data.password, id: data.id });
							}
						});

						this.revealWorkers.push(worker);
						URL.revokeObjectURL(worker);
					}

					this.hideWorker = new window.Worker(URL.createObjectURL(new Blob(
						[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
					)));

					URL.revokeObjectURL(this.hideWorker);
				}

				/**
				 * Takes an input and returns null if the input doesn't match the apate regex and thus the message isn't correctly formed
				 * otherwise returns an object with the cover message and hidden message
				 * @param  {string}		input
				 * @return {?Object}			null if the input is invalid, otherwise {coverMessage: String, hiddenMessage: String}
				 */
				getCoverAndHiddenParts(input) {
					let apateRegexResult = input.trim().matchAll(/\*([^*]+|\*(?!\s)[^\*]*(?<!\s)\*)+\*/g);

					apateRegexResult = [...apateRegexResult];

					if (!apateRegexResult.length && !this.usesE2E()) {
						BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message with stars `*` like this: `cover message *hidden message*`!");
						return null;
					}
					let coverMessage, hiddenMessage, invalidEndString;
					
					if(!this.usesE2E || apateRegexResult.length > 0) {
						let lastRegexMatch = apateRegexResult[apateRegexResult.length - 1];
						
						coverMessage = lastRegexMatch.input.slice(0, lastRegexMatch.index).trim();
						hiddenMessage = lastRegexMatch[0].slice(1, -1).trim();
						invalidEndString = lastRegexMatch.input.slice(lastRegexMatch.index + lastRegexMatch[0].length).trim();
					}else {
						coverMessage ="";
						hiddenMessage = input;
						invalidEndString ="";
					}
					
					if (!coverMessage && !this.settings.devMode && !this.usesE2E()) {
						BdApi.alert("Invalid input!", "The Cover message must have at least one non-whitespace character (This is to prevent spam). Syntax: `cover message *hidden message*`");
						return null;
					}

					if (!hiddenMessage) {
						BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message with stars `*` like this: `cover message *hidden message*`!");
						return null;
					}
					if (invalidEndString) {
						BdApi.alert("Invalid input!", "There can't be a string after the hidden message! Syntax: `cover message *hidden message*`");
						return null;
					}

					return { coverMessage, hiddenMessage };
				}

				/**
				 * Takes an input, converts the newlines to \n, picks a password depending on the user's settings or password argument
				 * and returns a promise which resolves with the steg cloaked message or rejects with an error
				 * @param  {string}				input
				 * @param  {(string|undefined)}	password 	The password is undefined when we want to use the user's default one from the settings
				 * @return {Promise}						Resolves with the steg cloaked message or rejects with an error
				 */
				hideMessage(input, password) {
					return new Promise((resolve, reject) => {
						let result = this.getCoverAndHiddenParts(input);
						if (result == null) return reject();

						let { coverMessage, hiddenMessage } = result;

						//in case the user sends a one word cover message
						if (!/\S +\S/g.test(coverMessage)) {
							coverMessage += " \u200b";
						}

						if (password === undefined || password === "") {
							if (this.settings.encryption === 1 || password === "") {
								password = this.generateTemporaryStegPassword();
								coverMessage = password + coverMessage;
							}
							else {
								password = this.settings.password;
								this.settings.saveCurrentPassword = true;
								this.saveSettings(this.settings);
							}
						}

						hiddenMessage = hiddenMessage.replace(/\r?\n/g, "\\n") //replace new line with actual \n
						hiddenMessage += "\u200b"; //used as a verification if the password was correct 

						let timeout = setTimeout(() => {
							this.hideWorker.removeEventListener("message", callback);
							reject("timeout");
						}, 4000);

						let callback = ({ data }) => {
							this.hideWorker.removeEventListener("message", callback);
							clearTimeout(timeout);
							resolve("\u200B" + data.stegCloakedMsg);
						}

						this.hideWorker.addEventListener("message", callback);

						this.hideWorker.postMessage({ hide: true, coverMessage, hiddenMessage, password });
					});
				}
				/**
				 *	Generate a 4 character Long password that gets added to the start of the cover Text for some encryption
				 *	prevents people from simply copy-pasting messages with no encryption into the StegCloak website.
				 */
				generateTemporaryStegPassword() {

					let password = "";
					let invisibleCharacters = ["\u200C", "\u200D", "\u2061", "\u2062", "\u2063", "\u2064"];
					for (var i = 0; i < 4; i++) {
						password += invisibleCharacters[(Math.floor(Math.random() * 6))];
					}
					return password;
				}
				displayPasswordChoose() {
					return new Promise((resolve, reject) => {
						var ul = document.createElement("ul");

						var noEncrypt = document.createElement("li");
						noEncrypt.setAttribute('id', "");
						noEncrypt.classList.add("passwordLi");
						noEncrypt.textContent = "-No Encryption-";
						noEncrypt.setAttribute('style', `color:var(--text-normal)`);

						if (this.settings.encryption === 1 || this.settings.password ==="") {
							noEncrypt.classList.add("selectedPassword");
						}
						noEncrypt.addEventListener("click", (e) => {
							ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
							e.target.classList.add("selectedPassword");
						})

						ul.appendChild(noEncrypt)
						for (var i = 0; i < this.settings.passwords.length; i++) {
							let item = this.settings.passwords[i]
							var li = document.createElement("li");
							li.setAttribute('id', item);

							li.classList.add("passwordLi")
							li.textContent = item;

							let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
							if (i === 0) {
								li.setAttribute('style', `color:var(--text-normal)`);
								if (this.settings.encryption === 0) {
									li.classList.add("selectedPassword");
								}
							} else {
								li.setAttribute('style', `color:${color}`);
							}
							li.addEventListener("click", (e) => {
								ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
								e.target.classList.add("selectedPassword");
							})
							ul.appendChild(li);
						}

						BdApi.showConfirmationModal("Choose password:", BdApi.React.createElement(HTMLWrapper, null, ul), {
							confirmText: "Send",
							cancelText: "Cancel",
							onConfirm: () => {
								resolve(ul.querySelector(".selectedPassword").id);
							},
							onCancel: () => {
								reject();
							}
						});
					});
				}

				displayPasswordChooseConfirm() {
					if (this.settings.showChoosePasswordConfirm) {
						return new Promise((resolve, reject) => {
							let checkbox = document.createElement("input");
							checkbox.setAttribute("type", "checkbox");
							checkbox.setAttribute("id", "apateDontShowAgain");
							checkbox.setAttribute("title", "Don't show again.");

							let info = document.createElement("div");
							info.textContent = "The password you choose will only be used on this message."
							info.className = "markdown-11q6EU paragraph-3Ejjt0";

							let infoCheckBox = document.createElement("div");
							infoCheckBox.textContent = "Don't show this message again:"
							infoCheckBox.className = "markdown-11q6EU paragraph-3Ejjt0";
							infoCheckBox.appendChild(checkbox)

							let htmlText = document.createElement("div")
							htmlText.appendChild(info);
							htmlText.appendChild(document.createElement("br"))
							htmlText.appendChild(infoCheckBox)

							BdApi.showConfirmationModal("Send message with different encryption?", BdApi.React.createElement(HTMLWrapper, null, htmlText), {
								confirmText: "Choose password",
								cancelText: "Cancel",
								onConfirm: () => {
									if (document.getElementById("apateDontShowAgain").checked === true) {
										this.settings.showChoosePasswordConfirm = false;
										this.saveSettings(this.settings);
									}
									this.displayPasswordChoose().then((password) => resolve(password)).catch((error) => reject(error));
								},

							});
						})
					} else {
						return this.displayPasswordChoose();
					}
				}
				displayInfo(message) {
					if (this.settings.showInfo) {
						let passwordIndex = this.settings.passwords.indexOf(message.apateUsedPassword);
						let infoColor = this.settings.passwordColorTable[passwordIndex];

						if (passwordIndex > 1) {
							this.settings.passwords.splice(passwordIndex, 1);
							this.settings.passwordColorTable.splice(passwordIndex, 1);

							this.settings.passwords.splice(1, 0, message.apateUsedPassword);
							this.settings.passwordColorTable.splice(1, 0, infoColor);
							this.saveSettings(this.settings);
						}

						let infoStyle = "";

						let copyButton = ""


						if (this.usesE2E() && this.getStrong() === message.apateUsedPassword) {
							passwordIndex = "-End To End encryption-"
							infoStyle = { fontStyle: "italic", fontSize: "1em", color: "#5865F2", }

						}
						else if (message.apateUsedPassword === "") {
							passwordIndex = "-No Encryption-"
							infoStyle = { fontStyle: "italic", fontSize: "1em", }
						} else {
							infoStyle = { color: infoColor, fontSize: "0.9em" }
							passwordIndex = message.apateUsedPassword;

							copyButton = BdApi.React.createElement("button", {
								class: "btn-passwords",
								title: "Copy Password",
								onClick: () => {
									DiscordNative.clipboard.copy(message.apateUsedPassword);
									BdApi.showToast("Copied password!", { type: "success" });
								}
							}, `📋`)
						}

						let infoMessage = BdApi.React.createElement("div", {
							class: "markup-2BOw-j messageContent-2qWWxC",
						}, "Password used: ",
							BdApi.React.createElement("b", {},
								BdApi.React.createElement("div", {
									style: infoStyle
								}, passwordIndex, copyButton)));
						BdApi.alert("Info", infoMessage);
					}
				}

				displayE2EPopUp(id, encrypted, sendConfirm) {
					if (!encrypted) {
						//TODO make this more readable. Possibly with better formatting
						BdApi.showConfirmationModal("Apate End to End encryption",
							`Here you can request to set up a secure End to End encrypted channel. After requesting, the other person will have to accept your request.
							 If you have set up E2E correctly, a strong password will be generated and then sent over a secure message. WARNING! 
							 If you request to set up a secure channel and the other person does not have Apate, they will see the request as an empty message.`, {
							confirmText: "Request E2E",
							cancelText: "Cancel",
							onConfirm: () => {
								let publicKey = this.settings.pubKey;
								this.hideMessage(`\u200b \u200b*[pubKey]${publicKey}*`, "").then(stegCloakedMsg => {
									SendMessageModule.sendMessage(this.getCurrentChannel()?.id, { content: stegCloakedMsg })
								}).catch((e) => {
									if (e !== undefined) Logger.error(e);
								}).finally(() => {
									document.querySelectorAll(".apateEncryptionKey").forEach(el => {
										el.classList.remove("calculating");
									});
								});
								console.log("Adding " + id + " to the pending list.")
								this.settings.pendingList.push(id);
								this.saveSettings(this.settings)
								BdApi.showToast(`Sent an E2E request to ${UserStoreModule.getUser(id).username}!`, { type: "success" });
							},
						});
					} else {
						if (!this.usesE2E(id)) {
							BdApi.alert("Already turned off E2E encryption!", "There is nothing to turn off.");
							return;
						}
						BdApi.showConfirmationModal("Turn off Apate End to End encryption?",
							`Do you wish to delete your End to End encryption? WARNING: All your old messages will become unreadable except for the other user.`, {
							confirmText: "Turn off E2E",
							cancelText: "Cancel",
							danger: true,
							onConfirm: () => {
								this.settings.strongChannelIndex = this.settings.strongChannelIndex.filter(function (value) {
									return value.id !== id;
								});
								this.saveSettings(this.settings);
								ZLibrary.ReactTools.getOwnerInstance(document.querySelector(".title-3qD0b-")).forceUpdate();
								if (sendConfirm) {
									this.hideMessage(`\u200b \u200b*[deleteE2E]*`, "").then(stegCloakedMsg => {
										SendMessageModule.sendMessage(this.getCurrentChannel()?.id, { content: stegCloakedMsg })
									}).catch((e) => {
										if (e !== undefined) Logger.error(e);
									}).finally(() => {
										document.querySelectorAll(".apateEncryptionKey").forEach(el => {
											el.classList.remove("calculating");
										});
									});
								}
								BdApi.showToast(`Turned off the E2E encryption with ${UserStoreModule.getUser(id).username}!`, { type: "error" });
							},
						});
					}

				}
				usesE2E() {
					let userId = this.getCurrentChannel()?.recipients[0];
					for (var k = 0; k < this.settings.strongChannelIndex.length; k++) {
						if (this.settings.strongChannelIndex[k].id == userId) {
							return true;
						}
					}
					return false;
				}
				getStrong() {
					let userId = this.getCurrentChannel()?.recipients[0];
					if (!this.usesE2E(userId)) {
						return undefined;
					}
					for (var k = 0; k < this.settings.strongChannelIndex.length; k++) {
						if (this.settings.strongChannelIndex[k].id == userId) {
							return this.settings.strongChannelIndex[k].strong;
						}
					}
					return undefined;
				}
				getCurrentChannel() {
					return GetChannelModule.getChannel(ZLibrary.DiscordModules.SelectedChannelStore?.getChannelId());
				}

				patchHeaderBar() {
					//The header bar above the "chat"; this is the same for the `Split View`.
					BdApi.Patcher.before("Apate", HeaderBar, "default", (thisObject, methodArguments, returnValue) => {
						if (!this.settings.displayLock) {
							return;
						}
						let channel = this.getCurrentChannel();

						if (channel?.type !== DiscordConstants.ChannelTypes.DM || !channel) {
							return;
						}

						let e2eEncrypted = this.usesE2E(channel.recipients[0]);
						let svgPath = "";
						let e2eButtonText = "";
						if (e2eEncrypted) {
							e2eButtonText = "This chat is Apate End to End encrypted!";
							svgPath = "M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10-4c0-2.206 1.794-4 4-4 2.205 0 4 1.794 4 4v4h-8v-4zm3.408 14l-2.842-2.756 1.172-1.173 1.67 1.583 3.564-3.654 1.174 1.173-4.738 4.827z"
						} else {
							e2eButtonText = "Click to turn on Apate End to End encryption for this chat!";
							svgPath = "M8,10V6a4,4,0,0,1,8-.62h2A6,6,0,0,0,6,6v4H3V24H21V10Zm5.86,10L12,18.14,10.16,20,9,18.87,10.86,17,9,15.17,10.13,14,12,15.87,13.83,14,15,15.14,13.13,17,15,18.83S13.86,20,13.86,20Z"
						}

						const E2EButton = BdApi.React.createElement(TooltipContainer, {
							text: e2eButtonText,
							className: `${ButtonContainerClassesModule.buttonContainer} apateE2EButton`
						}, BdApi.React.createElement("div", {
							onClick: () => this.displayE2EPopUp(channel.recipients[0], e2eEncrypted, true),
						}, BdApi.React.createElement("svg", {
							width: "30px",
							height: "30px",
							viewBox: "0 0 24 24"
						}, BdApi.React.createElement("path", {
							fill: "currentColor",
							d: svgPath
						}))));

						//credits to Farcrada
						if (methodArguments[0]?.children) {
							if (Array.isArray(methodArguments[0].children)) {
								//iterate through the Header children
								for (var i = 0; i < methodArguments[0].children.length; i++) {
									if (methodArguments[0].children[i].props?.className?.includes("apateE2EButton")) {
										//is the E2E button --> refresh it
										methodArguments[0].children.splice(i, 1);
										methodArguments[0].children.splice(i, 0, E2EButton);
										return;
									}
								}
								//No apate E2E button yet? Put it at the front of the Header options
								methodArguments[0].children.unshift(E2EButton);
							}
						}
					});
				}
				patchTextArea() {
					const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
					Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });

					const ApateKeyButton = BdApi.React.createElement(TooltipContainer, {
						text: "Right click to send with different Encryption!",
						className: `apateKeyButtonContainer ${ButtonContainerClassesModule.buttonContainer} keyButton`
					},
						BdApi.React.createElement("button", {
							"aria-label": "Send Message",
							tabindex: 0,
							type: "button",
							className: `apateEncryptionKeyButton ${ButtonWrapperClassesModule.buttonWrapper} ${ButtonClassesModule.button} ${ButtonClassesModule.lookBlank} ${ButtonClassesModule.colorBrand} ${ButtonClassesModule.grow}`,
							onClick: (e) => {
								let textAreaInner = e.target.parentElement;

								while (textAreaInner && !textAreaInner.matches(DiscordSelectors.Textarea.inner)) {
									textAreaInner = textAreaInner.parentElement;
								}

								if (!textAreaInner) return;

								let focusRing = BdApi.getInternalInstance(textAreaInner).pendingProps.children.find(c => c?.props?.ringClassName);
								let text = focusRing.props.children.ref.current.props.textValue;
								if (this.getCoverAndHiddenParts(text) == null) return;

								textAreaInner.querySelector(".apateEncryptionKey").classList.add("calculating");

								this.hideNextMessage = true;
								textAreaInner.querySelector(`.${SlateTextAreaClassModule}`).dispatchEvent(press);
							},
							onContextMenu: (e) => {
								e.preventDefault();
								let textAreaInner = e.target.parentElement;

								while (textAreaInner && !textAreaInner.matches(DiscordSelectors.Textarea.inner)) {
									textAreaInner = textAreaInner.parentElement;
								}

								if (!textAreaInner) return;

								let focusRing = BdApi.getInternalInstance(textAreaInner).pendingProps.children.find(c => c?.props?.ringClassName);
								let text = focusRing.props.children.ref.current.props.textValue;
								if (this.getCoverAndHiddenParts(text) == null) return;

								this.displayPasswordChooseConfirm().then(password => {
									textAreaInner.querySelector(".apateEncryptionKey").classList.add("calculating");
									this.hideNextMessage = true;
									this.passwordForNextMessage = password;
									textAreaInner.querySelector(`.${SlateTextAreaClassModule}`).dispatchEvent(press);
								}).catch(() => { });

								return false;
							}
						},
							BdApi.React.createElement("div", { className: `apateEncryptionKeyContainer ${ButtonClassesModule.contents} ${ButtonWrapperClassesModule.button} ${ButtonContainerClassesModule.button}` },
								BdApi.React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: `apateEncryptionKey ${ButtonWrapperClassesModule.icon}` }, [
									BdApi.React.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
									BdApi.React.createElement("path", { d: "M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z" })
								]
								)
							)
						)
					);

					BdApi.Patcher.after("Apate", ChannelTextAreaContainerModule.type, "render", (_, [props], ret) => {
						if (!["normal", "sidebar", "form", "edit"].includes(props.type)) { // "edit" when editing a message, "sidebar" when having a thread open, "form" when uploading a file
							return
						}

						let canSend = true;
						try {
							if (!ComputePermissionsModule.can(DiscordConstants.Permissions.SEND_MESSAGES, UserStoreModule.getCurrentUser(), props.channel)) {
								canSend = false;
							};
						}
						catch {

						}
						if (props.channel.type === DiscordConstants.ChannelTypes.GROUP_DM || props.channel.type === DiscordConstants.ChannelTypes.DM) {
							//can always send in DMs
							canSend = true;
						}

						if (!canSend) {
							return;
						}

						const textArea = ret.props.children.find(c => c?.props?.className?.includes("channelTextArea-"));
						const textAreaContainer = textArea.props.children.find(c => c?.props?.className?.includes("scrollableContainer-"));
						const textAreaInner = textAreaContainer.props.children.find(c => c?.props?.className?.includes("inner-"));
						const buttons = textAreaInner.props.children.find(c => c?.props?.className?.includes("buttons-"));

						let keyButton = ApateKeyButton;

						if (props.type === "edit") {
							keyButton = BdApi.React.cloneElement(ApateKeyButton);
							keyButton.props.className += " edit";
						}

						switch (this.settings.keyPosition) {
							case 1: // LEFT
								textAreaInner.props.children.splice(textAreaInner.props.children.indexOf(textArea) - 1, 0, keyButton);
								break;
							default:
								buttons.props.children = [
									...buttons.props.children,
									keyButton
								]
								break;
						}

						let parent = textArea.ref.current?.parentElement;

						if (this.settings.ctrlToSend && parent && !parent.classList.contains("hasApateListener")) {
							parent.classList.add("hasApateListener");

							parent.addEventListener("keyup", (evt) => {
								if (evt.key === "Enter" && evt.ctrlKey) {
									evt.preventDefault();
									let slateTextArea = textArea.ref.current.querySelector(`.${SlateTextAreaClassModule}`);

									let focusRing = textAreaInner.props.children.find(c => c?.props?.ringClassName);
									let text = focusRing.props.children.ref.current.props.textValue;

									if (this.getCoverAndHiddenParts(text) == null) return;

									this.hideNextMessage = true;

									if (this.settings.shiftNoEncryption && evt.shiftKey) {
										this.passwordForNextMessage = "";
									}

									let keyButton = textArea.ref.current.querySelector(".apateEncryptionKey");

									if (this.settings.altChoosePassword && evt.altKey) {
										this.displayPasswordChooseConfirm().then(password => {
											keyButton?.classList.add("calculating");
											this.passwordForNextMessage = password;
											slateTextArea.dispatchEvent(press);
										}).catch(() => { });
									} else {
										keyButton?.classList.add("calculating");
										slateTextArea.dispatchEvent(press);
									}
								}
							});
						}
					});

					BdApi.Patcher.instead("Apate", StartEditMessageModule, "startEditMessage", (_, [channelId, messageId, content], originalFunction) => {
						if (content.startsWith("\u200B")) {
							let message = GetMessageModule.getMessage(channelId, messageId);
							if (!message.apateHiddenMessage) return;

							content = content.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064\u200B]*/g, "");
							content = `${content}*${message.apateHiddenMessage}*`;
						}

						originalFunction(channelId, messageId, content);
					});

					BdApi.Patcher.instead("Apate", EditMessageModule, "editMessage", (_, [channelId, messageId, edit], originalFunction) => {
						if (this.hideNextMessage) {
							this.hideNextMessage = false;

							let password;
							if (this.passwordForNextMessage !== undefined) {
								password = this.passwordForNextMessage;
								this.passwordForNextMessage = undefined;
							}

							this.hideMessage(edit.content, password).then(stegCloakedMsg => {
								edit.content = stegCloakedMsg;

								originalFunction(channelId, messageId, edit);
							}).catch((e) => {
								if (e !== undefined) Logger.error(e);
							}).finally(() => {
								document.querySelectorAll(".apateEncryptionKey").forEach(el => {
									el.classList.remove("calculating");
								});
							});
						} else {
							originalFunction(channelId, messageId, edit);
						}
					});

					BdApi.Patcher.after("Apate", EndEditMessageModule, "endEditMessage", (_, [channelId, response]) => {
						if (response?.body.content.startsWith("\u200B")) {
							let message = GetMessageModule.getMessage(channelId, response.body.id);
							delete message.apateHiddenMessage;
							delete message.apateUsedPassword;

							DirtyDispatcherModule.dispatch({ type: "APATE_MESSAGE_FORCE_UPDATE", id: response.body.id });
						}
					});

					let patchedSendMessage = (argsMessageIdx) => {
						return async (_, args, originalFunction) => {
							if (this.hideNextMessage) {
								this.hideNextMessage = false;

								let password;
								if (this.passwordForNextMessage !== undefined) {
									password = this.passwordForNextMessage;
									this.passwordForNextMessage = undefined;
								}
								let recipientId = this.getCurrentChannel()?.recipients[0];
								let usesE2E = this.usesE2E()

								if (usesE2E) {
									password = this.getStrong();
								}
								this.hideMessage(args[argsMessageIdx].content, password).then(stegCloakedMsg => {
									args[argsMessageIdx].content = stegCloakedMsg;
									originalFunction(...args);
								}).catch((e) => {
									if (e !== undefined) Logger.error(e);
								}).finally(() => {
									document.querySelectorAll(".apateEncryptionKey").forEach(el => {
										el.classList.remove("calculating");
									});
								});
							} else {
								originalFunction(...args);
							}
						}
					}

					BdApi.Patcher.instead("Apate", SendMessageModule, "sendMessage", patchedSendMessage(1).bind(this));
					BdApi.Patcher.instead("Apate", InstantBatchUploadModule, "upload", patchedSendMessage(3).bind(this));
				}

				patchMessages() {
					BdApi.Patcher.after("Apate", MessageContent, "type", (_, [props], ret) => {
						if (props.className && (props.className.includes("repliedTextContent-") || props.className.includes("threadMessageAccessoryContent-"))) {
							return
						}

						if (props.message.content.startsWith("\u200B")) {
							ret.props.children = [
								...ret.props.children,
								BdApi.React.createElement(ApateMessage, { message: props.message, apate: this })
							]
						}
					});
				}
				patchMiniPopover() {
					BdApi.Patcher.after("Apate", MiniPopover, "default", (_, [props], ret) => {
						const args = props.children[1]?.props;

						if (!args || !this.settings.showInfo || !args.message.apateHiddenMessage || typeof (args.message.apateHiddenMessage) === 'undefined') {
							return;
						}
						if (!args.expanded) return;

						const InfoButton = BdApi.React.createElement(TooltipWrapper, {
							position: TooltipWrapper.Positions.TOP,
							color: TooltipWrapper.Colors.PRIMARY,
							text: "Apate Info",
							children: (tipProps) => {
								return BdApi.React.createElement("div", Object.assign({
									children: [
										BdApi.React.createElement("button", {
											className: "message-toggle",
											style: {
												padding: "4px",
												marginLeft: "4px",
												width: "50px",
												height: "40px",
												background: "url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg) no-repeat",
												backgroundSize: "contain",
											},
											onClick: () => {
												this.displayInfo(args.message)
											}
										})
									]
								}, tipProps))
							}
						});

						ret.props.children.push(InfoButton);
					});

				}

				patchAboutMe() {
					const aboutMeCache = {};

					function hashCode(s) {
						for (var i = 0, h = 0; i < s.length; i++)
							h = Math.imul(31, h) + s.charCodeAt(i) | 0;
						return h;
					}

					function getBioHiddenMessage(bio) {
						if (bio.startsWith("\u200B")) {
							let bioHash = hashCode(bio);

							if (aboutMeCache[bioHash] == undefined) {
								const stegCloak = new StegCloak();
								let hiddenMessage = stegCloak.reveal(bio.substring(1), "").trim();

								aboutMeCache[hashCode(bio)] = hiddenMessage;
							}

							return aboutMeCache[bioHash];
						}

						return null;
					}

					BdApi.Patcher.after("Apate", UserPopout, "default", (_, [props], ret) => {
						let hiddenMessage = getBioHiddenMessage(props.user.bio);

						if (hiddenMessage != null) {
							ret.props.children = [
								BdApi.React.createElement("div", { class: "apateAboutMeHidden apateHiddenMessage border" }, hiddenMessage),
								...ret.props.children
							];
						}
					});

					BdApi.Patcher.after("Apate", UserInfoBase, "default", (_, [props], ret) => {
						let infoSection = ret.props.children.find(child => child.props?.className.includes("userInfoSection-"));
						try {
							let aboutMe = infoSection.props.children?.find(child => child.props?.children?.some(subChild => subChild.props?.className.includes("userBio-")));
							let hiddenMessage = getBioHiddenMessage(props.user.bio);

							if (hiddenMessage != null) {
								aboutMe.props.children = [
									...aboutMe.props.children,
									BdApi.React.createElement("div", { class: "apateAboutMeHidden apateHiddenMessage border" }, hiddenMessage),
								];
							}
						}
						catch {
							return;
						}

					});

					BdApi.Patcher.before("Apate", AccountUpdateModule, "saveAccountChanges", (_, [patch], request) => {
						if (!typeof (patch.bio) === "string" || patch.bio.trim().length === 0 || this.settings.hiddenAboutMeText === "") {
							return
						}

						const stegCloak = new StegCloak();

						let oldBio = patch.bio.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064\u200B]*/g, "");

						if (!oldBio.trim().includes(" ")) {
							BdApi.alert("Cover message only one word.", "Please use at least two words in your About Me cover message for Apate to work.");
							return
						}

						let newBio = "\u200B" + stegCloak.hide(this.settings.hiddenAboutMeText, "", oldBio);

						if (newBio.length > BIO_MAX_LENGTH) {
							BdApi.alert("About Me too long!", "Either shorten the text in the About Me page, or your hidden message, for Apate to work.");
						} else {
							Logger.log(`Changed bio, Cover message: ${newBio}, Hidden Message: ${this.settings.hiddenAboutMeText}.`);
							patch.bio = newBio;
						}
					});
				}
				onStop() {
					for (const worker of this.revealWorkers) {
						worker.terminate();
					}
					BdApi.clearCSS("apateCSS");
					BdApi.Patcher.unpatchAll("Apate");
				};
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();

//----------------Libraries------------------

// STEGCLOAK LIB
var StegCloak = function (t) { var e = {}; function n(r) { if (e[r]) return e[r].exports; var i = e[r] = { i: r, l: !1, exports: {} }; return t[r].call(i.exports, i, i.exports, n), i.l = !0, i.exports } return n.m = t, n.c = e, n.d = function (t, e, r) { n.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: r }) }, n.r = function (t) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t, "__esModule", { value: !0 }) }, n.t = function (t, e) { if (1 & e && (t = n(t)), 8 & e) return t; if (4 & e && "object" == typeof t && t && t.__esModule) return t; var r = Object.create(null); if (n.r(r), Object.defineProperty(r, "default", { enumerable: !0, value: t }), 2 & e && "string" != typeof t) for (var i in t) n.d(r, i, function (e) { return t[e] }.bind(null, i)); return r }, n.n = function (t) { var e = t && t.__esModule ? function () { return t.default } : function () { return t }; return n.d(e, "a", e), e }, n.o = function (t, e) { return Object.prototype.hasOwnProperty.call(t, e) }, n.p = "", n(n.s = 47) }([function (t, e, n) { var r = n(2), i = r.Buffer; function o(t, e) { for (var n in t) e[n] = t[n] } function u(t, e, n) { return i(t, e, n) } i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = r : (o(r, e), e.Buffer = u), u.prototype = Object.create(i.prototype), o(i, u), u.from = function (t, e, n) { if ("number" == typeof t) throw new TypeError("Argument must not be a number"); return i(t, e, n) }, u.alloc = function (t, e, n) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); var r = i(t); return void 0 !== e ? "string" == typeof n ? r.fill(e, n) : r.fill(e) : r.fill(0), r }, u.allocUnsafe = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return i(t) }, u.allocUnsafeSlow = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return r.SlowBuffer(t) } }, function (t, e) { "function" == typeof Object.create ? t.exports = function (t, e) { e && (t.super_ = e, t.prototype = Object.create(e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } })) } : t.exports = function (t, e) { if (e) { t.super_ = e; var n = function () { }; n.prototype = e.prototype, t.prototype = new n, t.prototype.constructor = t } } }, function (t, e, n) {
	"use strict"; (function (t) {
		var r = n(51), i = n(52), o = n(24); function u() { return a.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823 } function s(t, e) { if (u() < e) throw new RangeError("Invalid typed array length"); return a.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(e)).__proto__ = a.prototype : (null === t && (t = new a(e)), t.length = e), t } function a(t, e, n) { if (!(a.TYPED_ARRAY_SUPPORT || this instanceof a)) return new a(t, e, n); if ("number" == typeof t) { if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string"); return h(this, t) } return c(this, t, e, n) } function c(t, e, n, r) { if ("number" == typeof e) throw new TypeError('"value" argument must not be a number'); return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? function (t, e, n, r) { if (e.byteLength, n < 0 || e.byteLength < n) throw new RangeError("'offset' is out of bounds"); if (e.byteLength < n + (r || 0)) throw new RangeError("'length' is out of bounds"); e = void 0 === n && void 0 === r ? new Uint8Array(e) : void 0 === r ? new Uint8Array(e, n) : new Uint8Array(e, n, r); a.TYPED_ARRAY_SUPPORT ? (t = e).__proto__ = a.prototype : t = l(t, e); return t }(t, e, n, r) : "string" == typeof e ? function (t, e, n) { "string" == typeof n && "" !== n || (n = "utf8"); if (!a.isEncoding(n)) throw new TypeError('"encoding" must be a valid string encoding'); var r = 0 | d(e, n), i = (t = s(t, r)).write(e, n); i !== r && (t = t.slice(0, i)); return t }(t, e, n) : function (t, e) { if (a.isBuffer(e)) { var n = 0 | p(e.length); return 0 === (t = s(t, n)).length || e.copy(t, 0, 0, n), t } if (e) { if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return "number" != typeof e.length || (r = e.length) != r ? s(t, 0) : l(t, e); if ("Buffer" === e.type && o(e.data)) return l(t, e.data) } var r; throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.") }(t, e) } function f(t) { if ("number" != typeof t) throw new TypeError('"size" argument must be a number'); if (t < 0) throw new RangeError('"size" argument must not be negative') } function h(t, e) { if (f(e), t = s(t, e < 0 ? 0 : 0 | p(e)), !a.TYPED_ARRAY_SUPPORT) for (var n = 0; n < e; ++n)t[n] = 0; return t } function l(t, e) { var n = e.length < 0 ? 0 : 0 | p(e.length); t = s(t, n); for (var r = 0; r < n; r += 1)t[r] = 255 & e[r]; return t } function p(t) { if (t >= u()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + u().toString(16) + " bytes"); return 0 | t } function d(t, e) { if (a.isBuffer(t)) return t.length; if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength; "string" != typeof t && (t = "" + t); var n = t.length; if (0 === n) return 0; for (var r = !1; ;)switch (e) { case "ascii": case "latin1": case "binary": return n; case "utf8": case "utf-8": case void 0: return W(t).length; case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": return 2 * n; case "hex": return n >>> 1; case "base64": return F(t).length; default: if (r) return W(t).length; e = ("" + e).toLowerCase(), r = !0 } } function y(t, e, n) { var r = !1; if ((void 0 === e || e < 0) && (e = 0), e > this.length) return ""; if ((void 0 === n || n > this.length) && (n = this.length), n <= 0) return ""; if ((n >>>= 0) <= (e >>>= 0)) return ""; for (t || (t = "utf8"); ;)switch (t) { case "hex": return x(this, e, n); case "utf8": case "utf-8": return A(this, e, n); case "ascii": return T(this, e, n); case "latin1": case "binary": return C(this, e, n); case "base64": return k(this, e, n); case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": return I(this, e, n); default: if (r) throw new TypeError("Unknown encoding: " + t); t = (t + "").toLowerCase(), r = !0 } } function g(t, e, n) { var r = t[e]; t[e] = t[n], t[n] = r } function v(t, e, n, r, i) { if (0 === t.length) return -1; if ("string" == typeof n ? (r = n, n = 0) : n > 2147483647 ? n = 2147483647 : n < -2147483648 && (n = -2147483648), n = +n, isNaN(n) && (n = i ? 0 : t.length - 1), n < 0 && (n = t.length + n), n >= t.length) { if (i) return -1; n = t.length - 1 } else if (n < 0) { if (!i) return -1; n = 0 } if ("string" == typeof e && (e = a.from(e, r)), a.isBuffer(e)) return 0 === e.length ? -1 : m(t, e, n, r, i); if ("number" == typeof e) return e &= 255, a.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(t, e, n) : Uint8Array.prototype.lastIndexOf.call(t, e, n) : m(t, [e], n, r, i); throw new TypeError("val must be string, number or Buffer") } function m(t, e, n, r, i) { var o, u = 1, s = t.length, a = e.length; if (void 0 !== r && ("ucs2" === (r = String(r).toLowerCase()) || "ucs-2" === r || "utf16le" === r || "utf-16le" === r)) { if (t.length < 2 || e.length < 2) return -1; u = 2, s /= 2, a /= 2, n /= 2 } function c(t, e) { return 1 === u ? t[e] : t.readUInt16BE(e * u) } if (i) { var f = -1; for (o = n; o < s; o++)if (c(t, o) === c(e, -1 === f ? 0 : o - f)) { if (-1 === f && (f = o), o - f + 1 === a) return f * u } else -1 !== f && (o -= o - f), f = -1 } else for (n + a > s && (n = s - a), o = n; o >= 0; o--) { for (var h = !0, l = 0; l < a; l++)if (c(t, o + l) !== c(e, l)) { h = !1; break } if (h) return o } return -1 } function w(t, e, n, r) { n = Number(n) || 0; var i = t.length - n; r ? (r = Number(r)) > i && (r = i) : r = i; var o = e.length; if (o % 2 != 0) throw new TypeError("Invalid hex string"); r > o / 2 && (r = o / 2); for (var u = 0; u < r; ++u) { var s = parseInt(e.substr(2 * u, 2), 16); if (isNaN(s)) return u; t[n + u] = s } return u } function b(t, e, n, r) { return q(W(e, t.length - n), t, n, r) } function _(t, e, n, r) { return q(function (t) { for (var e = [], n = 0; n < t.length; ++n)e.push(255 & t.charCodeAt(n)); return e }(e), t, n, r) } function E(t, e, n, r) { return _(t, e, n, r) } function B(t, e, n, r) { return q(F(e), t, n, r) } function S(t, e, n, r) { return q(function (t, e) { for (var n, r, i, o = [], u = 0; u < t.length && !((e -= 2) < 0); ++u)n = t.charCodeAt(u), r = n >> 8, i = n % 256, o.push(i), o.push(r); return o }(e, t.length - n), t, n, r) } function k(t, e, n) { return 0 === e && n === t.length ? r.fromByteArray(t) : r.fromByteArray(t.slice(e, n)) } function A(t, e, n) { n = Math.min(t.length, n); for (var r = [], i = e; i < n;) { var o, u, s, a, c = t[i], f = null, h = c > 239 ? 4 : c > 223 ? 3 : c > 191 ? 2 : 1; if (i + h <= n) switch (h) { case 1: c < 128 && (f = c); break; case 2: 128 == (192 & (o = t[i + 1])) && (a = (31 & c) << 6 | 63 & o) > 127 && (f = a); break; case 3: o = t[i + 1], u = t[i + 2], 128 == (192 & o) && 128 == (192 & u) && (a = (15 & c) << 12 | (63 & o) << 6 | 63 & u) > 2047 && (a < 55296 || a > 57343) && (f = a); break; case 4: o = t[i + 1], u = t[i + 2], s = t[i + 3], 128 == (192 & o) && 128 == (192 & u) && 128 == (192 & s) && (a = (15 & c) << 18 | (63 & o) << 12 | (63 & u) << 6 | 63 & s) > 65535 && a < 1114112 && (f = a) }null === f ? (f = 65533, h = 1) : f > 65535 && (f -= 65536, r.push(f >>> 10 & 1023 | 55296), f = 56320 | 1023 & f), r.push(f), i += h } return function (t) { var e = t.length; if (e <= 4096) return String.fromCharCode.apply(String, t); var n = "", r = 0; for (; r < e;)n += String.fromCharCode.apply(String, t.slice(r, r += 4096)); return n }(r) } e.Buffer = a, e.SlowBuffer = function (t) { +t != t && (t = 0); return a.alloc(+t) }, e.INSPECT_MAX_BYTES = 50, a.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : function () { try { var t = new Uint8Array(1); return t.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }, 42 === t.foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength } catch (t) { return !1 } }(), e.kMaxLength = u(), a.poolSize = 8192, a._augment = function (t) { return t.__proto__ = a.prototype, t }, a.from = function (t, e, n) { return c(null, t, e, n) }, a.TYPED_ARRAY_SUPPORT && (a.prototype.__proto__ = Uint8Array.prototype, a.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && a[Symbol.species] === a && Object.defineProperty(a, Symbol.species, { value: null, configurable: !0 })), a.alloc = function (t, e, n) { return function (t, e, n, r) { return f(e), e <= 0 ? s(t, e) : void 0 !== n ? "string" == typeof r ? s(t, e).fill(n, r) : s(t, e).fill(n) : s(t, e) }(null, t, e, n) }, a.allocUnsafe = function (t) { return h(null, t) }, a.allocUnsafeSlow = function (t) { return h(null, t) }, a.isBuffer = function (t) { return !(null == t || !t._isBuffer) }, a.compare = function (t, e) { if (!a.isBuffer(t) || !a.isBuffer(e)) throw new TypeError("Arguments must be Buffers"); if (t === e) return 0; for (var n = t.length, r = e.length, i = 0, o = Math.min(n, r); i < o; ++i)if (t[i] !== e[i]) { n = t[i], r = e[i]; break } return n < r ? -1 : r < n ? 1 : 0 }, a.isEncoding = function (t) { switch (String(t).toLowerCase()) { case "hex": case "utf8": case "utf-8": case "ascii": case "latin1": case "binary": case "base64": case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": return !0; default: return !1 } }, a.concat = function (t, e) { if (!o(t)) throw new TypeError('"list" argument must be an Array of Buffers'); if (0 === t.length) return a.alloc(0); var n; if (void 0 === e) for (e = 0, n = 0; n < t.length; ++n)e += t[n].length; var r = a.allocUnsafe(e), i = 0; for (n = 0; n < t.length; ++n) { var u = t[n]; if (!a.isBuffer(u)) throw new TypeError('"list" argument must be an Array of Buffers'); u.copy(r, i), i += u.length } return r }, a.byteLength = d, a.prototype._isBuffer = !0, a.prototype.swap16 = function () { var t = this.length; if (t % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits"); for (var e = 0; e < t; e += 2)g(this, e, e + 1); return this }, a.prototype.swap32 = function () { var t = this.length; if (t % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits"); for (var e = 0; e < t; e += 4)g(this, e, e + 3), g(this, e + 1, e + 2); return this }, a.prototype.swap64 = function () { var t = this.length; if (t % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits"); for (var e = 0; e < t; e += 8)g(this, e, e + 7), g(this, e + 1, e + 6), g(this, e + 2, e + 5), g(this, e + 3, e + 4); return this }, a.prototype.toString = function () { var t = 0 | this.length; return 0 === t ? "" : 0 === arguments.length ? A(this, 0, t) : y.apply(this, arguments) }, a.prototype.equals = function (t) { if (!a.isBuffer(t)) throw new TypeError("Argument must be a Buffer"); return this === t || 0 === a.compare(this, t) }, a.prototype.inspect = function () { var t = "", n = e.INSPECT_MAX_BYTES; return this.length > 0 && (t = this.toString("hex", 0, n).match(/.{2}/g).join(" "), this.length > n && (t += " ... ")), "<Buffer " + t + ">" }, a.prototype.compare = function (t, e, n, r, i) { if (!a.isBuffer(t)) throw new TypeError("Argument must be a Buffer"); if (void 0 === e && (e = 0), void 0 === n && (n = t ? t.length : 0), void 0 === r && (r = 0), void 0 === i && (i = this.length), e < 0 || n > t.length || r < 0 || i > this.length) throw new RangeError("out of range index"); if (r >= i && e >= n) return 0; if (r >= i) return -1; if (e >= n) return 1; if (this === t) return 0; for (var o = (i >>>= 0) - (r >>>= 0), u = (n >>>= 0) - (e >>>= 0), s = Math.min(o, u), c = this.slice(r, i), f = t.slice(e, n), h = 0; h < s; ++h)if (c[h] !== f[h]) { o = c[h], u = f[h]; break } return o < u ? -1 : u < o ? 1 : 0 }, a.prototype.includes = function (t, e, n) { return -1 !== this.indexOf(t, e, n) }, a.prototype.indexOf = function (t, e, n) { return v(this, t, e, n, !0) }, a.prototype.lastIndexOf = function (t, e, n) { return v(this, t, e, n, !1) }, a.prototype.write = function (t, e, n, r) { if (void 0 === e) r = "utf8", n = this.length, e = 0; else if (void 0 === n && "string" == typeof e) r = e, n = this.length, e = 0; else { if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported"); e |= 0, isFinite(n) ? (n |= 0, void 0 === r && (r = "utf8")) : (r = n, n = void 0) } var i = this.length - e; if ((void 0 === n || n > i) && (n = i), t.length > 0 && (n < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds"); r || (r = "utf8"); for (var o = !1; ;)switch (r) { case "hex": return w(this, t, e, n); case "utf8": case "utf-8": return b(this, t, e, n); case "ascii": return _(this, t, e, n); case "latin1": case "binary": return E(this, t, e, n); case "base64": return B(this, t, e, n); case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": return S(this, t, e, n); default: if (o) throw new TypeError("Unknown encoding: " + r); r = ("" + r).toLowerCase(), o = !0 } }, a.prototype.toJSON = function () { return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) } }; function T(t, e, n) { var r = ""; n = Math.min(t.length, n); for (var i = e; i < n; ++i)r += String.fromCharCode(127 & t[i]); return r } function C(t, e, n) { var r = ""; n = Math.min(t.length, n); for (var i = e; i < n; ++i)r += String.fromCharCode(t[i]); return r } function x(t, e, n) { var r = t.length; (!e || e < 0) && (e = 0), (!n || n < 0 || n > r) && (n = r); for (var i = "", o = e; o < n; ++o)i += N(t[o]); return i } function I(t, e, n) { for (var r = t.slice(e, n), i = "", o = 0; o < r.length; o += 2)i += String.fromCharCode(r[o] + 256 * r[o + 1]); return i } function U(t, e, n) { if (t % 1 != 0 || t < 0) throw new RangeError("offset is not uint"); if (t + e > n) throw new RangeError("Trying to access beyond buffer length") } function O(t, e, n, r, i, o) { if (!a.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance'); if (e > i || e < o) throw new RangeError('"value" argument is out of bounds'); if (n + r > t.length) throw new RangeError("Index out of range") } function M(t, e, n, r) { e < 0 && (e = 65535 + e + 1); for (var i = 0, o = Math.min(t.length - n, 2); i < o; ++i)t[n + i] = (e & 255 << 8 * (r ? i : 1 - i)) >>> 8 * (r ? i : 1 - i) } function R(t, e, n, r) { e < 0 && (e = 4294967295 + e + 1); for (var i = 0, o = Math.min(t.length - n, 4); i < o; ++i)t[n + i] = e >>> 8 * (r ? i : 3 - i) & 255 } function j(t, e, n, r, i, o) { if (n + r > t.length) throw new RangeError("Index out of range"); if (n < 0) throw new RangeError("Index out of range") } function L(t, e, n, r, o) { return o || j(t, 0, n, 4), i.write(t, e, n, r, 23, 4), n + 4 } function P(t, e, n, r, o) { return o || j(t, 0, n, 8), i.write(t, e, n, r, 52, 8), n + 8 } a.prototype.slice = function (t, e) { var n, r = this.length; if ((t = ~~t) < 0 ? (t += r) < 0 && (t = 0) : t > r && (t = r), (e = void 0 === e ? r : ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r), e < t && (e = t), a.TYPED_ARRAY_SUPPORT) (n = this.subarray(t, e)).__proto__ = a.prototype; else { var i = e - t; n = new a(i, void 0); for (var o = 0; o < i; ++o)n[o] = this[o + t] } return n }, a.prototype.readUIntLE = function (t, e, n) { t |= 0, e |= 0, n || U(t, e, this.length); for (var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);)r += this[t + o] * i; return r }, a.prototype.readUIntBE = function (t, e, n) { t |= 0, e |= 0, n || U(t, e, this.length); for (var r = this[t + --e], i = 1; e > 0 && (i *= 256);)r += this[t + --e] * i; return r }, a.prototype.readUInt8 = function (t, e) { return e || U(t, 1, this.length), this[t] }, a.prototype.readUInt16LE = function (t, e) { return e || U(t, 2, this.length), this[t] | this[t + 1] << 8 }, a.prototype.readUInt16BE = function (t, e) { return e || U(t, 2, this.length), this[t] << 8 | this[t + 1] }, a.prototype.readUInt32LE = function (t, e) { return e || U(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3] }, a.prototype.readUInt32BE = function (t, e) { return e || U(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]) }, a.prototype.readIntLE = function (t, e, n) { t |= 0, e |= 0, n || U(t, e, this.length); for (var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);)r += this[t + o] * i; return r >= (i *= 128) && (r -= Math.pow(2, 8 * e)), r }, a.prototype.readIntBE = function (t, e, n) { t |= 0, e |= 0, n || U(t, e, this.length); for (var r = e, i = 1, o = this[t + --r]; r > 0 && (i *= 256);)o += this[t + --r] * i; return o >= (i *= 128) && (o -= Math.pow(2, 8 * e)), o }, a.prototype.readInt8 = function (t, e) { return e || U(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t] }, a.prototype.readInt16LE = function (t, e) { e || U(t, 2, this.length); var n = this[t] | this[t + 1] << 8; return 32768 & n ? 4294901760 | n : n }, a.prototype.readInt16BE = function (t, e) { e || U(t, 2, this.length); var n = this[t + 1] | this[t] << 8; return 32768 & n ? 4294901760 | n : n }, a.prototype.readInt32LE = function (t, e) { return e || U(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24 }, a.prototype.readInt32BE = function (t, e) { return e || U(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3] }, a.prototype.readFloatLE = function (t, e) { return e || U(t, 4, this.length), i.read(this, t, !0, 23, 4) }, a.prototype.readFloatBE = function (t, e) { return e || U(t, 4, this.length), i.read(this, t, !1, 23, 4) }, a.prototype.readDoubleLE = function (t, e) { return e || U(t, 8, this.length), i.read(this, t, !0, 52, 8) }, a.prototype.readDoubleBE = function (t, e) { return e || U(t, 8, this.length), i.read(this, t, !1, 52, 8) }, a.prototype.writeUIntLE = function (t, e, n, r) { (t = +t, e |= 0, n |= 0, r) || O(this, t, e, n, Math.pow(2, 8 * n) - 1, 0); var i = 1, o = 0; for (this[e] = 255 & t; ++o < n && (i *= 256);)this[e + o] = t / i & 255; return e + n }, a.prototype.writeUIntBE = function (t, e, n, r) { (t = +t, e |= 0, n |= 0, r) || O(this, t, e, n, Math.pow(2, 8 * n) - 1, 0); var i = n - 1, o = 1; for (this[e + i] = 255 & t; --i >= 0 && (o *= 256);)this[e + i] = t / o & 255; return e + n }, a.prototype.writeUInt8 = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 1, 255, 0), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1 }, a.prototype.writeUInt16LE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : M(this, t, e, !0), e + 2 }, a.prototype.writeUInt16BE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : M(this, t, e, !1), e + 2 }, a.prototype.writeUInt32LE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : R(this, t, e, !0), e + 4 }, a.prototype.writeUInt32BE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : R(this, t, e, !1), e + 4 }, a.prototype.writeIntLE = function (t, e, n, r) { if (t = +t, e |= 0, !r) { var i = Math.pow(2, 8 * n - 1); O(this, t, e, n, i - 1, -i) } var o = 0, u = 1, s = 0; for (this[e] = 255 & t; ++o < n && (u *= 256);)t < 0 && 0 === s && 0 !== this[e + o - 1] && (s = 1), this[e + o] = (t / u >> 0) - s & 255; return e + n }, a.prototype.writeIntBE = function (t, e, n, r) { if (t = +t, e |= 0, !r) { var i = Math.pow(2, 8 * n - 1); O(this, t, e, n, i - 1, -i) } var o = n - 1, u = 1, s = 0; for (this[e + o] = 255 & t; --o >= 0 && (u *= 256);)t < 0 && 0 === s && 0 !== this[e + o + 1] && (s = 1), this[e + o] = (t / u >> 0) - s & 255; return e + n }, a.prototype.writeInt8 = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 1, 127, -128), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1 }, a.prototype.writeInt16LE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : M(this, t, e, !0), e + 2 }, a.prototype.writeInt16BE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : M(this, t, e, !1), e + 2 }, a.prototype.writeInt32LE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 4, 2147483647, -2147483648), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : R(this, t, e, !0), e + 4 }, a.prototype.writeInt32BE = function (t, e, n) { return t = +t, e |= 0, n || O(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : R(this, t, e, !1), e + 4 }, a.prototype.writeFloatLE = function (t, e, n) { return L(this, t, e, !0, n) }, a.prototype.writeFloatBE = function (t, e, n) { return L(this, t, e, !1, n) }, a.prototype.writeDoubleLE = function (t, e, n) { return P(this, t, e, !0, n) }, a.prototype.writeDoubleBE = function (t, e, n) { return P(this, t, e, !1, n) }, a.prototype.copy = function (t, e, n, r) { if (n || (n = 0), r || 0 === r || (r = this.length), e >= t.length && (e = t.length), e || (e = 0), r > 0 && r < n && (r = n), r === n) return 0; if (0 === t.length || 0 === this.length) return 0; if (e < 0) throw new RangeError("targetStart out of bounds"); if (n < 0 || n >= this.length) throw new RangeError("sourceStart out of bounds"); if (r < 0) throw new RangeError("sourceEnd out of bounds"); r > this.length && (r = this.length), t.length - e < r - n && (r = t.length - e + n); var i, o = r - n; if (this === t && n < e && e < r) for (i = o - 1; i >= 0; --i)t[i + e] = this[i + n]; else if (o < 1e3 || !a.TYPED_ARRAY_SUPPORT) for (i = 0; i < o; ++i)t[i + e] = this[i + n]; else Uint8Array.prototype.set.call(t, this.subarray(n, n + o), e); return o }, a.prototype.fill = function (t, e, n, r) { if ("string" == typeof t) { if ("string" == typeof e ? (r = e, e = 0, n = this.length) : "string" == typeof n && (r = n, n = this.length), 1 === t.length) { var i = t.charCodeAt(0); i < 256 && (t = i) } if (void 0 !== r && "string" != typeof r) throw new TypeError("encoding must be a string"); if ("string" == typeof r && !a.isEncoding(r)) throw new TypeError("Unknown encoding: " + r) } else "number" == typeof t && (t &= 255); if (e < 0 || this.length < e || this.length < n) throw new RangeError("Out of range index"); if (n <= e) return this; var o; if (e >>>= 0, n = void 0 === n ? this.length : n >>> 0, t || (t = 0), "number" == typeof t) for (o = e; o < n; ++o)this[o] = t; else { var u = a.isBuffer(t) ? t : W(new a(t, r).toString()), s = u.length; for (o = 0; o < n - e; ++o)this[o + e] = u[o % s] } return this }; var D = /[^+\/0-9A-Za-z-_]/g; function N(t) { return t < 16 ? "0" + t.toString(16) : t.toString(16) } function W(t, e) { var n; e = e || 1 / 0; for (var r = t.length, i = null, o = [], u = 0; u < r; ++u) { if ((n = t.charCodeAt(u)) > 55295 && n < 57344) { if (!i) { if (n > 56319) { (e -= 3) > -1 && o.push(239, 191, 189); continue } if (u + 1 === r) { (e -= 3) > -1 && o.push(239, 191, 189); continue } i = n; continue } if (n < 56320) { (e -= 3) > -1 && o.push(239, 191, 189), i = n; continue } n = 65536 + (i - 55296 << 10 | n - 56320) } else i && (e -= 3) > -1 && o.push(239, 191, 189); if (i = null, n < 128) { if ((e -= 1) < 0) break; o.push(n) } else if (n < 2048) { if ((e -= 2) < 0) break; o.push(n >> 6 | 192, 63 & n | 128) } else if (n < 65536) { if ((e -= 3) < 0) break; o.push(n >> 12 | 224, n >> 6 & 63 | 128, 63 & n | 128) } else { if (!(n < 1114112)) throw new Error("Invalid code point"); if ((e -= 4) < 0) break; o.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, 63 & n | 128) } } return o } function F(t) { return r.toByteArray(function (t) { if ((t = function (t) { return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "") }(t).replace(D, "")).length < 2) return ""; for (; t.length % 4 != 0;)t += "="; return t }(t)) } function q(t, e, n, r) { for (var i = 0; i < r && !(i + n >= e.length || i >= t.length); ++i)e[i + n] = t[i]; return i }
	}).call(this, n(3))
}, function (t, e) { var n; n = function () { return this }(); try { n = n || new Function("return this")() } catch (t) { "object" == typeof window && (n = window) } t.exports = n }, function (t, e) { var n, r, i = t.exports = {}; function o() { throw new Error("setTimeout has not been defined") } function u() { throw new Error("clearTimeout has not been defined") } function s(t) { if (n === setTimeout) return setTimeout(t, 0); if ((n === o || !n) && setTimeout) return n = setTimeout, setTimeout(t, 0); try { return n(t, 0) } catch (e) { try { return n.call(null, t, 0) } catch (e) { return n.call(this, t, 0) } } } !function () { try { n = "function" == typeof setTimeout ? setTimeout : o } catch (t) { n = o } try { r = "function" == typeof clearTimeout ? clearTimeout : u } catch (t) { r = u } }(); var a, c = [], f = !1, h = -1; function l() { f && a && (f = !1, a.length ? c = a.concat(c) : h = -1, c.length && p()) } function p() { if (!f) { var t = s(l); f = !0; for (var e = c.length; e;) { for (a = c, c = []; ++h < e;)a && a[h].run(); h = -1, e = c.length } a = null, f = !1, function (t) { if (r === clearTimeout) return clearTimeout(t); if ((r === u || !r) && clearTimeout) return r = clearTimeout, clearTimeout(t); try { r(t) } catch (e) { try { return r.call(null, t) } catch (e) { return r.call(this, t) } } }(t) } } function d(t, e) { this.fun = t, this.array = e } function y() { } i.nextTick = function (t) { var e = new Array(arguments.length - 1); if (arguments.length > 1) for (var n = 1; n < arguments.length; n++)e[n - 1] = arguments[n]; c.push(new d(t, e)), 1 !== c.length || f || s(p) }, d.prototype.run = function () { this.fun.apply(null, this.array) }, i.title = "browser", i.browser = !0, i.env = {}, i.argv = [], i.version = "", i.versions = {}, i.on = y, i.addListener = y, i.once = y, i.off = y, i.removeListener = y, i.removeAllListeners = y, i.emit = y, i.prependListener = y, i.prependOnceListener = y, i.listeners = function (t) { return [] }, i.binding = function (t) { throw new Error("process.binding is not supported") }, i.cwd = function () { return "/" }, i.chdir = function (t) { throw new Error("process.chdir is not supported") }, i.umask = function () { return 0 } }, function (t, e, n) { var r = n(0).Buffer, i = n(11).Transform, o = n(20).StringDecoder; function u(t) { i.call(this), this.hashMode = "string" == typeof t, this.hashMode ? this[t] = this._finalOrDigest : this.final = this._finalOrDigest, this._final && (this.__final = this._final, this._final = null), this._decoder = null, this._encoding = null } n(1)(u, i), u.prototype.update = function (t, e, n) { "string" == typeof t && (t = r.from(t, e)); var i = this._update(t); return this.hashMode ? this : (n && (i = this._toString(i, n)), i) }, u.prototype.setAutoPadding = function () { }, u.prototype.getAuthTag = function () { throw new Error("trying to get auth tag in unsupported state") }, u.prototype.setAuthTag = function () { throw new Error("trying to set auth tag in unsupported state") }, u.prototype.setAAD = function () { throw new Error("trying to set aad in unsupported state") }, u.prototype._transform = function (t, e, n) { var r; try { this.hashMode ? this._update(t) : this.push(this._update(t)) } catch (t) { r = t } finally { n(r) } }, u.prototype._flush = function (t) { var e; try { this.push(this.__final()) } catch (t) { e = t } t(e) }, u.prototype._finalOrDigest = function (t) { var e = this.__final() || r.alloc(0); return t && (e = this._toString(e, t, !0)), e }, u.prototype._toString = function (t, e, n) { if (this._decoder || (this._decoder = new o(e), this._encoding = e), this._encoding !== e) throw new Error("can't switch encodings"); var r = this._decoder.write(t); return n && (r += this._decoder.end()), r }, t.exports = u }, function (t, e, n) { "use strict"; var r = n(12), i = Object.keys || function (t) { var e = []; for (var n in t) e.push(n); return e }; t.exports = h; var o = Object.create(n(8)); o.inherits = n(1); var u = n(25), s = n(19); o.inherits(h, u); for (var a = i(s.prototype), c = 0; c < a.length; c++) { var f = a[c]; h.prototype[f] || (h.prototype[f] = s.prototype[f]) } function h(t) { if (!(this instanceof h)) return new h(t); u.call(this, t), s.call(this, t), t && !1 === t.readable && (this.readable = !1), t && !1 === t.writable && (this.writable = !1), this.allowHalfOpen = !0, t && !1 === t.allowHalfOpen && (this.allowHalfOpen = !1), this.once("end", l) } function l() { this.allowHalfOpen || this._writableState.ended || r.nextTick(p, this) } function p(t) { t.end() } Object.defineProperty(h.prototype, "writableHighWaterMark", { enumerable: !1, get: function () { return this._writableState.highWaterMark } }), Object.defineProperty(h.prototype, "destroyed", { get: function () { return void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed && this._writableState.destroyed) }, set: function (t) { void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed = t, this._writableState.destroyed = t) } }), h.prototype._destroy = function (t, e) { this.push(null), this.end(), r.nextTick(e, t) } }, function (t, e, n) { var r = n(0).Buffer; function i(t, e) { this._block = r.alloc(t), this._finalSize = e, this._blockSize = t, this._len = 0 } i.prototype.update = function (t, e) { "string" == typeof t && (e = e || "utf8", t = r.from(t, e)); for (var n = this._block, i = this._blockSize, o = t.length, u = this._len, s = 0; s < o;) { for (var a = u % i, c = Math.min(o - s, i - a), f = 0; f < c; f++)n[a + f] = t[s + f]; s += c, (u += c) % i == 0 && this._update(n) } return this._len += o, this }, i.prototype.digest = function (t) { var e = this._len % this._blockSize; this._block[e] = 128, this._block.fill(0, e + 1), e >= this._finalSize && (this._update(this._block), this._block.fill(0)); var n = 8 * this._len; if (n <= 4294967295) this._block.writeUInt32BE(n, this._blockSize - 4); else { var r = (4294967295 & n) >>> 0, i = (n - r) / 4294967296; this._block.writeUInt32BE(i, this._blockSize - 8), this._block.writeUInt32BE(r, this._blockSize - 4) } this._update(this._block); var o = this._hash(); return t ? o.toString(t) : o }, i.prototype._update = function () { throw new Error("_update must be implemented by subclass") }, t.exports = i }, function (t, e, n) { (function (t) { function n(t) { return Object.prototype.toString.call(t) } e.isArray = function (t) { return Array.isArray ? Array.isArray(t) : "[object Array]" === n(t) }, e.isBoolean = function (t) { return "boolean" == typeof t }, e.isNull = function (t) { return null === t }, e.isNullOrUndefined = function (t) { return null == t }, e.isNumber = function (t) { return "number" == typeof t }, e.isString = function (t) { return "string" == typeof t }, e.isSymbol = function (t) { return "symbol" == typeof t }, e.isUndefined = function (t) { return void 0 === t }, e.isRegExp = function (t) { return "[object RegExp]" === n(t) }, e.isObject = function (t) { return "object" == typeof t && null !== t }, e.isDate = function (t) { return "[object Date]" === n(t) }, e.isError = function (t) { return "[object Error]" === n(t) || t instanceof Error }, e.isFunction = function (t) { return "function" == typeof t }, e.isPrimitive = function (t) { return null === t || "boolean" == typeof t || "number" == typeof t || "string" == typeof t || "symbol" == typeof t || void 0 === t }, e.isBuffer = t.isBuffer }).call(this, n(2).Buffer) }, function (t, e, n) { (function (e) { t.exports = function (t, n) { for (var r = Math.min(t.length, n.length), i = new e(r), o = 0; o < r; ++o)i[o] = t[o] ^ n[o]; return i } }).call(this, n(2).Buffer) }, function (t, e, n) { "use strict"; n.r(e), n.d(e, "F", (function () { return r })), n.d(e, "T", (function () { return i })), n.d(e, "__", (function () { return o })), n.d(e, "add", (function () { return c })), n.d(e, "addIndex", (function () { return d })), n.d(e, "adjust", (function () { return g })), n.d(e, "all", (function () { return B })), n.d(e, "allPass", (function () { return Q })), n.d(e, "always", (function () { return tt })), n.d(e, "and", (function () { return et })), n.d(e, "any", (function () { return rt })), n.d(e, "anyPass", (function () { return it })), n.d(e, "ap", (function () { return ot })), n.d(e, "aperture", (function () { return at })), n.d(e, "append", (function () { return ct })), n.d(e, "apply", (function () { return ft })), n.d(e, "applySpec", (function () { return pt })), n.d(e, "applyTo", (function () { return dt })), n.d(e, "ascend", (function () { return yt })), n.d(e, "assoc", (function () { return gt })), n.d(e, "assocPath", (function () { return mt })), n.d(e, "binary", (function () { return bt })), n.d(e, "bind", (function () { return I })), n.d(e, "both", (function () { return St })), n.d(e, "call", (function () { return At })), n.d(e, "chain", (function () { return xt })), n.d(e, "clamp", (function () { return It })), n.d(e, "clone", (function () { return Rt })), n.d(e, "comparator", (function () { return jt })), n.d(e, "complement", (function () { return Pt })), n.d(e, "compose", (function () { return Yt })), n.d(e, "composeK", (function () { return Ht })), n.d(e, "composeP", (function () { return Jt })), n.d(e, "composeWith", (function () { return Qt })), n.d(e, "concat", (function () { return we })), n.d(e, "cond", (function () { return be })), n.d(e, "construct", (function () { return Ee })), n.d(e, "constructN", (function () { return _e })), n.d(e, "contains", (function () { return Be })), n.d(e, "converge", (function () { return Se })), n.d(e, "countBy", (function () { return Te })), n.d(e, "curry", (function () { return kt })), n.d(e, "curryN", (function () { return p })), n.d(e, "dec", (function () { return Ce })), n.d(e, "defaultTo", (function () { return xe })), n.d(e, "descend", (function () { return Ie })), n.d(e, "difference", (function () { return Me })), n.d(e, "differenceWith", (function () { return Re })), n.d(e, "dissoc", (function () { return je })), n.d(e, "dissocPath", (function () { return De })), n.d(e, "divide", (function () { return Ne })), n.d(e, "drop", (function () { return Fe })), n.d(e, "dropLast", (function () { return Ve })), n.d(e, "dropLastWhile", (function () { return Ke })), n.d(e, "dropRepeats", (function () { return tn })), n.d(e, "dropRepeatsWith", (function () { return Qe })), n.d(e, "dropWhile", (function () { return nn })), n.d(e, "either", (function () { return on })), n.d(e, "empty", (function () { return un })), n.d(e, "endsWith", (function () { return an })), n.d(e, "eqBy", (function () { return cn })), n.d(e, "eqProps", (function () { return fn })), n.d(e, "equals", (function () { return oe })), n.d(e, "evolve", (function () { return hn })), n.d(e, "filter", (function () { return ye })), n.d(e, "find", (function () { return pn })), n.d(e, "findIndex", (function () { return yn })), n.d(e, "findLast", (function () { return vn })), n.d(e, "findLastIndex", (function () { return wn })), n.d(e, "flatten", (function () { return bn })), n.d(e, "flip", (function () { return _n })), n.d(e, "forEach", (function () { return En })), n.d(e, "forEachObjIndexed", (function () { return Bn })), n.d(e, "fromPairs", (function () { return Sn })), n.d(e, "groupBy", (function () { return kn })), n.d(e, "groupWith", (function () { return An })), n.d(e, "gt", (function () { return Tn })), n.d(e, "gte", (function () { return Cn })), n.d(e, "has", (function () { return In })), n.d(e, "hasIn", (function () { return Un })), n.d(e, "hasPath", (function () { return xn })), n.d(e, "head", (function () { return Kt })), n.d(e, "identical", (function () { return On })), n.d(e, "identity", (function () { return $t })), n.d(e, "ifElse", (function () { return Mn })), n.d(e, "inc", (function () { return Rn })), n.d(e, "includes", (function () { return jn })), n.d(e, "indexBy", (function () { return Ln })), n.d(e, "indexOf", (function () { return Pn })), n.d(e, "init", (function () { return Dn })), n.d(e, "innerJoin", (function () { return Nn })), n.d(e, "insert", (function () { return Wn })), n.d(e, "insertAll", (function () { return Fn })), n.d(e, "intersection", (function () { return Yn })), n.d(e, "intersperse", (function () { return Hn })), n.d(e, "into", (function () { return $n })), n.d(e, "invert", (function () { return Zn })), n.d(e, "invertObj", (function () { return Qn })), n.d(e, "invoker", (function () { return tr })), n.d(e, "is", (function () { return er })), n.d(e, "isEmpty", (function () { return nr })), n.d(e, "isNil", (function () { return vt })), n.d(e, "join", (function () { return rr })), n.d(e, "juxt", (function () { return ir })), n.d(e, "keys", (function () { return Y })), n.d(e, "keysIn", (function () { return or })), n.d(e, "last", (function () { return Ze })), n.d(e, "lastIndexOf", (function () { return ur })), n.d(e, "length", (function () { return ar })), n.d(e, "lens", (function () { return cr })), n.d(e, "lensIndex", (function () { return fr })), n.d(e, "lensPath", (function () { return hr })), n.d(e, "lensProp", (function () { return lr })), n.d(e, "lift", (function () { return Bt })), n.d(e, "liftN", (function () { return Et })), n.d(e, "lt", (function () { return pr })), n.d(e, "lte", (function () { return dr })), n.d(e, "map", (function () { return H })), n.d(e, "mapAccum", (function () { return yr })), n.d(e, "mapAccumRight", (function () { return gr })), n.d(e, "mapObjIndexed", (function () { return vr })), n.d(e, "match", (function () { return mr })), n.d(e, "mathMod", (function () { return wr })), n.d(e, "max", (function () { return S })), n.d(e, "maxBy", (function () { return br })), n.d(e, "mean", (function () { return Er })), n.d(e, "median", (function () { return Br })), n.d(e, "memoizeWith", (function () { return Sr })), n.d(e, "merge", (function () { return kr })), n.d(e, "mergeAll", (function () { return Ar })), n.d(e, "mergeDeepLeft", (function () { return xr })), n.d(e, "mergeDeepRight", (function () { return Ir })), n.d(e, "mergeDeepWith", (function () { return Ur })), n.d(e, "mergeDeepWithKey", (function () { return Cr })), n.d(e, "mergeLeft", (function () { return Or })), n.d(e, "mergeRight", (function () { return Mr })), n.d(e, "mergeWith", (function () { return Rr })), n.d(e, "mergeWithKey", (function () { return Tr })), n.d(e, "min", (function () { return jr })), n.d(e, "minBy", (function () { return Lr })), n.d(e, "modulo", (function () { return Pr })), n.d(e, "move", (function () { return Dr })), n.d(e, "multiply", (function () { return Nr })), n.d(e, "nAry", (function () { return wt })), n.d(e, "negate", (function () { return Wr })), n.d(e, "none", (function () { return Fr })), n.d(e, "not", (function () { return Lt })), n.d(e, "nth", (function () { return X })), n.d(e, "nthArg", (function () { return qr })), n.d(e, "o", (function () { return zr })), n.d(e, "objOf", (function () { return Xn })), n.d(e, "of", (function () { return Hr })), n.d(e, "omit", (function () { return Vr })), n.d(e, "once", (function () { return Xr })), n.d(e, "or", (function () { return rn })), n.d(e, "otherwise", (function () { return Kr })), n.d(e, "over", (function () { return $r })), n.d(e, "pair", (function () { return Zr })), n.d(e, "partial", (function () { return ti })), n.d(e, "partialRight", (function () { return ei })), n.d(e, "partition", (function () { return ni })), n.d(e, "path", (function () { return K })), n.d(e, "paths", (function () { return J })), n.d(e, "pathEq", (function () { return ri })), n.d(e, "pathOr", (function () { return ii })), n.d(e, "pathSatisfies", (function () { return oi })), n.d(e, "pick", (function () { return ui })), n.d(e, "pickAll", (function () { return si })), n.d(e, "pickBy", (function () { return ai })), n.d(e, "pipe", (function () { return qt })), n.d(e, "pipeK", (function () { return ci })), n.d(e, "pipeP", (function () { return Xt })), n.d(e, "pipeWith", (function () { return Zt })), n.d(e, "pluck", (function () { return $ })), n.d(e, "prepend", (function () { return fi })), n.d(e, "product", (function () { return hi })), n.d(e, "project", (function () { return pi })), n.d(e, "prop", (function () { return G })), n.d(e, "propEq", (function () { return di })), n.d(e, "propIs", (function () { return yi })), n.d(e, "propOr", (function () { return gi })), n.d(e, "propSatisfies", (function () { return vi })), n.d(e, "props", (function () { return mi })), n.d(e, "range", (function () { return wi })), n.d(e, "reduce", (function () { return Z })), n.d(e, "reduceBy", (function () { return Ae })), n.d(e, "reduceRight", (function () { return bi })), n.d(e, "reduceWhile", (function () { return _i })), n.d(e, "reduced", (function () { return Ei })), n.d(e, "reject", (function () { return ge })), n.d(e, "remove", (function () { return Le })), n.d(e, "repeat", (function () { return Si })), n.d(e, "replace", (function () { return ki })), n.d(e, "reverse", (function () { return zt })), n.d(e, "scan", (function () { return Ai })), n.d(e, "sequence", (function () { return Ti })), n.d(e, "set", (function () { return Ci })), n.d(e, "slice", (function () { return Wt })), n.d(e, "sort", (function () { return xi })), n.d(e, "sortBy", (function () { return Ii })), n.d(e, "sortWith", (function () { return Ui })), n.d(e, "split", (function () { return Oi })), n.d(e, "splitAt", (function () { return Mi })), n.d(e, "splitEvery", (function () { return Ri })), n.d(e, "splitWhen", (function () { return ji })), n.d(e, "startsWith", (function () { return Li })), n.d(e, "subtract", (function () { return Pi })), n.d(e, "sum", (function () { return _r })), n.d(e, "symmetricDifference", (function () { return Di })), n.d(e, "symmetricDifferenceWith", (function () { return Ni })), n.d(e, "tail", (function () { return Ft })), n.d(e, "take", (function () { return ze })), n.d(e, "takeLast", (function () { return sn })), n.d(e, "takeLastWhile", (function () { return Wi })), n.d(e, "takeWhile", (function () { return qi })), n.d(e, "tap", (function () { return Yi })), n.d(e, "test", (function () { return Hi })), n.d(e, "andThen", (function () { return Vi })), n.d(e, "times", (function () { return Bi })), n.d(e, "toLower", (function () { return Xi })), n.d(e, "toPairs", (function () { return Ji })), n.d(e, "toPairsIn", (function () { return Ki })), n.d(e, "toString", (function () { return me })), n.d(e, "toUpper", (function () { return Gi })), n.d(e, "transduce", (function () { return $i })), n.d(e, "transpose", (function () { return Zi })), n.d(e, "traverse", (function () { return Qi })), n.d(e, "trim", (function () { return eo })), n.d(e, "tryCatch", (function () { return no })), n.d(e, "type", (function () { return Ot })), n.d(e, "unapply", (function () { return ro })), n.d(e, "unary", (function () { return io })), n.d(e, "uncurryN", (function () { return oo })), n.d(e, "unfold", (function () { return uo })), n.d(e, "union", (function () { return so })), n.d(e, "unionWith", (function () { return co })), n.d(e, "uniq", (function () { return zn })), n.d(e, "uniqBy", (function () { return qn })), n.d(e, "uniqWith", (function () { return ao })), n.d(e, "unless", (function () { return fo })), n.d(e, "unnest", (function () { return ho })), n.d(e, "until", (function () { return lo })), n.d(e, "update", (function () { return Pe })), n.d(e, "useWith", (function () { return li })), n.d(e, "values", (function () { return ht })), n.d(e, "valuesIn", (function () { return po })), n.d(e, "view", (function () { return go })), n.d(e, "when", (function () { return vo })), n.d(e, "where", (function () { return mo })), n.d(e, "whereEq", (function () { return wo })), n.d(e, "without", (function () { return bo })), n.d(e, "xor", (function () { return _o })), n.d(e, "xprod", (function () { return Eo })), n.d(e, "zip", (function () { return Bo })), n.d(e, "zipObj", (function () { return So })), n.d(e, "zipWith", (function () { return ko })), n.d(e, "thunkify", (function () { return Ao })); var r = function () { return !1 }, i = function () { return !0 }, o = { "@@functional/placeholder": !0 }; function u(t) { return null != t && "object" == typeof t && !0 === t["@@functional/placeholder"] } function s(t) { return function e(n) { return 0 === arguments.length || u(n) ? e : t.apply(this, arguments) } } function a(t) { return function e(n, r) { switch (arguments.length) { case 0: return e; case 1: return u(n) ? e : s((function (e) { return t(n, e) })); default: return u(n) && u(r) ? e : u(n) ? s((function (e) { return t(e, r) })) : u(r) ? s((function (e) { return t(n, e) })) : t(n, r) } } } var c = a((function (t, e) { return Number(t) + Number(e) })); function f(t, e) { var n; e = e || []; var r = (t = t || []).length, i = e.length, o = []; for (n = 0; n < r;)o[o.length] = t[n], n += 1; for (n = 0; n < i;)o[o.length] = e[n], n += 1; return o } function h(t, e) { switch (t) { case 0: return function () { return e.apply(this, arguments) }; case 1: return function (t) { return e.apply(this, arguments) }; case 2: return function (t, n) { return e.apply(this, arguments) }; case 3: return function (t, n, r) { return e.apply(this, arguments) }; case 4: return function (t, n, r, i) { return e.apply(this, arguments) }; case 5: return function (t, n, r, i, o) { return e.apply(this, arguments) }; case 6: return function (t, n, r, i, o, u) { return e.apply(this, arguments) }; case 7: return function (t, n, r, i, o, u, s) { return e.apply(this, arguments) }; case 8: return function (t, n, r, i, o, u, s, a) { return e.apply(this, arguments) }; case 9: return function (t, n, r, i, o, u, s, a, c) { return e.apply(this, arguments) }; case 10: return function (t, n, r, i, o, u, s, a, c, f) { return e.apply(this, arguments) }; default: throw new Error("First argument to _arity must be a non-negative integer no greater than ten") } } function l(t, e, n) { return function () { for (var r = [], i = 0, o = t, s = 0; s < e.length || i < arguments.length;) { var a; s < e.length && (!u(e[s]) || i >= arguments.length) ? a = e[s] : (a = arguments[i], i += 1), r[s] = a, u(a) || (o -= 1), s += 1 } return o <= 0 ? n.apply(this, r) : h(o, l(t, r, n)) } } var p = a((function (t, e) { return 1 === t ? s(e) : h(t, l(t, [], e)) })), d = s((function (t) { return p(t.length, (function () { var e = 0, n = arguments[0], r = arguments[arguments.length - 1], i = Array.prototype.slice.call(arguments, 0); return i[0] = function () { var t = n.apply(this, f(arguments, [e, r])); return e += 1, t }, t.apply(this, i) })) })); function y(t) { return function e(n, r, i) { switch (arguments.length) { case 0: return e; case 1: return u(n) ? e : a((function (e, r) { return t(n, e, r) })); case 2: return u(n) && u(r) ? e : u(n) ? a((function (e, n) { return t(e, r, n) })) : u(r) ? a((function (e, r) { return t(n, e, r) })) : s((function (e) { return t(n, r, e) })); default: return u(n) && u(r) && u(i) ? e : u(n) && u(r) ? a((function (e, n) { return t(e, n, i) })) : u(n) && u(i) ? a((function (e, n) { return t(e, r, n) })) : u(r) && u(i) ? a((function (e, r) { return t(n, e, r) })) : u(n) ? s((function (e) { return t(e, r, i) })) : u(r) ? s((function (e) { return t(n, e, i) })) : u(i) ? s((function (e) { return t(n, r, e) })) : t(n, r, i) } } } var g = y((function (t, e, n) { if (t >= n.length || t < -n.length) return n; var r = (t < 0 ? n.length : 0) + t, i = f(n); return i[r] = e(n[r]), i })), v = Array.isArray || function (t) { return null != t && t.length >= 0 && "[object Array]" === Object.prototype.toString.call(t) }; function m(t) { return null != t && "function" == typeof t["@@transducer/step"] } function w(t, e, n) { return function () { if (0 === arguments.length) return n(); var r = Array.prototype.slice.call(arguments, 0), i = r.pop(); if (!v(i)) { for (var o = 0; o < t.length;) { if ("function" == typeof i[t[o]]) return i[t[o]].apply(i, r); o += 1 } if (m(i)) { var u = e.apply(null, r); return u(i) } } return n.apply(this, arguments) } } function b(t) { return t && t["@@transducer/reduced"] ? t : { "@@transducer/value": t, "@@transducer/reduced": !0 } } var _ = { init: function () { return this.xf["@@transducer/init"]() }, result: function (t) { return this.xf["@@transducer/result"](t) } }, E = function () { function t(t, e) { this.xf = e, this.f = t, this.all = !0 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.all && (t = this.xf["@@transducer/step"](t, !0)), this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) || (this.all = !1, t = b(this.xf["@@transducer/step"](t, !1))), t }, t }(), B = a(w(["all"], a((function (t, e) { return new E(t, e) })), (function (t, e) { for (var n = 0; n < e.length;) { if (!t(e[n])) return !1; n += 1 } return !0 }))), S = a((function (t, e) { return e > t ? e : t })); function k(t, e) { for (var n = 0, r = e.length, i = Array(r); n < r;)i[n] = t(e[n]), n += 1; return i } function A(t) { return "[object String]" === Object.prototype.toString.call(t) } var T = s((function (t) { return !!v(t) || !!t && ("object" == typeof t && (!A(t) && (1 === t.nodeType ? !!t.length : 0 === t.length || t.length > 0 && (t.hasOwnProperty(0) && t.hasOwnProperty(t.length - 1))))) })), C = function () { function t(t) { this.f = t } return t.prototype["@@transducer/init"] = function () { throw new Error("init not implemented on XWrap") }, t.prototype["@@transducer/result"] = function (t) { return t }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(t, e) }, t }(); function x(t) { return new C(t) } var I = a((function (t, e) { return h(t.length, (function () { return t.apply(e, arguments) })) })); function U(t, e, n) { for (var r = n.next(); !r.done;) { if ((e = t["@@transducer/step"](e, r.value)) && e["@@transducer/reduced"]) { e = e["@@transducer/value"]; break } r = n.next() } return t["@@transducer/result"](e) } function O(t, e, n, r) { return t["@@transducer/result"](n[r](I(t["@@transducer/step"], t), e)) } var M = "undefined" != typeof Symbol ? Symbol.iterator : "@@iterator"; function R(t, e, n) { if ("function" == typeof t && (t = x(t)), T(n)) return function (t, e, n) { for (var r = 0, i = n.length; r < i;) { if ((e = t["@@transducer/step"](e, n[r])) && e["@@transducer/reduced"]) { e = e["@@transducer/value"]; break } r += 1 } return t["@@transducer/result"](e) }(t, e, n); if ("function" == typeof n["fantasy-land/reduce"]) return O(t, e, n, "fantasy-land/reduce"); if (null != n[M]) return U(t, e, n[M]()); if ("function" == typeof n.next) return U(t, e, n); if ("function" == typeof n.reduce) return O(t, e, n, "reduce"); throw new TypeError("reduce: list must be array or iterable") } var j = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { return this.xf["@@transducer/step"](t, this.f(e)) }, t }(), L = a((function (t, e) { return new j(t, e) })); function P(t, e) { return Object.prototype.hasOwnProperty.call(e, t) } var D = Object.prototype.toString, N = function () { return "[object Arguments]" === D.call(arguments) ? function (t) { return "[object Arguments]" === D.call(t) } : function (t) { return P("callee", t) } }(), W = !{ toString: null }.propertyIsEnumerable("toString"), F = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"], q = function () { return arguments.propertyIsEnumerable("length") }(), z = function (t, e) { for (var n = 0; n < t.length;) { if (t[n] === e) return !0; n += 1 } return !1 }, Y = "function" != typeof Object.keys || q ? s((function (t) { if (Object(t) !== t) return []; var e, n, r = [], i = q && N(t); for (e in t) !P(e, t) || i && "length" === e || (r[r.length] = e); if (W) for (n = F.length - 1; n >= 0;)P(e = F[n], t) && !z(r, e) && (r[r.length] = e), n -= 1; return r })) : s((function (t) { return Object(t) !== t ? [] : Object.keys(t) })), H = a(w(["fantasy-land/map", "map"], L, (function (t, e) { switch (Object.prototype.toString.call(e)) { case "[object Function]": return p(e.length, (function () { return t.call(this, e.apply(this, arguments)) })); case "[object Object]": return R((function (n, r) { return n[r] = t(e[r]), n }), {}, Y(e)); default: return k(t, e) } }))), V = Number.isInteger || function (t) { return t << 0 === t }, X = a((function (t, e) { var n = t < 0 ? e.length + t : t; return A(e) ? e.charAt(n) : e[n] })), J = a((function (t, e) { return t.map((function (t) { for (var n, r = e, i = 0; i < t.length;) { if (null == r) return; n = t[i], r = V(n) ? X(n, r) : r[n], i += 1 } return r })) })), K = a((function (t, e) { return J([t], e)[0] })), G = a((function (t, e) { return K([t], e) })), $ = a((function (t, e) { return H(G(t), e) })), Z = y(R), Q = s((function (t) { return p(Z(S, 0, $("length", t)), (function () { for (var e = 0, n = t.length; e < n;) { if (!t[e].apply(this, arguments)) return !1; e += 1 } return !0 })) })), tt = s((function (t) { return function () { return t } })), et = a((function (t, e) { return t && e })), nt = function () { function t(t, e) { this.xf = e, this.f = t, this.any = !1 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.any || (t = this.xf["@@transducer/step"](t, !1)), this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) && (this.any = !0, t = b(this.xf["@@transducer/step"](t, !0))), t }, t }(), rt = a(w(["any"], a((function (t, e) { return new nt(t, e) })), (function (t, e) { for (var n = 0; n < e.length;) { if (t(e[n])) return !0; n += 1 } return !1 }))), it = s((function (t) { return p(Z(S, 0, $("length", t)), (function () { for (var e = 0, n = t.length; e < n;) { if (t[e].apply(this, arguments)) return !0; e += 1 } return !1 })) })), ot = a((function (t, e) { return "function" == typeof e["fantasy-land/ap"] ? e["fantasy-land/ap"](t) : "function" == typeof t.ap ? t.ap(e) : "function" == typeof t ? function (n) { return t(n)(e(n)) } : R((function (t, n) { return f(t, H(n, e)) }), [], t) })); function ut(t, e) { for (var n = 0, r = e.length - (t - 1), i = new Array(r >= 0 ? r : 0); n < r;)i[n] = Array.prototype.slice.call(e, n, n + t), n += 1; return i } var st = function () { function t(t, e) { this.xf = e, this.pos = 0, this.full = !1, this.acc = new Array(t) } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.acc = null, this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.store(e), this.full ? this.xf["@@transducer/step"](t, this.getCopy()) : t }, t.prototype.store = function (t) { this.acc[this.pos] = t, this.pos += 1, this.pos === this.acc.length && (this.pos = 0, this.full = !0) }, t.prototype.getCopy = function () { return f(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos)) }, t }(), at = a(w([], a((function (t, e) { return new st(t, e) })), ut)), ct = a((function (t, e) { return f(e, [t]) })), ft = a((function (t, e) { return t.apply(this, e) })), ht = s((function (t) { for (var e = Y(t), n = e.length, r = [], i = 0; i < n;)r[i] = t[e[i]], i += 1; return r })); function lt(t, e) { return Y(e).reduce((function (n, r) { return n[r] = t(e[r]), n }), {}) } var pt = s((function t(e) { return e = lt((function (e) { return "function" == typeof e ? e : t(e) }), e), p(Z(S, 0, $("length", ht(e))), (function () { var t = arguments; return lt((function (e) { return ft(e, t) }), e) })) })), dt = a((function (t, e) { return e(t) })), yt = y((function (t, e, n) { var r = t(e), i = t(n); return r < i ? -1 : r > i ? 1 : 0 })), gt = y((function (t, e, n) { var r = {}; for (var i in n) r[i] = n[i]; return r[t] = e, r })), vt = s((function (t) { return null == t })), mt = y((function t(e, n, r) { if (0 === e.length) return n; var i = e[0]; if (e.length > 1) { var o = !vt(r) && P(i, r) ? r[i] : V(e[1]) ? [] : {}; n = t(Array.prototype.slice.call(e, 1), n, o) } if (V(i) && v(r)) { var u = [].concat(r); return u[i] = n, u } return gt(i, n, r) })), wt = a((function (t, e) { switch (t) { case 0: return function () { return e.call(this) }; case 1: return function (t) { return e.call(this, t) }; case 2: return function (t, n) { return e.call(this, t, n) }; case 3: return function (t, n, r) { return e.call(this, t, n, r) }; case 4: return function (t, n, r, i) { return e.call(this, t, n, r, i) }; case 5: return function (t, n, r, i, o) { return e.call(this, t, n, r, i, o) }; case 6: return function (t, n, r, i, o, u) { return e.call(this, t, n, r, i, o, u) }; case 7: return function (t, n, r, i, o, u, s) { return e.call(this, t, n, r, i, o, u, s) }; case 8: return function (t, n, r, i, o, u, s, a) { return e.call(this, t, n, r, i, o, u, s, a) }; case 9: return function (t, n, r, i, o, u, s, a, c) { return e.call(this, t, n, r, i, o, u, s, a, c) }; case 10: return function (t, n, r, i, o, u, s, a, c, f) { return e.call(this, t, n, r, i, o, u, s, a, c, f) }; default: throw new Error("First argument to nAry must be a non-negative integer no greater than ten") } })), bt = s((function (t) { return wt(2, t) })); function _t(t) { var e = Object.prototype.toString.call(t); return "[object Function]" === e || "[object AsyncFunction]" === e || "[object GeneratorFunction]" === e || "[object AsyncGeneratorFunction]" === e } var Et = a((function (t, e) { var n = p(t, e); return p(t, (function () { return R(ot, H(n, arguments[0]), Array.prototype.slice.call(arguments, 1)) })) })), Bt = s((function (t) { return Et(t.length, t) })), St = a((function (t, e) { return _t(t) ? function () { return t.apply(this, arguments) && e.apply(this, arguments) } : Bt(et)(t, e) })), kt = s((function (t) { return p(t.length, t) })), At = kt((function (t) { return t.apply(this, Array.prototype.slice.call(arguments, 1)) })); function Tt(t) { return function e(n) { for (var r, i, o, u = [], s = 0, a = n.length; s < a;) { if (T(n[s])) for (o = 0, i = (r = t ? e(n[s]) : n[s]).length; o < i;)u[u.length] = r[o], o += 1; else u[u.length] = n[s]; s += 1 } return u } } var Ct = function (t) { var e = function (t) { return { "@@transducer/init": _.init, "@@transducer/result": function (e) { return t["@@transducer/result"](e) }, "@@transducer/step": function (e, n) { var r = t["@@transducer/step"](e, n); return r["@@transducer/reduced"] ? { "@@transducer/value": r, "@@transducer/reduced": !0 } : r } } }(t); return { "@@transducer/init": _.init, "@@transducer/result": function (t) { return e["@@transducer/result"](t) }, "@@transducer/step": function (t, n) { return T(n) ? R(e, t, n) : R(e, t, [n]) } } }, xt = a(w(["fantasy-land/chain", "chain"], a((function (t, e) { return H(t, Ct(e)) })), (function (t, e) { return "function" == typeof e ? function (n) { return t(e(n))(n) } : Tt(!1)(H(t, e)) }))), It = y((function (t, e, n) { if (t > e) throw new Error("min must not be greater than max in clamp(min, max, value)"); return n < t ? t : n > e ? e : n })); function Ut(t) { return new RegExp(t.source, (t.global ? "g" : "") + (t.ignoreCase ? "i" : "") + (t.multiline ? "m" : "") + (t.sticky ? "y" : "") + (t.unicode ? "u" : "")) } var Ot = s((function (t) { return null === t ? "Null" : void 0 === t ? "Undefined" : Object.prototype.toString.call(t).slice(8, -1) })); function Mt(t, e, n, r) { var i = function (i) { for (var o = e.length, u = 0; u < o;) { if (t === e[u]) return n[u]; u += 1 } for (var s in e[u + 1] = t, n[u + 1] = i, t) i[s] = r ? Mt(t[s], e, n, !0) : t[s]; return i }; switch (Ot(t)) { case "Object": return i({}); case "Array": return i([]); case "Date": return new Date(t.valueOf()); case "RegExp": return Ut(t); default: return t } } var Rt = s((function (t) { return null != t && "function" == typeof t.clone ? t.clone() : Mt(t, [], [], !0) })), jt = s((function (t) { return function (e, n) { return t(e, n) ? -1 : t(n, e) ? 1 : 0 } })), Lt = s((function (t) { return !t })), Pt = Bt(Lt); function Dt(t, e) { return function () { return e.call(this, t.apply(this, arguments)) } } function Nt(t, e) { return function () { var n = arguments.length; if (0 === n) return e(); var r = arguments[n - 1]; return v(r) || "function" != typeof r[t] ? e.apply(this, arguments) : r[t].apply(r, Array.prototype.slice.call(arguments, 0, n - 1)) } } var Wt = y(Nt("slice", (function (t, e, n) { return Array.prototype.slice.call(n, t, e) }))), Ft = s(Nt("tail", Wt(1, 1 / 0))); function qt() { if (0 === arguments.length) throw new Error("pipe requires at least one argument"); return h(arguments[0].length, Z(Dt, arguments[0], Ft(arguments))) } var zt = s((function (t) { return A(t) ? t.split("").reverse().join("") : Array.prototype.slice.call(t, 0).reverse() })); function Yt() { if (0 === arguments.length) throw new Error("compose requires at least one argument"); return qt.apply(this, zt(arguments)) } function Ht() { if (0 === arguments.length) throw new Error("composeK requires at least one argument"); var t = Array.prototype.slice.call(arguments), e = t.pop(); return Yt(Yt.apply(this, H(xt, t)), e) } function Vt(t, e) { return function () { var n = this; return t.apply(n, arguments).then((function (t) { return e.call(n, t) })) } } function Xt() { if (0 === arguments.length) throw new Error("pipeP requires at least one argument"); return h(arguments[0].length, Z(Vt, arguments[0], Ft(arguments))) } function Jt() { if (0 === arguments.length) throw new Error("composeP requires at least one argument"); return Xt.apply(this, zt(arguments)) } var Kt = X(0); function Gt(t) { return t } var $t = s(Gt), Zt = a((function (t, e) { if (e.length <= 0) return $t; var n = Kt(e), r = Ft(e); return h(n.length, (function () { return R((function (e, n) { return t.call(this, n, e) }), n.apply(this, arguments), r) })) })), Qt = a((function (t, e) { return Zt.apply(this, [t, zt(e)]) })); function te(t) { for (var e, n = []; !(e = t.next()).done;)n.push(e.value); return n } function ee(t, e, n) { for (var r = 0, i = n.length; r < i;) { if (t(e, n[r])) return !0; r += 1 } return !1 } var ne = "function" == typeof Object.is ? Object.is : function (t, e) { return t === e ? 0 !== t || 1 / t == 1 / e : t != t && e != e }; function re(t, e, n, r) { var i = te(t); function o(t, e) { return ie(t, e, n.slice(), r.slice()) } return !ee((function (t, e) { return !ee(o, e, t) }), te(e), i) } function ie(t, e, n, r) { if (ne(t, e)) return !0; var i = Ot(t); if (i !== Ot(e)) return !1; if (null == t || null == e) return !1; if ("function" == typeof t["fantasy-land/equals"] || "function" == typeof e["fantasy-land/equals"]) return "function" == typeof t["fantasy-land/equals"] && t["fantasy-land/equals"](e) && "function" == typeof e["fantasy-land/equals"] && e["fantasy-land/equals"](t); if ("function" == typeof t.equals || "function" == typeof e.equals) return "function" == typeof t.equals && t.equals(e) && "function" == typeof e.equals && e.equals(t); switch (i) { case "Arguments": case "Array": case "Object": if ("function" == typeof t.constructor && "Promise" === function (t) { var e = String(t).match(/^function (\w*)/); return null == e ? "" : e[1] }(t.constructor)) return t === e; break; case "Boolean": case "Number": case "String": if (typeof t != typeof e || !ne(t.valueOf(), e.valueOf())) return !1; break; case "Date": if (!ne(t.valueOf(), e.valueOf())) return !1; break; case "Error": return t.name === e.name && t.message === e.message; case "RegExp": if (t.source !== e.source || t.global !== e.global || t.ignoreCase !== e.ignoreCase || t.multiline !== e.multiline || t.sticky !== e.sticky || t.unicode !== e.unicode) return !1 }for (var o = n.length - 1; o >= 0;) { if (n[o] === t) return r[o] === e; o -= 1 } switch (i) { case "Map": return t.size === e.size && re(t.entries(), e.entries(), n.concat([t]), r.concat([e])); case "Set": return t.size === e.size && re(t.values(), e.values(), n.concat([t]), r.concat([e])); case "Arguments": case "Array": case "Object": case "Boolean": case "Number": case "String": case "Date": case "Error": case "RegExp": case "Int8Array": case "Uint8Array": case "Uint8ClampedArray": case "Int16Array": case "Uint16Array": case "Int32Array": case "Uint32Array": case "Float32Array": case "Float64Array": case "ArrayBuffer": break; default: return !1 }var u = Y(t); if (u.length !== Y(e).length) return !1; var s = n.concat([t]), a = r.concat([e]); for (o = u.length - 1; o >= 0;) { var c = u[o]; if (!P(c, e) || !ie(e[c], t[c], s, a)) return !1; o -= 1 } return !0 } var oe = a((function (t, e) { return ie(t, e, [], []) })); function ue(t, e, n) { var r, i; if ("function" == typeof t.indexOf) switch (typeof e) { case "number": if (0 === e) { for (r = 1 / e; n < t.length;) { if (0 === (i = t[n]) && 1 / i === r) return n; n += 1 } return -1 } if (e != e) { for (; n < t.length;) { if ("number" == typeof (i = t[n]) && i != i) return n; n += 1 } return -1 } return t.indexOf(e, n); case "string": case "boolean": case "function": case "undefined": return t.indexOf(e, n); case "object": if (null === e) return t.indexOf(e, n) }for (; n < t.length;) { if (oe(t[n], e)) return n; n += 1 } return -1 } function se(t, e) { return ue(e, t, 0) >= 0 } function ae(t) { return '"' + t.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\f/g, "\\f").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\0/g, "\\0").replace(/"/g, '\\"') + '"' } var ce = function (t) { return (t < 10 ? "0" : "") + t }, fe = "function" == typeof Date.prototype.toISOString ? function (t) { return t.toISOString() } : function (t) { return t.getUTCFullYear() + "-" + ce(t.getUTCMonth() + 1) + "-" + ce(t.getUTCDate()) + "T" + ce(t.getUTCHours()) + ":" + ce(t.getUTCMinutes()) + ":" + ce(t.getUTCSeconds()) + "." + (t.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z" }; function he(t) { return function () { return !t.apply(this, arguments) } } function le(t, e) { for (var n = 0, r = e.length, i = []; n < r;)t(e[n]) && (i[i.length] = e[n]), n += 1; return i } function pe(t) { return "[object Object]" === Object.prototype.toString.call(t) } var de = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) ? this.xf["@@transducer/step"](t, e) : t }, t }(), ye = a(w(["filter"], a((function (t, e) { return new de(t, e) })), (function (t, e) { return pe(e) ? R((function (n, r) { return t(e[r]) && (n[r] = e[r]), n }), {}, Y(e)) : le(t, e) }))), ge = a((function (t, e) { return ye(he(t), e) })); function ve(t, e) { var n = function (n) { var r = e.concat([t]); return se(n, r) ? "<Circular>" : ve(n, r) }, r = function (t, e) { return k((function (e) { return ae(e) + ": " + n(t[e]) }), e.slice().sort()) }; switch (Object.prototype.toString.call(t)) { case "[object Arguments]": return "(function() { return arguments; }(" + k(n, t).join(", ") + "))"; case "[object Array]": return "[" + k(n, t).concat(r(t, ge((function (t) { return /^\d+$/.test(t) }), Y(t)))).join(", ") + "]"; case "[object Boolean]": return "object" == typeof t ? "new Boolean(" + n(t.valueOf()) + ")" : t.toString(); case "[object Date]": return "new Date(" + (isNaN(t.valueOf()) ? n(NaN) : ae(fe(t))) + ")"; case "[object Null]": return "null"; case "[object Number]": return "object" == typeof t ? "new Number(" + n(t.valueOf()) + ")" : 1 / t == -1 / 0 ? "-0" : t.toString(10); case "[object String]": return "object" == typeof t ? "new String(" + n(t.valueOf()) + ")" : ae(t); case "[object Undefined]": return "undefined"; default: if ("function" == typeof t.toString) { var i = t.toString(); if ("[object Object]" !== i) return i } return "{" + r(t, Y(t)).join(", ") + "}" } } var me = s((function (t) { return ve(t, []) })), we = a((function (t, e) { if (v(t)) { if (v(e)) return t.concat(e); throw new TypeError(me(e) + " is not an array") } if (A(t)) { if (A(e)) return t + e; throw new TypeError(me(e) + " is not a string") } if (null != t && _t(t["fantasy-land/concat"])) return t["fantasy-land/concat"](e); if (null != t && _t(t.concat)) return t.concat(e); throw new TypeError(me(t) + ' does not have a method named "concat" or "fantasy-land/concat"') })), be = s((function (t) { return h(Z(S, 0, H((function (t) { return t[0].length }), t)), (function () { for (var e = 0; e < t.length;) { if (t[e][0].apply(this, arguments)) return t[e][1].apply(this, arguments); e += 1 } })) })), _e = a((function (t, e) { if (t > 10) throw new Error("Constructor with greater than ten arguments"); return 0 === t ? function () { return new e } : kt(wt(t, (function (t, n, r, i, o, u, s, a, c, f) { switch (arguments.length) { case 1: return new e(t); case 2: return new e(t, n); case 3: return new e(t, n, r); case 4: return new e(t, n, r, i); case 5: return new e(t, n, r, i, o); case 6: return new e(t, n, r, i, o, u); case 7: return new e(t, n, r, i, o, u, s); case 8: return new e(t, n, r, i, o, u, s, a); case 9: return new e(t, n, r, i, o, u, s, a, c); case 10: return new e(t, n, r, i, o, u, s, a, c, f) } }))) })), Ee = s((function (t) { return _e(t.length, t) })), Be = a(se), Se = a((function (t, e) { return p(Z(S, 0, $("length", e)), (function () { var n = arguments, r = this; return t.apply(r, k((function (t) { return t.apply(r, n) }), e)) })) })), ke = function () { function t(t, e, n, r) { this.valueFn = t, this.valueAcc = e, this.keyFn = n, this.xf = r, this.inputs = {} } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { var e; for (e in this.inputs) if (P(e, this.inputs) && (t = this.xf["@@transducer/step"](t, this.inputs[e]))["@@transducer/reduced"]) { t = t["@@transducer/value"]; break } return this.inputs = null, this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { var n = this.keyFn(e); return this.inputs[n] = this.inputs[n] || [n, this.valueAcc], this.inputs[n][1] = this.valueFn(this.inputs[n][1], e), t }, t }(), Ae = l(4, [], w([], l(4, [], (function (t, e, n, r) { return new ke(t, e, n, r) })), (function (t, e, n, r) { return R((function (r, i) { var o = n(i); return r[o] = t(P(o, r) ? r[o] : Mt(e, [], [], !1), i), r }), {}, r) }))), Te = Ae((function (t, e) { return t + 1 }), 0), Ce = c(-1), xe = a((function (t, e) { return null == e || e != e ? t : e })), Ie = y((function (t, e, n) { var r = t(e), i = t(n); return r > i ? -1 : r < i ? 1 : 0 })); function Ue(t, e, n) { var r, i = typeof t; switch (i) { case "string": case "number": return 0 === t && 1 / t == -1 / 0 ? !!n._items["-0"] || (e && (n._items["-0"] = !0), !1) : null !== n._nativeSet ? e ? (r = n._nativeSet.size, n._nativeSet.add(t), n._nativeSet.size === r) : n._nativeSet.has(t) : i in n._items ? t in n._items[i] || (e && (n._items[i][t] = !0), !1) : (e && (n._items[i] = {}, n._items[i][t] = !0), !1); case "boolean": if (i in n._items) { var o = t ? 1 : 0; return !!n._items[i][o] || (e && (n._items[i][o] = !0), !1) } return e && (n._items[i] = t ? [!1, !0] : [!0, !1]), !1; case "function": return null !== n._nativeSet ? e ? (r = n._nativeSet.size, n._nativeSet.add(t), n._nativeSet.size === r) : n._nativeSet.has(t) : i in n._items ? !!se(t, n._items[i]) || (e && n._items[i].push(t), !1) : (e && (n._items[i] = [t]), !1); case "undefined": return !!n._items[i] || (e && (n._items[i] = !0), !1); case "object": if (null === t) return !!n._items.null || (e && (n._items.null = !0), !1); default: return (i = Object.prototype.toString.call(t)) in n._items ? !!se(t, n._items[i]) || (e && n._items[i].push(t), !1) : (e && (n._items[i] = [t]), !1) } } var Oe = function () { function t() { this._nativeSet = "function" == typeof Set ? new Set : null, this._items = {} } return t.prototype.add = function (t) { return !Ue(t, !0, this) }, t.prototype.has = function (t) { return Ue(t, !1, this) }, t }(), Me = a((function (t, e) { for (var n = [], r = 0, i = t.length, o = e.length, u = new Oe, s = 0; s < o; s += 1)u.add(e[s]); for (; r < i;)u.add(t[r]) && (n[n.length] = t[r]), r += 1; return n })), Re = y((function (t, e, n) { for (var r = [], i = 0, o = e.length; i < o;)ee(t, e[i], n) || ee(t, e[i], r) || r.push(e[i]), i += 1; return r })), je = a((function (t, e) { var n = {}; for (var r in e) n[r] = e[r]; return delete n[t], n })), Le = y((function (t, e, n) { var r = Array.prototype.slice.call(n, 0); return r.splice(t, e), r })), Pe = y((function (t, e, n) { return g(t, tt(e), n) })), De = a((function t(e, n) { switch (e.length) { case 0: return n; case 1: return V(e[0]) && v(n) ? Le(e[0], 1, n) : je(e[0], n); default: var r = e[0], i = Array.prototype.slice.call(e, 1); return null == n[r] ? n : V(r) && v(n) ? Pe(r, t(i, n[r]), n) : gt(r, t(i, n[r]), n) } })), Ne = a((function (t, e) { return t / e })), We = function () { function t(t, e) { this.xf = e, this.n = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { return this.n > 0 ? (this.n -= 1, t) : this.xf["@@transducer/step"](t, e) }, t }(), Fe = a(w(["drop"], a((function (t, e) { return new We(t, e) })), (function (t, e) { return Wt(Math.max(0, t), 1 / 0, e) }))), qe = function () { function t(t, e) { this.xf = e, this.n = t, this.i = 0 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { this.i += 1; var n = 0 === this.n ? t : this.xf["@@transducer/step"](t, e); return this.n >= 0 && this.i >= this.n ? b(n) : n }, t }(), ze = a(w(["take"], a((function (t, e) { return new qe(t, e) })), (function (t, e) { return Wt(0, t < 0 ? 1 / 0 : t, e) }))); function Ye(t, e) { return ze(t < e.length ? e.length - t : 0, e) } var He = function () { function t(t, e) { this.xf = e, this.pos = 0, this.full = !1, this.acc = new Array(t) } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.acc = null, this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.full && (t = this.xf["@@transducer/step"](t, this.acc[this.pos])), this.store(e), t }, t.prototype.store = function (t) { this.acc[this.pos] = t, this.pos += 1, this.pos === this.acc.length && (this.pos = 0, this.full = !0) }, t }(), Ve = a(w([], a((function (t, e) { return new He(t, e) })), Ye)); function Xe(t, e) { for (var n = e.length - 1; n >= 0 && t(e[n]);)n -= 1; return Wt(0, n + 1, e) } var Je = function () { function t(t, e) { this.f = t, this.retained = [], this.xf = e } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.retained = null, this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) ? this.retain(t, e) : this.flush(t, e) }, t.prototype.flush = function (t, e) { return t = R(this.xf["@@transducer/step"], t, this.retained), this.retained = [], this.xf["@@transducer/step"](t, e) }, t.prototype.retain = function (t, e) { return this.retained.push(e), t }, t }(), Ke = a(w([], a((function (t, e) { return new Je(t, e) })), Xe)), Ge = function () { function t(t, e) { this.xf = e, this.pred = t, this.lastValue = void 0, this.seenFirstValue = !1 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { var n = !1; return this.seenFirstValue ? this.pred(this.lastValue, e) && (n = !0) : this.seenFirstValue = !0, this.lastValue = e, n ? t : this.xf["@@transducer/step"](t, e) }, t }(), $e = a((function (t, e) { return new Ge(t, e) })), Ze = X(-1), Qe = a(w([], $e, (function (t, e) { var n = [], r = 1, i = e.length; if (0 !== i) for (n[0] = e[0]; r < i;)t(Ze(n), e[r]) || (n[n.length] = e[r]), r += 1; return n }))), tn = s(w([], $e(oe), Qe(oe))), en = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { if (this.f) { if (this.f(e)) return t; this.f = null } return this.xf["@@transducer/step"](t, e) }, t }(), nn = a(w(["dropWhile"], a((function (t, e) { return new en(t, e) })), (function (t, e) { for (var n = 0, r = e.length; n < r && t(e[n]);)n += 1; return Wt(n, 1 / 0, e) }))), rn = a((function (t, e) { return t || e })), on = a((function (t, e) { return _t(t) ? function () { return t.apply(this, arguments) || e.apply(this, arguments) } : Bt(rn)(t, e) })), un = s((function (t) { return null != t && "function" == typeof t["fantasy-land/empty"] ? t["fantasy-land/empty"]() : null != t && null != t.constructor && "function" == typeof t.constructor["fantasy-land/empty"] ? t.constructor["fantasy-land/empty"]() : null != t && "function" == typeof t.empty ? t.empty() : null != t && null != t.constructor && "function" == typeof t.constructor.empty ? t.constructor.empty() : v(t) ? [] : A(t) ? "" : pe(t) ? {} : N(t) ? function () { return arguments }() : void 0 })), sn = a((function (t, e) { return Fe(t >= 0 ? e.length - t : 0, e) })), an = a((function (t, e) { return oe(sn(t.length, e), t) })), cn = y((function (t, e, n) { return oe(t(e), t(n)) })), fn = y((function (t, e, n) { return oe(e[t], n[t]) })), hn = a((function t(e, n) { var r, i, o, u = n instanceof Array ? [] : {}; for (i in n) o = typeof (r = e[i]), u[i] = "function" === o ? r(n[i]) : r && "object" === o ? t(r, n[i]) : n[i]; return u })), ln = function () { function t(t, e) { this.xf = e, this.f = t, this.found = !1 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.found || (t = this.xf["@@transducer/step"](t, void 0)), this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) && (this.found = !0, t = b(this.xf["@@transducer/step"](t, e))), t }, t }(), pn = a(w(["find"], a((function (t, e) { return new ln(t, e) })), (function (t, e) { for (var n = 0, r = e.length; n < r;) { if (t(e[n])) return e[n]; n += 1 } }))), dn = function () { function t(t, e) { this.xf = e, this.f = t, this.idx = -1, this.found = !1 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.found || (t = this.xf["@@transducer/step"](t, -1)), this.xf["@@transducer/result"](t) }, t.prototype["@@transducer/step"] = function (t, e) { return this.idx += 1, this.f(e) && (this.found = !0, t = b(this.xf["@@transducer/step"](t, this.idx))), t }, t }(), yn = a(w([], a((function (t, e) { return new dn(t, e) })), (function (t, e) { for (var n = 0, r = e.length; n < r;) { if (t(e[n])) return n; n += 1 } return -1 }))), gn = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.xf["@@transducer/result"](this.xf["@@transducer/step"](t, this.last)) }, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) && (this.last = e), t }, t }(), vn = a(w([], a((function (t, e) { return new gn(t, e) })), (function (t, e) { for (var n = e.length - 1; n >= 0;) { if (t(e[n])) return e[n]; n -= 1 } }))), mn = function () { function t(t, e) { this.xf = e, this.f = t, this.idx = -1, this.lastIdx = -1 } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = function (t) { return this.xf["@@transducer/result"](this.xf["@@transducer/step"](t, this.lastIdx)) }, t.prototype["@@transducer/step"] = function (t, e) { return this.idx += 1, this.f(e) && (this.lastIdx = this.idx), t }, t }(), wn = a(w([], a((function (t, e) { return new mn(t, e) })), (function (t, e) { for (var n = e.length - 1; n >= 0;) { if (t(e[n])) return n; n -= 1 } return -1 }))), bn = s(Tt(!0)), _n = s((function (t) { return p(t.length, (function (e, n) { var r = Array.prototype.slice.call(arguments, 0); return r[0] = n, r[1] = e, t.apply(this, r) })) })), En = a(Nt("forEach", (function (t, e) { for (var n = e.length, r = 0; r < n;)t(e[r]), r += 1; return e }))), Bn = a((function (t, e) { for (var n = Y(e), r = 0; r < n.length;) { var i = n[r]; t(e[i], i, e), r += 1 } return e })), Sn = s((function (t) { for (var e = {}, n = 0; n < t.length;)e[t[n][0]] = t[n][1], n += 1; return e })), kn = a(Nt("groupBy", Ae((function (t, e) { return null == t && (t = []), t.push(e), t }), null))), An = a((function (t, e) { for (var n = [], r = 0, i = e.length; r < i;) { for (var o = r + 1; o < i && t(e[o - 1], e[o]);)o += 1; n.push(e.slice(r, o)), r = o } return n })), Tn = a((function (t, e) { return t > e })), Cn = a((function (t, e) { return t >= e })), xn = a((function (t, e) { if (0 === t.length || vt(e)) return !1; for (var n = e, r = 0; r < t.length;) { if (vt(n) || !P(t[r], n)) return !1; n = n[t[r]], r += 1 } return !0 })), In = a((function (t, e) { return xn([t], e) })), Un = a((function (t, e) { return t in e })), On = a(ne), Mn = y((function (t, e, n) { return p(Math.max(t.length, e.length, n.length), (function () { return t.apply(this, arguments) ? e.apply(this, arguments) : n.apply(this, arguments) })) })), Rn = c(1), jn = a(se), Ln = Ae((function (t, e) { return e }), null), Pn = a((function (t, e) { return "function" != typeof e.indexOf || v(e) ? ue(e, t, 0) : e.indexOf(t) })), Dn = Wt(0, -1), Nn = y((function (t, e, n) { return le((function (e) { return ee(t, e, n) }), e) })), Wn = y((function (t, e, n) { t = t < n.length && t >= 0 ? t : n.length; var r = Array.prototype.slice.call(n, 0); return r.splice(t, 0, e), r })), Fn = y((function (t, e, n) { return t = t < n.length && t >= 0 ? t : n.length, [].concat(Array.prototype.slice.call(n, 0, t), e, Array.prototype.slice.call(n, t)) })), qn = a((function (t, e) { for (var n, r, i = new Oe, o = [], u = 0; u < e.length;)n = t(r = e[u]), i.add(n) && o.push(r), u += 1; return o })), zn = qn($t), Yn = a((function (t, e) { var n, r; return t.length > e.length ? (n = t, r = e) : (n = e, r = t), zn(le(_n(se)(n), r)) })), Hn = a(Nt("intersperse", (function (t, e) { for (var n = [], r = 0, i = e.length; r < i;)r === i - 1 ? n.push(e[r]) : n.push(e[r], t), r += 1; return n }))); var Vn = "function" == typeof Object.assign ? Object.assign : function (t) { if (null == t) throw new TypeError("Cannot convert undefined or null to object"); for (var e = Object(t), n = 1, r = arguments.length; n < r;) { var i = arguments[n]; if (null != i) for (var o in i) P(o, i) && (e[o] = i[o]); n += 1 } return e }, Xn = a((function (t, e) { var n = {}; return n[t] = e, n })), Jn = { "@@transducer/init": Array, "@@transducer/step": function (t, e) { return t.push(e), t }, "@@transducer/result": Gt }, Kn = { "@@transducer/init": String, "@@transducer/step": function (t, e) { return t + e }, "@@transducer/result": Gt }, Gn = { "@@transducer/init": Object, "@@transducer/step": function (t, e) { return Vn(t, T(e) ? Xn(e[0], e[1]) : e) }, "@@transducer/result": Gt }; var $n = y((function (t, e, n) { return m(t) ? R(e(t), t["@@transducer/init"](), n) : R(e(function (t) { if (m(t)) return t; if (T(t)) return Jn; if ("string" == typeof t) return Kn; if ("object" == typeof t) return Gn; throw new Error("Cannot create transformer for " + t) }(t)), Mt(t, [], [], !1), n) })), Zn = s((function (t) { for (var e = Y(t), n = e.length, r = 0, i = {}; r < n;) { var o = e[r], u = t[o], s = P(u, i) ? i[u] : i[u] = []; s[s.length] = o, r += 1 } return i })), Qn = s((function (t) { for (var e = Y(t), n = e.length, r = 0, i = {}; r < n;) { var o = e[r]; i[t[o]] = o, r += 1 } return i })), tr = a((function (t, e) { return p(t + 1, (function () { var n = arguments[t]; if (null != n && _t(n[e])) return n[e].apply(n, Array.prototype.slice.call(arguments, 0, t)); throw new TypeError(me(n) + ' does not have a method named "' + e + '"') })) })), er = a((function (t, e) { return null != e && e.constructor === t || e instanceof t })), nr = s((function (t) { return null != t && oe(t, un(t)) })), rr = tr(1, "join"), ir = s((function (t) { return Se((function () { return Array.prototype.slice.call(arguments, 0) }), t) })), or = s((function (t) { var e, n = []; for (e in t) n[n.length] = e; return n })), ur = a((function (t, e) { if ("function" != typeof e.lastIndexOf || v(e)) { for (var n = e.length - 1; n >= 0;) { if (oe(e[n], t)) return n; n -= 1 } return -1 } return e.lastIndexOf(t) })); function sr(t) { return "[object Number]" === Object.prototype.toString.call(t) } var ar = s((function (t) { return null != t && sr(t.length) ? t.length : NaN })), cr = a((function (t, e) { return function (n) { return function (r) { return H((function (t) { return e(t, r) }), n(t(r))) } } })), fr = s((function (t) { return cr(X(t), Pe(t)) })), hr = s((function (t) { return cr(K(t), mt(t)) })), lr = s((function (t) { return cr(G(t), gt(t)) })), pr = a((function (t, e) { return t < e })), dr = a((function (t, e) { return t <= e })), yr = y((function (t, e, n) { for (var r = 0, i = n.length, o = [], u = [e]; r < i;)u = t(u[0], n[r]), o[r] = u[1], r += 1; return [u[0], o] })), gr = y((function (t, e, n) { for (var r = n.length - 1, i = [], o = [e]; r >= 0;)o = t(o[0], n[r]), i[r] = o[1], r -= 1; return [o[0], i] })), vr = a((function (t, e) { return R((function (n, r) { return n[r] = t(e[r], r, e), n }), {}, Y(e)) })), mr = a((function (t, e) { return e.match(t) || [] })), wr = a((function (t, e) { return V(t) ? !V(e) || e < 1 ? NaN : (t % e + e) % e : NaN })), br = y((function (t, e, n) { return t(n) > t(e) ? n : e })), _r = Z(c, 0), Er = s((function (t) { return _r(t) / t.length })), Br = s((function (t) { var e = t.length; if (0 === e) return NaN; var n = 2 - e % 2, r = (e - n) / 2; return Er(Array.prototype.slice.call(t, 0).sort((function (t, e) { return t < e ? -1 : t > e ? 1 : 0 })).slice(r, r + n)) })), Sr = a((function (t, e) { var n = {}; return h(e.length, (function () { var r = t.apply(this, arguments); return P(r, n) || (n[r] = e.apply(this, arguments)), n[r] })) })), kr = a((function (t, e) { return Vn({}, t, e) })), Ar = s((function (t) { return Vn.apply(null, [{}].concat(t)) })), Tr = y((function (t, e, n) { var r, i = {}; for (r in e) P(r, e) && (i[r] = P(r, n) ? t(r, e[r], n[r]) : e[r]); for (r in n) P(r, n) && !P(r, i) && (i[r] = n[r]); return i })), Cr = y((function t(e, n, r) { return Tr((function (n, r, i) { return pe(r) && pe(i) ? t(e, r, i) : e(n, r, i) }), n, r) })), xr = a((function (t, e) { return Cr((function (t, e, n) { return e }), t, e) })), Ir = a((function (t, e) { return Cr((function (t, e, n) { return n }), t, e) })), Ur = y((function (t, e, n) { return Cr((function (e, n, r) { return t(n, r) }), e, n) })), Or = a((function (t, e) { return Vn({}, e, t) })), Mr = a((function (t, e) { return Vn({}, t, e) })), Rr = y((function (t, e, n) { return Tr((function (e, n, r) { return t(n, r) }), e, n) })), jr = a((function (t, e) { return e < t ? e : t })), Lr = y((function (t, e, n) { return t(n) < t(e) ? n : e })), Pr = a((function (t, e) { return t % e })), Dr = y((function (t, e, n) { var r = n.length, i = n.slice(), o = t < 0 ? r + t : t, u = e < 0 ? r + e : e, s = i.splice(o, 1); return o < 0 || o >= n.length || u < 0 || u >= n.length ? n : [].concat(i.slice(0, u)).concat(s).concat(i.slice(u, n.length)) })), Nr = a((function (t, e) { return t * e })), Wr = s((function (t) { return -t })), Fr = a((function (t, e) { return B(he(t), e) })), qr = s((function (t) { return p(t < 0 ? 1 : t + 1, (function () { return X(t, arguments) })) })), zr = y((function (t, e, n) { return t(e(n)) })); function Yr(t) { return [t] } var Hr = s(Yr), Vr = a((function (t, e) { for (var n = {}, r = {}, i = 0, o = t.length; i < o;)r[t[i]] = 1, i += 1; for (var u in e) r.hasOwnProperty(u) || (n[u] = e[u]); return n })), Xr = s((function (t) { var e, n = !1; return h(t.length, (function () { return n ? e : (n = !0, e = t.apply(this, arguments)) })) })); function Jr(t, e) { if (null == e || !_t(e.then)) throw new TypeError("`" + t + "` expected a Promise, received " + ve(e, [])) } var Kr = a((function (t, e) { return Jr("otherwise", e), e.then(null, t) })), Gr = function (t) { return { value: t, map: function (e) { return Gr(e(t)) } } }, $r = y((function (t, e, n) { return t((function (t) { return Gr(e(t)) }))(n).value })), Zr = a((function (t, e) { return [t, e] })); function Qr(t) { return a((function (e, n) { return h(Math.max(0, e.length - n.length), (function () { return e.apply(this, t(n, arguments)) })) })) } var ti = Qr(f), ei = Qr(_n(f)), ni = ir([ye, ge]), ri = y((function (t, e, n) { return oe(K(t, n), e) })), ii = y((function (t, e, n) { return xe(t, K(e, n)) })), oi = y((function (t, e, n) { return t(K(e, n)) })), ui = a((function (t, e) { for (var n = {}, r = 0; r < t.length;)t[r] in e && (n[t[r]] = e[t[r]]), r += 1; return n })), si = a((function (t, e) { for (var n = {}, r = 0, i = t.length; r < i;) { var o = t[r]; n[o] = e[o], r += 1 } return n })), ai = a((function (t, e) { var n = {}; for (var r in e) t(e[r], r, e) && (n[r] = e[r]); return n })); function ci() { if (0 === arguments.length) throw new Error("pipeK requires at least one argument"); return Ht.apply(this, zt(arguments)) } var fi = a((function (t, e) { return f([t], e) })), hi = Z(Nr, 1), li = a((function (t, e) { return p(e.length, (function () { for (var n = [], r = 0; r < e.length;)n.push(e[r].call(this, arguments[r])), r += 1; return t.apply(this, n.concat(Array.prototype.slice.call(arguments, e.length))) })) })), pi = li(k, [si, $t]), di = y((function (t, e, n) { return oe(e, n[t]) })), yi = y((function (t, e, n) { return er(t, n[e]) })), gi = y((function (t, e, n) { return ii(t, [e], n) })), vi = y((function (t, e, n) { return t(n[e]) })), mi = a((function (t, e) { return t.map((function (t) { return K([t], e) })) })), wi = a((function (t, e) { if (!sr(t) || !sr(e)) throw new TypeError("Both arguments to range must be numbers"); for (var n = [], r = t; r < e;)n.push(r), r += 1; return n })), bi = y((function (t, e, n) { for (var r = n.length - 1; r >= 0;)e = t(n[r], e), r -= 1; return e })), _i = l(4, [], (function (t, e, n, r) { return R((function (n, r) { return t(n, r) ? e(n, r) : b(n) }), n, r) })), Ei = s(b), Bi = a((function (t, e) { var n, r = Number(e), i = 0; if (r < 0 || isNaN(r)) throw new RangeError("n must be a non-negative number"); for (n = new Array(r); i < r;)n[i] = t(i), i += 1; return n })), Si = a((function (t, e) { return Bi(tt(t), e) })), ki = y((function (t, e, n) { return n.replace(t, e) })), Ai = y((function (t, e, n) { for (var r = 0, i = n.length, o = [e]; r < i;)e = t(e, n[r]), o[r + 1] = e, r += 1; return o })), Ti = a((function (t, e) { return "function" == typeof e.sequence ? e.sequence(t) : bi((function (t, e) { return ot(H(fi, t), e) }), t([]), e) })), Ci = y((function (t, e, n) { return $r(t, tt(e), n) })), xi = a((function (t, e) { return Array.prototype.slice.call(e, 0).sort(t) })), Ii = a((function (t, e) { return Array.prototype.slice.call(e, 0).sort((function (e, n) { var r = t(e), i = t(n); return r < i ? -1 : r > i ? 1 : 0 })) })), Ui = a((function (t, e) { return Array.prototype.slice.call(e, 0).sort((function (e, n) { for (var r = 0, i = 0; 0 === r && i < t.length;)r = t[i](e, n), i += 1; return r })) })), Oi = tr(1, "split"), Mi = a((function (t, e) { return [Wt(0, t, e), Wt(t, ar(e), e)] })), Ri = a((function (t, e) { if (t <= 0) throw new Error("First argument to splitEvery must be a positive integer"); for (var n = [], r = 0; r < e.length;)n.push(Wt(r, r += t, e)); return n })), ji = a((function (t, e) { for (var n = 0, r = e.length, i = []; n < r && !t(e[n]);)i.push(e[n]), n += 1; return [i, Array.prototype.slice.call(e, n)] })), Li = a((function (t, e) { return oe(ze(t.length, e), t) })), Pi = a((function (t, e) { return Number(t) - Number(e) })), Di = a((function (t, e) { return we(Me(t, e), Me(e, t)) })), Ni = y((function (t, e, n) { return we(Re(t, e, n), Re(t, n, e)) })), Wi = a((function (t, e) { for (var n = e.length - 1; n >= 0 && t(e[n]);)n -= 1; return Wt(n + 1, 1 / 0, e) })), Fi = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e) ? this.xf["@@transducer/step"](t, e) : b(t) }, t }(), qi = a(w(["takeWhile"], a((function (t, e) { return new Fi(t, e) })), (function (t, e) { for (var n = 0, r = e.length; n < r && t(e[n]);)n += 1; return Wt(0, n, e) }))), zi = function () { function t(t, e) { this.xf = e, this.f = t } return t.prototype["@@transducer/init"] = _.init, t.prototype["@@transducer/result"] = _.result, t.prototype["@@transducer/step"] = function (t, e) { return this.f(e), this.xf["@@transducer/step"](t, e) }, t }(), Yi = a(w([], a((function (t, e) { return new zi(t, e) })), (function (t, e) { return t(e), e }))); var Hi = a((function (t, e) { if (n = t, "[object RegExp]" !== Object.prototype.toString.call(n)) throw new TypeError("‘test’ requires a value of type RegExp as its first argument; received " + me(t)); var n; return Ut(t).test(e) })), Vi = a((function (t, e) { return Jr("andThen", e), e.then(t) })), Xi = tr(0, "toLowerCase"), Ji = s((function (t) { var e = []; for (var n in t) P(n, t) && (e[e.length] = [n, t[n]]); return e })), Ki = s((function (t) { var e = []; for (var n in t) e[e.length] = [n, t[n]]; return e })), Gi = tr(0, "toUpperCase"), $i = p(4, (function (t, e, n, r) { return R(t("function" == typeof e ? x(e) : e), n, r) })), Zi = s((function (t) { for (var e = 0, n = []; e < t.length;) { for (var r = t[e], i = 0; i < r.length;)void 0 === n[i] && (n[i] = []), n[i].push(r[i]), i += 1; e += 1 } return n })), Qi = y((function (t, e, n) { return "function" == typeof n["fantasy-land/traverse"] ? n["fantasy-land/traverse"](e, t) : Ti(t, H(e, n)) })), to = "\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff", eo = s("function" == typeof String.prototype.trim && !to.trim() && "​".trim() ? function (t) { return t.trim() } : function (t) { var e = new RegExp("^[" + to + "][" + to + "]*"), n = new RegExp("[" + to + "][" + to + "]*$"); return t.replace(e, "").replace(n, "") }), no = a((function (t, e) { return h(t.length, (function () { try { return t.apply(this, arguments) } catch (t) { return e.apply(this, f([t], arguments)) } })) })), ro = s((function (t) { return function () { return t(Array.prototype.slice.call(arguments, 0)) } })), io = s((function (t) { return wt(1, t) })), oo = a((function (t, e) { return p(t, (function () { for (var n, r = 1, i = e, o = 0; r <= t && "function" == typeof i;)n = r === t ? arguments.length : o + i.length, i = i.apply(this, Array.prototype.slice.call(arguments, o, n)), r += 1, o = n; return i })) })), uo = a((function (t, e) { for (var n = t(e), r = []; n && n.length;)r[r.length] = n[0], n = t(n[1]); return r })), so = a(Yt(zn, f)), ao = a((function (t, e) { for (var n, r = 0, i = e.length, o = []; r < i;)ee(t, n = e[r], o) || (o[o.length] = n), r += 1; return o })), co = y((function (t, e, n) { return ao(t, f(e, n)) })), fo = y((function (t, e, n) { return t(n) ? n : e(n) })), ho = xt(Gt), lo = y((function (t, e, n) { for (var r = n; !t(r);)r = e(r); return r })), po = s((function (t) { var e, n = []; for (e in t) n[n.length] = t[e]; return n })), yo = function (t) { return { value: t, "fantasy-land/map": function () { return this } } }, go = a((function (t, e) { return t(yo)(e).value })), vo = y((function (t, e, n) { return t(n) ? e(n) : n })), mo = a((function (t, e) { for (var n in t) if (P(n, t) && !t[n](e[n])) return !1; return !0 })), wo = a((function (t, e) { return mo(H(oe, t), e) })), bo = a((function (t, e) { return ge(_n(se)(t), e) })), _o = a((function (t, e) { return Boolean(!t ^ !e) })), Eo = a((function (t, e) { for (var n, r = 0, i = t.length, o = e.length, u = []; r < i;) { for (n = 0; n < o;)u[u.length] = [t[r], e[n]], n += 1; r += 1 } return u })), Bo = a((function (t, e) { for (var n = [], r = 0, i = Math.min(t.length, e.length); r < i;)n[r] = [t[r], e[r]], r += 1; return n })), So = a((function (t, e) { for (var n = 0, r = Math.min(t.length, e.length), i = {}; n < r;)i[t[n]] = e[n], n += 1; return i })), ko = y((function (t, e, n) { for (var r = [], i = 0, o = Math.min(e.length, n.length); i < o;)r[i] = t(e[i], n[i]), i += 1; return r })), Ao = s((function (t) { return p(t.length, (function () { var e = arguments; return function () { return t.apply(this, e) } })) })) }, function (t, e, n) { t.exports = i; var r = n(16).EventEmitter; function i() { r.call(this) } n(1)(i, r), i.Readable = n(17), i.Writable = n(60), i.Duplex = n(61), i.Transform = n(62), i.PassThrough = n(63), i.Stream = i, i.prototype.pipe = function (t, e) { var n = this; function i(e) { t.writable && !1 === t.write(e) && n.pause && n.pause() } function o() { n.readable && n.resume && n.resume() } n.on("data", i), t.on("drain", o), t._isStdio || e && !1 === e.end || (n.on("end", s), n.on("close", a)); var u = !1; function s() { u || (u = !0, t.end()) } function a() { u || (u = !0, "function" == typeof t.destroy && t.destroy()) } function c(t) { if (f(), 0 === r.listenerCount(this, "error")) throw t } function f() { n.removeListener("data", i), t.removeListener("drain", o), n.removeListener("end", s), n.removeListener("close", a), n.removeListener("error", c), t.removeListener("error", c), n.removeListener("end", f), n.removeListener("close", f), t.removeListener("close", f) } return n.on("error", c), t.on("error", c), n.on("end", f), n.on("close", f), t.on("close", f), t.emit("pipe", n), t } }, function (t, e, n) { "use strict"; (function (e) { void 0 === e || !e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = { nextTick: function (t, n, r, i) { if ("function" != typeof t) throw new TypeError('"callback" argument must be a function'); var o, u, s = arguments.length; switch (s) { case 0: case 1: return e.nextTick(t); case 2: return e.nextTick((function () { t.call(null, n) })); case 3: return e.nextTick((function () { t.call(null, n, r) })); case 4: return e.nextTick((function () { t.call(null, n, r, i) })); default: for (o = new Array(s - 1), u = 0; u < o.length;)o[u++] = arguments[u]; return e.nextTick((function () { t.apply(null, o) })) } } } : t.exports = e }).call(this, n(4)) }, function (t, e) { function n(t, e) { if (!t) throw new Error(e || "Assertion failed") } t.exports = n, n.equal = function (t, e, n) { if (t != e) throw new Error(n || "Assertion failed: " + t + " != " + e) } }, function (t, e, n) { var r = n(0).Buffer; function i(t) { r.isBuffer(t) || (t = r.from(t)); for (var e = t.length / 4 | 0, n = new Array(e), i = 0; i < e; i++)n[i] = t.readUInt32BE(4 * i); return n } function o(t) { for (; 0 < t.length; t++)t[0] = 0 } function u(t, e, n, r, i) { for (var o, u, s, a, c = n[0], f = n[1], h = n[2], l = n[3], p = t[0] ^ e[0], d = t[1] ^ e[1], y = t[2] ^ e[2], g = t[3] ^ e[3], v = 4, m = 1; m < i; m++)o = c[p >>> 24] ^ f[d >>> 16 & 255] ^ h[y >>> 8 & 255] ^ l[255 & g] ^ e[v++], u = c[d >>> 24] ^ f[y >>> 16 & 255] ^ h[g >>> 8 & 255] ^ l[255 & p] ^ e[v++], s = c[y >>> 24] ^ f[g >>> 16 & 255] ^ h[p >>> 8 & 255] ^ l[255 & d] ^ e[v++], a = c[g >>> 24] ^ f[p >>> 16 & 255] ^ h[d >>> 8 & 255] ^ l[255 & y] ^ e[v++], p = o, d = u, y = s, g = a; return o = (r[p >>> 24] << 24 | r[d >>> 16 & 255] << 16 | r[y >>> 8 & 255] << 8 | r[255 & g]) ^ e[v++], u = (r[d >>> 24] << 24 | r[y >>> 16 & 255] << 16 | r[g >>> 8 & 255] << 8 | r[255 & p]) ^ e[v++], s = (r[y >>> 24] << 24 | r[g >>> 16 & 255] << 16 | r[p >>> 8 & 255] << 8 | r[255 & d]) ^ e[v++], a = (r[g >>> 24] << 24 | r[p >>> 16 & 255] << 16 | r[d >>> 8 & 255] << 8 | r[255 & y]) ^ e[v++], [o >>>= 0, u >>>= 0, s >>>= 0, a >>>= 0] } var s = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], a = function () { for (var t = new Array(256), e = 0; e < 256; e++)t[e] = e < 128 ? e << 1 : e << 1 ^ 283; for (var n = [], r = [], i = [[], [], [], []], o = [[], [], [], []], u = 0, s = 0, a = 0; a < 256; ++a) { var c = s ^ s << 1 ^ s << 2 ^ s << 3 ^ s << 4; c = c >>> 8 ^ 255 & c ^ 99, n[u] = c, r[c] = u; var f = t[u], h = t[f], l = t[h], p = 257 * t[c] ^ 16843008 * c; i[0][u] = p << 24 | p >>> 8, i[1][u] = p << 16 | p >>> 16, i[2][u] = p << 8 | p >>> 24, i[3][u] = p, p = 16843009 * l ^ 65537 * h ^ 257 * f ^ 16843008 * u, o[0][c] = p << 24 | p >>> 8, o[1][c] = p << 16 | p >>> 16, o[2][c] = p << 8 | p >>> 24, o[3][c] = p, 0 === u ? u = s = 1 : (u = f ^ t[t[t[l ^ f]]], s ^= t[t[s]]) } return { SBOX: n, INV_SBOX: r, SUB_MIX: i, INV_SUB_MIX: o } }(); function c(t) { this._key = i(t), this._reset() } c.blockSize = 16, c.keySize = 32, c.prototype.blockSize = c.blockSize, c.prototype.keySize = c.keySize, c.prototype._reset = function () { for (var t = this._key, e = t.length, n = e + 6, r = 4 * (n + 1), i = [], o = 0; o < e; o++)i[o] = t[o]; for (o = e; o < r; o++) { var u = i[o - 1]; o % e == 0 ? (u = u << 8 | u >>> 24, u = a.SBOX[u >>> 24] << 24 | a.SBOX[u >>> 16 & 255] << 16 | a.SBOX[u >>> 8 & 255] << 8 | a.SBOX[255 & u], u ^= s[o / e | 0] << 24) : e > 6 && o % e == 4 && (u = a.SBOX[u >>> 24] << 24 | a.SBOX[u >>> 16 & 255] << 16 | a.SBOX[u >>> 8 & 255] << 8 | a.SBOX[255 & u]), i[o] = i[o - e] ^ u } for (var c = [], f = 0; f < r; f++) { var h = r - f, l = i[h - (f % 4 ? 0 : 4)]; c[f] = f < 4 || h <= 4 ? l : a.INV_SUB_MIX[0][a.SBOX[l >>> 24]] ^ a.INV_SUB_MIX[1][a.SBOX[l >>> 16 & 255]] ^ a.INV_SUB_MIX[2][a.SBOX[l >>> 8 & 255]] ^ a.INV_SUB_MIX[3][a.SBOX[255 & l]] } this._nRounds = n, this._keySchedule = i, this._invKeySchedule = c }, c.prototype.encryptBlockRaw = function (t) { return u(t = i(t), this._keySchedule, a.SUB_MIX, a.SBOX, this._nRounds) }, c.prototype.encryptBlock = function (t) { var e = this.encryptBlockRaw(t), n = r.allocUnsafe(16); return n.writeUInt32BE(e[0], 0), n.writeUInt32BE(e[1], 4), n.writeUInt32BE(e[2], 8), n.writeUInt32BE(e[3], 12), n }, c.prototype.decryptBlock = function (t) { var e = (t = i(t))[1]; t[1] = t[3], t[3] = e; var n = u(t, this._invKeySchedule, a.INV_SUB_MIX, a.INV_SBOX, this._nRounds), o = r.allocUnsafe(16); return o.writeUInt32BE(n[0], 0), o.writeUInt32BE(n[3], 4), o.writeUInt32BE(n[2], 8), o.writeUInt32BE(n[1], 12), o }, c.prototype.scrub = function () { o(this._keySchedule), o(this._invKeySchedule), o(this._key) }, t.exports.AES = c }, function (t, e, n) { "use strict"; const r = n(0).Buffer, { map: i, join: o, pipe: u, slice: s, curry: a, flip: c, dropLast: f, isEmpty: h, takeLast: l } = n(10), p = r.concat, d = r.from, y = t => Uint8Array.from(t), g = t => t.toString(2), v = u(y, i(t => ~t)), m = a((t, e, n) => n.map((n, r, i) => { if (r % e == 0) return t(n, r, i) }).filter((t, n) => n % e == 0)), w = (t, e, n) => { if (h(e) && h(n)) return t; const [r] = l(1, e), [i] = l(1, n); return t = t.replace(new RegExp(r, "g"), i), w(t, f(1, e), f(1, n)) }, b = a((t, e) => { var n = ""; for (let e = 0; e < t; e++)n += "0"; return n.slice(String(e).length) + e }), _ = u(Array.from, i(g), i(b(8)), o("")); t.exports = { toBuffer: d, byarr: y, compliment: v, byteToBin: _, nTobin: g, zeroPad: b, binToByte: t => { var e = []; for (let n = 0; n < t.length; n += 8)e.push(u(s(n, n + 8), c(parseInt)(2))(t)); return new Uint8Array(e) }, concatBuff: p, buffSlice: (t, e, n = t.length) => u(y, s(e, n), d)(t), stepMap: m, recursiveReplace: w } }, function (t, e, n) { "use strict"; var r, i = "object" == typeof Reflect ? Reflect : null, o = i && "function" == typeof i.apply ? i.apply : function (t, e, n) { return Function.prototype.apply.call(t, e, n) }; r = i && "function" == typeof i.ownKeys ? i.ownKeys : Object.getOwnPropertySymbols ? function (t) { return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t)) } : function (t) { return Object.getOwnPropertyNames(t) }; var u = Number.isNaN || function (t) { return t != t }; function s() { s.init.call(this) } t.exports = s, s.EventEmitter = s, s.prototype._events = void 0, s.prototype._eventsCount = 0, s.prototype._maxListeners = void 0; var a = 10; function c(t) { if ("function" != typeof t) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof t) } function f(t) { return void 0 === t._maxListeners ? s.defaultMaxListeners : t._maxListeners } function h(t, e, n, r) { var i, o, u, s; if (c(n), void 0 === (o = t._events) ? (o = t._events = Object.create(null), t._eventsCount = 0) : (void 0 !== o.newListener && (t.emit("newListener", e, n.listener ? n.listener : n), o = t._events), u = o[e]), void 0 === u) u = o[e] = n, ++t._eventsCount; else if ("function" == typeof u ? u = o[e] = r ? [n, u] : [u, n] : r ? u.unshift(n) : u.push(n), (i = f(t)) > 0 && u.length > i && !u.warned) { u.warned = !0; var a = new Error("Possible EventEmitter memory leak detected. " + u.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit"); a.name = "MaxListenersExceededWarning", a.emitter = t, a.type = e, a.count = u.length, s = a, console && console.warn && console.warn(s) } return t } function l() { if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments) } function p(t, e, n) { var r = { fired: !1, wrapFn: void 0, target: t, type: e, listener: n }, i = l.bind(r); return i.listener = n, r.wrapFn = i, i } function d(t, e, n) { var r = t._events; if (void 0 === r) return []; var i = r[e]; return void 0 === i ? [] : "function" == typeof i ? n ? [i.listener || i] : [i] : n ? function (t) { for (var e = new Array(t.length), n = 0; n < e.length; ++n)e[n] = t[n].listener || t[n]; return e }(i) : g(i, i.length) } function y(t) { var e = this._events; if (void 0 !== e) { var n = e[t]; if ("function" == typeof n) return 1; if (void 0 !== n) return n.length } return 0 } function g(t, e) { for (var n = new Array(e), r = 0; r < e; ++r)n[r] = t[r]; return n } Object.defineProperty(s, "defaultMaxListeners", { enumerable: !0, get: function () { return a }, set: function (t) { if ("number" != typeof t || t < 0 || u(t)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + t + "."); a = t } }), s.init = function () { void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0 }, s.prototype.setMaxListeners = function (t) { if ("number" != typeof t || t < 0 || u(t)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + t + "."); return this._maxListeners = t, this }, s.prototype.getMaxListeners = function () { return f(this) }, s.prototype.emit = function (t) { for (var e = [], n = 1; n < arguments.length; n++)e.push(arguments[n]); var r = "error" === t, i = this._events; if (void 0 !== i) r = r && void 0 === i.error; else if (!r) return !1; if (r) { var u; if (e.length > 0 && (u = e[0]), u instanceof Error) throw u; var s = new Error("Unhandled error." + (u ? " (" + u.message + ")" : "")); throw s.context = u, s } var a = i[t]; if (void 0 === a) return !1; if ("function" == typeof a) o(a, this, e); else { var c = a.length, f = g(a, c); for (n = 0; n < c; ++n)o(f[n], this, e) } return !0 }, s.prototype.addListener = function (t, e) { return h(this, t, e, !1) }, s.prototype.on = s.prototype.addListener, s.prototype.prependListener = function (t, e) { return h(this, t, e, !0) }, s.prototype.once = function (t, e) { return c(e), this.on(t, p(this, t, e)), this }, s.prototype.prependOnceListener = function (t, e) { return c(e), this.prependListener(t, p(this, t, e)), this }, s.prototype.removeListener = function (t, e) { var n, r, i, o, u; if (c(e), void 0 === (r = this._events)) return this; if (void 0 === (n = r[t])) return this; if (n === e || n.listener === e) 0 == --this._eventsCount ? this._events = Object.create(null) : (delete r[t], r.removeListener && this.emit("removeListener", t, n.listener || e)); else if ("function" != typeof n) { for (i = -1, o = n.length - 1; o >= 0; o--)if (n[o] === e || n[o].listener === e) { u = n[o].listener, i = o; break } if (i < 0) return this; 0 === i ? n.shift() : function (t, e) { for (; e + 1 < t.length; e++)t[e] = t[e + 1]; t.pop() }(n, i), 1 === n.length && (r[t] = n[0]), void 0 !== r.removeListener && this.emit("removeListener", t, u || e) } return this }, s.prototype.off = s.prototype.removeListener, s.prototype.removeAllListeners = function (t) { var e, n, r; if (void 0 === (n = this._events)) return this; if (void 0 === n.removeListener) return 0 === arguments.length ? (this._events = Object.create(null), this._eventsCount = 0) : void 0 !== n[t] && (0 == --this._eventsCount ? this._events = Object.create(null) : delete n[t]), this; if (0 === arguments.length) { var i, o = Object.keys(n); for (r = 0; r < o.length; ++r)"removeListener" !== (i = o[r]) && this.removeAllListeners(i); return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this } if ("function" == typeof (e = n[t])) this.removeListener(t, e); else if (void 0 !== e) for (r = e.length - 1; r >= 0; r--)this.removeListener(t, e[r]); return this }, s.prototype.listeners = function (t) { return d(this, t, !0) }, s.prototype.rawListeners = function (t) { return d(this, t, !1) }, s.listenerCount = function (t, e) { return "function" == typeof t.listenerCount ? t.listenerCount(e) : y.call(t, e) }, s.prototype.listenerCount = y, s.prototype.eventNames = function () { return this._eventsCount > 0 ? r(this._events) : [] } }, function (t, e, n) { (e = t.exports = n(25)).Stream = e, e.Readable = e, e.Writable = n(19), e.Duplex = n(6), e.Transform = n(29), e.PassThrough = n(59) }, function (t, e, n) { var r = n(2), i = r.Buffer; function o(t, e) { for (var n in t) e[n] = t[n] } function u(t, e, n) { return i(t, e, n) } i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = r : (o(r, e), e.Buffer = u), o(i, u), u.from = function (t, e, n) { if ("number" == typeof t) throw new TypeError("Argument must not be a number"); return i(t, e, n) }, u.alloc = function (t, e, n) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); var r = i(t); return void 0 !== e ? "string" == typeof n ? r.fill(e, n) : r.fill(e) : r.fill(0), r }, u.allocUnsafe = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return i(t) }, u.allocUnsafeSlow = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return r.SlowBuffer(t) } }, function (t, e, n) { "use strict"; (function (e, r, i) { var o = n(12); function u(t) { var e = this; this.next = null, this.entry = null, this.finish = function () { !function (t, e, n) { var r = t.entry; t.entry = null; for (; r;) { var i = r.callback; e.pendingcb--, i(n), r = r.next } e.corkedRequestsFree ? e.corkedRequestsFree.next = t : e.corkedRequestsFree = t }(e, t) } } t.exports = m; var s, a = !e.browser && ["v0.10", "v0.9."].indexOf(e.version.slice(0, 5)) > -1 ? r : o.nextTick; m.WritableState = v; var c = Object.create(n(8)); c.inherits = n(1); var f = { deprecate: n(57) }, h = n(26), l = n(18).Buffer, p = i.Uint8Array || function () { }; var d, y = n(27); function g() { } function v(t, e) { s = s || n(6), t = t || {}; var r = e instanceof s; this.objectMode = !!t.objectMode, r && (this.objectMode = this.objectMode || !!t.writableObjectMode); var i = t.highWaterMark, c = t.writableHighWaterMark, f = this.objectMode ? 16 : 16384; this.highWaterMark = i || 0 === i ? i : r && (c || 0 === c) ? c : f, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1; var h = !1 === t.decodeStrings; this.decodeStrings = !h, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function (t) { !function (t, e) { var n = t._writableState, r = n.sync, i = n.writecb; if (function (t) { t.writing = !1, t.writecb = null, t.length -= t.writelen, t.writelen = 0 }(n), e) !function (t, e, n, r, i) { --e.pendingcb, n ? (o.nextTick(i, r), o.nextTick(S, t, e), t._writableState.errorEmitted = !0, t.emit("error", r)) : (i(r), t._writableState.errorEmitted = !0, t.emit("error", r), S(t, e)) }(t, n, r, e, i); else { var u = E(n); u || n.corked || n.bufferProcessing || !n.bufferedRequest || _(t, n), r ? a(b, t, n, u, i) : b(t, n, u, i) } }(e, t) }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new u(this) } function m(t) { if (s = s || n(6), !(d.call(m, this) || this instanceof s)) return new m(t); this._writableState = new v(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev), "function" == typeof t.destroy && (this._destroy = t.destroy), "function" == typeof t.final && (this._final = t.final)), h.call(this) } function w(t, e, n, r, i, o, u) { e.writelen = r, e.writecb = u, e.writing = !0, e.sync = !0, n ? t._writev(i, e.onwrite) : t._write(i, o, e.onwrite), e.sync = !1 } function b(t, e, n, r) { n || function (t, e) { 0 === e.length && e.needDrain && (e.needDrain = !1, t.emit("drain")) }(t, e), e.pendingcb--, r(), S(t, e) } function _(t, e) { e.bufferProcessing = !0; var n = e.bufferedRequest; if (t._writev && n && n.next) { var r = e.bufferedRequestCount, i = new Array(r), o = e.corkedRequestsFree; o.entry = n; for (var s = 0, a = !0; n;)i[s] = n, n.isBuf || (a = !1), n = n.next, s += 1; i.allBuffers = a, w(t, e, !0, e.length, i, "", o.finish), e.pendingcb++, e.lastBufferedRequest = null, o.next ? (e.corkedRequestsFree = o.next, o.next = null) : e.corkedRequestsFree = new u(e), e.bufferedRequestCount = 0 } else { for (; n;) { var c = n.chunk, f = n.encoding, h = n.callback; if (w(t, e, !1, e.objectMode ? 1 : c.length, c, f, h), n = n.next, e.bufferedRequestCount--, e.writing) break } null === n && (e.lastBufferedRequest = null) } e.bufferedRequest = n, e.bufferProcessing = !1 } function E(t) { return t.ending && 0 === t.length && null === t.bufferedRequest && !t.finished && !t.writing } function B(t, e) { t._final((function (n) { e.pendingcb--, n && t.emit("error", n), e.prefinished = !0, t.emit("prefinish"), S(t, e) })) } function S(t, e) { var n = E(e); return n && (!function (t, e) { e.prefinished || e.finalCalled || ("function" == typeof t._final ? (e.pendingcb++, e.finalCalled = !0, o.nextTick(B, t, e)) : (e.prefinished = !0, t.emit("prefinish"))) }(t, e), 0 === e.pendingcb && (e.finished = !0, t.emit("finish"))), n } c.inherits(m, h), v.prototype.getBuffer = function () { for (var t = this.bufferedRequest, e = []; t;)e.push(t), t = t.next; return e }, function () { try { Object.defineProperty(v.prototype, "buffer", { get: f.deprecate((function () { return this.getBuffer() }), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003") }) } catch (t) { } }(), "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (d = Function.prototype[Symbol.hasInstance], Object.defineProperty(m, Symbol.hasInstance, { value: function (t) { return !!d.call(this, t) || this === m && (t && t._writableState instanceof v) } })) : d = function (t) { return t instanceof this }, m.prototype.pipe = function () { this.emit("error", new Error("Cannot pipe, not readable")) }, m.prototype.write = function (t, e, n) { var r, i = this._writableState, u = !1, s = !i.objectMode && (r = t, l.isBuffer(r) || r instanceof p); return s && !l.isBuffer(t) && (t = function (t) { return l.from(t) }(t)), "function" == typeof e && (n = e, e = null), s ? e = "buffer" : e || (e = i.defaultEncoding), "function" != typeof n && (n = g), i.ended ? function (t, e) { var n = new Error("write after end"); t.emit("error", n), o.nextTick(e, n) }(this, n) : (s || function (t, e, n, r) { var i = !0, u = !1; return null === n ? u = new TypeError("May not write null values to stream") : "string" == typeof n || void 0 === n || e.objectMode || (u = new TypeError("Invalid non-string/buffer chunk")), u && (t.emit("error", u), o.nextTick(r, u), i = !1), i }(this, i, t, n)) && (i.pendingcb++, u = function (t, e, n, r, i, o) { if (!n) { var u = function (t, e, n) { t.objectMode || !1 === t.decodeStrings || "string" != typeof e || (e = l.from(e, n)); return e }(e, r, i); r !== u && (n = !0, i = "buffer", r = u) } var s = e.objectMode ? 1 : r.length; e.length += s; var a = e.length < e.highWaterMark; a || (e.needDrain = !0); if (e.writing || e.corked) { var c = e.lastBufferedRequest; e.lastBufferedRequest = { chunk: r, encoding: i, isBuf: n, callback: o, next: null }, c ? c.next = e.lastBufferedRequest : e.bufferedRequest = e.lastBufferedRequest, e.bufferedRequestCount += 1 } else w(t, e, !1, s, r, i, o); return a }(this, i, s, t, e, n)), u }, m.prototype.cork = function () { this._writableState.corked++ }, m.prototype.uncork = function () { var t = this._writableState; t.corked && (t.corked--, t.writing || t.corked || t.finished || t.bufferProcessing || !t.bufferedRequest || _(this, t)) }, m.prototype.setDefaultEncoding = function (t) { if ("string" == typeof t && (t = t.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((t + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + t); return this._writableState.defaultEncoding = t, this }, Object.defineProperty(m.prototype, "writableHighWaterMark", { enumerable: !1, get: function () { return this._writableState.highWaterMark } }), m.prototype._write = function (t, e, n) { n(new Error("_write() is not implemented")) }, m.prototype._writev = null, m.prototype.end = function (t, e, n) { var r = this._writableState; "function" == typeof t ? (n = t, t = null, e = null) : "function" == typeof e && (n = e, e = null), null != t && this.write(t, e), r.corked && (r.corked = 1, this.uncork()), r.ending || r.finished || function (t, e, n) { e.ending = !0, S(t, e), n && (e.finished ? o.nextTick(n) : t.once("finish", n)); e.ended = !0, t.writable = !1 }(this, r, n) }, Object.defineProperty(m.prototype, "destroyed", { get: function () { return void 0 !== this._writableState && this._writableState.destroyed }, set: function (t) { this._writableState && (this._writableState.destroyed = t) } }), m.prototype.destroy = y.destroy, m.prototype._undestroy = y.undestroy, m.prototype._destroy = function (t, e) { this.end(), e(t) } }).call(this, n(4), n(28).setImmediate, n(3)) }, function (t, e, n) { "use strict"; var r = n(58).Buffer, i = r.isEncoding || function (t) { switch ((t = "" + t) && t.toLowerCase()) { case "hex": case "utf8": case "utf-8": case "ascii": case "binary": case "base64": case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": case "raw": return !0; default: return !1 } }; function o(t) { var e; switch (this.encoding = function (t) { var e = function (t) { if (!t) return "utf8"; for (var e; ;)switch (t) { case "utf8": case "utf-8": return "utf8"; case "ucs2": case "ucs-2": case "utf16le": case "utf-16le": return "utf16le"; case "latin1": case "binary": return "latin1"; case "base64": case "ascii": case "hex": return t; default: if (e) return; t = ("" + t).toLowerCase(), e = !0 } }(t); if ("string" != typeof e && (r.isEncoding === i || !i(t))) throw new Error("Unknown encoding: " + t); return e || t }(t), this.encoding) { case "utf16le": this.text = a, this.end = c, e = 4; break; case "utf8": this.fillLast = s, e = 4; break; case "base64": this.text = f, this.end = h, e = 3; break; default: return this.write = l, void (this.end = p) }this.lastNeed = 0, this.lastTotal = 0, this.lastChar = r.allocUnsafe(e) } function u(t) { return t <= 127 ? 0 : t >> 5 == 6 ? 2 : t >> 4 == 14 ? 3 : t >> 3 == 30 ? 4 : t >> 6 == 2 ? -1 : -2 } function s(t) { var e = this.lastTotal - this.lastNeed, n = function (t, e, n) { if (128 != (192 & e[0])) return t.lastNeed = 0, "�"; if (t.lastNeed > 1 && e.length > 1) { if (128 != (192 & e[1])) return t.lastNeed = 1, "�"; if (t.lastNeed > 2 && e.length > 2 && 128 != (192 & e[2])) return t.lastNeed = 2, "�" } }(this, t); return void 0 !== n ? n : this.lastNeed <= t.length ? (t.copy(this.lastChar, e, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (t.copy(this.lastChar, e, 0, t.length), void (this.lastNeed -= t.length)) } function a(t, e) { if ((t.length - e) % 2 == 0) { var n = t.toString("utf16le", e); if (n) { var r = n.charCodeAt(n.length - 1); if (r >= 55296 && r <= 56319) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = t[t.length - 2], this.lastChar[1] = t[t.length - 1], n.slice(0, -1) } return n } return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = t[t.length - 1], t.toString("utf16le", e, t.length - 1) } function c(t) { var e = t && t.length ? this.write(t) : ""; if (this.lastNeed) { var n = this.lastTotal - this.lastNeed; return e + this.lastChar.toString("utf16le", 0, n) } return e } function f(t, e) { var n = (t.length - e) % 3; return 0 === n ? t.toString("base64", e) : (this.lastNeed = 3 - n, this.lastTotal = 3, 1 === n ? this.lastChar[0] = t[t.length - 1] : (this.lastChar[0] = t[t.length - 2], this.lastChar[1] = t[t.length - 1]), t.toString("base64", e, t.length - n)) } function h(t) { var e = t && t.length ? this.write(t) : ""; return this.lastNeed ? e + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : e } function l(t) { return t.toString(this.encoding) } function p(t) { return t && t.length ? this.write(t) : "" } e.StringDecoder = o, o.prototype.write = function (t) { if (0 === t.length) return ""; var e, n; if (this.lastNeed) { if (void 0 === (e = this.fillLast(t))) return ""; n = this.lastNeed, this.lastNeed = 0 } else n = 0; return n < t.length ? e ? e + this.text(t, n) : this.text(t, n) : e || "" }, o.prototype.end = function (t) { var e = t && t.length ? this.write(t) : ""; return this.lastNeed ? e + "�" : e }, o.prototype.text = function (t, e) { var n = function (t, e, n) { var r = e.length - 1; if (r < n) return 0; var i = u(e[r]); if (i >= 0) return i > 0 && (t.lastNeed = i - 1), i; if (--r < n || -2 === i) return 0; if ((i = u(e[r])) >= 0) return i > 0 && (t.lastNeed = i - 2), i; if (--r < n || -2 === i) return 0; if ((i = u(e[r])) >= 0) return i > 0 && (2 === i ? i = 0 : t.lastNeed = i - 3), i; return 0 }(this, t, e); if (!this.lastNeed) return t.toString("utf8", e); this.lastTotal = n; var r = t.length - (n - this.lastNeed); return t.copy(this.lastChar, 0, r), t.toString("utf8", e, r) }, o.prototype.fillLast = function (t) { if (this.lastNeed <= t.length) return t.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal); t.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, t.length), this.lastNeed -= t.length } }, function (t, e, n) { "use strict"; var r = n(13); function i(t) { this.options = t, this.type = this.options.type, this.blockSize = 8, this._init(), this.buffer = new Array(this.blockSize), this.bufferOff = 0 } t.exports = i, i.prototype._init = function () { }, i.prototype.update = function (t) { return 0 === t.length ? [] : "decrypt" === this.type ? this._updateDecrypt(t) : this._updateEncrypt(t) }, i.prototype._buffer = function (t, e) { for (var n = Math.min(this.buffer.length - this.bufferOff, t.length - e), r = 0; r < n; r++)this.buffer[this.bufferOff + r] = t[e + r]; return this.bufferOff += n, n }, i.prototype._flushBuffer = function (t, e) { return this._update(this.buffer, 0, t, e), this.bufferOff = 0, this.blockSize }, i.prototype._updateEncrypt = function (t) { var e = 0, n = 0, r = (this.bufferOff + t.length) / this.blockSize | 0, i = new Array(r * this.blockSize); 0 !== this.bufferOff && (e += this._buffer(t, e), this.bufferOff === this.buffer.length && (n += this._flushBuffer(i, n))); for (var o = t.length - (t.length - e) % this.blockSize; e < o; e += this.blockSize)this._update(t, e, i, n), n += this.blockSize; for (; e < t.length; e++, this.bufferOff++)this.buffer[this.bufferOff] = t[e]; return i }, i.prototype._updateDecrypt = function (t) { for (var e = 0, n = 0, r = Math.ceil((this.bufferOff + t.length) / this.blockSize) - 1, i = new Array(r * this.blockSize); r > 0; r--)e += this._buffer(t, e), n += this._flushBuffer(i, n); return e += this._buffer(t, e), i }, i.prototype.final = function (t) { var e, n; return t && (e = this.update(t)), n = "encrypt" === this.type ? this._finalEncrypt() : this._finalDecrypt(), e ? e.concat(n) : n }, i.prototype._pad = function (t, e) { if (0 === e) return !1; for (; e < t.length;)t[e++] = 0; return !0 }, i.prototype._finalEncrypt = function () { if (!this._pad(this.buffer, this.bufferOff)) return []; var t = new Array(this.blockSize); return this._update(this.buffer, 0, t, 0), t }, i.prototype._unpad = function (t) { return t }, i.prototype._finalDecrypt = function () { r.equal(this.bufferOff, this.blockSize, "Not enough data to decrypt"); var t = new Array(this.blockSize); return this._flushBuffer(t, 0), this._unpad(t) } }, function (t, e, n) { var r = { ECB: n(69), CBC: n(70), CFB: n(71), CFB8: n(72), CFB1: n(73), OFB: n(74), CTR: n(32), GCM: n(32) }, i = n(34); for (var o in i) i[o].module = r[i[o].mode]; t.exports = i }, function (t, e, n) { var r = n(0).Buffer, i = n(37); t.exports = function (t, e, n, o) { if (r.isBuffer(t) || (t = r.from(t, "binary")), e && (r.isBuffer(e) || (e = r.from(e, "binary")), 8 !== e.length)) throw new RangeError("salt should be Buffer with 8 byte length"); for (var u = n / 8, s = r.alloc(u), a = r.alloc(o || 0), c = r.alloc(0); u > 0 || o > 0;) { var f = new i; f.update(c), f.update(t), e && f.update(e), c = f.digest(); var h = 0; if (u > 0) { var l = s.length - u; h = Math.min(u, c.length), c.copy(s, l, 0, h), u -= h } if (h < c.length && o > 0) { var p = a.length - o, d = Math.min(o, c.length - h); c.copy(a, p, h, h + d), o -= d } } return c.fill(0), { key: s, iv: a } } }, function (t, e) { var n = {}.toString; t.exports = Array.isArray || function (t) { return "[object Array]" == n.call(t) } }, function (t, e, n) { "use strict"; (function (e, r) { var i = n(12); t.exports = w; var o, u = n(24); w.ReadableState = m; n(16).EventEmitter; var s = function (t, e) { return t.listeners(e).length }, a = n(26), c = n(18).Buffer, f = e.Uint8Array || function () { }; var h = Object.create(n(8)); h.inherits = n(1); var l = n(53), p = void 0; p = l && l.debuglog ? l.debuglog("stream") : function () { }; var d, y = n(54), g = n(27); h.inherits(w, a); var v = ["error", "close", "destroy", "pause", "resume"]; function m(t, e) { t = t || {}; var r = e instanceof (o = o || n(6)); this.objectMode = !!t.objectMode, r && (this.objectMode = this.objectMode || !!t.readableObjectMode); var i = t.highWaterMark, u = t.readableHighWaterMark, s = this.objectMode ? 16 : 16384; this.highWaterMark = i || 0 === i ? i : r && (u || 0 === u) ? u : s, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new y, this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (d || (d = n(20).StringDecoder), this.decoder = new d(t.encoding), this.encoding = t.encoding) } function w(t) { if (o = o || n(6), !(this instanceof w)) return new w(t); this._readableState = new m(t, this), this.readable = !0, t && ("function" == typeof t.read && (this._read = t.read), "function" == typeof t.destroy && (this._destroy = t.destroy)), a.call(this) } function b(t, e, n, r, i) { var o, u = t._readableState; null === e ? (u.reading = !1, function (t, e) { if (e.ended) return; if (e.decoder) { var n = e.decoder.end(); n && n.length && (e.buffer.push(n), e.length += e.objectMode ? 1 : n.length) } e.ended = !0, B(t) }(t, u)) : (i || (o = function (t, e) { var n; r = e, c.isBuffer(r) || r instanceof f || "string" == typeof e || void 0 === e || t.objectMode || (n = new TypeError("Invalid non-string/buffer chunk")); var r; return n }(u, e)), o ? t.emit("error", o) : u.objectMode || e && e.length > 0 ? ("string" == typeof e || u.objectMode || Object.getPrototypeOf(e) === c.prototype || (e = function (t) { return c.from(t) }(e)), r ? u.endEmitted ? t.emit("error", new Error("stream.unshift() after end event")) : _(t, u, e, !0) : u.ended ? t.emit("error", new Error("stream.push() after EOF")) : (u.reading = !1, u.decoder && !n ? (e = u.decoder.write(e), u.objectMode || 0 !== e.length ? _(t, u, e, !1) : k(t, u)) : _(t, u, e, !1))) : r || (u.reading = !1)); return function (t) { return !t.ended && (t.needReadable || t.length < t.highWaterMark || 0 === t.length) }(u) } function _(t, e, n, r) { e.flowing && 0 === e.length && !e.sync ? (t.emit("data", n), t.read(0)) : (e.length += e.objectMode ? 1 : n.length, r ? e.buffer.unshift(n) : e.buffer.push(n), e.needReadable && B(t)), k(t, e) } Object.defineProperty(w.prototype, "destroyed", { get: function () { return void 0 !== this._readableState && this._readableState.destroyed }, set: function (t) { this._readableState && (this._readableState.destroyed = t) } }), w.prototype.destroy = g.destroy, w.prototype._undestroy = g.undestroy, w.prototype._destroy = function (t, e) { this.push(null), e(t) }, w.prototype.push = function (t, e) { var n, r = this._readableState; return r.objectMode ? n = !0 : "string" == typeof t && ((e = e || r.defaultEncoding) !== r.encoding && (t = c.from(t, e), e = ""), n = !0), b(this, t, e, !1, n) }, w.prototype.unshift = function (t) { return b(this, t, null, !0, !1) }, w.prototype.isPaused = function () { return !1 === this._readableState.flowing }, w.prototype.setEncoding = function (t) { return d || (d = n(20).StringDecoder), this._readableState.decoder = new d(t), this._readableState.encoding = t, this }; function E(t, e) { return t <= 0 || 0 === e.length && e.ended ? 0 : e.objectMode ? 1 : t != t ? e.flowing && e.length ? e.buffer.head.data.length : e.length : (t > e.highWaterMark && (e.highWaterMark = function (t) { return t >= 8388608 ? t = 8388608 : (t--, t |= t >>> 1, t |= t >>> 2, t |= t >>> 4, t |= t >>> 8, t |= t >>> 16, t++), t }(t)), t <= e.length ? t : e.ended ? e.length : (e.needReadable = !0, 0)) } function B(t) { var e = t._readableState; e.needReadable = !1, e.emittedReadable || (p("emitReadable", e.flowing), e.emittedReadable = !0, e.sync ? i.nextTick(S, t) : S(t)) } function S(t) { p("emit readable"), t.emit("readable"), x(t) } function k(t, e) { e.readingMore || (e.readingMore = !0, i.nextTick(A, t, e)) } function A(t, e) { for (var n = e.length; !e.reading && !e.flowing && !e.ended && e.length < e.highWaterMark && (p("maybeReadMore read 0"), t.read(0), n !== e.length);)n = e.length; e.readingMore = !1 } function T(t) { p("readable nexttick read 0"), t.read(0) } function C(t, e) { e.reading || (p("resume read 0"), t.read(0)), e.resumeScheduled = !1, e.awaitDrain = 0, t.emit("resume"), x(t), e.flowing && !e.reading && t.read(0) } function x(t) { var e = t._readableState; for (p("flow", e.flowing); e.flowing && null !== t.read();); } function I(t, e) { return 0 === e.length ? null : (e.objectMode ? n = e.buffer.shift() : !t || t >= e.length ? (n = e.decoder ? e.buffer.join("") : 1 === e.buffer.length ? e.buffer.head.data : e.buffer.concat(e.length), e.buffer.clear()) : n = function (t, e, n) { var r; t < e.head.data.length ? (r = e.head.data.slice(0, t), e.head.data = e.head.data.slice(t)) : r = t === e.head.data.length ? e.shift() : n ? function (t, e) { var n = e.head, r = 1, i = n.data; t -= i.length; for (; n = n.next;) { var o = n.data, u = t > o.length ? o.length : t; if (u === o.length ? i += o : i += o.slice(0, t), 0 === (t -= u)) { u === o.length ? (++r, n.next ? e.head = n.next : e.head = e.tail = null) : (e.head = n, n.data = o.slice(u)); break } ++r } return e.length -= r, i }(t, e) : function (t, e) { var n = c.allocUnsafe(t), r = e.head, i = 1; r.data.copy(n), t -= r.data.length; for (; r = r.next;) { var o = r.data, u = t > o.length ? o.length : t; if (o.copy(n, n.length - t, 0, u), 0 === (t -= u)) { u === o.length ? (++i, r.next ? e.head = r.next : e.head = e.tail = null) : (e.head = r, r.data = o.slice(u)); break } ++i } return e.length -= i, n }(t, e); return r }(t, e.buffer, e.decoder), n); var n } function U(t) { var e = t._readableState; if (e.length > 0) throw new Error('"endReadable()" called on non-empty stream'); e.endEmitted || (e.ended = !0, i.nextTick(O, e, t)) } function O(t, e) { t.endEmitted || 0 !== t.length || (t.endEmitted = !0, e.readable = !1, e.emit("end")) } function M(t, e) { for (var n = 0, r = t.length; n < r; n++)if (t[n] === e) return n; return -1 } w.prototype.read = function (t) { p("read", t), t = parseInt(t, 10); var e = this._readableState, n = t; if (0 !== t && (e.emittedReadable = !1), 0 === t && e.needReadable && (e.length >= e.highWaterMark || e.ended)) return p("read: emitReadable", e.length, e.ended), 0 === e.length && e.ended ? U(this) : B(this), null; if (0 === (t = E(t, e)) && e.ended) return 0 === e.length && U(this), null; var r, i = e.needReadable; return p("need readable", i), (0 === e.length || e.length - t < e.highWaterMark) && p("length less than watermark", i = !0), e.ended || e.reading ? p("reading or ended", i = !1) : i && (p("do read"), e.reading = !0, e.sync = !0, 0 === e.length && (e.needReadable = !0), this._read(e.highWaterMark), e.sync = !1, e.reading || (t = E(n, e))), null === (r = t > 0 ? I(t, e) : null) ? (e.needReadable = !0, t = 0) : e.length -= t, 0 === e.length && (e.ended || (e.needReadable = !0), n !== t && e.ended && U(this)), null !== r && this.emit("data", r), r }, w.prototype._read = function (t) { this.emit("error", new Error("_read() is not implemented")) }, w.prototype.pipe = function (t, e) { var n = this, o = this._readableState; switch (o.pipesCount) { case 0: o.pipes = t; break; case 1: o.pipes = [o.pipes, t]; break; default: o.pipes.push(t) }o.pipesCount += 1, p("pipe count=%d opts=%j", o.pipesCount, e); var a = (!e || !1 !== e.end) && t !== r.stdout && t !== r.stderr ? f : w; function c(e, r) { p("onunpipe"), e === n && r && !1 === r.hasUnpiped && (r.hasUnpiped = !0, p("cleanup"), t.removeListener("close", v), t.removeListener("finish", m), t.removeListener("drain", h), t.removeListener("error", g), t.removeListener("unpipe", c), n.removeListener("end", f), n.removeListener("end", w), n.removeListener("data", y), l = !0, !o.awaitDrain || t._writableState && !t._writableState.needDrain || h()) } function f() { p("onend"), t.end() } o.endEmitted ? i.nextTick(a) : n.once("end", a), t.on("unpipe", c); var h = function (t) { return function () { var e = t._readableState; p("pipeOnDrain", e.awaitDrain), e.awaitDrain && e.awaitDrain--, 0 === e.awaitDrain && s(t, "data") && (e.flowing = !0, x(t)) } }(n); t.on("drain", h); var l = !1; var d = !1; function y(e) { p("ondata"), d = !1, !1 !== t.write(e) || d || ((1 === o.pipesCount && o.pipes === t || o.pipesCount > 1 && -1 !== M(o.pipes, t)) && !l && (p("false write response, pause", n._readableState.awaitDrain), n._readableState.awaitDrain++, d = !0), n.pause()) } function g(e) { p("onerror", e), w(), t.removeListener("error", g), 0 === s(t, "error") && t.emit("error", e) } function v() { t.removeListener("finish", m), w() } function m() { p("onfinish"), t.removeListener("close", v), w() } function w() { p("unpipe"), n.unpipe(t) } return n.on("data", y), function (t, e, n) { if ("function" == typeof t.prependListener) return t.prependListener(e, n); t._events && t._events[e] ? u(t._events[e]) ? t._events[e].unshift(n) : t._events[e] = [n, t._events[e]] : t.on(e, n) }(t, "error", g), t.once("close", v), t.once("finish", m), t.emit("pipe", n), o.flowing || (p("pipe resume"), n.resume()), t }, w.prototype.unpipe = function (t) { var e = this._readableState, n = { hasUnpiped: !1 }; if (0 === e.pipesCount) return this; if (1 === e.pipesCount) return t && t !== e.pipes || (t || (t = e.pipes), e.pipes = null, e.pipesCount = 0, e.flowing = !1, t && t.emit("unpipe", this, n)), this; if (!t) { var r = e.pipes, i = e.pipesCount; e.pipes = null, e.pipesCount = 0, e.flowing = !1; for (var o = 0; o < i; o++)r[o].emit("unpipe", this, n); return this } var u = M(e.pipes, t); return -1 === u || (e.pipes.splice(u, 1), e.pipesCount -= 1, 1 === e.pipesCount && (e.pipes = e.pipes[0]), t.emit("unpipe", this, n)), this }, w.prototype.on = function (t, e) { var n = a.prototype.on.call(this, t, e); if ("data" === t) !1 !== this._readableState.flowing && this.resume(); else if ("readable" === t) { var r = this._readableState; r.endEmitted || r.readableListening || (r.readableListening = r.needReadable = !0, r.emittedReadable = !1, r.reading ? r.length && B(this) : i.nextTick(T, this)) } return n }, w.prototype.addListener = w.prototype.on, w.prototype.resume = function () { var t = this._readableState; return t.flowing || (p("resume"), t.flowing = !0, function (t, e) { e.resumeScheduled || (e.resumeScheduled = !0, i.nextTick(C, t, e)) }(this, t)), this }, w.prototype.pause = function () { return p("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (p("pause"), this._readableState.flowing = !1, this.emit("pause")), this }, w.prototype.wrap = function (t) { var e = this, n = this._readableState, r = !1; for (var i in t.on("end", (function () { if (p("wrapped end"), n.decoder && !n.ended) { var t = n.decoder.end(); t && t.length && e.push(t) } e.push(null) })), t.on("data", (function (i) { (p("wrapped data"), n.decoder && (i = n.decoder.write(i)), n.objectMode && null == i) || (n.objectMode || i && i.length) && (e.push(i) || (r = !0, t.pause())) })), t) void 0 === this[i] && "function" == typeof t[i] && (this[i] = function (e) { return function () { return t[e].apply(t, arguments) } }(i)); for (var o = 0; o < v.length; o++)t.on(v[o], this.emit.bind(this, v[o])); return this._read = function (e) { p("wrapped _read", e), r && (r = !1, t.resume()) }, this }, Object.defineProperty(w.prototype, "readableHighWaterMark", { enumerable: !1, get: function () { return this._readableState.highWaterMark } }), w._fromList = I }).call(this, n(3), n(4)) }, function (t, e, n) { t.exports = n(16).EventEmitter }, function (t, e, n) { "use strict"; var r = n(12); function i(t, e) { t.emit("error", e) } t.exports = { destroy: function (t, e) { var n = this, o = this._readableState && this._readableState.destroyed, u = this._writableState && this._writableState.destroyed; return o || u ? (e ? e(t) : !t || this._writableState && this._writableState.errorEmitted || r.nextTick(i, this, t), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(t || null, (function (t) { !e && t ? (r.nextTick(i, n, t), n._writableState && (n._writableState.errorEmitted = !0)) : e && e(t) })), this) }, undestroy: function () { this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1) } } }, function (t, e, n) { (function (t) { var r = void 0 !== t && t || "undefined" != typeof self && self || window, i = Function.prototype.apply; function o(t, e) { this._id = t, this._clearFn = e } e.setTimeout = function () { return new o(i.call(setTimeout, r, arguments), clearTimeout) }, e.setInterval = function () { return new o(i.call(setInterval, r, arguments), clearInterval) }, e.clearTimeout = e.clearInterval = function (t) { t && t.close() }, o.prototype.unref = o.prototype.ref = function () { }, o.prototype.close = function () { this._clearFn.call(r, this._id) }, e.enroll = function (t, e) { clearTimeout(t._idleTimeoutId), t._idleTimeout = e }, e.unenroll = function (t) { clearTimeout(t._idleTimeoutId), t._idleTimeout = -1 }, e._unrefActive = e.active = function (t) { clearTimeout(t._idleTimeoutId); var e = t._idleTimeout; e >= 0 && (t._idleTimeoutId = setTimeout((function () { t._onTimeout && t._onTimeout() }), e)) }, n(56), e.setImmediate = "undefined" != typeof self && self.setImmediate || void 0 !== t && t.setImmediate || this && this.setImmediate, e.clearImmediate = "undefined" != typeof self && self.clearImmediate || void 0 !== t && t.clearImmediate || this && this.clearImmediate }).call(this, n(3)) }, function (t, e, n) { "use strict"; t.exports = u; var r = n(6), i = Object.create(n(8)); function o(t, e) { var n = this._transformState; n.transforming = !1; var r = n.writecb; if (!r) return this.emit("error", new Error("write callback called multiple times")); n.writechunk = null, n.writecb = null, null != e && this.push(e), r(t); var i = this._readableState; i.reading = !1, (i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark) } function u(t) { if (!(this instanceof u)) return new u(t); r.call(this, t), this._transformState = { afterTransform: o.bind(this), needTransform: !1, transforming: !1, writecb: null, writechunk: null, writeencoding: null }, this._readableState.needReadable = !0, this._readableState.sync = !1, t && ("function" == typeof t.transform && (this._transform = t.transform), "function" == typeof t.flush && (this._flush = t.flush)), this.on("prefinish", s) } function s() { var t = this; "function" == typeof this._flush ? this._flush((function (e, n) { a(t, e, n) })) : a(this, null, null) } function a(t, e, n) { if (e) return t.emit("error", e); if (null != n && t.push(n), t._writableState.length) throw new Error("Calling transform done when ws.length != 0"); if (t._transformState.transforming) throw new Error("Calling transform done when still transforming"); return t.push(null) } i.inherits = n(1), i.inherits(u, r), u.prototype.push = function (t, e) { return this._transformState.needTransform = !1, r.prototype.push.call(this, t, e) }, u.prototype._transform = function (t, e, n) { throw new Error("_transform() is not implemented") }, u.prototype._write = function (t, e, n) { var r = this._transformState; if (r.writecb = n, r.writechunk = t, r.writeencoding = e, !r.transforming) { var i = this._readableState; (r.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark) } }, u.prototype._read = function (t) { var e = this._transformState; null !== e.writechunk && e.writecb && !e.transforming ? (e.transforming = !0, this._transform(e.writechunk, e.writeencoding, e.afterTransform)) : e.needTransform = !0 }, u.prototype._destroy = function (t, e) { var n = this; r.prototype._destroy.call(this, t, (function (t) { e(t), n.emit("close") })) } }, function (t, e, n) { "use strict"; e.readUInt32BE = function (t, e) { return (t[0 + e] << 24 | t[1 + e] << 16 | t[2 + e] << 8 | t[3 + e]) >>> 0 }, e.writeUInt32BE = function (t, e, n) { t[0 + n] = e >>> 24, t[1 + n] = e >>> 16 & 255, t[2 + n] = e >>> 8 & 255, t[3 + n] = 255 & e }, e.ip = function (t, e, n, r) { for (var i = 0, o = 0, u = 6; u >= 0; u -= 2) { for (var s = 0; s <= 24; s += 8)i <<= 1, i |= e >>> s + u & 1; for (s = 0; s <= 24; s += 8)i <<= 1, i |= t >>> s + u & 1 } for (u = 6; u >= 0; u -= 2) { for (s = 1; s <= 25; s += 8)o <<= 1, o |= e >>> s + u & 1; for (s = 1; s <= 25; s += 8)o <<= 1, o |= t >>> s + u & 1 } n[r + 0] = i >>> 0, n[r + 1] = o >>> 0 }, e.rip = function (t, e, n, r) { for (var i = 0, o = 0, u = 0; u < 4; u++)for (var s = 24; s >= 0; s -= 8)i <<= 1, i |= e >>> s + u & 1, i <<= 1, i |= t >>> s + u & 1; for (u = 4; u < 8; u++)for (s = 24; s >= 0; s -= 8)o <<= 1, o |= e >>> s + u & 1, o <<= 1, o |= t >>> s + u & 1; n[r + 0] = i >>> 0, n[r + 1] = o >>> 0 }, e.pc1 = function (t, e, n, r) { for (var i = 0, o = 0, u = 7; u >= 5; u--) { for (var s = 0; s <= 24; s += 8)i <<= 1, i |= e >> s + u & 1; for (s = 0; s <= 24; s += 8)i <<= 1, i |= t >> s + u & 1 } for (s = 0; s <= 24; s += 8)i <<= 1, i |= e >> s + u & 1; for (u = 1; u <= 3; u++) { for (s = 0; s <= 24; s += 8)o <<= 1, o |= e >> s + u & 1; for (s = 0; s <= 24; s += 8)o <<= 1, o |= t >> s + u & 1 } for (s = 0; s <= 24; s += 8)o <<= 1, o |= t >> s + u & 1; n[r + 0] = i >>> 0, n[r + 1] = o >>> 0 }, e.r28shl = function (t, e) { return t << e & 268435455 | t >>> 28 - e }; var r = [14, 11, 17, 4, 27, 23, 25, 0, 13, 22, 7, 18, 5, 9, 16, 24, 2, 20, 12, 21, 1, 8, 15, 26, 15, 4, 25, 19, 9, 1, 26, 16, 5, 11, 23, 8, 12, 7, 17, 0, 22, 3, 10, 14, 6, 20, 27, 24]; e.pc2 = function (t, e, n, i) { for (var o = 0, u = 0, s = r.length >>> 1, a = 0; a < s; a++)o <<= 1, o |= t >>> r[a] & 1; for (a = s; a < r.length; a++)u <<= 1, u |= e >>> r[a] & 1; n[i + 0] = o >>> 0, n[i + 1] = u >>> 0 }, e.expand = function (t, e, n) { var r = 0, i = 0; r = (1 & t) << 5 | t >>> 27; for (var o = 23; o >= 15; o -= 4)r <<= 6, r |= t >>> o & 63; for (o = 11; o >= 3; o -= 4)i |= t >>> o & 63, i <<= 6; i |= (31 & t) << 1 | t >>> 31, e[n + 0] = r >>> 0, e[n + 1] = i >>> 0 }; var i = [14, 0, 4, 15, 13, 7, 1, 4, 2, 14, 15, 2, 11, 13, 8, 1, 3, 10, 10, 6, 6, 12, 12, 11, 5, 9, 9, 5, 0, 3, 7, 8, 4, 15, 1, 12, 14, 8, 8, 2, 13, 4, 6, 9, 2, 1, 11, 7, 15, 5, 12, 11, 9, 3, 7, 14, 3, 10, 10, 0, 5, 6, 0, 13, 15, 3, 1, 13, 8, 4, 14, 7, 6, 15, 11, 2, 3, 8, 4, 14, 9, 12, 7, 0, 2, 1, 13, 10, 12, 6, 0, 9, 5, 11, 10, 5, 0, 13, 14, 8, 7, 10, 11, 1, 10, 3, 4, 15, 13, 4, 1, 2, 5, 11, 8, 6, 12, 7, 6, 12, 9, 0, 3, 5, 2, 14, 15, 9, 10, 13, 0, 7, 9, 0, 14, 9, 6, 3, 3, 4, 15, 6, 5, 10, 1, 2, 13, 8, 12, 5, 7, 14, 11, 12, 4, 11, 2, 15, 8, 1, 13, 1, 6, 10, 4, 13, 9, 0, 8, 6, 15, 9, 3, 8, 0, 7, 11, 4, 1, 15, 2, 14, 12, 3, 5, 11, 10, 5, 14, 2, 7, 12, 7, 13, 13, 8, 14, 11, 3, 5, 0, 6, 6, 15, 9, 0, 10, 3, 1, 4, 2, 7, 8, 2, 5, 12, 11, 1, 12, 10, 4, 14, 15, 9, 10, 3, 6, 15, 9, 0, 0, 6, 12, 10, 11, 1, 7, 13, 13, 8, 15, 9, 1, 4, 3, 5, 14, 11, 5, 12, 2, 7, 8, 2, 4, 14, 2, 14, 12, 11, 4, 2, 1, 12, 7, 4, 10, 7, 11, 13, 6, 1, 8, 5, 5, 0, 3, 15, 15, 10, 13, 3, 0, 9, 14, 8, 9, 6, 4, 11, 2, 8, 1, 12, 11, 7, 10, 1, 13, 14, 7, 2, 8, 13, 15, 6, 9, 15, 12, 0, 5, 9, 6, 10, 3, 4, 0, 5, 14, 3, 12, 10, 1, 15, 10, 4, 15, 2, 9, 7, 2, 12, 6, 9, 8, 5, 0, 6, 13, 1, 3, 13, 4, 14, 14, 0, 7, 11, 5, 3, 11, 8, 9, 4, 14, 3, 15, 2, 5, 12, 2, 9, 8, 5, 12, 15, 3, 10, 7, 11, 0, 14, 4, 1, 10, 7, 1, 6, 13, 0, 11, 8, 6, 13, 4, 13, 11, 0, 2, 11, 14, 7, 15, 4, 0, 9, 8, 1, 13, 10, 3, 14, 12, 3, 9, 5, 7, 12, 5, 2, 10, 15, 6, 8, 1, 6, 1, 6, 4, 11, 11, 13, 13, 8, 12, 1, 3, 4, 7, 10, 14, 7, 10, 9, 15, 5, 6, 0, 8, 15, 0, 14, 5, 2, 9, 3, 2, 12, 13, 1, 2, 15, 8, 13, 4, 8, 6, 10, 15, 3, 11, 7, 1, 4, 10, 12, 9, 5, 3, 6, 14, 11, 5, 0, 0, 14, 12, 9, 7, 2, 7, 2, 11, 1, 4, 14, 1, 7, 9, 4, 12, 10, 14, 8, 2, 13, 0, 15, 6, 12, 10, 9, 13, 0, 15, 3, 3, 5, 5, 6, 8, 11]; e.substitute = function (t, e) { for (var n = 0, r = 0; r < 4; r++) { n <<= 4, n |= i[64 * r + (t >>> 18 - 6 * r & 63)] } for (r = 0; r < 4; r++) { n <<= 4, n |= i[256 + 64 * r + (e >>> 18 - 6 * r & 63)] } return n >>> 0 }; var o = [16, 25, 12, 11, 3, 20, 4, 15, 31, 17, 9, 6, 27, 14, 1, 22, 30, 24, 8, 18, 0, 5, 29, 23, 13, 19, 2, 26, 10, 21, 28, 7]; e.permute = function (t) { for (var e = 0, n = 0; n < o.length; n++)e <<= 1, e |= t >>> o[n] & 1; return e >>> 0 }, e.padSplit = function (t, e, n) { for (var r = t.toString(2); r.length < e;)r = "0" + r; for (var i = [], o = 0; o < e; o += n)i.push(r.slice(o, o + n)); return i.join(" ") } }, function (t, e, n) { "use strict"; var r = n(13), i = n(1), o = n(30), u = n(21); function s() { this.tmp = new Array(2), this.keys = null } function a(t) { u.call(this, t); var e = new s; this._desState = e, this.deriveKeys(e, t.key) } i(a, u), t.exports = a, a.create = function (t) { return new a(t) }; var c = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]; a.prototype.deriveKeys = function (t, e) { t.keys = new Array(32), r.equal(e.length, this.blockSize, "Invalid key length"); var n = o.readUInt32BE(e, 0), i = o.readUInt32BE(e, 4); o.pc1(n, i, t.tmp, 0), n = t.tmp[0], i = t.tmp[1]; for (var u = 0; u < t.keys.length; u += 2) { var s = c[u >>> 1]; n = o.r28shl(n, s), i = o.r28shl(i, s), o.pc2(n, i, t.keys, u) } }, a.prototype._update = function (t, e, n, r) { var i = this._desState, u = o.readUInt32BE(t, e), s = o.readUInt32BE(t, e + 4); o.ip(u, s, i.tmp, 0), u = i.tmp[0], s = i.tmp[1], "encrypt" === this.type ? this._encrypt(i, u, s, i.tmp, 0) : this._decrypt(i, u, s, i.tmp, 0), u = i.tmp[0], s = i.tmp[1], o.writeUInt32BE(n, u, r), o.writeUInt32BE(n, s, r + 4) }, a.prototype._pad = function (t, e) { for (var n = t.length - e, r = e; r < t.length; r++)t[r] = n; return !0 }, a.prototype._unpad = function (t) { for (var e = t[t.length - 1], n = t.length - e; n < t.length; n++)r.equal(t[n], e); return t.slice(0, t.length - e) }, a.prototype._encrypt = function (t, e, n, r, i) { for (var u = e, s = n, a = 0; a < t.keys.length; a += 2) { var c = t.keys[a], f = t.keys[a + 1]; o.expand(s, t.tmp, 0), c ^= t.tmp[0], f ^= t.tmp[1]; var h = o.substitute(c, f), l = s; s = (u ^ o.permute(h)) >>> 0, u = l } o.rip(s, u, r, i) }, a.prototype._decrypt = function (t, e, n, r, i) { for (var u = n, s = e, a = t.keys.length - 2; a >= 0; a -= 2) { var c = t.keys[a], f = t.keys[a + 1]; o.expand(u, t.tmp, 0), c ^= t.tmp[0], f ^= t.tmp[1]; var h = o.substitute(c, f), l = u; u = (s ^ o.permute(h)) >>> 0, s = l } o.rip(u, s, r, i) } }, function (t, e, n) { var r = n(9), i = n(0).Buffer, o = n(33); function u(t) { var e = t._cipher.encryptBlockRaw(t._prev); return o(t._prev), e } e.encrypt = function (t, e) { var n = Math.ceil(e.length / 16), o = t._cache.length; t._cache = i.concat([t._cache, i.allocUnsafe(16 * n)]); for (var s = 0; s < n; s++) { var a = u(t), c = o + 16 * s; t._cache.writeUInt32BE(a[0], c + 0), t._cache.writeUInt32BE(a[1], c + 4), t._cache.writeUInt32BE(a[2], c + 8), t._cache.writeUInt32BE(a[3], c + 12) } var f = t._cache.slice(0, e.length); return t._cache = t._cache.slice(e.length), r(e, f) } }, function (t, e) { t.exports = function (t) { for (var e, n = t.length; n--;) { if (255 !== (e = t.readUInt8(n))) { e++, t.writeUInt8(e, n); break } t.writeUInt8(0, n) } } }, function (t) { t.exports = JSON.parse('{"aes-128-ecb":{"cipher":"AES","key":128,"iv":0,"mode":"ECB","type":"block"},"aes-192-ecb":{"cipher":"AES","key":192,"iv":0,"mode":"ECB","type":"block"},"aes-256-ecb":{"cipher":"AES","key":256,"iv":0,"mode":"ECB","type":"block"},"aes-128-cbc":{"cipher":"AES","key":128,"iv":16,"mode":"CBC","type":"block"},"aes-192-cbc":{"cipher":"AES","key":192,"iv":16,"mode":"CBC","type":"block"},"aes-256-cbc":{"cipher":"AES","key":256,"iv":16,"mode":"CBC","type":"block"},"aes128":{"cipher":"AES","key":128,"iv":16,"mode":"CBC","type":"block"},"aes192":{"cipher":"AES","key":192,"iv":16,"mode":"CBC","type":"block"},"aes256":{"cipher":"AES","key":256,"iv":16,"mode":"CBC","type":"block"},"aes-128-cfb":{"cipher":"AES","key":128,"iv":16,"mode":"CFB","type":"stream"},"aes-192-cfb":{"cipher":"AES","key":192,"iv":16,"mode":"CFB","type":"stream"},"aes-256-cfb":{"cipher":"AES","key":256,"iv":16,"mode":"CFB","type":"stream"},"aes-128-cfb8":{"cipher":"AES","key":128,"iv":16,"mode":"CFB8","type":"stream"},"aes-192-cfb8":{"cipher":"AES","key":192,"iv":16,"mode":"CFB8","type":"stream"},"aes-256-cfb8":{"cipher":"AES","key":256,"iv":16,"mode":"CFB8","type":"stream"},"aes-128-cfb1":{"cipher":"AES","key":128,"iv":16,"mode":"CFB1","type":"stream"},"aes-192-cfb1":{"cipher":"AES","key":192,"iv":16,"mode":"CFB1","type":"stream"},"aes-256-cfb1":{"cipher":"AES","key":256,"iv":16,"mode":"CFB1","type":"stream"},"aes-128-ofb":{"cipher":"AES","key":128,"iv":16,"mode":"OFB","type":"stream"},"aes-192-ofb":{"cipher":"AES","key":192,"iv":16,"mode":"OFB","type":"stream"},"aes-256-ofb":{"cipher":"AES","key":256,"iv":16,"mode":"OFB","type":"stream"},"aes-128-ctr":{"cipher":"AES","key":128,"iv":16,"mode":"CTR","type":"stream"},"aes-192-ctr":{"cipher":"AES","key":192,"iv":16,"mode":"CTR","type":"stream"},"aes-256-ctr":{"cipher":"AES","key":256,"iv":16,"mode":"CTR","type":"stream"},"aes-128-gcm":{"cipher":"AES","key":128,"iv":12,"mode":"GCM","type":"auth"},"aes-192-gcm":{"cipher":"AES","key":192,"iv":12,"mode":"GCM","type":"auth"},"aes-256-gcm":{"cipher":"AES","key":256,"iv":12,"mode":"GCM","type":"auth"}}') }, function (t, e, n) { var r = n(14), i = n(0).Buffer, o = n(5), u = n(1), s = n(75), a = n(9), c = n(33); function f(t, e, n, u) { o.call(this); var a = i.alloc(4, 0); this._cipher = new r.AES(e); var f = this._cipher.encryptBlock(a); this._ghash = new s(f), n = function (t, e, n) { if (12 === e.length) return t._finID = i.concat([e, i.from([0, 0, 0, 1])]), i.concat([e, i.from([0, 0, 0, 2])]); var r = new s(n), o = e.length, u = o % 16; r.update(e), u && (u = 16 - u, r.update(i.alloc(u, 0))), r.update(i.alloc(8, 0)); var a = 8 * o, f = i.alloc(8); f.writeUIntBE(a, 0, 8), r.update(f), t._finID = r.state; var h = i.from(t._finID); return c(h), h }(this, n, f), this._prev = i.from(n), this._cache = i.allocUnsafe(0), this._secCache = i.allocUnsafe(0), this._decrypt = u, this._alen = 0, this._len = 0, this._mode = t, this._authTag = null, this._called = !1 } u(f, o), f.prototype._update = function (t) { if (!this._called && this._alen) { var e = 16 - this._alen % 16; e < 16 && (e = i.alloc(e, 0), this._ghash.update(e)) } this._called = !0; var n = this._mode.encrypt(this, t); return this._decrypt ? this._ghash.update(t) : this._ghash.update(n), this._len += t.length, n }, f.prototype._final = function () { if (this._decrypt && !this._authTag) throw new Error("Unsupported state or unable to authenticate data"); var t = a(this._ghash.final(8 * this._alen, 8 * this._len), this._cipher.encryptBlock(this._finID)); if (this._decrypt && function (t, e) { var n = 0; t.length !== e.length && n++; for (var r = Math.min(t.length, e.length), i = 0; i < r; ++i)n += t[i] ^ e[i]; return n }(t, this._authTag)) throw new Error("Unsupported state or unable to authenticate data"); this._authTag = t, this._cipher.scrub() }, f.prototype.getAuthTag = function () { if (this._decrypt || !i.isBuffer(this._authTag)) throw new Error("Attempting to get auth tag in unsupported state"); return this._authTag }, f.prototype.setAuthTag = function (t) { if (!this._decrypt) throw new Error("Attempting to set auth tag in unsupported state"); this._authTag = t }, f.prototype.setAAD = function (t) { if (this._called) throw new Error("Attempting to set AAD in unsupported state"); this._ghash.update(t), this._alen += t.length }, t.exports = f }, function (t, e, n) { var r = n(14), i = n(0).Buffer, o = n(5); function u(t, e, n, u) { o.call(this), this._cipher = new r.AES(e), this._prev = i.from(n), this._cache = i.allocUnsafe(0), this._secCache = i.allocUnsafe(0), this._decrypt = u, this._mode = t } n(1)(u, o), u.prototype._update = function (t) { return this._mode.encrypt(this, t, this._decrypt) }, u.prototype._final = function () { this._cipher.scrub() }, t.exports = u }, function (t, e, n) { "use strict"; var r = n(1), i = n(38), o = n(0).Buffer, u = new Array(16); function s() { i.call(this, 64), this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878 } function a(t, e) { return t << e | t >>> 32 - e } function c(t, e, n, r, i, o, u) { return a(t + (e & n | ~e & r) + i + o | 0, u) + e | 0 } function f(t, e, n, r, i, o, u) { return a(t + (e & r | n & ~r) + i + o | 0, u) + e | 0 } function h(t, e, n, r, i, o, u) { return a(t + (e ^ n ^ r) + i + o | 0, u) + e | 0 } function l(t, e, n, r, i, o, u) { return a(t + (n ^ (e | ~r)) + i + o | 0, u) + e | 0 } r(s, i), s.prototype._update = function () { for (var t = u, e = 0; e < 16; ++e)t[e] = this._block.readInt32LE(4 * e); var n = this._a, r = this._b, i = this._c, o = this._d; n = c(n, r, i, o, t[0], 3614090360, 7), o = c(o, n, r, i, t[1], 3905402710, 12), i = c(i, o, n, r, t[2], 606105819, 17), r = c(r, i, o, n, t[3], 3250441966, 22), n = c(n, r, i, o, t[4], 4118548399, 7), o = c(o, n, r, i, t[5], 1200080426, 12), i = c(i, o, n, r, t[6], 2821735955, 17), r = c(r, i, o, n, t[7], 4249261313, 22), n = c(n, r, i, o, t[8], 1770035416, 7), o = c(o, n, r, i, t[9], 2336552879, 12), i = c(i, o, n, r, t[10], 4294925233, 17), r = c(r, i, o, n, t[11], 2304563134, 22), n = c(n, r, i, o, t[12], 1804603682, 7), o = c(o, n, r, i, t[13], 4254626195, 12), i = c(i, o, n, r, t[14], 2792965006, 17), n = f(n, r = c(r, i, o, n, t[15], 1236535329, 22), i, o, t[1], 4129170786, 5), o = f(o, n, r, i, t[6], 3225465664, 9), i = f(i, o, n, r, t[11], 643717713, 14), r = f(r, i, o, n, t[0], 3921069994, 20), n = f(n, r, i, o, t[5], 3593408605, 5), o = f(o, n, r, i, t[10], 38016083, 9), i = f(i, o, n, r, t[15], 3634488961, 14), r = f(r, i, o, n, t[4], 3889429448, 20), n = f(n, r, i, o, t[9], 568446438, 5), o = f(o, n, r, i, t[14], 3275163606, 9), i = f(i, o, n, r, t[3], 4107603335, 14), r = f(r, i, o, n, t[8], 1163531501, 20), n = f(n, r, i, o, t[13], 2850285829, 5), o = f(o, n, r, i, t[2], 4243563512, 9), i = f(i, o, n, r, t[7], 1735328473, 14), n = h(n, r = f(r, i, o, n, t[12], 2368359562, 20), i, o, t[5], 4294588738, 4), o = h(o, n, r, i, t[8], 2272392833, 11), i = h(i, o, n, r, t[11], 1839030562, 16), r = h(r, i, o, n, t[14], 4259657740, 23), n = h(n, r, i, o, t[1], 2763975236, 4), o = h(o, n, r, i, t[4], 1272893353, 11), i = h(i, o, n, r, t[7], 4139469664, 16), r = h(r, i, o, n, t[10], 3200236656, 23), n = h(n, r, i, o, t[13], 681279174, 4), o = h(o, n, r, i, t[0], 3936430074, 11), i = h(i, o, n, r, t[3], 3572445317, 16), r = h(r, i, o, n, t[6], 76029189, 23), n = h(n, r, i, o, t[9], 3654602809, 4), o = h(o, n, r, i, t[12], 3873151461, 11), i = h(i, o, n, r, t[15], 530742520, 16), n = l(n, r = h(r, i, o, n, t[2], 3299628645, 23), i, o, t[0], 4096336452, 6), o = l(o, n, r, i, t[7], 1126891415, 10), i = l(i, o, n, r, t[14], 2878612391, 15), r = l(r, i, o, n, t[5], 4237533241, 21), n = l(n, r, i, o, t[12], 1700485571, 6), o = l(o, n, r, i, t[3], 2399980690, 10), i = l(i, o, n, r, t[10], 4293915773, 15), r = l(r, i, o, n, t[1], 2240044497, 21), n = l(n, r, i, o, t[8], 1873313359, 6), o = l(o, n, r, i, t[15], 4264355552, 10), i = l(i, o, n, r, t[6], 2734768916, 15), r = l(r, i, o, n, t[13], 1309151649, 21), n = l(n, r, i, o, t[4], 4149444226, 6), o = l(o, n, r, i, t[11], 3174756917, 10), i = l(i, o, n, r, t[2], 718787259, 15), r = l(r, i, o, n, t[9], 3951481745, 21), this._a = this._a + n | 0, this._b = this._b + r | 0, this._c = this._c + i | 0, this._d = this._d + o | 0 }, s.prototype._digest = function () { this._block[this._blockOffset++] = 128, this._blockOffset > 56 && (this._block.fill(0, this._blockOffset, 64), this._update(), this._blockOffset = 0), this._block.fill(0, this._blockOffset, 56), this._block.writeUInt32LE(this._length[0], 56), this._block.writeUInt32LE(this._length[1], 60), this._update(); var t = o.allocUnsafe(16); return t.writeInt32LE(this._a, 0), t.writeInt32LE(this._b, 4), t.writeInt32LE(this._c, 8), t.writeInt32LE(this._d, 12), t }, t.exports = s }, function (t, e, n) { "use strict"; var r = n(0).Buffer, i = n(11).Transform; function o(t) { i.call(this), this._block = r.allocUnsafe(t), this._blockSize = t, this._blockOffset = 0, this._length = [0, 0, 0, 0], this._finalized = !1 } n(1)(o, i), o.prototype._transform = function (t, e, n) { var r = null; try { this.update(t, e) } catch (t) { r = t } n(r) }, o.prototype._flush = function (t) { var e = null; try { this.push(this.digest()) } catch (t) { e = t } t(e) }, o.prototype.update = function (t, e) { if (function (t, e) { if (!r.isBuffer(t) && "string" != typeof t) throw new TypeError(e + " must be a string or a buffer") }(t, "Data"), this._finalized) throw new Error("Digest already called"); r.isBuffer(t) || (t = r.from(t, e)); for (var n = this._block, i = 0; this._blockOffset + t.length - i >= this._blockSize;) { for (var o = this._blockOffset; o < this._blockSize;)n[o++] = t[i++]; this._update(), this._blockOffset = 0 } for (; i < t.length;)n[this._blockOffset++] = t[i++]; for (var u = 0, s = 8 * t.length; s > 0; ++u)this._length[u] += s, (s = this._length[u] / 4294967296 | 0) > 0 && (this._length[u] -= 4294967296 * s); return this }, o.prototype._update = function () { throw new Error("_update is not implemented") }, o.prototype.digest = function (t) { if (this._finalized) throw new Error("Digest already called"); this._finalized = !0; var e = this._digest(); void 0 !== t && (e = e.toString(t)), this._block.fill(0), this._blockOffset = 0; for (var n = 0; n < 4; ++n)this._length[n] = 0; return e }, o.prototype._digest = function () { throw new Error("_digest is not implemented") }, t.exports = o }, function (t, e, n) { (function (e) { var n = Math.pow(2, 30) - 1; function r(t, n) { if ("string" != typeof t && !e.isBuffer(t)) throw new TypeError(n + " must be a buffer or string") } t.exports = function (t, e, i, o) { if (r(t, "Password"), r(e, "Salt"), "number" != typeof i) throw new TypeError("Iterations not a number"); if (i < 0) throw new TypeError("Bad iterations"); if ("number" != typeof o) throw new TypeError("Key length not a number"); if (o < 0 || o > n || o != o) throw new TypeError("Bad key length") } }).call(this, n(2).Buffer) }, function (t, e, n) { (function (e) { var n; e.browser ? n = "utf-8" : n = parseInt(e.version.split(".")[0].slice(1), 10) >= 6 ? "utf-8" : "binary"; t.exports = n }).call(this, n(4)) }, function (t, e, n) { var r = n(42), i = n(43), o = n(44), u = n(39), s = n(40), a = n(0).Buffer, c = a.alloc(128), f = { md5: 16, sha1: 20, sha224: 28, sha256: 32, sha384: 48, sha512: 64, rmd160: 20, ripemd160: 20 }; function h(t, e, n) { var u = function (t) { function e(e) { return o(t).update(e).digest() } return "rmd160" === t || "ripemd160" === t ? function (t) { return (new i).update(t).digest() } : "md5" === t ? r : e }(t), s = "sha512" === t || "sha384" === t ? 128 : 64; e.length > s ? e = u(e) : e.length < s && (e = a.concat([e, c], s)); for (var h = a.allocUnsafe(s + f[t]), l = a.allocUnsafe(s + f[t]), p = 0; p < s; p++)h[p] = 54 ^ e[p], l[p] = 92 ^ e[p]; var d = a.allocUnsafe(s + n + 4); h.copy(d, 0, 0, s), this.ipad1 = d, this.ipad2 = h, this.opad = l, this.alg = t, this.blocksize = s, this.hash = u, this.size = f[t] } h.prototype.run = function (t, e) { return t.copy(e, this.blocksize), this.hash(e).copy(this.opad, this.blocksize), this.hash(this.opad) }, t.exports = function (t, e, n, r, i) { u(t, e, n, r), a.isBuffer(t) || (t = a.from(t, s)), a.isBuffer(e) || (e = a.from(e, s)); var o = new h(i = i || "sha1", t, e.length), c = a.allocUnsafe(r), l = a.allocUnsafe(e.length + 4); e.copy(l, 0, 0, e.length); for (var p = 0, d = f[i], y = Math.ceil(r / d), g = 1; g <= y; g++) { l.writeUInt32BE(g, e.length); for (var v = o.run(l, o.ipad1), m = v, w = 1; w < n; w++) { m = o.run(m, o.ipad2); for (var b = 0; b < d; b++)v[b] ^= m[b] } v.copy(c, p), p += d } return c } }, function (t, e, n) { var r = n(37); t.exports = function (t) { return (new r).update(t).digest() } }, function (t, e, n) { "use strict"; var r = n(2).Buffer, i = n(1), o = n(38), u = new Array(16), s = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13], a = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11], c = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6], f = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11], h = [0, 1518500249, 1859775393, 2400959708, 2840853838], l = [1352829926, 1548603684, 1836072691, 2053994217, 0]; function p() { o.call(this, 64), this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520 } function d(t, e) { return t << e | t >>> 32 - e } function y(t, e, n, r, i, o, u, s) { return d(t + (e ^ n ^ r) + o + u | 0, s) + i | 0 } function g(t, e, n, r, i, o, u, s) { return d(t + (e & n | ~e & r) + o + u | 0, s) + i | 0 } function v(t, e, n, r, i, o, u, s) { return d(t + ((e | ~n) ^ r) + o + u | 0, s) + i | 0 } function m(t, e, n, r, i, o, u, s) { return d(t + (e & r | n & ~r) + o + u | 0, s) + i | 0 } function w(t, e, n, r, i, o, u, s) { return d(t + (e ^ (n | ~r)) + o + u | 0, s) + i | 0 } i(p, o), p.prototype._update = function () { for (var t = u, e = 0; e < 16; ++e)t[e] = this._block.readInt32LE(4 * e); for (var n = 0 | this._a, r = 0 | this._b, i = 0 | this._c, o = 0 | this._d, p = 0 | this._e, b = 0 | this._a, _ = 0 | this._b, E = 0 | this._c, B = 0 | this._d, S = 0 | this._e, k = 0; k < 80; k += 1) { var A, T; k < 16 ? (A = y(n, r, i, o, p, t[s[k]], h[0], c[k]), T = w(b, _, E, B, S, t[a[k]], l[0], f[k])) : k < 32 ? (A = g(n, r, i, o, p, t[s[k]], h[1], c[k]), T = m(b, _, E, B, S, t[a[k]], l[1], f[k])) : k < 48 ? (A = v(n, r, i, o, p, t[s[k]], h[2], c[k]), T = v(b, _, E, B, S, t[a[k]], l[2], f[k])) : k < 64 ? (A = m(n, r, i, o, p, t[s[k]], h[3], c[k]), T = g(b, _, E, B, S, t[a[k]], l[3], f[k])) : (A = w(n, r, i, o, p, t[s[k]], h[4], c[k]), T = y(b, _, E, B, S, t[a[k]], l[4], f[k])), n = p, p = o, o = d(i, 10), i = r, r = A, b = S, S = B, B = d(E, 10), E = _, _ = T } var C = this._b + i + B | 0; this._b = this._c + o + S | 0, this._c = this._d + p + b | 0, this._d = this._e + n + _ | 0, this._e = this._a + r + E | 0, this._a = C }, p.prototype._digest = function () { this._block[this._blockOffset++] = 128, this._blockOffset > 56 && (this._block.fill(0, this._blockOffset, 64), this._update(), this._blockOffset = 0), this._block.fill(0, this._blockOffset, 56), this._block.writeUInt32LE(this._length[0], 56), this._block.writeUInt32LE(this._length[1], 60), this._update(); var t = r.alloc ? r.alloc(20) : new r(20); return t.writeInt32LE(this._a, 0), t.writeInt32LE(this._b, 4), t.writeInt32LE(this._c, 8), t.writeInt32LE(this._d, 12), t.writeInt32LE(this._e, 16), t }, t.exports = p }, function (t, e, n) { (e = t.exports = function (t) { t = t.toLowerCase(); var n = e[t]; if (!n) throw new Error(t + " is not supported (we accept pull requests)"); return new n }).sha = n(81), e.sha1 = n(82), e.sha224 = n(83), e.sha256 = n(45), e.sha384 = n(84), e.sha512 = n(46) }, function (t, e, n) { var r = n(1), i = n(7), o = n(0).Buffer, u = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], s = new Array(64); function a() { this.init(), this._w = s, i.call(this, 64, 56) } function c(t, e, n) { return n ^ t & (e ^ n) } function f(t, e, n) { return t & e | n & (t | e) } function h(t) { return (t >>> 2 | t << 30) ^ (t >>> 13 | t << 19) ^ (t >>> 22 | t << 10) } function l(t) { return (t >>> 6 | t << 26) ^ (t >>> 11 | t << 21) ^ (t >>> 25 | t << 7) } function p(t) { return (t >>> 7 | t << 25) ^ (t >>> 18 | t << 14) ^ t >>> 3 } r(a, i), a.prototype.init = function () { return this._a = 1779033703, this._b = 3144134277, this._c = 1013904242, this._d = 2773480762, this._e = 1359893119, this._f = 2600822924, this._g = 528734635, this._h = 1541459225, this }, a.prototype._update = function (t) { for (var e, n = this._w, r = 0 | this._a, i = 0 | this._b, o = 0 | this._c, s = 0 | this._d, a = 0 | this._e, d = 0 | this._f, y = 0 | this._g, g = 0 | this._h, v = 0; v < 16; ++v)n[v] = t.readInt32BE(4 * v); for (; v < 64; ++v)n[v] = 0 | (((e = n[v - 2]) >>> 17 | e << 15) ^ (e >>> 19 | e << 13) ^ e >>> 10) + n[v - 7] + p(n[v - 15]) + n[v - 16]; for (var m = 0; m < 64; ++m) { var w = g + l(a) + c(a, d, y) + u[m] + n[m] | 0, b = h(r) + f(r, i, o) | 0; g = y, y = d, d = a, a = s + w | 0, s = o, o = i, i = r, r = w + b | 0 } this._a = r + this._a | 0, this._b = i + this._b | 0, this._c = o + this._c | 0, this._d = s + this._d | 0, this._e = a + this._e | 0, this._f = d + this._f | 0, this._g = y + this._g | 0, this._h = g + this._h | 0 }, a.prototype._hash = function () { var t = o.allocUnsafe(32); return t.writeInt32BE(this._a, 0), t.writeInt32BE(this._b, 4), t.writeInt32BE(this._c, 8), t.writeInt32BE(this._d, 12), t.writeInt32BE(this._e, 16), t.writeInt32BE(this._f, 20), t.writeInt32BE(this._g, 24), t.writeInt32BE(this._h, 28), t }, t.exports = a }, function (t, e, n) { var r = n(1), i = n(7), o = n(0).Buffer, u = [1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591], s = new Array(160); function a() { this.init(), this._w = s, i.call(this, 128, 112) } function c(t, e, n) { return n ^ t & (e ^ n) } function f(t, e, n) { return t & e | n & (t | e) } function h(t, e) { return (t >>> 28 | e << 4) ^ (e >>> 2 | t << 30) ^ (e >>> 7 | t << 25) } function l(t, e) { return (t >>> 14 | e << 18) ^ (t >>> 18 | e << 14) ^ (e >>> 9 | t << 23) } function p(t, e) { return (t >>> 1 | e << 31) ^ (t >>> 8 | e << 24) ^ t >>> 7 } function d(t, e) { return (t >>> 1 | e << 31) ^ (t >>> 8 | e << 24) ^ (t >>> 7 | e << 25) } function y(t, e) { return (t >>> 19 | e << 13) ^ (e >>> 29 | t << 3) ^ t >>> 6 } function g(t, e) { return (t >>> 19 | e << 13) ^ (e >>> 29 | t << 3) ^ (t >>> 6 | e << 26) } function v(t, e) { return t >>> 0 < e >>> 0 ? 1 : 0 } r(a, i), a.prototype.init = function () { return this._ah = 1779033703, this._bh = 3144134277, this._ch = 1013904242, this._dh = 2773480762, this._eh = 1359893119, this._fh = 2600822924, this._gh = 528734635, this._hh = 1541459225, this._al = 4089235720, this._bl = 2227873595, this._cl = 4271175723, this._dl = 1595750129, this._el = 2917565137, this._fl = 725511199, this._gl = 4215389547, this._hl = 327033209, this }, a.prototype._update = function (t) { for (var e = this._w, n = 0 | this._ah, r = 0 | this._bh, i = 0 | this._ch, o = 0 | this._dh, s = 0 | this._eh, a = 0 | this._fh, m = 0 | this._gh, w = 0 | this._hh, b = 0 | this._al, _ = 0 | this._bl, E = 0 | this._cl, B = 0 | this._dl, S = 0 | this._el, k = 0 | this._fl, A = 0 | this._gl, T = 0 | this._hl, C = 0; C < 32; C += 2)e[C] = t.readInt32BE(4 * C), e[C + 1] = t.readInt32BE(4 * C + 4); for (; C < 160; C += 2) { var x = e[C - 30], I = e[C - 30 + 1], U = p(x, I), O = d(I, x), M = y(x = e[C - 4], I = e[C - 4 + 1]), R = g(I, x), j = e[C - 14], L = e[C - 14 + 1], P = e[C - 32], D = e[C - 32 + 1], N = O + L | 0, W = U + j + v(N, O) | 0; W = (W = W + M + v(N = N + R | 0, R) | 0) + P + v(N = N + D | 0, D) | 0, e[C] = W, e[C + 1] = N } for (var F = 0; F < 160; F += 2) { W = e[F], N = e[F + 1]; var q = f(n, r, i), z = f(b, _, E), Y = h(n, b), H = h(b, n), V = l(s, S), X = l(S, s), J = u[F], K = u[F + 1], G = c(s, a, m), $ = c(S, k, A), Z = T + X | 0, Q = w + V + v(Z, T) | 0; Q = (Q = (Q = Q + G + v(Z = Z + $ | 0, $) | 0) + J + v(Z = Z + K | 0, K) | 0) + W + v(Z = Z + N | 0, N) | 0; var tt = H + z | 0, et = Y + q + v(tt, H) | 0; w = m, T = A, m = a, A = k, a = s, k = S, s = o + Q + v(S = B + Z | 0, B) | 0, o = i, B = E, i = r, E = _, r = n, _ = b, n = Q + et + v(b = Z + tt | 0, Z) | 0 } this._al = this._al + b | 0, this._bl = this._bl + _ | 0, this._cl = this._cl + E | 0, this._dl = this._dl + B | 0, this._el = this._el + S | 0, this._fl = this._fl + k | 0, this._gl = this._gl + A | 0, this._hl = this._hl + T | 0, this._ah = this._ah + n + v(this._al, b) | 0, this._bh = this._bh + r + v(this._bl, _) | 0, this._ch = this._ch + i + v(this._cl, E) | 0, this._dh = this._dh + o + v(this._dl, B) | 0, this._eh = this._eh + s + v(this._el, S) | 0, this._fh = this._fh + a + v(this._fl, k) | 0, this._gh = this._gh + m + v(this._gl, A) | 0, this._hh = this._hh + w + v(this._hl, T) | 0 }, a.prototype._hash = function () { var t = o.allocUnsafe(64); function e(e, n, r) { t.writeInt32BE(e, r), t.writeInt32BE(n, r + 4) } return e(this._ah, this._al, 0), e(this._bh, this._bl, 8), e(this._ch, this._cl, 16), e(this._dh, this._dl, 24), e(this._eh, this._el, 32), e(this._fh, this._fl, 40), e(this._gh, this._gl, 48), e(this._hh, this._hl, 56), t }, t.exports = a }, function (t, e, n) { "use strict"; const r = n(10), { encrypt: i, decrypt: o } = n(48), { compress: u, decompress: s, zwcHuffMan: a } = n(88), { zwcOperations: c, embed: f } = n(91), h = ["‌", "‍", "⁡", "⁢", "⁣", "⁤"], { toConceal: l, toConcealHmac: p, concealToData: d, noCrypt: y, detach: g } = c(h), { shrink: v, expand: m } = a(h), { byteToBin: w, compliment: b } = n(15); t.exports = class { constructor(t = !0, e = !1) { this.encrypt = t, this.integrity = e } static get zwc() { return h } hide(t, e, n = "This is a confidential text") { if (1 === n.split(" ").length) throw new Error("Minimum two words required"); const o = this.integrity, s = this.encrypt, a = r.pipe(u, b)(t), c = s ? i({ password: e, data: a, integrity: o }) : a, h = r.pipe(w, o && s ? p : s ? l : y, v)(c); return f(n, h) } reveal(t, e) { const { data: n, integrity: i, encrypt: u } = r.pipe(g, m, d)(t), a = u ? o({ password: e, data: n, integrity: i }) : n; return r.pipe(b, s)(a) } } }, function (t, e, n) { "use strict"; const r = n(49), { createCipheriv: i, createDecipheriv: o } = r, u = n(78), s = n(79).pbkdf2Sync, a = n(85), { curry: c } = n(10), f = n(87), { toBuffer: h, concatBuff: l, buffSlice: p } = n(15), d = (t, e, n) => { const r = h(e.data), i = {}; "encrypt" === t ? i.secret = r : "decrypt" === t && (n = p(r, 0, 8), e.integrity ? (i.hmacData = p(r, 8, 40), i.secret = p(r, 40)) : i.secret = p(r, 8)); const o = ((t, e) => s(t, e, 1e4, 48, "sha512"))(e.password, n); return i.iv = p(o, 0, 16), i.key = p(o, 16), i }, y = c(d)("encrypt"), g = c(d)("decrypt"); t.exports = { encrypt: t => { const e = u(8), { iv: n, key: r, secret: o } = y(t, e), s = i("aes-256-ctr", r, n), c = l([s.update(o, "utf8"), s.final()]); if (t.integrity) { const t = a("sha256", r).update(o).digest(); return l([e, t, c]) } return l([e, c]) }, decrypt: t => { const { iv: e, key: n, secret: r, hmacData: i } = g(t, null), u = o("aes-256-ctr", n, e), s = l([u.update(r, "utf8"), u.final()]); if (t.integrity) { const t = a("sha256", n).update(s).digest(); if (!f(i, t)) throw new Error("Wrong password or Wrong payload (Hmac Integrity failure) ") } return s } } }, function (t, e, n) { var r = n(50), i = n(67), o = n(22), u = n(77), s = n(23); function a(t, e, n) { if (t = t.toLowerCase(), o[t]) return i.createCipheriv(t, e, n); if (u[t]) return new r({ key: e, iv: n, mode: t }); throw new TypeError("invalid suite type") } function c(t, e, n) { if (t = t.toLowerCase(), o[t]) return i.createDecipheriv(t, e, n); if (u[t]) return new r({ key: e, iv: n, mode: t, decrypt: !0 }); throw new TypeError("invalid suite type") } e.createCipher = e.Cipher = function (t, e) { var n, r; if (t = t.toLowerCase(), o[t]) n = o[t].key, r = o[t].iv; else { if (!u[t]) throw new TypeError("invalid suite type"); n = 8 * u[t].key, r = u[t].iv } var i = s(e, !1, n, r); return a(t, i.key, i.iv) }, e.createCipheriv = e.Cipheriv = a, e.createDecipher = e.Decipher = function (t, e) { var n, r; if (t = t.toLowerCase(), o[t]) n = o[t].key, r = o[t].iv; else { if (!u[t]) throw new TypeError("invalid suite type"); n = 8 * u[t].key, r = u[t].iv } var i = s(e, !1, n, r); return c(t, i.key, i.iv) }, e.createDecipheriv = e.Decipheriv = c, e.listCiphers = e.getCiphers = function () { return Object.keys(u).concat(i.getCiphers()) } }, function (t, e, n) { var r = n(5), i = n(64), o = n(1), u = n(0).Buffer, s = { "des-ede3-cbc": i.CBC.instantiate(i.EDE), "des-ede3": i.EDE, "des-ede-cbc": i.CBC.instantiate(i.EDE), "des-ede": i.EDE, "des-cbc": i.CBC.instantiate(i.DES), "des-ecb": i.DES }; function a(t) { r.call(this); var e, n = t.mode.toLowerCase(), i = s[n]; e = t.decrypt ? "decrypt" : "encrypt"; var o = t.key; u.isBuffer(o) || (o = u.from(o)), "des-ede" !== n && "des-ede-cbc" !== n || (o = u.concat([o, o.slice(0, 8)])); var a = t.iv; u.isBuffer(a) || (a = u.from(a)), this._des = i.create({ key: o, iv: a, type: e }) } s.des = s["des-cbc"], s.des3 = s["des-ede3-cbc"], t.exports = a, o(a, r), a.prototype._update = function (t) { return u.from(this._des.update(t)) }, a.prototype._final = function () { return u.from(this._des.final()) } }, function (t, e, n) { "use strict"; e.byteLength = function (t) { var e = c(t), n = e[0], r = e[1]; return 3 * (n + r) / 4 - r }, e.toByteArray = function (t) { var e, n, r = c(t), u = r[0], s = r[1], a = new o(function (t, e, n) { return 3 * (e + n) / 4 - n }(0, u, s)), f = 0, h = s > 0 ? u - 4 : u; for (n = 0; n < h; n += 4)e = i[t.charCodeAt(n)] << 18 | i[t.charCodeAt(n + 1)] << 12 | i[t.charCodeAt(n + 2)] << 6 | i[t.charCodeAt(n + 3)], a[f++] = e >> 16 & 255, a[f++] = e >> 8 & 255, a[f++] = 255 & e; 2 === s && (e = i[t.charCodeAt(n)] << 2 | i[t.charCodeAt(n + 1)] >> 4, a[f++] = 255 & e); 1 === s && (e = i[t.charCodeAt(n)] << 10 | i[t.charCodeAt(n + 1)] << 4 | i[t.charCodeAt(n + 2)] >> 2, a[f++] = e >> 8 & 255, a[f++] = 255 & e); return a }, e.fromByteArray = function (t) { for (var e, n = t.length, i = n % 3, o = [], u = 0, s = n - i; u < s; u += 16383)o.push(f(t, u, u + 16383 > s ? s : u + 16383)); 1 === i ? (e = t[n - 1], o.push(r[e >> 2] + r[e << 4 & 63] + "==")) : 2 === i && (e = (t[n - 2] << 8) + t[n - 1], o.push(r[e >> 10] + r[e >> 4 & 63] + r[e << 2 & 63] + "=")); return o.join("") }; for (var r = [], i = [], o = "undefined" != typeof Uint8Array ? Uint8Array : Array, u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = 0, a = u.length; s < a; ++s)r[s] = u[s], i[u.charCodeAt(s)] = s; function c(t) { var e = t.length; if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4"); var n = t.indexOf("="); return -1 === n && (n = e), [n, n === e ? 0 : 4 - n % 4] } function f(t, e, n) { for (var i, o, u = [], s = e; s < n; s += 3)i = (t[s] << 16 & 16711680) + (t[s + 1] << 8 & 65280) + (255 & t[s + 2]), u.push(r[(o = i) >> 18 & 63] + r[o >> 12 & 63] + r[o >> 6 & 63] + r[63 & o]); return u.join("") } i["-".charCodeAt(0)] = 62, i["_".charCodeAt(0)] = 63 }, function (t, e) { e.read = function (t, e, n, r, i) { var o, u, s = 8 * i - r - 1, a = (1 << s) - 1, c = a >> 1, f = -7, h = n ? i - 1 : 0, l = n ? -1 : 1, p = t[e + h]; for (h += l, o = p & (1 << -f) - 1, p >>= -f, f += s; f > 0; o = 256 * o + t[e + h], h += l, f -= 8); for (u = o & (1 << -f) - 1, o >>= -f, f += r; f > 0; u = 256 * u + t[e + h], h += l, f -= 8); if (0 === o) o = 1 - c; else { if (o === a) return u ? NaN : 1 / 0 * (p ? -1 : 1); u += Math.pow(2, r), o -= c } return (p ? -1 : 1) * u * Math.pow(2, o - r) }, e.write = function (t, e, n, r, i, o) { var u, s, a, c = 8 * o - i - 1, f = (1 << c) - 1, h = f >> 1, l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0, p = r ? 0 : o - 1, d = r ? 1 : -1, y = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0; for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (s = isNaN(e) ? 1 : 0, u = f) : (u = Math.floor(Math.log(e) / Math.LN2), e * (a = Math.pow(2, -u)) < 1 && (u--, a *= 2), (e += u + h >= 1 ? l / a : l * Math.pow(2, 1 - h)) * a >= 2 && (u++, a /= 2), u + h >= f ? (s = 0, u = f) : u + h >= 1 ? (s = (e * a - 1) * Math.pow(2, i), u += h) : (s = e * Math.pow(2, h - 1) * Math.pow(2, i), u = 0)); i >= 8; t[n + p] = 255 & s, p += d, s /= 256, i -= 8); for (u = u << i | s, c += i; c > 0; t[n + p] = 255 & u, p += d, u /= 256, c -= 8); t[n + p - d] |= 128 * y } }, function (t, e) { }, function (t, e, n) { "use strict"; var r = n(18).Buffer, i = n(55); t.exports = function () { function t() { !function (t, e) { if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function") }(this, t), this.head = null, this.tail = null, this.length = 0 } return t.prototype.push = function (t) { var e = { data: t, next: null }; this.length > 0 ? this.tail.next = e : this.head = e, this.tail = e, ++this.length }, t.prototype.unshift = function (t) { var e = { data: t, next: this.head }; 0 === this.length && (this.tail = e), this.head = e, ++this.length }, t.prototype.shift = function () { if (0 !== this.length) { var t = this.head.data; return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, --this.length, t } }, t.prototype.clear = function () { this.head = this.tail = null, this.length = 0 }, t.prototype.join = function (t) { if (0 === this.length) return ""; for (var e = this.head, n = "" + e.data; e = e.next;)n += t + e.data; return n }, t.prototype.concat = function (t) { if (0 === this.length) return r.alloc(0); if (1 === this.length) return this.head.data; for (var e, n, i, o = r.allocUnsafe(t >>> 0), u = this.head, s = 0; u;)e = u.data, n = o, i = s, e.copy(n, i), s += u.data.length, u = u.next; return o }, t }(), i && i.inspect && i.inspect.custom && (t.exports.prototype[i.inspect.custom] = function () { var t = i.inspect({ length: this.length }); return this.constructor.name + " " + t }) }, function (t, e) { }, function (t, e, n) { (function (t, e) { !function (t, n) { "use strict"; if (!t.setImmediate) { var r, i, o, u, s, a = 1, c = {}, f = !1, h = t.document, l = Object.getPrototypeOf && Object.getPrototypeOf(t); l = l && l.setTimeout ? l : t, "[object process]" === {}.toString.call(t.process) ? r = function (t) { e.nextTick((function () { d(t) })) } : !function () { if (t.postMessage && !t.importScripts) { var e = !0, n = t.onmessage; return t.onmessage = function () { e = !1 }, t.postMessage("", "*"), t.onmessage = n, e } }() ? t.MessageChannel ? ((o = new MessageChannel).port1.onmessage = function (t) { d(t.data) }, r = function (t) { o.port2.postMessage(t) }) : h && "onreadystatechange" in h.createElement("script") ? (i = h.documentElement, r = function (t) { var e = h.createElement("script"); e.onreadystatechange = function () { d(t), e.onreadystatechange = null, i.removeChild(e), e = null }, i.appendChild(e) }) : r = function (t) { setTimeout(d, 0, t) } : (u = "setImmediate$" + Math.random() + "$", s = function (e) { e.source === t && "string" == typeof e.data && 0 === e.data.indexOf(u) && d(+e.data.slice(u.length)) }, t.addEventListener ? t.addEventListener("message", s, !1) : t.attachEvent("onmessage", s), r = function (e) { t.postMessage(u + e, "*") }), l.setImmediate = function (t) { "function" != typeof t && (t = new Function("" + t)); for (var e = new Array(arguments.length - 1), n = 0; n < e.length; n++)e[n] = arguments[n + 1]; var i = { callback: t, args: e }; return c[a] = i, r(a), a++ }, l.clearImmediate = p } function p(t) { delete c[t] } function d(t) { if (f) setTimeout(d, 0, t); else { var e = c[t]; if (e) { f = !0; try { !function (t) { var e = t.callback, n = t.args; switch (n.length) { case 0: e(); break; case 1: e(n[0]); break; case 2: e(n[0], n[1]); break; case 3: e(n[0], n[1], n[2]); break; default: e.apply(void 0, n) } }(e) } finally { p(t), f = !1 } } } } }("undefined" == typeof self ? void 0 === t ? this : t : self) }).call(this, n(3), n(4)) }, function (t, e, n) { (function (e) { function n(t) { try { if (!e.localStorage) return !1 } catch (t) { return !1 } var n = e.localStorage[t]; return null != n && "true" === String(n).toLowerCase() } t.exports = function (t, e) { if (n("noDeprecation")) return t; var r = !1; return function () { if (!r) { if (n("throwDeprecation")) throw new Error(e); n("traceDeprecation") ? console.trace(e) : console.warn(e), r = !0 } return t.apply(this, arguments) } } }).call(this, n(3)) }, function (t, e, n) { var r = n(2), i = r.Buffer; function o(t, e) { for (var n in t) e[n] = t[n] } function u(t, e, n) { return i(t, e, n) } i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = r : (o(r, e), e.Buffer = u), o(i, u), u.from = function (t, e, n) { if ("number" == typeof t) throw new TypeError("Argument must not be a number"); return i(t, e, n) }, u.alloc = function (t, e, n) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); var r = i(t); return void 0 !== e ? "string" == typeof n ? r.fill(e, n) : r.fill(e) : r.fill(0), r }, u.allocUnsafe = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return i(t) }, u.allocUnsafeSlow = function (t) { if ("number" != typeof t) throw new TypeError("Argument must be a number"); return r.SlowBuffer(t) } }, function (t, e, n) { "use strict"; t.exports = o; var r = n(29), i = Object.create(n(8)); function o(t) { if (!(this instanceof o)) return new o(t); r.call(this, t) } i.inherits = n(1), i.inherits(o, r), o.prototype._transform = function (t, e, n) { n(null, t) } }, function (t, e, n) { t.exports = n(19) }, function (t, e, n) { t.exports = n(6) }, function (t, e, n) { t.exports = n(17).Transform }, function (t, e, n) { t.exports = n(17).PassThrough }, function (t, e, n) { "use strict"; e.utils = n(30), e.Cipher = n(21), e.DES = n(31), e.CBC = n(65), e.EDE = n(66) }, function (t, e, n) { "use strict"; var r = n(13), i = n(1), o = {}; function u(t) { r.equal(t.length, 8, "Invalid IV length"), this.iv = new Array(8); for (var e = 0; e < this.iv.length; e++)this.iv[e] = t[e] } e.instantiate = function (t) { function e(e) { t.call(this, e), this._cbcInit() } i(e, t); for (var n = Object.keys(o), r = 0; r < n.length; r++) { var u = n[r]; e.prototype[u] = o[u] } return e.create = function (t) { return new e(t) }, e }, o._cbcInit = function () { var t = new u(this.options.iv); this._cbcState = t }, o._update = function (t, e, n, r) { var i = this._cbcState, o = this.constructor.super_.prototype, u = i.iv; if ("encrypt" === this.type) { for (var s = 0; s < this.blockSize; s++)u[s] ^= t[e + s]; o._update.call(this, u, 0, n, r); for (s = 0; s < this.blockSize; s++)u[s] = n[r + s] } else { o._update.call(this, t, e, n, r); for (s = 0; s < this.blockSize; s++)n[r + s] ^= u[s]; for (s = 0; s < this.blockSize; s++)u[s] = t[e + s] } } }, function (t, e, n) { "use strict"; var r = n(13), i = n(1), o = n(21), u = n(31); function s(t, e) { r.equal(e.length, 24, "Invalid key length"); var n = e.slice(0, 8), i = e.slice(8, 16), o = e.slice(16, 24); this.ciphers = "encrypt" === t ? [u.create({ type: "encrypt", key: n }), u.create({ type: "decrypt", key: i }), u.create({ type: "encrypt", key: o })] : [u.create({ type: "decrypt", key: o }), u.create({ type: "encrypt", key: i }), u.create({ type: "decrypt", key: n })] } function a(t) { o.call(this, t); var e = new s(this.type, this.options.key); this._edeState = e } i(a, o), t.exports = a, a.create = function (t) { return new a(t) }, a.prototype._update = function (t, e, n, r) { var i = this._edeState; i.ciphers[0]._update(t, e, n, r), i.ciphers[1]._update(n, r, n, r), i.ciphers[2]._update(n, r, n, r) }, a.prototype._pad = u.prototype._pad, a.prototype._unpad = u.prototype._unpad }, function (t, e, n) { var r = n(68), i = n(76), o = n(34); e.createCipher = e.Cipher = r.createCipher, e.createCipheriv = e.Cipheriv = r.createCipheriv, e.createDecipher = e.Decipher = i.createDecipher, e.createDecipheriv = e.Decipheriv = i.createDecipheriv, e.listCiphers = e.getCiphers = function () { return Object.keys(o) } }, function (t, e, n) { var r = n(22), i = n(35), o = n(0).Buffer, u = n(36), s = n(5), a = n(14), c = n(23); function f(t, e, n) { s.call(this), this._cache = new l, this._cipher = new a.AES(e), this._prev = o.from(n), this._mode = t, this._autopadding = !0 } n(1)(f, s), f.prototype._update = function (t) { var e, n; this._cache.add(t); for (var r = []; e = this._cache.get();)n = this._mode.encrypt(this, e), r.push(n); return o.concat(r) }; var h = o.alloc(16, 16); function l() { this.cache = o.allocUnsafe(0) } function p(t, e, n) { var s = r[t.toLowerCase()]; if (!s) throw new TypeError("invalid suite type"); if ("string" == typeof e && (e = o.from(e)), e.length !== s.key / 8) throw new TypeError("invalid key length " + e.length); if ("string" == typeof n && (n = o.from(n)), "GCM" !== s.mode && n.length !== s.iv) throw new TypeError("invalid iv length " + n.length); return "stream" === s.type ? new u(s.module, e, n) : "auth" === s.type ? new i(s.module, e, n) : new f(s.module, e, n) } f.prototype._final = function () { var t = this._cache.flush(); if (this._autopadding) return t = this._mode.encrypt(this, t), this._cipher.scrub(), t; if (!t.equals(h)) throw this._cipher.scrub(), new Error("data not multiple of block length") }, f.prototype.setAutoPadding = function (t) { return this._autopadding = !!t, this }, l.prototype.add = function (t) { this.cache = o.concat([this.cache, t]) }, l.prototype.get = function () { if (this.cache.length > 15) { var t = this.cache.slice(0, 16); return this.cache = this.cache.slice(16), t } return null }, l.prototype.flush = function () { for (var t = 16 - this.cache.length, e = o.allocUnsafe(t), n = -1; ++n < t;)e.writeUInt8(t, n); return o.concat([this.cache, e]) }, e.createCipheriv = p, e.createCipher = function (t, e) { var n = r[t.toLowerCase()]; if (!n) throw new TypeError("invalid suite type"); var i = c(e, !1, n.key, n.iv); return p(t, i.key, i.iv) } }, function (t, e) { e.encrypt = function (t, e) { return t._cipher.encryptBlock(e) }, e.decrypt = function (t, e) { return t._cipher.decryptBlock(e) } }, function (t, e, n) { var r = n(9); e.encrypt = function (t, e) { var n = r(e, t._prev); return t._prev = t._cipher.encryptBlock(n), t._prev }, e.decrypt = function (t, e) { var n = t._prev; t._prev = e; var i = t._cipher.decryptBlock(e); return r(i, n) } }, function (t, e, n) { var r = n(0).Buffer, i = n(9); function o(t, e, n) { var o = e.length, u = i(e, t._cache); return t._cache = t._cache.slice(o), t._prev = r.concat([t._prev, n ? e : u]), u } e.encrypt = function (t, e, n) { for (var i, u = r.allocUnsafe(0); e.length;) { if (0 === t._cache.length && (t._cache = t._cipher.encryptBlock(t._prev), t._prev = r.allocUnsafe(0)), !(t._cache.length <= e.length)) { u = r.concat([u, o(t, e, n)]); break } i = t._cache.length, u = r.concat([u, o(t, e.slice(0, i), n)]), e = e.slice(i) } return u } }, function (t, e, n) { var r = n(0).Buffer; function i(t, e, n) { var i = t._cipher.encryptBlock(t._prev)[0] ^ e; return t._prev = r.concat([t._prev.slice(1), r.from([n ? e : i])]), i } e.encrypt = function (t, e, n) { for (var o = e.length, u = r.allocUnsafe(o), s = -1; ++s < o;)u[s] = i(t, e[s], n); return u } }, function (t, e, n) { var r = n(0).Buffer; function i(t, e, n) { for (var r, i, u = -1, s = 0; ++u < 8;)r = e & 1 << 7 - u ? 128 : 0, s += (128 & (i = t._cipher.encryptBlock(t._prev)[0] ^ r)) >> u % 8, t._prev = o(t._prev, n ? r : i); return s } function o(t, e) { var n = t.length, i = -1, o = r.allocUnsafe(t.length); for (t = r.concat([t, r.from([e])]); ++i < n;)o[i] = t[i] << 1 | t[i + 1] >> 7; return o } e.encrypt = function (t, e, n) { for (var o = e.length, u = r.allocUnsafe(o), s = -1; ++s < o;)u[s] = i(t, e[s], n); return u } }, function (t, e, n) { (function (t) { var r = n(9); function i(t) { return t._prev = t._cipher.encryptBlock(t._prev), t._prev } e.encrypt = function (e, n) { for (; e._cache.length < n.length;)e._cache = t.concat([e._cache, i(e)]); var o = e._cache.slice(0, n.length); return e._cache = e._cache.slice(n.length), r(n, o) } }).call(this, n(2).Buffer) }, function (t, e, n) { var r = n(0).Buffer, i = r.alloc(16, 0); function o(t) { var e = r.allocUnsafe(16); return e.writeUInt32BE(t[0] >>> 0, 0), e.writeUInt32BE(t[1] >>> 0, 4), e.writeUInt32BE(t[2] >>> 0, 8), e.writeUInt32BE(t[3] >>> 0, 12), e } function u(t) { this.h = t, this.state = r.alloc(16, 0), this.cache = r.allocUnsafe(0) } u.prototype.ghash = function (t) { for (var e = -1; ++e < t.length;)this.state[e] ^= t[e]; this._multiply() }, u.prototype._multiply = function () { for (var t, e, n, r = [(t = this.h).readUInt32BE(0), t.readUInt32BE(4), t.readUInt32BE(8), t.readUInt32BE(12)], i = [0, 0, 0, 0], u = -1; ++u < 128;) { for (0 != (this.state[~~(u / 8)] & 1 << 7 - u % 8) && (i[0] ^= r[0], i[1] ^= r[1], i[2] ^= r[2], i[3] ^= r[3]), n = 0 != (1 & r[3]), e = 3; e > 0; e--)r[e] = r[e] >>> 1 | (1 & r[e - 1]) << 31; r[0] = r[0] >>> 1, n && (r[0] = r[0] ^ 225 << 24) } this.state = o(i) }, u.prototype.update = function (t) { var e; for (this.cache = r.concat([this.cache, t]); this.cache.length >= 16;)e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), this.ghash(e) }, u.prototype.final = function (t, e) { return this.cache.length && this.ghash(r.concat([this.cache, i], 16)), this.ghash(o([0, t, 0, e])), this.state }, t.exports = u }, function (t, e, n) { var r = n(35), i = n(0).Buffer, o = n(22), u = n(36), s = n(5), a = n(14), c = n(23); function f(t, e, n) { s.call(this), this._cache = new h, this._last = void 0, this._cipher = new a.AES(e), this._prev = i.from(n), this._mode = t, this._autopadding = !0 } function h() { this.cache = i.allocUnsafe(0) } function l(t, e, n) { var s = o[t.toLowerCase()]; if (!s) throw new TypeError("invalid suite type"); if ("string" == typeof n && (n = i.from(n)), "GCM" !== s.mode && n.length !== s.iv) throw new TypeError("invalid iv length " + n.length); if ("string" == typeof e && (e = i.from(e)), e.length !== s.key / 8) throw new TypeError("invalid key length " + e.length); return "stream" === s.type ? new u(s.module, e, n, !0) : "auth" === s.type ? new r(s.module, e, n, !0) : new f(s.module, e, n) } n(1)(f, s), f.prototype._update = function (t) { var e, n; this._cache.add(t); for (var r = []; e = this._cache.get(this._autopadding);)n = this._mode.decrypt(this, e), r.push(n); return i.concat(r) }, f.prototype._final = function () { var t = this._cache.flush(); if (this._autopadding) return function (t) { var e = t[15]; if (e < 1 || e > 16) throw new Error("unable to decrypt data"); var n = -1; for (; ++n < e;)if (t[n + (16 - e)] !== e) throw new Error("unable to decrypt data"); if (16 === e) return; return t.slice(0, 16 - e) }(this._mode.decrypt(this, t)); if (t) throw new Error("data not multiple of block length") }, f.prototype.setAutoPadding = function (t) { return this._autopadding = !!t, this }, h.prototype.add = function (t) { this.cache = i.concat([this.cache, t]) }, h.prototype.get = function (t) { var e; if (t) { if (this.cache.length > 16) return e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), e } else if (this.cache.length >= 16) return e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), e; return null }, h.prototype.flush = function () { if (this.cache.length) return this.cache }, e.createDecipher = function (t, e) { var n = o[t.toLowerCase()]; if (!n) throw new TypeError("invalid suite type"); var r = c(e, !1, n.key, n.iv); return l(t, r.key, r.iv) }, e.createDecipheriv = l }, function (t, e) { e["des-ecb"] = { key: 8, iv: 0 }, e["des-cbc"] = e.des = { key: 8, iv: 8 }, e["des-ede3-cbc"] = e.des3 = { key: 24, iv: 8 }, e["des-ede3"] = { key: 24, iv: 0 }, e["des-ede-cbc"] = { key: 16, iv: 8 }, e["des-ede"] = { key: 16, iv: 0 } }, function (t, e, n) { "use strict"; (function (e, r) { var i = n(0).Buffer, o = e.crypto || e.msCrypto; o && o.getRandomValues ? t.exports = function (t, e) { if (t > 4294967295) throw new RangeError("requested too many random bytes"); var n = i.allocUnsafe(t); if (t > 0) if (t > 65536) for (var u = 0; u < t; u += 65536)o.getRandomValues(n.slice(u, u + 65536)); else o.getRandomValues(n); if ("function" == typeof e) return r.nextTick((function () { e(null, n) })); return n } : t.exports = function () { throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11") } }).call(this, n(3), n(4)) }, function (t, e, n) { e.pbkdf2 = n(80), e.pbkdf2Sync = n(41) }, function (t, e, n) { (function (e, r) { var i, o = n(39), u = n(40), s = n(41), a = n(0).Buffer, c = e.crypto && e.crypto.subtle, f = { sha: "SHA-1", "sha-1": "SHA-1", sha1: "SHA-1", sha256: "SHA-256", "sha-256": "SHA-256", sha384: "SHA-384", "sha-384": "SHA-384", "sha-512": "SHA-512", sha512: "SHA-512" }, h = []; function l(t, e, n, r, i) { return c.importKey("raw", t, { name: "PBKDF2" }, !1, ["deriveBits"]).then((function (t) { return c.deriveBits({ name: "PBKDF2", salt: e, iterations: n, hash: { name: i } }, t, r << 3) })).then((function (t) { return a.from(t) })) } t.exports = function (t, n, p, d, y, g) { "function" == typeof y && (g = y, y = void 0); var v = f[(y = y || "sha1").toLowerCase()]; if (!v || "function" != typeof e.Promise) return r.nextTick((function () { var e; try { e = s(t, n, p, d, y) } catch (t) { return g(t) } g(null, e) })); if (o(t, n, p, d), "function" != typeof g) throw new Error("No callback provided to pbkdf2"); a.isBuffer(t) || (t = a.from(t, u)), a.isBuffer(n) || (n = a.from(n, u)), function (t, e) { t.then((function (t) { r.nextTick((function () { e(null, t) })) }), (function (t) { r.nextTick((function () { e(t) })) })) }(function (t) { if (e.process && !e.process.browser) return Promise.resolve(!1); if (!c || !c.importKey || !c.deriveBits) return Promise.resolve(!1); if (void 0 !== h[t]) return h[t]; var n = l(i = i || a.alloc(8), i, 10, 128, t).then((function () { return !0 })).catch((function () { return !1 })); return h[t] = n, n }(v).then((function (e) { return e ? l(t, n, p, d, v) : s(t, n, p, d, y) })), g) } }).call(this, n(3), n(4)) }, function (t, e, n) { var r = n(1), i = n(7), o = n(0).Buffer, u = [1518500249, 1859775393, -1894007588, -899497514], s = new Array(80); function a() { this.init(), this._w = s, i.call(this, 64, 56) } function c(t) { return t << 30 | t >>> 2 } function f(t, e, n, r) { return 0 === t ? e & n | ~e & r : 2 === t ? e & n | e & r | n & r : e ^ n ^ r } r(a, i), a.prototype.init = function () { return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this }, a.prototype._update = function (t) { for (var e, n = this._w, r = 0 | this._a, i = 0 | this._b, o = 0 | this._c, s = 0 | this._d, a = 0 | this._e, h = 0; h < 16; ++h)n[h] = t.readInt32BE(4 * h); for (; h < 80; ++h)n[h] = n[h - 3] ^ n[h - 8] ^ n[h - 14] ^ n[h - 16]; for (var l = 0; l < 80; ++l) { var p = ~~(l / 20), d = 0 | ((e = r) << 5 | e >>> 27) + f(p, i, o, s) + a + n[l] + u[p]; a = s, s = o, o = c(i), i = r, r = d } this._a = r + this._a | 0, this._b = i + this._b | 0, this._c = o + this._c | 0, this._d = s + this._d | 0, this._e = a + this._e | 0 }, a.prototype._hash = function () { var t = o.allocUnsafe(20); return t.writeInt32BE(0 | this._a, 0), t.writeInt32BE(0 | this._b, 4), t.writeInt32BE(0 | this._c, 8), t.writeInt32BE(0 | this._d, 12), t.writeInt32BE(0 | this._e, 16), t }, t.exports = a }, function (t, e, n) { var r = n(1), i = n(7), o = n(0).Buffer, u = [1518500249, 1859775393, -1894007588, -899497514], s = new Array(80); function a() { this.init(), this._w = s, i.call(this, 64, 56) } function c(t) { return t << 5 | t >>> 27 } function f(t) { return t << 30 | t >>> 2 } function h(t, e, n, r) { return 0 === t ? e & n | ~e & r : 2 === t ? e & n | e & r | n & r : e ^ n ^ r } r(a, i), a.prototype.init = function () { return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this }, a.prototype._update = function (t) { for (var e, n = this._w, r = 0 | this._a, i = 0 | this._b, o = 0 | this._c, s = 0 | this._d, a = 0 | this._e, l = 0; l < 16; ++l)n[l] = t.readInt32BE(4 * l); for (; l < 80; ++l)n[l] = (e = n[l - 3] ^ n[l - 8] ^ n[l - 14] ^ n[l - 16]) << 1 | e >>> 31; for (var p = 0; p < 80; ++p) { var d = ~~(p / 20), y = c(r) + h(d, i, o, s) + a + n[p] + u[d] | 0; a = s, s = o, o = f(i), i = r, r = y } this._a = r + this._a | 0, this._b = i + this._b | 0, this._c = o + this._c | 0, this._d = s + this._d | 0, this._e = a + this._e | 0 }, a.prototype._hash = function () { var t = o.allocUnsafe(20); return t.writeInt32BE(0 | this._a, 0), t.writeInt32BE(0 | this._b, 4), t.writeInt32BE(0 | this._c, 8), t.writeInt32BE(0 | this._d, 12), t.writeInt32BE(0 | this._e, 16), t }, t.exports = a }, function (t, e, n) { var r = n(1), i = n(45), o = n(7), u = n(0).Buffer, s = new Array(64); function a() { this.init(), this._w = s, o.call(this, 64, 56) } r(a, i), a.prototype.init = function () { return this._a = 3238371032, this._b = 914150663, this._c = 812702999, this._d = 4144912697, this._e = 4290775857, this._f = 1750603025, this._g = 1694076839, this._h = 3204075428, this }, a.prototype._hash = function () { var t = u.allocUnsafe(28); return t.writeInt32BE(this._a, 0), t.writeInt32BE(this._b, 4), t.writeInt32BE(this._c, 8), t.writeInt32BE(this._d, 12), t.writeInt32BE(this._e, 16), t.writeInt32BE(this._f, 20), t.writeInt32BE(this._g, 24), t }, t.exports = a }, function (t, e, n) { var r = n(1), i = n(46), o = n(7), u = n(0).Buffer, s = new Array(160); function a() { this.init(), this._w = s, o.call(this, 128, 112) } r(a, i), a.prototype.init = function () { return this._ah = 3418070365, this._bh = 1654270250, this._ch = 2438529370, this._dh = 355462360, this._eh = 1731405415, this._fh = 2394180231, this._gh = 3675008525, this._hh = 1203062813, this._al = 3238371032, this._bl = 914150663, this._cl = 812702999, this._dl = 4144912697, this._el = 4290775857, this._fl = 1750603025, this._gl = 1694076839, this._hl = 3204075428, this }, a.prototype._hash = function () { var t = u.allocUnsafe(48); function e(e, n, r) { t.writeInt32BE(e, r), t.writeInt32BE(n, r + 4) } return e(this._ah, this._al, 0), e(this._bh, this._bl, 8), e(this._ch, this._cl, 16), e(this._dh, this._dl, 24), e(this._eh, this._el, 32), e(this._fh, this._fl, 40), t }, t.exports = a }, function (t, e, n) { "use strict"; var r = n(1), i = n(86), o = n(5), u = n(0).Buffer, s = n(42), a = n(43), c = n(44), f = u.alloc(128); function h(t, e) { o.call(this, "digest"), "string" == typeof e && (e = u.from(e)); var n = "sha512" === t || "sha384" === t ? 128 : 64; (this._alg = t, this._key = e, e.length > n) ? e = ("rmd160" === t ? new a : c(t)).update(e).digest() : e.length < n && (e = u.concat([e, f], n)); for (var r = this._ipad = u.allocUnsafe(n), i = this._opad = u.allocUnsafe(n), s = 0; s < n; s++)r[s] = 54 ^ e[s], i[s] = 92 ^ e[s]; this._hash = "rmd160" === t ? new a : c(t), this._hash.update(r) } r(h, o), h.prototype._update = function (t) { this._hash.update(t) }, h.prototype._final = function () { var t = this._hash.digest(); return ("rmd160" === this._alg ? new a : c(this._alg)).update(this._opad).update(t).digest() }, t.exports = function (t, e) { return "rmd160" === (t = t.toLowerCase()) || "ripemd160" === t ? new h("rmd160", e) : "md5" === t ? new i(s, e) : new h(t, e) } }, function (t, e, n) { "use strict"; var r = n(1), i = n(0).Buffer, o = n(5), u = i.alloc(128); function s(t, e) { o.call(this, "digest"), "string" == typeof e && (e = i.from(e)), this._alg = t, this._key = e, e.length > 64 ? e = t(e) : e.length < 64 && (e = i.concat([e, u], 64)); for (var n = this._ipad = i.allocUnsafe(64), r = this._opad = i.allocUnsafe(64), s = 0; s < 64; s++)n[s] = 54 ^ e[s], r[s] = 92 ^ e[s]; this._hash = [n] } r(s, o), s.prototype._update = function (t) { this._hash.push(t) }, s.prototype._final = function () { var t = this._alg(i.concat(this._hash)); return this._alg(i.concat([this._opad, t])) }, t.exports = s }, function (t, e, n) { "use strict"; (function (e) { t.exports = function (t, n) { if (!e.isBuffer(t)) throw new TypeError("First argument must be a buffer"); if (!e.isBuffer(n)) throw new TypeError("Second argument must be a buffer"); if (t.length !== n.length) throw new TypeError("Input buffers must have the same length"); var r = t.length, i = 0, o = -1; for (; ++o < r;)i |= t[o] ^ n[o]; return 0 === i } }).call(this, n(2).Buffer) }, function (t, e, n) { "use strict"; (function (e) { const { pipe: r, curry: i, sort: o, difference: u, __: s } = n(10), { recursiveReplace: a } = n(15), c = n(89), f = i(c.decompress)(s, { inputEncoding: "Buffer", outputEncoding: "String" }), h = r(e.from, f); t.exports = { compress: t => c.compress(t, { outputEncoding: "Buffer" }), decompress: h, zwcHuffMan: t => { const e = [t[0] + t[1], t[0] + t[2], t[0] + t[3], t[1] + t[2], t[1] + t[3], t[2] + t[3]]; return { shrink: n => { const r = ((t, e) => { const n = e.reduce((t, e) => (t[e] = {}, t), {}), r = t.length; for (let e = 0; e < r; e++) { let i = 1; for (; e < r && t[e] === t[e + 1];)i++, e++; if (i >= 2) { let r = i; for (; r >= 2;)n[t[e]][r] = (n[t[e]][r] || 0) + Math.floor(i / r) * (r - 1), r-- } } const i = []; for (const t in n) for (const e in n[t]) i.push([t + e, n[t][e]]); let s = o((t, e) => e[1] - t[1], i).filter(t => "2" === t[0][1]).slice(0, 2).map(t => t[0][0]); return 2 !== s.length && (s = s.concat(u(e, s).slice(0, 2 - s.length))), s.slice().sort() })(n, t.slice(0, 4)); return ((n, r) => t[e.indexOf(n + r)])(...r) + a(n, r.map(t => t + t), [t[4], t[5]]) }, expand: n => { const r = n[0], i = n.slice(1), o = (u = r, e[t.indexOf(u)].split("")); var u; return a(i, [t[4], t[5]], o.map(t => t + t)) } } } } }).call(this, n(2).Buffer) }, function (t, e, n) {
	(function (t, e, r, i, o) {
		var u; if (function (i) { i.runningInNodeJS = function () { return "object" == typeof t && "object" == typeof t.versions && "string" == typeof t.versions.node }, i.runningInMainNodeJSModule = function () { return i.runningInNodeJS() && n.c[n.s] === e }, i.commonJSAvailable = function () { return "object" == typeof e.exports }, i.runningInWebWorker = function () { return "undefined" == typeof window && "object" == typeof self && "function" == typeof self.addEventListener && "function" == typeof self.close }, i.runningInNodeChildProcess = function () { return i.runningInNodeJS() && "function" == typeof t.send }, i.runningInNullOrigin = function () { return "object" == typeof window && "object" == typeof window.location && ("http:" !== document.location.protocol && "https:" !== document.location.protocol) }, i.webWorkersAvailable = function () { return "function" == typeof Worker && !i.runningInNullOrigin() && (!i.runningInNodeJS() && !(navigator && navigator.userAgent && navigator.userAgent.indexOf("Android 4.3") >= 0)) }, i.log = function (t, e) { void 0 === e && (e = !1), "object" == typeof console && (console.log(t), e && "object" == typeof document && (document.body.innerHTML += t + "<br/>")) }, i.createErrorMessage = function (t, e) { if (void 0 === e && (e = "Unhandled exception"), null == t) return e; if (e += ": ", "object" == typeof t.content) { if (i.runningInNodeJS()) return e + t.content.stack; var n = JSON.stringify(t.content); return "{}" !== n ? e + n : e + t.content } return "string" == typeof t.content ? e + t.content : e + t }, i.printExceptionAndStackTraceToConsole = function (t, e) { void 0 === e && (e = "Unhandled exception"), i.log(i.createErrorMessage(t, e)) }, i.getGlobalObject = function () { return "object" == typeof r ? r : "object" == typeof window ? window : "object" == typeof self ? self : {} }, i.toString = Object.prototype.toString, i.commonJSAvailable() && (e.exports = i) }(u || (u = {})), "function" == typeof Uint8Array && 0 !== new Uint8Array(1).subarray(1).byteLength) { var s = function (t, e) { var n = function (t, e, n) { return t < e ? e : t > n ? n : t }; t |= 0, e |= 0, arguments.length < 1 && (t = 0), arguments.length < 2 && (e = this.length), t < 0 && (t = this.length + t), e < 0 && (e = this.length + e), t = n(t, 0, this.length); var r = (e = n(e, 0, this.length)) - t; return r < 0 && (r = 0), new this.constructor(this.buffer, this.byteOffset + t * this.BYTES_PER_ELEMENT, r) }, a = ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"], c = void 0; if ("object" == typeof window ? c = window : "object" == typeof self && (c = self), void 0 !== c) for (var f = 0; f < a.length; f++)c[a[f]] && (c[a[f]].prototype.subarray = s) } !function (t) { var e = function () { function e() { } return e.compressAsync = function (e, n, r) { var i = new t.Timer, o = new t.Compressor; if (!r) throw new TypeError("compressAsync: No callback argument given"); if ("string" == typeof e) e = t.encodeUTF8(e); else if (null == e || !(e instanceof Uint8Array)) return void r(void 0, new TypeError("compressAsync: Invalid input argument, only 'string' and 'Uint8Array' are supported")); var u = t.ArrayTools.splitByteArray(e, n.blockSize), s = [], a = function (e) { if (e < u.length) { var c = void 0; try { c = o.compressBlock(u[e]) } catch (t) { return void r(void 0, t) } s.push(c), i.getElapsedTime() <= 20 ? a(e + 1) : (t.enqueueImmediate((function () { return a(e + 1) })), i.restart()) } else { var f = t.ArrayTools.concatUint8Arrays(s); t.enqueueImmediate((function () { var e; try { e = t.CompressionCommon.encodeCompressedBytes(f, n.outputEncoding) } catch (t) { return void r(void 0, t) } t.enqueueImmediate((function () { return r(e) })) })) } }; t.enqueueImmediate((function () { return a(0) })) }, e.createCompressionStream = function () { var e = new t.Compressor, r = new (n(11).Transform)({ decodeStrings: !0, highWaterMark: 65536 }); return r._transform = function (n, i, o) { var u; try { u = t.BufferTools.uint8ArrayToBuffer(e.compressBlock(t.BufferTools.bufferToUint8Array(n))) } catch (t) { return void r.emit("error", t) } r.push(u), o() }, r }, e }(); t.AsyncCompressor = e }(u || (u = {})), function (t) { var e = function () { function e() { } return e.decompressAsync = function (e, n, r) { if (!r) throw new TypeError("decompressAsync: No callback argument given"); var i = new t.Timer; try { e = t.CompressionCommon.decodeCompressedBytes(e, n.inputEncoding) } catch (t) { return void r(void 0, t) } var o = new t.Decompressor, u = t.ArrayTools.splitByteArray(e, n.blockSize), s = [], a = function (e) { if (e < u.length) { var c = void 0; try { c = o.decompressBlock(u[e]) } catch (t) { return void r(void 0, t) } s.push(c), i.getElapsedTime() <= 20 ? a(e + 1) : (t.enqueueImmediate((function () { return a(e + 1) })), i.restart()) } else { var f = t.ArrayTools.concatUint8Arrays(s); t.enqueueImmediate((function () { var e; try { e = t.CompressionCommon.encodeDecompressedBytes(f, n.outputEncoding) } catch (t) { return void r(void 0, t) } t.enqueueImmediate((function () { return r(e) })) })) } }; t.enqueueImmediate((function () { return a(0) })) }, e.createDecompressionStream = function () { var e = new t.Decompressor, r = new (n(11).Transform)({ decodeStrings: !0, highWaterMark: 65536 }); return r._transform = function (n, i, o) { var u; try { u = t.BufferTools.uint8ArrayToBuffer(e.decompressBlock(t.BufferTools.bufferToUint8Array(n))) } catch (t) { return void r.emit("error", t) } r.push(u), o() }, r }, e }(); t.AsyncDecompressor = e }(u || (u = {})), function (t) { var e; !function (e) { e.compressAsync = function (t, n, r) { if ("ByteArray" != n.inputEncoding || t instanceof Uint8Array) { var i = { token: Math.random().toString(), type: "compress", data: t, inputEncoding: n.inputEncoding, outputEncoding: n.outputEncoding }, o = function (t) { var n = t.data; n && n.token == i.token && (e.globalWorker.removeEventListener("message", o), "error" == n.type ? r(void 0, new Error(n.error)) : r(n.data)) }; e.globalWorker.addEventListener("message", o), e.globalWorker.postMessage(i, []) } else r(void 0, new TypeError("compressAsync: input is not a Uint8Array")) }, e.decompressAsync = function (t, n, r) { var i = { token: Math.random().toString(), type: "decompress", data: t, inputEncoding: n.inputEncoding, outputEncoding: n.outputEncoding }, o = function (t) { var n = t.data; n && n.token == i.token && (e.globalWorker.removeEventListener("message", o), "error" == n.type ? r(void 0, new Error(n.error)) : r(n.data)) }; e.globalWorker.addEventListener("message", o), e.globalWorker.postMessage(i, []) }, e.installWebWorkerIfNeeded = function () { "object" == typeof self && void 0 === self.document && null != self.addEventListener && (self.addEventListener("message", (function (e) { var n = e.data; if ("compress" == n.type) { var r = void 0; try { r = t.compress(n.data, { outputEncoding: n.outputEncoding }) } catch (e) { return void self.postMessage({ token: n.token, type: "error", error: t.createErrorMessage(e) }, []) } (i = { token: n.token, type: "compressionResult", data: r, encoding: n.outputEncoding }).data instanceof Uint8Array && -1 === navigator.appVersion.indexOf("MSIE 10") ? self.postMessage(i, [i.data.buffer]) : self.postMessage(i, []) } else if ("decompress" == n.type) { var i, o = void 0; try { o = t.decompress(n.data, { inputEncoding: n.inputEncoding, outputEncoding: n.outputEncoding }) } catch (e) { return void self.postMessage({ token: n.token, type: "error", error: t.createErrorMessage(e) }, []) } (i = { token: n.token, type: "decompressionResult", data: o, encoding: n.outputEncoding }).data instanceof Uint8Array && -1 === navigator.appVersion.indexOf("MSIE 10") ? self.postMessage(i, [i.data.buffer]) : self.postMessage(i, []) } })), self.addEventListener("error", (function (e) { t.log(t.createErrorMessage(e.error, "Unexpected LZUTF8 WebWorker exception")) }))) }, e.createGlobalWorkerIfNeeded = function () { if (e.globalWorker) return !0; if (!t.webWorkersAvailable()) return !1; if (!e.scriptURI && "object" == typeof document) { var n = document.getElementById("lzutf8"); null != n && (e.scriptURI = n.getAttribute("src") || void 0) } return !!e.scriptURI && (e.globalWorker = new Worker(e.scriptURI), !0) }, e.terminate = function () { e.globalWorker && (e.globalWorker.terminate(), e.globalWorker = void 0) } }(e = t.WebWorker || (t.WebWorker = {})), e.installWebWorkerIfNeeded() }(u || (u = {})), function (t) { var e = function () { function t(t, e, n) { this.container = t, this.startPosition = e, this.length = n } return t.prototype.get = function (t) { return this.container[this.startPosition + t] }, t.prototype.getInReversedOrder = function (t) { return this.container[this.startPosition + this.length - 1 - t] }, t.prototype.set = function (t, e) { this.container[this.startPosition + t] = e }, t }(); t.ArraySegment = e }(u || (u = {})), function (t) { !function (t) { t.copyElements = function (t, e, n, r, i) { for (; i--;)n[r++] = t[e++] }, t.zeroElements = function (t, e, n) { for (; n--;)t[e++] = 0 }, t.countNonzeroValuesInArray = function (t) { for (var e = 0, n = 0; n < t.length; n++)t[n] && e++; return e }, t.truncateStartingElements = function (t, e) { if (t.length <= e) throw new RangeError("truncateStartingElements: Requested length should be smaller than array length"); for (var n = t.length - e, r = 0; r < e; r++)t[r] = t[n + r]; t.length = e }, t.doubleByteArrayCapacity = function (t) { var e = new Uint8Array(2 * t.length); return e.set(t), e }, t.concatUint8Arrays = function (t) { for (var e = 0, n = 0, r = t; n < r.length; n++) { e += (a = r[n]).length } for (var i = new Uint8Array(e), o = 0, u = 0, s = t; u < s.length; u++) { var a = s[u]; i.set(a, o), o += a.length } return i }, t.splitByteArray = function (t, e) { for (var n = [], r = 0; r < t.length;) { var i = Math.min(e, t.length - r); n.push(t.subarray(r, r + i)), r += i } return n } }(t.ArrayTools || (t.ArrayTools = {})) }(u || (u = {})), function (t) { !function (t) { t.convertToUint8ArrayIfNeeded = function (e) { return "function" == typeof i && i.isBuffer(e) ? t.bufferToUint8Array(e) : e }, t.uint8ArrayToBuffer = function (t) { if (i.prototype instanceof Uint8Array) { var e = new Uint8Array(t.buffer, t.byteOffset, t.byteLength); return Object.setPrototypeOf(e, i.prototype), e } for (var n = t.length, r = new i(n), o = 0; o < n; o++)r[o] = t[o]; return r }, t.bufferToUint8Array = function (t) { if (i.prototype instanceof Uint8Array) return new Uint8Array(t.buffer, t.byteOffset, t.byteLength); for (var e = t.length, n = new Uint8Array(e), r = 0; r < e; r++)n[r] = t[r]; return n } }(t.BufferTools || (t.BufferTools = {})) }(u || (u = {})), function (t) { !function (e) { e.getCroppedBuffer = function (t, e, n, r) { void 0 === r && (r = 0); var i = new Uint8Array(n + r); return i.set(t.subarray(e, e + n)), i }, e.getCroppedAndAppendedByteArray = function (e, n, r, i) { return t.ArrayTools.concatUint8Arrays([e.subarray(n, n + r), i]) }, e.detectCompressionSourceEncoding = function (t) { if (null == t) throw new TypeError("detectCompressionSourceEncoding: input is null or undefined"); if ("string" == typeof t) return "String"; if (t instanceof Uint8Array || "function" == typeof i && i.isBuffer(t)) return "ByteArray"; throw new TypeError("detectCompressionSourceEncoding: input must be of type 'string', 'Uint8Array' or 'Buffer'") }, e.encodeCompressedBytes = function (e, n) { switch (n) { case "ByteArray": return e; case "Buffer": return t.BufferTools.uint8ArrayToBuffer(e); case "Base64": return t.encodeBase64(e); case "BinaryString": return t.encodeBinaryString(e); case "StorageBinaryString": return t.encodeStorageBinaryString(e); default: throw new TypeError("encodeCompressedBytes: invalid output encoding requested") } }, e.decodeCompressedBytes = function (e, n) { if (null == n) throw new TypeError("decodeCompressedData: Input is null or undefined"); switch (n) { case "ByteArray": case "Buffer": var r = t.BufferTools.convertToUint8ArrayIfNeeded(e); if (!(r instanceof Uint8Array)) throw new TypeError("decodeCompressedData: 'ByteArray' or 'Buffer' input type was specified but input is not a Uint8Array or Buffer"); return r; case "Base64": if ("string" != typeof e) throw new TypeError("decodeCompressedData: 'Base64' input type was specified but input is not a string"); return t.decodeBase64(e); case "BinaryString": if ("string" != typeof e) throw new TypeError("decodeCompressedData: 'BinaryString' input type was specified but input is not a string"); return t.decodeBinaryString(e); case "StorageBinaryString": if ("string" != typeof e) throw new TypeError("decodeCompressedData: 'StorageBinaryString' input type was specified but input is not a string"); return t.decodeStorageBinaryString(e); default: throw new TypeError("decodeCompressedData: invalid input encoding requested: '" + n + "'") } }, e.encodeDecompressedBytes = function (e, n) { switch (n) { case "String": return t.decodeUTF8(e); case "ByteArray": return e; case "Buffer": if ("function" != typeof i) throw new TypeError("encodeDecompressedBytes: a 'Buffer' type was specified but is not supported at the current envirnment"); return t.BufferTools.uint8ArrayToBuffer(e); default: throw new TypeError("encodeDecompressedBytes: invalid output encoding requested") } } }(t.CompressionCommon || (t.CompressionCommon = {})) }(u || (u = {})), function (t) { var e; !function (e) { var n, r = []; e.enqueueImmediate = function (t) { r.push(t), 1 === r.length && n() }, e.initializeScheduler = function () { var e = function () { for (var e = 0, n = r; e < n.length; e++) { var i = n[e]; try { i.call(void 0) } catch (e) { t.printExceptionAndStackTraceToConsole(e, "enqueueImmediate exception") } } r.length = 0 }; if (t.runningInNodeJS() && (n = function () { return o((function () { return e() })) }), "object" == typeof window && "function" == typeof window.addEventListener && "function" == typeof window.postMessage) { var i, u = "enqueueImmediate-" + Math.random().toString(); window.addEventListener("message", (function (t) { t.data === u && e() })), i = t.runningInNullOrigin() ? "*" : window.location.href, n = function () { return window.postMessage(u, i) } } else if ("function" == typeof MessageChannel && "function" == typeof MessagePort) { var s = new MessageChannel; s.port1.onmessage = function () { return e() }, n = function () { return s.port2.postMessage(0) } } else n = function () { return setTimeout((function () { return e() }), 0) } }, e.initializeScheduler() }(e = t.EventLoop || (t.EventLoop = {})), t.enqueueImmediate = function (t) { return e.enqueueImmediate(t) } }(u || (u = {})), function (t) { !function (t) { t.override = function (e, n) { return t.extend(e, n) }, t.extend = function (t, e) { if (null == t) throw new TypeError("obj is null or undefined"); if ("object" != typeof t) throw new TypeError("obj is not an object"); if (null == e && (e = {}), "object" != typeof e) throw new TypeError("newProperties is not an object"); if (null != e) for (var n in e) t[n] = e[n]; return t } }(t.ObjectTools || (t.ObjectTools = {})) }(u || (u = {})), function (t) { t.getRandomIntegerInRange = function (t, e) { return t + Math.floor(Math.random() * (e - t)) }, t.getRandomUTF16StringOfLength = function (e) { for (var n = "", r = 0; r < e; r++) { var i = void 0; do { i = t.getRandomIntegerInRange(0, 1114112) } while (i >= 55296 && i <= 57343); n += t.Encoding.CodePoint.decodeToString(i) } return n } }(u || (u = {})), function (t) { var e = function () { function t(t) { void 0 === t && (t = 1024), this.outputBufferCapacity = t, this.outputPosition = 0, this.outputString = "", this.outputBuffer = new Uint16Array(this.outputBufferCapacity) } return t.prototype.appendCharCode = function (t) { this.outputBuffer[this.outputPosition++] = t, this.outputPosition === this.outputBufferCapacity && this.flushBufferToOutputString() }, t.prototype.appendCharCodes = function (t) { for (var e = 0, n = t.length; e < n; e++)this.appendCharCode(t[e]) }, t.prototype.appendString = function (t) { for (var e = 0, n = t.length; e < n; e++)this.appendCharCode(t.charCodeAt(e)) }, t.prototype.appendCodePoint = function (t) { if (t <= 65535) this.appendCharCode(t); else { if (!(t <= 1114111)) throw new Error("appendCodePoint: A code point of " + t + " cannot be encoded in UTF-16"); this.appendCharCode(55296 + (t - 65536 >>> 10)), this.appendCharCode(56320 + (t - 65536 & 1023)) } }, t.prototype.getOutputString = function () { return this.flushBufferToOutputString(), this.outputString }, t.prototype.flushBufferToOutputString = function () { this.outputPosition === this.outputBufferCapacity ? this.outputString += String.fromCharCode.apply(null, this.outputBuffer) : this.outputString += String.fromCharCode.apply(null, this.outputBuffer.subarray(0, this.outputPosition)), this.outputPosition = 0 }, t }(); t.StringBuilder = e }(u || (u = {})), function (e) { var n = function () { function n() { this.restart() } return n.prototype.restart = function () { this.startTime = n.getTimestamp() }, n.prototype.getElapsedTime = function () { return n.getTimestamp() - this.startTime }, n.prototype.getElapsedTimeAndRestart = function () { var t = this.getElapsedTime(); return this.restart(), t }, n.prototype.logAndRestart = function (t, n) { void 0 === n && (n = !0); var r = this.getElapsedTime(), i = t + ": " + r.toFixed(3) + "ms"; return e.log(i, n), this.restart(), r }, n.getTimestamp = function () { return this.timestampFunc || this.createGlobalTimestampFunction(), this.timestampFunc() }, n.getMicrosecondTimestamp = function () { return Math.floor(1e3 * n.getTimestamp()) }, n.createGlobalTimestampFunction = function () { if ("object" == typeof t && "function" == typeof t.hrtime) { var e = 0; this.timestampFunc = function () { var n = t.hrtime(), r = 1e3 * n[0] + n[1] / 1e6; return e + r }, e = Date.now() - this.timestampFunc() } else if ("object" == typeof chrome && chrome.Interval) { var n = Date.now(), r = new chrome.Interval; r.start(), this.timestampFunc = function () { return n + r.microseconds() / 1e3 } } else if ("object" == typeof performance && performance.now) { var i = Date.now() - performance.now(); this.timestampFunc = function () { return i + performance.now() } } else Date.now ? this.timestampFunc = function () { return Date.now() } : this.timestampFunc = function () { return (new Date).getTime() } }, n }(); e.Timer = n }(u || (u = {})), function (t) { var e = function () { function e(e) { void 0 === e && (e = !0), this.MinimumSequenceLength = 4, this.MaximumSequenceLength = 31, this.MaximumMatchDistance = 32767, this.PrefixHashTableSize = 65537, this.inputBufferStreamOffset = 1, e && "function" == typeof Uint32Array ? this.prefixHashTable = new t.CompressorCustomHashTable(this.PrefixHashTableSize) : this.prefixHashTable = new t.CompressorSimpleHashTable(this.PrefixHashTableSize) } return e.prototype.compressBlock = function (e) { if (null == e) throw new TypeError("compressBlock: undefined or null input received"); return "string" == typeof e && (e = t.encodeUTF8(e)), e = t.BufferTools.convertToUint8ArrayIfNeeded(e), this.compressUtf8Block(e) }, e.prototype.compressUtf8Block = function (t) { if (!t || 0 == t.length) return new Uint8Array(0); var e = this.cropAndAddNewBytesToInputBuffer(t), n = this.inputBuffer, r = this.inputBuffer.length; this.outputBuffer = new Uint8Array(t.length), this.outputBufferPosition = 0; for (var i = 0, o = e; o < r; o++) { var u = n[o], s = o < i; if (o > r - this.MinimumSequenceLength) s || this.outputRawByte(u); else { var a = this.getBucketIndexForPrefix(o); if (!s) { var c = this.findLongestMatch(o, a); null != c && (this.outputPointerBytes(c.length, c.distance), i = o + c.length, s = !0) } s || this.outputRawByte(u); var f = this.inputBufferStreamOffset + o; this.prefixHashTable.addValueToBucket(a, f) } } return this.outputBuffer.subarray(0, this.outputBufferPosition) }, e.prototype.findLongestMatch = function (t, e) { var n = this.prefixHashTable.getArraySegmentForBucketIndex(e, this.reusableArraySegmentObject); if (null == n) return null; for (var r, i = this.inputBuffer, o = 0, u = 0; u < n.length; u++) { var s = n.getInReversedOrder(u) - this.inputBufferStreamOffset, a = t - s, c = void 0; if (c = void 0 === r ? this.MinimumSequenceLength - 1 : r < 128 && a >= 128 ? o + (o >>> 1) : o, a > this.MaximumMatchDistance || c >= this.MaximumSequenceLength || t + c >= i.length) break; if (i[s + c] === i[t + c]) for (var f = 0; ; f++) { if (t + f === i.length || i[s + f] !== i[t + f]) { f > c && (r = a, o = f); break } if (f === this.MaximumSequenceLength) return { distance: a, length: this.MaximumSequenceLength } } } return void 0 !== r ? { distance: r, length: o } : null }, e.prototype.getBucketIndexForPrefix = function (t) { return (7880599 * this.inputBuffer[t] + 39601 * this.inputBuffer[t + 1] + 199 * this.inputBuffer[t + 2] + this.inputBuffer[t + 3]) % this.PrefixHashTableSize }, e.prototype.outputPointerBytes = function (t, e) { e < 128 ? (this.outputRawByte(192 | t), this.outputRawByte(e)) : (this.outputRawByte(224 | t), this.outputRawByte(e >>> 8), this.outputRawByte(255 & e)) }, e.prototype.outputRawByte = function (t) { this.outputBuffer[this.outputBufferPosition++] = t }, e.prototype.cropAndAddNewBytesToInputBuffer = function (e) { if (void 0 === this.inputBuffer) return this.inputBuffer = e, 0; var n = Math.min(this.inputBuffer.length, this.MaximumMatchDistance), r = this.inputBuffer.length - n; return this.inputBuffer = t.CompressionCommon.getCroppedAndAppendedByteArray(this.inputBuffer, r, n, e), this.inputBufferStreamOffset += r, n }, e }(); t.Compressor = e }(u || (u = {})), function (t) { var e = function () { function e(t) { this.minimumBucketCapacity = 4, this.maximumBucketCapacity = 64, this.bucketLocators = new Uint32Array(2 * t), this.storage = new Uint32Array(2 * t), this.storageIndex = 1 } return e.prototype.addValueToBucket = function (e, n) { e <<= 1, this.storageIndex >= this.storage.length >>> 1 && this.compact(); var r, i = this.bucketLocators[e]; if (0 === i) i = this.storageIndex, r = 1, this.storage[this.storageIndex] = n, this.storageIndex += this.minimumBucketCapacity; else { (r = this.bucketLocators[e + 1]) === this.maximumBucketCapacity - 1 && (r = this.truncateBucketToNewerElements(i, r, this.maximumBucketCapacity / 2)); var o = i + r; 0 === this.storage[o] ? (this.storage[o] = n, o === this.storageIndex && (this.storageIndex += r)) : (t.ArrayTools.copyElements(this.storage, i, this.storage, this.storageIndex, r), i = this.storageIndex, this.storageIndex += r, this.storage[this.storageIndex++] = n, this.storageIndex += r), r++ } this.bucketLocators[e] = i, this.bucketLocators[e + 1] = r }, e.prototype.truncateBucketToNewerElements = function (e, n, r) { var i = e + n - r; return t.ArrayTools.copyElements(this.storage, i, this.storage, e, r), t.ArrayTools.zeroElements(this.storage, e + r, n - r), r }, e.prototype.compact = function () { var e = this.bucketLocators, n = this.storage; this.bucketLocators = new Uint32Array(this.bucketLocators.length), this.storageIndex = 1; for (var r = 0; r < e.length; r += 2) { var i = e[r + 1]; 0 !== i && (this.bucketLocators[r] = this.storageIndex, this.bucketLocators[r + 1] = i, this.storageIndex += Math.max(Math.min(2 * i, this.maximumBucketCapacity), this.minimumBucketCapacity)) } this.storage = new Uint32Array(8 * this.storageIndex); for (r = 0; r < e.length; r += 2) { var o = e[r]; if (0 !== o) { var u = this.bucketLocators[r], s = this.bucketLocators[r + 1]; t.ArrayTools.copyElements(n, o, this.storage, u, s) } } }, e.prototype.getArraySegmentForBucketIndex = function (e, n) { e <<= 1; var r = this.bucketLocators[e]; return 0 === r ? null : (void 0 === n && (n = new t.ArraySegment(this.storage, r, this.bucketLocators[e + 1])), n) }, e.prototype.getUsedBucketCount = function () { return Math.floor(t.ArrayTools.countNonzeroValuesInArray(this.bucketLocators) / 2) }, e.prototype.getTotalElementCount = function () { for (var t = 0, e = 0; e < this.bucketLocators.length; e += 2)t += this.bucketLocators[e + 1]; return t }, e }(); t.CompressorCustomHashTable = e }(u || (u = {})), function (t) { var e = function () { function e(t) { this.maximumBucketCapacity = 64, this.buckets = new Array(t) } return e.prototype.addValueToBucket = function (e, n) { var r = this.buckets[e]; void 0 === r ? this.buckets[e] = [n] : (r.length === this.maximumBucketCapacity - 1 && t.ArrayTools.truncateStartingElements(r, this.maximumBucketCapacity / 2), r.push(n)) }, e.prototype.getArraySegmentForBucketIndex = function (e, n) { var r = this.buckets[e]; return void 0 === r ? null : (void 0 === n && (n = new t.ArraySegment(r, 0, r.length)), n) }, e.prototype.getUsedBucketCount = function () { return t.ArrayTools.countNonzeroValuesInArray(this.buckets) }, e.prototype.getTotalElementCount = function () { for (var t = 0, e = 0; e < this.buckets.length; e++)void 0 !== this.buckets[e] && (t += this.buckets[e].length); return t }, e }(); t.CompressorSimpleHashTable = e }(u || (u = {})), function (t) { var e = function () { function e() { this.MaximumMatchDistance = 32767, this.outputPosition = 0 } return e.prototype.decompressBlockToString = function (e) { return e = t.BufferTools.convertToUint8ArrayIfNeeded(e), t.decodeUTF8(this.decompressBlock(e)) }, e.prototype.decompressBlock = function (e) { this.inputBufferRemainder && (e = t.ArrayTools.concatUint8Arrays([this.inputBufferRemainder, e]), this.inputBufferRemainder = void 0); for (var n = this.cropOutputBufferToWindowAndInitialize(Math.max(4 * e.length, 1024)), r = 0, i = e.length; r < i; r++) { var o = e[r]; if (o >>> 6 == 3) { var u = o >>> 5; if (r == i - 1 || r == i - 2 && 7 == u) { this.inputBufferRemainder = e.subarray(r); break } if (e[r + 1] >>> 7 == 1) this.outputByte(o); else { var s = 31 & o, a = void 0; 6 == u ? (a = e[r + 1], r += 1) : (a = e[r + 1] << 8 | e[r + 2], r += 2); for (var c = this.outputPosition - a, f = 0; f < s; f++)this.outputByte(this.outputBuffer[c + f]) } } else this.outputByte(o) } return this.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence(), t.CompressionCommon.getCroppedBuffer(this.outputBuffer, n, this.outputPosition - n) }, e.prototype.outputByte = function (e) { this.outputPosition === this.outputBuffer.length && (this.outputBuffer = t.ArrayTools.doubleByteArrayCapacity(this.outputBuffer)), this.outputBuffer[this.outputPosition++] = e }, e.prototype.cropOutputBufferToWindowAndInitialize = function (e) { if (!this.outputBuffer) return this.outputBuffer = new Uint8Array(e), 0; var n = Math.min(this.outputPosition, this.MaximumMatchDistance); if (this.outputBuffer = t.CompressionCommon.getCroppedBuffer(this.outputBuffer, this.outputPosition - n, n, e), this.outputPosition = n, this.outputBufferRemainder) { for (var r = 0; r < this.outputBufferRemainder.length; r++)this.outputByte(this.outputBufferRemainder[r]); this.outputBufferRemainder = void 0 } return n }, e.prototype.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence = function () { for (var t = 1; t <= 4 && this.outputPosition - t >= 0; t++) { var e = this.outputBuffer[this.outputPosition - t]; if (t < 4 && e >>> 3 == 30 || t < 3 && e >>> 4 == 14 || t < 2 && e >>> 5 == 6) return this.outputBufferRemainder = this.outputBuffer.subarray(this.outputPosition - t, this.outputPosition), void (this.outputPosition -= t) } }, e }(); t.Decompressor = e }(u || (u = {})), function (t) { !function (e) { !function (e) { var n = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47]), r = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 255, 255, 255, 255]); e.encode = function (n) { return n && 0 != n.length ? t.runningInNodeJS() ? t.BufferTools.uint8ArrayToBuffer(n).toString("base64") : e.encodeWithJS(n) : "" }, e.decode = function (n) { return n ? t.runningInNodeJS() ? t.BufferTools.bufferToUint8Array(new i(n, "base64")) : e.decodeWithJS(n) : new Uint8Array(0) }, e.encodeWithJS = function (e, r) { if (void 0 === r && (r = !0), !e || 0 == e.length) return ""; for (var i, o = n, u = new t.StringBuilder, s = 0, a = e.length; s < a; s += 3)s <= a - 3 ? (i = e[s] << 16 | e[s + 1] << 8 | e[s + 2], u.appendCharCode(o[i >>> 18 & 63]), u.appendCharCode(o[i >>> 12 & 63]), u.appendCharCode(o[i >>> 6 & 63]), u.appendCharCode(o[63 & i]), i = 0) : s === a - 2 ? (i = e[s] << 16 | e[s + 1] << 8, u.appendCharCode(o[i >>> 18 & 63]), u.appendCharCode(o[i >>> 12 & 63]), u.appendCharCode(o[i >>> 6 & 63]), r && u.appendCharCode(61)) : s === a - 1 && (i = e[s] << 16, u.appendCharCode(o[i >>> 18 & 63]), u.appendCharCode(o[i >>> 12 & 63]), r && (u.appendCharCode(61), u.appendCharCode(61))); return u.getOutputString() }, e.decodeWithJS = function (t, e) { if (!t || 0 == t.length) return new Uint8Array(0); var n = t.length % 4; if (1 === n) throw new Error("Invalid Base64 string: length % 4 == 1"); 2 === n ? t += "==" : 3 === n && (t += "="), e || (e = new Uint8Array(t.length)); for (var i = 0, o = t.length, u = 0; u < o; u += 4) { var s = r[t.charCodeAt(u)] << 18 | r[t.charCodeAt(u + 1)] << 12 | r[t.charCodeAt(u + 2)] << 6 | r[t.charCodeAt(u + 3)]; e[i++] = s >>> 16 & 255, e[i++] = s >>> 8 & 255, e[i++] = 255 & s } return 61 == t.charCodeAt(o - 1) && i--, 61 == t.charCodeAt(o - 2) && i--, e.subarray(0, i) } }(e.Base64 || (e.Base64 = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { !function (e) { !function (e) { e.encode = function (e) { if (null == e) throw new TypeError("BinaryString.encode: undefined or null input received"); if (0 === e.length) return ""; for (var n = e.length, r = new t.StringBuilder, i = 0, o = 1, u = 0; u < n; u += 2) { var s = void 0; s = u == n - 1 ? e[u] << 8 : e[u] << 8 | e[u + 1], r.appendCharCode(i << 16 - o | s >>> o), i = s & (1 << o) - 1, 15 === o ? (r.appendCharCode(i), i = 0, o = 1) : o += 1, u >= n - 2 && r.appendCharCode(i << 16 - o) } return r.appendCharCode(32768 | n % 2), r.getOutputString() }, e.decode = function (t) { if ("string" != typeof t) throw new TypeError("BinaryString.decode: invalid input type"); if ("" == t) return new Uint8Array(0); for (var e = new Uint8Array(3 * t.length), n = 0, r = function (t) { e[n++] = t >>> 8, e[n++] = 255 & t }, i = 0, o = 0, u = 0; u < t.length; u++) { var s = t.charCodeAt(u); s >= 32768 ? (32769 == s && n--, o = 0) : (0 == o ? i = s : (r(i << o | s >>> 15 - o), i = s & (1 << 15 - o) - 1), 15 == o ? o = 0 : o += 1) } return e.subarray(0, n) } }(e.BinaryString || (e.BinaryString = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { !function (t) { !function (t) { t.encodeFromString = function (t, e) { var n = t.charCodeAt(e); if (n < 55296 || n > 56319) return n; var r = t.charCodeAt(e + 1); if (r >= 56320 && r <= 57343) return r - 56320 + (n - 55296 << 10) + 65536; throw new Error("getUnicodeCodePoint: Received a lead surrogate character, char code " + n + ", followed by " + r + ", which is not a trailing surrogate character code.") }, t.decodeToString = function (t) { if (t <= 65535) return String.fromCharCode(t); if (t <= 1114111) return String.fromCharCode(55296 + (t - 65536 >>> 10), 56320 + (t - 65536 & 1023)); throw new Error("getStringFromUnicodeCodePoint: A code point of " + t + " cannot be encoded in UTF-16") } }(t.CodePoint || (t.CodePoint = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { !function (t) { !function (t) { var e = ["000", "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015", "016", "017", "018", "019", "020", "021", "022", "023", "024", "025", "026", "027", "028", "029", "030", "031", "032", "033", "034", "035", "036", "037", "038", "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049", "050", "051", "052", "053", "054", "055", "056", "057", "058", "059", "060", "061", "062", "063", "064", "065", "066", "067", "068", "069", "070", "071", "072", "073", "074", "075", "076", "077", "078", "079", "080", "081", "082", "083", "084", "085", "086", "087", "088", "089", "090", "091", "092", "093", "094", "095", "096", "097", "098", "099", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255"]; t.encode = function (t) { for (var n = [], r = 0; r < t.length; r++)n.push(e[t[r]]); return n.join(" ") } }(t.DecimalString || (t.DecimalString = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { !function (t) { !function (e) { e.encode = function (e) { return t.BinaryString.encode(e).replace(/\0/g, "耂") }, e.decode = function (e) { return t.BinaryString.decode(e.replace(/\u8002/g, "\0")) } }(t.StorageBinaryString || (t.StorageBinaryString = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { !function (e) { !function (n) { var r, o; n.encode = function (e) { return e && 0 != e.length ? t.runningInNodeJS() ? t.BufferTools.bufferToUint8Array(new i(e, "utf8")) : n.createNativeTextEncoderAndDecoderIfAvailable() ? r.encode(e) : n.encodeWithJS(e) : new Uint8Array(0) }, n.decode = function (e) { return e && 0 != e.length ? t.runningInNodeJS() ? t.BufferTools.uint8ArrayToBuffer(e).toString("utf8") : n.createNativeTextEncoderAndDecoderIfAvailable() ? o.decode(e) : n.decodeWithJS(e) : "" }, n.encodeWithJS = function (t, n) { if (!t || 0 == t.length) return new Uint8Array(0); n || (n = new Uint8Array(4 * t.length)); for (var r = 0, i = 0; i < t.length; i++) { var o = e.CodePoint.encodeFromString(t, i); if (o <= 127) n[r++] = o; else if (o <= 2047) n[r++] = 192 | o >>> 6, n[r++] = 128 | 63 & o; else if (o <= 65535) n[r++] = 224 | o >>> 12, n[r++] = 128 | o >>> 6 & 63, n[r++] = 128 | 63 & o; else { if (!(o <= 1114111)) throw new Error("Invalid UTF-16 string: Encountered a character unsupported by UTF-8/16 (RFC 3629)"); n[r++] = 240 | o >>> 18, n[r++] = 128 | o >>> 12 & 63, n[r++] = 128 | o >>> 6 & 63, n[r++] = 128 | 63 & o, i++ } } return n.subarray(0, r) }, n.decodeWithJS = function (e, n, r) { if (void 0 === n && (n = 0), !e || 0 == e.length) return ""; void 0 === r && (r = e.length); for (var i, o, u = new t.StringBuilder, s = n, a = r; s < a;) { if ((o = e[s]) >>> 7 == 0) i = o, s += 1; else if (o >>> 5 == 6) { if (s + 1 >= r) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + s); i = (31 & o) << 6 | 63 & e[s + 1], s += 2 } else if (o >>> 4 == 14) { if (s + 2 >= r) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + s); i = (15 & o) << 12 | (63 & e[s + 1]) << 6 | 63 & e[s + 2], s += 3 } else { if (o >>> 3 != 30) throw new Error("Invalid UTF-8 stream: An invalid lead byte value encountered at position " + s); if (s + 3 >= r) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + s); i = (7 & o) << 18 | (63 & e[s + 1]) << 12 | (63 & e[s + 2]) << 6 | 63 & e[s + 3], s += 4 } u.appendCodePoint(i) } return u.getOutputString() }, n.createNativeTextEncoderAndDecoderIfAvailable = function () { return !!r || "function" == typeof TextEncoder && (r = new TextEncoder("utf-8"), o = new TextDecoder("utf-8"), !0) } }(e.UTF8 || (e.UTF8 = {})) }(t.Encoding || (t.Encoding = {})) }(u || (u = {})), function (t) { t.compress = function (e, n) { if (void 0 === n && (n = {}), null == e) throw new TypeError("compress: undefined or null input received"); var r = t.CompressionCommon.detectCompressionSourceEncoding(e); n = t.ObjectTools.override({ inputEncoding: r, outputEncoding: "ByteArray" }, n); var i = (new t.Compressor).compressBlock(e); return t.CompressionCommon.encodeCompressedBytes(i, n.outputEncoding) }, t.decompress = function (e, n) { if (void 0 === n && (n = {}), null == e) throw new TypeError("decompress: undefined or null input received"); n = t.ObjectTools.override({ inputEncoding: "ByteArray", outputEncoding: "String" }, n); var r = t.CompressionCommon.decodeCompressedBytes(e, n.inputEncoding), i = (new t.Decompressor).decompressBlock(r); return t.CompressionCommon.encodeDecompressedBytes(i, n.outputEncoding) }, t.compressAsync = function (e, n, r) { var i; null == r && (r = function () { }); try { i = t.CompressionCommon.detectCompressionSourceEncoding(e) } catch (t) { return void r(void 0, t) } n = t.ObjectTools.override({ inputEncoding: i, outputEncoding: "ByteArray", useWebWorker: !0, blockSize: 65536 }, n), t.enqueueImmediate((function () { n.useWebWorker && t.WebWorker.createGlobalWorkerIfNeeded() ? t.WebWorker.compressAsync(e, n, r) : t.AsyncCompressor.compressAsync(e, n, r) })) }, t.decompressAsync = function (e, n, r) { if (null == r && (r = function () { }), null != e) { n = t.ObjectTools.override({ inputEncoding: "ByteArray", outputEncoding: "String", useWebWorker: !0, blockSize: 65536 }, n); var i = t.BufferTools.convertToUint8ArrayIfNeeded(e); t.EventLoop.enqueueImmediate((function () { n.useWebWorker && t.WebWorker.createGlobalWorkerIfNeeded() ? t.WebWorker.decompressAsync(i, n, r) : t.AsyncDecompressor.decompressAsync(e, n, r) })) } else r(void 0, new TypeError("decompressAsync: undefined or null input received")) }, t.createCompressionStream = function () { return t.AsyncCompressor.createCompressionStream() }, t.createDecompressionStream = function () { return t.AsyncDecompressor.createDecompressionStream() }, t.encodeUTF8 = function (e) { return t.Encoding.UTF8.encode(e) }, t.decodeUTF8 = function (e) { return t.Encoding.UTF8.decode(e) }, t.encodeBase64 = function (e) { return t.Encoding.Base64.encode(e) }, t.decodeBase64 = function (e) { return t.Encoding.Base64.decode(e) }, t.encodeBinaryString = function (e) { return t.Encoding.BinaryString.encode(e) }, t.decodeBinaryString = function (e) { return t.Encoding.BinaryString.decode(e) }, t.encodeStorageBinaryString = function (e) { return t.Encoding.StorageBinaryString.encode(e) }, t.decodeStorageBinaryString = function (e) { return t.Encoding.StorageBinaryString.decode(e) } }(u || (u = {}))
	}).call(this, n(4), n(90)(t), n(3), n(2).Buffer, n(28).setImmediate)
}, function (t, e) { t.exports = function (t) { return t.webpackPolyfill || (t.deprecate = function () { }, t.paths = [], t.children || (t.children = []), Object.defineProperty(t, "loaded", { enumerable: !0, get: function () { return t.l } }), Object.defineProperty(t, "id", { enumerable: !0, get: function () { return t.i } }), t.webpackPolyfill = 1), t } }, function (t, e, n) { "use strict"; const { pipe: r, intersection: i, indexOf: o, curry: u, __: s, slice: a, split: c, join: f, map: h } = n(10), { zeroPad: l, nTobin: p, stepMap: d, binToByte: y } = n(15); t.exports = { zwcOperations: t => { const e = r(o(s, t), p, l(2)), n = (e, n, r) => (e && n ? t[0] : n ? t[1] : t[2]) + d((e, n) => (e => t[parseInt(e, 2)])(r[n] + r[n + 1]))(2, new Array(r.length).fill()).join(""); return { detach: e => { const n = e.split(" ").reduce((e, n) => { const r = n.split(""); if (0 !== i(t, r).length) { const e = r.findIndex((e, n) => !~t.indexOf(e)); return n.slice(0, e) } return e }, ""); if (!n) throw new Error("Invisible stream not detected! Please copy and paste the StegCloak text sent by the sender."); return n }, concealToData: n => { const { encrypt: i, integrity: o } = (e => { const n = t.indexOf(e[0]); return 0 === n ? { encrypt: !0, integrity: !0 } : 1 === n ? { encrypt: !0, integrity: !1 } : 2 === n ? { encrypt: !1, integrity: !1 } : void 0 })(n); return { encrypt: i, integrity: o, data: r(a(1, 1 / 0), c(""), h(e), f(""), y)(n) } }, toConcealHmac: u(n)(!0)(!0), toConceal: u(n)(!1)(!0), noCrypt: u(n)(!1)(!1) } }, embed: (t, e) => { const n = t.split(" "), r = Math.floor(Math.random() * Math.floor(n.length / 2)); return n.slice(0, r + 1).concat([e + n[r + 1]]).concat(n.slice(r + 2, n.length)).join(" ") } } }]);

// CRYPTICO LIB
var dbits, canary = 0xdeadbeefcafe, j_lm = 15715070 == (16777215 & canary); function BigInteger(t, r, i) { null != t && ("number" == typeof t ? this.fromNumber(t, r, i) : null == r && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, r)) } function nbi() { return new BigInteger(null) } function am1(t, r, i, n, e, o) { for (; --o >= 0;) { var s = r * this[t++] + i[n] + e; e = Math.floor(s / 67108864); i[n++] = 67108863 & s } return e } function am2(t, r, i, n, e, o) { var s = 32767 & r; for (r >>= 15; --o >= 0;) { var h = 32767 & this[t], a = this[t++] >> 15, u = r * h + a * s; e = ((h = s * h + ((32767 & u) << 15) + i[n] + (1073741823 & e)) >>> 30) + (u >>> 15) + r * a + (e >>> 30); i[n++] = 1073741823 & h } return e } function am3(t, r, i, n, e, o) { var s = 16383 & r; for (r >>= 14; --o >= 0;) { var h = 16383 & this[t], a = this[t++] >> 14, u = r * h + a * s; e = ((h = s * h + ((16383 & u) << 14) + i[n] + e) >> 28) + (u >> 14) + r * a; i[n++] = 268435455 & h } return e } j_lm && "Microsoft Internet Explorer" == navigator.appName ? (BigInteger.prototype.am = am2, dbits = 30) : j_lm && "Netscape" != navigator.appName ? (BigInteger.prototype.am = am1, dbits = 26) : (BigInteger.prototype.am = am3, dbits = 28), BigInteger.prototype.DB = dbits, BigInteger.prototype.DM = (1 << dbits) - 1, BigInteger.prototype.DV = 1 << dbits; var BI_FP = 52; BigInteger.prototype.FV = Math.pow(2, BI_FP), BigInteger.prototype.F1 = BI_FP - dbits, BigInteger.prototype.F2 = 2 * dbits - BI_FP; var rr, vv, BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz", BI_RC = []; for (rr = "0".charCodeAt(0), vv = 0; vv <= 9; ++vv)BI_RC[rr++] = vv; for (rr = "a".charCodeAt(0), vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; for (rr = "A".charCodeAt(0), vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; function int2char(t) { return BI_RM.charAt(t) } function intAt(t, r) { var i = BI_RC[t.charCodeAt(r)]; return null == i ? -1 : i } function bnpCopyTo(t) { for (var r = this.t - 1; r >= 0; --r)t[r] = this[r]; t.t = this.t, t.s = this.s } function bnpFromInt(t) { this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + DV : this.t = 0 } function nbv(t) { var r = nbi(); return r.fromInt(t), r } function bnpFromString(t, r) { var i; if (16 == r) i = 4; else if (8 == r) i = 3; else if (256 == r) i = 8; else if (2 == r) i = 1; else if (32 == r) i = 5; else { if (4 != r) return void this.fromRadix(t, r); i = 2 } this.s = this.t = 0; for (var n = t.length, e = !1, o = 0; --n >= 0;) { var s = 8 == i ? 255 & t[n] : intAt(t, n); s < 0 ? "-" == t.charAt(n) && (e = !0) : (e = !1, 0 == o ? this[this.t++] = s : o + i > this.DB ? (this[this.t - 1] |= (s & (1 << this.DB - o) - 1) << o, this[this.t++] = s >> this.DB - o) : this[this.t - 1] |= s << o, (o += i) >= this.DB && (o -= this.DB)) } 8 == i && 0 != (128 & t[0]) && (this.s = -1, o > 0 && (this[this.t - 1] |= (1 << this.DB - o) - 1 << o)), this.clamp(), e && BigInteger.ZERO.subTo(this, this) } function bnpClamp() { for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;)--this.t } function bnToString(t) { if (this.s < 0) return "-" + this.negate().toString(t); if (16 == t) t = 4; else if (8 == t) t = 3; else if (2 == t) t = 1; else if (32 == t) t = 5; else if (64 == t) t = 6; else { if (4 != t) return this.toRadix(t); t = 2 } var r, i = (1 << t) - 1, n = !1, e = "", o = this.t, s = this.DB - o * this.DB % t; if (o-- > 0) for (s < this.DB && (r = this[o] >> s) > 0 && (n = !0, e = int2char(r)); o >= 0;)s < t ? (r = (this[o] & (1 << s) - 1) << t - s, r |= this[--o] >> (s += this.DB - t)) : (r = this[o] >> (s -= t) & i, s <= 0 && (s += this.DB, --o)), r > 0 && (n = !0), n && (e += int2char(r)); return n ? e : "0" } function bnNegate() { var t = nbi(); return BigInteger.ZERO.subTo(this, t), t } function bnAbs() { return this.s < 0 ? this.negate() : this } function bnCompareTo(t) { if (0 != (r = this.s - t.s)) return r; var r, i = this.t; if (0 != (r = i - t.t)) return r; for (; --i >= 0;)if (0 != (r = this[i] - t[i])) return r; return 0 } function nbits(t) { var r, i = 1; return 0 != (r = t >>> 16) && (t = r, i += 16), 0 != (r = t >> 8) && (t = r, i += 8), 0 != (r = t >> 4) && (t = r, i += 4), 0 != (r = t >> 2) && (t = r, i += 2), t >> 1 != 0 && (i += 1), i } function bnBitLength() { return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM) } function bnpDLShiftTo(t, r) { var i; for (i = this.t - 1; i >= 0; --i)r[i + t] = this[i]; for (i = t - 1; i >= 0; --i)r[i] = 0; r.t = this.t + t, r.s = this.s } function bnpDRShiftTo(t, r) { for (var i = t; i < this.t; ++i)r[i - t] = this[i]; r.t = Math.max(this.t - t, 0), r.s = this.s } function bnpLShiftTo(t, r) { var i, n = t % this.DB, e = this.DB - n, o = (1 << e) - 1, s = Math.floor(t / this.DB), h = this.s << n & this.DM; for (i = this.t - 1; i >= 0; --i)r[i + s + 1] = this[i] >> e | h, h = (this[i] & o) << n; for (i = s - 1; i >= 0; --i)r[i] = 0; r[s] = h, r.t = this.t + s + 1, r.s = this.s, r.clamp() } function bnpRShiftTo(t, r) { r.s = this.s; var i = Math.floor(t / this.DB); if (i >= this.t) r.t = 0; else { var n = t % this.DB, e = this.DB - n, o = (1 << n) - 1; r[0] = this[i] >> n; for (var s = i + 1; s < this.t; ++s)r[s - i - 1] |= (this[s] & o) << e, r[s - i] = this[s] >> n; n > 0 && (r[this.t - i - 1] |= (this.s & o) << e), r.t = this.t - i, r.clamp() } } function bnpSubTo(t, r) { for (var i = 0, n = 0, e = Math.min(t.t, this.t); i < e;)n += this[i] - t[i], r[i++] = n & this.DM, n >>= this.DB; if (t.t < this.t) { for (n -= t.s; i < this.t;)n += this[i], r[i++] = n & this.DM, n >>= this.DB; n += this.s } else { for (n += this.s; i < t.t;)n -= t[i], r[i++] = n & this.DM, n >>= this.DB; n -= t.s } r.s = n < 0 ? -1 : 0, n < -1 ? r[i++] = this.DV + n : n > 0 && (r[i++] = n), r.t = i, r.clamp() } function bnpMultiplyTo(t, r) { var i = this.abs(), n = t.abs(), e = i.t; for (r.t = e + n.t; --e >= 0;)r[e] = 0; for (e = 0; e < n.t; ++e)r[e + i.t] = i.am(0, n[e], r, e, 0, i.t); r.s = 0, r.clamp(), this.s != t.s && BigInteger.ZERO.subTo(r, r) } function bnpSquareTo(t) { for (var r = this.abs(), i = t.t = 2 * r.t; --i >= 0;)t[i] = 0; for (i = 0; i < r.t - 1; ++i) { var n = r.am(i, r[i], t, 2 * i, 0, 1); (t[i + r.t] += r.am(i + 1, 2 * r[i], t, 2 * i + 1, n, r.t - i - 1)) >= r.DV && (t[i + r.t] -= r.DV, t[i + r.t + 1] = 1) } t.t > 0 && (t[t.t - 1] += r.am(i, r[i], t, 2 * i, 0, 1)), t.s = 0, t.clamp() } function bnpDivRemTo(t, r, i) { var n = t.abs(); if (!(n.t <= 0)) { var e = this.abs(); if (e.t < n.t) null != r && r.fromInt(0), null != i && this.copyTo(i); else { null == i && (i = nbi()); var o = nbi(), s = this.s, h = (t = t.s, this.DB - nbits(n[n.t - 1])); if (h > 0 ? (n.lShiftTo(h, o), e.lShiftTo(h, i)) : (n.copyTo(o), e.copyTo(i)), 0 != (e = o[(n = o.t) - 1])) { var a = e * (1 << this.F1) + (n > 1 ? o[n - 2] >> this.F2 : 0), u = this.FV / a, p = (a = (1 << this.F1) / a, 1 << this.F2), g = i.t, f = g - n, c = null == r ? nbi() : r; for (o.dlShiftTo(f, c), i.compareTo(c) >= 0 && (i[i.t++] = 1, i.subTo(c, i)), BigInteger.ONE.dlShiftTo(n, c), c.subTo(o, o); o.t < n;)o[o.t++] = 0; for (; --f >= 0;) { var l = i[--g] == e ? this.DM : Math.floor(i[g] * u + (i[g - 1] + p) * a); if ((i[g] += o.am(0, l, i, f, 0, n)) < l) for (o.dlShiftTo(f, c), i.subTo(c, i); i[g] < --l;)i.subTo(c, i) } null != r && (i.drShiftTo(n, r), s != t && BigInteger.ZERO.subTo(r, r)), i.t = n, i.clamp(), h > 0 && i.rShiftTo(h, i), s < 0 && BigInteger.ZERO.subTo(i, i) } } } } function bnMod(t) { var r = nbi(); return this.abs().divRemTo(t, null, r), this.s < 0 && r.compareTo(BigInteger.ZERO) > 0 && t.subTo(r, r), r } function Classic(t) { this.m = t } function cConvert(t) { return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t } function cRevert(t) { return t } function cReduce(t) { t.divRemTo(this.m, null, t) } function cMulTo(t, r, i) { t.multiplyTo(r, i), this.reduce(i) } function cSqrTo(t, r) { t.squareTo(r), this.reduce(r) } function bnpInvDigit() { if (this.t < 1) return 0; var t, r = this[0]; return 0 == (1 & r) ? 0 : (t = (t = (t = (t = (t = 3 & r) * (2 - (15 & r) * t) & 15) * (2 - (255 & r) * t) & 255) * (2 - ((65535 & r) * t & 65535)) & 65535) * (2 - r * t % this.DV) % this.DV) > 0 ? this.DV - t : -t } function Montgomery(t) { this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t } function montConvert(t) { var r = nbi(); return t.abs().dlShiftTo(this.m.t, r), r.divRemTo(this.m, null, r), t.s < 0 && r.compareTo(BigInteger.ZERO) > 0 && this.m.subTo(r, r), r } function montRevert(t) { var r = nbi(); return t.copyTo(r), this.reduce(r), r } function montReduce(t) { for (; t.t <= this.mt2;)t[t.t++] = 0; for (var r = 0; r < this.m.t; ++r) { var i, n = (i = 32767 & t[r]) * this.mpl + ((i * this.mph + (t[r] >> 15) * this.mpl & this.um) << 15) & t.DM; for (t[i = r + this.m.t] += this.m.am(0, n, t, r, 0, this.m.t); t[i] >= t.DV;)t[i] -= t.DV, t[++i]++ } t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t) } function montSqrTo(t, r) { t.squareTo(r), this.reduce(r) } function montMulTo(t, r, i) { t.multiplyTo(r, i), this.reduce(i) } function bnpIsEven() { return 0 == (this.t > 0 ? 1 & this[0] : this.s) } function bnpExp(t, r) { if (t > 4294967295 || t < 1) return BigInteger.ONE; var i = nbi(), n = nbi(), e = r.convert(this), o = nbits(t) - 1; for (e.copyTo(i); --o >= 0;)if (r.sqrTo(i, n), (t & 1 << o) > 0) r.mulTo(n, e, i); else { var s = i; i = n, n = s } return r.revert(i) } function bnModPowInt(t, r) { var i; return i = t < 256 || r.isEven() ? new Classic(r) : new Montgomery(r), this.exp(t, i) } function bnClone() { var t = nbi(); return this.copyTo(t), t } function bnIntValue() { if (this.s < 0) { if (1 == this.t) return this[0] - this.DV; if (0 == this.t) return -1 } else { if (1 == this.t) return this[0]; if (0 == this.t) return 0 } return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0] } function bnByteValue() { return 0 == this.t ? this.s : this[0] << 24 >> 24 } function bnShortValue() { return 0 == this.t ? this.s : this[0] << 16 >> 16 } function bnpChunkSize(t) { return Math.floor(Math.LN2 * this.DB / Math.log(t)) } function bnSigNum() { return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1 } function bnpToRadix(t) { if (null == t && (t = 10), 0 == this.signum() || t < 2 || t > 36) return "0"; var r = this.chunkSize(t), i = nbv(r = Math.pow(t, r)), n = nbi(), e = nbi(), o = ""; for (this.divRemTo(i, n, e); n.signum() > 0;)o = (r + e.intValue()).toString(t).substr(1) + o, n.divRemTo(i, n, e); return e.intValue().toString(t) + o } function bnpFromRadix(t, r) { this.fromInt(0), null == r && (r = 10); for (var i = this.chunkSize(r), n = Math.pow(r, i), e = !1, o = 0, s = 0, h = 0; h < t.length; ++h) { var a = intAt(t, h); a < 0 ? "-" == t.charAt(h) && 0 == this.signum() && (e = !0) : (s = r * s + a, ++o >= i && (this.dMultiply(n), this.dAddOffset(s, 0), s = o = 0)) } o > 0 && (this.dMultiply(Math.pow(r, o)), this.dAddOffset(s, 0)), e && BigInteger.ZERO.subTo(this, this) } function bnpFromNumber(t, r, i) { if ("number" == typeof r) if (t < 2) this.fromInt(1); else for (this.fromNumber(t, i), this.testBit(t - 1) || this.bitwiseTo(BigInteger.ONE.shiftLeft(t - 1), op_or, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(r);)this.dAddOffset(2, 0), this.bitLength() > t && this.subTo(BigInteger.ONE.shiftLeft(t - 1), this); else { var n = 7 & t; (i = []).length = 1 + (t >> 3), r.nextBytes(i), n > 0 ? i[0] &= (1 << n) - 1 : i[0] = 0, this.fromString(i, 256) } } function bnToByteArray() { var t = this.t, r = []; r[0] = this.s; var i, n = this.DB - t * this.DB % 8, e = 0; if (t-- > 0) for (n < this.DB && (i = this[t] >> n) != (this.s & this.DM) >> n && (r[e++] = i | this.s << this.DB - n); t >= 0;)n < 8 ? (i = (this[t] & (1 << n) - 1) << 8 - n, i |= this[--t] >> (n += this.DB - 8)) : (i = this[t] >> (n -= 8) & 255, n <= 0 && (n += this.DB, --t)), 0 != (128 & i) && (i |= -256), 0 == e && (128 & this.s) != (128 & i) && ++e, (e > 0 || i != this.s) && (r[e++] = i); return r } function bnEquals(t) { return 0 == this.compareTo(t) } function bnMin(t) { return this.compareTo(t) < 0 ? this : t } function bnMax(t) { return this.compareTo(t) > 0 ? this : t } function bnpBitwiseTo(t, r, i) { var n, e, o = Math.min(t.t, this.t); for (n = 0; n < o; ++n)i[n] = r(this[n], t[n]); if (t.t < this.t) { for (e = t.s & this.DM, n = o; n < this.t; ++n)i[n] = r(this[n], e); i.t = this.t } else { for (e = this.s & this.DM, n = o; n < t.t; ++n)i[n] = r(e, t[n]); i.t = t.t } i.s = r(this.s, t.s), i.clamp() } function op_and(t, r) { return t & r } function bnAnd(t) { var r = nbi(); return this.bitwiseTo(t, op_and, r), r } function op_or(t, r) { return t | r } function bnOr(t) { var r = nbi(); return this.bitwiseTo(t, op_or, r), r } function op_xor(t, r) { return t ^ r } function bnXor(t) { var r = nbi(); return this.bitwiseTo(t, op_xor, r), r } function op_andnot(t, r) { return t & ~r } function bnAndNot(t) { var r = nbi(); return this.bitwiseTo(t, op_andnot, r), r } function bnNot() { for (var t = nbi(), r = 0; r < this.t; ++r)t[r] = this.DM & ~this[r]; return t.t = this.t, t.s = ~this.s, t } function bnShiftLeft(t) { var r = nbi(); return t < 0 ? this.rShiftTo(-t, r) : this.lShiftTo(t, r), r } function bnShiftRight(t) { var r = nbi(); return t < 0 ? this.lShiftTo(-t, r) : this.rShiftTo(t, r), r } function lbit(t) { if (0 == t) return -1; var r = 0; return 0 == (65535 & t) && (t >>= 16, r += 16), 0 == (255 & t) && (t >>= 8, r += 8), 0 == (15 & t) && (t >>= 4, r += 4), 0 == (3 & t) && (t >>= 2, r += 2), 0 == (1 & t) && ++r, r } function bnGetLowestSetBit() { for (var t = 0; t < this.t; ++t)if (0 != this[t]) return t * this.DB + lbit(this[t]); return this.s < 0 ? this.t * this.DB : -1 } function cbit(t) { for (var r = 0; 0 != t;)t &= t - 1, ++r; return r } function bnBitCount() { for (var t = 0, r = this.s & this.DM, i = 0; i < this.t; ++i)t += cbit(this[i] ^ r); return t } function bnTestBit(t) { var r = Math.floor(t / this.DB); return r >= this.t ? 0 != this.s : 0 != (this[r] & 1 << t % this.DB) } function bnpChangeBit(t, r) { var i = BigInteger.ONE.shiftLeft(t); return this.bitwiseTo(i, r, i), i } function bnSetBit(t) { return this.changeBit(t, op_or) } function bnClearBit(t) { return this.changeBit(t, op_andnot) } function bnFlipBit(t) { return this.changeBit(t, op_xor) } function bnpAddTo(t, r) { for (var i = 0, n = 0, e = Math.min(t.t, this.t); i < e;)n += this[i] + t[i], r[i++] = n & this.DM, n >>= this.DB; if (t.t < this.t) { for (n += t.s; i < this.t;)n += this[i], r[i++] = n & this.DM, n >>= this.DB; n += this.s } else { for (n += this.s; i < t.t;)n += t[i], r[i++] = n & this.DM, n >>= this.DB; n += t.s } r.s = n < 0 ? -1 : 0, n > 0 ? r[i++] = n : n < -1 && (r[i++] = this.DV + n), r.t = i, r.clamp() } function bnAdd(t) { var r = nbi(); return this.addTo(t, r), r } function bnSubtract(t) { var r = nbi(); return this.subTo(t, r), r } function bnMultiply(t) { var r = nbi(); return this.multiplyTo(t, r), r } function bnSquare() { var t = nbi(); return this.squareTo(t), t } function bnDivide(t) { var r = nbi(); return this.divRemTo(t, r, null), r } function bnRemainder(t) { var r = nbi(); return this.divRemTo(t, null, r), r } function bnDivideAndRemainder(t) { var r = nbi(), i = nbi(); return this.divRemTo(t, r, i), [r, i] } function bnpDMultiply(t) { this[this.t] = this.am(0, t - 1, this, 0, 0, this.t), ++this.t, this.clamp() } function bnpDAddOffset(t, r) { if (0 != t) { for (; this.t <= r;)this[this.t++] = 0; for (this[r] += t; this[r] >= this.DV;)this[r] -= this.DV, ++r >= this.t && (this[this.t++] = 0), ++this[r] } } function NullExp() { } function nNop(t) { return t } function nMulTo(t, r, i) { t.multiplyTo(r, i) } function nSqrTo(t, r) { t.squareTo(r) } function bnPow(t) { return this.exp(t, new NullExp) } function bnpMultiplyLowerTo(t, r, i) { var n, e = Math.min(this.t + t.t, r); for (i.s = 0, i.t = e; e > 0;)i[--e] = 0; for (n = i.t - this.t; e < n; ++e)i[e + this.t] = this.am(0, t[e], i, e, 0, this.t); for (n = Math.min(t.t, r); e < n; ++e)this.am(0, t[e], i, e, 0, r - e); i.clamp() } function bnpMultiplyUpperTo(t, r, i) { --r; var n = i.t = this.t + t.t - r; for (i.s = 0; --n >= 0;)i[n] = 0; for (n = Math.max(r - this.t, 0); n < t.t; ++n)i[this.t + n - r] = this.am(r - n, t[n], i, 0, 0, this.t + n - r); i.clamp(), i.drShiftTo(1, i) } function Barrett(t) { this.r2 = nbi(), this.q3 = nbi(), BigInteger.ONE.dlShiftTo(2 * t.t, this.r2), this.mu = this.r2.divide(t), this.m = t } function barrettConvert(t) { if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m); if (t.compareTo(this.m) < 0) return t; var r = nbi(); return t.copyTo(r), this.reduce(r), r } function barrettRevert(t) { return t } function barrettReduce(t) { for (t.drShiftTo(this.m.t - 1, this.r2), t.t > this.m.t + 1 && (t.t = this.m.t + 1, t.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); t.compareTo(this.r2) < 0;)t.dAddOffset(1, this.m.t + 1); for (t.subTo(this.r2, t); t.compareTo(this.m) >= 0;)t.subTo(this.m, t) } function barrettSqrTo(t, r) { t.squareTo(r), this.reduce(r) } function barrettMulTo(t, r, i) { t.multiplyTo(r, i), this.reduce(i) } function bnModPow(t, r) { var i, n, e = t.bitLength(), o = nbv(1); if (e <= 0) return o; i = e < 18 ? 1 : e < 48 ? 3 : e < 144 ? 4 : e < 768 ? 5 : 6, n = e < 8 ? new Classic(r) : r.isEven() ? new Barrett(r) : new Montgomery(r); var s = [], h = 3, a = i - 1, u = (1 << i) - 1; if (s[1] = n.convert(this), i > 1) for (e = nbi(), n.sqrTo(s[1], e); h <= u;)s[h] = nbi(), n.mulTo(e, s[h - 2], s[h]), h += 2; var p, g = t.t - 1, f = !0, c = nbi(); for (e = nbits(t[g]) - 1; g >= 0;) { for (e >= a ? p = t[g] >> e - a & u : (p = (t[g] & (1 << e + 1) - 1) << a - e, g > 0 && (p |= t[g - 1] >> this.DB + e - a)), h = i; 0 == (1 & p);)p >>= 1, --h; if ((e -= h) < 0 && (e += this.DB, --g), f) s[p].copyTo(o), f = !1; else { for (; h > 1;)n.sqrTo(o, c), n.sqrTo(c, o), h -= 2; h > 0 ? n.sqrTo(o, c) : (h = o, o = c, c = h), n.mulTo(c, s[p], o) } for (; g >= 0 && 0 == (t[g] & 1 << e);)n.sqrTo(o, c), h = o, o = c, c = h, --e < 0 && (e = this.DB - 1, --g) } return n.revert(o) } function bnGCD(t) { var r = this.s < 0 ? this.negate() : this.clone(); t = t.s < 0 ? t.negate() : t.clone(); if (r.compareTo(t) < 0) { var i = r; r = t, t = i } i = r.getLowestSetBit(); var n = t.getLowestSetBit(); if (n < 0) return r; for (i < n && (n = i), n > 0 && (r.rShiftTo(n, r), t.rShiftTo(n, t)); r.signum() > 0;)(i = r.getLowestSetBit()) > 0 && r.rShiftTo(i, r), (i = t.getLowestSetBit()) > 0 && t.rShiftTo(i, t), r.compareTo(t) >= 0 ? (r.subTo(t, r), r.rShiftTo(1, r)) : (t.subTo(r, t), t.rShiftTo(1, t)); return n > 0 && t.lShiftTo(n, t), t } function bnpModInt(t) { if (t <= 0) return 0; var r = this.DV % t, i = this.s < 0 ? t - 1 : 0; if (this.t > 0) if (0 == r) i = this[0] % t; else for (var n = this.t - 1; n >= 0; --n)i = (r * i + this[n]) % t; return i } function bnModInverse(t) { var r = t.isEven(); if (this.isEven() && r || 0 == t.signum()) return BigInteger.ZERO; for (var i = t.clone(), n = this.clone(), e = nbv(1), o = nbv(0), s = nbv(0), h = nbv(1); 0 != i.signum();) { for (; i.isEven();)i.rShiftTo(1, i), r ? (e.isEven() && o.isEven() || (e.addTo(this, e), o.subTo(t, o)), e.rShiftTo(1, e)) : o.isEven() || o.subTo(t, o), o.rShiftTo(1, o); for (; n.isEven();)n.rShiftTo(1, n), r ? (s.isEven() && h.isEven() || (s.addTo(this, s), h.subTo(t, h)), s.rShiftTo(1, s)) : h.isEven() || h.subTo(t, h), h.rShiftTo(1, h); i.compareTo(n) >= 0 ? (i.subTo(n, i), r && e.subTo(s, e), o.subTo(h, o)) : (n.subTo(i, n), r && s.subTo(e, s), h.subTo(o, h)) } return 0 != n.compareTo(BigInteger.ONE) ? BigInteger.ZERO : h.compareTo(t) >= 0 ? h.subtract(t) : h.signum() < 0 ? (h.addTo(t, h), h.signum() < 0 ? h.add(t) : h) : h } Classic.prototype.convert = cConvert, Classic.prototype.revert = cRevert, Classic.prototype.reduce = cReduce, Classic.prototype.mulTo = cMulTo, Classic.prototype.sqrTo = cSqrTo, Montgomery.prototype.convert = montConvert, Montgomery.prototype.revert = montRevert, Montgomery.prototype.reduce = montReduce, Montgomery.prototype.mulTo = montMulTo, Montgomery.prototype.sqrTo = montSqrTo, BigInteger.prototype.copyTo = bnpCopyTo, BigInteger.prototype.fromInt = bnpFromInt, BigInteger.prototype.fromString = bnpFromString, BigInteger.prototype.clamp = bnpClamp, BigInteger.prototype.dlShiftTo = bnpDLShiftTo, BigInteger.prototype.drShiftTo = bnpDRShiftTo, BigInteger.prototype.lShiftTo = bnpLShiftTo, BigInteger.prototype.rShiftTo = bnpRShiftTo, BigInteger.prototype.subTo = bnpSubTo, BigInteger.prototype.multiplyTo = bnpMultiplyTo, BigInteger.prototype.squareTo = bnpSquareTo, BigInteger.prototype.divRemTo = bnpDivRemTo, BigInteger.prototype.invDigit = bnpInvDigit, BigInteger.prototype.isEven = bnpIsEven, BigInteger.prototype.exp = bnpExp, BigInteger.prototype.toString = bnToString, BigInteger.prototype.negate = bnNegate, BigInteger.prototype.abs = bnAbs, BigInteger.prototype.compareTo = bnCompareTo, BigInteger.prototype.bitLength = bnBitLength, BigInteger.prototype.mod = bnMod, BigInteger.prototype.modPowInt = bnModPowInt, BigInteger.ZERO = nbv(0), BigInteger.ONE = nbv(1), NullExp.prototype.convert = nNop, NullExp.prototype.revert = nNop, NullExp.prototype.mulTo = nMulTo, NullExp.prototype.sqrTo = nSqrTo, Barrett.prototype.convert = barrettConvert, Barrett.prototype.revert = barrettRevert, Barrett.prototype.reduce = barrettReduce, Barrett.prototype.mulTo = barrettMulTo, Barrett.prototype.sqrTo = barrettSqrTo; var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997], lplim = 67108864 / lowprimes[lowprimes.length - 1]; function bnIsProbablePrime(t) { var r, i = this.abs(); if (1 == i.t && i[0] <= lowprimes[lowprimes.length - 1]) { for (r = 0; r < lowprimes.length; ++r)if (i[0] == lowprimes[r]) return !0; return !1 } if (i.isEven()) return !1; for (r = 1; r < lowprimes.length;) { for (var n = lowprimes[r], e = r + 1; e < lowprimes.length && n < lplim;)n *= lowprimes[e++]; for (n = i.modInt(n); r < e;)if (n % lowprimes[r++] == 0) return !1 } return i.millerRabin(t) } function bnpMillerRabin(t) { var r = this.subtract(BigInteger.ONE), i = r.getLowestSetBit(); if (i <= 0) return !1; var n = r.shiftRight(i); (t = t + 1 >> 1) > lowprimes.length && (t = lowprimes.length); for (var e = nbi(), o = 0; o < t; ++o) { e.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]); var s = e.modPow(n, this); if (0 != s.compareTo(BigInteger.ONE) && 0 != s.compareTo(r)) { for (var h = 1; h++ < i && 0 != s.compareTo(r);)if (0 == (s = s.modPowInt(2, this)).compareTo(BigInteger.ONE)) return !1; if (0 != s.compareTo(r)) return !1 } } return !0 } function SeededRandom() { } function SRnextBytes(t) { var r; for (r = 0; r < t.length; r++)t[r] = Math.floor(256 * Math.random()) } function Arcfour() { this.j = this.i = 0, this.S = [] } function ARC4init(t) { var r, i, n; for (r = 0; r < 256; ++r)this.S[r] = r; for (r = i = 0; r < 256; ++r)i = i + this.S[r] + t[r % t.length] & 255, n = this.S[r], this.S[r] = this.S[i], this.S[i] = n; this.j = this.i = 0 } function ARC4next() { var t; return this.i = this.i + 1 & 255, this.j = this.j + this.S[this.i] & 255, t = this.S[this.i], this.S[this.i] = this.S[this.j], this.S[this.j] = t, this.S[t + this.S[this.i] & 255] } function prng_newstate() { return new Arcfour } BigInteger.prototype.chunkSize = bnpChunkSize, BigInteger.prototype.toRadix = bnpToRadix, BigInteger.prototype.fromRadix = bnpFromRadix, BigInteger.prototype.fromNumber = bnpFromNumber, BigInteger.prototype.bitwiseTo = bnpBitwiseTo, BigInteger.prototype.changeBit = bnpChangeBit, BigInteger.prototype.addTo = bnpAddTo, BigInteger.prototype.dMultiply = bnpDMultiply, BigInteger.prototype.dAddOffset = bnpDAddOffset, BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo, BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo, BigInteger.prototype.modInt = bnpModInt, BigInteger.prototype.millerRabin = bnpMillerRabin, BigInteger.prototype.clone = bnClone, BigInteger.prototype.intValue = bnIntValue, BigInteger.prototype.byteValue = bnByteValue, BigInteger.prototype.shortValue = bnShortValue, BigInteger.prototype.signum = bnSigNum, BigInteger.prototype.toByteArray = bnToByteArray, BigInteger.prototype.equals = bnEquals, BigInteger.prototype.min = bnMin, BigInteger.prototype.max = bnMax, BigInteger.prototype.and = bnAnd, BigInteger.prototype.or = bnOr, BigInteger.prototype.xor = bnXor, BigInteger.prototype.andNot = bnAndNot, BigInteger.prototype.not = bnNot, BigInteger.prototype.shiftLeft = bnShiftLeft, BigInteger.prototype.shiftRight = bnShiftRight, BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit, BigInteger.prototype.bitCount = bnBitCount, BigInteger.prototype.testBit = bnTestBit, BigInteger.prototype.setBit = bnSetBit, BigInteger.prototype.clearBit = bnClearBit, BigInteger.prototype.flipBit = bnFlipBit, BigInteger.prototype.add = bnAdd, BigInteger.prototype.subtract = bnSubtract, BigInteger.prototype.multiply = bnMultiply, BigInteger.prototype.divide = bnDivide, BigInteger.prototype.remainder = bnRemainder, BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder, BigInteger.prototype.modPow = bnModPow, BigInteger.prototype.modInverse = bnModInverse, BigInteger.prototype.pow = bnPow, BigInteger.prototype.gcd = bnGCD, BigInteger.prototype.isProbablePrime = bnIsProbablePrime, BigInteger.prototype.square = bnSquare, function (t, r, i, n, e, o, s) { function h(t) { var r, n, e = this, o = t.length, s = 0, h = e.i = e.j = e.m = 0; for (e.S = [], e.c = [], o || (t = [o++]); s < i;)e.S[s] = s++; for (s = 0; s < i; s++)h = h + (r = e.S[s]) + t[s % o] & i - 1, n = e.S[h], e.S[s] = n, e.S[h] = r; e.g = function (t) { var r = e.S, n = e.i + 1 & i - 1, o = r[n], s = e.j + o & i - 1, h = r[s]; r[n] = h, r[s] = o; for (var a = r[o + h & i - 1]; --t;)h = r[s = s + (o = r[n = n + 1 & i - 1]) & i - 1], r[n] = h, r[s] = o, a = a * i + r[o + h & i - 1]; return e.i = n, e.j = s, a }, e.g(i) } function a(t, r, n, e) { for (t += "", e = n = 0; e < t.length; e++) { var o = r, s = e & i - 1, h = (n ^= 19 * r[e & i - 1]) + t.charCodeAt(e); o[s] = h & i - 1 } for (e in t = "", r) t += String.fromCharCode(r[e]); return t } r.seedrandom = function (n, u) { var p, g = []; n = a(function t(r, i, n, e, o) { if (n = [], o = typeof r, i && "object" == o) for (e in r) if (e.indexOf("S") < 5) try { n.push(t(r[e], i - 1)) } catch (t) { } return n.length ? n : r + ("string" != o ? "\0" : "") }(u ? [n, t] : arguments.length ? n : [(new Date).getTime(), t, window], 3), g); return a((p = new h(g)).S, t), r.random = function () { for (var t = p.g(6), r = s, n = 0; t < e;)t = (t + n) * i, r *= i, n = p.g(1); for (; t >= o;)t /= 2, r /= 2, n >>>= 1; return (t + n) / r }, n }, s = r.pow(i, 6), e = r.pow(2, e), o = 2 * e, a(r.random(), t) }([], Math, 256, 0, 52), SeededRandom.prototype.nextBytes = SRnextBytes, Arcfour.prototype.init = ARC4init, Arcfour.prototype.next = ARC4next; var rng_state, rng_pool, rng_pptr, rng_psize = 256; function rng_seed_int(t) { rng_pool[rng_pptr++] ^= 255 & t, rng_pool[rng_pptr++] ^= t >> 8 & 255, rng_pool[rng_pptr++] ^= t >> 16 & 255, rng_pool[rng_pptr++] ^= t >> 24 & 255, rng_pptr >= rng_psize && (rng_pptr -= rng_psize) } function rng_seed_time() { rng_seed_int((new Date).getTime()) } if (null == rng_pool) { var t; if (rng_pool = [], rng_pptr = 0, "Netscape" == navigator.appName && navigator.appVersion < "5" && window.crypto) { var z = window.crypto.random(32); for (t = 0; t < z.length; ++t)rng_pool[rng_pptr++] = 255 & z.charCodeAt(t) } for (; rng_pptr < rng_psize;)t = Math.floor(65536 * Math.random()), rng_pool[rng_pptr++] = t >>> 8, rng_pool[rng_pptr++] = 255 & t; rng_pptr = 0, rng_seed_time() } function rng_get_byte() { if (null == rng_state) { for (rng_seed_time(), (rng_state = prng_newstate()).init(rng_pool), rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)rng_pool[rng_pptr] = 0; rng_pptr = 0 } return rng_state.next() } function rng_get_bytes(t) { var r; for (r = 0; r < t.length; ++r)t[r] = rng_get_byte() } function SecureRandom() { } function SHA256(t) { function r(t, r) { var i = (65535 & t) + (65535 & r); return (t >> 16) + (r >> 16) + (i >> 16) << 16 | 65535 & i } function i(t, r) { return t >>> r | t << 32 - r } return function (t) { for (var r = "", i = 0; i < 4 * t.length; i++)r += "0123456789abcdef".charAt(t[i >> 2] >> 8 * (3 - i % 4) + 4 & 15) + "0123456789abcdef".charAt(t[i >> 2] >> 8 * (3 - i % 4) & 15); return r }(function (t, n) { var e, o, s, h, a, u, p, g, f, c, l, b, m = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], d = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], v = Array(64); for (t[n >> 5] |= 128 << 24 - n % 32, t[15 + (n + 64 >> 9 << 4)] = n, f = 0; f < t.length; f += 16) { for (e = d[0], o = d[1], s = d[2], h = d[3], a = d[4], u = d[5], p = d[6], g = d[7], c = 0; c < 64; c++)v[c] = c < 16 ? t[c + f] : r(r(r(i(v[c - 2], 17) ^ i(v[c - 2], 19) ^ v[c - 2] >>> 10, v[c - 7]), i(v[c - 15], 7) ^ i(v[c - 15], 18) ^ v[c - 15] >>> 3), v[c - 16]), l = r(r(r(r(g, i(a, 6) ^ i(a, 11) ^ i(a, 25)), a & u ^ ~a & p), m[c]), v[c]), b = r(i(e, 2) ^ i(e, 13) ^ i(e, 22), e & o ^ e & s ^ o & s), g = p, p = u, u = a, a = r(h, l), h = s, s = o, o = e, e = r(l, b); d[0] = r(e, d[0]), d[1] = r(o, d[1]), d[2] = r(s, d[2]), d[3] = r(h, d[3]), d[4] = r(a, d[4]), d[5] = r(u, d[5]), d[6] = r(p, d[6]), d[7] = r(g, d[7]) } return d }(function (t) { for (var r = [], i = 0; i < 8 * t.length; i += 8)r[i >> 5] |= (255 & t.charCodeAt(i / 8)) << 24 - i % 32; return r }(t = function (t) { t = t.replace(/\r\n/g, "\n"); for (var r = "", i = 0; i < t.length; i++) { var n = t.charCodeAt(i); n < 128 ? r += String.fromCharCode(n) : (n > 127 && n < 2048 ? r += String.fromCharCode(n >> 6 | 192) : (r += String.fromCharCode(n >> 12 | 224), r += String.fromCharCode(n >> 6 & 63 | 128)), r += String.fromCharCode(63 & n | 128)) } return r }(t)), 8 * t.length)) } SecureRandom.prototype.nextBytes = rng_get_bytes; var sha256 = { hex: function (t) { return SHA256(t) } }; function SHA1(t) { function r(t, r) { return t << r | t >>> 32 - r } function i(t) { var r, i = ""; for (r = 7; r >= 0; r--)i += (t >>> 4 * r & 15).toString(16); return i } var n, e, o, s, h, a, u, p = Array(80), g = 1732584193, f = 4023233417, c = 2562383102, l = 271733878, b = 3285377520; o = (t = function (t) { t = t.replace(/\r\n/g, "\n"); for (var r = "", i = 0; i < t.length; i++) { var n = t.charCodeAt(i); n < 128 ? r += String.fromCharCode(n) : (n > 127 && n < 2048 ? r += String.fromCharCode(n >> 6 | 192) : (r += String.fromCharCode(n >> 12 | 224), r += String.fromCharCode(n >> 6 & 63 | 128)), r += String.fromCharCode(63 & n | 128)) } return r }(t)).length; var m = []; for (n = 0; n < o - 3; n += 4)e = t.charCodeAt(n) << 24 | t.charCodeAt(n + 1) << 16 | t.charCodeAt(n + 2) << 8 | t.charCodeAt(n + 3), m.push(e); switch (o % 4) { case 0: n = 2147483648; break; case 1: n = t.charCodeAt(o - 1) << 24 | 8388608; break; case 2: n = t.charCodeAt(o - 2) << 24 | t.charCodeAt(o - 1) << 16 | 32768; break; case 3: n = t.charCodeAt(o - 3) << 24 | t.charCodeAt(o - 2) << 16 | t.charCodeAt(o - 1) << 8 | 128 }for (m.push(n); m.length % 16 != 14;)m.push(0); for (m.push(o >>> 29), m.push(o << 3 & 4294967295), t = 0; t < m.length; t += 16) { for (n = 0; n < 16; n++)p[n] = m[t + n]; for (n = 16; n <= 79; n++)p[n] = r(p[n - 3] ^ p[n - 8] ^ p[n - 14] ^ p[n - 16], 1); for (e = g, o = f, s = c, h = l, a = b, n = 0; n <= 19; n++)u = r(e, 5) + (o & s | ~o & h) + a + p[n] + 1518500249 & 4294967295, a = h, h = s, s = r(o, 30), o = e, e = u; for (n = 20; n <= 39; n++)u = r(e, 5) + (o ^ s ^ h) + a + p[n] + 1859775393 & 4294967295, a = h, h = s, s = r(o, 30), o = e, e = u; for (n = 40; n <= 59; n++)u = r(e, 5) + (o & s | o & h | s & h) + a + p[n] + 2400959708 & 4294967295, a = h, h = s, s = r(o, 30), o = e, e = u; for (n = 60; n <= 79; n++)u = r(e, 5) + (o ^ s ^ h) + a + p[n] + 3395469782 & 4294967295, a = h, h = s, s = r(o, 30), o = e, e = u; g = g + e & 4294967295, f = f + o & 4294967295, c = c + s & 4294967295, l = l + h & 4294967295, b = b + a & 4294967295 } return (u = i(g) + i(f) + i(c) + i(l) + i(b)).toLowerCase() } var sha1 = { hex: function (t) { return SHA1(t) } }, MD5 = function (t) { function r(t, r) { var i, n, e, o, s; return e = 2147483648 & t, o = 2147483648 & r, s = (1073741823 & t) + (1073741823 & r), (i = 1073741824 & t) & (n = 1073741824 & r) ? 2147483648 ^ s ^ e ^ o : i | n ? 1073741824 & s ? 3221225472 ^ s ^ e ^ o : 1073741824 ^ s ^ e ^ o : s ^ e ^ o } function i(t, i, n, e, o, s, h) { return t = r(t, r(r(i & n | ~i & e, o), h)), r(t << s | t >>> 32 - s, i) } function n(t, i, n, e, o, s, h) { return t = r(t, r(r(i & e | n & ~e, o), h)), r(t << s | t >>> 32 - s, i) } function e(t, i, n, e, o, s, h) { return t = r(t, r(r(i ^ n ^ e, o), h)), r(t << s | t >>> 32 - s, i) } function o(t, i, n, e, o, s, h) { return t = r(t, r(r(n ^ (i | ~e), o), h)), r(t << s | t >>> 32 - s, i) } function s(t) { var r, i = "", n = ""; for (r = 0; r <= 3; r++)i += (n = "0" + (n = t >>> 8 * r & 255).toString(16)).substr(n.length - 2, 2); return i } var h, a, u, p, g, f, c, l, b = function (t) { for (var r, i = t.length, n = 16 * (((r = i + 8) - r % 64) / 64 + 1), e = Array(n - 1), o = 0, s = 0; s < i;)o = s % 4 * 8, e[r = (s - s % 4) / 4] |= t.charCodeAt(s) << o, s++; return e[(s - s % 4) / 4] |= 128 << s % 4 * 8, e[n - 2] = i << 3, e[n - 1] = i >>> 29, e }(t = function (t) { t = t.replace(/\r\n/g, "\n"); for (var r = "", i = 0; i < t.length; i++) { var n = t.charCodeAt(i); n < 128 ? r += String.fromCharCode(n) : (n > 127 && n < 2048 ? r += String.fromCharCode(n >> 6 | 192) : (r += String.fromCharCode(n >> 12 | 224), r += String.fromCharCode(n >> 6 & 63 | 128)), r += String.fromCharCode(63 & n | 128)) } return r }(t)); for (g = 1732584193, f = 4023233417, c = 2562383102, l = 271733878, t = 0; t < b.length; t += 16)h = g, a = f, u = c, p = l, g = i(g, f, c, l, b[t + 0], 7, 3614090360), l = i(l, g, f, c, b[t + 1], 12, 3905402710), c = i(c, l, g, f, b[t + 2], 17, 606105819), f = i(f, c, l, g, b[t + 3], 22, 3250441966), g = i(g, f, c, l, b[t + 4], 7, 4118548399), l = i(l, g, f, c, b[t + 5], 12, 1200080426), c = i(c, l, g, f, b[t + 6], 17, 2821735955), f = i(f, c, l, g, b[t + 7], 22, 4249261313), g = i(g, f, c, l, b[t + 8], 7, 1770035416), l = i(l, g, f, c, b[t + 9], 12, 2336552879), c = i(c, l, g, f, b[t + 10], 17, 4294925233), f = i(f, c, l, g, b[t + 11], 22, 2304563134), g = i(g, f, c, l, b[t + 12], 7, 1804603682), l = i(l, g, f, c, b[t + 13], 12, 4254626195), c = i(c, l, g, f, b[t + 14], 17, 2792965006), g = n(g, f = i(f, c, l, g, b[t + 15], 22, 1236535329), c, l, b[t + 1], 5, 4129170786), l = n(l, g, f, c, b[t + 6], 9, 3225465664), c = n(c, l, g, f, b[t + 11], 14, 643717713), f = n(f, c, l, g, b[t + 0], 20, 3921069994), g = n(g, f, c, l, b[t + 5], 5, 3593408605), l = n(l, g, f, c, b[t + 10], 9, 38016083), c = n(c, l, g, f, b[t + 15], 14, 3634488961), f = n(f, c, l, g, b[t + 4], 20, 3889429448), g = n(g, f, c, l, b[t + 9], 5, 568446438), l = n(l, g, f, c, b[t + 14], 9, 3275163606), c = n(c, l, g, f, b[t + 3], 14, 4107603335), f = n(f, c, l, g, b[t + 8], 20, 1163531501), g = n(g, f, c, l, b[t + 13], 5, 2850285829), l = n(l, g, f, c, b[t + 2], 9, 4243563512), c = n(c, l, g, f, b[t + 7], 14, 1735328473), g = e(g, f = n(f, c, l, g, b[t + 12], 20, 2368359562), c, l, b[t + 5], 4, 4294588738), l = e(l, g, f, c, b[t + 8], 11, 2272392833), c = e(c, l, g, f, b[t + 11], 16, 1839030562), f = e(f, c, l, g, b[t + 14], 23, 4259657740), g = e(g, f, c, l, b[t + 1], 4, 2763975236), l = e(l, g, f, c, b[t + 4], 11, 1272893353), c = e(c, l, g, f, b[t + 7], 16, 4139469664), f = e(f, c, l, g, b[t + 10], 23, 3200236656), g = e(g, f, c, l, b[t + 13], 4, 681279174), l = e(l, g, f, c, b[t + 0], 11, 3936430074), c = e(c, l, g, f, b[t + 3], 16, 3572445317), f = e(f, c, l, g, b[t + 6], 23, 76029189), g = e(g, f, c, l, b[t + 9], 4, 3654602809), l = e(l, g, f, c, b[t + 12], 11, 3873151461), c = e(c, l, g, f, b[t + 15], 16, 530742520), g = o(g, f = e(f, c, l, g, b[t + 2], 23, 3299628645), c, l, b[t + 0], 6, 4096336452), l = o(l, g, f, c, b[t + 7], 10, 1126891415), c = o(c, l, g, f, b[t + 14], 15, 2878612391), f = o(f, c, l, g, b[t + 5], 21, 4237533241), g = o(g, f, c, l, b[t + 12], 6, 1700485571), l = o(l, g, f, c, b[t + 3], 10, 2399980690), c = o(c, l, g, f, b[t + 10], 15, 4293915773), f = o(f, c, l, g, b[t + 1], 21, 2240044497), g = o(g, f, c, l, b[t + 8], 6, 1873313359), l = o(l, g, f, c, b[t + 15], 10, 4264355552), c = o(c, l, g, f, b[t + 6], 15, 2734768916), f = o(f, c, l, g, b[t + 13], 21, 1309151649), g = o(g, f, c, l, b[t + 4], 6, 4149444226), l = o(l, g, f, c, b[t + 11], 10, 3174756917), c = o(c, l, g, f, b[t + 2], 15, 718787259), f = o(f, c, l, g, b[t + 9], 21, 3951481745), g = r(g, h), f = r(f, a), c = r(c, u), l = r(l, p); return (s(g) + s(f) + s(c) + s(l)).toLowerCase() }; function parseBigInt(t, r) { return new BigInteger(t, r) } function linebrk(t, r) { for (var i = "", n = 0; n + r < t.length;)i += t.substring(n, n + r) + "\n", n += r; return i + t.substring(n, t.length) } function byte2Hex(t) { return t < 16 ? "0" + t.toString(16) : t.toString(16) } function pkcs1pad2(t, r) { if (r < t.length + 11) throw "Message too long for RSA (n=" + r + ", l=" + t.length + ")"; for (var i = [], n = t.length - 1; n >= 0 && r > 0;) { var e = t.charCodeAt(n--); e < 128 ? i[--r] = e : e > 127 && e < 2048 ? (i[--r] = 63 & e | 128, i[--r] = e >> 6 | 192) : (i[--r] = 63 & e | 128, i[--r] = e >> 6 & 63 | 128, i[--r] = e >> 12 | 224) } for (i[--r] = 0, n = new SecureRandom, e = []; r > 2;) { for (e[0] = 0; 0 == e[0];)n.nextBytes(e); i[--r] = e[0] } return i[--r] = 2, i[--r] = 0, new BigInteger(i) } function RSAKey() { this.n = null, this.e = 0, this.coeff = this.dmq1 = this.dmp1 = this.q = this.p = this.d = null } function RSASetPublic(t, r) { null != t && null != r && t.length > 0 && r.length > 0 ? (this.n = parseBigInt(t, 16), this.e = parseInt(r, 16)) : alert("Invalid RSA public key") } function RSADoPublic(t) { return t.modPowInt(this.e, this.n) } function RSAEncrypt(t) { return null == (t = pkcs1pad2(t, this.n.bitLength() + 7 >> 3)) ? null : null == (t = this.doPublic(t)) ? null : 0 == (1 & (t = t.toString(16)).length) ? t : "0" + t } function pkcs1unpad2(t, r) { for (var i = t.toByteArray(), n = 0; n < i.length && 0 == i[n];)++n; if (i.length - n != r - 1 || 2 != i[n]) return null; for (++n; 0 != i[n];)if (++n >= i.length) return null; for (var e = ""; ++n < i.length;) { var o = 255 & i[n]; o < 128 ? e += String.fromCharCode(o) : o > 191 && o < 224 ? (e += String.fromCharCode((31 & o) << 6 | 63 & i[n + 1]), ++n) : (e += String.fromCharCode((15 & o) << 12 | (63 & i[n + 1]) << 6 | 63 & i[n + 2]), n += 2) } return e } function RSASetPrivate(t, r, i) { null != t && null != r && t.length > 0 && r.length > 0 ? (this.n = parseBigInt(t, 16), this.e = parseInt(r, 16), this.d = parseBigInt(i, 16)) : alert("Invalid RSA private key") } function RSASetPrivateEx(t, r, i, n, e, o, s, h) { null != t && null != r && t.length > 0 && r.length > 0 ? (this.n = parseBigInt(t, 16), this.e = parseInt(r, 16), this.d = parseBigInt(i, 16), this.p = parseBigInt(n, 16), this.q = parseBigInt(e, 16), this.dmp1 = parseBigInt(o, 16), this.dmq1 = parseBigInt(s, 16), this.coeff = parseBigInt(h, 16)) : alert("Invalid RSA private key") } function RSAGenerate(t, r) { var i = new SeededRandom, n = t >> 1; this.e = parseInt(r, 16); for (var e = new BigInteger(r, 16); ;) { for (; this.p = new BigInteger(t - n, 1, i), 0 != this.p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) || !this.p.isProbablePrime(10);); for (; this.q = new BigInteger(n, 1, i), 0 != this.q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) || !this.q.isProbablePrime(10);); if (this.p.compareTo(this.q) <= 0) { var o = this.p; this.p = this.q, this.q = o } o = this.p.subtract(BigInteger.ONE); var s = this.q.subtract(BigInteger.ONE), h = o.multiply(s); if (0 == h.gcd(e).compareTo(BigInteger.ONE)) { this.n = this.p.multiply(this.q), this.d = e.modInverse(h), this.dmp1 = this.d.mod(o), this.dmq1 = this.d.mod(s), this.coeff = this.q.modInverse(this.p); break } } } function RSADoPrivate(t) { if (null == this.p || null == this.q) return t.modPow(this.d, this.n); var r = t.mod(this.p).modPow(this.dmp1, this.p); for (t = t.mod(this.q).modPow(this.dmq1, this.q); r.compareTo(t) < 0;)r = r.add(this.p); return r.subtract(t).multiply(this.coeff).mod(this.p).multiply(this.q).add(t) } function RSADecrypt(t) { return null == (t = this.doPrivate(parseBigInt(t, 16))) ? null : pkcs1unpad2(t, this.n.bitLength() + 7 >> 3) } RSAKey.prototype.doPublic = RSADoPublic, RSAKey.prototype.setPublic = RSASetPublic, RSAKey.prototype.encrypt = RSAEncrypt, RSAKey.prototype.doPrivate = RSADoPrivate, RSAKey.prototype.setPrivate = RSASetPrivate, RSAKey.prototype.setPrivateEx = RSASetPrivateEx, RSAKey.prototype.generate = RSAGenerate, RSAKey.prototype.decrypt = RSADecrypt; var _RSASIGN_DIHEAD = []; _RSASIGN_DIHEAD.sha1 = "3021300906052b0e03021a05000414", _RSASIGN_DIHEAD.sha256 = "3031300d060960864801650304020105000420"; var _RSASIGN_HASHHEXFUNC = []; function _rsasign_getHexPaddedDigestInfoForString(t, r, i) { r /= 4; t = (0, _RSASIGN_HASHHEXFUNC[i])(t), i = "00" + _RSASIGN_DIHEAD[i] + t, t = "", r = r - 4 - i.length; for (var n = 0; n < r; n += 2)t += "ff"; return sPaddedMessageHex = "0001" + t + i } function _rsasign_signString(t, r) { var i = _rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), r); return this.doPrivate(parseBigInt(i, 16)).toString(16) } function _rsasign_signStringWithSHA1(t) { return t = _rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), "sha1"), this.doPrivate(parseBigInt(t, 16)).toString(16) } function _rsasign_signStringWithSHA256(t) { return t = _rsasign_getHexPaddedDigestInfoForString(t, this.n.bitLength(), "sha256"), this.doPrivate(parseBigInt(t, 16)).toString(16) } function _rsasign_getDecryptSignatureBI(t, r, i) { var n = new RSAKey; return n.setPublic(r, i), n.doPublic(t) } function _rsasign_getHexDigestInfoFromSig(t, r, i) { return _rsasign_getDecryptSignatureBI(t, r, i).toString(16).replace(/^1f+00/, "") } function _rsasign_getAlgNameAndHashFromHexDisgestInfo(t) { for (var r in _RSASIGN_DIHEAD) { var i = _RSASIGN_DIHEAD[r], n = i.length; if (t.substring(0, n) == i) return [r, t.substring(n)] } return [] } function _rsasign_verifySignatureWithArgs(t, r, i, n) { return 0 != (i = _rsasign_getAlgNameAndHashFromHexDisgestInfo(r = _rsasign_getHexDigestInfoFromSig(r, i, n))).length && (r = i[1]) == (t = (0, _RSASIGN_HASHHEXFUNC[i[0]])(t)) } function _rsasign_verifyHexSignatureForMessage(t, r) { return _rsasign_verifySignatureWithArgs(r, parseBigInt(t, 16), this.n.toString(16), this.e.toString(16)) } function _rsasign_verifyString(t, r) { r = r.replace(/[ \n]+/g, ""); var i = this.doPublic(parseBigInt(r, 16)).toString(16).replace(/^1f+00/, ""), n = _rsasign_getAlgNameAndHashFromHexDisgestInfo(i); return 0 != n.length && (i = n[1]) == (n = (0, _RSASIGN_HASHHEXFUNC[n[0]])(t)) } _RSASIGN_HASHHEXFUNC.sha1 = sha1.hex, _RSASIGN_HASHHEXFUNC.sha256 = sha256.hex, RSAKey.prototype.signString = _rsasign_signString, RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1, RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256, RSAKey.prototype.verifyString = _rsasign_verifyString, RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage; var aes = function () { var t = { Sbox: [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22], ShiftRowTab: [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11], Init: function () { t.Sbox_Inv = Array(256); for (var r = 0; r < 256; r++)t.Sbox_Inv[t.Sbox[r]] = r; for (t.ShiftRowTab_Inv = Array(16), r = 0; r < 16; r++)t.ShiftRowTab_Inv[t.ShiftRowTab[r]] = r; for (t.xtime = Array(256), r = 0; r < 128; r++)t.xtime[r] = r << 1, t.xtime[128 + r] = r << 1 ^ 27 }, Done: function () { delete t.Sbox_Inv, delete t.ShiftRowTab_Inv, delete t.xtime }, ExpandKey: function (r) { var i, n = r.length, e = 1; switch (n) { case 16: i = 176; break; case 24: i = 208; break; case 32: i = 240; break; default: alert("my.ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!") }for (var o = n; o < i; o += 4) { var s = r.slice(o - 4, o); o % n == 0 ? (s = [t.Sbox[s[1]] ^ e, t.Sbox[s[2]], t.Sbox[s[3]], t.Sbox[s[0]]], (e <<= 1) >= 256 && (e ^= 283)) : n > 24 && o % n == 16 && (s = [t.Sbox[s[0]], t.Sbox[s[1]], t.Sbox[s[2]], t.Sbox[s[3]]]); for (var h = 0; h < 4; h++)r[o + h] = r[o + h - n] ^ s[h] } }, Encrypt: function (r, i) { var n = i.length; t.AddRoundKey(r, i.slice(0, 16)); for (var e = 16; e < n - 16; e += 16)t.SubBytes(r, t.Sbox), t.ShiftRows(r, t.ShiftRowTab), t.MixColumns(r), t.AddRoundKey(r, i.slice(e, e + 16)); t.SubBytes(r, t.Sbox), t.ShiftRows(r, t.ShiftRowTab), t.AddRoundKey(r, i.slice(e, n)) }, Decrypt: function (r, i) { var n = i.length; for (t.AddRoundKey(r, i.slice(n - 16, n)), t.ShiftRows(r, t.ShiftRowTab_Inv), t.SubBytes(r, t.Sbox_Inv), n -= 32; n >= 16; n -= 16)t.AddRoundKey(r, i.slice(n, n + 16)), t.MixColumns_Inv(r), t.ShiftRows(r, t.ShiftRowTab_Inv), t.SubBytes(r, t.Sbox_Inv); t.AddRoundKey(r, i.slice(0, 16)) }, SubBytes: function (t, r) { for (var i = 0; i < 16; i++)t[i] = r[t[i]] }, AddRoundKey: function (t, r) { for (var i = 0; i < 16; i++)t[i] ^= r[i] }, ShiftRows: function (t, r) { for (var i = [].concat(t), n = 0; n < 16; n++)t[n] = i[r[n]] }, MixColumns: function (r) { for (var i = 0; i < 16; i += 4) { var n = r[i + 0], e = r[i + 1], o = r[i + 2], s = r[i + 3], h = n ^ e ^ o ^ s; r[i + 0] ^= h ^ t.xtime[n ^ e], r[i + 1] ^= h ^ t.xtime[e ^ o], r[i + 2] ^= h ^ t.xtime[o ^ s], r[i + 3] ^= h ^ t.xtime[s ^ n] } }, MixColumns_Inv: function (r) { for (var i = 0; i < 16; i += 4) { var n = r[i + 0], e = r[i + 1], o = r[i + 2], s = r[i + 3], h = n ^ e ^ o ^ s, a = t.xtime[h], u = t.xtime[t.xtime[a ^ n ^ o]] ^ h; h ^= t.xtime[t.xtime[a ^ e ^ s]], r[i + 0] ^= u ^ t.xtime[n ^ e], r[i + 1] ^= h ^ t.xtime[e ^ o], r[i + 2] ^= u ^ t.xtime[o ^ s], r[i + 3] ^= h ^ t.xtime[s ^ n] } } }; return t }(), cryptico = function () { var t = {}; return aes.Init(), t.b256to64 = function (t) { var r, i, n, e = "", o = 0, s = t.length; for (n = 0; n < s; n++)i = t.charCodeAt(n), 0 == o ? (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i >> 2 & 63), r = (3 & i) << 4) : 1 == o ? (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(r | i >> 4 & 15), r = (15 & i) << 2) : 2 == o && (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(r | i >> 6 & 3), 1, e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(63 & i)), 1, 3 == (o += 1) && (o = 0); return o > 0 && (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(r), e += "="), 1 == o && (e += "="), e }, t.b64to256 = function (t) { var r, i, n = "", e = 0, o = 0, s = t.length; for (i = 0; i < s; i++)(r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(t.charAt(i))) >= 0 && (e && (n += String.fromCharCode(o | r >> 6 - e & 255)), o = r << (e = e + 2 & 7) & 255); return n }, t.b16to64 = function (t) { var r, i, n = ""; for (t.length % 2 == 1 && (t = "0" + t), r = 0; r + 3 <= t.length; r += 3)i = parseInt(t.substring(r, r + 3), 16), n += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i >> 6) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(63 & i); for (r + 1 == t.length ? (i = parseInt(t.substring(r, r + 1), 16), n += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i << 2)) : r + 2 == t.length && (i = parseInt(t.substring(r, r + 2), 16), n += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i >> 2) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((3 & i) << 4)); (3 & n.length) > 0;)n += "="; return n }, t.b64to16 = function (t) { var r, i, n = "", e = 0; for (r = 0; r < t.length && "=" != t.charAt(r); ++r)v = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(t.charAt(r)), v < 0 || (0 == e ? (n += int2char(v >> 2), i = 3 & v, e = 1) : 1 == e ? (n += int2char(i << 2 | v >> 4), i = 15 & v, e = 2) : 2 == e ? (n += int2char(i), n += int2char(v >> 2), i = 3 & v, e = 3) : (n += int2char(i << 2 | v >> 4), n += int2char(15 & v), e = 0)); return 1 == e && (n += int2char(i << 2)), n }, t.string2bytes = function (t) { for (var r = [], i = 0; i < t.length; i++)r.push(t.charCodeAt(i)); return r }, t.bytes2string = function (t) { for (var r = "", i = 0; i < t.length; i++)r += String.fromCharCode(t[i]); return r }, t.blockXOR = function (t, r) { for (var i = Array(16), n = 0; n < 16; n++)i[n] = t[n] ^ r[n]; return i }, t.blockIV = function () { var t = new SecureRandom, r = Array(16); return t.nextBytes(r), r }, t.pad16 = function (t) { var r = t.slice(0), n = (16 - t.length % 16) % 16; for (i = t.length; i < t.length + n; i++)r.push(0); return r }, t.depad = function (t) { for (t = t.slice(0); 0 == t[t.length - 1];)t = t.slice(0, t.length - 1); return t }, t.encryptAESCBC = function (r, i) { var n = i.slice(0); aes.ExpandKey(n); for (var e = t.string2bytes(r), o = (e = t.pad16(e), t.blockIV()), s = 0; s < e.length / 16; s++) { var h = e.slice(16 * s, 16 * s + 16), a = o.slice(16 * s, 16 * s + 16); h = t.blockXOR(a, h); aes.Encrypt(h, n), o = o.concat(h) } return n = t.bytes2string(o), t.b256to64(n) }, t.decryptAESCBC = function (r, i) { var n = i.slice(0); aes.ExpandKey(n); r = t.b64to256(r); for (var e = t.string2bytes(r), o = [], s = 1; s < e.length / 16; s++) { var h = e.slice(16 * s, 16 * s + 16), a = e.slice(16 * (s - 1), 16 * (s - 1) + 16); aes.Decrypt(h, n), h = t.blockXOR(a, h), o = o.concat(h) } return o = t.depad(o), t.bytes2string(o) }, t.wrap60 = function (t) { for (var r = "", i = 0; i < t.length; i++)i % 60 == 0 && 0 != i && (r += "\n"), r += t[i]; return r }, t.generateAESKey = function () { var t = Array(32); return (new SecureRandom).nextBytes(t), t }, t.generateRSAKey = function (t, r) { Math.seedrandom(sha256.hex(t)); var i = new RSAKey; return i.generate(r, "03"), i }, t.publicKeyString = function (r) { return pubkey = t.b16to64(r.n.toString(16)) }, t.publicKeyID = function (t) { return MD5(t) }, t.publicKeyFromString = function (r) { r = t.b64to16(r.split("|")[0]); var i = new RSAKey; return i.setPublic(r, "03"), i }, t.encrypt = function (r, i, n) { var e = "", o = t.generateAESKey(); try { var s = t.publicKeyFromString(i); e += t.b16to64(s.encrypt(t.bytes2string(o))) + "?" } catch (t) { return { status: "Invalid public key" } } return n && (signString = cryptico.b16to64(n.signString(r, "sha256")), r += "::52cee64bb3a38f6403386519a39ac91c::", r += cryptico.publicKeyString(n), r += "::52cee64bb3a38f6403386519a39ac91c::", r += signString), { status: "success", cipher: e += t.encryptAESCBC(r, o) } }, t.decrypt = function (r, i) { var n = r.split("?"); if (null == (e = i.decrypt(t.b64to16(n[0])))) return { status: "failure" }; if (e = t.string2bytes(e), 3 == (n = t.decryptAESCBC(n[1], e).split("::52cee64bb3a38f6403386519a39ac91c::")).length) { var e = t.publicKeyFromString(n[1]), o = t.b64to16(n[2]); return e.verifyString(n[0], o) ? { status: "success", plaintext: n[0], signature: "verified", publicKeyString: t.publicKeyString(e) } : { status: "success", plaintext: n[0], signature: "forged", publicKeyString: t.publicKeyString(e) } } return { status: "success", plaintext: n[0], signature: "unsigned" } }, t }();
