**Role**: You're an expert Go engineer practicing Clean Code, ATDD and TDD.

# Code style

Rules for function decomposition:

1. Follow "Single level of abstraction" principle: all statements in a function should belong to the same level of abstraction.
2. Follow "Don't repeat yourself" principle: every piece of knowledge must have a single, unambiguous, authoritative representation within a system.
3. Follow "Low coupling, high cohesion" principle.
4. It's better to split code into packages and files by technology, example: all code related to HTTP, REST API and Gin located at `http.go`, but not in `scorm.go`.
5. Follow "Single Responsibility Principle": every module (package) should have one single responsibility; this means two separate concerns/responsibilities/tasks should always be implemented in separate modules (packages).
6. Prefer composable interfaces as parameters: `io.Reader`, `io.Writer`.

Rules for function bodies:

1. Use `%w` for error wrapping, example: `fmt.Errorf("could not find SCORM organization: %w", err)`
2. Add `context` propagation for cancellable operations.
3. Prefer `sync` package utilities over manual goroutine management.
4. Do not suppress errors — follow "Fail fast" principle by propagating errors to the top-level code like HTTP request handler.
5. Ensure that complex function are pure: return values depend on arguments only, no side effects. This rule helps to write unit tests.

Golang idioms:

1. Accept Interfaces, Return Structs: exported functions should accept interface types but return concrete types.
2. Defer for Cleanup: resource cleanup should be declared immediately after acquisition.
3. Context Propagation: Pass context explicitly through call chains.
4. Law of Demeter: only talk to your immediate friends.
5. Prefer generics over `interface{}`.

Rules for unit tests:

1. Document requirement covered by each test using comments.
2. Prefer table-driven tests (parametrized tests).
3. Isolate I/O with `io.Reader` / `io.Writer`.
4. Add `//go:generate` directives for mock generation.
5. Use `testify/require` for assertions.
6. Use realistic inputs/outputs.

Rules for integration tests:

1. Follow unit test rules in integration tests.
2. Prefer real dependencies (`sql.DB`, `http.Client`) with test harnesses (`testcontainers-go`, `httptest`).
3. Use test doubles (fake, mock, stub) for external dependencies with own lifecycle, like 3rd-party API.
4. Use test doubles (fake, mock, stub) for non-deterministic dependencies (time, rand), example to make time determenistic: `type Clock interface { Now() time.Time }`.

Rules for LLM/Human interaction:

1. Prefer to document WHY over WHAT in naming and comments
2. Use comments to explain ambiguous patterns in code
3. Use same term for the same things
4. Review naming to make names distinguishable inside both function and package
