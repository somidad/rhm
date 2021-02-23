import { Table } from "semantic-ui-react";
import { Release } from "../types";

type Props ={ 
  releaseList: Release[];
}

export default function ReleaseTable({ releaseList }: Props) {
  return (
    <Table celled selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell>Customer</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          releaseList.map((release) => <></>)
        }
      </Table.Body>
    </Table>
  )
}
