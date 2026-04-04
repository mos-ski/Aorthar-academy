# Backend Engineering Curriculum

**Status:** Complete
**Last Updated:** 2026-04-04

---

## YEAR 100 — BE FOUNDATIONS

**Goal:** Produce graduates who can build and maintain server-side logic, databases, and APIs. Experts in scalability, security, and performance.

### Semester 1

**DEV105 — Introduction to Backend Development (Node.js)** *(3 Credits)*
*Description:* Server-side programming with Node.js — building applications outside the browser, handling HTTP requests, and setting up APIs. This is your entry point into backend engineering.

*Classes:*
1. What is Backend? Intro to Node.js — https://www.youtube.com/watch?v=TlB_eWDSMt4
2. Node.js Modules & require — https://www.youtube.com/watch?v=pT176L36MUM
3. The File System (fs) Module — https://www.youtube.com/watch?v=ZySsdm57ftw
4. The HTTP Module — https://www.youtube.com/watch?v=TlB_eWDSMt4&t=600s
5. Introduction to Express.js — https://www.youtube.com/watch?v=L72fhGm1tfE
6. Express.js: Routing — https://www.youtube.com/watch?v=L72fhGm1tfE&t=300s
7. Express.js: Middleware — https://www.youtube.com/watch?v=L72fhGm1tfE&t=600s
8. Handling Requests & Responses — https://www.youtube.com/watch?v=L72fhGm1tfE&t=900s
9. Introduction to REST APIs — https://www.youtube.com/watch?v=lsMQRaeKNDk
10. Building a Simple CRUD API — https://www.youtube.com/watch?v=L72fhGm1tfE&t=1200s
11. Asynchronous Patterns in Node.js — https://www.youtube.com/watch?v=V_Kr9OSfDeU
12. Environment Variables — https://www.youtube.com/watch?v=Zm940g7YtRQ

*AI Summary:* Node.js allows you to run JavaScript on the server. Students learn the event loop, modules, Express.js, REST API design, and CRUD operations. This is the foundation for everything that follows — mastering Node.js means you can build any backend service.

*Related Articles:*
- Node.js Official Docs — https://nodejs.org/en/docs/
- Express.js Guide — https://expressjs.com/en/guide/routing.html
- REST API Tutorial — https://www.restapitutorial.com/

*Quiz (5 questions):*
1. What makes Node.js different from traditional server-side languages? — **Answer:** It uses a non-blocking, event-driven architecture with a single-threaded event loop, making it highly efficient for I/O-heavy operations
2. What is middleware in Express.js? — **Answer:** Functions that have access to req, res, and next — they can modify requests, run code, or pass control to the next middleware
3. What does CRUD stand for? — **Answer:** Create, Read, Update, Delete — the four basic operations for any data store
4. What is the event loop in Node.js? — **Answer:** The mechanism that handles asynchronous callbacks, allowing Node.js to perform non-blocking I/O operations despite being single-threaded
5. Why use environment variables for configuration? — **Answer:** To keep secrets (API keys, DB credentials) out of source code and allow different configs for dev, staging, and production

---

**DB101 — Database Fundamentals (SQL & NoSQL)** *(3 Credits)*
*Description:* Core database concepts — relational vs document databases, queries, indexing, and data modeling. Every backend engineer must understand how data is stored and retrieved.

*Classes:*
1. SQL vs NoSQL — https://www.youtube.com/watch?v=ZS_kXvOafQY
2. Relational Database Design — https://www.youtube.com/watch?v=OqjJmpjBmP4
3. Basic SQL Queries — https://www.youtube.com/watch?v=HXV3zeQKqGY
4. Indexing & Performance — https://www.youtube.com/watch?v=-qNSXK7s7_w
5. NoSQL & Document Databases — https://www.youtube.com/watch?v=uD3p_rZPBUQ

*AI Summary:* Databases are the backbone of every application. Students learn SQL fundamentals, relational design, NoSQL alternatives, indexing strategies, and when to use each type. Choosing the right database is one of the most important architectural decisions.

*Related Articles:*
- SQL Tutorial — https://www.w3schools.com/sql/
- MongoDB vs PostgreSQL — https://www.mongodb.com/nosql-explained/nosql-vs-sql
- Database Design Basics — https://www.lucidchart.com/pages/database-diagramming-guide

*Quiz (5 questions):*
1. What is the difference between SQL and NoSQL databases? — **Answer:** SQL uses structured tables with fixed schemas and relationships; NoSQL uses flexible document/key-value/graph structures for unstructured data
2. What is a primary key? — **Answer:** A unique identifier for each row in a table — it cannot be null and must be unique
3. What is an index and why does it improve query performance? — **Answer:** A data structure that allows the database to find rows without scanning the entire table — like a book's index
4. What is normalization? — **Answer:** Organizing data to reduce redundancy and improve integrity by splitting data into related tables
5. When would you choose MongoDB over PostgreSQL? — **Answer:** When you need flexible schemas, rapid iteration, hierarchical data, or horizontal scaling at the cost of ACID guarantees

---

**PM103 — Introduction to Agile & Scrum** *(3 Credits)*
*Description:* Core Agile and Scrum principles for working in product teams.
*See: [Product Management — PM103](./product-management.md)*

---

**DEV103 — Data Structures & Algorithms** *(3 Credits)*
*Description:* Essential CS concepts — arrays, linked lists, trees, hash maps, sorting, searching, Big-O notation.
*See: [Frontend Engineering — DEV103](./frontend.md)*

---

**CS101 — Computer Science Fundamentals** *(3 Credits)*
*Description:* Core CS concepts — binary, memory management, time/space complexity, basic algorithms.
*See: [Frontend Engineering — CS101](./frontend.md)*

---

### Semester 2

**DEV108 — Building RESTful APIs** *(3 Credits)*
*Description:* Design and build production-ready REST APIs — authentication, validation, error handling, pagination, and documentation. This is where you learn to build APIs that other developers love to use.

*Classes:*
1. REST API Design Principles — https://www.youtube.com/watch?v=lsMQRaeKNDk
2. API Authentication — https://www.youtube.com/watch?v=mbsmsi7h3r4
3. Input Validation with Zod/Joi — https://www.youtube.com/watch?v=L6BE-U3oy80
4. Error Handling Patterns — https://www.youtube.com/watch?v=L72fhGm1tfE&t=1500s
5. Pagination & Filtering — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=300s
6. API Documentation (Swagger/OpenAPI) — https://www.youtube.com/watch?v=6q5-cVeNjCE
7. API Versioning — https://www.youtube.com/watch?v=lsMQRaeKNDk&t=600s
8. Rate Limiting & Throttling — https://www.youtube.com/watch?v=mbsmsi7h3r4&t=300s

*AI Summary:* REST APIs are the interface between frontend and backend. Students learn resource naming, HTTP methods, status codes, authentication, validation, error handling, pagination, and documentation. A well-designed API is a product in itself.

*Related Articles:*
- REST API Best Practices — https://restfulapi.net/
- OpenAPI Specification — https://swagger.io/specification/
- API Design Guide — https://cloud.google.com/apis/design/

*Quiz (5 questions):*
1. What makes an API "RESTful"? — **Answer:** It follows REST principles: stateless, resource-based URLs, standard HTTP methods, and consistent response formats
2. What HTTP status code should you return for a successful POST that creates a resource? — **Answer:** 201 Created
3. What is API versioning and why is it important? — **Answer:** Adding version identifiers (v1, v2) to your API so you can make breaking changes without breaking existing clients
4. What is the difference between 401 and 403 status codes? — **Answer:** 401: Unauthorized (not authenticated); 403: Forbidden (authenticated but no permission)
5. Why should you document your API? — **Answer:** So other developers (frontend, mobile, third-party) can understand and use your API correctly without guessing

---

**CS102 — Operating Systems & Networking** *(3 Credits)*
*Description:* OS fundamentals — processes, threads, memory, and networking — TCP/IP, DNS, HTTP/2, TLS. Backend engineers need to understand the infrastructure their code runs on.

