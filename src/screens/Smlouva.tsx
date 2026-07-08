// Dotační smlouva – parodická úřední listina dluhu, sdílitelná kamarádovi.
import React from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable } from '../components/ui';
import { fmtMoney } from '../money';

// Číslo smlouvy z id dluhu (ať je „úřední").
function contractNo(id: string): string {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return String(1000 + (h % 9000));
}

function Clause({ no, title, body }: { no: string; title: string; body: string }) {
  const c = useColors();
  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(127,127,127,0.18)' }}>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 13, color: c.ink }}>Čl. {no} — {title}</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.muted, marginTop: 2, lineHeight: 18 }}>{body}</Text>
    </View>
  );
}

export default function Smlouva() {
  const c = useColors();
  const { state, actions } = useApp();
  const d = state.selectedDebt;

  if (!d) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text onPress={() => actions.navigate('settle')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Rozpočet</Text>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg }}>Žádný dluh k vystavení smlouvy.</Text>
      </ScrollView>
    );
  }

  const g = state.groups.find((x) => x.id === d.groupId);
  const groupName = g ? g.name : 'skupina';
  const no = contractNo(d.id);
  const amount = fmtMoney(d.amt, d.currency);
  // Dlužník = ten, kdo platí (from); věřitel = příjemce (to)
  const dluznik = d.from === 'Já' ? 'já, níže podepsaný' : d.from;

  const text =
    `📜 DOTAČNÍ SMLOUVA č. ${no}/26\n\n` +
    `Poskytovatel (věřitel): ${d.to}\n` +
    `Příjemce (dlužník): ${d.from}\n` +
    `Skupina: ${groupName}\n\n` +
    `Příjemce se zavazuje neprodleně uhradit poskytovateli nevratnou dotaci ve výši ${amount}.\n` +
    `Při nesplnění bude příjemce úředně označen za Černého pasažéra.\n\n` +
    `Sorry jako. — Dotačník`;

  async function share() {
    try { await Share.share({ message: text }); } catch (e) {}
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text onPress={() => actions.navigate('settle')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Rozpočet</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5, marginBottom: 14 }}>📜 Dotační smlouva</Text>

      <View style={{ position: 'relative', marginBottom: 18 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, overflow: 'hidden' }}>
          {/* hlavička listiny */}
          <View style={{ backgroundColor: c.ink, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 15, color: c.card, letterSpacing: 0.3 }}>DOTAČNÍ SMLOUVA</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.card, opacity: 0.8 }}>č. {no}/26 · skupina {groupName}</Text>
            </View>
            <View style={{ transform: [{ rotate: '-9deg' }], borderWidth: 2.5, borderColor: c.bad, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 12, color: c.bad, letterSpacing: 0.5 }}>NEVRATNÁ</Text>
            </View>
          </View>

          {/* strany smlouvy */}
          <View style={{ flexDirection: 'row', padding: 14, gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, textTransform: 'uppercase' }}>Poskytovatel</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 16, color: c.good }} numberOfLines={1}>{d.to}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, textTransform: 'uppercase' }}>Dlužník</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 16, color: c.bad }} numberOfLines={1}>{d.from}</Text>
            </View>
          </View>

          {/* výše dotace */}
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Výše nevratné dotace</Text>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 34, color: c.ink }}>{amount}</Text>
          </View>

          <Clause no="I" title="Předmět" body={`Příjemce (${d.from}) se zavazuje uhradit poskytovateli (${d.to}) výše uvedenou částku za útraty ve skupině ${groupName}.`} />
          <Clause no="II" title="Splatnost" body="Neprodleně. Žádné výmluvy se nepřijímají. Makáme." />
          <Clause no="III" title="Sankce" body="Při nesplnění bude příjemce úředně veden jako Černý pasažér a vystaven posměchu skupiny." />
          <Clause no="IV" title="Závěrečné ustanovení" body="Smluvní strany prohlašují, že smlouvu nečetly, ale souhlasí. Sorry jako." />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, paddingTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 90, height: 2, backgroundColor: c.muted, marginBottom: 4 }} />
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.muted }}>{d.to}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 90, height: 2, backgroundColor: c.muted, marginBottom: 4 }} />
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.muted }}>{dluznik}</Text>
            </View>
          </View>
        </View>
      </View>

      <Pushable onPress={share} radius={14}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: '#fff' }}>📤 Poslat smlouvu dlužníkovi</Text>
        </View>
      </Pushable>
    </ScrollView>
  );
}
