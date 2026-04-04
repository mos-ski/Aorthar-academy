# QA Engineering Curriculum

**Status:** Complete
**Last Updated:** 2026-04-04

---

## YEAR 100 — QA FOUNDATIONS

**Goal:** Produce graduates who are the guardians of product quality. Masters of manual testing, test automation, performance engineering, and the art of breaking software.

### Semester 1

**QA101 — Introduction to Software Quality Assurance** *(3 Credits)*
*Description:* Fundamentals of software testing — QA vs QC, SDLC, and how to identify, document, and track bugs. This is the foundation of the QA engineering career.

*Classes:*
1. What is Quality Assurance? — https://www.youtube.com/watch?v=Eu35xM76kKY
2. SDLC & STLC — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s
3. Types of Testing — https://www.youtube.com/watch?v=Eu35xM76kKY&t=600s
4. The Bug Life Cycle — https://www.youtube.com/watch?v=Eu35xM76kKY&t=900s
5. Test Scenarios vs Test Cases — https://www.youtube.com/watch?v=7r4xVDI2vho
6. Writing Effective Test Cases — https://www.youtube.com/watch?v=7r4xVDI2vho&t=300s
7. Bug Reporting & Tools (Jira) — https://www.youtube.com/watch?v=Eu35xM76kKY&t=1200s
8. Severity vs Priority — https://www.youtube.com/watch?v=Eu35xM76kKY&t=1500s
9. Functional Testing Techniques — https://www.youtube.com/watch?v=7r4xVDI2vho&t=600s
10. User Acceptance Testing (UAT) — https://www.youtube.com/watch?v=Eu35xM76kKY&t=1800s
11. Introduction to API Testing — https://www.youtube.com/watch?v=lsMQRaeKNDk
12. QA in Agile Teams — https://www.youtube.com/watch?v=ojpTDcdm0vQ

*AI Summary:* QA is about preventing bugs, not just finding them. Students learn the testing lifecycle, how to write effective test cases, report bugs clearly, and understand the role of QA in Agile teams. Good QA engineers think like users and break things before users do.

*Related Articles:*
- ISTQB Foundation — https://www.istqb.org/
- Software Testing Principles — https://www.guru99.com/software-testing-introduction-importance.html
- Bug Reporting Best Practices — https://www.atlassian.com/continuous-delivery/software-testing/bug-reports

*Quiz (5 questions):*
1. What is the difference between QA and QC? — **Answer:** QA is process-focused (preventing defects); QC is product-focused (finding defects)
2. What is the difference between severity and priority? — **Answer:** Severity is the technical impact of a bug; priority is the business urgency to fix it
3. What are the seven testing principles? — **Answer:** Testing shows presence of defects, exhaustive testing is impossible, early testing saves time, defect clustering, pesticide paradox, testing is context dependent, absence-of-errors fallacy
4. What makes a good bug report? — **Answer:** Clear title, steps to reproduce, expected vs actual results, environment details, severity/priority, and screenshots/videos
5. What is boundary value analysis? — **Answer:** Testing at the edges of input ranges (e.g., if input accepts 1-100, test 0, 1, 100, 101) — most bugs occur at boundaries

---

**PM103 — Introduction to Agile & Scrum** *(3 Credits)*
*Description:* Core Agile and Scrum principles for working in product teams.
*See: [Product Management — PM103](./product-management.md)*

---

**CS101 — Computer Science Fundamentals** *(3 Credits)*
*Description:* Core CS concepts — how software works, basic algorithms, and system fundamentals.
*See: [Frontend Engineering — CS101](./frontend.md)*

---

**DEV101 — JavaScript Fundamentals** *(3 Credits)*
*Description:* JavaScript basics needed for understanding web applications and writing automated tests.
*See: [Frontend Engineering — DEV101](./frontend.md)*

---

**COM101 — Technical Communication & Bug Reporting** *(3 Credits)*
*Description:* Write clear, actionable bug reports and communicate effectively with developers. QA engineers are the bridge between users and engineers.

*Classes:*
1. Technical Writing for QA — https://www.youtube.com/watch?v=6q5-cVeNjCE
2. Writing Clear Bug Reports — https://www.youtube.com/watch?v=Eu35xM76kKY
3. Communicating with Developers — https://www.youtube.com/watch?v=f4AGAeVe2Jw
4. Stakeholder Communication — https://www.youtube.com/watch?v=4Xy1v0k2FhY
5. Test Report Writing — https://www.youtube.com/watch?v=6q5-cVeNjCE&t=300s

*AI Summary:* Communication is the QA engineer's most important skill. Students learn to write clear bug reports, communicate findings to developers, create test summary reports, and advocate for quality without being adversarial.

*Related Articles:*
- Bug Report Template — https://www.atlassian.com/continuous-delivery/software-testing/bug-reports
- Technical Writing — https://www.writethedocs.org/
- QA Communication — https://www.ministryoftesting.com/dojo/lessons/effective-communication-for-testers

*Quiz (5 questions):*
1. What are the essential elements of a bug report? — **Answer:** Title, description, steps to reproduce, expected result, actual result, environment, severity, priority, and attachments
2. How should a QA engineer handle a developer who rejects a bug? — **Answer:** Provide clear reproduction steps, discuss calmly, involve the product manager if needed, and focus on the user impact
3. What is a test summary report? — **Answer:** A document summarizing testing activities, results, defects found, coverage, and recommendations for release
4. Why should bug reports be written objectively? — **Answer:** To avoid blame, maintain professional relationships, and focus on solving the problem rather than assigning fault
5. What is the difference between a bug and a feature request? — **Answer:** A bug is something that doesn't work as intended; a feature request is new functionality that was never designed

---

### Semester 2

**QA102 — Test Planning & Documentation** *(3 Credits)*
*Description:* Create comprehensive test plans, test strategies, and test documentation for software projects. Planning is what separates professional QA from random clicking.

*Classes:*
1. Test Plan Fundamentals — https://www.youtube.com/watch?v=7r4xVDI2vho
2. Test Strategy vs Test Plan — https://www.youtube.com/watch?v=7r4xVDI2vho&t=300s
3. Risk-Based Testing — https://www.youtube.com/watch?v=Eu35xM76kKY
4. Traceability Matrix — https://www.youtube.com/watch?v=7r4xVDI2vho&t=600s
5. Test Estimation Techniques — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s

*AI Summary:* Test planning ensures comprehensive, efficient testing. Students learn to create test plans, strategies, risk-based testing approaches, traceability matrices, and estimation techniques. A good test plan covers everything important without wasting time.

*Related Articles:*
- Test Plan Template — https://www.guru99.com/test-plan.html
- Risk-Based Testing — https://www.istqb.org/downloads/send/44-istqb-ctfl-syllabus/214-istqb-ctfl-syllabus-v3-1.html
- Test Estimation — https://www.softwaretestinghelp.com/software-test-estimation-techniques/

*Quiz (5 questions):*
1. What is the difference between a test plan and a test strategy? — **Answer:** Test strategy is a high-level document defining the approach; test plan is a detailed document defining scope, schedule, resources, and deliverables
2. What is risk-based testing? — **Answer:** Prioritizing testing based on the risk of failure — testing high-risk areas first to maximize value with limited time
3. What is a traceability matrix? — **Answer:** A document mapping requirements to test cases — ensuring every requirement has corresponding tests
4. What are common test estimation techniques? — **Answer:** Planning poker, three-point estimation, work breakdown structure, and analogy-based estimation
5. When should you start test planning? — **Answer:** As early as possible — ideally during requirements gathering, not after development is complete

---

**QA104 — Introduction to Test Automation (Selenium/Cypress)** *(3 Credits)*
*Description:* Automate browser tests with Selenium and Cypress — writing, running, and maintaining automated tests. Automation is how QA scales.

*Classes:*
1. Why Test Automation? — https://www.youtube.com/watch?v=Eu35xM76kKY
2. Selenium WebDriver Basics — https://www.youtube.com/watch?v=HDEW1P4qRPE
3. Cypress Introduction — https://www.youtube.com/watch?v=7N63cMKosIE
4. Locators & Selectors — https://www.youtube.com/watch?v=HDEW1P4qRPE&t=300s
5. Writing Your First Automated Test — https://www.youtube.com/watch?v=7N63cMKosIE&t=300s

