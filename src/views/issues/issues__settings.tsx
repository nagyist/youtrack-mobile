import React from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import IssuesFiltersSetting from 'views/issues/issues__filters-settings';
import IssuesSortBy from './issues__sortby';
import usage from 'components/usage/usage';
import useIsReporter from 'components/user/useIsReporter';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {i18n} from 'components/i18n/i18n';
import {IconCheck} from 'components/icon/icon';
import {
  IssuesSetting,
  issuesSearchSettingMode,
  issuesSettingsIssueSizes,
  issuesSettingsSearch,
  IssuesSettingSearch,
  IssuesSettings,
} from 'views/issues/index';
import {onSettingsChange, setFilters} from 'views/issues/issues-actions';
import {receiveUserAppearanceProfile, receiveUserHelpdeskProfile} from 'actions/app-actions';

import styles from './issues.styles';

import type {AppState} from 'reducers';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {User} from 'types/User';


const IssuesListSettings = ({
  onQueryUpdate,
  toggleVisibility,
  onChange,
}: {
  onQueryUpdate: (q: string) => void;
  toggleVisibility: (isVisible: boolean) => void;
  onChange: () => void,
}): React.JSX.Element => {
  const dispatch: ReduxThunkDispatch = useDispatch();

  React.useEffect(() => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'Issues settings: open');
  }, []);

  const query = useSelector((state: AppState) => state.issueList.query);
  const searchContext = useSelector((state: AppState) => state.issueList.searchContext);
  const settings = useSelector((state: AppState) => state.issueList.settings);
  const user: User = useSelector((state: AppState) => state.app.user) as User;
  const isReporter = useIsReporter();
  const isHelpdeskMode = useSelector((state: AppState) => state.issueList.helpDeskMode);

  const isQueryMode: boolean = settings.search.mode === issuesSearchSettingMode.query;
  const doChangeSettings = (issuesSettings: IssuesSettings) => {
    dispatch(onSettingsChange(issuesSettings));
  };

  return (
    <>
      <BottomSheetModal
        style={styles.settingsModal}
        withHandle={true}
        height={isReporter ? 220 : Dimensions.get('window').height - 100}
        snapPoint={450}
        isVisible={true}
        onClose={() => toggleVisibility(false)}
      >
        <>
          {!isReporter && (
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemTitle}>{i18n('Search Input Mode')}</Text>
              {issuesSettingsSearch.map((it: IssuesSetting | IssuesSettingSearch, index: number) => {
                return (
                  <TouchableOpacity
                    disabled={it.mode === settings.search.mode}
                    testID="test:id/issuesSettingsSearchButton"
                    key={`issueSetting${index}`}
                    accessible={false}
                    style={styles.settingsRow}
                    onPress={() => {
                      usage.trackEvent(ANALYTICS_ISSUES_PAGE, `Issues settings: set search mode to "${it.mode}"`);
                      doChangeSettings({...settings, search: it});
                    }}
                  >
                    <Text
                      style={styles.settingsItemText}
                      testID="test:id/issuesSettingsSearchButtonText"
                      accessible={true}
                    >
                      {it.label}
                    </Text>
                    {it.mode === settings.search.mode && <IconCheck size={20} color={styles.link.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {!isReporter &&
            <>
              <View style={styles.settingsSeparator} />
              <View style={styles.settingsItem}>
                <Text style={styles.settingsItemTitle}>
                  {isQueryMode && i18n('Sort Order')}
                  {!isQueryMode && i18n('Filter Settings')}
                </Text>
                {isQueryMode ? (
                  <IssuesSortBy
                    onOpen={() => toggleVisibility(false)}
                    context={searchContext}
                    onApply={(q: string) => onQueryUpdate(q)}
                    query={query}
                  />
                ) : (
                  <IssuesFiltersSetting
                    onApply={async (visibleFilters: string[]) => {
                      await dispatch(
                        isHelpdeskMode
                          ? receiveUserHelpdeskProfile({
                            ...user?.profiles?.helpdesk,
                            ticketFilters: visibleFilters,
                          })
                          : receiveUserAppearanceProfile({
                          ...user?.profiles?.appearance,
                          liteUiFilters: visibleFilters,
                        })
                      );
                      if (visibleFilters.length === 0) {
                        doChangeSettings({...settings, search: issuesSettingsSearch[0]});
                      } else {
                        await dispatch(setFilters());
                      }
                      onChange();
                    }}
                    onOpen={() => toggleVisibility(false)}
                    user={user}
                  />
                )}
              </View>
              <View style={styles.settingsSeparator} />
            </>
          }
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemTitle}>{i18n('Preview Size')}</Text>
            {issuesSettingsIssueSizes.map((it: IssuesSetting, index: number) => {
              const previewModeIsNotChanged: boolean = it.mode === settings.view.mode;
              return (
                <TouchableOpacity
                  key={`sizeSetting${index}`}
                  disabled={previewModeIsNotChanged}
                  style={styles.settingsRow}
                  onPress={() => {
                    doChangeSettings({...settings, view: it});
                    toggleVisibility(false);
                  }}
                >
                  <Text style={styles.settingsItemText}>{`${it.label} `}</Text>
                  {previewModeIsNotChanged && <IconCheck size={20} color={styles.link.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      </BottomSheetModal>
    </>
  );
};


export default React.memo(IssuesListSettings);

