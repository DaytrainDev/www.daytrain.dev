import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sqlClient: NeonQueryFunction<false, false> | null = null;

// Get the SQL query function (singleton)
export function getSql(): NeonQueryFunction<false, false> {
  if (sqlClient) return sqlClient;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  sqlClient = neon(url);
  return sqlClient;
}

// Export sql as a function that returns the client
// This allows using template literals: sql`SELECT * FROM users`
export { getSql as sql };
