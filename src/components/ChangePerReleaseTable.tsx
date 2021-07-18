import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Popover, Select, Table, Tag, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { useEffect, useState } from "react";
import {
  formCustomerIndexList,
  keyActions,
  keyCustomers,
  keyDescription,
  keyVersion,
  parenError,
  parenGlobal,
  titleActions,
  titleCustomers,
  titleDescription,
  titleVersion,
} from "../constants";
import {
  ChangeV2,
  CustomerIndexListPerChange,
  Enum,
  Pkg,
  VersionV2,
} from "../types";
import { accumulateVersionIndex } from "../utils";
const { Option } = Select;
const { Text } = Typography;

type ChangePerReleaseTableProps = {
  customerList: Enum[];
  pkgList: Pkg[];
  releaseIndex: number;
  versionIndex: number;
  versionList: VersionV2[];
  onChange: (
    customerIndexListPerChangeList: CustomerIndexListPerChange[]
  ) => void;
};

type EditableCellProps = {
  record: {
    changeIndex: number;
    description: string;
    beforeChange: string;
    afterChange: string;
    version: number;
    customerIndexList: number[];
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
  pkgList,
  releaseIndex,
  versionIndex,
  versionList,
  onChange,
}: ChangePerReleaseTableProps) {
  const [form] = useForm();
  const [editVersionIndex, setEditVersionIndex] = useState(-1);
  const [editChangeIndex, setEditChangeIndex] = useState(-1);

  useEffect(() => {
    setEditVersionIndex(-1);
    setEditChangeIndex(-1);
  }, [customerList, pkgList, releaseIndex, versionIndex, versionList]);

  const versionFound = versionList.find(
    (version) => version.index === versionIndex
  );
  const releaseList = versionFound?.releaseList ?? [];
  const releaseFound = releaseList.find(
    (release) => release.index === releaseIndex
  );
  const customerIndexListPerChangeList =
    releaseFound?.customerIndexListPerChangeList ?? [];
  const pkgIndex = releaseFound?.pkgIndex ?? undefined;

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

  function onCancelEdit() {
    setEditVersionIndex(-1);
    setEditChangeIndex(-1);
  }

  function onClickEdit(versionIndex: number, changeIndex: number) {
    const customerIndexListPerChangeFound = customerIndexListPerChangeList.find(
      (item) => {
        return (
          item.versionIndex === versionIndex && item.changeIndex === changeIndex
        );
      }
    );
    if (customerIndexListPerChangeFound) {
      const { customerIndexList } = customerIndexListPerChangeFound;
      form.setFieldsValue({ customerIndexList });
    }
    setEditVersionIndex(versionIndex);
    setEditChangeIndex(changeIndex);
  }

  function onSubmitChange(versionIndexOfChange: number, changeIndex: number) {
    form
      .validateFields([formCustomerIndexList])
      .then(() => {
        const versionOfChangeFound = versionList.find(
          (version) => version.index === versionIndexOfChange
        );
        if (!versionOfChangeFound) {
          return;
        }
        const { changeList } = versionOfChangeFound;
        const changeFound = changeList.find(
          (change) => change.index === changeIndex
        );
        if (!changeFound) {
          return;
        }
        if (!releaseFound) {
          return;
        }
        const customerIndexListRaw = form.getFieldValue(formCustomerIndexList);
        const customerIndexList = customerIndexListRaw.includes(-1)
          ? [-1]
          : customerIndexListRaw;
        const { customerIndexListPerChangeList } = releaseFound;
        const indexFound = customerIndexListPerChangeList.findIndex((item) => {
          return (
            item.versionIndex === versionIndexOfChange &&
            item.changeIndex === changeIndex
          );
        });
        const customerIndexListPerChangeListNew =
          indexFound === -1
            ? [
                ...customerIndexListPerChangeList,
                {
                  versionIndex: versionIndexOfChange,
                  changeIndex,
                  customerIndexList,
                },
              ]
            : [
                ...customerIndexListPerChangeList.slice(0, indexFound),
                {
                  versionIndex: versionIndexOfChange,
                  changeIndex,
                  customerIndexList,
                },
                ...customerIndexListPerChangeList.slice(indexFound + 1),
              ];
        onChange(customerIndexListPerChangeListNew);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  /**
   * versionIndexList[0]: Current version
   * versionIndexList[n]: Previous version of versionIndexList[n-1]
   */
  const versionIndexList = accumulateVersionIndex(versionList, versionIndex);
  const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
  const changeListFiltered = versionIndexList.reduce(
    (changeListPrev: (ChangeV2 & { versionIndex: number })[], versionIndex) => {
      const versionFound = versionList.find(
        (version) => version.index === versionIndex
      );
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
        versionIndex: versionIndexOfChange,
      } = change;
      const customerIndexList =
        customerIndexListPerChangeList.find((item) => {
          return (
            item.versionIndex === versionIndexOfChange &&
            item.changeIndex === changeIndex
          );
        })?.customerIndexList ?? [];
      return {
        changeIndex,
        description,
        beforeChange,
        afterChange,
        version: versionIndexOfChange,
        customerIndexList,
      };
    }),
  ];

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
    const {
      changeIndex,
      beforeChange,
      afterChange,
      version: versionIndexOfChange,
      customerIndexList,
    } = record;
    const versionFound = versionList.find((version) => version.index === versionIndexOfChange);
    const style = versionIndexOfChange === versionIndex ? { backgroundColor: '#1890ff0f' } : {};
    (restProps as any).style = Object.assign({}, (restProps as any).style, style);
    return (
      <td {...restProps}>
        {editVersionIndex === versionIndexOfChange &&
        editChangeIndex === changeIndex &&
        dataIndex === keyCustomers ? (
          <Form form={form}>
            <Form.Item
              name={formCustomerIndexList}
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
                <Option key={-1} value={-1}>
                  {parenGlobal}
                </Option>
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
        ) : editVersionIndex === versionIndexOfChange &&
          editChangeIndex === changeIndex &&
          dataIndex === keyActions ? (
          <Form form={form}>
            <Form.Item>
              <Button onClick={() => onSubmitChange(versionIndexOfChange, changeIndex)} icon={<CheckOutlined />} />
              <Button onClick={onCancelEdit} icon={<CloseOutlined />} />
            </Form.Item>
          </Form>
        ) : dataIndex === keyVersion ? (
          // <span style={style}>
            versionFound?.name ?? parenError
          // </span>
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
          customerIndexList.map((customerIndex) => {
            const customerFound =
              customerIndex === -1
                ? { name: parenGlobal }
                : customerList.find(
                    (customer) => customer.index === customerIndex
                  );
            return (
              <Tag key={customerIndex}>{customerFound?.name ?? parenError}</Tag>
            );
          })
        ) : dataIndex === keyActions ? (
          <Button onClick={() => onClickEdit(versionIndexOfChange, changeIndex)} icon={<EditOutlined />} />
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
        <TextArea value={beforeChange} cols={80} autoSize />
        <br />
        <Text strong>After change</Text>
        <br />
        <TextArea value={afterChange} cols={80} autoSize />
      </>
    );
  }
}
