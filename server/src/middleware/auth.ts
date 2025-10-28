import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

export interface authRequest extends Request {
    userId?: string;
    role?: string;
}

export function authenticateJWT(req: authRequest, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("bearer")){
        return res.status(401).json({menssage:" token not fund."})
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ||"secrt") as any
        if(!decoded || !decoded.role){
            return res.status(400).json({menssage: "token invalid or not complited"});
        }

        req.userId = decoded.id;
        req.role = decoded.role;
        next()
    } catch (error) {
        return res.status(401).json({ message: "Token invalid." });
    }
}