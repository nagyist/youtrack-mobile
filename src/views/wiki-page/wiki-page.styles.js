import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables/variables';
import {headerTitle, monospace, SECONDARY_FONT_SIZE} from 'components/common-styles/typography';


export default EStyleSheet.create({
  headerTitle: headerTitle,
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: UNIT,
    paddingLeft: UNIT,
  },
  plainText: {
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
    ...monospace,
  },
});
