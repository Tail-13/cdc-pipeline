CREATE TYPE journal_type AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    account VARCHAR(50) NOT NULL,
    type journal_type NOT NULL,
    amount numeric not null,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);