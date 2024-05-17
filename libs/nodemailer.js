const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN
} = process.env;

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

module.exports = {
    sendMail: async(to, subject, html) => {
        try {
            const accessToken = await oauth2Client.getAccessToken();
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'shirohagi5@gmail.com',
                    clientId: GOOGLE_CLIENT_ID,
                    clientSecret: GOOGLE_CLIENT_SECRET,
                    refreshToken: GOOGLE_REFRESH_TOKEN,
                    accessToken: accessToken.token
                }
            });

            const mailOptions = {
                from: 'shirohagi5@gmail.com',
                to,
                subject,
                html
            };

            await transport.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    },

    getHTML: (fileName, data) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(__dirname, '../views/templates', fileName);
            ejs.renderFile(filePath, data, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
};