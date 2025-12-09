import { api } from "@/lib/api";

interface Authregister{
    name: string,
    email: string, 
    role: string,
    password: string
}

interface AuthregisterResponse{
    message: string;
}

export async function Authregister({name,email,role,password}: Authregister) {
    const {data} = await api.post<AuthregisterResponse>("/auth/register", {name, email, password, role})
    return data
}