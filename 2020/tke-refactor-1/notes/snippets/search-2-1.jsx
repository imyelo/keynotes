import * as React from 'react';
import Form, { Field } from 'rc-field-form';

const Search = ({ onSearch }) => {
  const handleFinish = ({ keyword }) => onSearch(keyword);
  return (
    <Form onFinish={handleFinish}>
      {() => (
        <>
          <Field name="keyword">
            <input placeholder="请输入用户 AppID 或集群 ID 查询" />
          </Field>
        </>
      }}
    </Form>
  );
};

export default Search;
