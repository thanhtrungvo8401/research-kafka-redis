
import Redis from 'ioredis';
import { Plugin } from "@vcsc/node-core";
import { RedisCachingEnum } from '@enums';

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_DB } = process.env;

let redis: Redis.Redis

export default class RedisCache extends Plugin {

    async install(): Promise<void> {
        const redisOptions: Redis.RedisOptions = {
            host: REDIS_HOST,
            port: Number(REDIS_PORT),
            password: REDIS_PASSWORD,
            db: Number(REDIS_DB),
            retryStrategy(times) {
                return Math.min(times * 50, 2000);
            },

        };


        redis = new Redis(redisOptions);

        redis.on('ready', async () => {
            console.log('connected to redis')
        });

    }

    static getClient(): Redis.Redis {
        return redis;
    }

    static async set(cachename: string, value: any, expireTime?: number | null, extendKey = ''): Promise<void> {
        if (expireTime) {
            await redis.set(extendKey === '' ? `${cachename}` : `${cachename}_${extendKey}`, JSON.stringify(value), 'ex', expireTime);
        } else {
            await redis.set(extendKey === '' ? `${cachename}` : `${cachename}_${extendKey}`, JSON.stringify(value));
        }

    }

    static async get(cachename: string, extendKey = ''): Promise<any> {
        let data: any = await redis.get(extendKey === '' ? `${cachename}` : `${cachename}_${extendKey}`);
        return data ? JSON.parse(data) : null;
    }

    static async delete(cachename: string, extendKey = ''): Promise<void> {
        await redis.del(extendKey === '' ? cachename : `${cachename}_${extendKey}`)
    }
}
