// Continue with rest of functions...

// Handle text input responses
function handleWelcomeTextInput(message) {
    console.log('🔍 Welcome flow handleWelcomeTextInput called with:', message);
    console.log('🔍 Current welcome state:', window.welcomeState);

    if (!window.welcomeState || !window.welcomeState.waitingForTextResponse) {
        console.log('❌ Welcome flow not active, returning false');
        return false;
    }

    const currentType = window.welcomeState.currentQuestionType;
    console.log('🔍 Current question type:', currentType);

    // Reset state
    window.welcomeState.waitingForTextResponse = false;
    window.welcomeState.currentQuestionType = null;

    // Add user message
    addMessage(message, 'user');

    // Process based on current question
    switch (currentType) {
        case 'ready_to_start':
            console.log('✅ Processing ready to start response');
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('yes') || lowerMsg.includes('ready') || lowerMsg.includes('start') || lowerMsg.includes('let\'s go')) {
                setTimeout(() => {
                    handleWelcomeResponse('role_question', message);
                }, 800);
            } else {
                // If they say no or something unclear, acknowledge and ask again
                addMessage(`No worries! Take your time. When you're ready, just let me know and we\'ll begin.`, 'ai');
                window.welcomeState.waitingForTextResponse = true;
                window.welcomeState.currentQuestionType = 'ready_to_start';
            }
            break;

        case 'role_question':
            console.log('✅ Processing role question response');
            setTimeout(() => {
                handleWelcomeResponse('time_in_role', message);
            }, 800);
            break;

        case 'time_in_role':
            setTimeout(() => {
                handleWelcomeResponse('team_involvement', message);
            }, 800);
            break;

        case 'team_involvement':
            setTimeout(() => {
                const lowerMessage = message.toLowerCase();
                
                // Check if they said no
                if (lowerMessage.includes('no') || lowerMessage.includes('none') || lowerMessage.includes('solo') || 
                    lowerMessage.includes('myself') || lowerMessage.includes('alone')) {
                    handleWelcomeResponse('team_size', message);
                } else {
                    // Check if they provided name/email/role directly
                    const hasEmail = message.includes('@');
                    const hasComma = message.includes(',');
                    
                    // If message contains email or comma-separated values, treat it as team details
                    if (hasEmail || hasComma) {
                        // They provided details directly - process inline
                        // Parse the team member details from the message
                        const details = message.trim();
                        let teamMemberName = 'your colleague';
                        let teamMemberEmail = '';
                        let teamMemberRole = '';
                        
                        // Parse comma-separated values
                        const parts = details.split(',').map(part => part.trim());
                        
                        if (parts.length >= 1) {
                            teamMemberName = parts[0] || 'your colleague';
                        }
                        
                        // Try different orderings since users might enter in different orders
                        for (let i = 1; i < parts.length; i++) {
                            const part = parts[i];
                            // Check if it's an email
                            if (part.includes('@')) {
                                teamMemberEmail = part;
                            } else {
                                // Otherwise it's likely the role
                                teamMemberRole = part;
                            }
                        }
                        
                        // Store the parsed team member details
                        window.welcomeResponses.teamMemberDetails = {
                            name: teamMemberName,
                            email: teamMemberEmail,
                            role: teamMemberRole
                        };
                        
                        // Check if we need to ask for missing information
                        if (!teamMemberEmail) {
                            // Ask for email directly without intermediate message
                            addMessage(`<strong>What's ${teamMemberName}'s email address?</strong>
                                
We'll need this to send them the invitation.`, 'ai');
                            
                            // Set state to wait for email
                            window.welcomeState.waitingForTextResponse = true;
                            window.welcomeState.currentQuestionType = 'team_email';
                            window.welcomeState.currentStep = 'team_email';
                        } else {
                            // We have all info, show the mailman animation with full details
                            let detailsText = '';
                            if (teamMemberRole) {
                                detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${teamMemberName} (${teamMemberRole}) at ${teamMemberEmail}</span>`;
                            } else {
                                detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${teamMemberName} at ${teamMemberEmail}</span>`;
                            }
                            
                            const acknowledgement = `<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                                <div class="mailman-animation" style="width: 100px; height: 80px; position: relative;">
                                    <svg width="100" height="80" viewBox="0 0 100 80" style="position: absolute; top: 0; left: 0;">
                                        <!-- Background ground line -->
                                        <line x1="0" y1="65" x2="100" y2="65" stroke="#e0e0e0" stroke-width="1"/>
                                        
                                        <!-- Stylized Postbox -->
                                        <g>
                                            <!-- Shadow -->
                                            <ellipse cx="72" cy="64" rx="12" ry="3" fill="#00000020"/>
                                            <!-- Post -->
                                            <rect x="70" y="45" width="4" height="20" fill="#0d47a1"/>
                                            <!-- Box -->
                                            <rect x="60" y="30" width="24" height="20" rx="2" fill="#1976d2"/>
                                            <!-- Box details -->
                                            <rect x="64" y="35" width="16" height="3" fill="#0d47a1"/>
                                            <rect x="64" y="40" width="16" height="3" fill="#0d47a1"/>
                                            <!-- Flag -->
                                            <rect x="84" y="32" width="12" height="8" fill="#d32f2f" class="flag-wave"/>
                                        </g>
                                        
                                        <!-- Stylized Mailman -->
                                        <g class="mailman-walk" transform="translate(10, 40)">
                                            <!-- Shadow -->
                                            <ellipse cx="0" cy="24" rx="8" ry="2" fill="#00000020" class="mailman-shadow"/>
                                            
                                            <!-- Body -->
                                            <rect x="-8" y="-5" width="16" height="18" rx="2" fill="#1976d2"/>
                                            
                                            <!-- Head -->
                                            <circle cx="0" cy="-15" r="8" fill="#fdbcb4"/>
                                            <!-- Hat -->
                                            <path d="M -8 -20 Q 0 -24 8 -20 L 8 -18 Q 0 -14 -8 -18 Z" fill="#0d47a1"/>
                                            <circle cx="0" cy="-22" r="2" fill="#1976d2"/>
                                            
                                            <!-- Arms and Letter -->
                                            <g class="arm-group">
                                                <!-- Left arm -->
                                                <rect x="-12" y="-2" width="4" height="10" rx="2" fill="#fdbcb4" transform-origin="-10 -2" class="arm-left"/>
                                                <circle cx="-10" cy="8" r="3" fill="#fdbcb4" class="hand-left"/>
                                                
                                                <!-- Right arm holding letter -->
                                                <rect x="8" y="-2" width="4" height="10" rx="2" fill="#fdbcb4" transform-origin="10 -2" class="arm-right"/>
                                                <circle cx="10" cy="8" r="3" fill="#fdbcb4" class="hand-right"/>
                                                
                                                <!-- Letter -->
                                                <g class="letter">
                                                    <rect x="8" y="6" width="10" height="7" fill="white" stroke="#e0e0e0"/>
                                                    <path d="M 8 6 L 13 9 L 18 6" stroke="#ff5252" fill="none" stroke-width="0.5"/>
                                                </g>
                                            </g>
                                            
                                            <!-- Legs -->
                                            <rect x="-6" y="12" width="4" height="12" rx="2" fill="#424242" class="leg-left"/>
                                            <rect x="2" y="12" width="4" height="12" rx="2" fill="#424242" class="leg-right"/>
                                        </g>
                                        
                                        <!-- Delivered check mark (initially hidden) -->
                                        <g class="delivered-check" opacity="0" transform="translate(72, 15)">
                                            <circle cx="0" cy="0" r="12" fill="#4caf50"/>
                                            <path d="M -6 0 L -2 4 L 6 -4" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                    </svg>
                                </div>
                                <div style="flex: 1;">
                                    <strong>Great! I'll coordinate with your team to make this process smoother</strong>
                                    ${detailsText}
                                </div>
                            </div>
                            <style>
                            @keyframes mailmanWalk {
                                0% { transform: translate(10px, 40px); }
                                100% { transform: translate(55px, 40px); }
                            }
                            
                            @keyframes mailmanShadow {
                                0% { transform: translateX(0); opacity: 0.3; }
                                100% { transform: translateX(45px); opacity: 0.1; }
                            }
                            
                            @keyframes walkLegLeft {
                                0%, 100% { transform: rotate(0deg); }
                                25% { transform: rotate(20deg); }
                                75% { transform: rotate(-20deg); }
                            }
                            
                            @keyframes walkLegRight {
                                0%, 100% { transform: rotate(0deg); }
                                25% { transform: rotate(-20deg); }
                                75% { transform: rotate(20deg); }
                            }
                            
                            @keyframes walkArmRight {
                                0%, 100% { transform: rotate(0deg); }
                                50% { transform: rotate(-10deg); }
                            }
                            
                            @keyframes walkHandRight {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-2px); }
                            }
                            
                            @keyframes walkArmLeft {
                                0%, 100% { transform: rotate(0deg); }
                                25% { transform: rotate(10deg); }
                                75% { transform: rotate(-10deg); }
                            }
                            
                            @keyframes walkHandLeft {
                                0%, 100% { transform: translateY(0); }
                                25% { transform: translateY(-2px); }
                                75% { transform: translateY(2px); }
                            }
                            
                            @keyframes moveArm {
                                0% { transform: rotate(0deg); }
                                40% { transform: rotate(-45deg); }
                                70% { transform: rotate(-45deg); }
                                100% { transform: rotate(0deg); }
                            }
                            
                            @keyframes moveHand {
                                0% { transform: translate(0, 0); }
                                40% { transform: translate(8px, -8px); }
                                70% { transform: translate(8px, -8px); }
                                100% { transform: translate(0, 0); }
                            }
                            
                            @keyframes deliverLetter {
                                0% { opacity: 1; transform: translate(0, 0); }
                                40% { opacity: 1; transform: translate(8px, -4px); }
                                70% { opacity: 1; transform: translate(22px, -10px); }
                                80% { opacity: 0; transform: translate(25px, -8px); }
                                100% { opacity: 0; transform: translate(25px, -8px); }
                            }
                            
                            @keyframes flagWave {
                                0%, 100% { transform: rotate(0deg); }
                                50% { transform: rotate(10deg); }
                            }
                            
                            @keyframes showCheck {
                                0% { opacity: 0; transform: scale(0) rotate(-180deg); }
                                50% { transform: scale(1.2) rotate(0deg); }
                                100% { opacity: 1; transform: scale(1) rotate(0deg); }
                            }
                            
                            .mailman-walk { animation: mailmanWalk 3s ease-in-out forwards; }
                            .mailman-shadow { animation: mailmanShadow 3s ease-in-out forwards; }
                            .leg-left { animation: walkLegLeft 0.5s ease-in-out infinite; transform-origin: -4px 0; }
                            .leg-right { animation: walkLegRight 0.5s ease-in-out infinite; transform-origin: 4px 0; }
                            .arm-left { animation: walkArmLeft 0.5s ease-in-out infinite 0s, moveArm 3s ease-in-out forwards; }
                            .hand-left { animation: walkHandLeft 0.5s ease-in-out infinite 0s, moveHand 3s ease-in-out forwards; }
                            .arm-right { animation: walkArmRight 0.5s ease-in-out infinite; }
                            .hand-right { animation: walkHandRight 0.5s ease-in-out infinite; }
                            .letter { animation: deliverLetter 3s ease-in-out forwards; }
                            .flag-wave { animation: flagWave 1s ease-in-out infinite; transform-origin: 0 6px; }
                            .delivered-check { animation: showCheck 0.5s ease-out 2.5s forwards; }
                            </style>`;
                            
                            addMessage(acknowledgement, 'ai');
                            
                            // We have all info, move to team size question
                            setTimeout(() => {
                                handleWelcomeResponse('team_size', null);
                            }, 2000);
                        }
                        return; // Exit early
                    } else {
                        // They said yes or something similar, ask for details
                        handleWelcomeResponse('team_details', message);
                    }
                }
            }, 800);
            break;

        case 'team_email':
            // User is providing email for the team member
            const teamMemberEmail = message.trim();
            
            // Update the stored team member details with the email
            if (window.welcomeResponses.teamMemberDetails) {
                window.welcomeResponses.teamMemberDetails.email = teamMemberEmail;
                
                // Show mailman animation with full details now that we have all info
                const name = window.welcomeResponses.teamMemberDetails.name || 'your colleague';
                const role = window.welcomeResponses.teamMemberDetails.role;
                
                let detailsText = '';
                if (role) {
                    detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${name} (${role}) at ${teamMemberEmail}</span>`;
                } else {
                    detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${name} at ${teamMemberEmail}</span>`;
                }
                
                const acknowledgement = `<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                    <div class="mailman-animation" style="width: 100px; height: 80px; position: relative;">
                        <svg width="100" height="80" viewBox="0 0 100 80" style="position: absolute; top: 0; left: 0;">
                            <!-- Background ground line -->
                            <line x1="0" y1="65" x2="100" y2="65" stroke="#e0e0e0" stroke-width="1"/>
                            
                            <!-- Stylized Postbox -->
                            <g>
                                <!-- Shadow -->
                                <ellipse cx="72" cy="64" rx="12" ry="3" fill="#00000020"/>
                                <!-- Post -->
                                <rect x="70" y="45" width="4" height="20" fill="#0d47a1"/>
                                <!-- Box -->
                                <rect x="60" y="30" width="24" height="20" rx="2" fill="#1976d2"/>
                                <!-- Box details -->
                                <rect x="64" y="35" width="16" height="3" fill="#0d47a1"/>
                                <rect x="64" y="40" width="16" height="3" fill="#0d47a1"/>
                                <!-- Flag -->
                                <rect x="84" y="32" width="12" height="8" fill="#d32f2f" class="flag-wave"/>
                            </g>
                            
                            <!-- Stylized Mailman -->
                            <g class="mailman-walk" transform="translate(10, 40)">
                                <!-- Shadow -->
                                <ellipse cx="0" cy="24" rx="8" ry="2" fill="#00000020" class="mailman-shadow"/>
                                
                                <!-- Body -->
                                <rect x="-8" y="-5" width="16" height="18" rx="2" fill="#1976d2"/>
                                
                                <!-- Head -->
                                <circle cx="0" cy="-15" r="8" fill="#fdbcb4"/>
                                <!-- Hat -->
                                <path d="M -8 -20 Q 0 -24 8 -20 L 8 -18 Q 0 -14 -8 -18 Z" fill="#0d47a1"/>
                                <circle cx="0" cy="-22" r="2" fill="#1976d2"/>
                                
                                <!-- Arms and Letter -->
                                <g class="arm-group">
                                    <!-- Left arm -->
                                    <rect x="-12" y="-2" width="4" height="10" rx="2" fill="#fdbcb4" transform-origin="-10 -2" class="arm-left"/>
                                    <circle cx="-10" cy="8" r="3" fill="#fdbcb4" class="hand-left"/>
                                    
                                    <!-- Right arm holding letter -->
                                    <rect x="8" y="-2" width="4" height="10" rx="2" fill="#fdbcb4" transform-origin="10 -2" class="arm-right"/>
                                    <circle cx="10" cy="8" r="3" fill="#fdbcb4" class="hand-right"/>
                                    
                                    <!-- Letter -->
                                    <g class="letter">
                                        <rect x="8" y="6" width="10" height="7" fill="white" stroke="#e0e0e0"/>
                                        <path d="M 8 6 L 13 9 L 18 6" stroke="#ff5252" fill="none" stroke-width="0.5"/>
                                    </g>
                                </g>
                                
                                <!-- Legs -->
                                <rect x="-6" y="12" width="4" height="12" rx="2" fill="#424242" class="leg-left"/>
                                <rect x="2" y="12" width="4" height="12" rx="2" fill="#424242" class="leg-right"/>
                            </g>
                            
                            <!-- Delivered check mark (initially hidden) -->
                            <g class="delivered-check" opacity="0" transform="translate(72, 15)">
                                <circle cx="0" cy="0" r="12" fill="#4caf50"/>
                                <path d="M -6 0 L -2 4 L 6 -4" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <strong>Great! I'll coordinate with your team to make this process smoother</strong>
                        ${detailsText}
                    </div>
                </div>
                <style>
                @keyframes mailmanWalk {
                    0% { transform: translate(10px, 40px); }
                    100% { transform: translate(55px, 40px); }
                }
                
                @keyframes mailmanShadow {
                    0% { transform: translateX(0); opacity: 0.3; }
                    100% { transform: translateX(45px); opacity: 0.1; }
                }
                
                @keyframes walkLegLeft {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-20deg); }
                }
                
                @keyframes walkLegRight {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-20deg); }
                    75% { transform: rotate(20deg); }
                }
                
                @keyframes walkArmRight {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-10deg); }
                }
                
                @keyframes walkHandRight {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                
                @keyframes walkArmLeft {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    75% { transform: rotate(-10deg); }
                }
                
                @keyframes walkHandLeft {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(-2px); }
                    75% { transform: translateY(2px); }
                }
                
                @keyframes moveArm {
                    0% { transform: rotate(0deg); }
                    40% { transform: rotate(-45deg); }
                    70% { transform: rotate(-45deg); }
                    100% { transform: rotate(0deg); }
                }
                
                @keyframes moveHand {
                    0% { transform: translate(0, 0); }
                    40% { transform: translate(8px, -8px); }
                    70% { transform: translate(8px, -8px); }
                    100% { transform: translate(0, 0); }
                }
                
                @keyframes deliverLetter {
                    0% { opacity: 1; transform: translate(0, 0); }
                    40% { opacity: 1; transform: translate(8px, -4px); }
                    70% { opacity: 1; transform: translate(22px, -10px); }
                    80% { opacity: 0; transform: translate(25px, -8px); }
                    100% { opacity: 0; transform: translate(25px, -8px); }
                }
                
                @keyframes flagWave {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(10deg); }
                }
                
                @keyframes showCheck {
                    0% { opacity: 0; transform: scale(0) rotate(-180deg); }
                    50% { transform: scale(1.2) rotate(0deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                
                .mailman-walk { animation: mailmanWalk 3s ease-in-out forwards; }
                .mailman-shadow { animation: mailmanShadow 3s ease-in-out forwards; }
                .leg-left { animation: walkLegLeft 0.5s ease-in-out infinite; transform-origin: -4px 0; }
                .leg-right { animation: walkLegRight 0.5s ease-in-out infinite; transform-origin: 4px 0; }
                .arm-left { animation: walkArmLeft 0.5s ease-in-out infinite 0s, moveArm 3s ease-in-out forwards; }
                .hand-left { animation: walkHandLeft 0.5s ease-in-out infinite 0s, moveHand 3s ease-in-out forwards; }
                .arm-right { animation: walkArmRight 0.5s ease-in-out infinite; }
                .hand-right { animation: walkHandRight 0.5s ease-in-out infinite; }
                .letter { animation: deliverLetter 3s ease-in-out forwards; }
                .flag-wave { animation: flagWave 1s ease-in-out infinite; transform-origin: 0 6px; }
                .delivered-check { animation: showCheck 0.5s ease-out 2.5s forwards; }
                </style>`;
                
                addMessage(acknowledgement, 'ai');
                
                // Continue to team size question
                setTimeout(() => {
                    handleWelcomeResponse('team_size', null);
                }, 2000);
            }
            break;

        case 'team_details':
            setTimeout(() => {
                // Check if user wants to skip
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('skip') || lowerMessage.includes('later')) {
                    // User wants to skip, move to company size
                    addMessage(`No problem! We can add team members later.`, 'ai');
                    setTimeout(() => {
                        handleWelcomeResponse('team_size', null);
                    }, 1000);
                    return;
                }
                
                // Parse the team member details from the message
                const details = message.trim();
                let teamMemberName = 'your colleague';
                let teamMemberEmail = '';
                let teamMemberRole = '';
                
                // Parse comma-separated values
                const parts = details.split(',').map(part => part.trim());
                
                if (parts.length >= 1) {
                    teamMemberName = parts[0] || 'your colleague';
                }
                
                // Try different orderings since users might enter in different orders
                for (let i = 1; i < parts.length; i++) {
                    const part = parts[i];
                    // Check if it's an email
                    if (part.includes('@')) {
                        teamMemberEmail = part;
                    } else {
                        // Otherwise it's likely the role
                        teamMemberRole = part;
                    }
                }
                
                // Log what we parsed for debugging
                console.log('Parsed team details:', {
                    name: teamMemberName,
                    email: teamMemberEmail,
                    role: teamMemberRole
                });
                
                // Store the parsed team member details
                window.welcomeResponses.teamMemberDetails = {
                    name: teamMemberName,
                    email: teamMemberEmail,
                    role: teamMemberRole
                };
                
                // Check if we have all required information
                const hasAllInfo = teamMemberName && teamMemberEmail;
                
                // Add acknowledgement with stylized mailman animation
                let detailsText = '';
                if (!teamMemberEmail) {
                    // We don't have email, need to ask for it
                    detailsText = `<br><span style="color: #666; font-size: 14px;">Thanks! I have ${teamMemberName}'s information.</span>`;
                } else if (teamMemberRole) {
                    detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${teamMemberName} (${teamMemberRole}) at ${teamMemberEmail}</span>`;
                } else {
                    detailsText = `<br><span style="color: #666; font-size: 14px;">I'll send an invitation to ${teamMemberName} at ${teamMemberEmail}</span>`;
                }
                
                const acknowledgement = `<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                    <div class="mailman-animation" style="width: 100px; height: 80px; position: relative;">
                        <svg width="100" height="80" viewBox="0 0 100 80" style="position: absolute; top: 0; left: 0;">
                            <!-- Background ground line -->
                            <line x1="0" y1="65" x2="100" y2="65" stroke="#e0e0e0" stroke-width="1"/>
                            
                            <!-- Stylized Postbox -->
                            <g>
                                <!-- Shadow -->
                                <ellipse cx="72" cy="64" rx="12" ry="3" fill="#00000020"/>
                                <!-- Post -->
                                <rect x="70" y="45" width="4" height="20" fill="#0d47a1"/>
                                <!-- Box -->
                                <rect x="60" y="25" width="24" height="20" fill="#1565c0" rx="3"/>
                                <rect x="62" y="27" width="20" height="2" fill="#0d47a1"/>
                                <!-- Mail slot -->
                                <rect x="67" y="32" width="10" height="3" fill="#0d47a1" rx="1"/>
                                <!-- Flag -->
                                <path d="M84 28 L84 38 L88 33 Z" fill="#f44336" class="flag" style="transform-origin: 84px 33px; animation: flagWave 2s ease-out 1.5s;"/>
                            </g>
                            
                            <!-- Stylized Mailman -->
                            <g class="mailman" style="animation: walkIn 2s ease-out forwards;">
                                <!-- Shadow -->
                                <ellipse cx="25" cy="64" rx="8" ry="2" fill="#00000020" style="animation: walkIn 2s ease-out forwards;"/>
                                
                                <!-- Legs -->
                                <rect x="20" y="50" width="4" height="14" fill="#1976d2" rx="2" class="leg-left" style="transform-origin: 22px 50px; animation: walkLegLeft 2s ease-out forwards;"/>
                                <rect x="26" y="50" width="4" height="14" fill="#1976d2" rx="2" class="leg-right" style="transform-origin: 28px 50px; animation: walkLegRight 2s ease-out forwards;"/>
                                
                                <!-- Body -->
                                <rect x="18" y="35" width="14" height="18" fill="#2196f3" rx="3"/>
                                <!-- Belt -->
                                <rect x="18" y="48" width="14" height="2" fill="#1565c0"/>
                                <!-- Buttons -->
                                <circle cx="25" cy="41" r="1" fill="#fff"/>
                                <circle cx="25" cy="45" r="1" fill="#fff"/>
                                
                                <!-- Arms -->
                                <rect x="16" y="37" width="3" height="10" fill="#2196f3" rx="1.5" style="transform-origin: 17.5px 37px; animation: walkArmLeft 2s ease-out forwards;"/>
                                <rect x="31" y="37" width="3" height="10" fill="#2196f3" rx="1.5" class="arm-right" style="transform-origin: 32.5px 37px; animation: moveArm 2s ease-out forwards;"/>
                                
                                <!-- Hands -->
                                <circle cx="17.5" cy="48" r="2.5" fill="#ffdbac" style="animation: walkHandLeft 2s ease-out forwards;"/>
                                <circle cx="32.5" cy="48" r="2.5" fill="#ffdbac" class="hand-right" style="animation: moveHand 2s ease-out forwards;"/>
                                
                                <!-- Head -->
                                <circle cx="25" cy="25" r="8" fill="#ffdbac"/>
                                <!-- Face -->
                                <circle cx="22" cy="24" r="0.8" fill="#333"/> <!-- Left eye -->
                                <circle cx="28" cy="24" r="0.8" fill="#333"/> <!-- Right eye -->
                                <path d="M22 28 Q25 29 28 28" stroke="#333" stroke-width="0.5" fill="none"/> <!-- Smile -->
                                
                                <!-- Hat -->
                                <path d="M17 23 L33 23 L31 18 L19 18 Z" fill="#1565c0"/>
                                <rect x="17" y="22" width="16" height="1" fill="#0d47a1"/>
                                <!-- Hat badge -->
                                <circle cx="25" cy="20" r="1.5" fill="#ffd700"/>
                                
                                <!-- Bag strap -->
                                <path d="M19 36 L31 46" stroke="#8b4513" stroke-width="1.5"/>
                                <!-- Mail bag -->
                                <rect x="12" y="46" width="8" height="6" fill="#8b4513" rx="1"/>
                                
                                <!-- Letter -->
                                <g class="letter" style="animation: deliverLetter 2s ease-out forwards;">
                                    <rect x="38" y="42" width="12" height="8" fill="#fff" stroke="#666" stroke-width="0.5" rx="1"/>
                                    <path d="M38 42 L44 46 L50 42" stroke="#666" fill="none" stroke-width="0.5"/>
                                    <rect x="40" y="46" width="8" height="0.5" fill="#e0e0e0"/>
                                    <rect x="40" y="47.5" width="6" height="0.5" fill="#e0e0e0"/>
                                </g>
                            </g>
                            
                            <!-- Success indicator -->
                            <g class="success-check" style="opacity: 0; animation: showCheck 0.5s ease-out 1.8s forwards;">
                                <circle cx="72" cy="37" r="6" fill="#4caf50"/>
                                <path d="M68.5 37 L70.5 39 L75.5 34" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                        </svg>
                    </div>
                    <div>
                        <strong>Perfect! I got all the details.</strong>${detailsText}
                    </div>
                </div>
                
                <style>
                @keyframes walkIn {
                    0% { transform: translateX(-40px); }
                    70% { transform: translateX(20px); }
                    100% { transform: translateX(20px); }
                }
                
                @keyframes walkLegLeft {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(15deg); }
                    75% { transform: rotate(-15deg); }
                }
                
                @keyframes walkLegRight {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg); }
                    75% { transform: rotate(15deg); }
                }
                
                @keyframes walkArmLeft {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    75% { transform: rotate(-10deg); }
                }
                
                @keyframes walkHandLeft {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(-2px); }
                    75% { transform: translateY(2px); }
                }
                
                @keyframes moveArm {
                    0% { transform: rotate(0deg); }
                    40% { transform: rotate(-45deg); }
                    70% { transform: rotate(-45deg); }
                    100% { transform: rotate(0deg); }
                }
                
                @keyframes moveHand {
                    0% { transform: translate(0, 0); }
                    40% { transform: translate(8px, -8px); }
                    70% { transform: translate(8px, -8px); }
                    100% { transform: translate(0, 0); }
                }
                
                @keyframes deliverLetter {
                    0% { opacity: 1; transform: translate(0, 0); }
                    40% { opacity: 1; transform: translate(8px, -4px); }
                    70% { opacity: 1; transform: translate(22px, -10px); }
                    80% { opacity: 0; transform: translate(25px, -8px); }
                    100% { opacity: 0; transform: translate(25px, -8px); }
                }
                
                @keyframes flagWave {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(10deg); }
                }
                
                @keyframes showCheck {
                    0% { opacity: 0; transform: scale(0) rotate(-180deg); }
                    50% { transform: scale(1.2) rotate(0deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                </style>`;
                
                addMessage(acknowledgement, 'ai');
                
                // Check if we need to ask for missing information
                if (!teamMemberEmail) {
                    // Ask for email
                    setTimeout(() => {
                        addMessage(`<strong>What's ${teamMemberName}'s email address?</strong>
                        
We'll need this to send them the invitation.`, 'ai');
                        
                        // Set state to wait for email
                        window.welcomeState.waitingForTextResponse = true;
                        window.welcomeState.currentQuestionType = 'team_email';
                    }, 1500);
                } else {
                    // We have all info, move to team size question
                    setTimeout(() => {
                        handleWelcomeResponse('team_size', message);
                    }, 2000);
                }
            }, 800);
            break;

        case 'team_email':
            // User provided the missing email
            const email = message.trim();
            if (window.welcomeResponses.teamMemberDetails) {
                window.welcomeResponses.teamMemberDetails.email = email;
            }
            
            // Show confirmation
            const teamName = window.welcomeResponses.teamMemberDetails?.name || 'your colleague';
            const teamRole = window.welcomeResponses.teamMemberDetails?.role;
            
            let confirmText = teamRole ? 
                `Perfect! I'll send the invitation to ${teamName} (${teamRole}) at ${email}.` :
                `Perfect! I'll send the invitation to ${teamName} at ${email}.`;
                
            addMessage(confirmText, 'ai');
            
            // Move to team size question
            setTimeout(() => {
                handleWelcomeResponse('team_size', null);
            }, 1500);
            break;

        case 'team_size':
            setTimeout(() => {
                handleWelcomeResponse('naics_confirmation', message);
            }, 800);
            break;

        case 'naics_confirmation':
            setTimeout(() => {
                const lowerMessage = message.toLowerCase();
                // Option 1: Keep this industry code - accept various inputs including just "1"
                if (lowerMessage === '1' || lowerMessage.includes('keep') || lowerMessage.includes('yes') || 
                    lowerMessage.includes('correct') || lowerMessage.includes('industry code') || 
                    lowerMessage.includes('current') || lowerMessage.includes('that\'s right') || 
                    lowerMessage.includes('looks good') || lowerMessage.includes('sounds good') ||
                    lowerMessage.includes('ok') || lowerMessage === 'okay' || lowerMessage === 'sure') {
                    handleWelcomeResponse('workforce_hourly', 'naics-yes');
                } 
                // Option 2: Help find a better match
                else if (lowerMessage === '2' || lowerMessage.includes('better match') || 
                         lowerMessage.includes('change') || lowerMessage.includes('no') || 
                         lowerMessage.includes('different') || lowerMessage.includes('wrong')) {
                    handleWelcomeResponse('business_description', 'naics-no');
                } 
                // Option 3: Connect with someone
                else if (lowerMessage === '3' || lowerMessage.includes('verify') || 
                         lowerMessage.includes('coworker') || lowerMessage.includes('someone') || 
                         lowerMessage.includes('connect') || lowerMessage.includes('help')) {
                    handleWelcomeResponse('todo_confirmation', 'naics-verify-coworker');
                } 
                else {
                    // If unclear, ask for clarification
                    addMessage(`I didn't quite understand your response. Please let me know if you'd like to:
- Keep the current match (type "1" or "keep")
- Find a better match (type "2" or "better match")
- Verify with someone else (type "3" or "verify")`, 'ai');
                    window.welcomeState.waitingForTextResponse = true;
                    window.welcomeState.currentQuestionType = 'naics_confirmation';
                }
            }, 800);
            break;

        case 'business_description':
            setTimeout(() => {
                handleWelcomeResponse('naics_selection', message);
            }, 800);
            break;

        case 'workforce_hourly':
            setTimeout(() => {
                handleWelcomeResponse('workforce_contractors', message);
            }, 800);
            break;

        case 'workforce_contractors':
            setTimeout(() => {
                handleWelcomeResponse('pay_schedule_unified', message);
            }, 800);
            break;

        case 'pay_schedule_unified':
            setTimeout(() => {
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('yes') || lowerMessage.includes('same')) {
                    handleWelcomeResponse('pay_frequency_single', 'unified-schedule');
                } else {
                    window.currentCalendarNextStep = 'complete';
                    window.scheduleSetup = {
                        frequencies: ['freq-general'],
                        currentIndex: 0,
                        completedSchedules: []
                    };
                    handleWelcomeResponse('pay_start_date_simplified', 'different-schedules');
                }
            }, 800);
            break;

        default:
            console.log('❌ Unknown question type:', currentType);
            return false;
    }

    console.log('✅ Welcome flow handled input successfully');
    return true;
}

