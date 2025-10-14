import { run } from "../run_cmd.js";

function parseNpm(output) {
  return output
    .split("\n")
    .filter(line => line.trim().startsWith("├──") || line.trim().startsWith("└──"))
    .map(line => line.replace(/^[├└]──\s+/, "").split(" -> ")[0].split("@")[0]);
}

function parsePip(output) {
  return output
    .split("\n")
    .slice(2)           // skip headers
    .map(line => line.split(/\s+/)[0])
    .filter(Boolean);
}

function parseApt(output) {
  return output
    .split("\n")
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split("/")[0]); // remove architecture info
}

function parsePacman(output) {
  return output
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => line.split(" ")[0]);
}

function parseDnf(output) {
  return output
    .split("\n")
    .filter(line => line.trim() !== "" && !line.includes("Installed Packages"))
    .map(line => line.split(".")[0]);
}

function scanPackageManagers() {
  const result = {};

  // Node
  if (run("which npm")) result.npm = parseNpm(run("npm list -g --depth=0"));

  // Python
  if (run("which pip3")) result.pip = parsePip(run("pip3 list --format=columns"));

  // Rust
  if (run("which cargo")) result.cargo = run("cargo install --list").split("\n");

  // Linux package managers
  if (run("which apt")) result.apt = parseApt(run("apt list --installed"));
  if (run("which pacman")) result.pacman = parsePacman(run("pacman -Q"));
  if (run("which dnf")) result.dnf = parseDnf(run("dnf list installed"));

  return result;
}

function scan_linux() {
  const data = {};
  data.os = "Linux";

  // append package managers
  data.packageManagers = scanPackageManagers();

  return data;
}

export { scan_linux };
