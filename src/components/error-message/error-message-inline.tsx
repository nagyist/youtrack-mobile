import React from 'react';

import {Linking, Text, View} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {i18n} from 'components/i18n/i18n';
import {UNIT} from 'components/variables';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  error?: string | null | undefined;
  tips?: string;
  showSupportLink?: boolean;
  style?: ViewStyleProp;
}

const styles = EStyleSheet.create({
  error: {
    marginTop: UNIT,
    marginBottom: UNIT * 2,
  },
  errorText: {
    marginBottom: UNIT,
    color: '$error',
  },
  link: {
    color: '$link',
  },
});

export default function ErrorMessageInline(props: Props) {
  const {error, tips, showSupportLink, style} = props;

  if (!error) {
    return null;
  }

  return (
    <View testID="errorMessageInline" style={[styles.error, style]}>
      <Text style={styles.errorText} selectable={true} testID="errorMessageInlineError">
        {error}
      </Text>
      {!!tips && (
        <Text testID="errorMessageInlineTip" style={styles.errorText} selectable={true}>
          {tips}
        </Text>
      )}
      {showSupportLink && (
        <Text
          testID="errorMessageInlineSupportLink"
          onPress={() => Linking.openURL('https://youtrack-support.jetbrains.com/hc/en-us/requests/new')}
          style={[styles.error, styles.link]}
        >
          {i18n('Contact support')}
        </Text>
      )}
    </View>
  );
}
