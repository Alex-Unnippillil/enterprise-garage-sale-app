'use client';

import { useGetFlagsQuery, useUpdateFlagMutation } from '@/state/api';

const FlagsPage = () => {
  const { data: flags } = useGetFlagsQuery();
  const [updateFlag] = useUpdateFlagMutation();

  if (!flags) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Feature Flags</h1>
      <ul>
        {Object.entries(flags).map(([name, enabled]) => (
          <li key={name} className="flex items-center gap-2 mb-2">
            <span className="flex-1">{name}</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateFlag({ name, enabled: e.target.checked })}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlagsPage;
