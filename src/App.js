import './App.css';
import Main from './pages/main';
import { WalletContext, WalletProvider } from './WalletContext';
import { StarknetProvider } from "./component/starknet-provider";
window.Buffer = window.Buffer || require("buffer").Buffer;
function App() {
  return (
    <div className="App">
      <StarknetProvider>
        <WalletProvider>
          <Main />
        </WalletProvider>
      </StarknetProvider>


    </div>
  );
}

export default App;