*AI Summary:* Test automation multiplies QA impact. Students learn Selenium WebDriver, Cypress, element locators, writing automated tests, and understanding when to automate vs test manually. Automation is an investment that pays off over time.

*Related Articles:*
- Selenium — https://www.selenium.dev/documentation/
- Cypress — https://docs.cypress.io/guides/overview/why-cypress
- Test Automation Guide — https://www.browserstack.com/guide/test-automation

*Quiz (5 questions):*
1. When should you automate a test? — **Answer:** When it's repetitive, stable (UI doesn't change often), critical for regression, and has a clear pass/fail criterion
2. What is the difference between Selenium and Cypress? — **Answer:** Selenium controls browsers via WebDriver protocol (supports many languages/browsers); Cypress runs in the browser (faster, easier debugging, JS-only)
3. What is a locator in test automation? — **Answer:** A way to find elements on a page — by ID, class, CSS selector, XPath, or text content
4. What is the Page Object Model? — **Answer:** A design pattern where each page is represented as a class, separating page structure from test logic for maintainability
5. Why shouldn't you automate everything? — **Answer:** Some tests are better done manually (exploratory, usability, one-time tests); automation has maintenance costs and isn't worth it for unstable features

---

**DB101 — Database Fundamentals for Testers (SQL)** *(3 Credits)*
*Description:* SQL basics for testers — querying data, validating test results, and database testing. Testers who can query databases are infinitely more effective.

*Classes:*
1. SQL for Testers — https://www.youtube.com/watch?v=HXV3zeQKqGY
2. SELECT, WHERE, ORDER BY — https://www.youtube.com/watch?v=HXV3zeQKqGY&t=300s
3. JOINs for Testers — https://www.youtube.com/watch?v=9yeOJ0ZMUYw
4. Data Validation Queries — https://www.youtube.com/watch?v=HXV3zeQKqGY&t=600s
5. Database Testing Techniques — https://www.youtube.com/watch?v=HXV3zeQKqGY&t=900s

*AI Summary:* SQL skills make testers self-sufficient. Students learn SELECT queries, JOINs, data validation, and database testing techniques. Testers who can verify data directly in the database catch bugs that UI testing misses.

*Related Articles:*
- SQL for Testers — https://www.guru99.com/database-testing.html
- SQL Tutorial — https://www.w3schools.com/sql/
- Database Testing — https://www.softwaretestinghelp.com/database-testing/

*Quiz (5 questions):*
1. Why should QA engineers know SQL? — **Answer:** To verify data directly in the database, validate test results, create test data, and investigate bugs beyond the UI
2. What is the difference between WHERE and HAVING? — **Answer:** WHERE filters rows before grouping; HAVING filters groups after GROUP BY
3. How do you verify data was inserted correctly after a form submission? — **Answer:** Query the database with a SELECT statement matching the submitted data and verify the record exists with correct values
4. What is a JOIN and why is it useful for testers? — **Answer:** Combines rows from two or more tables based on a related column — useful for verifying data relationships across tables
5. What is database testing? — **Answer:** Verifying data integrity, schema, stored procedures, triggers, and ensuring the database correctly stores, retrieves, and updates data

---

**DEV102 — HTML & CSS Structure** *(3 Credits)*
*Description:* Understand web page structure for effective UI testing and element identification.
*See: [Frontend Engineering — DEV102](./frontend.md)*

---

**QA106 — Mobile Application Testing** *(3 Credits)*
*Description:* Test mobile applications — iOS vs Android, emulators, real devices, and mobile-specific test cases. Mobile is the primary way Nigerians access digital products.

*Classes:*
1. Mobile Testing Fundamentals — https://www.youtube.com/watch?v=k-s2nCo9fc8
2. iOS vs Android Testing — https://www.youtube.com/watch?v=k-s2nCo9fc8&t=300s
3. Emulators vs Real Devices — https://www.youtube.com/watch?v=k-s2nCo9fc8&t=600s
4. Appium for Mobile Testing — https://www.youtube.com/watch?v=k-s2nCo9fc8&t=900s
5. Mobile-Specific Test Cases — https://www.youtube.com/watch?v=k-s2nCo9fc8&t=1200s

*AI Summary:* Mobile testing has unique challenges — different OS versions, screen sizes, network conditions, and device capabilities. Students learn mobile testing fundamentals, Appium, emulator vs real device testing, and Nigeria-specific considerations (low-end devices, poor networks).

*Related Articles:*
- Mobile Testing Guide — https://www.browserstack.com/guide/mobile-app-testing
- Appium — https://appium.io/
- Mobile Testing Best Practices — https://www.perfecto.io/blog/mobile-testing-best-practices

*Quiz (5 questions):*
1. What is the difference between native, web, and hybrid mobile apps? — **Answer:** Native: built for one platform (Swift/Kotlin); Web: accessed via browser; Hybrid: web technologies wrapped in a native container
2. Why test on real devices, not just emulators? — **Answer:** Emulators can't replicate real-world conditions — battery drain, network fluctuations, hardware limitations, and OS-specific behaviors
3. What are key mobile-specific test cases? — **Answer:** Interrupt testing (calls, notifications), orientation changes, low battery, poor network, app backgrounding/foregrounding, and installation/updates
4. What is Appium? — **Answer:** An open-source mobile automation framework that supports both iOS and Android using the WebDriver protocol
5. What network conditions should you test for in Nigeria? — **Answer:** 2G/3G networks, intermittent connectivity, high latency, and data-saving modes

---

## YEAR 200 — INTERMEDIATE QA

**Goal:** Master API testing, performance testing, security testing, and test framework design.

### Semester 1

**QA201 — API Testing & Automation** *(3 Credits)*
*Description:* Advanced API testing — REST, GraphQL, contract testing, and automation with Postman/Newman. APIs are the backbone of modern applications.

*Classes:*
1. API Testing Fundamentals — https://www.youtube.com/watch?v=lsMQRaeKNDk
2. Postman for API Testing — https://www.youtube.com/watch?v=VywxIQ2ZXw4
3. API Test Automation with Newman — https://www.youtube.com/watch?v=VywxIQ2ZXw4&t=300s
4. GraphQL Testing — https://www.youtube.com/watch?v=ed8SzALpx1Q
5. Contract Testing Basics — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=300s

*AI Summary:* API testing is faster and more reliable than UI testing. Students learn REST and GraphQL testing, Postman collections, Newman automation, and contract testing. API tests catch integration bugs before they reach the UI.

*Related Articles:*
- API Testing Guide — https://www.postman.com/api-platform/api-testing/
- Postman — https://www.postman.com/
- API Testing Best Practices — https://www.softwaretestinghelp.com/api-testing/

*Quiz (5 questions):*
1. What should you validate in an API response? — **Answer:** Status code, response body structure, data accuracy, response time, headers, and error handling
2. What is Newman? — **Answer:** A CLI tool that runs Postman collections — used for automated API testing in CI/CD pipelines
3. What is the difference between API testing and UI testing? — **Answer:** API testing validates the business logic and data layer directly; UI testing validates the user interface and user experience
4. What is contract testing? — **Answer:** Verifying that an API provider and consumer agree on the request/response format — preventing breaking changes
5. What HTTP methods should you test? — **Answer:** GET, POST, PUT, PATCH, DELETE — and verify correct behavior, status codes, and error handling for each

---

**QA202 — Performance Testing** *(3 Credits)*
*Description:* Load testing, stress testing, and performance analysis with tools like k6, JMeter, and Lighthouse. Performance is a quality attribute that directly impacts user experience.

*Classes:*
1. Performance Testing Types — https://www.youtube.com/watch?v=23pGK3s_Qjk
2. k6 Load Testing — https://www.youtube.com/watch?v=23pGK3s_Qjk&t=300s
3. JMeter Fundamentals — https://www.youtube.com/watch?v=23pGK3s_Qjk&t=600s
4. Lighthouse for Web Performance — https://www.youtube.com/watch?v=wB9HqOSJXiI
5. Analyzing Performance Results — https://www.youtube.com/watch?v=23pGK3s_Qjk&t=900s

