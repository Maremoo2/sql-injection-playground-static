// script.js — client-side simulation only
const users = [
  { id: 1, username: 'alice', password: 'wonderland' },
  { id: 2, username: 'bob', password: 'builder' }
];

const $ = id => document.getElementById(id);
const usernameEl = $('username');
const passwordEl = $('password');
const sqlEl = $('constructed-sql');
const vulnResult = $('vuln-result');
const safeResult = $('safe-result');

function escapeForSql(str) {
  // show how naive concatenation appears (not used to query)
  return str.replace(/'/g, "''");
}

function buildVulnerableSQL(username, password) {
  const u = username;
  const p = password;
  return `SELECT id, username FROM users WHERE username = '${u}' AND password = '${p}' LIMIT 1;`;
}

// detect always-true math expressions like "2+2=4" (simple)
function mathEqualityIsTrue(str) {
  // Find simple arithmetic equalities like:
  //  - 2+2=4  or 10 + 2 = 12
  //  - 5-3=2
  //  - 3*4=12
  //  - 8/2=4
  // Also detect trivial numeric equality like 1 = 1

  // 1) arithmetic expressions with two operands
  const arith = str.match(/([0-9]+\s*[\+\-\*\/]\s*[0-9]+)\s*=\s*([0-9]+)/);
  if (arith) {
    try {
      const left = arith[1].replace(/\s+/g, '');
      const opMatch = left.match(/([0-9]+)\s*([\+\-\*\/])\s*([0-9]+)/);
      if (opMatch) {
        const a = parseInt(opMatch[1], 10);
        const op = opMatch[2];
        const b = parseInt(opMatch[3], 10);
        const right = parseInt(arith[2], 10);
        let val;
        if (op === '+') val = a + b;
        else if (op === '-') val = a - b;
        else if (op === '*') val = a * b;
        else if (op === '/') val = b !== 0 ? a / b : null;
        return val === right;
      }
    } catch (e) {
      return false;
    }
  }

  // 2) simple numeric equality like "1 = 1"
  const eq = str.match(/([0-9]+)\s*=\s*([0-9]+)/);
  if (eq) {
    try {
      return parseInt(eq[1], 10) === parseInt(eq[2], 10);
    } catch (e) {
      return false;
    }
  }

  return false;
}

// detect classic OR always true pattern: ' OR '1'='1  (very basic)
function detectsClassicOrTrue(str) {
  return /(\bOR\b|or)\s*['"]?\s*1\s*['"]?\s*=\s*['"]?\s*1/i.test(str);
}

// Simulated "execution" of the vulnerable query
function simulateVulnerable(sql, username, password) {
  // If the constructed SQL contains an always-true expression, we simulate a bypass:
  if (mathEqualityIsTrue(sql) || detectsClassicOrTrue(sql)) {
    return { success: true, reason: 'Detected always-true expression in WHERE clause (simulated bypass)' };
  }

  // else attempt to match exactly against the in-browser users list
  const found = users.find(u => u.username === username && u.password === password);
  if (found) return { success: true, reason: `Credentials matched user '${found.username}'` };
  return { success: false, reason: 'No match — login failed' };
}

function tryVulnerable() {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  const constructed = buildVulnerableSQL(u, p);
  sqlEl.textContent = constructed;

  // log constructed SQL so people can inspect it in DevTools
  console.log('Constructed SQL (simulated):', constructed);

  const result = simulateVulnerable(constructed, u, p);
  vulnResult.textContent = result.success ? `VULNERABLE: ${result.reason}` : `VULNERABLE: ${result.reason}`;
  vulnResult.style.color = result.success ? 'crimson' : '#111';
}

function trySafe() {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();

  // safe: strict equality check against user store
  const found = users.find(x => x.username === u && x.password === p);
  if (found) {
    safeResult.textContent = `SAFE: Login succeeded as ${found.username}`;
    safeResult.style.color = 'green';
  } else {
    safeResult.textContent = 'SAFE: Login failed (no SQL parsing/evaluation performed)';
    safeResult.style.color = 'black';
  }
}

$('try-vuln').addEventListener('click', tryVulnerable);
$('try-safe').addEventListener('click', trySafe);

// prefill example
usernameEl.value = 'alice';
passwordEl.value = 'wonderland';
tryVulnerable();

// Add a small "copy link" button next to the Safe button so people can copy the demo URL for sharing.
try {
  const safeBtn = document.getElementById('try-safe');
  if (safeBtn && safeBtn.parentNode) {
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy demo link';
    copyBtn.className = 'copy-link-btn';
    copyBtn.addEventListener('click', () => {
      const url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = 'Link copied!';
          setTimeout(() => copyBtn.textContent = 'Copy demo link', 1400);
        }).catch(() => {
          alert('Copy failed — please copy the URL manually from the address bar');
        });
      } else {
        prompt('Copy this URL', url);
      }
    });
    safeBtn.parentNode.appendChild(copyBtn);
  }
} catch (e) {
  // non-fatal
}
