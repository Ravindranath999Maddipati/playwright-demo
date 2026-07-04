# Implementation Plan: Redis Integration for OTP Retrieval

This plan details how to add Redis connectivity to the Playwright project to dynamically retrieve OTPs during login.

## User Review Required

> [!IMPORTANT]
> - We will install `ioredis` as a dependency. It is the industry standard Redis client for Node.js / TypeScript.
> - We will create a `utils/` directory to store the Redis helper script. This keeps test scripts clean and reusable.

## Open Questions
* **OTP Key Pattern:** How is the OTP key stored in Redis? (e.g., is it stored under a key like `otp:<mobile_number>` or `cms:otp:<mobile_number>`?) We will assume a pattern like `otp:${mobileNumber}` in our code, but you will need to adjust the key name based on your backend Redis schema.

---

## Proposed Changes

### Configuration & Credentials

#### [MODIFY] [.env](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/.env)
We will add Redis configuration variables for Dev, SIT, and Pre-Prod environments.

```env
# Redis Credentials - Dev
DEV_REDIS_HOST=localhost
DEV_REDIS_PORT=6379
DEV_REDIS_PASSWORD=
DEV_REDIS_DB=0
DEV_REDIS_SSL=false

# Redis Credentials - SIT
SIT_REDIS_HOST=sit-redis.statiq.in
SIT_REDIS_PORT=6379
SIT_REDIS_PASSWORD=your_sit_password
SIT_REDIS_DB=0
SIT_REDIS_SSL=true

# Redis Credentials - Pre-Prod
PREPROD_REDIS_HOST=preprod-redis.statiq.co.in
PREPROD_REDIS_PORT=6379
PREPROD_REDIS_PASSWORD=your_preprod_password
PREPROD_REDIS_DB=0
PREPROD_REDIS_SSL=true
```

#### [MODIFY] [.env.example](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/.env.example)
Add placeholders matching the new Redis environment variables.

---

### Utility Helper

#### [NEW] [utils/redis.ts](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/utils/redis.ts)
We will create a `utils` folder and add `redis.ts` to manage connecting to the correct Redis server and retrieving the OTP.

It will:
1. Identify the current environment (`ENV=dev|sit|preprod`).
2. Read the corresponding Redis credentials from `process.env`.
3. Connect using `ioredis` (with TLS/SSL support, mapping `ssl=true` to connection options).
4. Fetch the OTP code using `r.get(key)`.

---

## Verification Plan

### Automated Tests
1. Run `npm install ioredis --save-dev` to install the dependency.
2. We will write a test in `tests/login.spec.ts` that calls `getOTP(process.env.LOGIN_NUMBER)` and prints the result to verify the connection and value retrieval.
3. Execute the tests locally using:
   ```bash
   npx playwright test tests/login.spec.ts
   ```
