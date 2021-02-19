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

const generatePasscode = (secret, count) => {
  let res = twoFA.generateHOTP(secret, count);
  while(res.length !== 6) {
    res = twoFA.generateHOTP(secret, count);
  }
  return res;
}

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
          setPasscode(generatePasscode(secret_result.secret, result.count));
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
      setPasscode(generatePasscode(secret, result.count));
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
      { secret?
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
                  :<div><CopyOutlined/> Copy Passcode</div>}
                </Button>
              </CopyToClipboard>
              </Col>
          </Row>

        </div>
        :
        <div>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={20} >
                <Input type="text" disabled={loading} onChange={onChange} 
                  placeholder={"Paste Activation URL"}/>
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={6} >
              <Button type="primary" loading={loading} onClick={onClick} >
                Activate Easy DUO!
              </Button>
              </Col>
          </Row>

        </div>
      }
      </div>
    </div>
  );
}

export default App;
