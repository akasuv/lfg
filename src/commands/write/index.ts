import { Command } from "@oclif/core";
const fs = require("fs");
const download = require("download");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const prettier = require("prettier");
const cliProgress = require("cli-progress");
const loading = require("loading-cli");
const cliSpinners = require("cli-spinners");

const baseUrl =
  "https://raw.githubusercontent.com/cyberconnecthq/react-starter-kit/main/";
const files = [
  { name: ".gitignore", dest: "./" },
  { name: ".commitlintrc.json", dest: "./" },
  { name: ".eslintrc", dest: "./" },
  { name: ".prettierrc", dest: "./" },
  { name: ".husky/commit-msg", dest: ".husky" },
  { name: ".husky/pre-commit", dest: ".husky" },
];

export class Write extends Command {
  static description = "Update project configuration";

  async downloadConfiguration(): Promise<void> {
    const load = loading({
      text: "Downloading configurations",
      frames: cliSpinners.dots.frames,
    }).start();
    await Promise.all(
      files
        .map((file) => ({ url: baseUrl + file.name, dest: file.dest }))
        .map((file) => download(file.url, file.dest))
    );
    load.succeed();
  }

  async installDeps() {
    const load = loading({
      text: "Installing dependencies",
      frames: cliSpinners.dots.frames,
    }).start();
    await exec(
      "npm install --save-dev eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks prettier standard-version @commitlint/{cli,config-conventional}"
    );
    await exec(
      'npm install husky --save-dev && npx husky install && npm set-script prepare "husky install" && npx husky add .husky/commit-msg \'npx --no-install commitlint --edit "$1"\''
    );
    load.succeed();
  }

  modifyPackageJson() {
    const load = loading({
      text: "Updating Package.json",
      frames: cliSpinners.dots.frames,
    }).start();
    const parsedRes = JSON.parse(fs.readFileSync("package.json", "utf8"));

    const scripts = {
      release: "standard-version",
    };

    const properties = {
      "lint-staged": {
        "*.{js,json,yml,yaml,css,scss,ts,tsx,md}": ["prettier --write"],
      },
    };

    const updated = {
      ...parsedRes,
      scripts: { ...parsedRes.scripts, ...scripts },
      ...properties,
    };

    fs.writeFileSync(
      "package.json",
      prettier.format(JSON.stringify(updated), { parser: "json" })
    );

    load.succeed();
  }

  rename() {
    const names = ["eslintrc", "prettierrc", "commitlintrc.json", "gitignore"];
    names.forEach((name) => fs.renameSync(name, "." + name));
  }

  async commit() {
    const localFiles = fs.readdirSync(process.cwd());
    let files = [
      ".commitlintrc.json",
      ".eslintrc",
      ".husky",
      ".prettierrc",
      "package.json",
    ];

    if (localFiles.includes("yarn.lock")) {
      files.push("yarn.lock");
    }

    if (localFiles.includes("package-lock.json")) {
      files.push("package-lock.json");
    }

    await exec(`git add ${files.join(" ")}`);
    await exec(`git commit -m 'chore: update project configuration'`);
  }

  async run(): Promise<void> {
    const files = fs.readdirSync(process.cwd());

    if (!files.includes("package.json")) {
      this.log("lfg write is not made for empty projects.");
      return;
    }

    await this.installDeps();
    await this.downloadConfiguration();
    this.rename();
    this.modifyPackageJson();
    exec("chmod ug+x .husky/* && chmod ug+x .git/hooks/*");
    await this.commit();
  }
}
