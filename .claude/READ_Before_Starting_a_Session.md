You are about to work on the Leyla's Apothecary codebase. Before making ANY changes, you MUST read and follow the project's governance files.

CRITICAL INSTRUCTION: Your FIRST action must be:
1. Read: .claude/PROJECT_RULES.md
2. Read: .claude/FORBIDDEN_CHANGES.md
3. Read: .claude/COMMON_FIXES.md
4. Read: .claude/TEST_REQUIREMENTS.md

After reading, confirm you understand by listing:
1. The 5 immutable systems you must NEVER change
2. The test command you'll run before committing (npm run gov:validate)
3. The git branch naming convention to use (feature/*, fix/*, hotfix/*)

Only proceed with fixes after this confirmation.

---

## Automated Enforcement

Pre-commit hooks will automatically validate:
- No forbidden files modified
- Tests pass
- Build succeeds
- Type checking passes

Run manually: npm run gov:check