import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { formLineup, formLineupNew, formName, formNameNew, keyActions, keyLineup, keyPackage, parenError, parenNone, titleActions, titleLineup, titlePackage } from "../constants";
import { Enum, Pkg } from "../types";
import { findEmptyIndex } from "../utils";

const { Option } = Select;

type Props = {
  pkgList: Pkg[];
  lineupList: Enum[];
  onChange: (pkgList: Pkg[]) => void;
  usedPkgIndexList?: number[];
};

type EditableCellProps = {
  record: { key: number; name: string; lineup: number };
  dataIndex: string;
  children: any;
};

export default function PkgTable({
  pkgList,
  lineupList,
  onChange,
  usedPkgIndexList,
}: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    setEditIndex(-1);
  }, [lineupList]);

  const columns: any[] = [
    {
      key: keyPackage,
      dataIndex: keyPackage,
      title: titlePackage,
    },
    {
      key: keyLineup,
      dataIndex: keyLineup,
      title: titleLineup,
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

  function addPkg() {
    form
      .validateFields([formName, formLineup])
      .then(() => {
        const { name, lineup: lineupIndex } = form.getFieldsValue([
          formName,
          formLineup,
        ]);
        const pkgFound = pkgList.find((pkg) => pkg.name === name);
        if (pkgFound) {
          return;
        }
        const index = findEmptyIndex(pkgList.map((pkg) => pkg.index));
        const pkgListNew = [...pkgList, { index, name, lineupIndex }].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        onChange(pkgListNew);
        form.setFieldsValue({
          name: "",
          lineup: -1,
        });
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function onClickEdit(index: number) {
    const pkgFound = pkgList.find((pkg) => pkg.index === index);
    if (!pkgFound) {
      return;
    }
    const { name, lineupIndex } = pkgFound;
    form.setFieldsValue({
      nameNew: name,
      lineupNew: lineupIndex,
    });
    setEditIndex(index);
  }

  function onSubmitEditPkg() {
    form
      .validateFields([formNameNew])
      .then(() => {
        const { nameNew, lineupNew: lineupIndexNew } = form.getFieldsValue([
          formNameNew,
          formLineupNew,
        ]);
        const pkgFound = pkgList.find(
          (pkg) => pkg.index !== editIndex && pkg.name === nameNew
        );
        if (pkgFound) {
          return;
        }
        const indexFound = pkgList.findIndex((pkg) => pkg.index === editIndex);
        if (indexFound === -1) {
          return;
        }
        const pkgListNew = [
          ...pkgList.slice(0, indexFound),
          { index: editIndex, name: nameNew, lineupIndex: lineupIndexNew },
          ...pkgList.slice(indexFound + 1),
        ];
        onChange(pkgListNew);
        setEditIndex(-1);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function removePkg(index: number) {
    if (usedPkgIndexList && usedPkgIndexList.includes(index)) {
      return;
    }
    const indexFound = pkgList.findIndex((pkg) => pkg.index === index);
    if (indexFound === -1) {
      return;
    }
    const enumListNew = [
      ...pkgList.slice(0, indexFound),
      ...pkgList.slice(indexFound + 1),
    ];
    onChange(enumListNew);
  }

  const dataSource = [
    { key: -1 },
    ...pkgList.map((pkg) => {
      const { index: key, name, lineupIndex: lineup } = pkg;
      return { key, package: name, lineup };
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
      size="small"
    />
  );

  function EditableCell({
    record,
    dataIndex,
    children,
    ...restProps
  }: EditableCellProps) {
    const { key, lineup: lineupIndex } = record;
    return (
      <td {...restProps}>
        {key === -1 && dataIndex === keyPackage ? (
          <Form form={form} onFinish={addPkg}>
            <Form.Item name={formName} rules={[{ required: true }]} help={false}>
              <Input disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyLineup ? (
          <Form form={form}>
            <Form.Item name={formLineup} initialValue={-1}>
              <Select disabled={editIndex !== -1}>
                <Option key={-1} value={-1}>
                  {parenNone}
                </Option>
                {lineupList.map((lineup) => {
                  const { index, name } = lineup;
                  return (
                    <Option key={index} value={index}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={addPkg} disabled={editIndex !== -1}>
                <PlusOutlined />
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyPackage ? (
          <Form form={form}>
            <Form.Item name={formNameNew} rules={[{ required: true }]} help={false}>
              <Input />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyLineup ? (
          <Form form={form}>
            <Form.Item name={formLineupNew}>
              <Select>
                <Option key={-1} value={-1}>
                  {parenNone}
                </Option>
                {lineupList.map((lineup) => {
                  const { index, name } = lineup;
                  return (
                    <Option key={index} value={index}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={onSubmitEditPkg} icon={<CheckOutlined />} />
              <Button onClick={() => setEditIndex(-1)} icon={<CloseOutlined />} />
            </Form.Item>
          </Form>
        ) : dataIndex === keyPackage ? (
          children
        ) : dataIndex === keyLineup ? (
          lineupIndex === -1 ? (
            parenNone
          ) : (
            lineupList.find((lineup) => lineup.index === lineupIndex)?.name ??
            parenError
          )
        ) : dataIndex === keyActions ? (
          <>
            <Button onClick={() => onClickEdit(key)} icon={<EditOutlined />} />
            <Button
              onClick={() => removePkg(key)}
              disabled={usedPkgIndexList?.includes(key)}
              icon={<DeleteOutlined />}
            />
          </>
        ) : null}
      </td>
    );
  }
}
