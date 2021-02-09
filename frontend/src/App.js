import logo from './logo.svg';
import './App.css';

function App() {
  fetch("https://www.google.com", {mode: 'cors'})
    .then(data => {
      console.log(data)
    })
    .catch(err => {
      console.log(err);
    })
  return (
    <div className="App">
      
    </div>
  );
}

export default App;
