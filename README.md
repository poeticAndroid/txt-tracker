# txt-tracker
Music tracker compiler/decompiler

With this tool you can use your prefered text editor as a music tracker!

## Installation

 1. Install [Node](https://nodejs.org/)
 2. Type `npm install -g txt-tracker` in the terminal
 3. Profit! 🎉

## Usage
```
Usage: txt-tracker [options]

Options:
  -i, --in <filename>           Input file
  -o, --out <filename>          Output file
  -if, --inputFormat <format>   Input format
  -of, --outputFormat <format>  Output format
  -s, --samples <folder>        Path to save samples
  -h, --help                    display help for command
```

Supported formats:
 - `txt` (the source format you edit in)
 - `json` (internal object representation of the source file, useful for debugging)
 - `mod` (Noisetracker/Soundtracker/Protracker)
