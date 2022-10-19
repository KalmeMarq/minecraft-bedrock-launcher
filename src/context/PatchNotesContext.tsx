import { createContext, useState } from 'react';

export interface LauncherPatchNote {
  id: string;
  date: string;
  versions: {
    windows?: string;
    osx?: string;
    linux?: string;
  };
  body: string;
}

export interface MinecraftPatchNote {
  id: string;
  title: string;
  version: string;
  type: 'release' | 'beta';
  image: {
    url: string;
    title: string;
  };
  body: string;
}

export const PatchNotesContext = createContext<{
  launcher: LauncherPatchNote[];
  bedrock: MinecraftPatchNote[];
  refresh: (file: string) => Promise<void>;
}>({
  launcher: [],
  bedrock: [],
  async refresh(file) {}
});

export const PatchNotesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [launcherPatchNotes, setLauncherPatchNotes] = useState<LauncherPatchNote[]>([
    {
      id: 'test-id',
      date: '2022-10-19',
      versions: {
        windows: '0.1.0'
      },
      body: '<p>Initial release</p>'
    }
  ]);
  const [bedrockPatchNotes, setBedrockPatchNotes] = useState<MinecraftPatchNote[]>([]);

  async function refresh(file: string) {}

  return (
    <PatchNotesContext.Provider
      value={{
        launcher: launcherPatchNotes,
        bedrock: bedrockPatchNotes,
        refresh: refresh
      }}
    >
      {children}
    </PatchNotesContext.Provider>
  );
};
