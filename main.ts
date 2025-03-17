import { serve } from "https://deno.land/std/http/server.ts";
import { APIWrapper } from "./apiWrapper.ts";
import { produceIcal } from "./LitCal.ts";

const BASE_URL = "https://litcal.johnromanodorazio.com/api/dev/";
const KEY = "litcal";

const apiWrapper = new APIWrapper(BASE_URL);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/fetch") {
    const endpoint = url.searchParams.get("endpoint");
    if (!endpoint) {
      return new Response("Missing 'endpoint' query parameter", {
        status: 400,
      });
    }

    const filters = parseFilters(url.searchParams);
    const fields = url.searchParams.get("fields")?.split(",");
    const isICS = url.searchParams.get("returnType") === "ics";
    const queryParams = parseQueryParams(url.searchParams);

    try {
      const data = await apiWrapper.fetchData({
        endpoint,
        filters,
        fields,
        queryParams,
        key: KEY,
      });
      let resp = new Response();
      if (isICS) {
        if (fields && !fields.includes("date"))
          return new Response(
            "Bad Request. Calender event has no date. Add ?fields=date to the query.",
            {
              status: 400,
              headers: { "Content-Type": "text/plain" },
            }
          );
        const ics = produceIcal(data);
        return new Response(ics, {
          status: 200,
          headers: { "Content-Type": "text/calendar" },
        });
      } else {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

function parseFilters(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter[") && key.includes("]")) {
      const parts = key.slice(7, -1).split("][");
      const filterKey = parts[0];
      const nestedKey = parts[1];
      if (!filters[filterKey]) {
        filters[filterKey] = {};
      }
      filters[filterKey][nestedKey] = value;
    }
  }
  return filters;
}

function parseQueryParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const queryParams: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (
      !key.startsWith("filter[") &&
      key !== "fields" &&
      key !== "endpoint" &&
      key !== "returnType"
    ) {
      queryParams[key] = value;
    }
  }
  return queryParams;
}

serve(handler, { port: 8000 });
