/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {Text, Dimensions} from 'react-native';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';

import styles from './issue-tabbed.style';

import type {TabRoute} from '../../flow/Issue';
import type {UITheme, UIThemeColors} from '../../flow/Theme';

export type IssueTabbedState = {
  index: number,
  routes: Array<TabRoute>
};


export default class IssueTabbed extends PureComponent<void, IssueTabbedState> {
  initialWindowDimensions: any = Dimensions.get('window');
  tabRoutes: Array<TabRoute> = ['Details', 'Activity'].map((name: string) => ({key: name, title: name}));

  state: IssueTabbedState = {
    index: 0,
    routes: this.tabRoutes,
    isTransitionInProgress: false,
  };

  renderDetails: ((uiTheme: UITheme) => null) = (uiTheme: UITheme) => null;

  renderActivity: ((uiTheme: UITheme) => null) = (uiTheme: UITheme) => null;

  isTabChangeEnabled: (() => boolean) = () => true;

  switchToDetailsTab: (() => void) = () => this.setState({index: 0});

  switchToActivityTab: (() => void) = () => this.setState({index: 1});

  renderTabBar(uiTheme: UITheme, editMode: boolean = false): ((props: any) => Node) {
    return (props: Object) => {
      const uiThemeColors: UIThemeColors = uiTheme.colors;
      return (
        <TabBar
          {...props}
          pressColor={uiThemeColors.$disabled}
          indicatorStyle={{backgroundColor: editMode ? 'transparent' : uiThemeColors.$link}}
          style={[styles.tabsBar, editMode ? {height: 1} : null, {shadowColor: uiThemeColors.$separator}]}
          renderLabel={({route, focused}) => {
            return (
              <Text style={[
                styles.tabLabel,
                focused ? styles.tabLabelActive : null,
                {
                  color: focused && !editMode
                    ? uiThemeColors.$link
                    : this.isTabChangeEnabled() ? uiThemeColors.$text : uiThemeColors.$disabled,
                },
              ]}>
                {route.title}
              </Text>
            );
          }}
        />
      );
    };
  }

  renderScene: ((route: TabRoute, uiTheme: UITheme) => null) = (route: TabRoute, uiTheme: UITheme) => {
    if (route.key === this.tabRoutes[0].key) {
      return this.renderDetails(uiTheme);
    }
    return this.renderActivity(uiTheme);
  };

  renderTabs: ((uiTheme: UITheme) => Node) = (uiTheme: UITheme) => {
    return (
      <TabView
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        navigationState={this.state}
        renderScene={({route}) => this.renderScene(route, uiTheme)}
        initialLayout={this.initialWindowDimensions}
        renderTabBar={this.renderTabBar(uiTheme)}
        onIndexChange={index => {
          if (this.isTabChangeEnabled()) {
            this.setState({index});
          }
        }}
      />
    );
  };

  render(): null {
    return null;
  }
}
