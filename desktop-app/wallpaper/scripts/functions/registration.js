import os from "os";
import { getSystemUser , newUser} from "../services/db_register.js";
import bcrypt from "bcrypt";

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
    let currentUsers =  getSystemUser(system_user);
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

