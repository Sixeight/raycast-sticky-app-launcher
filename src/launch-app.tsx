import { LocalStorage, getFrontmostApplication, showHUD, closeMainWindow, popToRoot, open } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async function LaunchSelectedApp() {
  try {
    const appPath = await LocalStorage.getItem<string>("selected_app_path");

    if (!appPath) {
      await showHUD("No app selected. Please select an app first.");
      return;
    }

    const frontmostApp = await getFrontmostApplication();
    const isTargetAppFrontmost = frontmostApp.path === appPath;

    if (isTargetAppFrontmost) {
      const appName = appPath.split('/').pop()?.replace('.app', '');
      if (appName) {
        await execPromise(`osascript -e 'tell application "System Events" to set visible of process "${appName}" to false'`);
      }
    } else {
      await open(appPath);
    }

    await closeMainWindow();
    await popToRoot();
  } catch (error) {
    console.error("Failed to toggle app:", error);
    await showHUD("Failed to toggle application");
  }
}
