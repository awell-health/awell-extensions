# Awell extension agent skills

Agent skills that teach an AI coding agent how to build and test [Awell extensions](https://github.com/awell-health/awell-extensions). Each skill is a plain-Markdown `SKILL.md` with YAML frontmatter, following the [Agent Skills](https://agentskills.io) open standard.

This directory is the single source of truth for the skills.

## Skills

| Skill | What it does |
| --- | --- |
| [`building-awell-extensions`](./building-awell-extensions/SKILL.md) | Build or extend an extension from a vendor's API docs and a user's intent. |
| [`testing-awell-extensions`](./testing-awell-extensions/SKILL.md)   | Run, test, and verify an existing extension (actions, webhooks, Jest). |
| [`pr-conventions`](./pr-conventions/SKILL.md)                       | Branch names, commit messages, PR titles/bodies, and the pre-PR checklist. |

## Using them with a coding agent

Point your agent at the relevant `SKILL.md`. Packaging these for one-command install (a Claude Code plugin/marketplace, and/or an installer for other agents) is tracked as a follow-up.