// Handle pill clicks  
function handleWelcomePillClickReal(action) {
    console.log('Welcome pill clicked:', action);

    const welcomeFlowActions = ['naics-', 'todo-', 'ready-next-step', 'yes-ready-to-start', 'ready-info-', 'confirm-uploaded-files', 'upload-different-files', 'next-step-confirm', 'done-for-day'];
    const isWelcomeFlowAction = welcomeFlowActions.some(prefix => action.startsWith(prefix)) || welcomeFlowActions.includes(action);

    if (!isWelcomeFlowAction) {
        return false;
    }

    // Add user message for radio buttons
    if (!action.startsWith('submit-')) {
        const selectedElement = event.target;
        const selectedText = selectedElement.textContent || selectedElement.innerText;
        addMessage(selectedText, 'user');
    }

    // Hide interactive elements
    const clickedElement = event.target;
    const messageElement = clickedElement.closest('.message');
    hideInteractiveElementsInMessage(messageElement);

    // Handle yes-ready-to-start action
    if (action === 'yes-ready-to-start') {
        handleWelcomeResponse('role_question', action);
        return true;
    }

    // Handle ready-info actions
    if (action.startsWith('ready-info-')) {
        if (action === 'ready-info-1') {
            setTimeout(() => {
                addMessage(`Great question! Here's what to expect:

<strong>Initial setup (5-10 minutes):</strong>
• Basic company information
• Employee types and pay schedules
• Industry classification

<strong>Full implementation timeline:</strong>
• Most companies complete everything in 2-3 weeks
• You work at your own pace - no rush
• Average time spent: 30-45 minutes per session

The beauty is you can pause anytime and pick up exactly where you left off.`, 'ai');
                
                // Ask ready to start again
                setTimeout(() => {
                    askReadyToStart();
                }, 1500);
            }, 600);
        } else if (action === 'ready-info-2') {
            setTimeout(() => {
                addMessage(`Don't worry - we've designed this to be mistake-proof!

<strong>What protects you:</strong>
• Nothing is permanent until you confirm
• You can edit any information before finalizing
• We'll show you previews before any major steps
• Support is available if you need help

Think of this as a draft mode - you can change anything until you're 100% satisfied.`, 'ai');
                
                // Ask ready to start again
                setTimeout(() => {
                    askReadyToStart();
                }, 1500);
            }, 600);
        } else if (action === 'ready-info-3') {
            setTimeout(() => {
                addMessage(`Absolutely! Your progress saves automatically.

<strong>How it works:</strong>
• Every answer is saved instantly
• Close your browser anytime - we'll remember everything
• Come back in an hour, a day, or a week
• You'll start exactly where you left off

No need to complete everything in one sitting. Take breaks whenever you need!`, 'ai');
                
                // Ask ready to start again
                setTimeout(() => {
                    askReadyToStart();
                }, 1500);
            }, 600);
        } else if (action === 'ready-info-4') {
            setTimeout(() => {
                addMessage(`Your security is our top priority.

<strong>How we protect your data:</strong>
• Bank-level encryption for all documents
• SOC 2 Type II certified
• No human sees your documents without permission
• You control who has access

<strong>Compliance:</strong>
• GDPR compliant
• Full audit trails
• Regular security audits

Your information is safer here than in a filing cabinet!`, 'ai');
                
                // Ask ready to start again
                setTimeout(() => {
                    askReadyToStart();
                }, 1500);
            }, 600);
        }
        return true;
    }

    // Handle NAICS actions
    if (action.startsWith('naics-')) {
        if (action === 'naics-yes') {
            handleWelcomeResponse('workforce_hourly', action);
        } else if (action === 'naics-no') {
            handleWelcomeResponse('business_description', action);
        } else if (action === 'naics-verify-coworker') {
            handleWelcomeResponse('todo_confirmation', action);
        } else if (action === 'naics-info-1') {
            setTimeout(() => {
                addMessage(`<strong>What is a NAICS Code?</strong>

A NAICS (North American Industry Classification System) code is a 6-digit number that classifies your business by its primary activity. Think of it as your business's official category in government databases.

<strong>Why do you need one?</strong>
• It determines which tax forms you file
• It affects your workers' compensation rates  
• It's required for government contracts
• It helps calculate industry-specific tax deductions

The right code ensures you're following the correct regulations and getting all available benefits for your industry.`, 'ai');
                
                // Ask the question again after explaining
                setTimeout(() => {
                    askNAICSConfirmation();
                }, 1500);
            }, 600);
        } else if (action === 'naics-info-2') {
            setTimeout(() => {
                addMessage(`<strong>What happens if I choose the wrong NAICS code?</strong>

Choosing the wrong code can lead to:
• Filing incorrect tax forms
• Missing industry-specific deductions
• Higher workers' compensation premiums
• Compliance issues with regulations

<strong>The good news:</strong> You can update your NAICS code later if needed. It's better to get it right from the start, but it's not permanent. We'll help you find the most accurate code for your business.`, 'ai');
                
                // Ask the question again after explaining
                setTimeout(() => {
                    askNAICSConfirmation();
                }, 1500);
            }, 600);
        } else if (action === 'naics-info-3') {
            setTimeout(() => {
                addMessage(`<strong>Does the NAICS code affect taxes?</strong>

Yes, your NAICS code can impact your taxes in several ways:

• <strong>Deductions:</strong> Some industries have specific tax deductions (like manufacturing equipment depreciation)
• <strong>Credits:</strong> Certain codes qualify for industry-specific tax credits
• <strong>Forms:</strong> Different industries file different tax forms
• <strong>Rates:</strong> Workers' comp and insurance rates vary by industry code

Getting the right code helps ensure you're taking advantage of all available tax benefits and filing correctly.`, 'ai');
                
                // Ask the question again after explaining
                setTimeout(() => {
                    askNAICSConfirmation();
                }, 1500);
            }, 600);
        }
        return true;
    }

    // Handle todo confirmation
    if (action.startsWith('todo-')) {
        const value = action.replace('todo-', '');
        if (value === 'yes') {
            addTodoIcon();
            setTimeout(() => {
                addMessage('✅ <strong>To-do item created!</strong> You can find your to-do list by clicking the 📝 icon in the top-right corner of your screen.\n\n<strong>Ready to continue?</strong>', 'ai', [
                    { action: 'ready-next-step', text: 'Yes, let\'s continue' }
                ], { style: 'two-tier-interactive' });
            }, 800);
        } else {
            setTimeout(() => {
                handleWelcomeResponse('workforce_hourly', 'no-todo');
            }, 600);
        }
        return true;
    }

    // Handle ready for next step
    if (action === 'ready-next-step') {
        setTimeout(() => {
            handleWelcomeResponse('workforce_hourly', 'ready');
        }, 600);
        return true;
    }

    // Handle document upload confirmation actions
    if (action === 'confirm-uploaded-files' || action === 'upload-different-files') {
        // Call the handleUploadConfirmation function from script.js
        if (typeof handleUploadConfirmation === 'function') {
            handleUploadConfirmation(action);
        }
        return true; // Return true to indicate this was handled
    }

    // Handle next step confirm and done for day actions
    if (action === 'next-step-confirm') {
        console.log('🔍 next-step-confirm triggered - hiding right panel');
        // Hide the right panel and continue with company setup
        setTimeout(() => {
            // First extract the company information
            if (typeof extractCompanyInformation === 'function') {
                extractCompanyInformation(true, true); // Both handbook and payroll uploaded
            }
            
            // Hide the right panel
            const tablePanel = document.getElementById('tablePanel');
            const chatPanel = document.getElementById('chatPanel');
            
            console.log('🔍 Panel elements found:', {
                tablePanel: !!tablePanel,
                chatPanel: !!chatPanel
            });
            
            if (tablePanel && typeof gsap !== 'undefined') {
                // Smooth animation to slide panel out
                gsap.to(tablePanel, {
                    x: '100%',
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        tablePanel.style.display = 'none';
                        tablePanel.classList.add('hidden');
                        tablePanel.classList.remove('visible');
                        console.log('🔍 Panel slide-out animation complete');
                    }
                });
            } else if (tablePanel) {
                // Fallback if GSAP not available
                tablePanel.classList.add('hidden');
                tablePanel.classList.remove('visible');
                tablePanel.style.display = 'none';
            }
            
            // Smoothly expand chat panel to center
            if (chatPanel && typeof gsap !== 'undefined') {
                gsap.to(chatPanel, {
                    width: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        chatPanel.classList.add('centered');
                        chatPanel.classList.remove('right-panel-open');
                        console.log('🔍 Chat panel centering animation complete');
                    }
                });
            } else if (chatPanel) {
                // Fallback if GSAP not available
                chatPanel.classList.add('centered');
                chatPanel.classList.remove('right-panel-open');
                chatPanel.style.width = '800px';
                chatPanel.style.marginLeft = 'auto';
                chatPanel.style.marginRight = 'auto';
            }
            
            // Then show the confirmation message in chat
            setTimeout(() => {
                if (typeof showCompanyInfoAfterThinking === 'function') {
                    showCompanyInfoAfterThinking();
                }
                
                // Transition to company-info workflow after panel animation is fully complete
                // Wait a bit longer to ensure the panel transition check passes
                setTimeout(() => {
                    if (window.progressManager) {
                        console.log('📊 Attempting to enter company-info workflow');
                        window.progressManager.enterWorkflow('company-info', 0);
                    }
                }, 500); // Additional delay after showCompanyInfoAfterThinking
            }, 800);
        }, 600);
        return true;
    }
    
    if (action === 'done-for-day') {
        setTimeout(() => {
            addMessage(`No problem at all! Your progress has been saved automatically.

When you come back, we'll pick up exactly where we left off. Have a great rest of your day!

<div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
    <strong>✨ Progress Saved</strong><br>
    Your setup is 45% complete. See you next time!
</div>`, 'ai');
        }, 600);
        return true;
    }

    return false;
}

