const Flavor = require('../models/flavor');
const Coffee = require('../models/coffee');
const async = require('async');
const { body, validationResult } = require("express-validator");

// Display list of all Flavor.
exports.flavor_list = function(req, res, next) {
    Flavor.find()
        .sort([['title', 'ascending']])
        .exec((err, list_flavors) => {
            if (err) { next(err); }

            // Success
            res.render('flavor_list', { title: 'Available Flavors', flavor_list: list_flavors });
        })
};

// Display detail page for a specific Flavor.
exports.flavor_detail = function(req, res) {

    async.parallel({
        flavor: function(callback) {
            Flavor.findById(req.params.id)
                .exec(callback);
        },
        flavor_coffees: function(callback) {
            Coffee.find({ 'flavor': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.flavor == null) {
            const err = new Error('Flavor not found');
            err.status = 404;
            return next(err);
        }
        res.render('flavor_detail', { title: `${results.flavor.name} flavor`, flavor: results.flavor, flavor_coffees: results.flavor_coffees });
    });
};

// Display Flavor create form on GET.
exports.flavor_create_get = function(req, res) {
    res.render('flavor_form', { title: 'Add A Flavor' });
};

// Handle Flavor create on POST.
exports.flavor_create_post = [

    // validate and sanitize name field
    body('name', 'Flavor name required').trim().isLength({ min: 1 }).escape(),

    // process request
    (req, res, next) => {

        // extract errors from req
        const errors = validationResult(req);

        // create flavor object
        const flavor = new Flavor(
            { name: req.body.name }
        )

        if (!errors.isEmpty()) {
            res.render('flavor_form', { title: 'Create Flavor', flavor, errors: errors.array() });
            return;
        } else {
            // data is valid
            // check if flavor already exists
            Flavor.findOne({ 'name': req.body.name })
                .exec( function(err, found_flavor) {
                    if (err) { return next(err); }
                    if (found_flavor) {
                        // the flavor exists. redirect to its detail page
                        res.redirect(found_flavor.url);
                    } else {
                        flavor.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect('/store/flavors');
                        });
                    }
                });
        }
    }
];

// Display Flavor delete form on GET.
exports.flavor_delete_get = function(req, res, next) {
    
    async.parallel({
        flavor(callback) {
            Flavor.findById(req.params.id).exec(callback)
        },
        flavor_coffees(callback) {
            Coffee.find({ 'flavor': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.flavor == null) {
            res.redirect('/store/flavors')
        }
        // Success
        res.render('flavor_delete', { title: 'Delete Flavor', flavor: results.flavor, flavor_coffees: results.flavor_coffees})
    })
};

// Handle Flavor delete on POST.
exports.flavor_delete_post = function(req, res, next) {
    
    async.parallel({
        flavor(callback) {
            Flavor.findById(req.body.flavorid).exec(callback)
        },
        flavor_coffees(callback) {
            Coffee.find({ 'flavor': req.body.flavorid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.flavor_coffees.length > 0) {
            res.render('flavor_delete', { title: 'Delete Flavor', flavor: results.flavor, flavor_coffees: results.flavor_coffees } );
            return;
        } else {

            Flavor.findByIdAndRemove(req.body.flavorid, function deleteFlavor(err) {
                if (err) { return next(err); }
                // Success
                res.redirect('/store/flavors');
            })
        }
    });
};

