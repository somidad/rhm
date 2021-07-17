import { Button, Form, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { useEffect, useState } from "react";
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
      key: "description",
      dataIndex: "description",
      title: "Description",
      width: "25%",
    },
    {
      key: "beforeChange",
      dataIndex: "beforeChange",
      title: "Before change",
      width: "25%",
    },
    {
      key: "afterChange",
      dataIndex: "afterChange",
      title: "After change",
      width: "25%",
    },
    { key: "lineup", dataIndex: "lineup", title: "Lineup", width: "12.5%" },
    { key: "actions", dataIndex: "actions", title: "Actions", width: "12.5%" },
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
      .validateFields(["description", "beforeChange", "afterChange", "lineup"])
      .then(() => {
        const {
          description,
          beforeChange,
          afterChange,
          lineup: lineupIndex,
        } = form.getFieldsValue([
          "description",
          "beforeChange",
          "afterChange",
          "lineup",
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
        "descriptionNew",
        "beforeChangeNew",
        "afterChangeNew",
        "lineupNew",
      ])
      .then(() => {
        const {
          descriptionNew: description,
          beforeChangeNew: beforeChange,
          afterChangeNew: afterChange,
          lineupNew: lineupIndex,
        } = form.getFieldsValue([
          "descriptionNew",
          "beforeChangeNew",
          "afterChangeNew",
          "lineupNew",
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
    />
  );

  function EditableCell({
    record,
    dataIndex,
    children,
    ...restProps
  }: EditableCellProps) {
    const { key, lineup: lineupIndex } = record;
    console.log(children);
    return (
      <td {...restProps} style={{ verticalAlign: "top" }}>
        {key === -1 && dataIndex === "description" ? (
          <Form form={form}>
            <Form.Item
              name="description"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === "beforeChange" ? (
          <Form form={form}>
            <Form.Item
              name="beforeChange"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === "afterChange" ? (
          <Form form={form}>
            <Form.Item
              name="afterChange"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === "lineup" ? (
          <Form form={form}>
            <Form.Item name="lineup" initialValue={-1}>
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
        ) : key === -1 && dataIndex === "actions" ? (
          <Form>
            <Form.Item>
              <Button onClick={addChange} disabled={editIndex !== -1}>
                Add
              </Button>
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === "description" ? (
          <Form form={form}>
            <Form.Item
              name="descriptionNew"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === "beforeChange" ? (
          <Form form={form}>
            <Form.Item
              name="beforeChangeNew"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === "afterChange" ? (
          <Form form={form}>
            <Form.Item
              name="afterChangeNew"
              rules={[{ required: true }]}
              help={false}
            >
              <TextArea autoSize />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === "lineup" ? (
          <Form form={form}>
            <Form.Item name="lineupNew">
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
        ) : editIndex === key && dataIndex === "actions" ? (
          <Form>
            <Form.Item>
              <Button onClick={onSubmitEditChange}>Ok</Button>
              <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
            </Form.Item>
          </Form>
        ) : dataIndex === "description" ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === "beforeChange" ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === "afterChange" ? (
          <TextArea value={children[1]} autoSize style={{ border: "none " }} />
        ) : dataIndex === "lineup" ? (
          lineupIndex === -1 ? (
            "(None)"
          ) : (
            lineupList.find((lineup) => lineup.index === lineupIndex)?.name ??
            "(Error)"
          )
        ) : dataIndex === "actions" ? (
          <Form>
            <Form.Item>
              <Button onClick={() => onClickEdit(key)}>Edit</Button>
              <Button onClick={() => removeChange(key)}>Remove</Button>
            </Form.Item>
          </Form>
        ) : (
          children
        )}
      </td>
    );
  }
}