// Helper functions
function hideInteractiveElementsInMessage(messageElement) {
    if (!messageElement) return;

    const containers = messageElement.querySelectorAll('.suggested-pills, .radio-container, .welcome-checkboxes, .pay-calendar-container');
    containers.forEach(container => {
        container.style.display = 'none';
    });

    const buttons = messageElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.style.display = 'none';
    });
}

function getEarliestPayStartDate() {
    if (!window.scheduleSetup || !window.scheduleSetup.completedSchedules) {
        return null;
    }

    const schedules = window.scheduleSetup.completedSchedules;
    if (schedules.length === 0) {
        return null;
    }

    // Since startDate is now stored as string, return the string directly
    let earliestDate = schedules[0].startDate;
    for (let i = 1; i < schedules.length; i++) {
        if (schedules[i].startDate < earliestDate) {
            earliestDate = schedules[i].startDate;
        }
    }

    return earliestDate;
}

function generatePayCalendar(month, year, gridId, calendarId) {
    const calendarGrid = document.getElementById(gridId);
    if (!calendarGrid) {
        console.error('Calendar grid ' + gridId + ' not found');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const startDate = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.cssText = 'text-align: center; font-size: 11px; font-weight: 600; color: #666; padding: 8px 4px; background-color: #f8f9fa;';
        calendarGrid.appendChild(dayHeader);
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.style.cssText = 'aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; min-height: 40px; width: 40px; margin: 0 auto; position: relative;';

        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);

        const isPast = currentDate < today;
        const isToday = currentDate.getTime() === today.getTime();

        if (isToday) {
            dayElement.style.cssText += 'background-color: rgba(48, 37, 141, 0.1); font-weight: 600; color: #30258D;';
        }

        if (isPast) {
            dayElement.style.cssText += 'color: #ccc; cursor: not-allowed;';
        } else {
            dayElement.style.cssText += 'color: #333; cursor: pointer;';
            dayElement.addEventListener('click', function() {
                handlePayCalendarSelection(currentDate, calendarId);
            });
        }

        calendarGrid.appendChild(dayElement);
    }
}

