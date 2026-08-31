import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "esmeralda-web",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
