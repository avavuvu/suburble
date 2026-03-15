import type { Config } from "@netlify/functions";

export default async function () {
  await fetch(process.env.BUILD_HOOK_URL!, { method: "POST" });
}

export const config: Config = {
  schedule: "0 14 * * *"
};