*Classes:*
1. Operating Systems Basics — https://www.youtube.com/watch?v=9GDX-IyZ_C8
2. Processes & Threads — https://www.youtube.com/watch?v=21nIOTF5CYY
3. Memory Management — https://www.youtube.com/watch?v=fp5AEQ5w5b0
4. TCP/IP & DNS — https://www.youtube.com/watch?v=7_LPdttKXPc
5. HTTP/2 & HTTP/3 — https://www.youtube.com/watch?v=Em9N3v1OkQs
6. TLS & Encryption — https://www.youtube.com/watch?v=3QnU27KXPGo

*AI Summary:* Understanding OS and networking makes you a better backend engineer. Students learn processes, threads, memory, TCP/IP, DNS, HTTP versions, and TLS. This knowledge is essential for debugging production issues and designing efficient systems.

*Related Articles:*
- Operating Systems — https://pages.cs.wisc.edu/~remzi/OSTEP/
- TCP/IP Guide — https://www.tcpipguide.com/free/t_toc.htm
- HTTP/2 Explained — https://http2.explained.dev/

*Quiz (5 questions):*
1. What is the difference between a process and a thread? — **Answer:** A process is an independent program with its own memory; a thread is a lightweight unit within a process that shares memory with other threads
2. What does DNS do? — **Answer:** Domain Name System — translates human-readable domain names (google.com) into IP addresses (142.250.80.46)
3. What is the difference between TCP and UDP? — **Answer:** TCP is connection-oriented with guaranteed delivery and ordering; UDP is connectionless, faster, but no delivery guarantees
4. What is TLS and why is it important? — **Answer:** Transport Layer Security — encrypts data in transit between client and server, preventing eavesdropping and tampering
5. What is HTTP/2's main advantage over HTTP/1.1? — **Answer:** Multiplexing — multiple requests/responses can be sent simultaneously over a single connection, eliminating head-of-line blocking

---

**DB102 — Advanced SQL & Database Design** *(3 Credits)*
*Description:* Joins, subqueries, transactions, indexing strategies, normalization, and schema design. This is where you go from writing queries to designing databases that scale.

*Classes:*
1. SQL Joins Deep Dive — https://www.youtube.com/watch?v=9yeOJ0ZMUYw
2. Subqueries & CTEs — https://www.youtube.com/watch?v=HXV3zeQKqGY&t=600s
3. Transactions & ACID — https://www.youtube.com/watch?v=yaQ5YMWkxq4
4. Indexing Strategies — https://www.youtube.com/watch?v=-qNSXK7s7_w
5. Database Normalization — https://www.youtube.com/watch?v=OqjJmpjBmP4&t=300s
6. Schema Design Patterns — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=300s

*AI Summary:* Advanced SQL is what separates junior from senior backend engineers. Students master joins, subqueries, CTEs, transactions, ACID properties, indexing strategies, and schema design. These skills are essential for building performant, reliable data layers.

*Related Articles:*
- SQL Joins Explained — https://www.w3schools.com/sql/sql_join.asp
- ACID Properties — https://www.mongodb.com/basics/acid-transactions
- Database Normalization — https://en.wikipedia.org/wiki/Database_normalization

*Quiz (5 questions):*
1. What are the four ACID properties? — **Answer:** Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data persists)
2. What is the difference between INNER JOIN and LEFT JOIN? — **Answer:** INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right (nulls for no match)
3. What is a CTE (Common Table Expression)? — **Answer:** A named temporary result set defined with WITH clause — makes complex queries more readable and reusable
4. What is a composite index? — **Answer:** An index on multiple columns — useful for queries that filter on those columns together
5. What is denormalization and when would you use it? — **Answer:** Intentionally adding redundancy to reduce joins — used for read-heavy workloads where query performance matters more than storage efficiency

---

**SEC101 — Introduction to Security** *(3 Credits)*
*Description:* Security fundamentals — OWASP Top 10, encryption, hashing, and secure coding practices. Security is not optional — it's your responsibility as a backend engineer.

*Classes:*
1. OWASP Top 10 — https://www.youtube.com/watch?v=G6XOKeWGSgY
2. SQL Injection Prevention — https://www.youtube.com/watch?v=ciNHn38YRcM
3. Password Hashing (bcrypt, argon2) — https://www.youtube.com/watch?v=8ZtInClXe1Q
4. Encryption Basics — https://www.youtube.com/watch?v=3QnU27KXPGo
5. Secure Coding Practices — https://www.youtube.com/watch?v=G6XOKeWGSgY&t=300s

*AI Summary:* Security is everyone's responsibility. Students learn OWASP Top 10 vulnerabilities, SQL injection prevention, password hashing, encryption basics, and secure coding practices. A single security breach can destroy a company.

*Related Articles:*
- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- Password Hashing — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Secure Coding — https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/

*Quiz (5 questions):*
1. What is SQL injection and how do you prevent it? — **Answer:** Injecting malicious SQL through user input; prevent it with parameterized queries/prepared statements and input validation
2. What is the difference between encryption and hashing? — **Answer:** Encryption is reversible (with a key); hashing is one-way — you can't recover the original data from a hash
3. Why should you never store plain-text passwords? — **Answer:** If the database is breached, all passwords are exposed; hashed passwords require brute-force attacks to crack
4. What is bcrypt? — **Answer:** A password hashing function that is intentionally slow and includes a salt to prevent rainbow table attacks
5. What is the OWASP Top 10? — **Answer:** A regularly updated list of the most critical web application security risks, maintained by the Open Web Application Security Project

---

**QA102 — Introduction to Testing** *(3 Credits)*
*Description:* Unit testing, integration testing, and test-driven development for backend applications.
*See: [Frontend Engineering — QA102](./frontend.md)*

---

## YEAR 200 — INTERMEDIATE BACKEND

**Goal:** Master advanced backend patterns, authentication, containerization, and microservice architecture.

### Semester 1

**DEV207 — Advanced Node.js (Streams, Child Processes)** *(3 Credits)*
*Description:* Advanced Node.js patterns — streams, buffers, child processes, clustering, and worker threads. This is where you unlock the full power of Node.js for production workloads.

*Classes:*
1. Node.js Streams — https://www.youtube.com/watch?v=GlybFFMXXmQ
2. Buffers & Binary Data — https://www.youtube.com/watch?v=GlybFFMXXmQ&t=300s
3. Child Processes — https://www.youtube.com/watch?v=TlB_eWDSMt4&t=600s
4. Clustering & Worker Threads — https://www.youtube.com/watch?v=TlB_eWDSMt4&t=900s
5. Event Emitters — https://www.youtube.com/watch?v=pT176L36MUM&t=300s
6. Memory Management in Node.js — https://www.youtube.com/watch?v=TlB_eWDSMt4&t=1200s

*AI Summary:* Advanced Node.js unlocks production-grade performance. Students learn streams for handling large data, buffers for binary operations, child processes for CPU-heavy tasks, clustering for multi-core utilization, and memory management for preventing leaks.

*Related Articles:*
- Node.js Streams — https://nodejs.org/api/stream.html
- Worker Threads — https://nodejs.org/api/worker_threads.html
- Node.js Memory Management — https://nodejs.org/en/docs/guides/diagnostics/memory/

*Quiz (5 questions):*
1. What are the four types of Node.js streams? — **Answer:** Readable, Writable, Duplex, and Transform
2. Why use streams instead of reading entire files into memory? — **Answer:** Streams process data chunk by chunk, using constant memory regardless of file size — essential for large files
3. What is clustering in Node.js? — **Answer:** Running multiple Node.js processes (one per CPU core) to utilize all available cores and handle more concurrent requests
4. What is the difference between child_process.fork() and child_process.exec()? — **Answer:** fork() creates a new Node.js process with IPC communication; exec() runs a shell command and returns the output
5. What causes memory leaks in Node.js? — **Answer:** Unclosed connections, global variables, event listener accumulation, and closures holding references to large objects

---

**SEC201 — Authentication & Authorization (JWT, OAuth)** *(3 Credits)*
*Description:* Implement authentication systems — JWT, OAuth 2.0, session management, and RBAC. Auth is the gatekeeper of every application.

*Classes:*
1. Authentication vs Authorization — https://www.youtube.com/watch?v=mbsmsi7h3r4
2. JWT (JSON Web Tokens) — https://www.youtube.com/watch?v=UBUNrFtufWo
3. OAuth 2.0 Flow — https://www.youtube.com/watch?v=996OiexHze0
4. Session Management — https://www.youtube.com/watch?v=mbsmsi7h3r4&t=300s
5. RBAC (Role-Based Access Control) — https://www.youtube.com/watch?v=mbsmsi7h3r4&t=600s
6. Refresh Tokens & Token Rotation — https://www.youtube.com/watch?v=UBUNrFtufWo&t=300s