function handlePayCalendarSelection(selectedDate, calendarId) {
    // Hide the calendar
    const calendarContainer = document.getElementById(calendarId + 'Container');
    if (calendarContainer) {
        const messageElement = calendarContainer.closest('.message');
        hideInteractiveElementsInMessage(messageElement);
    }

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Add user message
    addMessage(formattedDate, 'user');

    // Store schedule
    if (!window.scheduleSetup) {
        window.scheduleSetup = {
            frequencies: ['freq-unified'],
            currentIndex: 0,
            completedSchedules: []
        };
    }

    // Store date as string to avoid timezone issues
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    window.scheduleSetup.completedSchedules.push({
        frequency: 'freq-unified',
        startDate: dateString,
        name: 'Pay Schedule'
    });

    // Complete the flow
    setTimeout(() => {
        completeCompanyQuestions();
    }, 1000);
}

function changePayCalendarMonth(direction, calendarId) {
    // Calendar navigation functionality
    console.log('Calendar navigation:', direction, calendarId);
}

function handleWelcomeKeyboardShortcuts(event) {
    // Keyboard shortcuts functionality
    console.log('Keyboard shortcut:', event.key);
}



// Export functions for integration with existing chat system
window.handleWelcomeTextInput = handleWelcomeTextInput;
window.handleWelcomePillClick = handleWelcomePillClickReal;
window.startWelcomeFlow = startWelcomeFlow;
window.changePayCalendarMonth = changePayCalendarMonth;
window.handlePayCalendarSelection = handlePayCalendarSelection;

