const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const app = express();
const server = app.listen(8082); 
const io = require('socket.io').listen(server); 




// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(options, app);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

}

//Importing files here
const router = require("./routes/router");
const keys = require("./config/keys.js");



//bodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(
    keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(console.log("Connected to MongoDB.."))
  .catch(err => console.log(err));

app.use("/", router);
const users = {};

io.on('connection', socket => { 
    console.log(`user ${socket.id} connected!!!`);
    
    socket.on('message', function(message) { 
	
      var data; 
		
      //accepting only JSON messages 
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
		
      //switching type of the user message 
      switch (data.type) { 
        //when a user tries to login
        case "login": 
          console.log("User logged", data.name); 
      
          // //if anyone is logged in with this username then refuse 
          // if(users[data.name]) { 
          //    sendTo(socket, { 
          //       type: "login", 
          //       success: false 
          //    }); 
          // } else { 
          //    //save user socket on the server 
              users[data.name] = socket; 
              socket.name = data.name; 
        
              sendTo(socket, { 
                type: "login", 
                success: true 
              }); 
          // } 
      
          break;
        
        case "requestToCall":
          console.log('sending a call request to ' + data.to)
          var conn = users[data.name]; 
          if(conn != null) { 
            //setting that UserA connected with UserB 
            socket.otherName = data.name; 
      
            sendTo(conn, { 
              type: "requestToCall", 
              from: socket.name 
            }); 
          }
          break;
        case "answerToRequest":
            console.log('sending an answer to call request to ' + data.from)
            var conn = users[data.from]; 
            if(conn != null) { 
              //setting that UserA connected with UserB 
              socket.otherName = data.name; 
        
              sendTo(conn, { 
                type: "answerToRequest", 
                from: socket.name 
              }); 
            }
            break;
        case "offer": 
          //for ex. UserA wants to call UserB 
          console.log("Sending offer to: ", data.name);
      
          //if UserB exists then send him offer details 
          var conn = users[data.name]; 
      
          if(conn != null) { 
              //setting that UserA connected with UserB 
              socket.otherName = data.name; 
        
              sendTo(conn, { 
                type: "offer", 
                offer: data.offer, 
                name: socket.name 
              }); 
          }
      
          break;
      
        case "answer": 
          console.log("Sending answer to: ", data.name); 
          //for ex. UserB answers UserA 
          var conn = users[data.name]; 
      
          if(conn != null) { 
              socket.otherName = data.name; 
              sendTo(conn, { 
                type: "answer", 
                answer: data.answer,
                from: data.name
              }); 
          } 
      
          break; 
      
        case "candidate": 
          console.log("Sending candidate to:", data.name); 
          var conn = users[data.name];
      
          if(conn != null) { 
              sendTo(conn, { 
                type: "candidate", 
                candidate: data.candidate 
              }); 
          } 
      
          break;
      
        case "leave": 
          console.log("Disconnecting from", data.name); 
          var conn = users[data.name]; 
          // console.log(conn);
          conn.otherName = null; 
          //notify the other user so he can disconnect his peer socket 
          if(conn != null) {
              sendTo(conn, { 
                type: "leave" 
            }); 
          }
      
          break;
      
        default: 
          sendTo(socket, { 
              type: "error", 
              message: "Command not found: " + data.type 
          }); 
      
          break; 
      }
		
   }); 
	
   //when user exits, for example closes a browser window 
   //this may help if we are still in "offer","answer" or "candidate" state 
   socket.on("close", function() { 
	
      if(socket.name) { 
         delete users[socket.name]; 
			
         if(socket.otherName) { 
            console.log("Disconnecting from ", socket.otherName); 
            var conn = users[socket.otherName]; 
            conn.otherName = null;
				
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
            }
         } 
      }
		
   });   
});
  
function sendTo(socket, message) { 
   socket.send(JSON.stringify(message)); 
}

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on ${PORT}..`));
