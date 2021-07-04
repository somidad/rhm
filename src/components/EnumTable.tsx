import { Button, Form, Input, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { Enum } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  title: string;
  enumList: Enum[];
  onChange: (enumList: Enum[]) => void;
  usedIndexList?: number[];
};

type EditableCellProps = {
  record: { key: number, name: string; };
  dataIndex: string;
  children: any;
};

const NAME = 'Name';
const ACTIONS = 'Actions';

export default function EnumTable({ title, enumList, onChange, usedIndexList }: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  const columns: any[] = [
    { key: NAME.toLocaleLowerCase(), dataIndex: NAME.toLocaleLowerCase(), title },
    { key: ACTIONS.toLocaleLowerCase(), dataIndex: ACTIONS.toLocaleLowerCase(), title: 'Actions' },
  ].map((column) => {
    const { dataIndex } = column;
    return {
      ...column,
      onCell: (record: any) => ({
        record,
        dataIndex,
      }),
    };
  });

  function addEnumItem() {
    form.validateFields(['name']).then(() => {
      const name = form.getFieldValue('name');
      const enumItemFound = enumList.find((enumItem) => enumItem.name === name);
      if (enumItemFound) {
        return;
      }
      const index = findEmptyIndex(enumList.map((enumItem) => enumItem.index));
      const enumListNew = [
        ...enumList,
        { index, name },
      ].sort((a, b) => a.name.localeCompare(b.name));
      onChange(enumListNew);
      form.setFieldsValue({ name: '' });
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onClickEdit(index: number) {
    const enumItem = enumList.find((enumItem) => enumItem.index === index);
    if (!enumItem) {
      return;
    }
    form.setFieldsValue({ nameNew: enumItem.name });
    setEditIndex(index);
  }

  function onSubmitRename(index: number) {
    form.validateFields(['nameNew']).then(() => {
      const nameNew = form.getFieldValue('nameNew');
      const enumItemFound = enumList.find((enumItem) => enumItem.index !== index && enumItem.name === nameNew);
      if (enumItemFound) {
        return;
      }
      const indexFound = enumList.findIndex((enumItem) => enumItem.index === index);
      if (indexFound === -1) {
        return;
      }
      const enumListNew = [
        ...enumList.slice(0, indexFound),
        { index, name: nameNew },
        ...enumList.slice(indexFound + 1),
      ];
      onChange(enumListNew);
      setEditIndex(-1);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function removeEnumItem(index: number) {
    if (usedIndexList && usedIndexList.includes(index)) {
      return;
    }
    const indexFound = enumList.findIndex((enumItem) => enumItem.index === index);
    if (indexFound === -1) {
      return;
    }
    const enumListNew = [
      ...enumList.slice(0, indexFound),
      ...enumList.slice(indexFound + 1),
    ];
    onChange(enumListNew);
  }

  const dataSource = [
    { key: -1, name: '', actions: '' },
    ...enumList.map((enumItem) => {
      const { index, name } = enumItem;
      return { key: index, name, actions: '' };
    }),
  ];

  return (
    <Table
      columns={columns} dataSource={dataSource}
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      pagination={false}
    />
  );

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    const { key } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === NAME.toLocaleLowerCase() ? (
            <Form form={form} onFinish={addEnumItem}>
              <Form.Item
                name='name'
                rules={[{ required: true }]}
                help={false}
              >
                <Input disabled={editIndex !== -1} />
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item>
                <Button onClick={addEnumItem} disabled={editIndex !== -1}>Add</Button>
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === NAME.toLocaleLowerCase() ? (
            <Form form={form} onFinish={() => onSubmitRename(key)}>
              <Form.Item
                name='nameNew'
                rules={[{ required: true }]}
                help={false}
              >
                <Input />
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item>
                <Button onClick={() => onSubmitRename(key)}>Ok</Button>
                <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
              </Form.Item>
            </Form>
          ) : dataIndex === NAME.toLocaleLowerCase() ? (
            children
          ) : dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <>
              <Button onClick={() => onClickEdit(key)}>Edit</Button>
              <Button onClick={() => removeEnumItem(key)}>Remove</Button>
            </>
          ) : (null)
        }
      </td>
    )
  }
}
