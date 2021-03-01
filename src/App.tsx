import { useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import { Container, Form, Header, Menu, Segment } from 'semantic-ui-react';
import EnumTable from './components/EnumTable';
import PkgTable from './components/PkgTable';
import VersionEditor from './components/VersionEditor';
import { Enum, Pkg, Version } from './types';

const PANE_VERSION = 'version';
const PANE_LINEUP = 'lineup';
const PANE_PACKAGE = 'package';
const PANE_CUSTOMER = 'customer';

function App() {
  const [featureName, setFeatureName] = useState('Untitled');
  const [versionList, setVersionList] = useState<Version[]>([
    { index: 0, name: 'V1', indexPrev: -1, changeList: [], releaseList: [] },
    { index: 1, name: 'V2', indexPrev: 0, changeList: [], releaseList: [] },
    { index: 2, name: 'V3', indexPrev: 1, changeList: [], releaseList: [] },
  ]);
  const [lineupList, setLineupList] = useState<Enum[]>([
    { index: 0, name: '(None)' },
    { index: 1, name: '4G' },
    { index: 2, name: '5G' },
  ]);
  const [pkgList, setPkgList] = useState<Pkg[]>([
    { index: 0, name: 'PKG A', lineupIndex: -1 },
    { index: 1, name: 'PKG B', lineupIndex: -1 },
    { index: 2, name: 'PKG C', lineupIndex: -1 },
    { index: 3, name: 'PKG D', lineupIndex: 0 },
    { index: 4, name: 'PKG E', lineupIndex: 1 },
  ]);
  const [customerList, setCustomerList] = useState<Enum[]>([
    { index: 0, name: 'AT&T Mobility' },
    { index: 1, name: 'KDDI' },
    { index: 2, name: 'KT' },
    { index: 3, name: 'LGU+' },
    { index: 4, name: 'SK Telecom' },
    { index: 5, name: 'TELUS' },
    { index: 6, name: 'Verizon Wireless' },
  ]);
  const [pane, setPane] = useState(PANE_VERSION);

  return (
    <div className="App">
      <Menu pointing>
        <Menu.Item>New</Menu.Item>
        <Menu.Item>
          <Form>
            <Form.Field>
              <input value={featureName} onChange={(e) => setFeatureName(e.target.value)} />
            </Form.Field>
          </Form>
        </Menu.Item>
        <Menu.Item>Load</Menu.Item>
        <Menu.Item>Save</Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item
            active={pane === PANE_VERSION}
            onClick={() => setPane(PANE_VERSION)}
          >
            Versions
          </Menu.Item>
          <Menu.Item
            active={pane === PANE_LINEUP}
            onClick={() => setPane(PANE_LINEUP)}
          >
            Lineups
          </Menu.Item>
          <Menu.Item
            active={pane === PANE_PACKAGE}
            onClick={() => setPane(PANE_PACKAGE)}
          >
            Packages
          </Menu.Item>
          <Menu.Item
            active={pane === PANE_CUSTOMER}
            onClick={() => setPane(PANE_CUSTOMER)}
          >
            Customers
          </Menu.Item>
        </Menu.Menu>
      </Menu>
      {
        pane === PANE_VERSION ? (
          <Container as={Segment}>
            <Header as='h1'>Versions</Header>
            <VersionEditor versionList={versionList} onChange={setVersionList} lineupList={lineupList} pkgList={pkgList} customerList={customerList} />
          </Container>
        ) : <></>
      }
      {
        pane === PANE_LINEUP ? (
          <Container as={Segment}>
            <Header as='h1'>Lineups</Header>
            <EnumTable title='Lineup' enumList={lineupList} onChange={setLineupList} />
          </Container>
        ) : <></>
      }
      {
        pane === PANE_PACKAGE ? (
          <Container as={Segment}>
            <Header as='h1'>Packages</Header>
            <PkgTable pkgList={pkgList} lineupList={lineupList} onChange={setPkgList} />
          </Container>
        ) : <></>
      }
      {
        pane === PANE_CUSTOMER ? (
          <Container as={Segment}>
            <Header as='h1'>Customers</Header>
            <EnumTable title='Customer' enumList={customerList} onChange={setCustomerList} />
          </Container>
        ) : <></>
      }
    </div>
  );
}

export default App;
