const protocolRegExp = /^http(s?):\/\//i;
const CLOUD_DOMAINS: string[] = ['myjetbrains.com', 'youtrack.cloud'];

const getPossibleUrls = (enteredUrl: string): string[] => {
  const targetURL: string = enteredUrl.toLowerCase();
  const isCloudURL: boolean = CLOUD_DOMAINS.some(
    (it: string) => targetURL.indexOf(`.${it}`) !== -1,
  );
  let urls: string[];

  if (isCloudURL) {
    const url: string = targetURL.replace(protocolRegExp, '');
    urls = [`https://${url}`, `https://${url}/youtrack`];
  } else {
    if (!protocolRegExp.test(targetURL)) {
      urls = [
        `https://${targetURL}`,
        `https://${targetURL}/youtrack`,
        `http://${targetURL}`,
        `http://${targetURL}/youtrack`,
      ];
    } else {
      urls = [targetURL, `${targetURL}/youtrack`];
    }
  }

  return urls;
};

const isValidURL = (url: string = ''): boolean => {
  const str: string = url.trim();
  return str.length > 0 && !str.match(/@/g);
};


export {
  getPossibleUrls,
  isValidURL,
};
