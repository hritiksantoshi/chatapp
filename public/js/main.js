const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
var typing=false;
var timeout=undefined;
let reciever;
const username = document.getElementById("username").value;

const socket = io("http://localhost:3000");

// Join
socket.emit("connectedUsers", username);

// Get Active users
socket.on("Users", (users) => {
  outputUsers(users);
});


//get online users
socket.on("online", (data) => {
  console.log(data, "users");
  let input = userList.getElementsByTagName("li");
  for (let i = 0; i < input.length; i++) {
    input[i].className = "";
  }
  data.forEach((e) => {
    for (let i = 0; i < input.length; i++) {
      if (input[i].id === e.username+'-li') {
        let a = document.getElementById(e.username+'-li');
        a.className = "active";
      }
      console.log(input[i]);

    }
  });
});

// Message from server
socket.on("message", (data) => {
  console.log(data);
  outputMessage(data);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


//emit typing event to server
chatForm.addEventListener("keypress",(event) =>{
  if(event.key != 'Enter'){
    typing=true
        socket.emit('typing', {user:username, typing:true})
        clearTimeout(timeout)
        timeout=setTimeout(typingTimeout, 1500)
  }else{
    clearTimeout(timeout);
    typingTimeout();
  }
})

function typingTimeout(){
  typing=false
  socket.emit('typing', {user:username, typing:false})
}

//listen typing event from server
socket.on('display', (data)=>{
  if(data.typing==true){
    let type = userList.getElementsByTagName("li");
    for(let i = 0; i < type.length; i++){
         if(type[i].id === data.user+'-li'){
          let b = document.getElementById(data.user+'-li');
          b.classList.add('type')
         }
    }
    
  }
  else{
    let type = userList.getElementsByTagName("li");
    for(let i = 0; i < type.length; i++){
      if(type[i].id === data.user+'-li'){
        let b = document.getElementById(data.user+'-li');
        b.classList.remove('type')
    }
  }
}
    
  })


// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", {
    from: username,
    to: reciever,
    msg: msg,
  });

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});


// Output message to DOM
function outputMessage(message) {
  let user_tab;
  const div = document.createElement("li");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  if (message.username == username) {
    user_tab = document.getElementById(message.reciever);
    p.innerText = "You";
  } else {
    user_tab = document.getElementById(message.username);
    p.innerText = message.username;
  }
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  if (message.username === username) {
    div.style.float = "left";
    div.style.clear = "left";
    div.style.marginLeft = "600px";
  } else {
    div.style.float = "left";
    div.style.clear = "left";
  }
  div.appendChild(para);
  user_tab.appendChild(div);
}

socket.on("getMessages",(messages) => {
  messages.forEach( e => {
     outputMessage(e);
  })
})


//Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  chatMessages.innerHTML = "";
  users.forEach((user) => {
    if (user.username !== username) {
      const li = document.createElement("li");
      const user_tab = document.createElement("ul");
      user_tab.className = "userTab";
      user_tab.id = user.username;
      user_tab.style.display = "none";
      chatMessages.appendChild(user_tab);
      li.innerText = user.username;
      li.id = user.username + '-li';

      userList.appendChild(li);
      
      socket.on("Typing",(msg) =>{
        console.log(msg);
      })


      li.onclick = function () {
        reciever = li.innerText;

        let tabs = document.querySelectorAll(".userTab");
        tabs.forEach((tab) => {
          tab.style.display = "none";
        });
        user_tab.style.display = "block";
         
        let listItems = document.querySelectorAll("#users li");

        listItems.forEach((elem) => {
          elem.classList.remove("selected");
        });
        li.classList.add("selected");
       
        socket.emit("PreChat",({username:username,recievername:li.innerText}));
        console.log(listItems);
      };
    }
  });
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location.href = "/";
  } else {
  }
});
