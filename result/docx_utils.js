/**
 * docx_utils.js — Shared formatting utilities for thesis chapter docx generation
 * Uses docx npm package v9.6.1
 *
 * Formatting rules (Chinese thesis standard):
 *   一级标题 H1: 三号(16pt) 黑体+TNR 加粗
 *   二级标题 H2: 小四号(12pt) 黑体 加粗
 *   三级标题 H3: 小四号(12pt) 黑体 不加粗
 *   正文:       小四号(12pt) 中文宋体 英文TNR
 *   图注:       小五号(9pt)  宋体
 *   表格头:     五号(10.5pt) 黑体 加粗
 *   表格内容:   五号(10.5pt) 宋体
 */

const {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
} = require("docx");

// ─── Font / size constants ──────────────────────────────────────────────────

const FONT = {
  CN_SONG: "SimSun",      // 宋体
  CN_HEI: "SimHei",       // 黑体
  EN: "Times New Roman",  // 英文统一
};

/** Half-point sizes (docx-js uses half-points) */
const SIZE = {
  H1: 32,       // 三号 = 16pt = 32 half-points
  H2: 24,       // 小四号 = 12pt = 24 half-points
  H3: 24,       // 小四号
  BODY: 24,     // 小四号
  CAPTION: 18,  // 小五号 = 9pt = 18 half-points
  TABLE_H: 21,  // 五号 = 10.5pt = 21 half-points
  TABLE_B: 21,  // 五号
};

// ─── Page properties ────────────────────────────────────────────────────────

const PAGE_PROPERTIES = {
  page: {
    size: {
      width: 11906,   // A4: 210mm
      height: 16838,  // A4: 297mm
    },
    margin: {
      top: convertInchesToTwip(1.18),    // ~30mm
      bottom: convertInchesToTwip(1.18),
      left: convertInchesToTwip(1.18),
      right: convertInchesToTwip(1.18),
    },
  },
};

// ─── Style definitions for Document constructor ─────────────────────────────

const STYLES = {
  default: {
    document: {
      run: {
        font: FONT.EN,
        size: SIZE.BODY,
      },
      paragraph: {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360 }, // 1.5x line spacing
      },
    },
  },
  paragraphStyles: [
    {
      id: "bodyText",
      name: "Body Text Thesis",
      basedOn: "Normal",
      next: "Normal",
      run: {
        font: FONT.EN,
        size: SIZE.BODY,
      },
      paragraph: {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360 },
        indent: { firstLine: 480 }, // 2 char indent ≈ 480 twips at 12pt
      },
    },
    // Heading 1 style for TOC
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT.CN_HEI,
        size: SIZE.H1,
        bold: true,
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240, line: 360 },
      },
    },
    // Heading 2 style for TOC
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT.CN_HEI,
        size: SIZE.H2,
        bold: true,
      },
      paragraph: {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 156, after: 156, line: 360 },
      },
    },
    // Heading 3 style for TOC
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT.CN_HEI,
        size: SIZE.H3,
        bold: false,
      },
      paragraph: {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 120, after: 120, line: 360 },
      },
    },
  ],
};

// ─── Greek / symbol maps ────────────────────────────────────────────────────

const GREEK_MAP = {
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η",
  "\\theta": "θ", "\\vartheta": "ϑ", "\\iota": "ι", "\\kappa": "κ",
  "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ",
  "\\pi": "π", "\\rho": "ρ", "\\sigma": "σ", "\\tau": "τ",
  "\\upsilon": "υ", "\\phi": "φ", "\\varphi": "φ", "\\chi": "χ",
  "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ",
  "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Upsilon": "Υ",
  "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω",
};

