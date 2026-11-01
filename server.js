import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String
}))

const Order = mongoose.model('Order', new mongoose.Schema({
  customerName: String,
  address: String,
  items: Array,
  total: Number,
  createdAt: { type: Date, default: Date.now }
}))

app.get('/api/products', async (req, res) => res.json(await Product.find()))
app.post('/api/products', async (req, res) => res.status(201).json(await Product.create(req.body)))
app.post('/api/orders', async (req, res) => res.status(201).json(await Order.create(req.body)))

app.listen(5000, () => console.log('Server running on port 5000'))