# Career Path Simulator — Backend API

Production-ready **Node.js + Express** REST API for the Career Path Simulator System.

## 📁 Folder Structure



```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Logout, Refresh
│   │   ├── profileController.js   # Student profile CRUD
│   │   ├── interviewController.js # Interview events & slot booking
│   │   ├── studyPlanController.js # AI study plan generator
│   │   └── jobPostController.js   # Job posts & AI rating
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + restrictTo
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── validate.js            # express-validator runner
│   │   ├── validators.js          # All validation chains
│   │   └── rateLimiter.js         # Global + auth rate limiters
│   ├── models/
│   │   ├── User.js                # User (Student | Admin)
│   │   ├── StudentProfile.js      # Student profile & skills
│   │   ├── InterviewEvent.js      # Interview events & slots
│   │   ├── StudyPlan.js           # AI-generated study plans
│   │   └── JobPost.js             # Student job posts
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   └── jobPostRoutes.js
│   ├── services/
│   │   └── jwtService.js          # Token signing & refresh logic
│   ├── utils/
│   │   ├── AppError.js            # Custom error class
│   │   └── logger.js              # Winston logger
│   ├── app.js                     # Express app setup
│   └── index.js                   # Server entry point
├── .env.example
├── .gitignore
└── package.json
```

## 🚀 Quick Start

```bash
cd backend
npm install
.env   # Fill in your values
npm run dev
```

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_EXPIRES_IN` | Access token expiry (e.g. `7d`) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `30d`) |
| `CLIENT_URL` | Frontend URL for CORS |

## 📡 API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login |
| POST | `/refresh` | Public | Refresh access token |
| GET | `/me` | Protected | Get current user |
| POST | `/logout` | Protected | Logout |

### Profile — `/api/v1/profile`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/me` | Student | Get own profile |
| PUT | `/me` | Student | Update own profile |
| GET | `/` | Admin | List all profiles |
| GET | `/:id` | Admin | Get profile by user ID |

### Interviews — `/api/v1/interviews`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/events` | Admin | Create event + auto-generate slots |
| PATCH | `/events/:id/publish` | Admin | Publish event |
| GET | `/events` | All | List events |
| GET | `/events/:id` | All | Get event details |
| POST | `/events/:id/book/:slotId` | Student | Book a slot |
| DELETE | `/events/:id/book/:slotId` | Student | Cancel booking |

### Study Plans — `/api/v1/study-plans`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Student | Generate AI study plan |
| GET | `/` | Student | Get own plans |
| GET | `/:id` | Student | Get single plan |
| PATCH | `/:id/sessions/:sId/:idx/complete` | Student | Mark subject complete |
| DELETE | `/:id` | Student | Delete plan |

### Job Posts — `/api/v1/jobs`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Student | Create post (AI rated) |
| GET | `/me` | Student | Get own posts |
| DELETE | `/:id` | Student | Delete own post |
| GET | `/` | Admin | List all posts |
| PATCH | `/:id/review` | Admin | Approve/reject/flag post |
| GET | `/:id` | All | Get single post |

## 🛡️ Security Features

- Helmet.js headers
- CORS with whitelist
- Rate limiting (200/15min global, 10/15min for auth)
- Bcrypt password hashing (12 rounds)
- JWT access token + HttpOnly refresh cookie
- Password change invalidates old tokens
- Admin-only account creation guarded
