import { Table } from "antd";
import { keyActions, keyAfterChange, keyBeforeChange, keyCustomers, keyDescription, keyLineup, keyVersion, titleActions, titleAfterChange, titleBeforeChange, titleCustomers, titleDescription, titleLineup, titleVersion } from "../constants";

export default function ChangePerReleaseTable() {
  const columns: any[] = [
    { key: keyVersion, dataIndex: keyVersion, title: titleVersion },
    { key: keyDescription, dataIndex: keyDescription, title: titleDescription },
    { key: keyLineup, dataIndex: keyLineup, title: titleLineup },
    { key: keyCustomers, dataIndex: keyCustomers, title: titleCustomers },
    { key: keyActions, dataIndex: keyActions, title: titleActions },
  ];

  return (
    <Table
      columns={columns}
    />
  )
}