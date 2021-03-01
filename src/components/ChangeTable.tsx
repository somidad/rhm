import { useState } from "react";
import { Button, Form, Table, TextArea } from "semantic-ui-react";
import { Change, Enum } from "../types";
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
  const [selectedCustomerIndexList, setSelectedCustomerIndexList] = useState<number[]>([]);

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
        <Table.Row>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea value={beforeChange} onChange={(e) => setBeforeChange(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea value={afterChange} onChange={(e) => setAfterChange(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <select>
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
            <Button icon='plus' size='tiny' />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={COLSPAN}>
            <EnumSelector enumList={customerList} selectedIndexList={selectedCustomerIndexList}
              onChange={setSelectedCustomerIndexList}
            />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
      {
        changeList.map((change) => <></>)
      }
    </Table>
  )
}
