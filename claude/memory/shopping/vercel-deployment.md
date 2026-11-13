---
name: vercel-deployment
description: "Shop is deployed on Vercel as yusun1/ongi-shop at https://ongi-shop.vercel.app (CLI-linked, prod env vars set)"
metadata:
  node_type: memory
  type: reference
  originSessionId: d1aa9087-cf73-404c-8e92-4c02b1bdb4b8
  modified: 2026-11-12T01:02:34.199Z
---

The interior gift shop is deployed with the Vercel CLI (logged in as yusun68) to project `yusun1/ongi-shop`; production URL https://ongi-shop.vercel.app (first deployed 2026-11-12). Production env vars were added from `.env.local`; `NEXT_PUBLIC_TOSS_CLIENT_KEY` and `NEXT_PUBLIC_SITE_URL` are `--type config` (Vercel CLI refuses NEXT_PUBLIC_ credential-looking names without an explicit type). No git remote — deploys are `vercel deploy --prod` from the local folder.

Gotcha: `vercel link` appends `.vercel` and `.env*` to `.gitignore`, which re-ignores `.env.local.example`; revert that diff.

Related: [[shared-supabase-project]]
