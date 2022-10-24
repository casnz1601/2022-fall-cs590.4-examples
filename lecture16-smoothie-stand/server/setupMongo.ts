import { MongoClient, ObjectId } from 'mongodb'
import { Operator, Customer } from './data'

// Connection URL
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

const operators: Operator[] = [
  {
    _id: "jim",
    name: "Jim",
  },
  {
    _id: "mary",
    name: "Mary",
  },
]

const customers: Customer[] = [
  {
    _id: "alice",
    name: "Alice",
  },
  {
    _id: "bob",
    name: "Bob",
  },
]

async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')
  
  // add data
  const db = client.db("test")

  console.log("inserting customers", await db.collection("customers").insertMany(customers as any))
  console.log("inserting operators", await db.collection("operators").insertMany(operators as any))

  process.exit(0)
}

main()
