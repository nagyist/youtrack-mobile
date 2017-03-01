/* @flow */
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {UNIT, AGILE_COLUMN_MIN_WIDTH, AGILE_COLLAPSED_COLUMN_WIDTH, COLOR_FONT_ON_BLACK, COLOR_GRAY, COLOR_BLACK} from '../../components/variables/variables';
import type {AgileColumn} from '../../flow/Agile';

type Props = {
  style?: any,
  columns: Array<AgileColumn>,
  onCollapseToggle: (column: AgileColumn) => any
};

export default function BoardHeader(props: Props) {
  const {columns, onCollapseToggle, style} = props;
  return (
    <View style={[styles.tableHeader, style]}>
      {columns.map(col => {
        const columnPresentation = col.agileColumn.fieldValues.map(val => val.presentation).join(', ');

        return (
          <TouchableOpacity
            style={[styles.tableHeaderItem, col.collapsed && styles.collapsedHeaderItem]}
            key={col.id}
            onPress={() => onCollapseToggle(col)}
          >
            <Text numberOfLines={1} style={styles.columnText}>{columnPresentation}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLOR_BLACK
  },
  tableHeaderItem: {
    flexShrink: 1,
    flex: 1,
    minWidth: AGILE_COLUMN_MIN_WIDTH,
    alignItems: 'center',
    padding: UNIT/2,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  collapsedHeaderItem: {
    flex: 0,
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    minWidth: AGILE_COLLAPSED_COLUMN_WIDTH,
  },
  columnText: {
    color: COLOR_FONT_ON_BLACK
  }
});