const SYMBOL_MAP = {
  "\\subset": "⊂", "\\supset": "⊃", "\\subseteq": "⊆", "\\supseteq": "⊇",
  "\\in": "∈", "\\notin": "∉", "\\ni": "∋",
  "\\leq": "≤", "\\geq": "≥", "\\neq": "≠", "\\approx": "≈",
  "\\equiv": "≡", "\\propto": "∝", "\\sim": "∼",
  "\\cdot": "·", "\\times": "×", "\\div": "÷", "\\pm": "±", "\\mp": "∓",
  "\\infty": "∞", "\\partial": "∂", "\\nabla": "∇",
  "\\leftarrow": "←", "\\rightarrow": "→", "\\to": "→",
  "\\Leftarrow": "⇐", "\\Rightarrow": "⇒",
  "\\leftrightarrow": "↔", "\\Leftrightarrow": "⇔",
  "\\lfloor": "⌊", "\\rfloor": "⌋", "\\lceil": "⌈", "\\rceil": "⌉",
  "\\langle": "⟨", "\\rangle": "⟩",
  "\\mid": "|", "\\|": "‖",
  "\\ldots": "…", "\\cdots": "⋯", "\\dots": "…",
  "\\sum": "Σ", "\\prod": "Π", "\\int": "∫",
  "\\forall": "∀", "\\exists": "∃",
  "\\neg": "¬", "\\land": "∧", "\\lor": "∨",
  "\\cap": "∩", "\\cup": "∪", "\\emptyset": "∅",
  "\\quad": " ", "\\qquad": "  ", "\\,": " ", "\\;": " ", "\\!": "",
  "\\left": "", "\\right": "",
  "\\big": "", "\\Big": "", "\\bigg": "", "\\Bigg": "",
};

/** Named functions rendered upright */
const NAMED_FUNCS = [
  "exp", "log", "ln", "sin", "cos", "tan", "arg", "min", "max",
  "sup", "inf", "lim", "det", "dim", "ker", "gcd", "deg",
  "Pr", "sgn", "tanh", "sinh", "cosh",
];

// ─── Subscript / superscript character maps ─────────────────────────────────

const SUBSCRIPT_MAP = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
  "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
  "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
  "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
  "v": "ᵥ", "x": "ₓ",
};

const SUPERSCRIPT_MAP = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
  "n": "ⁿ", "i": "ⁱ", "T": "ᵀ", "*": "∗",
};

// ─── Math parser internals ──────────────────────────────────────────────────

/**
 * Convert a subscript body string to Unicode subscript characters.
 * Falls back to plain text for unmapped chars.
 */
function toSubscript(s) {
  let result = "";
  for (const ch of s) {
    result += SUBSCRIPT_MAP[ch] || ch;
  }
  return result;
}

function toSuperscript(s) {
  let result = "";
  for (const ch of s) {
    result += SUPERSCRIPT_MAP[ch] || ch;
  }
  return result;
}

/**
 * Extract a brace-delimited group or a single character at position i.
 * Returns [content, newIndex].
 */
function readGroup(latex, i) {
  if (i >= latex.length) return ["", i];
  if (latex[i] === "{") {
    let depth = 1;
    let j = i + 1;
    while (j < latex.length && depth > 0) {
      if (latex[j] === "{") depth++;
      else if (latex[j] === "}") depth--;
      j++;
    }
    return [latex.slice(i + 1, j - 1), j];
  }
  // single char
  return [latex[i], i + 1];
}

/**
 * Convert a LaTeX math string into plain-ish Unicode text.
 * Returns an array of { text, italic } segments.
 */
