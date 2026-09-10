# Citation Auto-Collection

插件将 Word 文档中的 Zotero 引用与指定 Collection 同步：新增引用会自动加入；删除引用后，在下一次 Zotero Word 操作时会自动从 Collection 移除。

## 当前功能

- 仅在引用成功写入 Word 后处理；取消引用不会触发。
- 一条引文含多篇文献时，会添加全部文献。
- 编辑已有引文时，以编辑完成后的文献列表为准。
- 从 Word 删除引用后，点击 Word 中的 Zotero **Refresh**，对应文献会从目标 Collection 移除。
- 如果同一文献仍在该 Word 文档其他位置被引用，则不会移除。
- 多个已跟踪 Word 文档共用目标 Collection 时，只要其中一个文档仍引用该文献，就会保留。
- “移除”仅解除 Collection 归属，不会删除 Zotero library 中的文献本体或附件。
- 已在目标 Collection 中的文献不会重复添加。
- 只在同一个 Zotero library 内添加；跨 library 文献会跳过，避免数据库错误。
- 不处理 Add Note 和 Add Annotation。
- 禁用或卸载插件时会还原 Zotero integration 方法。

## 安装

1. 运行 `./build.sh`，或直接使用同目录生成的 `citation-auto-collection-0.1.2.xpi`。
2. Zotero → Tools → Plugins。
3. 点击齿轮菜单 → Install Plugin From File…。
4. 选择 `citation-auto-collection-0.1.2.xpi`。

## 使用

1. 在 Zotero 左侧栏选中目标 Collection。
2. Zotero → Tools → Citation Auto-Collection。
3. 点击 **将当前 Collection 设为目标 / Use selected Collection**。
4. 在 Word 中照常使用 Zotero Add/Edit Citation。

设定目标后插件会自动启用。可在同一菜单暂停或恢复。直接在 Word 中删除引用域后，请点击 Zotero **Refresh** 触发同步；Word 本身不会在按 Delete 的瞬间通知 Zotero。

## 兼容性与实现说明

- 当前版本针对本机 Zotero 10.0.1 验证源码接口，并声明兼容 Zotero 7–10。
- Zotero 10 要求清单包含 `update_url`。当前使用不可解析的 `.invalid` 占位地址，不会从网络安装更新；新版本仍需手动安装。
- 插件包装 `Zotero.Integration.Session.prototype.cite()` 和 Word Refresh 流程，在 Zotero 完成读取整份文档的引用状态后同步 Collection。
- 这是 Zotero 内部接口，不属于稳定的公开插件 API。Zotero 大版本更新后应重新做一次 Word 实机回归测试。
- 插件会检查 integration processor 名称，仅处理 Microsoft Word，不处理 LibreOffice 或 Google Docs。

## 手工验收清单

1. 新建测试 Collection 并设为目标。
2. Word Add/Edit Citation 插入一篇不在该 Collection 的文献：应自动加入。
3. 再次引用同一篇：Collection 不应出现重复项，也不应报错。
4. 在一条引文中插入两篇：两篇均应加入。
5. 打开引用对话框后取消：不应加入任何文献。
6. 编辑已有引文并新增一篇：新增文献应加入。
7. 暂停插件后插入：不应加入。
8. 引用其他 group library 的文献：若目标 Collection 不在该 library，应安全跳过。
9. 在 Word 中删除唯一的一处引用并点击 Zotero Refresh：对应文献应从 Collection 移除，但仍保留在 library 中。
10. 同一文献在 Word 中有两处引用，只删除一处并 Refresh：文献应继续保留在 Collection 中。

## 调试

在 Zotero 的 Help → Debug Output Logging 中启用日志，搜索 `Citation Auto-Collection`。自动加入失败不会撤销或破坏已经成功插入 Word 的引文。

开发时可运行 `node tests/run-tests.mjs` 执行核心逻辑的模拟测试。
