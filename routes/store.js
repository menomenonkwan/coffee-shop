var express = require('express');
var router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  }
})
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

// Require controller modules.
var coffee_controller = require('../controllers/coffeeController');
var flavor_controller = require('../controllers/flavorController');
var roast_controller = require('../controllers/roastController');

/// coffee ROUTES ///

// GET catalog home page.
router.get('/', coffee_controller.index);

// GET request for creating a coffee. NOTE This must come before routes that display coffee (uses id).
router.get('/coffee/create', coffee_controller.coffee_create_get);

// POST request for creating coffee.
router.post('/coffee/create', upload.single('image'), coffee_controller.coffee_create_post);

// GET request to delete coffee.
router.get('/coffee/:id/delete', coffee_controller.coffee_delete_get);

// POST request to delete coffee.
router.post('/coffee/:id/delete', coffee_controller.coffee_delete_post);

// GET request to update coffee.
router.get('/coffee/:id/update', coffee_controller.coffee_update_get);

// POST request to update coffee.
router.post('/coffee/:id/update', upload.single('image'), coffee_controller.coffee_update_post);

// GET request for one coffee.
router.get('/coffee/:id', coffee_controller.coffee_detail);

// GET request for list of all coffee items.
router.get('/coffees', coffee_controller.coffee_list);

/// flavor ROUTES ///

// GET request for creating flavor. NOTE This must come before route for id (i.e. display flavor).
router.get('/flavor/create', flavor_controller.flavor_create_get);

// POST request for creating flavor.
router.post('/flavor/create', flavor_controller.flavor_create_post);

// GET request to delete flavor.
router.get('/flavor/:id/delete', flavor_controller.flavor_delete_get);

// POST request to delete flavor.
router.post('/flavor/:id/delete', flavor_controller.flavor_delete_post);

// GET request for one flavor.
router.get('/flavor/:id', flavor_controller.flavor_detail);

// GET request for list of all flavors.
router.get('/flavors', flavor_controller.flavor_list);

/// roast ROUTES ///

// GET request for one roast.
router.get('/roast/:id', roast_controller.roast_detail);

// GET request for list of all roast.
router.get('/roasts', roast_controller.roast_list);

module.exports = router;