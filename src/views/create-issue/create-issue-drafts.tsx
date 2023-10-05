import React from 'react';
import {Text, View} from 'react-native';

import Animated, {Layout, useSharedValue, withSpring} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

import Header from 'components/header/header';
import Router from 'components/router/router';
import Select from 'components/select/select';
import SwipeableRow from 'components/swipeable/swipeable-row';
import {confirmation, deleteButtonText} from 'components/confirmation/confirmation';
import {deleteAllDrafts, deleteDraft} from 'views/create-issue/create-issue-actions';
import {i18n} from 'components/i18n/i18n';
import {IconBack} from 'components/icon/icon';
import {IssueRowDraft} from 'views/issues/issues__row';

import styles from 'views/create-issue/create-issue.styles';

import {AppState} from 'reducers';
import {IssueCreate} from 'types/Issue';
import {useTheme} from 'react-navigation';
import {ThemeContext} from 'components/theme/theme-context';
import {SELECT_ITEM_HEIGHT} from 'components/select/select.styles';

const AnimatedView = Animated.createAnimatedComponent(View);

const IssueDrafts = ({onHide}: { onHide: () => void }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme(ThemeContext);

  const dispatch = useDispatch();
  const drafts: IssueCreate[] = useSelector((state: AppState) => state.creation.drafts);
  const [current, setCurrent] = React.useState<string | null>(null);
  const height = useSharedValue(SELECT_ITEM_HEIGHT);

  const listItem = ({item} : {item: IssueCreate}) => {
    return (
      <SwipeableRow
        rightActionText={i18n('Delete')}
        onSwipeRight={async () => {
          setCurrent(item.id);
          height.value = withSpring(0);
          await dispatch(deleteDraft(item.id));
          if (drafts.length === 1) {
            Router.pop();
          }
        }}
      >
        <AnimatedView
          style={current === item.id ? {height} : null}
        >
          <IssueRowDraft
            key={item.id}
            issue={item as any}
            onClick={() => {
              Router.CreateIssue({predefinedDraftId: item.id, onHide});
            }}
          />
        </AnimatedView>
      </SwipeableRow>
    );
  };

  return (
    <>
      <Header
        title={i18n('Drafts')}
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        onBack={() => Router.pop()}
        rightButton={(
          <View style={styles.draftsDeleteAllButton}>
            <Text style={styles.link}>{i18n('Delete all')}</Text>
          </View>
        )}
        onRightButtonClick={() => {
          confirmation(
            i18n('Delete all drafts?'),
            deleteButtonText,
          ).then(async () => {
            await dispatch(deleteAllDrafts());
            Router.pop();
          });
        }}
      />
      <Animated.FlatList
        itemLayoutAnimation={Layout.mass(1)}
        bounces={false}
        data={drafts}
        renderItem={listItem}
        ItemSeparatorComponent={Select.renderSeparator as any}
        getItemLayout={Select.getItemLayout}
      />
    </>
  );
};


export default IssueDrafts;
