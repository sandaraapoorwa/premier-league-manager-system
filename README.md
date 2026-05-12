# ⚽ Premier League Manager System

A full-stack football management and league simulation platform built using:

- ⚛️ Next.js (Frontend)
- 🎮 Play Framework Java (Backend)
- 🐘 PostgreSQL (Database)

The system simulates Premier League seasons, manages clubs and players, generates fixtures automatically, and provides a modern football dashboard experience.

---

# 🚀 Features

## ⚽ League Management
- Premier League table
- Dynamic standings
- Points / GD / wins / losses
- Auto-updating leaderboard

## 🏟 Clubs & Teams
- Real EPL clubs
- Club logos support
- Team statistics
- Squad integration

## 👤 Player System
- Player database
- Positions (GK / DEF / MID / FWD)
- Ratings system
- Club assignment
- Modern player cards UI

## 📅 Fixture Generator
- Automatic round-robin fixture generation
- Home & away fixtures
- Matchday support

## 🎮 Match Simulation
- Simulate full seasons
- Simulate matchdays
- Team strength engine
- Dynamic score generation

## 🌑 Modern Frontend
- Dark football theme
- Glassmorphism UI
- Responsive design
- Interactive dashboard

---

# 🛠 Tech Stack

## Frontend
- Next.js
- React
- Axios
- Tailwind CSS
- Material UI Icons

## Backend
- Play Framework (Java)
- JDBC
- REST APIs

## Database
- PostgreSQL

---

# 📂 Project Structure

```bash
football-manager/
│
├── app/                 # Play Framework backend
├── conf/                # Routes & configuration
├── dashboard/           # Next.js frontend
├── public/              # Static assets
├── utils/               # Match engine & DB utilities
└── models/              # Java models
