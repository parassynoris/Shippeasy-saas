const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, sendMail } = require('./helper.controller')
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


exports.getToken = async (req, res, next) => {
    const { Username, Password } = req.body;

    if (Username && Password) {
        let roles = [];

        const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');

        // Find user by username first, then verify password securely
        await UserSearch.findOne({ 'userLogin': Username }).then(async function (user) {
            if (user) {
                // Support both bcrypt hashed and legacy plaintext passwords
                let passwordMatch = false;
                if (user.password && /^\$2[aby]\$/.test(user.password)) {
                    // Password is bcrypt hashed
                    passwordMatch = await bcrypt.compare(Password, user.password);
                } else {
                    // Legacy plaintext password — migrate to bcrypt on successful login
                    passwordMatch = (user.password === Password);
                    if (passwordMatch) {
                        const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);
                        await UserSearch.updateOne({ 'userLogin': Username }, { password: hashedPassword });
                    }
                }

                if (!passwordMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Increment tokenVersion for session tracking
                user = await UserSearch.findOneAndUpdate({ 'userLogin': Username }, { $inc: { tokenVersion: 1 } }, { new: true });

                if (user.isTrial){
                    if (new Date(user.trialValidTill) < new Date()) {
                        res.status(401).json({ message: 'Your trial period has been expired' });
                    } else {
                        const token = jwt.sign({ user: { id: user.userId, username: user.userLogin, sessionToken: user.tokenVersion} }, process.env.SECRET_KEY_JWT, { expiresIn: '24h' });
        
                        for (let i = 0; i < user?.roles?.length; i++) {
                            const RoleSchema = Schema["role"];
                            const RoleSearch = mongoose.models.RoleSearch || mongoose.model('RoleSearch', RoleSchema, 'roles');
        
                            await RoleSearch.findOne({ 'roleId': user.roles[i].roleId }).then(async function (roleFound) {
                                if (roleFound)
                                    roles.push(roleFound)
                            });
                        }
        
                        res.send({ "accessToken": token, accesslevel: roles, userData: user })
                    }
                } else if (!(user.userStatus)){
                    res.status(401).json({ message: 'You need to re-register, Please contact support team!' });
                } else {
                    const token = jwt.sign({ user: { id: user.userId, username: user.userLogin, sessionToken: user.tokenVersion} }, process.env.SECRET_KEY_JWT, { expiresIn: '24h' });
    
                    for (let i = 0; i < user?.roles?.length; i++) {
                        const RoleSchema = Schema["role"];
                        const RoleSearch = mongoose.models.RoleSearch || mongoose.model('RoleSearch', RoleSchema, 'roles');
    
                        await RoleSearch.findOne({ 'roleId': user.roles[i].roleId }).then(async function (roleFound) {
                            if (roleFound)
                                roles.push(roleFound)
                        });
                    }
    
                    res.send({ "accessToken": token, accesslevel: roles, userData: user })
                }
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
            res.status(401).json({ message: err });
        });
    } else {
        res.status(401).json({ message: "please provide Username, Password" });
    }
}


exports.resetUser = async (req, res, next) => {
    const { userEmail, userLogin } = req.body;
    const newPassword = generateRandomPassword(8)
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');
    const options = {
        returnDocument: 'after',
        projection: { _id: 0, __v: 0 },
    };
    await UserSearch.findOneAndUpdate({ 'userLogin': userLogin, 'userEmail': userEmail }, { password: hashedPassword }, options).then(async function (user) {
        if (user) {
            await sendMail(undefined, null, "aa57a341-ec59-11f0-8305-4fb3fd895feb", [{ "email": user.userEmail }], [], { userEmail: user.userEmail, name: user.name, userLastName: user.userLastname, userLogin: user.userLogin, password: newPassword });

            res.send({ status: "success", message: "User asscoiated with provided credentials is successfully reset" })
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }).catch(function (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(401).json({ message: err });
    });
}

exports.changePassword = async (req, res, next) => {
    const { userEmail, userLogin, currentPassword, newPassword } = req.body;

    // Validation
    if (!userEmail || !userLogin || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');

    try {
        // Find user
        const user = await UserSearch.findOne({ 
            userLogin: userLogin, 
            userEmail: userEmail 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found with provided credentials' });
        }

        // Compare current password (supports both bcrypt and legacy plaintext)
        let passwordMatch = false;
        if (user.password && /^\$2[aby]\$/.test(user.password)) {
            passwordMatch = await bcrypt.compare(currentPassword, user.password);
        } else {
            passwordMatch = (user.password === currentPassword);
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password with bcrypt
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password with bcrypt hash
        const updatedUser = await UserSearch.findOneAndUpdate(
            { userLogin: userLogin, userEmail: userEmail },
            { password: hashedNewPassword },
            { new: true }
        );

        if (updatedUser) {
            // Optional: Send confirmation email
            await sendMail(
                undefined, 
                null, 
                "aa57a341-ec59-11f0-8305-4fb3fd895feb", 
                [{ "email": updatedUser.userEmail }], 
                [], 
                { 
                    userEmail: updatedUser.userEmail, 
                    name: updatedUser.name,
                    userLastName: updatedUser.userLastname,
                    userLogin: updatedUser.userLogin,
                    message: "Your password has been changed successfully"
                }
            );

            res.status(200).json({ 
                status: "success", 
                message: "Password changed successfully. Please login with your new password." 
            });
        } else {
            res.status(500).json({ message: 'Failed to update password' });
        }

    } catch (err) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: err.message,
            stack: err?.stack
        }));
        res.status(500).json({ message: 'An error occurred while changing password' });
    }
};

exports.authProfile = async (req, res, next) => {
    const user = res.locals.user
    let roles = [];

    if (user) {
        for (let i = 0; i < user?.roles?.length; i++) {
            const RoleSchema = Schema["role"];
            const RoleSearch = mongoose.models.RoleSearch || mongoose.model('RoleSearch', RoleSchema, 'roles');

            await RoleSearch.findOne({ 'roleId': user.roles[i].roleId }).then(async function (roleFound) {
                if (roleFound) {
                    const roleWithUserData = {
                        ...roleFound.toObject(),
                        userData: user
                    };

                    roles.push(roleWithUserData)
                }
            });
        }
    } else {
        data.tenantId = '1'
    }

    res.send(roles)
}
exports.agentOnBoarding = async (req, res, next) => {
    const data = new Object(req.body);

    data.referenceId = uuid.v1();

    data[`agentId`] = uuid.v1();
    data.createdOn = new Date().toISOString();
    data.updatedOn = new Date().toISOString();

    const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema["user"], `users`);
    const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
    const dataToSaved = await agentModel(data)
    
    await dataToSaved.save().then(async savedDocument => {
        if(savedDocument){
            await userModel.findOne({"userType" : "superAdmin"}).then(async foundDocument => {
                if (foundDocument)
                    createInAppNotification(req, "New agent has been registered", `${savedDocument.firstName} ${savedDocument.lastName} has been requested to register on ${savedDocument.createdOn}!`, foundDocument)
            })
        
            res.status(200).json(savedDocument);
        } else {
            res.status(500).json({ error: "something went wrong!" })
        }
    }).catch(async function (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(500).send({error : err?.message})
    });

}