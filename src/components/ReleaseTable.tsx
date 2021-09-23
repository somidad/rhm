import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, MenuOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { Button, Form, Select, Table, Tag } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import {
  invalidSortable,
  keyActions,
  keyCustomers,
  keyDragHandle,
  keyPackage,
  parenError,
  parenNone,
  titleActions,
  titleCustomers,
  titlePackage,
} from "../constants";
import {
  CustomerIndexListPerChange,
  Enum,
  Pkg,
  ReleaseV2,
  VersionV2,
} from "../types";
import { findEmptyIndex } from "../utils";
import ChangePerReleaseTable from "./ChangePerReleaseTable";

const { Option } = Select;

type Props = {
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  usedPkgIndexList: number[];
  versionList: VersionV2[];
  versionIndex: number;
  onChange: (releaseList: ReleaseV2[]) => void;
};

type EditableCellProps = {
  record: {
    key: number;
    package: number;
    pkgName: string;
    customers: number[];
    lineup: string;
  };
  dataIndex: string;
  children: any;
};

export default function ReleaseTable({
  lineupList,
  pkgList,
  customerList,
  usedPkgIndexList,
  versionList,
  versionIndex,
  onChange,
}: Props) {
  const [form] = useForm();

  const [editIndex, setEditIndex] = useState(-1);
  // ID to render overlay.
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);
  }

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== "-1" && over.id !== "-1" && active.id !== over.id) {
      const oldIndex = releaseList.findIndex(
        (release) => release.index.toString() === active.id
      );
      const newIndex = releaseList.findIndex(
        (release) => release.index.toString() === over.id
      );
      const releaseListNew = arrayMove(releaseList, oldIndex, newIndex);
      onChange(releaseListNew);
    }
    // Stop overlay.
    setActiveId(null);
  }

  useEffect(() => {
    setEditIndex(-1);
  }, [lineupList, pkgList, customerList, versionList, versionIndex]);

  const versionFound = versionList.find(
    (version) => version.index === versionIndex
  );
  const releaseList = versionFound?.releaseList ?? [];

  const columns: any[] = [
    { key: keyPackage, dataIndex: keyPackage, title: titlePackage },
    {
      key: keyCustomers,
      dataIndex: keyCustomers,
      title: titleCustomers,
      width: "50%",
    },
    { key: keyActions, dataIndex: keyActions, title: titleActions },
    { key: keyDragHandle, dataIndex: keyDragHandle, title: "" },
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

  function addRelease() {
    form
      .validateFields(["pkgIndex", "customerList"])
      .then(() => {
        const { pkgIndex, customerList: customerIndexList } =
          form.getFieldsValue(["pkgIndex", "customerList"]);
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
        const index = findEmptyIndex(
          releaseList.map((release) => release.index)
        );
        const releaseListNew: ReleaseV2[] = [
          ...releaseList,
          {
            index,
            pkgIndex,
            customerIndexList,
            customerIndexListPerChangeList: [],
          },
        ];
        onChange(releaseListNew);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function onChangeCustomerIndexListPerChangeList(
    releaseIndex: number,
    customerIndexListPerChangeList: CustomerIndexListPerChange[]
  ) {
    const indexFound = releaseList.findIndex(
      (release) => release.index === releaseIndex
    );
    if (indexFound === -1) {
      return;
    }
    const release = releaseList[indexFound];
    const { index, pkgIndex, customerIndexList } = release;
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      { index, pkgIndex, customerIndexList, customerIndexListPerChangeList },
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
  }

  function onClickEdit(index: number) {
    const releaseFound = releaseList.find((release) => release.index === index);
    if (!releaseFound) {
      return;
    }
    const { pkgIndex: pkgIndexNew, customerIndexList: customerIndexListNew } =
      releaseFound;
    const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndexNew);
    if (!pkgFound) {
      return;
    }
    form.setFieldsValue({ pkgIndexNew, customerIndexListNew });
    setEditIndex(index);
  }

  function onSubmitEditRelease() {
    form
      .validateFields(["pkgIndexNew", "customerIndexListNew"])
      .then(() => {
        const { pkgIndexNew, customerIndexListNew } = form.getFieldsValue([
          "pkgIndexNew",
          "customerIndexListNew",
        ]);
        const releaseFound = releaseList.find(
          (release) =>
            release.index !== editIndex && release.pkgIndex === pkgIndexNew
        );
        if (releaseFound) {
          return;
        }
        const indexFound = releaseList.findIndex(
          (release) => release.index === editIndex
        );
        const { customerIndexListPerChangeList } = releaseList[indexFound];
        if (indexFound === -1) {
          return;
        }
        const releaseListNew: ReleaseV2[] = [
          ...releaseList.slice(0, indexFound),
          {
            index: editIndex,
            pkgIndex: pkgIndexNew,
            customerIndexList: customerIndexListNew,
            customerIndexListPerChangeList,
          },
          ...releaseList.slice(indexFound + 1),
        ];
        onChange(releaseListNew);
        setEditIndex(-1);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  function removeRelease(index: number) {
    const indexFound = releaseList.findIndex(
      (release) => release.index === index
    );
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
      const lineup =
        lineupIndex === -1
          ? parenNone
          : lineupList.find((lineup) => lineup.index === lineupIndex)?.name ??
            parenError;
      return { key, package: pkgIndex, pkgName, customers, lineup };
    }),
  ];

  const releaseToDragFound = releaseList.find((release) => release.index === Number(activeId));
  const pkgToDragFound = pkgList.find((pkg) => pkg.index === releaseToDragFound?.pkgIndex);
  const pkgNameToDrag = pkgToDragFound?.name;
  const lineupIndexToDrag = pkgToDragFound?.lineupIndex;
  const lineupToDrag = lineupList.find((lineup) => lineup.index === lineupIndexToDrag)?.name;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        components={{
          body: {
            wrapper: DraggableWrapper,
            row: DraggableRow,
            cell: EditableCell,
          },
        }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.key !== -1,
        }}
        pagination={false}
        size="small"
      />
      {/* Render overlay component. */}
      <DragOverlay
        style={{
          backgroundColor: "#e0e0e07f",
          border: "1px solid #e9e9e9",
          display: "flex",
          alignItems: "center",
          paddingLeft: 30,
        }}
      >
        {pkgNameToDrag} <Tag>{lineupToDrag}</Tag>
      </DragOverlay>
    </DndContext>
  );

  function DraggableWrapper(props: any) {
    const { children, ...restProps } = props;
    return (
      <SortableContext
        // `children[1]` is `dataSource`.
        items={children[1].map((child: any) => child.key.toString())}
        strategy={verticalListSortingStrategy}
        {...restProps}
      >
        <tbody {...restProps}>
          {
            // This invokes `Table.components.body.row` for each element of `children`.
            children
          }
        </tbody>
      </SortableContext>
    );
  }

  function DraggableRow(props: any) {
    const { children, style, ...restProps } = props;
    const id = props["data-row-key"]?.toString() ?? invalidSortable;
    const { attributes, listeners, setNodeRef } = useSortable({ id });
    const styleRowBold = Number(id) > -1 ? { fontWeight: "bold" } : null;
    const styleNew = Object.assign({}, style, styleRowBold);
    return (
      <tr ref={setNodeRef} {...attributes} {...restProps} style={styleNew}>
        {id === invalidSortable
          ? children
          : children.map((child: any) => {
              const { children, ...restProps } = child;
              const { key } = restProps;
              return key === keyDragHandle ? (
                <td {...listeners} {...restProps}>
                  {child}
                </td>
              ) : (
                <td {...restProps}>{child}</td>
              );
            })}
      </tr>
    );
  }

  function EditableCell({
    record,
    dataIndex,
    children,
    ...restProps
  }: EditableCellProps) {
    if (!record) {
      return children;
    }
    const { key, pkgName, customers: customerIndexList, lineup } = record;
    return (
      <>
        {/* <td {...restProps}> */}
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
                <PlusOutlined />
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
              <Button onClick={onSubmitEditRelease}>
                <CheckOutlined />
              </Button>
              <Button onClick={() => setEditIndex(-1)}>
                <CloseOutlined />
              </Button>
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
            <Button onClick={() => onClickEdit(key)}>
              <EditOutlined />
            </Button>
            <Button onClick={() => removeRelease(key)}>
              <DeleteOutlined />
            </Button>
          </>
        ) : dataIndex === keyDragHandle ? (
          <MenuOutlined style={{ cursor: "grab" }} />
        ) : (
          children
        )}
        {/* </td> */}
      </>
    );
  }

  function expandedRowRender(record: any) {
    const { key: releaseIndex } = record;
    return (
      <td colSpan={columns.length + 1}>
        <ChangePerReleaseTable
          customerList={customerList}
          pkgList={pkgList}
          releaseIndex={releaseIndex}
          versionIndex={versionIndex}
          versionList={versionList}
          onChange={(customerIndexListPerChangeList) =>
            onChangeCustomerIndexListPerChangeList(
              releaseIndex,
              customerIndexListPerChangeList
            )
          }
        />
      </td>
    );
  }
}
