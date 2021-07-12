import { Button, Form, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { useState } from "react";
import { Change, Enum } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  changeList: Change[];
  lineupList: Enum[];
  onChange: (changeList: Change[]) => void;
};

type EditableCellProps = {
  record: { key: number, name: string; };
  dataIndex: string;
  children: any;
};

export default function ChangeTable({
  changeList, lineupList,
  onChange,
}: Props) {
  const [form] = useForm();

  const [description, setDescription] = useState('');
  const [beforeChange, setBeforeChange] = useState('');
  const [afterChange, setAfterChange] = useState('');
  const [customerIndexList, setCustomerIndexList] = useState<number[]>([]);
  const [lineupIndex, setLineupIndex] = useState(-1);
  const [editIndex, setEditIndex] = useState(-1);
  const [descriptionNew, setDescriptionNew] = useState('');
  const [beforeChangeNew, setBeforeChangeNew] = useState('');
  const [afterChangeNew, setAfterChangeNew] = useState('');
  const [customerIndexListNew, setCustomerIndexListNew] = useState<number[]>([]);
  const [lineupIndexNew, setLineupIndexNew] = useState(-1);

  const columns: any[] = [
    { key: 'description', dataIndex: 'description', title: 'Description' },
    { key: 'beforeChange', dataIndex: 'beforeChange', title: 'Before change', },
    { key: 'afterChange', dataIndex: 'afterChange', title: 'After change' },
    { key: 'actions', dataIndex: 'actions', title: 'Actions' },
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
    if (!description) {
      return;
    }
    const index = findEmptyIndex(changeList.map((change) => change.index));
    const changeListNew = [
      ...changeList,
      { index, description, beforeChange, afterChange, customerIndexList, lineupIndex },
    ];
    onChange(changeListNew);
    setDescription('');
    setBeforeChange('');
    setAfterChange('');
    setCustomerIndexList([]);
    setLineupIndex(-1);
  }

  function onClickEdit(index: number) {
    const changeFound = changeList.find((change) => change.index === index);
    if (!changeFound) {
      return;
    }
    const { description, beforeChange, afterChange, lineupIndex, customerIndexList } = changeFound;
    setDescriptionNew(description);
    setBeforeChangeNew(beforeChange);
    setAfterChangeNew(afterChange);
    setLineupIndexNew(lineupIndex);
    setCustomerIndexListNew(customerIndexList);
    setEditIndex(index);
  }

  function onSubmitEditChange() {
    const indexFound = changeList.findIndex((change) => change.index === editIndex);
    if (indexFound === -1) {
      return;
    }
    const changeListNew = [
      ...changeList.slice(0, indexFound),
      {
        index: editIndex,
        description: descriptionNew,
        beforeChange: beforeChangeNew,
        afterChange: afterChangeNew,
        customerIndexList: customerIndexListNew,
        lineupIndex: lineupIndexNew,
      },
      ...changeList.slice(indexFound + 1),
    ];
    onChange(changeListNew);
    setEditIndex(-1);
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
    //   <Table.Header>
    //     <Table.Row>
    //       <Table.HeaderCell>Description</Table.HeaderCell>
    //       <Table.HeaderCell>Before change</Table.HeaderCell>
    //       <Table.HeaderCell>After change</Table.HeaderCell>
    //       <Table.HeaderCell>Lineup</Table.HeaderCell>
    //       <Table.HeaderCell rowSpan={ROWSPAN}>Actions</Table.HeaderCell>
    //     </Table.Row>
    //     <Table.Row>
    //       <Table.HeaderCell colSpan={COLSPAN}>Customers</Table.HeaderCell>
    //     </Table.Row>
    //   </Table.Header>
    //   <Table.Body>
    //     <Table.Row active>
    //       <Table.Cell>
    //         <Form>
    //           <Form.Field disabled={editIndex !== -1}>
    //             <TextArea value={description} onChange={(e) => setDescription(e.target.value)}
    //               className='no-resize-textarea'
    //             />
    //           </Form.Field>
    //         </Form>
    //       </Table.Cell>
    //       <Table.Cell>
    //         <Form>
    //           <Form.Field disabled={editIndex !== -1}>
    //             <TextArea value={beforeChange} onChange={(e) => setBeforeChange(e.target.value)}
    //               className='no-resize-textarea'
    //             />
    //           </Form.Field>
    //         </Form>
    //       </Table.Cell>
    //       <Table.Cell>
    //         <Form>
    //           <Form.Field disabled={editIndex !== -1}>
    //             <TextArea value={afterChange} onChange={(e) => setAfterChange(e.target.value)}
    //               className='no-resize-textarea'
    //             />
    //           </Form.Field>
    //         </Form>
    //       </Table.Cell>
    //       <Table.Cell>
    //         <Form>
    //           <Form.Field disabled={editIndex !== -1}>
    //             <select value={lineupIndex} onChange={(e) => setLineupIndex(+e.target.value)}>
    //               <option value={-1}>(None)</option>
    //               {
    //                 lineupList.map((lineup) => {
    //                   const { index, name } = lineup;
    //                   return (
    //                     <option key={index} value={index}>{name}</option>
    //                   )
    //                 })
    //               }
    //             </select>
    //           </Form.Field>
    //         </Form>
    //       </Table.Cell>
    //       <Table.Cell rowSpan={ROWSPAN}>
    //         <Button icon='plus' size='tiny' onClick={addChange} disabled={editIndex !== -1} />
    //       </Table.Cell>
    //     </Table.Row>
    //     {
    //       changeList.map((change) => {
    //         const { index, description, beforeChange, afterChange, customerIndexList, lineupIndex } = change;
    //         const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
    //         const lineup = lineupFound ? lineupFound.name : '(None)';
    //         return index === editIndex ? (
    //           <React.Fragment key={index}>
    //             <Table.Row>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={descriptionNew} onChange={(e) => setDescriptionNew(e.target.value)}
    //                       className='no-resize-textarea'
    //                     />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={beforeChangeNew} onChange={(e) => setBeforeChangeNew(e.target.value)}
    //                       className='no-resize-textarea'
    //                     />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={afterChangeNew} onChange={(e) => setAfterChangeNew(e.target.value)}
    //                       className='no-resize-textarea'
    //                     />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <select value={lineupIndexNew} onChange={(e) => setLineupIndexNew(+e.target.value)}>
    //                       <option value={-1}>(None)</option>
    //                       {
    //                         lineupList.map((lineup) => {
    //                           const { index, name } = lineup;
    //                           return (
    //                             <option key={index} value={index}>{name}</option>
    //                           )
    //                         })
    //                       }
    //                     </select>
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell rowSpan={ROWSPAN} singleLine>
    //                 <Button icon='check' size='tiny' onClick={onSubmitEditChange} />
    //                 <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
    //               </Table.Cell>
    //             </Table.Row>
    //           </React.Fragment>
    //         ) : (
    //           <React.Fragment key={index}>
    //             <Table.Row>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={description} className='no-border-textarea no-resize-textarea' />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={beforeChange} className='no-border-textarea no-resize-textarea' />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>
    //                 <Form>
    //                   <Form.Field>
    //                     <TextArea value={afterChange} className='no-border-textarea no-resize-textarea' />
    //                   </Form.Field>
    //                 </Form>
    //               </Table.Cell>
    //               <Table.Cell>{lineup}</Table.Cell>
    //               <Table.Cell rowSpan={ROWSPAN} singleLine>
    //                 <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
    //                 <Button icon='trash' size='tiny' onClick={() => removeChange(index)} />
    //               </Table.Cell>
    //             </Table.Row>
    //           </React.Fragment>
    //         )
    //       })
    //     }
    //   </Table.Body>
    //   {
    //     changeList.map((change) => <></>)
    //   }
    // </Table>
  )

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    const { key } = record;
    return (
      <td {...restProps}>
        {
          key === -1 && dataIndex === 'description' ? (
            <Form form={form}>
              <Form.Item
                name='description'
                rules={[{ required: true }]}
              >
                <TextArea />
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === 'beforeChange' ? (
            <Form form={form}>
              <Form.Item
                name='beforeChange'
                rules={[{ required: true }]}
              >
                <TextArea />
              </Form.Item>
            </Form>
          ): key === -1 && dataIndex === 'afterChange' ? (
            <Form form={form}>
              <Form.Item
                name='afterChange'
                rules={[{ required: true }]}
              >
                <TextArea />
              </Form.Item>
            </Form>
          ) : key === -1 && dataIndex === 'actions' ? (
            <Form>
              <Form.Item>
                <Button>Add</Button>
              </Form.Item>
            </Form>
          ) : (null)
        }
      </td>
    )
  }
}
