## Description

<!-- Provide a brief description of what this PR does -->

**Type of Change:**
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes, no api changes)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security fix

**Related Issue:** #<!-- issue number if applicable -->

---

## 🧪 Testing Checklist

> **⚠️ IMPORTANT:** Before submitting this PR, you MUST check [TESTING_REQUIREMENTS.md](../TESTING_REQUIREMENTS.md) to ensure you've written the required tests.

### Tests Written
- [ ] **Unit tests** for new/modified functions
- [ ] **Integration tests** for new API endpoints or service interactions
- [ ] **E2E tests** for new user-facing features (Playwright)
- [ ] **Component tests** for new React components

### Test Coverage
- [ ] Added tests maintain or improve code coverage (target: >85% for critical modules)
- [ ] No existing tests were broken by this change
- [ ] All tests pass locally (`npm run test`)

### Mobile/Responsive (if UI change)
- [ ] Tested on mobile viewport (390x844 - iPhone 13)
- [ ] Tested on tablet viewport (768x1024 - iPad)
- [ ] Tested on desktop viewport (1920x1080)
- [ ] Touch interactions work correctly
- [ ] Responsive layout works at all breakpoints

### Security (if handling user data or authentication)
- [ ] Input validation added (Zod schema or equivalent)
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] RLS policies tested (if database change)
- [ ] No secrets in code (checked .env usage)

---

## ✅ Quality Gates

> These will be checked automatically by CI/CD. Ensure they pass before requesting review.

- [ ] `npm run type-check` passes (0 TypeScript errors)
- [ ] `npm run lint` passes (0 ESLint errors)
- [ ] `npm run test` passes (all tests green)
- [ ] `npm run build` succeeds (production build works)
- [ ] `npm audit` shows 0 vulnerabilities

---

## 📝 Code Review Checklist

- [ ] Code follows existing patterns and conventions
- [ ] Functions and variables have clear, descriptive names
- [ ] Complex logic is commented/documented
- [ ] No unnecessary dependencies added
- [ ] Error handling is comprehensive
- [ ] Console logs removed (or using proper logger)

---

## 📸 Screenshots (if UI change)

<!-- Add screenshots for before/after if applicable -->

**Before:**


**After:**


---

## 🚀 Deployment Notes

<!-- Any special deployment steps or environment variable changes? -->

- [ ] No environment variable changes needed
- [ ] Database migration required (see: `supabase/migrations/...`)
- [ ] Third-party service configuration needed (Stripe, Cal.com, etc.)

---

## 📚 Documentation

- [ ] Updated README if needed
- [ ] Updated API documentation if new endpoints added
- [ ] Updated [TESTING_REQUIREMENTS.md](../TESTING_REQUIREMENTS.md) if new feature added
- [ ] Added JSDoc comments for new functions

---

## ⚠️ Breaking Changes

<!-- If this is a breaking change, describe what breaks and migration path -->

N/A or:
- Breaking change description
- Migration steps

---

## 🔗 Additional Context

<!-- Any additional information reviewers should know -->

---

## Pre-Submit Checklist

Before clicking "Create Pull Request", verify:

- [ ] I have read [TESTING_REQUIREMENTS.md](../TESTING_REQUIREMENTS.md)
- [ ] I have written tests for this change (see "Testing Checklist" above)
- [ ] All quality gates pass locally
- [ ] I have tested this change manually
- [ ] I have updated relevant documentation
- [ ] This PR has a clear, descriptive title
- [ ] This PR is small and focused (if not, consider splitting)

---

**Reviewer:** Please verify the "Testing Checklist" section is complete before approving.
