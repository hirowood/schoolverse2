# Migration notes (current canonical order)

- Tables: User, UserProfile, CredoItem, CredoPracticeLog, ChatMessage, StudyTask
- Migration sequence:
  - 20251124202335_init_credo: User / CredoItem / CredoPracticeLog
  - 20251125125000_add_chat_messages: ChatMessage
  - 20251125130500_add_user_profile: UserProfile
  - 20251125132000_add_study_task: StudyTask + indexes
- To recreate locally:
  - `npx prisma migrate reset` (destructive; wipes data)
  - `npm run db:seed` (demo user + credo items)
- To deploy production:
  - Run `prisma migrate deploy` in this order; DB will match the current schema.
  - If an existing DB is out of sync, inspect with `prisma db pull` and align before deploy.
