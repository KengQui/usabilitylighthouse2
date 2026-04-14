/**
 * ProgressManager - Core state management for workflow progress indicators
 * Uses floating renderer exclusively for progress visualization
 */

class ProgressManager {
    constructor() {
        // Core state
        this.currentOption = this.loadSavedOption();
        this.currentSection = null;
        this.currentSubstep = 0;
        this.isActive = false;

        // Workflow configuration
        this.workflows = {
            'welcome-flow': {
                name: 'Welcome Setup',
                substeps: [
                    'Your role',
                    'Time in role', 
                    'Team assistance',
                    'Company size',
                    'Industry code',
                    'Employee types',
                    'Pay schedule',
                    'First payroll date',
                    'Generate timeline'
                ]
            },
            'company-info': {
                name: 'Company Setup',
                substeps: ['EIN & company details', 'Bank account setup']
            },
            'bank-account': {
                name: 'Bank Account',
                substeps: ['Connect bank', 'Verify connection']
            },
            'pay-schedule': {
                name: 'Pay Schedule',
                substeps: ['Review schedules', 'Calendar simulation']
            },
            
            'earnings-code': {
                name: 'Earnings Code',
                substeps: ['Review & organize', 'Pay calculation', 'Overtime setup', 'Rate configuration', 'W-2 preview']
            },

            'main-earnings-workflow': {
                name: 'Main Earnings Workflow',
                substeps: ['Setup earnings', 'Configure rates', 'Review settings', 'Finalize setup']
            },
            'rate-configuration': {
                name: 'Rate Configuration',
                substeps: ['Setup base rates', 'Configure overtime', 'Review calculations']
            },

            'main-earnings-workflow': {
                name: 'Main Earnings Workflow',
                substeps: ['Setup earnings', 'Configure rates', 'Review settings', 'Finalize setup']
            },
            'pay-method': {
                name: 'Pay Method',
                substeps: ['Select method', 'Configure settings', 'Verify setup']
            },
            
            'tax-configuration-simple': {
                name: 'Tax Setup (Simple)',
                substeps: ['Tax types review', 'Basic configuration', 'Complete setup']
            },
            'tax-configuration-complex': {
                name: 'Tax Setup (Advanced)', 
                substeps: ['Tax analysis', 'Multi-state setup', 'Employer taxes', 'State registration', 'Verification', 'Final configuration']
            }
            
        };

        // Renderer instances (will be set when renderers are created)
        this.renderers = {
            floating: null
        };

        // Store original methods for restoration
        this.originalEnterWorkflow = null;
        this.isWelcomeFlowActive = false;

        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('ProgressManager initialized with option:', this.currentOption);

        // Set up keyboard listener
        this.setupKeyboardShortcuts();

        // Check URL parameters
        this.checkURLParams();

        // Set up debug panel
        this.setupDebugPanel();

        // Initialize renderers
        this.initializeRenderers();

        // Hide all progress indicators initially
        this.hideAllProgress();
        
        // Prevent progress bars during welcome flow
        this.preventDuringWelcomeFlow();
    }

    // ====================================
    // RENDERER INITIALIZATION
    // ====================================

    initializeRenderers() {
        // Wait a bit for renderers to load, then try to register any existing instances
        setTimeout(() => {
            // Try to register manually if instances exist
            if (window.floatingRendererInstance) {
                this.registerRenderer('floating', window.floatingRendererInstance);
                delete window.floatingRendererInstance;
            }

            // Initialize new instances if none were registered
            if (!this.renderers.floating && typeof FloatingRenderer !== 'undefined') {
                this.renderers.floating = new FloatingRenderer();
                console.log('✅ FloatingRenderer initialized directly');
            }

            console.log('✅ Final renderers:', Object.keys(this.renderers).filter(key => this.renderers[key]));
        }, 200);
    }

