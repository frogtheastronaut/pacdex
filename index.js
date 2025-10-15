#!/usr/bin/env node

import os from "os";
import { scan_mac } from "./platforms/mac.js";
import { scan_linux } from "./platforms/linux.js";
import { scan_windows } from "./platforms/windows.js";
import readline from "readline";

function skip_upload() {
  return process.argv.includes("--no-upload");
}

function main() {
  const platform = os.platform();
  let info = {};

  if (platform === "darwin") info = scan_mac();
  else if (platform === "linux") info = scan_linux();
  else if (platform === "win32") info = scan_windows();
  else info = { os: "Unknown/Unsupported" };

  if (!skip_upload()) askUpload(info);
}

function askUpload(info) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  rl.question("Upload results to Pacdex? (y/n) ", (answer) => {
    if (answer.toLowerCase() !== "y") {
      console.log("Skipped upload");
      rl.close();
      return;
    }

    rl.question("Enter your Pacdex token: ", async (token) => {
      if (!token.trim()) {
        console.log("No token provided, skipped upload");
        rl.close();
        return;
      }
      info.token = token.trim();
      await upload(info);
      rl.close();
    });
  });
}

async function upload(data) {
  try {
    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log(JSON.stringify(data, null, 2));

    if (!res.ok) throw new Error(`upload failed: ${res.status}`);
    const json = await res.json();
    console.log("Uploaded data!", json);
  } catch (err) {
    console.error("Upload error:", err.message);
  }
}

main();
