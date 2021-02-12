import './App.css';
import { useState } from 'react';
import axios from 'axios';
import hi_base_32 from 'hi-base32';

// 3c9b7138faaab1417406f348b31d1638

const API = 'http://127.0.0.1:5000/secret'

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const onChange = (event) => {
    setLink(event.target.value);
  }
  const onClick = (event) => {
    const count = localStorage.getItem('count') || 0;
    setLoading(true);
    const form = new FormData();
    form.append('secret', 'https://m-e4c9863e.duosecurity.com/iphone/S9I0Dwm7ju9V0jvoxWqM');    
    localStorage.setItem('count', parseInt(count)+1);
    axios.post(API, 
        form)
      .then(res => {
        if(res.status === 200) {
          localStorage.setItem('secret', res.data);
          const encode = hi_base_32.encode(res.data)
          console.log(encode)
          console.log(twoFA.generateHOTP(encode, 0))
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
      <input type="text" onChange={onChange} />
      <input type="button" value="go!" onClick={onClick} />
    </div>
  );
}

export default App;
