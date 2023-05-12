import {StyleSheet} from 'react-native';

import {menuHeight} from 'components/common-styles/header';


export default StyleSheet.create({
  menuProgressContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: menuHeight,
    height: 3,
    width: '100%',
  },
});
