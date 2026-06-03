const { Eureka } = require('eureka-js-client');

const client = new Eureka({
  instance: {
    app: 'USER-SERVICE',
    hostName: 'user_service',
    ipAddr: 'user_service',
    port: { '$': 3002, '@enabled': true },
    vipAddress: 'user-service',
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
