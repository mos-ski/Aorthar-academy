# Aorthar Academy: Department of Backend Engineering

**Goal**: To produce graduates who can build and maintain the server-side logic, databases, and APIs that power applications. They are experts in scalability, security, and performance.

---

### YEAR 100 — BE FOUNDATIONS

**Semester 1**
- **DEV105**: Introduction to Backend Development (Node.js) (3 Credits)
- **DB101**: Database Fundamentals (SQL & NoSQL) (3 Credits)
- **PM103**: Introduction to Agile & Scrum (3 Credits)
- **DEV103**: Data Structures & Algorithms (3 Credits)
- **CS101**: Computer Science Fundamentals (3 Credits)

**Semester 2**
- **DEV108**: Building RESTful APIs (3 Credits)
- **CS102**: Operating Systems & Networking (3 Credits)
- **DB102**: Advanced SQL & Database Design (3 Credits)
- **SEC101**: Introduction to Security (3 Credits)
- **QA102**: Introduction to Testing (Unit, Integration) (3 Credits)

### YEAR 200 — INTERMEDIATE BACKEND

**Semester 1**
- **DEV207**: Advanced Node.js (Streams, Child Processes) (3 Credits)
- **SEC201**: Authentication & Authorization (JWT, OAuth) (3 Credits)
- **OPS201**: Containerization with Docker (3 Credits)
- **ARC201**: Introduction to Microservices (3 Credits)
- **DB201**: ORMs (Prisma, TypeORM) (3 Credits)

**Semester 2**
- **DEV208**: Building GraphQL APIs (3 Credits)
- **OPS202**: Caching Strategies with Redis (3 Credits)
- **ARC202**: Message Queues (RabbitMQ, Kafka) (3 Credits)
- **ARC204**: Software Architecture Patterns (3 Credits)
- **QA202**: Backend Testing Strategies (3 Credits)

### YEAR 300 — ADVANCED BACKEND & SYSTEMS

**Semester 1**
- **ARC301**: System Design Fundamentals (3 Credits)
- **OPS301**: Cloud Computing (AWS/GCP Foundations) (3 Credits)
- **OPS303**: Orchestration with Kubernetes (3 Credits)
- **DB301**: Database Optimization & Scaling (3 Credits)
- **SEC302**: Advanced API Security (3 Credits)

**Semester 2**
- **ARC302**: Distributed Systems (3 Credits)
- **OPS302**: Serverless Architecture (Lambda, Cloud Functions) (3 Credits)
- **DEV302**: gRPC & Protocol Buffers (3 Credits)
- **OPS304**: Monitoring & Observability (Prometheus, Grafana) (3 Credits)
- **ARC304**: Advanced System Design (3 Credits)

### YEAR 400 — PROFESSIONAL PRACTICE

**Semester 1**
- **INT403**: Mastering the Backend Interview (3 Credits)
- **OPS401**: Infrastructure as Code (Terraform) (3 Credits)
- **DEV403**: AI/ML for Backend Developers (3 Credits)
- **BE401**: Specialization I (e.g., FinTech, Distributed DBs) (3 Credits)
- **BE403**: Advanced Cloud Services (3 Credits)

**Semester 2**
- **CAP402**: Capstone Project: Scalable Backend Service (6 Credits)
- **ETH402**: Ethics in Engineering & Data Privacy (3 Credits)
- **TEAM402**: Mentorship & Technical Leadership (3 Credits)

---

### **Course Deep Dive: DEV105 - Introduction to Backend Development (Node.js)**

**Description**: This course introduces students to server-side programming using Node.js. Students will learn how to build applications outside the browser, handle HTTP requests, interact with the file system, and set the stage for building robust APIs.

**12-Week Lesson Plan:**

| Week | Topic | Core Concepts | Resources |
|---|---|---|---|
| 1 | What is Backend? Intro to Node.js | Client vs. Server, What is Node.js?, Blocking vs. Non-Blocking I/O, `npm init`. | Node.js Crash Course |
| 2 | Node.js Modules & `require` | CommonJS modules, `module.exports`, `require`, core modules. | Node.js Modules |
| 3 | The File System (fs) Module | Reading files, writing files, synchronous vs. asynchronous methods. | Node.js File System |
| 4 | The HTTP Module | Creating a basic HTTP server, handling requests and responses. | Build a Node.js Web Server |
| 5 | Introduction to Express.js | What is Express?, installing Express, setting up a basic server. | Express.js Crash Course |
| 6 | Express.js: Routing | Handling different HTTP methods (GET, POST), route parameters. | Express Router |
| 7 | Express.js: Middleware | What is middleware?, writing custom middleware, `next()`. | Express Middleware |
| 8 | Handling Requests & Responses | The `req` and `res` objects, sending JSON, setting status codes. | HTTP Request & Response |
| 9 | Introduction to REST APIs | Principles of REST, statelessness, resource-based URLs. | REST API Concepts |
| 10 | Building a Simple CRUD API | Building GET, POST, PUT, DELETE endpoints for an in-memory resource. | Build a REST API with Node.js |
| 11 | Asynchronous Patterns in Node.js | The event loop revisited, callbacks, Promises, and Async/Await in a server context. | Node.js Event Loop |
| 12 | Environment Variables | Using `.env` files to manage configuration and secrets. | Environment Variables |

**Sample Quiz Questions (Weeks 1-4):**

1.  **What is the primary purpose of Node.js?**
    a) To style web pages.
    b) To run JavaScript code on the server.
    c) To create animations in the browser.
    d) To manage databases directly.

2.  **In CommonJS, how do you make a function from one file available to another?**
    a) `return myFunction;`
    b) `export default myFunction;`
    c) `module.exports = myFunction;`
    d) `include(myFunction);`

3.  **Which core Node.js module is used for interacting with the file system?**
    a) `http`
    b) `url`
    c) `path`
    d) `fs`

4.  **What is the main advantage of Node.js's non-blocking I/O model?**
    a) It makes code easier to write.
    b) It can handle many concurrent connections efficiently.
    c) It uses less memory than other models.
    d) It runs code faster in all situations.

**Final Exam Structure:**
- **Part A: Multiple Choice (40%)**: 40 questions on Node.js concepts, core modules, and Express.js fundamentals.
- **Part B: Code Analysis (30%)**: 4 short Node.js/Express code snippets. Students must identify the purpose of the code or find the error.
  - *Example*: "What is wrong with this Express route handler? How would you fix it?"
- **Part C: Practical API Task (30%)**: A small project specification requiring the student to build a few API endpoints using Express.
  - *Example*: "Create an Express server with two GET routes: `/api/books` which returns a list of books, and `/api/books/:id` which returns a single book by its ID."