# Script Editor Web Component Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Usage](#usage)
   - [Building the Script Editor](#building-the-script-editor)
   - [Example of Usage](#example-of-usage)
   - [Using Providers and Extensions](#using-providers-and-extensions)

## Introduction

The Script Editor Web Component is a versatile tool that allows developers to seamlessly integrate a code editor into their web applications. It offers features like script management and code copying, making it ideal for building code-related applications or platforms.

**Key features:**

- Support for managing scripts.
- Code copying.

## Usage

### Building the Script Editor

To create an instance of the Script Editor, you need to build the package first and then copy the generated `dist` folder into your project:

1. Clone the `tfgrid-sdk-ts` repository.
2. Navigate to the `repository/packages/UI` directory.
3. Run `yarn build-only` to generate the required distribution files.
4. Locate the `dist` folder created in the previous step.
5. Copy the `threefold-ui.umd.js` file and include it in your project's HTML files.
6. Copy the `dist/tailwind.css` file and use it for styling.

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
