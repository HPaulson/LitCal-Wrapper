import { Handlers } from "$fresh/server.ts";
import Home from "../islands/Home.tsx";

export const handler: Handlers = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const host = url.origin;
    return ctx.render({ host });
  },
};

export default function Index({ data }: { data: { host: string } }) {
  return (
    <>
      <Home host={data.host} />
    </>
  );
}