    /**
     * Handle progress bars during welcome flow
     */
    preventDuringWelcomeFlow() {
        // Store original method first
        if (!this.originalEnterWorkflow) {
            this.originalEnterWorkflow = this.enterWorkflow.bind(this);
        }
        
        // Check if we're in welcome flow state
        if (window.welcomeState && window.welcomeState.currentStep) {
            console.log('🎯 Welcome flow detected - progress bars will be allowed for welcome-flow section');
            this.isWelcomeFlowActive = true;
            
            // Override enterWorkflow to only allow welcome-flow section
            this.enterWorkflow = (section, substep = 0) => {
                if (this.isWelcomeFlowActive && section !== 'welcome-flow') {
                    console.log('🔒 Blocked non-welcome workflow during welcome flow:', section);
                    return;
                }
                return this.originalEnterWorkflow(section, substep);
            };
        }
        
        // Listen for welcome flow completion
        document.addEventListener('welcomeFlowComplete', () => {
            console.log('🔓 Welcome flow complete - enabling all progress bars');
            this.isWelcomeFlowActive = false;
            // Restore original enterWorkflow method
            if (this.originalEnterWorkflow) {
                this.enterWorkflow = this.originalEnterWorkflow;
            }
            // Exit the welcome flow progress
            this.exitWorkflow();
        });
    }

    /**
     * Check if timeline is currently transitioning
     */
    isTimelineTransitioning() {
        // Only check for skeleton elements which indicate actual timeline generation
        // Don't check panel states as they might be hidden for other reasons
        const skeletonElements = document.querySelectorAll('.skeleton-task-line, .skeleton-due-line, .skeleton-progress-bar');
        if (skeletonElements.length > 0) {
            console.log('🔍 Timeline transitioning: skeleton elements found');
            return true;
        }
        
        // Check if the table panel has the timeline-generating class
        const tablePanel = document.getElementById('tablePanel');
        if (tablePanel && tablePanel.classList.contains('timeline-generating')) {
            console.log('🔍 Timeline transitioning: timeline-generating class found');
            return true;
        }
        
        return false;
    }

    /**
     * Register a renderer instance
     * @param {string} type - Renderer type ('dots', 'floating', 'horizontal')
     * @param {Object} renderer - Renderer instance
     */
    registerRenderer(type, renderer) {
        if (!['dots', 'floating', 'horizontal'].includes(type)) {
            console.error('Invalid renderer type:', type);
            return;
        }

        this.renderers[type] = renderer;
        console.log(`✅ Renderer registered: ${type}`);
    }

    // ====================================
    // CORE WORKFLOW METHODS
    // ====================================

    /**
     * Enter a workflow section
     * @param {string} section - The workflow section key
     * @param {number} substep - Starting substep (default 0)
     */
    enterWorkflow(section, substep = 0) {
       if (!this.workflows[section]) {
           console.error('Unknown workflow section:', section);
        return;
        }

        // Additional check for welcome flow state - allow only welcome-flow section
        if (this.isWelcomeFlowActive && section !== 'welcome-flow') {
            console.log('🔒 Blocked non-welcome workflow during welcome flow:', section);
            return;
        }

        // Additional check to prevent progress bars during timeline transition
        if (this.isTimelineTransitioning()) {
            console.log('🔒 Blocked workflow entrance during timeline transition:', section);
            return;
        }

        console.log(`🚀 ENTERING WORKFLOW: ${section}, substep: ${substep}`);
        console.log(`🚀 Stack trace:`, new Error().stack);

        this.currentSection = section;
        this.currentSubstep = substep;
        this.isActive = true;

        this.render();
    }

    /**
     * Exit current workflow
     */
    exitWorkflow() {
        console.log('Exiting workflow');

        this.currentSection = null;
        this.currentSubstep = 0;
        this.isActive = false;

        this.hideAllProgress();
    }

    /**
     * Update progress within current workflow
     * @param {number} substep - New substep index
     */
    updateProgress(substep) {
        if (!this.isActive || !this.currentSection) {
            console.warn('Cannot update progress - no active workflow');
            return;
        }

        const workflow = this.workflows[this.currentSection];

        // Allow substep to equal totalSubsteps (for completion)
        if (substep > workflow.substeps.length) {
            console.warn('Substep index out of range:', substep);
            return;
        }

        

        console.log(`Updating progress: ${this.currentSection} -> substep ${substep}`);
        this.currentSubstep = substep;
        this.render();
    }

    /**
     * Update current substep (alias for updateProgress)
     * @param {number} substep - New substep index
     */
    updateSubstep(substep) {
        this.updateProgress(substep);
    }

    /**
     * Complete current workflow and move to next
     * @param {string} nextSection - Next workflow section (optional)
     */
    completeWorkflow(nextSection = null) {
        console.log(`Completing workflow: ${this.currentSection}`);

        if (nextSection) {
            this.enterWorkflow(nextSection, 0);
        } else {
            this.exitWorkflow();
        }
    }

    // ====================================
    // CELEBRATION METHODS
    // ====================================

