# Citation Auto-Collection for Zotero

Citation Auto-Collection keeps a selected Zotero collection in sync with the references cited in a Microsoft Word document.

After Zotero successfully inserts or edits a citation in Word, the cited items are automatically added to the selected collection. When a citation is deleted from Word, the corresponding item is removed from that collection the next time Zotero **Refresh** or **Add/Edit Citation** is used.

> Removing an item from the collection does **not** delete it from the Zotero library. The item, its attachments, and its notes remain untouched.

## Features

- Adds cited Zotero items only after a citation has been successfully written to Word.
- Adds every item in a multi-item citation.
- Synchronises an edited citation using its final list of references.
- Removes items that are no longer cited after the next Zotero refresh or citation action.
- Keeps an item in the collection while it is still cited elsewhere in the same document.
- Tracks multiple Word documents that share the same target collection.
- Avoids duplicate collection membership.
- Skips items from a different Zotero library to prevent cross-library database errors.
- Ignores **Add Note** and **Add Annotation** actions.
- Restores the original Zotero integration methods when the plugin is disabled or uninstalled.

## Requirements

- Zotero 7–10
- Microsoft Word with the Zotero Word integration installed

Version 0.1.2 was tested against the integration interfaces in Zotero 10.0.1. Because the plugin relies on internal Zotero integration methods, it should be retested after a major Zotero update.

## Installation

1. Download `citation-auto-collection-0.1.2.xpi` from the [v0.1.2 release](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases/tag/v0.1.2).
2. In Zotero, open **Tools → Plugins**.
3. Open the gear menu and select **Install Plugin From File…**.
4. Select the downloaded `.xpi` file.
5. Restart Zotero if prompted.

## Setup and use

1. Select the collection you want to use in Zotero's left sidebar.
2. Open **Tools → Citation Auto-Collection**.
3. Click **Use selected Collection**.
4. In Word, use Zotero **Add/Edit Citation** as usual.

Selecting a target collection automatically enables the plugin. The same Zotero menu can be used to pause or resume synchronisation.

### When a citation is deleted in Word

Word does not notify Zotero at the moment a citation field is deleted. After deleting a citation:

1. Open the **Zotero** tab in Word.
2. Click **Refresh**.

The plugin then reads the document's current citation state. An item is removed from the target collection only if it is no longer cited by any tracked document using that collection.

## Data and privacy

The plugin runs locally inside Zotero. It does not collect analytics, transmit document content, or send Zotero library data to an external service.

It stores only the selected collection identifier, the enabled/disabled setting, notification preferences, and the minimum document state required for synchronisation in Zotero's local preferences.

## Limitations

- Microsoft Word is supported; LibreOffice and Google Docs are not processed.
- Synchronisation is triggered by Zotero Word integration actions, not immediately when a Word field is deleted.
- Items can only be added to a collection in the same Zotero library.
- Automatic online updates are not currently configured. New versions must be installed manually.

## Troubleshooting

If an item is not added or removed:

1. Confirm that the correct target collection is selected in **Tools → Citation Auto-Collection**.
2. Confirm that synchronisation is enabled.
3. Click **Refresh** in the Zotero tab in Word.
4. In Zotero, enable **Help → Debug Output Logging**, reproduce the issue, and search the log for `Citation Auto-Collection`.

A collection synchronisation error will not undo or damage a citation that Word has already inserted successfully.

## Development

Build the installable package:

```sh
./build.sh
```

Run the simulated core-logic tests:

```sh
node tests/run-tests.mjs
```

The generated `.xpi` is intentionally excluded from Git. Release packages are distributed through [GitHub Releases](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases).

## Manual acceptance checklist

1. Create a test collection and set it as the target.
2. Insert a reference that is not already in the collection; it should be added automatically.
3. Cite the same item again; no duplicate or error should appear.
4. Insert a citation containing two items; both should be added.
5. Open and cancel the citation dialog; nothing should be added.
6. Edit an existing citation and add another item; the new item should be added.
7. Pause the plugin and insert a citation; nothing should be added.
8. Cite an item from another library; it should be skipped safely.
9. Delete the only citation of an item and click **Refresh**; the item should leave the collection but remain in the library.
10. Cite an item twice, delete only one citation, and click **Refresh**; the item should remain in the collection.

## Licence

No open-source licence has been selected yet. Until a licence is added, the source code remains publicly viewable but is not granted for reuse, modification, or redistribution.
