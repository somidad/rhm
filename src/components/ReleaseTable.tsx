import { Button, Checkbox, Form, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import Title from "antd/lib/typography/Title";
import { useState } from "react";
import { Enum, Pkg, Release, Version } from "../types";
import { findEmptyIndex } from "../utils";

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

const PACKAGE = 'Package';
const CUSTOMERS = 'Customers';
const ACTIONS = 'Actions';

export default function ReleaseTable({
  versionList, releaseList, lineupList, pkgList, customerList,
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
      const { pkgIndex, customerList: customerIndexList } = form.getFieldsValue(['pkgIndex', 'customerList']);
      console.log(pkgIndex, customerIndexList);
      if (pkgIndex === -1) {
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
    const { key } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === PACKAGE.toLocaleLowerCase() ? (
            <Form form={form}>
              <Form.Item
                name='pkgIndex'
                initialValue={-1}
              >
                <Select>
                  <Option key={-1} value={-1}> </Option>
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
