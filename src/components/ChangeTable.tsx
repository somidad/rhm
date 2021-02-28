import { useState } from "react";
import { Button, Form, Table, TextArea } from "semantic-ui-react";
import { Change, Enum } from "../types";
import EnumSelector from "./EnumSelector";

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
  const [selectedCustomerIndexList, setSelectedCustomerIndexList] = useState<number[]>([]);

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Before change</Table.HeaderCell>
          <Table.HeaderCell>After change</Table.HeaderCell>
          <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={3}>Customers</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <TextArea />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell rowSpan={2}>
            <Button icon='plus' size='tiny' />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={3}>
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
