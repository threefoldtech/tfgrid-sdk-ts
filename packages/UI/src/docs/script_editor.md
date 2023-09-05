# Script Editor Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Importing the Script Editor](#importing-the-script-editor)
   - [Initializing the Script Editor](#initializing-the-script-editor)
   - [Accessing and Managing Scripts](#accessing-and-managing-scripts)

## Introduction

The Script Editor Web Component is a versatile tool that allows developers to integrate a code editor into their web applications. It offers features like code copying, and script management, making it ideal for building code-related applications or platforms.

**Key features:**

- Support managing scripts.
- Code copying

## Installation

You can install the Script Editor Web Component using npm or include it via a script tag.

### npm

To install via npm, use the following command:

```bash
npm install @threefold/UI
```

## Usage

### Importing the Script Editor

Import the Script Editor Web Component into your JavaScript file.

```js
import script-editor from "@threefold/UI";
```

### Initializing the Script Editor

To create an instance of the Script Editor, use the following HTML tag:

```html
<script-editor dest="<file-path>" />
```

```HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Script Editor</title>
    <link rel="stylesheet" href="./tailwind.css">
  </head>
  <body>
    <script-editor dest="<file-path>" />
    <script src='./dist/threefold-ui.umd.js'></script>
  </body>
</html>
```

Script Tag

1. Clone the `tfgrid-sdk-ts` repository.
2. Navigate to the `tfgrid-sdk-ts/packages/UI` and run `yarn build-only`.
3. A `dist` folder will be created. Copy the `threefold-ui.umd.js` file and include it in your scripts.
4. Copy the `tailwind.css` to your project and include it in your styles.

```html
<script src="./threefold-ui.umd.js"></script>
```

Replace the src attribute with the actual path of the script.

### Accessing and Managing Scripts

Upon script submission, you will be asked to choose a Threefold account. From this account, a mnemonic will be extracted to generate a signature, which will then overwrite the file content within the dest property.

The sent data will consist of the public key and the signature created from the content.
