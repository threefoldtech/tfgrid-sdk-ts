# 3. support_hex_based_seed.md

Date: 2023-11-16

## Status

Done

## Context

Add support for hex based seed (Aka. hexSeed). Basically it's an algorithm derive a hexSeed from regular mnemonic which can be used while interacting with chain without exposing user's mnemonic.

Note: Threefold Connector App is using hex based seed so now users can copy their hexSeed and use it directly in our clients

## Decision

Currently, We added a `toHexSeed` helper to convert any passed mnemonic into hexSeed and if the user passed hexSeed it stays as it is.

Example:
mnemonic: "word position fox tonight initial genuine liquid jewel almost craft broom maximum"
hexSeed: "0xd8c3909af2227220a5ad15cc5fe1aeb8bd620b50b96d910220c2062c18b28232"

## Consequences

There is no specific consequences related.
