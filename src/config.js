import {config} from 'dotenv'
config()

export const BD_HOST=process.env.BD_HOST || '127.0.0.1'
export const BD_DATABASE=process.env.BD_DATABASE || 'bdapi20252'
export const BD_USER=process.env.BD_USER ||'root'
export const BD_PASSWORD=process.env.BD_PASSWORD || 'root'
export const BD_PORT=process.env.BD_PORT || 3306
export const PORT=process.env.PORT || 3000
