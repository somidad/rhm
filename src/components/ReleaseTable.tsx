import { Button, Form, Icon, Label, Popup, Segment, Table } from "semantic-ui-react";
import { Enum, Pkg, Release } from "../types";

type Props ={ 
  releaseList: Release[];
  pkgList: Pkg[];
  customerList: Enum[];
}

export default function ReleaseTable({ releaseList, pkgList, customerList }: Props) {
  return (
    <Table celled selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell>Customer</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form>
              <Form.Field>
                <select>
                  <option value={-1}>Select a package</option>
                  {
                    pkgList.map((pkg) => {
                      const { index, name } = pkg;
                      return (
                        <option key={index} value={index}>{name}</option>
                      )
                    })
                  }
                </select>
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Form>
              <Form.Field>
                <select>
                  <option value={-1}>(None)</option>
                </select>
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            Alice, Bob, Charlie
            <Popup
              wide
              position='top center'
              trigger={<Button icon='edit' size='tiny' />}
              content={
                <>
                  {
                    customerList.map((customer) => {
                      const { index, name } = customer;
                      return (
                        <Label key={index} as='a' className='customer-label'>
                          <Icon name='minus' />
                          {name}
                        </Label>
                      )
                    })
                  }
                  <Segment basic textAlign='right'>
                    <Button icon='check' size='tiny' />
                    <Button icon='cancel' size='tiny' />
                  </Segment>
                </>
              }
              on='click'
            />
          </Table.Cell>
          <Table.Cell>
            <Button icon='plus' />
          </Table.Cell>
        </Table.Row>
        {
          releaseList.map((release) => <></>)
        }
      </Table.Body>
    </Table>
  )
}
