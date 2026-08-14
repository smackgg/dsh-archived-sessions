# dsh-archived-sessions

[English](./README.md)

一个可安装的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 组合包（bundle），用于增加“已归档”设置页并恢复已归档会话。

## 功能

- 展示已归档会话的标题、所属工作区和最后更新时间。
- 通过“设置 → 已归档 → 取消”恢复会话。
- 恢复后沿用 Harness 现有状态同步，让会话重新出现在左侧列表。
- 在同一个 DSH bundle 中同时提供 Host 和 Web Client 能力。
- 使用严格的 Typert 描述校验 Host/Client RPC 边界。

## 环境要求

- DeepSeek Harness `0.1.0-rc.6`
- `web` profile，或其他包含 Harness Web UI 的 profile

Harness 当前尚未公开取消归档 API。本插件通过锁定版本中可用的 workspace registry 状态接口串行更新归档状态。若未来版本移除这些接口，兼容性测试会主动失败，避免静默损坏数据。

## 安装

### 从 GitHub 安装

请锁定 release tag 或 commit，避免仓库后续更新改变实际运行的代码：

```bash
dsh plugin --profile web add github:smackgg/dsh-archived-sessions#<tag-or-commit>
```

### 从本地仓库安装

```bash
git clone https://github.com/smackgg/dsh-archived-sessions.git
dsh plugin --profile web add /absolute/path/to/dsh-archived-sessions
```

### 从 npm 安装

在 npm 版本发布后可执行：

```bash
dsh plugin --profile web add dsh-archived-sessions@0.1.0
```

本仓库会提交可直接运行的 JavaScript，因此从 GitHub 安装时无需额外构建，也无需授予 pnpm `allowBuilds` 权限。

## 验证与启动

建议先检查组合后的 profile，再启动：

```bash
dsh --profile web --dump-config
dsh --profile web
```

打开“设置 → 插件 → 插件列表”，搜索 `archived-sessions`，挂载的模块应显示为“已启用”。可安装包名是 `dsh-archived-sessions`，Harness 在此列表中展示的是模块 ID。恢复入口位于“设置 → 已归档”。

安装或升级后，需要重启正在运行的 Harness 或桌面客户端。

## 升级

安装新的固定 tag 或 commit：

```bash
dsh plugin --profile web add github:smackgg/dsh-archived-sessions#<new-tag-or-commit>
```

## 卸载

```bash
dsh plugin --profile web remove dsh-archived-sessions
```

卸载后请重启 Harness。

## 桌面客户端内置

桌面客户端可以将本包作为锁定版本的生产依赖，并在启动 profile 时应用包内导出的 `cordis.patch.yml`。这种模式下，桌面用户无需手动安装插件。

不要在同一个 profile 中既安装本 bundle，又让桌面客户端再次注入它；重复的 Loader 行或 Remote namespace 会导致启动失败。

## 开发

```bash
npm install
npm test
npm run pack:check
```

包结构遵循官方 DSH bundle 规范：

```text
.
├── package.json       # dsh.bundle 与 dsh.client manifest
├── cordis.patch.yml   # bundle 提供的 Loader 配置层
└── src/
    ├── index.js       # Host 恢复服务
    ├── client.js      # Web 设置 UI 与 Client Remote 挂载
    ├── typert.host.js
    └── typert.remote-client.js
```

## 相关文档

- [第一个 Harness 插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)
- [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish)
- [服务与依赖注入](https://deepseek-harness.github.io/deepseek-harness/develop/framework/service)
- [Typert 子系统](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/typert)
- [客户端模块子系统](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/client-modules)

## 许可证

[MIT](./LICENSE)
