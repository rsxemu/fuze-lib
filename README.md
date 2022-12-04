# Fuze Core Library

## IO

### BitBuffer

Dynamically expanding bit set based on Uint8Array. Useful for reading/writing streams of bits with variable integer length values and boolean flag support.

### SuperBuffer

The last `Uint8Array` wrapper you'll ever need for reading and writing a stream of bytes in Node.JS! Handles endianness, signing, obfuscation, and variable width integer types, and other custom data types.

## Core

### Functions

Formatting text, binary strings, utility functions, etc.

### MonkeyJSON

Allows for `BigInt` being encoded and decoded via overrding `JSON.parse()` and `BigInt.toJSON()`

## Graphics

### ColorMap

Generates the color pallette referred to by assets, exporting a function to generate the color map as well as the color map as a constant based on that function.

### AdjustBrightness

Adjusts brightness to an RGB encoded number by an intensity factor using `Math.pow`.