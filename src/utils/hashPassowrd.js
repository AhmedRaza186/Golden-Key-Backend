import bcrypt from 'bcrypt'
const saltRounds =12

const hashPassword = async (password) =>{
    const hashedPass = await bcrypt.hash(password,saltRounds)
    return hashedPass
}

const hashPasswordChecker = async (userPassword, hashedPassword) =>{
    const isMatch = await bcrypt.compare(userPassword, hashedPassword)
    return isMatch
}

export {hashPassword,hashPasswordChecker}