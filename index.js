#!/usr/bin/env node

import os from "os";
import { scan_mac } from "./platforms/mac.js";
import { scan_linux } from "./platforms/linux.js";
import { scan_windows } from "./platforms/windows.js";

function main() {
  const platform = os.platform();
  let info = {};

  if (platform === "darwin") info = scan_mac();
  else if (platform === "linux") info = scan_linux();
  else if (platform.startsWith("win")) info = scan_windows;
  else info = { os: "Unknown" };

  console.log(JSON.stringify(info, null, 2));
}

main();
