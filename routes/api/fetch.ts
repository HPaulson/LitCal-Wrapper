import { Handlers } from "$fresh/server.ts";
import { APIWrapper } from "../../services/APIWrapper.ts";
import { produceIcal } from "../../services/produceICal.ts";

const BASE_URL = "https://litcal.johnromanodorazio.com/api/dev/";
const KEY = "litcal";

const apiWrapper = new APIWrapper(BASE_URL);

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
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

      if (isICS) {
        if (fields && !fields.includes("date")) {
          return new Response(
            "Bad Request. Calendar event has no date. Add ?fields=date to the query.",
            { status: 400, headers: { "Content-Type": "text/plain" } }
          );
        }
        const ics = produceIcal(data);
        return new Response(ics, {
          status: 200,
          headers: { "Content-Type": "text/calendar" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  },
};

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
      if (filters[filterKey][nestedKey]) {
        let newValue = filters[filterKey][nestedKey];
        const isArray = Array.isArray(newValue);
        isArray ? newValue.push(value) : (newValue = [newValue, value]);
        filters[filterKey][nestedKey] = newValue;
      } else filters[filterKey][nestedKey] = value;
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
