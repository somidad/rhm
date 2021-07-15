import { Button, Form, Popover, Select, Table, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";
import { keyActions, keyCustomers, keyDescription, keyVersion, parenError, titleActions, titleCustomers, titleDescription, titleVersion } from "../constants";
import { ChangeV2, Enum, Pkg, VersionV2 } from "../types";
import { accumulateVersionIndex } from "../utils";
const { Option } = Select;
const { Text } = Typography;

type ChangePerReleaseTableProps = {
  customerList: Enum[];
  lineupList: Enum[];
  pkgIndex: number;
  pkgList: Pkg[];
  releaseIndex: number;
  versionIndex: number;
  versionList: VersionV2[];
};

type EditableCellProps = {
  record: {
    changeIndex: number;
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
  customerList,
  lineupList,
  pkgIndex,
  pkgList,
  releaseIndex,
  versionIndex,
  versionList,
}: ChangePerReleaseTableProps) {
  const [form] = useForm();
  const [editVersionIndex, setEditVersionIndex]= useState(-1);
  const [editChangeIndex, setEditChangeIndex] = useState(-1);

  const versionFound = versionList.find((version) => version.index === versionIndex);
  const releaseList = versionFound?.releaseList ?? [];

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

  function onClickEdit(versionIndex: number, changeIndex: number) {
    // TODO
    setEditVersionIndex(versionIndex);
    setEditChangeIndex(changeIndex);
  }

  function onSubmitChange(versionIndex: number, changeIndex: number) {
    
  }

  /**
   * versionIndexList[0]: Current version
   * versionIndexList[n]: Previous version of versionIndexList[n-1]
   */
  const versionIndexList = accumulateVersionIndex(versionList, versionIndex);
  const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
  const changeListFiltered = versionIndexList.reduce(
    (changeListPrev: (ChangeV2 & { versionIndex: number })[], versionIndex) => {
      const versionFound = versionList.find((version) => version.index === versionIndex);
      if (!versionFound) {
        return changeListPrev;
      }
      const { changeList } = versionFound;
      const changeListCurr = changeList.filter((change) => {
        return change.lineupIndex === pkgFound?.lineupIndex;
      });
      return [
        ...changeListPrev,
        ...changeListCurr.map((change) => {
          return { versionIndex, ...change };
        }),
      ];
    },
    []
  );
  const dataSource = [
    ...changeListFiltered.map((change) => {
      const {
        index: changeIndex,
        description,
        beforeChange,
        afterChange,
        versionIndex,
      } = change;
      return {
        changeIndex,
        description,
        beforeChange,
        afterChange,
        version: versionIndex,
      };
    }),
  ];

  const releaseFound = releaseList.find(
    (release) => release.index === releaseIndex
  );
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

  function EditableCell({
    record,
    dataIndex,
    children,
    ...restProps
  }: EditableCellProps) {
    // FIXME: No idea why the following check is required to render 'No Data'
    if (!record) {
      return (
        <td colSpan={columns.length} {...restProps}>
          {children}
        </td>
      );
    }
    const { changeIndex, beforeChange, afterChange, version: versionIndex } = record;
    const versionFound = versionList.find(
      (version) => version.index === versionIndex
    );
    return (
      <td {...restProps}>
        {editVersionIndex === versionIndex && editChangeIndex === changeIndex && dataIndex === keyCustomers ? (
          <Form form={form}>
            <Form.Item name="customerIndexList">
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
                <Option key={-1} value={-1}>(Global)</Option>
                {customerListPerRelease.map((customer) => {
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
        ) : editVersionIndex === versionIndex && editChangeIndex === changeIndex && dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={() => onSubmitChange(versionIndex, changeIndex)}>Ok</Button>
              <Button onClick={() => onClickEdit(-1, -1)}>Cancel</Button>
            </Form.Item>
          </Form>
        ) : dataIndex === keyVersion ? (
          versionFound?.name ?? parenError
        ) : dataIndex === keyDescription ? (
          <Popover
            content={() => (
              <PopoverContent
                beforeChange={beforeChange}
                afterChange={afterChange}
              />
            )}
          >
            {children}
          </Popover>
        ) : dataIndex === keyCustomers ? (
          /**TODO
           * Render previous customers in grey
           * Render current customers in blue
           */
          null
        ) : dataIndex === keyActions ? (
          <Button onClick={() => onClickEdit(versionIndex, changeIndex)}>Edit</Button>
        ) : (
          children
        )}
      </td>
    );
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
    );
  }
}