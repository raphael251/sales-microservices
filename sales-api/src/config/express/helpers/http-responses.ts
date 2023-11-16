import { Response } from "express"
import { HTTP_STATUS } from "../../constants/httpStatus"

export const httpResponsesHelper = {
  success(res: Response, data: any = { message: 'success' }): void {
    res.status(HTTP_STATUS.SUCCESS).json(data)
  },
  created(res: Response, data: any = { message: 'created' }): void {
    res.status(HTTP_STATUS.CREATED).json(data)
  },
  badRequest(res: Response, data: any = { message: 'bad request' }): void {
    res.status(HTTP_STATUS.BAD_REQUEST).json(data)
  },
  internalServerError(res: Response, data: any = { message: 'internal server error' }): void {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(data)
  }
}