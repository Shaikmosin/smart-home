const express = require('express');
const ModbusRTU = require('modbus-serial');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new ModbusRTU();
const PLC_IP = "192.168.1.10"; // Replace with your PLC IP
const PLC_PORT = 502;

async function connectPLC() {
  try {
    await client.connectTCP(PLC_IP, { port: PLC_PORT });
    client.setID(1); // Modbus slave ID
    console.log("Connected to PLC");
  } catch (err) {
    console.error("PLC Connection Error:", err);
  }
}

connectPLC();

// Map devices to Modbus coil addresses
const deviceMap = {
  light: 0, // Coil 0
  fan: 1    // Coil 1
};

app.post('/api/device/:device', async (req, res) => {
  const { device } = req.params;
  const { state } = req.body;

  const coil = deviceMap[device];
  if (coil === undefined) return res.status(400).send({ error: "Unknown device" });

  try {
    await client.writeCoil(coil, state);
    res.send({ success: true, device, state });
  } catch (error) {
    res.status(500).send({ error: "Failed to write to PLC", details: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
