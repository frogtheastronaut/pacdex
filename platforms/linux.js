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
    .slice(2)
    .map(line => line.split(/\s+/)[0])
    .filter(Boolean);
}

function parseApt(output) {
  return output
    .split("\n")
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split("/")[0]);
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

function parseNix(output) {
  const lines = output.split("\n");
  const packages = [];
  for (let line of lines) {
    line = line.replace(/\u001b\[[0-9;]*m/g, ""); // remove ANSI codes
    if (line.startsWith("Name:")) {
      const pkg = line.split("Name:")[1].trim();
      if (pkg) packages.push(pkg);
    }
  }
  return packages;
}

function scanPackageManagers() {
  const result = {};

  // npm
  if (run("which npm")) result.npm = parseNpm(run("npm list -g --depth=0"));

  // python pip3
  if (run("which pip3")) result.pip = parsePip(run("pip3 list --format=columns"));

  // cargo rust
  if (run("which cargo")) result.cargo = run("cargo install --list").split("\n").filter(Boolean);

  // linux package managers
  if (run("which apt")) result.apt = parseApt(run("apt list --installed"));
  if (run("which pacman")) result.pacman = parsePacman(run("pacman -Q"));
  if (run("which dnf")) result.dnf = parseDnf(run("dnf list installed"));

  if (run("which nix-env")) {
    let nixOutput = run("nix-env -q") || "";
    if (!nixOutput.trim()) nixOutput = run("nix profile list") || "";
    result.nix = parseNix(nixOutput);
  }

  return result;
}

function scan_linux() {
  const data = {};
  data.os = "Linux";
  data.packageManagers = scanPackageManagers();
  return data;
}

export { scan_linux };
