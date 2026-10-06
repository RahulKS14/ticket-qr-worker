"use strict";

const fs   = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");


class TextNode {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = String(text ?? "");
    this.children = [];
    this.parentNode = null;
    this.style = {};
  }
  getAttribute() { return null; }
  setAttribute() {}
  hasAttribute() { return false; }
  removeAttribute() {}
  matches() { return false; }
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"
]);

function parseHTMLInto(html, parent) {
  if (!html) return;
  const tagRegex = /<(?:\/([a-zA-Z0-9-]+)|([a-zA-Z0-9-]+)([^>]*))>/g;
  const attrRegex = /([a-zA-Z0-9-:]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  let lastIndex = 0;
  const stack = [parent];
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index);
    if (textBefore.trim().length > 0) {
      const textNode = new TextNode(textBefore);
      stack[stack.length - 1].appendChild(textNode);
    }
    lastIndex = tagRegex.lastIndex;

    const isClosing = Boolean(match[1]);
    const tagName = (match[1] || match[2]).toLowerCase();
    const rawAttrs = match[3] || "";

    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName.toLowerCase() === tagName) {
          stack.splice(i, stack.length - i);
          break;
        }
      }
    } else {
      const el = new Element(tagName);
      let attrMatch;
      attrRegex.lastIndex = 0;
      while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
        el.setAttribute(attrName, attrVal);
      }

      stack[stack.length - 1].appendChild(el);

      if (!VOID_ELEMENTS.has(tagName) && !rawAttrs.trim().endsWith("/")) {
        stack.push(el);
      }
    }
  }

  const trailingText = html.slice(lastIndex);
  if (trailingText.trim().length > 0) {
    stack[stack.length - 1].appendChild(new TextNode(trailingText));
  }
}

class Element {
  constructor(tagName = "DIV") {
    this.tagName = tagName.toUpperCase();
    this.nodeType = 1;
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.style = { display: "", visibility: "" };
    this._listeners = new Map();
    this._textContent = "";
  }

  get id() { return this.getAttribute("id") || ""; }
  set id(v) { this.setAttribute("id", v); }

  get className() { return this.getAttribute("class") || ""; }
  set className(v) { this.setAttribute("class", v); }

  get name() { return this.getAttribute("name") || ""; }
  set name(v) { this.setAttribute("name", v); }

  get type() { return this.getAttribute("type") || ""; }
  set type(v) { this.setAttribute("type", v); }

  get value() { return this._value ?? this.getAttribute("value") ?? ""; }
  set value(v) { this._value = v; }

  get src() { return this.getAttribute("src") || ""; }
  set src(v) { this.setAttribute("src", v); }

  get alt() { return this.getAttribute("alt") || ""; }
  set alt(v) { this.setAttribute("alt", v); }

