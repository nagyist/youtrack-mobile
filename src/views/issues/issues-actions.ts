import * as issueUpdater from 'components/issue-actions/issue-updater';
import * as types from './issues-action-types';
import ApiHelper from 'components/api/api__helper';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {
  convertToNonStructural,
  createQueryFromFiltersSetting,
  getFilterFieldKey,
} from 'views/issues/issues-helper';
import {
  defaultIssuesFilterFieldConfig,
  FilterSetting,
  FiltersSetting,
  IssuesSetting,
  issuesSearchSettingMode,
  IssuesSettings,
  issuesSettingsDefault,
  issuesViewSettingMode,
} from 'views/issues/index';
import {EVERYTHING_CONTEXT} from 'components/search/search-context';
import {flushStoragePart, getStorageState, MAX_STORED_QUERIES} from 'components/storage/storage';
import {getAssistSuggestions} from 'components/query-assist/query-assist-helper';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {notifyError} from 'components/notification/notification';
import {removeDuplicatesFromArray, until} from 'util/util';
import {setGlobalInProgress} from 'actions/app-actions';
import {sortAlphabetically} from 'components/search/sorting';
import {whiteSpacesRegex} from 'components/wiki/util/patterns';

import type Api from 'components/api/api';
import type {AnyIssue, IssueFull} from 'types/Issue';
import type {AppState} from 'reducers';
import type {Folder} from 'types/User';
import {CustomError} from 'types/Error';
import {FilterField, FilterFieldValue} from 'types/CustomFields';
import {ISelectProps} from 'components/select/select';
import {ISSWithItemActionsProps} from 'components/select/select-sectioned-with-item-and-star';

type ApiGetter = () => Api;

type GroupedFolders = {
  projects: Folder[];
  searches: Folder[];
  tags: Folder[];
};

const PAGE_SIZE: number = 14;

function trackEvent(msg: string, additionalParam?: string) {
  usage.trackEvent(ANALYTICS_ISSUES_PAGE, msg, additionalParam);
}

export function setIssuesQuery(
  query: string,
): {
  query: string;
  type: any;
} {
  return {
    type: types.SET_ISSUES_QUERY,
    query,
  };
}

export function getPageSize(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => number {
  return (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    return getState().issueList.settings.view.mode === issuesViewSettingMode.S ? PAGE_SIZE * 3 : PAGE_SIZE;
  };
}

export function readStoredIssuesQuery(): (
  dispatch: (arg0: any) => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    const query = getStorageState().query || '';
    dispatch(setIssuesQuery(query));
  };
}
export function suggestIssuesQuery(
  query: string,
  caret: number,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => Record<string, any>,
    getApi: ApiGetter,
  ) => {
    const suggestions = await getAssistSuggestions(getApi(), query, caret);
    dispatch({
      type: types.SUGGEST_QUERY,
      suggestions,
    });
  };
}
export function clearAssistSuggestions(): {
  type: any;
} {
  return {
    type: types.CLEAR_SUGGESTIONS,
  };
}

async function storeLastQuery(query: string) {
  if (!query) {
    return;
  }

  const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
  const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).slice(
    0,
    MAX_STORED_QUERIES,
  );
  flushStoragePart({
    lastQueries: uniqueUpdatedQueries,
  });
}

export function storeIssuesQuery(query: string): () => void {
  return () => {
    flushStoragePart({
      query,
    });
    storeLastQuery(query);
  };
}
export function listEndReached(): {
  type: any;
} {
  return {
    type: types.LIST_END_REACHED,
  };
}
export function startIssuesLoading(): {
  isInProgress: boolean;
  type: any;
} {
  return setGlobalInProgress(true);
}
export function stopIssuesLoading(): {
  isInProgress: boolean;
  type: any;
} {
  return setGlobalInProgress(false);
}
export function startMoreIssuesLoading(
  newSkip: number,
): {
  newSkip: number;
  type: any;
} {
  return {
    type: types.START_LOADING_MORE,
    newSkip,
  };
}
export function stopMoreIssuesLoading(): {
  type: any;
} {
  return {
    type: types.STOP_LOADING_MORE,
  };
}
export function receiveIssues(
  issues: AnyIssue[],
  pageSize: number = PAGE_SIZE,
): {
  issues: AnyIssue[];
  pageSize: number;
  type: any;
} {
  return {
    type: types.RECEIVE_ISSUES,
    issues,
    pageSize,
  };
}
export function resetIssuesCount(): {
  type: any;
} {
  return {
    type: types.RESET_ISSUES_COUNT,
  };
}
export function setIssuesCount(
  count: number | null,
): {
  count: number | null;
  type: any;
} {
  return {
    type: types.SET_ISSUES_COUNT,
    count,
  };
}
export function updateSearchContextPinned(
  isPinned: boolean,
): {
  isSearchContextPinned: boolean;
  type: any;
} {
  return {
    type: types.IS_SEARCH_CONTEXT_PINNED,
    isSearchContextPinned: isPinned,
  };
}

