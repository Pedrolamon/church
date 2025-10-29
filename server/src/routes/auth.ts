import brcript from "bcrypt"
import jwt, {Secret, SignOptions} from "jsonwebtoken"
import {Router, Request,Response} from "express"
import { PrismaClient, UserRole } from "@prisma/client"
import { authRequest, authenticateJWT } from "../middleware/auth"


const router = Router()
const prisma = new PrismaClient()

router.post("/register", async (req:Request, res:Response)=>{
    const {name, email, role, password} = req.body;
    if(!name || !email || !password){
        return res.status(400)
        .json({message:"Name, email and password are required"})
    }
    try {
        const existing = await prisma.user.findUnique({where:{email}});
        if(existing){
            return res.status(400).json({menssage: "Email is already in use"})
        }
    
        const hashed = await brcript.hash(password, 10)

        const user =await prisma.user.create({
            data:{
                name,
                email,
                role,
                password
            }
        })

        return res.status(201).json({
            message:"user created successfully",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                password: user.password,
            }
        })
    } catch (error) {
        console.log("erro ão criar useuario", error);
        return res.status(500).json({message:"Ocorreu um erro no servidor, tente novamente mais tarde."})
    }
})

router.post("/login", async (req: Request, res: Response)=>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"})
    }

    const user = await prisma.user.findUnique({where:{email}});
    if(!user){
        return res.status(400).json({message: "invalid credentials"})
    }

    const isPasswordValid = await brcript.compare(password, user.password)
    if(!password){
        return res.status(400).json({messge: "invalid credentials"})
    }
    
    const secret: Secret = process.env.Jwt_Secret || "secret";
    const expiresInValue: string = process.env.JWT_EXPIRES_IN || "1d";
    const jwtSignOptions: SignOptions = {expiresIn: expiresInValue as SignOptions ["expiresIn"]}

    const token = jwt.sign({id: user.id, role: user.role}, secret, jwtSignOptions);
    return res.json({token, user:{id: user.id, name: user.name, email: user.email, role: user.role}})
});

router.get("/me", authenticateJWT,async (req: authRequest, res:Response) =>{
    try {

        if (!req.userId || typeof req.userId !== 'string') {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const user = await prisma.user.findUnique({
            where: {id: req.userId},
        });

        if (!user) {
            return res.status(404).json({ message: "User not fund." });
          }
          const { password, ...userData } = user;
          return res.json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Erro ao buscar os dados do usuário." });
    }
});

router.post("/logout", authenticateJWT, async (req:Request, res: Response)=> {
    return res.status(200).json({message: "logout."});
});

export default router