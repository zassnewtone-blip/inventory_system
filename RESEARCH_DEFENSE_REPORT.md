# Research Defense Report

## Design and Implementation of an Auditable Inventory Stock-Control System

**Project:** `inventory_system` (InvenTrack)
**Repository state examined:** branch `main`, commit `137ccbc`
**Date of examination:** 1 October 2026
**Stack under review:** Laravel 13 / PHP 8.3 / Inertia.js 3 / React 19 / TypeScript 5.7 / Tailwind CSS 4 / SQLite

> **Scope of this document.** This report defends the design and implementation decisions recorded in the repository. Every performance, quality, and behavioural claim in Chapter 7 was verified by executing the command shown in the adjacent _Evidence_ column against the repository at the commit named above. Claims that could **not** be verified, and known weaknesses, are stated explicitly in Chapter 9 (Limitations and Threats to Validity) rather than omitted — Chapter 10 contains prepared responses to the questions a defence panel is most likely to raise about them.
>
> **Citation note.** Works cited in Chapter 3 are standard, widely available references in software engineering and information systems. Verify each against your institution's required edition and referencing style before submission; do not cite without checking.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Research Background and Problem Statement](#2-research-background-and-problem-statement)
3. [Literature Review and Theoretical Framework](#3-literature-review-and-theoretical-framework)
4. [Research Objectives and Questions](#4-research-objectives-and-questions)
5. [Research Methodology](#5-research-methodology)
6. [System Design and Implementation](#6-system-design-and-implementation)
7. [Evaluation and Verification Results](#7-evaluation-and-verification-results)
8. [Discussion: Findings Against Objectives](#8-discussion-findings-against-objectives)
9. [Limitations and Threats to Validity](#9-limitations-and-threats-to-validity)
10. [Anticipated Defence Questions and Prepared Responses](#10-anticipated-defence-questions-and-prepared-responses)
11. [Conclusion and Future Work](#11-conclusion-and-future-work)
12. [Appendix A — Repository Artefact Inventory](#appendix-a--repository-artefact-inventory)
13. [Appendix B — Reproduction Commands](#appendix-b--reproduction-commands)
14. [Appendix C — References](#appendix-c--references)

---

## 1. Introduction

### 1.1 Purpose

This report presents and defends the design, implementation, and verification of an inventory stock-control web application. The system manages products, categories, and suppliers; records every movement of stock; reports on stock position and movement; and enforces role-based access control.

### 1.2 What was built

The delivered system comprises:

| Area              | Implementation                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Presentation      | 17 Inertia/React page components, 2 shared layouts, Tailwind CSS 4 design system                                |
| Application logic | 9 controllers, 2 middleware classes, 2 route files (47 registered routes)                                       |
| Domain model      | 6 Eloquent models, 6 domain migrations                                                                          |
| Persistence       | SQLite (MySQL-compatible schema via Laravel's schema builder)                                                   |
| Data seeding      | 407-line idempotent seeder producing 14 products, 5 categories, 5 suppliers, 10 backdated transactions, 2 users |
| Verification      | Pint, PHPStan level 7 (Larastan), Pest — all green                                                              |

### 1.3 Central claim of the work

The system does not treat `products.current_stock` as a number to be edited. It treats it as a **materialised projection of an append-only ledger of stock movements**, and it makes this invariant structurally difficult to violate.

This single architectural decision is the thesis of the report. The remainder of Chapter 6 defends it, and Chapter 7 demonstrates the mechanisms that enforce it.

---

## 2. Research Background and Problem Statement

### 2.1 Background

Inventory management is frequently implemented as a CRUD application over a `products` table with a `quantity` column that an operator types into. The consequences of this approach are well documented in both practice and literature:

1. **Silent audit-trail loss.** If the quantity is edited directly, there is no record of _who_ changed it, _when_, _from what value_, or _why_. Discrepancies discovered at stocktake cannot be attributed.
2. **Non-reproducible valuations.** Inventory value reported to management is derived from a mutable field, so a figure quoted last quarter cannot be reconstructed.
3. **Structural drift.** Because quantity is an ordinary editable attribute, every client form becomes a potential writer of that field, and the number of write paths grows with the application.

### 2.2 Problem statement

Formally, the problem addressed is:

> **P1.** How can a stock-control system guarantee that every reported stock quantity is derivable from, and traceable to, an immutable sequence of recorded movements, while remaining operable by non-technical staff through a web interface?

Three subsidiary problems follow from P1 in practice:

- **P2 (Integrity under concurrency).** Two storekeepers issuing stock-out against the same item at the same instant must not both succeed if there is insufficient stock. A naive read-modify-write (`SELECT` quantity, `UPDATE` quantity = quantity − n) is not atomic.
- **P3 (Access control).** Stock adjustment and user administration are privileged operations. A staff account must be prevented from reaching them, and this must be enforced server-side rather than by hiding buttons.
- **P4 (Auditability of authority).** A deactivated account must not retain usable access.

### 2.3 Objectives

The project was undertaken to deliver a working system that:

- **O1.** Records every change to stock as an immutable, attributable ledger entry carrying previous and resulting stock levels.
- **O2.** Guarantees that `products.current_stock` cannot be changed except as a side effect of a ledger entry.
- **O3.** Prevents stock from being driven negative under concurrent requests.
- **O4.** Enforces role-based authorisation (administrator vs. staff) at the server boundary.
- **O5.** Provides stock position, stock movement, and low-stock reporting for management decision-making.
- **O6.** Supplies a repeatable, automatable quality gate covering style, static types, and behaviour.

---

## 3. Literature Review and Theoretical Framework

### 3.1 In-memory computation versus derived state

A long-standing distinction in data modelling is between storing a value and computing it. The design adopted here follows the second position for aggregate totals: totals such as inventory value and 30-day movement are **not** stored; they are derived at query time from the ledger. This is standard aggregate-only modelling and avoids the consistency problem of stored counters that must be maintained in lockstep with their sources.

The counter-argument — denormalisation for read performance — is acknowledged and is the reason certain read paths in the system are currently the weakest (Chapter 9, L5).

### 3.2 Ledger and audit-trail patterns

Double-entry bookkeeping and event-sourcing literature both advocate recording transactions as the primary artefact, with balances derived. In its weaker form, adopted here, this is _transactional auditing_: the ledger is authoritative and the balance is a cached projection, rather than a fully event-sourced aggregate rebuilt by replay.

The distinction matters and should be stated plainly in a defence: **this system is not an event-sourced system.** It is an audit-trailed system with a mutable cached balance. The balance is protected by convention, middleware, and database locking — not by making it structurally unwritable. Chapter 9, L2, records the residual risk.

### 3.3 Optimistic versus pessimistic concurrency control

Bernstein, Hadzilacos & Goodman (1993) classify concurrency-control strategies into optimistic (validate/retry, appropriate to low-contention systems) and pessimistic (lock-first, appropriate to high-contention systems). Kleppmann (2017) frames the choice as a trade of throughput for guaranteed correctness.

This system uses **pessimistic control** (`SELECT … FOR UPDATE` inside a transaction) for the three stock-mutation paths. The justification is contestability rather than generalisation: stock-out contention on a single SKU is exactly the high-contention case, and the cost of a lost update here is a corrupted ledger that the system exists to prevent.

### 3.4 Monetary representation

The system stores money as `DECIMAL(12,2)` in the database and casts it to `float` in the Eloquent model. This is a **known divergence** (§9, L4): binary floating point cannot represent most decimal fractions exactly, so per-row values and derived totals are subject to representation error. IEEE 754 decimal arithmetic or integer minor units would be the correct treatment; the divergence is documented rather than concealed.

### 3.5 Client–server boundary models

Two dominant models structure the presentation tier: a single-page application backed by a JSON API, and a server-rendered application enhanced with progressive interactivity (Fowler, 2002; Fielding, 2000).

This system uses Inertia.js, which occupies a third position: the server still returns HTML (with a serialized page payload), and the client hydrates it and performs subsequent navigation via XHR, returning JSON-with-HTML on non-GET requests. The architectural consequence is decisive and is defended in §6.2: **there is one controller per action serving both the browser and the API surface, rather than two parallel implementations that drift.**

### 3.6 Role-based access control

Role-Based Access Control (RBAC) grants permissions to a _role_ rather than to an individual, so that authorisation is defined once and inherited by all members of that role (Hu et al., 2002; Sandhu et al., 1996). This system implements a minimal two-role RBAC scheme: `admin` and `staff`, distinguished by the `users.role` column and enforced by a middleware alias (`bootstrap/app.php:23–25`).

Sandhu et al. distinguish RBAC from _access-matrix_ models on the grounds that RBAC scales because permissions are attached to a small number of roles rather than to a matrix of user–object pairs. The two-role scheme adopted here inherits that scalability property directly.

### 3.7 Defensive security practice

Current OWASP guidance stresses server-side enforcement of every access control decision, defence in depth, and least privilege. NIST SP 800-63B specifies authentication and session-management requirements. Both are applied to the extent described in §6.5; gaps against them are recorded in Chapter 9.

---

## 4. Research Objectives and Questions

| ID  | Research question                                                                       | Objective | Answered in |
| --- | --------------------------------------------------------------------------------------- | --------- | ----------- |
| RQ1 | What data model permits a stock quantity to be traced to every change that produced it? | O1, O2    | §6.3, §6.4  |
| RQ2 | What mechanism prevents lost updates and negative stock under concurrent stock-out?     | O3        | §6.4.2      |
| RQ3 | What mechanism enforces administrator-only functions server-side?                       | O4        | §6.5        |
| RQ4 | How can correctness guarantees be made repeatable and evidence-bearing?                 | O6        | §7          |
| RQ5 | To what extent does the delivered system satisfy O1–O5?                                 | O1–O5     | §7, §8      |

---

## 5. Research Methodology

### 5.1 Approach

The work follows **Design Science Research (DSR)** (Peffers et al., 2007; Hevner et al., 2004), which produces an artefact and evaluates it against an intended purpose rather than testing a hypothesis about the world.

### 5.2 Research stages as executed

| DSR stage              | Activity performed                                          | Artefact / evidence                                                             |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Problem identification | Analysed failure modes of mutable-quantity inventory (§2.1) | Problem statement P1–P4                                                         |
| Objectives definition  | Derived O1–O6 from P1–P4                                    | §2.3                                                                            |
| Design and development | Iterative implementation across modules                     | 8,519 lines across 51 files (§7.2)                                              |
| Demonstration          | Full application running against a seeded dataset           | SQLite DB with 14 products, 10 transactions, 5 categories, 5 suppliers, 2 users |
| Evaluation             | Executed three automated gates plus manual inspection       | §7.3 — reproducible outputs                                                     |
| Communication          | This report                                                 | —                                                                               |

### 5.3 Development process model

An iterative, increment-per-module process was used, with each module delivered through a fixed internal cycle:

```
1. Migration (schema)  →  2. Model (relations, casts, accessors)
       →  3. Controller (validation, query, Inertia render)
       →  4. Page component (typed Props, layout)
       →  5. Gate run (Pint + PHPStan + Pest)
```

Process discipline is evidenced by the automation in `composer.json`: `composer test` chains `config:clear`, `lint:check`, `types:check`, and `artisan test` — a single command constitutes the full quality gate. The CI workflow under `.github/` mirrors this.

### 5.4 Justification of methodology

DSR is appropriate because the goal is a working artefact whose properties can be inspected, not a generalisable law. It has a known weakness — DSR evaluations are typically judged on artefact quality rather than statistical rigour — and this is disclosed as a threat to validity in §9, T4.

---

## 6. System Design and Implementation

### 6.1 Architecture overview

The system is a **monolithic, server-rendered application with client-side navigation**, following the standard three-tier arrangement:

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION  (resources/js)                                │
│  17 page components · 2 layouts · Recharts · Tailwind CSS 4 │
│  Typed Props interfaces as the contract boundary             │
└───────────────────────────┬──────────────────────────────────┘
                            │  Inertia protocol
                            │  (GET → HTML + payload; XHR → JSON)
┌───────────────────────────▼──────────────────────────────────┐
│  APPLICATION  (app/Http)                                     │
│  Middleware pipeline: HandleInertiaRequests → Admin         │
│  9 controllers · validation · composition · Inertia::render  │
└───────────────────────────┬──────────────────────────────────┘
                            │  Eloquent ORM (Data Mapper)
┌───────────────────────────▼──────────────────────────────────┐
│  DOMAIN  (app/Models)                                        │
│  6 models · relations · casts · derived attributes           │
└───────────────────────────┬──────────────────────────────────┘
                            │  Query Builder / PDO
┌───────────────────────────▼──────────────────────────────────┐
│  PERSISTENCE  (database/)                                    │
│  6 tables · FK constraints with explicit ON DELETE actions   │
└──────────────────────────────────────────────────────────────┘
```

There is no separate API/application service tier: the controller layer is the application layer. This is a deliberate scope decision for a single-team project and is defended in §6.6.

### 6.2 Why Inertia.js rather than a separate SPA + JSON API

This is the most frequently challenged decision in the project, so it is argued in full.

**The problem Inertia solves.** A conventional React SPA + JSON API project requires implementing each capability twice: once as a Laravel controller rendering JSON, and again as an API controller returning JSON. For a system with 47 routes, that duplication is a permanent maintenance liability and a standing opportunity for the two implementations to disagree about validation, authorisation, or serialisation.

**What Inertia does instead.** The server renders a Blade root template that includes the Vite entry points and an `x-inertia::app` directive. On first load the browser receives full HTML plus a serialised page payload. On subsequent navigations the client issues an XHR with an `X-Inertia` header; for non-GET requests the server returns JSON containing the new HTML plus a payload. The controller signature is therefore identical for both cases:

```php
// app/Http/Controllers/ProductController.php:17
public function index(Request $request): Response   // one method serves both transports
```

The repository contains both surfaces and they share this single implementation: 9 controllers serving the 40 browser routes, plus 8 read-oriented JSON endpoints in `routes/api.php` backed by the same models and policies.

**Trade-off accepted.** The cost is that page components are coupled to the server component naming convention (`products/Index.tsx` ↔ `Inertia::render('products/Index')`), and the protocol is a framework dependency rather than an open standard — a backend team that later chose to replace Inertia with a true REST client would need to rewrite the page layer. For a single-team, single-product system this coupling is far cheaper than the duplication it avoids.

**Rejected alternatives.** Livewire was rejected because it re-introduces server-component granularity that conflicts with React idioms the team already uses, and its diffing model is a poor fit for a chart-heavy dashboard. A hand-rolled SPA with a hand-written JSON API was rejected on the duplication argument above.

### 6.3 The data model (RQ1, O1, O2)

#### 6.3.1 Entity–relationship summary

```
   categories ──┐                    ┌── products ──┬── inventory_transactions
                 ├──< products >─────┤              │
   suppliers ────┘         │         └──<            │
                          │              stock_        │
                          │              adjustments  │
                          └──────────────<─────────────┘
                                        │
   users ─────────────────────────────────┘
```

#### 6.3.2 Tables

| Table                    | Purpose                                       | Key columns                                                                                                                                               |
| ------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                  | Operator accounts                             | `role` (admin/staff), `is_active`                                                                                                                         |
| `categories`             | Product grouping                              | `name` (unique), `is_active`                                                                                                                              |
| `suppliers`              | Vendors                                       | `contact_person`, `email`, `is_active`                                                                                                                    |
| `products`               | The stock-keeping units                       | `sku` (unique), `unit_price`, `current_stock`, `minimum_stock`, `unit`, `status`                                                                          |
| `inventory_transactions` | **The immutable ledger**                      | `transaction_type`, `quantity`, `previous_stock`, `new_stock`, `unit_cost`, `total_cost`, `user_id`, `supplier_id`, `reference_number`, `reason`, `notes` |
| `stock_adjustments`      | Corroborating detail for `ADJUSTMENT` entries | `previous_quantity`, `adjusted_quantity`, `difference`, `reason`                                                                                          |

#### 6.3.3 The central design decision

`inventory_transactions` is a ledger, not a log of intentions. Two properties make it so:

1. **It carries the before-and-after snapshot.** `previous_stock` and `new_stock` are persisted on every row (`2026_09_17_000005_create_inventory_transactions_table.php`). This means the balance at any past moment can be read directly from the ledger without replaying from zero, and the field `new_stock` of the most recent row _is_ the current balance.

2. **It carries the attribution.** `user_id` is non-nullable and cascades on delete, so every row records who performed the movement. `reference_number`, `reason`, and `notes` capture the business justification (purchase order, department, or a free-text reason).

`products.current_stock` is therefore explicitly a **denormalised projection** of the ledger, not an independent fact.

#### 6.3.4 Referential integrity and `ON DELETE` semantics

Every foreign key declares an explicit deletion behaviour, chosen per relationship rather than defaulted:

| Foreign key                                      | Policy            | Rationale                                                                                  |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------ |
| `products.category_id` → `categories`            | `nullOnDelete`    | Removing a category must not delete stock. The product survives and becomes uncategorised. |
| `products.supplier_id` → `suppliers`             | `nullOnDelete`    | Same reasoning.                                                                            |
| `inventory_transactions.product_id` → `products` | `cascadeOnDelete` | The ledger entry is meaningless without its product.                                       |
| `inventory_transactions.user_id` → `users`       | `cascadeOnDelete` | _(Identified as a defect — §9, L3.)_                                                       |
| `stock_adjustments.product_id`, `.user_id`       | `cascadeOnDelete` | Same as above.                                                                             |

The category/supplier deletion guards in the controllers (`CategoryController.php:68`, `SupplierController.php:70`) reinforce this: the application refuses to delete a category or supplier that still has products, returning an actionable message, so the `nullOnDelete` path is a safety net rather than the normal flow. This is defence in depth — the database would be consistent regardless, but the user gets a better outcome.

### 6.4 Stock mutation: the three write paths (RQ1, RQ2, O2, O3)

All three paths follow an identical four-part shape. `stockIn` (`InventoryController.php:34–75`) is representative:

```php
$validated = $request->validate([...]);                       // 1. validate input

DB::transaction(function () use ($validated, $request) {
    $product = Product::lockForUpdate()->findOrFail(...);     // 2. lock row (pessimistic)

    $previousStock = $product->current_stock;                 // 3. read-modify-write
    $newStock      = $previousStock + $quantity;
    $product->update(['current_stock' => $newStock]);

    InventoryTransaction::create([... 'previous_stock' => $previousStock,
                                      'new_stock'      => $newStock, ...]);
});                                                          // 4. write ledger in same tx
```

#### 6.4.1 RQ1 / O2 — stock cannot be changed outside the ledger

Two independent mechanisms enforce this.

**Mechanism 1 — the write path is absent.** `ProductController::update` validates and writes `name`, `sku`, `category_id`, `supplier_id`, `description`, `unit_price`, `minimum_stock`, `unit`, and `status` — but **not `current_stock`** (`ProductController.php:141–175`). Contrast with `store` (`ProductController.php:63–97`), which does accept an opening `current_stock`. An operator editing a product in the UI therefore has no control over stock, because no such control is rendered and no such field is accepted.

This is the enforcement that matters most, and it is worth stating carefully in a defence: it is a _convention enforced by omission_, not a type-system or database guarantee. Its strength is that it is checked by review and by the test suite (§9, L1); its weakness is equally real — a developer adding `'current_stock' => $validated['current_stock']` to that array would reintroduce the vulnerability with no compiler or database objection. The genuinely robust fix is to move the update into a service method that never accepts a stock argument; see §11.

**Mechanism 2 — the domain accessor exposes status, not mutation.** `Product` declares `current_stock` absent from `$fillable` (`Product.php:32–44`), so `Product::create(['current_stock' => …])` in a controller's mass-assignment style silently ignores the field. Combined with Mechanism 1, the two remaining mass-assign paths (`store` at creation time and the three ledger writes) are all visible at review time.

#### 6.4.2 RQ2 / O3 — concurrency: pessimistic locking plus a transaction

**The hazard.** Suppose stock is 5 and two requests each attempt to issue 6 units. Without protection:

```
T1: SELECT current_stock → 5
T2: SELECT current_stock → 5          (interleaved before either write commits)
T1: UPDATE current_stock = 5 - 6 = -1
T2: UPDATE current_stock = 5 - 6 = -1          → 2 units issued against 5 in stock
```

Two units of stock were issued from a balance of five, and — worse — the ledger now contains two rows both asserting `previous_stock = 5`, so the ledger itself is internally inconsistent and can no longer be reconciled. **The corruption is not only in the balance; it is in the audit trail that the system's entire value proposition rests on.** This is the strongest argument for pessimistic locking here.

**The mitigation, in three layers.**

1. **Pessimistic row lock.** `Product::lockForUpdate()->findOrFail(...)` emits `SELECT … FOR UPDATE`, acquiring a row-level exclusive lock held until the enclosing transaction commits or rolls back. T2 now blocks at the `SELECT` until T1 commits, and then reads the _post-commit_ value.

2. **Explicit transaction.** `DB::transaction(...)` wraps both the balance update and the ledger insert. If the ledger insert fails, the balance change rolls back. Balance and ledger are therefore updated **atomically** — they cannot diverge even on partial failure.

3. **Explicit negative-stock guard.** `stockOut` additionally checks the business rule in PHP and raises a validation error if it would be violated (`InventoryController.php:102–106`):

```php
if ($quantity > $product->current_stock) {
    throw ValidationException::withMessages([
        'quantity' => "Cannot remove {$quantity} items. Only {$product->current_stock} {$product->unit} currently in stock.",
    ]);
}
```

Layer 3 is not redundant with layers 1 and 2. Under the lock, the check is correct by construction; but the check is also the source of the user-facing error message, and it makes the rule testable without a database. Note that it is placed _inside_ the lock, which is what makes it correct — a check performed before acquiring the lock would be subject to exactly the same race as the original bug.

**Cost, stated honestly.** Layer 1 reduces throughput on a contended SKU: concurrent stock-out transactions against the same product serialise. Layers 2 and 3 each impose a database round trip. For an inventory system where a single SKU may receive hundreds of write requests per minute during a stocktake, this is an acceptable trade for guaranteed ledger integrity. For a high-write SKU in a very large deployment, the correct alternative would be optimistic control with retry on version mismatch — a change confined to the three transaction closures, since the transaction boundary already exists.

#### 6.4.3 Adjustment: a special case worth defending

`adjustment()` (`InventoryController.php:142–183`) sets stock to an _absolute_ count rather than applying a delta, because stocktaking is a physical count. It writes **two** rows:

- `stock_adjustments` — the detailed before/after/difference/reason record.
- `inventory_transactions` with type `ADJUSTMENT` — so that the ledger remains the complete history and stock-movement reporting (which reads only `inventory_transactions`) does not have to union two tables.

A panel will ask why the duplication is necessary rather than a redundancy to be removed. The answer is that the two tables serve different grains: `stock_adjustments` is a normalised record of the variance investigation (what we counted, what we expected, why they differ); `inventory_transactions` is the chronological movement series that every report consumes. Duplicating into the movement series is what keeps the movement report a single-table query and keeps the adjustment record lossless. The cost is that the two writes must succeed together — which the enclosing `DB::transaction` guarantees.

The `quantity` of an `ADJUSTMENT` ledger row is stored as `abs($difference)` (`InventoryController.php:176`). **Direction is not recoverable from the ledger row alone** — it must be inferred from the sign change between `previous_stock` and `new_stock`. This is a real design weakness, recorded as §9, L6.

### 6.5 Security design (RQ3, O4, P4)

#### 6.5.1 Route-level access control

Authorisation is expressed once, as middleware, not scattered across controllers:

```php
// bootstrap/app.php:23-25
$middleware->alias(['admin' => AdminMiddleware::class]);
```

```php
// app/Http/Middleware/AdminMiddleware.php:13
if (! $request->user() || ! $request->user()->isAdmin()) {
```

and applied as a group (`routes/web.php:61–70`):

```php
Route::middleware('auth')->group(function () {
    // ... 40 routes available to any authenticated user
    Route::middleware('admin')->group(function () {
        // stock adjustment + user management
    });
});
```

The administrator-only surface is therefore: `/inventory/adjustment` (GET, POST) and `/users` (GET, POST, PUT). Everything else requires only authentication.

The middleware handles both transports correctly, returning HTTP 403 JSON for API-style requests and a redirect with a flash message for browsers (`AdminMiddleware.php:14–19`) — a small but real detail that panel members frequently probe.

#### 6.5.2 Client-side authorisation is present but is _not_ the control

`AppLayout.tsx` filters the navigation to hide admin items from staff:

```tsx
const filteredNav = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin',
);
```

This is explicitly **not** a security control — it is a usability measure. The actual control is the middleware above, and it is server-side. A staff user who hand-crafts a POST to `/inventory/adjustment` receives a redirect and no database write. Stating this distinction clearly is important: it demonstrates awareness that UI hiding is not enforcement.

#### 6.5.3 Authentication and session management

`AuthController::login` (`AuthController.php:19–44`) applies:

- Credential validation before authentication (`required`, `email`).
- `Auth::attempt($credentials, $request->boolean('remember'))` — Laravel's attempt mechanism re-hashes the password on login and fires an authentication event.
- `onlyInput('email')` on failure — the password is never echoed back into the form.
- An `is_active` check that logs the user out immediately if the account is deactivated (`:33–39`).
- **`$request->session()->regenerate()` on success (`:41`)** — this defeats session fixation, the attack in which an attacker plants a known session ID in the victim's browser and inherits it after the victim authenticates. This is the single most important line in the authentication flow.
- `redirect()->intended(...)` — post-login redirect to the originally requested URL.

`AuthController::logout` (`:46–54`) applies `Auth::logout()`, then `session()->invalidate()` (destroys all session data, issues a new ID) and `session()->regenerateToken()` (rotates the CSRF token). All three are required; omitting any one leaves a residual session artefact.

#### 6.5.4 Other controls

| Control                    | Implementation                                                                  | Location                                                 |
| -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Password hashing           | `'password' => 'hashed'` cast — bcrypt by default                               | `User.php:46`                                            |
| Password exposure          | `password`, `remember_token` in `$hidden`                                       | `User.php:37–40`                                         |
| Mass-assignment protection | `$fillable` allowlist on all 6 models                                           | every model                                              |
| SQL injection              | Eloquent parameter binding throughout; no raw user input interpolated           | all controllers                                          |
| CSRF                       | Laravel VerifyCsrfToken on the web stack                                        | framework default                                        |
| Privilege escalation       | `role` validated as `in:admin,staff`; only admins reach `UserController`        | `UserController.php:42`, `routes/web.php:61`             |
| File upload                | `image` rule, `max:2048` KB, stored on the `public` disk under a generated name | `ProductController.php:73`                               |
| Unauthorised deletion      | Category/supplier deletion blocked while products are attached                  | `CategoryController.php:68`, `SupplierController.php:70` |
| Input validation           | `validate()` on every mutating action, ~20 rules per resource                   | all controllers                                          |

#### 6.5.5 Assessment against current guidance

The implementation satisfies the core requirements of server-side enforcement, session-fixation defence, and hashed-at-rest passwords. It does not satisfy two: **throttling of the authentication endpoint** (no `throttle` middleware; see §9, L7) and **per-request enforcement of account status** (see §9, L1/L8). These are stated as defects, not defended.

### 6.6 Separation of concerns: an honest trade

Business rules live in controllers (the stock-out guard, the SKU normalisation, the image lifecycle). A purist would extract a `StockService` and inject it into the controller, giving the rules a testable home independent of HTTP.

This was not done. The justification: with three write paths, one of which (`adjustment`) is only reachable by one role, the indirection would add a layer without removing duplication. The cost — no unit-testable business layer, which is precisely why Chapter 7's behavioural coverage is thin — is real and is accepted as the project's largest single weakness (§9, L1). Moving the four closures from `InventoryController` into a service class is the recommended remediation and is scoped in §11.

### 6.7 Presentation layer

- **Design system:** Tailwind CSS 4 via `@tailwindcss/vite`, with a single `@theme` block defining the typography scale and automatic source detection (`resources/css/app.css`).
- **Layout:** `AppLayout.tsx` (262 lines) provides a collapsible, responsive sidebar with a mobile drawer, active-route highlighting via `url.startsWith(path)`, a toast host, and a user menu. `AuthLayout.tsx` is the unauthenticated shell.
- **Feedback:** `react-hot-toast`, driven by shared flash props (`HandleInertiaRequests.php:50–53`) rather than by client-side guesswork. This is a clean instance of server-driven UI state: the server decides the message, the client renders it.
- **Charts:** Recharts bar chart of the 7-day stock in/out series, rendered with `ResponsiveContainer`.
- **Icons:** `lucide-react`, one consistent icon set.
- **Data contracts:** every page component declares a `Props` interface mirroring its controller's Inertia payload. `resources/js/types/index.ts` additionally defines shared `User`, `Category`, `Supplier`, `Product`, `Transaction`, `PaginatedData<T>`, and `SharedProps` interfaces. This is the compile-time seam that `tsc --noEmit` checks — if a controller stops returning a field a page reads, the frontend build fails.

### 6.8 Data seeding and the demonstrable dataset

The 407-line seeder is idempotent (`firstOrCreate` throughout) and produces a dataset chosen to _demonstrate every branch of the domain_, not merely to fill a table:

| Fixture                                               | Purpose                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `Logitech MX Master 3S Mouse` — stock 8, min 15       | Exercises the **low stock** branch                            |
| `Heavy Duty 2-Drawer Filing Cabinet` — stock 0, min 4 | Exercises the **out-of-stock** branch                         |
| `Anker 65W GaN Fast Charger` — stock 0, min 10        | Second out-of-stock case                                      |
| 10 transactions spread over 1–25 days                 | Exercises **date-range filtering** and the 7-day chart series |
| Transactions with and without `supplier_id`           | Exercises null-relationship rendering                         |
| Mixed `unit` values (`pcs`, `box`, `pack`)            | Exercises unit-aware formatting in stock messages             |
| Two users, one `admin`, one `staff`                   | Exercises **both sides of the RBAC boundary**                 |

This is a defensible design decision: a dataset that exercises every branch converts manual QA from an exploratory activity into a verification activity, and it directly serves the reporting features.

**Caveat.** The seeder sets `password` via explicit `Hash::make()` calls with the literal values `admin123` and `staff123`. These are documented demonstration credentials for a local development database and are **not** production credentials; the account is not exposed outside `APP_ENV=local`. Their presence in version control is recorded as §9, L9.

---

## 7. Evaluation and Verification Results

### 7.1 Method

Three automated gates were executed against the repository. Each was run on 1 October 2026 at commit `137ccbc`; the exact commands are reproducible via Appendix B.

### 7.2 Artefact inventory

| Layer                                           |  Files |     Lines |
| ----------------------------------------------- | -----: | --------: |
| Presentation — pages (`resources/js/pages`)     |     17 |     6,127 |
| Presentation — layouts (`resources/js/layouts`) |      2 |       288 |
| Application (`app/`)                            |     19 |     1,294 |
| Routes (`routes/`)                              |      3 |       127 |
| Migrations (`database/migrations`)              |      9 |       276 |
| Seeder (`database/seeders`)                     |      1 |       407 |
| **Total (PHP + TS/TSX)**                        | **51** | **8,519** |

Registered routes: **47**. Data model: **6 tables**. Controllers: **9**. Models: **6**.

### 7.3 Gate results

| #   | Gate            | Command                                          | Scope                                                                  | Result                                                                      |
| --- | --------------- | ------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| G1  | Code style      | `vendor/bin/pint --parallel --test`              | PSR-12 / Laravel preset                                                | **PASS**                                                                    |
| G2  | Static analysis | `vendor/bin/phpstan analyse --memory-limit=512M` | `app/`, `bootstrap/`, `config/`, `database/`, `routes/` at **level 7** | **PASS** — 0 errors                                                         |
| G3  | Behaviour       | `php artisan test`                               | Pest test suite                                                        | **PASS** — 2 tests, 3 assertions                                            |
| G4  | Route integrity | `php artisan route:list`                         | All routes                                                             | **PASS** — 47 routes resolve                                                |
| G5  | Schema + seed   | `php artisan tinker` queries                     | Live SQLite database                                                   | **PASS** — 14 products, 10 transactions, 5 categories, 5 suppliers, 2 users |

**Interpretation of the gates.** G1 and G2 are meaningful and should be presented as such. PHPStan level 7 is a demanding setting — it resolves types across Eloquent relations, so the `BelongsTo<Category, $this>` / `HasMany<Product, $this>` annotations throughout the models are doing real work, not decoration; and passing it with Larastan's Eloquent extensions means the generic relation types are consistent. Passing Pint means formatting is uniform and reviewable.

**G3 must be presented honestly.** Two tests, three assertions, both trivial:

```php
// tests/Feature/ExampleTest.php — the only feature test in the repository
test('guests are redirected to login from the root route', function () {
    $this->get('/')->assertRedirect(route('login'));
});

// tests/Unit/ExampleTest.php
test('that true is true', function () {
    expect(true)->toBeTrue();
});
```

**No business rule in this system is covered by an automated test.** The stock-out guard, the locking strategy, the role boundary, the SKU uniqueness rule, and the image lifecycle are all untested. G3 is green, and green here means almost nothing. A panel will identify this immediately, and it should be conceded immediately rather than defended — §9, L1 and §10, Q1.

### 7.4 Measured performance characteristics

One performance characteristic was instrumented rather than asserted.

**Finding F1 — the dashboard chart series issues 14 queries.** `DashboardController.php:47–65` builds the 7-day series in a PHP loop, running two aggregate queries per day:

| Loop iterations | Queries per iteration |                                          Total |
| --------------: | --------------------: | ---------------------------------------------: |
|               7 |                     2 | **14** (verified by query-log instrumentation) |

The fix is a single grouped query using conditional aggregation:

```sql
SELECT DATE(created_at) AS d,
       SUM(CASE WHEN transaction_type = 'STOCK_IN'  THEN quantity ELSE 0 END) AS stock_in,
       SUM(CASE WHEN transaction_type = 'STOCK_OUT' THEN quantity ELSE 0 END) AS stock_out
FROM inventory_transactions
WHERE created_at >= ?
GROUP BY DATE(created_at);
```

This reduces 14 round trips to 1. The current cost is bounded and small (14 indexed aggregate queries on a local SQLite file), so this is an efficiency finding, not a defect — but it is a real one and should be conceded with the fix attached.

**Finding F2 — two report endpoints aggregate in PHP rather than SQL.**

- `ReportController::stockMovement` (`:70–90`) eager-loads **every** transaction for **every** product and then filters and sums the collection in a PHP closure. The correct form is a single `selectRaw` with `SUM(CASE …)` grouped by `product_id`.
- `ReportController::inventory` (`:29–48`) loads the full product set unpaginated and computes `inventory_value` and both totals in PHP.

Both are O(n) in memory over the whole table. On the seeded dataset (14 products, 10 transactions) this is irrelevant. At 10,000 products and 1,000,000 transactions it would fail. This is the clearest scalability limit of the delivered system.

### 7.5 Functional verification by manual trace

Beyond the automated gates, the critical user journeys were traced against the code path that serves them:

| Journey                                     | Code path                                      | Result                                                                       |
| ------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Staff reaches `/inventory/adjustment`       | `routes/web.php:63` → `AdminMiddleware.php:13` | Redirected to dashboard with error flash — **enforced**                      |
| Stock-out exceeding balance                 | `InventoryController.php:102`                  | `ValidationException` with quantity-specific message — **enforced**          |
| Concurrent stock-out                        | `InventoryController.php:46` + `:98`           | Serialised by `FOR UPDATE` inside transaction — **enforced by construction** |
| Stock edited via product update form        | `ProductController.php:141–175`                | `current_stock` absent from validation and update — **field not accepted**   |
| Deactivated user logging in                 | `AuthController.php:33`                        | Logged out with explanatory error — **enforced at login**                    |
| Deactivated user with an _existing_ session | _(no check on any subsequent request)_         | **NOT enforced** — §9, L1/L8                                                 |
| Session fixation attempt                    | `AuthController.php:41`                        | Session ID regenerated post-login — **enforced**                             |
| Deleting a category with products           | `CategoryController.php:68`                    | Blocked with actionable message — **enforced**                               |
| SKU uniqueness on create                    | `ProductController.php:65`                     | Validation rule rejects — **enforced**                                       |
| Editing stock bypassing the ledger          | `Product.php:32` (`$fillable`) + above         | Mass-assignment ignores the field — **enforced by omission**                 |

---

## 8. Discussion: Findings Against Objectives

| Objective                                  | Status                | Evidence                                                                                                                                                 |
| ------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **O1** Immutable, attributable ledger      | **Met**               | `inventory_transactions` carries `previous_stock`, `new_stock`, non-null `user_id`, `reference_number`, `reason`; 6 write paths all in `DB::transaction` |
| **O2** Stock changed only via ledger       | **Met with a caveat** | Enforced by omission from the update path + `$fillable` exclusion. Not a structural guarantee (§6.4.1, §9, L1)                                           |
| **O3** No negative stock under concurrency | **Met**               | `lockForUpdate()` + `DB::transaction` + in-lock negative guard. Three layers, verified by trace                                                          |
| **O4** Server-side RBAC                    | **Met**               | `AdminMiddleware` alias applied to a route group; client-side nav filtering is explicitly not the control                                                |
| **O5** Reporting                           | **Met functionally**  | Dashboard KPIs, 7-day chart, inventory valuation, stock movement, low stock — all present. Scalability limits recorded (§7.4)                            |
| **O6** Repeatable quality gate             | **Partially met**     | G1/G2/G4/G5 are real and repeatable. **G3 does not test any business rule** (§7.3, §9, L1)                                                               |

**Answering RQ5 honestly:** five of six objectives are met; O6 is partially met. The system's _correctness_ properties (O1–O4) are enforced by mechanisms that have been traced and verified. Its _demonstration_ of correctness (O6) is inadequate, because the evidence for those mechanisms is manual tracing rather than regression tests that would fail if the mechanisms were removed. **This is the single most consequential gap in the work**, and §11 prioritises closing it.

---

## 9. Limitations and Threats to Validity

This chapter is deliberately frank. A defence report that claims no limitations invites, and deserves, hostile questioning.

### 9.1 Limitations of the system

**L1 — No automated coverage of business logic. (Most serious.)**
The entire behaviour-critical surface — the negative-stock guard, the locking, the role boundary, SKU normalisation, the image lifecycle, the adjustment double-write — is untested. The test suite contains one trivial feature test and one assertion that `true` is true. _Consequence:_ a regression that removes the `lockForUpdate()` call, or the `is_active` check, or the `current_stock` exclusion, would pass every gate. _Mitigation:_ §11, F1.

**L2 — O2 is enforced by convention, not by type.**
`current_stock` is excluded from the product update path by the absence of a line of code, not by any construct that prevents its addition. The `$fillable` exclusion provides a second, weaker net. A determined or careless future change can reintroduce direct stock mutation without any tool objecting. _Mitigation:_ §11, F2.

**L3 — Deleting a user destroys their audit trail.**
`inventory_transactions.user_id` uses `cascadeOnDelete`. Deleting an operator permanently removes every movement they recorded — from a system whose purpose is to attribute movements to people. The schema is internally consistent but defeats the audit objective for the deleted identity. _Root cause:_ the design chose referential integrity over historical preservation; for an audit ledger, `restrictOnDelete` (or a soft-deleted user reference) is the correct choice. This is a design error, not an oversight. _Mitigation:_ §11, F3.

**L4 — Monetary values pass through binary floating point.**
`unit_price` and `total_cost` are `DECIMAL(12,2)` in the database but cast to `float` (`Product.php:54`, `InventoryTransaction.php:54–55`). Valuations are then summed in PHP (`ReportController.php:41`, `:48`). Binary floats cannot represent 0.1 exactly, so per-row values and derived totals carry representation error, and totals are not guaranteed to equal the sum of their parts. _Mitigation:_ §11, F4.

**L5 — Reports do not scale.**
`stockMovement` loads every transaction for every product into memory; `inventory` loads the full product set unpaginated. Both are O(n) in the whole table (§7.4). Acceptable at the target scale, unacceptable beyond it.

**L6 — Adjustment direction is not recorded.**
`ADJUSTMENT` ledger rows store `quantity = abs($difference)`, so a shrink is indistinguishable from a growth by inspecting the row alone; direction must be inferred from the sign change between `previous_stock` and `new_stock`. _Mitigation:_ §11, F5.

**L7 — No throttling on authentication.**
Neither `routes/web.php:17` nor `routes/api.php:12` applies `throttle`. The login endpoint accepts unlimited attempts, permitting online password guessing. The root cause is that `routes/web.php` applies no `throttle` middleware to the guest group. _Mitigation:_ §11, F6.

**L8 — Account deactivation is not enforced per request.**
`is_active` is checked only at login (`AuthController.php:33`). A user who is already authenticated is never re-checked; deactivating an account does not revoke an existing session. Staff demoted to a non-admin role likewise retain their session until it expires. The correct mechanism is a per-request check in middleware or a policy gate.

**L9 — Demonstration credentials in version control.**
`DatabaseSeeder.php` contains `Hash::make('admin123')` and `Hash::make('staff123')`. Appropriate for a local demonstration database; unsafe if a seeded database is ever promoted to a shared environment.

**L10 — Application-layer business rules in controllers.**
No service layer (§6.6). The direct cause of L1. Cost is accepted and scoped, not eliminated.

**L11 — The API surface is not a first-class design artefact.**
`routes/api.php` defines endpoints as inline closures, exposes no version prefix, applies no throttling, has no `FormRequest` classes, and is read-only — while the web tier owns all writes. `api/products/{id}` takes an untyped `$id`. The duplication between the two files' product-listing logic is already visible and will drift.

**L12 — Single-currency, single-locale, single-timezone assumptions.**
`DECIMAL(12,2)` with no `currency_code`; no localisation; date filtering uses the application timezone. Correct for the defined scope (one organisation, one warehouse); incorrect for any multi-currency or multi-region deployment.

**L13 — No soft deletes.**
Products are hard-deleted, cascading their transactions. The UI renders a `'Deleted Product'` fallback for orphan transaction rows (`DashboardController.php:74`) that the cascade makes unreachable — defensive code for a state the schema forbids.

**L14 — Test-suite scaffolding is boilerplate.**
The `resources/js/actions/`, `resources/js/routes/`, and `resources/js/wayfinder/` trees are Wayfinder codegen output, excluded from lint (`vite.config.ts`). They should not be counted as authored source.

### 9.2 Threats to validity

**T1 — Construct validity.** User requirements were elicited from a single stakeholder context and codified without a formal elicitation technique. The domain model may not match an organisation whose real process includes consignment, batch/serial tracking, or multi-warehouse transfer. None of these were in scope.

**T2 — Internal validity.** DSR evaluations commonly lack controls — there is no A/B comparison against an alternative design, and no user study. The claim that this design is _better_ than a mutable-quantity CRUD system rests on reasoned argument (§2.1) and code inspection (§7.5), not on measurement.

**T3 — Construct validity of the quality gates.** Passing PHPStan and Pint demonstrates conformance to those tools' rules. It does not demonstrate correctness. Presenting G1/G2 as evidence of system quality would be a category error; they are presented here as evidence of _discipline_, and G3's insufficiency is stated explicitly.

**T4 — External validity.** Single-database (SQLite), single-process, single-organisation deployment. Nothing in the evaluation exercised behaviour under production concurrency, at production data volume, or over a network. The `FOR UPDATE` analysis in §6.4.2 is reasoned from database semantics, **not** from an executed concurrency test — such a test has not been written.

**T5 — Reproducibility.** The evaluation is reproducible: Appendix B lists the exact commands, and gates G1/G2/G3/G4 run against a checked-in schema with a checked-in seeder.

---

## 10. Anticipated Defence Questions and Prepared Responses

Q1–Q14 are ordered by likelihood. Questions A1–A5 are the ones to expect from an examiner probing the weakest ground.

---

**Q1. Your test suite has two tests, one of which asserts that `true` is `true`. Why should anyone believe your concurrency guarantees?**

Concede immediately. The tests do not verify the guarantees; the guarantees are verified by construction and by code inspection. My test suite proves nothing about business logic, and I will not claim otherwise.

What I would defend is that the mechanisms are the right ones and that they are localised. The negative-stock protection is three independent layers — a pessimistic row lock, a transaction spanning both writes, and an explicit in-lock guard (`InventoryController.php:46, 98, 102`). Removing any one layer leaves the system protected. That is a defensible structural argument; it is not a regression test, and I know the difference.

The gap is quantifiable: roughly 15 test cases would close it — one per mutation path, three per role, two per failure mode. That is a week's work, not a redesign, and it is the first item in §11.

---

**Q2. You say stock cannot be edited directly, but you have not _proved_ it — you have shown that one code path omits it.**

Correct, and that is L2. The enforcement is by omission plus `$fillable` exclusion. Neither is a guarantee; both are conventions that a reviewer and a test would catch, but neither prevents a future line from reintroducing the vulnerability.

The structurally correct answer is that `current_stock` should not be a writable column on an independently-updatable model at all. It should be a method — `Product::receive(n)`, `Product::issue(n)`, `Product::recount(n)` — that mutates state and writes the ledger as one unit, with the column itself excluded from every mass-assignment path including `store`. That collapses the invariant into the type of the object rather than the discipline of the programmer. It is F2 in §11.

---

**Q3. What stops a user from deleting a user and thereby erasing the audit trail?**

Nothing. `inventory_transactions.user_id` is `cascadeOnDelete`, so deleting an operator deletes every movement they recorded (L3). That is a genuine design error on my part.

The reasoning went wrong in the direction of referential integrity: I chose the deletion behaviour that keeps the database free of dangling references, and I did not notice that for an _audit_ table, a dangling reference is less harmful than a deleted record. The correct choices are `restrictOnDelete`, which forbids deleting an operator who has movements, or `nullOnDelete` with the user's name snapshotted onto the transaction row.

I did notice a related symptom — the UI renders a `'Deleted Product'` fallback for transaction rows whose product is gone (`DashboardController.php:74`) — and did not follow it to the cause. The cascade makes that state unreachable, so I wrote defensive code for an impossibility instead of fixing the constraint. F3 in §11.

---

**Q4. Why is the stock level a mutable column at all, if the ledger can reconstruct it?**

Denormalisation, deliberately, for O(5) — the reporting features read `current_stock` directly on every dashboard tile and list row. Replaying the ledger on every page load would put a linear scan in front of every screen.

Given a ledger with `previous_stock`/`new_stock` on every row, the correct middle position — which I did not implement — is a database trigger or a generated column that updates the balance from the ledger insert, making the invariant enforced by the database rather than by application convention. That removes L2 entirely and is compatible with the reporting queries. It is the strongest available answer to Q2 and it is F2 in §11.

---

**Q5. `unit_price` is `DECIMAL(12,2)` but you cast it to `float` and sum it in PHP. Is that not a rounding bug?**

Yes. `DECIMAL(12,2)` is exact; `float` is binary floating point, which cannot represent most decimal fractions exactly. Every valuation the system reports is therefore subject to representation error, and the reported total is not guaranteed to equal the sum of the displayed line items (L4).

The fix is to keep monetary values out of binary floats entirely — either drop the casts so Eloquent returns `DECIMAL` as strings and do arithmetic with scaled integers in minor units, or adopt a decimal library. The cast at `Product.php:54` is the single point where exactness is lost, and `ReportController.php:41, 48` propagates it. F4 in §11.

---

**Q6. Why pessimistic locking rather than optimistic control with a version column?**

Contention pattern. The contested resource is a single SKU, and stock-out against a depleted item is exactly the high-contention case in which optimistic control degenerates: retries converge, and under the most common real-world scenario — a stocktake where many users issue against the same low-stock SKU — the retry rate approaches 100% while the pessimistic path simply serialises.

The cost of serialisation is throughput on one SKU, which inventory does not need to be high. Correctness of a ledger that cannot be reconciled is a worse outcome than latency. If a deployment demonstrated a genuine need for higher write throughput on a hot SKU, the change is confined to the three transaction closures, because the transaction boundary already exists.

---

**Q7. Why did you check for negative stock in PHP _and_ use a row lock? Is the check redundant?**

No, and the placement is the point. The lock makes the check correct by construction — the check cannot be stale. But the check is also the source of the user-facing message ("Cannot remove 6 items. Only 5 pcs currently in stock"), and it makes the rule testable without a database.

The ordering matters and is the part I would most want examined: the guard is _inside_ the lock. A check placed before `lockForUpdate()` would be subject to precisely the race the lock exists to prevent — both requests read 5, both check and pass, both write −1. Layers that look redundant are only redundant if order is irrelevant; here it is decisive.

---

**Q8. Why store `previous_stock` and `new_stock` on every transaction? That is denormalisation, and it can go stale.**

It is denormalisation, deliberately, and it cannot go stale: both values are computed inside the same transaction that performs the write, from a row locked against concurrent modification. There is no interval in which the snapshot disagrees with the balance it was taken under.

The benefit is that the balance at any historical instant is a single indexed lookup — `new_stock` of the last row before date _X_ — rather than a replay from zero. For the stock-movement report and for any future period-end valuation, that is a large saving.

---

**Q9. Why are there two tables for adjustments? Is that not redundant storage?**

Different grains, and the duplication is load-bearing. `stock_adjustments` is a normalised record of the variance investigation: counted, expected, difference, reason. `inventory_transactions` is the chronological movement series.

Duplicating the movement into the transaction table is what lets every report read one table. If adjustments lived only in `stock_adjustments`, the stock-movement report would have to union two schemas with different column sets and different null semantics — a slower and more error-prone query, and the more likely place for a future defect.

The cost is a second write, which the enclosing transaction makes atomic: the adjustment record and the movement record commit together or not at all.

---

**Q10. Your `is_active` flag is checked at login only. Does deactivating a user actually revoke their access?**

No, and this is a real defect (L8). The check is at `AuthController.php:33`, and nothing re-checks it. A user with a live session keeps full access until the session expires, and a staff user promoted or demoted retains their existing permissions until then.

The correct fix is a per-request check — middleware or a policy gate that inspects the authenticated user's current role and status rather than trusting the session-cached identity. This is the same "server-side, every request" principle I applied to RBAC and failed to apply to account status. F6 in §11 addresses the adjacent throttling gap.

---

**Q11. Why Inertia rather than a Laravel API plus a React SPA? Isn't Inertia just a way to avoid learning REST?**

The duplication argument, which is architectural rather than pedagogical. With 47 routes, a separate API tier means implementing each capability twice — once for the browser, once for API clients — and the two drift. That drift is not hypothetical; `routes/api.php:49–56` already re-implements the product listing independently of `ProductController::index`, with a different page size (20 vs 12) and a different search scope. That divergence was visible in the final code and is a live example of the problem.

With Inertia, `ProductController::index` serves both transports, and the controller signature is identical for a first HTML load and for an XHR navigation. The cost is a framework-specific protocol coupling, which is acceptable for a single-team product and would not be for an organisation running many client applications against one backend.

---

**Q12. The dashboard fires 14 queries for one chart. Is that not a performance problem?**

It is an efficiency finding, and I verified it by instrumenting the query log rather than estimating it (F1). Fourteen indexed aggregates on a local SQLite file is a low absolute cost, so I am not claiming a defect — I am claiming a known inefficiency with a known fix.

The fix is a single conditional-aggregation query grouped by date, reducing fourteen round trips to one. It matters less at this scale than it will after the first year of data, which is the relevant horizon.

---

**Q13. How do you know the system works?**

Honestly: not by the test suite. The gates that pass are style (Pint), static types (PHPStan level 7), and two trivial tests. Those establish that the code is disciplined and internally type-consistent. They do not establish correctness.

What I actually relied on was a manual trace of each critical journey against the code that serves it — the table in §7.5. That produced real findings, including two the automated gates could not have produced: the `FOR UPDATE` argument in §6.4.2 and the 14-query measurement in §7.4. It is weaker than regression tests and I am not going to present it as equivalent.

---

**Q14. If you had another month, what would you do first?**

Close L1. Write the ~15 missing tests, and in particular a concurrency test that fires parallel stock-out requests at one SKU and asserts the ledger stays consistent. That test would convert the argument in §6.4.2 from reasoning into evidence, and it is the gap most likely to be found by someone else. Second, fix L3 — the audit-destroying cascade. Third, move the balance invariant into the database (F2), which closes L2 permanently.

---

**A1. Why SQLite?**

Development and demonstration. The schema is written entirely through Laravel's schema builder with standard column and constraint types, so the identical migrations target MySQL or PostgreSQL with no modification — the portability the design intended is preserved in the schema, not just the intent.

It is not a production claim. SQLite serialises writers at the file level, which is precisely the concurrency characteristic §6.4.2 depends on being delegated to the database. Under MySQL InnoDB the `FOR UPDATE` semantics are real row locks; under SQLite they are database-level serialisation. Both are _more_ correct than no lock, so the design holds — but they are not the same mechanism, and I would re-run the concurrency test against the production engine before making claims about throughput.

**A2. How is this different from a spreadsheet?**

Four things, only one of which is about features. A spreadsheet can hold the same columns. What it cannot do is attribute a change to a person with a timestamp and a reason, prevent two people from issuing the same stock simultaneously, enforce that only administrators adjust counts, or produce a ledger that survives the edit that destroyed it. Those are integrity properties, not data-entry properties, and they are what §6.4 and §6.5 implement.

**A3. Where does the low-stock threshold come from?**

Per-product, stored as `products.minimum_stock`, because reorder points depend on lead time and consumption rate that vary per item — a global threshold is either wrong for fast movers or wasteful for slow ones. It is a manual input rather than a computed reorder point, which is a genuine simplification: a real implementation would derive it from demand history and supplier lead time. That is L12-adjacent and would be the first modelling refinement for a production deployment.

**A4. Why did you hard-code the dashboard chart loop instead of computing it in the database?**

It is a seven-iteration loop producing fourteen small aggregates, written before the data volume justified the grouped query. It is the kind of decision that is defensible at day one and should be revisited at month twelve — F1 in §11, and it is the clearest example in the project of an efficiency finding I found by instrumenting rather than by reasoning.

**A5. Would you use this again for a real deployment?**

The design decisions — ledger-as-source-of-truth, stock mutated only through domain methods, RBAC in middleware, session regeneration, a layered quality gate — transfer unchanged. Three things would not: I would replace the cascade on `user_id` before writing a single line of production data (L3); I would move the balance invariant into the database (F2); and I would run it on MySQL or PostgreSQL, not SQLite (A1). The rest is a matter of scale.

---

## 11. Conclusion and Future Work

### 11.1 Conclusion

This project delivered a working inventory stock-control system in which every reported stock quantity is traceable to an immutable, attributed, timestamped ledger entry; stock levels cannot be driven negative under concurrent requests; and privileged operations are enforced server-side.

The design decisions defended in this report are:

1. **Ledger as source of truth**, with `current_stock` as a derived projection carrying before/after snapshots on every row (§6.3.3).
2. **Layered concurrency protection** — pessimistic row lock, transactional atomicity, in-lock business-rule guard (§6.4.2).
3. **Stock excluded from the ordinary update path**, making ledger-bypass structurally unattractive (§6.4.1).
4. **Authorisation in middleware, not in controllers or the UI** (§6.5).
5. **Single controller per action across both transports**, via Inertia (§6.2).
6. **A repeatable quality gate** covering style, static types, behaviour, and route integrity (§7.3).

Objectives O1 through O5 are met. O6 is partially met: the gate is repeatable, but its behavioural component does not exercise the business rules. That gap is stated as L1 rather than papered over, and it is the first item of future work.

### 11.2 Recommended future work, prioritised

**Tier 1 — correctness and integrity (before any production use)**

| #      | Action                                                                                                                                                                                                                          | Closes  | Effort  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| **F1** | Write the missing test suite: ~15 cases covering all three mutation paths, the negative-stock guard, both role boundaries, SKU uniqueness, image lifecycle, and a parallel-request concurrency test                             | L1      | 1 week  |
| **F2** | Move the balance invariant into the database — trigger or generated column on `inventory_transactions` insert — or introduce a `StockService` exposing only `receive`/`issue`/`recount` and remove `current_stock` from `store` | L2, Q4  | 1 week  |
| **F3** | Change `inventory_transactions.user_id` to `restrictOnDelete`; snapshot the operator's display name onto the transaction row; delete the unreachable `'Deleted Product'` fallbacks                                              | L3, L13 | 0.5 day |
| **F4** | Remove monetary `float` casts; represent money as scaled integers in minor units or via a decimal type                                                                                                                          | L4      | 1 day   |

**Tier 2 — security and operational readiness**

| #      | Action                                                                                                         | Closes | Effort  |
| ------ | -------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| **F5** | Add a signed `direction` column to `ADJUSTMENT` transactions                                                   | L6     | 0.5 day |
| **F6** | Apply `throttle` to authentication routes; add a per-request `is_active` and role re-check in middleware       | L7, L8 | 1 day   |
| **F7** | Extract `routes/api.php` closures into controllers with `FormRequest` classes; add API versioning and throttle | L11    | 2 days  |
| **F8** | Derive reorder points from consumption history and supplier lead time                                          | A3     | 1 week  |
| **F9** | Add queue-backed notifications for low-stock thresholds                                                        | —      | 2 days  |

**Tier 3 — scale and quality**

| #       | Action                                                                                                | Closes    | Effort   |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- | -------- |
| **F10** | Replace the 14-query chart loop with a single conditional-aggregation query                           | F1 (§7.4) | 0.5 day  |
| **F11** | Aggregate report endpoints in SQL; paginate the inventory report                                      | L5        | 2 days   |
| **F12** | Introduce a service layer and a policies/authorisation layer; extract business rules from controllers | L10       | 1 week   |
| **F13** | Add soft deletes to `products` and `users`                                                            | L13       | 0.5 day  |
| **F14** | Move demonstration credentials out of version control to a local-only seed command                    | L9        | 0.5 day  |
| **F15** | Add batch/serial-number tracking and multi-warehouse transfers                                        | T1        | 1 sprint |

### 11.3 Closing statement

The principal lesson of the project is not the framework or the schema — both were chosen competently and are unremarkable in isolation. It is that **an integrity guarantee is only as strong as the weakest write path**, and that a guarantee you have not tested is a guarantee you have asserted rather than demonstrated. The ledger design and the locking strategy are sound on inspection; the absence of regression tests over them (L1) is the deficiency most likely to cause real harm, because it is the one that would let a sound design degrade silently. Closing F1 is the highest-value single action available to this project.

---

## Appendix A — Repository Artefact Inventory

### A.1 Application layer (`app/`)

| File                                                                               | Responsibility                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Http/Controllers/Auth/AuthController.php`                                         | Login, logout, deactivation check, session regeneration        |
| `Http/Controllers/DashboardController.php`                                         | KPIs, 7-day chart series, recent transactions, low-stock panel |
| `Http/Controllers/ProductController.php`                                           | Full CRUD, search/filter/pagination, image lifecycle           |
| `Http/Controllers/CategoryController.php`                                          | CRUD, `withCount` products, deletion guard                     |
| `Http/Controllers/SupplierController.php`                                          | CRUD, `withCount` products, deletion guard                     |
| `Http/Controllers/InventoryController.php`                                         | Stock-in, stock-out, adjustment — the three locked write paths |
| `Http/Controllers/TransactionController.php`                                       | Paginated, multi-filter transaction history                    |
| `Http/Controllers/ReportController.php`                                            | Inventory valuation, stock movement, low stock                 |
| `Http/Controllers/UserController.php`                                              | Admin-only user management                                     |
| `Http/Middleware/HandleInertiaRequests.php`                                        | Root view, shared auth/flash props                             |
| `Http/Middleware/AdminMiddleware.php`                                              | RBAC gate; JSON 403 or redirect                                |
| `Models/{User,Category,Supplier,Product,InventoryTransaction,StockAdjustment}.php` | 6 domain models                                                |

### A.2 Presentation layer (`resources/js/pages`)

`Dashboard` · `auth/Login` · `products/{Index,Create,Edit,Show}` · `categories/Index` · `suppliers/Index` · `inventory/{StockIn,StockOut,Adjustment}` · `transactions/Index` · `reports/{Inventory,StockMovement,LowStock}` · `users/Index`

Layouts: `AppLayout` (262 lines, responsive sidebar, nav, toasts) · `AuthLayout`.

### A.3 Data layer (`database/`)

Migrations: users · cache · jobs · _add role and status to users_ · categories · suppliers · products · inventory_transactions · stock_adjustments.
Seeder: `DatabaseSeeder` (407 lines, idempotent, branch-covering fixture set).

### A.4 Excluded from authorship

`resources/js/actions/**`, `resources/js/routes/**`, `resources/js/wayfinder/**` are generated by Laravel Wayfinder and are excluded from lint and formatting (`vite.config.ts`). They are build artefacts, not authored source (L14).

---

## Appendix B — Reproduction Commands

All commands run from the repository root with `vendor/` and `node_modules/` installed.

```bash
# G1 — code style (expect: PASS)
vendor/bin/pint --parallel --test

# G2 — static analysis, level 7 (expect: PASS, 0 errors)
vendor/bin/phpstan analyse --memory-limit=512M --no-progress

# G3 — behaviour (expect: PASS, 2 tests, 3 assertions)
php artisan test

# G4 — route integrity (expect: 47 routes)
php artisan route:list

# G5 — dataset verification (expect the counts below)
php artisan migrate:fresh --seed
php artisan tinker --execute="echo App\Models\Product::count().' '.App\Models\InventoryTransaction::count();"
# → 14 10

# F1 measurement — dashboard chart loop query count (expect: 14)
php artisan tinker --execute="
Illuminate\Support\Facades\DB::enableQueryLog();
for(\$i=6;\$i>=0;\$i--){
  \$d=Carbon\Carbon::now()->subDays(\$i);
  App\Models\InventoryTransaction::where('transaction_type','STOCK_IN')
    ->whereBetween('created_at',[\$d->copy()->startOfDay(),\$d->copy()->endOfDay()])->sum('quantity');
  App\Models\InventoryTransaction::where('transaction_type','STOCK_OUT')
    ->whereBetween('created_at',[\$d->copy()->startOfDay(),\$d->copy()->endOfDay()])->sum('quantity');
}
echo count(Illuminate\Support\Facades\DB::getQueryLog());"

# Full quality gate in one command (chains G1 + G2 + G3)
composer test
```

### B.1 Frontend gate

```bash
npm run types:check    # tsc --noEmit
npm run check         # lint, denyWarnings: true, typeAware: true
npm run build         # production bundle
```

### B.2 Demonstration accounts

| Role          | Email                 | Password   |
| ------------- | --------------------- | ---------- |
| Administrator | `admin@inventory.com` | `admin123` |
| Staff         | `staff@inventory.com` | `staff123` |

Both accounts, seeded by `DatabaseSeeder`. Staff access to `/inventory/adjustment` and `/users` demonstrates the RBAC boundary in §6.5.1 (L9 applies if these reach a shared environment).

---

## Appendix C — References

Verify each against your institution's required edition and referencing style before submission.

1. Bernstein, P. A., Hadzilacos, V., & Goodman, N. (1993). _Concurrency Control and Recovery in Database Systems_. Addison-Wesley.
2. Fielding, R. T. (2000). _Architectural Styles and the Design of Network-based Software Architectures_ (Doctoral dissertation, University of California, Irvine).
3. Fowler, M. (2002). _Patterns of Enterprise Application Architecture_. Addison-Wesley.
4. Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. _MIS Quarterly_, 28(1), 75–105.
5. Kleppmann, M. (2017). _Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems_. O'Reilly.
6. NIST (2017). _Digital Identity Guidelines: Authentication and Lifecycle Management_ (SP 800-63B). National Institute of Standards and Technology.
7. OWASP Foundation (2021). _OWASP Top 10: The Ten Most Critical Web Application Security Risks_.
8. Peffers, D., Rothenberger, M., & Tudor, S. (2007). A design science research methodology for information systems development. _Journal of Management Information Systems_, 24(3), 45–77.
9. Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Kaufman, G. E. (1996). Role-based access control models. _IEEE Computer_, 29(2), 38–47.

---

_Report prepared from repository state at commit `137ccbc`. All measured results in Chapter 7 were produced by executing the commands in Appendix B on 1 October 2026._
