import axios, { AxiosError } from "axios"
import { ProductClient } from "./product-client"

jest.mock('axios')

describe('ProductClient', () => {
  test('should return true if axios returns a response', async () => {
    const sut = new ProductClient()

    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {},
      status: 200,
      statusText: 'success',
      headers: {},
      config: {}
    })

    const products = [{ productId: 1, quantity: 2}]

    const response = await sut.checkProductStock(products, 'any-token', 'any-transaction-id', 'any-service-id')
    
    expect(response).toBeTruthy()
  })

  test('should return false if axios throws an error with a bad request status', async () => {
    const sut = new ProductClient()

    jest.spyOn(axios, 'post').mockImplementationOnce(async () => {
      const error = new AxiosError('bad request')

      error.code = AxiosError.ERR_BAD_REQUEST

      throw error
    })

    const products = [{ productId: 1, quantity: 2}]

    const response = await sut.checkProductStock(products, 'any-token', 'any-transaction-id', 'any-service-id')
    
    expect(response).toBeFalsy()
  })

  test('should throw an error if axios throws an error different from bad request', async () => {
    const sut = new ProductClient()

    jest.spyOn(axios, 'post').mockImplementationOnce(async () => {
      throw new Error()
    })

    const products = [{ productId: 1, quantity: 2}]
    
    await expect(() => sut.checkProductStock(products, 'any-token', 'any-transaction-id', 'any-service-id')).rejects.toThrow(new Error('Error requesting the products API'))
  })
})