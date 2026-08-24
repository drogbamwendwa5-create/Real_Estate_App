const N = require("../../utils/PropertyNormalizer");

class PigiaMeParser {
  parse(d) {
    return N.normalize(d, "pigianme");
  }
}

module.exports = PigiaMeParser;
