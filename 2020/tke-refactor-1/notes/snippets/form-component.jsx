import * as React from 'react';
import { default as RCForm, Field as RCField } from 'rc-field-form';
import { Form as TeaForm, Modal as TeaModal } from '@tencent/tea-component';

const MESSAGES = {
  required: '${label}不能为空',
  types: {
    number: '${label}应为数值'
  }
};

const Form = ({ ...props }) => <RCForm validateMessages={MESSAGES} {...props} />;

/** 保持统一的样式风格 */
Form.Body = TeaForm;
Form.Action = TeaModal.Footer;

export default Form;

export const useInitialValues = (form, initialValues, dependencies = [initialValues]) => {
  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, dependencies);
};

// ...

const requiredRule = { required: true, validateTrigger: 'onSubmit' };

const Field = ({
  name,
  label,
  required = false,
  errors = [],
  rules = [],
  children,
  dependencies = [],
  messageVariables = {},
  teaProps = {},
  rcProps = {}
}) => {
  return (
    <TeaForm.Item
      label={label}
      required={required}
      message={errors[0]}
      status={errors.length ? 'error' : null}
      align="middle"
      {...teaProps}
    >
      <RCField
        name={name}
        rules={required ? [requiredRule, ...rules] : rules}
        dependencies={dependencies}
        messageVariables={{ label, ...messageVariables }}
        {...rcProps}
      >
        {children}
      </RCField>
    </TeaForm.Item>
  );
};

export default Field;
