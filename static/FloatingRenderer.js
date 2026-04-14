/**
 * FloatingRenderer - FIXED celebration timing and step counting
 * Key fixes:
 * 1. Proper section completion detection
 * 2. Celebration only on full section finish
 * 3. Fixed step counter bounds
 * 4. Better section type matching
 * 5. FIXED SYNTAX ERROR
 */

console.log('🔄 FloatingRenderer.js file is loading...');

class FloatingRenderer {
    constructor() {
        this.container = null;
        this.button = null;
        this.panel = null;
        this.isVisible = false;
        this.isExpanded = false;
        this.currentData = null;
        this.completedSections = new Set(); // Track completed sections
        this.previousData = null; // Track previous state for comparison

        // Create container immediately
        this.createContainer();

        console.log('FloatingRenderer initialized');
    }

    /**
     * Create the floating container in the DOM
     */
    createContainer() {
        // Remove existing container if present
        const existing = document.getElementById('progress-floating-container');
        if (existing) existing.remove();

        this.container = document.createElement('div');
        this.container.id = 'progress-floating-container';
        this.container.className = 'progress-floating-container';

        // Add styles if not already present
        this.addStyles();

        // Create button and panel
        this.createButton();
        this.createPanel();

        // Append to chat input area
        const chatInput = document.querySelector('.chat-input');

        if (chatInput) {
            chatInput.appendChild(this.container);
            chatInput.style.position = 'relative';
            console.log('FloatingRenderer container appended to chat input');
        } else {
            // Fallback to chat panel
            const chatPanel = document.getElementById('chatPanel') || 
                             document.querySelector('.chat-panel');
            if (chatPanel) {
                chatPanel.appendChild(this.container);
                chatPanel.style.position = 'relative';
                console.log('FloatingRenderer container appended to chat panel (fallback)');
            } else {
                document.body.appendChild(this.container);
                console.log('FloatingRenderer container appended to body (fallback)');
            }
        }

        console.log('FloatingRenderer container created');
    }

