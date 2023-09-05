const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s8lfr5s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const database = client.db("madrasahDB");
    const usersCollection = database.collection("users");
    const eventsCollection = database.collection("events");
    const noticesCollection = database.collection("notices");

    // Get all users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get only all admins
    app.get("/users/admins", async (req, res) => {
      const query = { role: "admin" };
      const admins = usersCollection.find(query);
      const result = await admins.toArray();
      res.send(result);
    });

    // Get only all teachers
    app.get("/users/teachers", async (req, res) => {
      const query = { role: "teacher" };
      const teachers = usersCollection.find(query);
      const result = await teachers.toArray();
      res.send(result);
    });

    // Get only all students
    app.get("/users/students", async (req, res) => {
      const query = { role: "student" };
      const students = usersCollection.find(query);
      const result = await students.toArray();
      res.send(result);
    });

    // Get user by id
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // Get user by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Get admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // Get teacher user
    app.get("/users/teacher/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { teacher: user?.role === "teacher" };
      res.send(result);
    });

    // Get student user
    app.get("/users/student/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { student: user?.role === "student" };
      res.send(result);
    });

    // Get all events
    app.get("/events", async (req, res) => {
      const cursor = eventsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get all notices
    app.get("/notices", async (req, res) => {
      const cursor = noticesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Make admin from teacher
    app.patch("/users/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Remove admin as teacher
    app.patch("/users/removeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "teacher",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Update student user data
    app.patch("/user/student/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateUser = req.body;
      console.log(updateUser);
      const updateDoc = {
        $set: {
          name: updateUser.name,
          bio: updateUser.bio,
          position: updateUser.position,
          nickName: updateUser.nickName,
          fatherName: updateUser.fatherName,
          motherName: updateUser.motherName,
          mobileNumber: updateUser.mobileNumber,
          bloodGroup: updateUser.bloodGroup,
          birthdayDate: updateUser.birthdayDate,
          madrasahName: updateUser.madrasahName,
          class: updateUser.class,
          roll: updateUser.roll,
          address: updateUser.address,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete any user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Delete a event
    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(query);
      res.send(result);
    });

    // Delete a notice
    app.delete("/notices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await noticesCollection.deleteOne(query);
      res.send(result);
    });

    // Post and user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Post a event
    app.post("/events", async (req, res) => {
      const event = req.body;
      const result = await eventsCollection.insertOne(event);
      res.send(result);
    });

    // Post a notice
    app.post("/notices", async (req, res) => {
      const notice = req.body;
      const result = await noticesCollection.insertOne(notice);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Golbunia Nesaria Dakhil Madrasah server is running successfully!");
});

app.listen(port, () => {
  console.log(`Golbunia Nesaria Dakhil Madrasah server is runnig on PORT: ${port}`);
});
