import { searchCompanies } from "@/lib/fmp-client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return Response.json([]);
  }

  try {
    const results = await searchCompanies(query);
    return Response.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "Failed to search companies" },
      { status: 500 }
    );
  }
}
