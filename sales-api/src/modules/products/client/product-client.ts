import axios from "axios";
import { PRODUCT_API_URL } from "../../../config/constants/secrets";
import TracingLogUtil from "../../../config/tracing/tracing-log-util";

class ProductClient {
  async checkProductStock(products: any, token: string, transactionId: string, serviceId: string) {
    try {
      TracingLogUtil.sendingRequest('POST', 'checkProductStock', products, transactionId, serviceId);
      await axios.post(
        `${PRODUCT_API_URL}/check-stock`, 
        { products }, 
        {
          headers: { 
            Authorization: token,
            transactionId
          }
        }
      )
      
      TracingLogUtil.sendingRequestSuccess('POST', 'checkProductStock', products, transactionId, serviceId)
      return true
    } catch (err) {
      TracingLogUtil.sendingRequestFail('POST', 'checkProductStock', products, transactionId, serviceId)
      return false;
    }
  }
}

export default new ProductClient();