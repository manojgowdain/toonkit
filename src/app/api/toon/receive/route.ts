import { toonToJson } from "toonkit2";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const toonData = await req.text();

    if (!toonData || !toonData.trim()) {
      return Response.json(
        { error: "Empty TOON payload" },
        { status: 400 }
      );
    }

    console.log("RAW TOON:\n", toonData);

    const json = toonToJson(toonData);

    console.log("PARSED JSON:\n", { device_id: json?.device_id });

    return Response.json(json, { status: 200 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "TOON Parsing failed" },
      { status: 500 }
    );
  }
}