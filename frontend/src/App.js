import './App.less';
import { useState, useEffect } from 'react';
import axios from 'axios';
import twoFA from '2fa-utils';
import hi_base_32 from 'hi-base32';
import { Button, Input, Row, Col,  List, Form } from 'antd';
import { CopyOutlined,RedoOutlined, CheckCircleOutlined } from '@ant-design/icons'
import {CopyToClipboard} from 'react-copy-to-clipboard';


const API = process.env.REACT_APP_API;

const STEPS = [
  <span>Log in to NYU. At the Multi-Factor Authentication page, 
  click <b>"Add a new device"</b> on the left side of the screen.</span>, 
  <span>Select <b>“Tablet,”</b> and then select <b>“iOS”</b> on the next page.</span>,
  <span>Click <b>“I have Duo Mobile installed,”</b> 
    then <b>”Email me an activation link instead.”</b></span>,
  <span>In your email, click on the activation link and paste the popup's URL 
    (not the activation code) into Bye DUO's input bar. 
    Click <b>“Activate Bye DUO”</b></span>,
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
        document.getElementsByTagName(`html`)[0].style.height = '180px';
        chrome.storage.sync.get(['count'], function(result) {
          setPasscode(generatePasscode(secret_result.secret, result.count));
        });
        setSecret(secret_result.secret);
      }
      else {
        document.getElementsByTagName(`html`)[0].style.height = '480px';
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

  const error = (text) => {
    setMessage(text);
    setLoading(false);
  }
  
  const onClick = (event) => {
    console.log('api:')
    console.log(API)
    setLoading(true);
    if(!link.length || link.search(/https:\/\//i) === -1
      || link.search(/m-/i) === -1
      || link.search(/urldefense/i) !== -1) {
      error("Use popup's URL by clicking on link in email");
      return;
    }
    const form = new FormData();
    form.append('secret', link);
    axios.post(API, form)
      .then(res => {
        if(res.status === 200) {
          const newSecret = hi_base_32.encode(res.data)
          chrome.storage.sync.set({secret: newSecret}, function() {});
          chrome.storage.sync.set({count: 0}, function() {});
          document.getElementsByTagName(`html`)[0].style.height = '180px';
          setPasscode(generatePasscode(newSecret, 0));
          setSecret(newSecret);
          setLoading(false);
        }
        else {
          error("Use popup's URL by clicking on link in email");
        }
      })
      .catch(err => {
        error("Use popup's URL by clicking on link in email");
      });

    // dev mode: 

    // const secret = hi_base_32.encode('3c9b7138faaab1417406f348b31d1638')
    // chrome.storage.sync.set({secret: secret}, function() {});
    // chrome.storage.sync.set({count: 0}, function() {});
    // document.getElementsByTagName(`html`)[0].style.height = '180px';
    // setSecret(secret);
    // setLoading(false);
    // setPasscode(generatePasscode(secret, 0));
  }

  return (
    <div className="App">
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
                  <span>
                    <span className="number">{(index + 1) + '. '}</span>
                    {item}
                  </span>  
                </List.Item>
              )}
            />
              </Col>
          </Row>
          <Row justify="center" >
          <Col span={23} >

            <Form style={{textAlign: 'center'}}>
              <Form.Item
                    validateStatus={!message.length? 'success': 'error'}
                    help={!message.length? false: message}
              >
                <Input className='input'
                    type="text" disabled={loading} onChange={onChange} 
                    placeholder={"Paste Activation URL"}/>
              </Form.Item>
                  
              <Form.Item >
                <Button className='button' type='primary' 
                  loading={loading} onClick={onClick} >
                  Activate Bye DUO 🔓
                </Button>
              </Form.Item>
            </Form>
            </Col>
          </Row>
        </div>
      }
      </div>
    </div>
  );
}

export default App;
