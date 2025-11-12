import React from 'react';
import { api } from '@/lib/api';

import FamiliesList from './Family/Familieslist';
import FamilyForm from './Family/FamilyForm';
import FamilyTree from './Family/FamilyTree';

const Families: React.FC = () => {
  return (
    <div>
      {/*<FamiliesList/>*/}
      {/*<FamilyForm/>*/}
      <FamilyTree/>
    </div>
  );
};

export default Families;
