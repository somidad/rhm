import { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { Button, Col, Collapse, Modal, Row, Space, Tabs, Tag } from "antd";
import { CopyOutlined, GithubOutlined } from "@ant-design/icons";
import EnumTable from "./components/EnumTable";
import PkgTable from "./components/PkgTable";
import { ChangeV2, CustomerIndexListPerChange, Enum, Pkg, ReleaseV2, VersionV2 } from "./types";
import Title from "antd/lib/typography/Title";
import Link from "antd/lib/typography/Link";
import VersionTable from "./components/VersionTable";
import AppMenu from "./components/AppMenu";
import ReleaseTable from "./components/ReleaseTable";
import ChangeTable from "./components/ChangeTable";
import {
  customerListInit,
  lineupListInit,
  pkgListInit,
  versionListInit,
} from "./init";
import { uniq, uniqWith } from "lodash";
import TextArea from "antd/lib/input/TextArea";
import { publish } from "./utils";
import { keyChanges, keyReleases, keyVersions, parenError, keyHistory, keyLineups, keyPackages, keyCustomers, titleHistory, titleVersions, titleChanges, titleReleases, titleCustomers, titleCustomer, titleLineups, titleLineup, titlePackages } from "./constants";
const { Panel } = Collapse;

function App() {
  const [versionList, setVersionList] = useState<VersionV2[]>(versionListInit);
  const [versionIndex, setVersionIndex] = useState(-1);
  const [lineupList, setLineupList] = useState<Enum[]>(lineupListInit);
  const [pkgList, setPkgList] = useState<Pkg[]>(pkgListInit);
  const [customerList, setCustomerList] = useState<Enum[]>(customerListInit);
  const [modalVisible, setModalVisible] = useState(false);
  const [releaseHistory, setReleaseHistory] = useState("");

  function onChangeChangeList(changeList: ChangeV2[]) {
    const indexFound = versionList.findIndex(
      (version) => version.index === versionIndex
    );
    if (indexFound === -1) {
      return;
    }
    const version = versionList[indexFound];
    version.changeList = changeList;
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      version,
      ...versionList.slice(indexFound + 1),
    ];
    setVersionList(versionListNew);
  }

  function onChangeReleaseList(releaseList: ReleaseV2[]) {
    const indexFound = versionList.findIndex(
      (version) => version.index === versionIndex
    );
    if (indexFound === -1) {
      return;
    }
    const version = versionList[indexFound];
    version.releaseList = releaseList;
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      version,
      ...versionList.slice(indexFound + 1),
    ];
    setVersionList(versionListNew);
  }

  function onChangeVersionList(versionList: VersionV2[]) {
    const versionFound = versionList.find(
      (version) => version.index === versionIndex
    );
    if (!versionFound) {
      setVersionIndex(-1);
    }
    setVersionList(versionList);
  }

  function onLoad({
    customerList,
    lineupList,
    pkgList,
    versionList,
  }: {
    customerList: Enum[];
    lineupList: Enum[];
    pkgList: Pkg[];
    versionList: VersionV2[];
  }) {
    setVersionIndex(-1);
    setCustomerList(customerList);
    setLineupList(lineupList);
    setPkgList(pkgList);
    setVersionList(versionList);
  }

  function onNew() {
    setVersionIndex(-1);
    setCustomerList([]);
    setLineupList([]);
    setPkgList([]);
    setVersionList([]);
  }

  function onPublish(versionIndex: number) {
    const releaseHistory = publish(
      versionList,
      versionIndex,
      lineupList,
      pkgList,
      customerList
    );
    setReleaseHistory(releaseHistory ?? parenError);
    setModalVisible(true);
  }

  function onSelectVersion(index: number) {
    setVersionIndex(index);
  }

  type ChangeIndexWithVersionIndex = Omit<CustomerIndexListPerChange, "customerIndexList">;
  const usedChangeIndexWithVersionIndexList: ChangeIndexWithVersionIndex[] =
    uniqWith(
      versionList.reduce(
        (changeIndexListPrev: ChangeIndexWithVersionIndex[], version) => {
          const { releaseList } = version;
          const changeIndexListPerReleaseList = releaseList.reduce(
            (
              changeIndexListPerReleasePrev: ChangeIndexWithVersionIndex[],
              release
            ) => {
              const { customerIndexListPerChangeList } = release;
              return [
                ...changeIndexListPerReleasePrev,
                ...customerIndexListPerChangeList
                  .filter((item) => {
                    const { customerIndexList } = item;
                    return customerIndexList && customerIndexList.length;
                  })
                  .map((item) => {
                    const { versionIndex, changeIndex } = item;
                    return { versionIndex, changeIndex };
                  }),
              ];
            },
            []
          );
          return [...changeIndexListPrev, ...changeIndexListPerReleaseList];
        },
        []
      ),
      (a, b) => a.versionIndex === b.versionIndex && a.changeIndex === b.changeIndex
    );
  const usedLineupIndexList = uniq([
    ...versionList.reduce((lineupIndexListPrev: number[], version) => {
      const { changeList } = version;
      return [
        ...lineupIndexListPrev,
        ...changeList.map((change) => {
          return change.lineupIndex;
        }),
      ];
    }, []),
    ...pkgList.map((pkg) => pkg.lineupIndex),
  ]);
  const usedPkgIndexList = uniq(
    versionList.reduce((pkgIndexListPrev: number[], version) => {
      const { releaseList } = version;
      return [
        ...pkgIndexListPrev,
        ...releaseList.map((release) => release.pkgIndex),
      ];
    }, [])
  );
  const usedCustomerIndexList = uniq(
    versionList.reduce((customerIndexListPrev: number[], version) => {
      const { releaseList } = version;
      return [
        ...customerIndexListPrev,
        ...releaseList.reduce(
          (customerIndexListPerReleasePrev: number[], release) => {
            const { customerIndexList, customerIndexListPerChangeList } =
              release;
            return [
              ...customerIndexListPerReleasePrev,
              ...customerIndexList,
              ...customerIndexListPerChangeList.reduce(
                (customerIndexListPerChangeListPrev: number[], item) => {
                  const { customerIndexList } = item;
                  return [
                    ...customerIndexListPerChangeListPrev,
                    ...customerIndexList,
                  ];
                },
                []
              ),
            ];
          },
          []
        ),
      ];
    }, [])
  );

  const versionCurr = versionList.find(
    (version) => version.index === versionIndex
  );
  const versionPrev =
    !versionCurr || versionCurr.indexPrev === -1
      ? undefined
      : versionList.find(
          (version) => version.index === versionCurr.indexPrev
        ) ?? -1;
  return (
    <div className="App">
      <AppMenu
        customerList={customerList}
        lineupList={lineupList}
        pkgList={pkgList}
        versionList={versionList}
        onNew={onNew}
        onLoad={onLoad}
      />
      <Row>
        <Col span={16} offset={4}>
          <Tabs defaultActiveKey={keyHistory}>
            <Tabs.TabPane tab={titleHistory} key={keyHistory}>
              <Title level={2}>History</Title>
              <Collapse defaultActiveKey={[keyVersions]}>
                <Panel key={keyVersions} header={titleVersions}>
                  <VersionTable
                    versionList={versionList}
                    onChange={onChangeVersionList}
                    onPublish={onPublish}
                    onSelect={onSelectVersion}
                  />
                </Panel>
              </Collapse>
              {!versionCurr ? null : (
                <>
                  <Title level={3}>{versionCurr.name}</Title>
                  {!versionPrev ? null : (
                    <>
                      Previous{" "}
                      <Tag>
                        {versionPrev === -1 ? parenError : versionPrev.name}
                      </Tag>
                    </>
                  )}
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Collapse defaultActiveKey={[keyChanges]}>
                      <Panel key={keyChanges} header={titleChanges}>
                        <ChangeTable
                          versionIndex={versionIndex}
                          versionList={versionList}
                          lineupList={lineupList}
                          usedChangeIndexWithVersionIndexList={usedChangeIndexWithVersionIndexList}
                          onChange={onChangeChangeList}
                        />
                      </Panel>
                    </Collapse>
                    <Collapse defaultActiveKey={[keyReleases]}>
                      <Panel key={keyReleases} header={titleReleases}>
                        <ReleaseTable
                          lineupList={lineupList}
                          pkgList={pkgList}
                          customerList={customerList}
                          usedPkgIndexList={usedPkgIndexList}
                          versionList={versionList}
                          versionIndex={versionIndex}
                          onChange={onChangeReleaseList}
                          // onChangeVersionList={setVersionList}
                        />
                      </Panel>
                    </Collapse>
                  </Space>
                </>
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab={titleCustomers} key={keyCustomers}>
              <Title level={2}>Customers</Title>
              <EnumTable
                title={titleCustomer}
                enumList={customerList}
                onChange={setCustomerList}
                usedIndexList={usedCustomerIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={titleLineups} key={keyLineups}>
              <Title level={2}>Lineups</Title>
              <EnumTable
                title={titleLineup}
                enumList={lineupList}
                onChange={setLineupList}
                usedIndexList={usedLineupIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={titlePackages} key={keyPackages}>
              <Title level={2}>Packages</Title>
              <PkgTable
                pkgList={pkgList}
                lineupList={lineupList}
                onChange={setPkgList}
                usedPkgIndexList={usedPkgIndexList}
              />
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
      <Row style={{ marginTop: "1em" }}>
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          <Link
            href="https://github.com/gsongsong/rhm"
            target="_blank"
            rel="noreferrer"
          >
            <GithubOutlined />
          </Link>
        </Col>
      </Row>
      <Modal
        title="Release history"
        footer={
          <Button onClick={() => navigator.clipboard.writeText(releaseHistory)}>
            <CopyOutlined />
            Copy to clipboard
          </Button>
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={960}
      >
        <TextArea value={releaseHistory} cols={80} autoSize={true} />
      </Modal>
    </div>
  );
}

export default App;
