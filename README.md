# lfg

Frontend project auto-configuration

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g lfg
$ lfg COMMAND
running command...
$ lfg (--version)
lfg/0.0.0 darwin-arm64 node-v14.17.5
$ lfg --help [COMMAND]
USAGE
  $ lfg COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`lfg write`](#lfg-write)

## `lfg write`

Update project configuration, those files will be overridden if you have any of them in the current project:

- .gitignore
- .prettierrc
- .eslintrc
- .husky
- .commitlintrc.json

Add scripts:`release`

Commit linting: run before committing your code

- lint-staged: code formatting with Prettier
- commitlint: linting commit message with Conventional Commits

```
USAGE
  $ lfg write

ARGUMENTS
  no arguments

FLAGS
  no flags
```
