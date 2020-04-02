import * as React from 'react';
import Form, { Field } from 'rc-field-form';

const normalize = v => v.trim();
const rules = [
  { required: true },
  {
    /**识别输入的字符串为 AppID 或集群 ID */
    validator(_, value) {
      if (!value || /^(\d+$|cls-)/.test(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('输入有误，请输入以 cls- 开头的集群 ID 或数字类型的 AppID'));
    }
  }
];

const Search = ({ onSearch }) => {
  const handleFinish = ({ keyword }) => onSearch(keyword);
  return (
    <Form onFinish={handleFinish}>
      {(_, form) => {
        const keywordErrors = form.getFieldError('keyword');
        return (
          <div>
            <Field name="keyword" rules={rules} normalize={normalize}>
              <input placeholder="请输入用户 AppID 或集群 ID 查询" />
            </Field>
            {keywordErrors[0] ? <p>{keywordErrors[0]}</p> : null}
          </div>
        );
      }}
    </Form>
  );
};

export default Search;
