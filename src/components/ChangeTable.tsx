import React from "react";
import { useState } from "react";
import { Button, Form, Table, TextArea } from "semantic-ui-react";
import { Change, Enum } from "../types";
import { findEmptyIndex } from "../utils";
import EnumSelector from "./EnumSelector";

const COLSPAN = 4;
const ROWSPAN = 2;

type Props = {
  changeList: Change[];
  lineupList: Enum[];
  customerList: Enum[];
  onChange: (changeList: Change[]) => void;
};

export default function ChangeTable({
  changeList, lineupList, customerList,
  onChange,
}: Props) {
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

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Before change</Table.HeaderCell>
          <Table.HeaderCell>After change</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell rowSpan={ROWSPAN}>Actions</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={COLSPAN}>Customers</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row active>
          <Table.Cell>
            <Form>
              <Form.Field disabled={editIndex !== -1}>
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)}
                  className='no-resize-textarea'
                />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field disabled={editIndex !== -1}>
                <TextArea value={beforeChange} onChange={(e) => setBeforeChange(e.target.value)}
                  className='no-resize-textarea'
                />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field disabled={editIndex !== -1}>
                <TextArea value={afterChange} onChange={(e) => setAfterChange(e.target.value)}
                  className='no-resize-textarea'
                />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field disabled={editIndex !== -1}>
                <select value={lineupIndex} onChange={(e) => setLineupIndex(+e.target.value)}>
                  <option value={-1}>(None)</option>
                  {
                    lineupList.map((lineup) => {
                      const { index, name } = lineup;
                      return (
                        <option key={index} value={index}>{name}</option>
                      )
                    })
                  }
                </select>
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell rowSpan={ROWSPAN}>
            <Button icon='plus' size='tiny' onClick={addChange} disabled={editIndex !== -1} />
          </Table.Cell>
        </Table.Row>
        <Table.Row active>
          <Table.Cell colSpan={COLSPAN}>
            <EnumSelector enumList={customerList} selectedIndexList={customerIndexList}
              onChange={setCustomerIndexList}
              disabled={editIndex !== -1}
            />
          </Table.Cell>
        </Table.Row>
        {
          changeList.map((change) => {
            const { index, description, beforeChange, afterChange, customerIndexList, lineupIndex } = change;
            const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
            const lineup = lineupFound ? lineupFound.name : '(None)';
            return index === editIndex ? (
              <React.Fragment key={index}>
                <Table.Row>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={descriptionNew} onChange={(e) => setDescriptionNew(e.target.value)}
                          className='no-resize-textarea'
                        />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={beforeChangeNew} onChange={(e) => setBeforeChangeNew(e.target.value)}
                          className='no-resize-textarea'
                        />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={afterChangeNew} onChange={(e) => setAfterChangeNew(e.target.value)}
                          className='no-resize-textarea'
                        />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <select value={lineupIndexNew} onChange={(e) => setLineupIndexNew(+e.target.value)}>
                          <option value={-1}>(None)</option>
                          {
                            lineupList.map((lineup) => {
                              const { index, name } = lineup;
                              return (
                                <option key={index} value={index}>{name}</option>
                              )
                            })
                          }
                        </select>
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell rowSpan={ROWSPAN}>
                    <Button icon='check' size='tiny' onClick={onSubmitEditChange} />
                    <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan={COLSPAN}>
                    <EnumSelector enumList={customerList} selectedIndexList={customerIndexListNew}
                      onChange={setCustomerIndexListNew}
                    />
                  </Table.Cell>
                </Table.Row>
              </React.Fragment>
            ) : (
              <React.Fragment key={index}>
                <Table.Row>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={description} className='no-border-textarea no-resize-textarea' />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={beforeChange} className='no-border-textarea no-resize-textarea' />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <TextArea value={afterChange} className='no-border-textarea no-resize-textarea' />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>{lineup}</Table.Cell>
                  <Table.Cell rowSpan={ROWSPAN}>
                    <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
                    <Button icon='trash' size='tiny' onClick={() => removeChange(index)} />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan={COLSPAN}>
                    {
                      customerList
                        .filter((customer) => customerIndexList.find((customerIndex) => customer.index === customerIndex) !== undefined)
                        .map((customer) => customer.name)
                        .join(', ')
                    }
                  </Table.Cell>
                </Table.Row>
              </React.Fragment>
            )
          })
        }
      </Table.Body>
      {
        changeList.map((change) => <></>)
      }
    </Table>
  )
}
