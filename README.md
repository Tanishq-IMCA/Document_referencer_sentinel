# SENTINEL: Neural Document Intelligence

> [!CAUTION]
> PROPRIETARY AND CONFIDENTIAL
> This project, along with its associated codebase, constitutes the proprietary and strictly confidential intellectual property of the developer.
> UNAUTHORIZED USE IS STRICTLY PROHIBITED. You may not copy, distribute, transmit, reproduce, publish, modify, or create derivative works from this source material without the explicit, documented authorization of the chief developer.
> This repository does NOT grant an open-source license. All rights are explicitly reserved.
> This project was created as an academic assignment for **Vishwakarma University**, **AIDS Department**, under the guidance of the **IMCA** program. The academic intent is reflected in the design, research, and educational engineering behind the system.

<p align="center">
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
<img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
<img src="https://img.shields.io/badge/Framer%20Motion-black?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
<img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/Tesseract.js-4285F4?style=for-the-badge&logo=tesseract&logoColor=white" alt="Tesseract.js">
<img src="https://img.shields.io/badge/pdf--parse-3B82F6?style=for-the-badge&logo=pdf&logoColor=white" alt="pdf-parse">
<img src="https://img.shields.io/badge/Multer-F24E1E?style=for-the-badge&logo=multipart&logoColor=white" alt="Multer">
<img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod">
<img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="TanStack Query">
</p>

## About This Project

**SENTINEL** is a privacy-first document intelligence platform. Upload a PDF or image and receive extracted text, an intelligent summary, and key points in seconds. No sign-in is required, no data leaves the server, and everything is built for speed and clarity.

This project was originally developed as an academic assignment at **Vishwakarma University** for the **AIDS (Artificial Intelligence & Data Science) Department**, under the **IMCA** program. While the original concept evolved into a focused document-scanning product, the engineering intent remains educational: a production-shaped, full-stack system demonstrating modern frontend design, API contract design, and local document processing pipelines.

## Design Philosophy

**Splash Screen & First Impression:** A bold, dark landing page with a purple cyber-security aesthetic, animated terminal elements, and a command-line-inspired interface. It feels like a professional intelligence tool — minimal, powerful, and inviting.

**Direct Upload Experience:** No onboarding, no accounts, no friction. Users drag and drop a document, choose a summary length, and scan. The results appear immediately.

**Beautiful, Responsive Results:** Scan progress is animated, results are clean, and the UI uses glassmorphism, segment bars, and neural cues to make document analysis feel cinematic.

## Technical Architecture

### Frontend Stack
- **React 18+** with **Vite** for fast builds and modern ES modules
- **TypeScript** for type-safe components and API contracts
- **TanStack Query** for seamless server state and mutations
- **Framer Motion** for cinematic transitions, terminal animations, and result reveals
- **Tailwind CSS** for utility-first, responsive styling with deep-purple design tokens
- **wouter** for lightweight client-side routing

### Backend Stack
- **Node.js** with **Express** for async, high-performance API handling
- **Multer** for file upload handling and memory-buffer processing
- **pdf-parse** for text extraction from PDFs with a text layer
- **Tesseract.js** for OCR fallback on scanned PDFs and image uploads
- **Zod** for runtime validation and OpenAPI contract enforcement
- **@napi-rs/canvas** for Node.js canvas/DOMMatrix support required by the PDF engine

### AI & Analysis Pipeline
- **Stage 1 (Extraction):** Pull text directly from the PDF content stream; if empty, fall back to OCR
- **Stage 2 (Summarization):** Frequency-based extractive summarization with stop-word filtering, sentence scoring, and length-aware output
- **Stage 3 (Key Points):** Select the highest-scoring sentences as key insights
- **Stage 4 (Metrics):** Word count and local browser metrics for usage tracking

### Deployment
- **Replit** for full-stack hosting and preview workflows
- **Monorepo** managed by **pnpm** with shared packages for API contracts and generated clients

## User Flow

### 1. Landing Page
The user lands on a bold, animated splash page with a terminal-style hero and a call-to-action to launch the scanner.

### 2. Upload Document
The user navigates to the scanner and drags or selects a PDF or image (JPG, PNG, WEBP). They can choose a summary length: Short, Medium, or Long.

### 3. Document Processing
The backend extracts text, runs OCR if needed, and applies the summarization pipeline. The result is returned with:
- Extracted text
- Neural summary
- Key points
- Word count

### 4. Results Display
A clean, split-screen dashboard shows the summary, the full extracted text, and the key insights. The metrics panel updates browser-local storage.

### 5. Metrics & Settings
Users can view total scans, words processed, and cache usage in the Settings tab. Session data can be cleared at any time.

## Setup & Execution

### Prerequisites
- Node.js 24+ (recommended)
- pnpm
- Git
- Replit account (for hosting)

### Install Dependencies
```bash
pnpm install
```

### Run Development Servers
The project is configured with Replit workflows. Start both services:

```bash
# Artifact: web frontend
pnpm --filter @workspace/sentinel run dev

# Artifact: API server
pnpm --filter @workspace/api-server run dev
```

### Build
```bash
pnpm --filter @workspace/sentinel run build
pnpm --filter @workspace/api-server run build
```

## Project Structure

```
├── artifacts/sentinel        # React frontend (Vite + Tailwind + Framer Motion)
├── artifacts/api-server      # Node/Express backend (Multer, pdf-parse, Tesseract.js)
├── lib/api-zod               # Shared Zod schemas / OpenAPI generated types
├── lib/api-client-react      # Generated TanStack Query hooks
├── lib/api-spec              # OpenAPI specification
└── README.md                 # This file
```

## Key Features

- **No Account Required:** Drop a file and scan immediately
- **Privacy-First:** Documents are processed in memory and never persistently stored
- **OCR Fallback:** Scanned PDFs and images are handled automatically via Tesseract.js
- **Length-Aware Summaries:** Short, Medium, or Long summaries tailored to the user's need
- **Key Point Extraction:** Instantly surface the most important sentences from any document
- **Local Metrics:** Track scans, words processed, and storage usage in the browser
- **Beautiful UX:** Deep-purple glassmorphism, terminal animations, and responsive layouts

## Security & Privacy

- Files are streamed into memory buffers, never written to disk or database
- No authentication tokens or third-party APIs are used for document processing
- All processing runs within the deployed Replit environment

## Developer

**Tanishq Giri** — AIDS Department, Vishwakarma University
- GitHub: [https://github.com/tanishq-imca](https://github.com/tanishq-imca)
- Email: [Tanishq.wanderer@gmail.com](mailto:Tanishq.wanderer@gmail.com)

## Future Enhancements

- Multi-page scanned PDF rendering via page-by-page OCR
- Real-time scan progress stages streamed to the frontend
- Export results as PDF or JSON
- Persistent scan history with a database-backed storage option
- Multi-language OCR support

---
