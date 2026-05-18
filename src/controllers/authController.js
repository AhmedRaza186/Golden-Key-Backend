import responseHandler from '../utils/responseHandle.js'

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import express from 'express'
import prisma from '../utils/prisma.js'
import { hashPassword,hashPasswordChecker } from '../utils/hashPassowrd.js'
dotenv.config()
const app =express()
app.use(express.json())



const generateToken = (user) => {
   return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }

    )
}

 const signupController = async (req, res) => {
    try {
        const { username, email, password, adminToken } = req.body;

        const hashedPassword = await hashPassword(password);

        if (adminToken) {
            // Check if this is the first admin in the database
            const adminCount = await prisma.admin.count();

            if (adminCount > 0) {
                // Verify the provided token matches an existing admin's token
                const validAdmin = await prisma.admin.findUnique({
                    where: { token: adminToken }
                });

                if (!validAdmin) {
                    return responseHandler(res, 403, false, 'Invalid Admin Token');
                }
            }

            // Check if email or username already exists in Admin
            const existingAdmin = await prisma.admin.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });

            if (existingAdmin) {
                return responseHandler(res, 409, false, 'Admin with this email or username already exists');
            }

            // Create admin in Admin collection with a temporary token placeholder
            const tempToken = `temp_${Math.random().toString(36).substr(2, 9)}`;
            const newAdmin = await prisma.admin.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    token: tempToken
                }
            });

            // Generate a permanent non-expiring JWT token for this admin
            const permanentToken = jwt.sign(
                {
                    id: newAdmin.id,
                    username: newAdmin.username,
                    email: newAdmin.email,
                    role: "admin"
                },
                process.env.JWT_SECRET
            );

            // Update the Admin with the permanent token
            const updatedAdmin = await prisma.admin.update({
                where: { id: newAdmin.id },
                data: { token: permanentToken }
            });

            const { password: _, ...adminWithoutPassword } = updatedAdmin;
            return responseHandler(res, 201, true, 'Admin registered successfully', adminWithoutPassword);
        }

        // If not registering as admin, create regular user in User model
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return responseHandler(res, 409, false, 'User already exists');
        }
        
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        console.log(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        responseHandler(res, 201, true, 'User registered successfully', userWithoutPassword);

    } catch (error) {
        console.log(error);
        responseHandler(res, 500, false, 'Internal Server Error');
    }
}
const loginController = async (req, res) => {
   try {
     const { email, password } = req.body;

     // 1. Check if user is in User collection
     let user = await prisma.user.findUnique({
         where: { email }
     });
     let isAdmin = false;
     let token;

     if (!user) {
         // 2. Check if user is in Admin collection
         const admin = await prisma.admin.findUnique({
             where: { email }
         });

         if (!admin) {
             return responseHandler(res, 404, false, 'User not found');
         }

         const isPasswordValid = await hashPasswordChecker(password, admin.password);
         if (!isPasswordValid) {
             return responseHandler(res, 401, false, 'Invalid credentials');
         }

         isAdmin = true;
         token = admin.token; // Use their non-expiring token
         user = admin;
     } else {
         const isPasswordValid = await hashPasswordChecker(password, user.password);
         if (!isPasswordValid) {
             return responseHandler(res, 401, false, 'Invalid credentials');
         }

         token = generateToken(user);
     }

     const { password: _, ...userWithoutPassword } = user;

     res.cookie("token", token, {
       httpOnly: true,
       // secure: true,
       maxAge: isAdmin ? 1000 * 60 * 60 * 24 * 365 * 10 : 1000 * 60 * 60 * 24, // 10 years for admin, 1 day for user
     })
     .status(200)
     .json({
       success: true,
       message: isAdmin ? "Admin logged in successfully" : "User logged in successfully",
       user: { ...userWithoutPassword, isAdmin },
       token,
     });
   }
   catch (err) {
     console.log(err);
     responseHandler(res, 500, false, 'Internal Server Error');
   }
}

const logoutController = (req, res) => {
   try{
     res.clearCookie('token')
    responseHandler(res, 200, true, 'user logged out successfully')
   }
   catch(err){
    console.log(err)
    responseHandler(res, 500, false, 'Internal Server Error')
   }
}
export { signupController, loginController,logoutController }