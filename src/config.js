import {config} from 'dotenv'
config()

export const BD_HOST=process.env.BD_HOST || 'bqjrswyn6p04x0cw7qpd-mysql.services.clever-cloud.com'
export const BD_DATABASE=process.env.BD_DATABASE || 'bqjrswyn6p04x0cw7qpd'
export const BD_USER=process.env.BD_USER ||'ucmwltyqvkfigzbx'
export const BD_PASSWORD=process.env.BD_PASSWORD || 'M2GhgWuoSi4enPo6xnfM'
export const BD_PORT=process.env.BD_PORT || 3306
export const PORT=process.env.PORT || 3000
