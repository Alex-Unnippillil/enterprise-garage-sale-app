import prisma from './prisma';

export type FeatureFlags = Record<string, boolean>;

export const getAllFlags = async (): Promise<FeatureFlags> => {
  const flags = await prisma.featureFlag.findMany();
  return flags.reduce<FeatureFlags>((acc, f) => {
    acc[f.name] = f.enabled;
    return acc;
  }, {});
};

export const isFeatureEnabled = async (name: string): Promise<boolean> => {
  const flag = await prisma.featureFlag.findUnique({ where: { name } });
  return flag?.enabled ?? false;
};

export const setFeature = async (name: string, enabled: boolean): Promise<void> => {
  await prisma.featureFlag.upsert({
    where: { name },
    update: { enabled },
    create: { name, enabled },
  });
};
