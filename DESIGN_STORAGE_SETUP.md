# Design Storage - Backend Setup

## Overview
The design system now saves designs to a JSON file (`designs.json`) in the root directory instead of using localStorage.

## Setup Instructions

### 1. Install Dependencies
Add Express to your project:
```bash
npm install express
```

### 2. Update package.json
Make sure your `package.json` has the following:
```json
{
  "scripts": {
    "server": "node server.js",
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 3. Run the Server
In one terminal, start the backend server:
```bash
npm run server
```

In another terminal, start the frontend:
```bash
npm run dev
```

## How It Works

### API Endpoints

- **GET /api/designs** - Get all designs or designs by category
  - Query: `?category=2-8` or `?category=3-12`
  
- **POST /api/designs** - Save or update a design
  - Body: `{ name, category, gridType, dropZones, frameColor, fullColor, wallColor }`
  
- **DELETE /api/designs** - Delete a design
  - Query: `?name=designName&category=2-8`

### File Structure
```
boarddesigner-client/
├── server.js            # Backend API server
├── designs.json         # Design storage file
├── src/
│   └── components/
│       ├── SaveDesign.jsx      # Updated to use API
│       └── Header.jsx          # Updated to use API
└── package.json
```

## Design Data Structure
Each design saved in `designs.json` contains:
```json
{
  "id": "timestamp",
  "name": "Design Name",
  "category": "2-8",
  "timestamp": "2/4/2026, 10:30:00 AM",
  "gridType": "2x4",
  "dropZones": {},
  "frameColor": "polar-white",
  "fullColor": null,
  "wallColor": "#e8e8e8",
  "createdAt": "2026-02-04T10:30:00.000Z",
  "updatedAt": "2026-02-04T10:30:00.000Z"
}
```

## Notes
- All designs are stored in `designs.json` in the root directory
- The server runs on `http://localhost:5000`
- The frontend connects to the backend via fetch API calls
- Make sure both server and frontend are running for the app to work properly
