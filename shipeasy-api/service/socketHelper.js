let io;
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uuid = require('uuid');
const newSchemaWithObject = require('../schema/schema');

const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject['user'], `users`);
const messageModel = mongoose.models[`messageModel`] || mongoose.model(`messageModel`, newSchemaWithObject["message"], `messages`);
            
function init(server) {
    try {
        const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [];
        io = socketIo(server, {
            cors: {
                origin: allowedOrigins.length > 0 ? allowedOrigins : false,
                methods: ['GET', 'POST']
            }
          });
        
        io.use(async (socket, next) => {
            let token;

            if (socket?.handshake?.headers['authorization']?.startsWith("Bearer"))
                token = socket.handshake.headers['authorization'].split(" ")[1]
            else
                token = socket?.handshake?.headers['authorization'];
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);

                    await userModel.findOne({'userLogin': decoded?.user?.username }).then(async function (user) {
                        socket.user = user

                        if(!(user?.userStatus))
                            return next(new Error('Authentication error'));
                        else 
                            next();
                    })  
                } catch (error) {
                    console.log(error)
                    return next(new Error('Authentication error'));
                }
            } else {
                console.log("error")
                next(new Error('Authentication error'));
            }
        });
          
        io.on('connection', async (socket) => {
            const user = socket?.user;

            if (user){
                const options = {
                    returnDocument: 'after',
                    projection: { _id: 0, __v: 0 },
                };

                await userModel.findOneAndUpdate({userId : user.userId}, {$set : {userSocketStatus : true}}, options).then(async function (updatedDocument) {
                    if (updatedDocument){
                        const {userId, userSocketStatus, ...other} = updatedDocument;

                        io.emit("user-status", {
                            userId : userId,
                            userSocketStatus : userSocketStatus
                        });
                    }
                });
            }

            // console.log('New client connected : ', user.name);
    
            socket.on('disconnect', async () => {
                if (user){
                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };

                    await userModel.findOneAndUpdate({userId : user.userId}, {$set : {userSocketStatus : false}}, options).then(async function (updatedDocument) {
                        if (updatedDocument){
                            const {userId, userSocketStatus, ...other} = updatedDocument;

                            io.emit("user-status", {
                                userId : userId,
                                userSocketStatus : userSocketStatus
                            });
                        }
                    });
                }
                console.log('Client disconnected');
            });

            socket.on('send-message', (message) => {
                if (user) {
                    let data = {...message};

                    data["createdOn"] = new Date().toISOString();
                    data["messageId"] = uuid.v1();
                    data["fromUserId"] = user.userId;
                    data["fromUserName"] = user.shortName;
                    data["fromUserLogin"] = user.userLogin;
                    data["isRead"] = false;

                    console.log(data)
                    
                    const document = messageModel(data)

                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };
                
                    document.save(options).then(async savedDocument => {
                        io.emit("messages", savedDocument);
                    })
                }
            });

            socket.on('data-change', (message) => {
                io.emit("data-change", message);
            })
        });
    } catch (err) {
        console.log(err);
    }
}

function getIo() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}

module.exports = { init, getIo };
