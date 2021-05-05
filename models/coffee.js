var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CoffeeSchema = new Schema(
  {
    name: {type: String, required: true, minlength: 3, maxlength: 50 },
    brand: {type: String, required: true, minlength: 3, maxlength: 50 },
    price: {type: Number, required: true},
    summary: {type: String, required: true, minlength: 3, maxlength: 500 },
    roast: {type: Schema.Types.ObjectId, ref: 'Roast'},
    flavor: {type: Schema.Types.ObjectId, ref: 'Flavor'},
    image: { type: String, default: "/images/missing.png" },
  }
);

// Virtual for book's URL
CoffeeSchema
  .virtual('url')
  .get(function () {
    return `/store/coffee/${this._id}`;
});

//Export model
module.exports = mongoose.model('Coffee', CoffeeSchema);