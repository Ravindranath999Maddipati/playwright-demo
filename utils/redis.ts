import Redis from 'ioredis';

/**
 * Dynamically resolves the Redis connection parameters based on the current active environment.
 */
function getRedisConfig() {
  const env = (process.env.ENV || 'dev').toLowerCase();

  let host = process.env.DEV_REDIS_HOST || 'localhost';
  let port = parseInt(process.env.DEV_REDIS_PORT || '6379', 10);
  let password = process.env.DEV_REDIS_PASSWORD || undefined;
  let db = parseInt(process.env.DEV_REDIS_DB || '0', 10);
  let ssl = process.env.DEV_REDIS_SSL === 'true';

  if (env === 'sit') {
    host = process.env.SIT_REDIS_HOST || 'localhost';
    port = parseInt(process.env.SIT_REDIS_PORT || '6379', 10);
    password = process.env.SIT_REDIS_PASSWORD || undefined;
    db = parseInt(process.env.SIT_REDIS_DB || '0', 10);
    ssl = process.env.SIT_REDIS_SSL === 'true';
  } else if (env === 'preprod') {
    host = process.env.PREPROD_REDIS_HOST || 'localhost';
    port = parseInt(process.env.PREPROD_REDIS_PORT || '6379', 10);
    password = process.env.PREPROD_REDIS_PASSWORD || undefined;
    db = parseInt(process.env.PREPROD_REDIS_DB || '0', 10);
    ssl = process.env.PREPROD_REDIS_SSL === 'true';
  }

  return { host, port, password, db, ssl };
}

/**
 * Connects to Redis and retrieves the OTP code for the given mobile number.
 * Features retry logic and wildcard key search matching the python automation framework.
 * 
 * @param mobileNumber The mobile number associated with the OTP code
 * @returns The retrieved OTP string
 */


export async function getOTP(mobileNumber: string): Promise<string> {
  const config = getRedisConfig();
  console.log(`Connected to Redis: ${config.host}:${config.port}`);

  const clientOpts: any = {
    host: config.host,
    port: config.port,
    db: config.db,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
  };

  if (config.password) {
    clientOpts.password = config.password;
  }

  if (config.ssl) {
    clientOpts.tls = {
      rejectUnauthorized: false,
    };
  }

  const redis = new Redis(clientOpts);

  redis.on('error', () => {
    // Suppress console warnings for unhandled connection errors
  });

  let otpValue: string | null = null;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  try {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // 1. Attempt direct lookups
        otpValue = await redis.get(`OTP:91${mobileNumber}`);
        if (!otpValue) {
          otpValue = await redis.get(`*OTP:91${mobileNumber}`);
        }

        // 2. Fallback to wildcard search if direct checks return null
        if (!otpValue) {
          const keysMatched = await redis.keys(`*${mobileNumber}*`);
          for (const key of keysMatched) {
            if (key.includes('OTP')) {
              otpValue = await redis.get(key);
              break;
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'MaxRetriesPerRequestError' || (err.message && err.message.includes('timeout'))) {
          throw new Error(`Redis connection timed out while trying to connect to ${config.host}:${config.port}. Please check your settings.`);
        }
        throw new Error(`Redis error: ${err.message || err}`);
      }

      if (otpValue) {
        console.log(`OTP found in Redis: ${otpValue}`);
        break;
      }

      console.log(`OTP not found in Redis, retrying... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    if (!otpValue) {
      throw new Error(`Failed to fetch OTP from Redis for phone number ${mobileNumber}`);
    }

    console.log(`Successfully fetched OTP from Redis: ${otpValue}`);
    return otpValue;

  } finally {
    // Guarantee closing connection to prevent Playwright hang
    await redis.quit();
  }
}
