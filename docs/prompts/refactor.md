# Tips

Approach:

1. Incremental Refactoring: Paste <200 LOC chunks for best results
2. Behavior Locking: Add "Verify via test: [TEST NAME]" comments

Inputs:

1. The file to refactor + files in the same package
2. Project structure (directories and .go files)
3. Unit test files for this file or package
4. `go.mod` contents — module name, Go version, dependencies

# Prompt

**Role**: You're an expert Go engineer practicing Clean Code, ATDD and TDD.

- Read `docs/llm/code-style.md` to get code style rules.
- Read project structure and `go.mod` to understand module decomposition.
- Refactor this code while preserving all functionality.
