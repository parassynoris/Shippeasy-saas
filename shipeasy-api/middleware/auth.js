const mongoose = require('mongoose');
const Schema = require('../schema/schema');
// const morgan = require('morgan');
const uuid = require('uuid');

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.OAUTHCLIENT)


// morgan.token('uId', function getId(req, res) {
//     return res.locals.user.userId
// })
// morgan.token('body', (req) => JSON.stringify(req.body));

exports.validateAuth = async (req, res, next) => {
    const restrictAuth = ["/search/faq", "/search/country", "/search/currency", "/search/state", "/search/city"]

    if (req.method === "POST" && restrictAuth.includes(req.url)) {
        next()
    } else if (req.headers.authorization) {
        let token = "";

        if (req.headers.authorization.startsWith("Bearer"))
            token = req.headers.authorization.split(" ")[1]
        else
            token = req.headers.authorization;

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);

            const userModel = mongoose.models.userModel || mongoose.model('userModel', Schema["user"], 'users');
            const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
        
            await userModel.findOne({'userLogin': decoded.user.username, tokenVersion : decoded.user.sessionToken }).then(async function (user) {
                if (user) {
                    res.locals.user = user.toObject(); 

                    const orgData = await agentModel.findOne({
                        agentId : res.locals?.user?.orgId
                    })
                    res.locals.agent = orgData?.toObject(); 

                    if(!(user.userStatus)){
                        if (user.status)
                            res.status(401).json({ message: 'You need to re-register, please contact support team!' });
                        else 
                            res.status(401).json({ message: 'You are not allowed to login!' });

                        return;
                    }
                    if (user.isTrial){
                        if (new Date(user.trialValidTill) < new Date()) {
                            res.status(401).json({ message: 'Your trial has been expired' });
                        } else {
                            next()
                        }
                    } else
                        next();                  
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            }).catch(function (err) {
                res.status(401).json({ message: err });
            });
        } catch (error) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: process.env.OAUTHCLIENT
                });
                
                const { email, ...other } = ticket.getPayload(); 
                
                const userModel = mongoose.models.userModel || mongoose.model('userModel',  Schema["user"], 'users');
                const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
        
                await userModel.findOne({'userEmail': email }).then(async function (user) {
                    if (user) {
                        res.locals.user = user.toObject(); 
                        const orgData = await agentModel.findOne({
                            agentId : res.locals.user?.orgId
                        })
                        res.locals.agent = orgData.toObject(); 

                        if(!(user.userStatus)){
                            if (user.status)
                                res.status(401).json({ message: 'You need to re-register, please contact support team!' });
                            else 
                                res.status(401).json({ message: 'You are not allowed to login!' });

                            return;
                        }
                        if (user.isTrial){
                            if (new Date(user.trialValidTill) < new Date()) {
                                res.status(401).json({ message: 'Your trial has been expired' });
                            } else {
                                next()
                            }
                        } else
                            next();                  
                    } else {
                        res.status(401).json({ message: 'Invalid credentials' });
                    }
                }).catch(function (err) {
                    res.status(401).json({ message: err });
                });                
            } catch (errorInner) {
                res.status(401).json({ message: errorInner?.message });
            }
        }
    } else {
        res.status(401).send("No token provided.")
    }
}