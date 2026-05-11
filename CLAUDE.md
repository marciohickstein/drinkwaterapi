# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrinkWater is a Node.js REST API that helps users track water consumption with real-time reminders via WebSockets. It uses Express.js for routing and MongoDB/Mongoose for data persistence.

## Commands

### Running the Application

```bash
# Production mode (port 8000)
npm start

# Development mode (port 3000) - requires external MongoDB
npm run dev
# Or use F5 in VSCode

# Run only the database container
docker compose up db

# Full Docker environment (simulates production)
docker compose up
```

### Linting

```bash
npm run eslint
```

## Architecture

### Server Entry Point
- `app.js` - Main application file. Configures Express middleware (helmet, xss-clean, rate limiting), mounts routes, connects to MongoDB, and initializes Socket.IO for real-time reminders.

### Routes (`/routes/`)
- `water-consumption.js` - CRUD operations for tracking water consumption records (`/water-consumption`)
- `notification.js` - Manage notification settings (start/end times, intervals) (`/notification`)
- `perfil.js` - User profile management (`/perfil`)
- `reminder.js` - Get reminder status based on current time (`/reminder`)

### Models (`/models/`)
Mongoose schemas:
- `consumption.js` - Water consumption records (type, quantity, date, time)
- `notification.js` - Notification configuration (id, start, end, interval)
- `perfil.js` - User profile (id, email, passwd, weight)

### Real-time Functionality
- `socket-reminder.js` - Socket.IO implementation that sends periodic water reminders to connected clients. Manages per-client timers.

### Utilities
- `utils.js` - Helper functions for logging, JSON parsing, date handling, and reading notification config from `notification.json`

### Static Client
- `client/` - Frontend served at root path. Uses Bootstrap, jQuery, Chart.js, and Socket.IO client.

## Configuration

Environment variables (via `.env`):
- `DATABASE_STRING` - MongoDB connection string (production)
- `DATABASE_STRING_DEBUG` - MongoDB connection string (development)
- `PORT_DEFAULT` - Server port (production, typically 8000)
- `PORT_DEFAULT_DEBUG` - Server port (development, typically 3000)
- `NODE_ENV` - Set to `development` for dev mode

The `notification.json` file in the project root configures reminder intervals (defaults to 15 minutes if not present).
