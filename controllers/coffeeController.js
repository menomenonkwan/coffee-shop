const Coffee = require('../models/coffee');
const Flavor = require('../models/flavor');
const Roast = require('../models/roast');
const async = require ('async');
const { body, validationResult } = require('express-validator');

// Display Counts on HomePage
exports.index = function(req, res) {
  async.parallel({
    coffee_count(callback) {
        Coffee.countDocuments({}, callback); 
    },
    flavor_count(callback) {
        Flavor.countDocuments({}, callback);
    },
    roast_count(callback) {
        Roast.countDocuments({}, callback);
    },
  }, (err, results) => {
      res.render('store', { title: 'Welcome To The Coffee Shop Co.', error: err, data: results });
  });  
};

// Display list of all Coffee.
exports.coffee_list = function(req, res, next) {

  Coffee.find({}, 'name brand')
  .sort([["name", "ascending"]])
  .exec((err, list_coffees) => {
    if (err) { return next(err); }
    //Successful, so render
    res.render('coffee_list', { title: 'All The Coffee We Got', coffee_list: list_coffees });
  });
};

// Display detail page for a specific Coffee.
exports.coffee_detail = function(req, res, next) {

  Coffee.findById(req.params.id)
    .populate('flavor')
    .populate('roast')
    .exec((err, coffee_info) => {
      if (err) { return next(err); }
      res.render('coffee_detail', { title: coffee_info.name, coffee_info });
    });
};

// Display Coffee create form on GET.
exports.coffee_create_get = function(req, res, next) {

  // get all flavors and roasts for coffee addition
  async.parallel({
    flavors(callback) {
      Flavor.find(callback);
    },
    roasts(callback) {
      Roast.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }

    res.render('coffee_form', { title: 'Add A Coffee', flavors: results.flavors, roasts: results.roasts });
  })
};

// Handle Coffee create on POST.
exports.coffee_create_post = [
  
  // validate and sanitize fields
  body('name', 'Must have a name').trim().isLength({ min: 1 }).escape(),
  body('brand', 'Must have a brand').trim().isLength({ min: 1 }).escape(),
  body('price', 'Must have a price').trim().isLength({ min: 1 }).isNumeric().escape(),
  body('summary', 'Must have a summary').trim().isLength({ min: 1 }).escape(),
  body('roast', 'roast must not be empty').trim().escape(),
  body('flavor', 'flavor must not be empty').trim().escape(),

  // Process request
  (req, res, next) => {

    // extract errors
    const errors = validationResult(req);
   
    // create Coffee object with escaped and trimmed data
    const coffee = new Coffee(
      {
        name: req.body.name,
        brand: req.body.brand,
        price: req.body.price,
        summary: req.body.summary,
        roast: req.body.roast,
        flavor: req.body.flavor,
        image: req.file ? `/images/${req.file.filename}` : '/images/missing.png'
      }
    );
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all flavors and roasts for form
      async.parallel({
        flavors(callback) {
          Flavor.find(callback);
        },
        roasts(callback) {
          Roast.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }

        res.render('coffee_form', { title: 'Create Coffee', flavors: results.flavors, roasts: results.roasts, coffee, errors: errors.array() });
      });
      return;
    } else {
      // Data is valid
      coffee.save(function (err) {
        if (err) { return next(err); }

        // Success
        res.redirect(coffee.url);
      });
    }
  }
];

// Display Coffee delete form on GET.
exports.coffee_delete_get = function(req, res, next) {

  Coffee.findById(req.params.id)
  .exec((err, coffee_info) => {
    if (err) { return next(err); }
    res.render('coffee_delete', { title: 'Delete Coffee', coffee_info });
  });
};


// Handle Coffee delete on POST.
exports.coffee_delete_post = function(req, res, next) {

  Coffee.findByIdAndRemove(req.body.coffeeid, function deleteCoffee(err) {
    if(err) { return next(err); }
    res.redirect('/store/coffees');
  })
};

// Display Coffee update form on GET.
exports.coffee_update_get = function(req, res, next) {
  
  async.parallel({
    coffee(callback) {
      Coffee.findById(req.params.id).populate('flavor').populate('roast').exec(callback);
    },
    flavors(callback) {
      Flavor.find(callback);
    },
    roasts(callback) {
      Roast.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.coffee == null) {
      const err = new Error('Coffee not found');
      err.status = 404;
      return next(err);
    }
    
    // Success
    res.render('coffee_form', { title: 'Update Coffee', flavors: results.flavors, roasts: results.roasts, coffee: results.coffee });
  })

};

// Handle Coffee update on POST.
exports.coffee_update_post = [

  // validate and sanitize fields
  body('name', 'Must have a name').trim().isLength({ min: 1 }).escape(),
  body('brand', 'Must have a brand').trim().isLength({ min: 1 }).escape(),
  body('price', 'Must have a price').trim().isLength({ min: 1 }).isNumeric().escape(),
  body('summary', 'Must have a summary').trim().isLength({ min: 1 }).escape(),
  body('roast', 'roast must not be empty').trim().escape(),
  body('flavor', 'flavor must not be empty').trim().escape(),

  // Process request
  (req, res, next) => {
    console.log('-------------');
    console.log(req.body);
    console.log('-------------');
    // extract errors
    const errors = validationResult(req);
    
    // create Coffee object with escaped and trimmed data
    const coffee = new Coffee(
      {
        name: req.body.name,
        brand: req.body.brand,
        price: req.body.price,
        summary: req.body.summary,
        roast: req.body.roast,
        flavor: req.body.flavor,
        image: req.body.image || `/images/missing/png`,
        _id: req.params.id,
      }
    );
    
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all flavors and roasts for form
      async.parallel({
        flavors(callback) {
          Flavor.find(callback);
        },
        roasts(callback) {
          Roast.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }

        res.render('coffee_form', { title: 'Update Coffee', flavors: results.flavors, roasts: results.roasts, coffee, errors: errors.array() });
      });
      return;
    } else {
      // Data is valid
      Coffee.findByIdAndUpdate(req.params.id, coffee, {}, function (err, thecoffee) {
        if (err) { return next(err); }

        // Success
        res.redirect(thecoffee.url);
      });
    }
  }
];