const Roast = require('../models/roast');
const Coffee = require('../models/coffee');
const async = require('async');


// Display list of all Roast.
exports.roast_list = function(req, res, next) {
    Roast.find()
        .exec((err, list_roasts) => {
            if (err) { next(err); }

            // Success
            res.render('roast_list', { title: 'Available Roasts', roast_list: list_roasts });
        })
};

// Display detail page for a specific Roast.
exports.roast_detail = (req, res, next) => {

    async.parallel({
        roast: function(callback) {
            Roast.findById(req.params.id)
                .exec(callback);
        },
        roast_coffees: function(callback) {
            Coffee.find({ 'roast': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.roast == null) {
            const err = new Error('Roast not found');
            err.status = 404;
            return next(err);
        }
        res.render('roast_detail', { title: `${results.roast.name} roasts`, roast: results.roast, roast_coffees: results.roast_coffees });
    });
};

