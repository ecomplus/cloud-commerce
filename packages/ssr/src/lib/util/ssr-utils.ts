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
  } catch (error) {
    botRegex = /bot|spider|crawl|http|lighthouse|inspect/i;
  }
  return botRegex;
}

export const checkUserAgent = (userAgent?: string) => {
  return !!userAgent && !(getBotRegex().test(userAgent));
};