*AI Summary:* Authentication and authorization are foundational to every application. Students learn JWT, OAuth 2.0, session management, RBAC, and token rotation. Getting auth wrong means anyone can access any data — there's no room for mistakes.

*Related Articles:*
- JWT Introduction — https://jwt.io/introduction
- OAuth 2.0 Simplified — https://aaronparecki.com/oauth-2-simplified/
- Session vs Token Auth — https://www.okta.com/blog/2022/01/token-based-authentication-vs-session/

*Quiz (5 questions):*
1. What is the difference between authentication and authorization? — **Answer:** Authentication verifies who you are (login); authorization verifies what you're allowed to do (permissions)
2. What are the three parts of a JWT? — **Answer:** Header (algorithm + type), Payload (claims/data), Signature (verification)
3. What is OAuth 2.0 used for? — **Answer:** Delegated authorization — allowing third-party apps to access user resources without sharing passwords (e.g., "Login with Google")
4. Why use refresh tokens? — **Answer:** To issue new access tokens without requiring the user to log in again — short-lived access tokens limit damage if stolen
5. What is RBAC? — **Answer:** Role-Based Access Control — assigning permissions to roles (admin, user, moderator) and assigning users to roles

---

**OPS201 — Containerization with Docker** *(3 Credits)*
*Description:* Containerize applications with Docker — images, volumes, networks, and Docker Compose. Docker is the standard for deploying backend services.

*Classes:*
1. What is Docker? — https://www.youtube.com/watch?v=Gjnup-PuquQ
2. Docker Images & Containers — https://www.youtube.com/watch?v=Gjnup-PuquQ&t=300s
3. Dockerfile Best Practices — https://www.youtube.com/watch?v=Gjnup-PuquQ&t=600s
4. Docker Volumes & Networks — https://www.youtube.com/watch?v=Gjnup-PuquQ&t=900s
5. Docker Compose — https://www.youtube.com/watch?v=DM65WyYGrRg
6. Multi-Stage Builds — https://www.youtube.com/watch?v=Gjnup-PuquQ&t=1200s

*AI Summary:* Docker packages applications with all their dependencies into portable containers. Students learn Dockerfiles, images, volumes, networks, Docker Compose for multi-service setups, and multi-stage builds for optimized production images.

*Related Articles:*
- Docker Docs — https://docs.docker.com/
- Dockerfile Best Practices — https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Docker Compose — https://docs.docker.com/compose/

*Quiz (5 questions):*
1. What is the difference between a Docker image and a container? — **Answer:** An image is a read-only template; a container is a running instance of an image
2. What is a Dockerfile? — **Answer:** A text file with instructions for building a Docker image — FROM, RUN, COPY, CMD, etc.
3. What is Docker Compose used for? — **Answer:** Defining and running multi-container applications with a single YAML file — e.g., app + database + cache
4. What is a multi-stage build? — **Answer:** Using multiple FROM statements in a Dockerfile to build in one stage and copy only the final artifacts to a smaller production image
5. Why use Docker volumes instead of storing data in the container? — **Answer:** Container data is lost when the container is removed; volumes persist data independently of container lifecycle

---

**ARC201 — Introduction to Microservices** *(3 Credits)*
*Description:* Design microservice architectures — service boundaries, inter-service communication, and API gateways. Microservices are how large-scale systems are built.

*Classes:*
1. Monolith vs Microservices — https://www.youtube.com/watch?v=8BPDv038oMI
2. Service Boundaries — https://www.youtube.com/watch?v=8BPDv038oMI&t=300s
3. Inter-Service Communication — https://www.youtube.com/watch?v=8BPDv038oMI&t=600s
4. API Gateway Pattern — https://www.youtube.com/watch?v=8BPDv038oMI&t=900s
5. Service Discovery — https://www.youtube.com/watch?v=8BPDv038oMI&t=1200s

*AI Summary:* Microservices break large applications into independently deployable services. Students learn service boundaries, communication patterns (sync/async), API gateways, and service discovery. Microservices solve scaling problems but introduce complexity.

*Related Articles:*
- Microservices — https://microservices.io/
- Martin Fowler on Microservices — https://martinfowler.com/articles/microservices.html
- Service Boundaries — https://docs.microsoft.com/en-us/azure/architecture/microservices/design/service-boundaries

*Quiz (5 questions):*
1. What is a microservice? — **Answer:** A small, independently deployable service that owns a specific business capability and communicates with other services via APIs
2. When should you NOT use microservices? — **Answer:** When your team is small, the application is simple, or you don't have the operational maturity to manage distributed systems
3. What is an API gateway? — **Answer:** A single entry point that routes requests to appropriate microservices, handles auth, rate limiting, and response aggregation
4. What is the difference between synchronous and asynchronous inter-service communication? — **Answer:** Synchronous: the caller waits for a response (REST, gRPC); asynchronous: the caller sends a message and continues (message queues, events)
5. What is service discovery? — **Answer:** A mechanism for services to find and communicate with each other dynamically, without hardcoding addresses

---

**DB201 — ORMs (Prisma, TypeORM)** *(3 Credits)*
*Description:* Use ORMs for database operations — Prisma and TypeORM with TypeScript, migrations, and relations. ORMs make database operations type-safe and developer-friendly.

*Classes:*
1. What is an ORM? — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=600s
2. Prisma Setup & Schema — https://www.youtube.com/watch?v=RebA5J-rlwg
3. Prisma Queries & Relations — https://www.youtube.com/watch?v=RebA5J-rlwg&t=300s
4. TypeORM with TypeScript — https://www.youtube.com/watch?v=JaTbzPcyiOE
5. Database Migrations — https://www.youtube.com/watch?v=RebA5J-rlwg&t=600s

*AI Summary:* ORMs bridge the gap between code and databases. Students learn Prisma (the modern favorite) and TypeORM, schema design, type-safe queries, relations, and migrations. ORMs make database operations safer and more productive.

*Related Articles:*
- Prisma — https://www.prisma.io/docs
- TypeORM — https://typeorm.io/
- ORM vs Raw SQL — https://www.prisma.io/dataguide/types/relational/what-is-an-orm

*Quiz (5 questions):*
1. What is an ORM? — **Answer:** Object-Relational Mapping — a library that maps database tables to code objects, allowing you to query databases using your programming language
2. What is a database migration? — **Answer:** A version-controlled script that modifies the database schema (add tables, columns, indexes) in a repeatable, reversible way
3. What is Prisma's schema file? — **Answer:** A declarative file (schema.prisma) that defines your data models, relations, and database connection
4. What are the tradeoffs of using an ORM? — **Answer:** Pros: type safety, productivity, database abstraction; Cons: performance overhead, complex queries can be harder, learning curve
5. What is the N+1 query problem? — **Answer:** When fetching related records causes one query for the parent plus N queries for each child — ORMs can cause this if relations aren't eagerly loaded

---

### Semester 2

**DEV208 — Building GraphQL APIs** *(3 Credits)*
*Description:* Build GraphQL servers — schemas, resolvers, mutations, subscriptions, and federation. GraphQL is the modern alternative to REST for complex data fetching.

*Classes:*
1. What is GraphQL? — https://www.youtube.com/watch?v=ed8SzALpx1Q
2. Schema & Type Definitions — https://www.youtube.com/watch?v=ed8SzALpx1Q&t=300s
3. Resolvers — https://www.youtube.com/watch?v=ed8SzALpx1Q&t=600s
4. Mutations & Subscriptions — https://www.youtube.com/watch?v=ed8SzALpx1Q&t=900s
5. Apollo Server — https://www.youtube.com/watch?v=Y1KNl8m9kSc
6. GraphQL Federation — https://www.youtube.com/watch?v=ed8SzALpx1Q&t=1200s

*AI Summary:* GraphQL lets clients request exactly the data they need. Students learn schema design, resolvers, mutations, subscriptions, Apollo Server, and federation. GraphQL eliminates over-fetching and under-fetching problems of REST.

