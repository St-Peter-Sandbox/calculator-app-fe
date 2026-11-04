# Calculator App Frontend

Created by ALPHACI as a React app standalone repository.

This starter already includes source files, package scripts, TypeScript, ESLint, Jest coverage, SonarQube metadata, branch protections, and ALPHACI workflow files that match the selected stack. Use it as the first working baseline, then replace the starter code with your application code.

## Project structure

- `src/App.tsx` contains the starter React component.
- `src/main.tsx` and `index.html` provide the Vite app entrypoint; `npm run build` creates the static `dist/` site for Vercel or the container target.
- When Docker scaffolding is enabled, `Dockerfile` serves the same static build with unprivileged Nginx. The ALPHACI pipeline builds and publishes that image when an environment deploys to an on-prem host.
- Commit the `package-lock.json` created by `npm install` so container builds use the same dependency tree.
- `tests/unit/App.spec.tsx` renders the component with `react-dom/server`.

## Branch strategy

| Branch  | Purpose |
|---------|---------|
| main    | Production - pull request required |
| uat     | Integration and test - pull request required |
| dev     | Development integration - pull request required |

Nobody pushes to `dev`, `uat` or `main` directly: open a pull request from a feature branch into `dev`, and promote `dev` to `uat` with a pull request. `main` is reached only through the QA-approved merge in ALPHACI.

## CI/CD

Workflow files live in `.github/workflows/`. The CI pipeline runs on `dev`, `uat` and `main` and on pull requests into them. Open a pull request into `dev` to trigger your first run.

## Getting started

```bash
npm install
npm run lint
npm test
npm run build
```

Create a feature branch, open a pull request into `dev`, and let ALPHACI promote green changes through `uat` to `main`.

## Calculator quiz

Check how well you know the calculator. Open a question to see the answer.

<details>
<summary>1. You press 5, +, 3, =. What does the display show?</summary>

**8.** The equation line above it reads `5 + 3 = 8`.

</details>

<details>
<summary>2. You press 5, +, 3, + without pressing equals. What does the display show now?</summary>

**8.** The calculator works out each step as you chain operations, so the equation line reads `8 +` and waits for the next number.

</details>

<details>
<summary>3. What happens when you divide 20 by 0?</summary>

The display shows **Error** with the message *Cannot divide by zero*. The app keeps running, and typing a new digit starts over.

</details>

<details>
<summary>4. What is the difference between C and AC?</summary>

**C** clears only the number you are typing and keeps the operation in progress. **AC** resets the whole calculation. Neither one erases the history tape.

</details>

<details>
<summary>5. What does 0.1 + 0.2 show?</summary>

**0.3.** Results are rounded to 12 significant digits, so the usual floating point leftover (`0.30000000000000004`) never reaches the display.

</details>

<details>
<summary>6. How do you reuse an answer from an earlier calculation?</summary>

Open **Expand History**, find the calculation on the tape, and press **Recall**. Its result becomes the current number.

</details>