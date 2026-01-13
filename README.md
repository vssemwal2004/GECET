# GECET Project

Full-stack project with React + Vite + Tailwind CSS frontend and Express.js backend.

## Project Structure

```
GECET/
├── frontend/           # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/            # Express.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── services/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
