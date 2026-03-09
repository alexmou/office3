# <img src="https://raw.githubusercontent.com/EtienneLescot/n8n-as-code/main/res/logo.png" alt="n8n-as-code logo" width="32" height="32"> @n8n-as-code/cli

The main command-line interface for the **n8n-as-code** ecosystem. Manage, synchronize, and version-control your n8n workflows as TypeScript files.

> This package also embeds the synchronization engine and exposes it as a library for the VS Code extension.

## Installation

```bash
npm install -g @n8n-as-code/cli
```

## Commands

### `init`
Interactive wizard — configure the connection to an n8n instance and pick the active project.

```bash
n8nac init
```

Creates `n8nac.json` in the current folder and stores the API key outside the repo.

---

### `switch`
Switch the active n8n project (updates `projectId` / `projectName` in `n8nac.json`).

```bash
n8nac switch
```

---

### `list`
Display workflow status in a git-like model. By default shows combined local and remote workflows.

```bash
n8nac list                    # Combined view (default)
n8nac list --local            # Show only local workflows
n8nac list --remote           # Show only remote workflows (alias: --distant)
```

Output columns: `Status` · `ID` · `Name` · `Local Path`

Status values:

| Status | Meaning | Action |
|---|---|---|
| `TRACKED`             | Workflow exists on both sides, no local changes detected             | Nothing to do |
| `MODIFIED_LOCALLY`    | Local file changed since last sync | `push --workflowsid` |
| `CONFLICT`            | Both sides changed — detected at push/pull time | `pull --workflowsid` (keep remote) or `push --workflowsid` (keep local) |
| `EXIST_ONLY_LOCALLY`  | New local file not yet in n8n (or remote was deleted) | `push --workflowsid` to create in n8n |
| `EXIST_ONLY_REMOTELY` | Remote workflow not yet local (or local was deleted) | `pull --workflowsid` to download |

> **Git-like sync**: Status is a point-in-time observation. Use `fetch` to update remote state cache.
> **For agents**: always run `n8nac list` first to get workflow IDs and their current status before pulling or pushing.

---

### `fetch --workflowsid <workflowId>`
Update remote state cache for a specific workflow (internal reference for comparison).

```bash
n8nac fetch --workflowsid <workflowId>          # Fetch specific workflow's remote state
```

- Updates internal comparison cache for the specified workflow only
- Use before `list` to ensure status reflects latest remote state for that workflow
- Required for accurate conflict detection
- For heavy instances, fetch individual workflows rather than all at once

---

### `pull --workflowsid <workflowId>`
Download a single workflow from n8n and overwrite the local file.

```bash
n8nac pull --workflowsid <workflowId>
```

> Recommended for agents and scripts. Targets exactly one workflow.

---

### `push --workflowsid <workflowId>`
Upload a single local workflow file to n8n.

```bash
n8nac push --workflowsid <workflowId>
```

---

### `resolve --workflowsid <id> --mode <mode>`
Explicitly resolve a conflict for a specific workflow.

```bash
n8nac resolve --workflowsid <id> --mode keep-current    # Force-push local version
n8nac resolve --workflowsid <id> --mode keep-incoming   # Force-pull remote version
```

---

### `update-ai`
Generate or refresh AI context files in the project root. This command will create `AGENTS.md` and VS Code snippets (when possible).

Note: to run skills-related tooling locally you must have `@n8n-as-code/skills` available in your environment. Install it into your project or globally, or run via `npx`:

```bash
# Install locally as dev dependency
npm install --save-dev @n8n-as-code/skills

# Or install globally
npm install -g @n8n-as-code/skills

# Or run via npx
npx @n8n-as-code/skills update-ai
```

The CLI will not create local executable shims in the project root when invoked directly. Shims such as `n8nac` / `n8nac.cmd` and `n8nac-skills` are only generated when `update-ai` is executed by the VS Code extension (the extension provides its installation path to create safe, versioned shims). This avoids surprising file creation in projects where the skills CLI is installed independently.

```bash
n8nac update-ai
```

---

### `convert`
Convert a single workflow between JSON and TypeScript formats.

```bash
n8nac convert <file>
n8nac convert my-workflow.json --format typescript
n8nac convert my-workflow.workflow.ts --format json
```

### `convert-batch`
Batch-convert all workflows in a directory.

```bash
n8nac convert-batch workflows/ --format typescript
```

---

## 🤖 Agent workflow

The intended flow for an AI agent editing a workflow:

```bash
# 1. Fetch current state and get workflow IDs
n8nac list

# 2. Pull the target workflow
n8nac pull --workflowsid <workflowId>

# 3. Edit the local .workflow.ts file

# 4. Push it back
n8nac push --workflowsid <workflowId>
```

---

## 🏗 Part of the Ecosystem
- `@n8n-as-code/skills`: AI-integration tools (node search, schemas, context generation).
- `vscode-extension`: Visual editing in VS Code (uses this package as its sync library).

## 📄 License
MIT
