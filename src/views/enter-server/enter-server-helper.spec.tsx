import {getPossibleUrls, isValidURL} from 'views/enter-server/enter-server-helper';


describe('getPossibleUrls', () => {
  it('should return possible base URLs for a custom domain', () => {
    expect(getPossibleUrls('myyOutrack.com')).toEqual([
      'https://myyoutrack.com',
      'https://myyoutrack.com/youtrack',
      'http://myyoutrack.com',
      'http://myyoutrack.com/youtrack',
    ]);
  });

  it('should return possible base URLs for `youtrack.cloud` instances', () => {
    [
      'htTp://example.yOutrack.CLOUD',
      'htTps://example.yOutrack.CLOUD',
    ].forEach(utl => {
      expect(getPossibleUrls(utl)).toEqual([
        'https://example.youtrack.cloud',
        'https://example.youtrack.cloud/youtrack',
      ]);
    });
  });

  it('should return possible base URLs for `myjetbrains.com` instances', () => {
    [
      'htTp://exAmple.MyJetbrains.Com',
      'htTps://exAmple.MyJetbrains.Com',
    ].forEach(utl => {
      expect(getPossibleUrls(utl)).toEqual([
        'https://example.myjetbrains.com',
        'https://example.myjetbrains.com/youtrack',
      ]);
    });
  });
});

describe('isValidURL', () => {
  it('should allow not empty URL', async () => {
    expect(isValidURL('')).toEqual(false);
    expect(isValidURL(' ')).toEqual(false);
  });

  it('should process NUll', async () => {
    expect(isValidURL(null)).toEqual(false);
  });

  it('should validate server URL', () => {
    expect(isValidURL('ab/')).toEqual(true);
    expect(isValidURL('ab.c')).toEqual(true);
    expect(isValidURL('ab.cd')).toEqual(true);
    expect(isValidURL('a.aus')).toEqual(true);
    expect(isValidURL('a.youtrack.i/')).toEqual(true);
    expect(isValidURL('www.a.au')).toEqual(true);
    expect(isValidURL('www.a.b.cd')).toEqual(true);
    expect(isValidURL('www.a.bc/youtrack/me')).toEqual(
      true,
    );
    expect(isValidURL('https://www.a.bc')).toEqual(true);
    expect(isValidURL('https://a.bc')).toEqual(true);
    expect(isValidURL('http://www.a.bc')).toEqual(true);
    expect(isValidURL('http://a.bc')).toEqual(true);
  });
});
