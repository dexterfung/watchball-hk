import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: "Invalid revalidation secret" },
      { status: 401 },
    );
  }

  try {
    let paths = ["/"];

    try {
      const body = await request.json();
      if (Array.isArray(body.paths) && body.paths.length > 0) {
        paths = body.paths;
      }
    } catch {
      // No body or invalid JSON — use default path
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Revalidation failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
