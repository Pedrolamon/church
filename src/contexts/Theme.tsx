import { useState, useEffect, useContext,createContext } from "react";
import type { ReactNode } from "react";

type Theme ="light" | "Dark"

//pq o toggleTheme
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const themeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({children}: {children: ReactNode}) =>{
    const [theme, setTheme] = useState<Theme>(
     ( localStorage.getItem("theme") as Theme) || "light"
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === "light" ? "Dark" : "light");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "Dark" : "light"))
    };

    return(
        <themeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </themeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(themeContext);
    if(!context) throw new Error("useTheme deve ser usado dentro de ThemeProvi")
    return context 
}