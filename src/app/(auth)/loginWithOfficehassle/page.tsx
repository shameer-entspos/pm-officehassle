import LoginWithOfficehassle from '@/components/app/auth/login/loginWithOfficehassle';
import Loader from '@/components/app/loading/loading';
import React, { Suspense } from 'react';

const LoginWithOfficehasslePage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <LoginWithOfficehassle />
    </Suspense>
  );
};

export default LoginWithOfficehasslePage;
