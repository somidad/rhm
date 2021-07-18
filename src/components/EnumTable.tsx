import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { formName, formNameNew, keyActions, keyName, titleActions } from "../constants";
import { Enum } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  title: string;
  enumList: Enum[];
  onChange: (enumList: Enum[]) => void;
  usedIndexList?: number[];
};

type EditableCellProps = {
  record: { key: number; name: string };
  dataIndex: string;
  children: any;
};

export default function EnumTable({
  title,
  enumList,
  onChange,
  usedIndexList,
}: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  const columns: any[] = [
    {
      key: keyName,
      dataIndex: keyName,
      title,
    },
    {
      key: keyActions,
      dataIndex: keyActions,
      title: titleActions,
    },
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
    form
      .validateFields([formName])
      .then(() => {
        const name = form.getFieldValue(formName);
        const enumItemFound = enumList.find(
          (enumItem) => enumItem.name === name
        );
        if (enumItemFound) {
          return;
        }
        const index = findEmptyIndex(
          enumList.map((enumItem) => enumItem.index)
        );
        const enumListNew = [...enumList, { index, name }].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        onChange(enumListNew);
        form.setFieldsValue({ name: "" });
      })
      .catch((reason) => {
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

  function onSubmitRename() {
    form
      .validateFields([formNameNew])
      .then(() => {
        const nameNew = form.getFieldValue(formNameNew);
        const enumItemFound = enumList.find(
          (enumItem) =>
            enumItem.index !== editIndex && enumItem.name === nameNew
        );
        if (enumItemFound) {
          return;
        }
        const indexFound = enumList.findIndex(
          (enumItem) => enumItem.index === editIndex
        );
        if (indexFound === -1) {
          return;
        }
        const enumListNew = [
          ...enumList.slice(0, indexFound),
          { index: editIndex, name: nameNew },
          ...enumList.slice(indexFound + 1),
        ];
        onChange(enumListNew);
        setEditIndex(-1);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function removeEnumItem(index: number) {
    if (usedIndexList && usedIndexList.includes(index)) {
      return;
    }
    const indexFound = enumList.findIndex(
      (enumItem) => enumItem.index === index
    );
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
    { key: -1 },
    ...enumList.map((enumItem) => {
      const { index, name } = enumItem;
      return { key: index, name };
    }),
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      pagination={false}
    />
  );

  function EditableCell({
    record,
    dataIndex,
    children,
    ...restProps
  }: EditableCellProps) {
    const { key } = record;
    return (
      <td {...restProps}>
        {key === -1 && dataIndex === keyName ? (
          <Form form={form} onFinish={addEnumItem}>
            <Form.Item name={formName} rules={[{ required: true }]} help={false}>
              <Input disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={addEnumItem} disabled={editIndex !== -1}>
                <PlusOutlined />
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyName ? (
          <Form form={form} onFinish={onSubmitRename}>
            <Form.Item name={formNameNew} rules={[{ required: true }]} help={false}>
              <Input />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={onSubmitRename}>
                <CheckOutlined />
              </Button>
              <Button onClick={() => setEditIndex(-1)}>
                <CloseOutlined />
              </Button>
            </Form.Item>
          </Form>
        ) : dataIndex === keyName ? (
          children
        ) : dataIndex === keyActions ? (
          <>
            <Button onClick={() => onClickEdit(key)}>
              <EditOutlined />
            </Button>
            <Button
              onClick={() => removeEnumItem(key)}
              disabled={usedIndexList?.includes(key)}
            >
              <DeleteOutlined />
            </Button>
          </>
        ) : null}
      </td>
    );
  }
}
