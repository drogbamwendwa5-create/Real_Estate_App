const N = require("../../utils/PropertyNormalizer");

class JijiParser {
  parse(d) {
    return N.normalize(d, "jiji");
  }
}

module.exports = JijiParser;