function getSearchContext() {
  return getStorageState().searchContext || EVERYTHING_CONTEXT;
}

export function combineWithContextQuery(query: string = '', toNonStructural: boolean): string {
  const userSearchContext: Folder = getSearchContext();
  const searchContextQuery: string = userSearchContext?.query || '';
  const q: string = toNonStructural ? convertToNonStructural(query) : query;
  return userSearchContext?.query ? `${searchContextQuery} ${q}` : q;
}

export function onQueryUpdate(
  query: string,
): (dispatch: (arg0: any) => any) => void {
  return (dispatch: (arg0: any) => any) => {
    dispatch(storeIssuesQuery(query));
    dispatch(setIssuesQuery(query));
    dispatch(clearAssistSuggestions());
    dispatch(refreshIssues());
  };
}
export function openContextSelect(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => void {
  return (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    trackEvent('Issue list context select');
    const api: Api = getApi();
    const currentSearchContext = getSearchContext();
    const searchContextSelectProps: Partial<ISSWithItemActionsProps> & { isSectioned: boolean } = {
      isSectioned: true,
      placeholder: i18n('Filter projects, saved searches, and tags'),
      getTitle: (item: Folder) => item.name + (item.shortName ? ` (${item.shortName})` : ''),
      dataSource: async (query: string = '') => {
        const isFilterSearchMode: boolean = getState().issueList.settings.search.mode === issuesSearchSettingMode.filter;
        const promises: (null | Promise<Folder[]>)[] | (Promise<Folder> | null)[] =
          isFilterSearchMode
            ? [
              null,
              api.savedQueries.getSavedQueries(),
            ]
            : [
              api.issueFolder.getIssueFolders(true),
              query ? api.issueFolder.getIssueFolders() : null,
            ]
        ;
        const [error, allFolders] = await until(
          promises,
          false,
          true,
        ) as [CustomError | null, [Folder[], (Folder[] | null)]];
        if (error) {
          log.warn('Failed to load user folders for the context');
          return [];
        }
        let pinnedFolders: Folder[] = [];
        let unpinnedFolders: Folder[] = [];
        if (isFilterSearchMode) {
          allFolders[1]?.forEach((it: Folder) => {
            if (it.pinned) {
              pinnedFolders.push(it);
            } else {
              unpinnedFolders.push(it);
            }
          });
        } else {
          pinnedFolders = allFolders[0];
          unpinnedFolders = allFolders[1] || [];
        }

        const pinnedGrouped: GroupedFolders = getGroupedFolders(pinnedFolders);
        const unpinnedGrouped: GroupedFolders = query.length || isFilterSearchMode ? getGroupedFolders(unpinnedFolders) : {
          projects: [],
          tags: [],
          searches: [],
        };

        const searchQueries: Folder[] = [...pinnedGrouped.searches, ...unpinnedGrouped.searches];
        return [
          {
            title: i18n('Projects'),
            data: sortFolders(
              [EVERYTHING_CONTEXT as Folder, ...pinnedGrouped.projects, ...unpinnedGrouped.projects], query
            ),
          },
          {
            title: i18n('Tags'),
            data: sortFolders([...pinnedGrouped.tags, ...unpinnedGrouped.tags], query),
          },
          {
            title: i18n('Saved Searches'),
            data: isFilterSearchMode ? searchQueries : sortFolders(searchQueries, query),
          },
        ];
      },
      selectedItems: [currentSearchContext],
      onCancel: () => dispatch(closeSelect()),
      onSelect: async (searchContext: Folder) => {
        try {
          dispatch(closeSelect());
          await dispatch(setSearchContext(searchContext));
          await flushStoragePart({searchContext});
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
      hasStar: (folder: Folder) => folder.pinned,
      onStar: (folder: Folder) => api.issueFolder.issueFolders(folder.id, {pinned: !folder.pinned}),
    };
    dispatch(openSelect(searchContextSelectProps));
  };
}

export function composeSearchQuery(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<string> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const settings: IssuesSettings = dispatch(getIssuesSettings());
    const issuesQuery: string = getState().issueList.query;
    const searchSettings: IssuesSetting = settings.search;
    const isFilterMode: boolean = searchSettings.mode === issuesSearchSettingMode.filter;
    let query: string = combineWithContextQuery(issuesQuery, isFilterMode).trim();
    if (isFilterMode) {
      const filtersSettings: FilterSetting[] = Object.values(settings.search.filters);
      query = `${query} ${createQueryFromFiltersSetting(filtersSettings)}`;
    }
    return query.trim().replace(whiteSpacesRegex, ' ');
  };
}


export function openFilterFieldSelect(filterSetting: FilterSetting): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => void {
  return (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    trackEvent('Issues filter field select');
    const settings: IssuesSettings = dispatch(getIssuesSettings());
    const selectedItems: { name: string; id: string }[] = filterSetting.selectedValues.map(i => ({id: i, name: i}));
    const selectProps: Partial<ISelectProps> = {
      multi: true,
      getTitle: (it: FilterFieldValue) => getEntityPresentation(it),
      dataSource: async (prefix: string = '') => {
        const query = dispatch(composeSearchQuery());
        const [error, filterFieldValues] = await until(
          filterSetting.filterField.map(
            (it: FilterField) => getApi().filterFields.filterFieldValues(it.id, prefix, query)
          ),
          true,
          true
        ) as [CustomError | null, FilterFieldValue[]];
        if (error) {
          log.warn('Failed to load user folders for the context');
        }
        const _values = removeDuplicatesFromArray(
          filterFieldValues.map(i => ({id: i.id, name: i.presentation})).concat(selectedItems)
        );
        return error ? [] : _values;
      },
      selectedItems,
      onCancel: () => dispatch(closeSelect()),
      onSelect: async (selected: { id: string; name: string }[]) => {
        try {
          dispatch(closeSelect());
          const key: string = getFilterFieldKey(filterSetting.filterField[0]);
          const issuesSettings: IssuesSettings = {
            ...settings,
            search: {
              ...settings.search,
              filters: {
                ...settings.search.filters,
                [key]: {
                  key,
                  filterField: filterSetting.filterField,
                  selectedValues: selected.map(i => i.id),
                },
              },
            },
          };
          await dispatch(cachedIssuesSettings(issuesSettings));
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
    };
    dispatch(openSelect(selectProps));
  };
}

export function openSelect(selectProps: Partial<ISelectProps>): (dispatch: (arg0: any) => any) => void {
  return (dispatch: (arg0: any) => any) => {
    dispatch({
      type: types.OPEN_SEARCH_CONTEXT_SELECT,
      selectProps,
    });
  };
}
export function closeSelect(): (dispatch: (arg0: any) => any) => void {
  return (dispatch: (arg0: any) => any) => {
    dispatch({
      type: types.CLOSE_SEARCH_CONTEXT_SELECT,
    });
  };
}
export function cacheIssues(issues: AnyIssue[]): () => void {
  return () => {
    let updatedCache: AnyIssue[] = issues;
    const cachedIssues: AnyIssue[] | null | undefined = getStorageState().issuesCache;

    if (cachedIssues) {
      const issueActivityMap: Record<string, AnyIssue> = cachedIssues.reduce(
        (map: Record<string, AnyIssue>, it: AnyIssue) => {
          if (it.activityPage) {
            map[it.id] = it.activityPage;
          }

          return map;
        },
        {},
      );
      updatedCache = issues.map((it: AnyIssue) => {
        if (issueActivityMap[it.id]) {
          it.activityPage = issueActivityMap[it.id];
        }

        return it;
      });
    }

    flushStoragePart({
      issuesCache: updatedCache,
    });
  };
}
export function setIssuesError(
  error: Record<string, any>,
): (dispatch: (arg0: any) => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(resetIssuesCount());
    dispatch({
      type: types.LOADING_ISSUES_ERROR,
      error: error,
    });
  };
}
export function loadIssues(query: string): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    try {
      const api: Api = getApi();
      const isOffline: boolean =
        getState().app?.networkState?.isConnected === false;
      log.info('Loading issues...');

      if (!isOffline) {
        dispatch(startIssuesLoading());
      }

      const [error, listIssues] = await until(
        api.issues.getIssues(query, dispatch(getPageSize()), 0, getState().issueList.settings.view.mode),
      );
      dispatch(stopIssuesLoading());

      if (error) {
        if (isOffline && !getStorageState().issuesCache || !isOffline) {
          dispatch(setIssuesError(error));
        }
      } else {
        const issues: AnyIssue[] = ApiHelper.fillIssuesFieldHash(listIssues);
        log.info(`${issues?.length} issues loaded`);
        dispatch(receiveIssues(issues, dispatch(getPageSize())));
        dispatch(cacheIssues(issues));

        if (issues?.length < dispatch(getPageSize())) {
          log.info('End reached during initial load');
          dispatch(listEndReached());
        }
      }
    } catch (e) {
      log.log('Failed to load issues');
    }
  };
}
export function isIssueMatchesQuery(
  issueIdReadable: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<boolean> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const [error, listIssues] = await until(
      getApi().issues.getIssuesXShort(
        encodeURIComponent(`${await dispatch(composeSearchQuery())} #${issueIdReadable}`),
        1,
      ),
    );
    return !error && listIssues.length > 0;
  };
}
export function getIssueFromCache(
  issueId: string,
): AnyIssue | null | undefined {
  const cachedIssues: AnyIssue[] = getStorageState().issuesCache || [];
  return cachedIssues.find(
    (it: AnyIssue) => it.id === issueId || it?.idReadable === issueId,
  );
}
export function loadIssue(
  issueId: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
) => Promise<AnyIssue | null> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => Promise<IssueFull | null>,
  ) => {
    let issue: AnyIssue | null | undefined = getIssueFromCache(issueId);

    if (!issue) {
      issue = await issueUpdater.loadIssue(issueId);
    }

    return issue;
  };
}
export function updateIssue(
  issueId: string,
): (dispatch: (arg0: any) => any, getState: () => any) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => Record<string, any>,
  ) => {
    const currentIssues: AnyIssue[] = getState().issueList.issues;
    const issueToUpdate: IssueFull | null = await issueUpdater.loadIssue(
      issueId,
    );

    if (issueToUpdate) {
      const updatedIssues: AnyIssue[] = issueUpdater.updateIssueInIssues(
        issueToUpdate,
        currentIssues,
      );
      dispatch(receiveIssues(updatedIssues, dispatch(getPageSize())));
      dispatch(cacheIssues(updatedIssues));
    }
  };
}
export function refreshIssues(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
  ): Promise<void> => {
    const searchQuery: string = await dispatch(composeSearchQuery());
    dispatch(setIssuesCount(null));
    dispatch(loadIssues(searchQuery));
    dispatch(refreshIssuesCount());
  };
}
export function refreshIssuesCount(): (
  dispatch: (arg0: any) => any,
  getState: () => any,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => Record<string, any>,
  ): Promise<void> => {
    dispatch(loadIssuesCount(getSearchContext()));
  };
}
export function setSearchContext(searchContext: Folder = EVERYTHING_CONTEXT as Folder): (
  dispatch: (arg0: any) => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    dispatch({
      type: types.SET_SEARCH_CONTEXT,
      searchContext,
    });
  };
}

