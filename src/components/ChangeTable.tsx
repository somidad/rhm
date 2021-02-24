import { Table } from "semantic-ui-react";
import { Change, Enum } from "../types";

type Props = {
  changeList: Change[];
  lineupList: Enum[];
  customerList: Enum[];
};

export default function ChangeTable({ changeList, lineupList, customerList }: Props) {
  return (
    <Table celled selectable>
      {
        changeList.map((change) => <></>)
      }
    </Table>
  )
}
