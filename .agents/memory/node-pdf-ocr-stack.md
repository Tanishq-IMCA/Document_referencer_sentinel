---
name: Node PDF/OCR document intelligence stack
description: Non-obvious runtime issues when using pdf-parse v2 + tesseract.js for document text extraction in an esbuild-bundled Node service.
---

When building a Node/Express backend that extracts text from PDFs/images (no Python available), `pdf-parse` v2 (class-based `PDFParse` API, wraps pdfjs-dist) and `tesseract.js` are viable without any ML downloads, but two bundler-specific issues will surface at runtime, not at typecheck/build time:

1. **`DOMMatrix is not defined`** — pdfjs-dist expects a `DOMMatrix` global in Node and tries to pull it from an optional `@napi-rs/canvas` peer dependency at runtime. Install `@napi-rs/canvas` as a real dependency (not just typecheck-only) or every `getText()` call throws.

2. **`Cannot find module '.../dist/pdf.worker.mjs'`** — pdf-parse resolves its worker file via a path relative to *its own package location* at runtime. If esbuild bundles `pdf-parse` into the service's single output file, that relative resolution breaks because the worker file never gets copied next to the bundle. Fix: add `pdf-parse` (and `tesseract.js`, same issue with its worker/lang-data files) to esbuild's `external` list so they stay as real `node_modules` imports instead of being inlined.

**Why:** Both libraries do meta-programming (dynamic `require`/relative-URL resolution) that assumes their own package directory structure is intact on disk — bundling silently breaks that assumption with no build-time error, only a runtime one on first real request.

**How to apply:** Any time a Node artifact bundles a package that ships its own worker/wasm/language-data files (pdfjs-dist-based libs, tesseract.js, similar OCR/PDF/ML libs) via esbuild, default to externalizing that package rather than trying to fix asset-copying after the fact.
