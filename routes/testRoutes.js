const express = require("express");
const testController = require("../controllers/testController");

//router object
const router = express.Router();

//routes
router.get("/test", testController);

// export
module.exports = router;
