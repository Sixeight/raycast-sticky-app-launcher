import { LocalStorage, open } from "@raycast/api";

export default async function LaunchSelectedApp() {
  try {
    const appPath = await LocalStorage.getItem<string>("selected_app_path");

    if (!appPath) {
      return;
    }

    await open(appPath);

  } catch (error) {
    console.error("Failed to launch app:", error);
  }
}
