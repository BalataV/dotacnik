// Globální škálování velikosti písma.
//  - Uživatel si v Profilu vybere velikost obsahu (malý / střední / velký).
//  - Zároveň respektujeme systémové nastavení „velké písmo" (accessibility),
//    ale s rozumným stropem, aby se nerozbil neo-brutalistický layout.
//
// Řešeno jedním místem: napíchneme render Text/TextInput a vynásobíme fontSize.
// Tím nemusíme upravovat stovky inline `fontSize` napříč obrazovkami.
import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import type { ContentSize } from './types';

// Násobiče pro jednotlivé volby. „medium" = 1 → výchozí vzhled jako dosud.
export const CONTENT_SCALE: Record<ContentSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.18,
};

// O kolik nejvíc smí systémové „velké písmo" zvětšit text (ochrana layoutu).
const MAX_OS_MULTIPLIER = 1.4;

let _scale = 1;          // aktuální násobič z volby uživatele
let _installed = false;  // pojistka proti dvojímu napíchnutí

// Nastaví aktuální násobič. Re-render zajistí změna stavu v contextu.
export function setGlobalFontScale(scale: number) {
  _scale = scale || 1;
}

// Napíchne Text/TextInput. Volá se jednou při startu (App.tsx).
export function installTextScaling() {
  if (_installed) return;
  _installed = true;
  try {
    patchComponent(Text as any);
    patchComponent(TextInput as any);
  } catch (e) {
    // Kdyby se interní API RN změnilo, appka poběží bez globálního škálování.
  }
}

function patchComponent(Comp: any) {
  const orig = Comp && Comp.render;
  if (typeof orig !== 'function' || orig.__scaled) return;
  // Upravujeme VSTUPNÍ props (ne výsledek renderu) – pole stylů pak zpracuje
  // standardní pipeline React Native, takže to funguje na mobilu i na webu.
  const patched = function (this: any, props: any, ref: any) {
    const flat = StyleSheet.flatten(props && props.style) || ({} as any);
    const next: any = {
      ...props,
      // Strop pro systémové zvětšení (props si může vynutit vlastní hodnotu).
      maxFontSizeMultiplier: props && props.maxFontSizeMultiplier != null ? props.maxFontSizeMultiplier : MAX_OS_MULTIPLIER,
    };
    if (typeof flat.fontSize === 'number' && _scale !== 1) {
      next.style = [props.style, { fontSize: Math.round(flat.fontSize * _scale) }];
    }
    return orig.call(this, next, ref);
  };
  (patched as any).__scaled = true;
  Comp.render = patched;
}
