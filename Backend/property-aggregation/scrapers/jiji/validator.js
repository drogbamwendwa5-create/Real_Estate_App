class JijiValidator {
  validate(d) {
    const e = [];
    if (!d.title || String(d.title).trim().length < 5) e.push("Missing title");
    const priceNum = parseFloat(String(d.price || "0").replace(/[^0-9.]/g, ""));
    if (!d.price || priceNum <= 0) e.push("Missing price");
    if (!d.sourceURL) e.push("Missing URL");
    if (!Array.isArray(d.images) || d.images.length === 0) {
      e.push("Missing images");
    }
    return { isValid: e.length === 0, errors: e, data: d };
  }
}

module.exports = JijiValidator;
