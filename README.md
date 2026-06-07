# Inventory & Order Management System

Production-ready full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, TanStack Query, React Router
- **Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic
- **Database:** PostgreSQL 16
- **Containerization:** Docker, Docker Compose

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://inventory-order-system.vercel.app |
| Backend API | https://inventory-api.onrender.com |
| API Docs | https://inventory-api.onrender.com/docs |
| Docker Hub | https://hub.docker.com/r/viveksingh1198/inventory-api |
| GitHub | https://github.com/viveksingh1198/inventory-order-system |

## Features

- Product CRUD with unique SKU validation
- Customer management with unique email validation
- Order creation with automatic stock deduction and total calculation
- Order cancellation restores inventory
- Dashboard with totals and low-stock alerts
- Responsive UI for desktop and mobile

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders rejected when inventory is insufficient
- Order total calculated by backend (not client)
- Deleting an order restores stock to pre-order levels
- Low stock threshold defaults to 10 (configurable via `LOW_STOCK_THRESHOLD`)

## Local Development with Docker

### Prerequisites

- Docker and Docker Compose installed

### Quick Start

```bash
# Clone the repository
git clone https://github.com/viveksingh1198/inventory-order-system.git
cd inventory-order-system

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Stop Services

```bash
docker compose down
```

To remove database data:

```bash
docker compose down -v
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `inventory` |
| `POSTGRES_PASSWORD` | Database password | `inventory` |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `DATABASE_URL` | SQLAlchemy connection string | Built from Postgres vars |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `LOW_STOCK_THRESHOLD` | Low stock alert threshold | `10` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000` |

## API Endpoints

### Products
- `POST /products` - Create product
- `GET /products` - List products
- `GET /products/{id}` - Get product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Customers
- `POST /customers` - Create customer
- `GET /customers` - List customers
- `GET /customers/{id}` - Get customer
- `DELETE /customers/{id}` - Delete customer

### Orders
- `POST /orders` - Create order
- `GET /orders` - List orders
- `GET /orders/{id}` - Get order details
- `DELETE /orders/{id}` - Cancel order (restores stock)

### Dashboard
- `GET /dashboard/summary` - Summary statistics

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Inventory & Order Management System"
git remote add origin https://github.com/viveksingh1198/inventory-order-system.git
git push -u origin main
```

### 2. Deploy Backend on Render

1. Create a **PostgreSQL** database on Render (free tier)
2. Create a **Web Service** connected to your GitHub repo
3. Set **Root Directory** to `backend`
4. Choose **Docker** as runtime (uses `backend/Dockerfile`)
5. Set environment variables:
   - `DATABASE_URL` - from Render Postgres (Internal URL)
   - `CORS_ORIGINS` - `https://inventory-order-system.vercel.app`
   - `LOW_STOCK_THRESHOLD` - `10`
6. Deploy and verify at https://inventory-api.onrender.com/health

### 3. Deploy Frontend on Vercel

1. Import GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Framework Preset: **Vite**
4. Set environment variable:
   - `VITE_API_URL` - `https://inventory-api.onrender.com`
5. Deploy and verify at https://inventory-order-system.vercel.app

### 4. Update CORS on Render

After Vercel deployment, ensure `CORS_ORIGINS` on Render is set to `https://inventory-order-system.vercel.app` (no trailing slash) and redeploy backend if needed.

### 5. Push Backend Image to Docker Hub

```bash
docker login
docker build -t viveksingh1198/inventory-api:latest ./backend
docker push viveksingh1198/inventory-api:latest
```

Image available at: https://hub.docker.com/r/viveksingh1198/inventory-api

## Submission Links

| Deliverable | URL |
|-------------|-----|
| GitHub Repository | https://github.com/viveksingh1198/inventory-order-system |
| Docker Hub Image | https://hub.docker.com/r/viveksingh1198/inventory-api |
| Live Frontend | https://inventory-order-system.vercel.app |
| Live Backend API | https://inventory-api.onrender.com |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Reusable UI components
│   │   └── pages/            # Page components
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Manual Test Checklist

- [ ] Create product with duplicate SKU returns 409
- [ ] Create customer with duplicate email returns 409
- [ ] Update product quantity to negative returns 400
- [ ] Order with insufficient stock returns 400
- [ ] Successful order reduces stock and calculates total
- [ ] Delete order restores stock
- [ ] Dashboard shows correct counts
- [ ] `docker compose up --build` works from fresh clone

## License

MIT
