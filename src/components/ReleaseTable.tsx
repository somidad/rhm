import { Button, Form, Input, Select, Skeleton, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import Title from "antd/lib/typography/Title";
import React from "react";
import { useState } from "react";
import { Enum, Pkg, Release, Version } from "../types";
import { findEmptyIndex } from "../utils";
import EnumSelector from "./EnumSelector";

const { Option } = Select;

type Props ={ 
  versionList: Version[];
  releaseList: Release[];
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  onChange: (releaseList: Release[]) => void;
}

type EditableCellProps = {
  record: { key: number; version: string; previous: number; package: Pkg[]; };
  dataIndex: string;
  children: any;
};

const VERSION = 'Version';
const PREVIOUS = 'Previous';
const PACKAGES = 'Packages';
const CUSTOMERS = 'Customers';
const ACTIONS = 'Actions';

export default function ReleaseTable({
  versionList, releaseList, lineupList, pkgList, customerList,
  onChange,
}: Props) {
  const [form] = useForm();

  const [pkgIndex, setPkgIndex] = useState(-1);
  const [customerIndexList, setCustomerIndexList] = useState<number[]>([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [pkgIndexNew, setPkgIndexNew] = useState(-1);
  const [customerIndexListNew, setCustomerIndexListNew] = useState<number[]>([]);

  const columns: any[] = [
    { key: VERSION.toLocaleLowerCase(), dataIndex: VERSION.toLocaleLowerCase(), title: VERSION, width: '15%' },
    { key: PREVIOUS.toLocaleLowerCase(), dataIndex: PREVIOUS.toLocaleLowerCase(), title: PREVIOUS, width: '15%' },
    { key: PACKAGES.toLocaleLowerCase(), dataIndex: PACKAGES.toLocaleLowerCase(), title: PACKAGES, width: '20%' },
    { key: CUSTOMERS.toLocaleLowerCase(), dataIndex: CUSTOMERS.toLocaleLowerCase(), title: CUSTOMERS, width: '30%' },
    { key: ACTIONS.toLocaleLowerCase(), dataIndex: ACTIONS.toLocaleLowerCase(), title: ACTIONS, width: '20%' },
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
    if (pkgIndex === -1) {
      return;
    }
    if (!customerIndexList.length) {
      return;
    }
    const releaseFound = releaseList.find((release) => release.pkgIndex === pkgIndex);
    if (releaseFound) {
      return;
    }
    const index = findEmptyIndex(releaseList.map((release) => release.index));
    const releaseListNew = [
      ...releaseList,
      { index, pkgIndex, customerIndexList },
    ];
    onChange(releaseListNew);
    setPkgIndex(-1);
    setCustomerIndexList([]);
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
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      {
        index: editIndex,
        pkgIndex: pkgIndexNew,
        customerIndexList: customerIndexListNew,
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

  function removeVersion(index: number) {
    const indexFound = versionList.findIndex((version) => version.index === index);
    if (indexFound === -1) {
      return;
    }
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      ...versionList.slice(indexFound + 1),
    ];
    // onChangeVersionList(versionListNew);
  }

  const dataSource = [
    { key: -1 },
    ...versionList.map((version) => {
      const { index, name, indexPrev: previous, releaseList } = version;
      return (
        { key: index, version: name, previous }
      );
    }),
  ];
  return (
    <>
      <Title level={3}>Releases</Title>
      <Table
        columns={columns} dataSource={dataSource}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        pagination={false}
      />
    </>
    // <Table celled compact selectable>
    //   <Table.Body>
    //     <Table.Row active>
    //       <Table.Cell>
    //         <EnumSelector enumList={customerList} selectedIndexList={customerIndexList}
    //           onChange={setCustomerIndexList}
    //           disabled={editIndex !== -1}
    //         />
    //       </Table.Cell>
    //     </Table.Row>
    //     {
    //       releaseList.map((release) => {
    //         const { index, pkgIndex, customerIndexList }= release;
    //         const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex) as Pkg;
    //         if (!pkgFound) {
    //           return (
    //             <React.Fragment key={index} />
    //           )
    //         }
    //         const { name, lineupIndex } = pkgFound;
    //         const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
    //         const lineup = `- Lineup: ${lineupFound ? lineupFound.name : '(None)'}`;
    //         return index === editIndex ? (
    //           <React.Fragment key={index}>
    //             <Table.Row>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <select value={pkgIndexNew} onChange={(e) => setPkgIndexNew(+e.target.value)}>
    //                       {
    //                         pkgList.map((pkg) => {
    //                           const { index, name, lineupIndex } = pkg;
    //                           const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
    //                           const lineup = `- Lineup: ${lineupFound ? lineupFound.name : '(None)'}`;
    //                           return (
    //                             <option key={index} value={index}>{name} {lineup}</option>
    //                           )
    //                         })
    //                       }
    //                     </select>
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell rowSpan={2} singleLine>
    //                 <Button icon='check' size='tiny' onClick={onSubmitEditRelease} />
    //                 <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
    //               </Table.Cell>
    //             </Table.Row>
    //             <Table.Row key={`${index}-lower`}>
    //               <Table.Cell>
    //                 <EnumSelector enumList={customerList} selectedIndexList={customerIndexListNew}
    //                   onChange={setCustomerIndexListNew}
    //                 />
    //               </Table.Cell>
    //             </Table.Row>
    //           </React.Fragment>
    //         ) : (
    //           <React.Fragment key={index}>
    //             <Table.Row>
    //               <Table.Cell>
    //                 <Label ribbon>{name} {lineup}</Label>
    //               </Table.Cell>
    //               <Table.Cell rowSpan={2} singleLine>
    //                 <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
    //                 <Button icon='trash' size='tiny' onClick={() => removeRelease(index)} />
    //                 <Button icon size='tiny' onClick={() => moveOlder(index)} disabled={editIndex !== -1}>
    //                   <Icon name='angle up' />
    //                   Older
    //                 </Button>
    //                 <Button icon size='tiny' onClick={() => moveNewer(index)} disabled={editIndex !== -1}>
    //                   <Icon name='angle down' />
    //                   Newer
    //                 </Button>
    //               </Table.Cell>
    //             </Table.Row>
    //             <Table.Row>
    //               <Table.Cell>
    //                 {
    //                   customerList
    //                     .filter((customer) => customerIndexList.find((customerIndex) => customer.index === customerIndex) !== undefined)
    //                     .map((customer) => customer.name)
    //                     .join(', ')
    //                 }
    //               </Table.Cell>
    //             </Table.Row>
    //           </React.Fragment>
    //         )
    //       })
    //     }
    //   </Table.Body>
    // </Table>
  )

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    const { key, previous: indexPrev } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === VERSION.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item
                name='version'
                rules={[{ required: true }]}
                help={false}
              >
                <Input disabled={editIndex !== -1} />
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === PREVIOUS.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item
                name='previous'
                initialValue={-1}
              >
                <Select>
                  <Option key={-1} value={-1}>(None)</Option>
                  {
                    versionList.map((version) => {
                      const { index, name, indexPrev } = version;
                      return (
                        <Option key={index} value={index}>{name}</Option>
                      );
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === PACKAGES.toLocaleLowerCase() ? (
            null
          ) : key === -1 && dataIndex === CUSTOMERS.toLocaleLowerCase() ? (
            null
          ) : key === -1 && dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <Form>
              <Form.Item>
                <Button onClick={() => {}}>Add</Button>
              </Form.Item>
            </Form>
          ) : dataIndex === VERSION.toLocaleLowerCase() ? (
            children
          ) : dataIndex === PREVIOUS.toLocaleLowerCase() ? (
            indexPrev === -1 ? '(None)' : lineupList.find((lineup) => lineup.index === indexPrev)?.name ?? '(Error)'
          ) : dataIndex === ACTIONS.toLocaleLowerCase() ? (
            <>
              <Button>Edit</Button>
              <Button onClick={() => removeVersion(key)}>Remove</Button>
            </>
          ) : (
            children
          )
        }
      </td>
    )
  }
}
