# Code Governance System

This directory contains the project's code governance rules and automated validation.

## Files

- **READ_Before_Starting_a_Session.md** - Entry point for AI coding assistants
- **PROJECT_RULES.md** - Core project rules and conventions
- **FORBIDDEN_CHANGES.md** - Files/systems that must never be modified
- **TEST_REQUIREMENTS.md** - Testing standards and pre-commit checks
- **COMMON_FIXES.md** - Pre-approved solutions for common issues
- **Pro_Tips.md** - Best practices for maintaining governance

## Automated Enforcement

### Pre-Commit Hooks
Automatically runs on every `git commit`:
- ✅ Checks for forbidden file modifications
- ✅ Validates brand colors unchanged
- ✅ Ensures TypeScript type check passes
- ✅ Runs ESLint
- ✅ Runs tests

### Manual Commands

```bash
# Run full governance check
npm run gov:check

# Run validation only (no build)
npm run gov:validate

# Run critical tests
npm run test:critical
```

## For AI Coding Assistants

Before making ANY changes to this codebase:

1. **Read governance files** in this order:
   - PROJECT_RULES.md
   - FORBIDDEN_CHANGES.md
   - TEST_REQUIREMENTS.md
   - COMMON_FIXES.md

2. **Confirm understanding** of:
   - The 5 immutable systems
   - Test requirements before commit
   - Git branch naming conventions

3. **Before modifying any file**, check:
   - Is it in the FORBIDDEN list?
   - Does COMMON_FIXES have a pre-approved solution?
   - Have I planned to write/update tests?

4. **After changes**, run:
   ```bash
   npm run gov:validate
   ```

## For Developers

### First Time Setup

The git hooks are automatically installed when you run `npm install`.

If hooks aren't working:
```bash
npx husky install
```

### Bypassing Hooks (NOT RECOMMENDED)

Only in emergencies:
```bash
git commit --no-verify -m "emergency fix"
```

**Warning:** This bypasses all safety checks. Use only when absolutely necessary.

### Updating Governance

When adding new rules:
1. Update relevant .md files in this directory
2. Update validation script if needed (.claude/validate-changes.sh)
3. Communicate changes to team
4. Version control all governance changes

## Governance Violations

If you accidentally modify a forbidden file:

```bash
# Before committing:
git checkout -- path/to/forbidden-file

# After committing:
git reset HEAD~1
git checkout -- path/to/forbidden-file
git add .
git commit -m "fix: correct changes without forbidden files"
```

## Questions?

See individual governance files for detailed rules and examples.

---

**Last Updated:** November 2024  
**Version:** 1.0  
**Status:** Active & Enforced
