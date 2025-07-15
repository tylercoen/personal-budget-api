# Personal Budget API

This is a Node.js RESTful API for managing personal budgeting using "envelopes" (budget categories) and tracking transactions.

## 🚀 Features

- Create, update, and delete budget envelopes
- Record transactions with date, amount, payment method, recipient, and envelope
- Transfer funds between envelopes
- Uses PostgreSQL on [Render](https://render.com)
- Securely loads credentials from GitHub Codespaces Secrets
- API documentation via Swagger at `/api-docs`

## 📦 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Swagger (OpenAPI) for docs
- GitHub Codespaces for development

## 🛠 Setup

1. Clone the repo and open in GitHub Codespaces
2. Add your Render DB URL to Codespaces Secrets as `DATABASE_URL`
3. Install dependencies:

```bash
npm install
