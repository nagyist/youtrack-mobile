import React from 'react';
import {TextInput, View, TouchableOpacity} from 'react-native';

import IconSearch from 'components/icon/assets/search.svg';
import {i18n} from 'components/i18n/i18n';
import {IconClearText} from 'components/icon/icon-clear-text';

import styles from './query-assist.styles';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  editable?: boolean;
  query: string;
  onFocus?: (clear: boolean) => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
  style?: ViewStyleProp;
}


const QueryPreview = (props: Props) => {
  const ref: React.MutableRefObject<TextInput | null> = React.useRef<TextInput | null>(null);
  const {query = '', style, placeholder = i18n('Enter search request'), editable = true} = props;
  const [value, setValue] = React.useState<string>(query);

  React.useEffect(() => {
    setValue(query);
  }, [query]);

  const focus = () => {
    if (props?.onFocus) {
      props?.onFocus?.(false);
    } else if (props.editable) {
      ref.current?.focus?.();
    }
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <TouchableOpacity onPress={focus}>
        <IconSearch
          style={styles.searchIcon}
          width={17}
          height={17}
          color={styles.clearIcon.color}
        />
      </TouchableOpacity>

      <TextInput
        editable={editable}
        ref={ref}
        numberOfLines={1}
        onFocus={focus}
        accessible={true}
        testID="test:id/query-assist-input"
        placeholder={placeholder}
        placeholderTextColor={styles.searchInputPlaceholder.color}
        style={styles.searchInput}
        value={value}
        onChangeText={(q: string) => {
          setValue(q);
        }}
        onSubmitEditing={() => {
          props?.onSubmit?.(value);
        }}
      />

      {!!query && (
        <IconClearText
          onPress={() => {
            setValue('');
            props?.onFocus?.(true);
            props?.onSubmit?.('');
          }}
        />
      )}
    </View>
  );
};


export default React.memo(QueryPreview);
