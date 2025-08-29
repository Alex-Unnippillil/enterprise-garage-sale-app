'use client';

import React from 'react';
import { Button } from './ui/button';
import useDocPiP from '@/hooks/use-doc-pip';

const DocPiP: React.FC = () => {
  const open = useDocPiP();

  return (
    <Button onClick={open} className="mt-4 self-start">
      Open Doc PiP
    </Button>
  );
};

export default DocPiP;
