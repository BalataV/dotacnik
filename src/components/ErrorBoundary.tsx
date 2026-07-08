// Záchranná obrazovka pro neošetřenou chybu (error boundary).
// Bez ní by pád v produkci znamenal bílou/černou obrazovku bez vysvětlení.
// Používá pevné barvy žlutého tématu – nesmí záviset na stavu appky (ten mohl spadnout).
import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Mascot from './Mascot';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Sem lze později napojit crash-reporting (např. Sentry).
    console.warn('Neošetřená chyba:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#FFD60A' }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <Mascot size={110} mood="sad" />
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#15233B', marginTop: 16, textAlign: 'center' }}>
          Sorry jako, něco se pokazilo.
        </Text>
        <Text style={{ fontSize: 15, color: '#15233B', opacity: 0.75, marginTop: 8, marginBottom: 24, textAlign: 'center', maxWidth: 280, lineHeight: 21 }}>
          Appka narazila na neočekávanou chybu. Zkus to znovu – data jsou v bezpečí v cloudu.
        </Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          accessibilityRole="button"
          accessibilityLabel="Zkusit znovu"
          style={{ backgroundColor: '#1D5FD8', borderWidth: 3, borderColor: '#15233B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 34 }}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>Zkusit znovu</Text>
        </Pressable>
      </ScrollView>
    );
  }
}
