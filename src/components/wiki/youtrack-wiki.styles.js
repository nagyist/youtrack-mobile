import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE, monospace} from '../common-styles/typography';
import {link} from '../common-styles/button';

const showMoreLink = {
  fontSize: SECONDARY_FONT_SIZE,
  color: '$link'
};

export default EStyleSheet.create({
  htmlView: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
    textAlign: 'left',
    writingDirection: 'ltr',
    ...Platform.select({
      android: {
        borderBottomWidth: UNIT,
        borderColor: 'transparent'
      }
    }),
  },
  lineSpace: {
    lineHeight: 30
  },
  monospace: {
    ...monospace
  },
  deleted: {
    textDecorationLine: 'line-through'
  },
  blockQuote: {
    color: '$textSecondary',
    borderLeftWidth: 2,
    borderLeftColor: '$textSecondary',
    paddingLeft: UNIT
  },
  unspaced: {
    margin: 0
  },
  link: {
    ...link,
    fontSize: SECONDARY_FONT_SIZE,
  },
  text: {
    ...link,
    fontSize: SECONDARY_FONT_SIZE,
  },
  showMoreLink: {
    ...showMoreLink,
    lineHeight: SECONDARY_FONT_SIZE * 2,
    fontSize: SECONDARY_FONT_SIZE
  },
  exceptionLink: showMoreLink,
  codeContainer: {
    marginTop: UNIT * 2,
    marginBottom: UNIT
  },
  codeContent: {
    padding: UNIT,
    backgroundColor: '$boxBackground'
  },
  code: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '500',
  },
  codeLanguage: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$border'
  },
  inlineCode: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    color: '$text',
    lineHeight: SECONDARY_FONT_SIZE * 1.5,
    backgroundColor: '$boxBackground'
  },
  exception: {
    ...monospace,
    marginTop: UNIT,
    marginBottom: UNIT * 3,
    fontSize: SECONDARY_FONT_SIZE,
    color: '$text'
  },

});

export const htmlViewStyles = EStyleSheet.create({
  a: {
    color: '$link',
    textDecorationLine: 'underline'
  }
});