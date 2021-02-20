import './App.less';
import { useState, useEffect } from 'react';
import axios from 'axios';
import twoFA from '2fa-utils';
import hi_base_32 from 'hi-base32';
import { Button, Input, Row, Col,  List } from 'antd';
import { CopyOutlined,RedoOutlined, CheckCircleOutlined } from '@ant-design/icons'
import {CopyToClipboard} from 'react-copy-to-clipboard';

// 3c9b7138faaab1417406f348b31d1638

const API = 'https://goodbyepass.tk/secret'

const STEPS = [
  `Log in to NYU (if you’ve already logged in during the last 24 hours, you can go to start.nyu.edu).`,
  `At the Multi-Factor Authentication page, click "Add a new device" on the left side of the screen. When prompted, log in through Duo as usual.`,
  `Select “Tablet,” and then select “iOS” on the next page.`,
  `Click “I have Duo Mobile installed,” and then ”Email me an activation link instead.”`,
  `In your email, click on the activation link and paste the popup's URL (not the activation code) into Bye DUO's input bar. Click “Activate Bye DUO!”`,
]

const generatePasscode = (secret, count) => {
  let res = twoFA.generateHOTP(secret, count);
  while(res.length !== 6) {
    res = twoFA.generateHOTP(secret, count);
    count += 1;
  }
  chrome.storage.sync.set({count: count+1}, function() {});
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
          const newSecret = hi_base_32.encode(res.data)
          chrome.storage.sync.set({secret: newSecret}, function() {});
          chrome.storage.sync.set({count: 0}, function() {});
          setPasscode(generatePasscode(newSecret, 0));
          setSecret(newSecret);
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
          <Row align="middle" justify="center" style={{margin: "10px", fontSize: "50px"}}>
              <Col span={24}  style={{textAlign: 'center'}}>
                <div class="container">
                  <div>
                  {passcode}

                  </div>
                  <div class="button-container">
                  <Button className='button-circle' style={{marginBottom: '3px'}} 
                    type="secondary" onClick={onGenerate} >
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
                <Button type="primary" className='button-copy' >
                  {copy? <CheckCircleOutlined />
                  :<div><CopyOutlined/> Copy Passcode</div>}
                </Button>
              </CopyToClipboard>
              </Col>
          </Row>

        </div>
        :
        <div>
          <Row justify="center" style={{margin: "0 0 10px 0"}}>
              <Col span={24} >
              <List
              className="list"
              size="small"
              dataSource={STEPS}
              renderItem={(item, index) => (
                <List.Item>
                  <span className="number" >{(index + 1) + '. '}</span>  
                  {item}
                </List.Item>
              )}
            />
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={22} >
                <Input className={'input'} 
                   type="text" disabled={loading} onChange={onChange} 
                  placeholder={"Paste Activation URL"}/>
              </Col>
          </Row>
          <Row  justify="center" 
            style={{margin: "10px", textAlign:'center'}}>
              <Col  span={24} >
              <Button className={'button'} type={'primary'} 
                loading={loading} onClick={onClick} >
                Activate Bye DUO!
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
