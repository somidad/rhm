import { Button, Checkbox, Form, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { Enum, Pkg, ReleaseV2, VersionV2 } from "../types";
import { findEmptyIndex } from "../utils";

const { Option } = Select;

type Props ={ 
  releaseList: ReleaseV2[];
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  onChange: (releaseList: ReleaseV2[]) => void;
}

type EditableCellProps = {
  record: { key: number; version: string; previous: number; package: Pkg[]; };
  dataIndex: string;
  children: any;
};

const PACKAGE = 'Package';
const CUSTOMERS = 'Customers';
const ACTIONS = 'Actions';

export default function ReleaseTable({
  releaseList, lineupList, pkgList, customerList,
  onChange,
}: Props) {
  const [form] = useForm();

  const [editIndex, setEditIndex] = useState(-1);
  const [pkgIndexNew, setPkgIndexNew] = useState(-1);
  const [customerIndexListNew, setCustomerIndexListNew] = useState<number[]>([]);

  const columns: any[] = [
    { key: PACKAGE.toLocaleLowerCase(), dataIndex: PACKAGE.toLocaleLowerCase(), title: PACKAGE, width: '25%' },
    { key: CUSTOMERS.toLocaleLowerCase(), dataIndex: CUSTOMERS.toLocaleLowerCase(), title: CUSTOMERS, width: '50%' },
    { key: ACTIONS.toLocaleLowerCase(), dataIndex: ACTIONS.toLocaleLowerCase(), title: ACTIONS, width: '25%' },
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
    form.validateFields(['pkgIndex']).then(() => {
      const { pkgIndex, customerList } = form.getFieldsValue(['pkgIndex', 'customerList']);
      const customerIndexList = customerList ?? [];
      console.log(pkgIndex, customerIndexList);
      if (pkgIndex === -1) {
        return;
      }
      const releaseFound = releaseList.find((release) => release.pkgIndex === pkgIndex);
      if (releaseFound) {
        return;
      }
      const index = findEmptyIndex(releaseList.map((release) => release.index));
      const releaseListNew: ReleaseV2[] = [
        ...releaseList,
        { index, pkgIndex, customerIndexList, changeIndexListWithCustomerIndexList: [] },
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
    const { pkgIndex, customerIndexList } = releaseFound;
    const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
    if (!pkgFound) {
      return;
    }
    setPkgIndexNew(pkgIndex);
    setCustomerIndexListNew(customerIndexList);
    setEditIndex(index);
  }

  function onSubmitEditRelease() {
    if (!customerIndexListNew.length) {
      return;
    }
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
        changeIndexListWithCustomerIndexList: [], // FIXME
      },
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
    setEditIndex(-1);
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
      return { key, package: pkgIndex, customers };
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
  )

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    const { key } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === PACKAGE.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item
                name='pkgIndex'
              >
                <Select>
                  {
                    pkgList.map((pkg) => {
                      const { index, name, lineupIndex } = pkg;
                      const lineup =
                        lineupIndex === -1
                          ? "(None)"
                          : lineupList.find(
                              (lineup) => lineup.index === lineupIndex
                            )?.name ?? "(Error)";
                      return (
                        <Option key={index} value={index}>{`${name} - ${lineup}`}</Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === CUSTOMERS.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item
                name='customerList'
              >
                <Checkbox.Group
                  options={customerList.map((customer) => {
                    const { index: value, name: label } = customer;
                    return { value, label };
                  })}
                  disabled={editIndex !== -1}
                >
                </Checkbox.Group>
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <Form>
              <Form.Item>
                <Button onClick={addRelease}>Add</Button>
              </Form.Item>
            </Form>
          ) : dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <>
              <Button>Edit</Button>
              <Button onClick={() => removeRelease(key)}>Remove</Button>
            </>
          ) : (
            children
          )
        }
      </td>
    )
  }
}
