---
name: goguma-deploy-setup
description: "고구마마켓 hosting/DB setup — shared Supabase project with 가계부, GitHub repo, Vercel prod URL, Node path quirk"
metadata:
  node_type: memory
  type: project
  originSessionId: a810e663-27c2-49ec-9c34-94f543e9a920
  modified: 2026-11-11T05:42:49.860Z
---

고구마마켓 (Next.js 16 + Supabase) learning project, built step by step (user wants 단계적 개발 for study).

- Supabase: shares project `wkdhpcyuuhnpoqdzhefp` with the 가계부 app (Desktop/가계부, table `ledger_entries`) — don't touch ledger tables. Email confirmation is OFF.
- GitHub: YUSUN68/goguma-market (public, matches the public household-ledger repo). Repo-local git identity set; no global git config on this PC.
- Vercel: team yusun1, project goguma-market, prod https://goguma-market-flame.vercel.app; pushes to main auto-deploy.
- Node was installed via winget; Bash tool needs PATH prefix `/c/Users/student/AppData/Local/Microsoft/WinGet/Packages/OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe/node-v24.20.0-win-x64`.

**Why:** the user deploys separately from the ledger but reuses its DB.
**How to apply:** new tables go in the same Supabase project with RLS; ship by pushing to main.
