# Releasing process

To create a new release there are some steps is required:

## 1. Update package.json file

- In [package.json](../package.json) replace the value of `version` with the new release tag.

> NOTE: You can use tag x.x.x for releases & x.x.x-rcx for prereleases.

- Install node modules using

```ts
yarn
```

If you're using npm, you'll need to install the modules using

```ts
npm i
```

## 2. **Create a new release**

Create a new release with same value of `version` in `package.json`.<br>
While you're creating a new release you also have to create a new tag the same as the one in the `package.json`

> You can find more details about creating a new release in [Release projects](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).

Once you release, Publish workflow will start and will push the new released version to npm
