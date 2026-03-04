-- ========================================================
-- 1. Users & Roles
-- ========================================================
CREATE TYPE user_role AS ENUM ('client', 'freelancer', 'admin');

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles specialization
CREATE TABLE Freelancer_Profile (
    freelancer_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    bio TEXT,
    hourly_rate DECIMAL(10, 2) CHECK (hourly_rate >= 0),
    experience_years INT CHECK (experience_years >= 0)
);

CREATE TABLE Client_Profile (
    client_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255)
);

-- ========================================================
-- 2. Master Data (Categories & Skills)
-- ========================================================
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ========================================================
-- 3. Jobs & Bidding
-- ========================================================
CREATE TYPE job_status AS ENUM ('open', 'closed', 'in_progress', 'completed');

CREATE TABLE Jobs (
    job_id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES Client_Profile(client_id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES Categories(category_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2) CHECK (budget > 0),
    status job_status DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Job_Skills (
    job_id INT REFERENCES Jobs(job_id) ON DELETE CASCADE,
    skill_id INT REFERENCES Skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE Bids (
    bid_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES Jobs(job_id) ON DELETE CASCADE,
    freelancer_id INT NOT NULL REFERENCES Freelancer_Profile(freelancer_id) ON DELETE CASCADE,
    bid_amount DECIMAL(10, 2) CHECK (bid_amount > 0),
    proposal TEXT NOT NULL,
    status bid_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, freelancer_id) -- One bid per freelancer per job
);

-- ========================================================
-- 4. Contracts & Escrow Payments
-- ========================================================
CREATE TYPE contract_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE Contracts (
    contract_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL UNIQUE REFERENCES Jobs(job_id), -- One contract per job
    client_id INT NOT NULL REFERENCES Client_Profile(client_id),
    freelancer_id INT NOT NULL REFERENCES Freelancer_Profile(freelancer_id),
    agreed_amount DECIMAL(10, 2) CHECK (agreed_amount > 0),
    status contract_status DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP
);

CREATE TYPE payment_status AS ENUM ('escrowed', 'released', 'refunded');

CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL UNIQUE REFERENCES Contracts(contract_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status payment_status DEFAULT 'escrowed',
    transaction_reference VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 5. Reviews, Messages & Disputes
-- ========================================================
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES Contracts(contract_id) ON DELETE CASCADE,
    reviewer_id INT NOT NULL REFERENCES Users(user_id),
    reviewee_id INT NOT NULL REFERENCES Users(user_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (contract_id, reviewer_id) -- Only one review per user per contract
);

CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'rejected');

CREATE TABLE Disputes (
    dispute_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES Contracts(contract_id) ON DELETE CASCADE,
    raised_by INT NOT NULL REFERENCES Users(user_id),
    reason TEXT NOT NULL,
    status dispute_status DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES Contracts(contract_id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES Users(user_id),
    receiver_id INT NOT NULL REFERENCES Users(user_id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 6. Indexes for Performance Optimization
-- ========================================================
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_jobs_client ON Jobs(client_id);
CREATE INDEX idx_jobs_category ON Jobs(category_id);
CREATE INDEX idx_bids_job ON Bids(job_id);
CREATE INDEX idx_contracts_freelancer ON Contracts(freelancer_id);
CREATE INDEX idx_contracts_client ON Contracts(client_id);

-- ========================================================
-- 7. Functions & Triggers
-- ========================================================

-- Trigger: Automatically Create Payment in Escrow when Contract is inserted
CREATE OR REPLACE FUNCTION trg_create_payment_func()
RETURNS TRIGGER AS $$
BEGIN
   INSERT INTO Payments(contract_id, amount, status)
   VALUES (NEW.contract_id, NEW.agreed_amount, 'escrowed');
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_payment
AFTER INSERT ON Contracts
FOR EACH ROW
EXECUTE FUNCTION trg_create_payment_func();

-- Stored Procedure: Release Escrow Payment (ACID Transaction logic to be called via CALL)
CREATE OR REPLACE PROCEDURE release_payment(p_contract_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update Payment status
    UPDATE Payments
    SET status = 'released'
    WHERE contract_id = p_contract_id;

    -- Update Contract status
    UPDATE Contracts
    SET status = 'completed', end_date = CURRENT_TIMESTAMP
    WHERE contract_id = p_contract_id;

    -- Update Job status
    UPDATE Jobs
    SET status = 'completed'
    WHERE job_id = (SELECT job_id FROM Contracts WHERE contract_id = p_contract_id);
END;
$$;
