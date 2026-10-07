export type SettingsPageProps = Record<string, never>;

export type SettingsTab = 'general' | 'git' | 'agents';

export type SettingsSideNavProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};