*Related Articles:*
- GraphQL — https://graphql.org/learn/
- Apollo Server — https://www.apollographql.com/docs/apollo-server/
- GraphQL vs REST — https://www.apollographql.com/blog/graphql-vs-rest/

*Quiz (5 questions):*
1. What is the main advantage of GraphQL over REST? — **Answer:** Clients request exactly the fields they need in a single query, eliminating over-fetching and under-fetching
2. What is a GraphQL resolver? — **Answer:** A function that fetches data for a specific field in the schema — it's the bridge between the query and the data source
3. What is a GraphQL mutation? — **Answer:** An operation that modifies data (create, update, delete) — the GraphQL equivalent of POST/PUT/DELETE in REST
4. What is GraphQL federation? — **Answer:** A way to compose multiple GraphQL services into a single unified graph — essential for microservice architectures
5. What is the N+1 problem in GraphQL and how do you solve it? — **Answer:** Resolving nested fields causes repeated queries; solved with DataLoader for batching and caching

---

**OPS202 — Caching Strategies with Redis** *(3 Credits)*
*Description:* Implement caching — Redis basics, cache invalidation, session storage, and pub/sub. Caching is the simplest way to dramatically improve performance.

*Classes:*
1. What is Caching? — https://www.youtube.com/watch?v=UoABZ5m0qGw
2. Redis Basics — https://www.youtube.com/watch?v=XCsS_NVAa1g
3. Cache Invalidation — https://www.youtube.com/watch?v=UoABZ5m0qGw&t=300s
4. Session Storage with Redis — https://www.youtube.com/watch?v=XCsS_NVAa1g&t=300s
5. Pub/Sub with Redis — https://www.youtube.com/watch?v=XCsS_NVAa1g&t=600s

*AI Summary:* Caching is the most effective performance optimization. Students learn Redis data structures, caching strategies (cache-aside, write-through), invalidation patterns, session storage, and pub/sub messaging. There are only two hard things in CS: cache invalidation and naming things.

*Related Articles:*
- Redis — https://redis.io/docs/
- Caching Strategies — https://www.nginx.com/blog/nginx-caching-guide/
- Cache Invalidation — https://martinfowler.com/bliki/CacheInvalidation.html

*Quiz (5 questions):*
1. What is Redis? — **Answer:** An in-memory data store used as a database, cache, and message broker — known for sub-millisecond response times
2. What are the main caching strategies? — **Answer:** Cache-aside (lazy loading), write-through, write-behind, and read-through
3. Why is cache invalidation hard? — **Answer:** Knowing when cached data is stale requires tracking all data changes — getting it wrong means serving stale data
4. What is a cache stampede? — **Answer:** When many requests miss the cache simultaneously and all hit the database — prevented with locking or probabilistic early expiration
5. What Redis data structures do you know? — **Answer:** Strings, lists, sets, sorted sets, hashes, bitmaps, hyperloglogs, and streams

---

**ARC202 — Message Queues (RabbitMQ, Kafka)** *(3 Credits)*
*Description:* Asynchronous communication — message brokers, event-driven architecture, and stream processing. Message queues decouple services and handle traffic spikes.

*Classes:*
1. What are Message Queues? — https://www.youtube.com/watch?v=57Qr9tk6Uxc
2. RabbitMQ Basics — https://www.youtube.com/watch?v=nFxjaVFRj5E
3. Kafka Fundamentals — https://www.youtube.com/watch?v=JalUUBKdcA0
4. Event-Driven Architecture — https://www.youtube.com/watch?v=57Qr9tk6Uxc&t=300s
5. Stream Processing — https://www.youtube.com/watch?v=JalUUBKdcA0&t=300s

*AI Summary:* Message queues enable asynchronous, decoupled communication between services. Students learn RabbitMQ (traditional message broker), Kafka (distributed streaming platform), event-driven patterns, and stream processing. These are essential for scalable, resilient systems.

*Related Articles:*
- RabbitMQ — https://www.rabbitmq.com/
- Apache Kafka — https://kafka.apache.org/documentation/
- Event-Driven Architecture — https://aws.amazon.com/event-driven-architecture/

*Quiz (5 questions):*
1. What is a message queue? — **Answer:** A communication mechanism where producers send messages and consumers process them asynchronously, decoupling services
2. What is the difference between RabbitMQ and Kafka? — **Answer:** RabbitMQ is a traditional message broker with smart routing; Kafka is a distributed streaming platform optimized for high-throughput, persistent event logs
3. What is a consumer group in Kafka? — **Answer:** A group of consumers that share the work of reading from topic partitions — each partition is read by only one consumer in the group
4. What is event-driven architecture? — **Answer:** An architecture where services communicate by emitting and reacting to events, rather than direct synchronous calls
5. What is dead letter queue? — **Answer:** A queue for messages that couldn't be processed — used for debugging, retrying, or alerting on failed messages

---

**ARC204 — Software Architecture Patterns** *(3 Credits)*
*Description:* Common patterns — MVC, layered architecture, event sourcing, CQRS, and hexagonal architecture. Understanding patterns helps you choose the right architecture for each problem.

*Classes:*
1. MVC Pattern — https://www.youtube.com/watch?v=HnJ4OJqFlaI
2. Layered Architecture — https://www.youtube.com/watch?v=HnJ4OJqFlaI&t=300s
3. Event Sourcing — https://www.youtube.com/watch?v=kg6mmZaFBPQ
4. CQRS — https://www.youtube.com/watch?v=kg6mmZaFBPQ&t=300s
5. Hexagonal Architecture — https://www.youtube.com/watch?v=HnJ4OJqFlaI&t=600s

*AI Summary:* Architecture patterns are proven solutions to common problems. Students learn MVC, layered architecture, event sourcing, CQRS, and hexagonal architecture. Choosing the right pattern depends on complexity, team size, and business requirements.

*Related Articles:*
- Architecture Patterns — https://martinfowler.com/tags/architecture.html
- Event Sourcing — https://martinfowler.com/eaaDev/EventSourcing.html
- CQRS — https://martinfowler.com/bliki/CQRS.html

*Quiz (5 questions):*
1. What is MVC? — **Answer:** Model-View-Controller — separates data (Model), presentation (View), and user input handling (Controller)
2. What is event sourcing? — **Answer:** Storing the state of an application as a sequence of events rather than current state — enabling full audit trails and time-travel debugging
3. What is CQRS? — **Answer:** Command Query Responsibility Segregation — separating read and write operations into different models for optimization
4. What is hexagonal architecture? — **Answer:** Ports and Adapters pattern — the core business logic is isolated from external concerns (DB, UI, APIs) via interfaces
5. When should you use CQRS? — **Answer:** When read and write workloads have different performance requirements, or when you need separate read/write models for complex domains

---

**QA202 — Backend Testing Strategies** *(3 Credits)*
*Description:* Test databases, APIs, and services — mocking, integration testing, and load testing. Backend testing ensures your services are reliable under real-world conditions.

*Classes:*
1. API Testing — https://www.youtube.com/watch?v=FnjRjc-xqp0
2. Database Testing — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=300s
3. Mocking External Services — https://www.youtube.com/watch?v=nz0j4SDEes0
4. Integration Testing — https://www.youtube.com/watch?v=FnjRjc-xqp0&t=600s
5. Load Testing with k6 — https://www.youtube.com/watch?v=23pGK3s_Qjk

*AI Summary:* Backend testing is more complex than frontend testing. Students learn API testing, database testing, mocking external services, integration testing, and load testing. Reliable backends require comprehensive test coverage.

*Related Articles:*
- Backend Testing — https://www.browserstack.com/guide/backend-testing
- k6 Load Testing — https://k6.io/docs/
- Testcontainers — https://www.testcontainers.org/

*Quiz (5 questions):*
1. What is the difference between unit and integration testing for APIs? — **Answer:** Unit tests individual functions in isolation; integration tests the full API endpoint with database and dependencies
2. What is Testcontainers? — **Answer:** A library that spins up real Docker containers (databases, caches) for integration testing — more realistic than mocking
3. What is load testing? — **Answer:** Testing how a system performs under expected and peak traffic — measuring response times, throughput, and error rates
4. Why mock external services in tests? — **Answer:** To make tests fast, reliable, and independent of third-party availability — you control the responses
5. What is a test pyramid? — **Answer:** The ideal distribution of tests: many unit tests at the base, fewer integration tests in the middle, and fewest E2E tests at the top

