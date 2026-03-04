# Freelance Marketplace Platform

A production-grade platform demonstrating deep core DBMS concepts and full-stack architecture.

## Tech Stack
- **Database**: PostgreSQL (ACID, 3NF Normalization, Escrow transaction logic, Stored Procedures, Triggers)
- **Backend**: Node.js + Express (Modular structure, MVC)
- **Frontend**: React.js + Vite + Tailwind CSS (Responsive Dashboards)
- **Auth**: JWT + bcrypt
- **Deployment**: Docker & Docker Compose

## Core DBMS Features Included
- **ER to Relational Schema** representing Users, Profiles, Jobs, Bids, Contracts, Payments.
- **Transactions (ACID)**: Used heavily. For instance, creating a contract simultaneously accepts a bid and rejects others atomically.
- **Triggers**: Auto-creates an "Escrowed" payment tracking record when a Contract is inserted.
- **Stored Procedures**: Secure mechanism to release escrow payments and finalize contracts via one `CALL` statement.
- **Complex JOINs**: Real-time aggregated Admin Analytics calculating top-rated freelancers and platform revenue.

## Running the Application

1. **Start the Database, Backend, and Frontend**
   Ensure Docker is running on your machine, then execute:
   ```bash
   docker-compose up -d --build
   ```

2. **Access the application**
   - **Frontend**: `http://localhost:80`
   - **Backend API**: `http://localhost:5000/api/health`
   - **PostgreSQL**: `localhost:5432`

## End-to-End Escrow Flow Testing
1. **Register** as a 'Client' and create a Job via the dashboard.
2. **Register** as a 'Freelancer' and submit a Bid on the open job.
3. Login as 'Client', accept the bid.
4. *Observe*: A `Contract` is generated in the database.
5. *Observe Mechanism*: The `trg_create_payment_func` trigger instantly escrows the funds into the `Payments` table.
6. The Client later calls "Release Payment", which executes the `release_payment` Stored Procedure, safely finalizing the transaction.
