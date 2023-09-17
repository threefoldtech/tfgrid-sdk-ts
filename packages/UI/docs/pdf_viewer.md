# PDF Signer Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Usage](#usage)
   - [Build the PDF Signer](#build-the-pdf-signer)
   - [Example of Usage](#example-of-usage)
   - [Using Providers and Extensions](#using-providers-and-extensions)

## Introduction

The PDF Signer Web Component is a user-friendly PDF viewer that simplifies the process of signing PDF documents and sending them to a specified endpoint. This component is designed to make PDF signing and processing straightforward for your web applications.

**Key features:**

- Load and view PDF files from a provided URL.
- Enable users to sign PDF documents easily.
- Seamlessly submit signed documents to a designated endpoint.

## Usage

### Build the PDF Signer

To use the PDF Signer Web Component, follow these steps:

1. Clone the `tfgrid-sdk-ts` repository.
2. Navigate to the `repository/packages/UI` directory.
3. Run `yarn build-only` to generate the required distribution files.
4. Locate the `dist` folder created in the previous step.
5. Copy the `threefold-ui.umd.js` file and include it in your project's HTML files.
6. Copy the `dist/tailwind.css` file and use it for styling.

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
      network="dev"
    />
    <!-- Include the PDF Signer component script -->
    <script src="./pdf.js"></script>
  </body>
</html>
```

In the example above, replace `<pdf-url>` and `<endpoint-url>` with the actual URLs for your PDF document and the destination where signed documents should be sent, also for the `<network>` should match one of the following networks `[main, test, qa, dev]`.

Feel free to customize the HTML structure and styles to match your application's design and requirements.

### Using Providers and Extensions

The PDF Signer Web Component now supports providers/extensions for enhanced functionality. You can choose between two providers:

- **threefoldSignerProvider**: A basic provider that requires a mnemonic provided in the [.env](../.env).

- **threefoldConnectorProvider**: An extension that connects to the Threefold Connector extension for enhanced capabilities.

To specify the provider/extension to use, you can set an environment variable in your project. For example, to use the `threefoldSignerProvider`, set the following environment variable:

```bash
VITE_MNEMONIC="<your_mnemonic_here>"
```

and to use the `threefoldConnectorProvider` extension please make sure that you installed and enabled access the extension. `PS: The extension is still under development`
comment the above line to be:

```bash
# VITE_MNEMONIC="<your_mnemonic_here>"
```

The component will automatically detect the environment variable and use the selected provider/extension.

By adding this flexibility, you can choose the provider/extension that best fits your project's requirements.

**Note**: If you choose to use the `threefoldConnectorProvider` extension, make sure it is installed and configured properly in your environment.

Now, you can seamlessly integrate PDF signing into your web application using the PDF Signer Web Component with your preferred provider/extension.
