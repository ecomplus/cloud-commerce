import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  logger,
  checkoutRateLimitsCollection as COLLECTION,
  type AntiFraudConfig,
} from '@cloudcommerce/firebase/lib/config';

const firstHeader = (
  headers: Record<string, string | string[] | undefined>,
  name: string,
) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const checkKey = async (
  firestore: ReturnType<typeof getFirestore>,
  key: string,
  limit: number,
  now: number,
  checkoutWindowMs: number,
  expireAt: Timestamp,
): Promise<{ blocked: boolean; reason: string }> => {
  const ref = firestore.collection(COLLECTION).doc(key);
  let blocked = false;

  await firestore.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const data = doc.exists ? doc.data()! : { count: 0, windowStart: now };
    const withinWindow = (now - data.windowStart) < checkoutWindowMs;
    const count = withinWindow ? data.count + 1 : 1;
    const windowStart = withinWindow ? data.windowStart : now;
    t.set(ref, {
      count, windowStart, updatedAt: now, key, expireAt,
    });
    if (count > limit) blocked = true;
  });

  return { blocked, reason: key.startsWith('addr') ? 'address' : 'ip' };
};

export default async function antiFraudRateLimit(
  req: { body: any; headers: Record<string, string | string[] | undefined>; ip?: string },
  options: Exclude<AntiFraudConfig, false> = {},
): Promise<{ blocked: boolean; reason?: string }> {
  const {
    checkoutWindowMs = 10 * 60 * 1000,
    checkoutLimitAddr = 10,
    checkoutLimitIp = 10,
    ttlHours = 24,
  } = options;

  try {
    const firestore = getFirestore();
    const now = Date.now();
    const expireAt = Timestamp.fromMillis(now + ttlHours * 60 * 60 * 1000);

    // Client IP may pass through CDN layers; mirror the SSR header chain,
    // preferring edge-set headers over the spoofable X-Forwarded-For.
    const ipsHeader = firstHeader(req.headers, 'x-real-ip')
      || firstHeader(req.headers, 'x-forwarded-for')
      || firstHeader(req.headers, 'cf-connecting-ip')
      || firstHeader(req.headers, 'fastly-client-ip');
    const realIp = (ipsHeader?.split(',')[0] || req.ip)?.trim() || '';

    const to = req.body?.shipping?.to;
    const zip = String(to?.zip || '').replace(/\D/g, '');
    const number = String(to?.number || '');
    const addrKey = zip && number ? `addr_${zip}_${number}` : null;
    const ipKey = realIp ? `ip_${realIp.replace(/[.:]/g, '_')}` : null;

    const checks: Array<{ key: string; limit: number }> = [];
    if (addrKey) checks.push({ key: addrKey, limit: checkoutLimitAddr });
    if (ipKey) checks.push({ key: ipKey, limit: checkoutLimitIp });

    const results = await Promise.all(
      checks.map(({ key, limit }) => {
        return checkKey(firestore, key, limit, now, checkoutWindowMs, expireAt);
      }),
    );

    const hit = results.find((r) => r.blocked);
    if (hit) {
      logger.warn(`Checkout blocked by rate limit — reason: ${hit.reason}`);
      return { blocked: true, reason: hit.reason };
    }
  } catch (err) {
    logger.warn('Anti-fraud rate limit check failed, allowing checkout', { err });
  }

  return { blocked: false };
}
