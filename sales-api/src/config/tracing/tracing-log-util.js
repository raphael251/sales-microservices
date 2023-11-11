class TracingLogUtil {
  static receivingRequest(type, name, data, transactionId, serviceId) {
    console.info(`receiving ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static respondingRequest(type, name, data, transactionId, serviceId) {
    console.info(`responding ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequest(type, name, data, transactionId, serviceId) {
    console.info(`sending ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequestSuccess(type, name, data, transactionId, serviceId) {
    console.info(`successfully sent ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequestFail(name, data, transactionId, serviceId) {
    console.info(`unsuccessfully sent ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }
}

export default TracingLogUtil;