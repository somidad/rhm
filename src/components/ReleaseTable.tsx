import { MenuOutlined } from "@ant-design/icons";
import { Button, Form, Select, Table, Tag } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { keyActions, keyCustomers, keyDragHandle, keyPackage, parenError, parenNone, titleActions, titleCustomers, titlePackage } from "../constants";
import { Enum, Pkg, ReleaseV2, VersionV2 } from "../types";
import { findEmptyIndex } from "../utils";
import ChangePerReleaseTable from "./ChangePerReleaseTable";

const { Option } = Select;

type Props ={ 
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  usedPkgIndexList: number[];
  versionList: VersionV2[];
  versionIndex: number;
  onChange: (releaseList: ReleaseV2[]) => void;
}

type EditableCellProps = {
  record: { key: number; package: number; pkgName: string; customers: number[], lineup: string };
  dataIndex: string;
  children: any;
};

export default function ReleaseTable({
  lineupList, pkgList, customerList,
  usedPkgIndexList,
  versionList, versionIndex,
  onChange,
}: Props) {
  const [form] = useForm();

  const [editIndex, setEditIndex] = useState(-1);

  const versionFound = versionList.find((version) => version.index === versionIndex);
  const releaseList = versionFound?.releaseList ?? [];

  const columns: any[] = [
    { key: keyPackage, dataIndex: keyPackage, title: titlePackage },
    { key: keyCustomers, dataIndex: keyCustomers, title: titleCustomers, width: '50%' },
    { key: keyActions, dataIndex: keyActions, title: titleActions },
    { key: keyDragHandle, dataIndex: keyDragHandle, title: '', },
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

  function addRelease() {
    form.validateFields(['pkgIndex', 'customerList']).then(() => {
      const { pkgIndex, customerList: customerIndexList } = form.getFieldsValue(['pkgIndex', 'customerList']);
      if (pkgIndex === -1) {
        return;
      }
      // Check if package is already in use
      const pkgInUse = versionList.find((version) => {
        const { releaseList } = version;
        return releaseList.find((release) => release.pkgIndex === pkgIndex);
      });
      if (pkgInUse) {
        return;
      }
      const index = findEmptyIndex(releaseList.map((release) => release.index));
      const releaseListNew: ReleaseV2[] = [
        ...releaseList,
        { index, pkgIndex, customerIndexList, customerIndexListPerChangeList: [] },
      ];
      onChange(releaseListNew);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function moveNewer(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    if (indexFound === releaseList.length - 1) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      releaseList[indexFound + 1],
      releaseList[indexFound],
      ...releaseList.slice(indexFound + 2),
    ];
    onChange(releaseListNew);
  }

  function moveOlder(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    if (indexFound === 0) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound - 1),
      releaseList[indexFound],
      releaseList[indexFound - 1],
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
  }

  function onClickEdit(index: number) {
    const releaseFound = releaseList.find((release) => release.index === index);
    if (!releaseFound) {
      return;
    }
    const { pkgIndex: pkgIndexNew, customerIndexList: customerIndexListNew } = releaseFound;
    const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndexNew);
    if (!pkgFound) {
      return;
    }
    form.setFieldsValue({ pkgIndexNew, customerIndexListNew });
    setEditIndex(index);
  }

  function onSubmitEditRelease() {
    form.validateFields(['pkgIndexNew', 'customerIndexListNew']).then(() => {
      const { pkgIndexNew, customerIndexListNew } = form.getFieldsValue(['pkgIndexNew', 'customerIndexListNew']);
      const releaseFound = releaseList.find((release) => release.index !== editIndex && release.pkgIndex === pkgIndexNew);
      if (releaseFound) {
        return;
      }
      const indexFound = releaseList.findIndex((release) => release.index === editIndex);
      if (indexFound === -1) {
        return;
      }
      const releaseListNew: ReleaseV2[] = [
        ...releaseList.slice(0, indexFound),
        {
          index: editIndex,
          pkgIndex: pkgIndexNew,
          customerIndexList: customerIndexListNew,
          customerIndexListPerChangeList: [], // FIXME
        },
        ...releaseList.slice(indexFound + 1),
      ];
      onChange(releaseListNew);
      setEditIndex(-1);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function removeRelease(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
  }

  const dataSource = [
    { key: -1 },
    ...releaseList.map((release) => {
      const { index: key, pkgIndex, customerIndexList: customers } = release;
      const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
      const pkgName = pkgFound?.name;
      const lineupIndex = pkgFound?.lineupIndex;
      const lineup = lineupIndex === -1 ? '(None)' : lineupList.find((lineup) => lineup.index === lineupIndex)?.name ?? '(Error)';
      return { key, package: pkgIndex, pkgName, customers, lineup };
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
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.key !== -1,
      }}
      pagination={false}
    />
  )

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    if (!record) {
      return children;
    }
    const { key, pkgName, customers: customerIndexList, lineup } = record;
    return (
      <td {...restProps}>
        {key === -1 && dataIndex === keyPackage ? (
          <Form form={form}>
            <Form.Item
              name="pkgIndex"
              rules={[{ required: true }]}
              help={false}
            >
              <Select disabled={editIndex !== -1}>
                {pkgList.map((pkg) => {
                  const { index, name, lineupIndex } = pkg;
                  const lineup =
                    lineupIndex === -1
                      ? parenNone
                      : lineupList.find(
                          (lineup) => lineup.index === lineupIndex
                        )?.name ?? parenError;
                  return (
                    <Option
                      key={index}
                      value={index}
                      disabled={usedPkgIndexList.includes(index)}
                    >
                      {name} <Tag>{lineup}</Tag>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyCustomers ? (
          <Form form={form}>
            <Form.Item
              name="customerList"
              rules={[{ required: true }]}
              help={false}
            >
              <Select
                mode="multiple"
                allowClear
                filterOption={(input, option) => {
                  if (!option) {
                    return false;
                  }
                  const children = option.children as string;
                  if (!children) {
                    return false;
                  }
                  return (
                    children
                      .toLocaleLowerCase()
                      .indexOf(input.toLocaleLowerCase()) !== -1
                  );
                }}
                disabled={editIndex !== -1}
              >
                {customerList.map((customer) => {
                  const { index, name } = customer;
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
          <Form>
            <Form.Item>
              <Button onClick={addRelease} disabled={editIndex !== -1}>
                Add
              </Button>
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyDragHandle ? null : editIndex ===
            key && dataIndex === keyPackage ? (
          <Form form={form}>
            <Form.Item name="pkgIndexNew">
              <Select>
                {pkgList.map((pkg) => {
                  const { index, name, lineupIndex } = pkg;
                  const lineup =
                    lineupIndex === -1
                      ? parenNone
                      : lineupList.find(
                          (lineup) => lineup.index === lineupIndex
                        )?.name ?? parenError;
                  return (
                    <Option key={index} value={index}>
                      {name} <Tag>{lineup}</Tag>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyCustomers ? (
          <Form form={form}>
            <Form.Item
              name="customerIndexListNew"
              rules={[{ required: true }]}
              help={false}
            >
              <Select
                mode="multiple"
                allowClear
                filterOption={(input, option) => {
                  if (!option) {
                    return false;
                  }
                  const children = option.children as string;
                  if (!children) {
                    return false;
                  }
                  return (
                    children
                      .toLocaleLowerCase()
                      .indexOf(input.toLocaleLowerCase()) !== -1
                  );
                }}
              >
                {customerList.map((customer) => {
                  const { index, name } = customer;
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
              <Button onClick={onSubmitEditRelease}>Ok</Button>
              <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
            </Form.Item>
          </Form>
        ) : dataIndex === keyPackage ? (
          <>
            {pkgName} <Tag>{lineup}</Tag>
          </>
        ) : dataIndex === keyCustomers ? (
          customerIndexList
            .map((customerIndex) => {
              const customerFound = customerList.find(
                (customer) => customer.index === customerIndex
              );
              return (
                customerFound && (
                  <Tag key={customerFound.index}>{customerFound.name}</Tag>
                )
              );
            })
            .filter((customerTag) => !!customerTag)
        ) : dataIndex === keyActions ? (
          <>
            <Button onClick={() => onClickEdit(key)}>Edit</Button>
            <Button onClick={() => removeRelease(key)}>Remove</Button>
          </>
        ) : dataIndex === keyDragHandle ? (
          <MenuOutlined style={{ cursor: "grab" }} />
        ) : (
          children
        )}
      </td>
    );
  }

  function expandedRowRender(record: any) {
    const { key: releaseIndex, package: pkgIndex } = record;
    return (
      <td colSpan={columns.length + 1}>
        <ChangePerReleaseTable
          customerList={customerList}
          lineupList={lineupList}
          pkgIndex={pkgIndex}
          pkgList={pkgList}
          releaseIndex={releaseIndex}
          versionIndex={versionIndex}
          versionList={versionList}
        />
      </td>
    );
  }
}
