import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import twoFA from '2fa-utils';
import hi_base_32 from 'hi-base32';
import { Button, Input, Row, Col } from 'antd';
import { CopyOutlined,RedoOutlined, CheckCircleOutlined } from '@ant-design/icons'
import {CopyToClipboard} from 'react-copy-to-clipboard';

// 3c9b7138faaab1417406f348b31d1638

const API = 'https://goodbyepass.tk/secret'
const SETUP = [
  `1️⃣After login, on the DUO page, click "add a new device" on the left.`,
  `2️⃣Select an "iOS tablet" and click on "email me an activation link"`,
  `3️⃣In your email, click on the activation link and paste the popup's
    link into the extension's input bar, then click "go!"`
]

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [passcode, setPasscode] = useState('');
  const [message, setMessage] = useState('');
  const [copy, setCopy] = useState(false);
  useEffect(() => {
    chrome.storage.sync.get(['secret'], function(secret_result) {
      if(secret_result.secret) {
        chrome.storage.sync.get(['count'], function(result) {
          setPasscode(twoFA.generateHOTP(secret_result.secret, result.count));
          chrome.storage.sync.set({count: result.count+1}, function() {});
        });
        setSecret(secret_result.secret);
      }
    });
  }, []);
  const onChange = event => {
    setLink(event.target.value);
  }
  const onGenerate = event => {
    chrome.storage.sync.get(['count'], function(result) {
      setPasscode(twoFA.generateHOTP(secret, result.count));
      chrome.storage.sync.set({count: result.count+1}, function() {});
    });
    setCopy(false);
  }
  const onClick = (event) => {
    setLoading(true);
    const form = new FormData();
    form.append('secret', link);
    axios.post(API, form)
      .then(res => {
        if(res.status === 200) {
          const secret = hi_base_32.encode(res.data)
          chrome.storage.sync.set({secret: secret}, function() {});
          chrome.storage.sync.set({count: 0}, function() {});
          setSecret(secret);
          setLoading(false);
        }
        else {
          console.error('failed');
        }
      })
      .catch(err => {
        setLoading(false);
        setMessage(err);
      });

    // dev mode: 

    // const secret = hi_base_32.encode('3c9b7138faaab1417406f348b31d1638')
    // chrome.storage.sync.set({secret: secret}, function() {});
    // chrome.storage.sync.set({count: 0}, function() {});
    // setSecret(secret);
    // setLoading(false);
  }
  return (
    <div className="App">
      <div>{message}</div>
      <div>
      {! secret?
        <div>
          <Row justify="center" style={{margin: "10px"}}>
              <Col>
                <Button type="secondary" onClick={onGenerate} >
                  <RedoOutlined />
                </Button>
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px", fontSize: "35px"}}>
              <Col span={16} >
                {passcode}
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col>
              <CopyToClipboard text={passcode}
                onCopy={() => setCopy(true)}>
                <Button type="primary" >
                  {copy? <CheckCircleOutlined />
                  :<div><CopyOutlined/>copy passcode</div>}
                </Button>
              </CopyToClipboard>
              </Col>
          </Row>

        </div>
        :
        <div>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={22} >
                <div>Set up:</div>
                {SETUP.map((item, index) => {
                  return <div style={{marginTop: "10px"}}>{item}</div>}
                )}
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={22} >
                <Input type="text" placeholder={"popup's url"}
                  disabled={loading} onChange={onChange} />
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={6} >
              <Button type="primary" loading={loading} onClick={onClick} >go!</Button>
              </Col>
          </Row>

        </div>
      }
      </div>
    </div>
  );
}

export default App;
