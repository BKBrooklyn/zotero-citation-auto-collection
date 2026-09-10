# Citation Auto-Collection for Zotero

[![最新版本](https://img.shields.io/github/v/release/BKBrooklyn/zotero-citation-auto-collection)](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases/latest)
![Zotero 兼容性](https://img.shields.io/badge/Zotero-7--10-CC2936)
[![许可证：MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

[English](../README.md) | **简体中文**

## 简介

Citation Auto-Collection 用于同步 Microsoft Word 文档中的 Zotero 引用与指定 Collection。

通过 Zotero 成功插入或编辑 Word 引文后，插件会自动将所引文献加入目标 Collection。从 Word 删除引文后，在下一次使用 Zotero **Refresh** 或 **Add/Edit Citation** 时，对应文献会自动从该 Collection 移除。

> [!IMPORTANT]
> 从 Collection 移除不等于从 Zotero 文献库删除。文献条目、附件和笔记均会保留。

## 功能

| Word/Zotero 操作 | Collection 结果 |
| --- | --- |
| 插入引文 | 加入引文中的全部文献 |
| 编辑引文 | 按编辑完成后的文献列表同步 |
| 删除引文后点击 **Refresh** | 移除已不再引用的文献 |
| 取消引文对话框 | 不作任何更改 |
| 多次引用同一文献 | Collection 中只保留一份归属 |
| 引用其他 library 的文献 | 安全跳过 |

插件可以跟踪共用同一目标 Collection 的多个 Word 文档。只要任一已跟踪文档仍引用某篇文献，该文献就会继续保留在 Collection 中。

## 运行要求

- Zotero 7–10
- Microsoft Word，并已安装 Zotero Word 集成组件

1.0.0 版已针对 Zotero 10.0.1 的集成接口进行测试。插件使用 Zotero 内部接口，Zotero 大版本升级后建议重新进行回归测试。

## 安装

1. 从 [最新 Release](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases/latest) 下载 `.xpi` 文件。
2. 在 Zotero 中打开 **Tools → Plugins**。
3. 打开齿轮菜单，选择 **Install Plugin From File…**。
4. 选择下载的 `.xpi` 文件。
5. 如果 Zotero 提示，请重新启动。

> [!NOTE]
> 1.0.0 版使用技术性插件 ID `citation-auto-collection@bkbrooklyn.github.io`。如果已经安装 1.0.0 之前的测试版本，请先卸载旧版再安装 1.0.0，避免两个插件同时运行。卸载旧插件不会删除 Zotero 文献或 Collection。

## 使用指南

### 设置目标 Collection

1. 在 Zotero 左侧栏选中目标 Collection。
2. 打开 **Tools → Citation Auto-Collection**。
3. 点击 **Use selected Collection**。
4. 在 Word 中照常使用 Zotero **Add/Edit Citation**。

选定目标 Collection 后，同步功能会自动启用。可以在同一菜单中暂停或恢复。

### 同步从 Word 删除的引文

Word 不会在删除引文字段的瞬间通知 Zotero。删除引文后：

1. 打开 Word 的 **Zotero** 选项卡。
2. 点击 **Refresh**。

插件会读取文档当前的引文状态，仅移除已经不再需要的 Collection 归属。

## 使用限制

- 当前仅处理 Microsoft Word，不处理 LibreOffice 或 Google Docs。
- 删除同步由 Zotero Word 集成操作触发，并非在删除 Word 字段的瞬间执行。
- 文献只能加入同一个 Zotero library 内的 Collection。
- 当前未配置在线自动更新；新版本需要手动安装。

## 故障排查

如果文献没有正确加入或移除：

1. 在 **Tools → Citation Auto-Collection** 中确认目标 Collection。
2. 确认同步功能已启用。
3. 在 Word 的 Zotero 选项卡中点击 **Refresh**。
4. 在 Zotero 中启用 **Help → Debug Output Logging**，复现问题并搜索 `Citation Auto-Collection`。

Collection 同步错误不会撤销或破坏已经成功写入 Word 的引文。

## 数据与隐私

本插件完全在 Zotero 本地运行，不收集分析数据，不上传文档内容，也不会向外部服务发送 Zotero 文献库数据。

插件仅在 Zotero 本地首选项中保存目标 Collection 标识、启用状态、通知设置，以及同步所需的最少文档状态。

## 开发指南

构建 `.xpi` 安装包：

```sh
./build.sh
```

运行核心逻辑模拟测试：

```sh
node tests/run-tests.mjs
```

生成的 `.xpi` 不提交到 Git，而是通过 [GitHub Releases](https://github.com/BKBrooklyn/zotero-citation-auto-collection/releases) 分发。

## 参与贡献

欢迎提交问题和范围明确的 Pull Request。报告集成问题时，请提供 Zotero 版本、Word 版本、操作系统、复现步骤以及相关 Zotero 调试日志。请勿提交私人文档内容或文献库数据。

## 许可证

版权所有 © 2026 Brooklyn Liu。

本项目采用 [MIT License](../LICENSE)。
