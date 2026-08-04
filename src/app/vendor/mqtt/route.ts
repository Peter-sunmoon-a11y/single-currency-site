import { getMqttVendorResponse } from "@/lib/server/mqttVendor";

export const runtime = "nodejs";

export async function GET() {
  return getMqttVendorResponse();
}
