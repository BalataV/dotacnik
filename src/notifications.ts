// Push notifikace – registrace tokenu zařízení + odeslání přes Expo push API.
// Posílání je „peer-to-peer": klient, který přidá výdaj/platbu, pošle push
// ostatním členům (jejich tokeny získá přes RPC group_push_tokens). Žádný
// vlastní server tím pádem nepotřebujeme.
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Jak se chová příchozí notifikace, když je appka v popředí.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  } as any),
});

// Vyžádá oprávnění a vrátí Expo push token (nebo null – simulátor/odmítnuto).
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Výchozí',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res.data || null;
  } catch (e) {
    return null;
  }
}

// Odešle push na seznam tokenů přes Expo push službu. Best-effort.
export async function sendPush(tokens: string[], title: string, body: string): Promise<void> {
  const messages = (tokens || []).filter(Boolean).map((to) => ({ to, title, body, sound: 'default' }));
  if (!messages.length) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (e) {
    // Tichý fail – notifikace nesmí shodit hlavní akci.
  }
}
