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

## Notable real-world SQLi incidents (short summaries)
Below are a few well-documented incidents where SQL injection played a role. These are short, factual summaries you can cite when explaining why prevention matters.

- TalkTalk (UK, 2015) — Attackers exploited SQL injection vulnerabilities on public web pages and accessed large numbers of customer records (personal data and some bank details). Official reports and news coverage attribute the breach in part to SQLi on vulnerable endpoints.

- Heartland Payment Systems (2007–2008) — A major payment-card breach where attackers used SQL injection among other techniques to help install malware and exfiltrate payment data. Post-incident analyses highlight SQLi as a contributor to the attack chain.

- Freepik / Flaticon (2020) — The company disclosed that attackers exploited an SQLi issue affecting Flaticon, leading to exfiltration of email addresses and password hashes for millions of users.

- MOVEit / CL0P campaign (2023) — CVEs and active exploitation of Progress MOVEit Transfer allowed attackers to run commands and exfiltrate data across many organizations; incident advisories and vendor reports include SQLi-based vectors in some exploitation chains.

These cases show that SQL injection can enable large-scale data theft, persistent compromises, or enable follow-on actions like web shells and ransomware.

## Is this demo similar to real incidents?
Yes — in spirit. The demo intentionally illustrates the fundamental weakness attackers exploit: untrusted input changing the SQL logic. But there are important differences to be explicit about when you present the demo:

- What this demo shows (accurate):
	- How user input can change the text of a SQL WHERE clause.
	- Simple bypass patterns (e.g., `' OR '1'='1`, arithmetic like `2+2=4`) and why parameterized queries prevent them.

- What this demo does not do (safer / out of scope):
	- It does not run a real database or full exploit chains (no web shells, no network exfiltration).
	- It does not demonstrate advanced techniques like blind/time-based injection, stacked queries, or chaining SQLi into privilege escalation.

## Concrete examples to try in the demo
- `alice / wonderland` — valid credentials; both modes succeed.
- `alice / ' OR '1'='1` — vulnerable sim shows a bypass; safe mode does not.
- `whatever / 2+2 = 4` — vulnerable sim detects a true expression and accepts the login (useful to show how input can change logic).
- `bob / builder` — valid user example.

## Short LinkedIn blurb (English)
“I built a small, safe playground that demonstrates SQL injection without touching any servers. It shows how simple input like `' OR '1'='1` or `2+2=4` can change a query’s logic — and how parameterized queries stop it. Try the demo (client-side only) to learn the basics — and never test systems you don’t own.”

## Kort LinkedIn-tekst (Norsk)
“Jeg har laget en enkel og trygg lekeplass som viser SQL-injeksjon uten servere. Den viser hvordan input som `' OR '1'='1` eller `2+2=4` kan endre en spørring — og hvordan parameteriserte spørringer stopper det. Prøv demoen (kun klient-side) for å lære det grunnleggende — test aldri systemer du ikke eier.”

If you want, I can add citations/links to official advisories (ICO, CISA) and post-ready messages that mention a specific case (e.g., TalkTalk or MOVEit) for more context.

## References and further reading
High-quality resources you can safely cite or link to in a post or README:

- OWASP — SQL Injection (overview & defenses): https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection
	- A concise primer on SQLi, mitigations like prepared statements, and testing guidance.

- PortSwigger Web Security Academy — Login bypass lab: https://portswigger.net/web-security/sql-injection/lab-login-bypass
	- Hands-on, safe labs that mirror the kinds of bypasses this demo explains.

- CISA advisory — MOVEit/CL0P campaign: https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a
	- Official incident advisory describing a high-impact exploitation campaign where injection vectors were part of the chain.

- UK ICO — TalkTalk breach (investigation summaries and findings): https://ico.org.uk
	- Regulatory write-ups and public summaries for the 2015 TalkTalk incident (use ICO site search for the TalkTalk report).

- Philadelphia Fed / Heartland analysis (PDF): https://www.philadelphiafed.org/-/media/frbp/assets/consumer-finance/discussion-papers/d-2010-january-heartland-payment-systems.pdf
	- Academic/forensic-style analysis linking SQLi and subsequent steps in the Heartland breach.

If you'd like, I can turn a subset of these into short citations (e.g., [CISA MOVEit, 2023]) and produce a LinkedIn caption that links to one or two of them.