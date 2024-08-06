import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';

export const pathToDocId = (pathname: string) => {
  return pathname.slice(1).trim()
    .toLowerCase()
    .replace(/\/+/g, '_00_')
    .replace(/_{2,}/g, '_')
    .replace(/[\W\r\n]/gm, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-)|(-$)/g, '')
    .substring(0, 1499);
};

// Compiled code from https://www.npmjs.com/package/isbot?activeTab=code
// eslint-disable-next-line
const fullBotPattern = " daum[ /]| deusu/| yadirectfetcher|(?:^|[^g])news|(?<! (?:channel/|google/))google(?!(app|/google| pixel))|(?<! cu)bot(?:[^\\w]|_|$)|(?<!(?: ya| yandex|^job|inapp;) ?)search|(?<!(?:lib))http|(?<![hg]m)score|(?<!android|ios)@|\\(\\)|\\.com|^12345|^<|^[\\w \\.\\-\\(?:\\):]+(?:/v?\\d+(?:\\.\\d+)?(?:\\.\\d{1,10})*?)?(?:,|$)|^[^ ]{50,}$|^\\w+/[\\w\\(\\)]*$|^active|^ad muncher|^amaya|^avsdevicesdk/|^biglotron|^bot|^bw/|^clamav[ /]|^client/|^cobweb/|^custom|^ddg[_-]android|^discourse|^dispatch/\\d|^downcast/|^duckduckgo|^facebook|^getright/|^gozilla/|^hobbit|^hotzonu|^hwcdn/|^jeode/|^jetty/|^jigsaw|^microsoft bits|^movabletype|^mozilla/\\d\\.\\d \\(compatible;?\\)$|^mozilla/\\d\\.\\d \\w*$|^navermailapp|^netsurf|^offline explorer|^postman|^python|^rank|^read|^reed|^rest|^serf|^snapchat|^space bison|^svn|^swcd |^taringa|^thumbor/|^track|^valid|^w3c|^webbandit/|^webcopier|^wget|^whatsapp|^wordpress|^xenu link sleuth|^yahoo|^yandex|^zdm/\\d|^zoom marketplace/|^{{.*}}$|analyzer|archive|ask jeeves/teoma|bit\\.ly/|bluecoat drtr|browsex|burpcollaborator|capture|catch|check|chrome-lighthouse|chromeframe|classifier|cloud|crawl|cypress/|dareboost|datanyze|dejaclick|detect|dmbrowser|download|evc-batch/|feed|firephp|gomezagent|headless|httrack|hubspot marketing grader|hydra|ibisbrowser|images|insight|inspect|iplabel|ips-agent|java(?!;)|library|mail\\.ru/|manager|measure|neustar wpm|node|nutch|offbyone|optimize|pageburst|parser|perl|phantomjs|pingdom|powermarks|preview|proxy|ptst[ /]\\d|reputation|resolver|retriever|rexx;|rigor|robot|rss|scan|scrape|server|sogou|sparkler/|speedcurve|spider|splash|statuscake|supercleaner|synapse|synthetic|tools|torrent|trace|transcoder|url|virtuoso|wappalyzer|watch|webglance|webkit2png|whatcms/|zgrab";

let botRegex: RegExp | undefined;
function getBotRegex() {
  if (botRegex instanceof RegExp) {
    return botRegex;
  }
  try {
    botRegex = new RegExp(fullBotPattern, 'i');
  } catch {
    botRegex = /bot|spider|crawl|http|lighthouse|inspect/i;
  }
  return botRegex;
}

export const checkUserAgent = (userAgent?: string) => {
  return !!userAgent && !(getBotRegex().test(userAgent));
};

type CacheValue = { timestamp: number, data: any };
type CachedRequestInit = RequestInit & {
  cacheKey?: string,
  maxAge?: number,
  canUseStale?: boolean,
  timeout?: number,
};
const runtimeCache: Record<string, CacheValue | undefined> = {};
const runtimeFetchings: Record<string, Promise<Response> | undefined> = {};

// Also declared at `storefront/server.d.ts`
export const fetchAndCache = async (
  url: URL | string,
  {
    maxAge = 1800,
    canUseStale = true,
    cacheKey,
    timeout = 4000,
    ...reqInit
  }: CachedRequestInit = {},
) => {
  const key = cacheKey || `${url}`.replace(/\//g, '$').substring(0, 1499);
  const now = Date.now();
  const ttlMs = maxAge * 1000;
  if (runtimeCache[key] && runtimeCache[key].timestamp + ttlMs >= now) {
    return runtimeCache[key].data;
  }
  const docRef = getFirestore().doc(`ssrFetchCache/${key}`);
  const runFetch = async () => {
    let abortController: AbortController | undefined;
    let timer: NodeJS.Timeout | undefined;
    if (timeout) {
      abortController = new AbortController();
      timer = setTimeout(() => {
        abortController!.abort();
      }, timeout);
      reqInit.signal = abortController.signal;
    }
    const fetching = runtimeFetchings[key] || fetch(url, reqInit);
    runtimeFetchings[key] = fetching;
    const response = await fetching;
    delete runtimeFetchings[key];
    if (timer) {
      clearTimeout(timer);
    }
    if (response.status > 199 && response.status < 300) {
      try {
        const data = await response.json();
        const cacheVal = { timestamp: now, data };
        runtimeCache[key] = cacheVal;
        docRef.set(cacheVal);
        return data;
      } catch (err: any) {
        err.url = url;
        err.statusCode = response.status;
        throw err;
      }
    }
    const error: any = new Error(`Failed fetching ${url}`);
    error.response = response;
    throw error;
  };
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const cacheVal = docSnap.data() as CacheValue;
    if (cacheVal.timestamp + ttlMs >= now) {
      runtimeCache[key] = cacheVal;
      return cacheVal.data;
    }
    if (canUseStale) {
      runFetch().catch(logger.error);
      return cacheVal.data;
    }
  }
  return runFetch();
};
