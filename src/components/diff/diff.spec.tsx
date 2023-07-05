import React from 'react';

import {render, cleanup, fireEvent} from '@testing-library/react-native';

import Diff from './diff';


describe('<Diff/>', () => {
  let text1: string;
  let text2: string;

  beforeEach(() => {
    jest.restoreAllMocks();
    text1 = 'ABCy';
    text2 = 'xABC';
  });

  afterEach(cleanup);


  describe('Render', () => {
    it('should render component', () => {
      const {getByTestId} = render(<Diff text1={text1} text2={text2}/>);

      expect(getByTestId('diff').props).toBeDefined();
    });

    it('should render difference', async () => {
      const {getByTestId} = render(<Diff text1={text1} text2={text2}/>);
      fireEvent.press(getByTestId('details'));

      expect(getByTestId('diffText').props).toBeDefined();
      expect(getByTestId('diffInsert').props).toBeDefined();
      expect(getByTestId('diffDelete').props).toBeDefined();
      expect(getByTestId('diffEqual').props).toBeDefined();
    });
  });
});
