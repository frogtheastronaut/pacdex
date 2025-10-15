import { run } from "../run_cmd.js";

function parseChoco(output) {
  return output
    .split("\n")
    .filter(line => line.trim() && !line.startsWith("Chocolatey v"))
    .map(line => line.split(" ")[0].replace(/\u001b\[[0-9;]*m/g, ""));
}

function parsePip(output) {
  return output
    .split("\n")
    .slice(2)
    .map(line => line.split(/\s+/)[0])
    .filter(Boolean);
}

function parseCargo(output) {
  return output
    .split("\n")
    .filter(Boolean)
    .map(line => line.replace(/\u001b\[[0-9;]*m/g, ""));
}

function parseScoop(output) {
  return output
    .split("\n")
    .filter(line => line.trim() && !line.startsWith("Installed apps:"))
    .map(line => line.replace(/\u001b\[[0-9;]*m/g, ""));
}

function scanPackageManagers() {
  const result = {};

  // nodejs through npm
  if (run("where npm")) result.npm = run("npm list -g --depth=0")
    .split("\n")
    .filter(line => line.trim().startsWith("├──") || line.trim().startsWith("└──"))
    .map(line => line.replace(/^[├└]──\s+/, "").split(" -> ")[0].split("@")[0]);

  // python through pip
  if (run("where pip")) result.pip = parsePip(run("pip list --format=columns"));

  // chocolatey
  if (run("where choco")) result.choco = parseChoco(run("choco list --local-only"));

  // rust through cargo
  if (run("where cargo")) result.cargo = parseCargo(run("cargo install --list"));

  // scoop
  if (run("where scoop")) result.scoop = parseScoop(run("scoop list"));

  return result;
}

function scan_windows() {
  const data = {};
  data.os = "Windows";
  data.packageManagers = scanPackageManagers();
  return data;
}

export { scan_windows };