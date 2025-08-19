import { createClient } from 'redis';
import { REDIS_URL } from '../env';

const redis = createClient({ url: REDIS_URL });

redis.on('error', (err) => {
  console.error('Redis error', err);
});

redis.connect().catch((err) => {
  console.error('Redis connection error', err);
});

export default redis;