function latexToSegments(latex) {
  const segments = [];
  let buf = "";            // current italic buffer
  let i = 0;

  function flushBuf() {
    if (buf.length) {
      segments.push({ text: buf, italic: true });
      buf = "";
    }
  }

  while (i < latex.length) {
    const ch = latex[i];

    // ── whitespace ──
    if (ch === " " || ch === "\t" || ch === "\n") {
      buf += " ";
      i++;
      continue;
    }

    // ── backslash commands ──
    if (ch === "\\") {
      // Read command name
      let cmd = "\\";
      let j = i + 1;
      if (j < latex.length && /[a-zA-Z]/.test(latex[j])) {
        while (j < latex.length && /[a-zA-Z]/.test(latex[j])) {
          cmd += latex[j];
          j++;
        }
      } else if (j < latex.length) {
        // single-char command like \, \; \! \| \{  \}
        cmd += latex[j];
        j++;
      }

      // ── \text{...} ──
      if (cmd === "\\text" || cmd === "\\mathrm" || cmd === "\\textrm" || cmd === "\\textbf") {
        const [content, newJ] = readGroup(latex, j);
        flushBuf();
        segments.push({ text: content, italic: false });
        i = newJ;
        continue;
      }

      // ── \mathbb{X} ──
      if (cmd === "\\mathbb") {
        const [content, newJ] = readGroup(latex, j);
        const bbMap = { "R": "ℝ", "N": "ℕ", "Z": "ℤ", "Q": "ℚ", "C": "ℂ", "1": "𝟙", "E": "𝔼", "P": "ℙ" };
        buf += bbMap[content] || content;
        i = newJ;
        continue;
      }

      // ── \mathcal{X} ──
      if (cmd === "\\mathcal") {
        const [content, newJ] = readGroup(latex, j);
        buf += content; // just use the letter
        i = newJ;
        continue;
      }

      // ── \boldsymbol / \mathbf / \bm ──
      if (cmd === "\\boldsymbol" || cmd === "\\mathbf" || cmd === "\\bm" || cmd === "\\bf") {
        const [content, newJ] = readGroup(latex, j);
        // Recursively parse the inner content
        const innerSegs = latexToSegments(content);
        flushBuf();
        for (const seg of innerSegs) {
          segments.push({ text: seg.text, italic: seg.italic, bold: true });
        }
        i = newJ;
        continue;
      }

      // ── \sqrt{...} ──
      if (cmd === "\\sqrt") {
        const [content, newJ] = readGroup(latex, j);
        const innerText = latexToPlain(content);
        buf += "√" + innerText;
        i = newJ;
        continue;
      }

      // ── \frac{a}{b} ──
      if (cmd === "\\frac") {
        const [num, j2] = readGroup(latex, j);
        const [den, j3] = readGroup(latex, j2);
        const numText = latexToPlain(num);
        const denText = latexToPlain(den);
        buf += numText + "/" + denText;
        i = j3;
        continue;
      }

      // ── \hat{x}, \bar{x}, \tilde{x}, \vec{x}, \dot{x}, \ddot{x} ──
      if (cmd === "\\hat") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "̂"; // combining circumflex
        i = newJ;
        continue;
      }
      if (cmd === "\\bar" || cmd === "\\overline") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "̄"; // combining overline
        i = newJ;
        continue;
      }
      if (cmd === "\\tilde") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "̃"; // combining tilde
        i = newJ;
        continue;
      }
      if (cmd === "\\vec") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "⃗"; // combining right arrow
        i = newJ;
        continue;
      }
      if (cmd === "\\dot") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "̇";
        i = newJ;
        continue;
      }
      if (cmd === "\\ddot") {
        const [content, newJ] = readGroup(latex, j);
        buf += latexToPlain(content) + "̈";
        i = newJ;
        continue;
      }

      // ── Named functions (sin, cos, exp, min, max …) ──
      const funcName = cmd.slice(1); // remove backslash
      if (NAMED_FUNCS.includes(funcName)) {
        flushBuf();
        segments.push({ text: funcName, italic: false });
        i = j;
        continue;
      }

      // ── Greek letters ──
      if (GREEK_MAP[cmd]) {
        buf += GREEK_MAP[cmd];
        i = j;
        continue;
      }

      // ── Symbols ──
      if (SYMBOL_MAP[cmd] !== undefined) {
        buf += SYMBOL_MAP[cmd];
        i = j;
        continue;
      }

      // ── Unknown command — just skip backslash, keep name ──
      buf += funcName;
      i = j;
      continue;
    }

    // ── subscript ──
    if (ch === "_") {
      const [body, newI] = readGroup(latex, i + 1);
      buf += toSubscript(latexToPlain(body));
      i = newI;
      continue;
    }

    // ── superscript ──
    if (ch === "^") {
      const [body, newI] = readGroup(latex, i + 1);
      buf += toSuperscript(latexToPlain(body));
      i = newI;
      continue;
    }

    // ── braces — just skip ──
    if (ch === "{" || ch === "}") {
      i++;
      continue;
    }

    // ── normal character ──
    buf += ch;
    i++;
  }

  flushBuf();
  return segments;
}

/**
 * Flatten latex to a single plain Unicode string (used internally for sub/superscript contents).
 */
function latexToPlain(latex) {
  const segs = latexToSegments(latex);
  return segs.map((s) => s.text).join("");
}

// ─── Public API: parseInlineMath ────────────────────────────────────────────

