const submitControllers = require("./response.submit.controller");
const queryControllers  = require("./response.query.controller");
const manageControllers = require("./response.manage.controller");
const analyticControllers = require("./response.analytics.controller");

module.exports = {
  ...submitControllers,
  ...queryControllers,
  ...manageControllers,
  ...analyticControllers
};