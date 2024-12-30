// utils/generateVlessURI.ts

export function generateVlessURI(
    uuid: string,
    email: string,
    options?: {
      host?: string;
      port?: number;
      type?: string;
      security?: string;
      pbk?: string;
      fp?: string;
      sni?: string;
      sid?: string;
      spx?: string;
      flow?: string;
    }
  ): string {
    const {
      host = '89.250.71.168',
      port = 443,
      type = 'tcp',
      security = 'reality',
      pbk = 'ZADssN0fV0xCnDBQcdVzkf7hR97QyD2O47TC_g4dhWs',
      fp = 'chrome',
      sni = 'cloudflare.com',
      sid = 'cdf3fdb0',
      spx = '/', // Передаём необработанную строку
      flow = 'xtls-rprx-vision',
    } = options || {};
  
    // Проверяем, закодирован ли уже spx
    const encodedSpx = spx.startsWith('%') ? spx : encodeURIComponent(spx);
  
    const uri = `vless://${uuid}@${host}:${port}?type=${type}&security=${security}&pbk=${pbk}&fp=${fp}&sni=${sni}&sid=${sid}&spx=${encodedSpx}&flow=${flow}#${encodeURIComponent(email)}`;
  
    return uri;
  }
  