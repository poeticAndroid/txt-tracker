#!/usr/bin/env node

const
  process = require("process"),
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
  if (!opts.out) opts.out = opts.in + (opts.inputFormat === "txt" ? ".mod" : ".txt")
  if (!opts.outputFormat) opts.outputFormat = opts.out.substring(opts.out.lastIndexOf(".") + 1)
  if (!opts.samples) opts.samples = path.basename(opts.out).substring(0, path.basename(opts.out).indexOf(".")) + "_samples"
  if (!opts.samples.substring(opts.samples.length - 1) !== "/") opts.samples += "/"

  console.log("Loading file", opts.in)
  let file = fs.readFileSync(opts.in)
  let music

  console.log("Converting", opts.inputFormat, "to", opts.outputFormat)
  const loader = require("./loaders/" + opts.inputFormat)
  const saver = require("./savers/" + opts.outputFormat)
  music = loader(file, path.dirname(opts.in) + "/", opts.samples)
  file = saver(music, path.dirname(opts.out) + "/", opts.samples)

  console.log("Saving file", opts.out)
  fs.writeFileSync(opts.out, file)
  console.log("...dONE!\n")
}

init()

