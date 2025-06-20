'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { countries } from '@/lib/countries';
import axios from 'axios';
import { getGitHubLoginURL } from '@/lib/api';
import { useProfile } from '@/zustand/user/userStore';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ChangePassword from '../auth/changePassword/changePassword';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username is required' }),
  firstName: z
    .string()
    .min(3, { message: 'First name must be at least 3 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  lastName: z
    .string()
    .min(3, { message: 'Last name must be at least 3 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  email: z.string(),
  about: z
    .string()
    .min(1, { message: 'About is required' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  address: z
    .string()
    .min(1, { message: 'Address is required' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  city: z
    .string()
    .min(1, { message: 'City is required' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  country: z
    .string()
    .min(1, { message: 'Country is required' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Only characters allowed' }),
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, {
      message: 'Enter a valid phone number e.g. +923001234567',
    }),
  postalCode: z
    .string()
    .min(1, { message: 'Postal code is required' })
    .regex(/^\d+$/, { message: 'Only digits allowed' }),
  githubUsername: z.string().optional(),
});

const ProfileForm = () => {
  const { data: session } = useSession();
  const { profile, setUserProfile } = useProfile();
  const user = profile; // Define user from useProfile hook
  const [githubLoginUrl, setGithubLoginUrl] = useState('');
  const [changeImage, setChangeImage] = useState<File | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      about: '',
      address: '',
      city: '',
      country: '',
      phoneNumber: '',
      postalCode: '',
      githubUsername: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile?.username || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        email: profile?.email || '',
        about: profile?.about || '',
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || '',
        phoneNumber: profile?.phone_no || '',
        postalCode: profile?.postal_code || '',
        githubUsername: profile?.github_username || '',
      });
    }
  }, [profile, form]);

  useEffect(() => {
    let phone = form.getValues().phoneNumber;
    console.log(phone);

    if (phone.startsWith('0')) {
      phone = phone.replace(/^0/, '+92');

      form.setValue('phoneNumber', phone);
    }
  }, [form.watch('phoneNumber')]);

  useEffect(() => {
    getGitHubLoginURL(session?.user?.access || '')
      .then((response) => {
        setGithubLoginUrl(response.data.url);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(
            `Unable to get GitHub URL. error(${error.response.data.message})`
          );
        } else {
          toast.error(error.message);
        }
      });
  }, [session?.user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setShowLoading(true);
    setChangeImage(null);

    console.log(values);

    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('first_name', values.firstName);
    formData.append('last_name', values.lastName);
    formData.append('about', values.about);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('country', values.country);
    formData.append('phone_no', values.phoneNumber);
    formData.append('postal_code', values.postalCode);
    if (changeImage) {
      formData.append('photo', changeImage, changeImage.name);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${session?.user?.access}`,
      },
    };

    try {
      const res = await axios.put(
        `${API_URL_PREFIX}/api/user/profile/`,
        formData,
        config
      );

      if (res.status === 200) {
        toast.success('Profile updated successfully');
        setUserProfile({
          id: res.data?.id,
          first_name: res.data?.first_name,
          last_name: res.data?.last_name,
          username: res.data?.username,
          email: res.data?.email,
          phone_no: res.data?.phone_no,
          company_name: res.data?.company_name,
          city: res.data?.city,
          postal_code: res.data?.postal_code,
          country: res.data?.country,
          address: res.data?.address,
          about: res.data?.about,
          photo: res.data?.photo,
          company_logo: res.data?.company_logo,
          is_active: res.data?.is_active,
          currency: res.data?.currency,
          smtp_email: res.data?.smtp_email,
          smtp_email_password: res.data?.smtp_email_password,
          role: res.data?.role,
          two_factor_auth: res.data?.two_factor_auth,
          is_superuser: res.data?.is_superuser,
          is_staff: res.data?.is_staff,
          company_contacts: res.data?.company_contacts,
          has_subscription: res.data?.has_subscription,
        });
      } else if (res.status === 400) {
        toast.error('Error occurs while updating profile?.');
      } else if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (err: any) {
      if (err.response) {
        Object.keys(err.response.data).forEach((key) =>
          toast.error(`${err.response.data[key]}`)
        );
      }
    } finally {
      setShowLoading(false);
    }
  };

  const connectGithub = () => {
    console.log('connecting');
    if (githubLoginUrl) {
      window.location.href = githubLoginUrl;
    }
  };

  // const updateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setChangeImage(e.target.files[0]);
  //   }
  // };

  if (!session) {
    return <></>;
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-card h-full space-y-6 rounded-2xl border p-6 py-5"
        >
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubUsername"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>GitHub Username</FormLabel>
                  <FormControl>
                    <Input placeholder="GitHub Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" value={user?.email || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea placeholder="About" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Complete Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Complete Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>*Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col items-center justify-between gap-2 xl:flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="underline" variant={'link'}>
                  Change Password?
                </Button>
              </DialogTrigger>

              <ChangePassword userId={profile?.id} />
            </Dialog>
            <div className="space-x-2">
              <Button variant={'custom'} type="submit" disabled={showLoading}>
                {showLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update
              </Button>
              <Button variant="secondary" type="button" onClick={connectGithub}>
                Connect with GitHub
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProfileForm;
