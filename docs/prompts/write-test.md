# Tips

Inputs:

1. The file to test + files in the same package
2. Project structure (directories and .go files)
3. Existing unit test files for this file or package
4. `go.mod` contents — module name, Go version, dependencies

# Prompt

**Role**: You're an expert Go engineer practicing Clean Code, ATDD and TDD.

- Read `docs/llm/code-style.md` to get code style rules.
- Read project structure and `go.mod` to understand module decomposition.
- Create or update test list before adding a new test
- Select one of not implemented tests
- Write selected test
- Then run all tests (if possible) and read test run results
