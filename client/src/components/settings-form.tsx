import { SettingsFormData, settingsSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { CustomFormField } from './form-field';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { toggleHighContrast, toggleLargeTargets, toggleReduceMotion } from '@/state/preferences';

const SettingsForm = ({ initialData, onSubmit, userType }: SettingsFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((state) => state.preferences);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      form.reset(initialData);
    }
  };

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data);
    setEditMode(false);
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} Settings`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CustomFormField name="name" label="Name" disabled={!editMode} />
            <CustomFormField name="email" label="Email" type="email" disabled={!editMode} />
            <CustomFormField name="phoneNumber" label="Phone Number" disabled={!editMode} />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={toggleEditMode}
                className="bg-secondary-500 text-white hover:bg-secondary-600"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
              {editMode && (
                <Button type="submit" className="bg-primary-700 text-white hover:bg-primary-800">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
        <div className="mt-8 border-t pt-4">
          <h2 className="text-lg font-medium mb-4">Accessibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <Switch
                id="high-contrast"
                checked={prefs.highContrast}
                onCheckedChange={() => dispatch(toggleHighContrast())}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="large-targets">Larger Targets</Label>
              <Switch
                id="large-targets"
                checked={prefs.largeTargets}
                onCheckedChange={() => dispatch(toggleLargeTargets())}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <Switch
                id="reduce-motion"
                checked={prefs.reduceMotion}
                onCheckedChange={() => dispatch(toggleReduceMotion())}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
