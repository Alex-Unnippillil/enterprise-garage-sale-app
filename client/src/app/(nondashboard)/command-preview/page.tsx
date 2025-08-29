'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CommandPreviewPage = () => {
  const [platform, setPlatform] = useState('');
  const [payload, setPayload] = useState('');
  const [options, setOptions] = useState('');

  const generateCommand = () => {
    if (!platform || !payload) return '';
    let base = '';
    if (platform === 'windows') {
      if (payload === 'list') base = 'dir';
      else if (payload === 'user') base = 'whoami';
      else if (payload === 'pwd') base = 'cd';
    } else {
      if (payload === 'list') base = 'ls';
      else if (payload === 'user') base = 'whoami';
      else if (payload === 'pwd') base = 'pwd';
    }
    return `${base}${options ? ` ${options}` : ''}`;
  };

  const command = generateCommand();

  const handleCopy = async () => {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <div className="rounded-md border border-yellow-300 bg-yellow-100 p-4 text-sm text-yellow-900">
        ⚠️ Educational preview only. Commands are not executed.
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Platform</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linux">Linux</SelectItem>
              <SelectItem value="macos">macOS</SelectItem>
              <SelectItem value="windows">Windows</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Payload</label>
          <Select value={payload} onValueChange={setPayload}>
            <SelectTrigger>
              <SelectValue placeholder="Select payload" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List Directory</SelectItem>
              <SelectItem value="user">Current User</SelectItem>
              <SelectItem value="pwd">Working Directory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Options</label>
          <Input
            placeholder="e.g., -al"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Textarea readOnly value={command} placeholder="Generated command will appear here" />
        <Button onClick={handleCopy} disabled={!command} className="w-fit">
          Copy Command
        </Button>
      </div>
    </div>
  );
};

export default CommandPreviewPage;