---

## YEAR 300 — ADVANCED BACKEND & SYSTEMS

**Goal:** Master distributed systems, cloud infrastructure, and advanced architecture. Think like a staff engineer.

### Semester 1

**ARC301 — System Design Fundamentals** *(3 Credits)*
*Description:* Design scalable systems — load balancing, caching, CDNs, databases, and tradeoff analysis. System design is the most important skill for senior backend engineers.

*Classes:*
1. System Design Interview Framework — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ
2. Load Balancing — https://www.youtube.com/watch?v=na6XaEWd6VE
3. Caching Strategies — https://www.youtube.com/watch?v=UoABZ5m0qGw
4. Database Scaling — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=900s
5. CDN & Edge Computing — https://www.youtube.com/watch?v=6N1P8cJfVpE

*AI Summary:* System design is about making architectural tradeoffs. Students learn load balancing, caching, database scaling, CDNs, and the framework for approaching any system design problem. This is what separates senior from staff engineers.

*Related Articles:*
- System Design Primer — https://github.com/donnemartin/system-design-primer
- High Scalability — https://highscalability.com/
- System Design Interview — https://www.byte-by-byte.com/system-design-interview/

*Quiz (5 questions):*
1. What is the CAP theorem? — **Answer:** In a distributed system, you can only guarantee two of three: Consistency, Availability, Partition Tolerance
2. What is horizontal vs vertical scaling? — **Answer:** Horizontal: adding more machines; vertical: adding more resources (CPU, RAM) to a single machine
3. What is a load balancer? — **Answer:** A device/service that distributes incoming traffic across multiple servers to prevent overload and improve availability
4. What is database replication? — **Answer:** Copying data from a primary database to one or more replicas for read scaling and high availability
5. What is a CDN? — **Answer:** Content Delivery Network — a distributed network of servers that serves content from the location closest to the user, reducing latency

---

**OPS301 — Cloud Computing (AWS/GCP Foundations)** *(3 Credits)*
*Description:* Cloud infrastructure — compute, storage, networking, IAM, and cost optimization. Cloud is where modern backends live.

*Classes:*
1. Cloud Computing Basics — https://www.youtube.com/watch?v=4Yyn7oTz3hI
2. AWS Core Services — https://www.youtube.com/watch?v=ulprqHHWlng
3. GCP Core Services — https://www.youtube.com/watch?v=4Yyn7oTz3hI&t=300s
4. IAM & Security — https://www.youtube.com/watch?v=ulprqHHWlng&t=300s
5. Cost Optimization — https://www.youtube.com/watch?v=4Yyn7oTz3hI&t=600s

*AI Summary:* Cloud computing is the default deployment model. Students learn AWS and GCP core services (compute, storage, networking), IAM security, and cost optimization. Understanding cloud fundamentals is essential for every backend engineer.

*Related Articles:*
- AWS — https://aws.amazon.com/
- GCP — https://cloud.google.com/
- Cloud Cost Optimization — https://www.cloudzero.com/blog/cloud-cost-optimization/

*Quiz (5 questions):*
1. What are the three main cloud service models? — **Answer:** IaaS (Infrastructure as a Service), PaaS (Platform as a Service), SaaS (Software as a Service)
2. What is IAM? — **Answer:** Identity and Access Management — controlling who can access what resources in your cloud account
3. What is the difference between EC2 and Lambda? — **Answer:** EC2 is a virtual server you manage; Lambda is serverless — you deploy code and AWS handles the infrastructure
4. What is a VPC? — **Answer:** Virtual Private Cloud — an isolated network within your cloud account where you control subnets, routing, and security
5. What are the biggest cloud cost drivers? — **Answer:** Compute instances, data transfer/egress, storage, and managed services — optimizing requires right-sizing and monitoring

---

**OPS303 — Orchestration with Kubernetes** *(3 Credits)*
*Description:* Container orchestration — pods, services, deployments, Helm charts, and cluster management. Kubernetes is the operating system of the cloud.

*Classes:*
1. What is Kubernetes? — https://www.youtube.com/watch?v=s_o8dwzRlu4
2. Pods & Deployments — https://www.youtube.com/watch?v=s_o8dwzRlu4&t=300s
3. Services & Ingress — https://www.youtube.com/watch?v=s_o8dwzRlu4&t=600s
4. ConfigMaps & Secrets — https://www.youtube.com/watch?v=s_o8dwzRlu4&t=900s
5. Helm Charts — https://www.youtube.com/watch?v=s_o8dwzRlu4&t=1200s

*AI Summary:* Kubernetes manages containerized applications at scale. Students learn pods, deployments, services, ingress, ConfigMaps, secrets, and Helm charts. Kubernetes is complex but essential for production-grade deployments.

*Related Articles:*
- Kubernetes — https://kubernetes.io/docs/home/
- Kubernetes Basics — https://kubernetes.io/docs/tutorials/kubernetes-basics/
- Helm — https://helm.sh/docs/

*Quiz (5 questions):*
1. What is a pod in Kubernetes? — **Answer:** The smallest deployable unit — one or more containers that share storage and network
2. What is a deployment? — **Answer:** A Kubernetes resource that manages pod replicas, handles rolling updates, and enables rollbacks
3. What is the difference between a Service and an Ingress? — **Answer:** Service exposes pods within the cluster (or via NodePort/LoadBalancer); Ingress manages external HTTP/HTTPS routing to services
4. What is a Helm chart? — **Answer:** A package of pre-configured Kubernetes resources — like a template for deploying complex applications
5. What is a ConfigMap vs a Secret? — **Answer:** ConfigMap stores non-sensitive configuration; Secret stores sensitive data (passwords, keys) with base64 encoding

---

**DB301 — Database Optimization & Scaling** *(3 Credits)*
*Description:* Query optimization, connection pooling, replication, sharding, and choosing the right database. Database performance is often the bottleneck.

*Classes:*
1. Query Optimization — https://www.youtube.com/watch?v=-qNSXK7s7_w
2. EXPLAIN & Query Plans — https://www.youtube.com/watch?v=-qNSXK7s7_w&t=300s
3. Connection Pooling — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=1200s
4. Replication & Sharding — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=1500s
5. Choosing the Right Database — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=1800s

*AI Summary:* Database optimization is the highest-impact performance work. Students learn query optimization, EXPLAIN plans, connection pooling, replication, sharding, and database selection. Slow databases kill application performance.

*Related Articles:*
- Query Optimization — https://www.postgresql.org/docs/current/using-explain.html
- Connection Pooling — https://www.pgbouncer.org/
- Database Sharding — https://www.mongodb.com/basics/sharding

*Quiz (5 questions):*
1. What is EXPLAIN in SQL? — **Answer:** A command that shows the query execution plan — which indexes are used, join order, and estimated cost
2. What is connection pooling? — **Answer:** Reusing database connections instead of creating new ones for each request — reduces overhead and improves throughput
3. What is database sharding? — **Answer:** Splitting a database into smaller, independent pieces (shards) distributed across multiple servers for horizontal scaling
4. What is a covering index? — **Answer:** An index that contains all the columns needed for a query — the database can satisfy the query from the index alone without touching the table
5. When should you denormalize a database? — **Answer:** When read performance is critical and the data doesn't change frequently — trading storage efficiency for query speed

---

**SEC302 — Advanced API Security** *(3 Credits)*
*Description:* Rate limiting, API keys, OAuth scopes, input validation, and security headers. Production APIs need defense in depth.

*Classes:*
1. Rate Limiting — https://www.youtube.com/watch?v=mbsmsi7h3r4&t=600s
2. API Keys & OAuth Scopes — https://www.youtube.com/watch?v=996OiexHze0
3. Input Validation Deep Dive — https://www.youtube.com/watch?v=L6BE-U3oy80
4. Security Headers — https://www.youtube.com/watch?v=-LjPRzFR5fA
5. API Security Testing — https://www.youtube.com/watch?v=G6XOKeWGSgY

*AI Summary:* API security requires multiple layers of defense. Students learn rate limiting, API key management, OAuth scopes, deep input validation, security headers, and security testing. Defense in depth means no single point of failure.

*Related Articles:*
- API Security — https://owasp.org/www-project-api-security/
- Rate Limiting — https://www.nginx.com/blog/rate-limiting-nginx/
- Security Headers — https://securityheaders.com/