    /**
     * Add CSS styles for floating renderer
     */
    addStyles() {
        if (document.getElementById('floating-renderer-styles')) return;

        const style = document.createElement('style');
        style.id = 'floating-renderer-styles';
        style.textContent = `
            /* Dynamic Chat Input Styling */
            .chat-input {
                transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
                overflow: visible !important;
                padding-top: 24px; 
            }

            .chat-input.has-progress {
                padding-top: 40px !important;
                padding-bottom: 16px !important;
            }

            /* Floating Container */
            .progress-floating-container {
                position: absolute;
                top: 0px;
                left: 20px;
                z-index: 2000;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
            }

            .progress-floating-container.visible {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
                display: block;
            }

            .progress-floating-container.slide-out {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }

            /* Floating Button */
            .progress-floating-button {
                width: auto;
                min-width: 90px;
                height: 40px;
                border-radius: 4px;
                background: transparent;
                color: #000000;
                border: none;
                cursor: pointer;
                box-shadow: none;
                transition: transform 0.3s ease, opacity 0.3s ease;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 500;
                padding: 0 16px;
            }

            .progress-floating-button:hover {
                /* No hover effects */
            }

            .progress-floating-button:active,
            .progress-floating-button:focus {
                background: transparent !important;
                outline: none !important;
                box-shadow: none !important;
                transform: none !important;
            }

            .progress-floating-button.expanded {
                border-color: #a0a0a0;
            }

            /* Button Content Layout */
            .button-content {
                display: flex;
                align-items: center;
                gap: 4px;
                z-index: 1;
            }

            .process-icon {
                font-size: 18px;
                display: flex;
                align-items: center;
            }

            .step-text {
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
            }

            /* Mini Progress Bar */
            .mini-progress-container {
                margin-left: 8px;
                margin-right: 4px;
            }

            .mini-progress-bar {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .mini-progress-step {
                width: 8px;
                height: 4px;
                border-radius: 1px;
                background: #e0e0e0;
                transition: all 0.3s ease;
            }

            .mini-progress-step.completed {
                background: #30258D;
            }

            .mini-progress-step.current {
                background: #30258D;
                opacity: 0.6;
            }

            .mini-progress-step.pending {
                background: #e0e0e0;
            }

            /* Expandable Panel */
            .progress-floating-panel {
                position: absolute;
                bottom: 50px;
                left: 0;
                width: 320px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                border: 1px solid #e0e4e7;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
                max-height: 400px;
                overflow: hidden;
            }

            .progress-floating-panel.expanded {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            /* Panel Header */
            .progress-panel-header {
                padding: 16px 20px 12px;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .progress-panel-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0;
            }

            .progress-panel-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }

            .progress-panel-close:hover {
                background: #f5f5f5;
                color: #333;
            }

            /* Panel Content */
            .progress-panel-content {
                padding: 16px 20px 20px;
            }

            .progress-section-info {
                margin-bottom: 16px;
            }

            .progress-section-name {
                font-size: 14px;
                font-weight: 600;
                color: #30258D;
                margin-bottom: 4px;
            }

            .progress-section-progress {
                font-size: 12px;
                color: #666;
                margin-bottom: 12px;
            }

            /* Step List */
            .progress-step-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .progress-step-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                transition: all 0.2s ease;
            }

            .progress-step-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                flex-shrink: 0;
                transition: all 0.3s ease;
            }

            .progress-step-icon.pending {
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                color: #6c757d;
            }

            .progress-step-icon.current {
                background: #30258D;
                border: 2px solid #30258D;
                color: white;
                box-shadow: 0 0 0 3px rgba(48, 37, 141, 0.1);
            }

            .progress-step-icon.completed {
                background: #28a745;
                border: 2px solid #28a745;
                color: white;
            }

            .progress-step-text {
                flex: 1;
                font-size: 13px;
                color: #333;
                font-weight: 500;
            }

            .progress-step-item.current .progress-step-text {
                color: #30258D;
                font-weight: 600;
            }

            .progress-step-item.completed .progress-step-text {
                color: #28a745;
            }

            /* Button celebration animation */
            .progress-floating-button.celebrating {
                animation: celebrate-pulse 0.6s ease-out;
            }

            @keyframes celebrate-pulse {
                0% { 
                    transform: scale(1) translateY(0);
                    box-shadow: none;
                }
                25% { 
                    transform: scale(1.1) translateY(-4px);
                    box-shadow: none);
                }
                50% { 
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: none;
                }
                100% { 
                    transform: scale(1) translateY(0);
                    box-shadow: none;!important; 
                }
            }

            /* Mobile Adaptations */
            @media (max-width: 768px) {
                .progress-floating-container {
                    bottom: 60px;
                    left: 16px;
                }

                .progress-floating-button {
                    min-width: 80px;
                    height: 36px;
                    font-size: 11px;
                    padding: 0 12px;
                }

                .process-icon {
                    font-size: 16px;
                }

                .step-text {
                    font-size: 11px;
                }

                .progress-floating-panel {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: auto;
                    border-radius: 16px 16px 0 0;
                    max-height: 60vh;
                    transform: translateY(100%);
                }

                .progress-floating-panel.expanded {
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Create the floating button
     */
    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'progress-floating-button';
        this.button.innerHTML = `
            <div class="button-content">
                <div class="process-icon"><i class="material-icons">info_outline</i></div>
                <span class="step-text">Step 1/2</span>
                <div class="mini-progress-container">
                    <div class="mini-progress-bar">
                        <!-- Progress steps will be added here -->
                    </div>
                </div>
            </div>
        `;

        // Click handler to toggle panel
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePanel();
        });

        this.container.appendChild(this.button);
    }

    /**
     * Create the expandable panel
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'progress-floating-panel';

        this.panel.innerHTML = `
            <div class="progress-panel-header">
                <h3 class="progress-panel-title">Progress</h3>
                <button class="progress-panel-close" onclick="this.closest('.progress-floating-container').querySelector('.progress-floating-button').click()">×</button>
            </div>
            <div class="progress-panel-content">
                <div class="progress-section-info">
                    <div class="progress-section-name">Loading...</div>
                    <div class="progress-section-progress">0 of 0 steps</div>
                </div>
                <div class="progress-step-list">
                    <!-- Steps will be populated here -->
                </div>
            </div>
        `;

        this.container.appendChild(this.panel);
    }

    /**
     * FIXED: Render with proper completion detection
     */
    render(data) {
        if (!this.container || !this.button || !this.panel) {
            console.error('FloatingRenderer: Container components not found');
            return;
        }

        console.log('🔍 RENDER DEBUG:', {
            section: data.section,
            sectionName: data.sectionName,
            currentSubstep: data.currentSubstep,
            totalSubsteps: data.totalSubsteps,
            previousSection: this.previousData?.section,
            previousSubstep: this.previousData?.currentSubstep,
            completedSections: Array.from(this.completedSections)
        });

        // FIXED: Detect section completion
        const justCompletedSection = this.detectSectionCompletion(data);

        
        // Store previous data BEFORE updating current  
        this.previousData = this.currentData ? { ...this.currentData } : { section: null, currentSubstep: -1, totalSubsteps: 0 };
this.currentData = { ...data };

        // Update UI components
        this.updateButton(data);
        this.updatePanel(data);
        this.show();

        
        // FIXED: Only celebrate when section is truly completed AND floating is active
        if (justCompletedSection) {
            this.completedSections.add(data.section);
            
            // Skip celebration for welcome-flow and company-info sections
            if (data.section === 'welcome-flow') {
                console.log(`🔕 Skipping celebration for welcome-flow section - timeline generation is the endpoint`);
                return;
            }
            
            // Skip celebration for company-info section - only celebrate when bank account is connected
            if (data.section === 'company-info') {
                console.log(`🔕 Skipping celebration for company-info section - waiting for bank account completion`);
                return;
            }
            
            const celebrationType = this.getCelebrationType(data.section);
            console.log(`🎉 Section "${data.section}" COMPLETED! Celebration: ${celebrationType}`);

            // DEBUG: Check what's happening with the option check
            console.log('🔍 CELEBRATION DEBUG:', {
                progressManager: !!window.progressManager,
                currentOption: window.progressManager?.currentOption,
                isFloating: window.progressManager?.currentOption === 'floating',
                willCelebrate: window.progressManager && window.progressManager.currentOption === 'floating'
            });
            
            // Only celebrate if FloatingRenderer is the current active option
            if (window.progressManager && window.progressManager.currentOption === 'floating') {
                console.log('✅ FloatingRenderer is active - showing celebration');
                setTimeout(() => {
                    this.celebrate(celebrationType);
                }, 300);
            } else {
                console.log(`❌ Current option is ${window.progressManager?.currentOption} - skipping celebration`);
            }
        }
    }

    /**
     * FIXED: Detect when a section has just been completed
     */
    detectSectionCompletion(newData) {
        // No previous data = first render, no completion
        if (!this.previousData) {
            return false;
        }

        // Already celebrated this section
        if (this.completedSections.has(newData.section)) {
            return false;
        }

        // Same section, check if we just reached the FINAL step (completion)
        // UPDATE this part in your detectSectionCompletion() method:

        // Same section, check if we just reached the FINAL step (completion)
        if (this.previousData.section === newData.section) {
            const wasNotAtFinalStep = this.previousData.currentSubstep < (this.previousData.totalSubsteps - 1);
            const isNowAtFinalStep = newData.currentSubstep >= (newData.totalSubsteps - 1);

            // HANDLE STEP JUMPS: like going from step 0 directly to step 2
            const isLargeStepJump = newData.currentSubstep > this.previousData.currentSubstep + 1;

            console.log('🔍 SAME SECTION COMPLETION CHECK:', {
                wasNotAtFinalStep,
                isNowAtFinalStep,
                isLargeStepJump,  // NEW LOG
                prevStep: this.previousData.currentSubstep,
                currentStep: newData.currentSubstep,
                finalStep: newData.totalSubsteps - 1
            });

            // CELEBRATE if: normal progression OR large jump to final step
            return (wasNotAtFinalStep && isNowAtFinalStep) || (isLargeStepJump && isNowAtFinalStep);
        }

        // Different section - check if new section starts at final step (single-step sections)
        if (this.previousData.section !== newData.section) {
            const isImmediatelyAtFinalStep = newData.currentSubstep >= (newData.totalSubsteps - 1);

            console.log('🔍 NEW SECTION COMPLETION CHECK:', {
                isImmediatelyAtFinalStep,
                currentStep: newData.currentSubstep,
                finalStep: newData.totalSubsteps - 1,
                totalSteps: newData.totalSubsteps
            });

            return isImmediatelyAtFinalStep;
        }

        return false;
    }

    /**
     * FIXED: Get celebration type based on section key (not name)
     */
    getCelebrationType(sectionKey) {
        console.log('🔍 SECTION KEY DEBUG:', sectionKey);

        switch(sectionKey) {
            case 'company-info':
            case 'company':
            case 'document-upload':
            case 'documents':
                console.log('✅ Matched: company-info -> professional');
                return 'professional';

            case 'pay-schedule':
            case 'pay-schedules':
            case 'payroll-schedule':
            case 'schedule':
            case 'schedules':
                console.log('✅ Matched: pay-schedule -> professional');
                return 'professional';

            case 'earnings-code':
            case 'earning-codes':
            case 'earnings':
                console.log('✅ Matched: earnings-code -> money');
                return 'money';

                case 'tax-configuration-simple':
                case 'tax-configuration-complex':
                case 'tax-configuration':
                case 'tax-setup':
                    console.log('✅ Matched: tax-configuration -> money');
                    return 'money';

            default:
                console.log('⚠️ No match found for:', sectionKey, '-> using professional');
                return 'professional';
        }
    }

    /**
     * FIXED: Update button with proper step counting
     */
    updateButton(data) {
        // FIXED: Prevent step counter from exceeding total
        const stepText = this.button.querySelector('.step-text');
        if (stepText) {
            const displayStep = Math.min(data.currentSubstep + 1, data.totalSubsteps);
            stepText.textContent = `Step ${displayStep}/${data.totalSubsteps}`;
        }

        // Update mini progress bar
        const progressBar = this.button.querySelector('.mini-progress-bar');
        if (progressBar) {
            // Clear existing steps
            progressBar.innerHTML = '';

            // Create progress steps
            for (let i = 0; i < data.totalSubsteps; i++) {
                const step = document.createElement('div');
                step.className = 'mini-progress-step';

                // For company-info section, don't mark step 0 as completed when at step 0
                // Only mark steps as completed if we've actually progressed past them
                if (i < data.currentSubstep) {
                    step.classList.add('completed');
                } else if (i === data.currentSubstep) {
                    step.classList.add('current');
                } else {
                    step.classList.add('pending');
                }

                progressBar.appendChild(step);
            }
        }
    }

    /**
     * FIXED: Update panel with proper step counting
     */
    updatePanel(data) {
        // Update section info
        const sectionName = this.panel.querySelector('.progress-section-name');
        const sectionProgress = this.panel.querySelector('.progress-section-progress');
        const sectionInfo = this.panel.querySelector('.progress-section-info');

        // Add "Back to Implementation timeline" link for company-info section
        if (data.section === 'company-info' && sectionInfo) {
            // Check if link already exists
            let backLink = sectionInfo.querySelector('.back-to-timeline-link');
            if (!backLink) {
                backLink = document.createElement('div');
                backLink.className = 'back-to-timeline-link';
                backLink.innerHTML = `
                    <a href="#" onclick="backToImplementationTimeline(); return false;" 
                       style="color: #30258D; text-decoration: none; font-size: 12px; display: inline-flex; align-items: center; margin-bottom: 8px;">
                        <span style="margin-right: 4px;">←</span> Back to Implementation timeline
                    </a>
                `;
                sectionInfo.insertBefore(backLink, sectionInfo.firstChild);
            }
        } else {
            // Remove back link if not in company-info section
            const existingLink = sectionInfo?.querySelector('.back-to-timeline-link');
            if (existingLink) {
                existingLink.remove();
            }
        }

        if (sectionName) {
            sectionName.textContent = data.sectionName;
        }
        if (sectionProgress) {
            // FIXED: Prevent step counter from exceeding total
            const displayStep = Math.min(data.currentSubstep + 1, data.totalSubsteps);
            sectionProgress.textContent = `${displayStep} of ${data.totalSubsteps} steps`;
        }

        // Update step list
        const stepList = this.panel.querySelector('.progress-step-list');
        if (stepList) {
            stepList.innerHTML = '';

            data.substeps.forEach((substep, index) => {
                const stepItem = this.createStepItem(substep, index, data);
                stepList.appendChild(stepItem);
            });
        }
    }

    /**
     * Create a step item for the panel
     */
    createStepItem(substep, index, data) {
        const stepItem = document.createElement('div');
        stepItem.className = 'progress-step-item';

        // Determine step state
        let state = 'pending';
        if (index < data.currentSubstep) {
            state = 'completed';
        } else if (index === data.currentSubstep) {
            state = 'current';
        }

        stepItem.classList.add(state);

        // Create step icon
        const stepIcon = document.createElement('div');
        stepIcon.className = `progress-step-icon ${state}`;

        if (state === 'completed') {
            stepIcon.innerHTML = '✓';
        } else {
            stepIcon.textContent = index + 1;
        }

        // Create step text
        const stepText = document.createElement('div');
        stepText.className = 'progress-step-text';
        stepText.textContent = substep;

        stepItem.appendChild(stepIcon);
        stepItem.appendChild(stepText);

        return stepItem;
    }

    /**
     * Toggle panel expanded state
     */
    togglePanel() {
        if (this.isExpanded) {
            this.collapsePanel();
        } else {
            this.expandPanel();
        }
    }

    /**
     * Expand the panel
     */
    expandPanel() {
        if (!this.panel) return;

        this.panel.classList.add('expanded', 'expanding');
        this.button.classList.add('expanded');
        this.isExpanded = true;

        setTimeout(() => {
            this.panel.classList.remove('expanding');
        }, 300);

        console.log('FloatingRenderer: Panel expanded');
    }

    /**
     * Collapse the panel
     */
    collapsePanel() {
        if (!this.panel) return;

        this.panel.classList.remove('expanded');
        this.button.classList.remove('expanded');
        this.isExpanded = false;

        console.log('FloatingRenderer: Panel collapsed');
    }

    /**
     * Show the floating container
     */
    show() {
        if (this.container) {
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.classList.add('has-progress');
            }

            this.container.classList.remove('slide-out');
            this.container.classList.add('visible');
            this.isVisible = true;

            console.log('FloatingRenderer: Showing with slide animation');
        }
    }

    /**
     * Hide the floating container
     */
    hide() {
        if (this.container) {
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.classList.remove('has-progress');
            }

            this.container.classList.add('slide-out');
            this.container.classList.remove('visible');
            this.isVisible = false;
            this.isExpanded = false;

            if (this.panel) {
                this.panel.classList.remove('expanded');
            }
            if (this.button) {
                this.button.classList.remove('expanded');
            }

            console.log('FloatingRenderer: Hiding with slide animation');
        }
    }

    /**
     * Get current visibility state
     */
    isShowing() {
        return this.isVisible;
    }

    /**
     * Destroy the renderer and clean up
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.button = null;
            this.panel = null;
        }

        const styles = document.getElementById('floating-renderer-styles');
        if (styles) {
            styles.remove();
        }

        this.isVisible = false;
        this.isExpanded = false;
        this.currentData = null;
        this.completedSections.clear();
        this.previousData = null;

        console.log('FloatingRenderer destroyed');
    }

    // ====================================
    // CELEBRATION METHODS
    // ====================================

    /**
     * Trigger celebration animation for the floating button
     */
    celebrate(type) {
        
        console.log(`🚨 CELEBRATE CALLED:`, type);
        console.log('📍 Call Stack:');
        console.trace();
        
        console.log(`🎉 FloatingRenderer celebrating with type: ${type}`);

        if (typeof confetti === 'undefined') {
            console.warn('❌ Confetti library not loaded');
            return;
        }

        // Get button position for confetti origin
        const origin = this.getButtonOrigin();
        console.log('🎯 Confetti origin:', origin);

        // Add visual feedback to button
        this.addButtonCelebrationEffect();

        // Trigger confetti based on type
        switch(type) {
            case 'professional':
            case 'documents':
            case 'corporate':
                console.log('🔵 Triggering professional celebration');
                this.corporateCelebration(origin);
                break;

            case 'money':
            case 'golden':
            case 'success':
                console.log('💰 Triggering money celebration');
                this.moneyCelebration(origin);
                break;

            case 'completion':
                console.log('🌈 Triggering RAINBOW celebration!');
                this.completionCelebration(origin);
                break;

            default:
                console.log('⚪ Triggering default celebration');
                this.defaultCelebration(origin);
        }
    }

    /**
     * Get button position for confetti origin
     */
    getButtonOrigin() {
        if (!this.button) {
            return { x: 0.1, y: 0.2 }; // Left side default
        }

        const rect = this.button.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
        };
    }

    /**
     * Add visual celebration effect to the button itself
     */
    addButtonCelebrationEffect() {
        if (!this.button) return;

        // Add celebration class for CSS animation
        this.button.classList.add('celebrating');

        // Remove class after animation
        setTimeout(() => {
            if (this.button) {
                this.button.classList.remove('celebrating');
            }
        }, 1000);
    }

    /**
     * Professional/Corporate celebration (Blue/white papers)
     */
    corporateCelebration(origin) {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: origin,
            colors: ['#30258D', '#28a745', '#ffffff', '#e8f4fd'],
            shapes: ['square', 'circle'],
            gravity: 0.8,
            drift: 0.1,
            startVelocity: 30
        });
    }

    /**
     * Money/Success celebration (Golden shower)
     */
    moneyCelebration(origin) {
        // Golden burst
        confetti({
            particleCount: 80,
            spread: 100,
            origin: origin,
            colors: ['#ffd700', '#ffed4e', '#ffc107', '#ff8f00'],
            shapes: ['circle', 'square'],
            gravity: 0.9,
            drift: 0.3,
            startVelocity: 40
        });

        // Money rain effect
        setTimeout(() => {
            confetti({
                particleCount: 40,
                angle: 90,
                spread: 30,
                origin: { x: origin.x, y: 0 },
                colors: ['#28a745', '#ffd700'],
                shapes: ['square'],
                gravity: 1.2,
                drift: 0.1,
                startVelocity: 30
            });
        }, 500);
    }

    /**
     * Completion celebration - Rainbow explosion
     */
    completionCelebration(origin) {
        confetti({
            particleCount: 20,
            spread: 50,
            origin: origin,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
            shapes: ['circle', 'square'],
            gravity: 0.9,
            drift: 0.1,
            startVelocity: 1,
            scalar: 0.9
        });
    }

    /**
     * Default celebration
     */
    defaultCelebration(origin) {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: origin,
            colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb'],
            gravity: 0.8,
            drift: 0.1,
            startVelocity: 30
        });
    }
}

// Auto-register with ProgressManager
setTimeout(() => {
    if (window.progressManager && window.progressManager.registerRenderer) {
        const renderer = new FloatingRenderer();
        window.progressManager.registerRenderer('floating', renderer);
        console.log('✅ FloatingRenderer registered successfully');
    } else {
        console.log('⚠️ FloatingRenderer: ProgressManager not ready, storing instance...');
        window.floatingRendererInstance = new FloatingRenderer();

        // Keep trying to register
        const checkAndRegister = () => {
            if (window.progressManager && window.progressManager.registerRenderer) {
                window.progressManager.registerRenderer('floating', window.floatingRendererInstance);
                console.log('✅ FloatingRenderer registered successfully (delayed)');
                delete window.floatingRendererInstance;
            } else {
                setTimeout(checkAndRegister, 100);
            }
        };
        setTimeout(checkAndRegister, 100);
    }
}, 200);

console.log('✅ FloatingRenderer.js file loaded completely');