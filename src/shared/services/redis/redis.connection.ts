import { createClient, RedisClientType } from 'redis';
/**
 * Initialize and instance for redis client
 * @returns client
 */
export const getRedisClient = (): RedisClientType => {
  const client: RedisClientType = createClient({ url: process.env.REDIS_HOST });
  return client;
};

/**
 * Establish the connection for redis client
 */
export const connectRedisCache = async (): Promise<void> => {
  const client = getRedisClient();

  try {
    await client.connect();
    console.info(`⚡️ Redis cache connection done: ${await client.ping()} ✅`);
  } catch (error) {
    console.error(error);
  }
};
