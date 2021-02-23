import { Accordion, Button, Form, Segment } from "semantic-ui-react";
import Version from "./Version";

export default function VersionEditor() {
  return (
    <>
      <Segment>
        <Form>
          <Form.Group>
            <Form.Field inline>
              <label>Version</label>
              <input />
            </Form.Field>
            <Form.Field inline>
              <label>Previous version</label>
              <select />
            </Form.Field>
            <Button icon='plus' size='tiny' />
          </Form.Group>
        </Form>
      </Segment>
      <Accordion fluid styled>
        <Version version='V1' />
        <Version version='V2' />
        <Version version='V3' />
      </Accordion>
    </>
  );
}
