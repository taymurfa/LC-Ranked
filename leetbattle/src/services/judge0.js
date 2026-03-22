/**
 * Local code execution service — runs player code in sandboxed child processes.
 * No external API required. Supports Python 3 and JavaScript (Node.js).
 *
 * Each test case spawns a short-lived process with:
 *   - stdin: JSON-serialized test input
 *   - stdout: JSON-serialized result
 *   - timeout: per-test time limit
 */

import { spawn } from "child_process";
import { writeFile, unlink, mkdtemp } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

/** Map display language names to execution commands + file extensions */
const LANG_CONFIG = {
  "python3":    { cmd: "python3", ext: ".py" },
  "Python 3":   { cmd: "python3", ext: ".py" },
  "javascript": { cmd: "node",    ext: ".js" },
  "JavaScript": { cmd: "node",    ext: ".js" },
};

/**
 * Build a test harness that wraps the player's code.
 * Reads JSON from stdin, calls the function, prints JSON to stdout.
 */
export function buildHarness(code, language, functionName) {
  const lang = LANG_CONFIG[language];
  if (!lang) return code;

  if (lang.ext === ".py") {
    return `import json, sys, collections
from collections import OrderedDict, defaultdict, deque, Counter
from typing import List, Optional
import heapq, math, bisect, itertools, functools, re

${code}

_raw = sys.stdin.read().strip()
_input = json.loads(_raw)
_sol = Solution()
if isinstance(_input, dict):
    _result = _sol.${functionName}(**_input)
elif isinstance(_input, list):
    _result = _sol.${functionName}(*_input)
else:
    _result = _sol.${functionName}(_input)

# Convert sets to sorted lists for comparison
def _normalize(v):
    if isinstance(v, set):
        return sorted(list(v))
    if isinstance(v, list):
        return [_normalize(x) for x in v]
    return v

print(json.dumps(_normalize(_result)))
`;
  }

  if (lang.ext === ".js") {
    return `${code}

const _raw = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const _input = JSON.parse(_raw);
let _result;
if (Array.isArray(_input)) {
  _result = ${functionName}(..._input);
} else if (typeof _input === 'object' && _input !== null) {
  _result = ${functionName}(...Object.values(_input));
} else {
  _result = ${functionName}(_input);
}
console.log(JSON.stringify(_result));
`;
  }

  return code;
}

/**
 * Execute code in a child process with timeout.
 *
 * @param {string} command - e.g. "python3" or "node"
 * @param {string} filePath - path to the source file
 * @param {string} stdin - input to pass via stdin
 * @param {number} timeLimitMs - timeout in milliseconds
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, time: number, timedOut: boolean }>}
 */
function execCode(command, filePath, stdin, timeLimitMs) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let resolved = false;

    const proc = spawn(command, [filePath], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeLimitMs,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });

    proc.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    proc.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        resolve({ stdout, stderr: err.message, exitCode: 1, time: (Date.now() - startTime) / 1000, timedOut: false });
      }
    });

    proc.on("close", (exitCode, signal) => {
      if (!resolved) {
        resolved = true;
        if (signal === "SIGTERM") timedOut = true;
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode ?? 1,
          time: (Date.now() - startTime) / 1000,
          timedOut,
        });
      }
    });

    // Write stdin and close
    proc.stdin.write(stdin);
    proc.stdin.end();
  });
}

/**
 * Run player code against a set of test cases.
 *
 * @param {string} code - Player source code
 * @param {string} language - Language name
 * @param {string} functionName - Function to call
 * @param {{ input: object, expected: any }[]} testCases
 * @param {number} timeLimit - Per-test time limit in seconds
 * @returns {Promise<{ results: object[], passed: number, total: number, avgExecTime: number }>}
 */
export async function runTests(code, language, functionName, testCases, timeLimit = 5) {
  const langConfig = LANG_CONFIG[language];
  if (!langConfig) throw new Error(`Unsupported language: ${language}. Supported: Python 3, JavaScript`);

  const wrappedCode = buildHarness(code, language, functionName);
  const timeLimitMs = timeLimit * 1000;

  // Create a temp directory for this execution
  const tmpDir = await mkdtemp(join(tmpdir(), "leetbattle-"));
  const filePath = join(tmpDir, `solution${langConfig.ext}`);
  await writeFile(filePath, wrappedCode, "utf8");

  let passed = 0;
  let totalExecTime = 0;
  const results = [];

  // Run test cases sequentially to avoid overloading
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const stdinStr = JSON.stringify(tc.input);

    const exec = await execCode(langConfig.cmd, filePath, stdinStr, timeLimitMs);
    totalExecTime += exec.time;

    let actual = null;
    let testPassed = false;

    if (exec.timedOut) {
      results.push({
        testCase: i + 1,
        input: tc.input,
        expected: tc.expected,
        actual: null,
        passed: false,
        execTime: exec.time,
        error: `Time Limit Exceeded (${timeLimit}s)`,
      });
      continue;
    }

    if (exec.exitCode === 0 && exec.stdout) {
      try {
        actual = JSON.parse(exec.stdout);
      } catch {
        actual = exec.stdout;
      }
      // Deep equality via JSON normalization
      testPassed = JSON.stringify(actual) === JSON.stringify(tc.expected);
    }

    if (testPassed) passed++;

    results.push({
      testCase: i + 1,
      input: tc.input,
      expected: tc.expected,
      actual,
      passed: testPassed,
      execTime: exec.time,
      error: exec.stderr || (exec.exitCode !== 0 ? `Runtime Error (exit code ${exec.exitCode})` : null),
    });
  }

  // Cleanup temp file
  try { await unlink(filePath); } catch {}

  return {
    results,
    passed,
    total: testCases.length,
    avgExecTime: testCases.length > 0 ? totalExecTime / testCases.length : 0,
  };
}
