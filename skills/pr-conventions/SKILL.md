---
name: pr-conventions
description: >-
  Branch naming, commit messages, PR titles, PR body structure, labels, and the
  pre-PR checklist for the awell-extensions repo. Use whenever you are about to
  create a branch, write a commit, or open/title a PR here — for ANY change, not
  just extensions. Do NOT use for version bumps (CI auto-bumps on merge), release
  PRs (release/* is owned by the release workflow), or automated dependency PRs.
allowed-tools: Read, Grep, Glob, Bash(git status), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git add:*), Bash(git commit:*)
---

# PR & Branch Conventions — Agent Skill

> **Purpose:** Tell an AI agent exactly how to name branches, write commit messages, title PRs, structure PR bodies, and what must pass before opening a PR in the `awell-extensions` repo.
>
> **Scope:** Branch creation, commit messages, PR titles, PR bodies, pre-PR verification, and the `gh pr create` command for this repo. **Do NOT use this skill for** version bumps (CI auto-bumps on merge), release PRs (`release/*` branches are owned by the release workflow), or Dependabot/Aikido-style automated dependency PRs.
>
> **Companion skill:** [`building-awell-extensions`](../building-awell-extensions/SKILL.md) (extension building). When you finish building an extension, follow this skill to ship it.

Derived from analysing the last ~200 PRs and ~50 commits on `main` in this repo.

---

## 0. Persistent facts (read first — never summarise away)

- **Default branch is `main`.** Open all PRs against `main` unless explicitly told otherwise.
- **Squash merge is the dominant practice.** Your PR title becomes the squash commit subject on `main` (with ` (#NNN)` appended). Write the PR title as if it were the commit title.
- **Do NOT bump `package.json` version.** CI (`create-release.yml`) auto-bumps patch on every merge to `main` and publishes to npm. A version bump in your PR will conflict / be overwritten.
- **Do NOT add a `release/*` branch.** Those are owned by the release workflow for beta testing.
- **Do NOT manually add `Review effort 1/5`–`5/5` labels.** CodiumAI PR-Agent applies them automatically.
- **No `CONTRIBUTING.md` or `.github/PULL_REQUEST_TEMPLATE.md` exists in-repo.** External contributing guidelines live at https://developers.awellhealth.com/awell-extensions/docs/getting-started/contributing-guidelines — your PR should still follow the de facto structure in §5 below.
- **Required CI check:** `test` job in `.github/workflows/test.yml` (runs `yarn install`, `yarn build`, `yarn test` on Node 22). Lint is NOT enforced by CI but is requested in the root README — run it locally.
- **No signed-commit requirement.** No GPG signing needed.
- **Branches are deleted on merge** (repo setting).
- **Deterministic enforcement in place:** the no-version-bump rule in this section is enforced in CI by `.github/workflows/conventions.yml` (which runs `.github/scripts/check-repo-conventions.sh`). The PR-title rule in §3 is enforced by `.github/workflows/pr-title.yml`. Both block the action — they are not prompt-based. Other rules in this file are prompt-based guidance.

---

## 1. Branch naming — decision matrix

Use the first row that matches your work:

| PR type | Branch pattern | Example |
|---------|---------------|---------|
| New extension or new action(s) in an existing extension | `feat/<extensionKey>-<short-kebab-desc>` | `feat/bland-stop-active-call` |
| Bug fix to an extension | `fix/<extensionKey>-<short-kebab-desc>` | `fix/shelly-summarize-form-timeout` |
| README/CHANGELOG/docs only | `docs/<extensionKey>-<short-kebab-desc>` | `docs/bland-language-field-description` |
| Cross-cutting maintenance (no single extension) | `chore/<short-kebab-desc>` | `chore/upgrade-langchain` |
| You have a Linear/Jira ticket | `<ticket-id>-<short-kebab-desc>` (lowercase) | `awl-4187-decrease-concurrent-requests` |
| Test-only change | `test/<short-kebab-desc>` | `test/bland-webhook-payload-structure` |

**Rules:**
- `kebab-case` — lowercase, hyphen-separated, no underscores.
- Embed the **extension key** in the description when the change is scoped to one extension. This makes `git log` scans by extension fast.
- Keep it short — under ~60 chars. Long descriptions belong in the PR title, not the branch name.
- Do NOT use opaque names (`bland-fix`, `fix-documo-webhooks`, `add-missing-log`, `.`). They survive today but fail search later.
- Do NOT use `devin/<timestamp>-<desc>` — that's reserved for the Devin AI agent's own branches.

**Command:**

```bash
git checkout main && git pull --ff-only
git checkout -b feat/bland-stop-active-call
```

---

## 2. Commit messages on the branch

Because PRs are squash-merged, individual commit messages on your branch are mostly cosmetic — but the **PR title** (which becomes the squash subject) is load-bearing. Still, keep commits clean in case a reviewer browses them.

**Preferred style:** [Conventional Commits](https://www.conventionalcommits.org/) with extension scope:

```
<type>(<extensionKey>): <imperative description>
```

- **Types:** `feat`, `fix`, `chore`, `docs`, `test`
- **Scope:** the extension key (e.g. `bland`, `healthie`, `elation`). Omit the scope for cross-cutting changes (`chore: upgrade langchain`).
- **Mood:** imperative ("add", "fix", "expose"), not past tense ("added", "fixed").
- **Reference the PR/issue only if relevant** — the squash merge auto-appends `(#NNN)`, so don't pre-add it on commits.

**Examples (from `main`):**

```
feat(hix): add ChipSoft HiX extension
feat(bland): expose answeredBy and errorMessage in Get call details
fix(bland): return early from callCompleted webhook when call_id is missing
fix(shelly): prevent Summarize Form timeouts on gpt-5-mini
chore(hubspot): upgrade @hubspot/api-client to v13.5.0 and enable automated retries
chore: remove hix extension (moved to extension-nimble)
docs(bland): clarify language field format and default
test: assert full onError payload structure in validation tests
```

**Do not mimic automated commit styles:**
- `chore: release v2.1.135` — CI-authored
- `ci: bump version to X.X.X-beta.N [skip ci]` — pre-release CI
- `chore(deps): ...` — Dependabot
- `[Aikido] Fix ...` — security bot

---

## 3. PR title

**Rule:** the PR title IS the intended squash commit title (without the `(#NNN)` suffix — GitHub adds it).

```
<type>(<extensionKey>): <imperative description>
```

Same conventions as §2. One line, imperative, scope = extension key when applicable.

**Examples (real PRs):**

| PR | Title |
|----|-------|
| #786 | `feat(hix): add ChipSoft HiX extension` |
| #776 | `feat(awell): opt in all actions for automated retries` |
| #785 | `feat(bland): expose answeredBy and errorMessage in Get call details` |
| #787 | `fix(bland): return early from callCompleted webhook when call_id is missing` |
| #794 | `fix(shelly): prevent Summarize Form timeouts on gpt-5-mini` |
| #793 | `chore: remove hix extension (moved to extension-nimble)` |
| #777 | `docs(bland): clarify language field format and default` |
| #779 | `fix: migrate pathwayActivities to careflowActivities` |

**Avoid** (these merged in the past but fail search/convention):
- `fix-documo-webhooks` (no `fix:` prefix, no scope)
- `Fix track actions` (capitalised, no prefix)
- `add missing log` (no prefix, no scope, vague)
- `bring it back up to 3` (opaque)
- `.` (literally empty)

---

## 4. PR body — template

No in-repo PR template exists. Use this structure:

```markdown
## Summary

- <one bullet: what changed>
- <one bullet: why / scope / motivation>

## Test plan

- [x] `yarn build` passes
- [x] `yarn test` passes
- [ ] <manual verification step, e.g. "Tested in Studio with a previewable action">
```

### When to extend the body

| Situation | Add |
|-----------|-----|
| Bug fix with non-obvious root cause | `## Context` and `## Root cause` sections before `## Summary` |
| Breaking change | A `## Breaking changes` section listing affected extension keys / data points / setting keys, and note the major-version impact |
| New extension | `## Actions added` listing each action key + one-line description |
| Webhook added | `## Webhooks added` + note about signature verification (see [`building-awell-extensions`](../building-awell-extensions/SKILL.md) §5.1) |
| Follow-up work needed | `## Note / follow-up` with concrete next steps |

**Examples of body styles (from real PRs):**

Minimal chore (#793):
```markdown
## Summary
- Removes the `hix` extension entirely from awell-extensions
- The `createTask` action has been migrated to extension-nimble

## Test plan
- [ ] Confirm `extensions/hix/` is gone and no references remain in `extensions/index.ts`
```

Detailed bug fix (#794) — sections in order: `## Context` → `## Root cause` → `## Changes` → `## Note / follow-up` → `## Testing`.

**What you do NOT need in the body:**
- File-by-file change list (GitHub's diff UI covers it)
- Screenshots (not conventional in this repo)
- Linear/Jira links in the body (linking happens in the Linear ticket, per the issue template)
- `🤖 Generated with ...` / `Made with Cursor` footers (cosmetic; seen on some AI-authored PRs but not required)

---

## 5. Labels

**Do not manually apply labels** in the normal workflow. The only labels you might add:

| Label | When to apply |
|-------|--------------|
| `ai-action` | The PR adds an AI-powered action (LLM-based). Manually applied. |
| `ai-action-demo` | Sandbox/demo AI action. Manually applied. |

Everything else (`Review effort 1/5`–`5/5`, `dependencies`, `bot`) is applied by automation. The `extension:<name>` and `linear` labels exist in the label set but are **not** used in practice — don't rely on them.

---

## 6. Pre-PR checklist (must pass before `gh pr create`)

- [ ] Branch name follows §1
- [ ] All commits on the branch follow §2 (or you're confident the PR title in §3 will be the squash subject)
- [ ] PR title follows §3
- [ ] PR body follows §4
- [ ] `yarn build` passes locally
- [ ] `yarn test` passes locally (if you added/changed behaviour, you added/updated tests)
- [ ] `yarn lint` passes (not enforced by CI but requested)
- [ ] If you added a new extension: it's registered in `extensions/index.ts`, has non-empty `README.md` (frontmatter) + `CHANGELOG.md`, every `Field.id` equals its key
- [ ] If you modified an existing extension: its `CHANGELOG.md` has a new entry under `## Unreleased` (or the appropriate section)
- [ ] **You did NOT bump `package.json` version** (CI does that)
- [ ] PR targets `main`

---

## 7. Open the PR — command

```bash
gh pr create \
  --base main \
  --head feat/bland-stop-active-call \
  --title "feat(bland): add stop active call action" \
  --body "$(cat <<'EOF'
## Summary

- Adds `stopCall` action to the Bland extension
- Returns the call status as a data point for downstream care-flow branching

## Test plan

- [x] `yarn build` passes
- [x] `yarn test` passes (added `stopCall.test.ts` covering success + missing-call-id error)
- [ ] Manually tested against Bland sandbox with an in-progress call
EOF
)"
```

After opening, watch CI: the **`test` job in "Build and test"** is the only required check. If it fails, fix and push to the same branch — the PR updates automatically. Do NOT close and reopen.

---

## 8. PR size guidance

This repo values small PRs. From the last 30 merged PRs the median is **4 files / ~50 LOC**; 47% are under 50 LOC and only 10% exceed 500 LOC. External contributing guidelines:

| Size | Files / LOC | Review SLA |
|------|------------|-----------|
| Small | < 5 files, < 100 LOC | 48h |
| Medium | 5–20 files, 100–500 LOC | 72h |
| Large | > 20 files, > 500 LOC | 1 week |

**Agent preference:** one extension OR one action OR one fix per PR. If you're tempted to touch 3 extensions in one PR, split it into 3 PRs — they'll review faster and merge independently.

---

## 9. After merge

- The branch is auto-deleted (repo setting). Don't manually delete.
- CI opens a follow-up `chore: release vX.X.X` commit on `main` and publishes to npm. You don't participate in this.
- If your change was a new extension or new action, add a comment in the linked Linear ticket pointing to the PR (per the issue template) — but only if a Linear ticket exists.

---

## 10. Common gotchas

- **Don't bump `package.json` version.** This is the most common agent mistake. CI bumps patch on every merge; a manual bump in your PR conflicts and gets overwritten.
- **Don't open PRs against `release/*`.** Those branches are owned by the release workflow.
- **Don't add `(#NNN)` to your PR title.** GitHub adds it on squash.
- **Don't pre-add `chore: release ...` style commits.** Those are CI-authored.
- **Don't manually apply `Review effort` labels.** CodiumAI does it.
- **Don't use `devin/<timestamp>-<desc>` branch naming.** Reserved for the Devin agent.
- **Don't use vague PR titles** like `fix-documo-webhooks` or `add missing log` — use `fix(documo): ...` and `feat(<key>): ...` instead.
- **Don't open a PR with an empty body.** Even a 2-line `## Summary` is enough; empty bodies have merged before but are not the bar to aim for.
- **Don't sign commits.** No GPG signing is required in this repo.
- **Don't add `extension:<name>` labels.** They exist in the label set but aren't used.

---

## 11. Reference examples by scenario

| You are... | Branch | PR title | Body style |
|-----------|--------|----------|------------|
| Adding a new extension `acme` | `feat/acme-extension` | `feat(acme): add Acme extension` | `## Summary` + `## Actions added` + `## Test plan` |
| Adding an action to `bland` | `feat/bland-stop-active-call` | `feat(bland): add stop active call action` | `## Summary` + `## Test plan` |
| Fixing a webhook bug in `medplum` | `fix/medplum-observation-patient-id` | `fix(medplum): resolve patient id extraction in observationCreated webhook` | `## Context` + `## Root cause` + `## Summary` + `## Test plan` |
| Upgrading a shared dep (langchain) | `chore/upgrade-langchain` | `chore: upgrade langchain to v0.2.x` | `## Summary` + `## Test plan` (note affected extensions) |
| Docs-only change to `bland` README | `docs/bland-language-field-description` | `docs(bland): clarify language field format and default` | `## Summary` + `## Test plan` (often just "rendered locally") |
| Cross-cutting migration | `fix/migrate-careflow-activities` | `fix: migrate pathwayActivities to careflowActivities` | `## Summary` + `## Breaking changes` (if any) + `## Test plan` |
| Linear-ticketed work | `awl-4187-decrease-concurrent-requests` | `feat(...)` or `fix(...)` per the change | `## Summary` + `## Test plan` + Linear ticket reference inline |
