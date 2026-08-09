-- SportSync Initial Database Schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL -- ROLE_ADMIN, ROLE_COACH, ROLE_STUDENT
);

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_pic_url VARCHAR(500),
    role_id UUID NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COACHES TABLE (1:1 with USERS)
CREATE TABLE coaches (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    hire_date DATE NOT NULL
);

-- 4. STUDENTS TABLE (1:1 with USERS)
CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    emergency_contact VARCHAR(255),
    coach_id UUID REFERENCES coaches(user_id) ON DELETE SET NULL
);

-- 5. ATTENDANCE TABLE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, EXCUSED
    marked_by_coach_id UUID REFERENCES coaches(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, session_date) -- Prevent duplicate attendance for the same day
);

-- 6. FEES TABLE
CREATE TABLE fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    payment_date DATE,
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TOURNAMENTS TABLE
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING', -- UPCOMING, ONGOING, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TOURNAMENT_REGISTRATIONS TABLE (Many-to-Many Students <-> Tournaments)
CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED', -- REGISTERED, WITHDRAWN
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, student_id) -- Prevent duplicate registrations
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_students_coach ON students(coach_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, session_date);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_tournament_regs ON tournament_registrations(tournament_id, student_id);

-- Insert Default Roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_COACH'), ('ROLE_STUDENT');
