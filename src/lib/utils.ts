import { clsx, type ClassValue } from 'clsx';
import { getSession } from 'next-auth/react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getToken() {
  const session: any = await getSession();

  return session?.user?.token;
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function getGreeting(): string {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'Good afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

export const formatDateTime = (value?: string | number | Date): string => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

export function getDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };

  return now.toLocaleDateString('en-US', options);
}

export const objectToFormData = (obj: any, filesName: any) => {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => {
    if (key === filesName) {
      obj[key].forEach((file: any) => {
        formData.append(`${filesName}`, file);
      });
    } else {
      formData.append(key, obj[key]);
    }
  });
  return formData;
};

export const changeDateToIsoFormat = (date: Date) => {
  let isoDate = new Date(date).toISOString().split('T')[0];
  isoDate = new Date(isoDate + 'Z').toISOString();
  console.log(isoDate);
  return isoDate;
};

export const changeIsoFormatToDate = (isoDateTime: string) => {
  if (isoDateTime) {
    return isoDateTime.split('T')[0];
  } else return '';
};

export function formatSecondsToHoursMinutes(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsAfterMinutes = remainingSeconds % 60;

  let result = '';

  if (hours > 0) {
    result += hours + ' Hour' + (hours > 1 ? 's' : '') + ' ';
  }

  if (minutes > 0) {
    result += minutes + ' Minute' + (minutes > 1 ? 's' : '') + ' ';
  }

  if (remainingSecondsAfterMinutes > 0) {
    result +=
      Math.ceil(remainingSecondsAfterMinutes) +
      ' Second' +
      (remainingSecondsAfterMinutes > 1 ? 's' : '') +
      ' ';
  }

  if (result === '') {
    result = '0 Seconds';
  }

  return result.trim();
}