    /**
     * Trigger celebration for FloatingRenderer only
     */
    triggerCelebration(section, completedStep) {
        // Only show celebrations for floating option
        if (this.currentOption !== 'floating') {
            console.log(`🔕 Celebration skipped - current option: ${this.currentOption}`);
            return;
        }

        console.log(`🎉 Triggering celebration for ${section}, step ${completedStep}`);
        const celebrationType = this.getCelebrationType(section, completedStep);

        // Call celebration on FloatingRenderer after a short delay
        setTimeout(() => {
            if (this.renderers.floating && this.renderers.floating.celebrate) {
                this.renderers.floating.celebrate(celebrationType);
            }
        }, 500);
    }

    /**
     * Get celebration type based on workflow section and step
     */
    getCelebrationType(section, step) {
        const celebrations = {
            'company-info': ['professional', 'documents', 'corporate'],
            'pay-schedule': ['calendar', 'schedule', 'timeline'], 
            'earnings-code': ['money', 'golden', 'success']
        };

        return celebrations[section]?.[step - 1] || 'default';
    }

    // ====================================
    // OPTION SWITCHING METHODS
    // ====================================

    /**
     * Switch to a different progress option
     * @param {string} option - 'dots', 'floating', or 'horizontal'
     */
    switchOption(option) {
        const validOptions = ['floating'];

        if (!validOptions.includes(option)) {
            console.error('Invalid progress option:', option);
            return;
        }

        console.log(`Switching progress option: ${this.currentOption} -> ${option}`);

        // Hide current option
        this.hideAllProgress();

        // Update option
        this.currentOption = option;

        // Save to localStorage
        this.saveOption(option);

        // Update URL
        this.updateURL();

        // Re-render if workflow is active
        if (this.isActive) {
            this.render();
        }

        // Notify user
        this.showOptionChange(option);
    }

    /**
     * Cycle to next option (for keyboard shortcut)
     */
    cycleOption() {
        // Only floating renderer is available now, so cycling is disabled
        console.log('Progress cycling disabled - only floating renderer is available');
    }

    // ====================================
    // RENDERING METHODS
    // ====================================

    /**
     * Render current progress using active option
     */
    render() {
        if (!this.isActive || !this.currentSection) {
            console.log('🔍 Render called but not active or no section');
            return;
        }

        console.log(`🎨 RENDERING PROGRESS: ${this.currentSection} with ${this.currentOption}`);
        console.log(`🎨 Stack trace:`, new Error().stack);

        // Try to get renderer, if not available yet, wait a bit and retry
        const renderer = this.renderers[this.currentOption];
        if (!renderer) {
            console.warn(`Renderer not found for option: ${this.currentOption}, will retry in 100ms`);
            setTimeout(() => {
                if (this.isActive && this.currentSection) {
                    this.render();
                }
            }, 100);
            return;
        }

        const workflow = this.workflows[this.currentSection];
        const progressData = {
            section: this.currentSection,
            sectionName: workflow.name,
            substeps: workflow.substeps,
            currentSubstep: this.currentSubstep,
            totalSubsteps: workflow.substeps.length
        };

        console.log(`🎨 Calling renderer.render() for ${this.currentOption}`);
        renderer.render(progressData);
    }

    /**
     * Hide all progress indicators
     */
    hideAllProgress() {
        console.log('🚨 ProgressManager hideAllProgress() called');
        console.log('🚨 hideAllProgress called from:', new Error().stack);
        
        Object.values(this.renderers).forEach(renderer => {
            if (renderer && renderer.hide) {
                renderer.hide();
            }
        });
    }

