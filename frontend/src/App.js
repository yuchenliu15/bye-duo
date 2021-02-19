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

const STEPS = [
  `1️⃣ Log in to NYU (if you’ve already logged in during the last 24 hours, you can go to start.nyu.edu).`,
  `2️⃣ At the Multi-Factor Authentication page, click "Add a new device" on the left side of the screen. When prompted, log in through Duo as usual.`,
  `3️⃣ Select “Tablet,” and then select “iOS” on the next page.`,
  `4️⃣ Click “I have Duo Mobile installed,” and then ”Email me an activation link instead.”`,
  `5️⃣ In your email, click on the activation link and paste the popup's URL (not the activation code) into Easy DUO's input bar. Click “Activate Easy DUO!”`,
]

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
  const [passcode, setPasscode] = useState('222222');
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
      { !secret?
        <div>
          <Row align="middle" justify="center" style={{margin: "10px", fontSize: "50px"}}>
              <Col span={24}  style={{textAlign: 'center'}}>
                <div class="container">
                  <div>
                  {passcode}

                  </div>
                  <div class="button-container">
                  <Button style={{marginBottom: '40px'}} type="secondary" onClick={onGenerate} >
                  <RedoOutlined />
                </Button>
                  </div>
                </div>

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
              <Col span={22} >
                {
                  STEPS.map(item => {
                    return <div style={{marginBottom: "5px"}}>{item}</div>
                  })
                }
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={22} >
                <Input type="text" disabled={loading} onChange={onChange} 
                  placeholder={"Paste Activation URL"}/>
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px", textAlign:'center'}}>
              <Col  span={24} >
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
