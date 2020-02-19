# Bitbucket CLI

A CLI for interacting with a repository hosted on Bitbucket.

## Installation

Run:

```
yarn
yarn build
yarn link
```

Then run `bb init` to create a config file.

## Commands

### `bb pr:status [id]`

Displays the status of a given pull request ID. If the pull request ID is not
specified, offers a list of open pull requests.

### `bb pr:checkout [id]`

Checks out the branch for the given pull request ID. If the pull request ID
is not specified, offers a list of open pull requests to check out.

### `bb clean`

Offers to delete any local branches that are merged into the upstream master
branch.

## License

Licensed under the MIT license.
