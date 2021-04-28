/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Switch from 'react-native-switch-pro';

import ModalPanelBottom from '../../../components/modal-panel-bottom/modal-panel-bottom';
import {getIssueActivityIcon} from '../../../components/activity/activity-helper';
import {IconAngleDown} from '../../../components/icon/icon';
import {toggleIssueActivityEnabledType} from './issue-activity__helper';

import {HIT_SLOP} from '../../../components/common-styles/button';

import styles from './issue-activity.styles';

import type {ActivityType} from '../../../flow/Activity';
import type {UITheme} from '../../../flow/Theme';
import type {UserAppearanceProfile} from '../../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  issueActivityTypes: Array<ActivityType>,
  issueActivityEnabledTypes: Array<ActivityType>,
  onApply: Function,
  userAppearanceProfile: UserAppearanceProfile,
  disabled?: boolean,
  style?: ViewStyleProp,
  uiTheme: UITheme
};

type State = {
  visible: boolean,
  settings: Array<ActivityType>
};

type SortOrder = { name: string, isNaturalCommentsOrder: boolean };


export default class IssueActivitiesSettings extends PureComponent<Props, State> {
  switchCommonProps: Object;
  sortOrderOption: SortOrder;

  constructor(props: Props) {
    super(props);

    this.switchCommonProps = {
      width: 40,
      circleColorActive: props.uiTheme.colors.$link,
      circleColorInactive: props.uiTheme.colors.$icon,
      backgroundActive: props.uiTheme.colors.$linkLight,
      backgroundInactive: props.uiTheme.colors.$disabled,
    };

    this.sortOrderOption = {
      name: 'Show oldest activity first',
      isNaturalCommentsOrder: props?.userAppearanceProfile?.naturalCommentsOrder,
    };

    this.state = {
      visible: false,
      settings: [],
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props?.userAppearanceProfile?.naturalCommentsOrder !== prevProps?.userAppearanceProfile?.naturalCommentsOrder ||
      this.props.issueActivityTypes?.length !== prevProps.issueActivityTypes?.length ||
      this.props.issueActivityEnabledTypes?.length !== prevProps.issueActivityEnabledTypes?.length
    ) {
      this.updateSettingsList();
    }
  }

  updateSettingsList() {
    const {issueActivityTypes, issueActivityEnabledTypes, userAppearanceProfile} = this.props;
    this.setState({
      settings: this.createSettingsList(
        issueActivityTypes,
        issueActivityEnabledTypes,
        userAppearanceProfile.naturalCommentsOrder
      ),
    });
  }

  createSettingsList(
    issueActivityTypes: Array<ActivityType> = [],
    issueActivityEnabledTypes: Array<ActivityType> = [],
    naturalCommentsOrder: boolean
  ): Array<$Shape<ActivityType | SortOrder>> {
    const list: Array<ActivityType> = issueActivityTypes.reduce(
      (list: Array<ActivityType>, type: ActivityType) => {
        type.enabled = issueActivityEnabledTypes.some((enabledType: ActivityType) => enabledType.id === type.id);
        return list.concat(type);
      },
      []);
    this.sortOrderOption.isNaturalCommentsOrder = naturalCommentsOrder;
    return list.concat(this.sortOrderOption);
  }

  toggleSettingsDialogVisibility: (() => void) = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  onApplySettings(userAppearanceProfile: UserAppearanceProfile) {
    this.props.onApply(userAppearanceProfile);
  }

  renderSettingsDialog(): Node {
    return (
      <ModalPanelBottom
        testID="activitySettingsDialog"
        title="Activity Settings"
        onHide={this.toggleSettingsDialogVisibility}
      >
        <>
          {this.renderOrderItem()}
          {this.renderTypesList()}
        </>
      </ModalPanelBottom>
    );
  }

  renderOrderItem(): Node {
    const {userAppearanceProfile, onApply, disabled} = this.props;
    return (
      <View
        style={styles.settingsItem}
      >
        <Text style={styles.settingsName}>{this.sortOrderOption.name}</Text>
        <Switch
          style={disabled ? styles.settingsSwitchDisabled : null}
          {...this.switchCommonProps}
          disabled={disabled}
          value={this.props.userAppearanceProfile.naturalCommentsOrder}
          onSyncPress={isNaturalOrder => {
            onApply({
              ...userAppearanceProfile,
              ...{naturalCommentsOrder: isNaturalOrder},
            });
          }}
        />

      </View>
    );
  }

  renderTypesList(): Node {
    const {issueActivityTypes, issueActivityEnabledTypes, disabled} = this.props;

    return (
      <View>
        {issueActivityTypes.map((type: ActivityType) => {
          const isEnabled = issueActivityEnabledTypes.some(enabled => enabled.id === type.id);
          const Icon: any = getIssueActivityIcon(type.id);
          return (
            <View
              key={type.id}
              style={styles.settingsItem}
            >
              <View style={styles.settingsItemLabel}>
                {!!Icon && <Icon size={22} color={this.props.uiTheme.colors.$iconAccent}/>}
                <Text style={styles.settingsName}>
                  {`  ${type.name}`}
                </Text>
              </View>
              <Switch
                style={disabled ? styles.settingsSwitchDisabled : null}
                {...this.switchCommonProps}
                value={isEnabled}
                disabled={disabled}
                onSyncPress={async (enable: ActivityType) => {
                  await toggleIssueActivityEnabledType(type, enable);
                  this.onApplySettings(null);
                }}
              />

            </View>
          );
        })}
      </View>
    );
  }

  getTitle(): string {
    return this.props.issueActivityEnabledTypes.map((category) => category.name).join(', ');
  }

  render(): Node {
    return (
      <View style={this.props.style}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={this.props.disabled}
          style={styles.settingsButton}
          onPress={this.toggleSettingsDialogVisibility}
        >
          <Text style={styles.settingsButtonText}>{this.getTitle()}</Text>
          <IconAngleDown size={19} color={this.props.uiTheme.colors.$icon}/>
        </TouchableOpacity>

        {this.state.visible && this.renderSettingsDialog()}
      </View>
    );
  }
}
