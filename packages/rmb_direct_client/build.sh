PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
OUT_DIR="./lib/types/"
PROTO_PATH="./lib/types.proto"

protoc --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" --ts_out="${OUT_DIR}" $PROTO_PATH
