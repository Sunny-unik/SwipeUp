import io from 'socket.io-client';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'domainname'
const socket = io(BASE_URL,{ transports : ['websocket'] });

socket.on('connect', (e) => {
    console.log("your are connected with socket");
    socket.on('disconnect', () => {
        console.log("client disconnected");
    });

    // define your event handlers
    socket.on('random', (m)=>{
        // alert(m);
    })
});

export default socket;