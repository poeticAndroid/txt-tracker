#!/usr/bin/env node

const
  fs = require("fs"),
  path = require("path"),
  commander = require("commander")

const program = new commander.Command("txt-tracker")
program
  .requiredOption("-i, --in <filename>", "Input file")
  .option("-o, --out <filename>", "Output file")
  .option("-if, --inputFormat <format>", "Input format")
  .option("-of, --outputFormat <format>", "Output format")
  .option("-s, --samples <folder>", "Path to save samples")
  .parse()

function init() {
  let opts = program.opts()
  if (!opts.inputFormat) opts.inputFormat = opts.in.substring(opts.in.lastIndexOf(".") + 1)
  if (!opts.out && opts.outputFormat) opts.out = opts.in + "." + opts.outputFormat
  if (!opts.out) opts.out = opts.in + (opts.inputFormat === "txt" ? ".mod" : ".txt")
  if (!opts.outputFormat) opts.outputFormat = opts.out.substring(opts.out.lastIndexOf(".") + 1)
  if (!opts.samples) opts.samples = path.basename(opts.out).substring(0, path.basename(opts.out).indexOf(".")) + "_samples"
  if (!opts.samples.substring(opts.samples.length - 1) !== "/") opts.samples += "/"

  console.info("> Loading file", opts.in)
  let file = fs.readFileSync(opts.in)
  let music

  console.info("> Parsing as", opts.inputFormat)
  const loader = require("./loaders/" + opts.inputFormat)
  music = loader(file, path.dirname(opts.in) + "/", opts.samples)
  console.info("\n(i) Compiling to", opts.outputFormat)
  const saver = require("./savers/" + opts.outputFormat)
  file = saver(music, path.dirname(opts.out) + "/", opts.samples)

  console.info("> Saving file", opts.out)
  fs.writeFileSync(opts.out, file)
  console.info("> ...dONE!\n")
}

init()

