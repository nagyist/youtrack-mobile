import React from 'react';
import {View} from 'react-native';

import styles from './page.style';

import {INavigationParams, mixinNavigationProps} from 'components/navigation';


const Page = (props: INavigationParams & React.PropsWithChildren) => {
  return (
    <View style={styles.container} testID="page">
      {props.children}
    </View>
  );
};


export default mixinNavigationProps(Page);
