interface Props {
  url: string;
}

export default function GeneratedLink({ url }: Props) {
  return (
    <>
      <p class="font-semibold">Request</p>
      <pre class="bg-gray-200 p-4 rounded text-sm h-full max-h-full overflow-y-auto break-words whitespace-pre-wrap">
        GET{" "}
        <a href={url} class="text-blue-600">
          {url}
        </a>
      </pre>
    </>
  );
}
