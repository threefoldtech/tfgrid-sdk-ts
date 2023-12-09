# Node.js Server Example for PDF/Editor Signature Verification

This Node.js server is designed to facilitate communication between the server and the `(PDFSigner, ScriptEditor)` components. It includes a `verify` endpoint responsible for verifying requested signatures and returning the validation status.

# Vlang Server Example for PDF/Editor Signature Verification

This Vlang server is designed to facilitate communication between the server and the `(PDFSigner, ScriptEditor)` components. It includes a `verify` endpoint responsible for printing out the request payload.

## Usage

- The `verify` endpoint is accessible at the path `/api/verify`.
- The server runs on port `3000`.

### Request Format

To make a verification request, send a POST request to the endpoint with the following JSON payload:

```bash
curl -X POST https://localhost:3000/api/verify
    -H "Content-Type: application/json"
    -d '{
        "pdfUrl": "<pdfUrl_value>",
        "pubkey": "<pubkey_value>",
        "signature": "<signature_value>"
    }'
```

The expected request body follows this TypeScript pattern:

```ts
let payLoad: Payload = {
  twinid: 0,
  pdfUrl: "",
  pubkey: "",
  signature: "",
};
```

The expected request body follows this Vlang pattern:

```vlang
payLoad := {
  twinid: 0,
  pdf_url: "",
  pubkey: "",
  signature: "",
};
```

### Response Format

#### Verified Signature

If the signature is verified successfully, the server will respond with an HTTP status code of 200 and a JSON response like this:

```json
{
  "status": 200,
  "message": "The signature was verified successfully.",
  "data": {
    "isValid": true
  }
}
```

#### Unverified Signature

If the signature cannot be verified, the server will respond with an HTTP status code of 400 and a JSON response like this:

```json
{
  "status": 400,
  "message": "Failed to verify the signature.",
  "data": {
    "isValid": false
  }
}
```

### How to run the server

- NodeJS server

```sh
$server_example/nodejs-server npx ts-node src/server.ts
```

- Vlang server

```sh
$server_example/vlang-server v run main.v
```

Use this NodeJS/Vlang servers examples to handle PDF/Editor signature verification within your application.
