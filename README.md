# Spaced Repetition API

A REST API built with Node.js and SQLite to manage English phrases using spaced repetition logic, designed to integrate seamlessly with a custom OpenAI GPT.

---

## 📦 Requirements

- Node.js 18+
- SQLite3

---

## 🚀 Installation

```bash
npm install
```

---

## ⚙️ Configuration

Create a `.env` file with your authentication token:

```env
AUTH_TOKEN=your_secure_token_here
```

---

## 🗃️ Initialize the database

```bash
sqlite3 spaced_repetition.db < schema.sql
```

Or use the protected `/seed` route:

```bash
curl -X POST http://localhost:3000/seed -H "Authorization: Bearer your_secure_token_here"
```

This will populate the database with phrases from `phrases.json` and reset existing entries.

---

## 🧠 Main Endpoints

All routes are prefixed with `/api` and protected with Bearer Token authentication.

### 🔍 Get phrases due for review

```http
GET /api/review
```

Response:

```json
[
  {
    "phrase_id": 1,
    "text": "Let’s have a quick sync.",
    "next_review": "2025-04-07"
  }
]
```

### ✅ Submit review result

```http
POST /api/review/:id
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "result": "correct" // or "incorrect"
}
```

### 📘 Get phrase by ID

```http
GET /api/phrase/:id
```

---

## 🔐 Security

Include your Bearer token in the `Authorization` header for all requests:

```
Authorization: Bearer YOUR_TOKEN
```

All routes are protected via authentication middleware.

---

## 🤖 GPT Integration (OpenAI Actions)

Upload your `openapi.json` file to the GPT's advanced settings, and ensure it uses the following actions:

- `getReviewList` → to fetch phrases due today.
- `postReviewResult` → to record user performance.
- `getPhraseById` → to show a specific phrase.

---

## 📁 Project Structure

```
spaced-repetition-api/
├── .env
├── package.json
├── server.js
├── db.js
├── schema.sql
├── phrases.json
├── middleware/
│   └── auth.js
└── routes/
    ├── phrases.js
    └── review.js
```

---

## 🧪 Run the Server

```bash
npm start
```

Default URL: `http://localhost:3000`

---

Need help? I'm here to assist you with deploying this API on platforms like Render, Railway, or a custom VPS.
