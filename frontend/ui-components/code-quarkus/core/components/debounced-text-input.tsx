import React, { FormEvent, useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';
import { Form } from 'react-bootstrap';

export interface DebouncedTextInputProps {
  value: string
  delay?: number;
  isValid?: boolean;
  className?: string;
  onChange?: (string) => void;
}

export function DebouncedTextInput(props: DebouncedTextInputProps) {
  const { value, onChange, isValid, ...rest } = props;
  const [ localValue, setLocalValue ] = useState<string>(value);
  const [ prevValue, setPrevValue ] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (value !== prevValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line
  }, [ value ]);
  const onChangeWithPrev = onChange ? (newVal?: string) => {
    setPrevValue(newVal);
    onChange(newVal);
  } : undefined;
  const debouncedOnChange = useDebounce(onChangeWithPrev, props.delay || 200);
  const onChangeWithLocal = debouncedOnChange ? (e: FormEvent<HTMLInputElement>) => {
    const newVal = e.currentTarget.value;
    setLocalValue(newVal);
    debouncedOnChange(newVal);
  }: undefined;

  const isInvalid = isValid !== undefined ? !isValid : false

  return (
    <Form.Control
      {...rest as any}
      type="text"
      onChange={onChangeWithLocal}
      value={onChange ? localValue : value}
      isInvalid={isInvalid}
      aria-invalid={isInvalid}
    />
  );
}
