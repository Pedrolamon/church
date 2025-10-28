
import { Outlet } from 'react-router-dom'; 
import { Layout } from '../components/sidebar';

const LayoutRoute = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default LayoutRoute;