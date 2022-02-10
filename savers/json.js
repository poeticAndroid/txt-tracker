function save_json(music) {
  return JSON.stringify(music, null, 2)
}

module.exports = save_json
