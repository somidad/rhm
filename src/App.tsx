import { createRef, useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Col, Input, Menu, Row, Tabs } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import EnumTable from './components/EnumTable';
import PkgTable from './components/PkgTable';
import VersionEditor from './components/VersionEditor';
import { Enum, Pkg, Version } from './types';
import { load } from './utils';
import Title from 'antd/lib/typography/Title';
import Link from 'antd/lib/typography/Link';

const UNTITLED = 'Untitled';

function App() {
  const refLoad = createRef<HTMLInputElement>();
  let file: File | undefined;
  const refSave = createRef<HTMLAnchorElement>();
  const [featureName, setFeatureName] = useState(UNTITLED);
  const [versionList, setVersionList] = useState<Version[]>([]);
  const [lineupList, setLineupList] = useState<Enum[]>([]);
  const [pkgList, setPkgList] = useState<Pkg[]>([]);
  const [customerList, setCustomerList] = useState<Enum[]>([]);

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (!files) {
      return;
    }
    file = files[0];
    if (!file) {
      return;
    }
    reader.readAsText(file);
  }

  function onClickNew() {
    setFeatureName(UNTITLED);
    setVersionList([]);
    setLineupList([
      { index: 0, name: '(None)' },
    ]);
    setPkgList([]);
    setCustomerList([]);
  }

  function onClickSave() {
    if (refSave.current === null) {
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ versionList, lineupList, pkgList, customerList })],
      { type: 'application/json' },
    );
    refSave.current.download = `${featureName}.json`;
    refSave.current.href=window.URL.createObjectURL(blob);
    refSave.current.click();
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (!file) {
      return;
    }
    if (!e.target) {
      return;
    }
    const { result } = e.target;
    if (result === null || result instanceof ArrayBuffer) {
      return;
    }
    const { name } = file;
    const indexLast = name.lastIndexOf('.');
    const featureName = name.substring(0, indexLast);
    const { versionList, lineupList, pkgList, customerList } = load(result);
    setFeatureName(featureName);
    setCustomerList(customerList);
    setLineupList(lineupList);
    setPkgList(pkgList);
    setVersionList(versionList);
  }

  const usedLineupIndexList = [
    ...versionList.map((version) => {
      return version.changeList.map((change) => change.lineupIndex);
    }).reduce((indexPrevList, indexList) => {
      return [...indexPrevList, ...indexList];
    }, []),
    ...pkgList.map((pkg) => pkg.lineupIndex),
  ];
  const usedPkgIndexList = [
    ...versionList.map((version) => {
      return version.releaseList.map((release) => release.pkgIndex);
    }).reduce((indexPrevList, indexList) => {
      return [...indexPrevList, ...indexList];
    }, []),
  ];
  const usedCustomerIndexList = [
    ...versionList.map((version) => {
      return version.changeList.map((change) => change.customerIndexList).reduce((indexListPrev, indexList) => {
        return [
          ...indexListPrev,
          ...indexList,
        ];
      }, []);
    }).reduce((indexPrevList, indexList) => {
      return [...indexPrevList, ...indexList];
    }, []),
    ...versionList.map((version) => {
      return version.releaseList.map((release) => release.customerIndexList).reduce((indexListPrev, indexList) => {
        return [
          ...indexListPrev,
          ...indexList,
        ];
      }, []);
    }).reduce((indexPrevList, indexList) => {
      return [...indexPrevList, ...indexList];
    }, []),
  ];

  return (
    <div className="App">
      <Menu mode='horizontal' selectable={false}>
        <Menu.Item key='new' onClick={onClickNew}>New</Menu.Item>
        <Menu.Item key='load' onClick={() => refLoad.current?.click()}>Load</Menu.Item>
        <Menu.Item key='featureName' disabled>
          <Input value={featureName} onChange={(e) => setFeatureName(e.target.value)} />
        </Menu.Item>
        <Menu.Item key='save' onClick={() => onClickSave()}>Save</Menu.Item>
      </Menu>
      <input type='file' accept='.json' hidden ref={refLoad} onChange={onChangeFile} />
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
      <a href='#' ref={refSave} hidden />
      <Row>
        <Col span={16} offset={4}>
          <Tabs defaultActiveKey="history">
            <Tabs.TabPane tab="History" key="history">
              <Title level={2}>Versions</Title>
              <VersionEditor versionList={versionList} onChange={setVersionList} lineupList={lineupList} pkgList={pkgList} customerList={customerList} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Customers" key="customers">
              <Title level={2}>Customers</Title>
              <EnumTable title='Customer' enumList={customerList} onChange={setCustomerList}
                usedIndexList={usedCustomerIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Lineups" key="lineups">
              <Title level={2}>Lineups</Title>
              <EnumTable title='Lineup' enumList={lineupList} onChange={setLineupList}
                usedIndexList={usedLineupIndexList}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Packages" key="packages">
              <Title level={2}>Packages</Title>
              <PkgTable pkgList={pkgList} lineupList={lineupList} onChange={setPkgList}
                usedPkgIndexList={usedPkgIndexList}
              />
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
      <Row style={{ marginTop: '1em' }}>
        <Col offset={11}>
          <Link href='https://github.com/gsongsong/rhm' target='_blank' rel='noreferrer'>
            <GithubOutlined style={{ fontSize: '2em' }} />
          </Link>
        </Col>
      </Row>
    </div>
  );
}

export default App;
