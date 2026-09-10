var CitationAutoCollection;

function log(message) {
	Zotero.debug(`Citation Auto-Collection: ${message}`);
}

function install({ version }) {
	log(`Installed ${version}`);
}

async function startup({ id, version, rootURI }) {
	log(`Starting ${version}`);
	Services.scriptloader.loadSubScript(rootURI + "citation-auto-collection.js");
	CitationAutoCollection.init({ id, version, rootURI });
	CitationAutoCollection.addToAllWindows();
	CitationAutoCollection.installIntegrationHook();
}

function onMainWindowLoad({ window }) {
	CitationAutoCollection?.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	CitationAutoCollection?.removeFromWindow(window);
}

function shutdown() {
	if (!CitationAutoCollection) return;
	log(`Shutting down ${CitationAutoCollection.version}`);
	CitationAutoCollection.removeIntegrationHook();
	CitationAutoCollection.removeFromAllWindows();
	CitationAutoCollection = undefined;
}

function uninstall({ version }) {
	log(`Uninstalled ${version}`);
}
