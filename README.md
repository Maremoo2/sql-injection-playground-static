# SQL Injection Playground — client-side simulation (safe)

This is a static, client-side simulation that demonstrates how SQL injection can allow bypasses such as `2+2=4` or `' OR '1'='1`. No server or real database is used — everything runs in the browser. That makes it safe to publish publicly (e.g., via GitHub Pages).

## How to publish
1. Create a new GitHub repo and push these files to `main`.
2. In the repo settings -> Pages, choose the `main` branch and root as the source.
3. Wait a minute, then share the Pages URL on LinkedIn.

### One-click GitHub Pages deploy (CI)
This repo includes a simple GitHub Actions workflow at `.github/workflows/pages.yml` that automatically publishes the repository root to the `gh-pages` branch on each push to `main`. To enable:

1. Push the repo to GitHub.
2. Ensure the Workflow is enabled in the Actions tab (it will have permission to write pages using the built-in GITHUB_TOKEN).
3. After the workflow runs, enable Pages site in repository settings if needed (or GitHub may auto-configure the site to serve from the `gh-pages` branch).

Use the copied Pages URL when sharing the demo on LinkedIn.

## Demo usage
- Try `alice` / `wonderland` to see a normal successful login.
- Try `alice` / `' OR '1'='1` and observe the simulated vulnerable bypass.
- Try `whatever` / `2+2 = 4` to see the math-expression bypass detection.

## Safety & ethics
- This is educational and safe. Do not use this as a replacement for real secure testing.
- Never attempt SQL injection on systems you do not own or have explicit permission to test.

## Want extras?
I can:
- Add a short screencast script for LinkedIn.
- Translate the caption into Norwegian and make a concise post copy.
- Add more simulated injection patterns and a step-by-step explanation page.
# sql-injection-playground-static