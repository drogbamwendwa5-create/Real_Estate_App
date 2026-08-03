const PriceValidator = require("./PriceValidator");
const ImageValidator = require("./ImageValidator");
const LocationValidator = require("./LocationValidator");
const DateValidator = require("./DateValidator");
const DescriptionValidator = require("./DescriptionValidator");
const ListingValidator = require("./ListingValidator");
const vc = require("../config/validation.config");

class PropertyValidator {
  constructor() {
    this.price = new PriceValidator();
    this.image = new ImageValidator();
    this.location = new LocationValidator();
    this.date = new DateValidator();
    this.description = new DescriptionValidator();
    this.listing = new ListingValidator();
  }

  validate(property) {
    const errors = [];
    const warnings = [];
    const pv = this.price.validate(property);
    if (!pv.isValid) errors.push(...pv.errors);
    const iv = this.image.validate(property);
    if (!iv.isValid) errors.push(...iv.errors);
    const lv = this.location.validate(property);
    if (!lv.isValid) errors.push(...lv.errors);
    const dv = this.date.validate(property);
    if (!dv.isValid) warnings.push(...dv.warnings);
    const descv = this.description.validate(property);
    if (!descv.isValid) warnings.push(...descv.warnings);
    const lv2 = this.listing.validate(property);
    if (!lv2.isValid) errors.push(...lv2.errors);
    const score = Math.max(0, 100 - errors.length * 10 - warnings.length * 5);
    return { isValid: errors.length === 0, errors, warnings, score };
  }
}

module.exports = PropertyValidator;
