import bcrypt from 'bcrypt';

import User from '../../modules/user/model/user-model.js';

export async function createInitialData() {
  await User.sync({ force:  true });

  const password = await bcrypt.hash('123456', 10);

  await User.create({
    name: 'User Test',
    email: 'testeuser@gmail.com',
    password
  })
}