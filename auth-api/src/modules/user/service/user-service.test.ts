import { UserService } from "./user-service"
import { UserRepository } from "../repository/user-repository";
import { HashService } from "../../auth/service/hash-service";
import { JwtService } from "../../auth/service/jwt-service";
import User from "../model/user-model";
import { UserException } from "../exception/user-exception";
import { HTTP_STATUS } from "../../../config/constants/httpStatus";
import { AuthUser } from "../../../config/auth/auth-user";

function makeSUT() {
  const userRepository: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn()
  }

  const hashService: jest.Mocked<HashService> = {
    isTheValuesEqual: jest.fn()
  }
  
  const jwtService: jest.Mocked<JwtService> = {
    sign: jest.fn()
  }

  const sut = new UserService(userRepository, hashService, jwtService)

  return {
    userRepository,
    hashService,
    jwtService,
    sut
  }
}

describe('UserService', () => {
  describe('findByEmail', () => {
    test('should throw an error if the user repository returns no users', async () => {
      const { sut, userRepository } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null)

      await expect(() => sut.findByEmail('any-email@mail.com')).rejects.toThrow(new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.'))
    })

    test('should return the user response from the repository if everything is okay', async () => {
      const { sut, userRepository } = makeSUT();

      const createdUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password',
      } as User

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(createdUser)

      const result = await sut.findByEmail('any-email@mail.com')

      expect(result).toEqual({
        id: 1,
        email: 'any-email@mail.com',
        name: 'any-name'
      })
    })
  })

  describe('getAccessToken', () => {
    test.todo('should throw an error if the user repository returns no users')
    test.todo('should throw an error if the informed password doesn\'t match with the stored password')
    test.todo('should return the signed access token returned from the jwt service if everything is okay')
  })
})