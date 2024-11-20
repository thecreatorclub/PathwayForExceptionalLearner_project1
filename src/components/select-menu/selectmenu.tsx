import React from 'react';
import chroma from 'chroma-js';

import { SubjectOption, SubjectOptions } from './data';
import Select, { StylesConfig, CSSObjectWithLabel } from 'react-select';

const colourStyles: StylesConfig<SubjectOption, true> = {
  control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
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
  multiValue: (styles: CSSObjectWithLabel, { data }: { data: SubjectOption }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: CSSObjectWithLabel, { data }: { data: SubjectOption }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: CSSObjectWithLabel, { data }: { data: SubjectOption }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
};

interface SelectMenuProps {
  onChange: (selectedOption: SubjectOption | null) => void;
  value: SubjectOption | null;
}

const SelectMenu: React.FC<SelectMenuProps> = ({ onChange, value }) => (
  <Select
    closeMenuOnSelect={true}
    options={SubjectOptions}
    styles={colourStyles}
    onChange={onChange}
    value={value}
  />
);

SelectMenu.displayName = 'SelectMenu';

export default SelectMenu;
