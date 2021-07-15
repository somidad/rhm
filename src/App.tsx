import { useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Col, Collapse, Row, Tabs, Tag } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import EnumTable from './components/EnumTable';
import PkgTable from './components/PkgTable';
import { ChangeV2, Enum, Pkg, ReleaseV2, VersionV2 } from './types';
import Title from 'antd/lib/typography/Title';
import Link from 'antd/lib/typography/Link';
import VersionTable from './components/VersionTable';
import AppMenu from './components/AppMenu';
import ReleaseTable from './components/ReleaseTable';
import ChangeTable from './components/ChangeTable';
import { changeListInit, customerListInit, lineupListInit, pkgListInit, versionListInit } from './init';
import { uniq } from 'lodash';
const { Panel } = Collapse;

function App() {
  const [versionList, setVersionList] = useState<VersionV2[]>(versionListInit);
  const [versionIndex, setVersionIndex] = useState(-1);
  const [changeList, setChangeList] = useState<ChangeV2[]>(changeListInit);
  const [lineupList, setLineupList] = useState<Enum[]>(lineupListInit);
  const [pkgList, setPkgList] = useState<Pkg[]>(pkgListInit);
  const [releaseList, setReleaseList] = useState<ReleaseV2[]>([]);
  const [customerList, setCustomerList] = useState<Enum[]>(customerListInit);

  function onChangeVersionList(versionList: VersionV2[]) {
    const versionFound = versionList.find((version) => version.index === versionIndex);
    if (!versionFound) {
      setVersionIndex(-1);
    }
    setVersionList(versionList);
  }

  function onSelectVersion(index: number) {
    setVersionIndex(index);
  }

  const usedLineupIndexList = uniq([
    ...changeList.map((change) => {
      return change.lineupIndex;
    }),
    ...pkgList.map((pkg) => pkg.lineupIndex),
  ]);
  const usedPkgIndexList = releaseList.map((release) => release.pkgIndex);
  // TODO: Need improvement?
  const usedCustomerIndexList = uniq(releaseList.reduce((customerIndexListPrev: number[], release) => {
    return [
      ...customerIndexListPrev,
      ...release.customerIndexList,
    ];
  }, []));

  const versionCurr = versionList.find((version) => version.index === versionIndex);
  const versionPrev =
    !versionCurr || versionCurr.indexPrev === -1
      ? undefined
      : versionList.find(
          (version) => version.index === versionCurr.indexPrev
        ) ?? -1;
  return (
    <div className="App">
      <AppMenu
        changeList={changeList}
        customerList={customerList}
        lineupList={lineupList}
        pkgList={pkgList}
        releaseList={releaseList}
        versionList={versionList}
        onChangeChangeList={setChangeList}
        onChangeCustomerList={setCustomerList}
        onChangeLineupList={setLineupList}
        onChangePkgList={setPkgList}
        onChangeReleaseList={setReleaseList}
        onChangeVersionList={setVersionList}
      />
      <Row>
        <Col span={16} offset={4}>
          <Tabs defaultActiveKey="history">
            <Tabs.TabPane tab="History" key="history">
              <Title level={2}>History</Title>
              <Collapse defaultActiveKey="versions">
                <Panel key="versions" header="Versions">
                  <VersionTable
                    versionList={versionList}
                    onChange={onChangeVersionList}
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
                        {versionPrev === -1 ? "(Error)" : versionPrev.name}
                      </Tag>
                    </>
                  )}
                  <Collapse defaultActiveKey={["changes", "releases"]}>
                    <Panel key="releases" header="Releases">
                      <ReleaseTable
                        changeList={changeList}
                        releaseList={releaseList}
                        lineupList={lineupList}
                        pkgList={pkgList}
                        customerList={customerList}
                        usedPkgIndexList={usedPkgIndexList}
                        versionList={versionList}
                        versionIndex={versionIndex}
                        onChange={setReleaseList}
                        // onChangeVersionList={setVersionList}
                      />
                    </Panel>
                    <Panel key="changes" header="Changes">
                      <ChangeTable
                        versionIndex={versionIndex}
                        changeList={changeList}
                        lineupList={lineupList}
                        onChange={setChangeList}
                      />
                    </Panel>
                  </Collapse>
                </>
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Customers" key="customers">
              <Title level={2}>Customers</Title>
              <EnumTable
                title="Customer"
                enumList={customerList}
                onChange={setCustomerList}
                usedIndexList={usedCustomerIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Lineups" key="lineups">
              <Title level={2}>Lineups</Title>
              <EnumTable
                title="Lineup"
                enumList={lineupList}
                onChange={setLineupList}
                usedIndexList={usedLineupIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Packages" key="packages">
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
        <Col offset={11}>
          <Title level={1}>
            <Link
              href="https://github.com/gsongsong/rhm"
              target="_blank"
              rel="noreferrer"
            >
              <GithubOutlined />
            </Link>
          </Title>
        </Col>
      </Row>
    </div>
  );
}

export default App;
