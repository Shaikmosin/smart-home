const express = require('express');
const cors = require('cors');
const snap7 = require('node-snap7');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Create a new S7 client
const plc = new snap7.S7Client();

// Connect to the PLC (update IP with your PLC IP address)
plc.ConnectTo('192.168.0.1', 0, 1, function(err) {
  if (err) {
    console.log('Connection failed. Code:', err);
  } else {
    console.log('Connected to PLC');
  }
});

// Route to control device
app.post('/api/device/:device', (req, res) => {
  const { device } = req.params;
  const { state } = req.body;

  // Example: write to DB1, byte 0, bit 0
  const byteOffset = 0;
  const bitOffset = 0;
  const value = state ? 1 : 0;

  plc.WriteArea(
    snap7.S7AreaDB,  // area type
    1,               // DB number (DB1)
    byteOffset,      // start byte
    Buffer.from([value]), // value
    function(err) {
      if (err) {
        console.log('Write failed:', err);
        res.status(500).send('Failed to write to PLC');
      } else {
        res.send({ success: true, device, state });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
