const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
//middleware
app.use(cors());
app.use(express.json());

//mongodb connect

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p85dy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("wareHouse").collection("inventories");
    //post test mongodb
    app.post('/inventories', async (req, res) => {
      const newInventory = req.body
      const result = await inventoryCollection.insertOne(newInventory)
      res.send(result);
    })
    //get inventories
    app.get('/inventories', async (req, res) => {
      const query = {}
      const cursor = inventoryCollection.find(query)
      const inventories = await cursor.toArray();
      res.send(inventories)
    })
  }
  finally {
    
  }
}
run().catch(console.dir)







app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Listening from port ${port}`);
});
