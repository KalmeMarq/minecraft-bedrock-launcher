import { app, invoke, os } from '@tauri-apps/api';
import React, { createContext, useEffect, useState } from 'react';

type AppInfo = {
  name: string;
  version: string;
};

type OSInfo = {
  platform: os.Platform;
  version: string;
};

export interface VersionManifestV2 {
  latest: {
    release: string;
    beta: string;
    preview: string;
  };
  versions: {
    id: string;
    releaseTime: string;
    version: string;
    type: 'release' | 'beta' | 'preview';
    serverId?: string;
    uuid: Record<string, string>;
  }[];
}

export interface VersionManifest {
  lastest: {
    release: string;
    beta: string;
    preview: string;
  };
  versions: {
    id: string;
    type: 'release' | 'beta' | 'preview';
    uuid: string;
  }[];
}

const defaultValue: {
  app: AppInfo;
  os: OSInfo;
  versionManifest: VersionManifest;
  versionManifestV2: VersionManifestV2;
} = {
  app: {
    name: 'Minicraft Launcher',
    version: '0.0.0'
  },
  os: {
    platform: 'win32',
    version: '0.0'
  },
  versionManifest: {
    lastest: {
      release: '0.0.0',
      beta: '0.0.0',
      preview: '0.0.0'
    },
    versions: []
  },
  versionManifestV2: {
    latest: {
      release: '0.0.0',
      beta: '0.0.0',
      preview: '0.0.0'
    },
    versions: []
  }
};

export const AboutContext = createContext<{
  app: AppInfo;
  os: OSInfo;
  versionManifest: VersionManifest;
  versionManifestV2: VersionManifestV2;
}>(defaultValue);

export const AboutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [appInfo, setAppInfo] = useState<AppInfo>(defaultValue.app);
  const [osInfo, setOSInfo] = useState<OSInfo>(defaultValue.os);
  const [versionManifest, setVersionManifest] = useState<VersionManifest>({
    lastest: {
      release: '0.0.0',
      beta: '0.0.0',
      preview: '0.0.0'
    },
    versions: []
  });
  const [versionManifestV2, setVersionManifestV2] = useState<VersionManifestV2>({
    latest: {
      release: '0.0.0',
      beta: '0.0.0',
      preview: '0.0.0'
    },
    versions: []
  });

  useEffect(() => {
    async function getInfo() {
      setAppInfo({
        name: await app.getName(),
        version: await app.getVersion()
      });
      setOSInfo({
        platform: await os.platform(),
        version: await os.version()
      });
    }

    invoke('get_version_manifest_v2').then((data) => {
      setVersionManifestV2(data as VersionManifestV2);
    });

    invoke('get_version_manifest').then((data) => {
      setVersionManifest(data as VersionManifest);
    });

    getInfo();
  }, []);

  return <AboutContext.Provider value={{ app: appInfo, os: osInfo, versionManifest, versionManifestV2 }}>{children}</AboutContext.Provider>;
};
