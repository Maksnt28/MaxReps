import { loadEnv } from 'vite'
import { resolve } from 'path'

const env = loadEnv('test', resolve(__dirname, '../..'), '')
Object.assign(process.env, env)
