import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import twoFA from '2fa-utils';
import hi_base_32 from 'hi-base32';

// 3c9b7138faaab1417406f348b31d1638

const API = 'http://127.0.0.1:5000/secret'

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [passcode, setPasscode] = useState('');
  useEffect(() => {
    const secret = localStorage.getItem('secret');
    setSecret(secret);
    if(secret) {
      const count = localStorage.getItem('count');
      setPasscode(twoFA.generateHOTP(secret, count));
      localStorage.setItem('count', count + 1);
    }
  }, []);
  const onChange = event => {
    setLink(event.target.value);
  }
  const onGenerate = event => {
    const count = localStorage.getItem('count');
    setPasscode(twoFA.generateHOTP(secret, count));
    localStorage.setItem('count', count + 1);
  }
  const onClick = (event) => {
    setLoading(true);
    const form = new FormData();
    form.append('secret', link);
    axios.post(API, form)
      .then(res => {
        if(res.status === 200) {
          const secret = hi_base_32.encode(res.data)
          localStorage.setItem('secret', secret);
          localStorage.setItem('count', 0);
          setSecret(secret);
          setLoading(false);
        }
        else {
          console.error('failed');
        }
      })
      .catch(err => {
        console.error(err);
      });
  }
  return (
    <div className="App">
      { secret?
        <div>
        <div>{passcode}</div>
        <input type="button" value="generate" onClick={onGenerate} />
        </div>
        :
        <div>
          <input type="text" onChange={onChange} />
          <input type="button" value="go!" onClick={onClick} />
        </div>
      }
    </div>
  );
}

export default App;
