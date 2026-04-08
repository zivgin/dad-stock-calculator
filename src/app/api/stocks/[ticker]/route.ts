import { getFullStockData } from "@/lib/fmp-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker || !/^[A-Za-z.-]{1,10}$/.test(ticker)) {
    return Response.json({ error: "Invalid ticker" }, { status: 400 });
  }

  try {
    const data = await getFullStockData(ticker);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch stock data";
    return Response.json({ error: message }, { status: 500 });
  }
}
