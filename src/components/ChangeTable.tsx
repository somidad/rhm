import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { useEffect, useState } from "react";
import { formAfterChange, formAfterChangeNew, formBeforeChange, formBeforeChangeNew, formCustomerIndexList, formDescription, formDescriptionNew, formLineup, formLineupNew, keyActions, keyAfterChange, keyBeforeChange, keyDescription, keyLineup, parenError, parenNone, titleActions, titleAfterChange, titleBeforeChange, titleDescription, titleLineup } from "../constants";
import { ChangeV2, Enum, VersionV2 } from "../types";
import { findEmptyIndex } from "../utils";
const { Option } = Select;

type Props = {
  versionIndex: number;
  versionList: VersionV2[];
  lineupList: Enum[];
  onChange: (changeList: ChangeV2[]) => void;
};

type EditableCellProps = {
  record: {
    key: number;
    descriptoin: string;
    beforeChange: string;
    afterChange: string;
    lineup: number;
  };
  dataIndex: string;
  children: any;
};

export default function ChangeTable({
  versionIndex,
  versionList,
  lineupList,
  onChange,
}: Props) {
  const [form] = useForm();

  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    setEditIndex(-1);
  }, [versionIndex, versionList, lineupList]);

  const versionFound = versionList.find(
    (version) => version.index === versionIndex
  );
  const changeList = versionFound?.changeList ?? [];

  const columns: any[] = [
    {
      key: keyDescription,
      dataIndex: keyDescription,
      title: titleDescription,
      width: "25%",
    },
    {
      key: keyBeforeChange,
      dataIndex: keyBeforeChange,
      title: titleBeforeChange,
      width: "25%",
    },
    {
      key: keyAfterChange,
      dataIndex: keyAfterChange,
      title: titleAfterChange,
      width: "25%",
    },
    { key: keyLineup, dataIndex: keyLineup, title: titleLineup, width: "12.5%" },
    { key: keyActions, dataIndex: keyActions, title: titleActions, width: "12.5%" },
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

  function addChange() {
    form
      .validateFields([formDescription, formBeforeChange, formAfterChange, formLineup])
      .then(() => {
        const {
          description,
          beforeChange,
          afterChange,
          lineup: lineupIndex,
        } = form.getFieldsValue([
          formDescription,
          formBeforeChange,
          formAfterChange,
          formLineup,
        ]);
        const index = findEmptyIndex(changeList.map((change) => change.index));
        const changeListNew: ChangeV2[] = [
          ...changeList,
          { index, description, beforeChange, afterChange, lineupIndex },
        ];
        onChange(changeListNew);
        form.setFieldsValue({
          description: "",
          beforeChange: "",
          afterChange: "",
          lineup: -1,
        });
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function onClickEdit(index: number) {
    const changeFound = changeList.find((change) => change.index === index);
    if (!changeFound) {
      return;
    }
    const {
      description: descriptionNew,
      beforeChange: beforeChangeNew,
      afterChange: afterChangeNew,
      lineupIndex: lineupNew,
    } = changeFound;
    form.setFieldsValue({
      descriptionNew,
      beforeChangeNew,
      afterChangeNew,
      lineupNew,
    });
    setEditIndex(index);
  }

  function onSubmitEditChange() {
    form
      .validateFields([
        formDescriptionNew,
        formBeforeChangeNew,
        formAfterChangeNew,
        formLineupNew,
      ])
      .then(() => {
        const {
          descriptionNew: description,
          beforeChangeNew: beforeChange,
          afterChangeNew: afterChange,
          lineupNew: lineupIndex,
        } = form.getFieldsValue([
          formDescriptionNew,
          formBeforeChangeNew,
          formAfterChangeNew,
          formLineupNew,
        ]);
        const indexFound = changeList.findIndex(
          (change) => change.index === editIndex
        );
        if (indexFound === -1) {
          return;
        }
        const changeListNew: ChangeV2[] = [
          ...changeList.slice(0, indexFound),
          {
            index: editIndex,
            description,
            beforeChange,
            afterChange,
            lineupIndex,
          },
          ...changeList.slice(indexFound + 1),
        ];
        onChange(changeListNew);
        setEditIndex(-1);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function removeChange(index: number) {
    const indexFound = changeList.findIndex((change) => change.index === index);
    const changeListNew = [
      ...changeList.slice(0, indexFound),
      ...changeList.slice(indexFound + 1),
    ];
    onChange(changeListNew);
  }

  const dataSource: any[] = [
    { key: -1 },
    ...changeList.map((change) => {
      const {
        index: key,
        description,
        beforeChange,
        afterChange,
        lineupIndex: lineup,
      } = change;
      return { key, description, beforeChange, afterChange, lineup };
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
      <td {...restProps} style={{ verticalAlign: "top" }}>
        {key === -1 && dataIndex === keyDescription ? (
          <Form form={form}>
            <Form.Item
              name={formCustomerIndexList}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyBeforeChange ? (
          <Form form={form}>
            <Form.Item
              name={formBeforeChange}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyAfterChange ? (
          <Form form={form}>
            <Form.Item
              name={formAfterChange}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
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
          <Form>
            <Form.Item>
              <Button onClick={addChange} disabled={editIndex !== -1}>
                <PlusOutlined />
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyDescription ? (
          <Form form={form}>
            <Form.Item
              name={formDescriptionNew}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyBeforeChange ? (
          <Form form={form}>
            <Form.Item
              name={formBeforeChangeNew}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyAfterChange ? (
          <Form form={form}>
            <Form.Item
              name={formAfterChangeNew}
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
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
          <Form>
            <Form.Item>
              <Button onClick={onSubmitEditChange} icon={<CheckOutlined />} />
              <Button onClick={() => setEditIndex(-1)} icon={<CloseOutlined />} />
            </Form.Item>
          </Form>
        ) : dataIndex === keyDescription ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === keyBeforeChange ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === keyAfterChange ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === keyLineup ? (
          lineupIndex === -1 ? (
            parenNone
          ) : (
            lineupList.find((lineup) => lineup.index === lineupIndex)?.name ??
            parenError
          )
        ) : dataIndex === keyActions ? (
          <Form>
            <Form.Item>
              <Button onClick={() => onClickEdit(key)} icon={<EditOutlined />} />
              <Button onClick={() => removeChange(key)} icon={<DeleteOutlined />} />
            </Form.Item>
          </Form>
        ) : (
          children
        )}
      </td>
    );
  }
}
