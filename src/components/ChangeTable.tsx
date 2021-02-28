import { Button, Form, Icon, Label, Table, TextArea } from "semantic-ui-react";
import { Change, Enum } from "../types";

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
            {
              customerList.map((customer) => {
                const { index, name } = customer;
                return (
                  <Label key={index}>
                    <Icon name='minus' />
                    {name}
                  </Label>
                )
              })
            }
          </Table.Cell>
        </Table.Row>
      </Table.Body>
      {
        changeList.map((change) => <></>)
      }
    </Table>
  )
}
