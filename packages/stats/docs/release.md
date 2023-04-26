# Releasing process

To create a new release there are some steps is required:

## 1. **Update Chart file**

In [charts.yaml](../tfgrid-stats/Chart.yaml) replace the value of `appVersion` with the new release tag.

```yaml
appVersion: "x.x.x"
```

## 2. **Update values file**

In [values.yaml](../tfgrid-stats/values.yaml) change the tag with the new release tag.

```yaml
tag: "x.x.x"
```

## 3. **Create a new release**

Create a new release with the new tag added in `appVersion` & `Charts.yaml`.

1. On GitHub.com, navigate to the main page of the repository.
2. To the right of the list of files, click Releases.
3. Click Draft a new release.
4. Click Choose a tag, type a version number for your release, and press Enter. (Make sure the tag matches the one in values.yaml & Chart.yaml)
5. Add a description for your release, you can automatically generate your release notes by clicking Generate release notes.
6. Click Publish release. To work on the release later, click Save draft.

> You can find more details about creating a new release in [Release projects](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).

## 4. **Create a new issue on [tf_operations](https://github.com/threefoldtech/tf_operations)**

Create a new issue of type `Update Request` and mention the following:

- **Release link**

  You can find it by changing the branch to the needed tag and then copy the URL.

- **Charts directory link**

  In this case will be [tfgrid-stats](../tfgrid-stats/)

  Newly created issue should look like this:
  ![image](https://user-images.githubusercontent.com/40770501/211298715-a3b6882e-1251-4eb3-b3e3-26254b680137.png))