*AI Summary:* Performance testing ensures applications work under real-world conditions. Students learn load testing, stress testing, k6, JMeter, and Lighthouse. In Nigeria, where networks are unreliable, performance testing is especially critical.

*Related Articles:*
- k6 — https://k6.io/docs/
- JMeter — https://jmeter.apache.org/
- Performance Testing — https://www.browserstack.com/guide/performance-testing

*Quiz (5 questions):*
1. What is the difference between load testing and stress testing? — **Answer:** Load testing measures performance under expected traffic; stress testing finds the breaking point by exceeding expected traffic
2. What metrics matter in performance testing? — **Answer:** Response time, throughput (requests/second), error rate, and resource utilization (CPU, memory)
3. What is k6? — **Answer:** A developer-friendly, open-source load testing tool that uses JavaScript for test scripts
4. What is the 95th percentile response time? — **Answer:** The response time below which 95% of requests fall — it shows the experience of most users, not just the average
5. Why test performance on slow networks? — **Answer:** Many Nigerian users experience 2G/3G networks; testing on slow networks ensures the product works for everyone

---

**QA203 — Security Testing Fundamentals** *(3 Credits)*
*Description:* Identify security vulnerabilities — OWASP Top 10, penetration testing basics, and security scanning. Every QA engineer should know how to find security holes.

*Classes:*
1. OWASP Top 10 for Testers — https://www.youtube.com/watch?v=G6XOKeWGSgY
2. SQL Injection Testing — https://www.youtube.com/watch?v=ciNHn38YRcM
3. XSS Testing — https://www.youtube.com/watch?v=G6XOKeWGSgY&t=300s
4. Authentication Testing — https://www.youtube.com/watch?v=mbsmsi7h3r4
5. Security Scanning Tools — https://www.youtube.com/watch?v=G6XOKeWGSgY&t=600s

*AI Summary:* Security testing is everyone's responsibility. Students learn OWASP Top 10 vulnerabilities, SQL injection and XSS testing, authentication testing, and security scanning tools. QA engineers who understand security catch critical bugs before attackers do.

*Related Articles:*
- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- Security Testing Guide — https://owasp.org/www-project-web-security-testing-guide/
- ZAP — https://www.zaproxy.org/

