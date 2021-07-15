import { Button, Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
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
  record: { key: number, name: string; lineup: number; };
  dataIndex: string;
  children: any;
}

const PACKAGE = 'Package';
const LINEUP = 'Lineup';
const ACTIONS = 'Actions';

export default function PkgTable({ pkgList, lineupList, onChange, usedPkgIndexList }: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    setEditIndex(-1);
  }, [lineupList]);

  const columns: any[] = [
    { key: PACKAGE.toLocaleLowerCase(), dataIndex: PACKAGE.toLocaleLowerCase(), title: PACKAGE },
    { key: LINEUP.toLocaleLowerCase(), dataIndex: LINEUP.toLocaleLowerCase(), title: LINEUP },
    { key: ACTIONS.toLocaleLowerCase(), dataIndex: ACTIONS.toLocaleLowerCase(), title: ACTIONS },
  ].map((column) => {
    const { dataIndex } = column;
    return {
      ...column,
      onCell: (record: any) => ({
        record,
        dataIndex,
      }),
    }
  });

  function addPkg() {
    form.validateFields(['name', 'lineup']).then(() => {
      const { name, lineup: lineupIndex } = form.getFieldsValue(['name', 'lineup']);
      const pkgFound = pkgList.find((pkg) => pkg.name === name);
      if (pkgFound) {
        return;
      }
      const index = findEmptyIndex(pkgList.map((pkg) => pkg.index));
      const pkgListNew = [
        ...pkgList,
        { index, name, lineupIndex },
      ].sort((a, b) => a.name.localeCompare(b.name));
      onChange(pkgListNew);
      form.setFieldsValue({
        name: '',
        lineup: -1,
      });
    }).catch((reason) => {
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
    form.validateFields(['nameNew']).then(() => {
      const { nameNew, lineupNew: lineupIndexNew } = form.getFieldsValue(['nameNew', 'lineupNew']);
      const pkgFound = pkgList.find((pkg) => pkg.index !== editIndex && pkg.name === nameNew);
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
    }).catch((reason) => {
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
    { key: -1, package: '', actions: '' },
    ...pkgList.map((pkg) => {
      const { index: key, name, lineupIndex: lineup } = pkg;
      return { key, package: name, lineup, actions: '' };
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

  function EditableCell({record, dataIndex, children, ...restProps}: EditableCellProps) {
    const { key, lineup: lineupIndex } = record;
    return (
      <td {...restProps}>
        {key === -1 && dataIndex === PACKAGE.toLocaleLowerCase() ? (
          <Form form={form} onFinish={addPkg}>
            <Form.Item name="name" rules={[{ required: true }]} help={false}>
              <Input disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === LINEUP.toLocaleLowerCase() ? (
          <Form form={form}>
            <Form.Item
              name="lineup"
              initialValue={-1}
            >
              <Select disabled={editIndex !== -1}>
                <Option key={-1} value={-1}>
                  (None)
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
        ) : key === -1 && dataIndex === ACTIONS.toLocaleLowerCase() ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={addPkg} disabled={editIndex !== -1}>
                Add
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === PACKAGE.toLocaleLowerCase() ? (
          <Form form={form}>
            <Form.Item
              name='nameNew'
              rules={[{ required: true }]}
              help={false}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === LINEUP.toLocaleLowerCase() ? (
          <Form form={form}>
            <Form.Item
              name='lineupNew'
            >
              <Select>
                <Option key={-1} value={-1}>
                  (None)
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
        ) : editIndex === key && dataIndex === ACTIONS.toLocaleLowerCase() ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={onSubmitEditPkg}>Ok</Button>
              <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
            </Form.Item>
          </Form>
        ) : dataIndex === PACKAGE.toLocaleLowerCase() ? (
          children
        ) : dataIndex === LINEUP.toLocaleLowerCase() ? (
          lineupIndex === -1 ? (
            "(None)"
          ) : (
            lineupList.find((lineup) => lineup.index === lineupIndex)?.name ??
            "(Error)"
          )
        ) : dataIndex === ACTIONS.toLocaleLowerCase() ? (
          <>
            <Button onClick={() => onClickEdit(key)}>Edit</Button>
            <Button
              onClick={() => removePkg(key)}
              disabled={usedPkgIndexList?.includes(key)}
            >Remove</Button>
          </>
        ) : null}
      </td>
    );
  }
}
