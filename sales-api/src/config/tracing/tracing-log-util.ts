class TracingLogUtil {
  static receivingRequest(type: string, name: string, data: any, transactionId: string, serviceId: string) {
    console.info(`receiving ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static respondingRequest(type: string, name: string, data: any, transactionId: string, serviceId: string) {
    console.info(`responding ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequest(type: string, name: string, data: any, transactionId: string, serviceId: string) {
    console.info(`sending ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequestSuccess(type: string, name: string, data: any, transactionId: string, serviceId: string) {
    console.info(`successfully sent ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }

  static sendingRequestFail(type: string, name: string, data: any, transactionId: string, serviceId: string) {
    console.info(`unsuccessfully sent ${type} request to ${name} with data ${
      JSON.stringify(data)
    } | [transactionId: ${transactionId
    } | serviceId: ${serviceId}]`);
  }
}

export default TracingLogUtil;