*Quiz (5 questions):*
1. What is the OWASP Top 10? — **Answer:** The ten most critical web application security risks, updated regularly by the Open Web Application Security Project
2. How do you test for SQL injection? — **Answer:** Input SQL syntax characters (', --, OR 1=1) into form fields and URL parameters to see if the application executes unintended queries
3. What is XSS and how do you test for it? — **Answer:** Cross-Site Scripting — injecting scripts into input fields to see if they execute in other users' browsers
4. What is ZAP? — **Answer:** OWASP Zed Attack Proxy — a free security scanner that finds vulnerabilities in web applications
5. What should a QA engineer do if they find a security vulnerability? — **Answer:** Document it clearly, report it through the proper channel (not public), and verify the fix without exposing the vulnerability

---

**QA204 — Test Framework Design** *(3 Credits)*
*Description:* Design scalable test automation frameworks — page object model, data-driven testing, and BDD. Frameworks are how you scale from 10 tests to 10,000.

*Classes:*
1. Test Framework Architecture — https://www.youtube.com/watch?v=FnjRjc-xqp0
2. Page Object Model — https://www.youtube.com/watch?v=HDEW1P4qRPE
3. Data-Driven Testing — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=300s
4. BDD with Cucumber — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=600s
5. Framework Maintenance — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=900s

*AI Summary:* Test frameworks organize and scale automation. Students learn the Page Object Model, data-driven testing, BDD with Cucumber, and framework maintenance. A well-designed framework makes tests readable, maintainable, and fast.

*Related Articles:*
- Page Object Model — https://www.selenium.dev/documentation/test_practices/encouraged/page_object_model/
- BDD — https://cucumber.io/docs/bdd/
- Test Framework Design — https://www.browserstack.com/guide/test-automation-framework

*Quiz (5 questions):*
1. What is the Page Object Model? — **Answer:** A design pattern where each page/screen is a class with methods for interactions — separating test logic from page structure
2. What is data-driven testing? — **Answer:** Running the same test with multiple data sets from external sources (CSV, Excel, database) — maximizing coverage with minimal code
3. What is BDD (Behavior-Driven Development)? — **Answer:** Writing tests in plain language (Given/When/Then) that both technical and non-technical stakeholders can understand
4. What makes a test framework maintainable? — **Answer:** Clear structure, reusable components, good naming conventions, separation of concerns, and documentation
5. What is the difference between a test library and a test framework? — **Answer:** A library provides functions you call; a framework provides a structure you fill in — the framework controls the flow

---

**DEV202 — TypeScript Fundamentals** *(3 Credits)*
*Description:* TypeScript for test automation — types, interfaces, and TypeScript with testing frameworks.
*See: [Frontend Engineering — DEV202](./frontend.md)*

---

### Semester 2

**QA205 — CI/CD Testing Integration** *(3 Credits)*
*Description:* Integrate automated tests into CI/CD pipelines — GitHub Actions, Jenkins, and test reporting. Tests that don't run automatically are tests that don't run.

*Classes:*
1. CI/CD for QA — https://www.youtube.com/watch?v=scEDHsr3APg
2. GitHub Actions for Testing — https://www.youtube.com/watch?v=R8_veQiYBjI
3. Jenkins Pipeline for Tests — https://www.youtube.com/watch?v=scEDHsr3APg&t=300s
4. Test Reporting — https://www.youtube.com/watch?v=R8_veQiYBjI&t=300s
5. Quality Gates — https://www.youtube.com/watch?v=scEDHsr3APg&t=600s

*AI Summary:* CI/CD integration makes testing automatic and continuous. Students learn GitHub Actions, Jenkins pipelines, test reporting, and quality gates. Automated testing in CI/CD catches regressions before they reach production.

*Related Articles:*
- CI/CD Testing — https://www.atlassian.com/continuous-delivery/continuous-integration
- GitHub Actions — https://docs.github.com/en/actions
- Quality Gates — https://www.sonarsource.com/solutions/continuous-inspection/quality-gates/

*Quiz (5 questions):*
1. What is a quality gate? — **Answer:** A checkpoint in the CI/CD pipeline that blocks deployment if quality criteria aren't met (test failures, coverage below threshold, security issues)
2. What should run in a CI pipeline for QA? — **Answer:** Unit tests, integration tests, linting, static analysis, and optionally E2E tests on every commit
3. What is the difference between CI and CD? — **Answer:** CI (Continuous Integration): automated building and testing on every commit; CD (Continuous Deployment): automated release to production
4. What is a flaky test? — **Answer:** A test that sometimes passes and sometimes fails without code changes — caused by timing issues, external dependencies, or shared state
5. How do you handle flaky tests in CI? — **Answer:** Identify the root cause, fix it, quarantine if necessary, and never ignore flaky tests — they erode trust in the test suite

---

**QA206 — Accessibility Testing** *(3 Credits)*
*Description:* Test for accessibility compliance — WCAG standards, screen reader testing, and automated a11y tools. Accessibility is a quality requirement, not a nice-to-have.

*Classes:*
1. Accessibility Testing Fundamentals — https://www.youtube.com/watch?v=8ZtInClXe1Q
2. WCAG Guidelines — https://www.youtube.com/watch?v=8ZtInClXe1Q&t=300s
3. Screen Reader Testing — https://www.youtube.com/watch?v=o_982bu32yM
4. Automated A11y Tools — https://www.youtube.com/watch?v=8ZtInClXe1Q&t=600s
5. Accessibility Audit Process — https://www.youtube.com/watch?v=8ZtInClXe1Q&t=900s

*AI Summary:* Accessibility testing ensures products work for everyone. Students learn WCAG guidelines, screen reader testing, automated tools (axe, Lighthouse), and audit processes. 15%+ of the global population has some form of disability.

*Related Articles:*
- WCAG — https://www.w3.org/WAI/standards-guidelines/wcag/
- axe-core — https://www.deque.com/axe/
- Accessibility Testing — https://www.w3.org/WAI/test-evaluate/

*Quiz (5 questions):*
1. What are the four WCAG principles? — **Answer:** Perceivable, Operable, Understandable, Robust (POUR)
2. What is the minimum color contrast ratio for normal text (WCAG AA)? — **Answer:** 4.5:1
3. What is axe-core? — **Answer:** An open-source accessibility testing engine used by Lighthouse, browser extensions, and CI/CD pipelines
4. How do you test with a screen reader? — **Answer:** Navigate the application using only keyboard and screen reader (NVDA, VoiceOver, JAWS), verifying all content is announced and interactive
5. Why is accessibility testing important in Nigeria? — **Answer:** Millions of Nigerians have disabilities; accessible products reach more users and comply with the Discrimination Against Persons with Disabilities Act

---

**QA207 — Test Data Management** *(3 Credits)*
*Description:* Create, manage, and maintain test data — data generation, anonymization, and database seeding. Good test data is the foundation of reliable tests.

*Classes:*
1. Test Data Fundamentals — https://www.youtube.com/watch?v=FnjRjc-xqp0
2. Data Generation — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=300s
3. Data Anonymization — https://www.youtube.com/watch?v=8ZtInClXe1Q
4. Database Seeding — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=600s
5. Test Data Strategy — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=900s

*AI Summary:* Test data management ensures tests are reliable and repeatable. Students learn data generation, anonymization, database seeding, and test data strategy. Bad test data causes flaky tests and false results.

*Related Articles:*
- Test Data Management — https://www.browserstack.com/guide/test-data-management
- Faker.js — https://fakerjs.dev/
- Data Anonymization — https://www.ibm.com/topics/data-anonymization

*Quiz (5 questions):*
1. Why is test data management important? — **Answer:** Tests need consistent, realistic data to produce reliable results — bad data causes false positives and negatives
2. What is data anonymization? — **Answer:** Removing or masking personally identifiable information from production data before using it in testing
3. What is database seeding? — **Answer:** Populating a database with predefined test data before running tests — ensuring a known starting state
4. What are the characteristics of good test data? — **Answer:** Realistic, comprehensive, isolated (doesn't affect other tests), reproducible, and covers edge cases
5. Should you use production data for testing? — **Answer:** Only if anonymized — using raw production data violates privacy laws and exposes sensitive information

---

**QA208 — Cross-Browser & Cross-Platform Testing** *(3 Credits)*
*Description:* Test across browsers and platforms — BrowserStack, Sauce Labs, and compatibility matrices. Your product must work everywhere your users access it.

*Classes:*
1. Cross-Browser Testing — https://www.youtube.com/watch?v=v1e1-N0_wlg
2. BrowserStack — https://www.youtube.com/watch?v=v1e1-N0_wlg&t=300s
3. Compatibility Matrices — https://www.youtube.com/watch?v=v1e1-N0_wlg&t=600s
4. Responsive Testing — https://www.youtube.com/watch?v=srvUrAjQ0bE
5. Automated Cross-Browser Testing — https://www.youtube.com/watch?v=v1e1-N0_wlg&t=900s

*AI Summary:* Cross-browser testing ensures consistent experiences across Chrome, Firefox, Safari, Edge, and mobile browsers. Students learn BrowserStack, compatibility matrices, and automated cross-browser testing. In Nigeria, users access products on diverse devices and browsers.

*Related Articles:*
- BrowserStack — https://www.browserstack.com/
- Can I Use — https://caniuse.com/
- Cross-Browser Testing — https://www.browserstack.com/guide/cross-browser-testing

*Quiz (5 questions):*
1. Why is cross-browser testing important? — **Answer:** Different browsers render HTML/CSS differently and support different features — your product must work across all browsers your users use
2. What is BrowserStack? — **Answer:** A cloud-based testing platform that provides access to real browsers and devices — no need to maintain physical devices
3. What is a compatibility matrix? — **Answer:** A document defining which browser/OS/device combinations your product must support and be tested on
4. What are the most important browsers to test in Nigeria? — **Answer:** Chrome (dominant), Safari (iOS users), Firefox, and Opera Mini (popular on low-end devices with data-saving mode)
5. What is responsive testing? — **Answer:** Testing how a product looks and functions across different screen sizes and orientations

---

**QA209 — Exploratory Testing** *(3 Credits)*
*Description:* Master exploratory testing techniques — session-based testing, bug tours, and heuristic testing. Not all testing can be automated — exploratory testing finds the bugs scripts miss.

*Classes:*
1. Exploratory Testing Fundamentals — https://www.youtube.com/watch?v=Eu35xM76kKY
2. Session-Based Testing — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s
3. Bug Tours — https://www.youtube.com/watch?v=Eu35xM76kKY&t=600s
4. Heuristic Testing — https://www.youtube.com/watch?v=Eu35xM76kKY&t=900s
5. Exploratory Testing Charters — https://www.youtube.com/watch?v=Eu35xM76kKY&t=1200s

*AI Summary:* Exploratory testing is simultaneous learning, test design, and execution. Students learn session-based testing, bug tours, heuristics, and charters. Exploratory testing finds the creative, unexpected bugs that automated tests never catch.

*Related Articles:*
- Exploratory Testing — https://www.ministryoftesting.com/dojo/lessons/exploratory-testing
- Session-Based Testing — https://www.satisfice.com/sbtm
- Heuristics — https://www.developsense.com/blog/2009/08/what-is-a-heuristic/

*Quiz (5 questions):*
1. What is exploratory testing? — **Answer:** Simultaneous learning, test design, and test execution — the tester explores the application without predefined test cases
2. What is a test charter? — **Answer:** A mission statement that guides an exploratory testing session — defining what to explore, not how to test
3. What is session-based testing? — **Answer:** Structured exploratory testing in time-boxed sessions with a charter, notes, and debrief — combining freedom with accountability
4. What is a bug tour? — **Answer:** A focused exploration of a specific area or aspect of the application (e.g., "error message tour", "data entry tour")
5. What is the difference between scripted and exploratory testing? — **Answer:** Scripted: predefined steps with expected results; exploratory: tester uses creativity and knowledge to discover unexpected issues

---

## YEAR 300 — ADVANCED QA

**Goal:** Master test automation architecture, AI-powered testing, chaos engineering, and quality engineering at scale.

### Semester 1

**QA301 — Test Automation Architecture** *(3 Credits)*
*Description:* Design enterprise-level test automation architectures — parallel execution, test orchestration, and reporting. Scale your testing from hundreds to thousands of tests.

*Classes:*
1. Automation Architecture Patterns — https://www.youtube.com/watch?v=FnjRjc-xqp0
2. Parallel Test Execution — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=300s
3. Test Orchestration — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=600s
4. Reporting & Dashboards — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=900s
5. Scaling Test Automation — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=1200s

*AI Summary:* Test automation architecture determines whether your tests scale or collapse. Students learn parallel execution, test orchestration, reporting, and scaling strategies. Enterprise test automation requires careful architecture decisions.

*Related Articles:*
- Test Automation Architecture — https://www.browserstack.com/guide/test-automation-framework
- Playwright — https://playwright.dev/
- Test Reporting — https://www.npmjs.com/package/mochawesome

*Quiz (5 questions):*
1. What is parallel test execution? — **Answer:** Running multiple tests simultaneously across different processes or machines — reducing total test time
2. What is test orchestration? — **Answer:** Coordinating test execution across environments, managing dependencies, and handling test sequencing
3. What makes a good test report? — **Answer:** Clear pass/fail status, execution time, failure details with screenshots/logs, trends over time, and actionable insights
4. How do you scale test automation from 100 to 10,000 tests? — **Answer:** Modular architecture, parallel execution, cloud-based test infrastructure, test data management, and regular maintenance
5. What is the test automation pyramid? — **Answer:** Many unit tests (base), fewer integration tests (middle), fewest E2E tests (top) — optimizing for speed and reliability

---

**QA302 — AI-Powered Testing** *(3 Credits)*
*Description:* Use AI in testing — visual testing, self-healing tests, test generation, and predictive analytics. AI is transforming how we test.

*Classes:*
1. AI in Testing — https://www.youtube.com/watch?v=wDBraae1Bjw
2. Visual Testing with AI — https://www.youtube.com/watch?v=wDBraae1Bjw&t=300s
3. Self-Healing Tests — https://www.youtube.com/watch?v=wDBraae1Bjw&t=600s
4. AI Test Generation — https://www.youtube.com/watch?v=wDBraae1Bjw&t=900s
5. Predictive Analytics for QA — https://www.youtube.com/watch?v=wDBraae1Bjw&t=1200s

*AI Summary:* AI is transforming testing. Students learn visual testing, self-healing tests, AI-generated test cases, and predictive analytics. AI-powered testing reduces maintenance, increases coverage, and finds bugs humans miss.

*Related Articles:*
- AI in Testing — https://www.ministryoftesting.com/articles/ai-in-testing
- Visual Testing — https://applitools.com/
- Self-Healing Tests — https://www.testim.io/blog/self-healing-tests/

*Quiz (5 questions):*
1. What is visual testing? — **Answer:** Automatically comparing screenshots of UI against baselines to detect visual regressions — catching CSS and layout bugs
2. What are self-healing tests? — **Answer:** Tests that automatically adapt to UI changes (e.g., updated selectors) using AI — reducing maintenance overhead
3. How can AI generate test cases? — **Answer:** By analyzing application behavior, user flows, and code changes to automatically create relevant test scenarios
4. What is predictive analytics in QA? — **Answer:** Using historical test data to predict which areas are most likely to have bugs — optimizing test effort
5. What are the limitations of AI in testing? — **Answer:** AI can't replace human judgment, requires quality training data, may generate irrelevant tests, and needs human validation

---

**QA303 — Contract Testing & Consumer-Driven Contracts** *(3 Credits)*
*Description:* Contract testing with Pact — consumer-driven contracts, pact broker, and microservice testing. Contract testing prevents integration bugs in microservice architectures.

*Classes:*
1. Contract Testing Fundamentals — https://www.youtube.com/watch?v=lsMQRaeKNDk
2. Pact — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=300s
3. Consumer-Driven Contracts — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=600s
4. Pact Broker — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=900s
5. Contract Testing in CI/CD — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=1200s

*AI Summary:* Contract testing ensures services communicate correctly. Students learn Pact, consumer-driven contracts, pact broker, and CI/CD integration. Contract testing catches integration bugs before they reach production in microservice architectures.

*Related Articles:*
- Pact — https://docs.pact.io/
- Contract Testing — https://martinfowler.com/articles/consumer-driven-contracts.html
- Pact Broker — https://docs.pact.io/pact_broker/

*Quiz (5 questions):*
1. What is contract testing? — **Answer:** Verifying that a service provider and consumer agree on the request/response format — preventing breaking changes
2. What is a consumer-driven contract? — **Answer:** The consumer defines the expected API contract, and the provider verifies it meets those expectations
3. What is Pact? — **Answer:** A code-first contract testing tool that creates pact files (JSON contracts) from consumer tests and verifies them against providers
4. What is a pact broker? — **Answer:** A shared service that stores and manages pact files, enabling versioning, tagging, and verification status tracking
5. When should you use contract testing vs E2E testing? — **Answer:** Contract testing for service-to-service integration (fast, reliable); E2E testing for critical user journeys (slow, comprehensive)

---

**QA304 — Chaos Engineering** *(3 Credits)*
*Description:* Test system resilience — chaos engineering principles, fault injection, and resilience testing. Break things on purpose to find weaknesses before they break on their own.

*Classes:*
1. Chaos Engineering Fundamentals — https://www.youtube.com/watch?v=47_NRSauV-s
2. Fault Injection — https://www.youtube.com/watch?v=47_NRSauV-s&t=300s
3. Chaos Monkey — https://www.youtube.com/watch?v=47_NRSauV-s&t=600s
4. Resilience Testing — https://www.youtube.com/watch?v=47_NRSauV-s&t=900s
5. Chaos Engineering in Production — https://www.youtube.com/watch?v=47_NRSauV-s&t=1200s

*AI Summary:* Chaos engineering finds weaknesses by breaking things on purpose. Students learn fault injection, Chaos Monkey, resilience testing, and production chaos experiments. If you don't break things yourself, production will do it for you.

*Related Articles:*
- Principles of Chaos Engineering — https://principlesofchaos.org/
- Chaos Monkey — https://github.com/Netflix/chaosmonkey
- Gremlin — https://www.gremlin.com/

*Quiz (5 questions):*
1. What is chaos engineering? — **Answer:** The practice of intentionally injecting failures into systems to test their resilience and find weaknesses before they cause outages
2. What is Chaos Monkey? — **Answer:** A Netflix tool that randomly terminates instances in production to ensure the system can handle failures
3. What is the blast radius? — **Answer:** The scope of impact of a chaos experiment — start small and gradually increase to minimize risk
4. What should you do before running chaos experiments? — **Answer:** Establish a steady state (normal metrics), define success criteria, have monitoring in place, and ensure you can quickly stop the experiment
5. Why test resilience in production? — **Answer:** Staging environments can't replicate production complexity — real resilience testing requires real traffic and real infrastructure

---

**QA305 — Test Metrics & Quality Analytics** *(3 Credits)*
*Description:* Define and track quality metrics — defect density, test coverage, escape rate, and quality dashboards. You can't improve what you can't measure.

*Classes:*
1. Quality Metrics — https://www.youtube.com/watch?v=Eu35xM76kKY
2. Defect Density & Escape Rate — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s
3. Test Coverage Metrics — https://www.youtube.com/watch?v=FnjRjc-xqp0
4. Quality Dashboards — https://www.youtube.com/watch?v=Eu35xM76kKY&t=600s
5. Using Metrics to Improve — https://www.youtube.com/watch?v=Eu35xM76kKY&t=900s

*AI Summary:* Quality metrics drive continuous improvement. Students learn defect density, escape rate, test coverage, DORA metrics, and quality dashboards. Metrics should inform decisions, not become targets to game.

*Related Articles:*
- Quality Metrics — https://www.qsm.com/resources/software-quality-metrics/
- DORA Metrics — https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance
- Test Coverage — https://www.sonarsource.com/learn/code-coverage/

*Quiz (5 questions):*
1. What is defect density? — **Answer:** Number of defects per unit of code (e.g., per 1000 lines) — measuring code quality
2. What is defect escape rate? — **Answer:** The percentage of bugs found by users vs found by QA — lower is better
3. What are the four DORA metrics? — **Answer:** Deployment frequency, lead time for changes, mean time to recovery, and change failure rate
4. What is the danger of using metrics as targets? — **Answer:** Goodhart's Law — when a measure becomes a target, it ceases to be a good measure (people game the system)
5. What should a quality dashboard show? — **Answer:** Test pass/fail rates, defect trends, coverage, escape rate, build health, and release readiness

---

### Semester 2

**QA306 — Shift-Left Testing Strategy** *(3 Credits)*
*Description:* Implement shift-left testing — testing in early stages, developer collaboration, and prevention over detection. Finding bugs early is 100x cheaper than finding them in production.

*Classes:*
1. Shift-Left Fundamentals — https://www.youtube.com/watch?v=Eu35xM76kKY
2. Testing in Requirements Phase — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s
3. Developer-QA Collaboration — https://www.youtube.com/watch?v=f4AGAeVe2Jw
4. Static Analysis & Linting — https://www.youtube.com/watch?v=FnjRjc-xqp0
5. Prevention Over Detection — https://www.youtube.com/watch?v=Eu35xM76kKY&t=600s

*AI Summary:* Shift-left testing catches bugs when they're cheapest to fix. Students learn to test requirements, collaborate with developers during coding, use static analysis, and prevent bugs rather than just finding them.

*Related Articles:*
- Shift-Left Testing — https://www.ibm.com/topics/shift-left
- Static Analysis — https://www.sonarsource.com/solutions/continuous-inspection/
- QA-Dev Collaboration — https://www.ministryoftesting.com/articles/qa-dev-collaboration

*Quiz (5 questions):*
1. What is shift-left testing? — **Answer:** Moving testing activities earlier in the development lifecycle — testing requirements, design, and code before traditional testing phases
2. How do you test requirements? — **Answer:** Review requirements for clarity, completeness, testability, and ambiguity — catching issues before any code is written
3. What is the cost difference of fixing a bug in requirements vs production? — **Answer:** Up to 100x more expensive to fix in production than in requirements
4. What is static analysis? — **Answer:** Analyzing code without executing it — finding bugs, security issues, and code quality problems before runtime
5. How does shift-left testing change the QA role? — **Answer:** From "bug finder" to "quality advocate" — preventing bugs through early involvement, collaboration, and process improvement

---

**QA307 — Quality Engineering & DevOps** *(3 Credits)*
*Description:* Quality engineering in DevOps — continuous testing, quality gates, and deployment pipelines. Quality is everyone's responsibility in a DevOps culture.

*Classes:*
1. Quality Engineering — https://www.youtube.com/watch?v=1Jb5fjE1YF0
2. Continuous Testing — https://www.youtube.com/watch?v=scEDHsr3APg
3. Quality Gates — https://www.youtube.com/watch?v=scEDHsr3APg&t=300s
4. DevOps Culture & QA — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=300s
5. Test Automation in DevOps — https://www.youtube.com/watch?v=scEDHsr3APg&t=600s

*AI Summary:* Quality engineering integrates testing into every stage of DevOps. Students learn continuous testing, quality gates, DevOps culture, and test automation in pipelines. In DevOps, QA is not a gate — it's an enabler.

*Related Articles:*
- Quality Engineering — https://www.thoughtworks.com/insights/blog/quality-engineering
- Continuous Testing — https://www.tricentis.com/continuous-testing/
- DevOps & QA — https://www.atlassian.com/devops/what-is-devops

*Quiz (5 questions):*
1. What is quality engineering vs quality assurance? — **Answer:** QA focuses on finding defects; QE focuses on building quality into the entire development process
2. What is continuous testing? — **Answer:** Running automated tests at every stage of the CI/CD pipeline — providing immediate feedback on every code change
3. What is a quality gate in DevOps? — **Answer:** An automated checkpoint that blocks deployment if quality criteria aren't met — e.g., test failures, coverage below threshold
4. How does QA's role change in DevOps? — **Answer:** From gatekeeper to enabler — helping developers write better tests, automating quality checks, and providing fast feedback
5. What is the testing pyramid in DevOps? — **Answer:** Many fast unit tests, fewer integration tests, fewest slow E2E tests — optimizing for speed and reliability in CI/CD

---

**QA308 — Testing Microservices** *(3 Credits)*
*Description:* Test microservice architectures — service virtualization, contract testing, and distributed tracing. Microservices require different testing strategies.

*Classes:*
1. Microservices Testing Challenges — https://www.youtube.com/watch?v=8BPDv038oMI
2. Service Virtualization — https://www.youtube.com/watch?v=8BPDv038oMI&t=300s
3. Contract Testing for Microservices — https://www.youtube.com/watch?v=lsMQRaeKNDk
4. Distributed Tracing — https://www.youtube.com/watch?v=1Jb5fjE1YF0
5. Integration Testing Strategies — https://www.youtube.com/watch?v=8BPDv038oMI&t=600s

*AI Summary:* Microservices testing is fundamentally different from monolith testing. Students learn service virtualization, contract testing, distributed tracing, and integration testing strategies. Each service must be tested independently and as part of the system.

*Related Articles:*
- Microservices Testing — https://martinfowler.com/articles/microservice-testing/
- Service Virtualization — https://www.ibm.com/topics/service-virtualization
- Distributed Tracing — https://opentelemetry.io/docs/concepts/signals/traces/

*Quiz (5 questions):*
1. What makes microservices testing harder than monolith testing? — **Answer:** Multiple independent services, network communication, eventual consistency, and complex dependencies
2. What is service virtualization? — **Answer:** Creating mock versions of dependent services so you can test in isolation without the real services running
3. What is distributed tracing? — **Answer:** Tracking a request as it flows through multiple microservices — essential for debugging and performance analysis
4. What is the testing strategy for microservices? — **Answer:** Test each service independently (unit, integration), test contracts between services, and test critical paths end-to-end
5. What is WireMock? — **Answer:** A tool for creating mock HTTP services — used for service virtualization in microservices testing

---

**QA309 — Test Environment Management** *(3 Credits)*
*Description:* Manage test environments — infrastructure as code, environment provisioning, and environment parity. Test environments must mirror production to produce reliable results.

*Classes:*
1. Test Environment Fundamentals — https://www.youtube.com/watch?v=1Jb5fjE1YF0
2. Environment Provisioning — https://www.youtube.com/watch?v=lIaUz2GAqEQ
3. Infrastructure as Code — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=300s
4. Environment Parity — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=300s
5. Environment Cleanup — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=600s

*AI Summary:* Test environments are the foundation of reliable testing. Students learn environment provisioning, infrastructure as code, environment parity, and cleanup strategies. "It works on my machine" is not acceptable — test environments must match production.

*Related Articles:*
- Test Environment Management — https://www.browserstack.com/guide/test-environment-management
- Terraform — https://www.terraform.io/
- Environment Parity — https://12factor.net/dev-prod-parity

*Quiz (5 questions):*
1. What is environment parity? — **Answer:** Making test environments as similar to production as possible — same OS, software versions, configurations, and data patterns
2. Why is "it works on my machine" a problem? — **Answer:** It means the development environment differs from production — bugs that only appear in production are the hardest to find and fix
3. What is infrastructure as code for test environments? — **Answer:** Defining test environments using code (Terraform, Docker Compose) so they can be created, destroyed, and recreated consistently
4. What are ephemeral test environments? — **Answer:** Temporary environments created for each test run or pull request and destroyed afterward — ensuring clean, isolated testing
5. How do you manage test environment costs? — **Answer:** Use ephemeral environments, auto-shutdown policies, shared environments for non-critical testing, and cloud cost monitoring

---

**QA310 — Leadership in QA** *(3 Credits)*
*Description:* Lead QA teams — strategy, hiring, mentoring, and establishing quality culture. QA leadership is about building quality into the organization's DNA.

*Classes:*
1. QA Leadership — https://www.youtube.com/watch?v=4Xy1v0k2FhY
2. Building QA Teams — https://www.youtube.com/watch?v=4Xy1v0k2FhY&t=300s
3. Quality Strategy — https://www.youtube.com/watch?v=Q7yV9pYl4p8
4. Mentoring QA Engineers — https://www.youtube.com/watch?v=c9Wg6Cb_YlU
5. Establishing Quality Culture — https://www.youtube.com/watch?v=YBq8T5nYg7Q

*AI Summary:* QA leadership is about building quality into the organization's DNA. Students learn team building, quality strategy, mentoring, and establishing a quality-first culture. Great QA leaders make quality everyone's responsibility.

*Related Articles:*
- QA Leadership — https://www.ministryoftesting.com/articles/qa-leadership
- Quality Culture — https://www.thoughtworks.com/insights/blog/quality-culture
- Test Leadership — https://www.istqb.org/downloads/send/44-istqb-ctfl-syllabus/214-istqb-ctfl-syllabus-v3-1.html

*Quiz (5 questions):*
1. What makes a great QA leader? — **Answer:** Technical expertise, communication skills, ability to influence without authority, and a focus on prevention over detection
2. How do you build a quality culture? — **Answer:** Make quality everyone's responsibility, celebrate bug prevention, provide tools and training, and lead by example
3. What skills should you look for when hiring QA engineers? — **Answer:** Analytical thinking, attention to detail, communication skills, technical aptitude, curiosity, and a user-first mindset
4. How do you measure QA team effectiveness? — **Answer:** Defect escape rate, test coverage, automation percentage, cycle time, and stakeholder satisfaction
5. How do you handle pushback on quality initiatives? — **Answer:** Show data on the cost of bugs, demonstrate ROI of quality improvements, start small with quick wins, and build alliances with engineering leadership

---

## YEAR 400 — PROFESSIONAL PRACTICE

**Goal:** Prepare for a successful QA engineering career — interview mastery, building QA practices, freelancing, and leading a quality engineering initiative.

### Semester 1

**INT404 — Mastering the QA Interview** *(3 Credits)*
*Description:* Prepare for QA interviews — testing concepts, automation frameworks, scenario questions, and behavioral rounds. QA interviews test both technical depth and quality mindset.

*Classes:*
1. QA Interview Overview — https://www.youtube.com/watch?v=YBq8T5nYg7Q
2. Testing Concept Questions — https://www.youtube.com/watch?v=Eu35xM76kKY
3. Automation Framework Questions — https://www.youtube.com/watch?v=FnjRjc-xqp0
4. Scenario-Based Questions — https://www.youtube.com/watch?v=4Xy1v0k2FhY
5. Behavioral & Leadership Rounds — https://www.youtube.com/watch?v=h_OfY-q0k-k

*AI Summary:* QA interviews test testing knowledge, automation skills, problem-solving, and quality mindset. Students learn common interview patterns, practice scenario questions, and develop the ability to articulate their testing approach clearly.

*Related Articles:*
- QA Interview Questions — https://www.softwaretestinghelp.com/software-testing-interview-questions/
- Automation Interview — https://www.guru99.com/selenium-interview-questions.html
- QA Career Guide — https://www.ministryoftesting.com/articles/qa-career-guide

*Quiz (5 questions):*
1. How should you answer "How do you test a login page?" — **Answer:** Cover functional (valid/invalid credentials), security (SQL injection, brute force), UI (layout, responsiveness), accessibility, performance, and edge cases
2. What do interviewers look for in a QA candidate? — **Answer:** Testing mindset, technical skills, communication, problem-solving, attention to detail, and a user-first approach
3. How do you explain your test automation approach? — **Answer:** Describe the framework architecture, tool selection rationale, test organization, CI/CD integration, and maintenance strategy
4. What is the most important quality in a QA engineer? — **Answer:** Curiosity — the desire to understand how things work, how they can break, and what users actually experience
5. How do you handle a question about a testing tool you haven't used? — **Answer:** Explain your experience with similar tools, demonstrate understanding of the concepts, and show how you'd quickly learn the new tool

---

**QA401 — Building a QA Practice** *(3 Credits)*
*Description:* Set up QA processes from scratch — test strategy, tool selection, team structure, and quality metrics. Many Nigerian startups need QA from the ground up.

*Classes:*
1. Building QA from Scratch — https://www.youtube.com/watch?v=Eu35xM76kKY
2. Test Strategy Development — https://www.youtube.com/watch?v=7r4xVDI2vho
3. Tool Selection — https://www.youtube.com/watch?v=FnjRjc-xqp0
4. Team Structure — https://www.youtube.com/watch?v=4Xy1v0k2FhY
5. Quality Metrics & Reporting — https://www.youtube.com/watch?v=Eu35xM76kKY&t=300s

*AI Summary:* Building a QA practice requires strategy, tooling, and culture. Students learn to create test strategies, select tools, structure teams, and define quality metrics. This is essential for Nigerian startups that need QA from day one.

*Related Articles:*
- QA Strategy — https://www.thoughtworks.com/insights/blog/qa-strategy
- Tool Selection — https://www.browserstack.com/guide/test-automation-tool-selection
- Building QA Teams — https://www.ministryoftesting.com/articles/building-qa-teams

*Quiz (5 questions):*
1. What is the first step in building a QA practice? — **Answer:** Assess the current state — understand existing processes, pain points, risk areas, and stakeholder expectations
2. How do you choose testing tools? — **Answer:** Based on team skills, application technology, budget, integration needs, community support, and scalability
3. What is the ideal QA-to-developer ratio? — **Answer:** It depends — modern DevOps teams aim for 1:5-1:8, but the goal is to make quality everyone's responsibility
4. What should a test strategy document include? — **Answer:** Scope, objectives, test levels, test types, tools, environments, entry/exit criteria, risks, and schedule
5. How do you prove QA ROI to leadership? — **Answer:** Track defect escape rate, cost of bugs found in production vs pre-production, test automation time savings, and release confidence

---

**QA402 — Freelancing & Consulting in QA** *(3 Credits)*
*Description:* Build a QA consulting practice — finding clients, scoping engagements, and delivering quality audits. QA consulting is a growing opportunity in Nigeria's tech ecosystem.

*Classes:*
1. QA as a Consultant — https://www.youtube.com/watch?v=c9Wg6Cb_YlU
2. Finding QA Clients — https://www.youtube.com/watch?v=4Xy1v0k2FhY
3. Scoping QA Engagements — https://www.youtube.com/watch?v=z-b5Dk-G0vA
4. Quality Audits — https://www.youtube.com/watch?v=Eu35xM76kKY
5. Building a QA Consulting Brand — https://www.youtube.com/watch?v=h_OfY-q0k-k

*AI Summary:* QA consulting helps companies improve their quality processes. Students learn to find clients, scope engagements, conduct quality audits, and build a consulting brand. Nigerian startups increasingly need external QA expertise.

*Related Articles:*
- QA Consulting — https://www.ministryoftesting.com/articles/qa-consulting
- Quality Audits — https://www.softwaretestinghelp.com/quality-audit/
- Freelancing in Nigeria — https://www.nairametrics.com/2024/02/tech-freelancing-nigeria/

*Quiz (5 questions):*
1. What QA services can you offer as a consultant? — **Answer:** Test strategy development, automation framework setup, quality audits, performance testing, security testing, and team training
2. What is a quality audit? — **Answer:** A systematic review of a company's QA processes, tools, practices, and results — identifying gaps and recommending improvements
3. How do you price QA consulting? — **Answer:** Project-based (fixed fee for specific deliverables), retainer (ongoing support), or daily rate — based on scope and client budget
4. How do you find QA consulting clients in Nigeria? — **Answer:** Networking, LinkedIn content, startup events, referrals, and reaching out to companies with visible quality issues
5. What is the biggest challenge in QA consulting? — **Answer:** Convincing clients that quality is an investment, not a cost — and demonstrating measurable ROI

---

**QA403 — Specialization I** *(3 Credits)*
*Description:* Choose a specialization: Performance Engineering, Security Testing, AI/ML Testing, or Game Testing. Specialization makes you stand out in a competitive market.

*Classes:*
1. Performance Engineering — https://www.youtube.com/watch?v=23pGK3s_Qjk
2. Security Testing Deep Dive — https://www.youtube.com/watch?v=G6XOKeWGSgY
3. AI/ML Testing — https://www.youtube.com/watch?v=wDBraae1Bjw
4. Game Testing — https://www.youtube.com/watch?v=23pGK3s_Qjk&t=300s
5. Choosing Your Path — https://www.youtube.com/watch?v=4Xy1v0k2FhY

*AI Summary:* Specialization differentiates you in the QA market. Students explore performance engineering, security testing, AI/ML testing, and game testing, then choose one to deep-dive into. Specialists command higher rates and more interesting work.

*Related Articles:*
- Performance Engineering — https://k6.io/blog/what-is-performance-engineering/
- Security Testing — https://owasp.org/www-project-web-security-testing-guide/
- AI/ML Testing — https://www.ministryoftesting.com/articles/testing-ai-ml-systems

*Quiz (5 questions):*
1. What does a performance engineer do? — **Answer:** Design and execute performance tests, analyze bottlenecks, optimize system performance, and establish performance baselines
2. What is unique about AI/ML testing? — **Answer:** You can't test for exact outputs — you test for accuracy, fairness, robustness, and performance across different data distributions
3. What makes game testing different from software testing? — **Answer:** Focus on gameplay experience, graphics performance, multiplayer synchronization, and subjective quality (fun factor)
4. What certifications add value for QA specialists? — **Answer:** ISTQB Advanced, Certified Performance Engineer, CEH (for security), and tool-specific certifications
5. How do you choose a specialization? — **Answer:** Based on market demand, personal interest, existing skills, and long-term career goals

---

**QA404 — Open Source Testing Tools** *(3 Credits)*
*Description:* Contribute to open source testing tools — Cypress, Playwright, and other popular testing frameworks. Open source contribution accelerates career growth.

*Classes:*
1. Open Source for QA — https://www.youtube.com/watch?v=PbdA93HSbqo
2. Contributing to Cypress — https://www.youtube.com/watch?v=7N63cMKosIE
3. Contributing to Playwright — https://www.youtube.com/watch?v=7N63cMKosIE&t=300s
4. Writing Test Tool Plugins — https://www.youtube.com/watch?v=FnjRjc-xqp0
5. Building Your Own Testing Tool — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=300s

*AI Summary:* Open source contribution builds reputation and skills. Students learn to contribute to Cypress, Playwright, write plugins, and even build their own testing tools. Open source is the fastest way to grow as a QA engineer.

*Related Articles:*
- Playwright — https://playwright.dev/
- Cypress — https://www.cypress.io/
- Open Source Testing — https://github.com/topics/testing-tools

*Quiz (5 questions):*
1. Why contribute to open source testing tools? — **Answer:** Build reputation, learn from experts, improve tools you use daily, and create networking opportunities
2. How do you start contributing to an open source testing tool? — **Answer:** Find a beginner-friendly issue, set up the project locally, read the contributing guide, and submit a small PR
3. What is Playwright? — **Answer:** A modern browser automation library by Microsoft — supports Chromium, Firefox, and WebKit with a single API
4. What makes a good testing tool plugin? — **Answer:** Solves a common pain point, has clear documentation, is well-tested, and integrates seamlessly with the host tool
5. How do open source contributions help your career? — **Answer:** They demonstrate real-world skills, build a public track record, create networking opportunities, and differentiate you from other candidates

---

### Semester 2

**CAP402 — Capstone Project: Quality Engineering Initiative** *(6 Credits)*
*Description:* Lead a comprehensive quality engineering initiative — from strategy to implementation and measurement. This is your proof that you can build quality into real products.

*Classes:*
1. Capstone Kickoff: Finding a Real Problem — https://www.youtube.com/watch?v=Yo2uI6DKeNA
2. Quality Strategy Design — https://www.youtube.com/watch?v=7r4xVDI2vho
3. Implementation & Automation — https://www.youtube.com/watch?v=FnjRjc-xqp0
4. Measurement & Reporting — https://www.youtube.com/watch?v=Eu35xM76kKY
5. Presentation & Defense — https://www.youtube.com/watch?v=4Xy1v0k2FhY

*AI Summary:* The capstone is where everything comes together. Students design and implement a comprehensive quality engineering initiative for a real product — from strategy through automation to measurement. This project becomes their portfolio centerpiece.

*Related Articles:*
- Quality Engineering — https://www.thoughtworks.com/insights/blog/quality-engineering
- Capstone Project Guide — https://www.ministryoftesting.com/articles/qa-capstone-project
- Quality Strategy — https://www.softwaretestinghelp.com/test-strategy/

*Quiz (5 questions):*
1. What are the key phases of the capstone project? — **Answer:** Problem discovery, quality strategy design, implementation, measurement, and presentation
2. How should you measure the success of your quality initiative? — **Answer:** Defect escape rate reduction, test coverage improvement, automation percentage, cycle time reduction, and stakeholder feedback
3. What makes a strong capstone presentation? — **Answer:** Clear problem statement, evidence-based strategy, implementation details, measurable outcomes, and honest reflection on challenges
4. How do you choose a capstone project topic? — **Answer:** Pick a real product with visible quality issues, where you can access the codebase and stakeholders, that showcases multiple QA skills
5. How will the capstone be evaluated? — **Answer:** Strategy quality, implementation completeness, automation coverage, measurement rigor, presentation skills, and overall impact

---

**ETH402 — Ethics in Testing** *(3 Credits)*
*Description:* Ethical considerations in testing — test data privacy, responsible disclosure, and testing integrity. Testers hold sensitive data and have the power to hide or reveal quality issues.

*Classes:*
1. Ethics in Testing — https://www.youtube.com/watch?v=H2cB4J6kXQ4
2. Test Data Privacy — https://www.youtube.com/watch?v=8ZtInClXe1Q
3. Responsible Disclosure — https://www.youtube.com/watch?v=G6XOKeWGSgY
4. Testing Integrity — https://www.youtube.com/watch?v=H2cB4J6kXQ4&t=300s
5. Ethical Dilemmas in QA — https://www.youtube.com/watch?v=H2cB4J6kXQ4&t=600s

*AI Summary:* Testers face unique ethical challenges. Students learn test data privacy, responsible disclosure, testing integrity, and how to handle ethical dilemmas. A QA engineer who compromises on ethics puts users at risk.

*Related Articles:*
- Testing Ethics — https://www.istqb.org/downloads/send/44-istqb-ctfl-syllabus/214-istqb-ctfl-syllabus-v3-1.html
- Responsible Disclosure — https://www.owasp.org/index.php/Responsible_Disclosure
- Data Privacy — https://ndpr.gov.ng/

*Quiz (5 questions):*
1. What is the ethical responsibility of a QA engineer? — **Answer:** To report findings honestly, protect user data, advocate for quality even under pressure, and never hide or manipulate test results
2. What is responsible disclosure? — **Answer:** Reporting security vulnerabilities privately to the organization, giving them time to fix before public disclosure
3. What should you do if pressured to sign off on a release with known critical bugs? — **Answer:** Document the risks, escalate to leadership, and refuse to sign off if user safety or data integrity is at risk
4. Why is test data privacy important? — **Answer:** Test data often contains real user information — mishandling it violates privacy laws and user trust
5. What is testing integrity? — **Answer:** Reporting results honestly, not manipulating metrics, not hiding bugs to meet deadlines, and maintaining professional standards

---

**TEAM402 — Mentorship & Quality Advocacy** *(3 Credits)*
*Description:* Develop mentorship skills and learn to advocate for quality across the organization. Quality advocacy is about making quality everyone's responsibility.

*Classes:*
1. Mentoring QA Engineers — https://www.youtube.com/watch?v=c9Wg6Cb_YlU
2. Quality Advocacy — https://www.youtube.com/watch?v=Q7yV9pYl4p8
3. Cross-Functional Collaboration — https://www.youtube.com/watch?v=f4AGAeVe2Jw
4. Building Quality Communities — https://www.youtube.com/watch?v=YBq8T5nYg7Q
5. Thought Leadership in QA — https://www.youtube.com/watch?v=h_OfY-q0k-k

*AI Summary:* Quality advocacy is about influencing the entire organization. Students learn mentoring, cross-functional collaboration, building quality communities, and thought leadership. Great QA engineers make quality everyone's responsibility.

*Related Articles:*
- Quality Advocacy — https://www.ministryoftesting.com/articles/quality-advocacy
- Mentoring in QA — https://www.adplist.org/
- QA Communities — https://www.meetup.com/topics/software-testing/

*Quiz (5 questions):*
1. How do you advocate for quality without being adversarial? — **Answer:** Frame quality as enabling speed (not blocking it), use data to show the cost of bugs, and collaborate with developers on solutions
2. What is a quality community of practice? — **Answer:** A group of QA professionals who share knowledge, best practices, and support each other's growth
3. How do you mentor a junior QA engineer? — **Answer:** Pair test, review their test cases, explain the "why" behind testing decisions, and create safe spaces for learning
4. What is thought leadership in QA? — **Answer:** Sharing knowledge through blogs, talks, open source contributions, and community involvement — establishing yourself as an expert
5. How do you make quality everyone's responsibility? — **Answer:** Provide tools and training, celebrate quality wins, integrate quality into development workflows, and lead by example
