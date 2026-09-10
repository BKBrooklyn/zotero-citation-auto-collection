import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../citation-auto-collection.js", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));

assert.equal(manifest.manifest_version, 2);
assert.equal(manifest.version, "0.1.2");
assert.ok(manifest.applications?.zotero?.id);
assert.ok(manifest.applications?.zotero?.update_url);
assert.ok(manifest.applications?.zotero?.strict_max_version);

function makeHarness({ enabled = true, targetExists = true } = {}) {
	const prefs = new Map([
		["extensions.citation-auto-collection.enabled", enabled],
		["extensions.citation-auto-collection.targetLibraryID", 1],
		["extensions.citation-auto-collection.targetCollectionKey", "TARGET"],
		["extensions.citation-auto-collection.showNotifications", false],
		["extensions.citation-auto-collection.documentState", "{}"],
	]);
	const existing = new Set([10]);
	const added = [];
	const removed = [];
	const regular = id => ({
		id,
		libraryID: 1,
		deleted: false,
		isAttachment: () => false,
		isNote: () => false,
		isAnnotation: () => false,
	});
	const items = new Map([
		[10, regular(10)],
		[20, regular(20)],
		[30, { ...regular(30), libraryID: 2 }],
	]);
	const collection = {
		id: 99,
		key: "TARGET",
		name: "Test Collection",
		libraryID: 1,
		hasItem: id => existing.has(id),
		async addItems(ids) {
			added.push(...ids);
			ids.forEach(id => existing.add(id));
		},
		async removeItems(ids) {
			removed.push(...ids);
			ids.forEach(id => existing.delete(id));
		},
	};
	function Session() {}
	Session.prototype.cite = async () => [];
	function Interface() {}
	Interface.prototype.refresh = async () => true;
	const context = {
		CitationAutoCollection: undefined,
		Zotero: {
			Prefs: {
				get: key => prefs.get(key),
				set: (key, value) => prefs.set(key, value),
			},
			Collections: { getByLibraryAndKey: () => targetExists ? collection : null },
			Items: { get: id => items.get(id) },
			DB: { executeTransaction: callback => callback() },
			debug: () => {},
			logError: () => {},
			getMainWindows: () => [],
			Integration: { Session, Interface },
		},
	};
	vm.createContext(context);
	vm.runInContext(source, context);
	context.CitationAutoCollection.notify = () => {};
	return { plugin: context.CitationAutoCollection, prefs, added, removed, existing };
}

function session(id, itemIDs, processorName = "Word") {
	return {
		sessionID: id,
		_app: { processorName },
		citationsByItemID: Object.fromEntries(itemIDs.map(itemID => [itemID, [{}]])),
	};
}

{
	const { plugin, added, removed } = makeHarness();
	await plugin.reconcileWordSession(session("doc-1", [10, 20, 30]));
	assert.deepEqual(added, [20], "adds uncategorized items from the same library");
	assert.deepEqual(removed, []);
	await plugin.reconcileWordSession(session("doc-1", [20]));
	assert.deepEqual(removed, [10], "removes an item no longer cited by the Word document");
}

{
	const { plugin, removed } = makeHarness();
	await plugin.reconcileWordSession(session("doc-1", [10]));
	await plugin.reconcileWordSession(session("doc-2", [10]));
	await plugin.reconcileWordSession(session("doc-1", []));
	assert.deepEqual(removed, [], "keeps an item still cited by another tracked Word document");
}

{
	const { plugin, added, removed } = makeHarness({ enabled: false });
	await plugin.reconcileWordSession(session("doc-1", [20]));
	assert.deepEqual(added, []);
	assert.deepEqual(removed, [], "does nothing while disabled");
}

{
	const { plugin, prefs } = makeHarness({ targetExists: false });
	await plugin.reconcileWordSession(session("doc-1", [20]));
	assert.equal(prefs.get("extensions.citation-auto-collection.enabled"), false);
}

{
	const { plugin } = makeHarness();
	let calls = 0;
	plugin.reconcileWithoutBreakingWord = async () => { calls++; };
	plugin.installIntegrationHook();
	await plugin.wrappedCite.call(session("doc-1", [], "Word"));
	await plugin.wrappedCite.call(session("doc-2", [], "LibreOffice"));
	await plugin.wrappedCite.call(session("doc-3", [], "Microsoft Word"), null, true, false);
	await plugin.wrappedRefresh.call({
		_app: { processorName: "Word" },
		_session: session("doc-1", []),
	});
	assert.equal(calls, 2, "syncs after regular Word citation commands and Word Refresh only");
}

console.log("All Citation Auto-Collection tests passed.");
