import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import twoFA from '2fa-utils';
import hi_base_32 from 'hi-base32';
import { Button, Input, Row, Col } from 'antd';

// 3c9b7138faaab1417406f348b31d1638

const API = 'https://goodbyepass.tk/secret'

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [passcode, setPasscode] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    chrome.storage.sync.get(['secret'], function(result) {
      if(result.secret) {
        setSecret(result.secret);
        chrome.storage.sync.get(['count'], function(result) {
          setPasscode(twoFA.generateHOTP(secret, result.count));
          chrome.storage.sync.set({count: result.count+1}, function() {});
        });

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
    })

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
  }
  return (
    <div className="App">
      <div>{message}</div>
      <div>
      { secret?
        <div>
          <Row justify="center" style={{margin: "10px", fontSize: "35px"}}>
              <Col span={16} >
                {passcode}
              </Col>
          </Row>
          <Row justify="center" style={{margin: "10px"}}>
              <Col>
                <Button type="primary"  onClick={onGenerate} >
                  generate passcode
                </Button>
              </Col>
          </Row>

        </div>
        :
        <div>
          <Row justify="center" style={{margin: "10px"}}>
              <Col span={20} >
                <Input type="text" disabled={loading} onChange={onChange} />
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
