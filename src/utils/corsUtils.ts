const processWhitelist = (): string[] => {
  return process.env.CORS_WHITELIST
    ? JSON.parse(process.env.CORS_WHITELIST).map((url: string) => url.trim())
    : [];
};

export default processWhitelist;
