---
name: supabase-shared-project
description: The scheduler uses the shared Supabase project YUSUN1 alongside other apps; all scheduler objects use the sched_ prefix
metadata:
  node_type: memory
  type: project
  originSessionId: 67491744-4087-42d2-a3cd-689067532d61
  modified: 2026-11-13T01:23:33.009Z
---

The quest scheduler stores data in the Supabase project YUSUN1 (ref wkdhpcyuuhnpoqdzhefp), which also hosts the user's other apps (shop, chat, profiles, notifications tables, and auth triggers that insert into profiles/shop_profiles on signup). The user chose to share it rather than create a new project (2026-11-13).

**Why:** creating a new project could hit free-plan limits or costs; sharing means name collisions and shared auth users.

**How to apply:** prefix every new table, function, bucket, cron job and edge function with `sched_` / `sched-`; never alter the non-sched tables; remember that signups also create rows in profiles and shop_profiles. Secrets (VAPID keys, cron secret) live in `sched_private.config`, not in the repo.
