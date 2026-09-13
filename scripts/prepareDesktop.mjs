import { cp, mkdir, rm } from "node:fs/promises";

const destination = "build/workbench";
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp("desktop", destination, { recursive: true });
await cp("build/prod", `${destination}/chef`, { recursive: true });
console.log("Cyber Workbench desktop assets prepared.");
