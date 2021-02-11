import './App.css';
import { useState } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000/secret'

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const onChange = (event) => {
    setLink(event.target.value);
  }
  const onClick = (event) => {
    setLoading(true);
    const form = new FormData();
    form.append('secret', 'https://m-e4c9863e.duosecurity.com/iphone/S9I0Dwm7ju9V0jvoxWqM');    
    axios.post(API, 
        form)
      .then(res => {
        if(res.status === 200) {
          console.log(res.data);
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
