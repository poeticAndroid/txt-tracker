const
  Wave = require("../utils/wav")

function load_json(str) {
  return JSON.parse("" + str, (key, val) => {
    switch (key) {
      case "wave":
        let wav = new Wave()
        wav.fromBuffer(Buffer.from(val, "base64"))
        return wav
        break

      default:
        return val
        break
    }
  })
}

module.exports = load_json
