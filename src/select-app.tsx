import { List, LocalStorage, showHUD, ActionPanel, Action, getApplications } from "@raycast/api";
import { useEffect, useState } from "react";

type App = {
  id: string;
  name: string;
  path: string;
  bundleId?: string;
};

export default function SelectAppCommand() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    async function loadApps() {
      try {
        setIsLoading(true);
        // Get all installed applications
        const applications = await getApplications();

        // Map applications to our app type
        const appList = applications.map((app) => {
          // Special handling for apps with shortened names
          let displayName = app.name;
          if (app.bundleId === "com.microsoft.VSCode" && app.name === "Code") {
            displayName = "Visual Studio Code";
          }
          
          return {
            id: app.bundleId || app.path,
            name: displayName,
            path: app.path,
            bundleId: app.bundleId
          };
        });

        setApps(appList);

        // Get previously selected app
        const lastSelectedAppPath = await LocalStorage.getItem<string>("selected_app_path");
        if (lastSelectedAppPath) {
          // Find the app name from the current app list to update the UI
          const lastApp = apps.find(app => app.path === lastSelectedAppPath);
          if (lastApp) {
            setSelectedApp(lastApp.name);
          }
        }
      } catch (error) {
        console.error("Failed to load apps:", error);
        await showHUD("Error: Failed to load app list");
      } finally {
        setIsLoading(false);
      }
    }

    loadApps();
  }, []);

  const handleSelectApp = async (app: App) => {
    try {
      // Save app path and bundle ID
      await LocalStorage.setItem("selected_app_path", app.path);
      if (app.bundleId) {
        await LocalStorage.setItem("selected_app_bundle_id", app.bundleId);
      }
      setSelectedApp(app.name);
    } catch (error) {
      console.error("Failed to save selected app:", error);
    }
  };

  return (
    <List navigationTitle="Select App" searchBarPlaceholder="Search apps..." isLoading={isLoading}>
      {apps.map((app) => (
        <List.Item
          key={app.id}
          title={app.name}
          subtitle={selectedApp === app.name ? "Selected" : ""}
          icon={{ fileIcon: app.path }}
          actions={
            <ActionPanel>
              <Action
                title="Select This App"
                onAction={() => handleSelectApp(app)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
