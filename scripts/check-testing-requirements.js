#!/usr/bin/env node

/**
 * Testing Requirements Checker
 *
 * This script checks TESTING_REQUIREMENTS.md and reminds you what tests
 * need to be written before proceeding with new features.
 *
 * Run: npm run check-testing-debt
 */

const fs = require('fs');
const path = require('path');

const TESTING_REQ_PATH = path.join(__dirname, '..', 'TESTING_REQUIREMENTS.md');

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}${BLUE}🧪 Testing Requirements Checker${RESET}\n`);

// Check if TESTING_REQUIREMENTS.md exists
if (!fs.existsSync(TESTING_REQ_PATH)) {
  console.log(`${RED}❌ TESTING_REQUIREMENTS.md not found!${RESET}`);
  console.log(`   Create it first by following the setup instructions.`);
  process.exit(1);
}

// Read the file
const content = fs.readFileSync(TESTING_REQ_PATH, 'utf-8');

// Count unchecked items
const uncheckedPriority1 = (content.match(/Priority 1:[\s\S]*?(?=Priority 2:|---)/)?.[0] || '').match(/- \[ \]/g) || [];
const uncheckedPriority2 = (content.match(/Priority 2:[\s\S]*?(?=Priority 3:|---)/)?.[0] || '').match(/- \[ \]/g) || [];
const uncheckedPriority3 = (content.match(/Priority 3:[\s\S]*?(?=##|---)/)?.[0] || '').match(/- \[ \]/g) || [];

const totalPriority1 = uncheckedPriority1.length;
const totalPriority2 = uncheckedPriority2.length;
const totalPriority3 = uncheckedPriority3.length;

const totalDebt = totalPriority1 + totalPriority2 + totalPriority3;

console.log(`${BOLD}Current Testing Debt:${RESET}`);
console.log(`  ${RED}Priority 1 (Critical):${RESET} ${totalPriority1} tests needed`);
console.log(`  ${YELLOW}Priority 2 (Security):${RESET} ${totalPriority2} tests needed`);
console.log(`  ${BLUE}Priority 3 (Mobile):${RESET}   ${totalPriority3} tests needed`);
console.log(`  ${BOLD}Total:${RESET}                 ${totalDebt} tests needed\n`);

if (totalPriority1 > 0) {
  console.log(`${RED}${BOLD}⚠️  BLOCKING: ${totalPriority1} Priority 1 tests must be written before Phase 4!${RESET}\n`);
  console.log(`${YELLOW}Priority 1 includes:${RESET}`);
  console.log(`  • API endpoint tests (/api/orders, /api/products)`);
  console.log(`  • Service layer tests (order creation, price validation)`);
  console.log(`  • Cart store tests (add, update, remove, persistence)\n`);
  console.log(`${BOLD}Next Steps:${RESET}`);
  console.log(`  1. Review ${BLUE}TESTING_REQUIREMENTS.md${RESET}`);
  console.log(`  2. Write the Priority 1 tests first`);
  console.log(`  3. Run ${GREEN}npm run check-testing-debt${RESET} again\n`);
  process.exit(1);
}

if (totalPriority2 > 0) {
  console.log(`${YELLOW}⚠️  WARNING: ${totalPriority2} Priority 2 (Security) tests pending${RESET}`);
  console.log(`   These should be completed before production launch.\n`);
}

if (totalPriority3 > 0) {
  console.log(`${BLUE}ℹ️  INFO: ${totalPriority3} Priority 3 (Mobile) tests pending${RESET}`);
  console.log(`   These should be completed before marketing launch.\n`);
}

if (totalDebt === 0) {
  console.log(`${GREEN}${BOLD}✅ No testing debt! You're ready to proceed.${RESET}\n`);
  process.exit(0);
}

console.log(`${BOLD}For details, see: ${BLUE}TESTING_REQUIREMENTS.md${RESET}\n`);
process.exit(totalPriority1 > 0 ? 1 : 0);
