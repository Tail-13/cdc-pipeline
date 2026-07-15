CREATE STREAM IF NOT EXISTS journals_flat (
    payload STRUCT<
        after STRUCT<
            id INT, 
            account VARCHAR, 
            type VARCHAR, 
            "timestamp" BIGINT,
            amount DOUBLE
        >
    >
) WITH (
    KAFKA_TOPIC='cdc_journal.public.journals',
    VALUE_FORMAT='JSON'
);

CREATE TABLE IF NOT EXISTS report AS
    SELECT 
        payload->after->account AS account,
        SUM(
            CASE 
                WHEN LCASE(payload->after->type) = 'credit' THEN -payload->after->amount
                WHEN LCASE(payload->after->type) = 'debit'  THEN payload->after->amount
                -- Changed 0 to 0.0 to fix the type mismatch error
                ELSE CAST(0 as DOUBLE)
            END 
        ) AS balance
    FROM journals_flat
    WHERE payload->after IS NOT NULL
    GROUP BY payload->after->account
    EMIT CHANGES;