// welcome-flow.js
// Welcome flow using existing chat interface - Updated with role-first approach

// Store welcome responses and state  
window.welcomeResponses = {};
window.welcomeState = {
    currentStep: 'role_question',
    waitingForTextResponse: false,
    currentQuestionType: null
};

// Mapping of welcome flow steps to progress substeps
const welcomeStepToProgress = {
    'role_question': 0,        // Your role
    'time_in_role': 1,         // Time in role
    'team_involvement': 2,     // Team assistance
    'team_details': 2,         // Still part of team assistance
    'team_size': 3,            // Company size
    'naics_confirmation': 4,   // Industry code
    'business_description': 4, // Still part of industry code
    'naics_selection': 4,      // Still part of industry code
    'todo_confirmation': 4,    // Still part of industry code
    'workforce_hourly': 5,     // Employee types
    'workforce_contractors': 5, // Still employee types
    'pay_schedule_unified': 6, // Pay schedule
    'pay_frequency_single': 7, // First payroll date
    'pay_frequency': 7,        // First payroll date
    'pay_start_date_multi_simplified': 7, // First payroll date
    'pay_start_date_simplified': 7, // First payroll date
    'pay_start_date': 7,       // First payroll date
    'company_complete': 8      // Generate timeline
};

// Main function to handle welcome flow routing
function handleWelcomeResponse(step, response) {
    // Store the response for the CURRENT step before moving forward
    if (response !== null && response !== undefined) {
        window.welcomeResponses[window.welcomeState.currentStep] = response;
        console.log('Stored response:', window.welcomeState.currentStep, response);
    }

    // Update state to the new step
    window.welcomeState.currentStep = step;
    window.welcomeState.waitingForTextResponse = false;

    // Update progress if ProgressManager is available
    if (window.progressManager && welcomeStepToProgress[step] !== undefined) {
        // Only enter the workflow if we haven't already
        if (!window.progressManager.isActive || window.progressManager.currentSection !== 'welcome-flow') {
            window.progressManager.enterWorkflow('welcome-flow', welcomeStepToProgress[step]);
        } else {
            // Just update the substep
            window.progressManager.updateSubstep(welcomeStepToProgress[step]);
        }
    }

    switch (step) {
        case 'ready_to_start':
            askReadyToStart();
            break;

        case 'role_question':
            askRole();
            break;

        case 'time_in_role':
            askTimeInRole();
            break;

        case 'team_involvement':
            askTeamInvolvement();
            break;

        case 'team_details':
            askTeamDetails();
            break;

        case 'team_size':
            askTeamSize();
            break;

        case 'naics_confirmation':
            askNAICSConfirmation();
            break;

        case 'business_description':
            askBusinessDescription();
            break;

        case 'naics_selection':
            askNAICSSelection();
            break;

        case 'todo_confirmation':
            askTodoConfirmation();
            break;

        case 'workforce_hourly':
            askWorkforceHourly();
            break;

        case 'workforce_contractors':
            askWorkforceContractors();
            break;

        case 'pay_schedule_unified':
            askPayScheduleUnified();
            break;

        case 'pay_frequency_single':
            askPayFrequencySingle();
            break;

        case 'pay_frequency':
            askPayFrequency();
            break;

        case 'pay_start_date_multi_simplified':
            askPayStartDateMultiSimplified();
            break;

        case 'pay_start_date_simplified':
            askPayStartDateSimplified();
            break;

        case 'pay_start_date':
            askPayStartDate();
            break;

        case 'company_complete':
            completeCompanyQuestions();
            break;

        default:
            console.error('Unknown welcome step:', step);
    }
}

