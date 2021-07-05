import { Button, Form, Input, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Version } from "../types";
import { findEmptyIndex } from "../utils";
const { Option } = Select;

type Props ={ 
  versionList: Version[];
  onChange: (versionList: Version[]) => void;
}

export default function FormAddVersion({ versionList, onChange }: Props) {
  const [form] = useForm();

  function addVersion() {
    form.validateFields(['name']).then(() => {
      const { name, indexPrev } = form.getFieldsValue(['name', 'indexPrev']);
      const indexFound = versionList.findIndex((version) => version.name === name);
      console.log(indexFound);
      if (indexFound !== -1) {
        return;
      }
      const index = findEmptyIndex(versionList.map((version) => version.index));
      const versionListNew: Version[] = [
        ...versionList,
        { index, name, indexPrev, releaseList: [], changeList: [] },
      ];
      form.setFieldsValue({ name: '' });
      onChange(versionListNew);
    }).catch((reason) => {
      console.error(reason);
    })
  }

  return (
    <Form
      form={form}
      layout='inline'
    >
      <Form.Item
        label='Version name'
        name='name'
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label='Previous'
        name='indexPrev'
        initialValue={-1}
      >
        <Select style={{ minWidth: 150 }}>
          <Option key={-1} value={-1}>(None)</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button onClick={addVersion}>Add</Button>
      </Form.Item>
    </Form>
  );
}
