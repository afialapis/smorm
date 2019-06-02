import {Smorm} from '../src/index'

const DB_CONFIG= {
  host:     'localhost',
  port:     5432,
  database: 'smorm',
  user:     'postgres',
  password: 'postgres'
}

const db= Smorm(DB_CONFIG, 'warn')

export default db