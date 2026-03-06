const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, sendMail } = require('./helper.controller')
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 12;

async function comparePassword(plainText, stored) {
    if (stored && stored.startsWith('$2')) {
        return bcrypt.compare(plainText, stored);
    }
    return plainText === stored;
}

async function fetchRoles(user) {
    const roles = [];
    for (let i = 0; i < user?.roles?.length; i++) {
        const RoleSchema = Schema['role'];
        const RoleSearch = mongoose.models.RoleSearch || mongoose.model('RoleSearch', RoleSchema, 'roles');
        const roleFound = await RoleSearch.findOne({ roleId: user.roles[i].roleId });
        if (roleFound) roles.push(roleFound);
    }
    return roles;
}

exports.getToken = async (req, res, next) => {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
        return res.status(401).json({ message: 'please provide Username, Password' });
    }

    try {
        const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');

        const user = await UserSearch.findOne({ userLogin: Username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await comparePassword(Password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isTrial && new Date(user.trialValidTill) < new Date()) {
            return res.status(401).json({ message: 'Your trial period has been expired' });
        }

        if (!user.userStatus) {
            return res.status(401).json({ message: 'You need to re-register, Please contact support team!' });
        }

        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await UserSearch.updateOne({ userLogin: Username }, { $set: { tokenVersion: user.tokenVersion } });

        const token = jwt.sign(
            { user: { id: user.userId, username: user.userLogin, sessionToken: user.tokenVersion } },
            process.env.SECRET_KEY_JWT,
            { expiresIn: '24h' }
        );

        const roles = await fetchRoles(user);
        res.send({ accessToken: token, accesslevel: roles, userData: user });

    } catch (err) {
        logger.error('Login error', { traceId: req?.traceId, error: err.message, stack: err?.stack });
        res.status(500).json({ message: 'An error occurred during login' });
    }
}


exports.resetUser = async (req, res, next) => {
    const { userEmail, userLogin } = req.body;
    const newPlainPassword = generateRandomPassword(8);

    try {
        const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');
        const hashedPassword = await bcrypt.hash(newPlainPassword, BCRYPT_ROUNDS);

        const options = { returnDocument: 'after', projection: { _id: 0, __v: 0 } };
        const user = await UserSearch.findOneAndUpdate(
            { userLogin: userLogin, userEmail: userEmail },
            { password: hashedPassword },
            options
        );

        if (user) {
            await sendMail(undefined, null, "aa57a341-ec59-11f0-8305-4fb3fd895feb", [{ "email": user.userEmail }], [], { userEmail: user.userEmail, name: user.name, userLastName: user.userLastname, userLogin: user.userLogin, password: newPlainPassword });
            res.send({ status: "success", message: "User associated with provided credentials is successfully reset" });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        logger.error('Password reset error', { traceId: req?.traceId, error: err.message, stack: err?.stack });
        res.status(500).json({ message: 'An error occurred during password reset' });
    }
}

exports.changePassword = async (req, res, next) => {
    const { userEmail, userLogin, currentPassword, newPassword } = req.body;

    if (!userEmail || !userLogin || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');

    try {
        const user = await UserSearch.findOne({ userLogin, userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found with provided credentials' });
        }

        const currentMatch = await comparePassword(currentPassword, user.password);
        if (!currentMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const sameAsOld = await comparePassword(newPassword, user.password);
        if (sameAsOld) {
            return res.status(400).json({ message: 'New password cannot be the same as current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        const updatedUser = await UserSearch.findOneAndUpdate(
            { userLogin, userEmail },
            { password: hashedPassword },
            { new: true }
        );

        if (updatedUser) {
            await sendMail(
                undefined, null,
                "aa57a341-ec59-11f0-8305-4fb3fd895feb",
                [{ "email": updatedUser.userEmail }], [],
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
        logger.error('Change password error', { traceId: req?.traceId, error: err.message, stack: err?.stack });
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