// Add this to your welcome flow - it will hide threading via CSS
function addWelcomeStyles() {
    const style = document.createElement('style');
    style.id = 'welcome-flow-styles';
    style.textContent = `
        body[data-welcome-active] .conversation-history-header,
        body[data-welcome-active] .thread-header,
        body[data-welcome-active] .toggle-header,
        body[data-welcome-active] [class*="collapse"],
        body[data-welcome-active] [class*="thread"] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Call this when welcome flow starts
function startWelcomeFlow() {

    document.body.setAttribute('data-welcome-active', 'true');
    addWelcomeStyles();

    // Initialize A/B test state
    window.welcomeFlowVariant = 'A'; // Default
    window.enablePayFrequencyShortcuts = false; // Disabled by default

    // Add event listener
    document.addEventListener('keydown', handleWelcomeKeyboardShortcuts);


    // ADD THESE TWO LINES:
    document.body.setAttribute('data-welcome-active', 'true');
    addWelcomeStyles();

    // Clear chat messages
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }

    // Reset welcome state
    window.welcomeResponses = {};
    window.welcomeState = {
        currentStep: 'role_question',
        waitingForTextResponse: false,
        currentQuestionType: null
    };

    // Initialize progress tracking for welcome flow
    if (window.progressManager) {
        window.progressManager.enterWorkflow('welcome-flow', 0);
    }

    // Start with welcome message and ready to start question
    askReadyToStart();
}

// Remove when welcome flow ends
function completeCompanyQuestions() {
    document.body.removeAttribute('data-welcome-active');
    const style = document.getElementById('welcome-flow-styles');
    if (style) style.remove();

    document.removeEventListener('keydown', handleWelcomeKeyboardShortcuts);

    console.log('🔍 Completing company questions and transitioning to timeline');

    // Update progress to step 8 (Generate timeline) before completing
    if (window.progressManager && window.progressManager.isActive) {
        window.progressManager.updateSubstep(8);
    }

    // Debug logging
    console.log('📅 Schedule setup:', window.scheduleSetup);
    console.log('📅 Completed schedules:', window.scheduleSetup?.completedSchedules);

    // Remove welcome flow styles
    document.body.removeAttribute('data-welcome-active');
    const styleEl = document.getElementById('welcome-flow-styles');
    if (styleEl) styleEl.remove();

    // Clear welcome state
    window.welcomeState = null;

    // Don't emit welcome flow completion event - keep progress bar visible
    // document.dispatchEvent(new CustomEvent('welcomeFlowComplete'));

    // Get the earliest pay start date
    const earliestDate = getEarliestPayStartDate();
    console.log('📅 Earliest date found:', earliestDate);

    if (earliestDate) {
        // earliestDate is already a string in YYYY-MM-DD format
        // SET UP THE DATA STRUCTURE THAT script(28).js EXPECTS:
        window.newWizardState = {
            currentStep: 1,
            totalSteps: 5,
            userData: {
                startDate: earliestDate // Already in YYYY-MM-DD format
            }
        };

        // Store the welcome flow data
        window.welcomeFlowData = {
            payStartDate: earliestDate,
            schedules: window.scheduleSetup.completedSchedules,
            allResponses: window.welcomeResponses
        };

        console.log('🚀 Calling transitionToSplitScreenWithTimeline with data:', window.newWizardState);
        // CALL THE CORRECT FUNCTION FROM script(28).js
        transitionToSplitScreenWithTimeline(); // ✅ This is the correct function!
    } else {
        console.error('❌ No earliest date found - cannot generate timeline');

        // Fallback: Use a default date 30 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);

        // Format date safely without timezone conversion
        const year = defaultDate.getFullYear();
        const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const day = String(defaultDate.getDate()).padStart(2, '0');
        const safeDefaultDate = `${year}-${month}-${day}`;

        window.newWizardState = {
            currentStep: 1,
            totalSteps: 5,
            userData: {
                startDate: safeDefaultDate
            }
        };

        console.log('📅 Using fallback date:', defaultDate);
        transitionToSplitScreenWithTimeline();
    }
}

// Ready to Start question with related questions using two-tier interaction style
function askReadyToStart() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'ready_to_start';

    const message = `<strong>Hi Jenny!</strong>

Perfect timing - you've landed in exactly the right place. We see you've selected Payroll, HR, and Time Keeping modules. Great choice!

<strong>What you get:</strong>
💬 Chat-based setup (no lengthy forms or endless checkboxes)
🎯 Your specific roadmap (based on your modules and company needs)
📊 Real-time progress tracking at the bottom of your chat

Think of me as your implementation partner who knows these systems inside and out. I'll guide you through every step to make this the easiest implementation you've ever done.

The first set of questions takes about 5 minutes and you can track our progress at the bottom of the chat.

<strong>Ready to start? Type "yes" below or ask me anything.</strong>`;

    // Use the proper two-tier interaction style with addMessage
    addMessage(message, 'ai', [], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'ready-info-1', text: 'How long will this really take?' },
            { action: 'ready-info-2', text: 'What if I make a mistake during setup?' },
            { action: 'ready-info-3', text: 'Can I save my progress and come back later?' },
            { action: 'ready-info-4', text: 'Is my company information safe when I upload documents?' }
        ]
    });
}

// Question 1: Role (Text Input)
function askRole() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'role_question';

    addMessage(`Let's start with the basics.
    
    <strong>What's your role at the company?</strong>`, 'ai');
}

