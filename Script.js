<script>
    // PLC Configuration
    const PLC_IP = '192.168.0.1'; // Replace with your PLC's IP
    const PLC_USER = 'admin';      // Web server username
    const PLC_PASS = 'admin123';   // Web server password
    
    // Initialize device states for 3 rooms
    if (!localStorage.getItem('roomDevices')) {
      const initDevices = {
        '1': { light: false, fan: false, socket: false },
        '2': { light: false, fan: false, socket: false },
        '3': { light: false, fan: false, socket: false }
      };
      localStorage.setItem('roomDevices', JSON.stringify(initDevices));
    }
    
    // Initialize student database
    if (!localStorage.getItem('students')) {
      const initStudents = {
        'S001': { name: 'John Doe', phone: '1234567890', room: '1', password: 'pass123' },
        'S002': { name: 'Jane Smith', phone: '0987654321', room: '1', password: 'pass123' },
        'S003': { name: 'Alex Johnson', phone: '1122334455', room: '2', password: 'pass123' }
      };
      localStorage.setItem('students', JSON.stringify(initStudents));
    }
    
    // Initialize room occupancy
    if (!localStorage.getItem('roomOccupancy')) {
      const initOccupancy = {
        '1': true,
        '2': true,
        '3': false
      };
      localStorage.setItem('roomOccupancy', JSON.stringify(initOccupancy));
    }
    
    const studentDB = JSON.parse(localStorage.getItem('students'));
    let roomDevices = JSON.parse(localStorage.getItem('roomDevices'));
    let roomOccupancy = JSON.parse(localStorage.getItem('roomOccupancy'));
    let currentStudentRoom = '';
    let currentStudentId = '';
    
    // Show notification
    function showNotification(message, isSuccess = true) {
      const notification = document.createElement('div');
      notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
      notification.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
    
    // Role selection
    function selectRole(role) {
      document.getElementById('welcome-screen').classList.add('hidden');
      
      if (role === 'student') {
        document.getElementById('student-login').classList.remove('hidden');
      } else {
        document.getElementById('warden-login').classList.remove('hidden');
      }
    }
    
    // Show role selection
    function showRoleSelection() {
      document.getElementById('student-login').classList.add('hidden');
      document.getElementById('warden-login').classList.add('hidden');
      document.getElementById('welcome-screen').classList.remove('hidden');
    }
    
    // Student login
    function studentLogin() {
      const id = document.getElementById('student-id').value;
      const pass = document.getElementById('student-password').value;
      
      if (studentDB[id] && studentDB[id].password === pass) {
        currentStudentId = id;
        currentStudentRoom = studentDB[id].room;
        
        document.getElementById('student-login').classList.add('hidden');
        document.getElementById('student-dashboard').classList.remove('hidden');
        
        // Update dashboard
        updateStudentDashboard();
        showNotification('Login successful!');
      } else {
        showNotification('Invalid credentials', false);
      }
    }
    
    // Update student dashboard
    function updateStudentDashboard() {
      const student = studentDB[currentStudentId];
      const room = student.room;
      
      // Get room occupants
      const occupants = Object.values(studentDB)
        .filter(s => s.room === room)
        .map(s => s.name);
      
      // Update room info
      document.getElementById('room-number').textContent = room;
      document.getElementById('room-occupants').textContent = occupants.join(', ');
      
      // Update device states
      const devices = roomDevices[room];
      document.getElementById('light-switch').checked = devices.light;
      document.getElementById('light-status').textContent = devices.light ? 'ON' : 'OFF';
      document.getElementById('light-status').className = devices.light ? 
        'device-status status-on' : 'device-status status-off';
      
      document.getElementById('fan-switch').checked = devices.fan;
      document.getElementById('fan-status').textContent = devices.fan ? 'ON' : 'OFF';
      document.getElementById('fan-status').className = devices.fan ? 
        'device-status status-on' : 'device-status status-off';
      
      document.getElementById('socket-switch').checked = devices.socket;
      document.getElementById('socket-status').textContent = devices.socket ? 'ON' : 'OFF';
      document.getElementById('socket-status').className = devices.socket ? 
        'device-status status-on' : 'device-status status-off';
    }
    
    // Toggle device
    function toggleDevice(device) {
      if (!currentStudentRoom) return;
      
      // Update device state
      const newState = !roomDevices[currentStudentRoom][device];
      roomDevices[currentStudentRoom][device] = newState;
      localStorage.setItem('roomDevices', JSON.stringify(roomDevices));
      
      // Send PLC command
      sendPLCCommand(currentStudentRoom, device, newState);
      
      // Update UI
      updateStudentDashboard();
      
      showNotification(`${device.charAt(0).toUpperCase() + device.slice(1)} turned ${newState ? 'ON' : 'OFF'}`);
    }
    
    // Send PLC command
    function sendPLCCommand(room, device, state) {
      // Map device to PLC tag
      const plcTag = `Room${room}_${device.charAt(0).toUpperCase() + device.slice(1)}`;
      
      // Update hidden input for TIA Portal
      const hiddenInput = document.querySelector(`input[name="${plcTag}"]`);
      if (hiddenInput) {
        hiddenInput.value = state ? '1' : '0';
      }
      
      // Send command to PLC (simulated)
      console.log(`PLC Command: ${plcTag} = ${state ? 1 : 0}`);
      
      // In real implementation, uncomment this:
      /*
      fetch(`http://${PLC_IP}/awp/HostelControl/set_value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${PLC_USER}:${PLC_PASS}`)
        },
        body: JSON.stringify({
          "tag": plcTag,
          "value": state ? 1 : 0
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('PLC command failed');
        console.log(`PLC command sent: ${plcTag} = ${state ? 1 : 0}`);
      })
      .catch(error => {
        console.error('PLC communication error:', error);
        showNotification('PLC communication failed', false);
      });
      */
    }
    
    // Warden login
    function wardenLogin() {
      const u = document.getElementById('warden-user').value;
      const p = document.getElementById('warden-pass').value;
      
      if (u === 'admin' && p === 'admin123') {
        document.getElementById('warden-login').classList.add('hidden');
        document.getElementById('warden-dashboard').classList.remove('hidden');
        showRooms();
        showNotification('Warden login successful!');
      } else {
        showNotification('Invalid credentials', false);
      }
    }
    
    // Show rooms
    function showRooms() {
      const content = document.getElementById('warden-content');
      content.innerHTML = `
        <h3><i class="fas fa-door-closed"></i> Hostel Rooms</h3>
        <div class="room-grid" id="rooms-container"></div>
      `;
      
      const container = document.getElementById('rooms-container');
      
      // Show all 3 rooms
      for (let room = 1; room <= 3; room++) {
        const students = Object.values(studentDB)
          .filter(s => s.room === room.toString())
          .map(s => s.name);
        
        const isOccupied = roomOccupancy[room.toString()];
        const devices = roomDevices[room.toString()];
        
        container.innerHTML += `
          <div class="room-card" onclick="viewRoom('${room}')">
            <div class="room-card-header">
              <div class="room-id">Room ${room}</div>
              <div class="occupancy-status ${isOccupied ? 'occupied' : 'vacant'}">
                ${isOccupied ? 'Occupied' : 'Vacant'}
              </div>
            </div>
            
            <div class="device-status">
              <div><i class="fas fa-lightbulb"></i> Light: ${devices.light ? 'ON' : 'OFF'}</div>
              <div><i class="fas fa-fan"></i> Fan: ${devices.fan ? 'ON' : 'OFF'}</div>
              <div><i class="fas fa-plug"></i> Socket: ${devices.socket ? 'ON' : 'OFF'}</div>
            </div>
            
            <div class="room-students">
              <strong>Students:</strong>
              ${students.length > 0 ? 
                students.map(name => `<div class="student-item">${name}</div>`).join('') : 
                '<div class="student-item">No students assigned</div>'}
            </div>
          </div>
        `;
      }
    }
    
    // View room details
    function viewRoom(room) {
      const students = Object.entries(studentDB)
        .filter(([id, data]) => data.room === room)
        .map(([id, data]) => ({ id, ...data }));
      
      const dev = roomDevices[room] || { light: false, fan: false, socket: false };
      const occ = roomOccupancy[room];
      
      let studentsHTML = '';
      students.forEach(student => {
        studentsHTML += `
          <div class="student-item">
            <div>${student.name}</div>
            <div>
              <button class="btn btn-secondary" onclick="removeStudent('${student.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      });
      
      document.getElementById('warden-content').innerHTML = `
        <div class="room-info">
          <h3 class="room-title"><i class="fas fa-door-open"></i> Room ${room}</h3>
          
          <div class="room-meta">
            <div class="meta-item">
              <i class="fas fa-users"></i> Status: 
              <span class="${occ ? 'occupied' : 'vacant'}">${occ ? 'Occupied' : 'Vacant'}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-user-friends"></i> Occupants: ${students.length}/3
            </div>
          </div>
        </div>
        
        <div class="device-controls">
          <div class="device-card">
            <div class="device-icon">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3 class="device-name">Light</h3>
            <div class="device-status ${dev.light ? 'status-on' : 'status-off'}">
              ${dev.light ? 'ON' : 'OFF'}
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${dev.light ? 'checked' : ''} 
                onchange="wardenToggleDevice('${room}', 'light')">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="device-card">
            <div class="device-icon">
              <i class="fas fa-fan"></i>
            </div>
            <h3 class="device-name">Fan</h3>
            <div class="device-status ${dev.fan ? 'status-on' : 'status-off'}">
              ${dev.fan ? 'ON' : 'OFF'}
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${dev.fan ? 'checked' : ''} 
                onchange="wardenToggleDevice('${room}', 'fan')">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="device-card">
            <div class="device-icon">
              <i class="fas fa-plug"></i>
            </div>
            <h3 class="device-name">Socket</h3>
            <div class="device-status ${dev.socket ? 'status-on' : 'status-off'}">
              ${dev.socket ? 'ON' : 'OFF'}
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${dev.socket ? 'checked' : ''} 
                onchange="wardenToggleDevice('${room}', 'socket')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
        
        <h3 style="margin-top: 30px;"><i class="fas fa-user-graduate"></i> Students in Room</h3>
        <div class="room-students">
          ${studentsHTML || '<div class="student-item">No students in this room</div>'}
        </div>
        
        <button class="btn" onclick="showRooms()" style="margin-top: 20px;">
          <i class="fas fa-arrow-left"></i> Back to Rooms
        </button>
      `;
    }
    
    // Warden toggle device
    function wardenToggleDevice(room, device) {
      // Update device state
      roomDevices[room][device] = !roomDevices[room][device];
      localStorage.setItem('roomDevices', JSON.stringify(roomDevices));
      
      // Send PLC command
      sendPLCCommand(room, device, roomDevices[room][device]);
      
      showNotification(`Room ${room} ${device} turned ${roomDevices[room][device] ? 'ON' : 'OFF'}`);
    }
    
    // Remove student from room
    function removeStudent(studentId) {
      if (confirm('Remove this student from the room?')) {
        delete studentDB[studentId];
        localStorage.setItem('students', JSON.stringify(studentDB));
        
        // Refresh view
        const room = document.querySelector('.room-title').textContent.match(/\d+/)[0];
        viewRoom(room);
        showNotification('Student removed successfully!');
      }
    }
    
    // Show registration form
    function showRegister() {
      document.getElementById('warden-content').innerHTML = `
        <h3><i class="fas fa-user-plus"></i> Register New Student</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="reg-id">Student ID</label>
            <input type="text" id="reg-id" placeholder="Enter ID">
          </div>
          
          <div class="form-group">
            <label for="reg-name">Full Name</label>
            <input type="text" id="reg-name" placeholder="Enter name">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="reg-phone">Phone Number</label>
            <input type="text" id="reg-phone" placeholder="Enter phone">
          </div>
          
          <div class="form-group">
            <label for="reg-room">Room Number</label>
            <select id="reg-room">
              <option value="1">Room 1</option>
              <option value="2">Room 2</option>
              <option value="3">Room 3</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="reg-pass">Password</label>
          <input type="password" id="reg-pass" placeholder="Enter password">
        </div>
        
        <button class="btn" onclick="registerStudent()">Register Student</button>
      `;
    }
    
    // Register student
    function registerStudent() {
      const id = document.getElementById('reg-id').value;
      const name = document.getElementById('reg-name').value;
      const phone = document.getElementById('reg-phone').value;
      const room = document.getElementById('reg-room').value;
      const pass = document.getElementById('reg-pass').value;
      
      if (!id || !name || !phone || !pass) {
        showNotification('Please fill all fields', false);
        return;
      }
      
      if (studentDB[id]) {
        showNotification('Student ID already exists', false);
        return;
      }
      
      // Check room capacity
      const studentsInRoom = Object.values(studentDB).filter(s => s.room === room);
      if (studentsInRoom.length >= 3) {
        showNotification('Room is at full capacity', false);
        return;
      }
      
      // Register student
      studentDB[id] = { name, phone, room, password: pass };
      localStorage.setItem('students', JSON.stringify(studentDB));
      
      // Update room occupancy
      roomOccupancy[room] = true;
      localStorage.setItem('roomOccupancy', JSON.stringify(roomOccupancy));
      
      showNotification('Student registered successfully!');
      showRegister();
    }
    
    // Show reports
    function showReports() {
      let reportHTML = `
        <h3><i class="fas fa-chart-bar"></i> Hostel Reports</h3>
        
        <div class="room-meta" style="margin-top: 20px;">
          <div class="meta-item">
            <i class="fas fa-door-open"></i> Total Rooms: 3
          </div>
          <div class="meta-item">
            <i class="fas fa-bed"></i> Occupied Rooms: ${Object.values(roomOccupancy).filter(o => o).length}
          </div>
          <div class="meta-item">
            <i class="fas fa-user-graduate"></i> Total Students: ${Object.keys(studentDB).length}
          </div>
        </div>
        
        <h3 style="margin-top: 30px;">Room Utilization</h3>
        <div style="display: flex; gap: 15px; margin-top: 15px;">
          ${[1, 2, 3].map(room => {
            const students = Object.values(studentDB).filter(s => s.room === room.toString()).length;
            const percentage = (students / 3) * 100;
            return `
              <div style="flex: 1; text-align: center;">
                <div style="font-weight: bold;">Room ${room}</div>
                <div style="height: 20px; background: rgba(255,255,255,0.1); margin-top: 5px; border-radius: 10px; overflow: hidden;">
                  <div style="height: 100%; width: ${percentage}%; background: var(--success);"></div>
                </div>
                <div style="margin-top: 5px;">${students}/3 (${Math.round(percentage)}%)</div>
              </div>
            `;
          }).join('')}
        </div>
        
        <h3 style="margin-top: 30px;">Device Usage</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
          ${['light', 'fan', 'socket'].map(device => {
            const activeCount = Object.values(roomDevices).filter(dev => dev[device]).length;
            return `
              <div class="device-card">
                <div class="device-icon">
                  <i class="fas fa-${device === 'light' ? 'lightbulb' : device === 'fan' ? 'fan' : 'plug'}"></i>
                </div>
                <h3 class="device-name">${device.charAt(0).toUpperCase() + device.slice(1)}</h3>
                <div class="device-status status-on">${activeCount} Active</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      
      document.getElementById('warden-content').innerHTML = reportHTML;
    }
    
    // Logout
    function logout() {
      // Hide all dashboards
      document.getElementById('student-dashboard').classList.add('hidden');
      document.getElementById('warden-dashboard').classList.add('hidden');
      
      // Clear inputs
      document.getElementById('student-id').value = '';
      document.getElementById('student-password').value = '';
      document.getElementById('warden-user').value = '';
      document.getElementById('warden-pass').value = '';
      
      // Show welcome screen
      document.getElementById('welcome-screen').classList.remove('hidden');
      currentStudentRoom = '';
      currentStudentId = '';
      
      showNotification('You have been logged out');
    }
  </script>
</body>
</html>
