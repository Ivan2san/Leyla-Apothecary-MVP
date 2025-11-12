You are a Senior QA Engineer and DevOps specialist reviewing a technical build plan for a new e-commerce and booking platform. I will provide the full Leylas\_Apothecary\_Technical\_Build\_Plan.md file.

Your primary goal is to analyze the existing 'Testing & Quality Assurance' strategy and identify gaps. You must then propose concrete, actionable additions to the plan to ensure a robust, high-quality, and reliable application is built.

**Your Task:**

1. **Analyze Gaps:** Review the *entire* plan, paying close attention to the "Testing & Quality Assurance" section, the npm install commands, the jest.config.js, the deploy.yml, and the "Implementation Phases". Identify what's missing based on a comprehensive testing strategy.  
2. **Generate Additions:** For each gap you identify, provide specific, new content that can be directly added to the Markdown build plan. This includes new text, new code blocks, and modifications to existing sections.

**Checklist of Gaps to Fill:**

* **Unit Test Examples:** The plan includes Jest setup but no examples. Add a new subsection under "Testing & Quality Assurance" titled \#\#\# Unit Test Example (Jest \+ RTL) and provide a complete test file (e.g., product-card.test.tsx) for the ProductCard component.  
* **Integration Test Examples:** The plan doesn't explicitly cover integration testing. Add a \#\#\# Integration Test Example (Mocking) subsection. Provide a test file (e.g., product-service.test.ts) that shows how to test the ProductService class by mocking the Supabase client.  
* **API Endpoint Testing:** The API routes (e.g., app/api/products/route.ts) need direct testing. Add a \#\#\# API Endpoint Testing subsection explaining how to test these endpoints (e.g., using Jest's fetch mocking or Playwright's request context) and provide an example.  
* **Compatibility & Responsive Testing:** This is a major gap. The app must be "adaptive for mobile."  
  * Add a new top-level section: \#\# COMPATIBILITY & RESPONSIVE TESTING.  
  * In this new section, define a Browser & Device Matrix (e.g., "Chrome on Desktop, Safari on iOS 17, Chrome on Android 13").  
  * Show an example of how to configure playwright.config.ts to run tests against these different mobile viewports and browsers.  
* **Non-Functional Testing (Security & Performance):**  
  * The plan mentions "Security audit" and "Performance testing" only in the final Phase 7\. This is too late.  
  * Modify Phase 2: Product Catalog to add a task: "Write tests for products table RLS policies to ensure users can only read active products."  
  * Modify the .github/workflows/deploy.yml file to add a Lighthouse CI job that runs on pull requests to enforce performance budgets.  
* **Testing KPIs:**  
  * Enhance the "Technical KPIs" section. Add a new KPI:  
  * Code Coverage: \>85% on critical modules (auth, cart, checkout)

**Final Task: Detailed Test Plan**

* After addressing the gaps, create a detailed testing checklist for **Phase 5: Compound Builder**. This checklist should be broken down by testing type (Unit, Integration, E2E, Usability) and cover the key functionalities described in the compound-builder.tsx component and compounds table schema (e.g., drag-drop, ratio calculations, max herb limits, price calculation, saving the formula).