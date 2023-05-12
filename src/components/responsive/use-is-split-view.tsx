import {isSplitView} from 'components/responsive/responsive-helper';

export const useInSplitView = (): boolean => {
  return isSplitView();
};

