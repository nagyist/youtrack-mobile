import EStyleSheet from 'react-native-extended-stylesheet';

import feedbackFormStyles from 'components/common-styles/feedback-form';
import {mainText, SECONDARY_FONT_SIZE, UNIT} from 'components/common-styles';
import {rowFormStyles} from 'components/common-styles/form';

export const formRowStyles = {
  ...feedbackFormStyles,
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formInputClearSpace: {
    paddingRight: UNIT * 5,
  },
  formInputClearIcon: {
    marginLeft: -UNIT * 5,
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBlock: {
    marginTop: UNIT * 2,
  },
  formBlockError: {
    borderColor: '$error',
    color: '$error',
  },
  formBlockText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formInput: {
    ...rowFormStyles.input,
    ...mainText,
    color: '$text',
  },
  formInputWithLabel: {
    paddingVertical: UNIT * 2.5,
    paddingBottom: UNIT,
    marginTop: UNIT / 4,
  },
  formInputLabel: {
    position: 'absolute',
    top: UNIT,
    left: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$textSecondary',
  },
  formSelect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formSelectIcon: {
    position: 'absolute',
    right: 2,
    paddingHorizontal: UNIT,
    paddingVertical: UNIT * 1.5,
    backgroundColor: '$boxBackground',
    color: '$icon',
    borderRadius: UNIT,
  },
};

export default EStyleSheet.create(formRowStyles);