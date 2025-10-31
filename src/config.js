import { config } from 'dotenv'
config()

export const BD_HOST = process.env.BD_HOST || 'bd20252.infinityfreeapp.com'
export const BD_DATABASE = process.env.BD_DATABASE || 'if0_40242567_bdnueva'
export const BD_USER = process.env.BD_USER || 'if0_40242567'
export const BD_PASSWORD = process.env.BD_PASSWORD || 'Ingsds3BF3'
export const BD_PORT = process.env.BD_PORT || 3306
export const PORT = process.env.PORT || 3000
export const SECRET = process.env.SECRET || 'oscarELPROXD'
