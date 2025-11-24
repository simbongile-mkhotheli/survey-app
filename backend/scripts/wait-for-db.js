/* eslint-disable no-console */
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
const maxAttempts = Number(process.env.DB_WAIT_ATTEMPTS ?? 12);
const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 5000);

if (!connectionString) {
  console.error('[wait-for-db] DATABASE_URL is not defined.');
  process.exit(1);
}

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const tryConnect = async (attempt) => {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const start = Date.now();
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    const duration = Date.now() - start;
    console.log(
      `[wait-for-db] Database reachable (attempt ${attempt}) after ${duration}ms.`,
    );
    return true;
  } catch (error) {
    await client.end().catch(() => undefined);
    console.error(
      `[wait-for-db] Attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`,
    );
    return false;
  }
};

(async () => {
  console.log(
    `[wait-for-db] Checking database connectivity (maxAttempts=${maxAttempts}, delayMs=${delayMs}).`,
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const success = await tryConnect(attempt);
    if (success) {
      process.exit(0);
    }

    if (attempt === maxAttempts) {
      console.error(
        '[wait-for-db] Exhausted all attempts. Database not reachable.',
      );
      process.exit(1);
    }

    console.log(`[wait-for-db] Waiting ${delayMs}ms before retrying...`);
    await delay(delayMs);
  }
})();
