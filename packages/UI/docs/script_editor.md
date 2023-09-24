# Script Editor Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Usage](#usage)
   - [Building the Script Editor](#building-the-script-editor)
   - [Example of Usage](#example-of-usage)
   - [Using Providers and Extensions](#using-providers-and-extensions)

## Introduction

The Script Editor Web Component is a powerful tool that enables developers to seamlessly integrate a code editor into their web applications. It offers essential features such as script management and code copying, making it an ideal choice for building code-related applications or platforms.

**Key features:**

- Script management support.
- Code copying functionality.

## Usage

### Building the Script Editor

To create an instance of the Script Editor, follow these steps:

1. Clone the `tfgrid-sdk-ts` repository.

2. Navigate to the `repository/packages/UI` directory.

3. Run `yarn build` to generate the required distribution files.

4. Locate the `dist` folder created in the previous step.

5. Copy the `dist/threefold-ui.umd.js` file and include it in your project's HTML files.

```html
<body>
  <!-- Include the Script Editor component script -->
  <script src="./threefold-ui.umd.js"></script>
</body>
```

6. Copy the `dist/tailwind.css` file and use it for styling.

```html
<head>
  <!-- Include the style and logo files -->
  <link rel="stylesheet" href="./tailwind.css" />
</head>
```

7. Include the `script-editor` custom element tag in your HTML file as follows:

```html
<body>
  <script-editor dest="http://localhost:3000/" network="main" />
</body>
```

8. The `script-editor` HTML tag accepts two parameters:

   - `dest`: The destination where the signed script should be sent. Refer to [this document](./server_verification.md) for more information, and you can find a [server example here](../examples/server-example/).

   - `network`: This is required only if you decide to use the `threefoldConnectorProvider`. It points to the network of your account in the extension.

### Example of Usage

Here's an example of how to use the Script Editor Web Component in your HTML file:

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
    <!-- Use the script-editor custom element with required attributes -->
    <script-editor dest="http://localhost:3000/" network="main" />

    <!-- Include the Script Editor component script -->
    <script src="./script-editor.js"></script>
  </body>
</html>
```

In the example above, replace `<dest>` and `<network>` with the actual destination where the signed script should be sent. Also, for the `<network>`, use one of the following network options: `[main, test, qa, dev]`.

Feel free to customize the HTML structure and styles to match your application's design and requirements.

**Now you can serve your HTML file on any live-server plugin.**

### Using Providers and Extensions

The Script Editor Web Component now supports providers and extensions for enhanced functionality. You can choose between two providers:

- **threefoldSignerProvider**: A basic provider that requires a mnemonic provided in the [.env](../.env) file.

- **threefoldConnectorProvider**: An extension that connects to the Threefold Connector extension for enhanced capabilities.

To specify the provider or extension to use, you can set an environment variable in your project. For example, to use the `threefoldSignerProvider`, set the following environment variable:

```bash
VITE_MNEMONIC="<your_mnemonic_here>"
```

To use the `threefoldConnectorProvider` extension, please ensure that you have it installed and enabled. (Note: The extension is still under development.) You can comment out the mnemonic line as follows:

```bash
# VITE_MNEMONIC="<your_mnemonic_here>"
```

The component will automatically detect the environment variable and use the selected provider or extension.

By adding this flexibility, you can choose the provider or extension that best fits your project's requirements.

**Note**: If you choose to use the `threefoldConnectorProvider` extension, make sure it is properly installed and configured in your environment.

Now, you can seamlessly integrate the Script Editor Signing into your web application using the Script Editor Web Component with your preferred provider or extension.
