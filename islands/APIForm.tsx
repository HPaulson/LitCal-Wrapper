import { useState } from "preact/hooks";

export default function ApiForm({
  callback,
  host,
}: {
  host: string;
  callback: (url: string) => void;
}) {
  const [endpoint, setEndpoint] = useState("calendar");
  const [fields, setFields] = useState("");
  const [returnType, setReturnType] = useState("json");
  const [filters, setFilters] = useState<string[]>([]);
  const [excludeVigilMass, setExcludeVigilMass] = useState<string | null>(null);

  const BASE_URL = host + "/api/fetch";
  const filterOptions = [
    "Weekday",
    "Commemoration",
    "Optional Memorial",
    "Memorial",
    "Feast",
    "Feast of the Lord",
    "Solemnity",
    "Celebration With Precedence Over Solemnities",
  ];
  const seasons = [
    "ADVENT",
    "CHRISTMAS",
    "ORDINARY_TIME",
    "LENT",
    "EASTER_TRIDUUM",
    "EASTER",
  ];

  const handleGenerateUrl = (e: Event) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (endpoint) params.append("endpoint", endpoint);
    if (fields) params.append("fields", fields);
    if (returnType) params.append("returnType", returnType);

    filters.forEach((filter) => {
      params.append(
        "filter[grade][_eq]",
        filterOptions.indexOf(filter).toString()
      );
    });

    // This form only supports the English version of the LitCal API
    params.append("locale", "en_US");

    if (excludeVigilMass !== null) {
      params.append(
        `filter[is_vigil_mass][${excludeVigilMass ? "_neq" : "_eq"}]`,
        "true"
      );
    }

    callback(`${BASE_URL}?${params.toString()}`);
  };

  const handleFilterChange = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const handleVigilMassChange = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).checked ? "true" : null;
    setExcludeVigilMass(value);
  };

  return (
    <div>
      <h1 class="text-4xl font-bold mb-4">LitCal Query Builder</h1>
      <form onSubmit={handleGenerateUrl}>
        <label class="block mb-2 font-semibold">Endpoint:</label>
        <input
          type="text"
          value={endpoint}
          required
          onInput={(e) => setEndpoint(e.currentTarget.value)}
          class="w-full p-2 border rounded mb-4"
          placeholder="calendar"
        />

        <label class="block mb-2 font-semibold">
          Fields (comma-separated):
        </label>
        <input
          type="text"
          value={fields}
          onInput={(e) => setFields(e.currentTarget.value)}
          class="w-full p-2 border rounded mb-4"
          placeholder="e.g., date,name"
        />

        <label class="block mb-2 font-semibold">Return Type:</label>
        <select
          value={returnType}
          required
          onChange={(e) => setReturnType(e.currentTarget.value)}
          class="w-full p-2 border rounded mb-4"
        >
          <option value="json">JSON</option>
          <option value="ics">ICS (Calendar)</option>
        </select>

        <label class="block mb-2 font-semibold">Filter by Grade:</label>
        <div class="mb-4">
          {filterOptions.map((option) => (
            <label class="block">
              <input
                type="checkbox"
                value={option}
                checked={filters.includes(option)}
                onChange={handleFilterChange}
                class="mr-2"
              />
              {option}
            </label>
          ))}
        </div>

        <div class="mb-4 block">
          <label class="font-semibold pr-2">Exclude Vigil Mass</label>
          <input
            type="checkbox"
            checked={excludeVigilMass === "true"}
            onChange={handleVigilMassChange}
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate API Link
        </button>
      </form>
    </div>
  );
}
