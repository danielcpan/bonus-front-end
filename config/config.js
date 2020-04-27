// const { hostname: PROD_SITE } = window.location;

// const PROD_ENVIRONMENTS = {
//   "myappliedqa1.z22.web.core.windows.net": "qa1",
//   "myappliedqa2.z22.web.core.windows.net": "qa2",
//   "myappliedqa3.z22.web.core.windows.net": "qa3",
//   "my.appliedmedical.com": "prod",
// };

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./config.prod');
} else if (process.env.NODE_ENV === 'development') {
  module.exports = require('./config.dev');
} else if (process.env.NODE_ENV === 'test') {
  module.exports = require('./config_test');
}

// PRODUCTION ENVS

// switch (PROD_SITE) {
//   case PROD_ENVIRONMENTS["my.appliedmedical.com"]:
//     module.exports = require("./config.prod");
//     break;
//   case PROD_ENVIRONMENTS["myappliedqa1.z22.web.core.windows.net"]:
//     module.exports = require("./config.qa");
//     break;
//   case PROD_ENVIRONMENTS["myappliedqa2.z22.web.core.windows.net"]:
//     module.exports = require("./config.qa");
//     break;
//   case PROD_ENVIRONMENTS["myappliedqa3.z22.web.core.windows.net"]:
//     module.exports = require("./config.qa");
//     break;
// }