*Quiz (5 questions):*
1. What is rate limiting? — **Answer:** Restricting the number of requests a client can make in a time period — preventing abuse and protecting resources
2. What are OAuth scopes? — **Answer:** Granular permissions that define what a third-party app can access (e.g., read:email, write:posts)
3. What is the principle of least privilege? — **Answer:** Giving users/services only the minimum permissions they need to perform their function — nothing more
4. What is CORS? — **Answer:** Cross-Origin Resource Sharing — a browser security mechanism that controls which domains can make requests to your API
5. What is a security header? — **Answer:** HTTP headers that add security layers — e.g., Content-Security-Policy, X-Frame-Options, Strict-Transport-Security

---

### Semester 2

**ARC302 — Distributed Systems** *(3 Credits)*
*Description:* Distributed computing concepts — consensus, leader election, distributed caching, and eventual consistency. Distributed systems are how modern tech companies operate at scale.

*Classes:*
1. Distributed Systems Basics — https://www.youtube.com/watch?v=47_NRSauV-s
2. Consensus Algorithms — https://www.youtube.com/watch?v=47_NRSauV-s&t=300s
3. Leader Election — https://www.youtube.com/watch?v=47_NRSauV-s&t=600s
4. Distributed Caching — https://www.youtube.com/watch?v=UoABZ5m0qGw&t=300s
5. Eventual Consistency — https://www.youtube.com/watch?v=47_NRSauV-s&t=900s

*AI Summary:* Distributed systems are inherently complex. Students learn consensus algorithms (Raft, Paxos), leader election, distributed caching, eventual consistency, and the fallacies of distributed computing. Understanding these concepts is essential for building reliable systems at scale.

*Related Articles:*
- Distributed Systems — https://www.distributed-systems.net/
- Fallacies of Distributed Computing — https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing
- Raft Consensus — https://raft.github.io/

*Quiz (5 questions):*
1. What is eventual consistency? — **Answer:** A consistency model where updates will propagate to all nodes eventually, but reads may return stale data in the meantime
2. What is the CAP theorem? — **Answer:** In a distributed system, you can only guarantee two of three: Consistency, Availability, Partition Tolerance
3. What is a consensus algorithm? — **Answer:** A protocol for distributed nodes to agree on a single value or state — e.g., Raft, Paxos
4. What are the fallacies of distributed computing? — **Answer:** False assumptions: network is reliable, latency is zero, bandwidth is infinite, network is secure, topology doesn't change, there is one administrator, transport cost is zero, network is homogeneous
5. What is a distributed lock? — **Answer:** A mechanism to ensure only one process can access a resource at a time across multiple machines

---

**OPS302 — Serverless Architecture (Lambda, Cloud Functions)** *(3 Credits)*
*Description:* Build serverless applications — AWS Lambda, Google Cloud Functions, and serverless frameworks. Serverless lets you focus on code, not infrastructure.

*Classes:*
1. What is Serverless? — https://www.youtube.com/watch?v=47_NRSauV-s&t=1200s
2. AWS Lambda — https://www.youtube.com/watch?v=6N1P8cJfVpE
3. Google Cloud Functions — https://www.youtube.com/watch?v=47_NRSauV-s&t=1500s
4. Serverless Framework — https://www.youtube.com/watch?v=6N1P8cJfVpE&t=300s
5. Serverless Best Practices — https://www.youtube.com/watch?v=6N1P8cJfVpE&t=600s

*AI Summary:* Serverless abstracts away infrastructure management. Students learn AWS Lambda, Cloud Functions, the Serverless Framework, cold starts, and best practices. Serverless is ideal for event-driven workloads but has tradeoffs for long-running processes.

*Related Articles:*
- AWS Lambda — https://aws.amazon.com/lambda/
- Serverless Framework — https://www.serverless.com/
- Serverless Best Practices — https://www.serverless.com/blog/serverless-best-practices

*Quiz (5 questions):*
1. What is serverless computing? — **Answer:** Running code without managing servers — the cloud provider handles provisioning, scaling, and maintenance
2. What is a cold start? — **Answer:** The delay when a serverless function is invoked after being idle — the provider needs to initialize the runtime
3. When should you NOT use serverless? — **Answer:** For long-running processes, predictable high-traffic workloads, or when you need fine-grained infrastructure control
4. What is the Serverless Framework? — **Answer:** An open-source CLI tool for building and deploying serverless applications across multiple cloud providers
5. What are the cost advantages of serverless? — **Answer:** Pay only for actual execution time (per millisecond), no idle costs, and automatic scaling without over-provisioning

---

**DEV302 — gRPC & Protocol Buffers** *(3 Credits)*
*Description:* High-performance RPC — Protocol Buffers, gRPC services, streaming, and code generation. gRPC is the standard for inter-service communication.

*Classes:*
1. What is gRPC? — https://www.youtube.com/watch?v=JvRBNFj0JhE
2. Protocol Buffers — https://www.youtube.com/watch?v=JvRBNFj0JhE&t=300s
3. gRPC Services & Methods — https://www.youtube.com/watch?v=JvRBNFj0JhE&t=600s
4. Streaming in gRPC — https://www.youtube.com/watch?v=JvRBNFj0JhE&t=900s
5. Code Generation — https://www.youtube.com/watch?v=JvRBNFj0JhE&t=1200s

*AI Summary:* gRPC is the high-performance alternative to REST for service-to-service communication. Students learn Protocol Buffers, gRPC service definitions, streaming, and code generation. gRPC is faster, type-safe, and supports bidirectional streaming.

*Related Articles:*
- gRPC — https://grpc.io/docs/
- Protocol Buffers — https://protobuf.dev/
- gRPC vs REST — https://grpc.io/faq/#how-does-grpc-compare-to-rest-apis

*Quiz (5 questions):*
1. What is gRPC? — **Answer:** A high-performance RPC framework by Google that uses HTTP/2 and Protocol Buffers for efficient service-to-service communication
2. What are Protocol Buffers? — **Answer:** A language-neutral serialization format — more compact and faster than JSON or XML
3. What are the four types of gRPC methods? — **Answer:** Unary (single request/response), server streaming, client streaming, and bidirectional streaming
4. Why is gRPC faster than REST? — **Answer:** Uses HTTP/2 (multiplexing, header compression), binary Protocol Buffers (smaller payloads), and persistent connections
5. What is code generation in gRPC? — **Answer:** Automatically generating client and server stubs from .proto service definitions — ensuring type safety across languages

---

**OPS304 — Monitoring & Observability (Prometheus, Grafana)** *(3 Credits)*
*Description:* Monitor applications — metrics, logging, tracing, alerting, and dashboards. You can't improve what you can't measure.

*Classes:*
1. Monitoring vs Observability — https://www.youtube.com/watch?v=1Jb5fjE1YF0
2. Prometheus — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=300s
3. Grafana Dashboards — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=600s
4. Distributed Tracing — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=900s
5. Alerting & On-Call — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=1200s

*AI Summary:* Observability is how you know your system is healthy. Students learn Prometheus for metrics, Grafana for dashboards, distributed tracing, structured logging, and alerting. Production systems without monitoring are time bombs.

*Related Articles:*
- Prometheus — https://prometheus.io/docs/
- Grafana — https://grafana.com/docs/
- Observability — https://opentelemetry.io/docs/

*Quiz (5 questions):*
1. What is the difference between monitoring and observability? — **Answer:** Monitoring checks known metrics against thresholds; observability lets you ask new questions about system behavior without deploying new code
2. What are the three pillars of observability? — **Answer:** Metrics (aggregated numbers), Logs (individual events), and Traces (request flows across services)
3. What is Prometheus? — **Answer:** An open-source monitoring system that collects metrics via a pull model and stores them in a time-series database
4. What is a RED metric? — **Answer:** Rate (requests per second), Errors (failed requests), Duration (response time) — the key metrics for any service
5. What is alert fatigue? — **Answer:** When too many alerts cause engineers to ignore them — prevented by setting meaningful thresholds and reducing noise

---

**ARC304 — Advanced System Design** *(3 Credits)*
*Description:* Design large-scale systems — chat systems, URL shorteners, social feeds, and video streaming. Practice the patterns that power the world's biggest applications.

