<p align="center">
  <img src="assets/logo.png" width="160" alt="Citation Auto-Collection logo">
</p>

<h1 align="center">Citation Auto-Collection for Zotero</h1>

[![Latest release](https://img.shields.io/github/v/release/BKBrooklyn/zotero-citation-auto-collection)](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases/latest)
![Zotero compatibility](https://img.shields.io/badge/Zotero-7--10-CC2936)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**English** | [简体中文](docs/README.zh-CN.md)

**Homepage:** https://github.com/BKBrooklyn/zotero-citation-auto-collection

## Abstract

Citation Auto-Collection keeps a selected Zotero collection in sync with the references cited in Microsoft Word.

After Zotero successfully inserts or edits a citation, the cited items are automatically added to the selected collection. When a citation is deleted from Word, the corresponding item is removed from that collection the next time Zotero **Refresh** or **Add/Edit Citation** is used.

> [!IMPORTANT]
> Removing an item from the collection does **not** delete it from the Zotero library. The item, attachments, and notes remain untouched.

## Features

| Word/Zotero action | Collection result |
| --- | --- |
| Insert a citation | Add every cited item |
| Edit a citation | Synchronise the final item list |
| Delete a citation, then click **Refresh** | Remove items no longer cited |
| Cancel the citation dialog | Make no change |
| Cite the same item more than once | Keep a single collection membership |
| Cite an item from another library | Skip it safely |

The plugin also tracks multiple Word documents that share a target collection. An item remains in the collection while any tracked document still cites it.

## Requirements

- Zotero 7–10
- Microsoft Word with the Zotero Word integration installed

Version 1.0.1 was tested against Zotero 10.0.1 integration interfaces. The plugin uses internal Zotero integration methods, so a regression test is recommended after a major Zotero update.

## Installation

1. Download the `.xpi` file from the [latest release](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases/latest).
2. In Zotero, open **Tools → Plugins**.
3. Open the gear menu and select **Install Plugin From File…**.
4. Select the downloaded `.xpi` file.
5. Restart Zotero if prompted.

> [!NOTE]
> Version 1.0.0 uses the technical add-on ID `citation-auto-collection@bkbrooklyn.github.io`. If a pre-1.0 build is installed, uninstall it before installing 1.0.0 to prevent both add-ons from running at the same time. This does not delete Zotero items or collections.

## User Guide

### Choose a target collection

1. Select the collection in Zotero's left sidebar.
2. Open **Tools → Citation Auto-Collection**.
3. Click **Use selected Collection**.
4. Use Zotero **Add/Edit Citation** in Word as usual.

Choosing a target collection automatically enables synchronisation. Use the same Zotero menu to pause or resume it.

### Synchronise a deleted citation

Word does not notify Zotero at the moment a citation field is deleted. After deleting a citation:

1. Open the **Zotero** tab in Word.
2. Click **Refresh**.

The plugin reads the document's current citations and removes only the collection memberships that are no longer required.

## Limitations

- Microsoft Word is supported; LibreOffice and Google Docs are not processed.
- Deletion synchronisation runs during a Zotero Word integration action, not at the instant a Word field is deleted.
- Items can only be added to a collection in the same Zotero library.
- Automatic online updates are not currently configured; install new versions manually.

## Troubleshooting

If an item is not added or removed:

1. Confirm the target collection under **Tools → Citation Auto-Collection**.
2. Confirm that synchronisation is enabled.
3. Click **Refresh** in the Zotero tab in Word.
4. In Zotero, enable **Help → Debug Output Logging**, reproduce the issue, and search for `Citation Auto-Collection`.

A collection synchronisation error will not undo or damage a citation that Word has already inserted successfully.

## Data and Privacy

Citation Auto-Collection runs locally inside Zotero. It does not collect analytics, transmit document content, or send Zotero library data to an external service.

It stores only the selected collection identifier, enabled state, notification preference, and the minimum document state required for synchronisation in Zotero's local preferences.

## Developer Guide

Build the installable package:

```sh
./build.sh
```

Run the simulated core-logic tests:

```sh
node tests/run-tests.mjs
```

The generated `.xpi` is excluded from Git. Installable packages are distributed through [GitHub Releases](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases).

### Implementation notes

- Wraps `Zotero.Integration.Session.prototype.cite()` and the Word refresh flow.
- Synchronises the collection after Zotero has read the document's citation state.
- Checks the integration processor name and processes Microsoft Word only.
- Restores Zotero's original integration methods when disabled or uninstalled.

## Contributing

Bug reports and focused pull requests are welcome. When reporting an integration problem, include the Zotero version, Word version, operating system, reproduction steps, and relevant Zotero debug output. Do not include private document content or library data.

## License

Copyright © 2026 Brooklyn Liu.

Released under the [MIT License](LICENSE).
