import User from "../model/user-model";
import { UserRepository } from "./user-repository";

jest.mock('../model/user-model')

function makeSUT() {
  const sut = new UserRepository()

  return { sut }
}

describe('UserRepository', () => {
  describe('findById', () => {
    test('should return null if the user model throws an error', async () => {
      const { sut } = makeSUT();

      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('some error');
      });

      const response = await sut.findById('some-id');

      expect(response).toBeNull();
    });

    test('should return null if the user model returns null', async () => {
      const { sut } = makeSUT();

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

      const response = await sut.findById('some-id');

      expect(response).toBeNull();
    });

    test('should return the user returned by the model if everything is okay', async () => {
      const { sut } = makeSUT();

      const createdUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password',
      } as User

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(createdUser);

      const response = await sut.findById('some-id');

      expect(response).toEqual(createdUser);
    });
  });

  describe('findByEmail', () => {
    test('should return null if the user model throws an error', async () => {
      const { sut } = makeSUT();

      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('some error');
      });

      const response = await sut.findByEmail('some-id');

      expect(response).toBeNull();
    });

    test('should return null if the user model returns null', async () => {
      const { sut } = makeSUT();

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

      const response = await sut.findByEmail('some-id');

      expect(response).toBeNull();
    });

    test('should return the user returned by the model if everything is okay', async () => {
      const { sut } = makeSUT();

      const createdUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email@mail.com',
        password: 'any-password',
      } as User

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(createdUser);

      const response = await sut.findByEmail('some-id');

      expect(response).toEqual(createdUser);
    });
  });
});