import { useState, useEffect } from "preact/hooks";
import GeneratedLink from "../components/GeneratedLink.tsx";

interface ApiResponseBoxProps {
  url: string | null;
}

export default function ApiResponseBox({ url }: ApiResponseBoxProps) {
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        setData(text);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  }, [url]);

  const renderFormattedData = () => {
    try {
      const jsonData = JSON.parse(data);
      return (
        <>
          <p class="font-semibold">Data ({jsonData.length} objects)</p>
          <pre class="bg-gray-200 p-4 rounded text-sm h-full max-h-full overflow-y-auto break-words whitespace-pre-wrap">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </>
      );
    } catch {
      return (
        <>
          <p class="font-semibold">Data</p>
          <pre class="bg-gray-200 p-4 rounded text-sm h-full max-h-full overflow-y-auto break-words whitespace-pre-wrap">
            {data}
          </pre>
        </>
      );
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p class="text-red-500">{error}</p>}
      {!loading && !error && url && (
        <>
          <GeneratedLink url={url} />
          {renderFormattedData()}
        </>
      )}
    </div>
  );
}
