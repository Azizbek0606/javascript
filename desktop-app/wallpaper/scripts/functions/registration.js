import os from "os";
import { getSystemUser, newUser, updateUsernamedb, updateAvatardb, updatePassworddb, updateEmaildb } from "../services/db_register.js";
import bcrypt from 'bcryptjs';

export function loginFunc(loginData) {
    let username = loginData.username;
    let password = loginData.password;
    let systemUser = os.userInfo().username;

    if (!username || !password) {
        return { success: false, message: "Username or password cannot be empty!" };
    }

    let userData = getSystemUser(systemUser);

    if (!userData) {
        return { success: false, message: "System user not found!" };
    }

    if (userData.username !== username) {
        return { success: false, message: "Incorrect username!" };
    }

    if (!bcrypt.compareSync(password, userData.password)) {
        return { success: false, message: "Incorrect password!" };
    }

    return { success: true, message: "Login successful!", user: userData };
}

export function signUpFunc(regData) {
    if (
        !regData || typeof regData !== "object" ||
        !regData.username || typeof regData.username !== "string" ||
        !regData.password || typeof regData.password !== "string" ||
        !regData.email || typeof regData.email !== "string"
    ) {
        return { error: "Invalid registration data" };
    }
    let system_user = os.userInfo().username;
    let currentUsers = getSystemUser(system_user);
    if (currentUsers) {
        return { error: "User already exists" };
    }
    if (regData.password.length < 6) {
        return { error: "Password must be at least 6 characters long" };
    }
    const result = newUser({
        username: regData.username,
        password: regData.password,
        system_user: system_user,
        email: regData.email
    });

    return result;
}

export function updateUsername(newUsername) {
    if (!newUsername || typeof newUsername !== "string") {
        return { status:"error", message: "Invalid new username" };
    }
    let systemUser = os.userInfo().username;
    let userData = getSystemUser(systemUser);
    if (newUsername.trim() === "") {
        return { status: "error", message: "Username cannot be empty" };
    }
    if (newUsername.trim() === "MAJOR") {
        if (systemUser != "EUROLUX") {
            return { status: "error", message: "Sorry, this username is only used for administration." }
        }
    }
    if (!userData) {
        return { status: "error", message: "User not found" };
    }
    if (newUsername.trim() === userData.user_name) {
        return { status: "error", message: "New username cannot be the same as current username" };
    }
    if (newUsername.trim().length > 50) {
        return { status: "error", message: "New username cannot be more than 50 characters long" };
    }
    let status = updateUsernamedb(newUsername, systemUser);
    
    if (status.success) {
        let updatedUser = getSystemUser(systemUser);
        return { status: "success", message: "Username updated successfully" };
    } else {
        return { status: "error", message: "Failed to update username" };
    }
}

export function addAvatarToProfile(imagePath) {
    if (!imagePath || typeof imagePath !== "string") {
        return { status: "error", message: "Invalid image path" };
    }
    let systemUser = os.userInfo().username;
    let userData = getSystemUser(systemUser);
    if (!userData) {
        return { status: "error", message: "User not found" };
    }
    let status = updateAvatardb(imagePath, systemUser);
    if (status.success) {
        let updatedUser = getSystemUser(systemUser);
        return { status: "success", message: "Profile image added successfully" };
    } else {
        return { status: "error", message: "Failed to add avatar" };
    }
}
export function updatePassword(oldPasswordInput, newPassword) {
    if (!newPassword || typeof newPassword !== "string") {
        return { status:"error", message: "Invalid new password" };
    }

    if (newPassword.trim().length < 6) {
        return { status: "error", message: "Password must be at least 6 characters long" };
    }

    let systemUser = os.userInfo().username;
    let userData = getSystemUser(systemUser);

    if (!userData) {
        return { status: "error", message: "User not found" };
    }

    let isMatch = bcrypt.compareSync(oldPasswordInput, userData.password);

    if (!isMatch) {
        return { status: "error", message: "Old password is incorrect." };
    }

    let status = updatePassworddb(newPassword, systemUser);

    if (status.success) {
        return { status: "success", message: "Password updated successfully" };
    } else {
        return { status: "error", message: "Failed to update password" };
    }
}

export function updateEmail(email) {
    if (!email || typeof email !== "string") {
        return { status: "error", message: "Invalid email type" };
    }

    if (email.trim() === "") {
        return { status: "error", message: "Email cannot be empty" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { status: "error", message: "Invalid email format" };
    }

    if (email.length < 6) {
        return { status: "error", message: "Email is too short" };
    }

    let systemUser = os.userInfo().username;
    let userData = getSystemUser(systemUser);

    if (!userData) {
        return { status: "error", message: "User not found" };
    }

    if (userData.email === email) {
        return { status: "error", message: "New email is the same as the current email" };
    }

    let status = updateEmaildb(email, systemUser);

    if (status.success) {
        return { status: "success", message: "Email updated successfully" };
    } else {
        return { status: "error", message: "Failed to update email" };
    }
}
