import { config } from '@/config.server';
import Redis from 'ioredis';

const redis = new Redis(config.redisUrl);

export default redis;
