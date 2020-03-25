import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Map from './Map';
import './App.css';
import io from 'socket.io-client';
//const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

// function generateRandomLocation(startDate, endDate, height = 376, width = 575) {
//   let diff = endDate.getTime() - startDate.getTime();
//   let new_diff = diff * Math.random();
//   return {
//     x: Math.floor(Math.random() * width),
//     y: Math.floor(Math.random() * height),
//     timestamp: new Date(startDate.getTime() + new_diff)
//   }
// }

// function filterLocationByTime(userData, startTime, endTime) {
//   return userData.location.filter(location => {
//     if (location.timestamp >= startTime && location.timestamp <= endTime) {
//       return location;
//     }
//     return "";
//   });
// }

function App() {
  const [newUsers, setNewUsers] = useState([]);
  
  console.log('init');
  let params = (new URL(document.location)).searchParams;
  let loadUrl = params.get('load');
  console.log(loadUrl);
  let socketUrl = params.get('socket'); // || 'http://localhost:3000';
  console.log(socketUrl);
  let notationUrl = params.get('notation');
  console.log(notationUrl);
  console.log('end init');

  // // load JSON data
  // function loadJson(data) {
  //   console.log(data);
  //   d3.select('#chart')
  //       .datum(data)
  //       .call(chart);
  // }

  // load notation
  // (for simplicitly, and as small, wait for it to load)
  // https://stackoverflow.com/questions/39679505/using-await-outside-of-an-async-function
  // TODO: move to within useEffect?
  
  // let notation = (async () => {
  //   console.log(notationUrl);
  //   await d3.json(notationUrl);
  // })();
  // console.log(notation);
  // 
  // const [notationParam, setNotationParam] = useState(notation);
  
  const [notationParam, setNotationParam] = useState({});

  useEffect(() => {
    // load data (asynchronous)
    // d3.json(loadUrl).then(function(data) {
    //   let users = data;
    //   console.log(users);
    //   setNewUsers(users);
    // });
    
    d3.json(notationUrl).then(function(notation) {
      console.log(notation);
      setNotationParam(notation);

      if (loadUrl) {
        d3.json(loadUrl).then(function(data) {
          console.log(data);
          let users = data;
          console.log(users);
          setNewUsers(users);
        });
      }

      if (socketUrl) {
        const socket = io(socketUrl);
        // 'data' tag is Echelon convention
        socket.on('data', (users) => {
          setNewUsers(users)
        });
      }
    });


    
    // TODO: Remove these?
    // socket.on('adduser', (user) => {
    //   setNewUsers(newUsers => [...newUsers, user])
    // });
    // socket.on('addusers', (users) => {
    //   setNewUsers(users)
    // });
    // socket.on('adduserlocation', (userData) => {
    //   setNewUsers(newUsers => {
    //     const newArray = Array.from(newUsers);
    //     newArray.forEach(user => {
    //       if (user.id === userData.id) {
    //         user.location.push(userData.location);
    //       }
    //     })
    // 
    //     return [...newArray]
    //   });
    // });
  }, []);

  // const [location, setLocation] = useState([
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 2), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
  //   generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3))
  // ])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setLocation(location => [...location, generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3))]);
  //   }, 5000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (window.confirm("Filter the data?")) {
  //       setLocation(location => filterLocationByTime({ id: 1111, location: location, name: 'new user' }, new Date(2019, 9, 2), new Date(2019, 9, 3)))
  //     }
  //   }, 15000);

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  return (
    <div className="App">
      <Map trackuserdata={newUsers} notation={notationParam} />
    </div>
  );
}

export default App;
