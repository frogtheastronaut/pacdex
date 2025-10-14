import os from "os";
import { run } from "../run_cmd.js";
import fs from "fs";
import path from "path";

function parseNpm(output) {
  return output
    .split("\n")
	// split @ in version if exists
	.map(line => line.split("@")[0])
    .filter(line => line.trim().startsWith("├──") || line.trim().startsWith("└──"))
    .map(line => line.replace(/^[├└]──\s+/, "").split(" -> ")[0]); 
}

function parsePip(output) {
	// remove @ in version if exists
  return output
    .split("\n")
    .slice(2)           // skip headers
    .map(line => line.split(/\s+/)[0])
    .filter(Boolean);
}

function parsePorts(output) {
	return output
	.split("\n")
	.filter(line => line.includes("@"))
	.map(line => line.trim().split(" ")[0]);
}

function scanPackageManagers() {
  const result = {};

  // nodejs through npm
  if (run("which npm")) result.npm = parseNpm(run("npm list -g --depth=0"));

  // python through pip3
  if (run("which pip3")) result.pip = parsePip(run("pip3 list --format=columns"));

  // rust through cargo
  if (run("which cargo")) result.cargo = run("cargo install --list").split("\n");

  if (run("which brew")) result.brew = run("brew list").split("\n");

  if (run("which port")) result.macport = parsePorts(run("port installed"));

  return result;
}

function scan_mac() {
  const data = {};
  data.os = "macOS";
  data.shell = process.env.SHELL || "unknown";

  // zsh history
  const hist = path.join(os.homedir(), ".zsh_history");
  if (fs.existsSync(hist)) {
    const history = run(`cat ${hist} | awk -F ';' '{print $2}' | awk '{print $1}' | sort | uniq -c | sort -nr | head -n 10`);
	data.topCommands = history.split("\n")
		.filter(Boolean)
		.map(line => {
			const [count, cmd] = line.trim().split(/\s+/, 2);
			return { [cmd]: Number(count) };
		});
  } else {
    data.topCommands = [];
  }

  // append package managers
  data.packageManagers = scanPackageManagers();

  return data;
}
export { scan_mac };