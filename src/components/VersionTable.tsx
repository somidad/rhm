import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import Link from "antd/lib/typography/Link";
import { uniq } from "lodash";
import { useState } from "react";
import { formNameNew, formPrevious, formPreviousNew, formVersion, keyActions, keyPrevious, keyVersion, parenError, parenNone, titleActions, titlePrevious, titleVersion } from "../constants";
import { VersionV2 } from "../types";
import { findEmptyIndex } from "../utils";

const { Option } = Select;

type Props = {
  versionList: VersionV2[];
  onChange: (versionList: VersionV2[]) => void;
  onPublish: (key: number) => void;
  onSelect: (index: number) => void;
};

type EditableCellPros = {
  record: { key: number; version: string; previous: number };
  dataIndex: string;
  children: any;
};

export default function VersionTable({
  versionList,
  onChange,
  onPublish,
  onSelect,
}: Props) {
  const [form] = useForm();
  const [editIndex, setEditIndex] = useState(-1);

  const columns: any[] = [
    { key: keyVersion, dataIndex: keyVersion, title: titleVersion },
    { key: keyPrevious, dataIndex: keyPrevious, title: titlePrevious },
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

  function addVersion() {
    form
      .validateFields([formVersion])
      .then(() => {
        const { version: name, previous: indexPrev } = form.getFieldsValue([
          formVersion,
          formPrevious,
        ]);
        const versionFound = versionList.find(
          (version) => version.name === name
        );
        if (versionFound) {
          return;
        }
        const index = findEmptyIndex(
          versionList.map((version) => version.index)
        );
        const versionListNew: VersionV2[] = [
          ...versionList,
          { index, name, indexPrev, changeList: [], releaseList: [] },
        ];
        form.setFieldsValue({ version: "" });
        onChange(versionListNew);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function onClickEdit(key: number) {
    const versionFound = versionList.find((version) => version.index === key);
    if (!versionFound) {
      return;
    }
    const { name: nameNew, indexPrev: previousNew } = versionFound;
    form.setFieldsValue({ nameNew, previousNew });
    setEditIndex(key);
  }

  function onClickPublish(key: number) {
    onPublish(key);
  }

  function onSubmitEditVersion() {
    form
      .validateFields([formNameNew])
      .then(() => {
        const { nameNew: name, previousNew: indexPrev } = form.getFieldsValue([
          formNameNew,
          formPreviousNew,
        ]);
        const nameInUse = versionList.find(
          (version) => version.index !== editIndex && version.name === name
        );
        if (nameInUse) {
          return;
        }
        const indexFound = versionList.findIndex(
          (version) => version.index === editIndex
        );
        if (indexFound === -1) {
          return;
        }
        const version = versionList[indexFound];
        const { changeList, releaseList } = version;
        const versionListNew: VersionV2[] = [
          ...versionList.slice(0, indexFound),
          { index: editIndex, name, indexPrev, changeList, releaseList },
          ...versionList.slice(indexFound + 1),
        ];
        onChange(versionListNew);
        setEditIndex(-1);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function removeVersion(index: number) {
    const versionFound = versionList.find(
      (version) => version.indexPrev === index
    );
    if (versionFound) {
      return;
    }
    const indexFound = versionList.findIndex(
      (version) => version.index === index
    );
    if (indexFound === -1) {
      return;
    }
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      ...versionList.slice(indexFound + 1, 0),
    ];
    onChange(versionListNew);
  }

  const usedVersionIndexList = uniq(
    versionList
      .filter((version) => {
        const { index } = version;
        return !!versionList.find((version) => version.indexPrev === index);
      })
      .map((version) => version.index)
  );

  const dataSource = [
    { key: -1 },
    ...versionList.map((version) => {
      const { index, name, indexPrev } = version;
      return { key: index, version: name, previous: indexPrev };
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
  }: EditableCellPros) {
    const { key, previous: indexPrev } = record;
    return (
      <td {...restProps}>
        {key === -1 && dataIndex === keyVersion ? (
          <Form form={form}>
            <Form.Item name={formVersion} rules={[{ required: true }]} help={false}>
              <Input disabled={editIndex !== -1} />
            </Form.Item>
          </Form>
        ) : key === -1 && dataIndex === keyPrevious ? (
          <Form form={form}>
            <Form.Item name={formPrevious} initialValue={-1}>
              <Select disabled={editIndex !== -1}>
                <Option key={-1} value={-1}>
                  {parenNone}
                </Option>
                {versionList.map((version) => {
                  const { index, name } = version;
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
              <Button onClick={addVersion} disabled={editIndex !== -1} icon={<PlusOutlined />} />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyVersion ? (
          <Form form={form}>
            <Form.Item name={formNameNew} rules={[{ required: true }]} help={false}>
              <Input />
            </Form.Item>
          </Form>
        ) : editIndex === key && dataIndex === keyPrevious ? (
          <Form form={form}>
            <Form.Item name={formPreviousNew}>
              <Select>
                <Option key={-1} value={-1}>
                  {parenNone}
                </Option>
                {versionList.map((version) => {
                  const { index, name } = version;
                  return (
                    <Option key={index} value={index} disabled={index === key}>
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
              <Button onClick={onSubmitEditVersion} icon={<CheckOutlined />} />
              <Button onClick={() => setEditIndex(-1)} icon={<CloseOutlined />} />
            </Form.Item>
          </Form>
        ) : dataIndex === keyVersion ? (
          <Link onClick={() => onSelect(key)}>{children}</Link>
        ) : dataIndex === keyPrevious ? (
          indexPrev === -1 ? (
            parenNone
          ) : (
            versionList.find((version) => version.index === indexPrev)?.name ??
            parenError
          )
        ) : dataIndex === keyActions ? (
          <>
            <Button onClick={() => onClickEdit(key)} icon={<EditOutlined />} />
            <Button
              onClick={() => removeVersion(key)}
              disabled={usedVersionIndexList.includes(key)}
              icon={<DeleteOutlined />}
            />
            <Button onClick={() => onClickPublish(key)} icon={<ExportOutlined />} />
          </>
        ) : (
          children
        )}
      </td>
    );
  }
}
