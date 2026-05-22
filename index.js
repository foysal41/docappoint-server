const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dns = require("dns");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;


const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
    )
    console.log(JWKS)
  

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const logger = (req, res, next)=> {
  console.log(`${req.method} | ${req.url}`);
  next();
}

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;

  console.log("Authorization:", authorization);

  const token = authorization?.split(" ")[1];

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);

    console.log("Token verified");
    console.log("User:", payload);

    req.user = payload;
    next();
  } catch (error) {
    console.log("Token invalid:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("docappointdb");
    const doctorsCollection = db.collection("doctors");
const bookingCollection = db.collection("bookings");





  app.get("/doctors", async (req, res) => {
  const { search } = req.query;

  let cursor;

  if (search) {
    cursor = doctorsCollection.find({
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          specialty: {
            $regex: search,
            $options: "i",
          },
        },
        {
          hospital: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    });
  } else {
    cursor = doctorsCollection.find();
  }

  const result = await cursor.toArray();
  res.send(result);
});



    app.get("/doctors/:doctorId" , logger, verifyToken, async(req, res) => {
        const {doctorId} = req.params;

        // console.log(doctorId)

        const query = {_id: new ObjectId(doctorId)}
        const result = await doctorsCollection.findOne(query);
        res.send(result)

    })



app.post('/booking', async(req, res)=>{
  const bookingData = req.body;
  const result = await bookingCollection.insertOne(bookingData)
   res.send(result);
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