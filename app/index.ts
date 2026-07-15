import { configDotenv } from "dotenv";
import express from "express";
import { Pool } from "pg";
import winston, { format, transports } from "winston";

configDotenv();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
    transports: [
        new transports.Console({
            format:format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            )
        }),
    ]
})
const app = express();
app.use(express.json());

const pool =  new Pool({
    connectionString: process.env.DATABASE_URL
})

app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM journals');
        res.status(200).json(result.rows);
    } catch (err) {
        logger.error(`Database error: ${err instanceof Error ? err.message : String(err)}`);
        res.status(500).send('Server Error');
    }
});

app.post('/data', async (req, res) => {
    try {
        const { account, type, amount } = req.body;
        const result = await pool.query('INSERT INTO journals (account, type, amount) VALUES ($1, $2, $3) RETURNING *', [account, type.toUpperCase(), amount]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(`Database error: ${err instanceof Error ? err.message : String(err)}`);
        res.status(500).send('Server Error');
    }
});

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
})