import { Sequelize } from 'sequelize';
import { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } from '../constants/secrets';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'postgres',
  quoteIdentifiers: false,
  define: {
    timestamps: false,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    acquire: 180000
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate()
    console.info('Connection has been stablished!');
  } catch (error) {
    console.error('Unable to connect to the database.')
    console.error(error)
  }

}



export default sequelize