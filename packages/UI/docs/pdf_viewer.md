# PDF Signer Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Building the PDF Signer](#building-the-pdf-signer)
   - [Example of Usage](#example-of-usage)
   - [Using Providers and Extensions](#using-providers-and-extensions)

## Introduction

The PDF Signer Web Component simplifies the process of signing PDF documents and sending them to a specified endpoint. This user-friendly PDF viewer is designed to make PDF signing and processing straightforward for your web applications.

**Key features:**

- Load and view PDF files from a provided URL.
- Easily sign PDF documents.
- Seamlessly submit signed documents to a designated endpoint.

## Installation

To install the `UI` package via [npm](https://www.npmjs.com/), use the following command:

```sh
npm i @threefold/ui
```

Then, import the package and its styles into your project:

```vue
<script setup lang="ts">
import "@threefold2/ui";
import "@threefold2/ui/dist/tailwind.css"; // Import the style from the dist files
</script>
<template>
  <!-- Example usage of the PDF signer component -->
  <pdf-signer
    dest="http://localhost:3000/api/verify"
    pdfUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
    network="dev"
  />
</template>
```

## Usage

### Building the PDF Signer

To use the PDF Signer Web Component, follow these steps:

1. Clone the `tfgrid-sdk-ts` repository.

2. Navigate to the `repository/packages/UI` directory.

3. Choose the provider you are going to use [see providers section](#using-providers-and-extensions).

4. Run `yarn build` to generate the required distribution files.

5. Locate the `dist` folder created in the previous step.

6. Copy the `dist/threefold-ui.umd.js` file and include it in your project's HTML files:

```html
<body>
  <!-- Include the PDF Signer component script -->
  <script src="./threefold-ui.umd.js"></script>
</body>
```

7. Copy the `dist/tailwind.css` file and use it for styling:

```html
<head>
  <!-- Include the style and logo files -->
  <link rel="stylesheet" href="./tailwind.css" />
</head>
```

8. Include the `pdf-signer` custom element tag in your HTML file as follows:

```html
<body>
  <pdf-signer
    dest="http://localhost:3000/"
    pdfUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
    network="main"
  />
</body>
```

9. The `pdf-signer` HTML tag accepts three parameters:

- `dest`: The destination where the signed script should be sent. Refer to [this document](./server_verification.md) for more information, and you can find a [server example here](../examples/server-example/).

- `pdfUrl`: This is the PDF URL you want to sign its content.

- `network`: This is required only if you decide to use the `threefoldConnectorProvider`. It points to the network of your account in the extension.

### Example of Usage

Here's an example of how to use the PDF Signer Web Component in your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Threefold UI</title>

    <!-- Include the style and logo files -->
    <link rel="stylesheet" href="./style.css" />
  </head>

  <body>
    <!-- Use the pdf-signer custom element with required attributes -->
    <pdf-signer
      dest="http://localhost:3000/"
      pdfUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
      network="main"
    />
    <!-- Include the PDF Signer component script -->
    <script src="./pdf.js"></script>
  </body>
</html>
```

In the example above, replace `<pdf-url>` and `<endpoint-url>` with the actual URLs for your PDF document and the destination where signed documents should be sent. Also, for the `<network>`, use one of the following network options: `[main, test, qa, dev]`.

PS: Please make sure that you have a `PDF URL` with `CORS-ORIGIN` enabled.

Feel free to customize the HTML structure and styles to match your application's design and requirements.

**Now you can serve your HTML file on any live-server plugin.**

### Using Providers and Extensions

The PDF Signer Web Component now supports providers and extensions for enhanced functionality. You can choose between two providers:

- **threefoldSignerProvider**: A basic provider that requires a mnemonic provided in the [.env](../.env) file.

- **threefoldConnectorProvider**: An extension that connects to the Threefold Connector extension for enhanced capabilities.

To specify the provider or extension to use, set an environment variable in your project. For example, to use the `threefoldSignerProvider`, set the following environment variable:

```bash
VITE_MNEMONIC="<your_mnemonic_here>"
```

To use the `threefoldConnectorProvider` extension, ensure it is installed and enabled. (Note: The extension is still under development.) You can comment out the mnemonic line as follows:

```bash
# VITE_MNEMONIC="<your_mnemonic_here>"
```

The component will automatically detect the environment variable and use the selected provider/extension.

By adding this flexibility, you can choose the provider/extension that best fits your project's requirements.

**Note**: If you choose to use the `threefoldConnectorProvider` extension, make sure it is properly installed and configured in your environment.

Now, you can seamlessly integrate PDF signing into your web application using the PDF Signer Web Component with your preferred provider/extension.
