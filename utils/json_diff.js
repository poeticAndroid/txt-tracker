#!/usr/bin/env node

const
  fs = require("fs"),
  process = require("process")

let maxlen = 0

function init() {
  let file2 = process.argv.pop()
  let file1 = process.argv.pop()
  console.info("> Comparing", file1, "and", file2, "\n")

  let json1 = JSON.parse("" + fs.readFileSync(file1))
  let json2 = JSON.parse("" + fs.readFileSync(file2))
  compare("/", json1, json2)

  console.info("\n> dONE!")
}
init()

function compare(path, json1, json2) {
  if (json1 === json2) return
  if (typeof json1 !== typeof json2 || typeof json1 !== "object")
    return console.warn(pad(path), "\t", (typeof json1 === "string") ? JSON.stringify(json1) : json1, "\t", (typeof json2 === "string") ? JSON.stringify(json2) : json2)
  if (json1 instanceof Array) {
    let len = Math.max(json1.length, json2.length)
    for (let i = 0; i < len; i++) {
      compare(path + i + "/", json1[i], json2[i])
    }
  } else {
    let keys = []
    for (let key in json1) {
      if (!keys.includes(key)) keys.push(key)
    }
    for (let key in json2) {
      if (!keys.includes(key)) keys.push(key)
    }
    for (let key of keys) {
      compare(path + key + "/", json1[key], json2[key])
    }
  }
}

function pad(str, len = maxlen) {
  maxlen = Math.max(maxlen, str.length)
  while (str.length < len) str += " "
  return str
}