/**
 * Parse a text string that may contain inline `$...$` math.
 * Returns an array of objects:
 *   { text: string, isMath: boolean, segments?: [{text, italic, bold?}] }
 *
 * For convenience, each element also has a `runs` property — an array of
 * TextRun-compatible option objects ready for `new TextRun(...)`.
 */
function parseInlineMath(text) {
  if (!text) return [];

  const parts = [];
  const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let lastIdx = 0;
  let m;

  while ((m = regex.exec(text)) !== null) {
    // text before this match
    if (m.index > lastIdx) {
      const plain = text.slice(lastIdx, m.index);
      parts.push({ text: plain, isMath: false });
    }
    const isBlock = !!m[1];
    const latex = m[1] || m[2];
    const segments = latexToSegments(latex);
    parts.push({ text: latex, isMath: true, isBlock, segments });
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    parts.push({ text: text.slice(lastIdx), isMath: false });
  }

  // Attach `runs` arrays
  for (const part of parts) {
    if (part.isMath) {
      part.runs = part.segments.map((seg) => ({
        text: seg.text,
        italics: seg.italic !== false,
        bold: !!seg.bold,
        font: { name: FONT.EN },
        size: SIZE.BODY,
      }));
    } else {
      part.runs = makeBodyRuns(part.text, SIZE.BODY, FONT.CN_SONG);
    }
  }

  return parts;
}

// ─── Character classification helpers ───────────────────────────────────────

/**
 * Rough test whether a character is CJK (Chinese/Japanese/Korean).
 */
function isCJK(ch) {
  const code = ch.codePointAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||   // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) ||   // CJK Ext A
    (code >= 0x3000 && code <= 0x303f) ||   // CJK Symbols & Punctuation
    (code >= 0xff00 && code <= 0xffef) ||   // Full-width forms
    (code >= 0x2e80 && code <= 0x2eff) ||   // CJK Radicals
    (code >= 0xfe30 && code <= 0xfe4f) ||   // CJK Compatibility Forms
    (code >= 0x20000 && code <= 0x2a6df)    // CJK Ext B
  );
}

/**
 * Split a plain string into runs with appropriate Chinese vs English fonts.
 * Returns an array of TextRun option objects.
 */
function makeBodyRuns(text, fontSize, cnFont, options = {}) {
  if (!text) return [];
  const runs = [];
  let buf = "";
  let wasCJK = null;

  for (const ch of text) {
    const cjk = isCJK(ch);
    if (wasCJK !== null && cjk !== wasCJK && buf.length > 0) {
      runs.push({
        text: buf,
        font: { name: wasCJK ? cnFont : FONT.EN },
        size: fontSize,
        ...options,
      });
      buf = "";
    }
    buf += ch;
    wasCJK = cjk;
  }
  if (buf.length) {
    runs.push({
      text: buf,
      font: { name: wasCJK ? cnFont : FONT.EN },
      size: fontSize,
      ...options,
    });
  }
  return runs;
}

/**
 * Build TextRun instances from parseInlineMath output, merging body font logic.
 */
function buildTextRuns(text, fontSize, cnFont, extraRunOpts = {}) {
  if (!text) return [new TextRun({ text: "", ...extraRunOpts })];

  const parts = parseInlineMathRaw(text);
  const runs = [];

  for (const part of parts) {
    if (part.isMath) {
      // Display LaTeX code in monospace font for clarity
      runs.push(
        new TextRun({
          text: `$${part.latex}$`,
          font: { name: "Courier New" },
          size: fontSize,
          italics: false,
        })
      );
    } else {
      // plain text — split by CJK
      const plainRuns = makeBodyRuns(part.text, fontSize, cnFont, extraRunOpts);
      for (const r of plainRuns) {
        runs.push(new TextRun(r));
      }
    }
  }

  return runs;
}

/**
 * Low-level inline math splitter (returns raw parts without TextRun wrapping).
 */
function parseInlineMathRaw(text) {
  const parts = [];
  // Match $...$ but not $$...$$  (we handle block math separately)
  const regex = /\$([^$]+)\$/g;
  let lastIdx = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ text: text.slice(lastIdx, m.index), isMath: false });
    }
    parts.push({ latex: m[1], isMath: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    parts.push({ text: text.slice(lastIdx), isMath: false });
  }
  return parts;
}

