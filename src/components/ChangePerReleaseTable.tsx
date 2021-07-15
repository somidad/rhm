import { Button, Form, Popover, Select, Table, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { keyActions, keyCustomers, keyDescription, keyVersion, parenError, titleActions, titleCustomers, titleDescription, titleVersion } from "../constants";
import { ChangeV2, CustomerIndexListPerChangeIndex, Enum, Pkg, ReleaseV2, VersionV2 } from "../types";
import { accumulateVersionIndex } from "../utils";
const { Option } = Select;
const { Text } = Typography;

type ChangePerReleaseTableProps = {
  changeList: ChangeV2[];
  customerList: Enum[];
  lineupList: Enum[];
  pkgIndex: number;
  pkgList: Pkg[];
  releaseIndex: number;
  releaseList: ReleaseV2[];
  versionIndex: number;
  versionList: VersionV2[];
};

type EditableCellProps = {
  record: {
    key: number;
    description: string;
    beforeChange: string;
    afterChange: string;
    version: number;
  };
  dataIndex: string;
  children: any;
};

type PopoverContentProps = {
  beforeChange: string;
  afterChange: string;
};

export default function ChangePerReleaseTable({
  changeList,
  customerList,
  lineupList,
  pkgIndex,
  pkgList,
  releaseIndex,
  releaseList,
  versionIndex,
  versionList,
}: ChangePerReleaseTableProps) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  const columns: any[] = [
    { key: keyVersion, dataIndex: keyVersion, title: titleVersion },
    { key: keyDescription, dataIndex: keyDescription, title: titleDescription },
    { key: keyCustomers, dataIndex: keyCustomers, title: titleCustomers },
    { key: keyActions, dataIndex: keyActions, title: titleActions },
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

  function onClickEdit(index: number) {
    // TODO
    setEditIndex(index);
  }

  const versionIndexList = accumulateVersionIndex(versionList, versionIndex);
  const customerIndexListPerChangeIndexList = releaseList.filter((release) => {
    return versionIndexList.slice(1).findIndex((versionIndex) => release.versionIndex === versionIndex ) !== -1;
  }).reduce((customerIndexListPerChangeIndexListPrev: CustomerIndexListPerChangeIndex[], release) => {
    return [...customerIndexListPerChangeIndexListPrev, ...release.customerIndexListPerChangeIndexList];
  }, []);
  const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
  const changeListFiltered = versionIndexList.reduce((changeListPrev: ChangeV2[], versionIndex) => {
    const changeListCurr = changeList.filter((change) => {
      return change.versionIndex === versionIndex && change.lineupIndex === pkgFound?.lineupIndex;
    });
    return [...changeListPrev, ...changeListCurr];
  }, []);
  const dataSource = [
    ...changeListFiltered.map((change) => {
      const { index: key, description, beforeChange, afterChange, versionIndex } = change;
      return {
        key, description, beforeChange, afterChange, version: versionIndex,
      };
    }),
  ];

  const releaseFound = releaseList.find((release) => release.index === releaseIndex);
  const customerIndexListPerRelease = releaseFound?.customerIndexList ?? [];
  const customerListPerRelease = customerList.filter((customer) => {
    return customerIndexListPerRelease.includes(customer.index);
  });
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

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    // FIXME: No idea why the following check is required to render 'No Data'
    if (!record) {
      return (
        <td colSpan={columns.length} {...restProps}>
          {children}
        </td>
      );
    }
    const { key, beforeChange, afterChange, version: versionIndex } = record;
    const versionFound = versionList.find((version) => version.index === versionIndex);
    return (
      <td {...restProps}>
        {
          editIndex === key && dataIndex === keyCustomers ? (
            <Form form={form}>
              <Form.Item
                name='customerIndexList'
              >
                <Select
                  mode='multiple'
                  allowClear
                  filterOption={(input, option) => {
                    if (!option) { return false; }
                    const children = option.children as string;
                    if (!children) { return false; }
                    return children.toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                >
                  {
                    customerListPerRelease.map((customer) => {
                      const { index, name } = customer;
                      return (
                        <Option key={index} value={index}>{name}</Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          ) : editIndex === key && dataIndex === keyActions ? (
            <Form form={form}>
              <Form.Item>
                <Button>Ok</Button>
                <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
              </Form.Item>
            </Form>
          ) : dataIndex === keyVersion ? (
            versionFound?.name ?? parenError
          ) : dataIndex === keyDescription ? (
            <Popover content={() => <PopoverContent beforeChange={beforeChange} afterChange={afterChange} />}>
              {children}
            </Popover>
          ) : dataIndex === keyActions ? (
            <Button onClick={() => onClickEdit(key)}>Edit</Button>
          ) : (
            children
          )
        }
      </td>
    )
  }

  function PopoverContent({ beforeChange, afterChange }: PopoverContentProps) {
    return (
      <>
        <Text strong>Before change</Text>
        <br />
        {beforeChange}
        <br />
        <Text strong>After change</Text>
        <br />
        {afterChange}
      </>
    )
  }
}