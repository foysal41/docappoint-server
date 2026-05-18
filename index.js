const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://docappoint:docappoint@cluster0.8xvidah.mongodb.net/docappointdb?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("docappointdb");
    const doctorsCollection = db.collection("doctors");

    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });


    app.get("/doctors/:doctorId" , async(req, res) => {
        const {doctorId} = req.params;

        // console.log(doctorId)

        const query = {_id: new ObjectId(doctorId)}
        const result = await doctorsCollection.findOne(query);
        res.send(result)

    })



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});