// ─── Paragraph builders ─────────────────────────────────────────────────────

/**
 * Create a body text paragraph (正文).
 * Handles inline math via $...$ and citations [1][2].
 * @param {string} text
 * @param {object} [opts] - extra Paragraph options
 */
function createBodyParagraph(text, opts = {}) {
  // Check if text contains citations
  const hasCitations = /\[\d+/.test(text);
  
  let children;
  
  if (hasCitations) {
    // Use citation-aware parsing
    const runs = parseCitations(text, SIZE.BODY, FONT.CN_SONG);
    // Convert plain objects to TextRun instances
    children = runs.map(run => new TextRun(run));
  } else {
    // Use standard text run building (handles math)
    children = buildTextRuns(text, SIZE.BODY, FONT.CN_SONG);
  }
  
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    indent: { firstLine: 480 },
    ...opts,
    children,
  });
}

/**
 * Create an H1 heading paragraph (一级标题).
 * 三号(16pt) 黑体+TNR 加粗
 * Uses HeadingLevel.HEADING_1 for TOC recognition
 */
function createH1(text) {
  const children = buildTextRuns(text, SIZE.H1, FONT.CN_HEI, { bold: true });
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children,
  });
}

/**
 * Create an H2 heading paragraph (二级标题).
 * 小四号(12pt) 黑体 加粗
 * Uses HeadingLevel.HEADING_2 for TOC recognition
 */
function createH2(text) {
  const children = buildTextRuns(text, SIZE.H2, FONT.CN_HEI, { bold: true });
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 156, after: 156, line: 360 },
    children,
  });
}

/**
 * Create an H3 heading paragraph (三级标题).
 * 小四号(12pt) 黑体 不加粗
 * Uses HeadingLevel.HEADING_3 for TOC recognition
 */
function createH3(text) {
  const children = buildTextRuns(text, SIZE.H3, FONT.CN_HEI, {});
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 120, line: 360 },
    children,
  });
}

/**
 * Create a centered block-math paragraph for $$...$$ formulas.
 * Displays LaTeX code in monospace font for clarity.
 * @param {string} latex — the LaTeX string (without $$ delimiters)
 */
function createBlockMath(latex) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120, line: 360 },
    children: [
      new TextRun({
        text: latex,
        font: { name: "Courier New" },
        size: SIZE.BODY,
      }),
    ],
  });
}

/**
 * Create a formula paragraph with equation number.
 * Formula is centered, equation number is right-aligned in parentheses.
 * Displays LaTeX code in monospace font for clarity.
 * @param {string} latex — the LaTeX string (without $$ delimiters)
 * @param {string} eqNumber — equation number like "1.1", "2.3", "A1" etc.
 */
function createFormulaWithNumber(latex, eqNumber) {
  // Add tab for right alignment of equation number
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120, line: 360 },
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: 9000, // Right side of page
      },
    ],
    children: [
      new TextRun({
        text: latex,
        font: { name: "Courier New" },
        size: SIZE.BODY,
      }),
      new TextRun({
        text: `\t(${eqNumber})`,
        font: { name: "Courier New" },
        size: SIZE.BODY,
      }),
    ],
  });
}

/**
 * Create a figure caption paragraph (图注).
 * 小五号(9pt) 宋体, centered.
 */
function createFigureCaption(text) {
  const children = buildTextRuns(text, SIZE.CAPTION, FONT.CN_SONG);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60, line: 276 },
    children,
  });
}

/**
 * Create a "special heading" (参考文献 / 致谢 / 附录 etc.)
 * 三号(16pt) 黑体 加粗, centered — same visual as H1.
 */
function createSpecialHeading(text) {
  return createH1(text);
}

// ─── Table helpers ──────────────────────────────────────────────────────────

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

/**
 * Create a table cell with the given text, font settings, and optional alignment.
 */
function makeTableCell(text, { fontSize, cnFont, bold = false, alignment = AlignmentType.CENTER } = {}) {
  const children = buildTextRuns(text, fontSize, cnFont, bold ? { bold: true } : {});
  return new TableCell({
    borders: NO_BORDER,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment,
        spacing: { line: 276 },
        children,
      }),
    ],
  });
}

