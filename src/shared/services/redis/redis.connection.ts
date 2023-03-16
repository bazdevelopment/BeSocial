import { createClient, RedisClientType } from 'redis';

export const getRedisClient = (): RedisClientType => {
  const client: RedisClientType = createClient({ url: process.env.REDIS_HOST });
  return client;
};
export const connectRedisCache = async (): Promise<void> => {
  const client = getRedisClient();

  try {
    await client.connect();
    console.info(`⚡️ Redis cache connection done: ${await client.ping()} ✅`);
  } catch (error) {
    console.error(error);
  }
};
