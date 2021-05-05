const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlavorSchema = new Schema({
  name: {type: String, minlength: 3, maxlength: 50 },
});

// Virtual for category's URL
FlavorSchema
  .virtual("url")
  .get(function () {
    return `/store/flavor/${this._id}`;
});

module.exports = mongoose.model("Flavor", FlavorSchema);