*Classes:*
1. Designing a URL Shortener — https://www.youtube.com/watch?v=1Jb5fjE1YF0&t=1500s
2. Designing a Chat System — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ
3. Designing a Social Feed — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ&t=300s
4. Designing Video Streaming — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ&t=600s
5. Designing a Search Engine — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ&t=900s

*AI Summary:* Advanced system design combines all previous knowledge into real-world architectures. Students practice designing URL shorteners, chat systems, social feeds, video streaming, and search engines — the systems that power the internet.

*Related Articles:*
- System Design Cases — https://github.com/donnemartin/system-design-primer#system-design-case-studies
- High Scalability Blog — https://highscalability.com/
- Designing Data-Intensive Applications — https://dataintensive.net/

*Quiz (5 questions):*
1. How would you design a URL shortener? — **Answer:** Hash the long URL (base62 encoding), store mapping in a key-value store, redirect on lookup, add TTL for expiration
2. How would you design a real-time chat system? — **Answer:** WebSockets for real-time delivery, message queue for persistence, read/write fan-out for group chats, and presence service for online status
3. What is the fan-out problem in social feeds? — **Answer:** When a user with millions of followers posts, the feed must be updated for all followers — solved with push (write-time) or pull (read-time) models
4. How does video streaming work at scale? — **Answer:** Videos are transcoded into multiple resolutions, stored in a CDN, and delivered via adaptive bitrate streaming (HLS/DASH)
5. What is the key challenge in designing a search engine? — **Answer:** Indexing billions of documents and returning relevant results in milliseconds — solved with inverted indexes and distributed search clusters

---

## YEAR 400 — PROFESSIONAL PRACTICE

**Goal:** Prepare for a successful backend engineering career — interview mastery, infrastructure as code, AI integration, and launching a production service.

### Semester 1

**INT403 — Mastering the Backend Interview** *(3 Credits)*
*Description:* Prepare for backend interviews — system design, coding challenges, database design, and behavioral rounds. Backend interviews are the most technically demanding.

*Classes:*
1. Backend Interview Overview — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ
2. System Design Interviews — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ&t=300s
3. Database Design Questions — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ&t=600s
4. Coding Challenges — https://www.youtube.com/watch?v=8hly31xKli0
5. Behavioral & Architecture Rounds — https://www.youtube.com/watch?v=4Xy1v0k2FhY

*AI Summary:* Backend interviews test system design, database knowledge, coding skills, and architectural thinking. Students learn to approach system design problems, design databases on the whiteboard, solve coding challenges, and communicate architectural decisions clearly.

*Related Articles:*
- Backend Interview Guide — https://www.greatfrontend.com/questions/backend
- System Design Interview — https://www.byte-by-byte.com/system-design-interview/
- Database Interview Questions — https://www.interviewbit.com/database-interview-questions/

*Quiz (5 questions):*
1. How should you approach a system design interview? — **Answer:** Clarify requirements, estimate scale, define APIs, design data model, design high-level architecture, then deep-dive into components
2. What is back-of-the-envelope estimation? — **Answer:** Quick calculations to estimate system requirements (QPS, storage, bandwidth) — shows you think about scale
3. How do you design a database schema for a social media app? — **Answer:** Users, Posts, Comments, Likes, Follows tables with proper indexes, foreign keys, and consideration for read/write patterns
4. What is the most important thing interviewers look for? — **Answer:** How you think, not what you know — structured problem-solving, tradeoff analysis, and communication
5. How do you handle a question you don't know the answer to? — **Answer:** Admit it, explain your thought process, relate it to what you do know, and show how you'd find the answer

---

**OPS401 — Infrastructure as Code (Terraform)** *(3 Credits)*
*Description:* Manage infrastructure with code — Terraform basics, modules, state management, and best practices. IaC is how modern teams manage cloud infrastructure.

*Classes:*
1. What is Infrastructure as Code? — https://www.youtube.com/watch?v=lIaUz2GAqEQ
2. Terraform Basics — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=300s
3. Terraform Modules — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=600s
4. State Management — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=900s
5. Terraform Best Practices — https://www.youtube.com/watch?v=lIaUz2GAqEQ&t=1200s

*AI Summary:* Infrastructure as Code treats infrastructure like software — versioned, tested, and deployed. Students learn Terraform, modules, state management, and best practices. IaC eliminates manual infrastructure management and enables reproducible environments.

*Related Articles:*
- Terraform — https://www.terraform.io/docs
- IaC Best Practices — https://www.terraform.io/docs/cloud/guides/recommended-practices/
- Terraform Modules — https://www.terraform.io/docs/language/modules/

*Quiz (5 questions):*
1. What is Infrastructure as Code? — **Answer:** Managing infrastructure through machine-readable configuration files instead of manual processes — enabling version control, testing, and automation
2. What is Terraform state? — **Answer:** A file that maps your configuration to real-world resources — Terraform uses it to know what to create, update, or destroy
3. Why store Terraform state remotely? — **Answer:** For team collaboration, locking (preventing concurrent modifications), and backup — local state is fragile
4. What is a Terraform module? — **Answer:** A reusable, self-contained package of Terraform configurations — like a function that creates a set of related resources
5. What is terraform plan vs terraform apply? — **Answer:** plan shows what changes will be made without executing them; apply actually makes the changes

---

**DEV403 — AI/ML for Backend Developers** *(3 Credits)*
*Description:* Integrate AI/ML into backend services — model serving, vector databases, and ML pipelines. AI is becoming a standard backend requirement.

*Classes:*
1. AI for Backend Developers — https://www.youtube.com/watch?v=wDBraae1Bjw
2. Model Serving — https://www.youtube.com/watch?v=wDBraae1Bjw&t=300s
3. Vector Databases — https://www.youtube.com/watch?v=wDBraae1Bjw&t=600s
4. ML Pipelines — https://www.youtube.com/watch?v=wDBraae1Bjw&t=900s
5. LLM Integration — https://www.youtube.com/watch?v=wDBraae1Bjw&t=1200s

*AI Summary:* AI integration is becoming a core backend skill. Students learn model serving, vector databases for embeddings, ML pipelines, and LLM integration. Backend engineers who understand AI have a significant career advantage.

*Related Articles:*
- ML for Engineers — https://developers.google.com/machine-learning/guides
- Vector Databases — https://www.pinecone.io/learn/vector-database/
- LLM APIs — https://platform.openai.com/docs/

*Quiz (5 questions):*
1. What is model serving? — **Answer:** Deploying trained ML models as APIs that applications can call for predictions — the bridge between ML and production
2. What is a vector database? — **Answer:** A database optimized for storing and searching high-dimensional vectors (embeddings) — essential for semantic search and AI applications
3. What is an embedding? — **Answer:** A numerical representation of text, images, or other data that captures semantic meaning — used for similarity search
4. What is an ML pipeline? — **Answer:** An automated workflow for data collection, preprocessing, training, evaluation, and deployment of ML models
5. How do you integrate an LLM into a backend service? — **Answer:** Via API calls (OpenAI, Anthropic), handling rate limiting, implementing prompt templates, managing context windows, and caching responses

---

**BE401 — Specialization I** *(3 Credits)*
*Description:* Choose a specialization: FinTech, Distributed Databases, Real-time Systems, or Blockchain. Deep-dive into a niche that differentiates you in the job market.

*Classes:*
1. FinTech Backend Challenges — https://www.youtube.com/watch?v=cnp6Ck8OIiY
2. Distributed Databases — https://www.youtube.com/watch?v=ZS_kXvOafQY&t=2100s
3. Real-time Systems — https://www.youtube.com/watch?v=pnj3Jbho5Ck
4. Blockchain & Smart Contracts — https://www.youtube.com/watch?v=gyMwXuJrbJQ
5. Choosing Your Path — https://www.youtube.com/watch?v=4Xy1v0k2FhY

*AI Summary:* Specialization makes you stand out. Students explore FinTech (payment processing, compliance), distributed databases (Cassandra, CockroachDB), real-time systems (WebSockets, event streaming), and blockchain, then choose one to deep-dive into.

*Related Articles:*
- FinTech Engineering — https://www.stripe.com/blog/fintech-engineering
- Distributed Databases — https://www.cockroachlabs.com/blog/what-is-a-distributed-database/
- Real-time Systems — https://www.ably.com/realtime-systems

