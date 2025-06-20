'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import {
  getEmployeeSignupInvitationAPI,
  getClientSignupInvitationAPI,
  employeeAccountSignupAPI,
  clientAccountSignupAPI,
} from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const EmployeeClientSignup = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const [errors, setErrors] = useState<any>({});
  const searchParams = useSearchParams();
  const invite = searchParams.get('invite') || '';
  const client = searchParams.get('client') || '';

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('nameInputSection');
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [accountActivated, setAccountActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const validateFields = () => {
    const newErrors: any = {};

    if (activeSection === 'nameInputSection') {
      if (!username) newErrors.username = 'Username is required';
      if (!firstName) newErrors.firstName = 'First name is required';
      if (!lastName) newErrors.lastName = 'Last name is required';
    }

    if (activeSection === 'contactInputSection') {
      if (!email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email))
        newErrors.email = 'Invalid email format';
      if (!phoneNo) newErrors.phoneNo = 'Phone number is required';
    }

    if (activeSection === 'passwordInputSection') {
      if (!password) newErrors.password = 'Password is required';
      if (!confirmPassword)
        newErrors.confirmPassword = 'Confirm password is required';
      else if (password !== confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchInvitation = async () => {
    setLoading(true);
    if (!client) {
      try {
        const res = await getEmployeeSignupInvitationAPI(invite);
        const data = res.data.data;

        if (data.is_already_have_an_account) {
          setAccountActivated(true);
          toast.error('Account already created!');
        } else if (data?.employee) {
          setFirstName(data.employee.first_name || '');
          setLastName(data.employee.last_name || '');
          setPhoneNo(data.employee.mobile_number || '');
          setEmail(data.employee.email || '');
        }
      } catch (error: any) {
        const errMsg =
          error.response?.data?.message || error.message || 'Unexpected error';
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await getClientSignupInvitationAPI(invite);
        const data = res.data.data;
        console.log('client!');

        if (data.is_already_have_an_account) {
          setAccountActivated(true);
          toast.error('Account already created!');
        } else if (data?.employee) {
          setFirstName(data.employee.first_name || '');
          setLastName(data.employee.last_name || '');
          setPhoneNo(data.employee.mobile_number || '');
          setEmail(data.employee.email || '');
        }
      } catch (error: any) {
        const errMsg =
          error.response?.data?.message || error.message || 'Unexpected error';
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const createAccount = async () => {
    setLoading(true);
    if (!client) {
      try {
        const res = await employeeAccountSignupAPI({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          mobile_number: phoneNo,
          password,
          confirm_password: confirmPassword,
          invitation_code: invite,
        });
        toast.success(res.data.message);
        setConfirmEmail(true);
      } catch (error: any) {
        const errMsg =
          error.response?.data?.message || error.message || 'Unexpected error';
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Client Sign Up');
      try {
        const res = await clientAccountSignupAPI({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          mobile_number: phoneNo,
          password,
          confirm_password: confirmPassword,
          invitation_code: invite,
          client: client,
        });
        toast.success(res.data.message);
        setConfirmEmail(true);
      } catch (error: any) {
        const errMsg =
          error.response?.data?.message || error.message || 'Unexpected error';
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (validateFields()) {
      if (activeSection === 'nameInputSection')
        setActiveSection('contactInputSection');
      if (activeSection === 'contactInputSection')
        setActiveSection('passwordInputSection');
      if (activeSection === 'passwordInputSection') createAccount();
    }
  };

  const handleBack = () => {
    if (activeSection === 'contactInputSection')
      setActiveSection('nameInputSection');
    else if (activeSection === 'passwordInputSection')
      setActiveSection('contactInputSection');
  };

  useEffect(() => {
    if (invite) fetchInvitation();
  }, [invite]);

  useEffect(() => {
    if (accountActivated) {
      if (countdown > 0) {
        const timer = setTimeout(
          () => setCountdown((prev) => Math.max(prev - 1, 0)),
          1000
        );
        return () => clearTimeout(timer);
      } else {
        router.push('/login');
      }
    }
  }, [accountActivated, countdown, router]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (confirmEmail) {
    return (
      <>
        <div className="text-center">
          <h1 className="text-2xl font-light">
            Signup for{' '}
            <span className="from-primary to-chart-4 bg-gradient-to-r bg-clip-text font-semibold text-transparent dark:bg-gradient-to-r dark:text-transparent">
              Project Management
            </span>
          </h1>
          <p className="text-sm font-extralight">
            Keep track of your projects and tasks with ease.
          </p>
        </div>
        <Card className="flex items-center justify-center">
          <CardContent className="w-full space-y-3 text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl">
              Email Sent{' '}
              <Check className="rounded-md bg-emerald-400 p-1 dark:bg-emerald-500" />
            </h2>
            <p className="text-muted-foreground">
              An email has been sent to your provided email address. Please
              check your inbox to activate your account. If you don’t find it,
              check your spam folder.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (accountActivated) {
    return (
      <>
        <div className="text-center">
          <h1 className="text-2xl font-light">
            <span className="from-primary to-chart-4 bg-gradient-to-r bg-clip-text font-semibold text-transparent dark:bg-gradient-to-r dark:text-transparent">
              Project Management
            </span>
          </h1>
          <p className="text-sm font-extralight">
            Keep track of your projects and tasks with ease.
          </p>
        </div>
        <Card className="flex items-center justify-center">
          <CardContent className="w-full space-y-3 text-center">
            <h2 className="flex items-center justify-center gap-2 text-lg">
              Account Already Verified{' '}
              <Check className="size-7 rounded-md bg-emerald-400 p-1 dark:bg-emerald-500" />
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecting to login in {countdown} second
              {countdown !== 1 ? 's' : ''}...
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="mt-2 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-light">
          Signup for{' '}
          <span className="from-primary to-chart-4 bg-gradient-to-r bg-clip-text font-semibold text-transparent dark:bg-gradient-to-r dark:text-transparent">
            Project Management
          </span>
        </h1>
        <p className="text-sm font-extralight">
          Keep track of your projects and tasks with ease.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'nameInputSection' && (
          <motion.div
            key="name"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeVariants}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'contactInputSection' && (
          <motion.div
            key="contact"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeVariants}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNo">Phone Number</Label>
              <Input
                id="phoneNo"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />
              {errors.phoneNo && (
                <p className="text-sm text-red-500">{errors.phoneNo}</p>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'passwordInputSection' && (
          <motion.div
            key="password"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeVariants}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        {activeSection !== 'nameInputSection' && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button variant="custom" onClick={handleNext}>
          {activeSection === 'passwordInputSection' ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default EmployeeClientSignup;
