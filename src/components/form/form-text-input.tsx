import React from 'react';
import {InputModeOptions, NativeSyntheticEvent, Text, TextInput, TextInputFocusEventData, View} from 'react-native';

import {IconClearText} from 'components/icon/icon-clear-text';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './form.style';

import type {TextStyleProp} from 'types/Internal';
import type {Theme} from 'types/Theme';

interface Props extends React.PropsWithChildren {
  editable?: boolean;
  inputMode?: InputModeOptions;
  multiline?: boolean;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>, validationError: boolean) => void;
  onChange: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  label?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  required?: boolean;
  inputStyle?: TextStyleProp[];
  testID?: string;
  validator?: RegExp | ((v: string) => boolean) | null;
  value?: string;
  style?: TextStyleProp;
}

const FormTextInput = ({
  editable = true,
  children,
  inputMode,
  multiline,
  onBlur,
  onChange,
  onClear,
  onFocus,
  label,
  placeholder,
  placeholderTextColor,
  required,
  inputStyle,
  testID,
  validator,
  value,
  style,
}: Props) => {
  const theme: Theme = React.useContext(ThemeContext);
  const [hasError, setInvalid] = React.useState<boolean>(false);

  React.useEffect(() => {
    setInvalid(false);
  }, []);

  return (
    <View style={styles.formBlockText}>
      <TextInput
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={
          hasError ? styles.feedbackInputError.borderColor : placeholderTextColor || styles.icon.color
        }
        selectTextOnFocus
        textAlignVertical={multiline ? 'top' : undefined}
        testID={testID}
        style={[
          styles.formInput,
          label && styles.formInputWithLabel,
          inputStyle,
          multiline ? styles.feedbackFormInputMultiline : null,
          multiline && label ? styles.feedbackFormInputMultilineWithLabel : null,
          value ? styles.formInputClearSpace : null,
          hasError ? styles.feedbackInputError : null,
          style,
        ]}
        multiline={multiline}
        placeholder={placeholder}
        value={value}
        onChangeText={t => {
          onChange?.(t);
          setInvalid(false);
        }}
        onFocus={onFocus}
        onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
          let isInvalid: boolean = false;
          const v = (value || '').trim();
          if (v) {
            isInvalid = validator instanceof RegExp ? !validator.test(v) : false;
            if (validator instanceof RegExp) {
              isInvalid = !validator.test(v);
            } else if (typeof validator === 'function') {
              isInvalid = !validator(v);
            }
          } else if (required) {
            isInvalid = true;
          }
          setInvalid(isInvalid);
          onBlur?.(e, isInvalid);
        }}
        inputMode={inputMode}
      />
      {!!label && <Text style={styles.formInputLabel}>{label}</Text>}
      {onClear && value && (
        <IconClearText
          onPress={() => {
            onClear();
            setInvalid(false);
          }}
          style={styles.formInputClearIcon}
        />
      )}
      {children}
    </View>
  );
};

export default React.memo(FormTextInput);
