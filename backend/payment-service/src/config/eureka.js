const { Eureka } = require('eureka-js-client');

const client = new Eureka({
  instance: {
    app: 'PAYMENT-SERVICE',           // ← Nom du service
    hostName: 'payment_service',      // ← Nom Docker
    ipAddr: 'payment_service',        // ← IP Docker
    port: { '$': 3050, '@enabled': true },
    vipAddress: 'payment-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'eureka-server',            // ← Nom Docker du serveur Eureka
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

module.exports = client;
