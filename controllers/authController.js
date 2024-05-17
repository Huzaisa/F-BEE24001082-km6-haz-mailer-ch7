const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../server');
const nodemailer = require('../libs/nodemailer');
const eventEmitter = require('../libs/notifications');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async(req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        eventEmitter.emit('welcome', user);

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: 'User already exists' });
    }
};

exports.login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.forgotPassword = async(req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

        const htmlContent = await nodemailer.getHTML('reset-password-email.ejs', { resetLink });
        await nodemailer.sendMail(user.email, 'Password Reset', htmlContent);

        res.json({ message: 'Password reset link sent' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.resetPassword = async(req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });

        eventEmitter.emit('passwordChange', user);

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};