*Quiz (5 questions):*
1. What is the biggest backend challenge in FinTech? — **Answer:** Ensuring ACID compliance, handling concurrent transactions safely, meeting regulatory requirements, and preventing fraud
2. What is a distributed database? — **Answer:** A database that stores data across multiple physical locations, providing high availability and horizontal scaling
3. What makes real-time systems challenging? — **Answer:** Low latency requirements, handling concurrent connections, message ordering, and ensuring delivery guarantees
4. What is a smart contract? — **Answer:** Self-executing code on a blockchain that automatically enforces agreement terms when conditions are met
5. How do you choose a specialization? — **Answer:** Based on market demand, personal interest, existing skills, and long-term career goals

---

**BE403 — Advanced Cloud Services** *(3 Credits)*
*Description:* Advanced cloud patterns — serverless orchestration, event-driven architectures, and multi-region deployments. Cloud mastery separates senior engineers.

*Classes:*
1. Serverless Orchestration — https://www.youtube.com/watch?v=6N1P8cJfVpE&t=900s
2. Event-Driven Cloud — https://www.youtube.com/watch?v=57Qr9tk6Uxc
3. Multi-Region Deployments — https://www.youtube.com/watch?v=4Yyn7oTz3hI&t=900s
4. Cloud Native Patterns — https://www.youtube.com/watch?v=4Yyn7oTz3hI&t=1200s
5. Disaster Recovery — https://www.youtube.com/watch?v=4Yyn7oTz3hI&t=1500s

*AI Summary:* Advanced cloud patterns enable global-scale applications. Students learn serverless orchestration (Step Functions), event-driven architectures, multi-region deployments, cloud-native patterns, and disaster recovery planning.

*Related Articles:*
- AWS Step Functions — https://aws.amazon.com/step-functions/
- Cloud Native — https://www.cncf.io/
- Multi-Region Architecture — https://aws.amazon.com/architecture/reference-architecture-diagrams/?multi-region

*Quiz (5 questions):*
1. What is serverless orchestration? — **Answer:** Coordinating multiple serverless functions into a workflow — e.g., AWS Step Functions chaining Lambda functions
2. What is an event-driven cloud architecture? — **Answer:** Services communicate through events (not direct calls) — e.g., S3 upload triggers Lambda, which publishes to SNS
3. What is active-active multi-region? — **Answer:** Running the application in multiple regions simultaneously, with traffic distributed across all regions for high availability
4. What is a blue-green deployment? — **Answer:** Running two identical environments (blue=current, green=new), switching traffic to green when ready — enables instant rollback
5. What is disaster recovery RTO vs RPO? — **Answer:** RTO (Recovery Time Objective): max acceptable downtime; RPO (Recovery Point Objective): max acceptable data loss

---

### Semester 2

**CAP402 — Capstone Project: Scalable Backend Service** *(6 Credits)*
*Description:* Design, build, and deploy a production-ready backend service — with monitoring, testing, and documentation. This is your proof that you can ship real products.

*Classes:*
1. Capstone Kickoff: Finding a Real Problem — https://www.youtube.com/watch?v=Yo2uI6DKeNA
2. Architecture Design — https://www.youtube.com/watch?v=Y-Gl4HEyeUQ
3. Building the Service — https://www.youtube.com/watch?v=L72fhGm1tfE
4. Testing & Monitoring — https://www.youtube.com/watch?v=1Jb5fjE1YF0
5. Deployment & Presentation — https://www.youtube.com/watch?v=r_t6G-i-9a4

*AI Summary:* The capstone is where everything comes together. Students design, build, test, and deploy a production-ready backend service with proper monitoring, documentation, and CI/CD. This project becomes their portfolio centerpiece.

*Related Articles:*
- Production Backend Checklist — https://github.com/elsewhencode/production-backend-checklist
- API Documentation — https://swagger.io/docs/
- Deployment Guide — https://www.terraform.io/docs/cloud/run/applying-changes.html

*Quiz (5 questions):*
1. What are the key phases of the capstone project? — **Answer:** Problem discovery, architecture design, implementation, testing, deployment, monitoring, and presentation
2. How should you validate your backend service? — **Answer:** Unit tests, integration tests, load testing, security scanning, and user acceptance testing
3. What makes a production-ready backend? — **Answer:** Authentication, error handling, logging, monitoring, CI/CD, documentation, rate limiting, and graceful degradation
4. What should your capstone presentation include? — **Answer:** Architecture diagram, API documentation, live demo, test coverage, monitoring dashboards, and lessons learned
5. How will the capstone be evaluated? — **Answer:** Architecture quality, code quality, testing, deployment, monitoring, documentation, and presentation

---

**ETH402 — Ethics in Engineering & Data Privacy** *(3 Credits)*
*Description:* Ethical considerations in backend development — data privacy, GDPR, NDPR, responsible data handling. Backend engineers hold the keys to user data.

*Classes:*
1. Ethics in Backend Engineering — https://www.youtube.com/watch?v=H2cB4J6kXQ4
2. Data Privacy & GDPR — https://www.youtube.com/watch?v=8ZtInClXe1Q
3. NDPR Nigeria — https://www.youtube.com/watch?v=o_982bu32yM
4. Responsible Data Handling — https://www.youtube.com/watch?v=H2cB4J6kXQ4&t=300s
5. Data Breach Response — https://www.youtube.com/watch?v=8ZtInClXe1Q&t=300s

*AI Summary:* Backend engineers are custodians of user data. Students learn GDPR, Nigeria's NDPR, data minimization, encryption, breach response, and ethical data handling. Mishandling data can destroy user trust and result in massive fines.

*Related Articles:*
- GDPR — https://gdpr.eu/
- NDPR Nigeria — https://ndpr.gov.ng/
- Data Privacy — https://www.privacyinternational.org/

*Quiz (5 questions):*
1. What is GDPR? — **Answer:** General Data Protection Regulation — EU law governing data privacy and protection of EU citizens' personal data
2. What is NDPR? — **Answer:** Nigeria Data Protection Regulation — Nigeria's law governing how personal data is collected, processed, and stored
3. What is data minimization? — **Answer:** Collecting only the data you need, keeping it only as long as necessary, and deleting it when no longer needed
4. What should you do in a data breach? — **Answer:** Contain the breach, assess impact, notify affected users and regulators, fix the vulnerability, and document lessons learned
5. What is the right to be forgotten? — **Answer:** A user's right to have their personal data deleted — GDPR and NDPR both include this right

---

**TEAM402 — Mentorship & Technical Leadership** *(3 Credits)*
*Description:* Develop mentorship skills and learn to lead technical teams, conduct architecture reviews, and drive decisions. Leadership is about multiplying impact through others.

*Classes:*
1. Technical Leadership — https://www.youtube.com/watch?v=4Xy1v0k2FhY
2. Architecture Reviews — https://www.youtube.com/watch?v=f4AGAeVe2Jw
3. Mentoring Junior Engineers — https://www.youtube.com/watch?v=c9Wg6Cb_YlU
4. Technical Decision Making — https://www.youtube.com/watch?v=Q7yV9pYl4p8
5. Building Engineering Culture — https://www.youtube.com/watch?v=YBq8T5nYg7Q

*AI Summary:* Technical leadership is about enabling others to do their best work. Students learn architecture reviews, mentoring, technical decision-making, RFC processes, and building engineering culture. Great tech leaders create environments where engineers thrive.

*Related Articles:*
- Staff Engineer — https://staffeng.com/
- Architecture Reviews — https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/
- Technical RFC Process — https://www.ietf.org/about/working-groups/

*Quiz (5 questions):*
1. What makes a good architecture review? — **Answer:** Focused on tradeoffs, not perfection — asking "why this approach?", considering alternatives, and documenting decisions
2. What is an RFC (Request for Comments)? — **Answer:** A written proposal for a technical decision that invites feedback from the team before implementation
3. How do you mentor a junior backend engineer? — **Answer:** Pair program, review their code thoroughly, explain the "why" behind decisions, and create safe spaces for learning
4. What is technical debt and how do you manage it? — **Answer:** The cost of quick-and-dirty solutions; manage it by allocating regular refactoring time, tracking debt, and prioritizing high-impact fixes
5. How do you build an engineering culture? — **Answer:** Through code reviews, tech talks, documentation, psychological safety, celebrating learning from failures, and leading by example
