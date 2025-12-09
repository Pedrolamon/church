import { Routes, Route } from 'react-router-dom';
//pages
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Families from '../pages/Families';
import Groups from '../pages/Groups';
import Ministries from '../pages/Ministries';
import Finances from '../pages/Finances';
import Communication from '../pages/Communication';
import EventCheckIn from '../pages/EventCheckIn';
import Volunteers from '../pages/Volunteers';
import Inventory from '../pages/Inventory';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Page404 from "../pages/Page404"

//helpers
import { AuthRoute } from '@/helpers/authRoute'; 
import { GuestRoutes } from '@/helpers/guestRoutes';

//layout
import LayoutRoute from '@/helpers/layoutRoute';


const publicRoutes = [
    {
        path:"/login",
        element: <Login />
    },
    {
        path:"/register",
        element:<Register /> 
    },
   
] as const;

const authRoute = [
    {
        path:"/",
        element:<Dashboard/>
    },
    {
        path:"*",
        element:<Page404/>
    },
    {
        path:"/members",
        element:<Members/>
    },
    {
        path: "/families",
        element: <Families/>
    },
    {
        path:"/groups",
        element:<Groups />  
    },
    {
        path:"/ministries",
        element:<Ministries />
    },
    {
        path:"/ministries",
        element:<Ministries />
    },
    {
        path:"/finances",
        element:<Finances />
    },
    {
        path:"/communication",
        element:<Communication />
    },
    {
        path:"/communication",
        element:<Communication />
    },
    {
     path:"/communication",
     element:<Communication />
    },
    {
        path:"/communication",
        element:<Communication />
    },
    {
        path:"/volunteers",
        element:<Volunteers />
    },
    {
        path:"/inventory",
        element:<Inventory />
    },
    {
        path:"/checkin",
        element:<EventCheckIn />
    },
];
                
export function AppRoutes() {
    return (
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<GuestRoutes>{element}</GuestRoutes>}
          />
        ))}
        <Route
          element={
            <AuthRoute>
              <LayoutRoute />
            </AuthRoute>
          }
        >
          {authRoute.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    );
}

