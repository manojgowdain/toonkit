import { jsonToToon } from "toonkit2";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const obj = await req.json();

    console.log("PARSED JSON:\n", obj);

    const toon = jsonToToon(obj);

    console.log("FORMATTED TOON:\n", toon);

    return new Response(toon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "JSON Conversion failed" },
      { status: 500 }
    );
  }
}