/**
 * Create a thesis-formatted table.
 *
 * @param {string[]} headers - column headers
 * @param {string[][]} rows - data rows (each is an array of cell strings)
 * @param {object} [opts]
 * @param {number[]} [opts.columnWidths] - column widths in percentage (should sum ~100)
 */
function createTable(headers, rows, opts = {}) {
  const colCount = headers.length;

  // Header row
  const headerCells = headers.map((h) =>
    makeTableCell(h, { fontSize: SIZE.TABLE_H, cnFont: FONT.CN_HEI, bold: true })
  );
  const headerRow = new TableRow({ children: headerCells });

  // Data rows
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) =>
          makeTableCell(String(cell), { fontSize: SIZE.TABLE_B, cnFont: FONT.CN_SONG })
        ),
      })
  );

  const tableOpts = {
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: NO_BORDER,
  };

  if (opts.columnWidths) {
    tableOpts.columnWidths = opts.columnWidths.map((pct) =>
      Math.round((pct / 100) * 9072) // A4 text width ≈ 9072 twips at 1.18" margins
    );
  }

  return new Table(tableOpts);
}

/**
 * Create a table caption paragraph (表注 — centered, 小五号).
 * Typically placed above the table: "表 X.X ..."
 */
function createTableCaption(text) {
  const children = buildTextRuns(text, SIZE.CAPTION, FONT.CN_SONG, { bold: true });
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60, line: 276 },
    children,
  });
}

// ─── Citation formatting helpers ────────────────────────────────────────────

/**
 * Parse text and convert inline citations like [30][2][12] to superscript format.
 * Citations in brackets at end of sentences become superscript.
 * Citations mentioned in text like "文献[8, 10-14]" remain inline with normal font size.
 * 
 * Returns an array of TextRun option objects.
 */
function parseCitations(text, fontSize = SIZE.BODY, cnFont = FONT.CN_SONG) {
  if (!text) return [];
  
  const runs = [];
  // Pattern to match citation groups (one or more consecutive bracketed numbers)
  const citationGroupPattern = /(\[\d+(?:[,，\s]*\d+)*(?:[-–]\d+)?\](?:\s*\[\d+(?:[,，\s]*\d+)*(?:[-–]\d+)?\])*)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = citationGroupPattern.exec(text)) !== null) {
    const citationGroup = match[1];
    const matchStart = match.index;
    
    // Check if this is a textual citation (preceded by "文献")
    const precedingText = text.substring(Math.max(0, matchStart - 10), matchStart);
    const isTextualCitation = /文献$/.test(precedingText.trim());
    
    // Add text before this citation group
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart);
      const beforeRuns = makeBodyRuns(beforeText, fontSize, cnFont);
      runs.push(...beforeRuns);
    }
    
    if (isTextualCitation) {
      // Keep as inline normal text
      const inlineRuns = makeBodyRuns(citationGroup, fontSize, cnFont);
      runs.push(...inlineRuns);
    } else {
      // Convert to superscript
      runs.push({
        text: citationGroup,
        superScript: true,
        font: { name: cnFont },
        size: fontSize,
      });
    }
    
    lastIndex = matchStart + citationGroup.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingRuns = makeBodyRuns(text.substring(lastIndex), fontSize, cnFont);
    runs.push(...remainingRuns);
  }
  
  return runs.length > 0 ? runs : makeBodyRuns(text, fontSize, cnFont);
}

// ─── Convenience: empty paragraph / spacing paragraph ───────────────────────

function createEmptyParagraph(spacing = {}) {
  return new Paragraph({
    spacing: { line: 360, ...spacing },
    children: [],
  });
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  // Constants
  FONT,
  SIZE,
  PAGE_PROPERTIES,
  STYLES,
  NO_BORDER,

  // Math helpers
  parseInlineMath,
  latexToSegments,
  latexToPlain,

  // Citation helpers
  parseCitations,

  // Run-level helpers
  makeBodyRuns,
  buildTextRuns,

  // Paragraph builders
  createBodyParagraph,
  createH1,
  createH2,
  createH3,
  createBlockMath,
  createFormulaWithNumber,
  createFigureCaption,
  createSpecialHeading,
  createEmptyParagraph,

  // Table builders
  createTable,
  createTableCaption,
  makeTableCell,

  // Re-export commonly used docx items for convenience
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  Document,
  HeadingLevel,
};
