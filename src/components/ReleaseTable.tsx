import { Button, Form, Table } from "semantic-ui-react";
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
            <Button icon='edit' size='tiny' />
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
