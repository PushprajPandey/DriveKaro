import bcryptjs from "bcryptjs";
import { renderFile } from "ejs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "../config/index.js";
import { UserModel } from "../models/index.js";
import { randomString, sendEmail } from "../utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maxAge = 30 * 24 * 60 * 60 * 1000;
const login = async (req, res) => {
    console.log("Login requested!");
    try {
        const { email, password } = req.body;
        console.log("B", req.body);
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) return res.status(200).send({ message: "User not found!", next: "register" });

        // Check if user is verified
        if (!existingUser.isVerified)
            return res.status(200).send({
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
                next: "login",
            });

        const passwordValid = await bcryptjs.compare(password, existingUser.password);
        if (!passwordValid) return res.status(200).send({ message: "Password is incorrect!", next: "login" });
        const refreshToken = await randomString(16);
        const ACCESS_TOKEN = jwt.sign({ id: existingUser._id, irt: refreshToken }, ENV.ACCESS_TOKEN, { expiresIn: `${maxAge}ms` });
        await UserModel.findByIdAndUpdate(existingUser._id, { refreshToken });
        res.cookie("AT", ACCESS_TOKEN, { origin: ENV.CLIENT_URL, sameSite: "none", httpOnly: true, secure: true, maxAge });
        res.cookie("ATCheck", true, { origin: ENV.CLIENT_URL, sameSite: "none", secure: true, maxAge });
        res.status(200).send({ message: "Login successful!", next: "home" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Something went wrong!!" });
    }
};

const register = async (req, res) => {
    console.log("Registration requested!");
    try {
        const { name, email, password, phone, address } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser && existingUser.isVerified) return res.status(200).send({ message: "User already exists!", next: "login" });
        if (existingUser) await UserModel.findByIdAndDelete(existingUser._id);

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, parseInt(ENV.PASSWORD_SALT));

        const userCreated = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
        });

        if (!userCreated)
            return res
                .status(200)
                .send({ message: "We are unable to register new users at the moment! Please contact Admin.", next: "register" });
        const token = jwt.sign({ email, id: userCreated._id }, ENV.VERIFICATION_TOKEN, { expiresIn: "24h" });
        const templatePath = path.join(__dirname, "../templates/verifyUser.ejs");
        const urlPath = `${ENV.CLIENT_URL}${ENV.VERIFICATION_URL}/${token}`;
        console.log(urlPath);
        const htmlData = await renderFile(templatePath, {
            name,
            urlPath,
            msg: "You're almost there to start enjoying DriveKaro. Simply click the link below to verify your email address and get started.",
        });
        sendEmail(email, "Verify Email Address", htmlData);
        res.status(200).send({ message: "We have sent an email that contains link to complete your registration.", next: "register" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Something went wrong!!" });
    }
};

const forgotPassword = async (req, res) => {
    console.log("Forgot password requested!");
    try {
        const { email } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) return res.status(200).send({ message: "User not found!", next: "register" });
        const token = jwt.sign({ email, id: existingUser._id, reset: true }, ENV.VERIFICATION_TOKEN, { expiresIn: "24h" });
        const templatePath = path.join(__dirname, "../templates/verifyUser.ejs");
        const urlPath = `${ENV.CLIENT_URL}${ENV.VERIFICATION_URL}/${token}`;
        console.log(urlPath);
        const htmlData = await renderFile(templatePath, {
            name: existingUser.name,
            urlPath,
            msg: "We have received a request to reset the password for your account. Simply click the link below to verify your email address and reset password.",
        });
        sendEmail(email, "Verify Email Address", htmlData);
        res.status(200).send({ message: "We have sent an email that contains link to reset your password.", next: "login" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Something went wrong!!" });
    }
};

const verifyEmail = async (req, res) => {
    console.log("Verify Email requested!");
    try {
        const { token } = req.body;
        const data = jwt.verify(token, ENV.VERIFICATION_TOKEN);
        console.log("D", data);
        const hasId = Object.hasOwn(data, "id");
        const hasEmail = Object.hasOwn(data, "email");
        const hasReset = Object.hasOwn(data, "reset");
        if (!hasId || !hasEmail) return res.status(200).send({ message: "Provided token is invalid", next: "register" });
        const user = await UserModel.findById(data.id);
        if (!user || user.email !== data.email) return res.status(200).send({ message: "Provided token is invalid", next: "register" });
        if (!hasReset && user.isVerified) return res.status(200).send({ message: "User is already verified", next: "login" });
        await UserModel.findByIdAndUpdate(data.id, { isVerified: true });
        res.status(200).send({ message: "User is verified", next: "update_password", email: data.email });
    } catch (err) {
        console.error(err);
        if (err.name === "TokenExpiredError") return res.status(200).send({ message: "Provided token has expired", next: "register" });
        return res.status(200).send({ message: "Something went wrong!!", next: "register" });
    }
};

const resetPassword = async (req, res) => {
    console.log("Reset password requested!");
    try {
        const { email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) return res.status(200).send({ message: "User not found!", next: "register" });
        const hashedPassword = await bcryptjs.hash(password, parseInt(ENV.PASSWORD_SALT));
        await UserModel.findByIdAndUpdate(existingUser._id, { password: hashedPassword });
        res.status(200).send({ message: "Password updated successfully", next: "login" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Something went wrong!!" });
    }
};

const logout = async (req, res) => {
    console.log("Logout requested!");
    try {
        const userId = req.body.id;

        // Clear the refresh token in the database
        await UserModel.findByIdAndUpdate(userId, { refreshToken: null });

        // Clear cookies
        res.clearCookie("AT", {
            origin: ENV.CLIENT_URL,
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
        res.clearCookie("ATCheck", {
            origin: ENV.CLIENT_URL,
            sameSite: "none",
            secure: true,
        });

        res.status(200).send({ message: "Logged out successfully" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Something went wrong!!" });
    }
};

export default { login, register, verifyEmail, forgotPassword, resetPassword, logout };