export function cachedIssuesSettings(settings?: IssuesSettings): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => IssuesSettings {
  return (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ): IssuesSettings => {
    if (settings) {
      dispatch({
        type: types.SET_LIST_SETTINGS,
        settings,
      });
      flushStoragePart({issuesSettings: settings});
    }
    return settings || getStorageState().issuesSettings || issuesSettingsDefault;
  };
}

export function getIssuesSettings(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  ) => IssuesSettings {
  return (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    ): IssuesSettings => {

    return getState().issueList.settings;
  };
}

export function setFilters(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    let settings: IssuesSettings = dispatch(cachedIssuesSettings());
    const [error, filterFields] = await until(getApi().customFields.getFilters());
    if (error) {
      log.warn('Cannot load filter fields');
    } else {
      const visibleFiltersNames: string[] = (
        getState().app.user?.profiles?.appearance?.liteUiFilters ||
        Object.values(defaultIssuesFilterFieldConfig)
      );
      settings = {
        ...settings,
        search: {
          ...settings.search,
          filters: visibleFiltersNames.reduce((akk: FiltersSetting, it: string) => {
            const key: string = it.toLowerCase();
            const filterSettings: FilterSetting | undefined = settings.search.filters?.[key];
            return {
              ...akk,
              [key]: {
                key,
                filterField: filterFields.filter((i: FilterField) => i.name.toLowerCase() === key),
                selectedValues: filterSettings?.selectedValues || [],
              },
            };
          }, {}),
        },
      };
      dispatch(cachedIssuesSettings(settings));
    }
  };
}