// Question 2: Time in Role (Text Input)
function askTimeInRole() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'time_in_role';

    const role = window.welcomeResponses.role_question || 'your role';

    addMessage(`We'll use this to understand your experience level and customize the setup process for you.

<strong>How much payroll experience do you have?</strong>`, 'ai');
}

// Question 3: Team Involvement (Text Input)
function askTeamInvolvement() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'team_involvement';

    const timeInRole = window.welcomeResponses.time_in_role;
    let contextMessage = '';

    if (timeInRole) {
        const timeText = timeInRole.toLowerCase();
        const isNew = timeText.includes('new') || timeText.includes('month') || timeText.includes('week') || 
                     timeText.includes('recent') || timeText.includes('just') || timeText.includes('1 ') ||
                     timeText.includes('one ') || timeText.includes('couple');

        if (isNew) {
            contextMessage = `You're doing great jumping into this! Most of our customers are in similar situations, and we'll guide you through every step.\n\n`;
        } else {
            contextMessage = `That's valuable experience! You'll have a good foundation for this setup.\n\n`;
        }
    }

    addMessage(`${contextMessage}Some people prefer to handle this themselves, while others like to bring in their accountant, IT person, or a trusted colleague.

<strong>Will anyone else be helping you with the setup process?</strong>`, 'ai');
}

// Question 3b: Team Details (Text Input - if they have help)
function askTeamDetails() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'team_details';

    let questionsToAsk = [];

    // Always start with the intro
    let message = `That's smart! Having extra hands can make this even smoother.

We'll send them access to the relevant parts of your setup so they can jump in when needed. You'll stay in control of the whole process though.

`;

    // Check if user already provided their own name and role
    const userRole = window.welcomeResponses.role_question;
    const userName = window.userName || 'Jenny'; // Default to Jenny if not set
    
    // Make it clear we're asking about the colleague, not the user
    message += `<strong>To get them started, please send the following for each person:
Name
Email
Role</strong>

<em style="color: #666; font-size: 14px;">You can enter all details separated by commas (e.g., "John Smith, john@company.com, IT Manager")</em>`;

    addMessage(message, 'ai');
}

// Question 4: Team Size (Text Input)
function askTeamSize() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'team_size';

    addMessage(`Now let's talk about your company. We'll use this information to make recommendations that work best for your company. Include everyone, full-time, part-time, contractors, everyone who gets a paycheck from your company.

<strong>How many people will you be paying?</strong>`, 'ai');
}

// Question 5: NAICS Confirmation (Text Response)
function askNAICSConfirmation() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'naics_confirmation';

    const teamSize = window.welcomeResponses.team_size || 'your team';

    const message = `Now let's confirm the right industry code (NAICS) for your business. This info is used for economic census classification and statistical reporting requirements.

We found this NAICS code based on what you told us during signup:
<strong>541211 - Offices of Certified Public Accountants</strong>

<strong>What would you like to do?</strong>
<strong>1. Keep this industry code</strong>
<strong>2. Help find a better match</strong> for your primary business activity
<strong>3. Connect you with someone</strong> who can help verify the right code`;

    // Use the proper two-tier interaction style with addMessage
    addMessage(message, 'ai', [], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'naics-info-1', text: 'What is a NAICS Code and Why Do I Need One?' },
            { action: 'naics-info-2', text: 'What happens if I choose the wrong NAICS code?' },
            { action: 'naics-info-3', text: 'Does the NAICS code affect taxes?' }
        ]
    });
}

// Ask for business description when user clicks "No"
function askBusinessDescription() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'business_description';

    addMessage(`<strong>No problem! Let's find the right code for you.</strong>

<strong>Please describe what your company does:</strong>

A brief description will help us find the most accurate NAICS code for your business.`, 'ai');
}

