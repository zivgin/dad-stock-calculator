import { searchCompanies } from "@/lib/fmp-client";
import { demoSearch, isDemoMode } from "@/lib/demo-data";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return Response.json([]);
  }
  if (query.length > 100) {
    return Response.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    if (isDemoMode()) {
      return Response.json(demoSearch(query));
    }
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
