const process = require("process"),
  fs = require("fs"),
  path = require("path"),
  load_mod = require("./loaders/mod"),
  save_txt = require("./savers/txt")

function init(filename) {
  console.log("Loading file", filename)
  let file = fs.readFileSync(filename)
  let music = load_mod(file)
  // console.log(music)
  file = save_txt(music, path.dirname(filename) + "/")
  fs.writeFileSync(filename + ".txt", file)
}

init(process.argv[process.argv.length - 1])

