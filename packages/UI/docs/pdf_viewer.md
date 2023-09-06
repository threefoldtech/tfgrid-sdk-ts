# PDF Signer Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Usage](#usage)
   <!-- - [Importing the PDF Signer](#importing-the-pdf-signer) -->
   - [Initializing the PDF Signer](#initializing-the-pdf-signer)
   - [Example of Usage](#example-of-usage)

## 1. Introduction

The PDF Signer Web Component is a straightforward PDF viewer that loads the PDF file into a single-page browser interface, allowing users to sign the data within the PDF and send it to an endpoint specified by the user.

**Key features:**

- Supports loading and viewing PDF files by providing the PDF URL.

## 2. Usage

<!-- ### Importing the PDF Signer

Import the PDF Signer Web Component into your JavaScript file.

```js
import pdfSigner from "@threefold/UI";
``` -->

### Initializing the PDF Signer

To create an instance of the pdf signer component, you need to build the package first and then copy the created `dist` folder inside your project:

1. Clone the `tfgrid-sdk-ts` repository.
2. Navigate to the `repository/packages/UI` directory and run `yarn build-only`.
3. A `dist` folder will be created. Copy the `threefold-ui.umd.js` file and include it in your scripts.
4. Copy the `dist/tailwind.css` to your side project.

Now you're ready to write your tag:

```html
<pdf-signer pdfurl="<pdf-url>" dest="<endpoint-url>" />
```

### Example of Usage

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
