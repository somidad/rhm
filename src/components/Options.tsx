import { Form, Radio, RadioChangeEvent } from "antd";
import React from "react";

export type Options = {
  tagStyle: "comma" | "separate";
};

export default function Options({
  options,
  onChangeOptions,
}: {
  options: Options;
  onChangeOptions: React.Dispatch<React.SetStateAction<Options>>;
}) {
  const { tagStyle } = options;

  function onChangeTagStyle(e: RadioChangeEvent) {
    onChangeOptions({ ...options, tagStyle: e.target.value });
  }

  return (
    <Form>
      <Form.Item label="Tab style">
        <Radio.Group value={tagStyle} onChange={onChangeTagStyle}>
          <Radio value="comma">&lt;A, B, C&gt;</Radio>
          <Radio value="separate">&lt;A&gt;&lt;B&gt;&lt;C&gt;</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
}
