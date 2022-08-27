
const users = [];

// Join user to chat
function userJoin(id, username) {

  const user = { id, username };

    
    users.push(user);
    console.log(users);
    return user;
   
  }
  
async function userExist(username,password){
  try{
    let user = await Model.users.findOne({
      email:username
    });

    if (!user) return {
      
  };

  }
  catch (error) {

    throw error;

}
}

function activeUser(){
  return users;
}


// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}


function getclient(name){
  return users.find(user => user.username === name);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  activeUser,
  getclient
};