export function initializeIssuesList(
  searchQuery?: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
  ) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
    ) => {
    dispatch(setIssuesQuery(searchQuery || getStorageState().query || ''));

    if (searchQuery) {
      dispatch(storeIssuesQuery(searchQuery));
    } else {
      dispatch(readStoredIssuesQuery());
    }

    await dispatch(setSearchContext(getSearchContext()));
    await dispatch(setFilters());

    const cachedIssues: AnyIssue[] | null = getStorageState().issuesCache;
    if (cachedIssues?.length) {
      log.debug(`Loaded ${cachedIssues.length} cached issues`);
      dispatch(receiveIssues(cachedIssues, dispatch(getPageSize())));
    }

    dispatch(refreshIssues());
  };
}
export function loadMoreIssues(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    try {
      const isOffline: boolean =
        getState().app?.networkState?.isConnected === false;

      if (isOffline) {
        return;
      }

      const api: Api = getApi();
      const {
        isInitialized,
        isLoadingMore,
        isRefreshing,
        loadingError,
        isListEndReached,
        skip,
        issues,
      } = getState().issueList;

      if (
        !isInitialized ||
        isLoadingMore ||
        isRefreshing ||
        loadingError ||
        isListEndReached
      ) {
        return;
      }

      const pageSize: number = dispatch(getPageSize());
      const newSkip = skip + pageSize;
      log.info(`Loading more issues. newSkip = ${newSkip}`);
      dispatch(startMoreIssuesLoading(newSkip));

      try {
        const searchQuery = await dispatch(composeSearchQuery());
        let moreIssues: AnyIssue[] = (await api.issues.getIssues(
          searchQuery,
          pageSize,
          newSkip,
          getState().issueList.settings.view.mode
        )) as any;
        log.info(`Loaded ${pageSize} more issues.`);
        moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues);
        const updatedIssues = ApiHelper.removeDuplicatesByPropName(
          issues.concat(moreIssues),
          'id',
        );
        dispatch(receiveIssues(updatedIssues, dispatch(getPageSize())));
        dispatch(cacheIssues(updatedIssues));

        if (moreIssues?.length < pageSize) {
          log.info(
            `End of issues reached: all ${updatedIssues?.length} issues are loaded`,
          );
          dispatch(listEndReached());
        }
      } catch (err) {
        notifyError(err);
      } finally {
        dispatch(stopMoreIssuesLoading());
      }
    } catch (e) {
      log.log('Failed to load more issues');
    }
  };
}
export function loadIssuesCount(folder?: Folder | null): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    try {
      const api: Api = getApi();
      const abortController: AbortController = new AbortController();
      const _query = await dispatch(composeSearchQuery());
      const _folder = getState().issueList.settings.search.mode === issuesSearchSettingMode.filter ? undefined : folder;
      const issuesCount: number = await api.issues.getIssuesCount(
        _query,
        _folder,
        false,
        abortController,
      );

      if (issuesCount === -1 && !abortController.signal.aborted) {
        return new Promise((resolve, reject) => {
          let timer: TimeoutID | null | undefined = setTimeout(resolve, 3000);

          abortController.signal.onabort = () => {
            reject();
            clearTimeout(timer);
            timer = null;
          };
        }).then(() => dispatch(loadIssuesCount(folder)));
      }

      if (issuesCount >= 0) {
        dispatch(setIssuesCount(issuesCount));
      }
    } catch (e) {
      log.log('Failed to load issues count');
    }
  };
}

export function onSettingsChange(settings: IssuesSettings): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
  ) => {
    dispatch(setIssuesQuery(''));
    await dispatch(cachedIssuesSettings(settings));
    await flushStoragePart({issuesCache: null});
    if (settings.search.mode === issuesSearchSettingMode.filter) {
      await dispatch(setFilters());
    }
    dispatch(receiveIssues([], dispatch(getPageSize())));
    dispatch(refreshIssues());
  };
}

function getGroupedFolders(folders: Folder[]) {
  return folders.reduce(
    (
      akk: GroupedFolders,
      it: Folder,
    ) => {
      if (hasType.project(it)) {
        akk.projects.push(it);
      } else if (hasType.savedSearch(it)) {
        akk.searches.push(it);
      } else {
        akk.tags.push(it);
      }
      return akk;
    },
    {
      projects: [],
      searches: [],
      tags: [],
    },
  );
}

function sortFolders(flds: Folder[], q?: string): Folder[] {
  const map: Record<string, boolean> = {};
  return (q ? flds.filter(
    (it: Folder) => {
      if (map[it.id]) {
        return false;
      }
      map[it.id] = true;
      return it.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }
  ) : flds).sort(sortAlphabetically);
}
