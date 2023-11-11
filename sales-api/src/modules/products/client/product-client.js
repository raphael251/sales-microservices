import axios from "axios";
import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";
import { HTTP_STATUS } from "../../../config/constants/httpStatus.js";

class ProductClient {
  async checkProductStock(products, token) {
    try {
      console.info(`sending request to product API with data: ${JSON.stringify(products, undefined, 2)}`)
      await axios.post(
        `${PRODUCT_API_URL}/check-stock`, 
        { products }, 
        {
          headers: { 
            Authorization: token
          }
        }
      )
      
      return true
    } catch (err) {
      return false;
    }
  }
}

export default new ProductClient();