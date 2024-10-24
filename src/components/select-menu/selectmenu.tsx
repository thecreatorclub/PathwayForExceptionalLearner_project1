import React from 'react';
import chroma from 'chroma-js';

import { SubjectOption, SubjectOptions } from './data';
import Select, { StylesConfig } from 'react-select';

const colourStyles: StylesConfig<SubjectOption, true> = {
  control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles: React.CSSProperties & { [key: string]: any }, { data, isDisabled, isFocused, isSelected }: { data: SubjectOption, isDisabled: boolean, isFocused: boolean, isSelected: boolean }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.1).css()
        : undefined,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? chroma.contrast(color, 'white') > 2
          ? 'white'
          : 'black'
        : data.color,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  multiValue: (styles: React.CSSProperties, { data }: { data: SubjectOption }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: React.CSSProperties, { data }: { data: SubjectOption }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: React.CSSProperties, { data }: { data: SubjectOption }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
};

const SelectMenu = () => (
  <Select
    closeMenuOnSelect={false}
    options={SubjectOptions}
    styles={colourStyles}
  />
);

SelectMenu.displayName = 'SelectMenu';

export default SelectMenu;
