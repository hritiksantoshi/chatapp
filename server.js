const path = require("path");
const http = require("http");
const express = require("express");
const Model = require("./models/index");
const socketio = require("socket.io");
const moment = require('moment');
var alert = require("alert");
const formatMessage = require("./utils/messages");
require("dotenv").config();

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  activeUser,
  getclient,
} = require("./utils/users");
const { connected } = require("process");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "hbs");
const server = http.createServer(app);
const io = socketio(server);
const mongoose = require("mongoose");
const db_url = "mongodb://127.0.0.1/chatcord";
mongoose.connect(db_url, { useNewUrlParser: true }, function (err) {
  if (err) throw err;
  console.log("Successfully connected");
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/signIn", async (req, res) => {
  try {
    let user = await Model.users.findOne({
      email: req.body.username,
    });

    if (!user) {
      console.log("User Not found");
      res.render("index", { message: "User Not Found" });
    }

    if (user) {

      if (user.password !== req.body.pwd) {
        return res.render("index", { message: "Invalid Password" });
      } else {
        let loggedIn = await Model.users.updateOne(
          { email: user.email },
          { $set: { loggedIn: true } }
        );
        res.render("chat",{ username:user.username});
      }
    }
  } catch (error) {
    throw error;
  }
});



// Run when client connects
io.on("connection", (socket) => {
  
  socket.on("connectedUsers", async (username) => {
    const active = activeUser();
      const user = userJoin(socket.id, username);
      socket.join(user.id);

     let users = await Model.users.find({});
     io.emit("Users", users);
     io.sockets.emit('online',active)
   
  });

  //get All messages

  socket.on("PreChat",async ({username,recievername}) =>{
      
    let sender = await Model.users.findOne({username:username});
    let reciever = await Model.users.findOne({username:recievername});

      let aggregatePipelines = [
      {
          $match: {
              $or: [
                  {
                      senderId: mongoose.Types.ObjectId(sender._id),
                      recieverId:  mongoose.Types.ObjectId(reciever._id)
                  },
                  {
                      senderId:  mongoose.Types.ObjectId(reciever._id),
                      recieverId:  mongoose.Types.ObjectId(sender._id)
                  }
              ]
          }
      },
      {
         $project:{
          _id:0,
          username:{$cond:[{$eq:["$senderId",sender._id]},username,recievername]},
          reciever:{$cond:[{$eq:["$recieverId",sender._id]},username,recievername]},
          text:"$text",
          time:"$time"
         }
      }
  ]
  
  let messages = await Model.msg.aggregate(aggregatePipelines);

  socket.emit("getMessages",messages);
  });


  //emit user typing event
  socket.on('typing', (data)=>{
    if(data.typing==true)
    socket.broadcast.emit('display', data)
    else
    socket.broadcast.emit('display', data)
 })


  
  //Listen chat message
  socket.on("chatMessage", async ({ from, to, msg }) => {
    const user = getCurrentUser(socket.id);
    const reciever = getclient(to);
    console.log(reciever);
    socket.join(reciever.id);
    let a = socket.rooms;
    let sender = await Model.users.findOne({username:from});
    let recieverID = await Model.users.findOne({username:to}); 
    let NewMsg = await Model.msg.create({
      text:msg,
      senderId:sender._id,
      recieverId:recieverID._id,
      time:moment().format('h:mm a')
    })
    io.to(reciever.id).emit("message", formatMessage(user.username, msg, to));
  });

    
  //Logout event
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    const active = activeUser();
   console.log(active,"disconnect");
    io.sockets.emit('online',active);
    
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
