import { getFullStockData } from "@/lib/fmp-client";
import { demoGetStock, isDemoMode } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker || !/^[A-Za-z.-]{1,10}$/.test(ticker)) {
    return Response.json({ error: "Invalid ticker" }, { status: 400 });
  }

  try {
    if (isDemoMode()) {
      const data = demoGetStock(ticker);
      if (!data) {
        return Response.json(
          { error: `No demo data for ${ticker.toUpperCase()}. Try AAPL, MSFT, GOOGL, NVDA, AMZN, META, TSLA, JPM, V, WMT, JNJ, or UNH.` },
          { status: 404 }
        );
      }
      return Response.json(data);
    }

    const data = await getFullStockData(ticker);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return Response.json(
      { error: `Failed to fetch data for ${ticker.toUpperCase()}` },
      { status: 500 }
    );
  }
}
