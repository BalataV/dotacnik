// Jemná hmatová odezva. Na webu / nepodporovaných zařízeních se tiše ignoruje.
import * as Haptics from 'expo-haptics';

export function tapSuccess() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
}

export function tapLight() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
}
