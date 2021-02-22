import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { TypeCustomer } from "../types";

export default function Customer() {
  const [name, setName] = useState('');
  const [customerList, setCustomerList] = useState<TypeCustomer[]>([
    { index: 0, name: 'AT&T Mobility' },
    { index: 1, name: 'Verizon Wireless' },
  ]);

  function addCustomer() {
    if (!name) {
      return;
    }
    const customerFound = customerList.find((customer) => customer.name === name);
    if (customerFound) {
      return;
    }
    const index = customerList.reduce((indexPrev, customer) => {
      if (customer.index === indexPrev) {
        return indexPrev + 1;
      }
      return indexPrev;
    }, 0);
    const customerListNew = [
      ...customerList,
      { index, name },
    ].sort((a, b) => a.index - b.index);
    setCustomerList(customerListNew);
    setName('');
  }

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Customer</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form onSubmit={addCustomer}>
              <Form.Field>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Button
              icon='plus' size='tiny'
              onClick={addCustomer}
            />
          </Table.Cell>
        </Table.Row>
        {
          customerList.map((customer) => {
            const { index, name } = customer;
            return (
              <Table.Row key={index}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>
                  <Button icon='edit' size='tiny' />
                  <Button icon='trash' size='tiny' />
                </Table.Cell>
              </Table.Row>
            )
          })
        }
      </Table.Body>
    </Table>
  );
}
