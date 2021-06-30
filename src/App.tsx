import { createRef, useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Input, Menu, Tabs } from 'antd';
import { Container, Form, Header, Icon, Segment } from 'semantic-ui-react';
import EnumTable from './components/EnumTable';
import PkgTable from './components/PkgTable';
import VersionEditor from './components/VersionEditor';
import { Enum, Pkg, Version } from './types';
import { load } from './utils';

const UNTITLED = 'Untitled';

const PANE_VERSION = 'version';
const PANE_LINEUP = 'lineup';
const PANE_PACKAGE = 'package';
const PANE_CUSTOMER = 'customer';

function App() {
  const refLoad = createRef<HTMLInputElement>();
  let file: File | undefined;
  const refSave = createRef<HTMLAnchorElement>();
  const [featureName, setFeatureName] = useState(UNTITLED);
  const [versionList, setVersionList] = useState<Version[]>([]);
  const [lineupList, setLineupList] = useState<Enum[]>([]);
  const [pkgList, setPkgList] = useState<Pkg[]>([]);
  const [customerList, setCustomerList] = useState<Enum[]>([]);
  const [pane, setPane] = useState(PANE_VERSION);

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
      <Menu mode='horizontal'>
        <Menu.Item onClick={onClickNew}>New</Menu.Item>
        <Menu.Item onClick={() => refLoad.current?.click()}>Load</Menu.Item>
        <Menu.Item disabled>
          <Input value={featureName} onChange={(e) => setFeatureName(e.target.value)} />
        </Menu.Item>
        <Menu.Item onClick={() => onClickSave()}>Save</Menu.Item>
      </Menu>
      <input type='file' accept='.json' hidden ref={refLoad} onChange={onChangeFile} />
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
      <a href='#' ref={refSave} hidden />
      <Tabs defaultActiveKey="history">
        <Tabs.TabPane tab="History" key="history">
          <Container as={Segment}>
            <Header as='h1'>Versions</Header>
            <VersionEditor versionList={versionList} onChange={setVersionList} lineupList={lineupList} pkgList={pkgList} customerList={customerList} />
          </Container>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Customers" key="customers">
          <Container as={Segment}>
            <Header as='h1'>Customers</Header>
            <EnumTable title='Customer' enumList={customerList} onChange={setCustomerList}
              usedIndexList={usedCustomerIndexList}
            />
          </Container>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Lineups" key="lineups">
          <Container as={Segment}>
            <Header as='h1'>Lineups</Header>
            <EnumTable title='Lineup' enumList={lineupList} onChange={setLineupList}
              usedIndexList={usedLineupIndexList}
            />
          </Container>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Packages" key="packages">
          <Container as={Segment}>
            <Header as='h1'>Packages</Header>
            <PkgTable pkgList={pkgList} lineupList={lineupList} onChange={setPkgList}
              usedPkgIndexList={usedPkgIndexList}
            />
          </Container>
        </Tabs.TabPane>
      </Tabs>
      <Container textAlign='center'>
        <a href='https://github.com/gsongsong/rhm' target='_blank' rel='noreferrer'>
          <Icon name='github' size='large' />
        </a>
      </Container>
    </div>
  );
}

export default App;
