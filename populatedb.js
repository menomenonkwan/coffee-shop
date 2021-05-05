#! /usr/bin/env node

console.log('This script populates a coffee store database with coffee, roasts, and flavors. Mmmm...');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Coffee = require('./models/coffee')
var Flavor = require('./models/flavor')
var Roast = require('./models/roast')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var coffees = []
var flavors = []
var roasts = []

function coffeeCreate(name, brand, price, summary, roast, flavor, cb) {
  coffeedetail = {
    name: name,
    brand: brand,
    price: price,
    summary: summary,
    roast: roast,
    flavor: flavor,
  }
 
  var coffee = new Coffee(coffeedetail);
       
  coffee.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Coffee: ' + coffee);
    coffees.push(coffee)
    cb(null, coffee)
  }  );
}

function flavorCreate(name, cb) {
  var flavor = new Flavor({ name });
       
  flavor.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Flavor: ' + flavor);
    flavors.push(flavor)
    cb(null, flavor);
  }   );
}

function roastCreate(name, cb) {
  var roast = new Roast({ name });  

  roast.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Roast: ' + roast);
    roasts.push(roast)
    cb(null, roast)
  }  );
}

function createRoasts(cb) {
    async.series([
        function(callback) {
          roastCreate('light', callback);
        },
        function(callback) {
          roastCreate('medium', callback);
        },
        function(callback) {
          roastCreate('dark', callback);
        },
        ],
        // optional callback
        cb);
}

function createFlavors(cb) {
    async.series([
        function(callback) {
          flavorCreate('unflavored', callback);
        },
        function(callback) {
          flavorCreate('vanilla', callback);
        },
        function(callback) {
          flavorCreate('hazelnut', callback);
        },
        function(callback) {
          flavorCreate('maple', callback);
        },
        function(callback) {
          flavorCreate('pumpkin spice', callback);
        },
        ],
        // optional callback
        cb);
}

function createCoffees(cb) {
    async.parallel([
        function(callback) {
          coffeeCreate('Breakfast Blend', 'Folgers', 8.99, 'Coffee in a red jug', roasts[0], flavors[0], callback);
        },
        function(callback) {
          coffeeCreate('Classic Roast', 'Folgers', 8.99, 'Classic coffee', roasts[1], flavors[0], callback);
        },
        function(callback) {
          coffeeCreate('Special Blend', 'Starbucks', 11.99, 'More coffee', roasts[2], flavors[0], callback);
        },
        function(callback) {
          coffeeCreate('Signature Vanilla', 'Columbia', 9.99, 'vanilla flavored goodness', roasts[0], flavors[1], callback);
        },
        function(callback) {
          coffeeCreate('Maple Extreme Blend', 'My Coffee Co.', 19.99, 'maple maple maple', roasts[1], flavors[3], callback);
        },
        function(callback) {
          coffeeCreate('Halloween Blend', 'My Coffee Co.', 8.99, 'pumpkin spice to the max', roasts[2], flavors[4], callback);
        },
        function(callback) {
          coffeeCreate('Jolt Coffee', 'My Coffee Co.', 29.99, 'like the soda, but stronger', roasts[0], flavors[0], callback);
        },
        function(callback) {
          coffeeCreate('Hazelific', 'My Coffee Co.', 29.99, 'hazelnut and super tasty', roasts[1], flavors[2], callback);
        },
        ],
        // optional callback
        cb);
}



async.series([
  createRoasts,
  createFlavors,
  createCoffees
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        // console.log('CoffeeInstances: '+coffeeinstances);
        console.log('add instances')
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



