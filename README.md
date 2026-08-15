# Store Rating Web Application

A full-stack enterprise web application for reviewing, rating, and managing registered stores across multiple user roles (`System Administrator`, `Normal User`, `Store Owner`).

Built for the **FullStack Intern Coding Challenge**.

---

## Tech Stack

- **Backend**: Express.js (Node.js REST API with JWT Auth & validation middleware)
- **Database**: MySQL Server (on port `3306`) with embedded SQLite automatic fallback
- **Frontend**: React.js (Vite + React Router + Lucide Icons + Custom Glassmorphism CSS)

---

## Key Features & Requirements Matrix

| Requirement | Description | Status |
| :--- | :--- | :--- |
| **Single Login System** | Unified authentication for all 3 user roles with automatic role-based dashboard routing. | ✅ Implemented |
| **Normal User Signup** | Self-service registration page for normal users with real-time field validation. | ✅ Implemented |
| **System Administrator** | Dashboard metrics (total users, stores, ratings), add stores, add users (Admin/User/Owner), view & filter user details (displays owner rating if user is Store Owner). | ✅ Implemented |
| **Normal User View** | Browse stores, search by Name/Address, view overall rating & my rating, submit/modify 1–5 star ratings. | ✅ Implemented |
| **Store Owner View** | Dashboard metrics showing store average rating, total ratings received, and sortable list of users who submitted reviews. | ✅ Implemented |
| **Table Sorting** | Ascending & Descending sort on all listing tables for key fields (Name, Email, Address, Rating, Role, Date). | ✅ Implemented |
| **Form Validations** | **Name**: 20–60 chars \| **Address**: <= 400 chars \| **Password**: 8–16 chars with 1+ uppercase & 1+ special char \| **Email**: Standard format \| **Rating**: 1–5 stars. | ✅ Implemented |

---

## Quick Start Guide

### 1. Database Configuration
The server automatically connects to MySQL running at `localhost:3306` with database name `store_rating_db`.
If MySQL connection credentials differ or MySQL is not running, the application automatically initializes an embedded SQLite database (`server/store_rating.sqlite`) to guarantee zero-friction evaluation.

### 2. Running the Backend Server
```bash
cd server
npm install
npm start
```
*Server runs on **http://localhost:5000*** and auto-seeds default demo accounts and stores.

### 3. Running the Frontend React App
```bash
cd client
npm install
npm run dev
```
*Frontend runs on **http://localhost:3000*** with proxy configured to port 5000.

---

## Pre-seeded Demo Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@storerating.com` | `Admin@12345!` | Full system administration, metric cards, user/store creation. |
| **Store Owner** | `owner.marcus@storerating.com` | `Owner@12345!` | Manages Apex Tech Electronics Hub & views customer reviews. |
| **Normal User** | `eleanor.vance@storerating.com` | `User@12345!` | Submits and modifies ratings for registered stores. |
