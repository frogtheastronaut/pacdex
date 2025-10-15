import { run } from "../run_cmd.js";

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

function parseNix(output) {
  const lines = output.split("\n");
  const packages = [];
  for (let line of lines) {
    if (line.startsWith("Name:")) {
      const pkg = line.split("Name:")[1].trim();
      if (pkg) packages.push(pkg);
    }
  }
  return packages;
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

  if (run("which nix-env")) {
    let nixOutput = run("nix-env -q") || "";
    if (!nixOutput.trim()) nixOutput = run("nix profile list") || "";
    result.nix = parseNix(nixOutput);
  }

  return result;
}

function scan_mac() {
  const data = {};
  data.os = "macOS";

  data.packageManagers = scanPackageManagers();

  return data;
}
export { scan_mac };