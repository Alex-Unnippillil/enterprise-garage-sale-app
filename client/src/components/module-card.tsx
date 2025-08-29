'use client';

import { motion } from 'framer-motion';

export type ModuleMeta = {
  id: string;
  name: string;
  description: string;
  docUrl: string;
};

export function ModuleCard({ module }: { module: ModuleMeta }) {
  return (
    <motion.a
      href={module.docUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="block rounded-lg border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold">{module.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
    </motion.a>
  );
}

export default ModuleCard;