  getAttribute(name) {
    return this.attributes.get(name.toLowerCase()) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name.toLowerCase(), String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name.toLowerCase());
  }

  hasAttribute(name) {
    return this.attributes.has(name.toLowerCase());
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join("");
  }

  set textContent(v) {
    this.children = [];
    this._textContent = String(v ?? "");
  }

  get innerHTML() {
    return this.children.map(c => c.innerHTML ?? c.textContent).join("");
  }

  set innerHTML(html) {
    this.children = [];
    this._textContent = "";
    parseHTMLInto(html, this);
  }

  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }

  dispatchEvent(evt) {
    const handlers = this._listeners.get(evt.type) || [];
    for (const h of handlers) h.call(this, evt);
    return !evt.defaultPrevented;
  }

  reset() {
    const inputs = this.querySelectorAll("input, textarea, select");
    for (const input of inputs) {
      input.value = "";
    }
  }

  matches(sel) {
    const parts = sel.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts.some(p => this.matches(p));

    let s = parts[0];
    if (s === "*") return true;

    const tagMatch = s.match(/^([a-zA-Z0-9-]+)/);
    if (tagMatch) {
      if (this.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
      s = s.slice(tagMatch[1].length);
    }

    const idMatch = s.match(/^#([a-zA-Z0-9-_]+)/);
    if (idMatch) {
      if (this.id !== idMatch[1]) return false;
      s = s.slice(idMatch[0].length);
    }

const classMatch = s.match(/^\.([a-zA-Z0-9-_]+)/);    if (classMatch) {
      const classes = this.className.split(/\s+/);
      if (!classes.includes(classMatch[1])) return false;
      s = s.slice(classMatch[0].length);
    }

    const attrMatch = s.match(/^\[([a-zA-Z0-9-_:]+)(?:([*~|^$]?=)(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/);
    if (attrMatch) {
      const attrName = attrMatch[1].toLowerCase();
      if (!this.hasAttribute(attrName)) return false;
      if (attrMatch[2]) {
        const expected = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "";
        const actual = this.getAttribute(attrName);
        if (attrMatch[2] === "=" && actual !== expected) return false;
        if (attrMatch[2] === "*=" && !actual.includes(expected)) return false;
      }
      s = s.slice(attrMatch[0].length);
    }

    return s.length === 0;
  }

  closest(sel) {
    let el = this;
    while (el) {
      if (el.matches && el.matches(sel)) return el;
      el = el.parentNode;
    }
    return null;
  }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (child.matches && child.matches(sel)) {
          results.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return results;
  }
}

global.Element = Element;
global.HTMLElement = Element;

global.document = {
  body: new Element("body"),
  head: new Element("head"),
  title: "",
  createElement: (tag) => new Element(tag),
  getElementById: (id) => global.document.body.querySelector(`#${id}`) || (global.document.body.id === id ? global.document.body : null),
  querySelector: (sel) => global.document.body.querySelector(sel),
  querySelectorAll: (sel) => global.document.body.querySelectorAll(sel),
};
global.window = {
  document: global.document,
  Element,
  HTMLElement: Element,
};

if (!global.FormData) {
  global.FormData = class FormData {
    constructor(form) {
      this._data = new Map();
      if (form) {
        const inputs = form.querySelectorAll("input, select, textarea");
        for (const input of inputs) {
          const name = input.name || input.getAttribute("name");
          if (name) {
            this._data.set(name, input.value || input.getAttribute("value") || "");
          }
        }
      }
    }
    get(k) { return this._data.get(k) ?? null; }
    set(k, v) { this._data.set(k, v); }
  };
}

let _currentFile = "";
const _suites    = [];
let _currentSuite = null;

global.describe = function describe(name, fn) {
  const suite = {
    file: _currentFile,
    name,
    tests: [],
    beforeEachFns: [],
    afterEachFns:  [],
    beforeAllFns:  [],
    afterAllFns:   [],
    parent: _currentSuite,
  };
  const prev = _currentSuite;
  _currentSuite = suite;
  fn();
  _currentSuite = prev;
  if (_currentSuite) {
    _currentSuite.tests.push({ type: "suite", suite });
  } else {
    _suites.push(suite);
  }
};

function registerTest(name, fn, options = {}) {
  const test = { type: "test", name, fn, options, suite: _currentSuite };
  if (_currentSuite) {
    _currentSuite.tests.push(test);
  } else {
    const anon = { file: _currentFile, name: "(root)", tests: [test], beforeEachFns: [], afterEachFns: [], beforeAllFns: [], afterAllFns: [] };
    _suites.push(anon);
  }
}

global.it   = registerTest;
global.test = registerTest;

global.beforeEach = (fn) => { if (_currentSuite) _currentSuite.beforeEachFns.push(fn); };
global.afterEach  = (fn) => { if (_currentSuite) _currentSuite.afterEachFns.push(fn);  };
global.beforeAll  = (fn) => { if (_currentSuite) _currentSuite.beforeAllFns.push(fn);  };
global.afterAll   = (fn) => { if (_currentSuite) _currentSuite.afterAllFns.push(fn);   };

let _fakeTimerActive  = false;
let _fakeTimerAdvance = 0;
let _originalConsoleLog;

function makeMockFn(impl) {
  const calls = [];
  const mockFn = function (...args) {
    calls.push(args);
    return typeof mockFn._impl === "function" ? mockFn._impl(...args) : undefined;
  };
  mockFn._impl = impl || undefined;
  mockFn.mock  = { calls };
  mockFn.mockImplementation = (fn) => { mockFn._impl = fn; return mockFn; };
  mockFn.mockResolvedValueOnce = (val) => {
    const prev = mockFn._impl;
    mockFn._impl = (...a) => { mockFn._impl = prev; return Promise.resolve(val); };
    return mockFn;
  };
  mockFn.mockRejectedValueOnce = (val) => {
    const prev = mockFn._impl;
    mockFn._impl = (...a) => { mockFn._impl = prev; return Promise.reject(val); };
    return mockFn;
  };
  mockFn.mockRestore = () => {};
  return mockFn;
}

global.vi = {
  fn: (impl) => makeMockFn(impl),
  spyOn: (obj, method) => {
    const original = obj[method];
    const spy = makeMockFn(original ? original.bind(obj) : undefined);
    spy.mockRestore = () => { obj[method] = original; };
    obj[method] = spy;
    return spy;
  },
  useFakeTimers: () => { _fakeTimerActive = true; },
  useRealTimers: () => { _fakeTimerActive = false; },
  advanceTimersByTime: (ms) => { _fakeTimerAdvance += ms; },
  restoreAllMocks: () => {},
};

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}

function expect(received, hint) {
  const matchers = {
    toBe(expected) {
      if (!Object.is(received, expected)) {
        throw new AssertionError(
          `${hint ? hint + "\n" : ""}Expected: ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(received)}`
        );
      }
    },
    toEqual(expected) {
      const r = JSON.stringify(received);
      const e = JSON.stringify(expected);
      if (r !== e) throw new AssertionError(`${hint ? hint + "\n" : ""}toEqual failed:\n  Expected: ${e}\n  Received: ${r}`);
    },
    toBeDefined() {
      if (received === undefined) throw new AssertionError(`${hint ? hint + ": " : ""}Expected value to be defined, got undefined`);
    },
    toBeUndefined() {
      if (received !== undefined) throw new AssertionError(`Expected undefined, got: ${JSON.stringify(received)}`);
    },
    toBeNull() {
      if (received !== null) throw new AssertionError(`Expected null, got: ${JSON.stringify(received)}`);
    },
    not: null,
    toBeGreaterThan(n) {
      if (!(received > n)) throw new AssertionError(`Expected ${received} > ${n}`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(received >= n)) throw new AssertionError(`Expected ${received} >= ${n}`);
    },
    toBeLessThan(n) {
      if (!(received < n)) throw new AssertionError(`Expected ${received} < ${n}`);
    },
    toHaveLength(n) {
      const len = received?.length ?? received?.size;
      if (len !== n) throw new AssertionError(`Expected length ${n}, got ${len}`);
    },
    toContain(item) {
      const ok = Array.isArray(received) ? received.includes(item) :
                 typeof received === "string" ? received.includes(item) : false;
      if (!ok) throw new AssertionError(`Expected ${JSON.stringify(received)} to contain ${JSON.stringify(item)}`);
    },
    toHaveProperty(key, value) {
      const keys = key.split(".");
      let obj = received;
      for (const k of keys) {
        if (obj == null || !Object.prototype.hasOwnProperty.call(obj, k) && !(k in obj)) {
          throw new AssertionError(`Expected object to have property "${key}"`);
        }
        obj = obj[k];
      }
      if (arguments.length > 1 && !Object.is(obj, value)) {
        throw new AssertionError(`Expected property "${key}" to be ${JSON.stringify(value)}, got ${JSON.stringify(obj)}`);
      }
    },
    toMatch(pattern) {
      const rx = typeof pattern === "string" ? new RegExp(pattern) : pattern;
      if (!rx.test(String(received))) throw new AssertionError(`Expected "${received}" to match ${rx}`);
    },
    toBeInstanceOf(cls) {
      if (!(received instanceof cls)) throw new AssertionError(`Expected instance of ${cls.name}`);
    },
    toBeTruthy() {
      if (!received) throw new AssertionError(`Expected truthy, got: ${JSON.stringify(received)}`);
    },
    toBeFalsy() {
      if (received) throw new AssertionError(`Expected falsy, got: ${JSON.stringify(received)}`);
    },
    toBeInTheDocument() {
      if (received == null) throw new AssertionError("Expected element to be in document, got null/undefined");
    },
  };

  const notMatchers = {};
  for (const [name, fn] of Object.entries(matchers)) {
    if (name === "not") continue;
    notMatchers[name] = (...args) => {
      let threw = false;
      try { fn.apply(matchers, args); } catch { threw = true; }
      if (!threw) throw new AssertionError(`Expected NOT to ${name}(${args.map(a => JSON.stringify(a)).join(", ")}), but it did. Received: ${JSON.stringify(received)}`);
    };
  }
  matchers.not = notMatchers;

  return matchers;
}
global.expect = expect;

const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

async function runTest(test, suite) {
  const allBefore = collectLifecycle(suite, "beforeEachFns");
  const allAfter  = collectLifecycle(suite, "afterEachFns");

  for (const fn of allBefore) {
    try {
      await fn();
    } catch (e) {
      return { passed: false, error: e };
    }
  }

  let passed = false;
  let error  = null;
  try {
    await Promise.resolve(test.fn());
    passed = true;
  } catch (e) {
    error = e;
  }

  for (const fn of allAfter) { try { await fn(); } catch {} }

  return { passed, error };
}

function collectLifecycle(suite, key) {
  const fns = [];
  let s = suite;
  while (s) {
    fns.unshift(...(s[key] || []));
    s = s.parent;
  }
  return fns;
}

async function runSuite(suite, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(`\n${indent}${CYAN}${suite.name}${RESET}`);

  for (const fn of suite.beforeAllFns || []) { try { await fn(); } catch {} }

  const results = [];
  for (const item of suite.tests) {
    if (item.type === "suite") {
      const sub = await runSuite(item.suite, depth + 1);
      results.push(...sub);
    } else {
      const { passed, error } = await runTest(item, suite);
      const prefix = passed
        ? `${GREEN}  ✓${RESET}`
        : `${RED}  ✗${RESET}`;
      console.log(`${indent}  ${prefix} ${item.name}`);
      if (!passed && error) {
        const msg = error.message || String(error);
        msg.split("\n").forEach(l => console.log(`${indent}      ${RED}${l}${RESET}`));
      }
      results.push({ name: item.name, suite: suite.name, passed, error });
    }
  }

  for (const fn of suite.afterAllFns || []) { try { await fn(); } catch {} }

  return results;
}

async function main() {
  const testDir  = path.join(__dirname, "src", "tests");
  const testFiles = fs.readdirSync(testDir)
    .filter(f => f.endsWith(".test.js") && f !== "setup.js")
    .map(f => path.join(testDir, f));

  let totalPassed = 0;
  let totalFailed = 0;
  const failures  = [];

  for (const file of testFiles) {
    _currentFile  = file;
    _currentSuite = null;
    const before  = _suites.length;

    console.log(`\n${BOLD}${YELLOW}FILE: ${path.basename(file)}${RESET}`);

    try {
      await import(pathToFileURL(file).href);
    } catch (e) {
      console.log(`${RED}  LOAD ERROR: ${e.message}${RESET}`);
      totalFailed++;
      failures.push({ name: `[load] ${path.basename(file)}`, suite: "(load)", error: e });
      continue;
    }

    const newSuites = _suites.slice(before);
    for (const suite of newSuites) {
      const results = await runSuite(suite);
      for (const r of results) {
        if (r.passed) {
          totalPassed++;
        } else {
          totalFailed++;
          failures.push(r);
        }
      }
    }
  }

  console.log(`\n${"─".repeat(65)}`);
  console.log(`${BOLD}Test Results${RESET}`);
  console.log(`${"─".repeat(65)}`);
  const total = totalPassed + totalFailed;
  console.log(`  Total    : ${BOLD}${total}${RESET}`);
  console.log(`  ${GREEN}Passed   : ${totalPassed}${RESET}`);
  console.log(`  ${RED}Failed   : ${totalFailed}${RESET}`);
  console.log(`  Skipped  : 0  (runner does not support skip)`);
  console.log(`${"─".repeat(65)}`);

  if (failures.length > 0) {
    console.log(`\n${BOLD}${RED}FAILURES${RESET}`);
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.suite}] ${f.name}`);
      if (f.error) {
        const msg = (f.error.message || String(f.error)).split("\n")[0];
        console.log(`     ${RED}${msg}${RESET}`);
      }
    });
  }

  console.log("");
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });