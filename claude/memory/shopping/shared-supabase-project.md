---
name: shared-supabase-project
description: "Shopping mall uses Supabase project YUSUN1, which also hosts another app's tables — only touch shop_-prefixed objects"
metadata:
  node_type: memory
  type: project
  originSessionId: d1aa9087-cf73-404c-8e92-4c02b1bdb4b8
  modified: 2026-11-11T08:36:55.172Z
---

The interior-goods shop (Next.js, C:\Users\student\Desktop\shopping) lives in Supabase project YUSUN1 (ref wkdhpcyuuhnpoqdzhefp), which already hosts another app's tables (products, profiles, likes, chat_rooms, chat_messages, notifications, ledger_entries) and its own `on_auth_user_created` trigger. auth.users is shared.

**Why:** User chose to reuse the existing project rather than create a new one (2026-11-11); collisions would break the other app.

**How to apply:** Every shop table/function/policy/bucket uses the `shop_` prefix. Never alter or drop the non-shop objects; when checking advisors, ignore findings on the other app's objects (e.g. mark_room_read) unless the user asks.
