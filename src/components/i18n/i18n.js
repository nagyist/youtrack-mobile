/* @flow */

import {gt} from './i18n-gettext';

type Params = { [p: string]: string | number | undefined } | undefined;

export function i18n(text: string = '', params?: Params): string {
  return gt.gettext(createNgettextMessage(text, params));
}

export function i18nPlural(count: number, text: string, textPlural: string, params?: Params): string {
  return gt.ngettext(
    createNgettextMessage(text, params),
    createNgettextMessage(textPlural, params),
    count
  );
}


function createNgettextMessage(message: string, params?: Params) {
  let msg: string = message.slice(0);
  if (params) {
    message.replace(/{{([^}]+)}}/g, (pattern: string, key: string) => {
      const _key: string = key.trim();
      if (params.hasOwnProperty(_key)) {
        msg = msg.replace(pattern, params[_key]);
      }
    });
  }
  return msg;
}