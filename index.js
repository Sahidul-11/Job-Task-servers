const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://serene-tarsier-78925d.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Enable CORS for all routes



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.90yxez6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const ProductsCollation = client.db("JOBTask").collection("products")
    app.get("/products", async (req, res) => {
      const { currentPage, search, sort, category, brand, maxPrice, minPrice } = req.query;
      let query = {}
      let sortOPtion = {}
      console.log(maxPrice ,minPrice);
      
      if (sort === "highToLow") {
        sortOPtion.price = -1;
      }
      if (sort === "LowToHigh") {
        sortOPtion.price = 1;
      }
      if (sort === "new") {
        sortOPtion.creationDateTime = -1;
      }
      if (brand) {
        query.brandName = brand
      }
      if (search) {
        query.productName = { $regex: search, $options: "i" }

      }
      if (category) {
        query.category = category
      }
      if (minPrice && maxPrice) {
       query.price ={ $gte:parseInt(minPrice), $lte:parseInt(maxPrice) }
      }

      const limit = 9;
      const skip = parseInt(currentPage) * limit;
      const result = await ProductsCollation.find(query).sort(sortOPtion).skip(skip).limit(limit).toArray()
      res.send(result)
    });


    app.get("/totalProducts", async (req, res) => {
      const { search, category, brand, maxPrice, minPrice } = req.query;
      console.log(brand);

      let query = {}


      if (category) {
        query.category = category
      }
      if (brand) {
        query.brandName = brand
      }
      if (search) {
        query.productName = { $regex: search, $options: "i" }

      }
      if (minPrice && maxPrice) {
        console.log("hee " ,maxPrice)
        query.price ={ $gte:parseInt(minPrice), $lte:parseInt(maxPrice) }
       }

      const count = await ProductsCollation.countDocuments(query)
      res.send({ count })
    });
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


// Use CORS options for specific routes


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
