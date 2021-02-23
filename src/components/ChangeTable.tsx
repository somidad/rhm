import { Table } from "semantic-ui-react";
import { Change } from "../types";

type Props = {
  changeList: Change[];
};

export default function ChangeTable({ changeList }: Props) {
  return (
    <Table celled selectable>
      {
        changeList.map((change) => <></>)
      }
    </Table>
  )
}
