# Script Editor Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
   <!-- - [Importing the Script Editor](#importing-the-script-editor) -->
   - [Build the Script Editor](#build-the-script-editor)
   - [Example of Usage](#example-of-usage)
   - [Accessing and Managing Scripts](#accessing-and-managing-scripts)

## Introduction

The Script Editor Web Component is a versatile tool that allows developers to integrate a code editor into their web applications. It offers features like code copying, and script management, making it ideal for building code-related applications or platforms.

**Key features:**

- Support managing scripts.
- Code copying

## Installation

You can install the Script Editor Web Component using npm or include it via a script tag.

<!-- ### npm

To install via npm, use the following command:

```bash
npm install @threefold/UI
``` -->

## Usage

### Importing the Script Editor

<!-- Import the Script Editor Web Component into your JavaScript file.

```js
import script-editor from "@threefold/UI";
``` -->

### Build the Script Editor

To create an instance of the Script Editor, you need to build the package first and then copy the created `dist` folder inside your project:

1. Clone the `tfgrid-sdk-ts` repository.
2. Navigate to the `repository/packages/UI` directory and run `yarn build-only`.
3. A `dist` folder will be created. Copy the `threefold-ui.umd.js` file and include it in your scripts.
4. Copy the `dist/tailwind.css` to your side project.

Now you're ready to write your tag:

```html
<script-editor dest="<file-path>" />
```

### Example of Usage

just create an `index.html` somewhere to test it and point the dist files in it.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./style.css" />
    <!-- From build -->
    <title>Threefold UI</title>
  </head>
  <body>
    <pdf-signer
      dest="http://localhost:5173/"
      pdfUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
    />
    <script src="./dist/threefold-ui.umd.js"></script>
    <!-- From build -->
  </body>
</html>
```

### Accessing and Managing Scripts

Upon script submission, you will be asked to choose a Threefold account. From this account, a mnemonic will be extracted to generate a signature, which will then overwrite the file content within the dest property.

The sent data will consist of the public key and the signature created from the content.
