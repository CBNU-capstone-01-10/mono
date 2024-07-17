interface params {
  [key: string]: string | undefined;
}

function generateURL(url: string, params?: params): string {
  if (!params) {
    return url;
  }

  return `${url}?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;
}

function isValidURL(url: string, protocols?: string[]): boolean {
  try {
    const s = new URL(url);

    if (!protocols) {
      return true;
    }

    return protocols
      ? s.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(s.protocol)
        : false
      : true;
  } catch (e) {
    return false;
  }
}

export { generateURL, isValidURL };
