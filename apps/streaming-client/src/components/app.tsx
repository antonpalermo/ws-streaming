export default function App() {
  async function getDisplayMedia() {
    const devices = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    console.log(devices);
  }

  return (
    <div>
      <h1>Streaming Client</h1>
      <p>Open the console to see the messages</p>

      <button onClick={getDisplayMedia}>Share Screen</button>
    </div>
  );
}
