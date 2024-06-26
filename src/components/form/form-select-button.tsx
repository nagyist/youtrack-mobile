import React from 'react';
import {InputModeOptions, NativeSyntheticEvent, TextInputFocusEventData, View} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import FormTextInput from 'components/form/form-text-input';
import {IconAngleRight} from 'components/icon/icon';

import styles from './form.style';

import type {TextStyleProp, ViewStyleProp} from 'types/Internal';

const FormSelectButton = ({
  inputMode,
  label,
  multiline,
  onBlur,
  onChange = () => {},
  onClear,
  onFocus,
  onPress,
  placeholder,
  placeholderTextColor,
  required,
  style,
  textStyle,
  testID,
  validator,
  value,
  disabled,
}: {
  inputMode?: InputModeOptions;
  label?: string;
  multiline?: boolean;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>, validationError: boolean) => void;
  onChange?: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onPress: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  required?: boolean;
  style?: ViewStyleProp;
  textStyle?: TextStyleProp,
  testID?: string;
  validator?: RegExp | ((v: string) => boolean) | null;
  value?: string;
  disabled?: boolean;
}) => {
  const backGrStyle = style?.backgroundColor ? {backgroundColor: style?.backgroundColor} : null;
  return (
    <View style={[styles.formSelect, style]}>
      <TouchableOpacity disabled={disabled} onPress={onPress} testID={testID}>
        <View pointerEvents="box-only">
          <FormTextInput
            style={{...textStyle, ...backGrStyle}}
            editable={false}
            inputMode={inputMode}
            inputStyle={[label ? styles.formSelectText : null]}
            multiline={multiline}
            onBlur={onBlur}
            onChange={onChange}
            onClear={onClear}
            onFocus={onFocus}
            label={label}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            required={required}
            validator={validator}
            value={value}
          >
            {!disabled &&
              <View style={[styles.formSelectIcon, backGrStyle]}>
                <IconAngleRight size={20} color={styles.formSelectIcon.color} />
              </View>
            }
          </FormTextInput>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(FormSelectButton);
