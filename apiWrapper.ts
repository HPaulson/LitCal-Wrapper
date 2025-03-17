export class APIWrapper {
  baseURL: string;
  data: Array<Record<string, any>>;
  filters?: Record<string, any>;
  fields?: string[];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public async fetchData<T>(params: {
    endpoint: string;
    filters?: Record<string, any>;
    fields?: string[];
    key?: string;
    method?: "GET" | "POST";
    queryParams?: Record<string, string>;
    body?: Record<string, any>;
    headers?: HeadersInit;
  }) {
    const {
      endpoint,
      filters = {},
      fields,
      key,
      method = "GET",
      queryParams,
      body,
      headers,
    } = params;

    try {
      let url = new URL(`${this.baseURL}${endpoint}`);

      if (queryParams) {
        Object.entries(queryParams).forEach(([k, v]) =>
          url.searchParams.append(k, v)
        );
      }

      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", ...headers },
      };

      if (method === "POST" && body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), options);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        this.data = await response
          .json()
          .then((json) => (key ? json[key] : json));
        this.filters = filters;
        this.fields = fields;
      } else {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      this.applyFilters();
      this.applyFieldSelection();

      return this.data;
    } catch (error) {
      throw new Error(`Error fetching data: ${error}`);
    }
  }

  private applyFilters() {
    if (!this.filters) return;
    this.data = this.data.filter((item) => {
      return Object.keys(this.filters!).every((field) => {
        return this.matchFilter((item as any)[field], this.filters![field]);
      });
    });
  }

  private applyFieldSelection() {
    if (!this.fields) return;
    this.data = this.data.map((item) => {
      return this.fields!.reduce(
        (acc, field) => {
          if (field in item) {
            acc[field] = item[field];
          }
          return acc;
        },
        {} as Record<string, any>
      );
    });
  }

  private matchFilter(value: any, filter: Record<string, any>): boolean {
    for (const operator in filter) {
      const filterValue = filter[operator]?.toString();
      value = value?.toString();

      switch (operator) {
        case "_eq":
          if (value !== filterValue) return false;
          break;
        case "_neq":
          if (value === filterValue) return false;
          break;
        case "_lt":
          if (!(value < filterValue)) return false;
          break;
        case "_lte":
          if (!(value <= filterValue)) return false;
          break;
        case "_gt":
          if (!(value > filterValue)) return false;
          break;
        case "_gte":
          if (!(value >= filterValue)) return false;
          break;
        case "_in":
          if (!filterValue.includes(value)) return false;
          break;
        case "_nin":
          if (filterValue.includes(value)) return false;
          break;
        case "_null":
          if (filterValue !== (value === null)) return false;
          break;
        case "_nnull":
          if (filterValue !== (value !== null)) return false;
          break;
        case "_contains":
          if (typeof value !== "string" || !value.includes(filterValue))
            return false;
          break;
        case "_icontains":
          if (
            typeof value !== "string" ||
            !value.toLowerCase().includes(filterValue.toLowerCase())
          )
            return false;
          break;
        case "_starts_with":
          if (typeof value !== "string" || !value.startsWith(filterValue))
            return false;
          break;
        case "_ends_with":
          if (typeof value !== "string" || !value.endsWith(filterValue))
            return false;
          break;
        case "_between":
          if (!(value >= filterValue[0] && value <= filterValue[1]))
            return false;
          break;
        default:
          console.warn(`Unsupported filter operator: ${operator}`);
      }
    }
    return true;
  }
}
