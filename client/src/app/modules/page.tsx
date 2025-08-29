import ModuleCard, { ModuleMeta } from '@/components/module-card';
import modules from '../../../public/modules.json';

export default function ModulesPage() {
  const moduleList = modules as ModuleMeta[];

  return (
    <main className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {moduleList.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </main>
  );
}
