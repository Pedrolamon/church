import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/use-auth";


type AuthRouteProps = {
  children: React.ReactNode;
};

export function AuthRoute({ children }: AuthRouteProps) {
  const { isAuth, isLoading } = useAuth();

  if(isLoading){
    return(
      <div >verificando a sessão</div>
    )
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}