const { Eureka } = require('eureka-js-client');


const client = new Eureka({
  instance: {
    app: 'SURVEY-SERVICE',
    hostName: 'survey_service',
    ipAddr: 'survey_service',
    port: { '$': 4000, '@enabled': true },
    vipAddress: 'survey-service',
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
