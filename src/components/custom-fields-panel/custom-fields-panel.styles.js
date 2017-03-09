import {StyleSheet} from 'react-native';
import {UNIT, FOOTER_HEIGHT, COLOR_PINK, COLOR_SELECTED_DARK, COLOR_TRANSPARENT_BLACK, COLOR_FONT_ON_BLACK, COLOR_BLACK, COLOR_DARK_BORDER} from '../../components/variables/variables';

const SAVING_ALPHA = '70';

export default StyleSheet.create({
  placeholder: {
    height: FOOTER_HEIGHT,
    backgroundColor: COLOR_BLACK
  },
  customFieldsPanel: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: COLOR_BLACK,
    height: FOOTER_HEIGHT,
    borderTopWidth: 1,
    borderColor: COLOR_DARK_BORDER,
    flexShrink: 0
  },

  modal: {
    flex: 1,
    justifyContent: 'space-between',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },

  editorViewContainer: {
    flex: 1
  },
  calendar: {
    backgroundColor: '#FFFFFFF0',
    padding: UNIT*2
  },
  clearDate: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    color: COLOR_PINK
  },
  simpleValueInput: {
    paddingTop: 2,
    paddingBottom: 2,

    height: UNIT * 4,
    margin: UNIT,
    paddingLeft: UNIT,
    backgroundColor: COLOR_SELECTED_DARK,
    color: COLOR_FONT_ON_BLACK
  },
  savingFieldIndicator: {
    backgroundColor: `#CCCCCC${SAVING_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
