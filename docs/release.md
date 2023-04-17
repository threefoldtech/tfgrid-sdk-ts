# Releasing process

To create a new release there are some steps is required:

## 1. Update Versions

1- This can be done by running this command:

```bash
lerna version
```

This command will Update the versions of all packages and also it will update the package version if it's used as a dependency in the other packages in the monorepo except the playground package as it's an inner package in the weblets package.

2- Update the grid client package manually in the playground.

## 2. **Create a new release**

Create a new release on GitHub with same value of `version` in `package.json` of the root package.

While you're creating a new release you also have to create a new tag the same as the one in the `package.json` in the root package.

> You can find more details about creating a new release in [Release projects](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).

Once you release, Publish workflow will start and will push the new released version to npm and build containers for the released projects.
