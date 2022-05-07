const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
//middleware
app.use(cors());
app.use(express.json());

//mongodb connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p85dy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("wareHouse").collection("items");
    //post item in database
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      // console.log(req.body);
      const result = await inventoryCollection.insertOne(newItem);
      res.send(result);
    });
    //Get all items from database
    app.get("/inventory", async (req, res) => {
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = inventoryCollection.find(query);
      let items;
      if (size) {
        items = await cursor.limit(size).toArray();
      } else {
        items = await cursor.toArray();
      }
      res.send(items);
    });
    //Update single item in database
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      // console.log(data);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = { $set: { quantity: data.quantity } };
      const result = await inventoryCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Get single item from database
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await inventoryCollection.findOne(query);
      res.send(item);
    });
    //Delete single item from database
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });
    //Get user added items
    app.get("/inventoryUser", async (req, res) => {
      // console.log(req.query);
      const userToken = req.headers.authorization;
      console.log(userToken);
      const [userEmail, accessToken] = userToken?.split(" ");
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const email = req.query.email;
      const query = { email: email };
      if (userEmail === decoded.email) {
        const cursor = inventoryCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      }
      else {
        res.status(403).send({message: "Forbidden Access"})
      }
    });
    //Get token api
    app.post("/login", async (req, res) => {
      const email = req.body;
      // console.log(email);
      const token = await jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      // console.log(token);
      res.send({ token: token });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Listening from port ${port}`);
});
