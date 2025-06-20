import EmployeeClientSignup from '@/components/app/auth/signUp/clientEmployeeSignup';
import Loader from '@/components/app/loading/loading';

import React, { Suspense } from 'react';

const SignUpPage = () => {
  return (
    <Suspense
      fallback={
        <div className="grid h-[400px] place-content-center">
          <Loader />
        </div>
      }
    >
      <EmployeeClientSignup />
    </Suspense>
  );
};

export default SignUpPage;
