const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoastSchema = new Schema({
  name: {
    type: String, 
    required: true, 
    minlength: 3, 
    maxlength: 50,
    enum: ['light', 'medium', 'dark'], 
    default: 'dark'
  },
});

// Virtual for category's URL
RoastSchema
  .virtual("url")
  .get(function () {
    return `/store/roast/${this._id}`;
});

module.exports = mongoose.model("Roast", RoastSchema);