    // ====================================
    // SETUP METHODS
    // ====================================

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+P disabled (only floating renderer available)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                console.log('Ctrl+P disabled - only floating renderer is available');
            }

            // Ctrl+Shift+D for debug panel
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.showDebugPanel();
            }
        });
    }

    /**
     * Check URL parameters for progress option
     */
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const progressParam = urlParams.get('progress');

        if (progressParam && progressParam === 'floating') {
            this.switchOption(progressParam);
        }
    }

    /**
     * Set up debug panel (double-click Bryte logo)
     */
    setupDebugPanel() {
        // Try multiple selectors to find Bryte logos
        const logoSelectors = [
            'img[alt*="Bryte"]', 
            'img[src*="bryte"]', 
            'img[src*="Bryte"]',
            '.ai-logo',
            '.wizard-bryte-logo',
            '.bryte-logo'
        ];

        let bryteLogos = [];
        logoSelectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            bryteLogos = [...bryteLogos, ...Array.from(found)];
        });

        console.log('Found Bryte logos:', bryteLogos.length);

        // If no logos found, add listener to any img in header
        if (bryteLogos.length === 0) {
            const headerImages = document.querySelectorAll('header img, .global-header img, .header-image');
            bryteLogos = Array.from(headerImages);
            console.log('Using header images instead:', bryteLogos.length);
        }

        bryteLogos.forEach(logo => {
            let clickCount = 0;
            let clickTimer = null;

            logo.addEventListener('click', (e) => {
                e.preventDefault();
                clickCount++;

                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 300);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    this.showDebugPanel();
                }
            });

            // Add visual indicator that logo is clickable
            logo.style.cursor = 'pointer';
            logo.title = 'Double-click to open progress debug panel';
        });

        console.log(`Debug panel setup complete. ${bryteLogos.length} clickable elements found.`);
        console.log('Backup: Press Ctrl+Shift+D to open debug panel');
    }

    /**
     * Show debug panel for testing
     */
    showDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'progress-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #30258D;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 12px;">Progress Debug Panel</div>

            <div style="margin-bottom: 8px;">
                <strong>Current Option:</strong> ${this.currentOption}
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Active:</strong> ${this.isActive}
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Section:</strong> ${this.currentSection || 'None'}
            </div>

            <div style="margin-bottom: 12px;">
                <strong>Substep:</strong> ${this.currentSubstep}
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Progress Renderer:</strong> Floating (Only option available)
            </div>

            <div style="margin-bottom: 8px;">
                <button onclick="progressManager.enterWorkflow('company-info', 0)" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Company</button>
                <button onclick="progressManager.enterWorkflow('pay-schedule', 0)" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Pay Schedule</button>
                <button onclick="progressManager.enterWorkflow('earnings-code', 0)" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Earnings</button>
            </div>

            <div style="margin-bottom: 8px;">
                <button onclick="progressManager.updateProgress(progressManager.currentSubstep + 1)" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Next Step</button>
                <button onclick="progressManager.exitWorkflow()" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Exit</button>
            </div>

            <div style="margin-bottom: 8px;">
                <button onclick="progressManager.renderers.floating.celebrate('corporate')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Corporate</button>
                <button onclick="progressManager.renderers.floating.celebrate('calendar')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Calendar</button>
                <button onclick="progressManager.renderers.floating.celebrate('money')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Test Money</button>
            </div>

            <button onclick="document.getElementById('progress-debug-panel').remove()" style="background: #dc3545; color: white; border: none; padding: 4px 8px; font-size: 10px; margin-top: 8px;">Close</button>
        `;

        // Remove existing panel if present
        const existing = document.getElementById('progress-debug-panel');
        if (existing) existing.remove();

        document.body.appendChild(panel);
    }

    // ====================================
    // UTILITY METHODS
    // ====================================

    /**
     * Load saved option from localStorage
     */
    loadSavedOption() {
        // Always return 'floating' as it's the only option
        return 'floating';
    }

    /**
     * Save option to localStorage
     */
    saveOption(option) {
        localStorage.setItem('progress-option', option);
    }

    /**
     * Update URL with current option
     */
    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('progress', this.currentOption);
        window.history.replaceState({}, '', url);
    }

    /**
     * Show notification when option changes
     */
    showOptionChange(option) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #30258D;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;

        notification.textContent = `Progress Option: ${option}`;

        // Add CSS animation
        if (!document.getElementById('progress-notification-style')) {
            const style = document.createElement('style');
            style.id = 'progress-notification-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Get current progress data (for external use)
     */
    getCurrentProgress() {
        if (!this.isActive || !this.currentSection) {
            return null;
        }

        const workflow = this.workflows[this.currentSection];
        return {
            option: this.currentOption,
            section: this.currentSection,
            sectionName: workflow.name,
            substeps: workflow.substeps,
            currentSubstep: this.currentSubstep,
            totalSubsteps: workflow.substeps.length,
            isActive: this.isActive
        };
    }
}

// Initialize global instance ONLY ONCE
if (!window.progressManager) {
    window.progressManager = new ProgressManager();
    console.log('✅ ProgressManager created successfully');
} else {
    console.log('⚠️ ProgressManager already exists');
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressManager;
}