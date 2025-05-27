import { LocalStorage, getFrontmostApplication, showHUD, closeMainWindow, popToRoot, open } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async function LaunchSelectedApp() {
  try {
    const appPath = await LocalStorage.getItem<string>("selected_app_path");
    const bundleId = await LocalStorage.getItem<string>("selected_app_bundle_id");

    if (!appPath) {
      await showHUD("No app selected. Please select an app first.");
      return;
    }

    const frontmostApp = await getFrontmostApplication();
    const isTargetAppFrontmost = frontmostApp.path === appPath;

    if (isTargetAppFrontmost) {
      // Prefer using bundle ID to hide the app
      if (bundleId) {
        try {
          await execPromise(`osascript -e 'tell application "System Events" to set visible of (first process whose bundle identifier is "${bundleId}") to false'`);
        } catch (error) {
          console.error("Failed to hide app using bundle ID:", error);
          // If bundle ID fails, fall back to app name
          const appName = appPath.split('/').pop()?.replace('.app', '');
          if (appName) {
            await execPromise(`osascript -e 'tell application "${appName}" to set visible to false'`);
          }
        }
      } else {
        // If no bundle ID, use app name
        const appName = appPath.split('/').pop()?.replace('.app', '');
        if (appName) {
          try {
            await execPromise(`osascript -e 'tell application "${appName}" to set visible to false'`);
          } catch (error) {
            // If that also fails, use System Events with process name
            await execPromise(`osascript -e 'tell application "System Events" to set visible of process "${appName}" to false'`);
          }
        }
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
