import { Button, Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import Link from "antd/lib/typography/Link";
import { useState } from "react";
import { Version } from "../types";
import { findEmptyIndex } from "../utils";

const { Option } = Select;

type Props = {
  versionList: Version[];
  onChange: (versionList: Version[]) => void;
  onSelect: (index: number) => void;
};

type EditableCellPros = {
  record: { key: number; version: string; previous: number; };
  dataIndex: string;
  children: any;
};

export default function VersionTable({ versionList, onChange, onSelect }: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  const columns: any[] = [
    { key: 'version', dataIndex: 'version', title: 'Version' },
    { key: 'previous', dataIndex: 'previous', title: 'Previous' },
    { key: 'actions', dataIndex: 'actions', title: 'Actions' },
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

  function addVersion() {
    form.validateFields(['version']).then(() => {
      const { version: name, previous: indexPrev } = form.getFieldsValue(['version', 'previous']);
      const versionFound = versionList.find((version) => version.name === name);
      if (versionFound) {
        return;
      }
      const index = findEmptyIndex(versionList.map((version) => version.index));
      const versionListNew: Version[] = [
        ...versionList,
        { index, name, indexPrev, changeList: [], releaseList: [] },
      ];
      form.setFieldsValue({ version: '' });
      onChange(versionListNew);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onClickEdit(key: number) {
    const versionFound = versionList.find((version) => version.index === key);
    if (!versionFound) {
      return;
    }
    const { name: nameNew, indexPrev: previousNew } = versionFound;
    form.setFieldsValue({nameNew, previousNew});
    setEditIndex(key);
  }

  function onSubmitEditVersion(key: number) {
    form.validateFields(['nameNew']).then(() => {
      const { nameNew: name, previousNew: indexPrev } = form.getFieldsValue(['nameNew', 'previousNew']);
      const versionFound = versionList.find((version) => version.index !== key && version.name === name);
      if (versionFound) {
        return;
      }
      const indexFound = versionList.findIndex((version) => version.index === key);
      if (indexFound === -1) {
        return;
      }
      const versionListNew: Version[] = [
        ...versionList.slice(0, indexFound),
        { index: key, name, indexPrev, changeList: [], releaseList: [] },
        ...versionList.slice(indexFound + 1),
      ];
      onChange(versionListNew);
      setEditIndex(-1);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function removeVersion(index: number) {
    const versionFound = versionList.find((version) => version.indexPrev === index);
    if (versionFound) {
      return;
    }
    const indexFound = versionList.findIndex((version) => version.index === index);
    if (indexFound === -1) {
      return;
    }
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      ...versionList.slice(indexFound + 1, 0),
    ];
    onChange(versionListNew);
  }

  const dataSource = [
    { key: -1 },
    ...versionList.map((version) => {
      const { index, name, indexPrev } = version;
      return { key: index, version: name, previous: indexPrev };
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

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellPros) {
    const { key, previous: indexPrev } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === 'version' ? (
            <Form form={form}>
              <Form.Item
                name='version'
                rules={[{ required: true }]}
                help={false}
              >
                <Input disabled={editIndex !== -1} />
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === 'previous' ? (
            <Form form={form}>
              <Form.Item
                name='previous'
                initialValue={-1}
              >
                <Select disabled={editIndex !== -1}>
                  <Option key={-1} value={-1}>(None)</Option>
                  {
                    versionList.map((version) => {
                      const { index, name } = version;
                      return (
                        <Option key={index} value={index}>{name}</Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === 'actions' ? (
            <Form>
              <Form.Item>
                <Button onClick={addVersion} disabled={editIndex !== -1}>Add</Button>
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === 'version' ? (
            <Form form={form}>
              <Form.Item
                name='nameNew'
                rules={[{ required: true }]}
                help={false}
              >
                <Input />
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === 'previous' ? (
            <Form form={form}>
              <Form.Item
                name='previousNew'
              >
                <Select>
                  <Option key={-1} value={-1}>(None)</Option>
                  {
                    versionList.map((version) => {
                      const { index, name } = version;
                      return (
                        <Option
                          key={index} value={index}
                          disabled={index === key}
                        >
                          {name}
                        </Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === 'actions' ? (
            <Form form={form}>
              <Form.Item>
                <Button onClick={() => onSubmitEditVersion(key)}>Ok</Button>
                <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
              </Form.Item>
            </Form>
          ) : dataIndex === 'version' ? (
            <Link onClick={() => onSelect(key)}>{children}</Link>
          ) : dataIndex === 'previous' ? (
            indexPrev === -1 ? '(None)' : versionList.find((version) => version.index === indexPrev)?.name ?? '(Error)'
          ) : dataIndex === 'actions' ? (
            <>
              <Button onClick={() => onClickEdit(key)}>Edit</Button>
              <Button onClick={() => removeVersion(key)}>Remove</Button>
              <Button>Publish</Button>
            </>
          ) : (children)
        }
      </td>
    )
  }
}