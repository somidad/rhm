import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { createRef, useEffect, useState } from "react";
import {
  formAlias,
  formAliasNew,
  formLineup,
  formLineupNew,
  formName,
  formNameNew,
  keyActions,
  keyAlias,
  keyLineup,
  keyPackage,
  parenError,
  parenNone,
  titleActions,
  titleAlias,
  titleLineup,
  titlePackage,
} from "../constants";
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
  const refButtonAdd = createRef<HTMLElement>();
  const refButtonEdit = createRef<HTMLElement>();
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
      key: keyAlias,
      dataIndex: keyAlias,
      title: titleAlias,
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
      .validateFields([formName, formAlias, formLineup])
      .then(() => {
        const {
          name,
          alias,
          lineup: lineupIndex,
        } = form.getFieldsValue([formName, formAlias, formLineup]);
        const pkgFound = pkgList.find((pkg) => pkg.name === name);
        if (pkgFound) {
          return;
        }
        const index = findEmptyIndex(pkgList.map((pkg) => pkg.index));
        const pkgListNew = [
          ...pkgList,
          { index, name, alias, lineupIndex },
        ].sort((a, b) => a.name.localeCompare(b.name));
        onChange(pkgListNew);
        form.setFieldsValue({
          name: "",
          alias: "",
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
    const { name, alias, lineupIndex } = pkgFound;
    form.setFieldsValue({
      nameNew: name,
      aliasNew: alias,
      lineupNew: lineupIndex,
    });
    setEditIndex(index);
  }

  function onSubmitEditPkg() {
    form
      .validateFields([formNameNew])
      .then(() => {
        const {
          nameNew,
          aliasNew,
          lineupNew: lineupIndexNew,
        } = form.getFieldsValue([formNameNew, formAliasNew, formLineupNew]);
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
          {
            index: editIndex,
            name: nameNew,
            alias: aliasNew,
            lineupIndex: lineupIndexNew,
          },
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
      const { index: key, name, alias, lineupIndex: lineup } = pkg;
      return { key, package: name, alias, lineup };
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
            <Form.Item
              name={formName}
              rules={[{ required: true }]}
              help={false}
            >
              <Input
                onPressEnter={() => refButtonAdd.current?.click()}
                disabled={editIndex !== -1}
              />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyAlias ? (
          <Form form={form} onFinish={addPkg}>
            <Form.Item name={formAlias} help={false}>
              <Input
                onPressEnter={() => refButtonAdd.current?.click()}
                disabled={editIndex !== -1}
              />
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
              <Button
                ref={refButtonAdd}
                onClick={addPkg}
                disabled={editIndex !== -1}
              >
                <PlusOutlined />
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyPackage ? (
          <Form form={form}>
            <Form.Item
              name={formNameNew}
              rules={[{ required: true }]}
              help={false}
            >
              <Input onPressEnter={() => refButtonEdit.current?.click()} />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyAlias ? (
          <Form form={form}>
            <Form.Item name={formAliasNew} help={false}>
              <Input onPressEnter={() => refButtonEdit.current?.click()} />
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
              <Button
                ref={refButtonEdit}
                onClick={onSubmitEditPkg}
                icon={<CheckOutlined />}
              />
              <Button
                onClick={() => setEditIndex(-1)}
                icon={<CloseOutlined />}
              />
            </Form.Item>
          </Form>
        ) : dataIndex === keyPackage ? (
          children
        ) : dataIndex === keyAlias ? (
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
