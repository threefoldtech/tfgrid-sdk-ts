# Releasing process

To create a new release there are some steps is required:

## Update Charts file

- In [playground Chart.yaml](../packages/playground/playground-charts/Chart.yaml), and [stats Chart.yaml](../packages/stats/chart/Chart.yaml) replace the value of `appVersion` with the new release tag.
- In [playground values.yaml](../packages/playground/playground-charts/values.yaml), and [stats values.yaml](../packages/stats/chart/values.yaml) replace the value of `tag` with the new release tag.

> NOTE: You can release or prerelease on ANY network. No tags are needed for releases & use x.x.x-rcx for prereleases.

```yaml
appVersion: "x.x.x"
```

## Update Versions

- This can be done by running this command:

  ```bash
  lerna version --force-publish --exact
  ```

  This command will Update the versions of all packages and also it will update the package version if it's used as a dependency in the other packages in the monorepo. Make sure to add `exact` flag; this will specify updated dependencies in updated packages exactly (with no punctuation).

## Create a new release

Create a new release on GitHub with same value of `version` in `package.json` of the root package.

While you're creating a new release you also have to create a new tag the same as the one in the `package.json` in the root package.

> You can find more details about creating a new release in [Release projects](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).

Once you release, Publish workflow will start and will push the new released version to npm and build containers for the released projects.

## Create a new issue on [tf_operations](https://github.com/threefoldtech/tf_operations)

Create a new issue for each project of type `Update Request` (Playground & Stats) and mention the following:

- **Release link**

  Make sure to change the '<tag>' in the link with the required tag

- **Charts directory link**

  Links will differ as the per the package:

  - [playground-charts](https://github.com/threefoldtech/tfgrid-sdk-ts/tree/<tag>/packages/playground/playground-charts/)

Newly created issue should look like this:

![image](https://user-images.githubusercontent.com/40770501/214016988-96a378a6-cb8b-4e15-aeb2-2c44576f9133.png)
