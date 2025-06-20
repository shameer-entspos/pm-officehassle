'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useProfile } from '@/zustand/user/userStore';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';

const ProfileInfo = () => {
  const { data: session } = useSession();
  const { profile, updateUserProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [updatedCompanyLogo, setUpdatedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpdatedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdatePhoto = async () => {
    setIsLoading(true);
    if (!updatedCompanyLogo) return;

    const formData = new FormData();
    formData.append('photo', updatedCompanyLogo, updatedCompanyLogo.name);

    try {
      const res = await axios.put(
        `${process.env.API_URL_PREFIX}/api/user/profile/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.user?.access}`, // ensure `session` is available
          },
        }
      );

      if (res.status === 200) {
        toast.success('Profile photo updated successfully');
        // update profile in userStore
        updateUserProfile({
          photo: res.data?.photo,
        });
        setPreview(null);
        setUpdatedImage(null);
      }
    } catch (err: any) {
      console.log(err);
      toast.error('Failed to update profile photo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card relative h-full space-y-4 rounded-2xl border p-6 py-5">
      <>
        {/* profile picture */}
        <div className="flex justify-center">
          <div className="group border-border relative mx-auto size-36 rounded-full border-4 p-1 xl:size-40">
            {preview ? (
              <Image
                src={preview}
                alt="Profile Photo Preview"
                width={1000}
                height={1000}
                className="h-full w-full rounded-full object-cover shadow-sm"
              />
            ) : (
              profile?.photo && (
                <Image
                  src={`${process.env.API_URL_PREFIX}${profile.photo}`}
                  alt="Profile Photo Preview"
                  width={1000}
                  height={1000}
                  className="h-full w-full rounded-full object-cover shadow-sm"
                  priority
                />
              )
            )}
            <div className="group-hover:bg-muted/80 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label
                htmlFor="logo-upload"
                className="text-foreground flex h-full w-full cursor-pointer items-center justify-center hover:opacity-90"
              >
                <Upload className="size-6 text-white/60" />
              </Label>
            </div>
          </div>
        </div>
        {/* name */}
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-semibold capitalize md:text-2xl">
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : '-'}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm">
            {profile?.email || '-'}
          </p>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 capitalize"
          >
            {profile?.role || '-'}
          </Badge>
        </div>

        <div className="mt-2 flex justify-center">
          <Button
            disabled={!updatedCompanyLogo}
            variant={'custom'}
            size={'sm'}
            className="rounded-md !text-xs"
            onClick={handleUpdatePhoto}
          >
            {isLoading ? 'Updating...' : 'Update Photo'}
          </Button>
        </div>
      </>

      {/* settings */}
      {profile?.role === 'admin' && (
        <Card className="!gap-0 overflow-hidden rounded-md !py-0 shadow-none">
          <CardHeader className="dark:bg-bground-2 bg-neutral-50 !px-4 !pt-4 !pb-2">
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="!p-4">
            <div className="flex items-center justify-between">
              <Label>Add all group members to channel?</Label>
              <Switch
                className="cursor-pointer"
                checked={profile?.allowAllMembersToChannel || false}
                onCheckedChange={(val) => {
                  updateUserProfile({
                    allowAllMembersToChannel: val,
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileInfo;
