'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CONTACT_EMAIL = 'support@rentiful.com';
const DRAFT_FILE = 'contact-draft.txt';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState(false);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        if ('storage' in navigator && 'getDirectory' in navigator.storage) {
          const root: any = await (navigator as any).storage.getDirectory();
          const handle = await root.getFileHandle(DRAFT_FILE, { create: true });
          fileHandleRef.current = handle;
          const file = await handle.getFile();
          const text = await file.text();
          if (text) setMessage(text);
        }
      } catch (err) {
        console.error('Unable to access OPFS', err);
      }
    };
    loadDraft();
  }, []);

  // Save draft whenever message changes
  useEffect(() => {
    const saveDraft = async () => {
      try {
        if (fileHandleRef.current) {
          const writable = await fileHandleRef.current.createWritable();
          await writable.write(message);
          await writable.close();
        }
      } catch (err) {
        console.error('Failed to save draft', err);
      }
    };
    saveDraft();
  }, [message]);

  const clearDraft = async () => {
    setMessage('');
    try {
      if ('storage' in navigator && 'getDirectory' in navigator.storage) {
        const root: any = await (navigator as any).storage.getDirectory();
        await root.removeEntry(DRAFT_FILE);
        fileHandleRef.current = null;
      }
    } catch (err) {
      console.error('Failed to clear draft', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (!service || !template || !publicKey) throw new Error('EmailJS env missing');
      if (!(window as any).grecaptcha || !siteKey) throw new Error('CAPTCHA unavailable');

      const emailjs = await import('@emailjs/browser');
      const token = await (window as any).grecaptcha.execute(siteKey, {
        action: 'submit',
      });

      await emailjs.send(
        service,
        template,
        {
          name,
          email,
          message,
          'g-recaptcha-response': token,
        },
        { publicKey },
      );

      await clearDraft();
      setFallback(false);
      alert('Message sent');
    } catch (err) {
      console.error(err);
      setFallback(true);
    }
  };

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=Contact&body=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" className="bg-primary-700 text-white">
          Send Message
        </Button>
      </form>
      {fallback && (
        <div className="mt-4 space-y-2">
          <p>Automatic sending unavailable. Try one of the options below:</p>
          <a href={mailtoHref} className="text-primary-700 underline">
            Open Mail Client
          </a>
          <Button
            type="button"
            onClick={() => navigator.clipboard.writeText(message)}
            className="bg-primary-700 text-white"
          >
            Copy Message
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
