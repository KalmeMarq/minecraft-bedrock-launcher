import { invoke } from '@tauri-apps/api';
import { createContext, useEffect, useState } from 'react';

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
  type: 'release' | 'beta' | 'preview';
  image?: {
    url: string;
    title: string;
  };
  version: string;
  date: string;
  body: string;
  platforms: ('All' | 'Windows' | 'iOS' | 'Android' | 'Xbox' | 'Amazon' | 'Switch' | 'PS4')[];
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
  const [launcherPatchNotes, setLauncherPatchNotes] = useState<LauncherPatchNote[]>([]);
  const [bedrockPatchNotes, setBedrockPatchNotes] = useState<MinecraftPatchNote[]>([]);

  useEffect(() => {
    if (launcherPatchNotes.length === 0)
      invoke('get_launcher_patch_notes').then((data) => {
        console.log(data);
        setLauncherPatchNotes((data as { entries: LauncherPatchNote[] }).entries);
      });

    if (bedrockPatchNotes.length === 0)
      invoke('get_bedrock_patch_notes').then((data) => {
        setBedrockPatchNotes((data as { entries: MinecraftPatchNote[] }).entries);
      });
  }, []);

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
