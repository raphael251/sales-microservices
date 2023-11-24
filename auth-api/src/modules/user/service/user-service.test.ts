import { UserService } from "./user-service"
import { UserRepository } from "../repository/user-repository";
import { HashService } from "../../auth/service/hash-service";
import { JwtService } from "../../auth/service/jwt-service";
import User from "../model/user-model";
import { UserException } from "../exception/user-exception";
import { HTTP_STATUS } from "../../../config/constants/httpStatus";
import { UnexpectedException } from "../exception/unexpected-exception";

function makeSUT() {
  const userRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn()
  }

  const hashService: jest.Mocked<HashService> = {
    isTheValuesEqual: jest.fn(),
    hash: jest.fn()
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
  const dbUser = {
    id: 1,
    name: 'any-name',
    email: 'any-email@mail.com',
    password: 'any-password',
  } as User

  describe('create', () => {
    test('should throw an error if the repository returns an already existing user with the passed email', async () => {
      const { sut, userRepository } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(dbUser);

      const userToCreate = {
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password'
      }

      await expect(() => sut.create(userToCreate)).rejects.toThrow(new UserException(HTTP_STATUS.BAD_REQUEST, 'There is already a user using this email address.'));
    })

    test('should throw an error if the repository create operation fails', async () => {
      const { sut, userRepository, hashService } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      const userToCreate = {
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password'
      }

      await expect(() => sut.create(userToCreate)).rejects.toThrow(new UnexpectedException('Could not create user'));
      expect(hashService.hash).toHaveBeenCalled()
    })

    test('should throw an error if the repository create operation fails', async () => {
      const { sut, userRepository, hashService } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce(dbUser);

      const userToCreate = {
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password'
      }

      const response = await sut.create(userToCreate)

      const { password, ...expectedResponse } = dbUser

      expect(response).toEqual(expectedResponse)
      expect(hashService.hash).toHaveBeenCalled()
    })
  })


  describe('findByEmail', () => {
    test('should throw an error if the user repository returns no users', async () => {
      const { sut, userRepository } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(() => sut.findByEmail('any-email@mail.com')).rejects.toThrow(new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.'));
    });

    test('should return the user response from the repository if everything is okay', async () => {
      const { sut, userRepository } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(dbUser);

      const result = await sut.findByEmail('any-email@mail.com');

      expect(result).toEqual({
        id: 1,
        email: 'any-email@mail.com',
        name: 'any-name'
      });
    });
  })

  describe('getAccessToken', () => {
    test('should throw an error if the user repository returns no users', async () => {
      const { sut, userRepository } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(
        () => sut
          .getAccessToken('any-email@mail.com', 'any-password', 'any-transaction-id', 'any-service-id')
      )
        .rejects
        .toThrow(new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.'));
    });

    test('should throw an error if the informed password doesn\'t match with the stored password', async () => {
      const { sut, userRepository, hashService } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(dbUser);
      jest.spyOn(hashService, 'isTheValuesEqual').mockResolvedValueOnce(false);

      await expect(
        () => sut
          .getAccessToken('any-email@mail.com', 'any-password', 'any-transaction-id', 'any-service-id')
      )
        .rejects
        .toThrow(new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.'));
    });
    
    test('should return the signed access token returned from the jwt service if everything is okay', async () => {
      const { sut, userRepository, hashService, jwtService } = makeSUT();

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(dbUser);
      jest.spyOn(hashService, 'isTheValuesEqual').mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('returned-signed-jwt')

      const result = await sut.getAccessToken('any-email@mail.com', 'any-password', 'any-transaction-id', 'any-service-id');

      expect(result).toEqual({ accessToken: 'returned-signed-jwt' });
    });
  })
})