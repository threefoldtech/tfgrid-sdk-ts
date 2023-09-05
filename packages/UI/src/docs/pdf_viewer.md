# PDF Signer Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Importing the PDF Signer](#importing-the-pdf-signer)
   - [Initializing the PDF Signer](#initializing-the-pdf-signer)

## 1. Introduction

The PDF Signer Web Component is a straightforward PDF viewer that loads the PDF file into a single-page browser interface, allowing users to sign the data within the PDF and send it to an endpoint specified by the user.

**Key features:**

- Supports loading and viewing PDF files by providing the PDF URL.

## 2. Installation

You can install the PDF Signer Web Component using npm or include it via a script tag.

### npm

To install via npm, use the following command:

```bash
npm install @threefold/UI
```

## 3. Usage

### Importing the PDF Signer

Import the PDF Signer Web Component into your JavaScript file.

```js
import pdfSigner from "@threefold/UI";
```

### Initializing the PDF Signer

To create an instance of the PDF Signer, use the following HTML tag:

```html
<pdf-signer pdfurl="<pdf-url>" dest="<endpoint-url>" />
```

Example:

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./style.css">
    <link rel="icon" href="/favicon.ico">
    <title>Threefold UI</title>
</head>
<body>
    <pdf-signer dest="http://localhost:5173/" pdfUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"/>
    <script src='./dist/threefold-ui.umd.js'></script>
</body>
</html>
```

Script Tag:

1. Clone the `@threefold/UI` repository.
2. Navigate to the repository and run `yarn build-only`.
3. A `dist` folder will be created. Copy the `threefold-ui.umd.js` file and include it in your scripts.
4. Copy the `tailwind.css` to your side project.

```html
<script src="./threefold-ui.umd.js"></script>
```

Replace the `src` attribute with the actual path of the script.
