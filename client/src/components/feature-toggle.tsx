'use client';

import { ReactNode } from 'react';
import { useGetFlagsQuery } from '@/state/api';

type Props = {
  flag: string;
  fallback?: ReactNode;
  children: ReactNode;
};

const FeatureToggle = ({ flag, fallback = null, children }: Props) => {
  const { data } = useGetFlagsQuery();
  if (data && data[flag]) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};

export default FeatureToggle;
