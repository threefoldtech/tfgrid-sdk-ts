module local_server

import vweb

enum KeypairType {
  sr25519 = 1
  ed25519 = 2
}

struct Payload {
  twinid? int
  pdf_url? string @[json: 'pdfUrl']
  pubkey string
  content? string
  signature string
  keypair KeypairType @[json: 'keypairType']
};

pub struct VServerConfig {
  port int
};

struct VServerApp {
	vweb.Context
	port int
}