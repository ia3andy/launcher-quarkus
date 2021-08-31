import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

export default function HoverControlledDropdown(props: any) {
  const [ isHovered, setIsHovered ] = useState(false);
  const { onMouseEnter, onMouseLeave, onToggle, ...rest } = props;
  function onMouseEnterFn(e) {
    if (onMouseEnter) {
      onMouseEnter(e);
    }
    onToggleFn(true);
    setIsHovered(true);
  }

  function onMouseLeaveFn(e) {
    if (onMouseLeave) {
      onMouseLeave(e);
    }
    onToggleFn(false);
    setIsHovered(false);
  }

  function onToggleFn(isOpen: boolean) {
    if (onToggle) {
      onToggle(isOpen);
    }
  }

  return (
    <Dropdown
      {...rest}
      onMouseEnter={onMouseEnterFn}
      onMouseLeave={onMouseLeaveFn}
      show={isHovered}
    />
  );


}