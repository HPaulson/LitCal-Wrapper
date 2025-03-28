## Overview

Wrapper for [LiturgicalCalendarAPI](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI) to implement [Directus](https://directus.io)-like filtering.

This project began as a quick and dirty attempt at implementing/demonstrating [this](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI/issues/43#issuecomment-2712105997) suggestion in deno/Typescript, but it ended up being a fairly complete solution that met my use case.

The best way to experiment with this wrapper is to test out some queries using the [playground](https://litcal.deno.dev). It does not support all features, since the filter options are practically endless, but it has the most popular options.

## Documentation

`GET https://litcal.deno.dev/api/fetch`

Query Params:

- `endpoint` The LitCal API endpoint you wish to use. E.g `calendar`. Required.
- `filter` Takes in a data field key, a filter type, and a filter value. E.g `filter[grade_lcl][_eq]=SOLEMNITY`. Filter keys from Directus (Since they are similar enough) can be found [here](https://docs.directus.io/reference/filter-rules.html#filter-operators). Data keys can be found in this [schema](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI/blob/f6c8554b0d44a667ed44a078b13564cc7b8b89fc/jsondata/schemas/LitCal.json#L250). Multiple `filter` query params can be sent in a single request. E.g `?filter[grade_lcl][_eq]=SOLEMNITY&filter[name][_icontains]=Sunday` will provide all events that satisfy BOTH `grade_lcl=SOLEMNITY` *AND* have `Sunday` in the `name` field. If two filters are of the same field and operator, the wrapper returns results of EITHER filter. E.g `?filter[grade_lcl][_eq]=SOLEMNITY&filter[name][_eq]=FEAST` gives any results with EITHER `grade_lcl=SOLEMNITY` *OR* `grade_lcl=FEAST`. Default, none.
- `fields` CSV string of data field keys to include in each object. E.g `name,date,month_short`. Default, all.
- `returnType` Only supports json or ics. E.g `returnType=ics`. Default, `json`.
- Any other query params will be sent to LitCal api. E.g `locale`, `year_type`.

## Develop Locally

Requires Deno.

`deno task start`

## Deploy

I recommend using the free tier of [Deno Deploy](https://deno.com/deploy).
