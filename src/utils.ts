
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz1234567890"

export function generateRandomString(length = 10): string {
    let password = "";
    for (let idx = 0; idx < length; idx ++) {
        password +=  CHARS[Math.floor(Math.random() * CHARS.length)]
    }
    return password;
}