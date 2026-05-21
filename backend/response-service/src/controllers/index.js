const submitControllers = require("./response.submit.controller");
const queryControllers  = require("./response.query.controller");
const manageControllers = require("./response.manage.controller");

module.exports = {
  ...submitControllers,
  ...queryControllers,
  ...manageControllers
};