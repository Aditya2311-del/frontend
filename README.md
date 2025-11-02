# GlucoSense Frontend

Modern React frontend for the GlucoSense health monitoring platform.

## Features

- **Patient Dashboard**: View health metrics, submit check-ins, and access AI insights
- **Doctor Dashboard**: Manage patients, view health data, and generate AI analyses
- **Authentication**: Secure login and signup with role-based access control
- **Real-time Health Insights**: AI-powered health analysis and recommendations
- **Beautiful Modern UI**: Responsive design with Tailwind CSS

## Quick Start

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

3. **Build for production:**
```bash
npm run build
```

## Configuration

The API base URL is configured in `src/config.ts` and points to the deployed backend at `http://13.62.57.143:8000`.

To change the API URL, edit `src/config.ts`:
```typescript
export const API_BASE_URL = 'http://13.62.57.143:8000';
```

## Demo Credentials

**Doctor:**
- Email: `doctor@example.com`
- Password: `doctorpass`

**Patient:**
- Sign up for a new account through the signup page

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components (Layout, ProtectedRoute)
│   ├── context/         # React context providers (AuthContext)
│   ├── pages/           # Page components
│   │   ├── patient/     # Patient-specific pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CheckIn.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Insights.tsx
│   │   ├── doctor/      # Doctor-specific pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Patients.tsx
│   │   │   └── PatientDetail.tsx
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── services/        # API service layer (api.ts)
│   ├── types/           # TypeScript type definitions
│   ├── config.ts        # Configuration (API URL)
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json         # Dependencies
└── vite.config.ts      # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Role

### Patient Features
- View health dashboard with metrics and recent check-ins
- Submit daily check-ins with energy, mood, and symptoms
- Update profile and medical history
- Get AI-powered health analysis
- Receive personalized recommendations
- Disease-specific health insights

### Doctor Features
- View all patients
- Search patients by email or age
- View patient profiles and check-in history
- Analyze patient health with AI
- Generate patient-specific recommendations
- Access health summary statistics

## Development Notes

- All API calls are handled through `src/services/api.ts`
- Authentication tokens are stored in localStorage
- Protected routes ensure users can only access their role-appropriate pages
- The frontend is completely separate from the backend - no backend code was modified

