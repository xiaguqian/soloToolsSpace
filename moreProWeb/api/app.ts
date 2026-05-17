import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import fs from 'fs'
import sqlite3 from 'sqlite3'
import authRoutes from './routes/auth.js'
import tenantRoutes from './routes/tenant.js'
import productRoutes from './routes/product.js'
import bannerRoutes from './routes/banner.js'
import endUserRoutes from './routes/endUser.js'
import orderRoutes from './routes/order.js'
import staffRoutes from './routes/staff.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'database.sqlite')
const initSqlPath = path.join(__dirname, '../sql/init.sql')

if (!fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath)
  const initSql = fs.readFileSync(initSqlPath, 'utf8')
  db.exec(initSql, (err) => {
    if (err) {
      console.error('Database initialization error:', err)
    } else {
      console.log('Database initialized successfully')
    }
    db.close()
  })
}

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/tenant', tenantRoutes)
app.use('/api/product', productRoutes)
app.use('/api/banner', bannerRoutes)
app.use('/api/end-user', endUserRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/staff', staffRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app