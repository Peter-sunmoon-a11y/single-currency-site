export function parser(payload: string): any {
  if (!/^{.*}$/.test(payload)) return payload;
  const origin_payload = JSON.parse(payload);
  const output: any = {};
  for (const key in origin_payload) {
    if (origin_payload.hasOwnProperty(key)) {
      if (/^{.*}$/.test(origin_payload[key])) output[key] = parser(origin_payload[key]);
      else output[key] = origin_payload[key];
    }
  }
  return output;
}
