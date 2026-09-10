CitationAutoCollection = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	originalCite: null,
	wrappedCite: null,
	originalRefresh: null,
	wrappedRefresh: null,

	PREF_ENABLED: "extensions.citation-auto-collection.enabled",
	PREF_LIBRARY_ID: "extensions.citation-auto-collection.targetLibraryID",
	PREF_COLLECTION_KEY: "extensions.citation-auto-collection.targetCollectionKey",
	PREF_NOTIFICATIONS: "extensions.citation-auto-collection.showNotifications",
	PREF_DOCUMENT_STATE: "extensions.citation-auto-collection.documentState",
	MENU_ID: "citation-auto-collection-menu",

	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},

	log(message) {
		Zotero.debug(`Citation Auto-Collection: ${message}`);
	},

	getPref(key) {
		return Zotero.Prefs.get(key, true);
	},

	setPref(key, value) {
		Zotero.Prefs.set(key, value, true);
	},

	getTargetCollection() {
		let libraryID = Number(this.getPref(this.PREF_LIBRARY_ID));
		let key = this.getPref(this.PREF_COLLECTION_KEY);
		if (!Number.isInteger(libraryID) || libraryID < 0 || !key) return null;
		return Zotero.Collections.getByLibraryAndKey(libraryID, key) || null;
	},

	getTargetLabel() {
		let collection = this.getTargetCollection();
		return collection ? collection.name : "未设置 / Not set";
	},

	getSelectedCollections(pane) {
		if (typeof pane.getSelectedCollections === "function") {
			return pane.getSelectedCollections() || [];
		}
		if (typeof pane.getSelectedCollection === "function") {
			let collection = pane.getSelectedCollection();
			return collection ? [collection] : [];
		}
		return [];
	},

	addToWindow(window) {
		let doc = window.document;
		if (!window.ZoteroPane || doc.getElementById(this.MENU_ID)) return;
		let toolsPopup = doc.getElementById("menu_ToolsPopup");
		if (!toolsPopup) return;

		let menu = doc.createXULElement("menu");
		menu.id = this.MENU_ID;
		menu.setAttribute("label", "Citation Auto-Collection");
		menu.setAttribute("class", "menu-type-library");
		let popup = doc.createXULElement("menupopup");
		popup.id = `${this.MENU_ID}-popup`;

		let setTarget = doc.createXULElement("menuitem");
		setTarget.id = `${this.MENU_ID}-set-target`;
		setTarget.setAttribute("label", "将当前 Collection 设为目标 / Use selected Collection");
		setTarget.addEventListener("command", () => this.setTargetFromSelection(window));

		let enabled = doc.createXULElement("menuitem");
		enabled.id = `${this.MENU_ID}-enabled`;
		enabled.setAttribute("type", "checkbox");
		enabled.setAttribute("label", "启用自动同步 / Enabled");
		enabled.addEventListener("command", () => {
			this.setPref(this.PREF_ENABLED, enabled.checked);
			this.notify(enabled.checked ? "自动同步已启用" : "自动同步已暂停");
		});

		let separator = doc.createXULElement("menuseparator");
		separator.id = `${this.MENU_ID}-separator`;
		let status = doc.createXULElement("menuitem");
		status.id = `${this.MENU_ID}-status`;
		status.setAttribute("disabled", "true");

		popup.append(setTarget, enabled, separator, status);
		menu.appendChild(popup);
		toolsPopup.insertBefore(menu, doc.getElementById("menu_addons") || null);
		popup.addEventListener("popupshowing", () => {
			setTarget.disabled = this.getSelectedCollections(window.ZoteroPane).length !== 1;
			enabled.checked = Boolean(this.getPref(this.PREF_ENABLED));
			status.setAttribute("label", `目标 / Target: ${this.getTargetLabel()}`);
		});
	},

	addToAllWindows() {
		for (let window of Zotero.getMainWindows()) this.addToWindow(window);
	},

	removeFromWindow(window) {
		window.document.getElementById(this.MENU_ID)?.remove();
	},

	removeFromAllWindows() {
		for (let window of Zotero.getMainWindows()) this.removeFromWindow(window);
	},

	setTargetFromSelection(window) {
		let collections = this.getSelectedCollections(window.ZoteroPane);
		if (collections.length !== 1) {
			this.notify("请先在 Zotero 左侧栏选中一个 Collection", true);
			return;
		}
		let collection = collections[0];
		this.setPref(this.PREF_LIBRARY_ID, collection.libraryID);
		this.setPref(this.PREF_COLLECTION_KEY, collection.key);
		this.setPref(this.PREF_ENABLED, true);
		this.notify(`目标已设为：${collection.name}`);
	},

	installIntegrationHook() {
		let sessionPrototype = Zotero.Integration?.Session?.prototype;
		let interfacePrototype = Zotero.Integration?.Interface?.prototype;
		if (!sessionPrototype || typeof sessionPrototype.cite !== "function") return;
		if (this.wrappedCite && sessionPrototype.cite === this.wrappedCite) return;

		this.originalCite = sessionPrototype.cite;
		let plugin = this;
		this.wrappedCite = async function (field, addNote = false, addAnnotations = false) {
			let citations = await plugin.originalCite.apply(this, arguments);
			let isWord = /word/i.test(String(this._app?.processorName || ""));
			if (isWord && !addNote && !addAnnotations) {
				await plugin.reconcileWithoutBreakingWord(this);
			}
			return citations;
		};
		sessionPrototype.cite = this.wrappedCite;

		if (interfacePrototype && typeof interfacePrototype.refresh === "function") {
			this.originalRefresh = interfacePrototype.refresh;
			this.wrappedRefresh = async function () {
				let result = await plugin.originalRefresh.apply(this, arguments);
				let isWord = /word/i.test(String(this._app?.processorName || ""));
				if (isWord) await plugin.reconcileWithoutBreakingWord(this._session);
				return result;
			};
			interfacePrototype.refresh = this.wrappedRefresh;
		}
		this.log("Integration hooks installed");
	},

	removeIntegrationHook() {
		let sessionPrototype = Zotero.Integration?.Session?.prototype;
		let interfacePrototype = Zotero.Integration?.Interface?.prototype;
		if (sessionPrototype?.cite === this.wrappedCite && this.originalCite) {
			sessionPrototype.cite = this.originalCite;
		}
		if (interfacePrototype?.refresh === this.wrappedRefresh && this.originalRefresh) {
			interfacePrototype.refresh = this.originalRefresh;
		}
		this.originalCite = this.wrappedCite = null;
		this.originalRefresh = this.wrappedRefresh = null;
		this.log("Integration hooks removed");
	},

	async reconcileWithoutBreakingWord(session) {
		try {
			await this.reconcileWordSession(session);
		}
		catch (error) {
			Zotero.logError(error);
			this.notify("Word 引用已处理，但同步 Collection 失败；请查看 Zotero 日志", true);
		}
	},

	getDocumentState() {
		try {
			let state = JSON.parse(this.getPref(this.PREF_DOCUMENT_STATE) || "{}");
			return state && typeof state === "object" ? state : {};
		}
		catch (error) {
			Zotero.logError(error);
			return {};
		}
	},

	getDocumentItemIDs(session, libraryID) {
		let itemIDs = new Set();
		for (let id of Object.keys(session?.citationsByItemID || {})) {
			let item = Zotero.Items.get(Number(id));
			if (!item || item.deleted || item.libraryID !== libraryID) continue;
			if (item.isAttachment?.() || item.isNote?.() || item.isAnnotation?.()) {
				item = item.parentID ? Zotero.Items.get(item.parentID) : null;
			}
			if (item && !item.deleted && item.libraryID === libraryID) itemIDs.add(item.id);
		}
		return itemIDs;
	},

	async reconcileWordSession(session) {
		if (!this.getPref(this.PREF_ENABLED)) return;
		let collection = this.getTargetCollection();
		if (!collection) {
			this.setPref(this.PREF_ENABLED, false);
			this.notify("目标 Collection 不存在，自动同步已暂停", true);
			return;
		}

		let documentID = String(session?.sessionID || session?.data?.sessionID || "");
		if (!documentID) throw new Error("Cannot determine the Word document session ID");
		let currentItemIDs = this.getDocumentItemIDs(session, collection.libraryID);
		let state = this.getDocumentState();
		let stateKey = `${collection.libraryID}:${collection.key}`;
		let collectionState = state[stateKey] || { documents: {}, managedItemIDs: [] };
		let previousItemIDs = new Set(collectionState.documents[documentID] || []);
		collectionState.documents[documentID] = [...currentItemIDs];

		let managedItemIDs = new Set(collectionState.managedItemIDs || []);
		for (let id of currentItemIDs) managedItemIDs.add(id);
		let citedByTrackedDocuments = new Set(Object.values(collectionState.documents).flat());
		let addItemIDs = [...currentItemIDs].filter(id => !collection.hasItem(id));
		let removeItemIDs = [...previousItemIDs].filter(id =>
			managedItemIDs.has(id)
			&& !citedByTrackedDocuments.has(id)
			&& collection.hasItem(id)
		);

		if (addItemIDs.length || removeItemIDs.length) {
			await Zotero.DB.executeTransaction(async () => {
				if (addItemIDs.length) await collection.addItems(addItemIDs);
				if (removeItemIDs.length) await collection.removeItems(removeItemIDs);
			});
		}
		for (let id of removeItemIDs) managedItemIDs.delete(id);
		collectionState.managedItemIDs = [...managedItemIDs];
		state[stateKey] = collectionState;
		this.setPref(this.PREF_DOCUMENT_STATE, JSON.stringify(state));

		if (addItemIDs.length || removeItemIDs.length) {
			let messages = [];
			if (addItemIDs.length) messages.push(`加入 ${addItemIDs.length} 篇`);
			if (removeItemIDs.length) messages.push(`移除 ${removeItemIDs.length} 篇`);
			this.log(`${messages.join(", ")} in collection ${collection.id}`);
			this.notify(`${messages.join("，")}：“${collection.name}”`);
		}
	},

	notify(message, force = false) {
		if (!force && !this.getPref(this.PREF_NOTIFICATIONS)) return;
		try {
			let progressWindow = new Zotero.ProgressWindow({ closeOnClick: true });
			progressWindow.changeHeadline("Citation Auto-Collection");
			progressWindow.addDescription(message);
			progressWindow.show();
			progressWindow.startCloseTimer(3500);
		}
		catch (error) {
			this.log(message);
			Zotero.logError(error);
		}
	},
};
