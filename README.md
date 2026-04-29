# 🌱 EcoBeacon AI

AI-powered sustainability platform that tracks, analyzes, and reduces your carbon footprint.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Seed Demo Data (optional)

```bash
cd backend
npm run seed
# Login: alex@ecobeacon.com / password123
```

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts, React Router v6, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **AI**: Rule-based recommendation engine

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile (auth) |
| POST | /api/activity/add | Log activity (auth) |
| GET | /api/activity/user/:id | Get activities (auth) |
| DELETE | /api/activity/:id | Delete activity (auth) |
| GET | /api/emissions/summary/:id | Emission summary (auth) |
| GET | /api/ai/suggestions/:userId | AI recommendations (auth) |

## Emission Factors

| Category | Factor |
|----------|--------|
| Car | 0.21 kg CO₂/km |
| Bus | 0.089 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Flight | 0.255 kg CO₂/km |
| Electricity | 0.85 kg CO₂/kWh |
| Meat meal | 5.0 kg CO₂ |
| Veg meal | 1.5 kg CO₂ |
| Vegan meal | 0.9 kg CO₂ |
