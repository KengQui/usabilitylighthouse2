// ========================================
// CONSTANTS & CONFIGURATION
// All hardcoded strings, settings, and configuration data
// ========================================

// ────────────────────────────────────────────────────────────────
// OT-ELIGIBILITY “GATE”  ❱  Five screening questions for WAOT
// ────────────────────────────────────────────────────────────────
const waotEligibility = {
  multiRate: null,
  shiftDiff: null,
  samePeriodBonus: null,
  multiPeriodBonus: null,
  fixedSalary: null
};

const OT_ELIGIBILITY_QUESTIONS = [
  {
    id: 'multiRate',
    prompt: '<strong>Does weighted average overtime apply to you?</strong>\n\nI\'ll ask a few quick questions. If any answer is \"yes,\" we\'ll set this up for you.\n\nIn a single work-week, do any employees work multiple jobs that pay different hourly rates?',
    why: 'Weighted average overtime, also called blended overtime, occurs when an employee works more than 40 hours in a workweek while performing different jobs at varying pay rates. Instead of calculating overtime based on a single hourly rate, employers must determine an average rate that fairly represents all the work performed.\n\nThe Fair Labor Standards Act (FLSA) requires this calculation method to ensure employees receive proper overtime compensation. According to federal regulation 29 CFR § 778.115, when an employee works at two or more different types of work with different pay rates, their regular rate for that week is the weighted average of those rates',
    example: 'E.g., a nurse’s aide works 25 hrs at $11/hr and 15 hrs as a receptionist at $7/hr in the same week.'
  },
  {
    id: 'shiftDiff',
    prompt: 'Do you pay a shift differential or premium—for instance an extra amount for evening or night shifts?',
    why: 'Shift premiums must be folded into the regular rate before overtime.',
    example: 'E.g., you add $2/hr for all hours worked after 7 p.m.'
  },
  {
    id: 'samePeriodBonus',
    prompt: 'Do employees receive any non-discretionary bonuses earned and paid <strong>in the same pay period</strong>?',
    why: 'Such bonuses must be included in that period’s regular-rate calculation.',
    example: 'E.g., a $50 quality bonus is earned and paid in the same week that overtime is worked.'
  },
  {
    id: 'multiPeriodBonus',
    prompt: 'Do employees earn bonuses, commissions, or incentive pay that cover <strong>more than one pay period</strong>?',
    why: 'Those payments must be prorated across every overtime week they cover.',
    example: 'E.g., a $600 retention bonus covering 12 weeks adds $50 to each week’s regular rate.'
  },
  {
    id: 'fixedSalary',
    prompt: 'Do you have any non-exempt employees who earn a <strong>fixed salary</strong> even though their weekly hours vary?',
    why: 'Their salary must be converted to an hourly rate each week before overtime.',
    example: 'E.g., a salaried worker makes $600 and works 50 hrs; 600 ÷ 50 = $12/hr regular rate.'
  }
];


const CONSTANTS = {
    // Common Messages
    MESSAGES: {
        PERFECT: "Perfect!"
    },
   
    // Error Messages
    ERRORS: {
        INVALID_NAME: "Please enter a valid company name (at least 2 characters).",
        INVALID_ADDRESS: "Please enter a complete address (at least 10 characters).",
        INVALID_EIN: "Please enter a valid EIN in the format: XX-XXXXXXX (e.g., 12-3456789)",
        MISSING_SELECTION: "Please make a selection before continuing.",
        UPLOAD_FAILED: "Upload failed. Please try again."
    },

    // Step Labels
    STEPS: {
        STEP_1: "Step 1 of 6: Review each pay schedule and approve them",
        STEP_2: "Step 2 of 6: Review payroll calendar simulation",
        STEP_3: "Step 3 of 6: Earning Codes Review",
        STEP_4: "Step 4 of 6: Suggestions",
        STEP_5: "Step 5 of 6: Rate Configuration",
        STEP_6: "Step 6 of 6: W-2 Tax Form Preview"
    },

    // File Settings
    FILES: {
        HANDBOOK_FORMATS: "Supports: PDF, DOC, DOCX",
        PAYROLL_FORMATS: "Supports: PDF, Excel, CSV",
        UPLOAD_TEXT: "Drag & drop your files here or click to browse"
        
    }
};


// ========================================
// GLOBAL STATE & DATA
// ========================================
// Application State
let currentStep = 1;
let reviewProgress = {
    totalCodes: 34,
    reviewedCodes: 0,
    approvedCodes: []
};

// Drag session tracking for carousel
let dragSessionMoves = [];
let dragSessionTimer = null;
let dragSessionId = 0;

// ========================================
// EARNING CODE CREATION WORKFLOW STATE
// ========================================

// State for earning code creation
let earningCodeCreationState = {
    step: 1, // 1: description, 2: suggestion, 3: confirmation
    description: '',
    suggestedCode: '',
    suggestedName: '',
    userCode: '',
    userName: '',
    isActive: false
};



let isBulkEditing = false;

// Additional input state flags for earning codes
window.waitingForEarningCodeDescription = false;
window.waitingForEarningCodeName = false;
window.waitingForEarningCodeCode = false;

const contextualSteps = {
    paySchedules: [
        { id: 1, label: 'Review Schedules' },
        { id: 2, label: 'Calendar Sim' },
        { id: 3, label: 'Approve' }
    ],
    earningCodes: [
        { id: 3, label: 'Review Codes' },
        { id: 4, label: 'Suggestions' },
        { id: 5, label: 'Rate Config' },
        { id: 6, label: 'W-2 Preview' }
    ],
    companyInfo: [
        { id: 1, label: 'Extract Info' },
        { id: 2, label: 'Confirm' },
        { id: 3, label: 'Finalize' }
    ]
};

// Rate Configuration Workflow State
let rateConfigurationState = {
    currentSubStep: 1,
    totalSubSteps: 5,
    isActive: false,
    completedSteps: [],
    configurations: {
        payCalculation: {},
        weightedOvertimeCalc: {},
        baseCompensation: {},
        specialTax: {},
        thresholds: {}
    }
};

// Initialize editing state for earning codes
const editingState = {};

// Function to update earning code field values
function updateEarningCodeField(input) {
    const code = input.getAttribute('data-code');
    const field = input.getAttribute('data-field');
    const value = input.value;
    
    console.log(`Updating ${code}.${field} = ${value}`);
    
    // Find the earning code and update the field
    const earningCode = earningCodes.find(c => c.code === code);
    if (earningCode) {
        earningCode[field] = value;
        
        // Clear editing state for this field
        if (editingState[code]) {
            delete editingState[code][field];
            if (Object.keys(editingState[code]).length === 0) {
                delete editingState[code];
            }
        }
        
        // Refresh the table to show the updated value
        showEarningCodesReview({ showMessage: false });
    }
}

// ===================================
// UNIFIED DRAG AND DROP SYSTEM
// ===================================

class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.currentContext = null;
        this.activeListeners = new Map();

        // Define which columns should use special list styling
        this.specialListColumns = {
            'weighted-ot': ['review', 'uncategorized'],
            'pay-calc': [], // ✅ ONLY formula-needed should use list style
            'special-tax': ['no-special-tax'],
            'base-comp': ['notapplicable']
        };
    }

    // Universal initialization for all drag contexts
    initialize(context = 'weighted-ot') {
        this.currentContext = context;
        console.log(`Initializing drag and drop for: ${context}`);

        this.cleanup();

        const selectors = this.getSelectors(context);
        const draggables = document.querySelectorAll(selectors.draggable);
        const dropZones = document.querySelectorAll(selectors.dropZone);

        console.log(`Found ${draggables.length} draggables and ${dropZones.length} drop zones`);

        if (draggables.length === 0 || dropZones.length === 0) {
            console.warn(`No drag elements found for context: ${context}`);
            return;
        }

        // Add listeners to draggable cards
        draggables.forEach(card => {
            const dragStart = (e) => this.handleDragStart(e);
            const dragEnd = (e) => this.handleDragEnd(e);

            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);

            this.activeListeners.set(card, { dragStart, dragEnd });
        });

        // Add listeners to drop zones
        dropZones.forEach(zone => {
            const dragOver = (e) => this.handleDragOver(e);
            const drop = (e) => this.handleDrop(e);
            const dragEnter = (e) => this.handleDragEnter(e);
            const dragLeave = (e) => this.handleDragLeave(e);

            zone.addEventListener('dragover', dragOver);
            zone.addEventListener('drop', drop);
            zone.addEventListener('dragenter', dragEnter);
            zone.addEventListener('dragleave', dragLeave);

            this.activeListeners.set(zone, { dragOver, drop, dragEnter, dragLeave });
        });

        console.log(`Drag and drop initialized successfully for ${context}`);
    }

    // Get selectors based on context
    getSelectors(context) {
        const selectorMap = {
            'weighted-ot': {
                draggable: '.draggable-card, .draggable-list-item', // ✅ Add list items
                dropZone: '.drag-zone'
            },
            'pay-calc': {
                draggable: '#payCalcDragView .draggable-card',
                dropZone: '#payCalcDragView .drag-zone'
            },
            'special-tax': {
                draggable: '#specialTaxDragView .draggable-card',
                dropZone: '#specialTaxDragView .drag-zone'
            },
            'base-comp': {
                draggable: '#baseCompDragView .draggable-card',
                dropZone: '#baseCompDragView .drag-zone'
            }
        };
        return selectorMap[context] || selectorMap['weighted-ot'];
    }

    // Drag event handlers
    handleDragStart(e) {
        if (e.target.closest('.eye-icon') || e.target.closest('button') || e.target.closest('input')) {
            e.preventDefault();
            return false;
        }

        this.draggedElement = e.currentTarget;
        this.draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);

        console.log('Drag started for:', this.draggedElement.getAttribute('data-code'));
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const inBounds = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!inBounds) {
        e.currentTarget.classList.remove('drag-over');
      }
    }


    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (!this.draggedElement) return;

        const codeId = this.draggedElement.getAttribute('data-code');
        const newCategory = e.currentTarget.getAttribute('data-category');
        const fromCategory = this.draggedElement.closest('.drag-zone')?.getAttribute('data-category');

        // Move the card to the new column
        const newCard = this.createCardForCategory(this.draggedElement, newCategory);
        
        // Insert at the top of the column instead of appending
        if (e.currentTarget.firstChild) {
            e.currentTarget.insertBefore(newCard, e.currentTarget.firstChild);
        } else {
            e.currentTarget.appendChild(newCard);
        }

        // Remove original card
        this.draggedElement.remove();

        // Update counts
        this.updateColumnCounts();

        // Send feedback message
this.sendMoveMessage(codeId, fromCategory, newCategory);
// Re-attach drag listeners to all cards
this.reattachDragListeners();
console.log(`Moved ${codeId} from ${fromCategory} to ${newCategory}`);
    }

    sendMoveMessage(codeId, fromCategory, toCategory) {
        // Collect move data
        const moveData = {
            codeId: codeId,
            fromCategory: fromCategory,
            toCategory: toCategory,
            timestamp: Date.now()
        };

        dragSessionMoves.push(moveData);
        console.log('DEBUG: Current moves array:', dragSessionMoves);

        // Commented out - no longer showing drag and drop summary carousel
        // if (dragSessionMoves.length >= 1) {
        //     setTimeout(() => {
        //         consolidateMovesIntoCarousel();
        //     }, 300);
        // }

        console.log('Collected move:', `"${codeId}" from ${fromCategory} to ${toCategory}`, `Total: ${dragSessionMoves.length}`);
    }
    reattachDragListeners() {
        const selectors = this.getSelectors(this.currentContext);
        const draggables = document.querySelectorAll(selectors.draggable);

        // Only clean up draggable listeners, NOT drop zone listeners
        draggables.forEach(card => {
            // Remove old draggable listeners only
            const oldListeners = this.activeListeners.get(card);
            if (oldListeners) {
                card.removeEventListener('dragstart', oldListeners.dragStart);
                card.removeEventListener('dragend', oldListeners.dragEnd);
            }

            // Add fresh listeners
            const dragStart = (e) => this.handleDragStart(e);
            const dragEnd = (e) => this.handleDragEnd(e);
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);
            this.activeListeners.set(card, { dragStart, dragEnd });
        });
    }
    // Create card with appropriate styling for target category
    createCardForCategory(originalCard, targetCategory) {
        const codeId = originalCard.getAttribute('data-code');
        const codeData = earningCodes.find(c => c.code === codeId); // ✅ Get full data from source
        if (!codeData) return originalCard; // fallback

        const shouldUseListStyle = this.shouldUseListStyle(targetCategory);
        return shouldUseListStyle
            ? this.createListStyleCard(codeData)
            : this.createRegularCard(codeData);
    }


    // Check if category should use special list styling
        shouldUseListStyle(category) {
            const specialColumns = this.specialListColumns[this.currentContext] || [];
            return specialColumns.includes(category);
        }

        // Create list-style card for special columns
        createListStyleCard(code) {
            const card = document.createElement('div');
            card.className = 'draggable-list-item';
            card.draggable = true;
            card.setAttribute('data-code', code.code);

            card.innerHTML = `
                <span class="drag-handle" draggable="false">⋮⋮</span>
                <span class="list-item-content" draggable="false">
                    <strong>${code.code}</strong> - ${code.name}
                </span>
            `;

            return card;
        }

        // Create regular card-style for normal columns
        createRegularCard(code) {
            const card = document.createElement('div');
            card.className = 'draggable-card';
            card.draggable = true;
            card.setAttribute('data-code', code.code);

            card.innerHTML = `
                <div class="card-header">
                    <span class="drag-handle" draggable="false">⋮⋮</span>
                    <div class="code-info" draggable="false">
                        <span class="code-name" draggable="false">${code.name}</span>
                        <span class="code-badge" draggable="false">${code.code}</span>
                    </div>
                </div>
                <div class="card-body" draggable="false">
                    <div class="code-description hidden" id="desc-${code.code}" draggable="false">
                        ${code.description}
                    </div>
                </div>
            `;

            return card;
        }

        // Update column counts
        updateColumnCounts() {
            const columns = document.querySelectorAll('.drag-column');
            columns.forEach(column => {
                const count = column.querySelectorAll('.draggable-card, .draggable-list-item').length;
                const badge = column.querySelector('.count-badge');
                if (badge) {
                    badge.textContent = count;
                }
            });
        }

    
        // Cleanup all listeners
        cleanup() {
            this.activeListeners.forEach((listeners, element) => {
                Object.values(listeners).forEach(listener => {
                    element.removeEventListener('dragstart', listener);
                    element.removeEventListener('dragend', listener);
                    element.removeEventListener('dragover', listener);
                    element.removeEventListener('drop', listener);
                    element.removeEventListener('dragenter', listener);
                    element.removeEventListener('dragleave', listener);
                });
            });
            this.activeListeners.clear();
            this.draggedElement = null;
        }
    }

    // Create global instance
    const dragManager = new DragDropManager();

    // Expose global functions for backward compatibility
    function initializeDragAndDrop() {
        dragManager.initialize('weighted-ot');
    }

    function updateDragColumnCounts() {
        dragManager.updateColumnCounts();
    }


// ========================================
// DOM CACHE & INITIALIZATION
// ========================================
function initializeApp() {
    console.log('Initializing app with full-screen chat onboarding...');

    const chatPanel = document.getElementById('chatPanel');
    const tablePanel = document.getElementById('tablePanel');

    chatPanel.classList.add('centered');
    chatPanel.style.display = 'flex';
    tablePanel.style.display = 'none';

    resetApplicationState();
    startWelcomeFlow();

    console.log('App initialized with welcome flow');
}

// Add function to reset all application state
function resetApplicationState() {
    // Clear earning codes workflow flag
    window.isInEarningCodesWorkflow = false;
    
    // Clear pay schedules flag
    window.isMovingToPaySchedules = false;
    
    // Reset wizard state
    newWizardState = {
        currentStep: 1,
        totalSteps: 5,
        userData: {}
    };
    
    // Reset global state
    currentStep = 1;
    reviewProgress = {
        totalCodes: 34,
        reviewedCodes: 0,
        approvedCodes: []
    };
    
    // Reset earning code creation state
    earningCodeCreationState = {
        step: 1,
        description: '',
        suggestedCode: '',
        suggestedName: '',
        userCode: '',
        userName: '',
        isActive: false
    };
    
    // Reset all input waiting flags
    window.waitingForEarningCodeDescription = false;
    window.waitingForEarningCodeName = false;
    window.waitingForEarningCodeCode = false;
    window.waitingForBiweeklyName = false;
    window.waitingForDateInput = false;
    window.waitingForSemiMonthlyNameInput = false;
    window.waitingForWeeklyNameInput = false;
    window.waitingForCompanyNameInput = false;
    window.waitingForAddressInput = false;
    window.waitingForEINInput = false;
    
    // Reset company info
    extractedCompanyInfo = {
        legalName: "",
        address: "",
        ein: "",
        sourceDocument: "",
        documentType: "",
        isConfirmed: false
    };
    
    // Reset chat date picker state
    chatDatePickerState = {
        isActive: false,
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDate: null,
        callback: null,
        originalPlaceholder: ''
    };
    
    // Clear chat messages
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // Reset progress manager if available
    if (window.progressManager) {
        window.progressManager.exitWorkflow();
    }
    
    console.log('Application state reset complete');
}


function showFirstPayDateStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 4 of 5</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    How frequently do you pay your employees?
                </h2>
                <p class="wizard-subtitle">Select all pay frequencies you need - you can have multiple schedules.</p>
            </div>

            <div class="wizard-content">
                <div class="wizard-checkboxes">
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="weekly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Weekly</h3>
                            <p>52 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="bi-weekly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Bi-weekly</h3>
                            <p>26 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="semi-monthly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Semi-monthly</h3>
                            <p>24 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="monthly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Monthly</h3>
                            <p>12 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="quarterly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Quarterly</h3>
                            <p>4 pay periods per year</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button class="wizard-btn wizard-btn-primary" onclick="continueFromPayFrequency()" disabled style="opacity: 0.5;">
                    Continue
                </button>
            </div>
        </div>
    `;
}

function togglePayFrequency(element) {
    element.classList.toggle('checked');

    // Enable/disable continue button based on selection
    const checkedBoxes = document.querySelectorAll('.wizard-checkbox.checked');
    const continueBtn = document.querySelector('.wizard-btn-primary');
    continueBtn.disabled = checkedBoxes.length === 0;
    continueBtn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
}


function showStartDateStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 5 of 5</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    When do you plan to start paying employees using our system?
                </h2>
                <p class="wizard-subtitle">Choose your first payroll date to help us create a setup timeline.</p>
            </div>

            <div class="wizard-content">
                <div class="dual-calendar-container">
                    <div class="calendar-navigation">
                        <button class="calendar-nav" onclick="changeMonth(-1)">‹</button>
                        <button class="calendar-nav" onclick="changeMonth(1)">›</button>
                    </div>

                    <div class="dual-calendar-widget">
                        <!-- First Month -->
                        <div class="calendar-month-container">
                            <div class="calendar-header">
                                <h3 class="calendar-month" id="calendarMonth1"></h3>
                            </div>
                            <div class="calendar-grid" id="calendarGrid1">
                                <!-- First month calendar will be generated here -->
                            </div>
                        </div>

                        <!-- Second Month -->
                        <div class="calendar-month-container">
                            <div class="calendar-header">
                                <h3 class="calendar-month" id="calendarMonth2"></h3>
                            </div>
                            <div class="calendar-grid" id="calendarGrid2">
                                <!-- Second month calendar will be generated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button class="wizard-btn wizard-btn-primary" onclick="completeWizardSetup()" disabled style="opacity: 0.5;">
                    Continue
                </button>
            </div>
        </div>
    `;



    // Initialize dual calendar
    initializeDualCalendar(currentMonth, currentYear);
}





// ========================================
// CHAT & MESSAGING FUNCTIONS
// ========================================
function sendMessage() {
    console.log('sendMessage function called'); // Debug log

    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    console.log('Processing message:', message); // Debug log

    // Tax configuration shortcut
    if (message.toLowerCase() === 'tax' || message.toLowerCase() === 'taxes') {
        input.value = '';
        addMessage(message, 'user'); // Show what user typed
        handlePillClick('start-tax-configuration'); // Use existing delegation
        return;
    }
    
    // Check if we're in tax configuration context
    const lowerMessage = message.toLowerCase();
    const isInTaxConfig = window.taxConfigurationState && window.taxConfigurationState.currentStep;
    
    // Debug logging
    console.log('Tax config state check:', {
        isInTaxConfig,
        currentStep: window.taxConfigurationState?.currentStep,
        message: lowerMessage
    });
    
    // Handle number shortcuts in federal tax confirmation
    if (isInTaxConfig && window.taxConfigurationState.currentStep === 'federal_tax_confirmation') {
        if (message.trim() === '1') {
            input.value = '';
            addMessage('1', 'user');
            // Option 1: Set up state tax configuration
            if (typeof proceedToStateTaxes === 'function') {
                proceedToStateTaxes();
            } else {
                handlePillClick('federal-taxes-look-good');
            }
            return;
        } else if (message.trim() === '2') {
            input.value = '';
            addMessage('2', 'user');
            // Option 2: Invite a coworker
            handlePillClick('assign-coworker-tax');
            return;
        } else if (message.trim() === '3') {
            input.value = '';
            addMessage('3', 'user');
            // Option 3: Skip taxes for now
            handlePillClick('work-other-config');
            return;
        }
    }
    
    // State tax configuration detection - check for various combinations
    const stateTaxPhrases = [
        'set up state tax',
        'setup state tax',
        'state tax',
        'state taxes',
        'set up',
        'setup',
        'continue',
        'next',
        'proceed'
    ];
    
    // Check if message contains any state tax phrases or continuation words
    if (stateTaxPhrases.some(phrase => lowerMessage.includes(phrase))) {
        input.value = '';
        addMessage(message, 'user'); // Show what user typed
        
        // Check if we're in federal tax confirmation state
        if (isInTaxConfig && window.taxConfigurationState.currentStep === 'federal_tax_confirmation') {
            console.log('Proceeding to state taxes from federal confirmation');
            // User wants to proceed to state taxes
            if (typeof proceedToStateTaxes === 'function') {
                proceedToStateTaxes();
            } else {
                handlePillClick('federal-taxes-look-good');
            }
            return;
        } else if (!isInTaxConfig) {
            console.log('Not in tax config, starting fresh');
            // Not in tax config yet, start it
            handlePillClick('start-tax-configuration');
            return;
        } else {
            console.log('In tax config but not in federal confirmation, current step:', window.taxConfigurationState.currentStep);
        }
    }


    
    // Complex tax shortcut
    if (message.toLowerCase() === 'complex tax') {
        input.value = '';
        addMessage(message, 'user'); // Show what user typed
        handlePillClick('start-complex-tax-workflow'); // Use existing delegation
        return;
    }
       

    // Earning code shortcut
    if (message.toLowerCase() === 'earning code' || message.toLowerCase() === 'earning codes') {
        input.value = '';
        addMessage(message, 'user'); // Show what user typed
        
        // Initialize earning codes data if not already present
        if (!window.earningCodes || window.earningCodes.length === 0) {
            window.earningCodes = earningCodes; // Use the existing earningCodes array
            window.reviewProgress = {
                totalCodes: earningCodes.length,
                reviewedCodes: 0,
                approvedCodes: [],
                rejectedCodes: []
            };
        }
        
        // Make sure the right panel is visible
        const tablePanel = document.getElementById('tablePanel');
        const chatPanel = document.getElementById('chatPanel');
        if (tablePanel) {
            tablePanel.style.display = 'flex';
            tablePanel.classList.remove('hidden');
            tablePanel.classList.add('visible');
        }
        if (chatPanel) {
            chatPanel.classList.remove('centered');
        }
        
        // Show earning codes review panel
        showEarningCodesReview({ showMessage: true });
        return;
    }

    // Handle keyboard shortcut: "ein" to skip to company info confirmation
    if (message.toLowerCase().trim() === 'ein') {
        console.log('🔥 EIN shortcut detected - following normal workflow with pre-filled data');
        input.value = '';
        
        // Use shared company data
        extractedCompanyInfo = {
            ...SHARED_COMPANY_DATA.default,
            isConfirmed: false
        };
        
        // IMPORTANT: Set up the required data structure for timeline to work
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30); // 30 days from now
        
        window.newWizardState = {
            currentStep: 1,
            totalSteps: 5,
            userData: {
                startDate: defaultDate.toISOString().split('T')[0]
            }
        };
        
        // Set up minimal schedule data so timeline can generate
        window.scheduleSetup = {
            frequencies: ['freq-biweekly'], // Default to bi-weekly
            currentIndex: 1,
            completedSchedules: [{
                frequency: 'freq-biweekly',
                startDate: defaultDate,
                name: 'Bi-weekly'
            }]
        };
        
        // Complete welcome flow setup
        window.welcomeState = null; // Clear welcome state
        document.dispatchEvent(new CustomEvent('welcomeFlowComplete'));
        
        // Remove welcome flow styles
        document.body.removeAttribute('data-welcome-active');
        const style = document.getElementById('welcome-flow-styles');
        if (style) style.remove();
        
        // Add the EIN message
        addMessage('ein', 'user');
        
        // Follow the exact same flow as normal workflow
        // 1. Transition to timeline view first
        setTimeout(() => {
            transitionToSplitScreenWithTimeline();
        }, 500);
        
        // 2. Wait for timeline animation to complete, then show welcome message
        // This matches the normal workflow timing
        setTimeout(() => {
            // Timeline animation should be complete by now
            // The startTimelineTransitionWithThinking function has a 5-second animation
            // So we don't need to call anything here, it will be handled by the animation
        }, 2500);
        
        return;
    }

    // Handle keyboard shortcut: "multi ein" to show multiple company information cards
    if (message.toLowerCase().trim() === 'multi ein') {
        console.log('🔥 Multi EIN shortcut detected - showing multiple company cards');
        input.value = '';
        
        // Keep existing content, just add new message
        addMessage('Show multiple company information', 'user');
        
        setTimeout(() => {
            showBryteThinking(() => {
                console.log('🚨 About to call showDirectMultipleCompanyInfo');
                showDirectMultipleCompanyInfo();
            });
        }, 500);
        
        return;
    }

    if (window.welcomeState && window.welcomeState.waitingForTextResponse) {
        console.log('🔍 Welcome state detected, calling handleWelcomeTextInput');
        const handled = handleWelcomeTextInput(message);
        console.log('🔍 handleWelcomeTextInput returned:', handled);
        if (handled) {
            input.value = '';
            console.log('🔍 Welcome handler completed successfully, returning early');
            return;
        }
    }


    
    // 1. Handle unified inputs FIRST (includes earning codes, company info, etc.)
    if (processUnifiedInput(message)) {
        input.value = '';
        return;
    }

    // 2. Handle bi-weekly name input (special case with date picker)
    if (window.waitingForBiweeklyName) {
        window.waitingForBiweeklyName = false;

        if (message.trim().length < 2) {
            addMessage('Please enter a valid schedule name (at least 2 characters).', 'ai');
            window.waitingForBiweeklyName = true;
            input.value = '';
            return;
        }

        addMessage(message.trim(), 'user');
        window.biweeklyName = message.trim();

        // Update the card with the name
        const nameElement = document.getElementById('biweekly-name');
        if (nameElement) {
            nameElement.textContent = message;
            nameElement.classList.remove('missing-field');
        }

        setTimeout(() => {
            chatDatePickerShow(`Great! What should be the first pay date for this schedule?`, function(selectedDate) {
                window.waitingForBiweeklyFirstDate = false;
                window.biweeklyFirstDate = selectedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Update the card with the first pay date
                const dateElement = document.getElementById('biweekly-first-date');
                if (dateElement) {
                    dateElement.textContent = window.biweeklyFirstDate;
                    dateElement.classList.remove('missing-field');
                }

                setTimeout(() => {
                    // Create the complete schedule card HTML
                    const biweeklyScheduleCard = `
                        <div class="schedule-cards-chat">
                            <div class="company-info-card schedule-card-chat">
                                <div class="company-info-header">
                                    <h3 class="company-info-title">Bi-Weekly Schedule</h3>
                                    <button class="company-info-edit-btn" onclick="handlePillClick('edit-biweekly')" title="Edit schedule">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="company-info-content">
                                    <div class="company-info-row">
                                        <div class="company-info-label">Name</div>
                                        <div class="company-info-value">${window.biweeklyName}</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">First pay date</div>
                                        <div class="company-info-value">${window.biweeklyFirstDate}</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Frequency</div>
                                        <div class="company-info-value">26 pay periods/year</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Payroll date</div>
                                        <div class="company-info-value">Every other Friday</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Hours per pay period</div>
                                        <div class="company-info-value">80 hours</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Weekend pay date</div>
                                        <div class="company-info-value">Friday before the date</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Holiday pay date</div>
                                        <div class="company-info-value">Business before the date</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    addMessage(`Perfect! I've configured your Bi-Weekly schedule:\n\n${biweeklyScheduleCard}\n\nWhat else would you like to do?`, 'ai', [
                        { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                        { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
                        { action: 'edit-semi-monthly', text: 'Edit semi-monthly', buttonType: 'secondary' },
                        { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
            });
        }, 1000);
        input.value = '';
        return;
    }

    // 3. Handle date input when date picker is active
    if (window.waitingForDateInput) {
        const parsedDate = chatDatePickerParseTextDate(message);

        if (parsedDate) {
            addMessage(message, 'user');
            input.value = '';
            chatDatePickerCleanup();

            if (chatDatePickerState.callback && typeof chatDatePickerState.callback === 'function') {
                chatDatePickerState.callback(parsedDate);
            }

            window.waitingForDateInput = false;
            chatDatePickerState.isActive = false;
            chatDatePickerState.selectedDate = null;
            chatDatePickerState.callback = null;
            return;
        } else {
            addMessage(message, 'user');
            input.value = '';
            setTimeout(() => {
                addMessage('I couldn\'t understand that date format. Please try:\n• "July 15, 2025"\n• "7/15/2025" \n• "Tomorrow"\n• "Next Friday"\n\nOr use the calendar above to select a date.', 'ai');
            }, 1000);
            return;
        }
    }

    // 4. Check for natural language commands
    const detectedCommand = parseNaturalLanguageCommand(message);
    if (detectedCommand) {
        input.value = '';
        executeCommand(detectedCommand);
        return;
    }

    // 5. Default chat handling
    addMessage(message, 'user');
    input.value = '';
    // Show typing indicator
    showTypingIndicator();
    setTimeout(() => {
        const response = getAIResponse(message);
        if (response && response !== null) {
            addMessage(response, 'ai');
        }
    }, 1000);
}

function addMessage(content, sender, pills = null, options = {}) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    // Add delay class if specified
    if (options.delay) {
        messageDiv.classList.add(options.delay);
    }

    // Handle process card type FIRST
    if (typeof content === 'object' && content.type === 'process-card') {
        messageDiv.classList.add('process-card-message');
        messageDiv.innerHTML = `
            <div class="process-card" id="process-card-${content.id}">
                <div class="process-card-header">
                    <div class="process-card-icon">⚙️</div>
                    <h4 class="process-card-title">${content.title}</h4>
                </div>
                <div class="process-card-description">${content.description}</div>
                <div class="process-card-meta">
                    <div class="process-card-status ${content.status}">
                        ${content.status === 'processing' ? '<div class="process-card-spinner"></div>' : ''}
                        <span>${content.status === 'processing' ? 'Processing...' : content.status}</span>
                    </div>
                    <div class="process-card-timestamp">${content.timestamp}</div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);

        // Auto-collapse conversation when process card appears
        if (!conversationState.isCollapsed) {
            setTimeout(() => {
                collapseConversationHistory();
            }, 900);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv; // EXIT HERE - don't continue processing
    }

    // Handle drag summary carousel type
    // Handle drag summary carousel type
    if (typeof content === 'object' && content.type === 'drag-summary-carousel') {
        messageDiv.classList.add('drag-carousel-message');
        messageDiv.innerHTML = `
            <div class="message-content">
                <img src="attached_assets/bryte logo.svg" alt="Bryte AI Logo" class="ai-logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"/>
                <div class="drag-summary-carousel">
                    <div class="carousel-header">
                        <span class="carousel-icon">🔄</span>
                        <span>Drag & Drop Summary (${content.moves.length} moves)</span>
                    </div>
                    <div class="carousel-container">
                        <div class="carousel-track" id="carousel-track-${content.id}">
                            ${content.moves.map(move => `
                                <div class="carousel-item">
                                    <div class="move-text">Moved "${move.codeId}"</div>
                                    <div>from ${move.fromCategory} to ${move.toCategory}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);

        // Smooth scroll to bottom
        // Scroll to show the start of the new message
        setTimeout(() => {
            const messages = messagesContainer.querySelectorAll('.message');
            const lastMessage = messages[messages.length - 1];

            if (lastMessage) {
                lastMessage.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' // Shows the start of the message
                });
            }
        }, 100);

        return messageDiv;
    }
    
    // Handle regular messages (ONLY if not a process card)
    let text = content;
    let responsePills = pills;

    // Replace icons with badge text
    if (typeof text === 'string') {
        text = text.replace(/✅/g, "Exact match")
                   .replace(/⚠️/g, "Review")
                   .replace(/❌/g, "Missing");
    }

    if (typeof content === 'object' && content !== null && content.type !== 'process-card') {
        text = content.text || content;
        responsePills = content.pills || pills;
    }

    let pillsHtml = '';
    
    // Check if we have pills OR tierTwoOptions to render
    if ((responsePills && responsePills.length > 0) || (options.style === 'two-tier-interactive' && options.tierTwoOptions && options.tierTwoOptions.length > 0)) {
        console.log('=== CREATING PILLS ===', responsePills);

        if (options.style === 'two-tier-interactive' || options.style === 'two-tier-strategy') {
            // TIER 1: Wizard-style buttons (horizontal layout) - only if pills exist
            let tier1Html = '';
            if (responsePills && responsePills.length > 0) {
                tier1Html = `
                    <div class="wizard-actions" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0;">
                        ${responsePills.map(pill => {
                            const buttonType = pill.buttonType || 'secondary';
                            const buttonClass = `wizard-btn wizard-btn-${buttonType}`;
                            return `<button class="${buttonClass}" style="flex: 1; min-width: 120px;" onclick="handlePillClick('${pill.action}')">${pill.text}</button>`;
                        }).join('')}
                    </div>
                `;
            }
          
            // TIER 2: List items with default "Related questions" label
            let tier2Html = '';
            if (options.tierTwoOptions && options.tierTwoOptions.length > 0) {
                // Use provided label or default to "Related questions"
                const labelText = options.tierTwoLabel || 'Related questions';

                tier2Html = `
                    <div style="margin-top: 20px;">
                        <div style="font-weight: bold; color: #666; font-size: 14px; margin-bottom: 12px;">${labelText}</div>
                        ${options.tierTwoOptions.map((item, index) => 
                            `<div style="display: flex; align-items: center; padding: 8px 0; cursor: pointer;" onclick="handlePillClick('${item.action}')">
                                <span style="color: #333; font-size: 14px; font-weight: 500; text-decoration: underline;">${item.text}</span>
                            </div>`
                        ).join('')}
                    </div>
                `;
            }


            // Add source documents if provided
            let sourceDocsHtml = '';
            if (options.sourceDocuments) {
                sourceDocsHtml = `
                    <div class="source-docs-section" style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin: 16px 0;">
                        <div class="source-docs-header" onclick="toggleSourceDocs(this)" style="display: flex; align-items: center; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;">
                            <span class="source-toggle-icon" style="transition: transform 0.2s;">▶</span>
                            <span style="font-size: 13px; color: #666; margin-left: 8px;">📄 Source Documents (${options.sourceDocuments.count || 4})</span>
                        </div>
                        <div class="source-docs-content" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease;">
                            <div style="padding: 12px 0 0 24px; font-size: 12px; line-height: 1.6; color: #666;">
                                ${options.sourceDocuments.files.map(file => 
                                    `• <strong>${file.name}</strong> - ${file.description}<br>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Combine all tiers
            pillsHtml = tier1Html + tier2Html + sourceDocsHtml;

        } else if (options.style === 'radio') {
            pillsHtml = `
                <div class="suggested-radios">
                    ${responsePills.map(pill => `<button class="radio-btn" onclick="selectRadio(this); handlePillClick('${pill.action}')">${pill.text}</button>`).join('')}
                </div>
            `;
        } else if (options.style === 'checkbox') {
            pillsHtml = `
                <div class="suggested-checkboxes">
                    ${responsePills.map(pill => `<button class="checkbox-btn" onclick="toggleCheckbox(this)" data-action="${pill.action}">${pill.text}</button>`).join('')}
                    <button class="pill-btn" onclick="submitCheckboxes()" style="margin-top: 12px; background: #30258D; color: white;">Continue</button>
                </div>
            `;
        } else {
            pillsHtml = `
                <div class="suggested-pills">
                    ${responsePills.map(pill => {
                const pillType = getPillType(pill.action);
                const pillText = pillType === 'interactive' ? `${pill.text} →` : pill.text;
                return `<button class="pill-btn" onclick="handlePillClick('${pill.action}')">${pillText}</button>`;
            }).join('')}
                </div>
            `;
        }
    }

    // Add Bryte logo for AI messages
    let messageContentHtml = '';
    if (sender === 'ai') {
        messageContentHtml = `
            <div class="message-content">
                <img src="attached_assets/bryte logo.svg" alt="Bryte AI Logo" class="ai-logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"/>
                ${text}
            </div>
            ${pillsHtml}
        `;
    } else {
        messageContentHtml = `
            <div class="message-content">${text}</div>
            ${pillsHtml}
        `;
    }

    messageDiv.innerHTML = messageContentHtml;
    messagesContainer.appendChild(messageDiv);

    // Smooth scroll to bottom
    // Scroll to show the start of the new message
    setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' // Shows the start of the message
            });
        }
    }, 100);

    return messageDiv;
}

// ========================================
// UNIFIED MESSAGE SYSTEM (CONSOLIDATION TARGET 3)
// ========================================

function addUnifiedMessage(content, sender, options = {}) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    // Handle delay class if specified
    if (options.delay) {
        messageDiv.classList.add(options.delay);
    }

    // Handle process card type FIRST (existing logic)
    if (typeof content === 'object' && content.type === 'process-card') {
        messageDiv.classList.add('process-card-message');
        messageDiv.innerHTML = `
            <div class="process-card" id="process-card-${content.id}">
                <div class="process-card-header">
                    <div class="process-card-icon">⚙️</div>
                    <h4 class="process-card-title">${content.title}</h4>
                </div>
                <div class="process-card-description">${content.description}</div>
                <div class="process-card-meta">
                    <div class="process-card-status ${content.status}">
                        ${content.status === 'processing' ? '<div class="process-card-spinner"></div>' : ''}
                        <span>${content.status === 'processing' ? 'Processing...' : content.status}</span>
                    </div>
                    <div class="process-card-timestamp">${content.timestamp}</div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);

        // Auto-collapse conversation when process card appears
        if (!conversationState.isCollapsed) {
            setTimeout(() => {
                collapseConversationHistory();
            }, 900);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv;
    }

    // Extract text and pills from content
    let text = content;
    let pills = options.pills || null;

    if (typeof content === 'object' && content !== null && content.type !== 'process-card') {
        text = content.text || content;
        pills = content.pills || options.pills;
    }

    // Generate pills HTML (unified logic)
    let pillsHtml = '';
    if (pills && pills.length > 0) {
        console.log('=== CREATING PILLS (UNIFIED) ===', pills);

        if (options.style === 'two-tier-interactive' || options.style === 'two-tier-strategy') {
            // TIER 1: Wizard-style buttons (horizontal layout)
            pillsHtml = `
                <div class="wizard-actions" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0;">
                    ${pills.map(pill => {
                        const buttonType = pill.buttonType || 'secondary';
                        const buttonClass = `wizard-btn wizard-btn-${buttonType}`;
                        return `<button class="${buttonClass}" style="flex: 1; min-width: 120px;" onclick="handlePillClick('${pill.action}')">${pill.text}</button>`;
                    }).join('')}
                </div>
            `;
            
            // TIER 2: List items (only if tierTwoOptions provided)
            if (options.tierTwoOptions && options.tierTwoOptions.length > 0) {
                const labelText = options.tierTwoLabel || 'Related questions';
                
                pillsHtml += `
                    <div style="margin-top: 20px; margin-left: 16px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 6px;">
                        <div style="font-weight: bold; color: #666; font-size: 14px; margin-bottom: 12px;">${labelText}</div>
                        ${options.tierTwoOptions.map((item, index) => 
                            `<div style="display: flex; align-items: center; padding: 8px 0; cursor: pointer;" onclick="handlePillClick('${item.action}')">
                                <span style="color: #333; font-size: 14px; font-weight: 500; text-decoration: underline;">${item.text}</span>
                            </div>`
                        ).join('')}
                    </div>
                `;
            }
            
            // Add source documents if provided
            if (options.sourceDocuments) {
                pillsHtml += `
                    <div class="source-docs-section" style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin: 16px 0;">
                        <div class="source-docs-header" onclick="toggleSourceDocs(this)" style="display: flex; align-items: center; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;">
                            <span class="source-toggle-icon" style="transition: transform 0.2s;">▶</span>
                            <span style="font-size: 13px; color: #666; margin-left: 8px;">📄 Source Documents (${options.sourceDocuments.count || 4})</span>
                        </div>
                        <div class="source-docs-content" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease;">
                            <div style="padding: 12px 0 0 24px; font-size: 12px; line-height: 1.6; color: #666;">
                                ${options.sourceDocuments.files.map(file => 
                                    `• <strong>${file.name}</strong> - ${file.description}<br>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
        } else if (options.style === 'radio') {
            pillsHtml = `
                <div class="suggested-radios">
                    ${pills.map(pill => `<button class="radio-btn" onclick="selectRadio(this); handlePillClick('${pill.action}')">${pill.text}</button>`).join('')}
                </div>
            `;
        } else if (options.style === 'checkbox') {
            pillsHtml = `
                <div class="suggested-checkboxes">
                    ${pills.map(pill => `<button class="checkbox-btn" onclick="toggleCheckbox(this)" data-action="${pill.action}">${pill.text}</button>`).join('')}
                    <button class="pill-btn" onclick="submitCheckboxes()" style="margin-top: 12px; background: #30258D; color: white;">Continue</button>
                </div>
            `;
        } else {
            pillsHtml = `
                <div class="suggested-pills">
                    ${pills.map(pill => {
                const pillType = getPillType(pill.action);
                const pillText = pillType === 'interactive' ? `${pill.text} →` : pill.text;
                return `<button class="pill-btn" onclick="handlePillClick('${pill.action}')">${pillText}</button>`;
            }).join('')}
                </div>
            `;
        }
    }

    // Build message content with optional accordion
    let messageContentHtml = '';
    if (sender === 'ai') {
        messageContentHtml = `
            <div class="message-content">
                <img src="attached_assets/bryte logo.svg" alt="Bryte AI Logo" class="ai-logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"/>
                ${text}
            </div>
            ${options.accordion || ''}
            ${pillsHtml}
        `;
    } else {
        messageContentHtml = `
            <div class="message-content">${text}</div>
            ${options.accordion || ''}
            ${pillsHtml}
        `;
    }

    messageDiv.innerHTML = messageContentHtml;
    messagesContainer.appendChild(messageDiv);

    // Smooth scroll to bottom
    // Scroll to show the start of the new message
    setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' // Shows the start of the message
            });
        }
    }, 100);

    return messageDiv;
}


function handlePillClick(action) {

    
    console.log('handlePillClick called with:', action); 

    // Check if this is a tax-related action first
    if (action.startsWith('tax-') || action.includes('-tax-') ||
        ['start-tax-configuration', 'confirm-tax-types', 'modify-tax-types', 'add-missing-taxes', 
         'add-federal-futa', 'add-fica-match', 'add-ny-sit', 'review-missing-taxes',
         'assign-frequencies', 'modify-frequencies', 'collect-tax-details', 'need-help-finding',
         'skip-tax-verification', 'proceed-with-taxes', 'yes-verify-ids',
         'naics-info-1', 'naics-info-2', 'naics-info-3',
         'complete-tax-setup', 'continue-to-next-setup', 'export-tax-config', 'ready-for-additional',
         'handle-unemployment-myself', 'payroll-service-handles', 'not-sure-unemployment',
         'permanent-multistate', 'temporary-multistate', 'mixed-multistate',
         'handle-employer-taxes', 'system-handles-employer', 'need-help-employer',
         'add-recommended-taxes', 'review-recommendations', 'skip-recommendations',
         'previous-vendor-handled-unemployment', 'have-unemployment-accounts-separately', 'need-new-unemployment-setup',
         'previous-vendor-handled-states', 'have-state-accounts-separately', 'need-new-state-registrations',
         'previous-vendor-handled-employer', 'have-employer-details-separately', 'need-employer-tax-setup',
         'recently-expanded-to-states', 'have-state-registrations-separately', 'employees-work-remotely',
         'add-migration-recommendations', 'review-migration-recommendations', 'modify-migration-list',
         'show-verification-steps', 'need-help-verifying', 'where-find-tax-docs', 'what-if-missing-info', 
         'can-verify-later', 'pause-to-gather', 'help-contact-agencies', 'schedule-verification',
         'show-setup-overview', 'can-skip-steps', 'what-if-stuck', 'save-progress', 'add-new-tax',
         'federal-taxes-look-good', 'verify-federal-ein', 'federal-tax-setup-overview',
         'state-taxes-confirmed', 'add-another-state', 'modify-state-list', 
         'verify-state-registrations', 'state-tax-requirements', 'add-maine-tax', 'skip-maine-for-now'].includes(action)) {
        
        console.log('Tax configuration handling:', action);
        if (typeof handleTaxConfigurationPill === 'function') {
            return handleTaxConfigurationPill(action);
        } else {
            console.error('handleTaxConfigurationPill is not defined!');
        }
    }

    // Check if handleWelcomePillClick exists
    if (typeof handleWelcomePillClick === 'function') {
        console.log('Calling handleWelcomePillClick...');
        const handled = handleWelcomePillClick(action);
        console.log('handleWelcomePillClick returned:', handled);

        // Initialize tax configuration progress tracking
        if (action === 'start-tax-configuration' && window.progressManager) {
            // Detect flow type (you can customize this logic)
            const isComplexFlow = false; // Set to true for complex businesses
            const flowType = isComplexFlow ? 'complex' : 'simple';

            window.progressManager.enterWorkflow(`tax-configuration-${flowType}`, 0);
            console.log(`✅ Started tax configuration flow: ${flowType}`);
        }
        
        if (handled) {
            const allPills = document.querySelectorAll('.suggested-pills');
            allPills.forEach(pills => {
                if (pills.parentNode) {
                    pills.parentNode.removeChild(pills);
                }
            });
            return;
        }
    } else {
        console.error('handleWelcomePillClick is not defined!');
    }
    
    // Find the exact pill text that was clicked
    const clickedPill = document.querySelector(`[onclick="handlePillClick('${action}')"]`);
    const pillText = clickedPill ? clickedPill.textContent.replace(' →', '') : action; // Remove arrow if present

    // Instantly remove ALL pills
    const allPills = document.querySelectorAll('.suggested-pills');
    allPills.forEach(pills => {
        if (pills.parentNode) {
            pills.parentNode.removeChild(pills);
        }
    });


    // Handle the pill action immediately (EXISTING CODE CONTINUES...)
    let message = pillText; // Use the exact pill text
    let response = null;
    let rightPanelAction = null;

    switch (action) {
            // ADD these cases to your existing switch statement:

            case 'start-onboarding':
                message = 'Let\'s get started';
                addMessage(message, 'user');
                setTimeout(() => {
                    askAboutRole();
                }, 1000);
                return;

            case 'skip-onboarding':
                message = 'Skip and use defaults';
                addMessage(message, 'user');
                setTimeout(() => {
                    newWizardState.userData = {
                        role: 'other',
                        experience: '2-5-years',
                        currentSystem: 'manual',
                        payFrequencies: ['semi-monthly'],
                        startDate: getDefaultStartDate()
                    };

                    addMessage('No problem! I\'ve set up some defaults for you. You can always change these later.\n\nLet me generate your implementation timeline now...', 'ai');

                    setTimeout(() => {
                        transitionToSplitScreenWithTimeline();
                    }, 2000);
                }, 1000);
                return;

            // ADD THESE NEW VENDOR CASES TO YOUR MAIN SWITCH STATEMENT:

            case 'vendor-adp':
                message = 'ADP';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Perfect! For ADP, here are the specific files we need:\n\n<strong> From ADP Workforce Now:</strong>\n• "Payroll Register" (recent 1-3 pay periods)\n• "YTD Earnings Summary Report"\n• "Earning Code Setup Report"\n\n<strong> Additional helpful documents:</strong>\n• Employee handbook or policy manual\n• Any custom ADP reports you\'ve created\n\nThese files will let us extract your exact earning codes and rates automatically.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'vendor-gusto':
                message = 'Gusto';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Excellent! For Gusto, here are the specific files we need:\n\n<strong>From Gusto:</strong>\n• "Payroll Summary" report (last 1-3 runs)\n• "Employee Earnings" report\n• "Pay Schedule Setup" export\n\n<strong> Additional helpful documents:</strong>\n• Employee handbook\n• Any custom earning types you\'ve set up\n\nGusto\'s reports are perfect for quick extraction of your payroll configuration.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Upload document later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'vendor-quickbooks':
                message = 'QuickBooks';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Great! For QuickBooks Payroll, here are the specific files we need:\n\n<strong> From QuickBooks:</strong>\n• "Payroll Summary" report (recent pay periods)\n• "Employee Earnings Summary"\n• "Payroll Item List" export\n\n<strong> Additional helpful documents:</strong>\n• Employee handbook\n• Pay stub samples\n\nQuickBooks data will help us match your exact payroll item setup.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'vendor-paychex':
                message = 'Paychex';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Perfect! For Paychex, here are the specific files we need:\n\n<strong> From Paychex Online:</strong>\n• "Payroll Register Report" (last 1-3 pay periods)\n• "Earnings Summary Report"\n• "Pay Code Report" or "Earning Code Setup"\n\n<strong> Additional helpful documents:</strong>\n• Employee handbook\n• Custom pay code documentation\n\nPaychex reports contain all the earning code details we need for setup.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;
            case 'vendor-paycom':
            message = 'Paycom';
            addMessage(message, 'user');
            setTimeout(() => {
                addMessage('Perfect! For Paycom, here are the specific files we need:\n\n<strong>Paycom Portal:</strong>\n• Paycom Payroll History (recent 1-3 pay periods)\n• Paycom Payroll Preview History\n• Paycom Quarterly Payroll Register\n\n<strong>Additional helpful documents:</strong>\n• Employee handbook\n• Custom pay code documentation\n\nPaycom reports contain all the earning code details we need for setup.\n\n<div class="upload-widget-container">\n  <div class="upload-widget" onclick="handlePrototypeUpload()">\n    <div class="upload-content">\n      <span class="upload-text">Drag and drop or</span>\n      <button class="browse-files-btn">Browse files</button>\n    </div>\n  </div>\n</div>', 'ai', [
                    { action: 'skip-to-company-config', text: 'Skip and configure manually', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
            return;
            case 'vendor-other':
                message = 'Other payroll system';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('No problem! For most payroll systems, we typically need:\n\n<strong> Recent Payroll Reports:</strong>\n• Last 1-3 payroll registers or summaries\n• Earning codes list or setup report\n• Employee earnings summary (YTD preferred)\n\n<strong> Additional helpful documents:</strong>\n• Employee handbook with pay policies\n• Any custom earning type documentation\n\nThese standard reports from any payroll system help us extract your configuration.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'vendor-manual':
                message = 'Manual/Excel system';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Got it! For manual systems, any of these documents help:\n\n<strong> Spreadsheets & Records:</strong>\n• Recent payroll calculation spreadsheets\n• Employee pay rate schedules\n• Timesheet templates with pay codes\n\n<strong> Documentation:</strong>\n• Employee handbook with pay policies\n• Overtime calculation procedures\n• Any written pay policies or procedures\n\nEven informal documentation helps us understand your current pay structure.', 'ai', [
                        { action: 'proceed-to-upload', text: 'Proceed to upload', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'skip-vendor-question':
                message = 'Skip and go to upload page';
                addMessage(message, 'user');
                
                // First, let user see the timeline briefly before showing upload interface
                setTimeout(() => {
                    addMessage('I see you want to proceed directly to document upload. The timeline on the right shows your implementation roadmap. I\'ll now show you the document upload interface.', 'ai');
                }, 500);
                
                setTimeout(() => {
                    collapseConversationHistory("Timeline configuration threads");
                }, 1000);
                
                setTimeout(() => {
                    showDocumentUploadInterface();
                    addMessage('No problem! Upload any payroll-related documents you have available.\n\n<strong>Upload your documents →</strong>\n• Recent payroll reports or registers\n• Employee handbook or policy documents\n\nBoth uploads are optional, but they save significant setup time.', 'ai', [
                        { action: 'complete-document-upload', text: 'Finished uploading', buttonType: 'primary' },
                        { action: 'skip-to-company-config', text: 'Skip to company configuration', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'proceed-to-upload':
                message = 'Proceed to upload';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Perfect! Now upload the documents we discussed.\n\n<strong>Upload your documents:</strong>\n• Use the specific file names I mentioned for your system\n• Both payroll reports and handbook are helpful\n\nThis will significantly speed up your setup process.\n\n<div class="upload-widget" onclick="handlePrototypeUpload()" style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0; cursor: pointer; background: #f9f9f9;">\n  <div style="color: #666; font-size: 14px; margin-bottom: 8px;">☁️ Drag and drop or</div>\n  <button style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Browse files</button>\n</div>', 'ai');
                }, 1000);
                return;

            case 'confirm-company-info':
                message = 'Yes, info is correct';
                addMessage(message, 'user');
                
                console.log('🔍 confirm-company-info triggered, currentStep:', currentStep);
                console.log('🔍 Window location:', window.location.pathname);
                console.log('🔍 Existing process cards:', document.querySelectorAll('.process-card').length);
                
                // Check if we're in the earning codes workflow by looking for earning code elements
                const isInEarningCodesWorkflow = document.querySelector('.earning-codes-table') || 
                                                 document.querySelector('.ai-suggestions-panel') ||
                                                 window.isInEarningCodesWorkflow;
                
                // Update company info status
                updateCompanyInfoStatus('confirmed');
                
                // 1. Progress Update & Celebration - Complete company info workflow
                if (window.progressManager && !window.welcomeState) {
                    // Only attempt progress updates if not in welcome flow
                    setTimeout(() => {
                        // First enter the workflow if not already in it
                        if (!window.progressManager.isActive || window.progressManager.currentSection !== 'company-info') {
                            window.progressManager.enterWorkflow('company-info', 0);
                        }
                        // Only update progress if we successfully entered the workflow
                        if (window.progressManager.isActive && window.progressManager.currentSection === 'company-info') {
                            window.progressManager.updateProgress(1); // triggers rainbow celebration animation
                        }
                        console.log('✅ Completed company info workflow - triggering celebration');
                    }, 500);
                } else if (window.welcomeState) {
                    console.log('✅ Completed company info workflow - triggering celebration (welcome flow mode, skipping progress update)');
                }
                
                // 2. Collapse conversation history FIRST
                setTimeout(() => {
                    collapseConversationHistory("Company information threads");
                }, 1000);
                
                // 3. Create process card AFTER collapse (only if we're in the initial company setup flow)
                // Check if we're already past company setup by looking for existing process cards
                const existingProcessCards = document.querySelectorAll('.process-card');
                const hasPayScheduleCard = Array.from(existingProcessCards).some(card => 
                    card.textContent.includes('Pay schedule configuration')
                );
                
                // Set flag to indicate we're moving to pay schedules
                window.isMovingToPaySchedules = true;
                
                // Only create company info process card if we haven't already moved to pay schedules
                // and we're not in the earning codes workflow
                console.log('🔍 Company info process card check:', {
                    hasPayScheduleCard,
                    currentStep,
                    isInEarningCodesWorkflow,
                    windowFlag: window.isInEarningCodesWorkflow,
                    isMovingToPaySchedules: window.isMovingToPaySchedules,
                    shouldCreate: !hasPayScheduleCard && currentStep <= 1 && !isInEarningCodesWorkflow && !window.isMovingToPaySchedules
                });
                
                // Don't create company info process card since we're moving directly to pay schedules
                if (!window.isMovingToPaySchedules && !hasPayScheduleCard && currentStep <= 1 && !isInEarningCodesWorkflow) {
                    console.log('⚠️ Creating company info process card - this should NOT happen in earning codes workflow!');
                    setTimeout(() => {
                        const processCard = createProcessCard({
                            title: 'Company information',
                            description: 'Confirming company details...',
                            status: 'processing',
                            timestamp: 'Just started',
                            id: 'company-info-confirm'
                        });
                        
                        addMessage(processCard, 'ai');
                    }, 2000);
                }
                
                // Hide the right panel and continue in chat-only mode
                setTimeout(() => {
                    // Slide away the right panel
                    const tablePanel = document.getElementById('tablePanel');
                    const chatPanel = document.getElementById('chatPanel');
                    
                    if (tablePanel && tablePanel.classList.contains('hidden') === false) {
                        // Animate sliding the right panel away
                        gsap.to(tablePanel, {
                            x: '100%',
                            opacity: 0,
                            duration: 0.6,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                tablePanel.style.display = 'none';
                            }
                        });
                    }
                    
                    // Expand chat panel to 800px width and center it
                    if (chatPanel) {
                        gsap.to(chatPanel, {
                            width: '800px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            duration: 0.6,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                // Add centered class to center the chat
                                chatPanel.classList.add('centered');
                            }
                        });
                    }
                    
                    // Continue with existing pay schedules workflow
                    showTypingIndicator();
                    
                    // Enter pay schedule workflow
                    if (window.progressManager) {
                        window.progressManager.enterWorkflow('pay-schedule', 0);
                    }
                    
                    setTimeout(() => {
                        removeTypingIndicator();
                        // Display the two pay schedules in card format
                        const scheduleCardsHTML = `
                            <div class="schedule-cards-chat">
                                <div class="company-info-card schedule-card-chat">
                                    <div class="company-info-header">
                                        <h3 class="company-info-title">Schedule 1: Semi-Monthly</h3>
                                        <button class="company-info-edit-btn" onclick="handlePillClick('edit-semi-monthly')" title="Edit schedule">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="company-info-content">
                                        <div class="company-info-row">
                                            <div class="company-info-label">Name</div>
                                            <div class="company-info-value">Semi-Monthly Payroll</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">First pay date</div>
                                            <div class="company-info-value">August 15, 2025</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Frequency</div>
                                            <div class="company-info-value">24 pay periods/year</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Payroll date</div>
                                            <div class="company-info-value">15th and last day</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Hours per pay period</div>
                                            <div class="company-info-value">80 hours</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Weekend pay date</div>
                                            <div class="company-info-value">Friday before the date</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Holiday pay date</div>
                                            <div class="company-info-value">Business before the date</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="company-info-card schedule-card-chat">
                                    <div class="company-info-header">
                                        <h3 class="company-info-title">Schedule 2: Weekly</h3>
                                        <button class="company-info-edit-btn" onclick="handlePillClick('edit-weekly')" title="Edit schedule">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="company-info-content">
                                        <div class="company-info-row">
                                            <div class="company-info-label">Name</div>
                                            <div class="company-info-value">Weekly Payroll</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">First pay date</div>
                                            <div class="company-info-value">August 8, 2025</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Frequency</div>
                                            <div class="company-info-value">52 pay periods/year</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Payroll date</div>
                                            <div class="company-info-value">Every Friday</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Hours per pay period</div>
                                            <div class="company-info-value">40 hours</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Weekend pay date</div>
                                            <div class="company-info-value">Friday before the date</div>
                                        </div>
                                        <div class="company-info-row">
                                            <div class="company-info-label">Holiday pay date</div>
                                            <div class="company-info-value">Business before the date</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        addMessage(`${CONSTANTS.MESSAGES.PERFECT} Company information confirmed! Now let's set up your pay schedules.\n\nI've analyzed your pay registers and extracted information for two different pay schedules:\n\n${scheduleCardsHTML}\n\nLet's verify these schedules first. Shall we start?`, 'ai', [
                            { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                            { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
                            { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' },
                            { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
                        ], {
                            style: 'two-tier-interactive'
                        });
                    }, 1500);
                }, 2500); // Original delay - show pay schedules after process card
                
                // 6. Update process card after 30 seconds
                setTimeout(() => {
                    updateProcessCard('company-info-confirm', {
                        status: 'complete',
                        description: 'Company info successfully configured',
                        timestamp: '30 seconds ago'
                    });
                }, 30000);
                
                return;
        
               
            case 'continue-to-schedules':
                // Progress integration
            if (window.progressManager) {
                window.progressManager.enterWorkflow('pay-schedule', 0);
            }
    
            setTimeout(() => {
                // Transition to existing pay schedule setup
                loadInitialScheduleCards();
                removeTypingIndicator()
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} I've analyzed your pay registers and extracted information for two different pay schedules:\n\n<strong>Schedule 1: Semi-Monthly</strong>\n- Name: Semi-Monthly Payroll\n- First pay date: August 15, 2025\n- Pay frequency: 24 pay periods/year\n- Pay dates: 15th and last day of each month\n- Hours per pay period: 80 hours\n- Weekend pay date: Friday before the date\n- Holiday pay date: Business before the date\n\n<strong>Schedule 2: Weekly</strong>\n- Name: Weekly Payroll\n- First pay date: August 8, 2025\n- Pay frequency: 52 pay periods/year\n- Pay day: Every Friday\n- Hours per pay period: 40 hours\n- Weekend pay date: Friday before the date\n- Holiday pay date: Business before the date\n\nLet's verify these schedules first. Shall we start?`, 'ai', [
                    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                    { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
            break;
                

            case 'looks-good':
            case 'approve-all':
                updatePanelContent('loading', {
                    loadingText: 'Generating payroll calendar...',
                    subText: 'Processing schedules and holiday adjustments'
                });
            
                // Add the user message
                addMessage('Looks good, continue', 'user');
                
                // Show typing indicator
                showTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator();
                    
                    // Generate calendar HTML for the chat
                    const calendarHtml = generateChatCalendarView();
                    
                    // Add message with calendar embedded
                    addMessage(`${CONSTANTS.MESSAGES.PERFECT} The schedule information is confirmed. I've generated your payroll calendar showing:\n• <strong>Work periods</strong> (green dates)\n• <strong>Submit deadlines</strong> (red dates)\n• <strong>Employee pay dates</strong> (blue dates)\n\nHoliday and weekend adjustments are automatically applied.\n\n${calendarHtml}\n\nOnce you've reviewed the calendar, I'll help you configure these schedules.`, 'ai', [
                        { action: 'continue-earning-codes', text: 'Configure Pay Schedules', buttonType: 'primary' },
                        { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
                        { action: 'edit-schedules', text: 'Edit pay schedule', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                    
                    // Also show in right panel
                    setTimeout(() => {
                        approveAllSchedules();
                        showPayrollCalendarView();
                    }, 500);
                }, 1000);
                return; // Important: return here to prevent default response handling

  
            
            // === EARNING CODE CREATION CASES ===
           
        case 'codes-confirmed-continue':
            message = 'Codes are confirmed & continue';
            addMessage(message, 'user');

            // Calculate actual approved codes count FIRST (before auto-confirming)
            const currentApprovedCount = earningCodes.filter(code => code.reviewed === true).length;
            const currentTotalCodes = earningCodes.length;

            // Show typing indicator for all scenarios
            showTypingIndicator();

            // FOLLOW THE SAME LOGIC AS continue-to-recommendations
            if (currentApprovedCount === 0) {
                // No codes approved - special handling
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`No earning codes are currently approved for configuration.
                            You need to approve at least some codes before proceeding.
                            Please review and confirm the codes you want to configure, and choose one of the options below:`, 'ai', [
                        { action: 'auto-approve-all-codes', text: 'Confirm all codes & continue', buttonType: 'primary' },
                        { action: 'yes-configure-few-codes', text: 'Codes are confirmed & continue', buttonType: 'secondary' },
                        { action: '', text: 'Skip to another setup', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;
            } else if (currentApprovedCount < 10) {
                // Low approval count - ask for confirmation (THIS IS THE <10 CODES WORKFLOW)
                setTimeout(() => {
                    removeTypingIndicator();
                  addMessage(`Only ${currentApprovedCount} of ${currentTotalCodes} earning codes are currently approved for configuration. Is that right?`, 'ai', [
    { action: 'yes-configure-few-codes', text: `Yes, only configure ${currentApprovedCount} code${currentApprovedCount === 1 ? '' : 's'}`, buttonType: 'primary' },
    { action: 'auto-approve-all-codes', text: 'Approve all and continue to next step', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
                }, 1000);
                return;
            }

            // If we get here, there are enough approved codes (>=10) - proceed to recommendations
            setTimeout(() => {
                const summaryText = `Great! I've confirmed your earning codes.\n\n` +
                        'Now continuing to recommendations.';

                removeTypingIndicator();
                addMessage(summaryText, 'ai');

                // Show typing indicator for processing recommendations
                showTypingIndicator();

                // Show spinner in right panel
                const approveAllPanelContent = document.querySelector('.panel-content');
                if (approveAllPanelContent) {
                    approveAllPanelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading recommendations...</div>
                            <div class="loading-subtext">Analyzing your earning codes</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    const aiSuggestionsCount = aiSuggestions ? aiSuggestions.length : 3;
                    const recommendationText = `I've analyzed your ${currentTotalCodes} earning codes and have ${aiSuggestionsCount} recommendations to optimize your setup:\n\n` +
                            '<strong>• Consolidate duplicate codes</strong> - Merge similar overtime codes to reduce complexity\n' +
                            '<strong>• Remove unused codes</strong> - Clean up codes that aren\'t needed\n\n' +
                            'These changes will simplify your payroll processing and reduce errors.\n\n' +
                            'Have you reviewed your recommendations and decided which ones to apply?';

                    removeTypingIndicator();
                 addMessage(recommendationText, 'ai', [
    { action: 'recommendations-reviewed-continue', text: 'Recommendation reviewed, next step', buttonType: 'primary' },
    { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});

                    // Show the AI suggestions panel
                    setTimeout(() => {
                        showAISuggestions();
                    }, 1500);
                }, 1000);
            }, 1500);
            return;
        
            // ADD THIS NEW CASE TO YOUR SWITCH STATEMENT:

            case 'auto-approve-all-codes':
                message = 'Confirm all codes & continue';
                addMessage(message, 'user');

                // Show typing indicator
                showTypingIndicator();

                // Auto-approve all unreviewed codes
                let autoApprovedCount = 0;
                earningCodes.forEach(code => {
                    if (!code.reviewed) {
                        // Skip codes with missing assessment that need manual completion
                        if (code.assessment === 'missing' && (!code.name || !code.description)) {
                            return;
                        }
                        code.reviewed = true;
                        reviewProgress.reviewedCodes++;
                        reviewProgress.approvedCodes.push(code.code);
                        autoApprovedCount++;
                    }
                });

                // Refresh the table to show approved status
                showEarningCodesReview();

                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`Great! I've auto-approved ${autoApprovedCount} earning codes.\n\nNow continuing to recommendations.`, 'ai');

                    // Show typing indicator for processing recommendations
                    showTypingIndicator();

                    // Show spinner in right panel
                    const panelContent = document.querySelector('.panel-content');
                    if (panelContent) {
                        panelContent.innerHTML = `
                            <div class="loading-container">
                                <div class="spinner"></div>
                                <div class="loading-text">Loading recommendations...</div>
                                <div class="loading-subtext">Analyzing your earning codes</div>
                            </div>
                        `;
                    }

                    setTimeout(() => {
                        const aiSuggestionsCount = aiSuggestions ? aiSuggestions.length : 3;
                        const recommendationText = `I've analyzed your ${earningCodes.length} earning codes and have ${aiSuggestionsCount} recommendations to optimize your setup:\n\n` +
                                '<strong>• Consolidate duplicate codes</strong> - Merge similar overtime codes to reduce complexity\n' +
                                '<strong>• Remove unused codes</strong> - Clean up codes that aren\'t needed\n\n' +
                                'These changes will simplify your payroll processing and reduce errors.\n\n' +
                                'Have you reviewed your recommendations and decided which ones to apply?';

                        removeTypingIndicator();
                     addMessage(recommendationText, 'ai', [
    { action: 'recommendations-reviewed-continue', text: 'Recommendation reviewed, next step', buttonType: 'primary' },
    { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});

                        // Show the AI suggestions panel
                        setTimeout(() => {
                            showAISuggestions();
                        }, 1500);
                    }, 1000);
                }, 1500);
                return;
        
        
        case 'create-new-earning-code':
                message = 'Create new earning code';
                addMessage(message, 'user');

                // Remove pills immediately
                const allPills = document.querySelectorAll('.suggested-pills');
                allPills.forEach(pills => {
                    if (pills.parentNode) {
                        pills.parentNode.removeChild(pills);
                    }
                });

                setTimeout(() => {
                    startEarningCodeCreationWorkflow();
                }, 1000);
                return;

            case 'accept-earning-code-suggestions':
                message = 'Accept suggestions';
                addMessage(message, 'user');
                setTimeout(() => {
                    acceptEarningCodeSuggestions();
                }, 1000);
                return;

            case 'edit-earning-code-name':
                message = 'Edit name';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('What would you like to name this earning code?', 'ai');
                    window.waitingForEarningCodeName = true;
                }, 1000);
                return;

            case 'edit-earning-code-code':
                message = 'Edit code';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('What code would you like to use? (2-10 characters, uppercase letters/numbers/underscores only)', 'ai');
                    window.waitingForEarningCodeCode = true;
                }, 1000);
                return;

            case 'confirm-add-earning-code':
                message = 'Yes, add it';
                addMessage(message, 'user');
                setTimeout(() => {
                    addNewEarningCodeToTable();
                }, 1000);
                return;

            case 'cancel-earning-code-creation':
                message = 'Cancel';
                addMessage(message, 'user');
                setTimeout(() => {
                    earningCodeCreationState.isActive = false;
                    window.waitingForEarningCodeDescription = false;
                    window.waitingForEarningCodeName = false;
                    window.waitingForEarningCodeCode = false;
                    addMessage('Earning code creation cancelled. What would you like to do next?', 'ai', [
                        { action: 'create-new-earning-code', text: 'Create new earning code' },
                        { action: 'continue-to-recommendations', text: 'Continue to next step' }
                    ]);
                }, 1000);
                return;




            
        case 'change-semi-name':
            message = 'Change Semi-Monthly name';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('What would you like to name the Semi-Monthly schedule?', 'ai');

                // Set flag to wait for semi-monthly name input
                window.waitingForSemiMonthlyNameInput = true;
            }, 1000);
            return;

        case 'change-semi-first-pay-date':
            message = 'Change first pay date';
            addMessage(message, 'user');

            setTimeout(() => {
                chatDatePickerShow('What should be the first pay date for the Semi-Monthly schedule?', function(selectedDate) {
                    // Handle the selected date for semi-monthly
                    const formattedDate = selectedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Update the semi-monthly card with the new first pay date
                    updateScheduleField('semi-monthly', 'first-pay-date', formattedDate);

                    setTimeout(() => {
                 addMessage(`✅ Semi-Monthly first pay date updated to: <strong>${formattedDate}</strong>\n\nWhat else would you like to modify?`, 'ai', [
    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
    { action: 'change-semi-name', text: 'Change name', buttonType: 'secondary' },
    { action: 'change-semi-weekend-rules', text: 'Change weekend rules', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
                    }, 1000);
                });
            }, 1000);
            return;

        case 'change-weekly-name':
            message = 'Change Weekly name';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('What would you like to name the Weekly schedule?', 'ai');

                // Set flag to wait for weekly name input
                window.waitingForWeeklyNameInput = true;
            }, 1000);
            return;

        case 'change-weekly-first-pay-date':
            message = 'Change first pay date';
            addMessage(message, 'user');

            setTimeout(() => {
                chatDatePickerShow('What should be the first pay date for the Weekly schedule?', function(selectedDate) {
                    // Handle the selected date for weekly
                    const formattedDate = selectedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Update the weekly card with the new first pay date
                    updateScheduleField('weekly', 'first-pay-date', formattedDate);

                    setTimeout(() => {
                      addMessage(`✅ Weekly first pay date updated to: <strong>${formattedDate}</strong>\n\nWhat else would you like to modify?`, 'ai', [
    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
    { action: 'change-weekly-name', text: 'Change name', buttonType: 'secondary' },
    { action: 'change-weekly-weekend-rules', text: 'Change weekend rules', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
                    }, 1000);
                });
            }, 1000);
            return;
             
        case 'make-corrections':
            message = 'Make corrections';
            addMessage(message, 'user');

            // Update status to editing
            updateCompanyInfoStatus('editing');

            setTimeout(() => {
                removeTypingIndicator();
                addMessage('What would you like to correct?', 'ai', [
                    { action: 'edit-company-name', text: 'Edit company name', buttonType: 'secondary' },
                    { action: 'edit-address', text: 'Edit address', buttonType: 'secondary' },
                    { action: 'edit-ein', text: 'Edit EIN', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
            return;

        case 'add-new-ein':
            message = 'Add new company';
            addMessage(message, 'user');

            setTimeout(() => {
                showNewEINUploadInterface();
            }, 1000);
            return;

        case 'upload-new-ein-documents':
            message = 'Upload documents';
            addMessage(message, 'user');

            setTimeout(() => {
                const fileInput = document.getElementById('neweinFileInput');
                if (fileInput && fileInput.files.length > 0) {
                    addMessage('Processing your documents... I\'ll extract the company information and create a new EIN entry for you.', 'ai');
                    
                    // Simulate document processing
                    setTimeout(() => {
                        const newCompanyInfo = {
                            legalName: 'New Company Inc.',
                            address: '456 Business St, Suite 200, New York, NY 10001',
                            ein: '87-6543210'
                        };
                        
                        const newCompanyCard = createNewCompanyInfoCard(newCompanyInfo);
                        addMessage(`Great! I've extracted the following information from your documents:\n\n${newCompanyCard}\n\nWould you like to save this as a new company entry?`, 'ai', [
                            { action: 'save-new-company', text: 'Save new company', buttonType: 'primary' },
                            { action: 'edit-new-company', text: 'Edit info', buttonType: 'secondary' },
                            { action: 'cancel-new-company', text: 'Cancel', buttonType: 'secondary' }
                        ], {
                            style: 'two-tier-interactive'
                        });
                    }, 2000);
                } else {
                    addMessage('Please select documents first by dragging and dropping them or clicking the upload area.', 'ai');
                }
            }, 1000);
            return;

        case 'enter-ein-manually':
            message = 'Enter manually';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('Please enter the new company information manually:\n\n<strong>Company Legal Name:</strong>', 'ai');
                window.waitingForNewCompanyNameInput = true;
            }, 1000);
            return;

        case 'not-doing-now':
            message = 'Not doing it now';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('No problem! You can always add a new company later when you\'re ready. Let\'s continue with the current company setup.', 'ai', [
                    { action: 'continue-to-schedules', text: 'Continue to pay schedules', buttonType: 'primary' }
                ]);
            }, 1000);
            return;

        case 'edit-company-name':
            message = 'Edit company name';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage(`Current company name: <strong>${extractedCompanyInfo.legalName}</strong>\n\nPlease enter the correct legal company name:`, 'ai');

                // Set flag to wait for company name input
                window.waitingForCompanyNameInput = true;
            }, 1000);
            return;

        case 'edit-address':
            message = 'Edit address';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage(`Current address: <strong>${extractedCompanyInfo.address}</strong>\n\nPlease enter the correct company address:`, 'ai');

                // Set flag to wait for address input
                window.waitingForAddressInput = true;
            }, 1000);
            return;

        case 'edit-ein':
            message = 'Edit EIN';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage(`Current EIN: <strong>${extractedCompanyInfo.ein}</strong>\n\nPlease enter the correct EIN in the format: XX-XXXXXXX`, 'ai');

                // Set flag to wait for EIN input
                window.waitingForEINInput = true;
            }, 1000);
            return;

        case 'continue-to-schedules':
            message = 'Set up pay schedules';
            addMessage(message, 'user');

            setTimeout(() => {
                // Transition to existing pay schedule setup
                loadInitialScheduleCards();
                removeTypingIndicator();
                
                // Show pay schedule cards in the chat
                const scheduleCardsHtml = createPayScheduleCards();
                
            addMessage(`${CONSTANTS.MESSAGES.PERFECT} I've analyzed your pay registers and extracted information for your pay schedules:

${scheduleCardsHtml}

Let's verify these schedules first. Shall we start?`, 'ai', [
    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
    { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' },
    { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
            }, 1000);
            return;

            case 'next-step-confirm':
            message = 'Next step: Confirm company info';
            addMessage(message, 'user');

            // Slide away the right panel after user clicks this action
            const tablePanel = document.getElementById('tablePanel');
            const chatPanel = document.getElementById('chatPanel');

            if (tablePanel && chatPanel) {
                console.log("🎯 Sliding right panel away after next-step-confirm click");

                // Create timeline for synchronized animations
                const tl = gsap.timeline({
                    ease: 'power2.inOut'
                });

                // Animate sliding the right panel away
                tl.to(tablePanel, {
                    x: '100%',
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        tablePanel.classList.add('hidden');
                    }
                }, 0);

                // Simultaneously animate chat panel to 800px width and center
                tl.to(chatPanel, {
                    width: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        chatPanel.classList.add('centered');
                    }
                }, 0);
            }

            // Show company info after thinking
            setTimeout(() => {
                showBryteThinking(() => {
                    showCompanyInfoAfterThinking();
                });
            }, 1000);
            return;
        case 'continue-payroll-setup':
            message = 'Continue payroll setup';
            addMessage(message, 'user');
            setTimeout(() => {
                addMessage('Great! Let\'s continue setting up your payroll. The next step is to configure your pay schedules.\n\nBased on your documents, I\'ve identified that you likely have multiple pay schedules. Let me show you what I found.', 'ai', [
                    { action: 'show-pay-schedules', text: 'Show pay schedules', buttonType: 'primary' },
                    { action: 'add-custom-schedule', text: 'Add custom schedule', buttonType: 'secondary' }
                ]);
            }, 1000);
            return;

        case 'review-timeline':
            message = 'Review timeline details';
            addMessage(message, 'user');
            setTimeout(() => {
                addMessage('Your implementation timeline is displayed on the right. Here\'s what each section represents:\n\n<strong>Company Configuration (45% complete):</strong>\n- ✓ Company information verified\n- Bank account setup pending\n- Employee data import pending\n\n<strong>Payroll Setup (43% complete):</strong>\n- Pay schedules configuration in progress\n- Earning codes need review\n- Tax setup pending\n\nWould you like to focus on a specific area?', 'ai', [
                    { action: 'focus-company-config', text: 'Complete company setup', buttonType: 'primary' },
                    { action: 'focus-payroll-setup', text: 'Continue payroll setup', buttonType: 'secondary' }
                ]);
            }, 1000);
            return;

        case 'done-for-day':
            message = 'I am done for the day';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('Perfect! I\'ve saved your progress. Your implementation timeline and all the work we\'ve completed today will be here when you return.\n\n<strong>What we\'ve accomplished:</strong>\n• Document processing complete\n• Company information extracted\n• Timeline generated with progress indicators\n\nJust click "Continue setup" when you\'re ready to pick up where we left off.', 'ai', [
                    { action: 'continue-setup-later', text: 'Continue setup', buttonType: 'primary' },
                    { action: 'save-and-exit', text: 'Save and exit', buttonType: 'secondary' }
                ]);
            }, 1000);
            return;

        case 'show-company-setup-overview':
            message = 'What information do I need to provide?';
            addMessage(message, 'user');
            
            setTimeout(() => {
                addMessage(`<strong>Here's what you'll need for Company Setup:</strong>

<strong>📋 For EIN & Company Details:</strong>
• Your Federal EIN (9-digit number like XX-XXXXXXX)
• Legal company name (as registered with IRS)
• Company address (primary business location)
• Phone number and email
• Industry/NAICS code (if known)

<strong>🏦 For Bank Account Setup:</strong>
• Bank name
• Routing number (9 digits)
• Account number
• Account type (checking/savings)
• Authorized signer information

<strong>💡 Helpful tips:</strong>
• EIN can be found on tax documents (W-9, 941, etc.)
• Bank details are on checks or bank statements
• All information is encrypted and secure

The good news is I've already extracted most of this from your documents!`, 'ai');
            }, 1000);
            return;

        case 'where-find-ein':
            message = 'Where can I find my EIN?';
            addMessage(message, 'user');
            
            setTimeout(() => {
                addMessage(`<strong>Your EIN (Employer Identification Number) can be found on:</strong>

<strong>📄 Tax Documents:</strong>
• Form SS-4 (EIN assignment letter from IRS)
• Form 941 (Quarterly tax returns)
• Form W-9 (Request for taxpayer ID)
• Form 940 (Annual unemployment tax return)
• Any IRS correspondence

<strong>🏦 Business Documents:</strong>
• Business bank account paperwork
• Business license applications
• State tax registrations
• Payroll service reports

<strong>💻 Online:</strong>
• IRS Business Account (irs.gov)
• Your current payroll provider portal
• State tax agency website

<strong>📞 Can't find it?</strong>
Call IRS Business & Specialty Tax Line: 800-829-4933
Hours: 7 AM to 7 PM local time, Monday-Friday

The EIN format is XX-XXXXXXX (2 digits, hyphen, 7 digits).`, 'ai');
            }, 1000);
            return;

        case 'bank-security-info':
            message = 'How is my bank information secured?';
            addMessage(message, 'user');
            
            setTimeout(() => {
                addMessage(`<strong>Your bank information is protected with enterprise-grade security:</strong>

<strong>🔒 Encryption & Storage:</strong>
• Bank-level 256-bit AES encryption
• Data encrypted both in transit and at rest
• Tokenization replaces sensitive data
• No plain text storage of account numbers

<strong>🛡️ Access Controls:</strong>
• Multi-factor authentication required
• Role-based access permissions
• Audit trails for all access
• Regular security audits

<strong>✅ Compliance & Certifications:</strong>
• PCI DSS compliant
• SOC 2 Type II certified
• NACHA compliant for ACH
• Regular third-party security assessments

<strong>🏦 Banking Partner:</strong>
• Direct integration with banking networks
• Same security as online banking
• FDIC insured transactions
• Fraud monitoring and alerts

Your bank credentials are never stored - we use secure OAuth connections. You maintain full control and can revoke access anytime.`, 'ai');
            }, 1000);
            return;

        case 'continue-setup-later':
            message = 'Continue setup';
            addMessage(message, 'user');

            setTimeout(() => {
                // Enter company-info workflow
                if (window.progressManager) {
                    window.progressManager.enterWorkflow('company-info', 0);
                }
                
                // Create the company info card HTML and display
                const companyCardHtml = createCompanyInfoCard();
                const welcomeBackText = `Welcome back! Let's continue where we left off.

<strong>Here's your Company Setup process (2 main steps):</strong>

<strong>📋 Step 1: EIN & Company Details</strong>
• Verify your legal company name and address
• Confirm your Federal EIN (Employer ID Number)
• Review basic company information
<em>You are here now!</em>

<strong>🏦 Step 2: Bank Account Setup</strong>
• Securely add your company bank account
• Set up ACH details for payroll processing
• Verify routing and account numbers

This ensures accurate payroll processing and tax compliance.

I found the following information in your documents:

${companyCardHtml}

Please review this information and confirm it's correct.`;
                
                addUnifiedMessage(welcomeBackText, 'ai', [
                    { action: 'confirm-company-info', text: 'Confirm information', buttonType: 'primary' },
                    { action: 'make-corrections', text: 'Make corrections', buttonType: 'secondary' },
                    { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive',
                    tierTwoOptions: [
                        { action: 'show-company-setup-overview', text: 'What information do I need to provide?' },
                        { action: 'where-find-ein', text: 'Where can I find my EIN?' },
                        { action: 'bank-security-info', text: 'How is my bank information secured?' }
                    ]
                });
            }, 1000);
            return;



        case 'save-and-exit':
            message = 'Save and exit';
            addMessage(message, 'user');

            setTimeout(() => {
                addMessage('Your progress has been saved successfully! 💾\n\nAll your work is preserved including:\n• Timeline configuration\n• Document uploads\n• Company information extraction\n• Progress tracking\n\nYou can return anytime to continue your payroll setup. Have a great day!', 'ai');
            }, 1000);
            return;

        case 'edit-done': {
            message = 'Info is correct, start configuration';
            addMessage(message, 'user');
            
            // Check if we're in earning codes workflow
            const isInEarningCodesWorkflow = window.isInEarningCodesWorkflow || 
                                            document.querySelector('.earning-codes-table') || 
                                            document.querySelector('.ai-suggestions-panel');
            
            // 1. Progress Update & Celebration - Complete company info workflow
            if (window.progressManager) {
                setTimeout(() => {
                    window.progressManager.updateProgress(1); // triggers rainbow celebration animation
                    console.log('✅ Completed company info workflow - triggering celebration');
                }, 500);
            }
            
            // 2. Collapse conversation history FIRST
            setTimeout(() => {
                collapseConversationHistory("Company information threads");
            }, 1000);
            
            // 3. Create process card AFTER collapse (only if not in earning codes workflow)
            if (!isInEarningCodesWorkflow) {
                setTimeout(() => {
                    const processCard = createProcessCard({
                        title: 'Company information',
                        description: 'Updating company details...',
                        status: 'processing',
                        timestamp: 'Just started',
                        id: 'company-info-config'
                    });
                    
                    addMessage(processCard, 'ai');
                }, 2000);
            }
            
            // 4. Close the right panel and center chat
            const tablePanel = document.getElementById('tablePanel');
            const chatPanel = document.getElementById('chatPanel');
            
            if (tablePanel) {
                gsap.to(tablePanel, {
                    x: '100%',
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        tablePanel.classList.add('hidden');
                    }
                });
            }
            
            // Expand chat panel to 800px width and center it
            if (chatPanel) {
                gsap.to(chatPanel, {
                    width: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        chatPanel.classList.add('centered');
                    }
                });
            }
            
            // 5. Load AI thread on pay schedule
            setTimeout(() => {
                showTypingIndicator();
                
                // Enter pay schedule workflow
                if (window.progressManager) {
                    window.progressManager.enterWorkflow('pay-schedule', 0);
                }
                
                setTimeout(() => {
                    removeTypingIndicator();
                    
                    // Display the two pay schedules in card format
                    const scheduleCardsHTML = `
                        <div class="schedule-cards-chat">
                            <div class="company-info-card schedule-card-chat">
                                <div class="company-info-header">
                                    <h3 class="company-info-title">Schedule 1: Semi-Monthly</h3>
                                    <button class="company-info-edit-btn" onclick="handlePillClick('edit-semi-monthly')" title="Edit schedule">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="company-info-content">
                                    <div class="company-info-row">
                                        <div class="company-info-label">Name</div>
                                        <div class="company-info-value">Semi-Monthly Payroll</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">First pay date</div>
                                        <div class="company-info-value">August 15, 2025</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Frequency</div>
                                        <div class="company-info-value">24 pay periods/year</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Payroll date</div>
                                        <div class="company-info-value">15th and last day</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Hours per pay period</div>
                                        <div class="company-info-value">80 hours</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Weekend pay date</div>
                                        <div class="company-info-value">Friday before the date</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Holiday pay date</div>
                                        <div class="company-info-value">Business before the date</div>
                                    </div>
                                </div>
                            </div>
                            <div class="company-info-card schedule-card-chat">
                                <div class="company-info-header">
                                    <h3 class="company-info-title">Schedule 2: Weekly</h3>
                                    <button class="company-info-edit-btn" onclick="handlePillClick('edit-weekly')" title="Edit schedule">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="company-info-content">
                                    <div class="company-info-row">
                                        <div class="company-info-label">Name</div>
                                        <div class="company-info-value">Weekly Payroll</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">First pay date</div>
                                        <div class="company-info-value">August 8, 2025</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Frequency</div>
                                        <div class="company-info-value">52 pay periods/year</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Payroll date</div>
                                        <div class="company-info-value">Every Friday</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Hours per pay period</div>
                                        <div class="company-info-value">40 hours</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Weekend pay date</div>
                                        <div class="company-info-value">Friday before the date</div>
                                    </div>
                                    <div class="company-info-row">
                                        <div class="company-info-label">Holiday pay date</div>
                                        <div class="company-info-value">Business before the date</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    addMessage(`${CONSTANTS.MESSAGES.PERFECT} Company information updated! Now let's set up your pay schedules.\n\nI've analyzed your pay registers and extracted information for two different pay schedules:\n\n${scheduleCardsHTML}\n\nLet's verify these schedules first. Shall we start?`, 'ai', [
                        { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                        { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
                        { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' },
                        { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1500);
            }, 2500); // Reduced delay - show AI thread right after process card
            
            // 6. Update process card after 30 seconds
            setTimeout(() => {
                updateProcessCard('company-info-config', {
                    status: 'complete',
                    description: 'Company info successfully configured',
                    timestamp: '30 seconds ago'
                });
            }, 30000);
            
            return;
        }
            


        case 'upload-documents':
        message = 'Upload documents (recommended)';
        addMessage(message, 'user');

        setTimeout(() => {
            addMessage('Great choice! To help you find the right documents faster, what payroll system are you currently using?\n\nIf you tell us your vendor, we can provide the exact file names and reports you need to upload.', 'ai', [
                { action: 'vendor-adp', text: 'ADP', buttonType: 'secondary' },
                { action: 'vendor-gusto', text: 'Gusto', buttonType: 'secondary' },
                { action: 'vendor-quickbooks', text: 'QuickBooks', buttonType: 'secondary' }, { action: 'vendor-paycom', text: 'Paycom', buttonType: 'secondary' },
                { action: 'vendor-paychex', text: 'Paychex', buttonType: 'secondary' }
            ], {
                style: 'two-tier-interactive',
                tierTwoOptions: [
                    { action: 'vendor-other', text: 'Other payroll system' },
                    { action: 'vendor-manual', text: 'Manual/Excel system' },
                    { action: 'skip-vendor-question', text: 'Skip and go to upload page' }
                ]
            });
        }, 1000);
        return;

            case 'do-it-later':
                message = 'Do it later';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('No problem! You can upload documents anytime during setup. I\'ll guide you through manual configuration for now.\n\nReady to continue with your timeline?', 'ai', [
                          { action: 'start-schedule-setup', text: 'Skip to payroll setup', buttonType: 'secondary' },
                        { action: 'modify-timeline', text: 'Modify timeline dates', buttonType: 'primary' }
                      
                    ], {
                        style: 'two-tier-interactive'
                    });
                }, 1000);
                return;

            case 'what-documents-needed':
                message = 'What documents are needed?';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('Here are the documents that help accelerate your setup:\n\n<strong> Employee Handbook (Recommended)</strong>\n• Company policies document\n• HR manual or employee guide\n• Any document containing pay policies\n\n<strong> Recent Payroll Report (Highly Recommended)<strong>\n• Last 1-3 pay periods from your current system\n• Year-to-date payroll summary\n• Earning codes report or pay stub samples\n\n</strong>Optional but Helpful:<strong>\n• Timekeeping policies\n• Overtime calculation rules\n• Benefits deduction schedules', 'ai', [
                        { action: 'upload-documents', text: 'Upload documents now', buttonType: 'primary' },
                        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive',
                        tierTwoOptions: [
                            { action: 'why-upload-documents', text: 'Why do I need to upload documents?' }
                        ]
                    });
                }, 1000);
                return;

      case 'why-upload-documents':
    message = 'Why do I need to upload documents?';
    addMessage(message, 'user');
    setTimeout(() => {
        addMessage('Uploading documents provides several key benefits:\n\n<strong>📋 Employee Handbook Benefits:</strong>\n• Automatically extract pay policies\n• Identify overtime rules and holiday pay\n• Configure time-off policies correctly\n\n<strong>📊 Payroll History Benefits:</strong>\n• Extract all your earning codes instantly\n• Copy exact rate configurations\n• Reduce setup time by 80%\n\n<strong>Without documents:</strong> Manual configuration takes 45-60 minutes\n<strong>With documents:</strong> Automated extraction takes 5-10 minutes', 'ai', [
            { action: 'upload-documents', text: 'Upload documents now', buttonType: 'primary' },
            { action: 'start-schedule-setup', text: 'Skip and configure manually', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 1000);
    return;
            

        case 'skip-document-upload':
            message = 'Skip and configure manually';
            addMessage(message, 'user');
            setTimeout(() => {
                // Transition to existing payroll setup
                loadInitialScheduleCards();
                addMessage('No problem! I\'ll guide you through manual configuration.\n\n', 'ai', [
                   
                    { action: 'add-new', text: 'Add new schedule' }
              ], {
                  style: 'two-tier-interactive'
              });
              }, 1000);
              return;

        case 'explain-document-benefits':
            message = 'Tell me more about benefits';
            addMessage(message, 'user');
            setTimeout(() => {
                addMessage('Here\'s exactly how document upload saves time:\n\n<strong>⚡ Speed Comparison:</strong>\n• Manual setup: 45-60 minutes of Q&A\n• With documents: 5-10 minutes automated extraction\n\n<strong>🎯 Accuracy Benefits:</strong>\n• No risk of missed earning codes\n• Exact rate matching from your current system\n• Policy compliance automatically checked\n\n<strong>💼 Professional Setup:</strong>\n• Industry best practices automatically applied\n• Audit-ready configuration from day 1\n• Seamless migration from your current system', 'ai', [
                    { action: 'upload-documents', text: 'Upload documents now', buttonType: 'primary' },
                    { action: 'start-schedule-setup', text: 'Continue with manual setup', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
                }, 1000);
                return;

        case 'complete-document-upload':
            message = 'Complete uploading';
            addMessage(message, 'user');
            setTimeout(() => {
                // Check if files were uploaded
                const handbookInput = document.getElementById('handbookFileInput');
                const payrollInput = document.getElementById('payrollFileInput');

                if (handbookInput?.files.length > 0 || payrollInput?.files.length > 0) {
                    // Call existing document processing simulation
                    simulateDocumentProcessing(handbookInput.files.length > 0, payrollInput.files.length > 0);
                } else {
                addMessage('I don\'t see any uploaded files yet. Please drag and drop your documents in the upload areas on the right, or click "Skip to company configuration" to continue without uploading.', 'ai', [
    { action: 'skip-to-company-config', text: 'Skip to company configuration', buttonType: 'primary' }
], {
    style: 'two-tier-interactive'
});
                }
            }, 1000);
            return;

        case 'skip-to-company-config':
            message = 'Skip to company configuration';
            addMessage(message, 'user');
            setTimeout(() => {
                // Transition to existing payroll setup
                loadInitialScheduleCards();
              addMessage('No problem! I\'ll guide you through manual configuration.\n\nI\'ve analyzed your pay registers and extracted information for two different pay schedules. Let\'s verify these schedules first.', 'ai', [
    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
    { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' },
    { action: 'edit-weekly', text: 'Edit Weekly Payroll', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
}, 1000);
            return;

        case 'confirm-uploaded-files':
            handleUploadConfirmation('confirm-uploaded-files');
            return;

        case 'upload-different-files':
            handleUploadConfirmation('upload-different-files');
            return;

        // === BASIC SCHEDULE ACTIONS ===
        case 'add-new':
            response = {
                text: 'I\'d be happy to help you add a new pay schedule!\n\nWhich type would you like to add?',
                pills: [
                    { action: 'weekly', text: 'Add weekly' },
                    { action: 'bi-weekly', text: 'Add Bi-weekly' },
                    { action: 'semi-monthly', text: 'Add Semi-monthly' },
                    { action: 'monthly', text: 'Add Monthly' },
                    { action: 'quarterly', text: 'Add Quarterly' }

                ]
            };
            break;

        case 'bi-weekly':
            updatePanelContent('biweekly-placeholder');
            response = {
                text: `${CONSTANTS.MESSAGES.PERFECT} I've added a Bi-weekly schedule to your payroll setup.\n\nWhat would you like to name this schedule?`,
                pills: []
            };
            // Set flag to track we're waiting for bi-weekly name
            window.waitingForBiweeklyName = true;
            break;

        case 'monthly':
            addMonthlySchedule();
            
            // Create the complete monthly schedule card HTML
            const monthlyScheduleCard = `
                <div class="schedule-cards-chat">
                    <div class="company-info-card schedule-card-chat">
                        <div class="company-info-header">
                            <h3 class="company-info-title">Monthly Schedule</h3>
                            <button class="company-info-edit-btn" onclick="handlePillClick('edit-monthly')" title="Edit schedule">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 19.036H3v-3.536L16.732 3.732z"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="company-info-content">
                            <div class="company-info-row">
                                <div class="company-info-label">Name</div>
                                <div class="company-info-value">Monthly Payroll</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">First pay date</div>
                                <div class="company-info-value">Last day of current month</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">Frequency</div>
                                <div class="company-info-value">12 pay periods/year</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">Payroll date</div>
                                <div class="company-info-value">Last day of month</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">Hours per pay period</div>
                                <div class="company-info-value">173 hours (average)</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">Weekend pay date</div>
                                <div class="company-info-value">Friday before the date</div>
                            </div>
                            <div class="company-info-row">
                                <div class="company-info-label">Holiday pay date</div>
                                <div class="company-info-value">Business before the date</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            response = {
                text: `✅ Added Monthly schedule! This schedule pays employees once per month (12 times per year).\n\n${monthlyScheduleCard}\n\nYou now have 3 pay schedules configured.`,
                pills: [
                    { action: 'approve-all', text: 'Approve all schedules' },
                    { action: 'edit-schedule', text: 'Edit a schedule' },
                    { action: 'remove-schedule', text: 'Remove a schedule' }
                ]
            };
            break;



        case 'edit-schedule':
            message = 'Edit schedule';
            response = {
                text: 'Sure! Which schedule would you like to modify?',
                pills: [
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' },
                    { action: 'edit-both', text: 'Edit both schedules' }
                ]
            };
            break;


        case 'edit-semi-monthly':
            openScheduleEditPanel('Semi-Monthly Payroll');
            return;
            
        case 'edit-semi-monthly-old':
            message = 'Edit Semi-Monthly';
            response = {
                text: 'What would you like to modify for the <Strong>Semi-Monthly</strong> schedule?',
                pills: [
                    { action: 'change-semi-name', text: 'Change name' },
                    { action: 'change-semi-first-pay-date', text: 'Change first pay date' },
                    { action: 'change-semi-weekend-rules', text: 'Change weekend rules' },
                    { action: 'change-semi-holiday-rules', text: 'Change holiday rules' }
                ]
            };
            break;

        case 'edit-weekly':
            openScheduleEditPanel('Weekly Payroll');
            return;
            
        case 'edit-biweekly':
            openScheduleEditPanel('Bi-Weekly Payroll');
            return;
            
        case 'edit-monthly':
            openScheduleEditPanel('Monthly Payroll');
            return;
            
        case 'edit-weekly-old':
            message = 'Edit Weekly';
            response = {
                text: 'What would you like to modify for the Weekly schedule?',
                pills: [
                    { action: 'change-weekly-name', text: 'Change name' },
                    { action: 'change-weekly-first-pay-date', text: 'Change first pay date' },
                    { action: 'change-weekly-weekend-rules', text: 'Change weekend rules' },
                    { action: 'change-weekly-holiday-rules', text: 'Change holiday rules' }
                ]
            };
            break;
       

        case 'change-semi-name':
            message = 'Change name';
            response = 'What would you like to name the Semi-Monthly schedule?';
            break;

        case 'change-semi-first-pay-date':
            message = 'Change first pay date';
            response = 'What should be the first pay date for the Semi-Monthly schedule? (e.g., August 15, 2025)';
            break;

        case 'change-weekly-name':
            message = 'Change name';
            response = 'What would you like to name the Weekly schedule?';
            break;

        case 'change-weekly-first-pay-date':
            message = 'Change first pay date';
            response = 'What should be the first pay date for the Weekly schedule? (e.g., August 8, 2025)';
            break;


        case 'edit-weekly':
            message = 'Edit Weekly schedule';
            response = 'I can help you modify the Weekly schedule. What would you like to change?\n\n• <strong>Pay day</strong>: Currently Friday - change to another day?\n• <strong>Hours</strong>: Currently 40 hours - adjust for part-time?\n• <strong>Weekend/Holiday dates</strong>: Currently Friday before - change timing?\n\nJust tell me what you\'d like to update!';
            break;


        case 'change-semi-weekend-rules':
            message = 'Change weekend/holiday rules';
            response = {
                text: 'Choose the weekend adjustment rule for <strong>Semi-Monthly</strong> schedule:\n\n<strong>.Current: Friday before the date</strong>\nAvailable options:',
                pills: [
                    { action: 'set-semi-weekend-previous-friday', text: 'Previous Friday' },
                    { action: 'set-semi-weekend-following-monday', text: 'Following Monday' }
                ]
            };
            break;

        case 'change-weekly-weekend-rules':
            message = 'Change weekend/holiday rules';
            response = {
                text: 'Choose the weekend adjustment rule for Weekly schedule:\n\n<Strong>Current:</strong> Friday before the date\nAvailable options:',
                pills: [
                    { action: 'set-weekly-weekend-previous-friday', text: 'Previous Friday' },
                    { action: 'set-weekly-weekend-following-monday', text: 'Following Monday' }
                ]
            };
            break;

        // Weekend rule updates
        case 'set-semi-weekend-previous-friday':
            message = 'Previous Friday';
            updateScheduleRule('semi-monthly', 'weekend', 'Previous Friday');
            response = {
                text: '✅ Updated Semi-Monthly weekend rule to "Previous Friday"\n\nWeekend rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
                ]
            };
            break;

        case 'set-semi-weekend-following-monday':
            message = 'Following Monday';
            updateScheduleRule('semi-monthly', 'weekend', 'Following Monday');
            response = {
                text: '✅ Updated Semi-Monthly weekend rule to "Following Monday"\n\nWeekend rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
                ]
            };
            break;

        case 'set-weekly-weekend-previous-friday':
            message = 'Previous Friday';
            updateScheduleRule('weekly', 'weekend', 'Previous Friday');
            response = {
                text: '✅ Updated Weekly weekend rule to "Previous Friday"\n\nWeekend rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll' }
                ]
            };
            break;

        case 'set-weekly-weekend-following-monday':
            message = 'Following Monday';
            updateScheduleRule('weekly', 'weekend', 'Following Monday');
            response = {
                text: '✅ Updated Weekly weekend rule to "Following Monday"\n\nWeekend rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll' }
                ]
            };
            break;

        // ADD THESE MISSING HOLIDAY RULE CASES

        case 'change-semi-holiday-rules':
            message = 'Change holiday rules';
            response = {
                text: 'Choose the holiday adjustment rule for Semi-Monthly schedule:\n\n<strong>Current: Business before the date,</strong>\nAvailable options:',
                pills: [
                    { action: 'set-semi-holiday-business-before', text: 'Business day before' },
                    { action: 'set-semi-holiday-business-after', text: 'Business day after' },
                    { action: 'set-semi-holiday-closest-business', text: 'Closest business day' }
                ]
            };
            break;

        case 'change-weekly-holiday-rules':
            message = 'Change holiday rules';
            response = {
                text: 'Choose the holiday adjustment rule for Weekly schedule:\n\n<strong.Current:Business before the date </strong>\nAvailable options:',
                pills: [
                    { action: 'set-weekly-holiday-business-before', text: 'Business day before' },
                    { action: 'set-weekly-holiday-business-after', text: 'Business day after' },
                    { action: 'set-weekly-holiday-closest-business', text: 'Closest business day' }
                ]
            };
            break;

        // Holiday rule updates
        case 'set-semi-holiday-business-before':
            message = 'Business day before';
            updateScheduleRule('semi-monthly', 'holiday', 'Business day before');
            response = {
                text: '✅ Semi-Monthly holiday rule updated to "Business day before"\n\nHoliday rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
                ]
            };
            break;

        case 'set-semi-holiday-business-after':
            message = 'Business day after';
            updateScheduleRule('semi-monthly', 'holiday', 'Business day after');
            response = {
                text: '✅ Semi-Monthly holiday rule updated to "Business day after"\n\nHoliday rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
                ]
            };
            break;

        case 'set-semi-holiday-closest-business':
            message = 'Closest business day';
            updateScheduleRule('semi-monthly', 'holiday', 'Closest business day');
            response = {
                text: '✅ Semi-Monthly holiday rule updated to "Closest business day"\n\nHoliday rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
                ]
            };
            break;

        case 'set-weekly-holiday-business-before':
            message = 'Business day before';
            updateScheduleRule('weekly', 'holiday', 'Business day before');
            response = {
                text: '✅ Weekly holiday rule updated to "Business day before"\n\nHoliday rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll' }
                ]
            };
            break;

        case 'set-weekly-holiday-business-after':
            message = 'Business day after';
            updateScheduleRule('weekly', 'holiday', 'Business day after');
            response = {
                text: '✅ Weekly holiday rule updated to "Business day after"\n\nHoliday rule has been configured. What would you like to do next?',
                pills: [
                    { action: 'looks-good', text: 'Looks good, continue' },
                    { action: 'add-new', text: 'Add new schedule' },
                    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll' }
                ]
            };
            break;

        case 'set-weekly-holiday-closest-business':
    message = 'Closest business day';
    updateScheduleRule('weekly', 'holiday', 'Closest business day');
    response = {
        text: '✅ Weekly holiday rule updated to "Closest business day"\n\nHoliday rule has been configured. What would you like to do next?',
        pills: [
            { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
            { action: 'add-new', text: 'Add new schedule', buttonType: 'secondary' },
            { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll', buttonType: 'secondary' }
        ],
        style: 'two-tier-interactive'
    };
    break;

   
        // === Configuration ===
       
            case 'start-pay-calculation':
                message = 'Start with rate multipliers';
                addMessage(message, 'user');
                
                // Show loading spinner in right panel immediately
                const startPayPanelContent = document.querySelector('.panel-content');
                if (startPayPanelContent) {
                    startPayPanelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading rate multipliers...</div>
                            <div class="loading-subtext">Configuring pay calculation methods</div>
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    startPayCalculationConfiguration();
                }, 2000);
                return;

        case 'why-5-steps':  // Keeping same action name for compatibility
            message = 'Explain the process';
            response = {
                text: ` 1. <strong>Rate Multipliers</strong> 
           Review the overtime rates we found (like 1.5x for weekends) and tell us if they look right

        2. <strong>Weighted Average Overtime</strong> 
           We'll ask a few quick questions about your workforce to configure the weighted overtime calculations properly

        3. <strong>Tax Treatment</strong> 
           Tell us which earning codes need special tax handling (like pre-tax deductions)


        Each step just needs a quick decision from you. Ready to start with overtime rates?`,
                pills: [
                    { action: 'start-pay-calculation', text: 'Start with rate multipliers' },
                    { action: 'configure-all-settings', text: 'Configure all settings at once' }
                ]
            };
            break;

            case 'configure-all-settings':
            message = 'Configure all settings at once';
            addMessage(message, 'user');
            setTimeout(() => {
                showAllRateConfigurationTable();
            }, 1000);
            return;

             // === Weighted average overtime cal ===
           
        case 'weighted-ot-yes':
            message = 'Yes, they work multiple roles';
            addMessage(message, 'user');

            setTimeout(() => {
                // Update panel header for weighted overtime classification
                const panelHeader = document.querySelector('.panel-header h2');
                const panelSubtitle = document.querySelector('.panel-subtitle');
                if (panelHeader) {
                    panelHeader.textContent = 'Weighted Average Overtime Configuration'; // CHANGED THIS
                }
                if (panelSubtitle) {
                    panelSubtitle.innerHTML = 'Configure which earning codes are included in OT calculations';
                }

                const classification = classifyEarningCodesSimple();
                showSimplifiedWeightedOTPanel(classification);

                // JUST UPDATE THIS EXISTING MESSAGE:
                const needsInput = classification.needsInput.length;
                const includedCount = classification.autoIncluded.length;
                const excludedCount = classification.autoExcluded.length;
addMessage(`Okay, now let's review earning codes for weighted average overtime calculations. \n
I've categorized your codes to include or exclude in overtime calculation
<strong>• Included</strong>: ${includedCount} 
<strong>• Excluded </strong>:${excludedCount}
<strong>• Uncategorized</strong>:${needsInput}
Your next steps are to finish categorizing each code. 
Have you finished categorizing each code and you're ready to continue?`, 'ai', [
    { action: 'confirm-weighted-ot-simple', text: 'Continue to tax treatment', buttonType: 'primary' }
], {
    style: 'two-tier-interactive',
    tierTwoOptions: [
        { action: 'explain-weighted-ot-classification', text: 'Explain the classification' }
    ]
});
}, 1000);
return;

            // REPLACE your existing weighted-ot-no case with:
            case 'weighted-ot-no':
                message = 'No, single role per employee';
                addMessage(message, 'user');

                if (window.progressManager) {
                    window.progressManager.updateProgress(2);
                }

               setTimeout(() => {
    addMessage('Great! Since employees work single roles, we can use standard overtime calculations.\n\nYour overtime setup is complete.', 'ai', [
        { action: 'continue-to-base-comp', text: 'Continue to Base Compensation', buttonType: 'primary' }
    ], {
        style: 'two-tier-interactive'
    });
}, 1000);
                return;

            case 'weighted-ot-example':
                message = 'Give me an example';
                addMessage(message, 'user');

                setTimeout(() => {
                   addMessage('An employee who works as both a cashier ($15/hr) and supervisor ($18/hr) in the same week.\n\nDo any of your employees work in multiple roles like this?', 'ai', [
    { action: 'weighted-ot-yes', text: 'Yes, they work multiple roles', buttonType: 'secondary' },
    { action: 'weighted-ot-no', text: 'No, single role per employee', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
}, 1000);
return;

            // ───────────────────────────────────────────────
            // OT-ELIGIBILITY SCREEN – 20 pill-action cases
            // (Yes | No | Why it matters | Give me an example)
            // ───────────────────────────────────────────────

            // ── ❶ Multiple rates in one week ───────────────


            
            case 'ot-multiRate-yes':
                addMessage('Yes', 'user');
                waotEligibility.multiRate = true;
                // Skip directly to weighted average OT config since user answered Yes
                setTimeout(() => {
                    console.log('Jumping directly to Weighted Average OT Config page...');
                    showSimplifiedWeightedOTFromEligibility();
                }, 300);
                return;

            case 'ot-multiRate-no':
                addMessage('No', 'user');
                waotEligibility.multiRate = false;
                setTimeout(() => askOTEligibilityQuestion(1), 300);
                return;

            case 'ot-multiRate-why':
                addMessage('Why it matters', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[0].why, 'ai');
                setTimeout(() => askOTEligibilityQuestion(0), 300);
                return;

            case 'ot-multiRate-ex':
                addMessage('Give me an example', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[0].example, 'ai');
                setTimeout(() => askOTEligibilityQuestion(0), 300);
                return;


            // ── ❷ Shift differential ───────────────────────
            case 'ot-shiftDiff-yes':
                addMessage('Yes', 'user');
                waotEligibility.shiftDiff = true;
                // Skip directly to weighted average OT config since user answered Yes
                setTimeout(() => {
                    console.log('Jumping directly to Weighted Average OT Config page...');
                    showSimplifiedWeightedOTFromEligibility();
                }, 300);
                return;

            case 'ot-shiftDiff-no':
                addMessage('No', 'user');
                waotEligibility.shiftDiff = false;
                setTimeout(() => askOTEligibilityQuestion(2), 300);
                return;

            case 'ot-shiftDiff-why':
                addMessage('Why it matters', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[1].why, 'ai');
                setTimeout(() => askOTEligibilityQuestion(1), 300);
                return;

            case 'ot-shiftDiff-ex':
                addMessage('Give me an example', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[1].example, 'ai');
                setTimeout(() => askOTEligibilityQuestion(1), 300);
                return;


            // ── ❸ Same-period bonus ────────────────────────
            case 'ot-samePeriodBonus-yes':
                addMessage('Yes', 'user');
                waotEligibility.samePeriodBonus = true;
                // Skip directly to weighted average OT config since user answered Yes
                setTimeout(() => {
                    console.log('Jumping directly to Weighted Average OT Config page...');
                    showSimplifiedWeightedOTFromEligibility();
                }, 300);
                return;

            case 'ot-samePeriodBonus-no':
                addMessage('No', 'user');
                waotEligibility.samePeriodBonus = false;
                setTimeout(() => askOTEligibilityQuestion(3), 300);
                return;

            case 'ot-samePeriodBonus-why':
                addMessage('Why it matters', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[2].why, 'ai');
                setTimeout(() => askOTEligibilityQuestion(2), 300);
                return;

            case 'ot-samePeriodBonus-ex':
                addMessage('Give me an example', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[2].example, 'ai');
                setTimeout(() => askOTEligibilityQuestion(2), 300);
                return;


            // ── ❹ Multi-period bonus / commission ──────────
            case 'ot-multiPeriodBonus-yes':
                addMessage('Yes', 'user');
                waotEligibility.multiPeriodBonus = true;
                // Skip directly to weighted average OT config since user answered Yes
                setTimeout(() => {
                    console.log('Jumping directly to Weighted Average OT Config page...');
                    showSimplifiedWeightedOTFromEligibility();
                }, 300);
                return;

            case 'ot-multiPeriodBonus-no':
                addMessage('No', 'user');
                waotEligibility.multiPeriodBonus = false;
                setTimeout(() => askOTEligibilityQuestion(4), 300);
                return;

            case 'ot-multiPeriodBonus-why':
                addMessage('Why it matters', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[3].why, 'ai');
                setTimeout(() => askOTEligibilityQuestion(3), 300);
                return;

            case 'ot-multiPeriodBonus-ex':
                addMessage('Give me an example', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[3].example, 'ai');
                setTimeout(() => askOTEligibilityQuestion(3), 300);
                return;


            // ── ❺ Fixed-salary non-exempt ──────────────────
            case 'ot-fixedSalary-yes':
                addMessage('Yes', 'user');
                waotEligibility.fixedSalary = true;
                // Skip directly to weighted average OT config since user answered Yes
                setTimeout(() => {
                    console.log('Jumping directly to Weighted Average OT Config page...');
                    showSimplifiedWeightedOTFromEligibility();
                }, 300);
                return;

            case 'ot-fixedSalary-no':
                addMessage('No', 'user');
                waotEligibility.fixedSalary = false;
                setTimeout(() => askOTEligibilityQuestion(5), 300);
                return;

            case 'ot-fixedSalary-why':
                addMessage('Why it matters', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[4].why, 'ai');
                setTimeout(() => askOTEligibilityQuestion(4), 300);
                return;

            case 'ot-fixedSalary-ex':
                addMessage('Give me an example', 'user');
                addMessage(OT_ELIGIBILITY_QUESTIONS[4].example, 'ai');
                setTimeout(() => askOTEligibilityQuestion(4), 300);
                return;
            // ───────────────────────────────────────────────
            // END OT-ELIGIBILITY CASES
            // ───────────────────────────────────────────────

            
            
            case 'confirm-weighted-ot-config':
            message = 'Yes, move forward';
            addMessage(message, 'user');

            // Update progress: completed weighted OT step
            if (window.progressManager) {
                window.progressManager.updateProgress(2);
            }

            setTimeout(() => {
             addMessage('Great — your Weighted Average OT setup is now complete.\n\nNow let\'s classify which earning codes count toward base compensation for benefits and reporting.', 'ai', [
    { action: 'continue-to-base-comp', text: 'Continue to Base Compensation', buttonType: 'primary' }
], {
    style: 'two-tier-interactive'
});
}, 1000);
            return;

            case 'next-step-weighted-ot':
            message = 'Next step to weighted average overtime config';
            addMessage(message, 'user');
            
            // Update progress: completed pay calculation method (step 1)
            if (window.progressManager) {
                window.progressManager.updateProgress(1);
            }
            
            setTimeout(() => {
                askOTEligibilityQuestion(0);
            }, 1000);
            return;

        

            case 'explain-rate-multipliers':
                message = 'Explain rate multipliers';
                addMessage(message, 'user');
                setTimeout(() => {
                   addMessage('Rate multipliers work like this:\n\n• <strong>1.5x multiplier</strong>: Employee\'s base rate × 1.5 × hours worked\n• <strong>2.0x multiplier</strong>: Employee\'s base rate × 2.0 × hours worked\n\nFor example: If someone makes $20/hour base rate:\n• OT1 (1.5x): $20 × 1.5 = $30/hour for overtime\n• OT2 (2.0x): $20 × 2.0 = $40/hour for double-time', 'ai', [
    { action: 'looks-good-continue', text: 'Got it, continue', buttonType: 'primary' }
], {
    style: 'two-tier-interactive'
});
}, 1000);
                return;
            
            case 'continue-to-base-comp':
            message = 'Continue to Base Compensation';
            addMessage(message, 'user');

            setTimeout(() => {
                showPayStatementDisplayOptions();
            }, 1000);
            return;
            case 'time-off-breakdown':
                message = 'Show time off separately';
                addMessage(message, 'user');
                
                // Clear panel header first
                const panelHeader = document.querySelector('.panel-header h2');
                const panelSubtitle = document.querySelector('.panel-subtitle');
                if (panelHeader) {
                    panelHeader.textContent = '';
                }
                if (panelSubtitle) {
                    panelSubtitle.innerHTML = '';
                }
                
                // Show spinner in right panel immediately
                const timeOffPanelContent = document.querySelector('.panel-content');
                if (timeOffPanelContent) {
                    timeOffPanelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading weighted timeoff calculation...</div>
                            <div class="loading-subtext">Configuring base compensation classification</div>
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    handleTimeOffDisplayChoice('breakdown');
                    // Show base compensation drag & drop after spinner
                    showBaseCompensationClassificationPanel();
                    // Skip showTimeOffOrganizationExplanation() - go directly to base comp summary
                    showBaseCompensationSummaryMessage();
                }, 2000);
                return;

            case 'time-off-simple':
                message = 'Don\'t break it down';
                addMessage(message, 'user');
                
                // Clear panel header first
                const panelHeader2 = document.querySelector('.panel-header h2');
                const panelSubtitle2 = document.querySelector('.panel-subtitle');
                if (panelHeader2) {
                    panelHeader2.textContent = '';
                }
                if (panelSubtitle2) {
                    panelSubtitle2.innerHTML = '';
                }
                
                // Show spinner in right panel immediately
                const timeOffSimplePanelContent = document.querySelector('.panel-content');
                if (timeOffSimplePanelContent) {
                    timeOffSimplePanelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading weighted timeoff calculation...</div>
                            <div class="loading-subtext">Configuring base compensation classification</div>
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    handleTimeOffDisplayChoice('simple');
                    // Show base compensation drag & drop after spinner
                    showBaseCompensationClassificationPanel();
                    // Skip showTimeOffOrganizationExplanation() - go directly to base comp summary
                    showBaseCompensationSummaryMessage();
                }, 2000);
                return;
     
            case 'view-pay-statement-separate':
                message = 'Show me the separate view example';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('This shows each earning type as a separate line item on the pay statement, giving employees detailed visibility into their pay components.', 'ai');
                }, 500);
                return;

            case 'view-pay-statement-combined': 
                message = 'Show me the combined view example';
                addMessage(message, 'user');
                setTimeout(() => {
                    addMessage('This combines multiple earning types into a single salary line, creating a cleaner, simpler pay statement appearance.', 'ai');
                }, 500);
                return;

            case 'toggle-pay-statement-view':
                message = 'Switch to pay statement preview';
                addMessage(message, 'user');
                switchToPayStatementView();
                return;
       

            case 'modify-time-off-choice':
            message = 'Actually, let me choose the other option';
            addMessage(message, 'user');
            setTimeout(() => {
                showTimeOffDisplayQuestion();
            }, 1000);
            return;

            case 'time-off-breakdown-explain':
                message = 'Explain more';
                addMessage(message, 'user');
                setTimeout(() => {
                    showTimeOffBreakdownDetails();
                }, 1000);
                return;

            case 'time-off-simple-explain':
                message = 'Explain more';
                addMessage(message, 'user');
                setTimeout(() => {
                    showTimeOffSimpleDetails();
                }, 1000);
                return;

            case 'continue-to-actual-base-comp':
            message = 'Continue to Base Compensation Classification';
            addMessage(message, 'user');

            setTimeout(() => {
                showBaseCompensationClassification();
            }, 1000);
            return;

            case 'time-off-why-matters':
            message = 'Why does this matter?';
            addMessage(message, 'user');
            setTimeout(() => {
                showTimeOffWhyMattersExplanation();
            }, 1000);
            return;


        case 'salaried-has-nonexempt':
        message = 'Yes, we have non-exempt salaried employees';
        addMessage(message, 'user');

        // Store the choice
        window.salariedEmployeeType = 'has-nonexempt';

        setTimeout(() => {
            showTimeOffDisplayQuestion();
        }, 1000);
        return;

            case 'salaried-all-exempt':
            message = 'No, all salaried employees are exempt from overtime';
            addMessage(message, 'user');

            // Store the choice
            window.salariedEmployeeType = 'all-exempt';

            setTimeout(() => {
                showTimeOffDisplayQuestion();
            }, 1000);
            return;

            case 'salaried-explain-difference':
                message = 'What\'s the difference?';
                addMessage(message, 'user');
                setTimeout(() => {
                    showSalariedExemptExplanation();
                }, 1000);
                return;

            

            case 'confirm-weighted-ot-simple':
            message = 'Continue to Tax Treatment';
            addMessage(message, 'user');

            // Update progress: completed weighted OT step
            if (window.progressManager) {
                window.progressManager.updateProgress(2);
            }

            setTimeout(() => {
                showSpecialTaxClassification(); 
            }, 1000);
            return;
    


        case 'confirm-base-comp-config':
        message = 'Approve classification';
        addMessage(message, 'user');

        setTimeout(() => {
           addMessage('✅ Base compensation classification approved!', 'ai', [
    { action: 'continue-to-special-tax', text: 'Continue to Special Tax Treatment', buttonType: 'primary' }
], {
    style: 'two-tier-interactive'
});
}, 1000);
        return;

           
            
              // === special tax ===
           
            case 'show-special-tax-breakdown':
                message = 'Show special tax breakdown';
                const taxCounts = getSpecialTaxCounts();
                response = {
                    text: `Here's your special tax treatment breakdown:\n\n<Strong>No special tax</strong>: ${taxCounts.none}\n<Strong>Non taxable</strong>: ${taxCounts.nontaxable}\n<Strong>Supplemental</strong>: ${taxCounts.supplemental}\n<Strong>Other Special tax</strong>: ${taxCounts.other}\n\nThese settings determine how each earning code is treated for tax purposes.`,
                    pills: [
                        { action: 'continue-special-tax-to-w2', text: 'Continue to W-2 Preview' },
                        { action: 'modify-tax-settings', text: 'Modify tax settings' }
                    ]
                };
                break;

            case 'update-tax-counts':
                message = 'Update tax counts';
                updateSpecialTaxCountDisplay();
                response = {
                    text: 'Tax counts have been updated based on your current configuration.',
                    pills: [
                        { action: 'show-special-tax-breakdown', text: 'Show breakdown' },
                        { action: 'continue-special-tax-to-w2', text: 'Continue' }
                    ]
                };
                break;

            case 'modify-tax-settings':
                message = 'Let me modify tax settings';
                response = {
                    text: 'You can modify tax settings by dragging earning codes between the columns on the right panel. Which earning codes would you like to adjust?',
                    pills: [
                        { action: 'show-special-tax-breakdown', text: 'Show current breakdown' },
                        { action: 'continue-special-tax-to-w2', text: 'Continue to W-2' }
                    ]
                };
                break;
        case 'pay-display-separate':
                message = 'Show separately';
                addMessage(message, 'user');
                
                // Store the choice
                window.payStatementDisplayChoice = 'separate';
                
                // Add checkmark to the selected card
                const optionCards = document.querySelectorAll('.option-card');
                optionCards.forEach(card => {
                    // Remove any existing checkmarks
                    const existingCheck = card.querySelector('.checkmark-overlay');
                    if (existingCheck) existingCheck.remove();
                    
                    // Add checkmark to the "Show Separately" card
                    if (card.querySelector('h3').textContent.includes('Show Separately')) {
                        const checkmark = document.createElement('div');
                        checkmark.className = 'checkmark-overlay';
                        checkmark.innerHTML = '✓';
                        card.appendChild(checkmark);
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                });
                
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage('Great! Time off earning codes will show as separate line items on pay statements. ✓\n\nNow let\'s configure the rate settings for your earning codes.', 'ai');
                    
                    // Continue to rate configuration workflow without showing spinner
                    setTimeout(() => {
                        startRateConfigurationWorkflow();
                    }, 1500);
                }, 1000);
                return;
                
            case 'pay-display-combined':
                message = 'Combined';
                addMessage(message, 'user');
                
                // Store the choice
                window.payStatementDisplayChoice = 'combined';
                
                // Add checkmark to the selected card
                const combinedOptionCards = document.querySelectorAll('.option-card');
                combinedOptionCards.forEach(card => {
                    // Remove any existing checkmarks
                    const existingCheck = card.querySelector('.checkmark-overlay');
                    if (existingCheck) existingCheck.remove();
                    
                    // Add checkmark to the "Combined" card
                    if (card.querySelector('h3').textContent.includes('Combined')) {
                        const checkmark = document.createElement('div');
                        checkmark.className = 'checkmark-overlay';
                        checkmark.innerHTML = '✓';
                        card.appendChild(checkmark);
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                });
                
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage('Perfect! Time off earning codes will be combined with regular salary on pay statements. ✓\n\nNow let\'s configure the rate settings for your earning codes.', 'ai');
                    
                    // Continue to rate configuration workflow without showing spinner
                    setTimeout(() => {
                        startRateConfigurationWorkflow();
                    }, 1500);
                }, 1000);
                return;
        
        case 'has-special-tax-codes':
                message = 'Yes, some codes need special treatment';
                addMessage(message, 'user');
                
                // Show spinner in right panel immediately
                const specialTaxPanelContent = document.querySelector('.panel-content');
                if (specialTaxPanelContent) {
                    specialTaxPanelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading special tax classification...</div>
                            <div class="loading-subtext">Configuring tax treatment settings</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    showSpecialTaxClassification();
                }, 2000);
                return;
                
        case 'no-special-tax-codes':
                message = 'No, standard tax treatment for all';
                addMessage(message, 'user');
                
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage('Perfect! All your earning codes will use standard tax treatment.\n\nYour payroll configuration is now complete. Let\'s preview your W-2 setup.', 'ai');
                    
                    // Update progress
                    if (window.progressManager) {
                        window.progressManager.updateProgress(4);
                    }
                    
                    setTimeout(() => {
                        finalizeConfiguration();
                    }, 2000);
                }, 1000);
                return;
        
        case 'continue-to-special-tax':
                message = 'Continue to Special Tax Treatment';
                addMessage(message, 'user');

                // Show spinner in right panel immediately
                const specialTaxPanelContent2 = document.querySelector('.panel-content');
                if (specialTaxPanelContent2) {
                    specialTaxPanelContent2.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading special tax classification...</div>
                            <div class="loading-subtext">Configuring tax treatment settings</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    showSpecialTaxClassification();
                }, 2000);
                return;


            case 'skip-to-w2-from-special-tax':
                message = 'Preview W-2';
                addMessage(message, 'user');

                // Update progress: completed special tax treatment (step 4) 
                if (window.progressManager) {
                    window.progressManager.updateProgress(4);
                    console.log('✅ Skipped min/max thresholds, going to W-2');
                }

                setTimeout(() => {
                    finalizeConfiguration();
                }, 1000);
                return;

            case 'continue-special-tax-to-w2':
                message = 'Continue to W-2 Preview';
                addMessage(message, 'user');

                // Update progress: completed special tax treatment (step 4)
                if (window.progressManager) {
                    window.progressManager.updateProgress(4);
                    console.log('✅ Completed special tax configuration, proceeding to W-2');
                }

                setTimeout(() => {
                    finalizeConfiguration();
                }, 1000);
                return;
            
        case 'continue-to-final-step':
        message = 'Continue to Final Step';
        addMessage(message, 'user');

        setTimeout(() => {
            showThresholdsConfiguration();
        }, 1000);
        return;
            
             // === min max limit ===
            function simulateThresholdExtraction() {
                // Simulate AI extraction from uploaded documents
                const extractedThresholds = {
                    fromHandbook: [
                        {
                            code: 'CAR',
                            name: 'Car Allowance',
                            type: 'max',
                            amount: 500,
                            source: 'Employee handbook states "Maximum $500/month vehicle allowance for business use"',
                            confidence: 'high'
                        },
                        {
                            code: 'MEAL',
                            name: 'Meal Allowance', 
                            type: 'max',
                            amount: 25,
                            source: 'Policy section 4.2: "Meal reimbursement up to $25/day for approved business meals"',
                            confidence: 'medium'
                        }
                    ],
                    fromPayroll: [
                        {
                            code: 'FMLA',
                            name: 'Family Leave',
                            type: 'max',
                            amount: 2000,
                            source: 'Historical payroll data shows FMLA payments range $0-$2,000 per pay period',
                            confidence: 'high'
                        },
                        {
                            code: 'COMM',
                            name: 'Commission',
                            type: 'min',
                            amount: 500,
                            source: 'Commission payments never below $500 in past 12 months of payroll data',
                            confidence: 'medium'
                        }
                    ]
                };

                // Add these codes to earning codes table if they don't exist
                const newCodes = [
                    { code: 'CAR', name: 'Car Allowance', description: 'Vehicle allowance for business use', assessment: 'Exact match', reviewed: false, editMode: false },
                    { code: 'MEAL', name: 'Meal Allowance', description: 'Business meal reimbursement', assessment: 'Exact match', reviewed: false, editMode: false }
                ];

                newCodes.forEach(newCode => {
                    const exists = earningCodes.find(code => code.code === newCode.code);
                    if (!exists) {
                        earningCodes.push(newCode);
                    }
                });

                return extractedThresholds;
            } 
            
            
            

// ========================================
// WEIGHTED OVERTIME CLASSIFICATION FUNCTIONS
// ========================================

            function showSimplifiedWeightedOTFromEligibility() {
                // Clear panel header immediately during spinner
                const panelHeader = document.querySelector('.panel-header h2');
                const panelSubtitle = document.querySelector('.panel-subtitle');
                if (panelHeader) {
                    panelHeader.textContent = '';
                }
                if (panelSubtitle) {
                    panelSubtitle.innerHTML = '';
                }

                // Show spinner in right panel immediately
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading weighted average overtime configuration...</div>
                            <div class="loading-subtext">Analyzing earning codes for OT calculations</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    // Update progress to weighted OT step
                    if (window.progressManager) {
                        window.progressManager.enterWorkflow('rate-configuration', 1);
                    }

                    // Update panel header for weighted overtime classification
                    if (panelHeader) {
                        panelHeader.textContent = 'Weighted Average Overtime Configuration';
                    }
                    if (panelSubtitle) {
                        panelSubtitle.innerHTML = 'Configure which earning codes are included in OT calculations';
                    }

                    const classification = classifyEarningCodesSimple();
                    showSimplifiedWeightedOTPanel(classification);

                    const needsInput = classification.needsInput.length;
                    const includedCount = classification.autoIncluded.length;
                    const excludedCount = classification.autoExcluded.length;
                // DEBUG: Check what's in waotEligibility
                console.log('waotEligibility values:', JSON.stringify(waotEligibility, null, 2));

                // Build list of questions they answered "Yes" to
                const eligibilityAnswers = [];
                if (waotEligibility.multiRate === true) {
                    eligibilityAnswers.push("Some employees work multiple jobs at different rates");
                }
                if (waotEligibility.shiftDiff === true) {
                    eligibilityAnswers.push("You pay a shift differential or premium");
                }
                if (waotEligibility.samePeriodBonus === true) {
                    eligibilityAnswers.push("Some of your employees receive non-discretionary bonuses earned and paid in the same pay period");
                }
                if (waotEligibility.multiPeriodBonus === true) {
                    eligibilityAnswers.push("Some of your employees earn bonuses, commissions, or incentive pay that cover more than one pay period");
                }

                // Build the direct message text
                let mainMessage = 'Perfect! Since you answered "Yes" to one of the eligibility questions, you need weighted average overtime calculations.';

                if (eligibilityAnswers.length > 0) {
                    // Remove the bullet point and create direct text
                    const cleanAnswers = eligibilityAnswers.map(answer => answer.replace('• ', '')).join(', ');
                    mainMessage = `Perfect! ${cleanAnswers}, you need weighted average overtime calculations.`;
                }

              const message = needsInput > 0 ? 
                `${mainMessage}\n\nHere's what I've done so far:\n<strong>• Include</strong>: ${includedCount}\n<strong>• Exclude</strong>: ${excludedCount}\n<strong>• Need your input</strong>: ${needsInput}\n\nNext step - drag the ${needsInput} uncategorized codes to "Include" or "Exclude," then review our suggestions.\n\nReady to continue once you've categorized everything?` :
                `${mainMessage}\n\nI've automatically categorized all your earning codes based on FLSA guidelines:\n<strong>• Include</strong>: ${includedCount} codes (regular pay, shift differentials, non-discretionary bonuses)\n<strong>• Exclude</strong>: ${excludedCount} codes (PTO, reimbursements, benefits)\n\nYou can review and adjust these categories if needed. Ready to continue?`;
              
              addMessage(message, 'ai', [
    { action: 'confirm-weighted-ot-simple', text: 'Continue to tax treatment', buttonType: 'primary' }
], {
    style: 'two-tier-interactive',
    tierTwoOptions: [
        { action: 'explain-weighted-ot-classification', text: 'Explain the classification' }
    ]
});
                }, 2000); // 2 second delay for spinner
            }



            function classifyEarningCodesSimple() {
                const autoIncluded = [];
                const autoExcluded = [];
                const needsInput = [];

                earningCodes.forEach(code => {
                    const codeUpper = code.code.toUpperCase();
                    const nameUpper = (code.name || '').toUpperCase();
                    const descUpper = (code.description || '').toUpperCase();

                    // Auto-include: Regular wages, shift differentials, non-discretionary bonuses
                    if (codeUpper.includes('REG') || nameUpper.includes('REGULAR') ||
                        codeUpper.includes('SHIFT') || nameUpper.includes('SHIFT') ||
                        nameUpper.includes('DIFFERENTIAL') || nameUpper.includes('NIGHT') ||
                        nameUpper.includes('WEEKEND') || codeUpper.includes('COMM') ||
                        nameUpper.includes('COMMISSION') || codeUpper.includes('PROD') ||
                        nameUpper.includes('PRODUCTION') || nameUpper.includes('PERFORMANCE') ||
                        (nameUpper.includes('BONUS') && !nameUpper.includes('DISCRETIONARY')) ||
                        nameUpper.includes('ATTENDANCE') || nameUpper.includes('SAFETY') ||
                        codeUpper.includes('HAZ') || nameUpper.includes('HAZARD')) {
                        autoIncluded.push({
                            ...code,
                            reason: 'Compensation for hours worked - included in FLSA weighted average'
                        });
                    }
                    // Auto-exclude: PTO, overtime premiums, reimbursements, benefits
                    else if (codeUpper.includes('VAC') || codeUpper.includes('SICK') || 
                             codeUpper.includes('HOL') || codeUpper.includes('OT') || 
                             codeUpper.includes('FMLA') || codeUpper.includes('PTO') ||
                             nameUpper.includes('VACATION') || nameUpper.includes('SICK') ||
                             nameUpper.includes('HOLIDAY') || nameUpper.includes('OVERTIME') ||
                             nameUpper.includes('TIME OFF') || nameUpper.includes('LEAVE') ||
                             nameUpper.includes('REIMBURS') || nameUpper.includes('EXPENSE') ||
                             nameUpper.includes('ALLOWANCE') || nameUpper.includes('PER DIEM') ||
                             nameUpper.includes('INSURANCE') || nameUpper.includes('401K') ||
                             nameUpper.includes('RETIREMENT') || nameUpper.includes('PENSION') ||
                             nameUpper.includes('DISCRETIONARY') || nameUpper.includes('GIFT') ||
                             nameUpper.includes('AWARD') || nameUpper.includes('REFERRAL') ||
                             codeUpper.includes('MEAL') || codeUpper.includes('TRAVEL')) {
                        autoExcluded.push({
                            ...code,
                            reason: 'PTO, premiums, or reimbursements - excluded from FLSA calculations'
                        });
                    }
                    // Move all remaining codes to appropriate categories based on FLSA rules
                    else {
                        // Additional classification based on common patterns
                        if (nameUpper.includes('PAY') || nameUpper.includes('WAGE') ||
                            nameUpper.includes('SALARY') || nameUpper.includes('RATE')) {
                            autoIncluded.push({
                                ...code,
                                reason: 'Appears to be regular compensation - included in FLSA'
                            });
                        } else {
                            autoExcluded.push({
                                ...code,
                                reason: 'No clear compensation indicators - excluded by default'
                            });
                        }
                    }
                });

                // Return with empty needsInput array since we've classified everything
                return { autoIncluded, autoExcluded, needsInput: [] };
            }


function showThresholdsConfiguration() {
                rateConfigurationState.currentSubStep = 5;

                // Update progress: completed special tax treatment (step 4)
                if (window.progressManager) {
                    window.progressManager.updateProgress(4);
                }

                // Update header status
                const headerStatus = document.getElementById('headerStatus');
                if (headerStatus) {
                    headerStatus.textContent = 'Step 6 of 7: Min/Max Thresholds (5 of 5)';
                }

                // Update panel header
                const panelHeader = document.querySelector('.panel-header h2');
                const panelSubtitle = document.querySelector('.panel-subtitle');
                if (panelHeader) {
                    panelHeader.textContent = 'Minimum/Maximum Thresholds';
                }
                if (panelSubtitle) {
                    panelSubtitle.innerHTML = 'Configure dollar limits for earning codes per pay period';
                }

                // Simulate document extraction and show panel
                const extractedData = simulateThresholdExtraction();
    showThresholdExtractionPanel();


               
            }
            
        // === W-2 ACTIONS ===
        case 'explain-w2-boxes':
            message = 'Explain W-2 boxes';
            response = {
                text: '<strong>W-2 Form Boxes Explained:</strong>\n\n• <strong>Box 1</strong> - Total wages, tips, and compensation\n• <strong>Box 3</strong> - Social Security wages (may differ from Box 1)\n• <strong>Box 5</strong> - Medicare wages and tips\n• <strong>Box 12</strong> - Special codes (401k, insurance, etc.)\n• <strong>Box 14</strong> - Other compensation\n\nYour earning codes are automatically assigned to the correct boxes based on their tax treatment.',
                pills: [
                    { action: 'adjust-w2-reporting', text: 'Adjust reporting settings' },
                    { action: 'finalize-complete-setup', text: 'Configure these earning codes now' }
                ]
            };
            break;

        case 'adjust-w2-reporting':
            message = 'Adjust reporting settings';
            response = {
                text: 'Which code do you like to change?',
                pills: [
                  
                    { action: 'finalize-complete-setup', text: 'Look good, configure these earning codes' }
                ]
            };
            break;



        case 'finalize-complete-setup':
            message = 'Complete setup';
            addMessage(message, 'user');

            if (window.progressManager) {
                window.progressManager.updateProgress(3);
            }

            
            setTimeout(() => {
                completePayrollSetup();
            }, 1000);
            return;


        case 'start-over':
            message = 'Start New Configuration';
            response = 'Are you sure you want to start a completely new payroll configuration? This will reset all current settings.';
            break;

        // === EXISTING WORKING CASES (Keep these) ===
         
        case 'continue-to-recommendations':
            message = 'Next step';
            addMessage(message, 'user');

            // Calculate actual approved codes count
            const actualApprovedCount = earningCodes.filter(code => code.reviewed === true).length;
            const totalCodes = earningCodes.length;
            const actualApprovalRate = (actualApprovedCount / totalCodes) * 100;
            
            // Show typing indicator for all scenarios
            showTypingIndicator();
            
            if (actualApprovedCount === 0) {
                // No codes approved - special handling
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`No earning codes are currently approved for configuration. You need to approve at least some codes before proceeding.\n\nPlease <strong>review and confirm</strong> the codes you want to configure, and choose one of the options below:`, 'ai', [
                        { action: 'codes-confirmed-continue', text: 'Confirm all codes & continue' },
                        { action: 'codes-confirmed-continue', text: 'Codes are confirmed & continue' },
                        { action: '', text: 'Skip to another setup' },
                       
                    ]);
                }, 1000);
                return;
            } else if (actualApprovedCount < 10) {
                // Low approval count - ask for confirmation (THIS IS THE <10 CODES WORKFLOW)
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`Only ${actualApprovedCount} of ${totalCodes} earning codes are currently approved for configuration. Is that right?`, 'ai', [
                        { action: 'codes-confirmed-continue', text: `Yes, only configure ${actualApprovedCount} code${actualApprovedCount === 1 ? '' : 's'}` },
                        { action: 'auto-approve-all-codes', text: 'Approve all and continue to next step' }
                    ]);
                }, 1000);
                return;
            }
            
            // If we get here, there are 10 or more approved codes - show recommendations
            setTimeout(() => {
                // Show spinner in right panel immediately
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">${CONSTANTS.MESSAGES.LOADING} recommendations...</div>
                            <div class="loading-subtext">Analyzing your earning codes</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    const summaryText = `Great! I've confirmed your ${actualApprovedCount} earning codes.\n\n` +
                            `I've analyzed your earning codes and have ${aiSuggestions.length} recommendations to optimize your setup:\n\n` +
                            '<strong>• Consolidate duplicate codes</strong> - Merge similar overtime codes to reduce complexity\n' +
                            '<strong>• Remove unused codes</strong> - Clean up codes that aren\'t needed\n\n' +
                            'These changes will simplify your payroll processing and reduce errors.\n\n' +
                            'Have you reviewed your recommendations and decided which ones to apply?';

                    removeTypingIndicator();
                    addMessage(summaryText, 'ai', [
                        { action: 'recommendations-reviewed-continue', text: 'Recommendation reviewed, next step', buttonType: 'primary' },
                        { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });

                    // Show the AI suggestions panel
                    setTimeout(() => {
                        showAISuggestions();
                    }, 1500);
                }, 2000);
            }, 1000);
            break;



// ========================================
// EARNING CODES STATISTICS & MANAGEMENT FUNCTIONS
// ========================================

// Calculate earning codes statistics
function calculateEarningCodesStats() {
    const activeEarningCodes = earningCodes.filter(code => !code.deleted);
    const deletedEarningCodes = earningCodes.filter(code => code.deleted);
    
    const approvedCount = activeEarningCodes.filter(code => code.reviewed === true).length;
    const deletedCount = deletedEarningCodes.length;
    const totalCount = earningCodes.length;
    const activeCount = activeEarningCodes.length;
    
    const approvalRate = activeCount > 0 ? (approvedCount / activeCount) * 100 : 0;
    
    return {
        approved: approvedCount,
        deleted: deletedCount,
        total: totalCount,
        active: activeCount,
        approvalRate: Math.round(approvalRate)
    };
}

            // Normal flow - sufficient approval rate
            // Show spinner in right panel immediately
            const recPanelContent = document.querySelector('.panel-content');
            if (recPanelContent) {
                recPanelContent.innerHTML = `
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <div class="loading-text">${CONSTANTS.MESSAGES.LOADING} recommendations...</div>
                        <div class="loading-subtext">Analyzing your earning codes</div>
                    </div>
                `;
            }

          case 'skip-suggestions':
            message = 'Skip all recommendations';
            addMessage(message, 'user');

            setTimeout(() => {
                startRateConfigurationWorkflow();
            }, 1000);
            return;

            case 'yes-configure-few-codes':
            // Calculate the actual approved count for the message
            const actualApprovedForMessage = earningCodes.filter(code => code.reviewed === true).length;
            message = `Yes, only configure ${actualApprovedForMessage} code${actualApprovedForMessage === 1 ? '' : 's'}`;
            addMessage(message, 'user');

            // Show typing indicator
            showTypingIndicator();

            // Continue with the limited codes
            setTimeout(() => {
                // Show spinner in right panel immediately
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">${CONSTANTS.MESSAGES.LOADING} recommendations...</div>
                            <div class="loading-subtext">Analyzing your earning codes</div>
                        </div>
                    `;
                }

                setTimeout(function() {
                    const totalCount = earningCodes.length;
                    const approvedCount = actualApprovedForMessage;

                    const summaryText = `I've analyzed your ${totalCount} earning codes and have ${aiSuggestions.length} recommendations to optimize your setup:\n\n` +
                            '<strong>• Consolidate duplicate codes</strong> - Merge similar overtime codes to reduce complexity\n' +
                            '<strong>• Remove unused codes</strong> - Clean up codes that aren\'t needed\n\n' +
                            `${approvedCount} code${approvedCount === 1 ? '' : 's'} will be configured based on your selection.`;

                    removeTypingIndicator();
                    addMessage(summaryText, 'ai', [
                        { action: 'continue-to-pay-method', text: 'recommendations are reviewed, continue', buttonType: 'primary' },
                        { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });

                    setTimeout(function() {
                        showAISuggestions();
                    }, 1500);
                }, 1000);
            }, 1000);
            return;

           
            case 'use-approved-codes-continue':
            message = 'Use approved codes & continue';
            addMessage(message, 'user');

            setTimeout(() => {
                startRateConfigurationWorkflow();
            }, 1000);
            return;

        
            
            case 'recommendations-reviewed-continue':
            message = 'Recommendation reviewed, next step';
            addMessage(message, 'user');

            // Update progress: completed review codes & suggestions (step 1)
            if (window.progressManager) {
                window.progressManager.updateProgress(1);
                console.log('✅ Completed review codes & suggestions step');
            }

            // Show pay statement display question after recommendations
            setTimeout(() => {
                showPayStatementDisplayOptions();
            }, 1000);
            return;
            
            case 'continue-to-rate-config':
            message = 'Continue to Rate Configuration';
            addMessage(message, 'user');

            setTimeout(() => {
                showPayCalculationMethodStep();
            }, 1000);
            return;
            
        case 'continue-to-pay-method':
        message = 'recommendations are reviewed, continue';
        addMessage(message, 'user');

        setTimeout(() => {
            startRateConfigurationWorkflow();
        }, 1000);
        return;

            

      
        case 'continue-to-w2-preview':
            message = 'Show W-2 Preview';
            addMessage(message, 'user');
            break;
            
        case 'preview-w2-form':
            message = 'Preview W-2';
            addMessage(message, 'user');

            if (window.progressManager) {
                window.progressManager.updateProgress(2);
                console.log('✅ Completed rate configuration step');
            }
            
            setTimeout(() => {
                finalizeConfiguration();
            }, 1000);
            return;

        case 'approve-all':
        case 'looks-good':
            updatePanelContent('loading', {
                loadingText: 'Generating payroll calendar...',
                subText: 'Processing schedules and holiday adjustments'
            });
            response = {
                text: `${CONSTANTS.MESSAGES.PERFECT} The schedule information is confirmed. I\'ve generated a calendar showing your payroll timeline:\n• <strong>Submit deadlines</strong> \n• <strong>Processing periods</strong> \n• <strong>Employee pay dates</strong> (with automatic weekend/holiday adjustments)\n\nReview the calendar on the right to see your payroll schedule starting August 2025.\n\nOnce you\'ve explored the calendar, I\'ll configure these schedules.`,
            pills: [
                { action: 'continue-earning-codes', text: 'Configure Pay Schedules', buttonType: 'primary' },
                { action: 'view-semi-monthly', text: 'Focus on Semi-Monthly', buttonType: 'secondary' },
                { action: 'view-weekly', text: 'Focus on Weekly', buttonType: 'secondary' }
            ],
            style: 'two-tier-interactive'};
            rightPanelAction = () => {
                setTimeout(() => {
                    approveAllSchedules();
                    showCalendarSimulation();
                }, 1000);
            };
            break;

        case 'continue-earning-codes':
        addMessage(message, 'user');

        // COMPLETE the pay-schedule workflow first (trigger celebration)
        if (window.progressManager && !window.welcomeState) {
            // Only attempt progress updates if not in welcome flow
            setTimeout(() => {
                // First enter the workflow if not already in it
                if (!window.progressManager.isActive || window.progressManager.currentSection !== 'pay-schedule') {
                    window.progressManager.enterWorkflow('pay-schedule', 0);
                }
                // Only update progress if we successfully entered the workflow
                if (window.progressManager.isActive && window.progressManager.currentSection === 'pay-schedule') {
                    window.progressManager.updateProgress(1); // triggers rainbow celebration
                }
            }, 500);
        } else if (window.welcomeState) {
            console.log('✅ Completed pay schedule workflow - triggering celebration (welcome flow mode, skipping progress update)');
        }

        // Collapse conversation history
        setTimeout(() => {
            collapseConversationHistory("Pay schedule configuration threads");
        }, 1000);

        // Create process card for pay schedule configuration
        // Always create the pay schedule configuration process card when entering this workflow
        setTimeout(() => {
            const processCard = createProcessCard({
                title: 'Pay schedule configuration',
                description: 'Setting up your payroll schedules...',
                status: 'processing',
                timestamp: 'Just started',
                id: 'pay-schedule-config'
            });
            
            addMessage(processCard, 'ai');
        }, 2000);

        // Set flag to indicate we're in earning codes workflow
        window.isInEarningCodesWorkflow = true;
        
        // Slide in the right panel when entering earning codes section
        setTimeout(() => {
            const tablePanel = document.getElementById('tablePanel');
            const chatPanel = document.getElementById('chatPanel');
            
            if (tablePanel) {
                // Ensure panel is visible
                tablePanel.classList.remove('panel-hidden');
                tablePanel.classList.remove('hidden');
                tablePanel.style.display = 'block';
                tablePanel.style.opacity = '1';
                
                // Update chat panel layout
                if (chatPanel) {
                    chatPanel.classList.remove('centered-company-mode');
                    chatPanel.classList.add('split-mode');
                }
                
                // Animate it in
                gsap.fromTo(tablePanel, 
                    { x: 400, opacity: 0 }, // Start off-screen
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    }
                );
            }
        }, 1500); // Delay to happen after conversation collapse

        // Show right panel content after panel slides in
        setTimeout(() => {
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.innerHTML = `
                        <div class="loading-container">
                            <div class="spinner"></div>
                            <div class="loading-text">${CONSTANTS.MESSAGES.LOADING} earning codes...</div>
                            <div class="loading-subtext">Analyzing code assessments</div>
                        </div>
                    `;
                }

                setTimeout(() => {
                    currentStep = 3;
                    showEarningCodesReview({ showMessage: true });

                    if (window.progressManager) {
                        window.progressManager.enterWorkflow('earnings-code', 0);
                    }

                    removeTypingIndicator();
                    // Message is already shown by showEarningCodesReview when showMessage: true
                }, 2000);
            }, 2500); // Show content after panel slides in

        // Update process card after 30 seconds
        setTimeout(() => {
            updateProcessCard('pay-schedule-config', {
                status: 'complete',
                description: 'Pay schedules successfully configured',
                timestamp: '30 seconds ago'
            });
        }, 30000);

        return;


        case 'modify-timeline':
            message = 'Modify timeline dates';
            addMessage(message, 'user');
setTimeout(() => {
    addMessage('You can adjust your timeline dates. Which dates would you like to modify?', 'ai', [
        { action: 'change-launch-date', text: 'Change launch date', buttonType: 'primary' },
        { action: 'keep-timeline', text: 'Keep current timeline', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
}, 1000);
return;

        
        case 'change-launch-date':
            message = 'Change launch date';
            addMessage(message, 'user');
            setTimeout(() => {
                chatDatePickerShow('What would you like your new launch date to be? I\'ll adjust all the deadlines accordingly.', function(selectedDate) {
                    // Handle the selected date
                    const formattedDate = selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Update the wizard state if it exists
                    if (newWizardState && newWizardState.userData) {
                        newWizardState.userData.startDate = selectedDate.toISOString().split('T')[0];
                    }

                    // Start the timeline recalculation process with AI thinking
                    setTimeout(() => {
                        handleTimelineRecalculation(selectedDate);
                    }, 1000);

                    // Continue conversation after recalculation is complete
                    setTimeout(() => {
                        removeTypingIndicator();
                      addMessage(`${CONSTANTS.MESSAGES.PERFECT} I've updated your launch date to ${formattedDate}. All timeline deadlines have been adjusted accordingly.\n\nYour updated timeline is now ready. Ready to continue?`, 'ai', [
    { action: 'upload-documents', text: 'Upload documents (recommended)', buttonType: 'primary' },
    { action: 'start-schedule-setup', text: 'Skip and configure manually', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
                    }, 6000); // Show message after AI thinking completes
                });
            }, 1000);
            return;

        case 'keep-timeline':
            message = 'Keep current timeline';
            addMessage(message, 'user');
            setTimeout(() => {
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} Your timeline stays as planned. Ready to continue with pay schedule setup?`, 'ai', [
                    { action: 'start-schedule-setup', text: 'Start pay schedule setup', buttonType: 'primary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
            return;

    }

    // Add user message immediately (pills are already gone)
    if (message) {
        addMessage(message, 'user');
    }

    // Add AI response after a delay
    if (response) {
        setTimeout(() => {
            if (typeof response === 'object' && response !== null) {
                addMessage(response.text, 'ai', response.pills);
            } else {
                addMessage(response, 'ai');
            }

            // Execute right panel action if defined
            if (rightPanelAction && typeof rightPanelAction === 'function') {
                rightPanelAction();
            }
        }, 1000);

    }
}



// ========================================
// WORKFLOW-SPECIFIC PILL HANDLERS
// ========================================

function handleWizardPill(action) {
    switch (action) {
        case 'modify-timeline':
            return handlePillClick_Original('modify-timeline');
        case 'view-full-timeline':
            return handlePillClick_Original('view-full-timeline');
        case 'change-launch-date':
            return handlePillClick_Original('change-launch-date');
        case 'keep-timeline':
            return handlePillClick_Original('keep-timeline');
        default:
            console.log('Unhandled wizard action:', action);
            return null;
    }
}

function handleSchedulePill(action) {
    switch (action) {
        case 'change-semi-name':
            return handlePillClick_Original('change-semi-name');
        case 'change-semi-first-pay-date':
            return handlePillClick_Original('change-semi-first-pay-date');
        case 'change-semi-weekend-rules':
            return handlePillClick_Original('change-semi-weekend-rules');
        case 'change-semi-holiday-rules':
            return handlePillClick_Original('change-semi-holiday-rules');
        case 'change-weekly-name':
            return handlePillClick_Original('change-weekly-name');
        case 'change-weekly-first-pay-date':
            return handlePillClick_Original('change-weekly-first-pay-date');
        case 'change-weekly-weekend-rules':
            return handlePillClick_Original('change-weekly-weekend-rules');
        case 'change-weekly-holiday-rules':
            return handlePillClick_Original('change-weekly-holiday-rules');
        case 'set-semi-weekend-previous-friday':
        case 'set-semi-weekend-following-monday':
        case 'set-weekly-weekend-previous-friday':
        case 'set-weekly-weekend-following-monday':
        case 'set-semi-holiday-business-before':
        case 'set-semi-holiday-business-after':
        case 'set-semi-holiday-closest-business':
        case 'set-weekly-holiday-business-before':
        case 'set-weekly-holiday-business-after':
        case 'set-weekly-holiday-closest-business':
            return handlePillClick_Original(action);
        case 'add-new':
        case 'bi-weekly':
        case 'monthly':
        case 'quarterly':
        case 'edit-schedule':
        case 'edit-semi-monthly':
        case 'edit-weekly':
            return handlePillClick_Original(action);
        case 'looks-good':
        case 'approve-all':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled schedule action:', action);
            return null;
    }
}

function handleCompanyPill(action) {
    switch (action) {
        case 'confirm-company-info':
        case 'make-corrections':
        case 'edit-company-info':
        case 'add-new-ein':
        case 'edit-company-name':
        case 'edit-address':
        case 'edit-ein':
        case 'continue-to-schedules':
        case 'review-company-info':
        case 'next-step-confirm':
        case 'done-for-day':
        case 'what-if-info-wrong':
        case 'how-to-add-multiple-companies':
        case 'edit-done':
        case 'show-company-setup-overview':
        case 'where-find-ein':
        case 'bank-security-info':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled company action:', action);
            return null;
    }
}

function handleDocumentPill(action) {
    switch (action) {
        case 'upload-documents':
        case 'why-upload-documents':
        case 'skip-document-upload':
        case 'explain-document-benefits':
        case 'vendor-adp':
        case 'vendor-gusto':
        case 'vendor-quickbooks':
        case 'vendor-paychex':
        case 'vendor-paycom':
        case 'vendor-other':
        case 'vendor-manual':
        case 'skip-vendor-question':
        case 'proceed-to-upload':
        case 'do-it-later':
        case 'complete-document-upload':
        case 'skip-to-company-config':
        case 'continue-setup-later':
        case 'save-and-exit':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled document action:', action);
            return null;
    }
}

function handleEarningCodesPill(action) {
    switch (action) {
        case 'continue-earning-codes':
        case 'explain-assessments':
        case 'review-yellow-codes':
        case 'approve-all-remaining':
        case 'review-all-together':
        case 'continue-to-recommendations':
        case 'skip-to-deduction-codes':
        case 'skip-to-tax-configuration':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled earning codes action:', action);
            return null;
    }
}

function handleSuggestionsPill(action) {
    switch (action) {
        case 'accept-all-suggestions':
        case 'explain-suggestions':
        case 'skip-suggestions':
        case 'move-to-rate-configuration':
        case 'continue-to-rate-config':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled suggestions action:', action);
            return null;
    }
}

function handleRateConfigPill(action) {
    switch (action) {
        case 'set-standard-rates':
        case 'continue-to-w2-preview':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled rate config action:', action);
            return null;
    }
}

function handleW2Pill(action) {
    switch (action) {
        case 'explain-w2-boxes':
        case 'adjust-w2-reporting':
        case 'finalize-complete-setup':
        case 'back-to-rate-config':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled W2 action:', action);
            return null;
    }
}

function handleGeneralPill(action) {
    switch (action) {
        case 'start-over':
        case 'view-semi-monthly':
        case 'view-weekly':
            return handlePillClick_Original(action);
        default:
            console.log('Unhandled general action:', action);
            return null;
    }
}

// ========================================
// DATE & CALENDAR FUNCTIONS
// ========================================

// ========================================
// UI HELPER FUNCTIONS
// ========================================

// DOM Element Cache

const DOM = {
    messagesContainer: null,
    panelContent: null,
    panelHeader: null,
    panelSubtitle: null,
    messageInput: null,
    chatInput: null,
    chatPanel: null,
    tablePanel: null,

    // Initialize DOM cache after page loads
    init() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.panelContent = document.querySelector('.panel-content');
        this.panelHeader = document.querySelector('.panel-header h2');
        this.panelSubtitle = document.querySelector('.panel-subtitle');
        this.messageInput = document.getElementById('messageInput');
        this.chatInput = document.querySelector('.chat-input');
        this.chatPanel = document.getElementById('chatPanel');
        this.tablePanel = document.getElementById('tablePanel');
    }
};





// Company information extracted from documents (PROTOTYPE - FAKE DATA)
let extractedCompanyInfo = {
    legalName: "",
    address: "",
    ein: "",
    sourceDocument: "",
    documentType: "",
    isConfirmed: false
};

// Company info editing state
// Company info editing state
window.waitingForCompanyNameInput = false;
window.waitingForAddressInput = false;
window.waitingForEINInput = false;

// ========================================
// UNIFIED INPUT HANDLER CONFIGURATION
// ========================================

// Validation functions for earning codes
function validateEarningName(value) {
    return value.trim().length >= 2;
}

function validateEarningCode(value) {
    return /^[A-Z0-9_]{2,10}$/.test(value.trim().toUpperCase());
}

// Input handler configuration - Complete version for all input types
const inputHandlers = {
    semiMonthlyName: {
        flagName: 'waitingForSemiMonthlyNameInput',
        validate: (value) => value.trim().length >= 2,
        errorMessage: 'Please enter a valid schedule name (at least 2 characters).',
        onSuccess: (value) => {
            updateScheduleField('semi-monthly', 'name', value.trim());
            setTimeout(() => {
                addMessage(`✅ Semi-Monthly schedule name updated to: <strong>${value.trim()}</strong>\n\nWhat else would you like to modify?`, 'ai', [
                    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                    { action: 'change-semi-first-pay-date', text: 'Change first pay date', buttonType: 'secondary' },
                    { action: 'change-semi-weekend-rules', text: 'Change weekend rules', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
        }
    },

    weeklyName: {
        flagName: 'waitingForWeeklyNameInput',
        validate: (value) => value.trim().length >= 2,
        errorMessage: 'Please enter a valid schedule name (at least 2 characters).',
        onSuccess: (value) => {
            updateScheduleField('weekly', 'name', value.trim());
            setTimeout(() => {
                addMessage(`✅ Weekly schedule name updated to: <strong>${value.trim()}</strong>\n\nWhat else would you like to modify?`, 'ai', [
                    { action: 'looks-good', text: 'Looks good, continue', buttonType: 'primary' },
                    { action: 'change-weekly-first-pay-date', text: 'Change first pay date', buttonType: 'secondary' },
                    { action: 'change-weekly-weekend-rules', text: 'Change weekend rules', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
            }, 1000);
        }
    },

    companyName: {
        flagName: 'waitingForCompanyNameInput',
        validate: (value) => value.trim().length >= 2,
        errorMessage: 'Please enter a valid company name (at least 2 characters).',
        onSuccess: (value) => {
            updateDisplayField('LegalName', value.trim());
            setTimeout(() => {
               addMessage(`✅ Company name updated to: <strong>${value.trim()}</strong>\n\nAnything else you'd like to correct?`, 'ai', [
    { action: 'confirm-company-info', text: 'Confirm all information', buttonType: 'primary' },
    { action: 'edit-address', text: 'Edit address', buttonType: 'secondary' },
    { action: 'edit-ein', text: 'Edit EIN', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
            }, 1000);
        }
    },

    address: {
        flagName: 'waitingForAddressInput',
        validate: (value) => value.trim().length >= 10,
        errorMessage: 'Please enter a complete address (at least 10 characters).',
        onSuccess: (value) => {
            updateDisplayField('Address', value.trim());
            setTimeout(() => {
                addMessage(`✅ Address updated to: <strong>${value.trim()}</strong>\n\nAnything else you'd like to correct?`, 'ai', [
    { action: 'confirm-company-info', text: 'Confirm all information', buttonType: 'primary' },
    { action: 'edit-company-name', text: 'Edit company name', buttonType: 'secondary' },
    { action: 'edit-ein', text: 'Edit EIN', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
            }, 1000);
        }
    },

    ein: {
        flagName: 'waitingForEINInput',
        validate: (value) => /^\d{2}-\d{7}$/.test(value.trim()),
        errorMessage: 'Please enter a valid EIN in the format: XX-XXXXXXX (e.g., 12-3456789)',
        onSuccess: (value) => {
            updateDisplayField('EIN', value.trim());
            setTimeout(() => {
               addMessage(`✅ EIN updated to: <strong>${value.trim()}</strong>\n\nAnything else you'd like to correct?`, 'ai', [
    { action: 'confirm-company-info', text: 'Confirm all information', buttonType: 'primary' },
    { action: 'edit-company-name', text: 'Edit company name', buttonType: 'secondary' },
    { action: 'edit-address', text: 'Edit address', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
            }, 1000);
        }
    },

    earningCodeDescription: {
        flagName: 'waitingForEarningCodeDescription',
        validate: (value) => value.trim().length >= 3,
        errorMessage: 'Please provide a more detailed description (at least 3 characters).',
        onSuccess: (value) => {
            setTimeout(() => {
                handleEarningCodeDescription(value.trim());
            }, 1000);
        }
    },

    earningCodeName: {
        flagName: 'waitingForEarningCodeName',
        validate: validateEarningName,
        errorMessage: 'Please enter a valid name (at least 2 characters).',
        onSuccess: (value) => {
            earningCodeCreationState.userName = value.trim();
            setTimeout(() => {
                confirmEarningCodeCreation();
            }, 1000);
        }
    },

    earningCodeCode: {
        flagName: 'waitingForEarningCodeCode',
        validate: validateEarningCode,
        errorMessage: 'Please enter a valid code (2-10 characters, uppercase letters/numbers/underscores only).',
        transform: (value) => value.trim().toUpperCase(),
        onSuccess: (value) => {
            earningCodeCreationState.userCode = value;
            setTimeout(() => {
                confirmEarningCodeCreation();
            }, 1000);
        }
    }
};

// Unified input processor
function processUnifiedInput(message) {
    // Find which input handler is currently active
    for (const [handlerName, config] of Object.entries(inputHandlers)) {
        if (window[config.flagName]) {
            // Reset the flag
            window[config.flagName] = false;

            // Transform the value if needed
            const processedValue = config.transform ? config.transform(message) : message.trim();

            // Validate the input
            if (!config.validate(processedValue)) {
                addMessage(config.errorMessage, 'ai');
                window[config.flagName] = true; // Reset flag to keep waiting
                return true; // Input was handled
            }

            // Add user message to show what they typed (only if not already added by welcome flow)
            if (!window.welcomeState || !window.welcomeState.waitingForTextResponse) {
                addMessage(processedValue, 'user');
            }

            // Execute success handler
            config.onSuccess(processedValue);
            return true; // Input was handled
        }
    }

    return false; // No input handler was active
}

// Shared company data (used by both normal flow and EIN shortcut)
const SHARED_COMPANY_DATA = {
    default: {
        legalName: "Acme Corporation Inc.",
        address: "1234 Business Ave, Suite 500, Chicago, IL 60601",
        ein: "12-3456789",
        sourceDocument: "Employee_Handbook_2024.pdf",
        documentType: "Employee Handbook"
    },
    alternatives: {
        handbook: {
            legalName: "Acme Corporation Inc.",
            address: "1234 Business Ave, Suite 500, Chicago, IL 60601",
            ein: "12-3456789",
            sourceDocument: "Employee_Handbook_2024.pdf",
            documentType: "Employee Handbook"
        },
        payroll: {
            legalName: "ACME CORP INC",
            address: "1234 Business Avenue, Chicago, IL 60601",
            ein: "12-3456789",
            sourceDocument: "Payroll_Report_Q2_2024.xlsx",
            documentType: "Payroll Report"
        }
    }
};

// Earning codes data - Updated with statistics tracking
const earningCodes = [
    { code: "REG", name: "Regular Pay", description: "Standard hourly or salaried earnings for regular work.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "OT1-ENG", name: "OT1 Engineer (1.5x)", description: "Overtime for engineers at 1.5 times the regular hourly rate.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "OT2-ENG", name: "OT2 Engineer (2x)", description: "Overtime for engineers at 2 times the regular hourly rate.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "OT1-CC", name: "OT1 Call Center (1.5x)", description: "Overtime for call center staff at 1.5 times the regular hourly rate.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "OT2-CC", name: "OT2 Call Center (2x)", description: "Overtime for call center staff at 2 times the regular hourly rate.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "DT", name: "Double Time", description: "Overtime paid at double the regular rate (if not using OT2).", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "HOL", name: "Holiday Pay", description: "Earnings for work performed on recognized holidays.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "VAC", name: "Vacation", description: "Paid time off for vacation days taken.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "SICK", name: "Sick Pay", description: "Paid time off for illness or medical appointments.", assessment: "confident", reviewed: false, editMode: false, deleted: false },
    { code: "BRVMT", name: "Bereavement", description: "Paid leave for bereavement/funeral purposes.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "JURY", name: "Jury Duty", description: "Paid leave for jury service.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "FMLA", name: "Family Leave", description: "Paid leave under the Family and Medical Leave Act.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "BON", name: "Bonus", description: "Lump sum incentive or performance-based bonus.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "COMM", name: "Commission", description: "Earnings based on sales or performance targets.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "SHFT", name: "Shift Differential", description: "Additional pay for working less desirable shifts.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "LEAD", name: "Lead Differential", description: "Extra pay for assuming lead responsibilities.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "HAZ", name: "Hazard Pay", description: "Compensation for working in hazardous conditions.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "STDBY", name: "Standby/On-Call", description: "Pay for being available to work outside normal hours.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "CALLB", name: "Call-Back Pay", description: "Pay for being called back to work after regular hours.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "RETRO", name: "Retroactive Pay", description: "Adjustments for pay changes applied to prior periods.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "ADJ", name: "Adjustment", description: "Miscellaneous payroll adjustments.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "SEV", name: "Severance", description: "Pay provided upon termination of employment.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "MIL", name: "Military Leave", description: "Paid leave for military service.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "TRVL", name: "Travel Pay", description: "Compensation for travel time.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "EDU", name: "Education Pay", description: "Earnings for attending training or educational events.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    
    { code: "CAR", name: "Car Allowance", description: "Stipend for use of personal vehicle for business.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "RELO", name: "Relocation", description: "Reimbursement for moving expenses.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "AWARD", name: "Award Pay", description: "Monetary awards for special achievements.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "PERSL", name: "Personal Leave", description: "Paid personal leave days.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "COMP", name: "Comp Time Earned", description: "Compensatory time earned for overtime worked.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "COMPT", name: "Comp Time Taken", description: "Compensatory time taken as paid leave.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "HOLWK", name: "Holiday Worked", description: "Premium pay for working on a holiday.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "LON", name: "Longevity Pay", description: "Additional pay for extended service.", assessment: "review", reviewed: false, editMode: false, deleted: false },
    { code: "MISC", name: "", description: "", assessment: "missing", reviewed: false, editMode: false, deleted: false }
];

// Sample data
const schedules = [
    {
        id: 1,
        name: "Semi-Monthly",
        frequency: "24 pay periods/year",
        payDate: "15th and last day",
        hours: "80 hours",
        approved: false
    },
    {
        id: 2,
        name: "Weekly",
        frequency: "52 pay periods/year",
        payDate: "Every Friday",
        hours: "40 hours",
        approved: false
    }
];

// AI Suggestions data

const aiSuggestions = [
    {
        id: 1,
        title: "Merge Engineer and Call Center Overtime 1.5x",
        description: "Combine OT1-ENG and OT1-CC into a single overtime code for 1.5x rate to reduce complexity.",
        impact: "Simplifies payroll processing and reduces code maintenance overhead",
        status: "pending",
        changes: {
            action: "merge",
            mergeFrom: ["OT1-ENG", "OT1-CC"],
            mergeTo: {
                code: "OT15",
                name: "Overtime 1.5x",
                description: "Overtime at 1.5 times the regular hourly rate for all departments"
            }
        }
    },
    {
        id: 2,
        title: "Merge Engineer and Call Center Overtime 2.0x", 
        description: "Combine OT2-ENG and OT2-CC into a single overtime code for 2.0x rate to standardize overtime policies.",
        impact: "Creates consistent overtime structure across all departments",
        status: "pending",
        changes: {
            action: "merge",
            mergeFrom: ["OT2-ENG", "OT2-CC"],
            mergeTo: {
                code: "OT20",
                name: "Overtime 2.0x", 
                description: "Overtime at 2.0 times the regular hourly rate for all departments"
            }
        }
    },
    {
        id: 3,
        title: "Remove Redundant Double Time Code",
        description: "Remove the DT (Double Time) code since OT2 codes already handle 2.0x overtime rates.",
        impact: "Eliminates confusion and prevents duplicate overtime calculations",
        status: "pending",
        changes: {
            action: "remove",
            code: "DT",
            reason: "Redundant with OT2 codes that provide same 2.0x rate"
        }
    }
   
   
];
// ========================================
// GENERATE CHANGE LINES FUNCTION - ADD THIS NEW FUNCTION
// ========================================

function generateChangeLines(suggestion) {
    const changes = suggestion.changes;
    let changeHtml = '';

    switch (changes.action) {
        case 'merge':
            changeHtml = `
                <div class="change-line merge">
                    <div class="change-from">
                        ${changes.mergeFrom.map(code => `<span class="code-tag remove">${code}</span>`).join(' + ')}
                    </div>
                    <div class="change-arrow">→</div>
                    <div class="change-to">
                        <span class="code-tag add">${changes.mergeTo.code}</span>
                        <span class="change-details">"${changes.mergeTo.name}"</span>
                    </div>
                </div>
                <div class="change-description">${changes.mergeTo.description}</div>
            `;
            break;

        case 'remove':
            changeHtml = `
                <div class="change-line remove">
                    <span class="code-tag remove">${changes.code}</span>
                    <span class="change-action">will be removed</span>
                </div>
                <div class="change-reason">${changes.reason}</div>
            `;
            break;

        case 'rename':
            changeHtml = `
                <div class="change-line rename">
                    <div class="change-from">
                        <span class="code-tag remove">${changes.from.code}</span>
                        ${changes.from.name ? `<span class="change-details">"${changes.from.name}"</span>` : ''}
                    </div>
                    <div class="change-arrow">→</div>
                    <div class="change-to">
                        <span class="code-tag add">${changes.to.code}</span>
                        <span class="change-details">"${changes.to.name}"</span>
                    </div>
                </div>
                <div class="change-description">${changes.to.description}</div>
            `;
            break;

        default:
            changeHtml = '<div class="change-line">No specific changes defined</div>';
    }

    return changeHtml;
}

// ========================================
// NATURAL LANGUAGE COMMAND PARSER
// Three-tier system: Direct execution → Clarification → Chat fallback
// ========================================

// Command patterns with confidence scoring
const commandPatterns = [
    // HIGH CONFIDENCE - Direct execution (80%+)
    { 
        pattern: /(?:add|create|new|setup).*(?:biweekly|bi weekly|bi-weekly|every two weeks|2 weeks).*(?:schedule|payroll)/i,
        confidence: 95,
        action: 'bi-weekly',
        type: 'schedule'
    },
    { 
        pattern: /(?:add|create|new|setup).*(?:pay schedule|payroll).*(?:biweekly|bi weekly|bi-weekly|every two weeks|twice a month|2 weeks)/i,
        confidence: 95,
        action: 'bi-weekly',
        type: 'schedule'
    },
    { 
        pattern: /(?:create|add|new|setup).*(?:schedule|payroll).*(?:to pay|that pays).*(?:twice a month|every two weeks|biweekly|bi-weekly)/i,
        confidence: 95,
        action: 'bi-weekly',
        type: 'schedule'
    },
    { 
        pattern: /(?:add|create|new|setup).*weekly.*(?:schedule|payroll)?/i,
        confidence: 90,
        action: 'weekly',
        type: 'schedule'
    },
    { 
        pattern: /(?:add|create|new|setup).*monthly.*(?:schedule|payroll)?/i,
        confidence: 90,
        action: 'monthly',
        type: 'schedule'
    },
    { 
        pattern: /(?:add|create|new|setup).*(?:semi-monthly|semimonthly).*(?:schedule|payroll)?/i,
        confidence: 90,
        action: 'semi-monthly',
        type: 'schedule'
    },
    { 
        pattern: /(?:add|create|new|setup).*quarterly.*(?:schedule|payroll)?/i,
        confidence: 85,
        action: 'quarterly',
        type: 'schedule'
    },

    {
        pattern: /(?:add|create|new|setup).*(?:award|awards).*(?:(?:earning\s+)?code|earning)/i,
        confidence: 95,
        action: 'create-earning-code-for-award',
        type: 'earning_code'
    },
    {
        pattern: /(?:add|create|new|setup).*(?:(?:earning\s+)?code|earning).*(?:award|awards)/i,
        confidence: 95,
        action: 'create-earning-code-for-award',
        type: 'earning_code'
    },

    // MEDIUM CONFIDENCE - Ask for clarification (40-79%)
    { 
        pattern: /(?:add|create|new|setup).*(?:schedule|payroll)/i,
        confidence: 60,
        action: 'schedule-clarification',
        type: 'ambiguous'
    },
    { 
        pattern: /(?:add|create|new)(?:\s+(?:a|an|the))?\s*$/i,
        confidence: 50,
        action: 'general-clarification',
        type: 'ambiguous'
    },

    {
        pattern: /(?:add|create|new|setup).*(?:(?:earning\s+)?code|earning)/i,
        confidence: 75,  // Lower confidence so award patterns take priority
        action: 'create-general-earning-code',
        type: 'earning_code'
    },

    { 
        pattern: /(?:biweekly|bi-weekly|weekly|monthly|semi-monthly|quarterly)(?:\s+(?:schedule|payroll))?$/i,
        confidence: 55,
        action: 'type-only-clarification',
        type: 'ambiguous'
    }
];

// Parse natural language command
function parseNaturalLanguageCommand(message) {
    if (!message || message.trim().length < 3) {
        return null;
    }

    const cleanMessage = message.trim().toLowerCase();

    // Check all patterns and find the best match
    let bestMatch = null;
    let highestConfidence = 0;

    for (const commandPattern of commandPatterns) {
        if (commandPattern.pattern.test(cleanMessage)) {
            if (commandPattern.confidence > highestConfidence) {
                highestConfidence = commandPattern.confidence;
                bestMatch = commandPattern;
            }
        }
    }

    if (!bestMatch) {
        return null;
    }

    return {
        action: bestMatch.action,
        type: bestMatch.type,
        confidence: bestMatch.confidence,
        originalMessage: message
    };
}

// Execute detected command
function executeCommand(command) {
    const { action, confidence, originalMessage } = command;

    // Add user message first
    addMessage(originalMessage, 'user');

    if (confidence >= 80) {
        // HIGH CONFIDENCE - Direct execution
        executeDirectCommand(action);
    } else if (confidence >= 40) {
        // MEDIUM CONFIDENCE - Ask for clarification
        setTimeout(() => {
            showClarificationOptions(action, originalMessage);
        }, 1000);
    }
    // LOW CONFIDENCE cases return null and fall through to getAIResponse()
}

// Execute high-confidence commands directly
function executeDirectCommand(action) {
    console.log(`Executing direct command: ${action}`);

    setTimeout(() => {
        switch (action) {
            case 'bi-weekly':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} I'll set up a Bi-Weekly schedule for you right away!`, 'ai');
                setTimeout(() => {
                    // Update the right panel immediately
                    updatePanelContent('biweekly-placeholder');

                    // Ask for the name right away
                    addMessage('What would you like to name this bi-weekly pay schedule?', 'ai');
                    window.waitingForBiweeklyName = true;
                }, 1000);
                break;

            case 'weekly':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} Creating a Weekly schedule now!`, 'ai');
                setTimeout(() => {
                    handlePillClick('add-new');
                    // Then simulate clicking weekly option
                    setTimeout(() => {
                        handlePillClick('weekly');
                    }, 1000);
                }, 500);
                break;

            case 'monthly':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} Adding a Monthly schedule for you!`, 'ai');
                setTimeout(() => {
                    handlePillClick('monthly');
                }, 500);
                break;

            case 'semi-monthly':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} I'll configure a Semi-Monthly schedule!`, 'ai');
                setTimeout(() => {
                  addMessage('Semi-Monthly schedules pay employees twice per month (24 periods/year). This is already configured in your system!', 'ai', [
    { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly settings', buttonType: 'primary' },
    { action: 'add-new', text: 'Add different schedule type', buttonType: 'secondary' }
], {
    style: 'two-tier-interactive'
});
                }, 500);
                break;

            case 'quarterly':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} Setting up a Quarterly schedule!`, 'ai');
                setTimeout(() => {
                    handlePillClick('quarterly');
                }, 500);
                break;

            case 'create-earning-code-for-award':
                earningCodeCreationState.isActive = true;
                earningCodeCreationState.description = 'Employee awards';
                handleEarningCodeDescription('Employee awards');
                break;

            case 'create-general-earning-code':
                addMessage(`${CONSTANTS.MESSAGES.PERFECT} I'll help you create a new earning code!`, 'ai');
                setTimeout(() => {
                    startEarningCodeCreationWorkflow();
                }, 500);
                break;

            default:
                console.warn(`Unknown direct command: ${action}`);
                break;
        }
    }, 1000);
}

// Show clarification options for medium-confidence commands
function showClarificationOptions(action, originalMessage) {
    let clarificationMessage = '';
    let clarificationPills = [];

    switch (action) {
        case 'schedule-clarification':
            clarificationMessage = `I see you want to add a new schedule! Which type would you like to create?`;
            clarificationPills = [
                { action: 'bi-weekly', text: 'Bi-Weekly (26 periods/year)' },
                { action: 'weekly', text: 'Weekly (52 periods/year)' },
                { action: 'monthly', text: 'Monthly (12 periods/year)' },
                { action: 'semi-monthly', text: 'Semi-Monthly (24 periods/year)' },
                { action: 'quarterly', text: 'Quarterly (4 periods/year)' }
            ];
            break;

        case 'general-clarification':
            clarificationMessage = `I see you want to add something new. What would you like to add?`;
            clarificationPills = [
                { action: 'add-new', text: 'Add new schedule' },
                { action: 'continue-earning-codes', text: 'Add earning codes' },
                { action: 'add-employee', text: 'Add employee' }
            ];
            break;

        case 'type-only-clarification':
            // Extract the schedule type from original message
            const scheduleType = extractScheduleType(originalMessage);
            clarificationMessage = `I see you mentioned "${scheduleType}". What would you like to do with it?`;
            clarificationPills = [
                { action: getScheduleAction(scheduleType), text: `Add ${scheduleType} schedule` },
                { action: getEditAction(scheduleType), text: `Edit ${scheduleType} schedule` },
                { action: 'add-new', text: 'See all schedule options' }
            ];
            break;

        default:
            clarificationMessage = `I'm not sure exactly what you want to do. Can you be more specific?`;
            clarificationPills = [
                { action: 'add-new', text: 'Add new schedule' },
                { action: 'edit-schedule', text: 'Edit existing schedule' },
                { action: 'continue-earning-codes', text: 'Work on earning codes' }
            ];
            break;
    }

    addMessage(clarificationMessage, 'ai', clarificationPills);
}

// Helper function to extract schedule type from message
function extractScheduleType(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('biweekly') || lowerMessage.includes('bi-weekly')) {
        return 'Bi-Weekly';
    } else if (lowerMessage.includes('weekly')) {
        return 'Weekly';
    } else if (lowerMessage.includes('monthly')) {
        return 'Monthly';
    } else if (lowerMessage.includes('semi-monthly') || lowerMessage.includes('semimonthly')) {
        return 'Semi-Monthly';
    } else if (lowerMessage.includes('quarterly')) {
        return 'Quarterly';
    }

    return 'schedule';
}

// Helper function to get schedule action
function getScheduleAction(scheduleType) {
    const typeMap = {
        'Bi-Weekly': 'bi-weekly',
        'Weekly': 'weekly',
        'Monthly': 'monthly',
        'Semi-Monthly': 'semi-monthly',
        'Quarterly': 'quarterly'
    };

    return typeMap[scheduleType] || 'add-new';
}

// Helper function to get edit action
function getEditAction(scheduleType) {
    const editMap = {
        'Bi-Weekly': 'edit-biweekly',
        'Weekly': 'edit-weekly',
        'Monthly': 'edit-monthly',
        'Semi-Monthly': 'edit-semi-monthly',
        'Quarterly': 'edit-quarterly'
    };

    return editMap[scheduleType] || 'edit-schedule';
}

// CHAT DATE PICKER FUNCTIONALITY


// CHAT DATE PICKER FUNCTIONALITY

// Global state for chat date picker
let chatDatePickerState = {
    isActive: false,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    callback: null,
    originalPlaceholder: ''
};

function chatDatePickerShow(promptText, callback) {
    // Set the waiting state
    window.waitingForDateInput = true;
    chatDatePickerState.isActive = true;
    chatDatePickerState.callback = callback;

    // Reset to current month/year
    const today = new Date();
    chatDatePickerState.currentMonth = today.getMonth();
    chatDatePickerState.currentYear = today.getFullYear();
    chatDatePickerState.selectedDate = null;

    // Add AI message with prompt
    addMessage(promptText, 'ai');

    // Enhance input field (don't hide it)
    const chatInput = document.querySelector('.chat-input');
    const inputField = document.getElementById('messageInput');

    chatInput.classList.add('date-picker-active');

    // Store original placeholder and update it
    chatDatePickerState.originalPlaceholder = inputField.placeholder;
    inputField.placeholder = 'Type a date (e.g., "July 15, 2025") or use calendar below...';

    // Create and insert date picker
    const datePickerHtml = chatDatePickerCreateHTML();
    const datePickerContainer = document.createElement('div');
    datePickerContainer.innerHTML = datePickerHtml;
    datePickerContainer.className = 'chat-date-picker-message';

    // Insert before the input
    chatInput.parentNode.insertBefore(datePickerContainer, chatInput);

    // Generate calendar content
    chatDatePickerGenerateCalendar();

    // Scroll to show the picker
    // Scroll to show the start of the new message
    setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' // Shows the start of the message
            });
        }
    }, 100);
}

function chatDatePickerCreateHTML() {
    return `
        <div class="chat-date-picker-container" id="chatDatePicker">
            <div class="chat-date-picker-header">
                <h4 class="chat-date-picker-month" id="chatDatePickerMonth"></h4>
                <div class="chat-date-picker-nav-container">
                    <button class="chat-date-picker-nav" onclick="chatDatePickerChangeMonth(-1)">‹</button>
                    <button class="chat-date-picker-nav" onclick="chatDatePickerChangeMonth(1)">›</button>
                </div>
            </div>
            <div class="chat-date-picker-grid" id="chatDatePickerGrid">
                <!-- Calendar will be generated here -->
            </div>
            <!-- Footer removed completely -->
        </div>
    `;
}

function chatDatePickerGenerateCalendar() {
    // Update month/year header display (this was missing!)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const monthElement = document.getElementById('chatDatePickerMonth');
    if (monthElement) {
        monthElement.textContent = `${monthNames[chatDatePickerState.currentMonth]} ${chatDatePickerState.currentYear}`;
    }

    // Use unified calendar system with chat-specific configuration
    generateUnifiedCalendar(
        chatDatePickerState.currentMonth, 
        chatDatePickerState.currentYear, 
        'chatDatePickerGrid',
        {
            dayClass: 'chat-date-picker-day',
            dayHeaderClass: 'chat-date-picker-day-header',
            onSelect: function(selectedDate) {
                // Preserve existing chat date picker behavior
                chatDatePickerState.selectedDate = selectedDate;

                // Visual feedback - mark as selected
                document.querySelectorAll('.chat-date-picker-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });

                const clickedDay = event.target;
                if (clickedDay) {
                    clickedDay.classList.add('selected');
                }

                // Auto-submit after brief delay (existing behavior)
                setTimeout(() => {
                    chatDatePickerSubmit();
                }, 300);
            }
        }
    );
}

function chatDatePickerChangeMonth(direction) {
    // Update chat date picker state
    chatDatePickerState.currentMonth += direction;

    if (chatDatePickerState.currentMonth > 11) {
        chatDatePickerState.currentMonth = 0;
        chatDatePickerState.currentYear++;
    } else if (chatDatePickerState.currentMonth < 0) {
        chatDatePickerState.currentMonth = 11;
        chatDatePickerState.currentYear--;
    }

    // Use unified calendar generation
    chatDatePickerGenerateCalendar();
}

function chatDatePickerSelectDate(year, month, day) {
    // Store selected date
    chatDatePickerState.selectedDate = new Date(year, month, day);

    // Visual feedback
    document.querySelectorAll('.chat-date-picker-day.selected').forEach(el => {
        el.classList.remove('selected');
    });

    const clickedDay = event.target;
    clickedDay.classList.add('selected');

    // Auto-submit after brief delay for visual feedback
    setTimeout(() => {
        chatDatePickerSubmit();
    }, 300);
}

function chatDatePickerSubmit() {
    if (!chatDatePickerState.selectedDate) return;

    // Format the selected date
    const selectedDateString = chatDatePickerState.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Add user message with selected date
    addMessage(selectedDateString, 'user');

    // Clean up date picker
    chatDatePickerCleanup();

    // Execute callback if provided
    if (chatDatePickerState.callback && typeof chatDatePickerState.callback === 'function') {
        chatDatePickerState.callback(chatDatePickerState.selectedDate);
    }

    // Reset state
    window.waitingForDateInput = false;
    chatDatePickerState.isActive = false;
    chatDatePickerState.selectedDate = null;
    chatDatePickerState.callback = null;
}

function chatDatePickerCleanup() {
    // Remove date picker from DOM
    const datePickerMessage = document.querySelector('.chat-date-picker-message');
    if (datePickerMessage) {
        datePickerMessage.remove();
    }

    // Restore regular input
    const chatInput = document.querySelector('.chat-input');
    const inputField = document.getElementById('messageInput');

    chatInput.classList.remove('date-picker-active');

    // Restore original placeholder
    if (chatDatePickerState.originalPlaceholder) {
        inputField.placeholder = chatDatePickerState.originalPlaceholder;
    }
}

function chatDatePickerCancel() {
    addMessage('Cancel date selection', 'user');

    setTimeout(() => {
        addMessage('No problem! You can continue typing your response normally.', 'ai');
    }, 1000);

    chatDatePickerCleanup();
    window.waitingForDateInput = false;
    chatDatePickerState.isActive = false;
    chatDatePickerState.selectedDate = null;
    chatDatePickerState.callback = null;
}

// Enhanced date parsing function
function chatDatePickerParseTextDate(text) {
    // Try to parse common date formats
    const datePatterns = [
        /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i, // "July 15, 2025" or "July 15 2025"
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,   // "7/15/2025"
        /(\d{1,2})-(\d{1,2})-(\d{4})/,    // "7-15-2025"
        /(\d{4})-(\d{1,2})-(\d{1,2})/,    // "2025-07-15"
    ];

    // Try Date.parse first (handles many formats)
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        return parsed;
    }

    // Handle relative dates
    const today = new Date();
    const lowerText = text.toLowerCase();

    if (lowerText.includes('today')) {
        return today;
    }

    if (lowerText.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow;
    }

    if (lowerText.includes('next friday')) {
        const nextFriday = new Date(today);
        const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
        nextFriday.setDate(today.getDate() + daysUntilFriday);
        return nextFriday;
    }

    return null;
}

// ========================================
// UNIFIED CALENDAR SYSTEM (CONSOLIDATION TARGET 4)
// ========================================

// Unified calendar state management
const unifiedCalendarState = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    callback: null,
    type: null, // 'chat-picker', 'wizard-dual', 'regular'
    isDual: false,
    containerIds: []
};

// Unified calendar generator
function generateUnifiedCalendar(month, year, gridId, options = {}) {
    const calendarGrid = document.getElementById(gridId);
    if (!calendarGrid) {
        console.error(`Calendar grid ${gridId} not found`);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay(); // Day of week (0 = Sunday)
    const daysInMonth = lastDay.getDate();

    // Clear previous calendar
    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = options.dayHeaderClass || 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = options.dayClass ? `${options.dayClass} empty` : 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = options.dayClass || 'calendar-day';
        dayElement.textContent = day;

        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);

        const isToday = currentDate.getTime() === today.getTime();
        const isPast = currentDate < today;

        // Style different types of days
        if (isToday) {
            dayElement.classList.add('today');
        }

        if (isPast && options.disablePast !== false) {
            dayElement.classList.add('past');
        } else {
            // Make today and future dates selectable
            dayElement.classList.add('selectable');
            dayElement.setAttribute('data-year', year);
            dayElement.setAttribute('data-month', month);
            dayElement.setAttribute('data-day', day);

            // Add click handler based on calendar type
            dayElement.addEventListener('click', function() {
                selectUnifiedDate(year, month, day, options);
            });
        }

        calendarGrid.appendChild(dayElement);
    }
}

// Unified date selection handler
function selectUnifiedDate(year, month, day, options = {}) {
    console.log('Unified date selected:', year, month, day);

    // Remove previous selection from all calendars
    document.querySelectorAll('.calendar-day.selected, .chat-date-picker-day.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Find and select the clicked day (try both selector patterns)
    const clickedDay = document.querySelector(`[data-year="${year}"][data-month="${month}"][data-day="${day}"]`);
    if (clickedDay) {
        clickedDay.classList.add('selected');
    }

    // Store selected date
    unifiedCalendarState.selectedDate = new Date(year, month, day);

    // Handle different calendar types
    if (options.onSelect) {
        options.onSelect(unifiedCalendarState.selectedDate);
    } else if (unifiedCalendarState.type === 'chat-picker') {
        // Chat date picker behavior
        setTimeout(() => {
            chatDatePickerSubmit();
        }, 300);
    } else if (unifiedCalendarState.type === 'wizard-dual') {
        // Wizard calendar behavior
        selectedDate = unifiedCalendarState.selectedDate;
        const continueBtn = document.querySelector('.wizard-btn-primary');
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
        }
    }
}

// Unified month navigation
function changeUnifiedMonth(direction, options = {}) {
    unifiedCalendarState.currentMonth += direction;

    if (unifiedCalendarState.currentMonth > 11) {
        unifiedCalendarState.currentMonth = 0;
        unifiedCalendarState.currentYear++;
    } else if (unifiedCalendarState.currentMonth < 0) {
        unifiedCalendarState.currentMonth = 11;
        unifiedCalendarState.currentYear--;
    }

    // Update calendars based on type
    if (unifiedCalendarState.type === 'chat-picker') {
        chatDatePickerGenerateCalendar();
    } else if (unifiedCalendarState.type === 'wizard-dual') {
        initializeDualCalendar(unifiedCalendarState.currentMonth, unifiedCalendarState.currentYear);
    } else if (options.updateCallback) {
        options.updateCallback(unifiedCalendarState.currentMonth, unifiedCalendarState.currentYear);
    }
}

// Unified calendar initialization
function initializeUnifiedCalendar(config = {}) {
    const {
        type = 'regular',
        month = new Date().getMonth(),
        year = new Date().getFullYear(),
        isDual = false,
        containers = [],
        onSelect = null,
        dayClass = 'calendar-day',
        dayHeaderClass = 'calendar-day-header'
    } = config;

    // Set state
    unifiedCalendarState.type = type;
    unifiedCalendarState.currentMonth = month;
    unifiedCalendarState.currentYear = year;
    unifiedCalendarState.isDual = isDual;
    unifiedCalendarState.containerIds = containers;
    unifiedCalendarState.callback = onSelect;

    // Generate calendar(s)
    if (isDual && containers.length >= 2) {
        // Generate first month
        generateUnifiedCalendar(month, year, containers[0], {
            dayClass,
            dayHeaderClass,
            onSelect
        });

        // Generate second month
        let secondMonth = month + 1;
        let secondYear = year;
        if (secondMonth > 11) {
            secondMonth = 0;
            secondYear++;
        }

        generateUnifiedCalendar(secondMonth, secondYear, containers[1], {
            dayClass,
            dayHeaderClass,
            onSelect
        });
    } else if (containers.length > 0) {
        generateUnifiedCalendar(month, year, containers[0], {
            dayClass,
            dayHeaderClass,
            onSelect
        });
    }
}

// ========================================
// TEST FUNCTION FOR UNIFIED CALENDAR (REMOVE AFTER TESTING)
// ========================================


function createProcessCard(config) {
    return {
        type: 'process-card',
        title: config.title || 'Processing...',
        description: config.description || 'Working on your request...',
        status: config.status || 'processing',
        timestamp: config.timestamp || 'Just started',
        id: config.id || Date.now()
    };
}
// Navigation function for earning codes hotspot
window.navigateToEarningCodes = function navigateToEarningCodes() {
    console.log('Hotspot clicked: Navigating to earning codes');
    
    // Exit wizard if active
    const wizardContainer = document.getElementById('wizardContainer');
    if (wizardContainer) {
        wizardContainer.remove();
        
        // Show main panels
        const chatPanel = document.getElementById('chatPanel');
        const tablePanel = document.getElementById('tablePanel');
        chatPanel.style.display = 'flex';
        tablePanel.style.display = 'flex';
        chatPanel.classList.remove('centered');
    }
    
    // Set up shared company data for the demo
    if (!extractedCompanyInfo.legalName) {
        extractedCompanyInfo = { ...SHARED_COMPANY_DATA.default };
    }
    
    // Clear chat and navigate directly to earning codes
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // Progress to earning codes workflow
    if (window.progressManager) {
        window.progressManager.enterWorkflow('earnings-code', 0);
    }
    
    // Load initial schedule cards and then transition to earning codes
   
    showEarningCodesReview({ showMessage: true });    
    
    // Show earning codes immediately
    
}

// Initialize the app


// Add these functions after initializeApp()
// Intro session state


function setupPanelToggle() {
    // No event listener needed since we're using onclick in HTML
    console.log('Panel toggle setup complete (using HTML onclick)');
}

function togglePanelSize() {
    console.log('Toggle button clicked!');
    const chatPanel = document.getElementById('chatPanel');
    const tablePanel = document.getElementById('tablePanel');
    const toggleBtn = document.getElementById('panelToggleBtn');

    console.log('Elements found:', {
        chatPanel: !!chatPanel,
        tablePanel: !!tablePanel,
        toggleBtn: !!toggleBtn
    });

    if (chatPanel && tablePanel && toggleBtn) {
        if (chatPanel.classList.contains('collapsed')) {
            console.log('Expanding chat panel');
            chatPanel.classList.remove('collapsed');
            tablePanel.classList.remove('expanded');
            toggleBtn.innerHTML = '<span class="toggle-icon">⟷</span>';
        } else {
            console.log('Collapsing chat panel');
            chatPanel.classList.add('collapsed');
            tablePanel.classList.add('expanded');
            toggleBtn.innerHTML = '<span class="toggle-icon">⟸</span>';
        }
    } else {
        console.log('ERROR: Missing required elements');
    }
}

// Load initial schedule cards into right panel
function loadInitialScheduleCards() {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
        panelContent.innerHTML = `
            <!-- Schedule Cards Container -->
            <div class="schedule-cards">
                <div class="schedule-card">
                    <div class="card-header">
                        <div class="card-title">Semi-Monthly</div>
                    </div>
                    <div class="card-body">
                        <div class="schedule-detail">
                            <div class="detail-label">Name</div>
                            <div class="detail-value">Semi-Monthly Payroll</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">First pay date</div>
                            <div class="detail-value">August 15, 2025</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Frequency</div>
                            <div class="detail-value">24 pay periods/year</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Payroll date</div>
                            <div class="detail-value">15th and last day</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Hours per pay period</div>
                            <div class="detail-value">80 hours</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Weekend pay date</div>
                            <div class="detail-value">Friday before the date</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Holiday pay date</div>
                            <div class="detail-value">Business before the date</div>
                        </div>
                    </div>
                </div>

                <div class="schedule-card">
                    <div class="card-header">
                        <div class="card-title">Weekly</div>
                    </div>
                    <div class="card-body">
                        <div class="schedule-detail">
                            <div class="detail-label">Name</div>
                            <div class="detail-value">Weekly Payroll</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">First pay date</div>
                            <div class="detail-value">August 8, 2025</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Frequency</div>
                            <div class="detail-value">52 pay periods/year</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Payroll date</div>
                            <div class="detail-value">Every Friday</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Hours per pay period</div>
                            <div class="detail-value">40 hours</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Weekend pay date</div>
                            <div class="detail-value">Friday before the date</div>
                        </div>
                        <div class="schedule-detail">
                            <div class="detail-label">Holiday pay date</div>
                            <div class="detail-value">Business before the date</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    console.log('Right panel initialized with schedule cards');
}


function showEarningCodesReview(options = {}) {
    const panelContent = document.querySelector('.panel-content');
    if (!panelContent) return;

    const stats = calculateEarningCodesStats();

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) panelHeader.textContent = 'Review All Earning Codes';
    if (panelSubtitle) panelSubtitle.innerHTML = `Review and confirm <strong>${stats.active} earning codes extracted</strong> from your payroll data`;

    // Generate the complete HTML structure
    const completeHTML = `
        <!-- Statistics Cards Section -->
        <div class="earning-codes-stats-container">
            <div class="stats-title">
                Earning Codes Overview
            </div>
            <div class="stats-grid">
                <div class="stat-card approved">
                    <div class="stat-number">${stats.approved}</div>
                    <div class="stat-label">Approved Codes</div>
                </div>

                <div class="stat-card deleted">
                    <div class="stat-number">${stats.deleted}</div>
                    <div class="stat-label">Deleted Codes</div>
                </div>

                <div class="stat-card total">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Extracted</div>
                </div>
            </div>
        </div>

        <!-- Bulk Actions Section -->
        <div class="bulk-actions updated-layout">
            <div class="bulk-actions-right">
                <a href="#" class="edit-all-link" onclick="toggleBulkEdit()">Edit All</a>
                <span class="bulk-separator">|</span>
                <button class="bulk-btn" onclick="approveSelectedCodes()" disabled id="bulkApproveBtn">Approve Selected</button>
                <button class="bulk-btn" onclick="deleteSelectedCodes()" disabled id="bulkDeleteBtn">Delete Selected</button>
            </div>
        </div>

        <!-- Table Section -->
        <div class="table-container">
            <table class="review-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAllCodes" onchange="toggleAllEarningCodes(this.checked)"></th>
                        <th>Code</th>
                        <th>Suggested name</th>
                        <th>Suggested description</th>
                        <th>Assessment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateEarningCodesTableRows()}
                </tbody>
            </table>
        </div>
    `;

    // Set the complete HTML
    panelContent.innerHTML = completeHTML;

    // Show intro message if requested
    if (options.showMessage) {
        setTimeout(() => {
    addMessage(getEarningCodeIntroMessage(true), 'ai', [
        { action: 'codes-confirmed-continue', text: 'Codes are confirmed & continue', buttonType: 'primary' },
        { action: 'create-new-earning-code', text: 'Create new earning code', buttonType: 'secondary' },
        { action: 'skip-to-other-setup', text: 'Skip to other payroll setup', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'explain-assessment-meanings', text: 'Explain what each assessment means' }
        ]
    });
    }, 300);
}
}

// Helper function to generate table rows
function generateEarningCodesTableRows() {
    return earningCodes
        .filter(code => !code.hidden)
        .sort((a, b) => {
            const order = { missing: 0, review: 1, confident: 2 };
            return order[a.assessment] - order[b.assessment];
        })
        .map(code => {
            const isMissing = code.assessment === 'missing';
            const isDeleted = code.deleted;
            const isApproved = code.reviewed;

            const editableField = (field, label) => {
                const value = code[field] || '';
                const inputId = `${code.code}-${field}`;

                // Check if this specific field is in editing mode OR if the code has missing assessment
                if (isMissing || (editingState[code.code] && editingState[code.code][field])) {
                    return `<input type="text" class="md-input" id="${inputId}" value="${value}" data-field="${field}" data-code="${code.code}" onchange="updateEarningCodeField(this)" onblur="updateEarningCodeField(this)">`;
                }

                return `
                    <div class="read-only-field-container">
                        <div class="read-only-value">${value || ''}</div>
                        <button class="edit-field-btn icon-btn" title="Edit" onclick="event.preventDefault(); event.stopPropagation(); makeFieldEditable('${code.code}', '${field}'); return false;">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                    </div>`;
            };

            return `
                <tr data-code="${code.code}" class="${isDeleted ? 'deleted-row' : ''}">
                    <td><input type="checkbox" class="code-checkbox" data-code="${code.code}" onchange="updateBulkActions()"></td>
                    <td>${editableField('code', 'Code')}</td>
                    <td>${editableField('name', 'Name')}</td>
                    <td>${editableField('description', 'Description')}</td>
                    <td><span class="assessment-badge ${code.assessment}">${code.assessment}</span></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${isApproved
                                ? `
                                    <span class="approved-indicator">✅ Approved</span>
                                    <button class="icon-btn" title="Revert" onclick="revertCode('${code.code}')">
                                        <span class="material-icons-outlined">undo</span>
                                    </button>
                                `
                                : isDeleted
                                ? `
                                    <span class="approved-indicator">🗑️ Deleted</span>
                                    <button class="icon-btn" title="Revert" onclick="revertCode('${code.code}')">
                                        <span class="material-icons-outlined">undo</span>
                                    </button>
                                `
                                : `
                                    <button class="icon-btn approve-btn" title="Approve" onclick="approveCode('${code.code}')">
                                        <span class="material-icons-outlined">check_circle</span>
                                    </button>
                                    <button class="icon-btn delete-btn" title="Delete" onclick="deleteCode('${code.code}')">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                `}
                        </div>
                    </td>
                </tr>`;
        }).join('');
}

// Make this function globally accessible
window.makeFieldEditable = function(code, field) {
    console.log(`Making field editable: ${code}.${field}`);
    
    if (!editingState[code]) editingState[code] = {};
    editingState[code][field] = true;
    
    // Refresh the table to show the input field
    showEarningCodesReview({ showMessage: false });

    // Focus the input field after rendering
    setTimeout(() => {
        const input = document.getElementById(`${code}-${field}`);
        if (input) {
            input.focus();
            input.select(); // Select all text for easier editing
        }
    }, 50);
};

function makeFieldEditable(code, field) {
    return window.makeFieldEditable(code, field);
}



function deleteCode(code) {
    const idx = earningCodes.findIndex(c => c.code === code);
    if (idx !== -1) {
        earningCodes[idx].deleted = true;
        showEarningCodesReview({ showMessage: false });
    }
}

function revertCode(code) {
    const idx = earningCodes.findIndex(c => c.code === code);
    if (idx !== -1) {
        earningCodes[idx].reviewed = false;
        earningCodes[idx].deleted = false;
        showEarningCodesReview({ showMessage: false });
    }
}


// Enhanced function to add typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typing-indicator';

    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    setTimeout(() => {
        typingDiv.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    }, 50);

    return typingDiv;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced smooth panel content transition
function smoothPanelTransition(newContent, callback) {
    const panelContent = document.querySelector('.panel-content');
    if (!panelContent) return;

    // Add loading class for fade effect
    panelContent.classList.add('loading');

    setTimeout(() => {
        panelContent.innerHTML = newContent;
        panelContent.classList.remove('loading');
        if (callback) callback();
    }, 300);
}
function getAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    // Check for skip to recommendations command
    if (lowerMessage.includes('skip to recommendations') ||
        lowerMessage.includes('go to recommendations') ||
        lowerMessage.includes('show recommendations') ||
        lowerMessage.includes('recommendations')) {

        // Skip directly to AI suggestions step
        setTimeout(() => {
            currentStep = 4;
            showAISuggestions();
            addMessage('Skipping directly to <strong>Step 4: AI Recommendations</strong>!\n\nHere are my suggestions to optimize your earning codes based on the analysis.', 'ai', [
                { action: 'accept-all-suggestions', text: 'Accept all recommendations', buttonType: 'primary' },
                { action: 'move-to-rate-configuration', text: 'Done, next to rate configuration', buttonType: 'secondary' },
                { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
            ], {
                style: 'two-tier-interactive'
            });
        }, 1000);

        return null; // Don't continue with other response logic
    }
    // Check for approval keywords to auto-progress to next step
    const approvalKeywords = ['yes', 'approve', 'move to the next step', 'move to next step', 'next step', 'continue', 'proceed'];
    const isApprovalMessage = approvalKeywords.some(keyword => lowerMessage.includes(keyword));

    if (isApprovalMessage) {
        // Execute actions immediately without transition messages
        switch (currentStep) {
            case 1: // Schedule review step
                // showLoadingSpinner(); // Commented out - function not defined
                setTimeout(() => {
                    approveAllSchedules();
                    showCalendarSimulation();
                }, 1000);

                return {
                    text: `${CONSTANTS.MESSAGES.PERFECT} The schedule information is confirmed. I\'ve generated a calendar showing your payroll timeline:\n• <strong>Submit deadlines</strong> \n• <strong>Processing periods</strong> \n• <strong>Employee pay dates</strong> (with automatic weekend/holiday adjustments)\n\nReview the calendar on the right to see your payroll schedule starting August 2025.\n\nOnce you\'ve explored the calendar, I\'ll configure these schedules.`,
                    pills: [
                        { action: 'continue-earning-codes', text: 'Configure Pay Schedules' },
                        { action: 'view-semi-monthly', text: 'Focus on Semi-Monthly' },
                        { action: 'view-weekly', text: 'Focus on Weekly' }
                    ]
                };


            case 3: // Earning codes review step
                // Show process card
                const processCard = createProcessCard({
                    title: 'Processing Earning Codes Review',
                    description: 'Analyzing your earning codes and preparing recommendations...',
                    status: 'processing',
                    timestamp: 'Just started',
                    id: 'payroll-config'
                });

                addMessage(processCard, 'ai');

                // Show spinner in right panel immediately
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <div class="loading-text">${CONSTANTS.MESSAGES.LOADING} recommendations...</div>
                    <div class="loading-subtext">Analyzing your earning codes</div>
                </div>
            `;
                }

                setTimeout(function() {
                    const approvedCount = earningCodes.filter(code => code.reviewed).length;
                    const pendingCount = earningCodes.filter(code => !code.reviewed && code.assessment != 'missing').length;
                    const missingCount = earningCodes.filter(code => code.assessment == 'missing').length;
                    const totalCount = earningCodes.length;

                    const summaryText = `${CONSTANTS.MESSAGES.GREAT} Let me summarize your earning codes review:\n\n` +
                        '✅ Approved: ' + approvedCount + ' codes\n' +
                        '⏳ Pending Review: ' + pendingCount + ' codes\n' +
                        '❌ Missing Info: ' + missingCount + ' codes\n' +
                        'Total: ' + totalCount + ' codes\n\n' +
                        'Now let me show you my recommendations to optimize these codes...';

                    addMessage(summaryText, 'ai', [
                        { action: 'move-to-rate-configuration', text: 'Done, next: Rate configuration', buttonType: 'primary' },
                        { action: 'skip-suggestions', text: 'Skip all recommendations', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive'
                    });

                    setTimeout(function() {
                        showAISuggestions();
                    }, 1500);
                }, 1000);

                return null;

           

            case 5: // Rate configuration step
                setTimeout(() => {
                    finalizeConfiguration();
                }, 1000);
                return {
                    text: "${CONSTANTS.MESSAGES.GREAT} Moving to the final step - W-2 Tax Form Preview. This will show you how all your earning codes will be reported for tax purposes.",
                    pills: []
                };

            case 6: // W-2 preview step
                setTimeout(() => {
                    completePayrollSetup();
                }, 1000);
                return null;

            default:
                return null;
        }
    }

    // Handle weekend pay date updates
    if (lowerMessage.includes('weekend pay date') && lowerMessage.includes('semi-monthly') && lowerMessage.includes('thursday')) {
        updateWeekendPayDate('semi-monthly', 'Thursday before the date');
        return {
            text: "${CONSTANTS.MESSAGES.PERFECT} I've updated the weekend pay date for the Semi-Monthly schedule to 'Thursday before the date'. The change is now reflected in the schedule card above.\n\nIs there anything else you'd like to adjust for the Semi-Monthly schedule, or shall we review the Weekly schedule next?",
            pills: [
                { action: 'edit-weekly', text: 'Edit Weekly schedule' },
                { action: 'approve-all', text: 'Approve both schedules' },
                { action: 'add-new', text: 'Add another schedule' }
            ]
        };
    }

    // Handle specific questions about schedules
    if (lowerMessage.includes('difference') || lowerMessage.includes('compare')) {
        return {
            text: "Great question! Here are the key differences:\n\n<strong>Semi-Monthly (24 periods/year):</strong>\n• Employees get paid twice per month\n• Typically 80 hours per pay period\n• More predictable for salaried employees\n\n<strong>Weekly (52 periods/year):</strong>\n• Employees get paid every Friday\n• Typically 40 hours per pay period\n• Better cash flow for hourly employees\n\nWhich schedule type do you need more details about?",
            pills: [
                { action: 'semi-monthly-details', text: 'Tell me more about Semi-Monthly' },
                { action: 'weekly-details', text: 'Tell me more about Weekly' },
                { action: 'approve-all', text: 'Both look good, approve them' }
            ]
        };
    }

    if (lowerMessage.includes('hours') || lowerMessage.includes('time')) {
        return {
            text: "The hours per pay period are calculated based on a standard full-time schedule:\n\n• <strong>Semi-Monthly</strong>: 80 hours (40 hours/week × 2 weeks)\n• <strong>Weekly</strong>: 40 hours (standard work week)\n\nWould you like me to adjust these hours for part-time employees or a different work schedule?",
            pills: [
                { action: 'adjust-hours', text: 'Adjust hours for part-time' },
                { action: 'custom-hours', text: 'Set custom hours' },
                { action: 'keep-standard', text: 'Keep standard hours' }
            ]
        };
    }

    if (lowerMessage.includes('holiday') || lowerMessage.includes('weekend')) {
        return {
            text: "Both schedules currently use 'Friday before the date' for weekend and holiday pay dates. This ensures employees get paid before weekends and holidays.\n\nWould you like to modify these rules for either schedule?",
            pills: [
                { action: 'change-semi-weekend-rules', text: 'Change Semi-Monthly rules' },
                { action: 'change-weekly-weekend-rules', text: 'Change Weekly rules' },
                { action: 'keep-current-dates', text: 'Keep current settings' }
            ]
        };
    }

    if (lowerMessage.includes('approve')) {
        // Automatically approve schedules and move to calendar simulation
        approveAllSchedules();
        showCalendarSimulation();
        return {
            text: "${CONSTANTS.MESSAGES.PERFECT} ✅ I've generated a calendar showing when you'll need to:\n• Submit payroll (2 business days before pay date by 1:30 PM EST)\n• Process payroll\n• Pay employees\n\nThis includes adjustments for weekends and holidays. Review the calendar on the right to see your payroll schedule starting August 2025.",
            pills: [
                { action: 'view-semi-monthly', text: 'Show Semi-Monthly details' },
                { action: 'view-weekly', text: 'Show Weekly details' },
                { action: 'continue-earning-codes', text: 'Configure Pay Schedules' }
            ]
        };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
        return {
            text: "I'm here to help you review and configure these pay schedules! You can:\n\n• Ask questions about schedule differences\n• Request changes to pay dates or hours\n• Approve schedules when ready\n• Add new schedule types\n\nWhat would you like to know more about?",
            pills: [
                { action: 'explain-differences', text: 'Explain schedule differences' },
                { action: 'edit-schedule', text: 'Make changes' },
                { action: 'approve-all', text: 'Approve schedules' }
            ]
        };
    }
    // Handle W-2 requests - Skip directly to W-2 preview from any step
    if (lowerMessage.includes('w-2') || lowerMessage.includes('w2') || lowerMessage.includes('tax form')) {
        setTimeout(() => {
            finalizeConfiguration();
        }, 1000);
        return {
            text: "Jumping directly to the W-2 preview! I'll show you exactly how your earning codes will appear on employee tax forms.",
            pills: []
        };
    }

    // Handle "ready/next/continue" from Step 5
    if (lowerMessage.includes('ready') || lowerMessage.includes('next') || lowerMessage.includes('continue')) {
        if (currentStep === 5) {
            // User says they're ready to continue from Step 5
            setTimeout(() => {
                finalizeConfiguration();
            }, 1000);
            return {
                text: "${CONSTANTS.MESSAGES.GREAT} Moving to the final step - W-2 Tax Form Preview. This will show you how all your earning codes will be reported for tax purposes.",
                pills: []
            };
        }
    }

    // Handle "done/finish/complete" from Step 5
    if (currentStep === 5) {
        if (lowerMessage.includes('done') || lowerMessage.includes('finish') ||
            lowerMessage.includes('complete') || lowerMessage.includes('final')) {
            setTimeout(() => {
                finalizeConfiguration();
            }, 1000);
            return {
                text: "${CONSTANTS.MESSAGES.EXCELLENT} You're ready for the final step. Let me show you the W-2 preview now.",
                pills: []
            };
        }
    }

    // Default contextual response
    return {
        text: "I can help you review these pay schedules. Feel free to ask about the differences between Semi-Monthly and Weekly schedules, request any changes, or let me know when you're ready to approve them and move to the next step.",
        pills: [
            { action: 'explain-differences', text: 'What are the differences?' },
            { action: 'edit-schedule', text: 'I want to make changes' },
            { action: 'approve-all', text: 'Configure pay schedules' }
        ]
    };
}

function updateWeekendPayDate(scheduleType, newPayDate) {
    const scheduleCards = document.querySelectorAll('.schedule-card');

    scheduleCards.forEach(card => {
        const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
        if (cardTitle.includes(scheduleType.toLowerCase())) {
            const scheduleDetails = card.querySelectorAll('.schedule-detail');
            scheduleDetails.forEach(detail => {
                const label = detail.querySelector('.detail-label').textContent;
                if (label.includes('Weekend pay date')) {
                    detail.querySelector('.detail-value').textContent = newPayDate;
                }
            });
        }
    });
}
function updateScheduleRule(scheduleType, ruleType, newRule) {
    const scheduleCards = document.querySelectorAll('.schedule-card');

    scheduleCards.forEach(card => {
        const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
        if (cardTitle.includes(scheduleType.toLowerCase())) {
            const scheduleDetails = card.querySelectorAll('.schedule-detail');
            scheduleDetails.forEach(detail => {
                const label = detail.querySelector('.detail-label').textContent.toLowerCase();

                if (ruleType === 'weekend' && label.includes('weekend pay date')) {
                    detail.querySelector('.detail-value').textContent = newRule;
                } else if (ruleType === 'holiday' && label.includes('holiday pay date')) {
                    detail.querySelector('.detail-value').textContent = newRule;
                }
            });
        }
    });
}
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// ========================================
// EARNING CODE CREATION WORKFLOW
// ========================================

function startEarningCodeCreationWorkflow() {
    earningCodeCreationState.isActive = true;
    earningCodeCreationState.step = 1;
    earningCodeCreationState.description = '';

    addMessage('I\'ll help you create a new earning code. Please describe what this earning code will be used for:', 'ai');

    // Set input waiting state
    window.waitingForEarningCodeDescription = true;
    console.log('Flag set to:', window.waitingForEarningCodeDescription); 
}

function handleEarningCodeDescription(description) {
    earningCodeCreationState.description = description;
    earningCodeCreationState.step = 2;

    // Generate smart suggestions based on description
    const suggestions = generateEarningCodeSuggestions(description);
    earningCodeCreationState.suggestedCode = suggestions.code;
    earningCodeCreationState.suggestedName = suggestions.name;

    setTimeout(() => {
        removeTypingIndicator();
        addMessage(`Great! Based on your description, I suggest:\n\n<strong>Code:</strong> ${suggestions.code}\n<strong>Name:</strong> ${suggestions.name}\n\nYou can accept these suggestions or edit them:`, 'ai', [
            { action: 'accept-earning-code-suggestions', text: 'Accept suggestions', buttonType: 'primary' },
            { action: 'edit-earning-code-name', text: 'Edit name', buttonType: 'secondary' },
            { action: 'edit-earning-code-code', text: 'Edit code', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 1000);
}

function generateEarningCodeSuggestions(description) {
    const lowerDesc = description.toLowerCase();

    // Smart suggestion patterns
    if (lowerDesc.includes('award') || lowerDesc.includes('awards') || lowerDesc.includes('AWD')) {
        return { code: 'AWD', name: 'Employee Awards' };
    } else if (lowerDesc.includes('regular') || lowerDesc.includes('normal') || lowerDesc.includes('base')) {
        return { code: 'REG', name: 'Regular' };
    } else {
        // Generate code from first letters of key words
        const words = description.split(' ').filter(word => word.length > 2);
        const code = words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('') + 'E';
        return { code: code, name: description.split(' ').slice(0, 2).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') };
    }
}

function acceptEarningCodeSuggestions() {
    // Store the suggested values directly
    earningCodeCreationState.userCode = earningCodeCreationState.suggestedCode;
    earningCodeCreationState.userName = earningCodeCreationState.suggestedName;

    // Skip confirmEarningCodeCreation() and go directly to adding the code
    addNewEarningCodeToTable();
}

function confirmEarningCodeCreation() {
    earningCodeCreationState.step = 3;
    removeTypingIndicator()
    addMessage(`Perfect! I'll create the new earning code:\n\n<strong>Code:</strong> ${earningCodeCreationState.userCode}\n<strong>Name:</strong> ${earningCodeCreationState.userName}\n<strong>Description:</strong> ${earningCodeCreationState.description}\n\nShall I add this to your earning codes?`, 'ai', [
        { action: 'confirm-add-earning-code', text: 'Yes, add it', buttonType: 'primary' },
        { action: 'cancel-earning-code-creation', text: 'Cancel', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
}

function addNewEarningCodeToTable() {
    // Check for duplicates
    const existingCode = earningCodes.find(code => code.code === earningCodeCreationState.userCode);
    if (existingCode) {
        addMessage(`A code with "${earningCodeCreationState.userCode}" already exists. Please choose a different code.`, 'ai', [
            { action: 'edit-earning-code-code', text: 'Choose different code', buttonType: 'primary' },
            { action: 'cancel-earning-code-creation', text: 'Cancel', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
        return;
    }

    // Add new earning code
    const newCode = {
        code: earningCodeCreationState.userCode,
        name: earningCodeCreationState.userName,
        description: earningCodeCreationState.description,
        assessment: 'Exact match',
        reviewed: false,
        editMode: false
    };

    earningCodes.push(newCode);
    reviewProgress.totalCodes++;
    reviewProgress.reviewedCodes++;
    reviewProgress.approvedCodes.push(newCode.code);

    // Reset state
    earningCodeCreationState.isActive = false;
    window.waitingForEarningCodeDescription = false;
    window.waitingForEarningCodeName = false;
    window.waitingForEarningCodeCode = false;

    // Refresh the table immediately
    showEarningCodesReview();

    // Show success message with specific pills
    removeTypingIndicator();
    addMessage(`✅ Successfully added new earning code "${earningCodeCreationState.userCode}" to your table!`, 'ai', [
        { action: 'continue-to-recommendations', text: 'Codes are approved and continue', buttonType: 'primary' },
        { action: 'create-new-earning-code', text: 'Create new earning code', buttonType: 'secondary' },
        { action: 'skip-to-other-setup', text: 'Skip to another setup', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'explain-classification-details', text: 'Details on the classification' }
        ]
    });
}

function validateEarningCode(code) {
    if (!code || code.length < 2 || code.length > 10) {
        return false;
    }
    if (!/^[A-Z0-9_]+$/.test(code)) {
        return false;
    }
    return true;
}

function validateEarningName(name) {
    return name && name.trim().length >= 2;
}
// Function to recalculate timeline dates based on new launch date
function recalculateTimelineDates(newLaunchDate) {
    const launchDate = new Date(newLaunchDate);
    const timelineItems = [];

    // Company configuration tasks (work backwards from launch date)
    const companyInfoDue = new Date(launchDate);
    companyInfoDue.setDate(launchDate.getDate() - 45); // 45 days before launch

    const bankAccountDue = new Date(launchDate);
    bankAccountDue.setDate(launchDate.getDate() - 40); // 40 days before launch

    const employeeInfoDue = new Date(launchDate);
    employeeInfoDue.setDate(launchDate.getDate() - 35); // 35 days before launch

    // Payroll setup tasks
    const payScheduleDue = new Date(launchDate);
    payScheduleDue.setDate(launchDate.getDate() - 30); // 30 days before launch

    const earningDeductionDue = new Date(launchDate);
    earningDeductionDue.setDate(launchDate.getDate() - 20); // 20 days before launch

    const taxSetupDue = new Date(launchDate);
    taxSetupDue.setDate(launchDate.getDate() - 10); // 10 days before launch

    return {
        companyInfo: formatTimelineDate(companyInfoDue),
        bankAccount: formatTimelineDate(bankAccountDue),
        employeeInfo: formatTimelineDate(employeeInfoDue),
        paySchedule: formatTimelineDate(payScheduleDue),
        earningDeduction: formatTimelineDate(earningDeductionDue),
        taxSetup: formatTimelineDate(taxSetupDue)
    };
}

// Function to format dates for timeline display
function formatTimelineDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
}

// Function to calculate timeline dates based on current date
function calculateTimelineDates() {
    let launchDate;
    
    // Use the date from newWizardState if available
    if (window.newWizardState && window.newWizardState.userData && window.newWizardState.userData.startDate) {
        launchDate = new Date(window.newWizardState.userData.startDate);
    } else {
        // Default to 60 days from today
        const today = new Date();
        launchDate = new Date(today);
        launchDate.setDate(today.getDate() + 60); // 60 days from today
    }

    const companyInfoDue = new Date(launchDate);
    companyInfoDue.setDate(launchDate.getDate() - 50); // 50 days before launch

    const bankAccountDue = new Date(launchDate);
    bankAccountDue.setDate(launchDate.getDate() - 45); // 45 days before launch

    const employeeInfoDue = new Date(launchDate);
    employeeInfoDue.setDate(launchDate.getDate() - 40); // 40 days before launch

    const payScheduleDue = new Date(launchDate);
    payScheduleDue.setDate(launchDate.getDate() - 30); // 30 days before launch

    const earningDeductionDue = new Date(launchDate);
    earningDeductionDue.setDate(launchDate.getDate() - 20); // 20 days before launch

    const taxSetupDue = new Date(launchDate);
    taxSetupDue.setDate(launchDate.getDate() - 10); // 10 days before launch

    return {
        companyInfo: formatTimelineDate(companyInfoDue),
        bankAccount: formatTimelineDate(bankAccountDue),
        employeeInfo: formatTimelineDate(employeeInfoDue),
        paySchedule: formatTimelineDate(payScheduleDue),
        earningDeduction: formatTimelineDate(earningDeductionDue),
        taxSetup: formatTimelineDate(taxSetupDue)
    };
}

// Function to load timeline with 0% progress bars when AI message appears
function loadTimelineWithZeroProgress(newDates) {
    const panelContent = document.querySelector('.panel-content');

    if (panelContent) {
        panelContent.innerHTML = `
            <div class="timeline-view-container">
                <div class="timeline-section">
                    <div class="section-header">
                        <h3>Company configuration</h3>
                        <div class="section-progress">
                            <div class="section-progress-wrapper">
                                <div class="section-progress-bar" data-section="company" style="width: 0%; background: #e0e0e0; transition: all 0.8s ease;"></div>
                            </div>
                            <span class="section-progress-text">0%</span>
                        </div>
                    </div>
                </div>

                <div class="timeline-content">
                    <div class="timeline-section">
                        <div class="timeline-items">
                            <div class="timeline-item">
                                <div class="timeline-icon">🏢</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add company information</div>
                                        <div class="timeline-due">Due by ${newDates.companyInfo}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon">🏦</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add bank account</div>
                                        <div class="timeline-due">Due by ${newDates.bankAccount}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon">👥</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add employee information</div>
                                        <div class="timeline-due">Due by ${newDates.employeeInfo}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-section">
                        <div class="section-header">
                            <h3>Payroll setup</h3>
                            <div class="section-progress">
                                <div class="section-progress-wrapper">
                                    <div class="section-progress-bar" data-section="payroll" style="width: 0%; background: #e0e0e0; transition: all 0.8s ease;"></div>
                                </div>
                                <span class="section-progress-text">0%</span>
                            </div>
                        </div>
                        <div class="timeline-items">
                            <div class="timeline-item">
                                <div class="timeline-icon">📋</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Pay schedule setup</div>
                                        <div class="timeline-due">Due by ${newDates.paySchedule}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon">💰</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Earning and deduction setup</div>
                                        <div class="timeline-due">Due by ${newDates.earningDeduction}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon">📊</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Tax setup</div>
                                        <div class="timeline-due">Due by ${newDates.taxSetup}</div>
                                    </div>
                                    <div class="timeline-progress">
                                        <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to update timeline with new dates (grey timeline without progress - used for date recalculation)
function updateTimelineWithNewDates(newDates) {
    const panelContent = document.querySelector('.panel-content');

    if (panelContent) {
        panelContent.innerHTML = `
            <div class="timeline-view-container">
                <div class="timeline-section">
                    <h3>Company configuration</h3>
                </div>

                <div class="timeline-content">
                    <div class="timeline-section">
                        <div class="timeline-items">
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">🏢</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add company information</div>
                                        <div class="timeline-due">Due by ${newDates.companyInfo}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">🏦</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add bank account</div>
                                        <div class="timeline-due">Due by ${newDates.bankAccount}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">👥</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Add employee information</div>
                                        <div class="timeline-due">Due by ${newDates.employeeInfo}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-section">
                        <h3>Payroll setup</h3>
                        <div class="timeline-items">
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">📋</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Pay schedule setup</div>
                                        <div class="timeline-due">Due by ${newDates.paySchedule}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">💰</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Earning and deduction setup</div>
                                        <div class="timeline-due">Due by ${newDates.earningDeduction}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item timeline-grey">
                                <div class="timeline-icon">📊</div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="timeline-task">Tax setup</div>
                                        <div class="timeline-due">Due by ${newDates.taxSetup}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to handle timeline recalculation with AI thinking
function handleTimelineRecalculation(newDate) {
    // Show skeleton in right panel
    showTimelineSkeleton();

    // Show AI thinking indicator
    showAIThinkingIndicator();

    // Start the thinking text updates (reuse existing function)
    const thinkingSteps = [
        "Analyzing your new launch date...",
        "Recalculating all deadlines...",
        "Updating timeline milestones...",
        "Generating updated timeline view..."
    ];

    let currentStep = 0;

    function updateRecalcText() {
        const textElement = document.getElementById('thinking-text');
        if (textElement && currentStep < thinkingSteps.length - 1) {
            currentStep++;
            textElement.textContent = thinkingSteps[currentStep];

            if (currentStep < thinkingSteps.length - 1) {
                setTimeout(updateRecalcText, 800);
            }
        }
    }

    setTimeout(updateRecalcText, 600);

    // After thinking delay, update timeline with new dates
    setTimeout(() => {
        // Remove thinking indicator
        removeThinkingIndicator();

        // Calculate new timeline dates
        const newDates = recalculateTimelineDates(newDate);

        // Fade out skeleton and show new timeline
        const panelContent = document.querySelector('.panel-content');
        panelContent.style.transition = 'opacity 0.3s ease-out';
        panelContent.style.opacity = '0';

        setTimeout(() => {
            updateTimelineWithNewDates(newDates);
            panelContent.style.opacity = '1';
        }, 300);

    }, 4500); // Same timing as original thinking sequence
}


// Calendar and payroll simulation
// Make holidays globally available
window.holidays2025 = [
    { date: '2025-01-01', name: 'New Year\'s Day' },
    { date: '2025-01-20', name: 'Martin Luther King Jr. Day' },
    { date: '2025-02-17', name: 'Presidents\' Day' },
    { date: '2025-05-26', name: 'Memorial Day' },
    { date: '2025-07-04', name: 'Independence Day' },
    { date: '2025-09-01', name: 'Labor Day' },
    { date: '2025-10-13', name: 'Columbus Day' },
    { date: '2025-11-11', name: 'Veterans Day' },
    { date: '2025-11-27', name: 'Thanksgiving' },
    { date: '2025-12-25', name: 'Christmas Day' }
];

function approveAllSchedules() {
    // Mark all schedules as approved
    schedules.forEach(schedule => {
        schedule.approved = true;
    });

    // Update the UI to show approved status
    const scheduleCards = document.querySelectorAll('.schedule-card');
    scheduleCards.forEach(card => {
        const approveBtn = card.querySelector('.card-btn');
        if (approveBtn) {
            approveBtn.textContent = '✅ Approved';
            approveBtn.disabled = true;
            approveBtn.style.backgroundColor = '#4CAF50';
        }
    });
}

function showCalendarSimulation() {
   

    // Update step progress
    const stepProgress = document.querySelector('.step-progress');
    if (stepProgress) {
        stepProgress.innerHTML = '📅 Step 2 of 6: Review payroll calendar simulation';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Payroll Calendar Simulation';
    }
    if (panelSubtitle) {
        panelSubtitle.textContent = 'Review submission, processing, and payment dates for August 2025 onwards';
    }

    // Replace schedule cards with calendar simulation
    const panelContent = document.querySelector('.panel-content');
    panelContent.innerHTML = `
        <div class="simulation-controls">
            <div class="schedule-tabs">
                <button class="tab-btn active" onclick="showScheduleSimulation('semi-monthly')">Semi-Monthly Schedule</button>
                <button class="tab-btn" onclick="showScheduleSimulation('weekly')">Weekly Schedule</button>
            </div>
        </div>

        <div class="calendar-simulation" id="calendarSimulation">
            ${generateSemiMonthlyCalendar()}
        </div>

        <div class="simulation-legend">
            <div class="legend-item">
                <span class="legend-color submit"></span>
                <span>Payroll Submission Deadline (1:30 PM EST)</span>
            </div>
            <div class="legend-item">
                <span class="legend-color process"></span>
                <span>Processing Period</span>
            </div>
            <div class="legend-item">
                <span class="legend-color pay"></span>
                <span>Employee Pay Date</span>
            </div>
            <div class="legend-item">
                <span class="legend-color holiday"></span>
                <span>Holiday Adjustment</span>
            </div>
        </div>
    `;
}

// New function to show payroll calendar view with actual calendar display
function showPayrollCalendarView() {
    // Update step progress
    const stepProgress = document.querySelector('.step-progress');
    if (stepProgress) {
        stepProgress.innerHTML = '📅 Step 2 of 6: Review payroll calendar';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Payroll Calendar';
    }
    if (panelSubtitle) {
        panelSubtitle.textContent = 'Your payroll timeline with key dates';
    }

    // Get current date info
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Replace schedule cards with calendar view
    const panelContent = document.querySelector('.panel-content');
    panelContent.innerHTML = `
        <div class="calendar-view-container" style="padding: 20px;">
            <div class="calendar-navigation" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="changePayrollCalendarMonth(-1)" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px;">◄</button>
                <div class="calendar-header" style="display: flex; gap: 40px;">
                    <div style="text-align: center;">
                        <h3 id="calendar-month-1" style="margin: 0; font-size: 18px; color: #333;"></h3>
                        <span id="calendar-year-1" style="font-size: 14px; color: #666;"></span>
                    </div>
                    <div style="text-align: center;">
                        <h3 id="calendar-month-2" style="margin: 0; font-size: 18px; color: #333;"></h3>
                        <span id="calendar-year-2" style="font-size: 14px; color: #666;"></span>
                    </div>
                </div>
                <button onclick="changePayrollCalendarMonth(1)" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px;">►</button>
            </div>

            <div class="calendars-container" style="display: flex; gap: 20px;">
                <div class="calendar-wrapper" style="flex: 1;">
                    <div id="payroll-calendar-1" class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #f5f5f5; padding: 10px; border-radius: 8px;"></div>
                </div>
                <div class="calendar-wrapper" style="flex: 1;">
                    <div id="payroll-calendar-2" class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #f5f5f5; padding: 10px; border-radius: 8px;"></div>
                </div>
            </div>

            <div class="calendar-legend" style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #d4f4dd; border: 2px solid #4CAF50; border-radius: 4px;"></div>
                        <span style="font-size: 14px;">Work done</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #ffe6e6; border: 2px solid #f44336; border-radius: 4px;"></div>
                        <span style="font-size: 14px;">Deadline to run payroll</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #e3f2fd; border: 2px solid #2196F3; border-radius: 4px;"></div>
                        <span style="font-size: 14px;">Pay day</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize calendars
    window.payrollCalendarMonth = currentMonth;
    window.payrollCalendarYear = currentYear;
    updatePayrollCalendars();
}

// Helper function to update both calendar displays
function updatePayrollCalendars() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Update month/year headers
    document.getElementById('calendar-month-1').textContent = monthNames[window.payrollCalendarMonth];
    document.getElementById('calendar-year-1').textContent = window.payrollCalendarYear;
    
    // Calculate next month
    let nextMonth = window.payrollCalendarMonth + 1;
    let nextYear = window.payrollCalendarYear;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }
    
    document.getElementById('calendar-month-2').textContent = monthNames[nextMonth];
    document.getElementById('calendar-year-2').textContent = nextYear;
    
    // Generate calendars
    generatePayrollCalendar(window.payrollCalendarMonth, window.payrollCalendarYear, 'payroll-calendar-1');
    generatePayrollCalendar(nextMonth, nextYear, 'payroll-calendar-2');
}

// Helper function to change calendar months
function changePayrollCalendarMonth(direction) {
    window.payrollCalendarMonth += direction;
    
    if (window.payrollCalendarMonth > 11) {
        window.payrollCalendarMonth = 0;
        window.payrollCalendarYear++;
    } else if (window.payrollCalendarMonth < 0) {
        window.payrollCalendarMonth = 11;
        window.payrollCalendarYear--;
    }
    
    updatePayrollCalendars();
}

// Generate individual calendar with payroll dates marked
function generatePayrollCalendar(month, year, gridId) {
    const calendarGrid = document.getElementById(gridId);
    if (!calendarGrid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.cssText = 'text-align: center; font-size: 11px; font-weight: 600; color: #666; padding: 8px 4px;';
        calendarGrid.appendChild(dayHeader);
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Get payroll dates for this month
    const payrollDates = getPayrollDatesForMonth(month, year);

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Base styling
        dayElement.style.cssText = 'aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 14px; position: relative; border-radius: 4px; min-height: 40px; background: white;';
        
        // Create day number
        const dayNumber = document.createElement('div');
        dayNumber.textContent = day;
        dayNumber.style.cssText = 'font-size: 14px; position: relative; z-index: 1;';
        
        // Check if this date has payroll events
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const payrollEvent = payrollDates[dateKey];
        
        if (payrollEvent) {
            if (payrollEvent.type === 'work-done') {
                dayElement.style.background = '#d4f4dd';
                dayElement.style.border = '2px solid #4CAF50';
                dayNumber.style.fontWeight = '600';
            } else if (payrollEvent.type === 'deadline') {
                dayElement.style.background = '#ffe6e6';
                dayElement.style.border = '2px solid #f44336';
                dayNumber.style.fontWeight = '600';
            } else if (payrollEvent.type === 'pay-day') {
                dayElement.style.background = '#e3f2fd';
                dayElement.style.border = '2px solid #2196F3';
                dayNumber.style.fontWeight = '600';
            }
            
            // Add small indicator dots
            if (payrollEvent.schedules && payrollEvent.schedules.length > 0) {
                const indicator = document.createElement('div');
                indicator.style.cssText = 'position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); display: flex; gap: 2px;';
                
                payrollEvent.schedules.forEach(() => {
                    const dot = document.createElement('div');
                    dot.style.cssText = 'width: 4px; height: 4px; border-radius: 50%; background: #666;';
                    indicator.appendChild(dot);
                });
                
                dayElement.appendChild(indicator);
            }
        }
        
        dayElement.appendChild(dayNumber);
        calendarGrid.appendChild(dayElement);
    }
}

// Get payroll dates for a given month
function getPayrollDatesForMonth(month, year) {
    const dates = {};
    
    // Semi-monthly schedule (15th and last day)
    // Work period: 1st-15th and 16th-last day
    // Deadline: 2 days before pay date
    // Pay day: 15th and last day (adjusted for weekends/holidays)
    
    // First pay period (1st-15th)
    // For August 2025: 15th is a Friday, so no adjustment needed
    let payDate15 = new Date(year, month, 15);
    if (payDate15.getDay() === 0) { // Sunday
        payDate15.setDate(14); // Move to Friday
    } else if (payDate15.getDay() === 6) { // Saturday
        payDate15.setDate(14); // Move to Friday
    }
    
    // Mark work period days 1-15 (but only the first and last for visual clarity)
    addPayrollDate(dates, new Date(year, month, 1), 'work-done', ['Semi-Monthly']);
    addPayrollDate(dates, new Date(year, month, 15), 'work-done', ['Semi-Monthly']);
    
    // Deadline is 2 days before pay date (13th for 15th pay date)
    const deadline15 = new Date(year, month, 13);
    
    // Second pay period (16th-last day)
    // For August 2025: 31st is a Sunday, so move to Friday 29th
    let payDateLast = new Date(year, month + 1, 0); // Last day of month
    if (payDateLast.getDay() === 0) { // Sunday
        payDateLast.setDate(payDateLast.getDate() - 2); // Move to Friday
    } else if (payDateLast.getDay() === 6) { // Saturday
        payDateLast.setDate(payDateLast.getDate() - 1); // Move to Friday
    }
    
    // Mark work period days 16-last (but only the first and last for visual clarity)
    addPayrollDate(dates, new Date(year, month, 16), 'work-done', ['Semi-Monthly']);
    const lastDay = new Date(year, month + 1, 0).getDate();
    addPayrollDate(dates, new Date(year, month, lastDay), 'work-done', ['Semi-Monthly']);
    
    // Deadline is 2 days before adjusted pay date
    const deadlineLast = new Date(payDateLast);
    deadlineLast.setDate(deadlineLast.getDate() - 2);
    
    // Add semi-monthly deadlines and pay dates
    addPayrollDate(dates, deadline15, 'deadline', ['Semi-Monthly']);
    addPayrollDate(dates, payDate15, 'pay-day', ['Semi-Monthly']);
    addPayrollDate(dates, deadlineLast, 'deadline', ['Semi-Monthly']);
    addPayrollDate(dates, payDateLast, 'pay-day', ['Semi-Monthly']);
    
    // Weekly schedule (every Friday)
    // For August 2025: Fridays are 1st, 8th, 15th, 22nd, 29th
    const fridays = [1, 8, 15, 22, 29];
    
    fridays.forEach(fridayDate => {
        // Pay date is Friday
        const payDate = new Date(year, month, fridayDate);
        
        // Deadline is Thursday (day before)
        const deadline = new Date(year, month, fridayDate - 1);
        
        // Mark Monday-Friday as work days for that week
        const mondayDate = fridayDate - 4; // Monday is 4 days before Friday
        for (let d = mondayDate; d <= fridayDate; d++) {
            if (d >= 1 && d <= 31) { // Make sure date is valid
                addPayrollDate(dates, new Date(year, month, d), 'work-done', ['Weekly']);
            }
        }
        
        // Add deadline and pay date
        addPayrollDate(dates, deadline, 'deadline', ['Weekly']);
        addPayrollDate(dates, payDate, 'pay-day', ['Weekly']);
    });
    
    return dates;
}

// Helper function to add payroll date
function addPayrollDate(dates, date, type, schedules) {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (!dates[dateKey]) {
        dates[dateKey] = {
            type: type,
            schedules: schedules
        };
    } else {
        // If date already exists, merge schedules
        dates[dateKey].schedules = [...new Set([...dates[dateKey].schedules, ...schedules])];
    }
}

// Adjust date for weekends and holidays
function adjustForWeekendAndHolidays(date) {
    let adjusted = new Date(date);
    
    // Check if weekend
    while (adjusted.getDay() === 0 || adjusted.getDay() === 6) {
        adjusted.setDate(adjusted.getDate() - 1); // Move to previous Friday
    }
    
    // Check if holiday
    const dateStr = `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
    const holiday = window.holidays2025.find(h => h.date === dateStr);
    
    if (holiday) {
        adjusted.setDate(adjusted.getDate() - 1); // Move to day before
        // Check again for weekend
        while (adjusted.getDay() === 0 || adjusted.getDay() === 6) {
            adjusted.setDate(adjusted.getDate() - 1);
        }
    }
    
    return adjusted;
}

// Adjust date for holidays only (used for weekly)
function adjustForHolidays(date) {
    let adjusted = new Date(date);
    
    const dateStr = `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
    const holiday = window.holidays2025.find(h => h.date === dateStr);
    
    if (holiday) {
        adjusted.setDate(adjusted.getDate() - 1); // Move to day before
    }
    
    return adjusted;
}

// Make functions globally available
window.changePayrollCalendarMonth = changePayrollCalendarMonth;

// Function to handle calendar view changes
function changeCalendarView() {
    const selectElement = document.getElementById('calendarViewSelect');
    if (!selectElement) return;
    
    const selectedView = selectElement.value;
    const chatCalendarContainer = selectElement.closest('.chat-calendar-container');
    
    // Remove existing view classes
    chatCalendarContainer.classList.remove('holiday-view', 'weekend-view');
    
    // Add new view class based on selection
    if (selectedView === 'holiday') {
        chatCalendarContainer.classList.add('holiday-view');
    } else if (selectedView === 'weekend') {
        chatCalendarContainer.classList.add('weekend-view');
    }
    
    // Update all calendar days to show/hide highlights
    const calendarDays = chatCalendarContainer.querySelectorAll('.chat-calendar-grid > div');
    calendarDays.forEach(dayElement => {
        if (!dayElement.textContent) return; // Skip empty cells
        
        const dayNum = parseInt(dayElement.textContent);
        if (!dayNum) return;
        
        // Check if this is a weekend or holiday
        const currentDate = new Date(2025, 7, dayNum); // August 2025
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Check for holidays (using the existing holidays2025 array)
        const dateStr = `2025-08-${String(dayNum).padStart(2, '0')}`;
        const isHoliday = window.holidays2025 && window.holidays2025.some(h => h.date === dateStr);
        
        // Apply visual indicators based on view
        if (selectedView === 'weekend' && isWeekend) {
            dayElement.style.position = 'relative';
            if (!dayElement.querySelector('.weekend-indicator')) {
                dayElement.innerHTML += '<div class="weekend-indicator" style="position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; background: #ff9800; border-radius: 50%;"></div>';
            }
        } else if (selectedView === 'holiday' && isHoliday) {
            dayElement.style.position = 'relative';
            if (!dayElement.querySelector('.holiday-indicator')) {
                dayElement.innerHTML += '<div class="holiday-indicator" style="position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; background: #9c27b0; border-radius: 50%;"></div>';
            }
        } else {
            // Remove indicators if switching back to default
            const indicators = dayElement.querySelectorAll('.weekend-indicator, .holiday-indicator');
            indicators.forEach(ind => ind.remove());
        }
    });
}

// Make function globally available
window.changeCalendarView = changeCalendarView;

// Generate calendar view for chat display
function generateChatCalendarView() {
    const augustMonth = 7; // August is month 7 (0-indexed)
    const year = 2025;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    let calendarHtml = `
    <div class="chat-calendar-container" style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <div class="calendar-controls-wrapper" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #333; font-size: 20px;">${monthNames[augustMonth]} ${year} - Payroll Calendar</h3>
            <div class="calendar-view-selector" style="position: relative;">
                <select id="calendarViewSelect" onchange="changeCalendarView()" style="padding: 8px 32px 8px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; font-size: 14px; color: #333; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                    <option value="default">Default View</option>
                    <option value="holiday">Holiday Adjustments</option>
                    <option value="weekend">Weekend Adjustments</option>
                </select>
                <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #666;">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Semi-Monthly Schedule -->
        <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: #333;">Semi-Monthly Schedule</h4>
            <div class="chat-calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; font-size: 13px;">
    `;
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHtml += `<div style="text-align: center; font-size: 11px; font-weight: 600; color: #666; padding: 6px 0;">${day}</div>`;
    });
    
    // Calculate calendar days
    const firstDay = new Date(year, augustMonth, 1);
    const lastDay = new Date(year, augustMonth + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
        calendarHtml += `<div></div>`;
    }
    
    // Get payroll dates for August 2025
    const payrollDates = getPayrollDatesForMonth(augustMonth, year);
    
    // Add days for semi-monthly
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(augustMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const payrollEvent = payrollDates[dateKey];
        
        let dayStyle = 'padding: 6px; text-align: center; border-radius: 4px; font-size: 12px; background: #f5f5f5; position: relative;';
        let displayContent = day;
        
        if (payrollEvent && payrollEvent.schedules.includes('Semi-Monthly')) {
            if (payrollEvent.type === 'work-done') {
                // Show work period ranges only on key dates
                if (day === 1) {
                    dayStyle += ' background: #d4f4dd; border: 1px solid #4CAF50; font-weight: 600;';
                    displayContent = `<div>${day}</div><div style="font-size: 9px;">1-15</div>`;
                } else if (day === 16) {
                    dayStyle += ' background: #d4f4dd; border: 1px solid #4CAF50; font-weight: 600;';
                    displayContent = `<div>${day}</div><div style="font-size: 9px;">16-31</div>`;
                } else if (day === 15 || day === 31) {
                    dayStyle += ' background: #d4f4dd; border: 1px solid #4CAF50;';
                }
            } else if (payrollEvent.type === 'deadline') {
                dayStyle += ' background: #ffe6e6; border: 1px solid #f44336; font-weight: 600;';
                displayContent = `<div>${day}</div><div style="font-size: 9px;">Submit</div>`;
            } else if (payrollEvent.type === 'pay-day') {
                dayStyle += ' background: #e3f2fd; border: 1px solid #2196F3; font-weight: 600;';
                displayContent = `<div>${day}</div><div style="font-size: 9px;">Pay</div>`;
            }
        }
        
        calendarHtml += `<div style="${dayStyle}">${displayContent}</div>`;
    }
    
    calendarHtml += `
            </div>
        </div>
        
        <!-- Weekly Schedule -->
        <div style="background: white; border-radius: 8px; padding: 16px;">
            <h4 style="margin: 0 0 12px 0; color: #333;">Weekly Schedule</h4>
            <div class="chat-calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; font-size: 13px;">
    `;
    
    // Add day headers again for weekly
    dayHeaders.forEach(day => {
        calendarHtml += `<div style="text-align: center; font-size: 11px; font-weight: 600; color: #666; padding: 6px 0;">${day}</div>`;
    });
    
    // Add empty cells again
    for (let i = 0; i < startDate; i++) {
        calendarHtml += `<div></div>`;
    }
    
    // Add days for weekly
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(augustMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const payrollEvent = payrollDates[dateKey];
        const currentDate = new Date(year, augustMonth, day);
        const dayOfWeek = currentDate.getDay();
        
        let dayStyle = 'padding: 6px; text-align: center; border-radius: 4px; font-size: 12px; background: #f5f5f5; position: relative;';
        let displayContent = day;
        
        if (payrollEvent && payrollEvent.schedules.includes('Weekly')) {
            if (payrollEvent.type === 'work-done' && dayOfWeek === 1) { // Monday - start of work week
                dayStyle += ' background: #d4f4dd; border: 1px solid #4CAF50; font-weight: 600;';
                displayContent = `<div>${day}</div><div style="font-size: 9px;">Mon-Fri</div>`;
            } else if (payrollEvent.type === 'work-done') {
                dayStyle += ' background: #d4f4dd; border: 1px solid #4CAF50;';
            } else if (payrollEvent.type === 'deadline') {
                dayStyle += ' background: #ffe6e6; border: 1px solid #f44336; font-weight: 600;';
                displayContent = `<div>${day}</div><div style="font-size: 9px;">Submit</div>`;
            } else if (payrollEvent.type === 'pay-day') {
                dayStyle += ' background: #e3f2fd; border: 1px solid #2196F3; font-weight: 600;';
                displayContent = `<div>${day}</div><div style="font-size: 9px;">Pay</div>`;
            }
        }
        
        calendarHtml += `<div style="${dayStyle}">${displayContent}</div>`;
    }
    
    calendarHtml += `
            </div>
        </div>
        
        <div style="margin-top: 16px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 16px; height: 16px; background: #d4f4dd; border: 1px solid #4CAF50; border-radius: 3px;"></div>
                <span style="color: #666;">Work period</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 16px; height: 16px; background: #ffe6e6; border: 1px solid #f44336; border-radius: 3px;"></div>
                <span style="color: #666;">Payroll deadline (1:30 PM EST)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 16px; height: 16px; background: #e3f2fd; border: 1px solid #2196F3; border-radius: 3px;"></div>
                <span style="color: #666;">Pay day</span>
            </div>
        </div>
    </div>
    `;
    
    return calendarHtml;
}

function generateSemiMonthlyCalendar() {
    let calendarHtml = '<div class="calendar-container">';

    // First example - Normal payroll process
    calendarHtml += `
        <div class="example-section">
            <h3>📋 Standard Payroll Process Example</h3>
            <div class="example-description">Your first Semi-Monthly payroll in August 2025</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Pay Period: August 1-15, 2025</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Wed, Aug 13</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Thu, Aug 14</div>
                    </div>
                    <div class="date-item pay">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Fri, Aug 15</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Weekend adjustment example
    calendarHtml += `
        <div class="example-section">
            <h3>📅 Weekend Adjustment Example</h3>
            <div class="example-description">When pay date falls on weekend (March 15, 2025 is Saturday)</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Pay Period: March 1-15, 2025</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Wed, Mar 12</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Thu, Mar 13</div>
                    </div>
                    <div class="date-item pay adjusted">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Fri, Mar 14</div>
                        <div class="adjustment-note">🔄 Moved from Sat, Mar 15 (weekend)</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Holiday adjustment example
    calendarHtml += `
        <div class="example-section">
            <h3>🎃 Holiday Adjustment Example</h3>
            <div class="example-description">When pay date falls on holiday (October 31, 2025 is Halloween/observed holiday)</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Pay Period: October 16-31, 2025</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Tue, Oct 28</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Wed, Oct 29</div>
                    </div>
                    <div class="date-item pay adjusted">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Thu, Oct 30</div>
                        <div class="adjustment-note">🔄 Moved from Fri, Oct 31 (Halloween observed)</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    calendarHtml += '</div>';
    return calendarHtml;
}

function generateWeeklyCalendar() {
    let calendarHtml = '<div class="calendar-container weekly">';

    // First example - Normal weekly payroll
    calendarHtml += `
        <div class="example-section">
            <h3>📋 Standard Weekly Process Example</h3>
            <div class="example-description">Your first Weekly payroll in August 2025</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Week ending Friday, August 8, 2025</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Wed, Aug 6</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Thu, Aug 7</div>
                    </div>
                    <div class="date-item pay">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Fri, Aug 8</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Weekend adjustment example - July 4th 2026 falls on Saturday, so Friday July 3rd would be pay day but that's July 4th observed
    calendarHtml += `
        <div class="example-section">
            <h3>📅 Weekend + Holiday Combo Example</h3>
            <div class="example-description">When Friday pay date is July 4th observed holiday (July 2026)</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Week ending Friday, July 3, 2026</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Tue, Jun 30</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Wed, Jul 1</div>
                    </div>
                    <div class="date-item pay adjusted">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Thu, Jul 2</div>
                        <div class="adjustment-note">🔄 Moved from Fri, Jul 3 (July 4th observed)</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Holiday on different day example
    calendarHtml += `
        <div class="example-section">
            <h3>🦃 Holiday Adjustment Example</h3>
            <div class="example-description">When Friday falls on Thanksgiving (November 28, 2025)</div>
            <div class="payroll-cycle example">
                <div class="cycle-header">Week ending Friday, November 28, 2025</div>
                <div class="cycle-dates">
                    <div class="date-item submit">
                        <div class="date-label">Submit by</div>
                        <div class="date-value">Mon, Nov 24</div>
                        <div class="date-note">1:30 PM EST</div>
                    </div>
                    <div class="date-item process">
                        <div class="date-label">Processing</div>
                        <div class="date-value">Tue, Nov 25</div>
                    </div>
                    <div class="date-item pay adjusted">
                        <div class="date-label">Pay Date</div>
                        <div class="date-value">Wed, Nov 26</div>
                        <div class="adjustment-note">🔄 Moved from Fri, Nov 28 (Thanksgiving)</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    calendarHtml += '</div>';
    return calendarHtml;
}

function getSemiMonthlyDatesForMonth(monthName, year) {
    const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);

    const cycles = [];

    // 15th pay date
    let payDate15 = new Date(year, monthIndex, 15);
    const adjusted15 = adjustForWeekendAndHoliday(payDate15);
    const submit15 = getBusinessDaysBefore(adjusted15.date, 2);
    const process15 = getBusinessDaysBefore(adjusted15.date, 1);

    cycles.push({
        period: `1st-15th ${monthName}`,
        submitBy: formatDate(submit15),
        processing: formatDate(process15),
        payDate: formatDate(adjusted15.date),
        adjusted: adjusted15.adjusted,
        adjustmentReason: adjusted15.reason
    });

    // Last day pay date
    const lastDay = new Date(year, monthIndex + 1, 0);
    const adjustedLast = adjustForWeekendAndHoliday(lastDay);
    const submitLast = getBusinessDaysBefore(adjustedLast.date, 2);
    const processLast = getBusinessDaysBefore(adjustedLast.date, 1);

    cycles.push({
        period: `16th-${lastDay.getDate()} ${monthName}`,
        submitBy: formatDate(submitLast),
        processing: formatDate(processLast),
        payDate: formatDate(adjustedLast.date),
        adjusted: adjustedLast.adjusted,
        adjustmentReason: adjustedLast.reason
    });

    return cycles;
}

function getWeeklyDatesForFriday(friday) {
    const adjusted = adjustForWeekendAndHoliday(friday);
    const submit = getBusinessDaysBefore(adjusted.date, 2);
    const process = getBusinessDaysBefore(adjusted.date, 1);

    return {
        submitBy: formatDate(submit),
        processing: formatDate(process),
        payDate: formatDate(adjusted.date),
        adjusted: adjusted.adjusted,
        adjustmentReason: adjusted.reason
    };
}

function adjustForWeekendAndHoliday(date) {
    let adjustedDate = new Date(date);
    let adjusted = false;
    let reason = '';

    // Check if it's a weekend
    if (adjustedDate.getDay() === 6) { // Saturday
        adjustedDate.setDate(adjustedDate.getDate() - 1); // Move to Friday
        adjusted = true;
        reason = 'weekend';
    } else if (adjustedDate.getDay() === 0) { // Sunday
        adjustedDate.setDate(adjustedDate.getDate() - 2); // Move to Friday
        adjusted = true;
        reason = 'weekend';
    }

    // Check if it's a holiday
    const dateStr = adjustedDate.toISOString().split('T')[0];
    const holiday = window.holidays2025.find(h => h.date === dateStr);
    if (holiday) {
        // Move to previous business day
        do {
            adjustedDate.setDate(adjustedDate.getDate() - 1);
        } while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6);
        adjusted = true;
        reason = holiday.name;
    }

    return { date: adjustedDate, adjusted, reason };
}

function getBusinessDaysBefore(date, days) {
    let result = new Date(date);
    let businessDays = 0;

    while (businessDays < days) {
        result.setDate(result.getDate() - 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) { // Not weekend
            businessDays++;
        }
    }

    return result;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showScheduleSimulation(scheduleType) {
    // Update tab active state
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    const calendarSimulation = document.getElementById('calendarSimulation');

    if (calendarSimulation) {
        if (scheduleType === 'semi-monthly') {
            calendarSimulation.innerHTML = generateSemiMonthlyCalendar();
        } else {
            calendarSimulation.innerHTML = generateWeeklyCalendar();
        }
    }
}

// Function to update the right panel with the Bi-Weekly schedule details
function updateRightPanelWithBiWeekly() {
    // Update the step progress
    const stepProgress = document.querySelector('.step-progress');
    if (stepProgress) {
        stepProgress.innerHTML = '📅 Bi-Weekly Schedule Added: Fill in Name and First Pay Date';
    }

    // Find the schedule cards container or create it if it doesn't exist
    let scheduleCardsContainer = document.querySelector('.schedule-cards');
    if (!scheduleCardsContainer) {
        scheduleCardsContainer = document.createElement('div');
        scheduleCardsContainer.className = 'schedule-cards';
        const panelContent = document.querySelector('.panel-content');
        panelContent.appendChild(scheduleCardsContainer);
    }

    // Create the new bi-weekly card
    const biWeeklyCard = document.createElement('div');
    biWeeklyCard.className = 'schedule-card';
    biWeeklyCard.id = 'biweekly-card';
    biWeeklyCard.innerHTML = `
        <div class="card-header">
            <div class="card-title">Bi-Weekly</div>
        </div>
        <div class="card-body">
            <div class="schedule-detail">
                <div class="detail-label">Name</div>
                <div class="detail-value editable-field missing-field" onclick="makeScheduleFieldEditable('biweekly', 'name', this)">
                    Click to add name
                </div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">First pay date</div>
                <div class="detail-value editable-field missing-field" onclick="makeScheduleFieldEditable('biweekly', 'firstPayDate', this)">
                    Click to add first pay date
                </div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Frequency</div>
                <div class="detail-value">26 pay periods/year</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Payroll Date</div>
                <div class="detail-value">Every other Friday</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Hours per Pay Period</div>
                <div class="detail-value">80 hours</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Weekend pay date</div>
                <div class="detail-value">Friday before the date</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Holiday pay date</div>
                <div class="detail-value">Business before the date</div>
            </div>
        </div>
    `;

    // Add the new card to the container
    scheduleCardsContainer.appendChild(biWeeklyCard);
}


function addMonthlySchedule() {
    // Find the schedule cards container
    let scheduleCardsContainer = document.querySelector('.schedule-cards');
    if (!scheduleCardsContainer) {
        scheduleCardsContainer = document.createElement('div');
        scheduleCardsContainer.className = 'schedule-cards';
        const panelContent = document.querySelector('.panel-content');
        panelContent.appendChild(scheduleCardsContainer);
    }

    // Create the new monthly card
    const monthlyCard = document.createElement('div');
    monthlyCard.className = 'schedule-card';
    monthlyCard.innerHTML = `
        <div class="card-header">
            <div class="card-title">Monthly</div>
        </div>
        <div class="card-body">
            <div class="schedule-detail">
                <div class="detail-label">Frequency</div>
                <div class="detail-value">12 pay periods/year</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Payroll Date</div>
                <div class="detail-value">Last day of month</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Hours per Pay Period</div>
                <div class="detail-value">173 hours (average)</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Weekend pay date</div>
                <div class="detail-value">Friday before the date</div>
            </div>
            <div class="schedule-detail">
                <div class="detail-label">Holiday pay date</div>
                <div class="detail-value">Business before the date</div>
            </div>
        </div>
    `;

    // Add the new card to the container
    scheduleCardsContainer.appendChild(monthlyCard);
}


// Pagination state
let currentPage = 1;
const itemsPerPage = 10;

// Implement the function getStatusBadge to return the appropriate tag
function getStatusBadge(assessment) {
    // Normalize assessment value and handle edge cases
    const normalizedAssessment = (assessment || '').toLowerCase().trim();
    
    switch (normalizedAssessment) {
        case 'confident':
            return '<span class="assessment-badge confident">Exact match</span>';
        case 'review':
            return '<span class="assessment-badge review">Review</span>';
        case 'missing':
        case '':  // Handle empty strings as missing
        case null:
        case undefined:
            return '<span class="assessment-badge missing">Red</span>';
        default:
            console.log('Unknown assessment value:', assessment); // Debug log
            return '<span class="assessment-badge missing">Red</span>'; // Default to Red instead of Unknown
    }
}

function showEarningCodesStatsCards() {
    const stats = calculateEarningCodesStats();

    return `
        <div class="earning-codes-stats-container">
            <div class="stats-title">
                Earning Codes Overview
            </div>
            <div class="stats-grid">
                <div class="stat-card approved">
                    <div class="stat-number">${stats.approved}</div>
                    <div class="stat-label">Approved Codes</div>
                   

                <div class="stat-card deleted">
                    <div class="stat-number">${stats.deleted}</div>
                    <div class="stat-label">Deleted Codes</div>
                
            
            </div>
        </div>
    `;
}

function calculateEarningCodesStats() {
    const activeEarningCodes = earningCodes.filter(code => !code.deleted);
    const deletedEarningCodes = earningCodes.filter(code => code.deleted);

    const approvedCount = activeEarningCodes.filter(code => code.reviewed === true).length;
    const deletedCount = deletedEarningCodes.length;
    const totalCount = earningCodes.length;
    const activeCount = activeEarningCodes.length;

    const approvalRate = activeCount > 0 ? (approvedCount / activeCount) * 100 : 0;

    return {
        approved: approvedCount,
        deleted: deletedCount,
        total: totalCount,
        active: activeCount,
        approvalRate: Math.round(approvalRate)
    };
}


function generatePaginationControls(totalPages, totalItems) {
    if (totalPages <= 1) return '';

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    let paginationButtons = '';
    
    // Previous button
    paginationButtons += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="material-icons">chevron_left</i>
        </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationButtons += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationButtons += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationButtons += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationButtons += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationButtons += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationButtons += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="material-icons">chevron_right</i>
        </button>
    `;

    return `
        <div class="pagination-container">
            <div class="pagination-info">
                Showing ${startItem}-${endItem} of ${totalItems} earning codes
            </div>
            <div class="pagination-controls">
                ${paginationButtons}
            </div>
        </div>
    `;
}

function changePage(page) {
    const totalPages = Math.ceil(earningCodes.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    showEarningCodesReview();
}
// Handle real-time input changes
function handleEarningCodeInput(inputElement) {
    const code = inputElement.getAttribute('data-code');
    const field = inputElement.getAttribute('data-field');
    const value = inputElement.value.trim();

    // Remove missing field styling when user starts typing
    if (value.length > 0) {
        inputElement.classList.remove('missing-field');
    } else {
        inputElement.classList.add('missing-field');
    }

    // Real-time validation feedback
    if (field === 'code' && value.length > 0) {
        // Validate code format (uppercase, no special chars except underscore)
        const isValidCode = /^[A-Z0-9_]+$/.test(value);
        if (!isValidCode) {
            inputElement.classList.add('validation-error');
        } else {
            inputElement.classList.remove('validation-error');
        }
    }
}

// Save field changes to data model
function saveEarningCodeField(inputElement) {
    const codeId = inputElement.getAttribute('data-code') || inputElement.getAttribute('data-original-code');
    const field = inputElement.getAttribute('data-field');
    const value = inputElement.value.trim();

    const code = earningCodes.find(c => c.code === codeId);
    if (!code) return;

    if (field === 'code') {
        const isValid = /^[A-Z0-9_]+$/.test(value);
        const isDuplicate = earningCodes.some(c => c.code === value && c !== code);
        if (!isValid || isDuplicate) {
            inputElement.classList.add('validation-error');
            return;
        }
        code.code = value;
        inputElement.setAttribute('data-code', value);
    } else {
        code[field] = value;
    }

    inputElement.classList.remove('missing-field');
    inputElement.classList.remove('validation-error');
}


// Delete earning code
function editAllCodes() {
    console.log('[Edit Mode] Bulk editing enabled');

    isBulkEditing = true;
    showEarningCodesReview();
    
    // Get all visible earning codes on current page
    const visibleRows = document.querySelectorAll('.review-table tbody tr');
    console.log('Found visible rows:', visibleRows.length);
    
    let fieldsConverted = 0;
    
    visibleRows.forEach((row, index) => {
        // Get the code ID from the checkbox
        const checkbox = row.querySelector('.code-checkbox');
        if (!checkbox) return;
        
        const codeId = checkbox.getAttribute('data-code');
        const code = earningCodes.find(c => c.code === codeId);
        if (!code) return;
        
        console.log(`Processing row ${index + 1}, code: ${codeId}`);
        
        // Force code field to be editable (column 1)
        const codeCell = row.cells[1];
        if (codeCell) {
            const currentValue = code.code || '';
            codeCell.innerHTML = `
                <input 
                    type="text" 
                    class="earning-code-input code-field" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Code..." 
                    data-original-code="${code.code}"
                    data-field="code"
                    oninput="handleEarningCodeInput(this)"
                    onblur="saveEarningCodeField(this)">
            `;
            fieldsConverted++;
            console.log(`Converted code field for ${codeId}`);
        }
        
        // Force name field to be editable (column 2)
        const nameCell = row.cells[2];
        if (nameCell) {
            const currentValue = code.name || '';
            nameCell.innerHTML = `
                <input 
                    type="text" 
                    class="earning-code-input" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Enter earning code name..." 
                    data-code="${code.code}"
                    data-field="name"
                    oninput="handleEarningCodeInput(this)"
                    onblur="saveEarningCodeField(this)">
            `;
            fieldsConverted++;
            console.log(`Converted name field for ${codeId}`);
        }
        
        // Force description field to be editable (column 3)
        const descCell = row.cells[3];
        if (descCell) {
            const currentValue = code.description || '';
            descCell.innerHTML = `
                <input 
                    type="text" 
                    class="earning-code-input" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Enter description..." 
                    data-code="${code.code}"
                    data-field="description"
                    oninput="handleEarningCodeInput(this)"
                    onblur="saveEarningCodeField(this)">
            `;
            fieldsConverted++;
            console.log(`Converted description field for ${codeId}`);
        }
    });
    
    console.log(`✅ Successfully converted ${fieldsConverted} fields to editable inputs across ${visibleRows.length} rows`);
    
    // Show a message to indicate all fields are now editable
    addMessage(`✅ All fields are now editable! Made ${fieldsConverted} fields editable across ${visibleRows.length} earning codes.`, 'ai');
}

function approveCode(codeId) {
    const code = earningCodes.find(c => c.code === codeId);

    if (code.assessment === 'missing' && (!code.name || !code.description)) {
        addMessage(`Cannot approve "${codeId}" - Missing codes need both name and description filled in before approval.`, 'ai');
        return;
    }

    if (code && !code.reviewed) {
        code.reviewed = true;
        reviewProgress.reviewedCodes++;
        reviewProgress.approvedCodes.push(codeId);
        
        showEarningCodesReview(); // Refresh the table
    }
}

function deleteEarningCode(codeId) {
  const code = earningCodes.find(c => c.code === codeId);
  if (code) {
    code.deleted = true;
    showEarningCodesReview(); // refresh UI

    // Optional confirmation message
    addMessage(`🗑️ Earning code "${codeId}" has been marked as deleted.`, 'ai', [
      { action: 'undo-delete', text: 'Revert delete' }
    ]);
  }
}


function approveSelectedCodes() {
    const selectedCheckboxes = document.querySelectorAll('.code-checkbox:checked');
    let approvedCount = 0;

    selectedCheckboxes.forEach(checkbox => {
        const codeId = checkbox.getAttribute('data-code');
        const code = earningCodes.find(c => c.code === codeId);

        if (code && !code.reviewed) {
            if (code.assessment === 'missing' && (!code.name || !code.description)) {
                return; // Skip codes that need completion
            }

            code.reviewed = true;
            reviewProgress.reviewedCodes++;
            reviewProgress.approvedCodes.push(codeId);
            approvedCount++;
        }
    });

    if (approvedCount > 0) {
        showEarningCodesReview();
    }
}

function approveAllCodes() {
    let approvedCount = 0;
    earningCodes.forEach(code => {
        if (!code.reviewed) {
            // Skip codes with missing assessment - they need manual completion
            if (code.assessment === 'missing' && (!code.name || !code.description)) {
                return; // Don't approve missing codes that aren't filled in
            }

            code.reviewed = true;
            reviewProgress.reviewedCodes++;
            reviewProgress.approvedCodes.push(code.code);
            approvedCount++;
        }
    });

    // Show as USER message (user performed the action)
    addMessage(`Approve all ${approvedCount} remaining codes`, 'user');
    showEarningCodesReview();

    // Check if there are still missing codes that need completion
    const missingCodes = earningCodes.filter(code => code.assessment === 'missing' && (!code.name || !code.description));
    
    if (missingCodes.length > 0) {
        setTimeout(function() {
            addMessage(`${missingCodes.length} codes with Missing information still need to be completed before proceeding. Please fill in the name and description for codes marked as "Missing".`, 'ai');
        }, 1000);
    } else {
        // Auto-transition to recommendations after a short delay
        setTimeout(function() {
            addMessage("${CONSTANTS.MESSAGES.PERFECT} All earning codes have been reviewed. Now let me show you my recommendations to optimize your setup.", 'ai');

            setTimeout(function() {
                showAISuggestions();
            }, 1500);
        }, 1000);
    }
}

function makeFieldEditable(codeId, field) {
    const code = earningCodes.find(c => c.code === codeId);
    if (!code) return;

    // Find the read-only field container
    const readOnlySpan = document.querySelector(`[data-code="${codeId}"][data-field="${field}"]`);
    if (!readOnlySpan) return;

    const container = readOnlySpan.parentElement;
    const currentValue = code[field] || '';

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'earning-code-input';
    input.setAttribute('data-code', codeId);
    input.setAttribute('data-field', field);

    // Handle saving
    const saveField = function() {
        const newValue = input.value.trim();
        code[field] = newValue;
        
        // Update assessment if needed
        if (code.name && code.description && code.assessment === 'missing') {
            code.assessment = 'confident';
        }
        
        showEarningCodesReview(); // Refresh table
    };

    input.onblur = saveField;
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            saveField();
        }
        if (e.key === 'Escape') {
            showEarningCodesReview(); // Cancel edit
        }
    };

    // Replace the container content with just the input
    container.innerHTML = '';
    container.appendChild(input);
    input.focus();
    input.select();
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.code-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });

    updateBulkActions();
}

function toggleAllEarningCodes(checked) {
    const checkboxes = document.querySelectorAll('.code-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checked;
    });

    updateBulkActions();
}

function updateBulkActions() {
    const all = document.querySelectorAll('.code-checkbox');
    const selected = document.querySelectorAll('.code-checkbox:checked');

    const approveBtn = document.getElementById('bulkApproveBtn');
    const deleteBtn = document.getElementById('bulkDeleteBtn');
    const selectAll = document.getElementById('selectAllCodes');

    if (approveBtn) approveBtn.disabled = selected.length === 0;
    if (deleteBtn) deleteBtn.disabled = selected.length === 0;
    if (selectAll) selectAll.checked = selected.length === all.length;
}


function deleteSelectedCodes() {
    const checkboxes = document.querySelectorAll('.code-checkbox:checked');
    checkboxes.forEach(cb => {
        const code = cb.dataset.code;
        const index = earningCodes.findIndex(c => c.code === code);
        if (index !== -1) {
            earningCodes[index].deleted = true;
        }
    });

    showEarningCodesReview({ showMessage: false });
}

function toggleBulkEdit() {
    console.log('toggleBulkEdit function called');
    
    // Get all visible earning codes on current page
    const visibleRows = document.querySelectorAll('.review-table tbody tr');
    console.log('Found visible rows:', visibleRows.length);

    let fieldsConverted = 0;

    visibleRows.forEach((row, index) => {
        const checkbox = row.querySelector('.code-checkbox');
        if (!checkbox) return;

        const codeId = checkbox.getAttribute('data-code');
        const code = earningCodes.find(c => c.code === codeId);
        if (!code) return;

        console.log(`Processing row ${index + 1}, code: ${codeId}`);

        // Convert Code field (column 1)
        const codeCell = row.cells[1];
        if (codeCell && !codeCell.querySelector('input')) {
            const currentValue = code.code || '';
            codeCell.innerHTML = `
                <input 
                    type="text" 
                    class="md-input" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Code..." 
                    data-code="${code.code}"
                    data-field="code"
                    onchange="updateEarningCodeField(this)"
                    onblur="updateEarningCodeField(this)">
            `;
            fieldsConverted++;
        }

        // Convert Name field (column 2)
        const nameCell = row.cells[2];
        if (nameCell && !nameCell.querySelector('input')) {
            const currentValue = code.name || '';
            nameCell.innerHTML = `
                <input 
                    type="text" 
                    class="md-input" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Enter earning code name..." 
                    data-code="${code.code}"
                    data-field="name"
                    onchange="updateEarningCodeField(this)"
                    onblur="updateEarningCodeField(this)">
            `;
            fieldsConverted++;
        }

        // Convert Description field (column 3)
        const descCell = row.cells[3];
        if (descCell && !descCell.querySelector('input')) {
            const currentValue = code.description || '';
            descCell.innerHTML = `
                <input 
                    type="text" 
                    class="md-input" 
                    value="${currentValue.replace(/"/g, '&quot;')}" 
                    placeholder="Enter description..." 
                    data-code="${code.code}"
                    data-field="description"
                    onchange="updateEarningCodeField(this)"
                    onblur="updateEarningCodeField(this)">
            `;
            fieldsConverted++;
        }
    });

    console.log(`✅ Converted ${fieldsConverted} fields to editable inputs`);
    
    // Update the "Edit All" link text to indicate bulk edit mode is active
    const editAllLink = document.querySelector('.edit-all-link');
    if (editAllLink) {
        editAllLink.textContent = 'Exit Edit Mode';
        editAllLink.onclick = function() { showEarningCodesReview({ showMessage: false }); };
    }
}

// Keep the old function name for compatibility but redirect to new one
function editAllCodes() {
    toggleBulkEdit();
}


function showAISuggestions() {
    currentStep = 4;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 5 of 7: Suggestions';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Recommendations to Optimize Earning Codes';
    }
    if (panelSubtitle) {
        const processedCount = aiSuggestions.filter(s => s.status !== 'pending').length;
        panelSubtitle.innerHTML = `Review and decide on ${aiSuggestions.length} AI suggestions (${processedCount} processed)`;
    }

    // Replace panel content with suggestions
    const panelContent = document.querySelector('.panel-content');
    
    // Replace the panelContent.innerHTML = `` section in showAISuggestions() with this:
    panelContent.innerHTML = `
        <div class="suggestions-container-vertical">
            ${aiSuggestions.map(suggestion => `
                <div class="suggestion-card suggestion-vertical-simple ${suggestion.status}">
                    <div class="suggestion-header-simple">
                        <h3 class="suggestion-title-simple">${suggestion.title}</h3>
                        ${suggestion.status !== 'pending' ? `
                            <span class="suggestion-status-badge ${suggestion.status}">
                                ${suggestion.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                            </span>
                        ` : ''}
                    </div>

                    <div class="suggestion-body-simple">
                        <p class="suggestion-description-simple">${suggestion.description}</p>

                        <div class="suggestion-changes-section">
                            <h4 class="changes-header">Changes:</h4>
                            <div class="changes-content">
                                ${generateChangeLines(suggestion)}
                            </div>
                        </div>

                        <div class="suggestion-impact-simple">
                            <strong>Impact:</strong> ${suggestion.impact}
                        </div>
                    </div>

                    <div class="suggestion-actions-simple">
                        ${suggestion.status === 'pending' ? `
                            <button class="accept-btn-simple" onclick="acceptSuggestion(${suggestion.id})">Accept</button>
                            <button class="reject-btn-simple" onclick="rejectSuggestion(${suggestion.id})">Reject</button>
                        ` : `
                            <button class="undo-btn-simple" onclick="undoSuggestion(${suggestion.id})">Undo</button>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Update panel actions
    const panelActions = document.querySelector('.panel-actions');
    if (panelActions) {
        const allProcessed = aiSuggestions.every(s => s.status !== 'pending');
        panelActions.innerHTML = `
            <button class="next-step-btn" onclick="continueToFinalRates()" ${!allProcessed ? 'disabled' : ''}>
                Continue to earning code configuration
            </button>
        `;
    }
}

function continueToRateConfiguration() {
    if (reviewProgress.reviewedCodes < reviewProgress.totalCodes) {
        addMessage("Please review and confirm all earning codes before continuing.", 'ai');
        return;
    }

    // This should go to AI Suggestions (Step 4), not directly to Rate Configuration
    showAISuggestions();
}

// Update panel header with toggle buttons
const panelHeader = document.querySelector('.panel-header h2');
const panelSubtitle = document.querySelector('.panel-subtitle');
if (panelHeader) {
    panelHeader.innerHTML = `
        Weighted Average Overtime Configuration
        <div class="view-toggle" style="display: inline-flex; margin-left: 20px; background: #f8f9fa; border-radius: 8px; padding: 4px; gap: 4px;">
            <button class="toggle-btn active" id="tableViewBtn" onclick="switchToTableView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                <span class="material-icons" style="font-size: 16px;">table_chart</span>
            </button>
            <button class="toggle-btn" id="dragViewBtn" onclick="switchToDragView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                <span class="material-icons" style="font-size: 16px;">drag_indicator</span>
            </button>
        </div>
    `;
}
if (panelSubtitle) {
    panelSubtitle.innerHTML = 'Configure which earning codes are included in OT calculations';
}

// Helper function for confirming individual codes
function confirmOTCode(index) {
    const codeItem = document.getElementById(`ot-code-${index}`);
    if (codeItem) {
        codeItem.classList.remove('needs-confirmation');
        codeItem.classList.add('confirmed');

        // Update the button
        const button = codeItem.querySelector('.ot-confirm-btn');
        if (button) {
            button.textContent = '✅ Confirmed';
            button.disabled = true;
            button.style.backgroundColor = '#28a745';
        }
    }
}

function acceptSuggestion(suggestionId) {
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    suggestion.status = 'accepted';
    
    // Apply the changes directly
    switch (suggestion.id) {
        case 1: // Rename OTShift
            const otCode = earningCodes.find(c => c.code === 'OTShift');
            if (otCode) {
                otCode.name = 'Overtime Premium';
            }
            break;
        case 2: // Consolidate holiday overtime codes
            // Remove OTHOL2 and OTHOL3, add new HOL_OT
            const othol2Index = earningCodes.findIndex(c => c.code === 'OTHOL2');
            const othol3Index = earningCodes.findIndex(c => c.code === 'OTHOL3');
            if (othol2Index !== -1) earningCodes.splice(othol2Index, 1);
            if (othol3Index !== -1) earningCodes.splice(othol3Index > othol2Index ? othol3Index - 1 : othol3Index, 1);

            earningCodes.push({
                code: "HOL_OT",
                name: "Holiday Overtime",
                description: "Overtime pay on holidays (consolidated)",
                assessment: "confident",
                reviewed: false,
                editMode: false
            });
            break;
        case 3: // Remove MISC code
            const miscIndex = earningCodes.findIndex(c => c.code === 'MISC');
            if (miscIndex !== -1) {
                earningCodes.splice(miscIndex, 1);
            }
            break;
        case 4: // Improve VAC/SICK setup
            const vacCode = earningCodes.find(c => c.code === 'VAC');
            const sickCode = earningCodes.find(c => c.code === 'SICK');
            if (vacCode) {
                vacCode.name = 'Vacation Pay';
                vacCode.description = 'Paid vacation time off';
                vacCode.assessment = 'confident';
            }
            if (sickCode) {
                sickCode.name = 'Sick Leave';
                sickCode.description = 'Paid sick leave';
                sickCode.assessment = 'confident';
            }
            break;
    }
    
    showAISuggestions(); // Refresh display
}

function rejectSuggestion(suggestionId) {
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
        suggestion.status = 'rejected';
        showAISuggestions(); // Refresh display
    }
}

function undoSuggestion(suggestionId) {
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
        suggestion.status = 'pending';
        showAISuggestions(); // Refresh display
    }
}


function showRateConfiguration() {
    // Start the new 5-step workflow instead
    startRateConfigurationWorkflow();
}

function generateComprehensiveRateTable() {
    const panelContent = document.querySelector('.panel-content');

    if (!panelContent) return;

    // Generate table HTML
    const tableHTML = `
        <div class="comprehensive-rate-container">
            <div class="bulk-actions">
                <div class="bulk-actions-left">
                    <span class="table-info">Showing ${earningCodes.filter(code => code.reviewed === true).length} approved earning codes</span>
                </div>
                <div class="bulk-actions-right">
                    <button class="bulk-btn" onclick="saveAllConfigurations()">Save All Configurations</button>
                    <button class="bulk-btn" onclick="resetToDefaults()">Reset to Defaults</button>
                </div>
            </div>

            <div class="table-container">
                <style>
                    .review-table th:nth-child(1) { width: 25%; min-width: 150px; }
                    .review-table th:nth-child(2) { width: 15%; min-width: 120px; }
                    .review-table th:nth-child(3) { width: 12%; min-width: 100px; }
                    .review-table th:nth-child(4) { width: 12%; min-width: 100px; }
                    .review-table th:nth-child(5) { width: 15%; min-width: 120px; }
                    .review-table th:nth-child(6) { width: 16%; min-width: 130px; }
                    .review-table td:nth-child(1) { width: 30%; min-width: 200px; }
                    .review-table td:nth-child(2) { width: 15%; min-width: 120px; }
                    .review-table td:nth-child(3) { width: 12%; min-width: 100px; }
                    .review-table td:nth-child(4) { width: 12%; min-width: 100px; }
                    .review-table td:nth-child(5) { width: 17%; min-width: 120px; }
                    .review-table td:nth-child(6) { width: 17%; min-width: 130px; }
                    .review-table { table-layout: fixed; width: 100%; }
                </style>
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Rate Multiplier</th>
                            <th>Weighted OT</th>
                            <th>Base Comp</th>
                            <th>Special Tax</th>
                            <th>Min amount</th>
                            <th>Max amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateTableRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    panelContent.innerHTML = tableHTML;
}

function generateTableRows() {
    return earningCodes.filter(code => code.reviewed === true).map(code => {
        const calcMethod = getDefaultCalculationMethod(code.code);

        return `
            <tr data-code="${code.code}">
                <td><strong>${code.name || 'Unnamed'}</td>
                <td>
                    <select class="md-select" onchange="updateCalculationMethod('${code.code}', this.value)">
                        <option value="0.5" ${calcMethod === '0.5' ? 'selected' : ''}>0.5</option>
                        <option value="1" ${calcMethod === '1' ? 'selected' : ''}>1</option>
                        <option value="1.5" ${calcMethod === '1.5' ? 'selected' : ''}>1.5</option>
                        <option value="2" ${calcMethod === '2' ? 'selected' : ''}>2</option>
                        <option value="flat" ${calcMethod === 'flat' ? 'selected' : ''}>Flat Amount</option>
                        <option value="formula" ${calcMethod === 'formula' ? 'selected' : ''}>Formula</option>
                    </select>
                </td>
                <td>
                    <select class="md-select" onchange="updateWeightedOT('${code.code}', this.value)">
                        <option value="yes" ${getDefaultWeightedOT(code.code) === 'yes' ? 'selected' : ''}>Yes</option>
                        <option value="no" ${getDefaultWeightedOT(code.code) === 'no' ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td>
                    <select class="md-select" onchange="updateBaseComp('${code.code}', this.value)">
                        <option value="yes" ${getDefaultBaseComp(code.code) === 'yes' ? 'selected' : ''}>Yes</option>
                        <option value="no" ${getDefaultBaseComp(code.code) === 'no' ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td>
                    <select class="md-select" onchange="updateSpecialTax('${code.code}', this.value)">
                        <option value="none" ${getDefaultSpecialTax(code.code) === 'none' ? 'selected' : ''}>None</option>
                        <option value="supplemental" ${getDefaultSpecialTax(code.code) === 'supplemental' ? 'selected' : ''}>Supplemental</option>
                        <option value="nontaxable" ${getDefaultSpecialTax(code.code) === 'nontaxable' ? 'selected' : ''}>Non-taxable</option>
                        <option value="other" ${getDefaultSpecialTax(code.code) === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="md-input" placeholder="0.00" 
                           onchange="updateMin('${code.code}', this.value)">
                </td>
                <td>
                    <input type="text" class="md-input" placeholder="999999.99" 
                           onchange="updateMax('${code.code}', this.value)">
                </td>
            </tr>
        `;
    }).join('');
}

function showAllRateConfigurationTable() {
    // Update progress: entering comprehensive rate configuration
    if (window.progressManager) {
        window.progressManager.enterWorkflow('rate-configuration', 0);
    }

    currentStep = 7;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 6 of 7: Complete Rate Configuration';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Complete Rate Configuration';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Configure all earning code settings in one comprehensive table';
    }

    // Show loading initially
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
        panelContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <div class="loading-text">Loading comprehensive configuration table...</div>
                <div class="loading-subtext">Preparing all earning code settings</div>
            </div>
        `;
    }

    // After 1.5 seconds, show the actual table
    setTimeout(() => {
        generateComprehensiveRateTable();

        // Show chat message
        removeTypingIndicator();
        addMessage('Perfect! Here\'s your comprehensive rate configuration table.\n\nThis table shows all your earning codes with every configuration option in one place. Configure each setting and click "Save Configuration" when ready.', 'ai', [
            { action: 'save-all-configurations', text: 'Save Configuration', buttonType: 'primary' },
            { action: 'continue-to-w2-preview', text: 'Continue to W-2 Preview', buttonType: 'secondary' },
            { action: 'back-to-5-step-workflow', text: 'Back to 5-step workflow', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 1500);
}


function startRateConfigurationWorkflow() {
    rateConfigurationState.isActive = true;
    rateConfigurationState.currentSubStep = 1;

    // Update progress: entering rate configuration workflow
    if (window.progressManager) {
        window.progressManager.enterWorkflow('rate-configuration', 0);
    }

    showRateConfigurationIntro();
}

function showRateConfigurationIntro() {
    currentStep = 7;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 6 of 7: Rate Configuration (5 parts)';
    }

    // DON'T update the right panel - just show the intro message
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(getRateConfigIntroMessage(), 'ai', [
            { action: 'start-pay-calculation', text: 'Start with rate multipliers', buttonType: 'primary' },
            { action: 'configure-all-settings', text: 'Configure all settings at once', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'why-5-steps', text: 'Explain these settings' }
            ]
        });
    }, 1000);
}


function getDefaultWeightedOT(code) {
    // Regular earning codes typically contribute to weighted average OT calculation
    const regularCodes = ['REG', 'COMM', 'BONUS'];
    return regularCodes.includes(code) ? 'yes' : 'no';
}



function finalizeConfiguration() {
    // Update progress: completed rate configuration (step 2)
    if (window.progressManager) {
        window.progressManager.updateProgress(3);
        console.log('✅ Completed rate configuration step');
    }

    setTimeout(() => {
        showW2Simulation();
        removeTypingIndicator();
        addMessage("Awesome! Now, let\'s review how your earning codes will appear on employee W-2 forms.\n\nI've generated a simulated W-2 showing:\n• Which codes appear in the form\n• Which codes are excluded from the form\n• Special reporting requirements\n\nReview the W-2 simulation on the right →", 'ai', [
            { action: 'finalize-complete-setup', text: 'Ready to configure these earning codes', buttonType: 'primary' },
            { action: 'adjust-w2-reporting', text: 'Adjust reporting settings', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-w2-boxes', text: 'Explain W-2 boxes' }
            ]
        });
    }, 1000);
}


function classifyEarningCodesForBaseComp() {
    const autoIncluded = []; // Column 2: Keep with salary
    const autoExcluded = [];  // Column 3: Show as line items  
    const notApplicable = []; // Column 1: Not applicable to salaried employees
    const needsConfirmation = []; // Should be empty now

    // Get user's choices
    const timeOffChoice = window.timeOffDisplayChoice || 'simple';
    const salariedType = window.salariedEmployeeType || 'all-exempt';

    earningCodes.forEach(code => {
        const codeUpper = code.code.toUpperCase();

        // First check if code is not applicable to salaried employees
        if (salariedType === 'all-exempt' && 
            ['OT1-ENG', 'OT2-ENG', 'OT1-CC', 'OT2-CC', 'DT', 'HOLWK', 'SHFT', 'LEAD', 'HAZ', 'STDBY', 'CALLB'].includes(codeUpper)) {
            notApplicable.push(code); // Not applicable to exempt salaried employees
        }
        else {
            // UPDATED LOGIC: Only REG stays in column 2, everything else goes to column 3
            if (codeUpper === 'REG') {
                autoIncluded.push(code); // Keep with salary (column 2)
            } else {
                // ALL other codes (including time-off codes) show as line items
                autoExcluded.push(code); // Show as line items (column 3)
            }
        }
    });

    return {
        autoIncluded,    // Column 2: Keep with salary
        autoExcluded,    // Column 3: Show as line items
        notApplicable,   // Column 1: Not applicable
        needsConfirmation
    };
}


function classifyEarningCodesForSpecialTax() {
        const noSpecialTax = [];
        const nonTaxable = [];
        const supplemental = [];

        earningCodes.forEach(code => {
            const searchText = `${code.code} ${code.name} ${code.description}`.toLowerCase();

            // Check for supplemental tax keywords
            if (searchText.includes('bonus') || searchText.includes('incentive') || 
                searchText.includes('commission') || searchText.includes('stip')) {
                supplemental.push(code);
            }
            // Check for non-taxable keywords
            else if (searchText.includes('reimburse') || searchText.includes('mileage') || 
                     searchText.includes('expense')) {
                nonTaxable.push(code);
            }
            // Default to no special tax (includes regular pay, PTO, vacation, retro, adjustments, gifts, awards, prizes, etc.)
            else {
                noSpecialTax.push(code);
            }
        });

        return {
            noSpecialTax,
            nonTaxable,
            supplemental
        };
    }


function getSpecialTaxCounts() {
    const counts = {
        none: 0,        // No special tax
        nontaxable: 0,  // Non taxable  
        supplemental: 0, // Supplemental
        other: 0        // Other Special tax
    };

    // Count each type based on your earning codes data
    if (window.earningCodes && Array.isArray(window.earningCodes)) {
        window.earningCodes.forEach(code => {
            const specialTax = code.specialTax || 'none';
            if (counts.hasOwnProperty(specialTax)) {
                counts[specialTax]++;
            }
        });
    }

    return counts;
}

function updateSpecialTaxCountDisplay() {
    const counts = getSpecialTaxCounts();

    // Find and update the display element
    const displayElement = document.querySelector('.special-tax-summary');
    if (displayElement) {
        displayElement.innerHTML = `
            <strong>No special tax</strong>: ${counts.none} 
            <strong>Non taxable</strong>: ${counts.nontaxable} 
           <strong>Supplemental</strong>: ${counts.supplemental}
        `;
    }
}

function showSpecialTaxClassification() {
    rateConfigurationState.currentSubStep = 4;

    // Update progress: completed base compensation (step 3)
    if (window.progressManager) {
        window.progressManager.updateProgress(3);
    }

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 6 of 7: Special Tax Treatment (4 of 5)';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Special Tax Treatment';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Configure special tax withholding for earning codes';
    }

    // Classify earning codes and show panel
    const classification = classifyEarningCodesForSpecialTax();
    showSpecialTaxClassificationPanel(classification);

    // Show chat message with ACTUAL COUNTS
    setTimeout(() => {
        removeTypingIndicator();

        // Calculate the actual counts from classification
        const noSpecialCount = classification.noSpecialTax.length;
        const nonTaxableCount = classification.nonTaxable.length; 
        const supplementalCount = classification.supplemental.length;

        addMessage(`I've analyzed your earning codes for special tax requirements:

Here is how I categorized:
<strong>No special tax</strong>: ${noSpecialCount} 
<strong>Non taxable</strong>: ${nonTaxableCount} 
<strong>Supplemental</strong>: ${supplementalCount} 

Your next steps are to finish categorizing each code.

Have you finished categorizing each code and you're ready to continue?`, 'ai', [
            { action: 'skip-to-w2-from-special-tax', text: 'Preview W-2 →' },
        ]);
    }, 1000);
}
function showSpecialTaxClassificationPanel(classification) {
    const panelContent = document.querySelector('.panel-content');

    // Update panel header with toggle buttons - DEFAULT TO DRAG VIEW
    const panelHeader = document.querySelector('.panel-header h2');
    if (panelHeader) {
        panelHeader.innerHTML = `
            Special Tax Treatment
            <div class="view-toggle" style="display: inline-flex; margin-left: 20px; background: #f8f9fa; border-radius: 8px; padding: 4px; gap: 4px;">
                <button class="toggle-btn" id="specialTaxTableViewBtn" onclick="switchToSpecialTaxTableView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                    <span class="material-icons" style="font-size: 16px;">table_chart</span>
                </button>
                <button class="toggle-btn active" id="specialTaxDragViewBtn" onclick="switchToSpecialTaxDragView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; background: #007bff; color: white;">
                    <span class="material-icons" style="font-size: 16px;">drag_indicator</span>
                </button>
            </div>
        `;
    }

    // Create dual view container - DEFAULT TO DRAG VIEW
    panelContent.innerHTML = `
        <div class="special-tax-container">
            <div id="specialTaxTableView" class="view-container hidden">
                ${generateSpecialTaxTableView(classification)}
            </div>

            <div id="specialTaxDragView" class="view-container active">
                ${generateSpecialTaxDragView(classification)}
            </div>
        </div>
    `;

    // Store classification data globally for view switching
    window.currentSpecialTaxClassification = classification;

    // Initialize drag and drop for special tax
    setTimeout(() => {
        dragManager.initialize('special-tax');
    }, 100);
}

function generateSpecialTaxTableView(classification) {
    return `
        ${generateSpecialTaxSection('No Special Tax', classification.noSpecialTax, 'no-special-tax')}
        ${generateSpecialTaxSection('Non-Taxable', classification.nonTaxable, 'non-taxable')}
        ${generateSpecialTaxSection('Supplemental Tax', classification.supplemental, 'supplemental')}
    `;
}

function generateSpecialTaxSection(title, codes, sectionType) {
    if (codes.length === 0) {
        return '';
    }

    // Generate action buttons based on section type
    let actionButtons = '';
    if (sectionType === 'no-special-tax') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('no-special-tax', 'non-taxable')">Move to Non-Taxable</button>
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('no-special-tax', 'supplemental')">Move to Supplemental</button>
        `;
    } else if (sectionType === 'non-taxable') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('non-taxable', 'no-special-tax')">Move to No Special Tax</button>
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('non-taxable', 'supplemental')">Move to Supplemental</button>
        `;
    } else if (sectionType === 'supplemental') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('supplemental', 'no-special-tax')">Move to No Special Tax</button>
            <button class="bulk-btn" onclick="moveSelectedSpecialTaxCodes('supplemental', 'non-taxable')">Move to Non-Taxable</button>
        `;
    }

    const tableRows = codes.map(code => {
        return `
            <tr class="${sectionType}-row">
                <td>
                    <input type="checkbox" class="special-tax-checkbox" data-code="${code.code}" data-section="${sectionType}">
                </td>
                <td>
                    <div class="code-display">
                        <span class="code-value">${code.code}</span>
                    </div>
                </td>
                <td class="name-display">${code.name || 'Unnamed'}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="special-tax-section">
            <div class="bulk-actions">
                <div class="bulk-actions-left">
                    <h3>${title} (${codes.length} codes)</h3>
                </div>
                <div class="bulk-actions-right">
                    ${actionButtons}
                </div>
            </div>
            <div class="table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" class="select-all-checkbox" data-section="${sectionType}" onchange="toggleSelectAllInSpecialTaxSection('${sectionType}')">
                            </th>
                            <th>Code</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateSpecialTaxDraggableCards(codes) {
    return codes.map(code => `
        <div class="draggable-card" draggable="true" data-code="${code.code}">
            <div class="card-header">
                <span class="drag-handle">⋮⋮</span>
                <div class="code-info">
                   <span class="code-name">${code.name || 'Unnamed'}</span> 
                   <span class="code-badge">${code.code}</span>   
                </div>
               
            </div>
            <div class="card-body">
                <div class="code-description hidden" id="desc-${code.code}">
                    ${code.description || 'No description available'}
                </div>
            </div>
        </div>
    `).join('');
}


function generateSpecialTaxDragView(classification) {
    return `
        <div class="weighted-ot-drag-container">
            <!-- Titles Row -->
            <div class="titles-row">
                <div class="column-title">
                    No Special Tax <span class="count-badge">${classification.noSpecialTax.length}</span>
                </div>
                <div class="column-title">
                    Non-Taxable <span class="count-badge">${classification.nonTaxable.length}</span>
                </div>
                <div class="column-title">
                    Supplemental Tax <span class="count-badge">${classification.supplemental.length}</span>
                </div>
            </div>

            <!-- Columns Row -->
            <div class="columns-row">
               <div class="drag-column" id="specialtax-no-special-tax-column">
    <div class="drag-zone" data-category="no-special-tax">
        ${generateDraggableListCards(classification.noSpecialTax)}
    </div>
</div>

                <div class="drag-column" id="specialtax-non-taxable-column">
                    <div class="drag-zone" data-category="non-taxable">
                        ${generateSpecialTaxDraggableCards(classification.nonTaxable)}
                    </div>
                </div>

                <div class="drag-column" id="specialtax-supplemental-column">
                    <div class="drag-zone" data-category="supplemental">
                        ${generateSpecialTaxDraggableCards(classification.supplemental)}
                    </div>
                </div>
            </div>
        </div>
    `;
}


function generateBaseCompSummary(classification) {
    const includedCount = classification.autoIncluded.length;
    const excludedCount = classification.autoExcluded.length;
    const notApplicableCount = classification.notApplicable.length;

    // UPDATED: Use consistent messaging for the new column structure
    let summaryMessage = `Perfect! Based on your setup, I've organized your earning codes:

<strong>Keep with salary</strong>: ${includedCount} codes (will be consolidated and display as "REG" total)

<strong>Show as line items</strong>: ${excludedCount} codes (will appear as individual line items on pay statements)`;

    if (notApplicableCount > 0) {
        summaryMessage += `

<strong>Not applicable to salaried</strong>: ${notApplicableCount} codes (overtime/hourly codes excluded since your salaried employees are exempt)`;
    }

    summaryMessage += `

Review the categorization above and drag any codes to different columns if needed.`;

    return summaryMessage;
}


function generateBaseCompSection(title, codes, sectionType) {
    if (codes.length === 0) {
        return '';
    }

    // Generate action buttons based on section type
    let actionButtons = '';
    if (sectionType === 'needs-confirmation') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedBaseCompCodes('needs-confirmation', 'include')">Move to Include</button>
            <button class="bulk-btn" onclick="moveSelectedBaseCompCodes('needs-confirmation', 'exclude')">Move to Exclude</button>
        `;
    } else if (sectionType === 'auto-included') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedBaseCompCodes('auto-included', 'exclude')">Move to Exclude</button>
        `;
    } else if (sectionType === 'auto-excluded') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedBaseCompCodes('auto-excluded', 'include')">Move to Include</button>
        `;
    }

    const tableRows = codes.map(code => {
        return `
            <tr class="${sectionType}-row">
                <td>
                    <input type="checkbox" class="base-comp-checkbox" data-code="${code.code}" data-section="${sectionType}">
                </td>
                <td>
                    <div class="code-display">
                        <span class="code-value">${code.code}</span>
                    </div>
                </td>
                <td class="name-display">${code.name || 'Unnamed'}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="base-comp-section">
            <div class="bulk-actions">
                <div class="bulk-actions-left">
                    <h3>${title} (${codes.length} codes)</h3>
                </div>
                <div class="bulk-actions-right">
                    ${actionButtons}
                </div>
            </div>
            <div class="table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" class="select-all-checkbox" data-section="${sectionType}" onchange="toggleSelectAllInBaseCompSection('${sectionType}')">
                            </th>
                            <th>Code</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


function switchToSpecialTaxDragView() {
    const dragView = document.getElementById('specialTaxDragView');
    const tableView = document.getElementById('specialTaxTableView');

    dragView.classList.add('active');
    dragView.classList.remove('hidden');
    tableView.classList.remove('active');
    tableView.classList.add('hidden');

    const dragBtn = document.getElementById('specialTaxDragViewBtn');
    const tableBtn = document.getElementById('specialTaxTableViewBtn');
    if (dragBtn && tableBtn) {
        dragBtn.classList.add('active');
        dragBtn.style.background = '#007bff';
        dragBtn.style.color = 'white';

        tableBtn.classList.remove('active');
        tableBtn.style.background = 'transparent';
        tableBtn.style.color = 'inherit';
    }

    // ADD THIS MISSING INITIALIZATION:
    setTimeout(() => {
        dragManager.initialize('special-tax');
    }, 100);
}

function switchToSpecialTaxTableView() {
    const dragView = document.getElementById('specialTaxDragView');
    const tableView = document.getElementById('specialTaxTableView');

    tableView.classList.add('active');
    tableView.classList.remove('hidden');
    dragView.classList.remove('active');
    dragView.classList.add('hidden');

    const dragBtn = document.getElementById('specialTaxDragViewBtn');
    const tableBtn = document.getElementById('specialTaxTableViewBtn');
    if (dragBtn && tableBtn) {
        tableBtn.classList.add('active');
        tableBtn.style.background = '#007bff';
        tableBtn.style.color = 'white';

        dragBtn.classList.remove('active');
        dragBtn.style.background = 'transparent';
        dragBtn.style.color = 'inherit';
    }
}



// NEW FUNCTION 1: Generate Pay Statement View
function generatePayStatementView(classification) {
    return `
        <div class="pay-statement-container">
            <div class="pay-statement-examples">
                <div class="pay-statement-example">
                    <h3>Option 1: Show Separately</h3>
                    <div class="pay-statement-mock">
                        <div class="pay-line">Regular Salary: $3,500.00</div>
                        <div class="pay-line">Holiday Pay: $500.00</div>
                        <div class="pay-line">Vacation Pay: $200.00</div>
                        <div class="pay-total">Total Pay: $4,200.00</div>
                    </div>
                </div>

                <div class="pay-statement-example">
                    <h3>Option 2: Combined</h3>
                    <div class="pay-statement-mock">
                        <div class="pay-line">Salary: $4,200.00</div>
                        <div class="pay-total">Total Pay: $4,200.00</div>
                    </div>
                </div>
            </div>

            <div class="classification-summary">
                <h4>Current Classification:</h4>
                <p><strong>Keep with salary:</strong> ${classification.autoIncluded.length} codes</p>
                <p><strong>Show as line items:</strong> ${classification.autoExcluded.length} codes</p>
            </div>
        </div>
    `;
}

// NEW FUNCTION 2: Switch to Pay Statement View
function switchToPayStatementView() {
    const dragView = document.getElementById('baseCompDragView');
    const payStatementView = document.getElementById('baseCompPayStatementView');
    const dragBtn = document.getElementById('baseCompDragViewBtn');
    const payStatementBtn = document.getElementById('baseCompPayStatementViewBtn');

    if (dragView) dragView.classList.add('hidden');
    if (payStatementView) payStatementView.classList.remove('hidden');

    if (dragBtn) dragBtn.classList.remove('active');
    if (payStatementBtn) payStatementBtn.classList.add('active');
}

// NEW FUNCTION 3: Switch back to Table View (keep existing functionality)
function switchToBaseCompPayStatementView() {
    switchToPayStatementView();
}

// NEW FUNCTION 4: Generate Pay Statement Mock Data
function generatePayStatementMockData(classification) {
    const separateItems = classification.autoExcluded.slice(0, 3).map(code => ({
        name: code.description || code.code,
        amount: '$' + (Math.random() * 500 + 100).toFixed(2)
    }));

    const totalAmount = separateItems.reduce((sum, item) => 
        sum + parseFloat(item.amount.replace('$', '')), 3500);

    return {
        separate: separateItems,
        total: '$' + totalAmount.toFixed(2),
        combined: '$' + totalAmount.toFixed(2)
    };
}

function generateBaseCompListItems(codes) {
    return codes.map(code => `
        <div class="draggable-list-item" data-code="${code.code}">
            <span class="code-badge-list">${code.code}</span>
            <span class="code-name-list">${code.name || 'Unnamed'}</span>
        </div>
    `).join('');
}

function generateBaseCompDraggableCards(codes) {
    return codes.map(code => `
        <div class="draggable-card" draggable="true" data-code="${code.code}">
            <div class="card-header">
                <span class="drag-handle" draggable="false">⋮⋮</span>
                <div class="code-info" draggable="false">
                       <span class="code-badge" draggable="false">${code.code}</span>
                      <span class="code-name" draggable="false">${code.name || 'Unnamed'}</span>
                   
                  
                </div>
                \
            </div>
            <div class="card-body" draggable="false">
                <div class="code-description hidden" id="desc-${code.code}" draggable="false">
                    ${code.description || 'No description available'}
                </div>
            </div>
        </div>
    `).join('');
}

function showSalariedExemptExplanation() {
    addMessage('<strong>Exempt vs Non-Exempt Salaried Employees:</strong>\n\n• <strong>Exempt Salaried</strong>: Not eligible for overtime pay, regardless of hours worked. Most managers, executives, and professionals fall into this category.\n\n• <strong>Non-Exempt Salaried</strong>: Still eligible for overtime pay when working over 40 hours per week, even though they receive a fixed salary. Less common but exists in some companies.\n\n<strong>Examples:</strong>\n• Exempt: Department managers, senior analysts, directors\n• Non-Exempt: Some administrative assistants, certain supervisors\n\nThis determines whether overtime earning codes apply to your salaried employees.', 'ai', [
        { action: 'salaried-has-nonexempt', text: 'We have non-exempt salaried employees' },
        { action: 'salaried-all-exempt', text: 'All our salaried employees are exempt' }
    ]);
}

function showPayStatementDisplayOptions() {
    // Update panel to show pay statement examples
    const panelContent = document.querySelector('.panel-content');
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    
    if (panelHeader) {
        panelHeader.textContent = 'Pay Statement Display Options';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Choose how time off earning codes appear on employee pay statements';
    }
    
    if (panelContent) {
        panelContent.innerHTML = `
            <div class="pay-statement-options">
                <div class="option-card">
                    <h3>Option 1: Show Separately</h3>
                    <div class="pay-statement-preview">
                        <div class="pay-line">
                            <span>Regular Salary:</span>
                            <span>$3,500.00</span>
                        </div>
                        <div class="pay-line">
                            <span>Holiday Pay:</span>
                            <span>$500.00</span>
                        </div>
                        <div class="pay-line">
                            <span>Vacation Pay:</span>
                            <span>$200.00</span>
                        </div>
                        <div class="pay-line-total">
                            <span>Total Pay:</span>
                            <span>$4,200.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="option-card">
                    <h3>Option 2: Combined</h3>
                    <div class="pay-statement-preview">
                        <div class="pay-line">
                            <span>Salary:</span>
                            <span>$4,200.00</span>
                        </div>
                        <div class="pay-line-separator"></div>
                        <div class="pay-line-total">
                            <span>Total Pay:</span>
                            <span>$4,200.00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setTimeout(() => {
        removeTypingIndicator();
        addMessage('How would you like earning codes that are related to time off to display on your employee pay statements?', 'ai', [
            { action: 'pay-display-separate', text: 'Show separately', buttonType: 'primary' },
            { action: 'pay-display-combined', text: 'Combined', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 1000);
}

function showSalariedEmployeeTypeQuestion() {
    setTimeout(() => {
        removeTypingIndicator();
        addMessage('<strong> Base compensation classification</strong>\n\nThis setting determines how time off is handled on pay statements for salaried employees.\n\n Do you have any non-exempt salaried employees who are eligible for overtime pay?', 'ai', [
            { action: 'salaried-has-nonexempt', text: 'Yes, we have non-exempt salaried employees' },
            { action: 'salaried-all-exempt', text: 'No, all salaried employees are exempt from overtime' },
            { action: 'salaried-explain-difference', text: 'What\'s the difference?' }
        ]);
    }, 1000);
}

function showPayStatementDisplay() {
    // Create pay statement HTML
    const payStatementHtml = `
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 16px 0; border: 1px solid #e0e0e0;">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 600;">Sample Pay Statement - Non-Exempt Salaried Employee</h3>
            
            <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Employee Info -->
                <div style="border-bottom: 1px solid #e0e0e0; padding-bottom: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #666; font-size: 14px;">Employee:</span>
                        <span style="font-weight: 500; font-size: 14px;">Sarah Johnson</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #666; font-size: 14px;">Pay Period:</span>
                        <span style="font-weight: 500; font-size: 14px;">08/01/2025 - 08/15/2025</span>
                    </div>
                </div>
                
                <!-- Earnings Section -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600;">Earnings</h4>
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #666; font-size: 14px;">Regular Salary</span>
                            <span style="font-weight: 500; font-size: 14px;">$2,500.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #666; font-size: 14px;">Overtime (10 hrs @ $37.50)</span>
                            <span style="font-weight: 500; font-size: 14px;">$375.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e0e0e0;">
                            <span style="font-weight: 600; font-size: 14px;">Total Earnings</span>
                            <span style="font-weight: 600; font-size: 14px; color: #2e7d32;">$2,875.00</span>
                        </div>
                    </div>
                </div>
                
                <!-- Time Off Section (will be highlighted based on user choice) -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600;">Time Off Used</h4>
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #666; font-size: 14px;">Vacation (16 hours)</span>
                            <span style="font-weight: 500; font-size: 14px;">$600.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666; font-size: 14px;">Sick Leave (8 hours)</span>
                            <span style="font-weight: 500; font-size: 14px;">$300.00</span>
                        </div>
                    </div>
                </div>
                
                <!-- Note -->
                <div style="background: #e3f2fd; border-radius: 6px; padding: 12px; margin-top: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #1976d2;">
                        <strong>Note:</strong> Non-exempt salaried employees are eligible for overtime pay when working more than 40 hours per week.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    return payStatementHtml;
}

function showTimeOffDisplayQuestion() {
    setTimeout(() => {
        removeTypingIndicator();
        
        // First show the pay statement
        const payStatementMessage = `Great! Since you have non-exempt salaried employees, let me show you how their pay statements will look.

${showPayStatementDisplay()}

When a salaried employee takes time off (vacation, sick leave, holidays), how do you want it to show on their pay statement?`;
        
        addMessage(payStatementMessage, 'ai', [
            { action: 'time-off-breakdown', text: 'Show time off separately', buttonType: 'primary' },
            { action: 'time-off-simple', text: 'Don\'t break it down', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'time-off-breakdown-explain', text: 'Explain "show separately" option' },
                { action: 'time-off-simple-explain', text: 'Explain "don\'t break it down" option' },
                { action: 'time-off-why-matters', text: 'Give me examples' }
            ]
        });
    }, 1000);
}

function handleTimeOffDisplayChoice(choice) {
    // Store the choice (you can expand this later)
    window.timeOffDisplayChoice = choice;
}

function showTimeOffBreakdownDetails() {
    addMessage('<strong>Break it down on the pay statement</strong>\n\n• Pay statement will itemize salary hours and time off hours\n• Example: 72 hours regular salary + 8 hours vacation = total pay\n• Gives detailed breakdown of how pay was calculated', 'ai', [
        { action: 'time-off-breakdown', text: 'Choose this option', buttonType: 'primary' },
        { action: 'time-off-simple', text: 'Choose the other option instead', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
}

function showTimeOffSimpleDetails() {
    addMessage('<strong>Don\'t break it down</strong>\n\n• Pay statement shows total salary amount without itemizing time off\n• Time off is handled behind the scenes\n• Cleaner, simpler pay statement', 'ai', [
        { action: 'time-off-simple', text: 'Choose this option', buttonType: 'primary' },
        { action: 'time-off-breakdown', text: 'Choose the other option instead', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
}

function showTimeOffWhyMattersExplanation() {
    addMessage('When a salaried employee takes time off, their pay statement can display earnings in different ways:\n\n<strong>Combined into one salary line</strong>: These codes get lumped together and show as a single "Salary" entry.\n<i>Example: Regular Pay + Holiday Pay = "Salary: $4,000"</i>\n\n<strong>Show as line items</strong>: These codes appear as separate entries on the pay statement.\n<i>Example:"Regular Pay: $3,500" and Holiday Pay shows as "Holiday Pay: $500"</i>', 'ai', [
        { action: 'time-off-breakdown', text: 'Show time off separately', buttonType: 'primary' },
        { action: 'time-off-simple', text: 'Don\'t break it down', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
}



function showBaseCompensationSummaryMessage() {
    const classification = classifyEarningCodesForBaseComp();
    const summaryMessage = generateBaseCompSummary(classification);

    setTimeout(() => {
        removeTypingIndicator();
        addMessage(summaryMessage, 'ai', [
            { action: 'continue-to-special-tax', text: 'Continue to Special Tax Treatment' },
           
        ]);
    }, 1500);
}
function showBaseCompensationClassificationPanel() {
    // Update panel header to show this is based on their time-off choice
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');

    if (panelHeader) {
        panelHeader.textContent = 'Pay Statement Organization';
    }
    if (panelSubtitle) {
        const choice = window.timeOffDisplayChoice === 'breakdown' ? 'breakdown' : 'simplified';
        panelSubtitle.innerHTML = `Based on your ${choice} choice, here's how earning codes will be organized`;
    }

    // Classify earning codes based on their choice
    const classification = classifyEarningCodesForBaseComp();

    // Show the drag and drop panel (reuse existing function)
    showBaseCompensationPanel(classification);
}


function showBaseCompensationClassification() {
    currentStep = 6; // Adjust to fit your workflow

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 4 of 7: Pay Statement Display Configuration';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Pay Statement Display Configuration';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Configure how earning codes appear on employee pay statements';
    }

    // Classify earning codes and show panel
    const classification = classifyEarningCodesForBaseComp();
    showBaseCompensationPanel(classification);

    // Show chat message
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(generateBaseCompSummary(classification), 'ai', [
            { action: 'continue-to-special-tax', text: 'Continue to Special Tax Treatment' },
          
        ]);
    }, 1000);
}

function showBaseCompensationPanel(classification) {
    const panelContent = document.querySelector('.panel-content');

    // Update panel header with toggle buttons - DEFAULT TO DRAG VIEW
    const panelHeader = document.querySelector('.panel-header h2');
    if (panelHeader) {
        panelHeader.innerHTML = `Base Compensation Classification`;
    }

    // Create dual view container - DEFAULT TO DRAG VIEW
    // Create pay statement view only
    panelContent.innerHTML = `
        <div class="base-comp-container">
            <div id="baseCompPayStatementView" class="view-container active">
                ${generatePayStatementView(classification)}
            </div>
        </div>
    `;

    // Store classification data globally for view switching
    window.currentBaseCompClassification = classification;

}

function updateBaseCompInclusion(codeId, isIncluded) {
    console.log(`${codeId} base compensation inclusion: ${isIncluded}`);
    // Store this setting for later use when finalizing base compensation config
}

function updateProcessCard(cardId, updates) {
    const card = document.getElementById(`process-card-${cardId}`);
    if (!card) return;

    if (updates.description) {
        const descElement = card.querySelector('.process-card-description');
        if (descElement) descElement.textContent = updates.description;
    }

    if (updates.status) {
        const statusElement = card.querySelector('.process-card-status');
        if (statusElement) {
            statusElement.className = `process-card-status ${updates.status}`;

            if (updates.status === 'complete') {
                statusElement.innerHTML = '<span>✅ Complete</span>';
            } else if (updates.status === 'error') {
                statusElement.innerHTML = '<span>❌ Error</span>';
            }
        }
    }

    if (updates.timestamp) {
        const timestampElement = card.querySelector('.process-card-timestamp');
        if (timestampElement) timestampElement.textContent = updates.timestamp;
    }
}

function showW2Simulation() {
    currentStep = 6;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 7 of 7: W-2 Tax Form Preview';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'W-2 Tax Form Simulation';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Review how your earning codes will appear on employee W-2 forms';
    }

    // Replace panel content with W-2 simulation
    const panelContent = document.querySelector('.panel-content');
    panelContent.innerHTML = `
        <div class="w2-simulation-container">
            ${generateW2Form()}
            ${generateW2CodeBreakdown()}
        </div>
    `;

    // Update panel actions
    const panelActions = document.querySelector('.panel-actions');
    if (panelActions) {
        panelActions.innerHTML = `
            <button class="next-step-btn" onclick="completePayrollSetup()">
                🎉 Complete Payroll Setup
            </button>
        `;
    }
}

function generateW2Form() {
    // Calculate sample values based on earning codes
    const sampleValues = calculateSampleW2Values();

    return `
        <div class="w2-form-container">
            <h3>Sample W-2 Form Preview</h3>
            <div class="w2-form">
                <div class="w2-header">
                    <div class="w2-title">Form W-2 Wage and Tax Statement 2025</div>
                    <div class="w2-subtitle">Copy B—To Be Filed With Employee's FEDERAL Tax Return</div>
                </div>

                <div class="w2-employer-section">
                    <div class="w2-box">
                        <div class="box-label">b Employer identification number (EIN)</div>
                        <div class="box-value"></div>
                    </div>
                    <div class="w2-box">
                        <div class="box-label">c Employer's name, address, and ZIP code</div>
                        <div class="box-value"></div>
                    </div>
                </div>

                <div class="w2-employee-section">
                    <div class="w2-box">
                        <div class="box-label">d Control number</div>
                        <div class="box-value"></div>
                    </div>
                    <div class="w2-box">
                        <div class="box-label">e Employee's first name and initial</div>
                        <div class="box-value"></div>
                    </div>
                    <div class="w2-box">
                        <div class="box-label">f Employee's address and ZIP code</div>
                        <div class="box-value"></div>
                    </div>
                </div>

                <div class="w2-wage-boxes">
                    <div class="w2-wage-row">
                        <div class="w2-box highlight-box">
                            <div class="box-label">1 Wages, tips, other compensation</div>
                            <div class="box-value">${sampleValues.box1}</div>
                        </div>
                        <div class="w2-box">
                            <div class="box-label">2 Federal income tax withheld</div>
                            <div class="box-value">${sampleValues.box2}</div>
                        </div>
                    </div>
                    <div class="w2-wage-row">
                        <div class="w2-box highlight-box">
                            <div class="box-label">3 Social security wages</div>
                            <div class="box-value">${sampleValues.box3}</div>
                        </div>
                        <div class="w2-box">
                            <div class="box-label">4 Social security tax withheld</div>
                            <div class="box-value">${sampleValues.box4}</div>
                        </div>
                    </div>
                    <div class="w2-wage-row">
                        <div class="w2-box highlight-box">
                            <div class="box-label">5 Medicare wages and tips</div>
                            <div class="box-value">${sampleValues.box5}</div>
                        </div>
                        <div class="w2-box">
                            <div class="box-label">6 Medicare tax withheld</div>
                            <div class="box-value">${sampleValues.box6}</div>
                        </div>
                    </div>
                </div>

                <div class="w2-additional-boxes">
                    <div class="w2-box">
                        <div class="box-label">12a See instructions for box 12</div>
                        <div class="box-value">${sampleValues.box12a}</div>
                    </div>
                    <div class="w2-box">
                        <div class="box-label">14 Other</div>
                        <div class="box-value">${sampleValues.box14}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateSampleW2Values() {
    // Define which codes go in Box 1 as specified by user - exclude MISC
    const box1AllowedCodes = ['REG', 'OTShift', 'HOL', 'OTHOL', 'OTHOL2', 'OTHOL3', 'HOL_OT', 'COMM'];
    const box1Codes = earningCodes.filter(code => box1AllowedCodes.includes(code.code));

    // Box 3 (Social Security) - same as Box 1 for most cases
    const box3Codes = box1Codes;

    // Box 5 (Medicare) - same as Box 1 for most cases  
    const box5Codes = box1Codes;

    return {
        box1: getCodesTagBreakdown(box1Codes),
        box2: '', // No generic data
        box3: getCodesTagBreakdown(box3Codes),
        box4: '', // No generic data
        box5: getCodesTagBreakdown(box5Codes),
        box6: '', // No generic data
        box12a: '', // No generic data
        box14: '' // No generic data
    };
}

function getCodesTagBreakdown(codes) {
    if (codes.length === 0) {
        return '<div class="no-codes-message">No codes included</div>';
    }

    return `<div class="earning-codes-tags">
        ${codes.map(code => {
        // Add different tag styles based on code type
        let tagClass = 'earning-code-tag';
        if (['OTShift', 'OTHOL', 'OTHOL2', 'OTHOL3', 'HOL_OT'].includes(code.code)) {
            tagClass += ' overtime';
        } else if (['BONUS', 'COMM'].includes(code.code)) {
            tagClass += ' bonus';
        } else if (['VAC', 'SICK'].includes(code.code)) {
            tagClass += ' leave';
        }

        return `<span class="${tagClass}">${code.code}</span>`;
    }).join('')}
    </div>`;
}


function getCodeTaxExclusion(codeId) {
    // Define which codes are excluded from various tax calculations
    const exclusions = {
        'VAC': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'SICK': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'REG': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'OTShift': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'HOL': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'OTHOL': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'COMM': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false },
        'BONUS': { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false }
    };

    return exclusions[codeId] || { excludedFromIncome: false, excludedFromSocialSecurity: false, excludedFromMedicare: false };
}

function generateW2CodeBreakdown() {
    // Define which codes are displayed in W-2 boxes
    const displayedCodes = ['REG', 'OTShift', 'HOL', 'OTHOL', 'OTHOL2', 'OTHOL3', 'HOL_OT', 'COMM'];
    const notDisplayedCodes = earningCodes.filter(code => !displayedCodes.includes(code.code));

    return `
        <div class="w2-breakdown-container">

            <div class="w2-summary">
                <h4>W-2 Summary</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${earningCodes.filter(code => displayedCodes.includes(code.code)).length}</span>
                        <span class="stat-label">Codes displayed in W-2</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${notDisplayedCodes.length}</span>
                        <span class="stat-label">Codes not displayed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${earningCodes.length}</span>
                        <span class="stat-label">Total earning codes</span>
                    </div>
                </div>
            </div>
                ${notDisplayedCodes.length > 0 ? `
                   <div class="breakdown-section">
                        <h4>Not Displayed in W-2 Form</h4>
                        <div class="not-displayed-cards-container">
                            ${notDisplayedCodes.map(code => `
                                <div class="not-displayed-card">
                                    <div class="card-header">
                                        <div class="card-content">
                                            <div class="code-info">
                                                <div class="code-name">${code.name || 'Unnamed'}</div>
                                                <div class="code-badge">${code.code}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}


            </div>


        </div>
    `;
}

function completeCurrentWorkflow(nextWorkflow = null) {
    if (window.progressManager && window.progressManager.isActive) {
        const currentProgress = window.progressManager.getCurrentProgress();

        if (currentProgress) {
            console.log(`Completing workflow: ${currentProgress.section}`);

            // Update to show all steps completed
            const totalSteps = currentProgress.totalSubsteps;
            window.progressManager.updateProgress(totalSteps);

            // If there's a next workflow, transition after delay
            if (nextWorkflow) {
                setTimeout(() => {
                    window.progressManager.enterWorkflow(nextWorkflow, 0);
                }, 2500); // Wait for checkmarks to show and fade
            } else {
                // No next workflow - will auto-hide after showing checkmarks
                console.log('Workflow completed - progress will auto-hide');
            }
        }
    }
}

function completePayrollSetup() {
    // Update progress: completed W-2 preview (step 3) - this completes the workflow
    if (window.progressManager) {
        window.progressManager.updateProgress(3); // Complete the workflow
        console.log('✅ Completed W-2 preview step - workflow complete');
    }

    setTimeout(() => {
        removeTypingIndicator();
        addMessage("🎉 <strong>Congratulations! Your complete payroll system is now fully configured!</strong>\n\n<strong>Final Summary:</strong>\n✅ <strong>Pay Schedules:</strong> Configured and approved\n✅ <strong>Calendar Simulation:</strong> Generated with holiday/weekend adjustments\n✅ <strong>Earning Codes:</strong> Reviewed and optimized  \n✅ <strong>Recommendations:</strong> Processed and applied\n✅ <strong>Rate Configuration:</strong> Complete with tax settings\n✅ <strong>W-2 Preview:</strong> Tax form reporting verified\n\n<strong>Your payroll system is ready for implementation!</strong> All earning codes have been properly configured for accurate W-2 reporting.", 'ai', [
            { action: 'export-configuration', text: 'Export Configuration' },
            { action: 'review-final-setup', text: 'Review Final Setup' },
            { action: 'start-over', text: 'Start New Configuration' }
        ]);
    }, 1000);
}

// Toggle source documents expansion
function toggleSourceDocs(element) {
    const container = element.closest('.source-docs-section');
    const content = container.querySelector('.source-docs-content');
    const icon = container.querySelector('.source-toggle-icon');
    
    if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(90deg)';
    } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Export to window
window.toggleSourceDocs = toggleSourceDocs;

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Conversation History Management
let conversationState = {
    isCollapsed: false,
    messageHistory: [],
    currentProcessCard: null,
    collapsedSections: [] // Track multiple collapsed sections
};

function collapseConversationHistory(headerText = "Pay schedule configuration threads") {
    const messagesContainer = document.getElementById('chatMessages');

    // Get messages that aren't already in collapsed sections or process cards
    const messages = messagesContainer.querySelectorAll('.message:not(.process-card-message):not(.conversation-history-collapsed .message)');

    if (messages.length === 0) return; // No messages to collapse

    // Create unique ID for this section
    const sectionId = `conversationHistory-${Date.now()}`;

    // Store this section in our state
    const sectionData = {
        id: sectionId,
        headerText: headerText,
        messageCount: messages.length,
        messages: Array.from(messages)
    };

    conversationState.collapsedSections.push(sectionData);
    conversationState.isCollapsed = true;

    // Create toggle header
    const toggleHeader = createToggleHeader(messages.length, headerText, sectionId);

    // Wrap existing messages in collapsible container
    const historyContainer = document.createElement('div');
    historyContainer.className = 'conversation-history-collapsed';
    historyContainer.id = sectionId;

    // Move messages to history container
    messages.forEach(message => {
        historyContainer.appendChild(message);
    });

    // Find where to insert this section (before any process cards but after existing collapsed sections)
    const existingCollapsedSections = messagesContainer.querySelectorAll('.conversation-toggle-header, .conversation-history-collapsed');
    const processCards = messagesContainer.querySelectorAll('.process-card-message');

    let insertionPoint = messagesContainer.firstChild;

    if (existingCollapsedSections.length > 0) {
        // Insert after the last collapsed section
        insertionPoint = existingCollapsedSections[existingCollapsedSections.length - 1].nextSibling;
    }

    // Insert toggle header and history container
    messagesContainer.insertBefore(toggleHeader, insertionPoint);
    messagesContainer.insertBefore(historyContainer, insertionPoint);

    // Smooth scroll to show the latest content
    // Scroll to show the start of the new message
    setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' // Shows the start of the message
            });
        }
    }, 100);
}



function createToggleHeader(messageCount, headerText, sectionId) {
    const header = document.createElement('div');
    header.className = 'conversation-toggle-header';
    header.setAttribute('data-section-id', sectionId);
    header.onclick = function() { toggleConversationHistory(sectionId); };

    header.innerHTML = `
            <span class="toggle-icon">  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            </span>
            <span class="toggle-text">${headerText}</span>
            <span class="toggle-count">${messageCount} messages</span>
        `;

    return header;
}

function toggleConversationHistory(sectionId) {
    const historyContainer = document.getElementById(sectionId);
    const toggleHeader = document.querySelector(`[data-section-id="${sectionId}"]`);

    if (!historyContainer || !toggleHeader) return;

    const sectionData = conversationState.collapsedSections.find(section => section.id === sectionId);
    if (!sectionData) return;

    if (historyContainer.classList.contains('conversation-history-collapsed')) {
        // Expand this section
        historyContainer.classList.remove('conversation-history-collapsed');
        historyContainer.classList.add('conversation-history-expanded');

        const toggleText = toggleHeader.querySelector('.toggle-text');
        if (toggleText) {
            toggleText.textContent = 'Hide conversation threads';
        }
    } else {
        // Collapse this section
        historyContainer.classList.remove('conversation-history-expanded');
        historyContainer.classList.add('conversation-history-collapsed');

        const toggleText = toggleHeader.querySelector('.toggle-text');
        if (toggleText) {
            toggleText.textContent = sectionData.headerText;
        }
    }

    // Scroll to show updated content
    // Scroll to show the start of the new message
    setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' // Shows the start of the message
            });
        }
    }, 100);
}

function selectRadio(element) {
    const radioContainer = element.closest('.suggested-radios');
    if (radioContainer) {
        radioContainer.querySelectorAll('.radio-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    element.classList.add('selected');
}

function toggleCheckbox(element) {
    element.classList.toggle('checked');
}

function submitCheckboxes() {
    const checkedBoxes = document.querySelectorAll('.checkbox-btn.checked');
    const selectedRoles = Array.from(checkedBoxes).map(box => box.textContent);

    if (selectedRoles.length === 0) {
        addMessage('Please select at least one role.', 'ai');
        return;
    }

    // Add user message showing what they selected
    addMessage(selectedRoles.join(', '), 'user');

    // Remove all checkboxes
    const allCheckboxes = document.querySelectorAll('.suggested-checkboxes');
    allCheckboxes.forEach(container => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

}



function toggleWizardCheckbox(element) {
    element.classList.toggle('checked');

    // Enable/disable continue button based on selection
    const checkedBoxes = document.querySelectorAll('.wizard-checkbox.checked');
    const continueBtn = document.querySelector('.wizard-btn-primary');
    continueBtn.disabled = checkedBoxes.length === 0;
    continueBtn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
}

function continueFromRole() {
    // Store selected roles
    const checkedBoxes = document.querySelectorAll('.wizard-checkbox.checked');
    const selectedRoles = Array.from(checkedBoxes).map(box => box.getAttribute('data-value'));

    if (selectedRoles.length === 0) {
        alert('Please select at least one role');
        return;
    }

    newWizardState.userData.roles = selectedRoles;
    newWizardState.currentStep = 2;
    showExperienceStep();
}

function showExperienceStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 2 of ${newWizardState.totalSteps}</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    How much payroll experience do you have?
                </h2>
                <p class="wizard-subtitle">This helps us adjust the pace and detail level of the setup process.</p>
            </div>

            <div class="wizard-content">
                <div class="experience-slider-container">
                    <div class="experience-label" id="experienceLabel">Less than 1 year</div>
                    <input type="range" class="experience-slider" id="experienceSlider" min="1" max="4" value="1" oninput="updateExperienceLabel(this.value)">
                    <div class="experience-markers">
                        <span>< 1 year</span>
                        <span>2-5 years</span>
                        <span>5-10 years</span>
                        <span>10+ years</span>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button class="wizard-btn wizard-btn-primary" onclick="continueFromExperience()">
                    Continue
                </button>
            </div>
        </div>
    `;
}

function updateExperienceLabel(value) {
    const label = document.getElementById('experienceLabel');
    const labels = {
        '1': 'Less than 1 year',
        '2': '2-5 years of experience',
        '3': '5-10 years of experience',
        '4': '10+ years of experience'
    };
    label.textContent = labels[value];
}

function continueFromExperience() {
    const slider = document.getElementById('experienceSlider');
    const experienceLevel = slider.value;
    const experienceLabels = {
        '1': 'less-than-1-year',
        '2': '2-5-years',
        '3': '5-10-years',
        '4': '10-plus-years'
    };

    newWizardState.userData.experience = experienceLabels[experienceLevel];
    newWizardState.currentStep = 3;
    showCurrentSystemStep();
}

function showCurrentSystemStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 3 of ${newWizardState.totalSteps}</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    What payroll system are you migrating from?
                </h2>
                <p class="wizard-subtitle">This helps us understand your current setup and migration needs.</p>
            </div>

            <div class="wizard-content">
                <div class="wizard-options">
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="manual">
                        <div class="option-content">
                            <h3>Manual payroll (Excel, paper, etc.)</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="quickbooks">
                        <div class="option-content">
                            <h3>QuickBooks Payroll</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="adp">
                        <div class="option-content">
                            <h3>ADP</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="paychex">
                        <div class="option-content">
                            <h3>Paychex</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="gusto">
                        <div class="option-content">
                            <h3>Gusto</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="other">
                        <div class="option-content">
                            <h3>Other system</h3>
                        </div>
                    </div>
                    <div class="wizard-option" onclick="selectSystem(this)" data-value="new">
                        <div class="option-content">
                            <h3>This is my first payroll system</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button class="wizard-btn wizard-btn-primary" onclick="continueFromSystem()" disabled style="opacity: 0.5;">
                    Continue
                </button>
            </div>
        </div>
    `;
}

function selectSystem(element) {
    // Remove selection from all options
    document.querySelectorAll('.wizard-option').forEach(opt => opt.classList.remove('selected'));

    // Select the clicked option
    element.classList.add('selected');

    // Store the selection
    newWizardState.userData.currentSystem = element.getAttribute('data-value');

    // Enable the continue button
    const continueBtn = document.querySelector('.wizard-btn-primary');
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
}

function continueFromSystem() {
    if (!newWizardState.userData.currentSystem) {
        alert('Please select a payroll system');
        return;
    }

    newWizardState.currentStep = 4;
    showFirstPayDateStep();
}


function showFirstPayDateStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 4 of 5</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    How frequently do you pay your employees?
                </h2>
                <p class="wizard-subtitle">Select all pay frequencies you need - you can have multiple schedules.</p>
            </div>

            <div class="wizard-content">
                <div class="wizard-checkboxes">
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="weekly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Weekly</h3>
                            <p>52 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="bi-weekly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Bi-weekly</h3>
                            <p>26 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="semi-monthly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Semi-monthly</h3>
                            <p>24 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="monthly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Monthly</h3>
                            <p>12 pay periods per year</p>
                        </div>
                    </div>
                    <div class="wizard-checkbox" onclick="togglePayFrequency(this)" data-value="quarterly">
                        <div class="checkbox-indicator"></div>
                        <div class="option-content">
                            <h3>Quarterly</h3>
                            <p>4 pay periods per year</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button class="wizard-btn wizard-btn-primary" onclick="continueFromPayFrequency()" disabled style="opacity: 0.5;">
                    Continue
                </button>
            </div>
        </div>
    `;
}

function togglePayFrequency(element) {
    element.classList.toggle('checked');

    // Enable/disable continue button based on selection
    const checkedBoxes = document.querySelectorAll('.wizard-checkbox.checked');
    const continueBtn = document.querySelector('.wizard-btn-primary');
    continueBtn.disabled = checkedBoxes.length === 0;
    continueBtn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
}

function continueFromPayFrequency() {
    // Store selected pay frequencies
    const checkedBoxes = document.querySelectorAll('.wizard-checkbox.checked');
    const selectedFrequencies = Array.from(checkedBoxes).map(box => box.getAttribute('data-value'));

    if (selectedFrequencies.length === 0) {
        alert('Please select at least one pay frequency');
        return;
    }

    newWizardState.userData.payFrequencies = selectedFrequencies;
    newWizardState.currentStep = 5;
    newWizardState.totalSteps = 5;
    showStartDateStep();
}

function showStartDateStep() {
    const wizardContainer = document.getElementById('wizardContainer');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    wizardContainer.innerHTML = `
        <div class="wizard-step">
            <div class="wizard-header">
                <div class="step-indicator">Step 5 of 5</div>
                <h2 class="wizard-title">
                    <img src="attached_assets/bryte logo.svg" alt="Bryte Logo" class="wizard-bryte-logo" />
                    When do you plan to start paying employees using our system?
                </h2>
                <p class="wizard-subtitle">Choose your first payroll date to help us create a setup timeline.</p>
            </div>

            <div class="wizard-content">
                <div class="dual-calendar-container">
                    <div class="calendar-navigation">
                        <button class="calendar-nav" onclick="changeMonth(-1)">‹</button>
                        <button class="calendar-nav" onclick="changeMonth(1)">›</button>
                    </div>

                    <div class="dual-calendar-widget">
                        <!-- First Month -->
                        <div class="calendar-month-container">
                            <div class="calendar-header">
                                <h3 class="calendar-month" id="calendarMonth1"></h3>
                            </div>
                            <div class="calendar-grid" id="calendarGrid1">
                                <!-- First month calendar will be generated here -->
                            </div>
                        </div>

                        <!-- Second Month -->
                        <div class="calendar-month-container">
                            <div class="calendar-header">
                                <h3 class="calendar-month" id="calendarMonth2"></h3>
                            </div>
                            <div class="calendar-grid" id="calendarGrid2">
                                <!-- Second month calendar will be generated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           
        </div>
    `;



    // Initialize dual calendar
    initializeDualCalendar(currentMonth, currentYear);
}


function initializeDualCalendar(month, year) {
    currentCalendarMonth = month;
    currentCalendarYear = year;

    // Calculate second month
    let secondMonth = month + 1;
    let secondYear = year;
    if (secondMonth > 11) {
        secondMonth = 0;
        secondYear++;
    }

    // Update month displays
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    document.getElementById('calendarMonth1').textContent = `${monthNames[month]} ${year}`;
    document.getElementById('calendarMonth2').textContent = `${monthNames[secondMonth]} ${secondYear}`;

    // Generate both calendars
    generateCalendarMonth(month, year, 'calendarGrid1');
    generateCalendarMonth(secondMonth, secondYear, 'calendarGrid2');
}

function generateCalendarMonth(month, year, gridId) {
    // Use unified calendar system with wizard-specific configuration
    generateUnifiedCalendar(month, year, gridId, {
        dayClass: 'calendar-day',
        dayHeaderClass: 'calendar-day-header',
        onSelect: function(selectedDate) {
            // Preserve existing wizard calendar behavior
            selectCalendarDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        }
    });
}

function selectCalendarDate(year, month, day) {
    console.log('Date clicked:', year, month, day); // Debug log

    // Remove previous selection from both calendars
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Find and select the clicked day
    const clickedDay = document.querySelector(`[data-year="${year}"][data-month="${month}"][data-day="${day}"]`);
    if (clickedDay) {
        clickedDay.classList.add('selected');
    }

    // Store selected date
    selectedDate = new Date(year, month, day);

    // Enable continue button
    const continueBtn = document.querySelector('.wizard-btn-primary');
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
}

function changeMonth(direction) {
    // Update wizard calendar state
    currentCalendarMonth += direction;

    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }

    // Use unified calendar system for dual calendar
    initializeDualCalendar(currentCalendarMonth, currentCalendarYear);
}



function transitionToSplitScreenWithTimeline() {
    // Hide wizard container
    const wizardContainer = document.getElementById('wizardContainer');
    const chatPanel = document.getElementById('chatPanel');
    const tablePanel = document.getElementById('tablePanel');
    const chatInput = document.querySelector('.chat-input');
    const panelToggle = document.querySelector('.panel-toggle-edge');

    if (wizardContainer) {
        wizardContainer.remove();
    }

    // Initially hide everything and prepare for animation
    chatPanel.style.display = 'flex';
    chatPanel.classList.remove('centered');
    
        chatPanel.style.opacity = '0';
    chatPanel.style.transform = 'translateY(20px)';

    chatInput.style.opacity = '0';
    chatInput.style.transform = 'translateY(20px)';

    tablePanel.style.display = 'flex';
    tablePanel.style.opacity = '0';
    tablePanel.style.transform = 'translateX(100%)';

    panelToggle.style.opacity = '0';

    // FORCE UPDATE THE HEADER TEXT
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');

    if (panelHeader) {
        panelHeader.textContent = 'Implementation Timeline';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Your personalized setup roadmap with key milestones';
    }

    // Start improved animation sequence with AI thinking (skeleton will be shown when panel is visible)
    startTimelineTransitionWithThinking();
}

function showTimelineSkeleton() {
    console.log('🏗️ showTimelineSkeleton called');
    const panelContent = document.querySelector('.panel-content');
    console.log('📋 Panel content found:', !!panelContent);
    if (panelContent) {
        console.log('📋 Panel content dimensions:', panelContent.offsetWidth, 'x', panelContent.offsetHeight);
        console.log('📋 Panel content visibility:', window.getComputedStyle(panelContent).visibility);
        console.log('📋 Panel content display:', window.getComputedStyle(panelContent).display);
    }

    if (panelContent) {
        panelContent.innerHTML = `
            <div class="timeline-view-container">
                <div class="timeline-section">
                    <div class="skeleton-header"></div>
                </div>

                <div class="timeline-content">
                    <div class="timeline-section">
                        <div class="timeline-items">
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-section">
                        <div class="skeleton-header"></div>
                        <div class="timeline-items">
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="skeleton-icon"></div>
                                <div class="timeline-task-content">
                                    <div class="timeline-task-info">
                                        <div class="skeleton-task-line"></div>
                                        <div class="skeleton-due-line"></div>
                                    </div>
                                    <div class="skeleton-progress-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Skeleton HTML inserted successfully');
        console.log('🎭 Skeleton elements found:', panelContent.querySelectorAll('.skeleton-header, .skeleton-icon, .skeleton-task-line, .skeleton-due-line, .skeleton-progress-bar').length);
        console.log('📏 Panel content after skeleton:', panelContent.offsetWidth, 'x', panelContent.offsetHeight);
    } else {
        console.error('❌ Panel content not found - cannot show skeleton');
    }
}

function hideTimelineSkeleton() {
    console.log('🚨 hideTimelineSkeleton called - removing skeleton and showing timeline');
    const panelContent = document.querySelector('.panel-content');

    if (panelContent) {
        console.log('✅ Panel content found, fading out skeleton');
        // Add fade out transition
        panelContent.style.transition = 'opacity 0.3s ease-out';
        panelContent.style.opacity = '0';

        setTimeout(() => {
            // Load timeline content with 0% progress bars
            const dates = calculateTimelineDates();
            loadTimelineWithZeroProgress(dates);

            // Fade in real content
            panelContent.style.opacity = '1';
            console.log('📊 Timeline displayed with 0% progress bars');
        }, 300);
    } else {
        console.log('⚠️ No panel content found to hide skeleton from');
    }
}
// NEW FUNCTION: Timeline transition with AI thinking indicator

function startTimelineTransitionWithThinking() {
    const chatPanel = document.getElementById('chatPanel');
    const chatInput = document.querySelector('.chat-input');
    const tablePanel = document.getElementById('tablePanel');
    const panelToggle = document.querySelector('.panel-toggle-edge');

    // STEP 1: Set initial states
    chatPanel.style.display = 'flex';
    chatPanel.classList.remove('centered');

    // Set up timeline skeleton
    showTimelineSkeleton();

    // GSAP: Set initial states
    gsap.set([chatPanel, chatInput, panelToggle], {
        opacity: 0,
        y: 20
    });

    gsap.set(tablePanel, {
        display: 'flex',
        opacity: 0,
        x: '100%'  // Start completely off-screen to the right
    });

    // Update panel headers
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) panelHeader.textContent = 'Implementation Timeline';
    if (panelSubtitle) panelSubtitle.innerHTML = 'Your personalized setup roadmap with key milestones';

    // STEP 2: Create GSAP Timeline for smooth animations
    const tl = gsap.timeline();

    // Phase 1: Fade in chat panel (200ms delay)
    tl.to(chatPanel, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
    }, 0.2)

    // Phase 2: Show AI thinking and fade in input/toggle (same time as chat)
    .add(() => {
        showAIThinkingIndicator();
    }, 0.2)
    .to([chatInput, panelToggle], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
    }, 0.5)

    // Phase 3: Simultaneous panel resize + slide in (1.2s delay)
    .to(chatPanel, {
        width: "35%",
        duration: 0.8,
        ease: "power3.inOut"
    }, 1.2)
    .to(tablePanel, {
        opacity: 1,
        x: "0%",
        duration: 0.8,
        ease: "power3.out"
    }, 1.2)  // Same start time as chat panel resize

    // Phase 4: Complete animation and show content (5.5s delay)
    .add(() => {
        removeThinkingIndicator();
        hideTimelineSkeleton();
    }, 5.5);
}


// Show AI thinking indicator
function showAIThinkingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message ai-message';
    thinkingDiv.id = 'ai-thinking-indicator';

    thinkingDiv.innerHTML = `
        <div class="message-content">
            <img src="attached_assets/bryte logo.svg" alt="Bryte AI Logo" class="ai-logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"/>
            <div class="thinking-spinner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="thinking-spinner-icon">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span class="thinking-text" id="thinking-text">Analyzing your selected launch date...</span>
            </div>
        </div>
    `;

    messagesContainer.appendChild(thinkingDiv);
    startThinkingTextUpdates();
}

function showRightPanelWithSkeleton() {
    const tablePanel = document.getElementById('tablePanel');

    // Show the right panel with skeleton
    tablePanel.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    tablePanel.style.opacity = '1';
    tablePanel.style.transform = 'translateX(0)';
    
    // Immediately show the grey timeline with 0% progress bars
    const dates = calculateTimelineDates();
    updateTimelineWithNewDates(dates);
    
    // Don't add progress bars here - let timeline show clean without progress bars first
    // Progress bars will be added only when documents are processed
}

function startThinkingTextUpdates() {
    const thinkingSteps = [
        "Analyzing your selected launch date...",
        "Calculating implementation deadlines...",
        "Personalizing based on your profile...",
        "Generating your timeline view..."
    ];

    let currentStep = 0;

    function updateText() {
        const textElement = document.getElementById('thinking-text');
        if (textElement && currentStep < thinkingSteps.length - 1) {
            currentStep++;
            textElement.textContent = thinkingSteps[currentStep];

            // Show skeleton when we reach "Generating your timeline view..."
            if (currentStep === 3) { // Index 3 is "Generating your timeline view..."
                // Don't call showRightPanelWithSkeleton here - skeleton is already shown immediately
                // This was causing skeleton to disappear early
            }

            // Timing to spend more time on early phases, less on "Generating timeline view..."
            if (currentStep < thinkingSteps.length - 1) {
                if (currentStep === 1) {
                    window.thinkingTimeout = setTimeout(updateText, 1500); // Longer for "Analyzing launch date"
                } else if (currentStep === 2) {
                    window.thinkingTimeout = setTimeout(updateText, 1500); // Longer for "Calculating deadlines"
                } else if (currentStep === 3) {
                    // "Generating timeline view..." will show for remaining ~2 seconds (1.5s + 1.5s + 2s = 5s total)
                    // No more updates - this text stays until thinking indicator is removed at 4.8s
                }
            }
        }
    }

    window.thinkingTimeout = setTimeout(updateText, 400);
}

function removeThinkingIndicator() {
    // Clear the text update timeout
    if (window.thinkingTimeout) {
        clearTimeout(window.thinkingTimeout);
        window.thinkingTimeout = null;
    }

    const thinkingIndicator = document.getElementById('ai-thinking-indicator');
    if (thinkingIndicator) {
        thinkingIndicator.remove();
    }
}

function showTimelineWelcomeMessage() {
    // Ensure newWizardState is properly initialized
    if (!window.newWizardState || !window.newWizardState.userData || !window.newWizardState.userData.startDate) {
        console.log('⚠️ newWizardState not properly initialized, setting default values');
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30); // 30 days from now
        
        window.newWizardState = {
            currentStep: 1,
            totalSteps: 5,
            userData: {
                startDate: defaultDate.toISOString().split('T')[0]
            }
        };
    }
    
    const selectedDateFormatted = formatDisplayDate(newWizardState.userData.startDate);

    const welcomeText = `Perfect, I've created your personalized setup timeline based on your ${selectedDateFormatted} launch date.

Let's start by uploading some documents. We'll scan these to auto-fill your company details, saving time and reducing errors.`;
    removeTypingIndicator();
    addMessage(welcomeText, 'ai', [
        { action: 'upload-documents', text: 'Upload documents (recommended)', buttonType: 'primary' },
        { action: 'modify-timeline', text: 'Modify timeline dates', buttonType: 'secondary' },
        { action: 'do-it-later', text: 'Do it later', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'why-upload-documents', text: 'Why do I need to upload documents?' },
            { action: 'what-documents-needed', text: 'What documents are needed?' }
        ]
    });
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateTimeUntil(dateString) {
    const targetDate = new Date(dateString);
    const today = new Date();
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
        return 'Past date';
    } else if (daysDiff === 0) {
        return 'Today';
    } else if (daysDiff === 1) {
        return '1 day';
    } else if (daysDiff < 7) {
        return `${daysDiff} days`;
    } else if (daysDiff < 30) {
        const weeks = Math.floor(daysDiff / 7);
        const days = daysDiff % 7;
        if (days === 0) {
            return `${weeks} week${weeks > 1 ? 's' : ''}`;
        } else {
            return `${weeks} week${weeks > 1 ? 's' : ''}, ${days} day${days > 1 ? 's' : ''}`;
        }
    } else {
        const months = Math.floor(daysDiff / 30);
        return `About ${months} month${months > 1 ? 's' : ''}`;
    }
}

// Function to remove all pill buttons from the chat
function removeAllPills() {
    const allPills = document.querySelectorAll('.suggested-pills');
    allPills.forEach(pills => {
        if (pills.parentNode) {
            pills.parentNode.removeChild(pills);
        }
    });
}

// Function to categorize pills as interactive or informational
function getPillType(action) {
    // Interactive pills - these advance the workflow or perform actions
    const interactivePrefixes = [
        'accept-', 'approve-', 'continue-', 'start-', 'complete-', 'move-to-', 'edit-',
        'change-', 'set-', 'add-', 'modify-', 'update-', 'update-'
    ];

    const interactiveActions = [
        'looks-good', 'bi-weekly', 'monthly', 'quarterly', 'custom',
        'modify-timeline', 'change-launch-date', 'add-new-schedule',
        'change-name', 'change-first-pay-date', 'change-weekend-rules',
        'change-holiday-rules', 'business-day-before', 'business-day-after',
        'closest-business-day', 'upload-documents', 'why-upload-documents', 'confirm-company-info', 'make-corrections'
    ];

    // Check if action starts with interactive prefix
    if (interactivePrefixes.some(prefix => action.startsWith(prefix))) {
        return 'interactive';
    }

    // Check if action is in interactive actions list
    if (interactiveActions.includes(action)) {
        return 'interactive';
    }

    // Default to informational for other actions
    return 'informational';
}

function showDocumentUploadInterface() {
    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Document Upload';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Upload documents to accelerate your setup process';
    }

    // Replace panel content with document upload interface
    const panelContent = document.querySelector('.panel-content');
    panelContent.innerHTML = `
        <div class="document-upload-container">
            <div class="upload-section">
                <h3>📋 Employee Handbook</h3>
                <p class="upload-description">Upload your employee handbook to automatically extract pay policies, overtime rules, and time-off configurations.</p>

                <div class="upload-area" id="handbookUpload" onclick="triggerFileUpload('handbook')">
                    <div class="upload-content">
                        <div class="upload-icon">📄</div>
                        <div class="upload-text">
                            <strong>Drag & drop your handbook here</strong><br>
                            or click to browse files
                        </div>
                        <div class="upload-formats">Supports: PDF, DOC, DOCX</div>
                    </div>
                </div>

                <div class="upload-status" id="handbookStatus" style="display: none;">
                    <div class="status-text">No file selected</div>
                </div>
            </div>

            <div class="upload-section">
                <h3>📊 Payroll History</h3>
                <p class="upload-description"><strong>Recommended:</strong> Upload recent payroll reports to instantly extract earning codes and rate configurations.</p>

                <div class="upload-area" id="payrollUpload" onclick="triggerFileUpload('payroll')">
                    <div class="upload-content">
                        <div class="upload-icon">📊</div>
                        <div class="upload-text">
                            <strong>Drag & drop payroll files here</strong><br>
                            or click to browse files
                        </div>
                        <div class="upload-formats">Supports: PDF, Excel, CSV</div>
                    </div>
                </div>

                <div class="upload-status" id="payrollStatus" style="display: none;">
                    <div class="status-text">No file selected</div>
                </div>
            </div>
            </div>
        </div>

        <!-- Hidden file inputs -->
        <input type="file" id="handbookFileInput" style="display: none;" accept=".pdf,.doc,.docx" onchange="handleFileSelect('handbook', this)">
        <input type="file" id="payrollFileInput" style="display: none;" accept=".pdf,.xlsx,.xls,.csv" onchange="handleFileSelect('payroll', this)">
    `;
}

function triggerFileUpload(type) {
    const fileInput = document.getElementById(type + 'FileInput');
    fileInput.click();
}

function handleFileSelect(type, input) {
    const file = input.files[0];
    if (!file) return;

    const statusDiv = document.getElementById(type + 'Status');
    const uploadArea = document.getElementById(type + 'Upload');

    // Update UI to show file selected
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
        <div class="status-text success">
            ✅ <strong>${file.name}</strong> (${formatFileSize(file.size)})
        </div>
    `;

    uploadArea.classList.add('file-selected');


}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkUploadStatus() {
    const handbookInput = document.getElementById('handbookFileInput');
    const payrollInput = document.getElementById('payrollFileInput');
    const processBtn = document.getElementById('processBtn');

    const hasFiles = handbookInput.files.length > 0 || payrollInput.files.length > 0;
    processBtn.disabled = !hasFiles;
}


function simulateDocumentProcessing(hasHandbook, hasPayroll) {
    // Create animation container with text above
    const animationMessage = `
        <div class="document-upload-animation-container" style="text-align: center; padding: 20px 0;">
            <div style="font-size: 16px; font-weight: 500; color: #333; margin-bottom: 20px;">
                Perfect! I'm analyzing your uploaded documents...
            </div>
            <div id="lottie-animation-container" style="width: 400px; height: 300px; margin: 0 auto;"></div>
        </div>
    `;
    
    addMessage(animationMessage, 'ai');
    
    // Show animated bird carrying documents
    setTimeout(() => {
        const animationContainer = document.getElementById('lottie-animation-container');
        
        if (animationContainer) {
            // Use CSS animation with bird dropping document
            animationContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; position: relative; height: 200px; overflow: hidden;">
                    <style>
                        @keyframes flyToCloud {
                            0% { 
                                left: -100px; 
                                top: 40%;
                                transform: rotate(-5deg);
                            }
                            50% { 
                                left: calc(100% - 160px);
                                top: 15%;
                                transform: rotate(0deg);
                            }
                            55% {
                                left: calc(100% - 160px);
                                top: 15%;
                                transform: rotate(5deg);
                            }
                            100% { 
                                left: calc(100% - 160px);
                                top: 15%;
                                transform: rotate(5deg);
                            }
                        }
                        
                        @keyframes dropDocument {
                            0%, 55% {
                                opacity: 1;
                                transform: translateY(0);
                            }
                            60% {
                                opacity: 1;
                                transform: translateY(0);
                            }
                            75% {
                                opacity: 1;
                                transform: translateY(90px);
                            }
                            80% {
                                opacity: 0;
                                transform: translateY(90px);
                            }
                            100% {
                                opacity: 0;
                                transform: translateY(90px);
                            }
                        }
                        
                        @keyframes cloudReceive {
                            0%, 70% { 
                                transform: scale(1);
                                filter: brightness(1);
                            }
                            75% { 
                                transform: scale(1.1);
                                filter: brightness(1.1);
                            }
                            80% {
                                transform: scale(1.05);
                                filter: brightness(1.2);
                            }
                            100% { 
                                transform: scale(1);
                                filter: brightness(1);
                            }
                        }
                        
                        @keyframes wingFlap {
                            0%, 100% { transform: rotate(0deg); }
                            50% { transform: rotate(-15deg); }
                        }
                        
                        .bird-container {
                            position: absolute;
                            width: 80px;
                            height: 60px;
                            animation: flyToCloud 3s ease-in-out infinite;
                        }
                        
                        .bird-wing {
                            animation: wingFlap 0.3s ease-in-out infinite;
                            transform-origin: right center;
                        }
                        
                        .document-in-feet {
                            animation: dropDocument 3s ease-in-out infinite;
                        }
                        
                        .cloud {
                            position: absolute;
                            right: 40px;
                            top: 45%;
                            animation: cloudReceive 3s ease-in-out infinite;
                        }
                        
                        .sparkle {
                            position: absolute;
                            opacity: 0;
                            animation: sparkleAppear 3s ease-in-out infinite;
                        }
                        
                        @keyframes sparkleAppear {
                            0%, 75% { opacity: 0; }
                            80% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                    </style>
                    
                    <div class="bird-container">
                        <!-- Cute bird SVG with body -->
                        <svg width="80" height="60" viewBox="0 0 80 60" style="position: relative;">
                            <!-- Bird body -->
                            <ellipse cx="40" cy="30" rx="25" ry="20" fill="#4A90E2" />
                            
                            <!-- Bird belly -->
                            <ellipse cx="40" cy="33" rx="20" ry="15" fill="#6BB6FF" />
                            
                            <!-- Wing -->
                            <ellipse class="bird-wing" cx="30" cy="25" rx="15" ry="10" fill="#357ABD" />
                            
                            <!-- Eye -->
                            <circle cx="50" cy="25" r="3" fill="white" />
                            <circle cx="51" cy="25" r="2" fill="black" />
                            
                            <!-- Beak -->
                            <path d="M 55 28 L 62 30 L 55 32 Z" fill="#FFA500" />
                            
                            <!-- Letter in feet (will drop) -->
                            <g class="document-in-feet">
                                <rect x="35" y="45" width="10" height="8" fill="white" stroke="#666" stroke-width="1" rx="1"/>
                                <line x1="37" y1="48" x2="43" y2="48" stroke="#666" stroke-width="0.5"/>
                                <line x1="37" y1="50" x2="43" y2="50" stroke="#666" stroke-width="0.5"/>
                            </g>
                            
                            <!-- Feet -->
                            <line x1="38" y1="40" x2="38" y2="45" stroke="#FFA500" stroke-width="2"/>
                            <line x1="42" y1="40" x2="42" y2="45" stroke="#FFA500" stroke-width="2"/>
                        </svg>
                    </div>
                    
                    <!-- Cloud destination -->
                    <div class="cloud">
                        <svg width="100" height="60" viewBox="0 0 100 60">
                            <!-- Shadow for depth -->
                            <ellipse cx="31" cy="36" rx="20" ry="15" fill="#d0d0d0" opacity="0.5"/>
                            <ellipse cx="51" cy="31" rx="25" ry="20" fill="#d0d0d0" opacity="0.5"/>
                            <ellipse cx="71" cy="36" rx="20" ry="15" fill="#d0d0d0" opacity="0.5"/>
                            
                            <!-- Main cloud with gradient -->
                            <defs>
                                <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <ellipse cx="30" cy="35" rx="20" ry="15" fill="url(#cloudGradient)" stroke="#ccc" stroke-width="0.5"/>
                            <ellipse cx="50" cy="30" rx="25" ry="20" fill="url(#cloudGradient)" stroke="#ccc" stroke-width="0.5"/>
                            <ellipse cx="70" cy="35" rx="20" ry="15" fill="url(#cloudGradient)" stroke="#ccc" stroke-width="0.5"/>
                            
                            <!-- Sparkles that appear when document is received -->
                            <text class="sparkle" x="30" y="25" font-size="12">✨</text>
                            <text class="sparkle" x="60" y="20" font-size="10" style="animation-delay: 0.1s">✨</text>
                            <text class="sparkle" x="45" y="35" font-size="14" style="animation-delay: 0.2s">✨</text>
                        </svg>
                    </div>
                    
                    <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); color: #666; font-size: 14px;">
                        Delivering your documents to the cloud...
                    </div>
                </div>
            `;
        }
    }, 100);

    // PHASE 1: After 3 seconds (when bird animation completes), animate timeline and extract company information
    setTimeout(() => {
        // Timeline panel should already be visible with 0% progress bars
        // Now animate the progress bars to show document processing
        animateImplementationProgress();
        
        // Extract company info
        extractCompanyInformation(hasHandbook, hasPayroll);

        // Show company info extraction message after 2 seconds (while progress bars are animating)
        setTimeout(() => {
            addMessage('Document processing complete!\nNow extracting company information...', 'ai');
        }, 2000);

        // PHASE 1.5: Show progress summary with confetti after 4 seconds (after extraction message)
        setTimeout(() => {
            // Trigger confetti celebration
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Show progress summary message
            addMessage('🎉 <strong>Great progress on your payroll setup!</strong>\n\nBased on your uploaded documents, here\'s what we\'ve completed:\n\n• <strong>Company configuration: 45% complete</strong>\n  - Company information, bank account, and employee data identified\n\n• <strong>Payroll setup: 43% complete</strong>\n  - Pay schedules, earning codes, and tax setup in progress\n\nNext: Let\'s finish your company setup.', 'ai', [
                { action: 'next-step-confirm', text: 'Next step:Company setup', buttonType: 'primary' },
                { action: 'done-for-day', text: 'I am done for the day', buttonType: 'secondary' }
            ], { style: 'two-tier-strategy' });
        }, 4000);

        // PHASE 2: Company information is now only displayed when user clicks "next step: confirm"
        // No automatic display - user must explicitly request to see the company information

    }, 3000);
}

// Show the timeline panel during document processing
function showTimelinePanel() {
    const tablePanel = document.querySelector('.table-panel');
    if (tablePanel) {
        tablePanel.style.display = 'flex';
        
        // Update panel header
        const panelHeader = document.querySelector('.panel-header h2');
        const panelSubtitle = document.querySelector('.panel-subtitle');
        if (panelHeader) {
            panelHeader.textContent = 'Implementation Timeline';
        }
        if (panelSubtitle) {
            panelSubtitle.textContent = 'Processing documents and updating progress...';
        }

        // Add progress indicators to existing timeline (after user confirms files)
        addProgressBarsToTimeline();
    }
}

// Legacy function - no longer used, replaced by animateImplementationProgress
function animateTimelineProgress() {
    // This function is deprecated - use animateImplementationProgress instead
    console.warn('animateTimelineProgress is deprecated - use animateImplementationProgress instead');
}

// Add gray placeholder progress bars when timeline first appears (deprecated - now handled in loadTimelineWithZeroProgress)
function addProgressBarsToTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        const taskContent = item.querySelector('.timeline-task-content');
        let progressContainer = taskContent.querySelector('.timeline-progress');
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'timeline-progress';
            taskContent.appendChild(progressContainer);
        }
        
        // Add 0% progress bar with proper structure
        progressContainer.innerHTML = `
            <div class="timeline-progress-bar" style="width: 0%; background: #e0e0e0; transition: all 0.5s ease;"></div>
        `;
    });
}

// Function to update section progress indicators
function updateSectionProgress() {
    // Company configuration section progress (items 0, 1, 2)
    const companyProgressData = [90, 45, 0]; // Company info, Bank account, Employee info
    const companyAverage = Math.round(companyProgressData.reduce((a, b) => a + b, 0) / companyProgressData.length);
    
    // Payroll setup section progress (items 3, 4, 5)
    const payrollProgressData = [90, 20, 20]; // Pay schedule, Earning/deduction, Tax setup
    const payrollAverage = Math.round(payrollProgressData.reduce((a, b) => a + b, 0) / payrollProgressData.length);
    
    // Update Company configuration section progress
    const companyProgressBar = document.querySelector('[data-section="company"]');
    const companyProgressText = companyProgressBar?.parentElement?.parentElement?.querySelector('.section-progress-text');
    if (companyProgressBar && companyProgressText) {
        companyProgressBar.style.width = `${companyAverage}%`;
        companyProgressBar.style.background = 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)';
        companyProgressBar.classList.add('active');
        companyProgressText.textContent = `${companyAverage}%`;
    }
    
    // Update Payroll setup section progress
    const payrollProgressBar = document.querySelector('[data-section="payroll"]');
    const payrollProgressText = payrollProgressBar?.parentElement?.parentElement?.querySelector('.section-progress-text');
    if (payrollProgressBar && payrollProgressText) {
        payrollProgressBar.style.width = `${payrollAverage}%`;
        payrollProgressBar.style.background = 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)';
        payrollProgressBar.classList.add('active');
        payrollProgressText.textContent = `${payrollAverage}%`;
    }
    
    console.log(`📊 Section progress updated: Company ${companyAverage}%, Payroll ${payrollAverage}%`);
}

// Animate progress bars with data when documents are processed
function animateImplementationProgress() {
    console.log('🎯 animateImplementationProgress called');
    const timelineItems = document.querySelectorAll('.timeline-item');
    console.log('📊 Found timeline items:', timelineItems.length);
    
    const progressData = [
        { progress: 90, status: null },
        { progress: 45, status: null },
        { progress: 0, status: null },
        { progress: 90, status: null },
        { progress: 20, status: null },
        { progress: 20, status: null }
    ];
    
    timelineItems.forEach((item, index) => {
        if (index < progressData.length) {
            const { progress, status } = progressData[index];
            console.log(`📈 Processing item ${index}: ${progress}% - ${status}`);
            
            // Remove grey styling
            item.classList.remove('timeline-grey');
            
            // Keep dates visible, don't change any text during processing
            const dueElement = item.querySelector('.timeline-due');
            if (dueElement) {
                // Always keep the dates visible and unchanged
                dueElement.style.display = 'block';
                // Don't change the text content - keep original dates
                console.log(`✏️ Keeping original date for item ${index}`);
            }
            
            // Get existing progress bar and animate it
            const progressBar = item.querySelector('.timeline-progress-bar');
            console.log(`🔍 Progress bar found for item ${index}:`, !!progressBar);
            
            if (progressBar) {
                // Change to green color first
                progressBar.style.background = 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)';
                console.log(`🎨 Changed color for item ${index} progress bar`);
                
                // Animate to target progress after a delay
                setTimeout(() => {
                    console.log(`🚀 Starting animation for item ${index} to ${progress}%`);
                    animateProgressBarOnly(progressBar, progress);
                }, (index + 1) * 800);
            } else {
                console.log(`❌ No progress bar found for item ${index}`);
            }
            
            // Store progress data
            item.setAttribute('data-progress', progress);
        }
    });
    
    // Update section progress bars after a delay to allow individual progress bars to start animating
    setTimeout(() => {
        updateSectionProgress();
    }, 1000);
}

// Animate progress bar only (no percentage text)
function animateProgressBarOnly(bar, targetPercent) {
    let currentPercent = 0;
    const increment = targetPercent / 50; // 50 steps for smooth animation
    
    const animation = setInterval(() => {
        currentPercent += increment;
        
        if (currentPercent >= targetPercent) {
            currentPercent = targetPercent;
            clearInterval(animation);
        }
        
        bar.style.width = currentPercent + '%';
        
        // Add completion styling when reaching target
        if (currentPercent === targetPercent && targetPercent >= 80) {
            bar.style.background = 'linear-gradient(90deg, #28a745 0%, #34ce57 100%)';
        }
    }, 50);
}

// Legacy function for compatibility
function animateTimelineProgressBar(bar, percentageSpan, targetPercent) {
    animateProgressBarOnly(bar, targetPercent);
}


function skipDocumentUpload() {
    addMessage('Skip & Configure Manually', 'user');

    setTimeout(() => {
        // Transition to existing payroll setup
        loadInitialScheduleCards();
        addMessage('No problem! I\'ll guide you through manual configuration.\n\nI\'ve analyzed your pay registers and extracted information for two different pay schedules. Let\'s verify these schedules first.', 'ai', [
            { action: 'looks-good', text: 'Looks good, continue' },
            { action: 'add-new', text: 'Add new schedule' },
            { action: 'edit-semi-monthly', text: 'Edit Semi-Monthly Payroll' },
            { action: 'edit-weekly', text: 'Edit Weekly Payroll' }
        ]);
    }, 1000);
}

function extractCompanyInformation(hasHandbook, hasPayroll) {
    // Use shared company data based on uploaded documents
    if (hasHandbook && hasPayroll) {
        // Prioritize handbook data if both are available
        extractedCompanyInfo = { ...SHARED_COMPANY_DATA.alternatives.handbook };
    } else if (hasHandbook) {
        extractedCompanyInfo = { ...SHARED_COMPANY_DATA.alternatives.handbook };
    } else if (hasPayroll) {
        extractedCompanyInfo = { ...SHARED_COMPANY_DATA.alternatives.payroll };
    }

    console.log('Extracted company info:', extractedCompanyInfo);
}

function showCompanyInfoConfirmation(hasHandbook, hasPayroll) {
    // Create the company info card HTML
    const companyCardHtml = createCompanyInfoCard();
    
    // Create the main confirmation message
    const confirmationText = `I found the following information in your documents:

${companyCardHtml}

Please review this information and confirm it's correct.`;

    // Add the message with pills
    addUnifiedMessage(confirmationText, 'ai', {
        pills: [
            { action: 'confirm-company-info', text: 'Yes, info is correct', buttonType: 'primary' },
            { action: 'make-corrections', text: 'Edit info', buttonType: 'secondary' },
            { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
        ],
        style: 'two-tier-interactive'
    });
}

function createCompanyInfoCard() {
    return `
        <div class="company-info-card">
            <div class="company-info-header">
                <h3 class="company-info-title">Company Information</h3>
                <button class="company-info-edit-btn" onclick="openCompanyEditPanel()" title="Edit company information">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
            </div>
            <div class="company-info-content">
                <div class="company-info-row">
                    <span class="company-info-label">Name</span>
                    <span class="company-info-value">${extractedCompanyInfo.legalName}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Address</span>
                    <span class="company-info-value">${extractedCompanyInfo.address}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">EIN</span>
                    <span class="company-info-value">${extractedCompanyInfo.ein}</span>
                </div>

            </div>
        </div>
    `;
}



function closeRightPanelAndCenterChat() {
    const appContainer = document.querySelector('.app-container');
    const tablePanel = document.querySelector('.table-panel');
    const chatPanel = document.querySelector('.chat-panel');
    
    if (!tablePanel || !chatPanel) return;
    
    // Create GSAP timeline for simultaneous animations
    const tl = gsap.timeline({
        ease: "power2.out",
        onComplete: () => {
            // Clean up after animation
            tablePanel.classList.add('hidden');
            chatPanel.classList.remove('intro-mode');
            chatPanel.classList.add('centered');
            if (appContainer) {
                appContainer.classList.add('centered-layout');
            }
            
            // Show "Bryte is thinking" for 2 seconds
            showBryteThinking();
        }
    });
    
    // Animate table panel sliding right and fading out
    tl.to(tablePanel, {
        x: "100%",
        opacity: 0,
        duration: 1.2,
        ease: "power2.inOut"
    }, 0); // Start at time 0
    
    // Simultaneously animate chat panel centering
    tl.to(chatPanel, {
        width: "800px",
        marginLeft: "auto",
        marginRight: "auto",
        duration: 1.2,
        ease: "power2.inOut"
    }, 0); // Start at time 0 (simultaneous)
    
    // Animate app container layout change
    if (appContainer) {
        tl.to(appContainer, {
            justifyContent: "center",
            paddingLeft: "var(--spacing-xl)",
            paddingRight: "var(--spacing-xl)",
            duration: 1.2,
            ease: "power2.inOut"
        }, 0); // Start at time 0 (simultaneous)
    }
}

function showBryteThinking(callback = null) {
    console.log("🤔 showBryteThinking called with callback:", typeof callback);
    
    // Show the "Bryte is thinking..." indicator
    const thinkingMessage = addMessage('Bryte is thinking...', 'ai');
    console.log("💭 Thinking message created:", thinkingMessage);
    
    const thinkingElement = thinkingMessage.querySelector('.message-content');
    console.log("🔍 Thinking element found:", thinkingElement);
    
    // Add animated dots
    if (thinkingElement) {
        thinkingElement.classList.add('thinking-animation');
        console.log("✨ Added thinking animation class");
        
        // After 2 seconds, remove thinking message and execute callback or default
        setTimeout(() => {
            console.log("⏰ 2 seconds elapsed, removing thinking message");
            thinkingMessage.remove();
            
            if (callback && typeof callback === 'function') {
                console.log("🚀 Executing provided callback");
                callback();
            } else {
                console.log("📋 No callback provided, using default showCompanyInfoAfterThinking");
                showCompanyInfoAfterThinking();
            }
        }, 2000);
    } else {
        console.error("❌ Thinking element not found, executing callback immediately");
        if (callback && typeof callback === 'function') {
            callback();
        } else {
            showCompanyInfoAfterThinking();
        }
    }
}

function showCompanyInfoAfterThinking() {
    console.log("📋 showCompanyInfoAfterThinking called");
    
    // Create the company info card HTML and display
    const companyCardHtml = createCompanyInfoCard();
    console.log("💼 Company card HTML created");
    
    const confirmationText = `<strong>Here's your Company Setup process (2 main steps):</strong>

<strong>📋 Step 1: EIN & Company Details</strong>
• Verify your legal company name and address
• Confirm your Federal EIN (Employer ID Number)
• Review basic company information
<em>You are here now!</em>

<strong>🏦 Step 2: Bank Account Setup</strong>
• Securely add your company bank account
• Set up ACH details for payroll processing
• Verify routing and account numbers

This ensures accurate payroll processing and tax compliance.

I found the following information in your Employee Handbook:
${companyCardHtml}Is this information correct for your company?`;
    
    console.log("📝 Adding message with company info");
    addMessage(confirmationText, 'ai', [
        { action: 'confirm-company-info', text: 'Yes, info is correct', buttonType: 'primary' },
        { action: 'make-corrections', text: 'Edit info', buttonType: 'secondary' },
        { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'show-company-setup-overview', text: 'What information do I need to provide?' },
            { action: 'where-find-ein', text: 'Where can I find my EIN?' },
            { action: 'bank-security-info', text: 'How is my bank information secured?' }
        ]
    });
    console.log("✅ Company info message added successfully");
}

function showMultipleCompanyInfo() {
    console.log("📋 showMultipleCompanyInfo called");
    
    // Sample company data for multiple companies
    const companies = [
        {
            legalName: "Acme Corporation Inc.",
            address: "1234 Business Ave, Suite 500, Chicago, IL 60601",
            ein: "12-3456789"
        },
        {
            legalName: "TechStart LLC",
            address: "5678 Innovation Dr, Austin, TX 78701",
            ein: "98-7654321"
        },
        {
            legalName: "GlobalCorp Industries",
            address: "9999 Enterprise Blvd, Seattle, WA 98101",
            ein: "45-6789012"
        }
    ];
    
    // First show the single company card
    const firstCompanyCardHtml = createCompanyInfoCard();
    
    const initialText = `I found the following information in your Employee Handbook:
${firstCompanyCardHtml}Is this information correct for your company?`;
    
    addMessage(initialText, 'ai', [
        { action: 'confirm-company-info', text: 'Yes, info is correct', buttonType: 'primary' },
        { action: 'make-corrections', text: 'Edit info', buttonType: 'secondary' },
        { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
    
    // After a delay, show the multiple companies grid
    setTimeout(() => {
        const multipleCompaniesHtml = createMultipleCompanyCardsGrid(companies);
        
        addMessage(`I also found information for additional companies in your system:
${multipleCompaniesHtml}Would you like to manage these companies as well?`, 'ai', [
            { action: 'manage-multiple-companies', text: 'Manage all companies', buttonType: 'primary' },
            { action: 'single-company-only', text: 'Work with first company only', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 2000);
    
    console.log("✅ Multiple company info displayed successfully");
}

function showDirectMultipleCompanyInfo() {
    console.log("📋 showDirectMultipleCompanyInfo called");
    
    // Sample company data for 3 companies
    const companies = [
        {
            legalName: "TechStart LLC",
            address: "5678 Innovation Dr, Austin, TX 78701",
            ein: "98-7654321"
        },
        {
            legalName: "GlobalCorp Industries",
            address: "9999 Enterprise Blvd, Seattle, WA 98101",
            ein: "45-6789012"
        },
        {
            legalName: "Regional Services Inc.",
            address: "2200 Commerce St, Dallas, TX 75201",
            ein: "33-4455667"
        }
    ];
    
    // Show only the multiple companies grid
    const multipleCompaniesHtml = createMultipleCompanyCardsGrid(companies);
    
    addMessage(`I found information for additional companies in your system:
${multipleCompaniesHtml}Would you like to manage these companies as well?`, 'ai', [
        { action: 'manage-multiple-companies', text: 'Manage all companies', buttonType: 'primary' },
        { action: 'single-company-only', text: 'Work with first company only', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });
    
    console.log("✅ Direct multiple company info displayed successfully");
}

function createMultipleCompanyCardsGrid(companies) {
    const cardsHtml = companies.map(company => `
        <div class="company-info-card multi-company-card">
            <div class="company-info-header">
                <h3 class="company-info-title">Company Information</h3>
                <button class="company-info-edit-btn" onclick="openCompanyEditPanel('${company.ein}')" title="Edit company information">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
            </div>
            <div class="company-info-content">
                <div class="company-info-row">
                    <span class="company-info-label">Name</span>
                    <span class="company-info-value">${company.legalName}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Address</span>
                    <span class="company-info-value">${company.address}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">EIN</span>
                    <span class="company-info-value">${company.ein}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    return `<div class="multiple-companies-grid">${cardsHtml}</div>`;
}

// Function to create pay schedule cards
function createPayScheduleCards() {
    const schedules = [
        {
            name: "Semi-Monthly Payroll",
            frequency: "Twice per month",
            payDates: "15th and last day",
            periodsPerYear: "24 pay periods/year",
            firstPayDate: "August 15, 2025",
            hoursPerPeriod: "80 hours",
            weekendPayDate: "Friday before the date",
            holidayPayDate: "Friday before the date"
        },
        {
            name: "Weekly Payroll", 
            frequency: "Every week",
            payDates: "Every Friday",
            periodsPerYear: "52 pay periods/year",
            firstPayDate: "August 8, 2025",
            hoursPerPeriod: "40 hours",
            weekendPayDate: "Not applicable",
            holidayPayDate: "Thursday before the holiday"
        }
    ];
    
    const cardsHtml = schedules.map((schedule, index) => `
        <div class="company-info-card schedule-card-chat">
            <div class="company-info-header">
                <h3 class="company-info-title">${schedule.name}</h3>
                <button class="company-info-edit-btn" onclick="openScheduleEditPanel('${schedule.name}')" title="Edit schedule">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
            </div>
            <div class="company-info-content">
                <div class="company-info-row">
                    <span class="company-info-label">Frequency</span>
                    <span class="company-info-value">${schedule.frequency}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Pay Dates</span>
                    <span class="company-info-value">${schedule.payDates}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Pay Periods</span>
                    <span class="company-info-value">${schedule.periodsPerYear}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">First Pay Date</span>
                    <span class="company-info-value">${schedule.firstPayDate}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Hours/Period</span>
                    <span class="company-info-value">${schedule.hoursPerPeriod}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Weekend Rule</span>
                    <span class="company-info-value">${schedule.weekendPayDate}</span>
                </div>
                <div class="company-info-row">
                    <span class="company-info-label">Holiday Rule</span>
                    <span class="company-info-value">${schedule.holidayPayDate}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    return `<div class="pay-schedules-grid">${cardsHtml}</div>`;
}

// Function to open the company edit panel
function openCompanyEditPanel(ein = null) {
    console.log('🖊️ Opening company edit panel for EIN:', ein);
    
    // Add user message "Editing info"
    addMessage('Editing info', 'user');
    
    // Determine which company data to edit
    let companyData;
    if (ein) {
        // Find specific company from multiple companies data
        const companies = [
            {
                legalName: "TechStart LLC",
                address: "5678 Innovation Dr, Austin, TX 78701",
                ein: "98-7654321"
            },
            {
                legalName: "GlobalCorp Industries",
                address: "9999 Enterprise Blvd, Seattle, WA 98101",
                ein: "45-6789012"
            },
            {
                legalName: "Regional Services Inc.",
                address: "2200 Commerce St, Dallas, TX 75201",
                ein: "33-4455667"
            }
        ];
        companyData = companies.find(company => company.ein === ein) || extractedCompanyInfo;
    } else {
        // Use the default extracted company info
        companyData = extractedCompanyInfo;
    }
    
    // Show the right panel if it's hidden
    const tablePanel = document.getElementById('tablePanel');
    const chatPanel = document.getElementById('chatPanel');
    
    console.log('🔍 Panel states:', {
        tablePanel: !!tablePanel,
        chatPanel: !!chatPanel,
        tablePanelClasses: tablePanel?.className,
        chatPanelClasses: chatPanel?.className
    });
    
    if (tablePanel && chatPanel) {
        // Remove centered class from chat panel when showing right panel
        chatPanel.classList.remove('centered');
        
        // Remove hidden classes but keep panel off-screen initially
        tablePanel.classList.remove('hidden', 'slide-hidden');
        
        // Set initial panel states
        gsap.set(tablePanel, {
            display: 'flex',
            width: '70%',
            x: '100%',  // Start fully off-screen to the right
            opacity: 1
        });
        
        gsap.set(chatPanel, {
            width: '100%'  // Start with chat panel taking full width
        });
        
        // Use GSAP timeline for synchronized push animation
        const tl = gsap.timeline({
            ease: 'power2.inOut'
        });
        
        // Create push effect by animating both panels simultaneously
        tl.to(chatPanel, {
            width: '30%',  // Shrink chat panel to make room
            duration: 0.6,
            ease: 'power2.inOut'
        }, 0)
        .to(tablePanel, {
            x: '0%',  // Slide in from right
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                console.log('✅ Panel slide-in animation complete');
                // Ensure final states are set
                tablePanel.style.width = '70%';
                chatPanel.style.width = '30%';
            }
        }, 0); // Start at the same time for synchronized movement
        
        console.log('✅ Panel classes updated:', {
            tablePanelClasses: tablePanel.className,
            chatPanelClasses: chatPanel.className
        });
        
        // Update the right panel content with edit form
        const panelHeader = tablePanel.querySelector('.panel-header h2');
        const panelContent = document.getElementById('panelContent');
        
        if (panelHeader) {
            panelHeader.textContent = 'Edit Company Information';
        }
        
        if (panelContent) {
            console.log('🎨 Updating panel content with spinner');
            
            // First show spinner
            panelContent.innerHTML = `
                <div class="loading-spinner-container" style="display: flex; justify-content: center; align-items: center; height: 300px;">
                    <div class="spinner"></div>
                </div>
            `;
            
            // After 2 seconds, show edit form and AI message
            setTimeout(() => {
                console.log('🎨 Updating panel content with edit form');
                
                // Add AI reply with pills (2-tier strategy)
                addMessage('Let me know when you are done.', 'ai', [
                    { action: 'edit-done', text: 'Info is correct, start configuration', buttonType: 'primary' },
                    { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
                ], {
                    style: 'two-tier-interactive'
                });
                
                // Use GSAP for smooth content transition
                gsap.to(panelContent, {
                    opacity: 0,
                    y: 10,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        panelContent.innerHTML = `
                        <div class="panel-content-container">
                            <div class="edit-form-container">
                                <div class="edit-field-group">
                                    <label for="editCompanyName">Company Name</label>
                                    <input type="text" id="editCompanyName" value="${companyData.legalName || ''}" placeholder="Enter company name">
                                </div>
                                <div class="edit-field-group">
                                    <label for="editCompanyAddress">Address</label>
                                    <textarea id="editCompanyAddress" placeholder="Enter company address" rows="3">${companyData.address || ''}</textarea>
                                </div>
                                <div class="edit-field-group">
                                    <label for="editCompanyEin">EIN</label>
                                    <input type="text" id="editCompanyEin" value="${companyData.ein || ''}" placeholder="Enter EIN">
                                </div>
                            </div>
                        </div>
                    `;
                    
                    console.log('✅ Panel content HTML updated');
                    
                    // Animate form fields individually for smoother effect
                    const formGroups = panelContent.querySelectorAll('.edit-field-group');
                    
                    // Animate content fade in
                    gsap.fromTo(panelContent, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                    );
                    
                    // Stagger form fields animation
                    gsap.fromTo(formGroups, 
                        { opacity: 0, x: 30 },
                        { 
                            opacity: 1, 
                            x: 0, 
                            duration: 0.4, 
                            stagger: 0.1, 
                            ease: 'power2.out',
                            delay: 0.1 
                        }
                    );
                    
                    console.log('🎭 GSAP animations applied');
                }
            });
            }, 2000); // 2 second delay for spinner
        } else {
            console.error('❌ panelContent element not found!');
        }
        
        console.log('✅ Right panel updated with edit form');
    }
}

// Function to close the company edit panel
function closeCompanyEditPanel() {
    console.log('❌ Closing company edit panel');
    
    // Restore the original right panel content
    const tablePanel = document.getElementById('tablePanel');
    const panelHeader = tablePanel?.querySelector('.panel-header h2');
    const panelContent = document.getElementById('panelContent');
    
    if (panelHeader) {
        // Animate header text change
        gsap.to(panelHeader, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                panelHeader.textContent = 'Review Extracted Pay Schedules';
                gsap.to(panelHeader, { opacity: 1, duration: 0.2 });
            }
        });
    }
    
    if (panelContent) {
        // Use GSAP for smooth content transition
        gsap.to(panelContent, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                // Restore original content
                panelContent.innerHTML = `
                    <div class="panel-content-container">
                        <div class="step-progress">
                            📋 Ready to continue with payroll setup
                        </div>
                        <p style="color: var(--text-secondary); padding: var(--spacing-lg);">
                            Company information editing completed. You can continue with the next step in your payroll setup.
                        </p>
                    </div>
                `;
                
                // Animate content back in
                gsap.fromTo(panelContent, 
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            }
        });
    }
    
    console.log('✅ Right panel content restored');
}

// Function to open the schedule edit panel
function openScheduleEditPanel(scheduleName) {
    console.log('🖊️ Opening schedule edit panel for:', scheduleName);
    
    // Add user message "Editing info"
    addMessage('Editing info', 'user');
    
    // Find the schedule data
    const schedules = {
        "Semi-Monthly Payroll": {
            name: "Semi-Monthly Payroll",
            frequency: "Twice per month",
            payDates: "15th and last day",
            periodsPerYear: "24 pay periods/year",
            firstPayDate: "August 15, 2025",
            hoursPerPeriod: "80 hours",
            weekendPayDate: "Friday before the date",
            holidayPayDate: "Friday before the date"
        },
        "Weekly Payroll": {
            name: "Weekly Payroll", 
            frequency: "Every week",
            payDates: "Every Friday",
            periodsPerYear: "52 pay periods/year",
            firstPayDate: "August 8, 2025",
            hoursPerPeriod: "40 hours",
            weekendPayDate: "Not applicable",
            holidayPayDate: "Thursday before the holiday"
        }
    };
    
    const scheduleData = schedules[scheduleName];
    if (!scheduleData) {
        console.error('Schedule not found:', scheduleName);
        return;
    }
    
    // Update the right panel with edit form
    const tablePanel = document.getElementById('tablePanel');
    const chatPanel = document.getElementById('chatPanel');
    const panelHeader = tablePanel?.querySelector('.panel-header h2');
    const panelContent = document.getElementById('panelContent');
    
    if (panelHeader) {
        panelHeader.textContent = `Edit ${scheduleName}`;
    }
    
    if (panelContent) {
        // First show spinner
        panelContent.innerHTML = `
            <div class="loading-spinner-container" style="display: flex; justify-content: center; align-items: center; height: 300px;">
                <div class="spinner"></div>
            </div>
        `;
        
        // Show the panel if it's hidden
        if (tablePanel.classList.contains('hidden')) {
            tablePanel.classList.remove('hidden');
            
            // Set initial panel states
            gsap.set(tablePanel, {
                display: 'flex',
                width: '70%',
                x: '100%',  // Start fully off-screen to the right
                opacity: 1
            });
            
            gsap.set(chatPanel, {
                width: '100%'  // Start with chat panel taking full width
            });
            
            // Use GSAP timeline for synchronized push animation
            const tl = gsap.timeline({
                ease: 'power2.inOut'
            });
            
            // Create push effect by animating both panels simultaneously
            tl.to(chatPanel, {
                width: '30%',  // Shrink chat panel to make room
                duration: 0.6,
                ease: 'power2.inOut'
            }, 0)
            .to(tablePanel, {
                x: '0%',  // Slide in from right
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Ensure final states are set
                    tablePanel.style.width = '70%';
                    chatPanel.style.width = '30%';
                }
            }, 0); // Start at the same time for synchronized movement
        }
        
        // After 2 seconds, show edit form and AI message
        setTimeout(() => {
            // Add AI reply with pills (2-tier strategy)
            addMessage('Let me know when you are done.', 'ai', [
                { action: 'edit-done', text: 'Info is correct, start configuration', buttonType: 'primary' },
                { action: 'add-new-ein', text: 'Add new company', buttonType: 'secondary' }
            ], {
                style: 'two-tier-interactive'
            });
            
            // Create the edit form content
            const editFormHtml = `
                <div class="company-edit-form">
                    <div class="form-group">
                        <label for="scheduleName">Schedule Name</label>
                        <input type="text" id="scheduleName" value="${scheduleData.name}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="frequency">Frequency</label>
                        <select id="frequency" class="form-input">
                            <option value="Weekly" ${scheduleData.frequency.includes('week') ? 'selected' : ''}>Weekly</option>
                            <option value="Bi-weekly" ${scheduleData.frequency.includes('Bi-weekly') ? 'selected' : ''}>Bi-weekly</option>
                            <option value="Twice per month" ${scheduleData.frequency.includes('Twice per month') ? 'selected' : ''}>Semi-monthly</option>
                            <option value="Monthly" ${scheduleData.frequency.includes('Monthly') ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="payDates">Pay Dates</label>
                        <input type="text" id="payDates" value="${scheduleData.payDates}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="firstPayDate">First Pay Date</label>
                        <input type="text" id="firstPayDate" value="${scheduleData.firstPayDate}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="hoursPerPeriod">Hours per Period</label>
                        <input type="text" id="hoursPerPeriod" value="${scheduleData.hoursPerPeriod}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="weekendPayDate">Weekend Pay Date Rule</label>
                        <input type="text" id="weekendPayDate" value="${scheduleData.weekendPayDate}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="holidayPayDate">Holiday Pay Date Rule</label>
                        <input type="text" id="holidayPayDate" value="${scheduleData.holidayPayDate}" class="form-input">
                    </div>
                </div>
            `;
            
            // Use GSAP for smooth content transition
            gsap.to(panelContent, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    panelContent.innerHTML = editFormHtml;
                    
                    // Animate form fields
                    const formGroups = panelContent.querySelectorAll('.form-group');
                    
                    // Animate content fade in
                    gsap.fromTo(panelContent, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                    );
                    
                    // Stagger form fields animation
                    gsap.fromTo(formGroups,
                        { opacity: 0, x: 50 },
                        { 
                            opacity: 1, 
                            x: 0, 
                            duration: 0.4,
                            stagger: 0.1,
                            ease: 'power2.out',
                            delay: 0.2
                        }
                    );
                }
            });
        }, 2000); // 2 second delay for spinner
    }
    
    console.log('✅ Schedule edit panel opened');
}

// Function to close the schedule edit panel
function closeScheduleEditPanel() {
    console.log('❌ Closing schedule edit panel');
    
    // Restore the original right panel content
    const tablePanel = document.getElementById('tablePanel');
    const panelHeader = tablePanel?.querySelector('.panel-header h2');
    const panelContent = document.getElementById('panelContent');
    
    if (panelHeader) {
        // Animate header text change
        gsap.to(panelHeader, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                panelHeader.textContent = 'Review Extracted Pay Schedules';
                gsap.to(panelHeader, { opacity: 1, duration: 0.2 });
            }
        });
    }
    
    if (panelContent) {
        // Use GSAP for smooth content transition
        gsap.to(panelContent, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                // Restore original schedule cards content
                loadInitialScheduleCards();
                
                // Animate content back in
                gsap.fromTo(panelContent, 
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            }
        });
    }
    
    console.log('✅ Schedule panel content restored');
}

// Function to save schedule changes
function saveScheduleChanges(originalScheduleName) {
    console.log('💾 Saving schedule changes for:', originalScheduleName);
    
    // Get the form values
    const newName = document.getElementById('scheduleName').value;
    const frequency = document.getElementById('frequency').value;
    const payDates = document.getElementById('payDates').value;
    const firstPayDate = document.getElementById('firstPayDate').value;
    const hoursPerPeriod = document.getElementById('hoursPerPeriod').value;
    const weekendPayDate = document.getElementById('weekendPayDate').value;
    const holidayPayDate = document.getElementById('holidayPayDate').value;
    
    // Add success message to chat
    addMessage(`✅ Schedule "${newName}" has been updated successfully!`, 'ai', [
        { action: 'continue-after-schedule-edit', text: 'Continue', buttonType: 'primary' }
    ]);
    
    // Close the edit panel
    closeScheduleEditPanel();
}

function saveCompanyChanges(ein = '') {
    console.log('💾 Saving company changes for EIN:', ein);
    
    // Get the values from the edit form
    const nameInput = document.getElementById('editCompanyName');
    const addressInput = document.getElementById('editCompanyAddress');
    const einInput = document.getElementById('editCompanyEin');
    
    if (nameInput && addressInput && einInput) {
        const updatedInfo = {
            legalName: nameInput.value.trim(),
            address: addressInput.value.trim(),
            ein: einInput.value.trim()
        };
        
        console.log('💾 Updated company info:', updatedInfo);
        
        // Update the global company info if this is the main company
        if (!ein || ein === extractedCompanyInfo.ein) {
            extractedCompanyInfo.legalName = updatedInfo.legalName;
            extractedCompanyInfo.address = updatedInfo.address;
            extractedCompanyInfo.ein = updatedInfo.ein;
        }
        
        // Close the panel
        closeCompanyEditPanel();
        
        // Show success message
        addMessage(`Company information updated successfully!`, 'ai');
        
        // Add action pills for next steps
        createPills([
            { action: 'refresh-company-info', text: 'View updated info', buttonType: 'primary' },
            { action: 'continue-setup', text: 'Continue setup', buttonType: 'secondary' }
        ]);
        
        console.log('✅ Company changes saved successfully');
    } else {
        console.error('❌ Could not find edit form inputs');
    }
}

// Function to save company changes
function saveCompanyChanges(ein = null) {
    console.log('💾 Saving company changes for EIN:', ein);
    
    const nameField = document.getElementById('editCompanyName');
    const addressField = document.getElementById('editCompanyAddress');
    const einField = document.getElementById('editCompanyEin');
    
    const updatedData = {
        legalName: nameField.value.trim(),
        address: addressField.value.trim(),
        ein: einField.value.trim()
    };
    
    // Update the extracted company info if no specific EIN
    if (!ein) {
        extractedCompanyInfo = { ...extractedCompanyInfo, ...updatedData };
    }
    
    // Close the panel
    closeCompanyEditPanel();
    
    // Show success message
    addMessage('Company information updated successfully!', 'ai', [
        { action: 'continue-setup', text: 'Continue with setup', buttonType: 'primary' }
    ], {
        style: 'two-tier-interactive'
    });
    
    console.log('✅ Company changes saved successfully');
}

function updateCompanyInfoStatus(status) {
    // Always update confirmation status in data
    if (status === 'confirmed') {
        extractedCompanyInfo.isConfirmed = true;
    }
}

function showNewEINUploadInterface() {
    const uploadMessage = `Upload the document that has the info, we can extract the info for you.

<div class="upload-widget" onclick="triggerFileUpload('newein')" style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0 8px 0; cursor: pointer; background: #f9f9f9;">
  <div style="color: #666; font-size: 14px; margin-bottom: 8px;">Drag and drop or</div>
  <button style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Browse files</button>
</div>

<!-- Hidden file input -->
<input type="file" id="neweinFileInput" style="display: none;" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv" multiple>`;

    addMessage(uploadMessage, 'ai', [
        { action: 'upload-new-ein-documents', text: 'Upload documents', buttonType: 'primary' },
        { action: 'enter-ein-manually', text: 'Enter manually', buttonType: 'secondary' },
        { action: 'not-doing-now', text: 'Not doing it now', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive'
    });

    // Set up drag and drop functionality
    setTimeout(() => {
        setupNewEINDragAndDrop();
    }, 500);
}

function setupNewEINDragAndDrop() {
    const uploadArea = document.querySelector('.upload-widget');
    const fileInput = document.getElementById('neweinFileInput');
    
    if (!uploadArea || !fileInput) return;

    // Handle drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#4CAF50';
        uploadArea.style.background = '#f0f8f0';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.background = '#f9f9f9';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.background = '#f9f9f9';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleNewEINFileSelection(files);
        }
    });

    // Handle click to browse
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection via input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleNewEINFileSelection(e.target.files);
        }
    });
}

function handleNewEINFileSelection(files) {
    const uploadArea = document.querySelector('.upload-widget');
    if (uploadArea && files.length > 0) {
        uploadArea.style.borderColor = '#4CAF50';
        uploadArea.style.background = '#f0f8f0';
        
        // Update the text content
        const textDiv = uploadArea.querySelector('div');
        const button = uploadArea.querySelector('button');
        if (textDiv && button) {
            textDiv.textContent = `${files.length} file(s) selected`;
            button.textContent = 'Files ready to upload';
        }
    }
}

function createNewCompanyInfoCard(companyInfo) {
    return `
        <div class="company-info-card">
            <div class="company-info-header">
                <h3 class="company-info-title">New Company Information</h3>
            </div>
            <div class="company-info-body">
                <div class="company-info-row">
                    <div class="company-info-label">Name</div>
                    <div class="company-info-value">${companyInfo.legalName}</div>
                </div>
                <div class="company-info-row">
                    <div class="company-info-label">Address</div>
                    <div class="company-info-value">${companyInfo.address}</div>
                </div>
                <div class="company-info-row">
                    <div class="company-info-label">EIN</div>
                    <div class="company-info-value">${companyInfo.ein}</div>
                </div>
            </div>
        </div>`;
}

function updateDisplayField(fieldName, newValue) {
    const displayElement = document.getElementById(`display${fieldName}`);
    if (displayElement) {
        displayElement.textContent = newValue;

        // Update the data object
        switch (fieldName) {
            case 'LegalName':
                extractedCompanyInfo.legalName = newValue;
                break;
            case 'Address':
                extractedCompanyInfo.address = newValue;
                break;
            case 'EIN':
                extractedCompanyInfo.ein = newValue;
                break;
        }
    }
}

function updateScheduleField(scheduleType, fieldType, newValue) {
    const scheduleCards = document.querySelectorAll('.schedule-card');

    scheduleCards.forEach(card => {
        const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();

        // Match the schedule type
        if ((scheduleType === 'semi-monthly' && cardTitle.includes('semi-monthly')) ||
            (scheduleType === 'weekly' && cardTitle.includes('weekly'))) {

            const scheduleDetails = card.querySelectorAll('.schedule-detail');

            scheduleDetails.forEach(detail => {
                const label = detail.querySelector('.detail-label').textContent.toLowerCase();

                // Update the appropriate field
                if (fieldType === 'name' && label.includes('name')) {
                    detail.querySelector('.detail-value').textContent = newValue;
                } else if (fieldType === 'first-pay-date' && label.includes('first pay date')) {
                    detail.querySelector('.detail-value').textContent = newValue;
                }
            });
        }
    });
}

// ADD THIS FUNCTION TO YOUR CODE (put it near your other UI helper functions)

function getDefaultCalculationMethod(codeId) {
    // Overtime codes use multiplier
    if (['OT1-ENG', 'OT1-CC', 'HOLWK'].includes(codeId)) {
        return '1.5';
    }
    if (['OT2-ENG', 'OT2-CC', 'DT'].includes(codeId)) {
        return '2';
    }
    if (['COMP'].includes(codeId)) {
        return '0.5';
    }
    // Bonus/award codes use flat amount
    if (['BON', 'BONUS', 'AWARD', 'CAR', 'RELO', 'LON', 'RETRO', 'ADJ'].includes(codeId)) {
        return 'flat';
    }
    // Commission uses formula
    if (['COMM'].includes(codeId)) {
        return 'formula';
    }
    // Everything else uses standard rate
    return '1';
}


function getDefaultBaseComp(codeId) {
    // Regular earning codes typically included in base compensation
    if (['REG', 'SHFT', 'LEAD', 'HAZ', 'COMM'].includes(codeId)) {
        return 'yes';
    }
    // Time-off and overtime excluded
    if (['VAC', 'SICK', 'BRVMT', 'JURY', 'FMLA', 'PERSL', 'OT1-ENG', 'OT1-CC', 'OT2-ENG', 'OT2-CC', 'DT', 'HOLWK'].includes(codeId)) {
        return 'no';
    }
    return 'no'; // Default to no
}

function getDefaultSpecialTax(codeId) {
    // Bonus codes typically have supplemental tax
    if (['BON', 'BONUS', 'AWARD', 'COMM'].includes(codeId)) {
        return 'supplemental';
    }
    // Reimbursements are non-taxable
    if (['CAR', 'RELO', 'TRVL'].includes(codeId)) {
        return 'nontaxable';
    }
    return 'none'; // Default to no special tax
}

function updateCalculationMethod(codeId, method) {
    console.log(`Updated calculation method for ${codeId}: ${method}`);
    // Store the configuration change
    // You can expand this to update your data model
}



function updateWeightedOT(codeId, value) {
    console.log(`Updated weighted OT for ${codeId}: ${value}`);
    // Store the weighted OT setting
}


function updateBaseComp(codeId, value) {
    console.log(`Updated base compensation for ${codeId}: ${value}`);
    // Store the base compensation setting
}

function updateSpecialTax(codeId, value) {
    console.log(`Updated special tax for ${codeId}: ${value}`);
    // Store the special tax setting
}

function updateDragColumnCounts(sectionPrefix) {
    const columns = document.querySelectorAll(`.drag-column[id^="${sectionPrefix}"]`);

    columns.forEach(column => {
        const count = column.querySelectorAll('.draggable-card').length;
        const badge = column.querySelector('.count-badge');
        if (badge) {
            badge.textContent = count;
        }
    });
}


function updateMinMax(codeId, value) {
    console.log(`Updated min/max for ${codeId}: ${value}`);
    // Store the min/max limits
}

function saveAllConfigurations() {
    console.log('Saving all configurations...');
    addMessage('✅ All configurations saved successfully!', 'ai', [
        { action: 'continue-to-w2-preview', text: 'Continue to W-2 Preview' },
        { action: 'export-configuration', text: 'Export Configuration' }
    ]);
}

function resetToDefaults() {
    console.log('Resetting to defaults...');
    // Regenerate the table with default values
    generateComprehensiveRateTable();
    addMessage('🔄 All settings reset to default values.', 'ai');
}

function updatePanelContent(type, options = {}) {
    const panelContent = document.querySelector('.panel-content');
    if (!panelContent) return;

    switch (type) {
        case 'loading':
            panelContent.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <div class="loading-text">${options.loadingText || 'Loading...'}</div>
                    <div class="loading-subtext">${options.subText || 'Please wait...'}</div>
                </div>
            `;
            break;

        case 'biweekly-placeholder':
            // Update the step progress
            const stepProgress = document.querySelector('.step-progress');
            if (stepProgress) {
                stepProgress.innerHTML = '📅 Bi-Weekly Schedule Added: Configuring Details';
            }

            // Find the schedule cards container or create it if it doesn't exist
            let scheduleCardsContainer = document.querySelector('.schedule-cards');
            if (!scheduleCardsContainer) {
                scheduleCardsContainer = document.createElement('div');
                scheduleCardsContainer.className = 'schedule-cards';
                panelContent.appendChild(scheduleCardsContainer);
            }

            // Create the new bi-weekly card with placeholder values
            const biWeeklyCard = document.createElement('div');
            biWeeklyCard.className = 'schedule-card';
            biWeeklyCard.id = 'biweekly-card';
            biWeeklyCard.innerHTML = `
                <div class="card-header">
                    <div class="card-title">Bi-Weekly</div>
                </div>
                <div class="card-body">
                    <div class="schedule-detail">
                        <div class="detail-label">Name</div>
                        <div class="detail-value missing-field" id="biweekly-name">
                            Pending...
                        </div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">First pay date</div>
                        <div class="detail-value missing-field" id="biweekly-first-date">
                            Pending...
                        </div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">Frequency</div>
                        <div class="detail-value">26 pay periods/year</div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">Payroll Date</div>
                        <div class="detail-value">Every other Friday</div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">Hours per Pay Period</div>
                        <div class="detail-value">80 hours</div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">Weekend pay date</div>
                        <div class="detail-value">Friday before the date</div>
                    </div>
                    <div class="schedule-detail">
                        <div class="detail-label">Holiday pay date</div>
                        <div class="detail-value">Business before the date</div>
                    </div>
                </div>
            `;

            // Add the new card to the container
            scheduleCardsContainer.appendChild(biWeeklyCard);
            break;

        default:
            console.warn(`Unknown panel content type: ${type}`);
            break;
    }
}


// Helper function for smooth progress transitions with visual feedback
function smoothProgressTransition(fromWorkflow, toWorkflow, completedStep) {
    console.log(`Smooth transition: ${fromWorkflow} step ${completedStep} → ${toWorkflow}`);

    // Step 1: Complete current step with visual delay
    if (window.progressManager && fromWorkflow) {
        window.progressManager.updateProgress(completedStep);
    }

    // Step 2: Return promise that resolves after visual feedback time
    return new Promise((resolve) => {
        setTimeout(() => {
            // Step 3: Transition to new workflow
            if (window.progressManager && toWorkflow) {
                window.progressManager.enterWorkflow(toWorkflow, 0);
            }
            resolve();
        }, 1500); // 1.5 seconds for visual feedback
    });
}

function getEarningCodeIntroMessage(includeLegend = true) {
    let message = `<strong>Let's clean up your earning codes</strong>\n\n We found <strong>${earningCodes.length} earning codes</strong> in your payroll registers and suggested names and descriptions for each one—but we need your input to make sure everything's accurate.`;

    if (includeLegend) {
        message += `

<strong.Here's what to do:</strong> Review each code and either <strong>confirm, edit or remove</strong> what you don't need. Don't worry, you can refine things further in later steps.\n\n Have you reviewed everything and ready to continue?`;
    }

    return message;
}

function getStatusBadge(status) {
    switch (status) {
        case 'confident':
            return '<span class="assessment-badge confident">Exact match</span>';
        case 'review':
            return '<span class="assessment-badge review">Review</span>';
        default:
            return '<span class="assessment-badge missing">Missing</span>';
    }
}


function getRateConfigIntroMessage() {
    return `Great progress! We just need to configure a few payroll calculation settings:

Here's what we'll cover together:
 1. Rate multiplier
 2. Weighted Average Overtime
 3. Tax Treatment
 
We'll explain each one as we go, so you'll know exactly what you're setting up.

<strong>Ready to start? Type "yes" below or ask me anything.</strong>`;
}

function getWhy5StepsExplanation() {
    return `Great question! I broke rate configuration into 4 steps because:

<strong>🧠 Cognitive Load</strong>: Configuring ${earningCodes.length}+ earning codes with multiple settings is overwhelming as one big form

<strong>🔗 Dependencies</strong>: Each step builds on the previous:
- Step 1 (calculation method) affects Step 2 (overtime)
- Step 2 (overtime) affects Step 3 (tax treatment)
- Everything affects validation and accuracy

<strong>✅ Validation</strong>: We can validate each step before moving forward, catching errors early

<strong>📚 Education</strong>: Each step explains *why* these settings matter, not just *what* to configure

<strong>🎯 Focus</strong>: You can concentrate on one concept at a time rather than juggling multiple complex ideas

Think of it like setting up a complex machine - you don't adjust everything at once, you calibrate each system step by step.`;
}

// Placeholder for Step 1 - we'll build this next
// ADD THIS FUNCTION - Pay Calculation Configuration Step
function startPayCalculationConfiguration() {
    rateConfigurationState.currentSubStep = 1;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 6 of 7: Pay Calculation Method (1 of 5)';
    }

    // Update panel header
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) {
        panelHeader.textContent = 'Pay Calculation Method';
    }
    if (panelSubtitle) {
        panelSubtitle.innerHTML = 'Configure how each earning code calculates pay amounts';
    }

    // Categorize earning codes by calculation method
    const categories = categorizeCodesByCalculationMethod();

    // Show the pay calculation panel
    showPayCalculationPanel(categories);

    // Show chat message
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(' Here\'s how I\'ve organized your code\n\n• Rate multipliers\n• Fixed amounts \n• Formulas\n\nReview each category and drag any misplaced codes to the correct column.\n\n All done categorizing? Ready for the next step? ', 'ai', [
            { action: 'next-step-weighted-ot', text: 'Next step to weighted average overtime config', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-rate-multipliers', text: 'How do rate multipliers work?' }
            ]
        });
        }, 1000);
}

// ADD THIS FUNCTION - Continue from Pay Calculation Step
function continueToFinalRates() {
    // Check if all suggestions have been processed
    const allProcessed = aiSuggestions.every(s => s.status !== 'pending');

    if (!allProcessed) {
        addMessage('Please review all suggestions before continuing.', 'ai');
        return;
    }

    // Update progress: completed suggestions (step 1)
    if (window.progressManager) {
        window.progressManager.updateProgress(1);
    }

    setTimeout(() => {
        startRateConfigurationWorkflow();
    }, 1000);
}

function generatePayCalcTableView(categories) {
    return `
        ${generatePayCalcSection('0.5x Rate', categories.halfRate, 'half-rate')}
        ${generatePayCalcSection('1.0x Rate', categories.standardRate, 'standard-rate')}
        ${generatePayCalcSection('1.5x Rate', categories.timeAndHalf, 'time-and-half')}
        ${generatePayCalcSection('2.0x Rate', categories.doubleTime, 'double-time')}
        ${generatePayCalcSection('Fixed Amount', categories.fixedAmount, 'fixed-amount')}
        ${generatePayCalcSection('Formula Needed', categories.formulaNeeded, 'formula-needed')}
    `;
}

function generatePayCalcSection(title, category, sectionType) {
    if (category.count === 0) {
        return '';
    }

    // Generate action buttons for moving codes between categories
    let actionButtons = '';
    if (sectionType !== 'formula-needed') { // Don't allow moving formula codes
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedPayCalcCodes('${sectionType}', 'standard-rate')">Move to 1.0x Rate</button>
            <button class="bulk-btn" onclick="moveSelectedPayCalcCodes('${sectionType}', 'fixed-amount')">Move to Fixed Amount</button>
        `;
    }

    const tableRows = category.codes.map(code => {
        return `
            <tr class="${sectionType}-row">
                <td>
                    <input type="checkbox" class="pay-calc-checkbox" data-code="${code.code}" data-section="${sectionType}">
                </td>
                <td>
                    <div class="code-display">
                        <span class="code-value">${code.code}</span>
                    </div>
                </td>
                <td class="name-display">${code.name || 'Unnamed'}</td>
                <td class="formula-display">${getCategoryFormula(sectionType, category)}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="pay-calc-section">
            <div class="bulk-actions">
                <div class="bulk-actions-left">
                    <h3>${title} (${category.count} codes)</h3>
                </div>
                <div class="bulk-actions-right">
                    ${actionButtons}
                </div>
            </div>
            <div class="table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" class="select-all-checkbox" data-section="${sectionType}" onchange="toggleSelectAllInPayCalcSection('${sectionType}')">
                            </th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Formula</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function categorizeCodesByCalculationMethod() {
    const categories = {
        halfRate: {
            name: '0.5x Rate',
            description: 'Half the base rate (compensatory time earned)',
            codes: [],
            count: 0
        },
        standardRate: {
            name: '1.0x Rate', 
            description: 'Standard hourly rate × hours worked',
            codes: [],
            count: 0
        },
        timeAndHalf: {
            name: '1.5x Rate',
            description: 'Time and half (standard overtime)',
            codes: [],
            count: 0
        },
        doubleTime: {
            name: '2.0x Rate',
            description: 'Double time (premium overtime)',
            codes: [],
            count: 0
        },
        fixedAmount: {
            name: 'Fixed Amount',
            description: 'Predetermined dollar amounts',
            codes: [],
            count: 0
        },
        formulaNeeded: {
            name: 'Formula Needed',
            description: 'Requires custom calculation formula',
            codes: [],
            count: 0
        }
    };
    // Categorize each earning code
    // Categorize each earning code
    earningCodes.forEach(code => {
        // 0.5x Rate codes (compensatory time earned)
        if (['COMP'].includes(code.code)) {
            categories.halfRate.codes.push({
                ...code,
                multiplier: 0.5,
                displayText: `${code.code} (0.5x)`
            });
        }
        // 1.5x Rate codes (time and half overtime)
        else if (['OT1-ENG', 'OT1-CC', 'HOLWK'].includes(code.code)) {
            categories.timeAndHalf.codes.push({
                ...code,
                multiplier: 1.5,
                displayText: `${code.code} (1.5x)`
            });
        }
        // 2.0x Rate codes (double time)
        else if (['OT2-ENG', 'OT2-CC', 'DT'].includes(code.code)) {
            categories.doubleTime.codes.push({
                ...code,
                multiplier: 2.0,
                displayText: `${code.code} (2.0x)`
            });
        }
        // Fixed amount codes (bonuses, allowances)
        else if (['BON', 'BONUS', 'AWARD', 'CAR', 'RELO', 'LON', 'RETRO', 'ADJ', 'SHFT', 'LEAD', 'HAZ', 'STDBY', 'CALLB', 'TRVL'].includes(code.code)) {
            categories.fixedAmount.codes.push(code);
        }
        // Formula needed codes (commission, complex calculations)
        else if (['COMM'].includes(code.code)) {
            categories.formulaNeeded.codes.push(code);
        }
        // Default to 1.0x Rate (standard hourly)
        else {
            categories.standardRate.codes.push({
                ...code,
                multiplier: 1.0,
                displayText: `${code.code} (1.0x)`
            });
        }
    });

    // Update counts
    Object.keys(categories).forEach(key => {
        categories[key].count = categories[key].codes.length;
    });

    return categories;
}

function getOvertimeMultiplier(codeType) {
    const multipliers = {
        'COMP': 0.5,
        'REG': 1.0,
        'VAC': 1.0,
        'SICK': 1.0,
        'HOL': 1.0,
        'BRVMT': 1.0,
        'JURY': 1.0,
        'FMLA': 1.0,
        'MIL': 1.0,
        'PERSL': 1.0,
        'COMPT': 1.0,
        'LWC': 1.0,
        'OT1-ENG': 1.5,
        'OT1-CC': 1.5,
        'HOLWK': 1.5,
        'OT2-ENG': 2.0,
        'OT2-CC': 2.0,
        'DT': 2.0
    };
    return multipliers[codeType] || 1.0;
}

function generatePayCalcDragView(categories) {
    return `
        <div class="weighted-ot-drag-container">
            <!-- Titles Row -->
            <div class="titles-row">
                <div class="column-title">
                    0.5x Rate <span class="count-badge">${categories.halfRate.count}</span>
                </div>
                <div class="column-title">
                    1.0x Rate <span class="count-badge">${categories.standardRate.count}</span>
                </div>
                <div class="column-title">
                    1.5x Rate <span class="count-badge">${categories.timeAndHalf.count}</span>
                </div>
                <div class="column-title">
                    2.0x Rate <span class="count-badge">${categories.doubleTime.count}</span>
                </div>
                <div class="column-title">
                    Fixed Amount <span class="count-badge">${categories.fixedAmount.count}</span>
                </div>
                <div class="column-title">
                    Formula Needed <span class="count-badge">${categories.formulaNeeded.count}</span>
                </div>
            </div>

            <!-- Columns Row -->
            <div class="columns-row">
                <div class="drag-column" id="paycalc-half-column">
                    <div class="drag-zone" data-category="half-rate">
                        ${generatePayCalcDraggableCards(categories.halfRate.codes)}
                    </div>
                </div>

                <div class="drag-column" id="paycalc-standard-column">
                    <div class="drag-zone" data-category="standard-rate">
                        ${generatePayCalcDraggableCards(categories.standardRate.codes)}
                    </div>
                </div>

                <div class="drag-column" id="paycalc-timehalf-column">
                    <div class="drag-zone" data-category="time-and-half">
                        ${generatePayCalcDraggableCards(categories.timeAndHalf.codes)}
                    </div>
                </div>

                <div class="drag-column" id="paycalc-double-column">
                    <div class="drag-zone" data-category="double-time">
                        ${generatePayCalcDraggableCards(categories.doubleTime.codes)}
                    </div>
                </div>

                <div class="drag-column" id="paycalc-fixed-column">
                    <div class="drag-zone" data-category="fixed-amount">
                        ${generatePayCalcDraggableCards(categories.fixedAmount.codes)}
                    </div>
                </div>

                <div class="drag-column" id="paycalc-formula-column">
                    <div class="drag-zone" data-category="formula-needed">
                        ${generatePayCalcDraggableCards(categories.formulaNeeded.codes)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generatePayCalcDraggableCards(codes) {
    return codes.map(code => `
        <div class="draggable-card" draggable="true" data-code="${code.code}">
            <div class="card-header">
                <span class="drag-handle" draggable="false">⋮⋮</span>
                <div class="code-info" draggable="false">
                    <span class="code-name" draggable="false">${code.name || 'Unnamed'}</span>
                    <span class="code-badge" draggable="false">${code.code}</span>
                   
                </div>
                
            </div>
            <div class="card-body" draggable="false">
                <div class="code-description hidden" id="desc-${code.code}" draggable="false">
                    ${code.description || 'No description available'}
                </div>
            </div>
        </div>
    `).join('');
}

function switchToPayCalcTableView() {
    // Update button states
    const tableBtn = document.getElementById('payCalcTableViewBtn');
    const dragBtn = document.getElementById('payCalcDragViewBtn');

    if (tableBtn && dragBtn) {
        tableBtn.classList.add('active');
        tableBtn.style.background = '#007bff';
        tableBtn.style.color = 'white';

        dragBtn.classList.remove('active');
        dragBtn.style.background = 'transparent';
        dragBtn.style.color = 'inherit';
    }

    // Switch views
    document.getElementById('payCalcTableView').classList.add('active');
    document.getElementById('payCalcTableView').classList.remove('hidden');
    document.getElementById('payCalcDragView').classList.remove('active');
    document.getElementById('payCalcDragView').classList.add('hidden');

    // Clean up drag and drop listeners
    cleanupPayCalcDragAndDrop();
}

function switchToPayCalcDragView() {
    // Update button states
    const tableBtn = document.getElementById('payCalcTableViewBtn');
    const dragBtn = document.getElementById('payCalcDragViewBtn');

    if (tableBtn && dragBtn) {
        dragBtn.classList.add('active');
        dragBtn.style.background = '#007bff';
        dragBtn.style.color = 'white';

        tableBtn.classList.remove('active');
        tableBtn.style.background = 'transparent';
        tableBtn.style.color = 'inherit';
    }

    // Switch views
    document.getElementById('payCalcDragView').classList.add('active');
    document.getElementById('payCalcDragView').classList.remove('hidden');
    document.getElementById('payCalcTableView').classList.remove('active');
    document.getElementById('payCalcTableView').classList.add('hidden');

    // Initialize drag and drop
 setTimeout(() => {
        dragManager.initialize('pay-calc');
    }, 100);
}

function toggleSelectAllInPayCalcSection(sectionType) {
    const selectAllCheckbox = document.querySelector(`input[data-section="${sectionType}"].select-all-checkbox`);
    const sectionCheckboxes = document.querySelectorAll(`input[data-section="${sectionType}"].pay-calc-checkbox`);

    sectionCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function moveSelectedPayCalcCodes(fromSection, toSection) {
    const selectedCheckboxes = document.querySelectorAll(`input[data-section="${fromSection}"].pay-calc-checkbox:checked`);
    const selectedCodes = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-code'));

    if (selectedCodes.length === 0) {
        addMessage('Please select at least one code to move.', 'ai');
        return;
    }

    // Update the classification data and refresh panel
    if (window.currentPayCalcCategories) {
        // Move codes between categories
        selectedCodes.forEach(codeId => {
            // Find and move the code
            Object.keys(window.currentPayCalcCategories).forEach(categoryKey => {
                const category = window.currentPayCalcCategories[categoryKey];
                const codeIndex = category.codes.findIndex(code => code.code === codeId);

                if (codeIndex !== -1) {
                    const codeToMove = category.codes.splice(codeIndex, 1)[0];
                    category.count--;

                    // Add to destination category
                    const destCategory = Object.keys(window.currentPayCalcCategories).find(key => 
                        key.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1) === toSection
                    );

                    if (destCategory) {
                        window.currentPayCalcCategories[destCategory].codes.push(codeToMove);
                        window.currentPayCalcCategories[destCategory].count++;
                    }
                }
            });
        });

        // Refresh the panel
        showPayCalculationPanel(window.currentPayCalcCategories);

        // Show confirmation message
        addMessage(`✅ Moved ${selectedCodes.length} code${selectedCodes.length > 1 ? 's' : ''} to ${toSection} category.`, 'ai');
    }
}



// Drag event handlers (similar to weighted OT but prefixed)


function updatePayCalcCountBadges() {
    const sections = ['half-rate', 'standard-rate', 'time-and-half', 'double-time', 'fixed-amount', 'formula-needed'];

    sections.forEach(section => {
        const column = document.querySelector(`#paycalc-${section.replace('-', '')}-column`);
        if (column) {
            const count = column.querySelectorAll('.draggable-card').length;
            const badge = column.querySelector('.count-badge');
            if (badge) badge.textContent = count;
        }
    });
}

function updatePayCalcClassification(codeId, newCategory) {
    if (!window.payCalcClassificationChanges) {
        window.payCalcClassificationChanges = {};
    }
    window.payCalcClassificationChanges[codeId] = newCategory;
    console.log(`Moved ${codeId} to ${newCategory} category`);
}


function getCategoryFormula(key) {
    switch(key) {
        case 'half-rate':
        case 'halfRate': return 'Base Rate × 0.5 × Hours';
        case 'standard-rate':
        case 'standardRate': return 'Base Rate × 1.0 × Hours';
        case 'time-and-half':
        case 'timeAndHalf': return 'Base Rate × 1.5 × Hours';
        case 'double-time':
        case 'doubleTime': return 'Base Rate × 2.0 × Hours';
        case 'fixed-amount':
        case 'fixedAmount': return 'Predetermined Dollar Amount';
        case 'formula-needed':
        case 'formulaNeeded': return 'Custom Formula Required';
        default: return 'Custom calculation method';
    }
}

// Placeholder functions for the buttons
function acceptCalculationMethod(categoryKey) {
    console.log('Accepted calculation method for:', categoryKey);
}

function modifyCalculationMethod(categoryKey) {
    console.log('Modify calculation method for:', categoryKey);
}

function showPayCalculationPanel(categories) {
    const panelContent = document.querySelector('.panel-content');

    // Update panel header with toggle buttons
    const panelHeader = document.querySelector('.panel-header h2');
    if (panelHeader) {
        panelHeader.innerHTML = `
            Rate mulitplier
            <div class="view-toggle" style="display: inline-flex; margin-left: 20px; background: #f8f9fa; border-radius: 8px; padding: 4px; gap: 4px;">
                <button class="toggle-btn" id="payCalcTableViewBtn" onclick="switchToPayCalcTableView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                    <span class="material-icons" style="font-size: 16px;">table_chart</span>
                </button>
                <button class="toggle-btn active" id="payCalcDragViewBtn" onclick="switchToPayCalcDragView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; background: #007bff; color: white;">
                    <span class="material-icons" style="font-size: 16px;">drag_indicator</span>
                </button>
            </div>
        `;
    }

    // Create dual view container - DEFAULT TO DRAG VIEW
    panelContent.innerHTML = `
        <div class="pay-calc-container">
            <div id="payCalcTableView" class="view-container hidden">
                ${generatePayCalcTableView(categories)}
            </div>

            <div id="payCalcDragView" class="view-container active">
                ${generatePayCalcDragView(categories)}
            </div>
        </div>
    `;

    // Store categories data globally for view switching
    window.currentPayCalcCategories = categories;

    // Initialize drag and drop since we're starting with drag view
    setTimeout(() => {
        initializeDragAndDrop();
        updateDragColumnCounts('paycalc');
    }, 100);
}



// Placeholder functions for the buttons
function acceptCalculationMethod(categoryKey) {
    console.log('Accepted calculation method for:', categoryKey);
    addMessage(`✅ Approved ${categoryKey} calculation method`, 'ai');
}

function modifyCalculationMethod(categoryKey) {
    console.log('Modify calculation method for:', categoryKey);
    addMessage(`Let me know what you'd like to change about the ${categoryKey} calculation method.`, 'ai');
}

function classifyEarningCodesSimple() {
    const autoIncluded = [];
    const autoExcluded = [];
    const needsInput = [];

    earningCodes.forEach(code => {
        const codeUpper = code.code.toUpperCase();
        const nameUpper = (code.name || '').toUpperCase();
        const descUpper = (code.description || '').toUpperCase();

        // Auto-include: Regular wages, shift differentials, non-discretionary bonuses
        if (codeUpper.includes('REG') || nameUpper.includes('REGULAR') ||
            codeUpper.includes('SHIFT') || nameUpper.includes('SHIFT') ||
            nameUpper.includes('DIFFERENTIAL') || nameUpper.includes('NIGHT') ||
            nameUpper.includes('WEEKEND') || codeUpper.includes('COMM') ||
            nameUpper.includes('COMMISSION') || codeUpper.includes('PROD') ||
            nameUpper.includes('PRODUCTION') || nameUpper.includes('PERFORMANCE') ||
            (nameUpper.includes('BONUS') && !nameUpper.includes('DISCRETIONARY')) ||
            nameUpper.includes('ATTENDANCE') || nameUpper.includes('SAFETY') ||
            codeUpper.includes('HAZ') || nameUpper.includes('HAZARD')) {
            autoIncluded.push({
                ...code,
                reason: 'Compensation for hours worked - included in FLSA weighted average'
            });
        }
        // Auto-exclude: PTO, overtime premiums, reimbursements, benefits
        else if (codeUpper.includes('VAC') || codeUpper.includes('SICK') || 
                 codeUpper.includes('HOL') || codeUpper.includes('OT') || 
                 codeUpper.includes('FMLA') || codeUpper.includes('PTO') ||
                 nameUpper.includes('VACATION') || nameUpper.includes('SICK') ||
                 nameUpper.includes('HOLIDAY') || nameUpper.includes('OVERTIME') ||
                 nameUpper.includes('TIME OFF') || nameUpper.includes('LEAVE') ||
                 nameUpper.includes('REIMBURS') || nameUpper.includes('EXPENSE') ||
                 nameUpper.includes('ALLOWANCE') || nameUpper.includes('PER DIEM') ||
                 nameUpper.includes('INSURANCE') || nameUpper.includes('401K') ||
                 nameUpper.includes('RETIREMENT') || nameUpper.includes('PENSION') ||
                 nameUpper.includes('DISCRETIONARY') || nameUpper.includes('GIFT') ||
                 nameUpper.includes('AWARD') || nameUpper.includes('REFERRAL') ||
                 codeUpper.includes('MEAL') || codeUpper.includes('TRAVEL')) {
            autoExcluded.push({
                ...code,
                reason: 'PTO, premiums, or reimbursements - excluded from FLSA calculations'
            });
        }
        // Move all remaining codes to appropriate categories based on FLSA rules
        else {
            // Additional classification based on common patterns
            if (nameUpper.includes('PAY') || nameUpper.includes('WAGE') ||
                nameUpper.includes('SALARY') || nameUpper.includes('RATE')) {
                autoIncluded.push({
                    ...code,
                    reason: 'Appears to be regular compensation - included in FLSA'
                });
            } else {
                autoExcluded.push({
                    ...code,
                    reason: 'No clear compensation indicators - excluded by default'
                });
            }
        }
    });

    // Return with empty needsInput array since we've classified everything
    return { autoIncluded, autoExcluded, needsInput: [] };
}

function showSimplifiedWeightedOTPanel(classification) {
    const panelContent = document.querySelector('.panel-content');

    // Update panel header with toggle buttons - DEFAULT TO DRAG VIEW
    const panelHeader = document.querySelector('.panel-header h2');
    if (panelHeader) {
        panelHeader.innerHTML = `
            Weighted Average Overtime Configuration
            <div class="view-toggle" style="display: inline-flex; margin-left: 20px; background: #f8f9fa; border-radius: 8px; padding: 4px; gap: 4px;">
                <button class="toggle-btn" id="tableViewBtn" onclick="switchToTableView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                    <span class="material-icons" style="font-size: 16px;">table_chart</span>
                </button>
                <button class="toggle-btn active" id="dragViewBtn" onclick="switchToDragView()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; background: #007bff; color: white;">
                    <span class="material-icons" style="font-size: 16px;">drag_indicator</span>
                </button>
            </div>
        `;
    }

    // Create panel content - DEFAULT TO DRAG VIEW
    panelContent.innerHTML = `
        <div class="weighted-ot-container">
            <div id="tableView" class="view-container hidden">
                ${generateTableView(classification)}
            </div>
            <div id="dragView" class="view-container active">
                ${generateDragView(classification)}
            </div>
        </div>
    `;

    // Store classification data globally for view switching
    window.currentOTClassification = classification;

    // Initialize drag and drop since we're starting with drag view
    setTimeout(() => {
        initializeDragAndDrop();
        updateDragColumnCounts();
    }, 100);
}

function generateTableView(classification) {
    return `
        ${generateWeightedOTSection('Review Required', classification.needsInput, 'needs-review')}
        ${generateWeightedOTSection('Included codes', classification.autoIncluded, 'auto-included')}
        ${generateWeightedOTSection('Excluded codes', classification.autoExcluded, 'atuo-excluded')}
    `;
}

function generateDragView(classification) {
    return `
        <div class="weighted-ot-drag-container">
            <!-- Titles Row -->
            <div class="titles-row">
                <div class="column-title">
                    Include in calculation <span class="count-badge">${classification.autoIncluded.length}</span>
                </div>
                <div class="column-title">
                    Exclude from calculation <span class="count-badge">${classification.autoExcluded.length}</span>
                </div>
                <div class="column-title">
                    Not applicable <span class="count-badge">${classification.needsInput.length}</span>
                </div>
            </div>

            <!-- Columns Row -->
            <div class="columns-row">
                <!-- Include Column - CARD STYLE -->
                <div class="drag-column" id="include-column">
                    <div class="drag-zone" data-category="include">
                        ${generateDraggableCards(classification.autoIncluded)}
                    </div>
                </div>

                <!-- Exclude Column - CARD STYLE -->
                <div class="drag-column" id="exclude-column">
                    <div class="drag-zone" data-category="exclude">
                        ${generateDraggableCards(classification.autoExcluded)}
                    </div>
                </div>

                <!-- Not Applicable Column - LIST STYLE -->
                <div class="drag-column" id="uncategorized-column">
                    <div class="drag-zone" data-category="uncategorized">
                        ${generateDraggableListCards(classification.needsInput)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateDraggableListCards(codes) {
    return codes.map(code => `
        <div class="draggable-list-item" draggable="true" data-code="${code.code}">
            <span class="drag-handle">⋮⋮</span>
            <div class="list-item-content">
                <strong>${code.code}</strong> ${code.name || 'Unnamed'}
            </div>
        </div>
    `).join('');
}

function generateDraggableCards(codes) {
    return codes.map(code => `
        <div class="draggable-card" draggable="true" data-code="${code.code}">
            <div class="card-header">
                <span class="drag-handle" draggable="false">⋮⋮</span>
                <div class="code-info" draggable="false">
                      <span class="code-name" draggable="false">${code.name || 'Unnamed'}</span>
                      <span class="code-badge" draggable="false">${code.code}</span>
                  
                </div>
            </div>
            <div class="card-body" draggable="false">
                <div class="code-description hidden" id="desc-${code.code}" draggable="false">
                    ${code.description || 'No description available'}
                </div>
            </div>
        </div>
    `).join('');
}


function switchToTableView() {
    // Update button states
    const tableBtn = document.getElementById('tableViewBtn');
    const dragBtn = document.getElementById('dragViewBtn');

    if (tableBtn && dragBtn) {
        tableBtn.classList.add('active');
        tableBtn.style.background = '#007bff';
        tableBtn.style.color = 'white';

        dragBtn.classList.remove('active');
        dragBtn.style.background = 'transparent';
        dragBtn.style.color = 'inherit';
    }

    // Switch views
    document.getElementById('tableView').classList.add('active');
    document.getElementById('tableView').classList.remove('hidden');
    document.getElementById('dragView').classList.remove('active');
    document.getElementById('dragView').classList.add('hidden');

    // Clean up drag and drop listeners
      dragManager.cleanup();

    console.log('Switched to table view');
}

function switchToDragView() {
    // Update button states
    const tableBtn = document.getElementById('tableViewBtn');
    const dragBtn = document.getElementById('dragViewBtn');

    if (tableBtn && dragBtn) {
        dragBtn.classList.add('active');
        dragBtn.style.background = '#007bff';
        dragBtn.style.color = 'white';

        tableBtn.classList.remove('active');
        tableBtn.style.background = 'transparent';
        tableBtn.style.color = 'inherit';
    }

    // Switch views
    document.getElementById('dragView').classList.add('active');
    document.getElementById('dragView').classList.remove('hidden');
    document.getElementById('tableView').classList.remove('active');
    document.getElementById('tableView').classList.add('hidden');

    // Use new unified drag system
    setTimeout(() => {
        dragManager.initialize('weighted-ot');
    }, 100);

    console.log('Switched to weighted OT drag view');
}


// Global variable for drag and drop

// ────────────────────────────────────────────────────────────────
// Helper to ask each eligibility question
// ────────────────────────────────────────────────────────────────
function askOTEligibilityQuestion(index = 0) {
  const q = OT_ELIGIBILITY_QUESTIONS[index];
  if (!q) return evaluateOTEligibility();      // All 5 answered

  addMessage(
    q.prompt,
    'ai',
    [
      { action: `ot-${q.id}-yes`, text: 'Yes', buttonType: 'primary' },
      { action: `ot-${q.id}-no`,  text: 'No', buttonType: 'secondary' }
    ],
    {
      style: 'two-tier-interactive',
      tierTwoOptions: [
        { action: `ot-${q.id}-why`, text: 'What is weighted average overtime?' },
        { action: `ot-${q.id}-ex`,  text: 'Give me an example' }
      ]
    }
  );

  // (Optional) tweak any progress-bar code here
}

// ────────────────────────────────────────────────────────────────
// Decide whether to branch into WAOT
// ────────────────────────────────────────────────────────────────
function evaluateOTEligibility() {
  const needsWAOT = Object.values(waotEligibility).some(v => v === true);
  if (needsWAOT) {
    jumpToWeightedOvertimeConfig();            // already exists
  } else {
    addMessage(
      'Great! None of those scenarios apply, so we’ll use standard overtime calculations.',
      'ai',
      [{ action: 'continue-to-base-comp', text: 'Continue to Base Compensation' }]
    );
  }
}


function updateOTInclusion(codeId, isIncluded) {
    console.log(`${codeId} OT inclusion: ${isIncluded}`);
    // Store this setting for later use
}

function generateWeightedOTSection(title, codes, sectionType) {
    if (codes.length === 0) {
        return '';
    }

    // Generate action buttons based on section type using existing bulk-btn styling
    let actionButtons = '';
    if (sectionType === 'needs-review') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedCodes('needs-review', 'include')">Move to Include</button>
            <button class="bulk-btn" onclick="moveSelectedCodes('needs-review', 'exclude')">Move to Exclude</button>
        `;
    } else if (sectionType === 'auto-included') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedCodes('auto-included', 'exclude')">Move to Exclude</button>
        `;
    } else if (sectionType === 'auto-excluded') {
        actionButtons = `
            <button class="bulk-btn" onclick="moveSelectedCodes('auto-excluded', 'include')">Move to Include</button>
        `;
    }

    const tableRows = codes.map(code => {
        return `
            <tr class="${sectionType}-row">
                <td>
                    <input type="checkbox" class="weighted-ot-checkbox" data-code="${code.code}" data-section="${sectionType}">
                </td>
                <td>
                    <div class="code-display">
                        <span class="code-value">${code.code}</span>
                    </div>
                </td>
                <td class="name-display">${code.name || 'Unnamed'}</td>
                <td class="reason-text weighted-ot-reason-column" style="display: none;">${code.reason}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="weighted-ot-section">
            <div class="bulk-actions">
                <div class="bulk-actions-left">
                    <h3>${title} (${codes.length} codes)</h3>
                </div>
                <div class="bulk-actions-right">
                    ${actionButtons}
                </div>
            </div>
            <div class="table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" class="select-all-checkbox" data-section="${sectionType}" onchange="toggleSelectAllInSection('${sectionType}')">
                            </th>
                            <th>Code</th>
                            <th>Name</th>
                            <th class="weighted-ot-reason-column" style="display: none;">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Function to toggle select all checkboxes in a section
function toggleSelectAllInSection(sectionType) {
    const selectAllCheckbox = document.querySelector(`input[data-section="${sectionType}"].select-all-checkbox`);
    const sectionCheckboxes = document.querySelectorAll(`input[data-section="${sectionType}"].weighted-ot-checkbox`);

    sectionCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Function to move selected codes between sections
function moveSelectedCodes(fromSection, toSection) {
    const selectedCheckboxes = document.querySelectorAll(`input[data-section="${fromSection}"].weighted-ot-checkbox:checked`);
    const selectedCodes = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-code'));

    if (selectedCodes.length === 0) {
        addMessage('Please select at least one code to move.', 'ai');
        return;
    }

    // Update the classification data
    if (window.currentOTClassification) {
        selectedCodes.forEach(codeId => {
            // Find the code in the current section
            let codeToMove = null;
            let sourceArray = null;

            if (fromSection === 'needs-review') {
                sourceArray = window.currentOTClassification.needsInput;
            } else if (fromSection === 'auto-included') {
                sourceArray = window.currentOTClassification.autoIncluded;
            } else if (fromSection === 'auto-excluded') {
                sourceArray = window.currentOTClassification.autoExcluded;
            }

            // Find and remove the code from source array
            const codeIndex = sourceArray.findIndex(code => code.code === codeId);
            if (codeIndex !== -1) {
                codeToMove = sourceArray.splice(codeIndex, 1)[0];

                // Add to destination array
                if (toSection === 'include') {
                    window.currentOTClassification.autoIncluded.push(codeToMove);
                } else if (toSection === 'exclude') {
                    window.currentOTClassification.autoExcluded.push(codeToMove);
                }
            }
        });

        // Refresh the panel to show updated classification
        showSimplifiedWeightedOTPanel(window.currentOTClassification);

        // Show confirmation message
        const actionText = toSection === 'include' ? 'included in' : 'excluded from';
        addMessage(`✅ Moved ${selectedCodes.length} code${selectedCodes.length > 1 ? 's' : ''} to be ${actionText} weighted average overtime calculations.`, 'ai');
    }
}

// Function to get selected codes from a section
function getSelectedCodesFromSection(sectionType) {
    const selectedCheckboxes = document.querySelectorAll(`input[data-section="${sectionType}"].weighted-ot-checkbox:checked`);
    return Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-code'));
}

// Function to update code classification tracking
function updateWeightedOTClassification(codeId, newClassification) {
    if (!window.weightedOTChanges) {
        window.weightedOTChanges = {};
    }
    window.weightedOTChanges[codeId] = newClassification;
    console.log(`Updated weighted OT classification for ${codeId}: ${newClassification}`);
}

function jumpToWeightedOvertimeConfig() {
    console.log('Jumping directly to Weighted Average OT Config page...');

    // Hide wizard if active
    const wizardContainer = document.getElementById('wizardContainer');
    if (wizardContainer) {
        wizardContainer.remove();
    }

    // Show main panels
    const chatPanel = document.getElementById('chatPanel');
    const tablePanel = document.getElementById('tablePanel');
    if (chatPanel && tablePanel) {
        chatPanel.style.display = 'flex';
        tablePanel.style.display = 'flex';
        chatPanel.classList.remove('centered');
    }

    // Set up shared company data if needed
    if (!extractedCompanyInfo.legalName) {
        extractedCompanyInfo = { ...SHARED_COMPANY_DATA.default };
    }

    // Clear chat messages
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }

    // Progress directly to weighted average overtime configuration
    if (window.progressManager) {
        window.progressManager.enterWorkflow('rate-configuration', 1); // Step 2 of rate config
    }

    // Update current step
    currentStep = 6;

    // Update header status
    const headerStatus = document.getElementById('headerStatus');
    if (headerStatus) {
        headerStatus.textContent = 'Step 6 of 7: Weighted Average Overtime (2 of 5)';
    }

    // Skip the question and go directly to the weighted OT configuration
    setTimeout(() => {
        // Update panel header for weighted overtime classification
        const panelHeader = document.querySelector('.panel-header h2');
        const panelSubtitle = document.querySelector('.panel-subtitle');
        if (panelHeader) {
            panelHeader.textContent = 'Weighted Average Overtime Configuration';
        }
        if (panelSubtitle) {
            panelSubtitle.innerHTML = 'Configure which earning codes are included in OT calculations';
        }

        // Generate classification and show panel
        const classification = classifyEarningCodesSimple();
        showSimplifiedWeightedOTPanel(classification);

        // Show the summary message (as if user clicked "Yes")
        const includedCount = classification.autoIncluded.length;
        const excludedCount = classification.autoExcluded.length;
        const needsInput = classification.needsInput.length;

        addMessage(`
            Okay, now let's review earning codes for weighted average overtime calculations. \n
I've categorized your codes to include or exclude in overtime calculation\n  <strong>•  Included</strong>: ${includedCount} 
            <strong>• Excluded </strong>:${excludedCount} <strong>• Uncategorized</strong>:${needsInput}

            -Review each uncategorized code and assign it to the right category.
            - Double check the codes we automatically categorized to make sure they're correc

            Have you finished categorizing each code and you're ready to continue?`, 'ai', [
                                { action: 'confirm-weighted-ot-simple', text: 'Continue to tax treatment' },
                                { action: 'explain-weighted-ot-classification', text: 'Explain the classification'},
        ]);
    }, 500);
}


function showFinalSummary() {
  const rightPanel = document.getElementById('right-panel');

  if (rightPanel) {
    rightPanel.innerHTML = `
      <div class="final-summary">
        <h2>🎉 Configuration Complete!</h2>
        <p>Your payroll setup is complete. You can now download your configuration or preview the W-2 form.</p>
        <button onclick="downloadConfiguration()">⬇️ Download Configuration</button>
        <button onclick="renderW2Form()">📄 View W-2 Form</button>
        <button onclick="showFinalConfirmation()">✅ Final Step</button>
      </div>
    `;
  }
}

// Add this at the end of your script.js file temporarily
document.querySelectorAll('.drag-zone').forEach(zone => {
    console.log('Found drag zone:', zone);

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        console.log('DRAGOVER WORKING!'); // You should see this when dragging over
        zone.style.backgroundColor = '#e3f2fd'; // Visual feedback
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('DROP WORKING!'); // You should see this when dropping
        zone.style.backgroundColor = ''; // Reset color
    });
});

function consolidateMovesIntoCarousel() {
    // Show carousel from the 1st move onwards
    if (dragSessionMoves.length < 1) return;

    // Check if we already have a carousel message
    const existingCarousel = document.querySelector('.drag-carousel-message');

    if (existingCarousel) {
        // Update existing carousel
        updateExistingCarousel(existingCarousel);
    } else {
        // Create first carousel
        createNewCarousel();
    }

    console.log('Updated carousel with', dragSessionMoves.length, 'moves');
}

function updateExistingCarousel(carouselElement) {
    // Find the carousel content area
    const carouselTrack = carouselElement.querySelector('.carousel-track');
    const carouselHeader = carouselElement.querySelector('.carousel-header span:last-child');

    if (carouselTrack && carouselHeader) {
        // Update header count
        carouselHeader.textContent = `Drag & Drop Summary (${dragSessionMoves.length} moves)`;

        // Update carousel items
        carouselTrack.innerHTML = dragSessionMoves.slice().reverse().map(move => `
            <div class="carousel-item">
                <div class="move-text">Moved "${move.codeId}"</div>
                <div>from ${move.fromCategory} to ${move.toCategory}</div>
            </div>
        `).join('');

        // ADD PILLS ONLY AFTER FIRST DRAG: Check if this is an update (user has dragged items)
        if (dragSessionMoves.length > 0) {
            const messageElement = carouselElement; // This is the entire message div
            let pillsContainer = messageElement.querySelector('.suggested-pills');

            if (!pillsContainer) {
                // Add pills OUTSIDE the carousel, after the message-content
                const messageContent = messageElement.querySelector('.message-content');
                if (messageContent) {
                    const pillsHtml = `
                        <div class="suggested-pills">
                            <button class="pill-btn" onclick="handlePillClick('Next step to weighted average overtime config')">Codes are categorized and ready to continue</button>
                        </div>
                    `;
                    messageContent.insertAdjacentHTML('afterend', pillsHtml);
                }
            }
        }

        // RE-INITIALIZE CAROUSEL AFTER UPDATING CONTENT
        const carouselId = carouselTrack.id.replace('carousel-track-', '');
        setTimeout(() => {
            initializeCarousel(carouselId);
        }, 100);
    }
}

function createNewCarousel() {
    const carouselId = `drag-carousel-${++dragSessionId}`;

    const carouselContent = {
        type: 'drag-summary-carousel',
        id: carouselId,
        moves: [...dragSessionMoves].reverse()
    };
    console.log('DEBUG: Creating carousel with content:', carouselContent);

    // Create carousel WITHOUT pills initially - pills appear only after first drag
    if (typeof addMessage === 'function') {
        // Check if user has already dragged items (first drag creates carousel)
        if (dragSessionMoves.length > 0) {
            // User has dragged - include pills
            const carouselMessage = addMessage(carouselContent, 'ai', [
                { action: 'Next step to weighted average overtime config', text: 'Codes are categorized and ready to continue' }
            ]);
            carouselMessage.classList.add('drag-carousel-message');
        } else {
            // First creation - no pills yet
            const carouselMessage = addMessage(carouselContent, 'ai');
            carouselMessage.classList.add('drag-carousel-message');
        }

        // INITIALIZE CAROUSEL AFTER CREATION
        setTimeout(() => {
            initializeCarousel(carouselId);
        }, 100);
    }
}




// ADD THIS CAROUSEL NAVIGATION JAVASCRIPT TO YOUR SCRIPT.JS FILE

// Carousel navigation state
let carouselStates = new Map(); // Track each carousel's state

function initializeCarousel(carouselId) {
    const track = document.getElementById(`carousel-track-${carouselId}`);
    if (!track) return;

    const container = track.closest('.carousel-container');
    const items = track.querySelectorAll('.carousel-item');

    if (items.length === 0) return;

    // Calculate how many items fit in view
    const containerWidth = container.offsetWidth - 16; // Account for padding
    const itemWidth = 150 + 12; // Fixed width + gap
    const itemsPerView = Math.floor(containerWidth / itemWidth);
    const totalItems = items.length;

    // Initialize carousel state
    carouselStates.set(carouselId, {
        currentIndex: 0,
        itemsPerView: itemsPerView,
        totalItems: totalItems,
        maxIndex: Math.max(0, totalItems - itemsPerView)
    });

    // Create navigation if needed
    if (totalItems > itemsPerView) {
        createCarouselNavigation(carouselId);
    }

    // Update navigation buttons
    updateCarouselNavigation(carouselId);
}

function createCarouselNavigation(carouselId) {
    const carousel = document.querySelector(`#carousel-track-${carouselId}`).closest('.drag-summary-carousel');

    // Check if navigation already exists
    if (carousel.querySelector('.carousel-nav')) return;

    const navHTML = `
        <div class="carousel-nav">
            <button class="carousel-nav-btn" onclick="moveCarousel('${carouselId}', -1)">‹</button>
            <button class="carousel-nav-btn" onclick="moveCarousel('${carouselId}', 1)">›</button>
        </div>
    `;

    carousel.insertAdjacentHTML('beforeend', navHTML);
}

function moveCarousel(carouselId, direction) {
    const state = carouselStates.get(carouselId);
    if (!state) return;

    const track = document.getElementById(`carousel-track-${carouselId}`);
    if (!track) return;

    // Calculate new index
    const newIndex = Math.max(0, Math.min(state.maxIndex, state.currentIndex + direction));

    // Update state
    state.currentIndex = newIndex;
    carouselStates.set(carouselId, state);

    // Apply transform
    const itemWidth = 150 + 12; // Fixed width + gap
    const translateX = -newIndex * itemWidth;
    track.style.transform = `translateX(${translateX}px)`;

    // Update navigation buttons
    updateCarouselNavigation(carouselId);
}

function updateCarouselNavigation(carouselId) {
    const state = carouselStates.get(carouselId);
    if (!state) return;

    const carousel = document.querySelector(`#carousel-track-${carouselId}`).closest('.drag-summary-carousel');
    const prevBtn = carousel.querySelector('.carousel-nav-btn:first-child');
    const nextBtn = carousel.querySelector('.carousel-nav-btn:last-child');

    if (prevBtn && nextBtn) {
        // Update button states
        prevBtn.disabled = state.currentIndex === 0;
        nextBtn.disabled = state.currentIndex >= state.maxIndex;
    }
}

// Interactive Prompt Function - 2-Tier Button System for User Engagement
function displayInteractivePrompt() {
    addMessage('Let\'s clean up your earning codes.\n\nWe found 34 earning codes in your payroll registers and suggested names and descriptions for each one—but we need your input to make sure everything\'s accurate.\n\nReview each code and either confirm, edit or remove what you don\'t need. Don\'t worry, you can refine things further in later steps.\n\nHave you reviewed everything and ready to continue?', 'ai', [
        { action: 'earning-codes-confirmed-continue', text: 'Yes & continue', buttonType: 'primary' },
        { action: 'create-new-earning-code', text: 'Create new code', buttonType: 'secondary' }
    ], { 
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'explain-assessment-meanings', text: 'Explain what each assessment means' },
            { action: 'how-suggestions-generated', text: 'How do you determine these code suggestions?' },
            { action: 'consolidate-similar-codes', text: 'How can I merge or combine similar codes?' }
        ]
    });
}

function askAboutRole() {
    addMessage('What\'s your primary role? This helps me tailor the setup process for you.', 'ai', [
        { action: 'role-hr', text: 'HR Professional' },
        { action: 'role-payroll', text: 'Payroll Administrator' },
        { action: 'role-admin', text: 'Office Administrator' },
        { action: 'role-owner', text: 'Business Owner' },
        { action: 'role-other', text: 'Other' }
    ]);
}

function askAboutExperience() {
    addMessage('How much payroll experience do you have? This helps me adjust the pace and detail level.', 'ai', [
        { action: 'experience-beginner', text: 'Less than 1 year' },
        { action: 'experience-intermediate', text: '2-5 years' },
        { action: 'experience-advanced', text: '5-10 years' },
        { action: 'experience-expert', text: '10+ years' }
    ]);
}

function askAboutCurrentSystem() {
    addMessage('What payroll system are you currently using? This helps me understand your migration needs.', 'ai', [
        { action: 'system-manual', text: 'Manual (Excel, paper, etc.)' },
        { action: 'system-quickbooks', text: 'QuickBooks Payroll' },
        { action: 'system-adp', text: 'ADP' },
        { action: 'system-gusto', text: 'Gusto' },
        { action: 'system-other', text: 'Other system' },
        { action: 'system-new', text: 'This is my first payroll system' }
    ]);
}

function askAboutStartDate() {
    addMessage('When would you like to start using the new payroll system? I\'ll create a personalized timeline based on your target date.', 'ai');

    setTimeout(() => {
        chatDatePickerShow('Please select your preferred start date:', function(selectedDate) {
            newWizardState.userData.startDate = selectedDate.toISOString().split('T')[0];

            const formattedDate = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            setTimeout(() => {
                addMessage(`Perfect! I'll create your timeline for a ${formattedDate} launch.\n\nGenerating your personalized implementation plan now...`, 'ai');

                setTimeout(() => {
                    transitionToSplitScreenWithTimeline();
                }, 2000);
            }, 1000);
        });
    }, 1000);
}

function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
}

// Toggle between two team involvement options with Ctrl+E
let useInputBoxes = false;

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        useInputBoxes = !useInputBoxes;
        console.log('Switched to:', useInputBoxes ? 'Input Boxes' : 'Text Input');

        // Show visual feedback
        const indicator = document.createElement('div');
        indicator.style.cssText = 'position:fixed;top:20px;right:20px;background:#30258D;color:white;padding:8px 12px;border-radius:4px;z-index:9999;';
        indicator.textContent = useInputBoxes ? 'Mode: Input Boxes' : 'Mode: Text Input';
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }
});

function startTimelineTransitionWithThinking() {
    const chatPanel = document.getElementById('chatPanel');
    const chatInput = document.querySelector('.chat-input');
    const tablePanel = document.getElementById('tablePanel');
    const panelToggle = document.querySelector('.panel-toggle-edge');

    // STEP 1: Show right panel with skeleton IMMEDIATELY when date is selected
    console.log('🎯 startTimelineTransitionWithThinking called - showing skeleton immediately');
    
    // Remove centered class FIRST to allow proper layout
    chatPanel.classList.remove('centered');
    
    // Remove hidden class to ensure panel is visible
    tablePanel.classList.remove('hidden');
    
    chatPanel.style.display = 'flex';
    tablePanel.style.display = 'flex'; // Show panel immediately so skeleton is visible
    tablePanel.style.opacity = '1'; // Force visibility
    tablePanel.style.transform = 'translateX(0)'; // Force position
    
    // Ensure proper width for split view
    chatPanel.style.width = '30%';
    tablePanel.style.width = '70%';
    
    console.log('📱 Right panel display, opacity, and position set. Panel styles:', {
        display: tablePanel.style.display,
        opacity: tablePanel.style.opacity,
        transform: tablePanel.style.transform,
        width: tablePanel.style.width
    });
    showTimelineSkeleton();
    console.log('💀 Skeleton should now be visible in right panel');

    // STEP 2: Only hide elements, don't change layout
    gsap.set([chatPanel, chatInput, panelToggle], {
        opacity: 0,
        y: 20
    });

    // Keep right panel visible but we'll control the chat panel visibility
    gsap.set(tablePanel, {
        opacity: 1 // Keep it visible so skeleton shows immediately
    });

    // Update headers
    const panelHeader = document.querySelector('.panel-header h2');
    const panelSubtitle = document.querySelector('.panel-subtitle');
    if (panelHeader) panelHeader.textContent = 'Implementation Timeline';
    if (panelSubtitle) panelSubtitle.innerHTML = 'Your personalized setup roadmap with key milestones';

    // STEP 3: Super simple animation - just show/hide, let CSS handle layout
    const tl = gsap.timeline();

    // Phase 1: Show chat content (DON'T touch intro-mode or width)
    tl.to(chatPanel, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
    }, 0.2)

    // Phase 2: Show thinking + input
    .add(() => {
        showAIThinkingIndicator();
        // Scroll to ensure thinking message is visible
        setTimeout(() => {
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    }, 0.2)
    .to([chatInput, panelToggle], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
    }, 0.5)

    // Phase 3: Ensure layout is stable (intro-mode already removed)
    .add(() => {
        // Layout should already be correct, just ensure it's stable
        console.log('📐 Layout stabilized - chat and timeline panels visible');
    }, 1.2)

    // Phase 4: Remove thinking indicator first, then show AI message and replace skeleton
    .add(() => {
        removeThinkingIndicator();
    }, 4.8) // Remove thinking indicator 0.2s before skeleton ends
    .add(() => {
        // Reset welcome state to prevent double message handling
        if (window.welcomeState) {
            window.welcomeState.waitingForTextResponse = false;
            window.welcomeState.currentQuestionType = null;
        }
        // Show AI welcome message first
        showTimelineWelcomeMessage();
        
        // AFTER the AI message appears, replace skeleton with timeline + 0% progress bars
        setTimeout(() => {
            hideTimelineSkeleton();
        }, 1000); // 1 second delay to let AI message appear first
    }, 5.0);
}

// Prototype upload function that simulates file upload
function handlePrototypeUpload() {
    // Add user message for clicking the upload button
    addMessage('Browse files', 'user');
    
    // Simulate file selection process with a short delay
    setTimeout(() => {
        // Create a new conversation thread for uploaded files confirmation
        collapseConversationHistory("Document upload confirmation");
        
        // Show uploaded files list
        addMessage('Great! I\'ve detected the following documents:\n\n<strong>Uploaded Files:</strong>\n<div class="uploaded-files-list">\n<div class="uploaded-file" data-filename="Employee_Handbook_2024.pdf">\n  <span class="file-name">Employee_Handbook_2024.pdf (2.3 MB)</span>\n  <span class="file-action trash-icon" onclick="toggleFileUpload(\'Employee_Handbook_2024.pdf\', this)">🗑️</span>\n</div>\n<div class="uploaded-file" data-filename="Payroll_Register_July2024.xlsx">\n  <span class="file-name">Payroll_Register_July2024.xlsx (1.1 MB)</span>\n  <span class="file-action trash-icon" onclick="toggleFileUpload(\'Payroll_Register_July2024.xlsx\', this)">🗑️</span>\n</div>\n<div class="uploaded-file" data-filename="Pay_Policy_Document.docx">\n  <span class="file-name">Pay_Policy_Document.docx (892 KB)</span>\n  <span class="file-action trash-icon" onclick="toggleFileUpload(\'Pay_Policy_Document.docx\', this)">🗑️</span>\n</div>\n</div>\n\nThese files contain exactly what I need to configure your payroll system. Are these the correct files you want me to process?', 'ai', [
            { action: 'confirm-uploaded-files', text: 'Yes, process these files', buttonType: 'primary' },
            { action: 'upload-different-files', text: 'Upload different files', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive'
        });
    }, 1500);
}

// Handle the confirmation of uploaded files
function handleUploadConfirmation(action) {
    // Remove all pill buttons first
    removeAllPills();
    
    if (action === 'confirm-uploaded-files') {
        // Don't add message here - it's already added by handlePillClick
        setTimeout(() => {
            // Call the existing document processing simulation
            simulateDocumentProcessing(true, true); // Both handbook and payroll files uploaded
        }, 1000);
    } else if (action === 'upload-different-files') {
        // Don't add message here - it's already added by handlePillClick
        setTimeout(() => {
            addMessage('No problem! Please try uploading again. I\'ll be looking for:\n\n<strong>Employee Handbook or Policy Documents:</strong>\n• Company policies\n• Employee manual\n• Pay policy documents\n\n<strong>Recent Payroll Reports:</strong>\n• Payroll registers\n• Pay summary reports\n• Earning code lists', 'ai');
        }, 1000);
    }
}

// Toggle file upload status (remove/restore file)
function toggleFileUpload(filename, element) {
    const fileContainer = element.closest('.uploaded-file');
    const fileName = fileContainer.querySelector('.file-name');
    
    if (fileName.classList.contains('strikethrough')) {
        // Restore file
        fileName.classList.remove('strikethrough');
        element.innerHTML = '🗑️';
        element.className = 'file-action trash-icon';
    } else {
        // Remove file
        fileName.classList.add('strikethrough');
        element.innerHTML = '↶';
        element.className = 'file-action revert-icon';
    }
}