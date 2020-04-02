import * as React from 'react';
import { Button, Input, Select } from '@tencent/tea-component';
import ErrorsAlert from '@common/components/ErrorsAlert';
import { Form, Field } from '@common/components/Form';
import { ARGUMENT_CONTEXTS } from './constants';
import { useViewContext } from './context';

export const ArgumentForm = ({ onFinish, submitting, errors }) => {
  const { args } = useViewContext();
  const isDuplicated = ({ getFieldValue }) => ({
    async validator(_, name) {
      const context = getFieldValue('context');
      if (~args.findIndex(item => item.context === context && item.name === name)) {
        return Promise.reject(new Error('参数已存在'));
      }
      return Promise.resolve();
    }
  });
  return (
    <Form onFinish={onFinish}>
      {(_, form) => {
        return (
          <>
            <Form.Body>
              <Field name="context" label="组件名" required errors={form.getFieldError('context')}>
                <Select type="simulate" appearence="button" options={ARGUMENT_CONTEXTS} />
              </Field>
              <Field
                name="name"
                label="参数名"
                required
                errors={form.getFieldError('name')}
                dependencies={['context']}
                rules={[isDuplicated]}
              >
                <Input placeholder="register-with-taints" />
              </Field>
            </Form.Body>
            <Form.Action>
              <ErrorsAlert errors={errors} />
              <Button type="primary" loading={submitting}>
                确定
              </Button>
            </Form.Action>
          </>
        );
      }}
    </Form>
  );
};