// Show NAICS options based on business description
function askNAICSSelection() {
    window.welcomeState.waitingForTextResponse = false;
    window.welcomeState.currentQuestionType = 'naics_selection';

    // Mock NAICS options based on business description
    const businessDesc = window.welcomeResponses.business_description?.toLowerCase() || '';

    let naicsOptions = [];

    // Simple logic to suggest NAICS codes based on keywords
    if (businessDesc.includes('accounting') || businessDesc.includes('bookkeeping') || businessDesc.includes('cpa')) {
        naicsOptions = [
            { action: 'naics-select-541211', text: '541211 -  Offices of Certified Public Accountants' }
        ];
    } else if (businessDesc.includes('consulting') || businessDesc.includes('advisor')) {
        naicsOptions = [
            { action: 'naics-select-541611', text: '541611 - Administrative Management Consulting' },
            { action: 'naics-select-541618', text: '541618 - Other Management Consulting' }
        ];
    } else if (businessDesc.includes('software') || businessDesc.includes('tech') || businessDesc.includes('app')) {
        naicsOptions = [
            { action: 'naics-select-541511', text: '541511 - Custom Computer Programming' },
            { action: 'naics-select-541512', text: '541512 - Computer Systems Design' }
        ];
    } else {
        // Default options for unclear descriptions
        naicsOptions = [
            { action: 'naics-select-541211', text: '541211 - Offices of Certified Public Accountants' },
            { action: 'naics-select-541611', text: '541611 - Administrative Management Consulting' },
            { action: 'naics-select-541618', text: '541618 - Other Management Consulting' }
        ];
    }

    if (naicsOptions.length === 1) {
        // Only one option, ask yes/no
        addMessage(`<strong>Based on your business description, we found this NAICS code:</strong>

<strong>${naicsOptions[0].text}</strong>

<strong>Does this look correct for your business?</strong>`, 'ai', [
            { action: 'naics-single-yes', text: 'Yes, that\'s correct' },
            { action: 'naics-single-no', text: 'No, this needs to be changed' }
        ], { style: 'two-tier-interactive' });
    } else {
        // Multiple options, let them select
        addMessage(`<strong>Based on your business description, we found this NAICS code:</strong>

<strong>${naicsOptions[0].text}</strong>

<strong>Does this look correct for your business?</strong>`, 'ai', [
                { action: 'naics-single-yes', text: 'Yes, that\'s correct' },
                { action: 'naics-single-no', text: 'No, this needs to be changed' }
            ], { style: 'two-tier-interactive' });
    }
}

// Ask about creating todo list
function askTodoConfirmation() {
    window.welcomeState.waitingForTextResponse = false;
    window.welcomeState.currentQuestionType = 'todo_confirmation';

    addMessage(`<strong>Would you like me to create a to-do item to verify the NAICS code with your coworker?</strong>

This will help you remember to confirm this information before we continue with your payroll setup.`, 'ai', [
            { action: 'todo-yes', text: 'Yes, create a to-do item' },
            { action: 'todo-no', text: 'No, I\'ll handle it myself' }
        ], { style: 'two-tier-interactive' });
}

// Function to add todo icon to header
function addTodoIcon() {
    // Check if icon already exists
    if (document.getElementById('todo-icon')) return;

    // Create todo icon element
    const todoIcon = document.createElement('div');
    todoIcon.id = 'todo-icon';
    todoIcon.style.cssText = `
        position: fixed;
        top: 20px;
        right: 80px;
        width: 40px;
        height: 40px;
        background: #30258D;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    todoIcon.innerHTML = '📝';
    todoIcon.title = 'To-Do List';

    document.body.appendChild(todoIcon);
}

// Question 6: Hourly Workers (Text Input)
function askWorkforceHourly() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'workforce_hourly';

    addMessage(`Let's make sure we configure everything correctly for your team.

We're asking about anyone who gets paid by the hour, including full-time, part-time, or seasonal workers.

<strong>Do you have hourly employees?</strong>`, 'ai');
}

// Question 7: Contractors (Text Input)
function askWorkforceContractors() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'workforce_contractors';

    addMessage(`Next question is about contractors. These are people who work for you but aren't employees—they usually get 1099s instead of W-2s.

<strong>Do you have contractors?</strong>`, 'ai');
}

// Question 8: Pay Schedule Unified (Text Input)
function askPayScheduleUnified() {
    window.welcomeState.waitingForTextResponse = true;
    window.welcomeState.currentQuestionType = 'pay_schedule_unified';

    addMessage(`Great! Now let's talk about pay schedules.

Some companies pay everyone on the same schedule (like bi-weekly on Fridays), while others have different groups with different pay dates.

<strong>Do you pay all employees on the same schedule?</strong>`, 'ai');
}

// If they have ONE unified schedule - ask for frequency
function askPayFrequencySingle() {
    window.welcomeState.waitingForTextResponse = false;
    window.welcomeState.currentQuestionType = 'pay_frequency_single';

    // Initialize schedule setup for single unified schedule
    window.scheduleSetup = {
        frequencies: ['freq-unified'], // Single unified frequency placeholder
        currentIndex: 0,
        completedSchedules: []
    };

    // Set next step to complete after calendar selection
    window.currentCalendarNextStep = 'complete';

    // Calculate months to show
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Generate unique calendar ID
    const calendarId = 'payCalendar-single';

    const calendarHTML = '<div class="pay-calendar-container" id="' + calendarId + 'Container">' +
        '<div class="calendar-controls-wrapper">' +
            '<div class="calendar-navigation">' +
                '<button class="calendar-nav" onclick="changePayCalendarMonth(-1, \'' + calendarId + '\')">‹</button>' +
                '<button class="calendar-nav" onclick="changePayCalendarMonth(1, \'' + calendarId + '\')">›</button>' +
            '</div>' +
        '</div>' +
        '<div class="dual-calendar-widget">' +
            '<div class="calendar-month-container">' +
                '<div class="calendar-header">' +
                    '<h3 class="calendar-month" id="' + calendarId + 'Month1">' + monthNames[currentMonth] + ' ' + currentYear + '</h3>' +
                '</div>' +
                '<div class="calendar-grid" id="' + calendarId + 'Grid1"></div>' +
            '</div>' +
            '<div class="calendar-month-container">' +
                '<div class="calendar-header">' +
                    '<h3 class="calendar-month" id="' + calendarId + 'Month2">' + monthNames[nextMonth] + ' ' + nextYear + '</h3>' +
                '</div>' +
                '<div class="calendar-grid" id="' + calendarId + 'Grid2"></div>' +
            '</div>' +
        '</div>' +
    '</div>';

    const combinedMessage = `Great! Since everyone's on the same schedule, this will be simple.

<strong>When do you want to run your first payroll with us?</strong>

Select your target date below. We'll use this to plan your implementation timeline and make sure everything's ready to go.

${calendarHTML}`;

    addMessage(combinedMessage, 'ai');

    // Generate both calendar grids
    setTimeout(() => {
        generatePayCalendar(currentMonth, currentYear, calendarId + 'Grid1', calendarId);
        generatePayCalendar(nextMonth, nextYear, calendarId + 'Grid2', calendarId);

        // Store calendar state for navigation
        window.currentPayCalendarState = {
            calendarId: calendarId,
            currentMonth: currentMonth,
            currentYear: currentYear,
            nextMonth: nextMonth,
            nextYear: nextYear
        };
    }, 500);
}

// If they have multiple schedules - simplified calendar
function askPayStartDateSimplified() {
    window.welcomeState.waitingForTextResponse = false;
    window.welcomeState.currentQuestionType = 'pay_start_date_simplified';

    // Calculate months to show
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Generate unique calendar ID
    const calendarId = 'payCalendar-simplified';

    const calendarHTML = '<div class="pay-calendar-container" id="' + calendarId + 'Container">' +
        '<div class="calendar-controls-wrapper">' +
            '<div class="calendar-navigation">' +
                '<button class="calendar-nav" onclick="changePayCalendarMonth(-1, \'' + calendarId + '\')">‹</button>' +
                '<button class="calendar-nav" onclick="changePayCalendarMonth(1, \'' + calendarId + '\')">›</button>' +
            '</div>' +
        '</div>' +
        '<div class="dual-calendar-widget">' +
            '<div class="calendar-month-container">' +
                '<div class="calendar-header">' +
                    '<h3 class="calendar-month" id="' + calendarId + 'Month1">' + monthNames[currentMonth] + ' ' + currentYear + '</h3>' +
                '</div>' +
                '<div class="calendar-grid" id="' + calendarId + 'Grid1"></div>' +
            '</div>' +
            '<div class="calendar-month-container">' +
                '<div class="calendar-header">' +
                    '<h3 class="calendar-month" id="' + calendarId + 'Month2">' + monthNames[nextMonth] + ' ' + nextYear + '</h3>' +
                '</div>' +
                '<div class="calendar-grid" id="' + calendarId + 'Grid2"></div>' +
            '</div>' +
        '</div>' +
    '</div>';

    const combinedMessage = `No problem! We'll handle all the details about your different schedules later in the payroll setup.

For now, just select the earliest date you want to pay your first group of employees

${calendarHTML}`;

    addMessage(combinedMessage, 'ai');

    // Generate both calendar grids
    setTimeout(() => {
        generatePayCalendar(currentMonth, currentYear, calendarId + 'Grid1', calendarId);
        generatePayCalendar(nextMonth, nextYear, calendarId + 'Grid2', calendarId);

        // Store calendar state for navigation
        window.currentPayCalendarState = {
            calendarId: calendarId,
            currentMonth: currentMonth,
            currentYear: currentYear,
            nextMonth: nextMonth,
            nextYear: nextYear
        };
    }, 500);
}

// Continue with rest of functions...
// Export functions for integration with existing chat system
window.startWelcomeFlow = startWelcomeFlow;