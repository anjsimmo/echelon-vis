const express = require('express');
const socket = require('socket.io');
const path = require('path');
const xssFilters = require('xss-filters');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;
let io = null;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

var dataUsers = [];

function setNewUsers(f) {
  dataUsers = f(dataUsers);
  // Metadata (needed for person tracking)
  dataUsers.forEach(userData => {
    userData.idbin = "bin" + (1 + userData.id % 3);

    // Update start/end node (needed for person tracking)    
    var start = null;
    var end = null;
    userData.location.forEach(loc => {
      if (loc.timestamp) {
        t = new Date(loc.timestamp).getTime();
        if (!start || t < start) {
          start = t
        }
        if (!end || t > end) {
          end = t
        }
      }
    });
    
    if (!start) {
      start = new Date("2019-01-01T00:00:00Z").getTime();
    }
    if (!end) {
      end = start;
    }
    
    //console.log(start);
    //console.log(end);
    
    userData.person_start = {
      // convert time to number (milliseconds since epoch). Then take diff. Then convert to days.
  		"time": (start - new Date("2019-01-01T00:00:00Z").getTime()) / (24 * 60 * 60 * 1000)
    }
    userData.person_end = {
      // TODO: Extract start and end timestamps from userData.location
      "time": (end - new Date("2019-01-01T00:00:00Z").getTime()) / (24 * 60 * 60 * 1000)
    }
    userData.person_path = userData.location
  });
  io.emit('data', dataUsers);
}

function adduser(user) {
  setNewUsers(newUsers => [...newUsers, user]);
};

function addusers(users) {
  setNewUsers(newUsers => users);
};

function adduserlocation(userData) {
  setNewUsers(newUsers => {
    const newArray = Array.from(newUsers);
    newArray.forEach(user => {
      if (user.id === userData.id) {
        user.location.push(userData.location);
      }
    })

    return [...newArray]
  });
}

app.post('/api/tracking/adduser', (req, res) => {
    const newUser = req.body;
    newUser.id = newUser.id ? xssFilters.inHTMLData(newUser.id) : '0'
    adduser(newUser);
    res.send(newUser);
});

app.post('/api/tracking/adduserlocation', (req, res) => {
    const user = req.body;
    user.id = user.id ? xssFilters.inHTMLData(user.id) : '0'
    adduserlocation(user);
    res.send(user);
});

app.post('/api/tracking/addusers', (req, res) => {
    const users = [];
    req.body.data.forEach((user) => {
        const newUser = req.body;
        if (newUser.id) {
          newUser.id = xssFilters.inHTMLData(newUser.id)
          users.push(newUser);
        }
    });

    addusers(users);
    res.send(users);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const server = app.listen(PORT, () => {
    console.log('Server started at port: ', PORT);
    io = socket(server);
});
