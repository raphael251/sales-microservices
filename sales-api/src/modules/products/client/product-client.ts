import axios, { AxiosError } from "axios";
import { PRODUCT_API_URL } from "../../../config/constants/secrets";
import TracingLogUtil from "../../../config/tracing/tracing-log-util";

class ProductClient {
  async checkProductStock(products: Array<{ productId: number, quantity: number }>, token: string, transactionId: string, serviceId: string) {
    try {
      TracingLogUtil.sendingRequest('POST', 'checkProductStock', products, transactionId, serviceId);
      const response = await axios.post(
        `${PRODUCT_API_URL}/check-stock`, 
        { products },
        {
          headers: {
            Authorization: token,
            transactionId
          }
        }
      )
      
      TracingLogUtil.sendingRequestSuccess('POST', 'checkProductStock', { products, response: response.data }, transactionId, serviceId)
      return true
    } catch (error) {
      if (error instanceof AxiosError && error.code === AxiosError.ERR_BAD_REQUEST) {
        TracingLogUtil.sendingRequestSuccess('POST', 'checkProductStock', { products, response: { status: error.response?.status, data: error.response?.data } }, transactionId, serviceId)
        return false
      }

      TracingLogUtil.sendingRequestFail('POST', 'checkProductStock', products, transactionId, serviceId);
      throw new Error('Error requesting the products API');
    }
  }
}

export default new ProductClient();