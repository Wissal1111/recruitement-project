const { Eureka } = require('eureka-js-client');

const client = new Eureka({
  instance: {
    app: 'RESPONSE-SERVICE',
    hostName: 'response_service',
    ipAddr: 'response_service',
    port: { '$': 4003, '@enabled': true },
    vipAddress: 'response-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'eureka-server',
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

module.exports = client;
