const process = require("process"),
  fs = require("fs"),
  path = require("path"),
  load_mod = require("./loaders/mod"),
  load_txt = require("./loaders/txt"),
  save_txt = require("./savers/txt"),
  save_mod = require("./savers/mod")

function init(filename) {
  console.log("Loading file", filename)
  let file = fs.readFileSync(filename)
  let music
  if (filename.substring(filename.lastIndexOf(".")) === ".txt") {
    console.log("txt -> mod")
    music = load_txt(file, path.dirname(filename) + "/")
    file = save_mod(music, path.dirname(filename) + "/")
    filename += ".mod"
  } else if (filename.substring(filename.lastIndexOf(".")) === ".mod") {
    console.log("mod -> txt")
    music = load_mod(file, path.dirname(filename) + "/")
    file = save_txt(music, path.dirname(filename) + "/")
    filename += ".txt"
  }
  console.log("Saving file", filename)
  fs.writeFileSync(filename, file)
  console.log("...dONE!\n")
}

init(process.argv[process.argv.length - 1])

