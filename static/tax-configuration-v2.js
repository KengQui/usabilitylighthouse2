// tax-configuration.js
// ========================================
// TAX CONFIGURATION WORKFLOW
// ========================================

// Toggle source documents expansion
window.toggleSourceDocs = function(element) {
    const content = element.parentElement.querySelector('.source-docs-content');
    const icon = element.querySelector('.source-toggle-icon');
    
    if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(90deg)';
        element.style.backgroundColor = '#e9ecef';
    } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
        element.style.backgroundColor = '#f8f9fa';
    }
};

// Default related questions for tax configuration
const DEFAULT_TAX_RELATED_QUESTIONS = [
    { action: 'register-employer-maine', text: 'How do we verify tax registrations?' },
    { action: 'remote-employees', text: 'What is involved in the complete tax setup process?' },
    { action: 'can-change-later', text: 'What additional information would I need to provide for tax set up' }
];

// State tax specific related questions
const STATE_TAX_RELATED_QUESTIONS = [
    { action: 'verify-tax-registrations', text: 'How do we verify tax registrations?' },
    { action: 'complete-tax-setup', text: 'What is involved in the complete tax setup process?' },
    { action: 'additional-info-needed', text: 'What additional information would I need to provide for tax set up?' },
    { action: 'ss-medicare-exemptions', text: 'Do you have any employees exempted from Social Security and Medicare withholding?' }
];

// Tax configuration state
window.taxConfigurationState = {
    step: 1,
    extractedTaxes: [
        {
            name: 'Federal Income Tax',
            jurisdiction: 'IRS (Federal Government)',
            type: 'federal_income',
            confirmed: true
        },
        {
            name: 'State Income Tax',
            jurisdiction: 'Massachusetts Department of Revenue',
            type: 'ma_income',
            confirmed: true
        },
        {
            name: 'SUI',
            jurisdiction: 'Massachusetts Department of Labor',
            type: 'ma_sui',
            confirmed: true
        },
        {
            name: 'PFML',
            jurisdiction: 'Massachusetts Department of Labor',
            type: 'ma_pfml',
            confirmed: true
        },
        {
            name: 'EMAC',
            jurisdiction: 'Massachusetts Department of Revenue',
            type: 'ma_emac',
            confirmed: true
        },
        {
            name: 'Massachusetts Workforce Training Fund',
            jurisdiction: 'Massachusetts Department of Labor',
            type: 'ma_wtf',
            confirmed: true
        }
    ],
    confirmedTaxes: [],
    discoveryAnswers: {},
    currentQuestion: null,
    recommendations: [],
    skippedTaxes: [],
    needsUnemploymentTax: null,
    needsMultiStateTax: null,
    needsEmployerTax: null,
    depositFrequencies: {},
    taxDetails: {},
    businessProfile: {
        location: 'Massachusetts',
        employeeLocations: ['Massachusetts'],
        payrollSize: 'Medium (>50 employees)'
    },
    statesTaxes: null  // Explicitly set to null to use defaults with new 2025 rates
};

// Main delegation handler (follows existing pattern)

function removeAllPills() {
    console.log('🔧 removeAllPills called - preserving tier-two options');

    const selectors = [
        '.suggested-pills',      // Standard pills
        '.suggested-radios',     // Radio style
        '.suggested-checkboxes', // Checkbox style
        '.wizard-actions'        // Two-tier primary buttons
    ];

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        elements.forEach(element => {
            console.log('Removing element:', element);
            element.remove();
        });
    });

    // DON'T remove tier-two options (related questions) - they should persist
    // Only remove buttons and primary interactive elements
}

function handleTaxConfigurationPill(action) {
    console.log('Tax configuration handling:', action);
    
    switch (action) {
        case 'start-tax-configuration':
            return startTaxConfigurationWorkflow();
        case 'confirm-tax-types':
            return confirmTaxTypes();
        case 'ready-for-additional':
            return performSmartTaxDiscovery();
        case 'start-complex-tax-workflow':
            return startComplexTaxWorkflow();
            
        // Discovery response handlers (legacy and migration)
        case 'handle-unemployment-myself':
        case 'payroll-service-handles':
        case 'not-sure-unemployment':
        case 'permanent-multistate':
        case 'temporary-multistate':
        case 'mixed-multistate':
        case 'handle-employer-taxes':
        case 'system-handles-employer':
        case 'need-help-employer':
        // Migration-specific discovery responses
        case 'previous-vendor-handled-unemployment':
        case 'have-unemployment-accounts-separately':
        case 'need-new-unemployment-setup':
        case 'previous-vendor-handled-states':
        case 'have-state-accounts-separately':
        case 'need-new-state-registrations':
        case 'previous-vendor-handled-employer':
        case 'have-employer-details-separately':
        case 'need-employer-tax-setup':
        // Business expansion responses
        case 'recently-expanded-to-states':
        case 'have-state-registrations-separately':
        case 'employees-work-remotely':
        // New Maine-specific expansion responses
        case 'add-maine-taxes':
        case 'upload-documents-extraction':
        case 'remote-employees-other-states':
            return handleDiscoveryResponse(action);
            
        case 'add-recommended-taxes':
            return addRecommendedTaxes();
        case 'review-recommendations':
            return reviewRecommendations();
        case 'skip-recommendations':
            return skipRecommendations();
        
        // Migration-specific recommendation actions
        case 'add-migration-recommendations':
            return addMigrationRecommendations();
        case 'review-migration-recommendations':
            return reviewMigrationRecommendations();
        case 'confirm-maine-taxes':
            return showFrequencyAssignment();
        case 'assign-frequencies':
            return showFrequencyAssignment();
        case 'modify-frequencies':
            return modifyFrequencies();
        case 'collect-tax-details':
            return collectTaxDetails();
        case 'need-help-finding':
            return showHelpFindingInfo();
        case 'complete-tax-setup':
            return completeTaxConfiguration();
        case 'continue-to-next-setup':
            return continueToNextSetup();
        case 'export-tax-config':
            return exportTaxConfiguration();
        case 'modify-maine-taxes':
            return modifyMaineTaxes();
        case 'remove-maine-taxes':
            return removeMaineTaxes();
        case 'configure-while-registering':
            return showConfigureWhileRegistering();
        case 'keep-maine-taxes':
            return keepMaineTaxes();
        case 'confirm-remove-maine':
            return confirmRemoveMaineTaxes();
        case 'add-maine-back':
            return addMaineBack();
        case 'tax-info-1':
            return showTaxInfo1();
        case 'tax-info-2':
            return showTaxInfo2();
        case 'tax-info-3':
            return showTaxInfo3();
        case 'migration-info-1':
            return showMigrationInfo1();
        case 'migration-info-2':
            return showMigrationInfo2();
        case 'maine-registration-time':
            return showMaineRegistrationTime();
        case 'no-registration-consequence':
            return showNoRegistrationConsequence();
        case 'frequency-help-1':
            return showFrequencyHelp1();
        case 'frequency-help-2':
            return showFrequencyHelp2();
        // New related questions handlers
        case 'register-employer-maine':
            return showMaineEmployerRegistration();
        case 'remote-employees':
            return showRemoteEmployees();
        case 'can-change-later':
            return showCanChangeLater();
            
        case 'review-pay-statement':
            return reviewPayStatement();
        case 'abbreviations-confirmed':
            return handleAbbreviationsConfirmed();
        case 'edit-abbreviations':
            return handleEditAbbreviations();
        case 'back-to-abbreviations':
            updateTaxPanelContent('tax-mapping-table');
            return true;
        case 'how-to-explain-taxes':
            return showHowToExplainTaxes();
        case 'configure-tax-rates':
            return configureTaxRates();
        case 'add-to-todo':
            return addDocumentUploadToTodo();
        case 'upload-documents-now':
            return uploadDocumentsNow();
        case 'why-upload-docs':
            return showWhyUploadDocs();
        case 'where-find-rate-letters':
            return showWhereFindRateLetters();
        case 'what-if-no-letter':
            return showWhatIfNoLetter();
        case 'use-standard-rates':
            return useStandardRates();
        case 'documents-uploaded':
            return documentsUploaded();
        case 'upload-later':
            return uploadLater();
        case 'start-rate-entry':
            return startRateEntry();
        case 'review-current-rates':
            return reviewCurrentRates();
        case 'employee-questions-1':
            return showEmployeeQuestions1();
        case 'employee-questions-2':
            return showEmployeeQuestions2();
        case 'complete-tax-setup':
            return completeTaxConfiguration();
        case 'migration-info-3':
            return showMigrationInfo3();
        case 'show-verification-steps':
            return showTaxVerificationSteps();
        case 'need-help-verifying':
            return showVerificationHelp();
        case 'where-find-tax-docs':
            return showWhereToFindDocs();
        case 'what-if-missing-info':
            return showMissingInfoGuidance();
        case 'can-verify-later':
            return showVerifyLaterInfo();
        case 'show-setup-overview':
            return showTaxSetupOverview();
        case 'add-new-tax':
            return handleAddNewTax();
        
        // Federal tax actions
        case 'federal-taxes-look-good':
            return proceedToStateTaxes();
        case 'verify-federal-ein':
            return verifyFederalEIN();
        case 'federal-tax-setup-overview':
            return showFederalTaxSetupOverview();
        case 'fit-fica-futa-info':
            return showFITFICAFUTAInfo();
        
        // State tax actions
        case 'state-taxes-confirmed':
            return confirmStateTaxes();

        case 'proceed-to-deposit-schedules':
            return proceedToPaymentSchedules();
        case 'add-another-state':
            return addAnotherState();
        case 'modify-state-list':
            return modifyStateList();
        case 'verify-tax-registrations':
            return verifyTaxRegistrations();
        case 'complete-tax-setup':
            return showCompleteTaxSetup();
        case 'additional-info-needed':
            return showAdditionalInfoNeeded();
        case 'ss-medicare-exemptions':
            return showSSMedicareExemptions();
        case 'state-tax-requirements':
            return showStateTaxRequirements();
        case 'add-maine-tax':
            return addMaineTaxConfiguration();
        case 'skip-maine-for-now':
            return skipMaineTax();
        case 'maine-registration-timeline':
            return showMaineRegistrationTimeline();
        case 'maine-tax-penalties':
            return showMaineTaxPenalties();


            // Assign coworker and other config actions
            case 'assign-coworker-tax':
                return assignCoworkerToTax();
            case 'work-other-config':
                return workOnOtherConfigurations();
                
            // FICA exemption actions
            case 'have-exemptions':
                return handleHaveExemptions();
            case 'no-exemptions':
                return handleNoExemptions();
                
            // complex tax chunking actions
            case 'choose-impact-chunking':
                return startImpactBasedChunking();
            case 'choose-jurisdiction-chunking':
                return startJurisdictionBasedChunking();
            case 'choose-ai-recommendation':
                return startAIRecommendation();
            case 'explain-chunking-options':
                return explainChunkingOptions();
            case 'show-tax-breakdown':
                return showTaxBreakdown();

            // ADD THESE NEW MINI-WORKFLOW CASES:
            case 'start-high-impact-chunk':
                return startHighImpactChunk();
            case 'start-federal-chunk':
                return startFederalChunk();
            case 'accept-ai-recommendation':
                return acceptAIRecommendation();
            case 'continue-next-chunk':
                return continueNextChunk();
            case 'complete-chunk':
                return completeCurrentChunk();
            case 'show-chunk-progress':
                return showChunkProgress();

            // ADD THESE NEW CHUNK PROCESSING CASES:
            case 'start-chunk-configuration':
                return startChunkConfiguration();
            case 'start-federal-configuration':
                return startFederalConfiguration();
            case 'configure-next-batch':
                return configureNextBatch();
            case 'apply-pattern-to-similar':
                return applyPatternToSimilar();
            case 'bulk-apply-frequency':
                return bulkApplyFrequency();
            case 'complete-chunk-batch':
                return completeChunkBatch();
            case 'continue-chunk-processing':
                return continueChunkProcessing();
            case 'show-chunk-patterns':
                return showChunkPatterns();
            case 'verify-chunk-progress':
                return verifyChunkProgress();

            case 'configure-first-batch':
                return configureFirstBatch();
            case 'configure-federal-batch':
                return configureFederalBatch();
            case 'configure-current-batch':
                return configureCurrentBatch();
            case 'bulk-apply-patterns':
                return bulkApplyPatterns();
            case 'selective-pattern-apply':
                return selectivePatternApply();
            case 'customize-federal-setup':
                return customizeFederalSetup();
            case 'apply-previous-pattern':
                return applyPreviousPattern();
            case 'modify-batch-grouping':
                return modifyBatchGrouping();
            case 'adjust-frequencies':
                return adjustFrequencies();
            case 'review-current-progress':
                return reviewCurrentProgress();
            case 'complete-chunk':
                return completeCurrentChunk();

            case 'apply-all-patterns':
                return applyAllPatterns();
            case 'apply-income-pattern':
                return applyIncomePattern();
            case 'apply-unemployment-pattern':
                return applyUnemploymentPattern();
            case 'apply-document-pattern':
                return applyDocumentPattern();

            // Add these to handleTaxConfigurationPill() switch statement:
            case 'start-new-york-chunk':
                return startNewYorkChunk();
            case 'start-new-jersey-chunk':
                return startNewJerseyChunk();
            case 'start-massachusetts-chunk':
                return startMassachusettsChunk();
            case 'start-new-hampshire-chunk':
                return startNewHampshireChunk();
            
            // Payment schedule actions
            case 'confirm-deposit-schedules':
                return confirmPaymentSchedules();
            case 'modify-deposit-schedules':
                return modifyPaymentSchedules();
            case 'add-new-schedule':
            case 'change-frequency':
            case 'adjust-assignments':
                // These would need specific handlers
                console.log('Payment schedule action:', action);
                return false;
            
            // New actions for tax configuration options
            case 'assign-coworker-tax':
                return assignCoworkerToTax();
            case 'work-other-config':
                return workOnOtherConfigurations();
            
            default:
                console.log('Unhandled tax action:', action);
                return false;


    }
}
// Add these functions for jurisdiction-based chunking:

function startNewYorkChunk() {
    addMessage('Start with New York', 'user');

    setTimeout(() => {
        taxConfigurationState.currentChunk = {
            name: 'New York Jurisdiction',
            jurisdictions: ['New York'],
            taxes: [
                { name: 'NY State Income Tax', jurisdiction: 'New York Department of Revenue', employees: 45, type: 'ny_income', documentSource: 'Employee_Roster_Current.csv' },
                { name: 'NY State Unemployment (SUI)', jurisdiction: 'New York Department of Labor', employees: 45, type: 'ny_sui', documentSource: 'Q3_2024_Payroll_Register.xlsx' },
                { name: 'NY State Disability (SDI)', jurisdiction: 'New York Department of Labor', employees: 45, type: 'ny_sdi', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'NY Metropolitan Commuter Tax', jurisdiction: 'New York Department of Revenue', employees: 45, type: 'ny_mct', documentSource: 'State_Tax_Filings_2024.pdf' }
            ],
            progress: { current: 0, total: 4 },
            documentVerified: true
        };

        updateTaxPanelContent('chunk-configuration');

        addMessage(`<strong>2️⃣ New York Jurisdiction (45 employees)</strong>

Configuring all New York state taxes for complete NY compliance.

<strong>This jurisdiction includes 4 taxes:</strong>
- NY State Income Tax
- NY State Unemployment (SUI)
- NY State Disability (SDI)  
- NY Metropolitan Commuter Tax

<strong>Strategy:</strong> Complete all NY obligations before moving to next state.

Ready to configure all NY taxes?`, 'ai', [
            { action: 'start-chunk-configuration', text: 'Configure NY taxes', buttonType: 'primary' },
            { action: 'show-ny-details', text: 'Show NY tax details', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'why-jurisdiction-approach', text: 'Why complete each state fully?' },
                { action: 'ny-compliance-requirements', text: 'What are NY requirements?' }
            ]
        });
    }, 1000);

    return true;
}

function startNewJerseyChunk() {
    addMessage('Start with New Jersey', 'user');

    setTimeout(() => {
        taxConfigurationState.currentChunk = {
            name: 'New Jersey Jurisdiction',
            jurisdictions: ['New Jersey'],
            taxes: [
                { name: 'NJ State Income Tax', jurisdiction: 'New Jersey Division of Taxation', employees: 38, type: 'nj_income', documentSource: 'Employee_Roster_Current.csv' },
                { name: 'NJ State Unemployment (SUI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_sui', documentSource: 'Q3_2024_Payroll_Register.xlsx' },
                { name: 'NJ Temporary Disability (TDI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_tdi', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'NJ Family Leave (FLI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_fli', documentSource: 'State_Tax_Filings_2024.pdf' }
            ],
            progress: { current: 0, total: 4 },
            documentVerified: true
        };

        updateTaxPanelContent('chunk-configuration');

        addMessage(`<strong>3️⃣ New Jersey Jurisdiction (38 employees)</strong>

Configuring all New Jersey state taxes for complete NJ compliance.

<strong>This jurisdiction includes 4 taxes:</strong>
- NJ State Income Tax
- NJ State Unemployment (SUI)
- NJ Temporary Disability (TDI)
- NJ Family Leave (FLI)

<strong>Strategy:</strong> Complete all NJ obligations before moving to next state.

Ready to configure all NJ taxes?`, 'ai', [
            { action: 'start-chunk-configuration', text: 'Configure NJ taxes', buttonType: 'primary' },
            { action: 'show-nj-details', text: 'Show NJ tax details', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'nj-tax-differences', text: 'How are NJ taxes different?' },
                { action: 'nj-compliance-requirements', text: 'What are NJ requirements?' }
            ]
        });
    }, 1000);

    return true;
}

function startMassachusettsChunk() {
    addMessage('Start with Massachusetts', 'user');

    setTimeout(() => {
        taxConfigurationState.currentChunk = {
            name: 'Massachusetts Jurisdiction',
            jurisdictions: ['Massachusetts'],
            taxes: [
                { name: 'MA State Income Tax (SIT)', jurisdiction: 'Massachusetts Department of Revenue', employees: 50, type: 'ma_income', documentSource: 'Employee_Roster_Current.csv' },
                { name: 'MA SUI/Recovery Assessment', jurisdiction: 'Massachusetts Department of Labor', employees: 50, type: 'ma_sui', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'MA PFML', jurisdiction: 'Massachusetts Department of Labor', employees: 50, type: 'ma_pfml', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'MA EMAC', jurisdiction: 'Massachusetts Department of Revenue', employees: 50, type: 'ma_emac', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'MA Workforce Training Fund', jurisdiction: 'Massachusetts Department of Labor', employees: 50, type: 'ma_wtf', documentSource: 'State_Tax_Filings_2024.pdf' }
            ],
            progress: { current: 0, total: 5 },
            documentVerified: true
        };

        updateTaxPanelContent('chunk-configuration');

        addMessage(`<strong>4️⃣ Massachusetts Jurisdiction (50 employees)</strong>

Configuring Massachusetts state taxes for complete MA compliance.

<strong>This jurisdiction includes 5 taxes:</strong>
- MA State Income Tax (SIT)
- MA SUI/Recovery Assessment
- MA Paid Family & Medical Leave (PFML)
- MA Employer Medical Assistance (EMAC)
- MA Workforce Training Fund

<strong>Strategy:</strong> Full compliance with all MA employer requirements for companies >50 employees.

Ready to configure MA taxes?`, 'ai', [
            { action: 'start-chunk-configuration', text: 'Configure MA taxes', buttonType: 'primary' },
            { action: 'show-ma-details', text: 'Why 5 different taxes?', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

function startNewHampshireChunk() {
    addMessage('Start with New Hampshire', 'user');

    setTimeout(() => {
        taxConfigurationState.currentChunk = {
            name: 'New Hampshire Jurisdiction',
            jurisdictions: ['New Hampshire'],
            taxes: [
                { name: 'NH State Unemployment (SUI)', jurisdiction: 'New Hampshire Department of Labor', employees: 8, type: 'nh_sui', documentSource: 'State_Tax_Filings_2024.pdf' }
            ],
            progress: { current: 0, total: 1 },
            documentVerified: true
        };

        updateTaxPanelContent('chunk-configuration');

        addMessage(`<strong>5️⃣ New Hampshire Jurisdiction (8 employees)</strong>

Final jurisdiction! New Hampshire is simple - no state income tax.

<strong>This jurisdiction includes 1 tax:</strong>
- NH State Unemployment (SUI) only

<strong>Why only 1 tax:</strong> NH has no state income tax - only unemployment insurance required.

Ready to configure the final tax?`, 'ai', [
            { action: 'start-chunk-configuration', text: 'Configure NH tax', buttonType: 'primary' },
            { action: 'explain-nh-tax-structure', text: 'Why no income tax?', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}
// Tax workflow functions
function startTaxConfigurationWorkflow() {
    taxConfigurationState.step = 1;
    taxConfigurationState.currentStep = 'federal_tax_confirmation';
    
    console.log('🔧 Tax configuration workflow started - showing federal tax overview');
    
    // Don't show right panel initially as requested
    // updateTaxPanelContent('tax-extraction');
    
    removeAllPills();
    
    addMessage(`<strong>Time to configure your taxes </strong>

We'll handle all federal taxes automatically, you just need to set up state taxes

<strong>Federal taxes we'll handle:</strong>
✓ Federal Income Tax (FIT)
✓ FICA - Social Security
✓ FICA - Medicare
✓ Federal Unemployment Tax (FUTA)

<strong>How would you like to move forward?</strong>
1. <strong>Set up</strong> state tax configuration for your specific states
2. <strong>Invite a coworker</strong> to handle this section
3. <strong>Skip taxes</strong> for now and continue with other configurations
4. <strong>Ask more</strong> clarification questions`, 'ai', [], {
        style: 'two-tier-interactive',
        tierTwoOptions: DEFAULT_TAX_RELATED_QUESTIONS
    });
    
    return true;
}

function startComplexTaxWorkflow() {
    console.log('Starting complex tax workflow');

    // Extract from uploaded documents
    const extractedData = analyzeUploadedDocuments();

    const complexScenario = {
        totalTaxes: extractedData.totalTaxes,
        jurisdictions: extractedData.jurisdictions,
        employeeDistribution: extractedData.employeeDistribution,
        documentSource: true,
        extractedFrom: extractedData.extractedFrom
    };

    // Store in state for later use
    taxConfigurationState.complexScenario = complexScenario;

    // Update right panel with complex tax analysis
    updateTaxPanelContent('complex-tax-analysis');

    addMessage(`I\'ve analyzed your uploaded documents and found <strong>${complexScenario.totalTaxes} tax obligations across ${complexScenario.jurisdictions.length} jurisdictions</strong>.

<strong>Document Analysis Complete:</strong>
- Analyzed ${complexScenario.extractedFrom.length} uploaded files
- Found ${complexScenario.totalTaxes} tax obligations
- Identified ${Object.keys(complexScenario.employeeDistribution).length} employee locations

<strong>Complexity Level:</strong> High (requires chunked approach)

This is complex! How would you like to tackle this setup?`, 'ai', [
        { action: 'choose-impact-chunking', text: 'By Business Impact', buttonType: 'primary' },
        { action: 'choose-jurisdiction-chunking', text: 'By Jurisdiction', buttonType: 'secondary' },
        { action: 'choose-ai-recommendation', text: 'Recommend for me', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'explain-chunking-options', text: 'What do these options mean?' },
            { action: 'show-document-analysis', text: 'Show me the document analysis' },
            { action: 'verify-document-data', text: 'Let me verify this data' }
        ]
    });

    return true;
}

// Complex tax chunking strategy functions
function startImpactBasedChunking() {
    addMessage('By Business Impact', 'user');

       removeAllPills();

    setTimeout(() => {
        addMessage(`Perfect! I\'ll prioritize by business impact - handling your largest employee groups first.

<strong>Impact-Based Chunks:</strong>
🔥 <strong>High Impact:</strong> New York + New Jersey (83 employees)
⚡ <strong>Medium Impact:</strong> Massachusetts (22 employees)  
💤 <strong>Low Impact:</strong> New Hampshire (8 employees)

<strong>Strategy:</strong> We'll configure high-impact taxes first to get your biggest payroll populations running, then handle the smaller groups.

Let's start with your high-impact chunk!`, 'ai', [
            { action: 'start-high-impact-chunk', text: 'Start with High Impact', buttonType: 'primary' },
            { action: 'show-impact-analysis', text: 'Show detailed impact analysis', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-impact-logic', text: 'How do you determine impact?' },
                { action: 'can-change-strategy', text: 'Can I change strategy later?' }
            ]
        });
    }, 1000);

    return true;
}

function startJurisdictionBasedChunking() {
    addMessage('By Jurisdiction', 'user');

      removeAllPills();

    setTimeout(() => {
        addMessage(`Great choice! I\'ll handle each jurisdiction completely before moving to the next.

<strong>Jurisdiction-Based Order:</strong>
1️⃣ <strong>Federal taxes</strong> (3 taxes) - Foundation first
2️⃣ <strong>New York</strong> (4 taxes) - Largest state  
3️⃣ <strong>New Jersey</strong> (4 taxes) - Second largest
4️⃣ <strong>Massachusetts</strong> (5 taxes) - Medium complexity
5️⃣ <strong>New Hampshire</strong> (1 tax) - Simplest last

<strong>Strategy:</strong> Complete setup for each jurisdiction before moving on. This ensures full compliance state-by-state.

Let's start with Federal taxes!`, 'ai', [
            { action: 'start-federal-chunk', text: 'Start with Federal', buttonType: 'primary' },
            { action: 'show-jurisdiction-details', text: 'Show jurisdiction breakdown', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-jurisdiction-order', text: 'Why this order?' },
                { action: 'can-change-strategy', text: 'Can I change strategy later?' }
            ]
        });
    }, 1000);

    return true;
}

function startAIRecommendation() {
    addMessage('Recommend for me', 'user');

    removeAllPills();


    setTimeout(() => {
        addMessage(`Analyzing your setup... 🤖

<strong>AI Analysis:</strong>
- You have 83 employees in NY+NJ (73% of workforce)
- Clear high-impact jurisdictions vs. low-impact  
- Uneven distribution suggests impact-based approach

<strong>🎯 Recommendation: Business Impact Strategy</strong>

<strong>Why this works for you:</strong>
- Gets your main workforce (83 employees) running first
- New Hampshire's 8 employees can wait without business disruption
- Reduces risk by prioritizing where mistakes would cost the most

Sound good?`, 'ai', [
            { action: 'accept-ai-recommendation', text: 'Sounds good, let\'s do it', buttonType: 'primary' },
            { action: 'choose-jurisdiction-chunking', text: 'Actually, prefer jurisdiction-based', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-ai-logic', text: 'How did you decide this?' },
                { action: 'what-if-disagree', text: 'What if I disagree?' }
            ]
        });
    }, 1000);

    return true;
}

function explainChunkingOptions() {
    addMessage('What do these options mean?', 'user');

    setTimeout(() => {
        addMessage(`<strong>Here's what each chunking strategy means:</strong>

<strong>🎯 By Business Impact</strong>
- Prioritizes jurisdictions by employee count and business risk
- Handles your biggest payroll populations first
- Best for: Uneven employee distribution, getting main workforce running quickly

<strong>🗺️ By Jurisdiction</strong>  
- Completes each state/federal area fully before moving on
- Systematic state-by-state approach
- Best for: Compliance-focused mindset, even employee distribution

<strong>🤖 Recommend for me</strong>
- AI analyzes your data and suggests the best approach
- Considers employee distribution, complexity, and risk factors
- Best for: Want the optimal strategy without thinking about it

Which approach appeals to you?`, 'ai', [
            { action: 'choose-impact-chunking', text: 'By Business Impact', buttonType: 'primary' },
            { action: 'choose-jurisdiction-chunking', text: 'By Jurisdiction', buttonType: 'secondary' },
            { action: 'choose-ai-recommendation', text: 'Recommend for me', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

function showTaxBreakdown() {
    addMessage('Show me the detailed tax breakdown', 'user');

    setTimeout(() => {
        addMessage(`<strong>Detailed Tax Breakdown (8 total taxes):</strong>

<strong>Federal (3 taxes)</strong>
- Federal Income Tax (withholding)
- Federal FUTA (unemployment) 
- FICA Employer Match (Social Security + Medicare)

<strong>Massachusetts (5 taxes)</strong>
- MA State Income Tax (SIT)
- MA State Unemployment Insurance (SUI/Recovery Assessment)
- MA Paid Family & Medical Leave (PFML)
- MA Employer Medical Assistance (EMAC)
- MA Workforce Training Fund

Ready to choose your chunking strategy?`, 'ai', [
            { action: 'choose-impact-chunking', text: 'By Business Impact', buttonType: 'primary' },
            { action: 'choose-jurisdiction-chunking', text: 'By Jurisdiction', buttonType: 'secondary' },
            { action: 'choose-ai-recommendation', text: 'Recommend for me', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

function confirmTaxTypes() {
    // This function is no longer used - keeping for backwards compatibility
    return performSmartTaxDiscovery();
}

function modifyTaxTypes() {
    addMessage('I can help you modify the tax types. What needs to be changed?', 'ai', [
        { action: 'remove-tax-type', text: 'Remove a tax type' },
        { action: 'add-tax-type', text: 'Add a different tax type' },
        { action: 'change-jurisdiction', text: 'Change jurisdiction info' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'tax-info-1', text: 'Why would I need to modify?' },
            { action: 'tax-info-2', text: 'What if I\'m not sure?' },
            { action: 'tax-info-3', text: 'Can I change this later?' }
        ]
    });
    return true;
}

// ========================================
// MINI-WORKFLOW CHUNK PROCESSING FUNCTIONS
// ========================================

function startHighImpactChunk() {
    addMessage('Start with High Impact', 'user');
     removeAllPills();

    setTimeout(() => {
        // Initialize chunk state with document-sourced data
        taxConfigurationState.currentChunk = {
            name: 'High Impact',
            jurisdictions: ['New York', 'New Jersey'],
            taxes: [
                { name: 'NY State Income Tax', jurisdiction: 'New York Department of Revenue', employees: 45, type: 'ny_income', documentSource: 'Employee_Roster_Current.csv' },
                { name: 'NY State Unemployment (SUI)', jurisdiction: 'New York Department of Labor', employees: 45, type: 'ny_sui', documentSource: 'Q3_2024_Payroll_Register.xlsx' },
                { name: 'NY State Disability (SDI)', jurisdiction: 'New York Department of Labor', employees: 45, type: 'ny_sdi', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'NJ State Income Tax', jurisdiction: 'New Jersey Division of Taxation', employees: 38, type: 'nj_income', documentSource: 'Employee_Roster_Current.csv' },
                { name: 'NJ State Unemployment (SUI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_sui', documentSource: 'Q3_2024_Payroll_Register.xlsx' },
                { name: 'NJ Temporary Disability (TDI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_tdi', documentSource: 'State_Tax_Filings_2024.pdf' },
                { name: 'NJ Family Leave (FLI)', jurisdiction: 'New Jersey Department of Labor', employees: 38, type: 'nj_fli', documentSource: 'State_Tax_Filings_2024.pdf' }
            ],
            progress: { current: 0, total: 7 },
            documentVerified: true
        };

        // Update right panel to show chunk details
        updateTaxPanelContent('chunk-configuration');

        addMessage(`<strong>🔥 High Impact Chunk: NY + NJ (83 employees)</strong>

Based on your uploaded payroll documents, these jurisdictions have your largest employee populations.

<strong>Document Analysis:</strong>
- Employee locations verified from payroll register
- Tax obligations confirmed from state filings
- Current employee count: 83 (73% of workforce)

<strong>This chunk affects:</strong>
- New York: 45 employees
- New Jersey: 38 employees

<strong>Chunk strategy:</strong> Configure these 7 high-impact taxes first to get your main workforce operational.

The right panel shows the detailed tax breakdown with document sources.`, 'ai', [
            { action: 'start-chunk-configuration', text: 'Start configuring taxes', buttonType: 'primary' },
            { action: 'verify-employee-locations', text: 'Verify employee locations', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-document-source', text: 'Which documents show this?' },
                { action: 'update-employee-count', text: 'Employee count looks wrong' },
                { action: 'explain-chunk-approach', text: 'How does chunking work?' }
            ]
        });
    }, 1000);

    return true;
}

function startFederalChunk() {
    addMessage('Start with Federal', 'user');

      removeAllPills();


    setTimeout(() => {
        // Initialize chunk state with document-sourced data
        taxConfigurationState.currentChunk = {
            name: 'Federal Foundation',
            jurisdictions: ['Federal'],
            taxes: [
                { name: 'Federal Income Tax', jurisdiction: 'IRS (Federal Government)', employees: 113, type: 'federal_income', documentSource: 'Form_941_Q3_2024.pdf' },
                { name: 'Federal FUTA', jurisdiction: 'IRS (Federal Government)', employees: 113, type: 'federal_futa', documentSource: 'Form_941_Q3_2024.pdf' },
                { name: 'FICA (Social Security and Medicare)', jurisdiction: 'IRS (Federal Government)', employees: 113, type: 'fica_employer', documentSource: 'Q3_2024_Payroll_Register.xlsx' },
                { name: 'Federal Medicare Additional Tax', jurisdiction: 'IRS (Federal Government)', employees: 113, type: 'medicare_additional', documentSource: 'Q3_2024_Payroll_Register.xlsx' }
            ],
            progress: { current: 0, total: 4 },
            documentVerified: true
        };

        // Do NOT update right panel - user requested no right panel display
        // updateTaxPanelContent('federal-chunk-configuration');

        addMessage(`<strong>Federal Tax Setup</strong>

Great news! UKG will automatically set up and manage your federal taxes for you. These are required for all employers and will be configured with the proper rates and deposit schedules.

<strong>UKG will automatically configure these federal taxes:</strong>

<strong>✓ Federal Income Tax (FIT)</strong>
• Employee withholding based on W-4 elections
• Automatically updated for tax table changes
• Payment frequency: Based on your deposit schedule

<strong>✓ FICA - Social Security</strong>
• 6.2% employer match (up to wage base limit)
• 6.2% employee withholding
• 2025 wage base: $176,100

<strong>✓ FICA - Medicare</strong>
• 1.45% employer match (no wage limit)
• 1.45% employee withholding
• Additional 0.9% for high earners (>$200k)

<strong>✓ Federal Unemployment Tax (FUTA)</strong>
• 6.0% on first $7,000 of wages per employee
• Credit reduction may apply in certain states
• Quarterly filing via Form 940

UKG handles all calculations, withholdings, and remittances according to IRS requirements.`, 'ai', [
            { action: 'federal-taxes-look-good', text: 'Looks good - move to next step', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'verify-federal-ein', text: 'How do we verify tax registrations?' },
                { action: 'federal-tax-setup-overview', text: 'What\'s involved in the complete tax setup process?' }
            ]
        });
    }, 1000);

    return true;
}

function acceptAIRecommendation() {
    addMessage('Sounds good, let\'s do it', 'user');

    setTimeout(() => {
        addMessage(`Perfect! Starting with the <strong>Business Impact Strategy</strong>.

<strong>🎯 Your personalized chunking plan:</strong>

<strong>Chunk 1:</strong> High Impact (NY + NJ) - 83 employees, 7 taxes
<strong>Chunk 2:</strong> Medium Impact (MA) - 22 employees, 5 taxes  
<strong>Chunk 3:</strong> Low Impact (NH) - 8 employees, 1 tax
<strong>Chunk 4:</strong> Federal Foundation - All employees, 3 taxes

This approach gets your biggest payroll populations running first, minimizing business risk.

Ready to start with your high-impact chunk?`, 'ai', [
            { action: 'start-high-impact-chunk', text: 'Start with High Impact chunk', buttonType: 'primary' },
            { action: 'show-full-plan', text: 'Show complete plan', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'why-this-order', text: 'Why this specific order?' },
                { action: 'can-modify-plan', text: 'Can I modify this plan?' }
            ]
        });
    }, 1000);

    return true;
}

function continueNextChunk() {
    addMessage('Move to next chunk', 'user');

    setTimeout(() => {
        const currentChunk = taxConfigurationState.currentChunk;

        // Clear current chunk since we're moving to next
        taxConfigurationState.currentChunk = null;

        // Determine next chunk based on what was just completed
        let nextChunkRecommendation = '';
        let availableChunks = [];

        // For jurisdiction-based flow
        if (currentChunk?.name === 'Federal Foundation') {
            nextChunkRecommendation = 'New York (largest state) - 45 employees, 4 taxes';
            availableChunks = [
                { action: 'start-new-york-chunk', text: 'New York', buttonType: 'primary' },
                { action: 'start-new-jersey-chunk', text: 'New Jersey', buttonType: 'secondary' },
                { action: 'start-massachusetts-chunk', text: 'Massachusetts', buttonType: 'secondary' },
                { action: 'start-new-hampshire-chunk', text: 'New Hampshire', buttonType: 'secondary' }
            ];
        } else if (currentChunk?.name === 'New York Jurisdiction') {
            nextChunkRecommendation = 'New Jersey (second largest) - 38 employees, 4 taxes';
            availableChunks = [
                { action: 'start-new-jersey-chunk', text: 'New Jersey', buttonType: 'primary' },
                { action: 'start-massachusetts-chunk', text: 'Massachusetts', buttonType: 'secondary' },
                { action: 'start-new-hampshire-chunk', text: 'New Hampshire', buttonType: 'secondary' }
            ];
        } else if (currentChunk?.name === 'New Jersey Jurisdiction') {
            nextChunkRecommendation = 'Massachusetts - 22 employees, 5 taxes';
            availableChunks = [
                { action: 'start-massachusetts-chunk', text: 'Massachusetts', buttonType: 'primary' },
                { action: 'start-new-hampshire-chunk', text: 'New Hampshire', buttonType: 'secondary' }
            ];
        } else if (currentChunk?.name === 'Massachusetts Jurisdiction') {
            nextChunkRecommendation = 'New Hampshire (final) - 8 employees, 1 tax';
            availableChunks = [
                { action: 'start-new-hampshire-chunk', text: 'New Hampshire (Final)', buttonType: 'primary' }
            ];
        } else {
            // Default case or impact-based flow
            availableChunks = [
                { action: 'start-high-impact-chunk', text: 'High Impact (NY + NJ)', buttonType: 'primary' },
                { action: 'start-medium-impact-chunk', text: 'Medium Impact (MA)', buttonType: 'secondary' },
                { action: 'start-federal-chunk', text: 'Federal Foundation', buttonType: 'secondary' }
            ];
        }

        addMessage(`<strong>🎯 Choose Your Next Jurisdiction</strong>

<strong>Recommended next:</strong> ${nextChunkRecommendation}

<strong>Jurisdiction Progress:</strong>
${getJurisdictionProgress()}

Which jurisdiction would you like to tackle next?`, 'ai', availableChunks, {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-overall-progress', text: 'Show overall progress' },
                { action: 'modify-chunk-order', text: 'Change jurisdiction order' }
            ]
        });
    }, 1000);

    return true;
}

function getJurisdictionProgress() {
    // Mock progress tracking - you can enhance this based on completed chunks
    return `
✅ <strong>Federal:</strong> Complete (3 taxes)
⏳ <strong>New York:</strong> Pending (4 taxes)
⏳ <strong>New Jersey:</strong> Pending (4 taxes)  
⏳ <strong>Massachusetts:</strong> Pending (5 taxes)
⏳ <strong>New Hampshire:</strong> Pending (1 tax)
    `;
}

function completeCurrentChunk() {
    const currentChunk = taxConfigurationState.currentChunk;

    addMessage('Complete current chunk', 'user');

    setTimeout(() => {
        addMessage(`🎉 <strong>${currentChunk?.name || 'Current'} chunk completed!</strong>

<strong>What you accomplished:</strong>
- Configured ${currentChunk?.progress?.total || 'multiple'} taxes
- Set up deposit frequencies  
- Verified account information
- ${currentChunk?.jurisdictions?.length || 1} jurisdiction(s) ready for payroll

<strong>Impact:</strong> ${getTotalEmployeesInChunk(currentChunk)} employees can now be processed correctly.

Ready for the next chunk?`, 'ai', [
            { action: 'continue-next-chunk', text: 'Move to next chunk', buttonType: 'primary' },
            { action: 'review-completed-chunk', text: 'Review what we completed', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-overall-progress', text: 'Show overall progress' },
                { action: 'export-chunk-config', text: 'Export this chunk configuration' }
            ]
        });
    }, 1000);

    return true;
}

function showChunkProgress() {
    addMessage('Show chunk progress', 'user');

    setTimeout(() => {
        const totalTaxes = 14;
        const completedTaxes = 6; // Mock progress
        const progressPercent = Math.round((completedTaxes / totalTaxes) * 100);

        addMessage(`<strong>📊 Overall Chunking Progress</strong>

<strong>Completion Status:</strong>
- Taxes configured: ${completedTaxes}/${totalTaxes} (${progressPercent}%)
- Chunks completed: 1/4
- Employees covered: 83/113 (73%)

<strong>Chunk Status:</strong>
✅ <strong>High Impact:</strong> NY + NJ (Complete)
🔄 <strong>Medium Impact:</strong> Massachusetts (In Progress)  
⏳ <strong>Low Impact:</strong> New Hampshire (Pending)
⏳ <strong>Federal Foundation:</strong> (Pending)

<strong>Next Priority:</strong> Complete Massachusetts chunk (22 employees)`, 'ai', [
            { action: 'continue-next-chunk', text: 'Continue with next chunk', buttonType: 'primary' },
            { action: 'modify-chunk-order', text: 'Change chunk order', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

// ========================================
// CHUNK PROCESSING WORKFLOWS
// ========================================

function startChunkConfiguration() {
    addMessage('Start configuring taxes', 'user');

    // Remove pills
    const allPills = document.querySelectorAll('.suggested-pills');
    allPills.forEach(pills => {
        if (pills.parentNode) {
            pills.parentNode.removeChild(pills);
        }
    });

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk) return;

        // Break chunk into smaller batches (3-4 taxes at a time)
        const batches = createTaxBatches(chunk.taxes);
        chunk.batches = batches;
        chunk.currentBatch = 0;

        // Update panel to show batch processing
        updateTaxPanelContent('batch-processing');

        addMessage(`<strong>🔧 Starting ${chunk.name} Configuration</strong>

I'll guide you through <strong>${chunk.taxes.length} taxes</strong> in manageable batches of 3-4 at a time.

<strong>Batch Approach:</strong>
- <strong>Batch 1:</strong> ${batches[0].map(t => t.name).join(', ')}
- <strong>Batch 2:</strong> ${batches[1] ? batches[1].map(t => t.name).join(', ') : 'Remaining taxes'}

<strong>Smart Features:</strong>
- Pattern recognition for similar taxes
- Bulk operations for efficiency
- Progress tracking throughout

Let's start with the first batch!`, 'ai', [
            { action: 'configure-first-batch', text: 'Configure first batch', buttonType: 'primary' },
            { action: 'show-batch-strategy', text: 'Explain batching strategy', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'why-batch-approach', text: 'Why break into batches?' },
                { action: 'can-change-batches', text: 'Can I change the batching?' },
                { action: 'show-chunk-patterns', text: 'What patterns will you detect?' }
            ]
        });
    }, 1000);

    return true;
}

function startFederalConfiguration() {
    addMessage('Configure federal taxes', 'user');

    // Remove pills
    const allPills = document.querySelectorAll('.suggested-pills');
    allPills.forEach(pills => {
        if (pills.parentNode) {
            pills.parentNode.removeChild(pills);
        }
    });

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk) return;

        // Federal taxes can be handled as one batch (only 3 taxes)
        chunk.currentBatch = 0;
        chunk.batches = [chunk.taxes]; // All federal taxes in one batch

        // Update panel to show federal processing
        updateTaxPanelContent('federal-processing');

        addMessage(`<strong>🏛️ Federal Tax Configuration</strong>

Configuring all 3 federal taxes together since they share common patterns.

<strong>Federal taxes to configure:</strong>
- <strong>Federal Income Tax</strong> - Employee withholding
- <strong>Federal FUTA</strong> - Unemployment (0.6% rate)
- <strong>FICA Employer Match</strong> - Social Security + Medicare

<strong>Smart defaults detected:</strong>
- EIN: Found in Form 941
- Deposit schedule: Based on your payroll size
- Frequencies: Recommended based on liability

Ready to configure these with smart defaults?`, 'ai', [
            { action: 'configure-federal-batch', text: 'Configure with smart defaults', buttonType: 'primary' },
            { action: 'customize-federal-setup', text: 'Customize each tax separately', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-federal-defaults', text: 'How are defaults determined?' },
                { action: 'verify-federal-documents', text: 'Verify document data' },
                { action: 'federal-compliance-info', text: 'What are federal requirements?' }
            ]
        });
    }, 1000);

    return true;
}

function configureNextBatch() {
    addMessage('Configure next batch', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk || !chunk.batches) return;

        chunk.currentBatch++;
        const currentBatch = chunk.batches[chunk.currentBatch];

        if (!currentBatch) {
            // No more batches, chunk is complete
            return completeCurrentChunk();
        }

        // Update panel for next batch
        updateTaxPanelContent('batch-processing');

        addMessage(`<strong>⚡ Batch ${chunk.currentBatch + 1} Configuration</strong>

Moving to the next batch of taxes in your ${chunk.name} chunk.

<strong>This batch includes:</strong>
${currentBatch.map(tax => `• <strong>${tax.name}</strong> - ${tax.employees} employees`).join('\n')}

<strong>Pattern Detection:</strong>
${analyzePatterns(currentBatch)}

Ready to configure this batch?`, 'ai', [
            { action: 'configure-current-batch', text: 'Configure this batch', buttonType: 'primary' },
            { action: 'apply-previous-pattern', text: 'Apply pattern from previous batch', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-batch-patterns', text: 'What patterns were detected?' },
                { action: 'modify-batch-grouping', text: 'Change how taxes are grouped' }
            ]
        });
    }, 1000);

    return true;
}

function applyPatternToSimilar() {
    addMessage('Apply pattern to similar taxes', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const patterns = detectSimilarPatterns(chunk);

        addMessage(`<strong>🔍 Pattern Recognition Applied</strong>

I found similar tax patterns in your chunk:

<strong>Pattern: State Income Taxes</strong>
- NY State Income Tax
- NJ State Income Tax
→ <strong>Similarity:</strong> Both use monthly frequency, variable rates

<strong>Pattern: State Unemployment</strong>
- NY State Unemployment (SUI)
- NJ State Unemployment (SUI)
→ <strong>Similarity:</strong> Both use quarterly frequency, employer-specific rates

<strong>Bulk Operations Available:</strong>
- Apply same deposit frequency to similar taxes
- Use common rate structure where applicable
- Standardize account ID formats

Would you like to apply these patterns?`, 'ai', [
            { action: 'bulk-apply-patterns', text: 'Apply all patterns', buttonType: 'primary' },
            { action: 'selective-pattern-apply', text: 'Choose patterns to apply', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-pattern-logic', text: 'How do you detect patterns?' },
                { action: 'pattern-safety-check', text: 'Are patterns always safe to apply?' }
            ]
        });
    }, 1000);

    return true;
}

function bulkApplyFrequency() {
    addMessage('Apply bulk frequency changes', 'user');

    setTimeout(() => {
        addMessage(`<strong>⚡ Bulk Frequency Assignment</strong>

Applied smart frequency patterns to your taxes:

<strong>Monthly Frequency Applied To:</strong>
- NY State Income Tax
- NJ State Income Tax
→ <strong>Reason:</strong> Standard for state income taxes

<strong>Quarterly Frequency Applied To:</strong>
- NY State Unemployment (SUI)
- NJ State Unemployment (SUI)
→ <strong>Reason:</strong> Standard for unemployment taxes

<strong>Time Saved:</strong> 6 individual configurations → 2 bulk operations

All frequencies can be adjusted individually if needed.`, 'ai', [
            { action: 'continue-chunk-processing', text: 'Continue with configuration', buttonType: 'primary' },
            { action: 'adjust-frequencies', text: 'Adjust specific frequencies', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-frequency-rationale', text: 'Why these frequencies?' },
                { action: 'frequency-change-later', text: 'Can I change frequencies later?' }
            ]
        });
    }, 1000);

    return true;
}

function completeChunkBatch() {
    addMessage('Complete current batch', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk) return;

        // Update progress
        const batchSize = chunk.batches[chunk.currentBatch]?.length || 0;
        chunk.progress.current += batchSize;

        // Update panel to show progress
        updateTaxPanelContent('batch-processing');

        const remainingBatches = chunk.batches.length - (chunk.currentBatch + 1);

        addMessage(`<strong>✅ Batch ${chunk.currentBatch + 1} Completed!</strong>

<strong>Progress Update:</strong>
- Configured: ${chunk.progress.current}/${chunk.progress.total} taxes
- Completion: ${Math.round((chunk.progress.current / chunk.progress.total) * 100)}%
- Remaining batches: ${remainingBatches}

<strong>What was configured:</strong>
${chunk.batches[chunk.currentBatch].map(tax => `• ${tax.name} ✅`).join('\n')}

${remainingBatches > 0 ? 'Ready for the next batch?' : 'Chunk complete! Ready to move to the next chunk?'}`, 'ai', 
        remainingBatches > 0 ? [
            { action: 'configure-next-batch', text: 'Configure next batch', buttonType: 'primary' },
            { action: 'review-current-progress', text: 'Review progress', buttonType: 'secondary' }
        ] : [
            { action: 'complete-chunk', text: 'Complete chunk', buttonType: 'primary' },
            { action: 'review-chunk-summary', text: 'Review chunk summary', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'verify-chunk-progress', text: 'Verify what was configured' },
                { action: 'export-batch-config', text: 'Export batch configuration' }
            ]
        });
    }, 1000);

    return true;
}

// Helper functions for chunk processing
function createTaxBatches(taxes) {
    const batches = [];
    const batchSize = 3; // 3-4 taxes per batch

    for (let i = 0; i < taxes.length; i += batchSize) {
        batches.push(taxes.slice(i, i + batchSize));
    }

    return batches;
}

function analyzePatterns(batch) {
    const patterns = [];

    // Group by tax type
    const incomeTypes = batch.filter(tax => tax.type.includes('income'));
    const unemploymentTypes = batch.filter(tax => tax.type.includes('sui') || tax.type.includes('unemployment'));

    if (incomeTypes.length > 1) {
        patterns.push(`${incomeTypes.length} income taxes detected - can use bulk frequency assignment`);
    }

    if (unemploymentTypes.length > 1) {
        patterns.push(`${unemploymentTypes.length} unemployment taxes detected - typically quarterly frequency`);
    }

    return patterns.length > 0 ? patterns.join('\n') : 'No similar patterns detected in this batch';
}

function detectSimilarPatterns(chunk) {
    // This would contain more sophisticated pattern detection
    return {
        incomeGroups: chunk.taxes.filter(tax => tax.type.includes('income')),
        unemploymentGroups: chunk.taxes.filter(tax => tax.type.includes('sui')),
        disabilityGroups: chunk.taxes.filter(tax => tax.type.includes('sdi') || tax.type.includes('tdi'))
    };
}

// ========================================
// MISSING CHUNK PROCESSING FUNCTIONS
// ========================================

function configureFirstBatch() {
    addMessage('Configure first batch', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk || !chunk.batches) return;

        const firstBatch = chunk.batches[0];
        chunk.currentBatch = 0;

        // Update panel to show current batch
        updateTaxPanelContent('batch-processing');

        addMessage(`<strong>🔧 First Batch Configuration</strong>

Starting with the highest priority taxes in your ${chunk.name} chunk.

<strong>This batch includes:</strong>
${firstBatch.map(tax => `• <strong>${tax.name}</strong> - ${tax.employees} employees`).join('\n')}

<strong>Smart defaults detected:</strong>
- Common patterns across these tax types
- Document-verified data where available
- Recommended frequencies based on business size

Ready to configure this batch?`, 'ai', [
            { action: 'configure-current-batch', text: 'Configure this batch', buttonType: 'primary' },
            { action: 'bulk-apply-patterns', text: 'Apply patterns to similar taxes', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'show-batch-details', text: 'Show detailed tax information' },
                { action: 'modify-batch-grouping', text: 'Modify batch grouping' },
                { action: 'explain-smart-defaults', text: 'How are defaults determined?' }
            ]
        });
    }, 1000);

    return true;
}

function configureFederalBatch() {
    addMessage('Configure with smart defaults', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk) return;

        // Mark federal taxes as configured with smart defaults
        chunk.taxes.forEach(tax => {
            tax.configured = true;
            tax.frequency = getSmartFederalFrequency(tax);
            tax.defaultsApplied = true;
        });

        // Update progress
        chunk.progress.current = chunk.taxes.length;

        addMessage(`<strong>✅ Federal Batch Configured!</strong>

Applied smart defaults to all 3 federal taxes:

<strong>Configuration Applied:</strong>
- <strong>Federal Income Tax:</strong> Semiweekly deposits
- <strong>Federal FUTA:</strong> Quarterly payments  
- <strong>FICA Employer Match:</strong> Semiweekly deposits

<strong>Smart defaults used:</strong>
- EIN: From Form 941 documents
- Deposit schedule: Based on your payroll liability
- Frequencies: IRS-recommended for your business size

Federal foundation is complete!`, 'ai', [
            { action: 'complete-chunk', text: 'Complete federal chunk', buttonType: 'primary' },
            { action: 'customize-federal-setup', text: 'Customize individual taxes', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'verify-federal-config', text: 'Verify configuration details' },
                { action: 'explain-federal-requirements', text: 'Explain federal requirements' }
            ]
        });
    }, 1000);

    return true;
}

function configureCurrentBatch() {
    addMessage('Configure this batch', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        if (!chunk || !chunk.batches) return;

        const currentBatch = chunk.batches[chunk.currentBatch];

        addMessage(`<strong>⚙️ Batch Configuration Workflow</strong>

Configuring ${currentBatch.length} taxes in this batch:

<strong>Configuration Options:</strong>
- Individual setup for each tax
- Bulk operations for similar taxes
- Pattern recognition for efficiency

<strong>Detected Patterns:</strong>
${analyzePatterns(currentBatch)}

How would you like to proceed?`, 'ai', [
            { action: 'bulk-apply-patterns', text: 'Use bulk operations', buttonType: 'primary' },
            { action: 'configure-individually', text: 'Configure individually', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'explain-bulk-operations', text: 'What are bulk operations?' },
                { action: 'show-pattern-details', text: 'Show pattern details' }
            ]
        });
    }, 1000);

    return true;
}

function bulkApplyPatterns() {
    addMessage('Use bulk operations', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const currentBatch = chunk.batches[chunk.currentBatch];
        const patterns = detectTaxPatterns(currentBatch);

        addMessage(`<strong>🚀 Bulk Pattern Application</strong>

Detected patterns for efficient setup:

<strong>Income Tax Pattern:</strong>
${patterns.incomeGroups.length > 0 ? `Apply monthly frequency to ${patterns.incomeGroups.length} income taxes` : 'None detected'}

<strong>Unemployment Pattern:</strong>
${patterns.unemploymentGroups.length > 0 ? `Apply quarterly frequency to ${patterns.unemploymentGroups.length} unemployment taxes` : 'None detected'}

<strong>Bulk Operations Available:</strong>
- Frequency assignment across similar taxes
- Rate application where applicable
- Document reference linking

Apply these patterns?`, 'ai', [
            { action: 'apply-all-patterns', text: 'Apply all patterns', buttonType: 'primary' },
            { action: 'selective-pattern-apply', text: 'Apply selectively', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

function selectivePatternApply() {
    addMessage('Apply selectively', 'user');

    setTimeout(() => {
        addMessage(`<strong>🎯 Selective Pattern Application</strong>

Choose which patterns to apply:

<strong>Available Operations:</strong>
- Monthly frequency → Income taxes only
- Quarterly frequency → Unemployment taxes only
- Bulk document linking → All taxes
- Smart rate detection → Where applicable

You can apply each pattern individually for maximum control.`, 'ai', [
              { action: 'apply-all-patterns', text: 'Apply all patterns', buttonType: 'primary' },
            { action: 'apply-income-pattern', text: 'Apply income tax pattern' },
            { action: 'apply-unemployment-pattern', text: 'Apply unemployment pattern' },
          
            { action: 'apply-document-pattern', text: 'Apply document linking' }
        ]);
    }, 1000);

    return true;
}

// Add these MISSING functions for Step 8:

function applyAllPatterns() {
    addMessage('Apply all patterns', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const currentBatch = chunk.batches[chunk.currentBatch];
        const patterns = detectTaxPatterns(currentBatch);

        // Apply income tax patterns
        if (patterns.incomeGroups.length > 0) {
            patterns.incomeGroups.forEach(tax => {
                tax.frequency = 'monthly';
                tax.configured = true;
                tax.patternApplied = 'income_monthly';
            });
        }

        // Apply unemployment patterns  
        if (patterns.unemploymentGroups.length > 0) {
            patterns.unemploymentGroups.forEach(tax => {
                tax.frequency = 'quarterly';
                tax.configured = true;
                tax.patternApplied = 'unemployment_quarterly';
            });
        }

        // Update progress
        chunk.progress.current += currentBatch.filter(tax => tax.configured).length;

        addMessage(`<strong>✅ All Patterns Applied!</strong>

Applied configurations:
${patterns.incomeGroups.length > 0 ? `• Monthly frequency → ${patterns.incomeGroups.length} income taxes` : ''}
${patterns.unemploymentGroups.length > 0 ? `• Quarterly frequency → ${patterns.unemploymentGroups.length} unemployment taxes` : ''}

Ready to continue?`, 'ai', [
            { action: 'complete-chunk-batch', text: 'Complete this batch', buttonType: 'primary' },
            { action: 'review-current-progress', text: 'Review progress', buttonType: 'secondary' }
        ]);
    }, 1000);

    return true;
}

function applyIncomePattern() {
    addMessage('Apply income tax pattern', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const currentBatch = chunk.batches[chunk.currentBatch];
        const incomeTypes = currentBatch.filter(tax => tax.type?.includes('income'));

        incomeTypes.forEach(tax => {
            tax.frequency = 'monthly';
            tax.configured = true;
            tax.patternApplied = 'income_monthly';
        });

        addMessage(`Applied monthly frequency to ${incomeTypes.length} income taxes. Continue with other patterns?`, 'ai', [
            { action: 'apply-unemployment-pattern', text: 'Apply unemployment pattern' },
            { action: 'complete-chunk-batch', text: 'Complete batch' }
        ]);
    }, 1000);

    return true;
}

function applyUnemploymentPattern() {
    addMessage('Apply unemployment pattern', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const currentBatch = chunk.batches[chunk.currentBatch];
        const unemploymentTypes = currentBatch.filter(tax => tax.type?.includes('sui') || tax.name?.toLowerCase().includes('unemployment'));

        unemploymentTypes.forEach(tax => {
            tax.frequency = 'quarterly';
            tax.configured = true;
            tax.patternApplied = 'unemployment_quarterly';
        });

        addMessage(`Applied quarterly frequency to ${unemploymentTypes.length} unemployment taxes. Batch configuration complete!`, 'ai', [
            { action: 'complete-chunk-batch', text: 'Complete batch', buttonType: 'primary' }
        ]);
    }, 1000);

    return true;
}

function applyDocumentPattern() {
    addMessage('Apply document linking', 'user');

    setTimeout(() => {
        addMessage('Document linking applied to all taxes in this batch. Tax IDs and rates will be auto-populated from uploaded documents.', 'ai', [
            { action: 'complete-chunk-batch', text: 'Complete batch', buttonType: 'primary' }
        ]);
    }, 1000);

    return true;
}

function customizeFederalSetup() {
    addMessage('Customize each tax separately', 'user');

    setTimeout(() => {
        addMessage(`<strong>🎛️ Custom Federal Setup</strong>

Configure each federal tax individually:

<strong>Available for customization:</strong>
1. Federal Income Tax - Employee withholding
2. Federal FUTA - Unemployment (employer)  
3. FICA Employer Match - Social Security + Medicare

<strong>Customization options:</strong>
- Payment frequencies
- Deposit schedules
- Account numbers
- Special requirements

Which tax would you like to configure first?`, 'ai', [
            { action: 'configure-federal-income', text: 'Federal Income Tax' },
            { action: 'configure-federal-futa', text: 'Federal FUTA' },
            { action: 'configure-fica-match', text: 'FICA Employer Match' }
        ]);
    }, 1000);

    return true;
}

function applyPreviousPattern() {
    addMessage('Apply pattern from previous batch', 'user');

    setTimeout(() => {
        addMessage(`<strong>🔄 Pattern Application from Previous Batch</strong>

Detected patterns from your previous batch:
- Monthly frequency applied to 2 income taxes
- Quarterly frequency applied to 1 unemployment tax
- Document verification completed for all

Apply these same patterns to similar taxes in this batch?`, 'ai', [
            { action: 'apply-all-previous', text: 'Apply all previous patterns' },
            { action: 'choose-patterns', text: 'Choose which patterns to apply' }
        ]);
    }, 1000);

    return true;
}

function modifyBatchGrouping() {
    addMessage('Modify batch grouping', 'user');

    setTimeout(() => {
        addMessage(`<strong>📊 Modify Batch Grouping</strong>

Current batching strategy groups taxes by complexity and business impact.

<strong>Alternative grouping options:</strong>
- By jurisdiction (all NY taxes together)
- By tax type (all income taxes together)  
- By frequency (all monthly taxes together)
- Custom grouping

How would you like to regroup the taxes?`, 'ai', [
            { action: 'group-by-jurisdiction', text: 'Group by jurisdiction' },
            { action: 'group-by-type', text: 'Group by tax type' },
            { action: 'custom-grouping', text: 'Create custom groups' }
        ]);
    }, 1000);

    return true;
}

function adjustFrequencies() {
    addMessage('Adjust frequencies', 'user');

    setTimeout(() => {
        addMessage(`<strong>📅 Frequency Adjustment</strong>

Review and adjust deposit frequencies for current batch:

<strong>Current assignments:</strong>
- Income taxes: Monthly (recommended)
- Unemployment taxes: Quarterly (required)
- Disability taxes: Monthly (flexible)

<strong>Available frequencies:</strong>
- Weekly, Biweekly, Semiweekly
- Monthly, Quarterly  
- Annual (where permitted)

Which frequencies would you like to adjust?`, 'ai', [
            { action: 'adjust-income-freq', text: 'Adjust income tax frequencies' },
            { action: 'adjust-unemployment-freq', text: 'Adjust unemployment frequencies' },
            { action: 'bulk-frequency-change', text: 'Bulk frequency adjustment' }
        ]);
    }, 1000);

    return true;
}

function reviewCurrentProgress() {
    addMessage('Review progress', 'user');

    setTimeout(() => {
        const chunk = taxConfigurationState.currentChunk;
        const progress = chunk?.progress || { current: 0, total: 0 };

        addMessage(`<strong>📈 Current Progress Review</strong>

<strong>Chunk Progress:</strong>
- ${chunk?.name || 'Current chunk'}: ${progress.current}/${progress.total} taxes configured
- Completion: ${Math.round((progress.current / progress.total) * 100) || 0}%
- Current batch: ${(chunk?.currentBatch || 0) + 1}/${chunk?.batches?.length || 1}

<strong>What's been configured:</strong>
${chunk?.taxes?.filter(t => t.configured).map(tax => `✅ ${tax.name}`).join('\n') || 'None yet'}

<strong>Remaining in current batch:</strong>
${chunk?.batches?.[chunk.currentBatch]?.filter(t => !t.configured).map(tax => `⏳ ${tax.name}`).join('\n') || 'None'}

Ready to continue?`, 'ai', [
            { action: 'continue-batch', text: 'Continue current batch' },
            { action: 'modify-approach', text: 'Modify approach' }
        ]);
    }, 1000);

    return true;
}

// Helper function for pattern detection
function detectTaxPatterns(taxes) {
    return {
        incomeGroups: taxes.filter(tax => tax.type?.includes('income') || tax.name?.toLowerCase().includes('income')),
        unemploymentGroups: taxes.filter(tax => tax.type?.includes('sui') || tax.name?.toLowerCase().includes('unemployment')),
        disabilityGroups: taxes.filter(tax => tax.type?.includes('sdi') || tax.type?.includes('tdi') || tax.name?.toLowerCase().includes('disability')),
        federalGroups: taxes.filter(tax => tax.type?.includes('federal') || tax.name?.toLowerCase().includes('federal'))
    };
}

// Helper function for smart federal frequency
function getSmartFederalFrequency(tax) {
    if (tax.type?.includes('income') || tax.type?.includes('fica')) {
        return 'semiweekly'; // Large employers typically semiweekly
    }
    if (tax.type?.includes('futa')) {
        return 'quarterly';
    }
    return 'monthly'; // Default
}


// Helper function to calculate total employees in a chunk
function getTotalEmployeesInChunk(chunk) {
    if (!chunk || !chunk.taxes) return 0;

    // Get unique employee count (avoid double counting employees in same state)
    const states = [...new Set(chunk.taxes.map(tax => tax.jurisdiction.split(' ')[0]))];
    let totalEmployees = 0;

    const employeeCounts = {
        'New': 45, // New York
        'New Jersey': 38,
        'Massachusetts': 22,
        'New Hampshire': 8,
        'Federal': 113
    };

    states.forEach(state => {
        totalEmployees += employeeCounts[state] || 0;
    });

    return totalEmployees;
}

// Smart discovery functions - UKG Migration Context
function performSmartTaxDiscovery() {
    taxConfigurationState.step = 2;
    taxConfigurationState.confirmedTaxes = [...taxConfigurationState.extractedTaxes];
    
    // Get welcome flow context if available
    const welcomeData = getWelcomeFlowData();
    const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
    const foundStates = getFoundTaxStates();
    const employeeStates = getEmployeeStatesFromDocuments();
    
    // Debug logging
    console.log('Smart discovery - found tax types:', foundTaxTypes);
    console.log('Welcome data:', welcomeData);
    
    // Migration-focused question logic - check multiple scenarios
    if (welcomeData.employeeCount > 0 && !foundTaxTypes.includes('federal_futa')) {
        console.log('Asking migration question about unemployment taxes');
        askMigrationQuestion('unemployment_taxes');
    } else if (employeeStates.length > foundStates.length) {
        // Business expansion scenario - employees in states without tax setup
        console.log('Asking migration question about business expansion');
        askMigrationQuestion('business_expansion');
    } else {
        // Skip to recommendations if no questions needed
        console.log('No questions needed, generating migration recommendations');
        showMigrationRecommendations();
    }
    
    return true;
}

// New migration-focused question function
function askMigrationQuestion(questionType) {
    let questionText = '';
    let responseActions = [];
    
    switch (questionType) {
        case 'unemployment_taxes':
            questionText = `I found employee payroll but no unemployment tax setup in your documents.

💡 <strong>Why FUTA is needed:</strong>
• You have W-2 employees (from payroll register)
• All W-2 employers must pay federal unemployment insurance
• Rate: 0.6% on first $7,000 per employee annually
• Even if amounts are small, registration is required

❓ <strong>Migration Question:</strong> Did your previous vendor handle federal and state unemployment taxes (FUTA/SUTA), or do you have those tax account details stored separately?`;
            
            responseActions = [
                { action: 'need-new-unemployment-setup', text: 'Need new setup - no previous accounts', buttonType: 'primary' },
                { action: 'have-unemployment-accounts-separately', text: 'I have those accounts separately', buttonType: 'secondary' }
            ];
            break;
            
        case 'multistate_setup':
            const missingStates = getMissingStatesList();
            questionText = `I see you have employees in multiple states, but only found some state tax setups in your documents.

💡 <strong>Why state taxes are needed:</strong>
• Each state requires registration for employees working there
• State income tax withholding is mandatory for resident employees
• State unemployment insurance protects your employees
• Compliance failures result in penalties and interest

❓ <strong>Migration Question:</strong> For your employees in ${missingStates.join(' and ')} - did your previous vendor handle those state taxes, or do you have those registrations stored separately?`;
            
            responseActions = [
                { action: 'previous-vendor-handled-states', text: 'Previous vendor handled missing states' },
                { action: 'have-state-accounts-separately', text: 'I have those state accounts' },
                { action: 'need-new-state-registrations', text: 'Need new state registrations' }
            ];
            break;
            
        case 'employer_taxes':
            questionText = `I can see federal income tax withholding setup, but no employer tax details.

💡 <strong>Why employer taxes are needed:</strong>
• Employers must match employee Social Security contributions (6.2%)
• Employers must match employee Medicare contributions (1.45%)
• These are separate from employee deductions - you pay them on top
• Required whenever you have employee withholding

❓ <strong>Migration Question:</strong> Did your previous vendor automatically handle the employer portion of payroll taxes, or do you have those account details stored separately?`;
            
            responseActions = [
                { action: 'previous-vendor-handled-employer', text: 'Previous vendor handled automatically' },
                { action: 'have-employer-details-separately', text: 'I have employer tax details' },
                { action: 'need-employer-tax-setup', text: 'Need UKG to set this up' }
            ];
            break;
            
        case 'business_expansion':
            const expansionStates = getEmployeeStatesWithoutTaxSetup();
            let stateDetails = '';
            
            // Show specific details for Maine
            if (expansionStates.includes('Maine')) {
                stateDetails = `We noticed you have employees in Portland, Maine, but no Maine tax setup yet.
                
Companies with similar situations typically register as an employer with Maine before running payroll. 
                
For now, we can set up Maine as a tax location and configure it once you get your registration information from the state.
                `;
            } else {
                stateDetails = `I\'ve detected that you currently have employees in ${expansionStates.join(' and ')}, but do not currently have taxes configured for these states.`;
            }
            
            questionText = stateDetails + `\n\n<strong>What's your preferred next step?</strong>`;
            
            // Use tier-2 buttons for Maine tax setup
            responseActions = [
                { action: 'add-maine-taxes', text: 'Set up Maine tax location' },
                { action: 'upload-documents-extraction', text: 'Upload document' }
            ];
            break;
    }
    
    // CRITICAL: ADD question BELOW existing tax display, don't replace the panel content
    addQuestionBelowTaxDisplay(questionText, responseActions);
    
    taxConfigurationState.currentQuestion = questionType;
}

// Helper function to get welcome flow data
function getWelcomeFlowData() {
    return {
        employeeCount: window.welcomeState?.employeeCount || 10,
        employeeStates: window.welcomeState?.employeeStates || ['New Jersey', 'New York'],
        businessType: window.welcomeState?.businessType || 'LLC',
        payrollExperience: window.welcomeState?.payrollExperience || 'new'
    };
}

// Helper function to get states where we found tax registrations
function getFoundTaxStates() {
    const foundStates = [];
    
    // Check configured states in taxConfigurationState
    if (taxConfigurationState.statesTaxes) {
        taxConfigurationState.statesTaxes.forEach(stateTax => {
            if (stateTax.state && !foundStates.includes(stateTax.state)) {
                foundStates.push(stateTax.state);
            }
        });
    }
    
    // Also check extractedTaxes for legacy compatibility
    const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
    if (foundTaxTypes.includes('nj_income') || foundTaxTypes.includes('nj_sui')) {
        if (!foundStates.includes('New Jersey')) foundStates.push('New Jersey');
    }
    if (foundTaxTypes.includes('ny_income') || foundTaxTypes.includes('ny_suta')) {
        if (!foundStates.includes('New York')) foundStates.push('New York');
    }
    
    return foundStates;
}

// Helper function to get employee states from documents
function getEmployeeStatesFromDocuments() {
    // This would typically extract from uploaded documents
    // For now, using welcome flow data
    const welcomeData = getWelcomeFlowData();
    return welcomeData.employeeStates || ['New Jersey', 'New York'];
}

// Helper function to get states with employees but no tax setup
function getEmployeeStatesWithoutTaxSetup() {
    const employeeStates = getEmployeeStatesFromDocuments();
    const foundStates = getFoundTaxStates();
    
    return employeeStates.filter(state => !foundStates.includes(state));
}

// NEW FUNCTION: Add taxes immediately when user confirms need
function addTaxesImmediately(questionType, migrationContext) {
    console.log('Adding taxes immediately for:', questionType);
    const panelContent = document.getElementById('panelContent');
    if (!panelContent) return;
    
    const taxCardsContainer = panelContent.querySelector('.extracted-taxes');
    if (!taxCardsContainer) return;
    
    let taxesToAdd = [];
    let confirmationMessage = '';
    
    // Determine which taxes to add based on the question type
    if (questionType === 'unemployment_taxes' && migrationContext.needsUnemploymentRegistration) {
        taxesToAdd.push({
            name: 'Federal FUTA',
            jurisdiction: 'IRS (Federal Government)',
            type: 'federal_futa',
            migrationNote: 'UKG will establish new deposit schedule and tax reporting.'
        });
        
        // Check if NJ SUI is missing (not likely since we have all NJ taxes in extracted)
        const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
        if (!foundTaxTypes.includes('nj_sui')) {
            taxesToAdd.push({
                name: 'New Jersey SUI',
                jurisdiction: 'New Jersey Department of Labor',
                type: 'nj_sui',
                migrationNote: 'UKG will need your new NJ unemployment account number.'
            });
        }
        
        confirmationMessage = `✅ I\'ve added ${taxesToAdd.length} unemployment tax${taxesToAdd.length > 1 ? 'es' : ''} to your setup.`;
    } else if (questionType === 'business_expansion' && migrationContext.needsNewStateRegistrations) {
        const missingStates = getEmployeeStatesWithoutTaxSetup();
        missingStates.forEach(state => {
            if (state === 'New York') {
                taxesToAdd.push({
                    name: 'New York State Income Tax',
                    jurisdiction: 'New York Department of Revenue',
                    type: 'ny_income',
                    migrationNote: 'Required for NY employees - new registration needed.'
                });
                taxesToAdd.push({
                    name: 'New York SUTA',
                    jurisdiction: 'New York Department of Labor',
                    type: 'ny_suta',
                    migrationNote: 'State unemployment insurance for NY employees.'
                });
            } else if (state === 'Maine') {
                // Add Maine to the statesTaxes configuration
                if (!taxConfigurationState.statesTaxes.find(s => s.state === 'Maine')) {
                    taxConfigurationState.statesTaxes.push({ 
                        state: 'Maine', 
                        employees: 25, 
                        hasIncomeTax: true,
                        incomeTaxId: '', // Empty - not applied yet
                        suiAccountId: '', // Empty - not applied yet
                        suiRate: '',  // Blank - rate pending
                        suiWageBase: '$12,000',
                        pfmlAccountId: '', // Empty - not applied yet
                        competitiveSkillsFundRate: '0.06',
                        unemploymentAdminFundRate: '0.06',
                        sdiRate: 'N/A',
                        newlyAdded: true  // Mark as newly added for visual distinction
                    });
                }
                
                taxesToAdd.push({
                    name: 'Maine State Income Tax',
                    jurisdiction: 'Maine Revenue Services',
                    type: 'me_income',
                    migrationNote: 'Required for ME employees - new registration needed.'
                });
                taxesToAdd.push({
                    name: 'Maine SUTA',
                    jurisdiction: 'Maine Department of Labor',
                    type: 'me_suta',
                    migrationNote: 'State unemployment insurance for ME employees.'
                });
                taxesToAdd.push({
                    name: 'Maine PFML',
                    jurisdiction: 'Maine Department of Labor',
                    type: 'me_pfml',
                    migrationNote: 'Paid Family & Medical Leave for ME employees.'
                });
                taxesToAdd.push({
                    name: 'Maine Competitive Skills Fund',
                    jurisdiction: 'Maine Department of Labor',
                    type: 'me_competitive_skills',
                    migrationNote: 'Competitive Skills Scholarship Fund - 0.06% rate.'
                });
                taxesToAdd.push({
                    name: 'Maine Unemployment Admin Fund',
                    jurisdiction: 'Maine Department of Labor',
                    type: 'me_unemployment_admin',
                    migrationNote: 'Unemployment Program Admin Fund - 0.06% rate.'
                });
            }
        });
        
        confirmationMessage = `✅ I\'ve added ${taxesToAdd.length} state tax${taxesToAdd.length > 1 ? 'es' : ''} for your expansion states.`;
    }
    
    // Get tax details for proper display
    const taxDetails = {
        'federal_futa': { rate: '0.6% on first $7,000', taxId: '', rateType: 'readonly', rateLabel: 'Federal standard rate' },
        'ny_income': { rate: 'Variable (4% - 10.9%)', taxId: '', rateType: 'readonly' },
        'ny_suta': { rate: '4.025% (new employer)', taxId: '', rateType: 'editable', rateLabel: 'Enter your NY SUTA rate' },
        'me_income': { rate: 'Variable', taxId: '', rateType: 'input', rateLabel: 'Withholding Account ID' },
        'me_suta': { rate: '2.75%', taxId: '', rateType: 'editable', rateLabel: 'Enter your ME SUTA rate', wageBase: '$12,000' },
        'me_pfml': { rate: '1.0%', taxId: '', rateType: 'readonly', rateLabel: 'Maine standard rate' },
        'me_competitive_skills': { rate: '0.06%', taxId: '', rateType: 'readonly', rateLabel: 'Maine standard rate' },
        'me_unemployment_admin': { rate: '0.06%', taxId: '', rateType: 'readonly', rateLabel: 'Maine standard rate' }
    };
    
    // For Maine taxes, add them as a consolidated card instead of individual cards
    if (questionType === 'business_expansion' && migrationContext.needsNewStateRegistrations && taxesToAdd.length > 0 && taxesToAdd[0].type.startsWith('me_')) {
        // Maine was already added to statesTaxes above, so just update the panel
        // The Maine card will be automatically displayed as part of the state tax configuration panel
        updateTaxPanelContent('state-tax-configuration');
        
        // Add Maine taxes to confirmed taxes for frequency assignment
        taxesToAdd.forEach(tax => {
            taxConfigurationState.confirmedTaxes.push({
                name: tax.name,
                jurisdiction: tax.jurisdiction,
                type: tax.type,
                confirmed: true,
                newlyAdded: true
            });
        });
    } else {
        // Add other taxes individually (fallback for non-Maine taxes)
        taxesToAdd.reverse().forEach(tax => {
            const details = taxDetails[tax.type] || { rate: 'Variable', taxId: '' };
            const newTaxCard = document.createElement('div');
            newTaxCard.className = 'tax-configuration-card newly-added';
            newTaxCard.style = 'background: #ffffff; border: 2px solid #2e45b7; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(46, 69, 183, 0.15); position: relative; margin-bottom: 16px; transition: all 0.3s ease; animation: fadeInScale 0.5s ease-out;';
            
            newTaxCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${tax.name}</h3>
                    <span class="status-badge" style="background: #2e45b7; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                        Newly Added
                    </span>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                        <span style="color: #666;">Jurisdiction</span>
                        <span style="font-weight: 500; color: #333;">${tax.jurisdiction}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                        <span style="color: #666;">${getTaxIdLabel(tax.type)}</span>
                        <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                            <input type="text" value="${details.taxId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right;" placeholder="Enter ${getTaxIdLabel(tax.type).toLowerCase()}" />
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                        <span style="color: #666;">Tax Rate</span>
                        ${details.rateType === 'editable' ?
                            `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                <input type="text" value="${details.rate}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; text-align: right; font-weight: 500;" placeholder="${details.rateLabel || 'Enter rate'}" />
                                <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                            </div>` :
                        details.rateType === 'readonly' ?
                        `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                            <span style="font-weight: 500; color: #333; padding: 6px; background: #f5f5f5; border-radius: 4px;">
                                ${details.rate}
                            </span>
                            <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                        </div>` :
                        `<span style="font-weight: 500; color: #333;">${details.rate || 'Variable'}</span>`
                    }
                </div>
                
                ${details.wageBase ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                    <span style="color: #666;">Wage Base</span>
                    <span style="font-weight: 500; color: #333;">${details.wageBase}</span>
                </div>
                ` : ''}
                
                ${tax.migrationNote ? `
                    <div style="height: 1px; background: #e0e0e0; margin: 12px 0;"></div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                        <span style="color: #666;">Migration Note</span>
                        <span style="font-weight: 500; color: #333; font-style: italic; text-align: right; max-width: 60%;">${tax.migrationNote}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
            // Insert at the beginning of the container
            taxCardsContainer.insertBefore(newTaxCard, taxCardsContainer.firstChild);
            
            // Add to confirmed taxes
            taxConfigurationState.confirmedTaxes.push({
                name: tax.name,
                jurisdiction: tax.jurisdiction,
                type: tax.type,
                confirmed: true,
                newlyAdded: true
            });
        });
    }
    
    // Show confirmation in chat - DISABLED for Maine expansion as it's handled separately
    // This was causing duplicate messages for Maine tax scenario
    if (confirmationMessage && questionType !== 'business_expansion') {
        addMessage(confirmationMessage, 'ai');
    }
    
    // Regenerate the state tax panel if Maine was added
    if (questionType === 'business_expansion' && taxesToAdd.some(tax => tax.type.startsWith('me_'))) {
        // Force regeneration of the state tax panel to show Maine card
        const panelContent = document.getElementById('panelContent');
        if (panelContent && taxConfigurationState.currentStep === 'state_taxes') {
            panelContent.innerHTML = generateStateTaxConfigurationPanel();
        }
    }
}

// Helper function to get missing states
function getMissingStatesList() {
    const welcomeData = getWelcomeFlowData();
    const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
    const missingStates = [];
    
    if (welcomeData.employeeStates.includes('New York') && !foundTaxTypes.includes('ny_income')) {
        missingStates.push('New York');
    }
    // Add other states as needed
    
    return missingStates.length > 0 ? missingStates : ['other states'];
}

// NEW FUNCTION: Show final migration summary
function showFinalMigrationSummary() {
    const migrationContext = taxConfigurationState.migrationContext || {};
    const newlyAddedTaxes = taxConfigurationState.confirmedTaxes.filter(tax => tax.newlyAdded);
    
    // Remove any existing pills before showing new ones
    console.log('🔧 removeAllPills called - preserving tier-two options');
    const pillsContainers = document.querySelectorAll('.suggested-pills, .suggested-radios, .suggested-checkboxes, .wizard-actions');
    console.log(`Found ${pillsContainers.length} elements with selector: .suggested-pills, .suggested-radios, .suggested-checkboxes, .wizard-actions`);
    pillsContainers.forEach(container => {
        console.log('Removing element:', container);
        container.remove();
    });
    
    // Handle different Maine scenarios
    if (migrationContext.stateHandling === 'have_separate_registrations') {
        // User has Maine registrations already
        addMessage(`<strong>Maine Registration Details Needed</strong>

I understand you already have Maine tax registrations. To complete your UKG setup, you'll need to provide:

<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <strong>Required Maine Tax Information:</strong>
    • Maine withholding account number
    • Maine unemployment insurance account number  
    • Current Maine SUI rate (if known)
    • Maine PFML account details
</div>

You can add these details when configuring deposit schedules, or your implementation specialist can help you enter them later.`, 'ai', [
            { action: 'proceed-to-deposit-schedules', text: 'Continue to deposit schedules', buttonType: 'primary' },
            { action: 'need-help-finding', text: 'Where do I find these numbers?', buttonType: 'secondary' }
        ]);
    } else if (migrationContext.stateHandling === 'remote_employees') {
        // Remote employees scenario
        addMessage(`<strong>Remote Employee Tax Guidance</strong>

For remote employees living in Maine but working for your Massachusetts company:

<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <strong>Important Considerations:</strong>
    • If employees work entirely from Maine, you typically need Maine withholding
    • "Convenience of employer" rules may apply
    • Nexus is generally established with remote employees in a state
    • Consult your tax advisor for specific guidance
</div>

<strong>Recommendation:</strong> Most companies with remote Maine employees do register for Maine taxes to ensure compliance. You can add Maine taxes later if needed after consulting with your tax advisor.`, 'ai', [
            { action: 'proceed-to-deposit-schedules', text: 'Continue without Maine taxes', buttonType: 'primary' },
            { action: 'recently-expanded-to-states', text: 'Actually, let\'s add Maine taxes', buttonType: 'secondary' }
        ]);
    } else if (newlyAddedTaxes.length > 0) {
        // Taxes were added (business expansion scenario)
        const summaryMessage = `Perfect! I\'ve successfully added all necessary taxes for your UKG migration:\n\n${newlyAddedTaxes.map(tax => `✅ ${tax.name}`).join('\n')}\n\nAll newly added taxes are marked with green "NEW" badges in the right panel. Would you like to continue with deposit frequency setup?`;
        
        addMessage(summaryMessage, 'ai', [
            { action: 'assign-frequencies', text: 'Continue to deposit frequencies', buttonType: 'primary' },
            { action: 'modify-tax-types', text: 'Review or modify taxes', buttonType: 'secondary' }
        ]);
    } else {
        // No new taxes were added
        addMessage('Great! Your tax configuration is complete. All necessary taxes were already set up. Would you like to continue?', 'ai', [
            { action: 'assign-frequencies', text: 'Continue to deposit frequencies', buttonType: 'primary' },
            { action: 'modify-tax-types', text: 'Review taxes', buttonType: 'secondary' }
        ]);
    }
}

// NEW FUNCTION: Add question below existing tax cards
function addQuestionBelowTaxDisplay(questionText, responseActions) {
    // CRITICAL: Only add question to conversation - do NOT add to right panel
    // as per the uploaded file requirement
    
    // Add tier two options for all migration questions
    let tierTwoOptions = [];
    
    // Use Maine-specific questions for business expansion scenario
    if (taxConfigurationState.currentQuestion === 'business_expansion') {
        tierTwoOptions = [
            { action: 'register-employer-maine', text: 'How do I register as an employer in Maine?' },
             { action: 'remote-employees', text: 'What if these employees are remote?' },
            { action: 'migration-info-3', text: 'What happens if I do not register before the next payroll?' }
          
        ];
    } else {
        tierTwoOptions = [
            { action: 'migration-info-1', text: 'How do I register as an employer in Maine?' },
            { action: 'migration-info-2', text: 'What if these employees are remote?' },
            { action: 'migration-info-3', text: 'Can I change this later?' }
        ];
    }
    
    // Add conversation message only with two-tier interactive style
    addMessage(questionText, 'ai', responseActions, {
        style: 'two-tier-interactive',
        tierTwoOptions: tierTwoOptions
    });
}

// NEW FUNCTION: Remove question section after user responds
function removeQuestionSection() {
    // No longer needed since questions are only in conversation, not in right panel
    return;
}

// Legacy function - keep for compatibility but redirect to migration version
function askUnemploymentTaxQuestion() {
    askMigrationQuestion('unemployment_taxes');
}

function askMultiStateQuestion() {
    askMigrationQuestion('multistate_setup');
}

function askEmployerTaxQuestion() {
    askMigrationQuestion('employer_taxes');
}

function handleDiscoveryResponse(action) {
    const currentQuestion = taxConfigurationState.currentQuestion;
    let userAnswer = '';
    let migrationContext = taxConfigurationState.migrationContext || {};
    
    // Remove any existing pills before processing the response
    console.log('🔧 removeAllPills called - preserving tier-two options');
    const pillsContainers = document.querySelectorAll('.suggested-pills, .suggested-radios, .suggested-checkboxes, .wizard-actions');
    console.log(`Found ${pillsContainers.length} elements with selector: .suggested-pills, .suggested-radios, .suggested-checkboxes, .wizard-actions`);
    pillsContainers.forEach(container => {
        console.log('Removing element:', container);
        container.remove();
    });
    
    // Process migration-specific responses
    switch (action) {
        // Legacy unemployment responses (keep for compatibility)
        case 'handle-unemployment-myself':
            userAnswer = 'We handle it ourselves';
            taxConfigurationState.needsUnemploymentTax = true;
            break;
        case 'payroll-service-handles':
            userAnswer = 'Payroll service handles this';
            taxConfigurationState.needsUnemploymentTax = false;
            break;
        case 'not-sure-unemployment':
            userAnswer = 'Not sure / need to check';
            taxConfigurationState.needsUnemploymentTax = true;
            break;
            

        case 'have-unemployment-accounts-separately':
            userAnswer = 'I have those accounts separately';
            migrationContext.unemploymentHandling = 'have_accounts';
            migrationContext.needsUnemploymentMigration = true;
            break;
        case 'need-new-unemployment-setup':
            userAnswer = 'Need new setup - no previous accounts';
            migrationContext.unemploymentHandling = 'new_setup';
            migrationContext.needsUnemploymentRegistration = true;
            break;
            
        // Legacy multistate responses
        case 'permanent-multistate':
            userAnswer = 'Permanent employees';
            taxConfigurationState.needsMultiStateTax = true;
            break;
        case 'temporary-multistate':
            userAnswer = 'Temporary/project workers';
            taxConfigurationState.needsMultiStateTax = false;
            break;
        case 'mixed-multistate':
            userAnswer = 'Mix of both';
            taxConfigurationState.needsMultiStateTax = true;
            break;
            
        // New migration-specific state responses
        case 'previous-vendor-handled-states':
            userAnswer = 'Previous vendor handled missing states';
            migrationContext.stateHandling = 'vendor_managed';
            migrationContext.needsStateSetup = true;
            break;
        case 'have-state-accounts-separately':
            userAnswer = 'I have those state accounts';
            migrationContext.stateHandling = 'have_accounts';
            migrationContext.needsStateMigration = true;
            break;
        case 'need-new-state-registrations':
            userAnswer = 'Need new state registrations';
            migrationContext.stateHandling = 'new_setup';
            migrationContext.needsStateRegistration = true;
            break;
            
        // Legacy employer tax responses
        case 'handle-employer-taxes':
            userAnswer = 'Yes, we handle employer taxes';
            taxConfigurationState.needsEmployerTax = true;
            break;
        case 'system-handles-employer':
            userAnswer = 'Our system handles this automatically';
            taxConfigurationState.needsEmployerTax = false;
            break;
        case 'need-help-employer':
            userAnswer = 'Need help understanding this';
            taxConfigurationState.needsEmployerTax = true;
            break;
            
        // New migration-specific employer responses
        case 'previous-vendor-handled-employer':
            userAnswer = 'Previous vendor handled automatically';
            migrationContext.employerTaxHandling = 'vendor_managed';
            migrationContext.needsEmployerSetup = true;
            break;
        case 'have-employer-details-separately':
            userAnswer = 'I have employer tax details';
            migrationContext.employerTaxHandling = 'have_accounts';
            migrationContext.needsEmployerMigration = true;
            break;
        case 'need-employer-tax-setup':
            userAnswer = 'Need UKG to set this up';
            migrationContext.employerTaxHandling = 'new_setup';
            migrationContext.needsEmployerRegistration = true;
            break;
            
        // Business expansion responses (legacy)
        case 'recently-expanded-to-states':
            userAnswer = 'Yes, we recently expanded to these states';
            migrationContext.stateHandling = 'business_expansion';
            migrationContext.needsNewStateRegistrations = true;
            break;
        case 'have-state-registrations-separately':
            userAnswer = 'I have those registrations stored separately';
            migrationContext.stateHandling = 'have_separate_registrations';
            migrationContext.needsStateDocumentUpload = true;
            migrationContext.skipMaineTaxAddition = true; // Don't auto-add Maine taxes
            break;
        case 'employees-work-remotely':
            userAnswer = 'These are remote employees from other states';
            migrationContext.stateHandling = 'remote_employees';
            migrationContext.needsRemoteStateGuidance = true;
            migrationContext.skipMaineTaxAddition = true; // Don't auto-add Maine taxes
            break;
            
        // New Maine-specific expansion responses
        case 'add-maine-taxes':
            userAnswer = '1. Add Maine taxes';
            migrationContext.stateHandling = 'add_maine_taxes';
            migrationContext.needsNewStateRegistrations = true;
            break;
        case 'upload-documents-extraction':
            userAnswer = '2. I will upload the documents for extraction';
            migrationContext.stateHandling = 'upload_documents';
            migrationContext.needsStateDocumentUpload = true;
            migrationContext.skipMaineTaxAddition = true; // Don't auto-add Maine taxes
            break;
        case 'remote-employees-other-states':
            userAnswer = '3. These are remote employees from other states';
            migrationContext.stateHandling = 'remote_employees';
            migrationContext.needsRemoteStateGuidance = true;
            migrationContext.skipMaineTaxAddition = true; // Don't auto-add Maine taxes
            break;
    }
    
    // Store migration context
    taxConfigurationState.migrationContext = migrationContext;
    
    // Don't add user message here - it's already added in sendMessage function
    
    // For migration-specific responses, check if more questions are needed
    if (migrationContext && Object.keys(migrationContext).length > 0) {
        console.log('Migration context detected:', migrationContext);
        // Remove question section
        removeQuestionSection();
        
        // Check what questions still need to be asked
        const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
        const foundStates = getFoundTaxStates();
        const employeeStates = getEmployeeStatesFromDocuments();
        
        // If user needs new setup, add taxes immediately
        if (migrationContext.needsUnemploymentRegistration || migrationContext.needsNewStateRegistrations || migrationContext.needsEmployerRegistration) {
            // Add the relevant taxes immediately
            addTaxesImmediately(currentQuestion, migrationContext);
        }
        
        // Determine next question based on what's still missing
        setTimeout(() => {
            if (currentQuestion === 'unemployment_taxes' && employeeStates.length > foundStates.length) {
                // After unemployment question, ask about missing states
                console.log('Asking business expansion question next');
                askMigrationQuestion('business_expansion');
            } else if (currentQuestion === 'business_expansion' && false) {
                // Removed employer tax question - not needed for UKG migration
            } else {
                // All questions answered
                console.log('All questions answered');
                // For business expansion with Maine, show confirmation then go to deposit frequencies
                if ((migrationContext.stateHandling === 'business_expansion' || migrationContext.stateHandling === 'add_maine_taxes') && migrationContext.needsNewStateRegistrations) {
                    // Show confirmation message with Maine taxes
                    console.log('Showing Maine expansion confirmation message - v2');
                    const confirmMsg = ` Got it! We've set up Maine as a tax location for your employees. You will need to return with your tax ID and rate information to complete the tax configuration for Maine. 

<strong>Does this work for you??</strong>`;
                    console.log('Message being added:', confirmMsg);
                    addMessage(confirmMsg, 'assistant', [
                        { action: 'confirm-maine-taxes', text: 'Yes, continue with this setup', buttonType: 'primary' },
                        { action: 'remove-maine-taxes', text: 'No, remove Maine setup', buttonType: 'secondary' }
                    ], {
                        style: 'two-tier-interactive',
                        tierTwoOptions: [
                            { action: 'register-employer-maine', text: 'How do I register as an employer in Maine?' },
                            { action: 'remote-employees', text: 'Can I change this later?' },
                            { action: 'can-change-later', text: 'Can I change this later?' }
                        ]
                    });
                } else {
                    // Other scenarios show the summary
                    showFinalMigrationSummary();
                }
            }
        }, 1000);
    } else {
        // Legacy flow - check if more questions are needed
        const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
        
        if (currentQuestion === 'unemployment_handling' && foundTaxTypes.includes('federal_income') && !foundTaxTypes.includes('fica_employer')) {
            setTimeout(() => askEmployerTaxQuestion(), 1000);
        } else if (currentQuestion === 'unemployment_handling' && taxConfigurationState.businessProfile.employeeLocations.length > 1 && !foundTaxTypes.includes('ny_income')) {
            setTimeout(() => askMultiStateQuestion(), 1000);
        } else {
            // All questions answered, generate recommendations
            setTimeout(() => generateSmartRecommendations(), 1000);
        }
    }
    
    return true;
}

// NEW FUNCTION: Add recommendations below existing tax display
function addMigrationRecommendationsBelowTaxDisplay() {
    console.log('addMigrationRecommendationsBelowTaxDisplay called');
    const panelContent = document.getElementById('panelContent');
    if (!panelContent) {
        console.error('Panel content not found');
        return;
    }
    
    const migrationContext = taxConfigurationState.migrationContext;
    console.log('Migration context in add function:', migrationContext);
    
    // Build recommendations based on migration context
    const recommendations = buildMigrationRecommendations(migrationContext);
    console.log('Built recommendations:', recommendations);
    
    // For "need new setup" - directly add the new taxes to the existing display
    if (migrationContext.needsUnemploymentRegistration || migrationContext.needsNewStateRegistrations) {
        console.log('Direct add mode activated');
        // Find the existing tax cards container
        const taxCardsContainer = panelContent.querySelector('.extracted-taxes');
        console.log('Looking for tax cards container:', taxCardsContainer);
        
        if (taxCardsContainer && recommendations.toAdd.length > 0) {
            console.log('Adding new tax cards...');
            // Add new tax cards with special styling to indicate they're newly added
            recommendations.toAdd.forEach(rec => {
                console.log('Adding tax card for:', rec.name);
                const newTaxCard = document.createElement('div');
                newTaxCard.className = 'tax-card confirmed newly-added';
                newTaxCard.innerHTML = `
                    <div class="new-badge">NEW</div>
                    <h4>${rec.name}</h4>
                    <p>→ ${rec.jurisdiction}</p>
                    <span class="status">✅ Newly Added for UKG Setup</span>
                    <div class="migration-note" style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        📋 ${rec.migrationNote}
                    </div>
                `;
                
                // Add animation class for visual feedback
                newTaxCard.style.animation = 'fadeInScale 0.5s ease-out';
                taxCardsContainer.appendChild(newTaxCard);
                console.log('Tax card appended');
                
                // Also add to confirmedTaxes array
                taxConfigurationState.confirmedTaxes.push({
                    name: rec.name,
                    jurisdiction: rec.jurisdiction,
                    type: rec.type,
                    confirmed: true,
                    newlyAdded: true
                });
            });
            
            // Show success message
            addMessage(`Great! I\'ve added ${recommendations.toAdd.length} new tax${recommendations.toAdd.length > 1 ? 'es' : ''} to your UKG setup:\n\n${recommendations.toAdd.map(tax => `✅ ${tax.name}`).join('\n')}\n\nThese have been marked as "Newly Added" in the right panel. Would you like to continue with the setup?`, 'ai', [
                { action: 'assign-frequencies', text: 'Continue to deposit frequencies', buttonType: 'primary' },
                { action: 'modify-tax-types', text: 'Review or modify taxes', buttonType: 'secondary' }
            ], {
                style: 'two-tier-interactive',
                tierTwoOptions: [
                    { action: 'tax-info-1', text: 'What are deposit frequencies?' },
                    { action: 'tax-info-2', text: 'Can I change this later?' },
                    { action: 'migration-info-1', text: 'Tell me about UKG migration' }
                ]
            });
        }
    } else {
        // For other scenarios, show recommendations below
        const recommendationsSection = document.createElement('div');
        recommendationsSection.className = 'migration-recommendations-section';
        
        let recommendationsHTML = `
            <div class="migration-recommendations-card">
                <h4>🎯 UKG Migration Recommendations</h4>
                <p class="migration-context">Based on your previous vendor setup, here's what UKG needs to configure:</p>
        `;
        
        // Add recommended taxes
        if (recommendations.toAdd.length > 0) {
            recommendationsHTML += `
                <div class="recommendations-add">
                    <h5>✅ Taxes to Set Up with UKG</h5>
            `;
            
            recommendations.toAdd.forEach(rec => {
                recommendationsHTML += `
                    <div class="recommendation-item add">
                        <div class="rec-header">
                            <strong>${rec.name}</strong>
                            <span class="rec-jurisdiction">→ ${rec.jurisdiction}</span>
                        </div>
                        <div class="rec-reason">💡 <strong>Why needed:</strong> ${rec.reason}</div>
                        <div class="rec-details">📋 <strong>Migration note:</strong> ${rec.migrationNote}</div>
                    </div>
                `;
            });
            
            recommendationsHTML += `</div>`;
        }
        
        recommendationsHTML += `
                <div class="recommendation-actions">
                    <button class="pill-btn primary" onclick="handlePillClick('add-migration-recommendations')">Add Recommended Taxes to UKG Setup</button>
                    <button class="pill-btn secondary" onclick="handlePillClick('review-migration-recommendations')">Let me review each one</button>
                </div>
            </div>
        `;
        
        recommendationsSection.innerHTML = recommendationsHTML;
        panelContent.appendChild(recommendationsSection);
        
        // Add conversation message
        const messageText = generateMigrationRecommendationMessage(recommendations);
        addMessage(messageText, 'ai', [
            { action: 'add-migration-recommendations', text: 'Add recommended taxes to UKG' },
            { action: 'review-migration-recommendations', text: 'Let me review each one' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'migration-info-1', text: 'How are taxes transferred?' },
                { action: 'migration-info-2', text: 'Why these specific taxes?' },
                { action: 'migration-info-3', text: 'What about my existing setup?' }
            ]
        });
    }
}

// NEW FUNCTION: Build migration-specific recommendations
function buildMigrationRecommendations(migrationContext) {
    const toAdd = [];
    const toSkip = [];
    
    if (migrationContext.needsUnemploymentRegistration) {
        toAdd.push({
            name: 'Federal FUTA',
            jurisdiction: 'IRS (Federal Government)',
            reason: 'Your previous vendor handled this, but UKG needs to set up direct deposits and reporting.',
            migrationNote: 'UKG will establish new deposit schedule and tax reporting. You may need to coordinate final payments with previous vendor.',
            type: 'federal_futa'
        });
        
        // Only add KY SUTA if not already in extracted taxes
        const foundTaxTypes = taxConfigurationState.extractedTaxes.map(tax => tax.type);
        if (!foundTaxTypes.includes('nj_sui')) {
            toAdd.push({
                name: 'New Jersey SUI',
                jurisdiction: 'New Jersey Department of Labor',
                reason: 'State unemployment insurance for your New Jersey employees.',
                migrationNote: 'UKG will need your existing NJ unemployment account number to continue seamless operations.',
                type: 'nj_sui'
            });
        }
    }
    
    if (migrationContext.needsStateSetup) {
        const missingStates = getMissingStatesList();
        missingStates.forEach(state => {
            toAdd.push({
                name: `${state} State Income Tax`,
                jurisdiction: `${state} Department of Revenue`,
                reason: 'Your previous vendor managed these states, but UKG needs direct access to file and deposit.',
                migrationNote: 'UKG will need your existing state tax account numbers to continue seamless operations.',
                type: `${state.toLowerCase()}_income`
            });
        });
    }
    
    if (migrationContext.needsNewStateRegistrations) {
        const expansionStates = getEmployeeStatesWithoutTaxSetup();
        expansionStates.forEach(state => {
            toAdd.push({
                name: `${state} State Income Tax`,
                jurisdiction: `${state} Department of Revenue`,
                reason: 'Business expansion requires new state registration for employees working in this state.',
                migrationNote: 'UKG will help you register as a new employer in this state. This process typically takes 2-4 weeks.',
                type: `${state.toLowerCase()}_income`
            });
            
            toAdd.push({
                name: `${state} State Unemployment (SUTA)`,
                jurisdiction: `${state} Department of Labor`,
                reason: 'Required for all employers with employees working in the state.',
                migrationNote: 'New employer rates apply. UKG will handle the registration and rate determination process.',
                type: `${state.toLowerCase()}_suta`
            });
        });
    }
    
    if (migrationContext.needsRemoteStateGuidance) {
        toAdd.push({
            name: 'Remote Employee State Registrations',
            jurisdiction: 'Various State Departments',
            reason: 'Remote employees trigger nexus requirements in their work states.',
            migrationNote: 'UKG will evaluate each remote employee location and register in states where required based on state-specific thresholds.',
            type: 'remote_state_setup'
        });
    }
    
    if (migrationContext.needsEmployerSetup) {
        toAdd.push({
            name: 'FICA Employer Match',
            jurisdiction: 'IRS (Federal Government)',
            reason: 'Required employer contribution matching employee Social Security and Medicare withholdings.',
            migrationNote: 'UKG will automatically calculate and deposit the 7.65% employer match with your federal tax deposits.',
            type: 'fica_employer'
        });
    }
    
    if (migrationContext.unemploymentHandling === 'have_accounts') {
        toSkip.push({
            name: 'New Unemployment Registration',
            reason: 'You already have unemployment tax accounts - UKG will use your existing registrations instead of creating new ones.'
        });
    }
    
    // Store recommendations in state
    taxConfigurationState.recommendations = toAdd;
    taxConfigurationState.skippedTaxes = toSkip;
    
    return { toAdd, toSkip };
}

// NEW FUNCTION: Generate migration recommendation message
function generateMigrationRecommendationMessage(recommendations) {
    let message = '🎯 <strong>UKG Migration Analysis Complete!</strong>\n\n';
    
    if (recommendations.toAdd.length > 0) {
        message += `Based on your previous vendor setup, I recommend adding <strong>${recommendations.toAdd.length} tax types</strong> to your UKG configuration:\n\n`;
        
        recommendations.toAdd.forEach(rec => {
            message += `• <strong>${rec.name}</strong> → ${rec.jurisdiction}\n`;
        });
    }
    
    if (recommendations.toSkip.length > 0) {
        message += `\n<strong>Good news:</strong> ${recommendations.toSkip.length} items don\'t need setup because:\n`;
        recommendations.toSkip.forEach(skip => {
            message += `• ${skip.reason}\n`;
        });
    }
    
    message += '\n<strong>Next Step:</strong> Review the recommendations in the panel, then we\'ll configure deposit frequencies for each tax.';
    
    return message;
}

// NEW FUNCTION: Show migration recommendations (called when no questions needed)
function showMigrationRecommendations() {
    // Build default migration context if none exists
    const migrationContext = {
        needsUnemploymentSetup: true,
        needsEmployerSetup: true,
        unemploymentHandling: 'vendor_managed'
    };
    
    taxConfigurationState.migrationContext = migrationContext;
    
    // Show recommendations
    addMigrationRecommendationsBelowTaxDisplay();
}

function generateSmartRecommendations() {
    taxConfigurationState.step = 3;
    updateTaxPanelContent('smart-recommendations');
    
    const recommendations = [];
    const skipped = [];
    
    // Build recommendations based on discovery answers
    if (taxConfigurationState.needsUnemploymentTax) {
        recommendations.push({
            name: 'Federal FUTA',
            jurisdiction: 'IRS (Federal Government)',
            reason: 'Since you handle unemployment taxes yourself and have W-2 employees, federal unemployment insurance is required by law.',
            details: '0.6% rate on first $7,000 per employee annually, quarterly deposits',
            type: 'federal_futa'
        });
    } else if (taxConfigurationState.needsUnemploymentTax === false) {
        skipped.push({
            name: 'Federal FUTA',
            reason: 'Your payroll service handles this, so no separate setup needed.'
        });
    }
    
    if (taxConfigurationState.needsEmployerTax) {
        recommendations.push({
            name: 'FICA Employer Match',
            jurisdiction: 'IRS (Federal Government)',
            reason: 'Required employer contribution matching employee Social Security (6.2%) and Medicare (1.45%) withholdings.',
            details: 'Combined 7.65% employer match, same deposit schedule as federal income tax',
            type: 'fica_employer'
        });
    } else if (taxConfigurationState.needsEmployerTax === false) {
        skipped.push({
            name: 'FICA Employer Match',
            reason: 'Your system handles this automatically, no separate configuration needed.'
        });
    }
    
    if (taxConfigurationState.needsMultiStateTax) {
        recommendations.push({
            name: 'New York State Income Tax',
            jurisdiction: 'NY Department of Taxation',
            reason: 'Your NY employees are permanent staff, so NY income tax withholding is required for all NY-based work.',
            details: 'Variable rate based on employee elections, typically semiweekly deposits',
            type: 'ny_income'
        });
        
        recommendations.push({
            name: 'New York SUTA',
            jurisdiction: 'NY Department of Labor',
            reason: 'Required unemployment insurance for your NY employees.',
            details: 'New employer rate typically 4.025%, quarterly deposits',
            type: 'ny_suta'
        });
    } else if (taxConfigurationState.needsMultiStateTax === false) {
        skipped.push({
            name: 'New York State Taxes',
            reason: 'Temporary/project workers may not require NY tax registration depending on duration and nature of work.'
        });
    }
    
    // Store recommendations for later use
    taxConfigurationState.recommendations = recommendations;
    taxConfigurationState.skippedTaxes = skipped;
    
    // Build message
    let messageText = 'Thanks for clarifying! Based on your answers, here\'s what I recommend:\n\n';
    
    if (recommendations.length > 0) {
        messageText += '🎯 <strong>RECOMMENDED ADDITIONS:</strong>\n\n';
        recommendations.forEach(rec => {
            messageText += `✅ <strong>${rec.name}</strong>\n→ ${rec.jurisdiction}\n💡 Why you need this: ${rec.reason}\n📋 Details: ${rec.details}\n\n`;
        });
    }
    
    if (skipped.length > 0) {
        messageText += '❌ <strong>NOT NEEDED:</strong>\n\n';
        skipped.forEach(skip => {
            messageText += `${skip.name}\n💡 Why skipping: ${skip.reason}\n\n`;
        });
    }
    
    if (recommendations.length === 0) {
        messageText = 'Great news! Based on your answers, you don\'t need any additional taxes beyond what\'s already in your documents.\n\nYour current tax setup appears complete for your business needs.';
    }
    
    messageText += '\nShould I add the recommended taxes to your configuration?';
    
    addMessage(messageText, 'ai', [
        { action: 'add-recommended-taxes', text: 'Yes, add recommended taxes', buttonType: 'primary' },
        { action: 'review-recommendations', text: 'Let me review each one', buttonType: 'secondary' },
        { action: 'skip-recommendations', text: 'Skip for now', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'tax-info-1', text: 'How do these taxes work?' },
            { action: 'tax-info-2', text: 'Can I change this later?' },
            { action: 'tax-info-3', text: 'What happens if I skip?' }
        ]
    });
    
    return true;
}

// NEW FUNCTION: Assign coworker to tax configuration
function assignCoworkerToTax() {
    addMessage('Assign to coworker', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📧 Assign Tax Configuration to Coworker</strong>

I'll help you delegate this section. Who would you like to assign this to?

<strong>What they'll need to complete:</strong>
• Verify federal tax registrations
• Set up state tax configurations  
• Configure deposit frequencies
• Input tax account numbers

<strong>Time estimate:</strong> 15-20 minutes

Enter their email address and I\'ll send them an invitation with instructions.`, 'ai', [
            { action: 'send-tax-invite', text: 'Send invitation', buttonType: 'primary' },
            { action: 'continue-myself', text: 'I\'ll continue myself', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'what-access-needed', text: 'What access will they need?' },
                { action: 'can-multiple-work', text: 'Can multiple people work on this?' },
                { action: 'track-progress', text: 'How do I track their progress?' }
            ]
        });
    }, 1000);
    
    return true;
}

// NEW FUNCTION: Work on other configurations
function workOnOtherConfigurations() {
    addMessage('Work on other configurations', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📋 Other Configuration Options</strong>

You can work on these other sections while tax configuration is pending:

<strong>Available now:</strong>
• ✅ Earning Codes Configuration - Define pay types and rates
• ✅ Deduction Setup - Configure benefits and deductions
• ✅ Pay Schedule Configuration - Set up pay frequencies
• ✅ Employee Import - Prepare employee data

<strong>Requires tax setup first:</strong>
• 🔒 Tax Withholding Rules
• 🔒 Compliance Reports
• 🔒 Year-end Forms

Which section would you like to work on?`, 'ai', [
            { action: 'configure-earning-codes', text: 'Earning Codes', buttonType: 'primary' },
            { action: 'configure-deductions', text: 'Deductions', buttonType: 'secondary' },
            { action: 'configure-pay-schedules', text: 'Pay Schedules', buttonType: 'secondary' },
            { action: 'import-employees', text: 'Employee Import', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'whats-most-important', text: 'What\'s most important to complete first?' },
                { action: 'can-parallel-work', text: 'Can I work on multiple sections at once?' },
                { action: 'save-tax-progress', text: 'Will my tax progress be saved?' }
            ]
        });
    }, 1000);
    
    return true;
}

// NEW FUNCTION: Add migration recommendations
function addMigrationRecommendations() {
    // Get recommendations from state
    const recommendations = taxConfigurationState.recommendations || [];
    
    // Add recommended taxes to confirmed taxes
    recommendations.forEach(rec => {
        taxConfigurationState.confirmedTaxes.push({
            name: rec.name,
            jurisdiction: rec.jurisdiction,
            type: rec.type,
            confirmed: true,
            source: 'migration_recommendation'
        });
    });
    
    // Remove recommendation sections
    const recommendationsSection = document.querySelector('.migration-recommendations-section');
    if (recommendationsSection) {
        recommendationsSection.remove();
    }
    
    addMessage('Great! I\'ve added all recommended taxes to your UKG configuration.', 'user');
    
    // Proceed to frequency assignment
    setTimeout(() => {
        showFrequencyAssignment();
    }, 1000);
    
    return true;
}

// NEW FUNCTION: Review migration recommendations one by one
function reviewMigrationRecommendations() {
    addMessage('Let me review each one', 'user');
    
    // For now, just add all recommendations (can be expanded later for individual review)
    setTimeout(() => {
        addMessage('Let\'s review each recommended tax. For this migration to UKG, all the recommended taxes are essential for proper payroll processing. Would you like to add them all or modify the list?', 'ai', [
            { action: 'add-migration-recommendations', text: 'Add all recommended taxes', buttonType: 'primary' },
            { action: 'modify-migration-list', text: 'Let me modify the list', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'migration-info-1', text: 'Why are these essential?' },
                { action: 'migration-info-2', text: 'What if I skip some?' },
                { action: 'tax-info-1', text: 'Tell me about each tax' }
            ]
        });
    }, 1000);
    
    return true;
}

function addRecommendedTaxes() {
    // Add recommendations to confirmed taxes
    taxConfigurationState.confirmedTaxes = [
        ...taxConfigurationState.confirmedTaxes,
        ...taxConfigurationState.recommendations
    ];
    
    // Move to frequency assignment
    showFrequencyAssignment();
    return true;
}

function reviewRecommendations() {
    addMessage('Let\'s review each recommended tax in detail. Which one would you like to learn more about?', 'ai', 
        taxConfigurationState.recommendations.map(rec => ({
            action: `learn-more-${rec.type}`,
            text: `Learn about ${rec.name}`,
            buttonType: 'secondary'
        })), {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'tax-info-1', text: 'Why do I need these?' },
                { action: 'migration-info-1', text: 'How does this affect my payroll?' },
                { action: 'tax-info-2', text: 'Can I skip some?' }
            ]
        }
    );
    return true;
}

function skipRecommendations() {
    addMessage('No problem! You can always add these taxes later if needed.\n\nLet\'s continue with setting up deposit frequencies for your confirmed taxes.', 'ai', [], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'tax-info-1', text: 'What are deposit frequencies?' },
            { action: 'tax-info-2', text: 'Can I add taxes later?' }
        ]
    });
    
    setTimeout(() => showFrequencyAssignment(), 1500);
    return true;
}

function detectAndAddMissingTaxes() {
    // Add all required taxes to confirmed list
    taxConfigurationState.confirmedTaxTypes.push(
        {
            name: 'Federal FUTA',
            jurisdiction: 'IRS (Federal Government)',
            type: 'federal',
            confirmed: true,
            added: true
        },
        {
            name: 'FICA Employer Match',
            jurisdiction: 'IRS (Federal Government)',
            type: 'federal',
            confirmed: true,
            added: true
        }
    );
    
    taxConfigurationState.step = 3;
    
    // Step 3: Frequency assignment
    updateTaxPanelContent('frequency-assignment');
    
    addMessage('Perfect! Missing required taxes have been added to your configuration.\n\n<strong>COMPLETE TAX LIST:</strong>\n• Federal Income Tax\n• Federal FUTA\n• FICA Employer Match\n• New Jersey State Income Tax\n• New Jersey SUI\n• New Jersey SDI\n• New Jersey FLI\n• New Jersey SWF\n\nNow let\'s determine <strong>when</strong> you pay each tax. I\'ve estimated the deposit frequencies based on your business size:\n\n<strong>DEPOSIT SCHEDULE:</strong>\nReview the frequencies below - you can adjust any that look incorrect.', 'ai', [
        { action: 'assign-frequencies', text: 'Frequencies look good', buttonType: 'primary' },
        { action: 'modify-frequencies', text: 'I need to change some', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'tax-info-1', text: 'What are deposit frequencies?' },
            { action: 'tax-info-2', text: 'How do I know which frequency?' },
            { action: 'tax-info-3', text: 'Can I change this later?' }
        ]
    });
    
    return true;
}

function addSpecificTax(taxType) {
    let taxName = '';
    switch (taxType) {
        case 'federal-futa':
            taxName = 'Federal FUTA';
            break;
        case 'fica-match':
            taxName = 'FICA Employer Match';
            break;
        case 'ny-sit':
            taxName = 'New York State Income Tax';
            break;
    }
    
    addMessage(`Added ${taxName} to your tax configuration.`, 'ai', [
        { action: 'add-missing-taxes', text: 'Continue with setup' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'tax-info-1', text: 'Tell me about this tax' },
            { action: 'tax-info-2', text: 'Why is this required?' }
        ]
    });
    return true;
}

function reviewMissingTaxes() {
    addMessage('Let\'s review each missing tax:\n\n<strong>Federal FUTA</strong> - Required for all employers who pay wages of $1,500+ in any quarter or have 1+ employees for 20+ weeks.\n\n<strong>FICA Employer Match</strong> - Required employer contribution matching employee Social Security (6.2%) and Medicare (1.45%) withholdings.\n\n<strong>New York SIT</strong> - Since you have employees in NY, you need to withhold NY state income tax.\n\nShould I add these to your configuration?', 'ai', [
        { action: 'add-missing-taxes', text: 'Yes, add all of them' },
        { action: 'selective-tax-addition', text: 'Let me choose which ones' }
    ]);
    return true;
}

function showFrequencyAssignment() {
    console.log('showFrequencyAssignment called');
    
    // Add user reply bubble first - use the actual button text
    addMessage('Yes, setup this framework', 'user');
    
    taxConfigurationState.step = 4;
    
    // Prepare all confirmed taxes for frequency assignment
    const allTaxes = taxConfigurationState.confirmedTaxes || [];
    console.log('All confirmed taxes:', allTaxes);
    
    // Assign default frequencies based on tax type and business size
    allTaxes.forEach(tax => {
        switch (tax.type) {
            case 'federal_income':
            case 'fica_employer':
                tax.frequency = 'semiweekly';
                tax.frequencySource = '🤖 (estimated based on business size)';
                break;
            case 'federal_futa':
            case 'nj_sui':
            case 'ny_suta':
                tax.frequency = 'quarterly';
                tax.frequencySource = '🤖 (typical for unemployment taxes)';
                break;
            case 'me_suta':
                tax.frequency = 'semiweekly';
                tax.frequencySource = '🤖 (Maine SUTA requirement)';
                break;
            case 'nj_income':
            case 'ny_income':
            case 'me_income':
            case 'ma_income':
                tax.frequency = 'monthly';
                tax.frequencySource = '🤖 (common for state income taxes)';
                break;
            case 'me_pfml':
            case 'ma_pfml':
                tax.frequency = 'quarterly';
                tax.frequencySource = '🤖 (typical for PFML taxes)';
                break;
            case 'me_competitive_skills':
            case 'me_unemployment_admin':
                tax.frequency = 'quarterly';
                tax.frequencySource = '🤖 (Maine surcharge taxes)';
                break;
            default:
                tax.frequency = 'monthly';
                tax.frequencySource = '🤖 (default recommendation)';
        }
    });
    
    // Update the panel to show frequency assignment
    updateTaxPanelContent('frequency-assignment');
    
    // Clear any existing messages first
    removeAllPills();
    
    // Add the frequency confirmation message with 2-tier style
    setTimeout(() => {
        addMessage(`Now let's confirm your deposit frequencies for Massachusetts and Maine. You can adjust these frequencies using the dropdowns. 

<strong>Do the deposit frequencies look right?</strong>`, 'ai', [
            { action: 'collect-tax-details', text: 'Frequencies look good', buttonType: 'primary' },
            { action: 'modify-frequencies', text: 'I\'ll check with my coworker', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'frequency-help-1', text: 'What determines deposit frequency?' },
                { action: 'frequency-help-2', text: 'Can I change these later?' }
            ]
        });
    }, 500);
    
    return true;
}

function modifyFrequencies() {
    addMessage('Which deposit frequency would you like to change?', 'ai', [
        { action: 'change-federal-freq', text: 'Federal taxes frequency' },
        { action: 'change-state-freq', text: 'New Jersey taxes frequency' },
        { action: 'assign-frequencies', text: 'Actually, they look correct' }
    ]);
    return true;
}

// Frequency help handlers
function showFrequencyHelp1() {
    addMessage('What determines deposit frequency?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Deposit frequency is determined by:</strong>

• <strong>Tax liability amount:</strong> Higher payroll amounts often require more frequent payments
• <strong>State requirements:</strong> Each state sets minimum frequency rules
• <strong>Business size:</strong> Larger employers typically pay more frequently
• <strong>Tax type:</strong> Income taxes are usually paid more often than unemployment taxes

<strong>Common frequencies:</strong>
• <strong>Monthly:</strong> Most common for state income taxes
• <strong>Quarterly:</strong> Typical for unemployment and surcharge taxes
• <strong>Semi-weekly:</strong> Required for larger federal tax deposits

The frequencies shown are based on typical requirements for your business size and location.`, 'ai', [
            { action: 'collect-tax-details', text: 'Got it, continue', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showFrequencyHelp2() {
    addMessage('Can I change these later?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Yes, you can change deposit frequencies later!</strong>

• <strong>In UKG:</strong> Go to Company Settings > Tax Setup > Payment Schedules
• <strong>When to change:</strong> If your tax liability increases/decreases significantly
• <strong>Notifications:</strong> Tax agencies will notify you if frequency needs to change

<strong>Important:</strong> Some changes happen automatically:
• Federal taxes adjust based on accumulated liability
• States may reassign frequencies annually
• New businesses often start monthly, then adjust

For now, the recommended frequencies will work perfectly for your initial setup.`, 'ai', [
            { action: 'collect-tax-details', text: 'Perfect, continue', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function generateTaxMappingTable() {
    // Check if Maine taxes are included
    const hasMaineTaxes = taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded);
    
    // Build Maine tax rows if needed
    const maineTaxRows = hasMaineTaxes ? `
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Maine</td>
                            <td style="color: #333;">State Income Tax</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="ME STATE" data-tax="me_state" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Maine</td>
                            <td style="color: #333;">PFML Employee</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="ME PFML" data-tax="me_pfml" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>` : '';
    
    return `
        <div class="tax-mapping-table" style="padding: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 20px;">Employee-Visible Tax Abbreviations</h3>
            <p style="color: #666; margin-bottom: 20px;">Review and confirm how these taxes will display on pay statements. Click any abbreviation to edit. Edit will save automatically</p>
            
            <div class="table-container">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th style="width: 30%; padding-right: 20px;">State</th>
                            <th style="width: 40%;">Tax Name</th>
                            <th style="width: 30%;">Abbreviation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Federal Taxes -->
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Federal</td>
                            <td style="color: #333;">Federal Income Tax</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="FED TAX" data-tax="fed_income" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Federal</td>
                            <td style="color: #333;">Social Security</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="SOC SEC" data-tax="social_security" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Federal</td>
                            <td style="color: #333;">Medicare</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="MEDICARE" data-tax="medicare" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Massachusetts Taxes -->
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Massachusetts</td>
                            <td style="color: #333;">State Income Tax</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="MA STATE" data-tax="ma_state" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #333; padding-right: 20px;">Massachusetts</td>
                            <td style="color: #333;">PFML Employee</td>
                            <td>
                                <div class="editable-abbreviation">
                                    <input type="text" class="tax-abbrev-input" value="MA PFML" data-tax="ma_pfml" style="font-family: monospace; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; width: 120px;">
                                </div>
                            </td>
                        </tr>
                        ${maineTaxRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function collectTaxDetails() {
    // Add user's response
    addMessage('Frequencies look good', 'user');
    
    taxConfigurationState.step = 5;
    
    // Show pay statement preview
    showPayStatementPreview();
    
    return true;
}

function showPayStatementPreview() {
    // Update panel to show tax mapping table instead of pay statement preview
    updateTaxPanelContent('tax-mapping-table');
    
    // Count visible and hidden taxes
    const visibleTaxes = 5; // Fed Income, Social Security, Medicare, MA State, MA PFML
    const hiddenTaxes = 4; // MA SUI, MA EMAC, MA WTF, MA PFML Employer
    
    // Check if Maine taxes are added
    const hasMaineTaxes = taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded);
    const totalVisible = hasMaineTaxes ? visibleTaxes + 2 : visibleTaxes; // +2 for ME State and ME PFML
    const totalHidden = hasMaineTaxes ? hiddenTaxes + 4 : hiddenTaxes; // +4 for ME employer taxes
    
    setTimeout(() => {
        addMessage(`Great! Here's how taxes will appear on your employees' pay statements. Please review and update anything that needs changing. Changes will save automatically.

<strong>Tax Summary:</strong>
• <strong>${totalVisible} taxes visible</strong> to employees on pay stubs
• <strong>${totalHidden} employer-only taxes</strong> (hidden from employees)

<strong>Ready for the final step?</strong>`, 'ai', [
            { action: 'abbreviations-confirmed', text: 'Yes, let\'s go', buttonType: 'primary' },
            { action: 'edit-abbreviations', text: 'Let me ask my coworker', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'employee-questions-1', text: 'Why are some taxes hidden from employees?' },
                { action: 'employee-questions-2', text: 'Can I change which taxes employees see?' }
            ]
        });
    }, 500);
    
    return true;
}

function handleAbbreviationsConfirmed() {
    addMessage('Yes, let\'s go', 'user');
    
    setTimeout(() => {
        addMessage(`Great! Your tax abbreviations will be set up correctly.

<strong>Important Next Step:</strong>
Before you process your first payroll, you'll need to upload your state tax rate assignment letters. This helps us verify your rates are correct and avoid any compliance issues.

${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? 
`You'll need to provide:
• 2025 Massachusetts DUA rate assignment letter (for SUI rate verification)
• 2025 Maine Department of Labor rate notice (for new employer rates)` : 
`You'll need to provide:
• 2025 Massachusetts DUA rate assignment letter (for SUI rate verification)`}

These documents ensure your tax rates match what the state has assigned to your business.`, 'ai', [
            { action: 'configure-tax-rates', text: 'Noted, ready to configure tax rates', buttonType: 'primary' },
            { action: 'add-to-todo', text: 'Add to my to-do list', buttonType: 'secondary' },
            { action: 'upload-documents-now', text: 'Upload documents now', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'why-upload-docs', text: 'Why do I need to upload these?' },
                { action: 'where-find-rate-letters', text: 'Where do I find rate letters?' },
                { action: 'what-if-no-letter', text: 'What if I don\'t have the letters?' }
            ]
        });
    }, 800);
    
    return true;
}

function handleEditAbbreviations() {
    addMessage('Let me ask my coworker', 'user');
    
    setTimeout(() => {
        addMessage(`No problem! You can click directly on any abbreviation in the table to edit it. 

<strong>Common customizations:</strong>
• Some companies prefer "FED WH" instead of "FED TAX"
• "FICA SS" instead of "SOC SEC" for Social Security
• "MA SIT" instead of "MA STATE" for state income tax

Simply click on any field and type your preferred abbreviation. The changes save automatically.`, 'ai', [
            { action: 'abbreviations-confirmed', text: 'Done editing', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function reviewPayStatement() {
    addMessage('See example pay statement', 'user');
    
    // Generate a sample pay statement preview
    setTimeout(() => {
        updateTaxPanelContent('pay-statement-preview');
        
        addMessage(`Here's an example of how taxes will appear on an actual pay statement. 

The abbreviations you\'ve configured will be used in the deductions section, making it easy for employees to understand their withholdings.`, 'ai', [
            { action: 'complete-tax-setup', text: 'Looks good, complete setup', buttonType: 'primary' },
            { action: 'back-to-abbreviations', text: 'Back to abbreviations', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function configureTaxRates() {
    addMessage('Noted, ready to configure tax rates', 'user');
    
    // Collapse all previous conversation threads
    setTimeout(() => {
        collapseConversationHistory("Tax configuration threads");
    }, 300);
    
    // Show process card with loading animation
    setTimeout(() => {
        const processCard = createProcessCard({
            title: 'Tax rate configuration',
            status: 'processing',
            duration: 5000
        });
        
        // Add the process card to the chat
        addMessage(processCard, 'system');
    }, 600);
    
    // Start sliding out the right panel
    setTimeout(() => {
        const tablePanel = document.getElementById('tablePanel');
        
        if (tablePanel && !tablePanel.classList.contains('hidden')) {
            // Add very smooth transition with clean easing
            tablePanel.style.transition = 'transform 1.2s cubic-bezier(0.32, 0, 0.67, 0), opacity 1s ease-out';
            tablePanel.style.transform = 'translateX(110%)';
            tablePanel.style.opacity = '0';
            
            // Smooth chat panel expansion
            const chatPanel = document.getElementById('chatPanel');
            if (chatPanel) {
                chatPanel.style.transition = 'all 1.2s cubic-bezier(0.32, 0, 0.67, 0)';
            }
            
            // Hide panel completely after animation
            setTimeout(() => {
                tablePanel.classList.add('hidden');
                tablePanel.style.transform = '';
                tablePanel.style.opacity = '';
                tablePanel.style.transition = '';
                
                // Expand chat to full width
                if (chatPanel) {
                    chatPanel.classList.add('centered');
                    // Remove transition after animation completes
                    setTimeout(() => {
                        chatPanel.style.transition = '';
                    }, 100);
                }
            }, 1200);
        }
    }, 1000);
    
    // Don't show any additional content after the process card completes
    // The process card will auto-complete after 5 seconds
    
    return true;
}

function addDocumentUploadToTodo() {
    addMessage('Add to my to-do list', 'user');
    
    setTimeout(() => {
        addMessage(`✓ Added to your to-do list!

<strong>Document Upload Reminder:</strong>
Before your first payroll, upload:
• State tax rate assignment letters
• Any quarterly rate notices you\'ve received

You can upload these documents anytime by going to:
Settings → Tax Documents → Upload Rate Letters

I\'ll remind you again before your first payroll run.`, 'ai', [
            { action: 'configure-tax-rates', text: 'Continue to tax rates', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function uploadDocumentsNow() {
    addMessage('Upload documents now', 'user');
    
    setTimeout(() => {
        // Update panel to show document upload interface
        updateTaxPanelContent('document-upload');
        
        addMessage(`Let's upload your tax rate documents. You can drag and drop files or click to browse.

<strong>Accepted formats:</strong> PDF, JPG, PNG

<strong>Documents to upload:</strong>
• Massachusetts DUA rate assignment letter
${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? 
'• Maine Department of Labor rate notice' : ''}
• Any quarterly rate adjustment notices

Once uploaded, we'll extract and verify your rates automatically.`, 'ai', [
            { action: 'documents-uploaded', text: 'I\'ve uploaded my documents', buttonType: 'primary' },
            { action: 'upload-later', text: 'I\'ll upload later', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showWhyUploadDocs() {
    addMessage('Why do I need to upload these?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Document uploads are important for several reasons:</strong>

<strong>1. Rate Verification</strong>
States assign specific tax rates to your business. We verify these to ensure accuracy.

<strong>2. Compliance</strong>
Having documentation on file protects you during audits and proves you're using correct rates.

<strong>3. Rate Changes</strong>
States adjust rates quarterly or annually. Your documents help us track when updates are needed.

<strong>4. Error Prevention</strong>
Incorrect rates can lead to penalties. Verification prevents costly mistakes.

Think of it as double-checking your work - it\'s a small step that prevents big problems later.`, 'ai', [
            { action: 'upload-documents-now', text: 'Makes sense, upload now', buttonType: 'primary' },
            { action: 'add-to-todo', text: 'Add to my to-do list', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showWhereFindRateLetters() {
    addMessage('Where do I find rate letters?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Here's where to find your tax rate letters:</strong>

<strong>Massachusetts (DUA):</strong>
• Check your mail - sent annually in December for the following year
• Log into MassTaxConnect online portal
• Look for "Unemployment Insurance Rate Notice"
• Usually titled "20XX Contribution Rate Notice"

${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? `
<strong>Maine:</strong>
• Maine Department of Labor sends quarterly notices
• Available in your Maine ReEmployME portal
• Look for "Employer Tax Rate Notice"` : ''}

<strong>Can't find them?</strong>
• Check your email (many states send PDF copies)
• Look in your previous payroll provider's documents
• Contact the state agency directly for a copy

The letters typically arrive in December for the following tax year.`, 'ai', [
            { action: 'upload-documents-now', text: 'Found them, upload now', buttonType: 'primary' },
            { action: 'what-if-no-letter', text: 'Still can\'t find them', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showWhatIfNoLetter() {
    addMessage('What if I don\'t have the letters?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>No worries! Here are your options:</strong>

<strong>Option 1: Use standard new employer rates</strong>
• Massachusetts: 2.13% for new employers
• Maine: 2.75% for new employers
• We can start with these and update when you get your letters

<strong>Option 2: Get copies from the state</strong>
• Call Massachusetts DUA: (617) 626-6800
${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? 
'• Call Maine DOL: (207) 621-5120' : ''}
• Most states can email you a copy same day

<strong>Option 3: Check with your previous provider</strong>
If you're switching from another payroll service, they should have these documents.

For now, we can proceed with standard rates and you can upload the documents when you receive them.`, 'ai', [
            { action: 'use-standard-rates', text: 'Use standard rates for now', buttonType: 'primary' },
            { action: 'add-to-todo', text: 'Add to my to-do list', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function useStandardRates() {
    addMessage('Use standard rates for now', 'user');
    
    setTimeout(() => {
        addMessage(`Perfect! We'll use the standard new employer rates to get you started.

<strong>Applied rates:</strong>
• Massachusetts SUI: 2.13%
• Massachusetts EMAC: 0.75%
${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? 
'• Maine SUI: 2.75%\n• Maine PFML: 1.0%' : ''}
• Federal FUTA: 0.6%

These rates will work perfectly for your initial payrolls. When you receive your official rate letters, you can upload them and we'll update accordingly.`, 'ai', [
            { action: 'complete-tax-setup', text: 'Complete tax configuration', buttonType: 'primary' },
            { action: 'add-to-todo', text: 'Add document upload to-do', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function documentsUploaded() {
    addMessage('I\'ve uploaded my documents', 'user');
    
    setTimeout(() => {
        addMessage(`✓ Excellent! Documents received and processing.

<strong>Verification complete:</strong>
• Massachusetts SUI rate: Confirmed at ${taxConfigurationState.statesTaxes.find(s => s.state === 'Massachusetts')?.suiRate || '2.13'}%
• EMAC contribution: Verified
${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? 
'• Maine rates: Confirmed' : ''}

Your tax rates have been automatically updated based on the uploaded documents. Everything is ready for accurate payroll processing.`, 'ai', [
            { action: 'complete-tax-setup', text: 'Perfect, complete setup', buttonType: 'primary' },
            { action: 'review-extracted-rates', text: 'Review extracted rates', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function uploadLater() {
    addMessage('I\'ll upload later', 'user');
    
    setTimeout(() => {
        addMessage(`No problem! We'll proceed with standard rates for now.

<strong>Reminder set:</strong>
• We'll remind you before your first payroll
• You can upload documents anytime in Settings → Tax Documents
• Standard new employer rates will be used until documents are uploaded

Let's continue setting up your tax configuration.`, 'ai', [
            { action: 'configure-tax-rates', text: 'Continue to tax rates', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function startRateEntry() {
    addMessage('Start entering rates', 'user');
    
    setTimeout(() => {
        // Update panel to show rate entry form
        updateTaxPanelContent('rate-entry-form');
        
        addMessage(`Let's enter your specific tax rates. I\'ll guide you through each one.

First, let's start with your Massachusetts SUI rate. This should be on your DUA rate notice.

<strong>Where to find it:</strong>
Look for "Contribution Rate" or "UI Rate" on your letter. It's usually shown as a percentage (e.g., 2.13%).`, 'ai', [
            { action: 'rate-entered', text: 'Continue with next rate', buttonType: 'primary' },
            { action: 'need-help-finding-rate', text: 'Help me find the rate', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function reviewCurrentRates() {
    addMessage('Review current rates', 'user');
    
    setTimeout(() => {
        const maData = taxConfigurationState.statesTaxes.find(s => s.state === 'Massachusetts');
        const meData = taxConfigurationState.statesTaxes.find(s => s.state === 'Maine' && s.newlyAdded);
        
        addMessage(`<strong>Current Tax Rates Configuration:</strong>

<strong>Massachusetts:</strong>
• SUI Rate: ${maData?.suiRate || '2.13'}%
• EMAC: 0.75%
• PFML: 0.63% (0.46% employee / 0.17% employer)
• Wage Base: $15,000

${meData ? `<strong>Maine:</strong>
• SUI Rate: ${meData.suiRate || '2.75'}%
• PFML: 1.0%
• CSF: 0.06%
• UAF: 0.06%
• Wage Base: $12,000` : ''}

<strong>Federal:</strong>
• FUTA: 0.6% (after state credit)
• Social Security: 6.2% (employee & employer)
• Medicare: 1.45% (employee & employer)

These rates will be used for all payroll calculations.`, 'ai', [
            { action: 'rates-look-good', text: 'Rates look correct', buttonType: 'primary' },
            { action: 'update-rates', text: 'Update rates', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showHowToExplainTaxes() {
    addMessage('How do I explain these to employees?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Simple explanations for each tax on their pay stub:</strong>

<strong>Federal Taxes:</strong>
• <strong>FED TAX:</strong> "Federal income tax based on your W-4 selections"
• <strong>SOC SEC:</strong> "Social Security - 6.2% for retirement benefits"
• <strong>MEDICARE:</strong> "Medicare - 1.45% for healthcare when you're 65+"

<strong>Massachusetts Taxes:</strong>
• <strong>MA STATE:</strong> "Massachusetts state income tax - flat 5% rate"
• <strong>MA PFML:</strong> "Paid Family & Medical Leave - provides paid time off for family/medical needs"

${taxConfigurationState.statesTaxes.some(s => s.state === 'Maine' && s.newlyAdded) ? `
<strong>Maine Taxes:</strong>
• <strong>ME STATE:</strong> "Maine state income tax for employees working in Maine"
• <strong>ME PFML:</strong> "Maine's paid leave program for family/medical needs"` : ''}

<strong>Pro tip:</strong> Create a one-page "Understanding Your Pay Stub" guide with these definitions to include with first paychecks.`, 'ai', [
            { action: 'abbreviations-confirmed', text: 'Very helpful, continue', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showEmployeeQuestions1() {
    addMessage('Why are some taxes hidden from employees?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Common employee questions about their pay statements:</strong>

<strong>"What is MA PFML?"</strong>
This is Massachusetts Paid Family & Medical Leave - provides paid time off for family or medical reasons. It's split 50/50 between you and your employer.

<strong>"Why is my state tax different each paycheck?"</strong>
State income tax varies based on your earnings, filing status, and allowances. It adjusts with overtime or bonuses.

<strong>"What's the difference between gross and net pay?"</strong>
Gross is before deductions, net is your take-home after all taxes and deductions.

<strong>"Can I change my withholdings?"</strong>
Yes, you can update your W-4 (federal) and state withholding forms anytime through HR.

Having clear pay statements helps reduce these questions and builds trust.`, 'ai', [
            { action: 'complete-tax-setup', text: 'Got it, continue', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showEmployeeQuestions2() {
    addMessage('Can I change which taxes employees see?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>How to explain Maine taxes to your Portland employees:</strong>

<strong>For Sarah Chen and the Maine team:</strong>
"Since you work in Maine, you'll see Maine state taxes on your pay statement instead of Massachusetts taxes. This includes:

• <strong>Maine State Income Tax:</strong> Similar to MA, varies by income
• <strong>Maine PFML:</strong> New program starting in 2025 - provides paid family/medical leave

The employer covers all unemployment and surcharge taxes, so you won't see those on your statement."

<strong>Key talking points:</strong>
• Tax rates are comparable between states
• PFML provides valuable benefits
• Net pay should be similar to MA employees at same salary level
• All tax registrations are being processed

This transparency helps employees understand their deductions.`, 'ai', [
            { action: 'complete-tax-setup', text: 'Perfect, complete setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function completeTaxConfiguration() {
    addMessage('Complete tax configuration', 'user');
    
    const allTaxes = taxConfigurationState.confirmedTaxes;
    const taxCount = allTaxes.length;
    
    // Build tax list with frequencies
    const taxList = allTaxes.map(tax => `• ${tax.name} (${tax.frequency.charAt(0).toUpperCase() + tax.frequency.slice(1)})`).join('\n');
    
    addMessage(`🎉 <strong>Tax configuration complete!</strong> Your payroll system is ready with:\n\n✅ <strong>${taxCount} Tax types configured</strong>\n✅ <strong>Payment frequencies assigned</strong>\n✅ <strong>Pay statement setup complete</strong>\n✅ <strong>Compliance requirements met</strong>\n\n<strong>Your tax obligations:</strong>\n${taxList}\n\nYour payroll system can now process taxes correctly for all jurisdictions.`, 'ai', [
        { action: 'continue-to-next-setup', text: 'Continue to next setup', buttonType: 'primary' },
        { action: 'export-tax-config', text: 'Export configuration', buttonType: 'secondary' }
    ]);
    
    return true;
}

function showHelpFindingInfo() {
    addMessage('I can help you find the missing tax information:\n\n<strong>For Federal EIN:</strong>\n• Check your IRS determination letter\n• Look at previous tax filings\n• Contact your accountant\n\n<strong>For New Jersey Tax IDs:</strong>\n• Check New Jersey Division of Taxation correspondence\n• Look at previous state tax filings\n• Visit state.nj.us/treasury/taxation to look up your accounts\n\n<strong>For SUI rates:</strong>\n• Check your quarterly SUI notices\n• Contact New Jersey Department of Labor\n• Your rate is typically between 0.3% - 5.4%\n\nWould you like me to continue the setup and add these details later?', 'ai', [
        { action: 'collect-tax-details', text: 'Continue with setup' },
        { action: 'get-registration-help', text: 'Help me register for missing IDs' }
    ]);
    return true;
}

function continueToNextSetup() {
    addMessage('Moving to the next setup phase. Tax configuration is complete and saved.', 'ai');
    return true;
}

function exportTaxConfiguration() {
    addMessage('Your tax configuration has been exported. You can import this into your payroll system or share it with your accountant.', 'ai', [
        { action: 'continue-to-next-setup', text: 'Continue with setup' }
    ]);
    return true;
}

// Panel content update function for tax configuration
function updateTaxPanelContent(panelType) {
    const tablePanel = document.getElementById('tablePanel');
    const panelContent = document.getElementById('panelContent');

    if (!tablePanel || !panelContent) {
        console.error('Panel elements not found');
        return;
    }

    let content = '';

    switch (panelType) {
        case 'tax-extraction':
            content = generateTaxExtractionPanel();
            break;
        case 'complex-tax-analysis':
            content = generateComplexTaxAnalysisPanel();
            break;
        case 'chunk-configuration':
            content = generateChunkConfigurationPanel();
            break;
        case 'federal-chunk-configuration':
            content = generateFederalChunkPanel();
            break;
        case 'discovery-questions':
            content = generateDiscoveryQuestionsPanel();
            break;
        case 'smart-recommendations':
            content = generateSmartRecommendationsPanel();
            break;
        case 'frequency-assignment':
            content = generateFrequencyPanel();
            break;
        case 'tax-details-collection':
            content = generateTaxDetailsPanel();
            break;
        case 'state-tax-configuration':
            content = generateStateTaxConfigurationPanel();
            break;
        case 'maine-recommendation':
            content = generateMaineRecommendationPanel();
            break;
        case 'pay-statement-preview':
            content = generatePayStatementPreviewPanel();
            break;
        case 'example-pay-statement':
            content = generateExamplePayStatementPanel();
            break;
        case 'tax-mapping-table':
            content = generateTaxMappingTable();
            break;
    
            case 'batch-processing':
                content = generateBatchProcessingPanel();
                break;
            case 'federal-processing':
                content = generateFederalProcessingPanel();
                break;
            
        default:
            content = '<div class="panel-placeholder">Tax configuration panel</div>';
    }

    // Update panel header
    const panelHeader = tablePanel.querySelector('.panel-header h2');
    if (panelHeader) {
        panelHeader.textContent = 'Tax Configuration';
    }

    // Make sure the panel is visible
    tablePanel.classList.remove('hidden');
    tablePanel.classList.add('visible');
    tablePanel.style.display = 'flex';

    // Update the panel content
    panelContent.innerHTML = content;
    console.log('Panel updated with content type:', panelType);

    // Ensure the chat panel adjusts to split view
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        chatPanel.classList.remove('intro-mode');
        chatPanel.classList.add('right-panel-open');
    }
}

// Add these new panel generators:

function generateComplexTaxAnalysisPanel() {
    const scenario = taxConfigurationState.complexScenario;
    if (!scenario) return '<div>No complex scenario data available</div>';

    return `
        <div class="complex-tax-analysis-panel">
            <h3>Complex Tax Analysis</h3>

            <div class="document-sources">
                <h4>📄 Document Sources</h4>
                <div class="source-list">
                    ${scenario.extractedFrom.map(doc => `
                        <div class="source-item">
                            <span class="doc-icon">📄</span>
                            <span class="doc-name">${doc}</span>
                            <span class="doc-status">✅ Analyzed</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="jurisdiction-breakdown">
                <h4>🗺️ Jurisdiction Analysis</h4>
                ${Object.entries(scenario.employeeDistribution).map(([state, count]) => `
                    <div class="jurisdiction-item">
                        <div class="jurisdiction-header">
                            <strong>${state}</strong>
                            <span class="employee-count">${count} employees</span>
                        </div>
                        <div class="tax-count">${getTaxCountForJurisdiction(state)} tax obligations</div>
                    </div>
                `).join('')}
            </div>

            <div class="complexity-metrics">
                <h4>📊 Complexity Metrics</h4>
                <div class="metric-item">
                    <span class="metric-label">Total Tax Obligations:</span>
                    <span class="metric-value">${scenario.totalTaxes}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Jurisdictions:</span>
                    <span class="metric-value">${scenario.jurisdictions.length}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Recommended Approach:</span>
                    <span class="metric-value">Conversational Chunking</span>
                </div>
            </div>
        </div>
    `;
}

function generateChunkConfigurationPanel() {
    const chunk = taxConfigurationState.currentChunk;
    if (!chunk) return '<div>No chunk data available</div>';

    return `
        <div class="chunk-configuration-panel">
            <h3>${chunk.name} Chunk Configuration</h3>

            <div class="chunk-progress">
                <div class="progress-header">
                    <span>Progress: ${chunk.progress.current}/${chunk.progress.total}</span>
                    <span>${Math.round((chunk.progress.current / chunk.progress.total) * 100)}% Complete</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(chunk.progress.current / chunk.progress.total) * 100}%"></div>
                </div>
            </div>

            <div class="chunk-taxes">
                <h4>Taxes in This Chunk</h4>
                ${chunk.taxes.map(tax => `
                    <div class="chunk-tax-item">
                        <div class="tax-header">
                            <strong>${tax.name}</strong>
                            <span class="employee-impact">${tax.employees} employees</span>
                        </div>
                        <div class="tax-jurisdiction">${tax.jurisdiction}</div>
                        <div class="document-source">
                            <span class="source-icon">📄</span>
                            <span class="source-name">${tax.documentSource}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="chunk-impact">
                <h4>Business Impact</h4>
                <div class="impact-metrics">
                    <div class="impact-item">
                        <span class="impact-label">Employees Affected:</span>
                        <span class="impact-value">${getTotalEmployeesInChunk(chunk)}</span>
                    </div>
                    <div class="impact-item">
                        <span class="impact-label">Jurisdictions:</span>
                        <span class="impact-value">${chunk.jurisdictions.join(', ')}</span>
                    </div>
                    <div class="impact-item">
                        <span class="impact-label">Priority Level:</span>
                        <span class="impact-value">High Impact</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateFederalChunkPanel() {
    const chunk = taxConfigurationState.currentChunk;
    if (!chunk) return '<div>No federal chunk data available</div>';

    return `
        <div class="federal-chunk-panel">
            <h3>Federal Foundation Configuration</h3>

            <div class="federal-overview">
                <div class="federal-scope">
                    <h4>Scope: All Employees</h4>
                    <p>Federal taxes apply to your entire workforce across all states.</p>
                </div>
            </div>

            <div class="federal-taxes">
                <h4>Federal Tax Obligations</h4>
                ${chunk.taxes.map(tax => `
                    <div class="federal-tax-item">
                        <div class="tax-header">
                            <strong>${tax.name}</strong>
                            <span class="universal-badge">All ${tax.employees} employees</span>
                        </div>
                        <div class="tax-description">${getFederalTaxDescription(tax.type)}</div>
                        <div class="document-verification">
                            <span class="verification-icon">✅</span>
                            <span class="verification-text">Verified in ${tax.documentSource}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="federal-requirements">
                <h4>Federal Requirements</h4>
                <div class="requirement-item">
                    <span class="req-label">EIN Required:</span>
                    <span class="req-status">✅ Found in documents</span>
                </div>
                <div class="requirement-item">
                    <span class="req-label">Form 941 Filing:</span>
                    <span class="req-status">📄 Quarterly</span>
                </div>
                <div class="requirement-item">
                    <span class="req-label">Deposit Schedule:</span>
                    <span class="req-status">⏰ Based on liability</span>
                </div>
            </div>
        </div>
    `;
}

function generateBatchProcessingPanel() {
    const chunk = taxConfigurationState.currentChunk;
    if (!chunk) return '<div>No chunk data available</div>';

    const currentBatch = chunk.batches ? chunk.batches[chunk.currentBatch] : chunk.taxes;

    return `
        <div class="tax-extraction-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">${chunk.name} - Batch Processing</h3>

            <div class="chunk-progress" style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600;">Progress: ${chunk.progress.current}/${chunk.progress.total} taxes</span>
                    <span style="color: #28a745; font-weight: 600;">${Math.round((chunk.progress.current / chunk.progress.total) * 100)}% Complete</span>
                </div>
                <div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(chunk.progress.current / chunk.progress.total) * 100}%; height: 100%; background: #28a745; transition: width 0.3s ease;"></div>
                </div>
            </div>

            <div class="tax-cards-container" style="display: flex; flex-direction: column; gap: 16px;">
                <h4 style="margin: 0 0 16px 0; color: var(--text-secondary);">Current Batch (${currentBatch?.length || 0} taxes)</h4>

                ${(currentBatch || []).map(tax => `
                    <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative; margin-bottom: 16px; transition: all 0.3s ease;">
                        <div style="margin-bottom: 16px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${tax.name}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <span style="color: #666; font-size: 14px;">${tax.jurisdiction}</span>
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                    ${tax.employees} employees
                                </span>
                            </div>
                        </div>

                        <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Document Source</span>
                                <span style="font-weight: 500; color: #333;">${tax.documentSource}</span>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">${getTaxIdLabel(tax.type)}</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <input type="text" value="" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right;" placeholder="Enter ${getTaxIdLabel(tax.type).toLowerCase()}" />
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Tax Rate</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <input type="text" value="" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; text-align: right; font-weight: 500;" placeholder="Enter rate" />
                                    <span style="font-size: 12px; color: #999;">Will be populated from documents</span>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Payment Frequency</span>
                                <select style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                                    <option value="">Select frequency</option>
                                    <option value="semiweekly">Semiweekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="panel-footer" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: var(--text-secondary); font-size: 14px;">
                    Batch ${(chunk.currentBatch || 0) + 1} of ${chunk.batches?.length || 1} - Configure taxes in manageable groups
                </p>
            </div>
        </div>
    `;
}

function generateFederalProcessingPanel() {
    const chunk = taxConfigurationState.currentChunk;
    if (!chunk) return '<div>No federal chunk data available</div>';

    return `
        <div class="tax-extraction-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Federal Foundation Configuration</h3>

            <div style="margin-bottom: 24px; padding: 16px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #1565c0;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 18px; margin-right: 8px;">🏛️</span>
                    <span style="font-weight: 600; color: #1565c0;">Foundation Taxes - Apply to All Employees</span>
                </div>
                <p style="margin: 0; color: #666; font-size: 14px;">Federal taxes form the foundation for all payroll processing across all states.</p>
            </div>

            <div class="tax-cards-container" style="display: flex; flex-direction: column; gap: 16px;">
                ${chunk.taxes.map(tax => `
                    <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative; margin-bottom: 16px; transition: all 0.3s ease;">
                        <div style="margin-bottom: 16px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${tax.name}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <span style="color: #666; font-size: 14px;">${tax.jurisdiction}</span>
                                <span style="background: #1565c0; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                    All ${tax.employees} employees
                                </span>
                            </div>
                        </div>

                        <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Document Source</span>
                                <span style="font-weight: 500; color: #333;">${tax.documentSource}</span>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Federal EIN</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <input type="text" value="12-3456789" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right;" placeholder="Enter EIN" />
                                    <span style="font-size: 12px; color: #28a745;">✅ Found in Form 941</span>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Tax Rate</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <span style="font-weight: 500; color: #333; padding: 6px; background: #f5f5f5; border-radius: 4px;">
                                        ${getFederalTaxRate(tax.type)}
                                    </span>
                                    <span style="font-size: 12px; color: #999;">${getFederalTaxRateNote(tax.type)}</span>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                <span style="color: #666;">Payment Frequency</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <select style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                                        <option value="semiweekly" ${getFederalDefaultFrequency(tax.type) === 'semiweekly' ? 'selected' : ''}>Semiweekly</option>
                                        <option value="monthly" ${getFederalDefaultFrequency(tax.type) === 'monthly' ? 'selected' : ''}>Monthly</option>
                                        <option value="quarterly" ${getFederalDefaultFrequency(tax.type) === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                                    </select>
                                    <span style="font-size: 12px; color: #999;">🤖 Smart default selected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="panel-footer" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: var(--text-secondary); font-size: 14px;">
                    Federal foundation complete - Ready for state-specific taxes
                </p>
            </div>
        </div>
    `;
}

// Helper functions for federal tax configuration
function getFederalTaxRate(taxType) {
    const rates = {
        'federal_income': 'Variable (based on W-4)',
        'federal_futa': '0.6% on first $7,000',
        'fica_employer': '7.65% (6.2% SS + 1.45% Medicare)'
    };
    return rates[taxType] || 'Variable';
}

function getFederalTaxRateNote(taxType) {
    const notes = {
        'federal_income': 'Employee elections determine withholding',
        'federal_futa': 'Federal standard rate',
        'fica_employer': 'Employer match requirement'
    };
    return notes[taxType] || 'Federal standard';
}

function getFederalDefaultFrequency(taxType) {
    const frequencies = {
        'federal_income': 'semiweekly',
        'federal_futa': 'quarterly',
        'fica_employer': 'semiweekly'
    };
    return frequencies[taxType] || 'monthly';
}

// Helper functions for the panel generators
function getTaxCountForJurisdiction(jurisdiction) {
    const taxCounts = {
        'Federal': 3,
        'New York': 4,
        'New Jersey': 4,
        'Massachusetts': 2,
        'New Hampshire': 1
    };
    return taxCounts[jurisdiction] || 0;
}

function getFederalTaxDescription(taxType) {
    const descriptions = {
        'federal_income': 'Employee income tax withholding based on W-4 elections',
        'federal_futa': 'Federal unemployment tax - 0.6% on first $7,000 per employee',
        'fica_employer': 'Employer match for Social Security (6.2%) and Medicare (1.45%)'
    };
    return descriptions[taxType] || 'Federal tax obligation';
}

// Add the document analysis helper function
function analyzeUploadedDocuments() {
    // This would normally extract from actual uploaded documents
    return {
        totalTaxes: 14,
        jurisdictions: ['Federal', 'New York', 'New Jersey', 'New Hampshire', 'Massachusetts'],
        employeeDistribution: {
            'New York': 45,
            'New Jersey': 38, 
            'New Hampshire': 8,
            'Massachusetts': 22
        },
        extractedFrom: [
            'Q3_2024_Payroll_Register.xlsx',
            'Form_941_Q3_2024.pdf', 
            'Employee_Roster_Current.csv',
            'State_Tax_Filings_2024.pdf'
        ]
    };
}

// Helper function to get appropriate tax ID label based on tax type
function getTaxIdLabel(taxType) {
    const taxIdLabels = {
        'federal_income': 'EIN (Tax ID)',
        'federal_futa': 'EIN (Tax ID)',
        'fica_employer': 'EIN (Tax ID)',
        'nj_income': 'NJ Withholding ID',
        'nj_sui': 'NJ UI Account Number',
        'nj_sdi': 'NJ Employer Registration',
        'nj_fli': 'NJ Employer Registration',
        'nj_swf': 'NJ Employer Registration',
        'ny_income': 'NY Withholding ID',
        'ny_suta': 'NY UI Account Number',
        'me_income': 'ME Withholding ID',
        'me_suta': 'ME UI Account Number',
        'me_pfml': 'ME PFML Account',
        'me_competitive_skills': 'ME Employer ID',
        'me_unemployment_admin': 'ME Employer ID'
    };
    
    return taxIdLabels[taxType] || 'Tax ID';
}

function generateMaineTaxConfigurationCard() {
    // Get Maine data from state configuration
    const maineState = taxConfigurationState.statesTaxes.find(s => s.state === 'Maine') || {
        state: 'Maine',
        employees: 25,
        hasIncomeTax: true,
        incomeTaxId: '7739185',
        suiAccountId: '7739185',
        suiRate: '2.75',
        suiWageBase: '$12,000',
        pfmlAccountId: '7739185'
    };
    
    return `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
                <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Maine Tax Configuration</h3>
                <span style="display: inline-block; margin-top: 4px; font-size: 13px; color: #666;">5 taxes to configure</span>
            </div>
            <span class="status-badge" style="background: #28a745; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                NEWLY ADDED
            </span>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
            <!-- State Income Tax Section -->
            <div style="padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">Maine State Income Tax</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">ME Withholding ID</span>
                    <input type="text" value="${maineState.incomeTaxId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px;" placeholder="Enter withholding ID" />
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Rate</span>
                    <div style="text-align: right;">
                        <div style="font-weight: 500; color: #333;">Based on state's calculation</div>
                    </div>
                </div>
            </div>
            
            <!-- SUI Section -->
            <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">Maine SUI (Unemployment Insurance)</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">ME SUI Account ID</span>
                    <input type="text" value="${maineState.suiAccountId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px;" placeholder="Enter SUI account ID" />
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Rate</span>
                    <div style="text-align: right;">
                        <input type="text" value="${maineState.suiRate}%" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-weight: 500; text-align: right; width: 80px;" placeholder="Rate" />
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">New employer rate 2025</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Wage Base</span>
                    <div style="text-align: right;">
                        <div style="font-weight: 500; color: #333;">${maineState.suiWageBase}</div>
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">Per employee annually</div>
                    </div>
                </div>
            </div>
            
            <!-- PFML Section -->
            <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">Maine PFML (Paid Family & Medical Leave)</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">PFML Account ID</span>
                    <input type="text" value="${maineState.pfmlAccountId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px;" placeholder="Enter PFML account ID" />
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Rate</span>
                    <div style="text-align: right;">
                        <div style="font-weight: 500; color: #333;">1.0%</div>
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">2025 combined rate</div>
                    </div>
                </div>
            </div>
            
            <!-- Competitive Skills Fund Section -->
            <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">ME Competitive Skills Scholarship Fund</div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Rate</span>
                    <div style="text-align: right;">
                        <div style="font-weight: 500; color: #333;">0.06%</div>
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">SUTA surcharge - employer only</div>
                    </div>
                </div>
            </div>
            
            <!-- Unemployment Admin Fund Section -->
            <div style="padding: 12px 0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">ME Unemployment Program Admin Fund</div>
                
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                    <span style="color: #666;">Rate</span>
                    <div style="text-align: right;">
                        <div style="font-weight: 500; color: #333;">0.06%</div>
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">SUTA surcharge - employer only</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateMaineRecommendationPanel() {
    return `
        <div class="tax-recommendations" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Maine Tax Requirements Card -->
            <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Maine Tax Configuration Required</h3>
                    <span style="display: inline-block; margin-top: 4px; font-size: 13px; color: #666;">1 employee affected</span>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                    <!-- State Income Tax Section -->
                    <div style="padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">Maine State Income Tax</div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666;">Account ID</span>
                            <span style="color: #dc3545; font-style: italic;">Registration Required</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666;">Rate</span>
                            <div style="text-align: right;">
                                <div style="font-weight: 500; color: #333;">Based on state calculation</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SUI Section -->
                    <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">Maine SUI (Unemployment Insurance)</div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666;">Account ID</span>
                            <span style="color: #dc3545; font-style: italic;">Registration Required</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666;">Rate</span>
                            <div style="text-align: right;">
                                <div style="font-weight: 500; color: #333;">2.46%</div>
                                <div style="font-size: 12px; color: #999; margin-top: 2px;">New employer rate 2025</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666;">Wage Base</span>
                            <div style="text-align: right;">
                                <div style="font-weight: 500; color: #333;">$12,000</div>
                                <div style="font-size: 12px; color: #999; margin-top: 2px;">Per employee annually</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; margin-top: 8px; padding-top: 8px;">
                        <span style="color: #666;">Registration Deadline</span>
                        <span style="font-weight: 600; color: #dc3545;">Within 30 days</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateStateTaxConfigurationPanel() {
    // Get state tax data from configuration state with actual 2025 rates
    console.log('generateStateTaxConfigurationPanel called');
    console.log('taxConfigurationState.statesTaxes:', taxConfigurationState.statesTaxes);
    
    let states = taxConfigurationState.statesTaxes || [
        { 
            state: 'Massachusetts', 
            employees: 50, 
            hasIncomeTax: true, 
            incomeTaxId: '5528374', 
            suiAccountId: '8837264', 
            suiRate: '2.13', // 2025 new employer rate (non-construction)
            suiWageBase: '$15,000',
            pfmlAccountId: '8837264', // Usually same as SUI account
            emacAccountId: '7739281',
            workforceTrainingFundRate: '0.056', // 2025 rate
            sdiRate: 'N/A' 
        }
    ];
    
    // If Maine is newly added, only show Maine taxes (filter out Massachusetts)
    const hasNewlyAddedMaine = states.some(s => s.state === 'Maine' && s.newlyAdded);
    if (hasNewlyAddedMaine) {
        states = states.filter(s => s.state === 'Maine' && s.newlyAdded);
    }
    
    // Sort states to put Maine first if it exists and is newly added
    states = states.sort((a, b) => {
        if (a.state === 'Maine' && a.newlyAdded) return -1;
        if (b.state === 'Maine' && b.newlyAdded) return 1;
        return 0;
    });
    
    console.log('Using states data:', states);
    console.log('First state SUI rate:', states[0]?.suiRate);
    
    return `
        <div class="tax-extraction-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">State Tax Configuration</h3>
            
            <div class="tax-cards-container extracted-taxes" style="display: flex; flex-direction: column; gap: 40px;">
                ${states.map(state => {
                    if (state.hasIncomeTax) {
                        return `
                            <div class="tax-configuration-card ${state.newlyAdded ? 'newly-added' : ''}" style="background: #ffffff; border: ${state.newlyAdded ? '2px solid #28a745' : '1px solid #e0e0e0'}; border-radius: 8px; padding: 20px; box-shadow: ${state.newlyAdded ? '0 4px 8px rgba(40, 167, 69, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'}; position: relative; transition: all 0.3s ease; ${state.newlyAdded ? 'animation: fadeInScale 0.5s ease-out;' : ''}">
                                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${state.state} Tax Configuration</h3>
                                        <span style="display: inline-block; margin-top: 4px; font-size: 13px; color: #666;">${state.state === 'Massachusetts' ? '5 taxes to configure' : state.state === 'Maine' ? '5 taxes to configure' : state.state === 'New York' ? '3 taxes to configure' : '2 taxes to configure'}</span>
                                    </div>
                                    ${state.newlyAdded ? `
                                        <span class="status-badge" style="background: #28a745; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                                            NEWLY ADDED
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                                    <!-- State Income Tax Section -->
                                    <div style="padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${state.state} State Income Tax</div>
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">${state.state === 'New York' ? 'NY' : state.state === 'New Jersey' ? 'NJ' : state.state === 'Massachusetts' ? 'MA' : state.state === 'Maine' ? 'ME' : 'NH'} Withholding ID</span>
                                            <div style="text-align: right;">
                                                <input type="text" 
                                                       value="${state.incomeTaxId}" 
                                                       style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                       placeholder="Enter withholding ID" />
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Rate</span>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 500; color: #333;">Based on state's calculation</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- SUI Section -->
                                    <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${state.state} SUI (Unemployment Insurance)</div>
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">${state.state === 'New York' ? 'NY' : state.state === 'New Jersey' ? 'NJ' : state.state === 'Massachusetts' ? 'MA' : state.state === 'Maine' ? 'ME' : 'NH'} SUI Account ID</span>
                                            <div style="text-align: right;">
                                                <input type="text" 
                                                       value="${state.suiAccountId}" 
                                                       style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                       placeholder="Enter SUI account ID" />
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Rate</span>
                                            <div style="text-align: right;">
                                                <div style="display: flex; align-items: center; gap: 4px;">
                                                    <input type="text" 
                                                           value="${state.suiRate}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-weight: 500; text-align: right; width: 60px;" 
                                                           placeholder="Rate" />
                                                    <span style="font-weight: 500; color: #333;">%</span>
                                                </div>
                                                <div style="font-size: 12px; color: #999; margin-top: 2px;">Experience rate or new employer rate</div>
                                            </div>
                                        </div>
                                        
                                        ${state.state === 'Massachusetts' ? `
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Effective Date</span>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 500; color: #333;">01/01/2025</div>
                                            </div>
                                        </div>
                                        ` : ''}
                                        
                                        ${state.suiWageBase ? `
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Wage Base</span>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 500; color: #333;">${state.suiWageBase}</div>
                                                <div style="font-size: 12px; color: #999; margin-top: 2px;">Per employee annually</div>
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                    
                                    ${state.state === 'Maine' ? `
                                        <!-- Maine PFML Section -->
                                        <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">ME Paid Family & Medical Leave</div>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">PFML Account ID</span>
                                                <div style="text-align: right;">
                                                    <input type="text" 
                                                           value="${state.pfmlAccountId || state.suiAccountId}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                           placeholder="Enter PFML account ID" />
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">1.0%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">Split 50/50 employer & employee</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Maine Competitive Skills Fund Section -->
                                        <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">ME Competitive Skills Scholarship Fund</div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">0.06%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">SUTA surcharge - employer only</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Maine Unemployment Admin Fund Section -->
                                        <div style="padding: 12px 0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">ME Unemployment Program Admin Fund</div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">0.06%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">SUTA surcharge - employer only</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${state.state === 'Massachusetts' ? `
                                        <!-- PFML Section for Massachusetts -->
                                        <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">MA PFML (Paid Family & Medical Leave)</div>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">PFML Account ID</span>
                                                <div style="text-align: right;">
                                                    <input type="text" 
                                                           value="${state.pfmlAccountId || state.suiAccountId}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                           placeholder="Enter PFML account ID" />
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">0.88%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">2025 combined rate (employer + employee)</div>
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Wage Base</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">$176,100</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">2025 contribution cap</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${state.state === 'Massachusetts' ? `
                                        <!-- EMAC Section for Massachusetts -->
                                        <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">MA EMAC (Employer Medical Assistance)</div>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">EMAC Account ID</span>
                                                <div style="text-align: right;">
                                                    <input type="text" 
                                                           value="${state.emacAccountId || '7739281'}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                           placeholder="Enter EMAC account ID" />
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">Varies by employer</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">Required for employers with >5 employees</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Workforce Training Fund Section for Massachusetts -->
                                        <div style="padding: 12px 0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">MA Workforce Training Fund</div>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Account ID</span>
                                                <div style="text-align: right;">
                                                    <input type="text" 
                                                           value="${state.suiAccountId}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                           placeholder="Uses SUI account" />
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">0.056%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">2025 rate (required for UI payers)</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${state.sdiRate !== 'N/A' ? `
                                        <!-- SDI Section -->
                                        <div style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${state.state} SDI (Disability Insurance)</div>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">${state.state === 'New York' ? 'NY' : state.state === 'New Jersey' ? 'NJ' : state.state === 'Massachusetts' ? 'MA' : 'NH'} SDI Account ID</span>
                                                <div style="text-align: right;">
                                                    <input type="text" 
                                                           value="${state.sdiAccountId}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                           placeholder="Enter SDI account ID" />
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                                <span style="color: #666;">Rate</span>
                                                <div style="text-align: right;">
                                                    <div style="font-weight: 500; color: #333;">${state.sdiRate}%</div>
                                                    <div style="font-size: 12px; color: #999; margin-top: 2px;">${state.sdiNote || 'Auto-populated from state'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative; transition: all 0.3s ease;">
                                <div style="margin-bottom: 16px;">
                                    <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${state.state} Tax Configuration</h3>
                                    <span style="display: inline-block; margin-top: 4px; font-size: 13px; color: #666;">1 tax to configure</span>
                                </div>
                                
                                <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                                    <!-- SUI Only Section -->
                                    <div style="padding: 12px 0;">
                                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${state.state} SUI (Unemployment Insurance)</div>
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">${state.state === 'New York' ? 'NY' : state.state === 'New Jersey' ? 'NJ' : state.state === 'Massachusetts' ? 'MA' : state.state === 'Maine' ? 'ME' : 'NH'} SUI Account ID</span>
                                            <div style="text-align: right;">
                                                <input type="text" 
                                                       value="${state.suiAccountId}" 
                                                       style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right; width: 200px; display: inline-block;" 
                                                       placeholder="Enter SUI account ID" />
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Rate</span>
                                            <div style="text-align: right;">
                                                <div style="display: flex; align-items: center; gap: 4px;">
                                                    <input type="text" 
                                                           value="${state.suiRate}" 
                                                           style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-weight: 500; text-align: right; width: 60px;" 
                                                           placeholder="Rate" />
                                                    <span style="font-weight: 500; color: #333;">%</span>
                                                </div>
                                                <div style="font-size: 12px; color: #999; margin-top: 2px;">Experience rate or new employer rate</div>
                                            </div>
                                        </div>
                                        
                                        ${state.suiWageBase ? `
                                        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                                            <span style="color: #666;">Wage Base</span>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 500; color: #333;">${state.suiWageBase}</div>
                                                <div style="font-size: 12px; color: #999; margin-top: 2px;">Per employee annually</div>
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>

                                </div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
    `;
}

function generateTaxExtractionPanel() {
    const extractedTaxes = taxConfigurationState.extractedTaxes;
    
    // Add tax details (rates and IDs) to the extracted taxes
    const taxDetails = {
        'federal_income': { rate: 'Variable (based on W-4)', taxId: '12-3456789' },
        'nj_income': { rate: 'Variable (1.4% - 11.75%)', taxId: '123456789' },
        'nj_sui': { rate: '2.85%', taxId: '1234567-8', rateType: 'editable', rateLabel: 'Employer-specific rate (required)' },
        'nj_sdi': { rate: '0.47%', taxId: '987654321', rateType: 'readonly', rateLabel: 'State-set rate (employee paid)' },
        'nj_fli': { rate: '0.26%', taxId: '987654321', rateType: 'readonly', rateLabel: 'State-set rate (employee paid)' },
        'nj_swf': { rate: null, taxId: '987654321', rateType: 'hidden', rateNote: 'Rate is system-calculated and handled by UKG' },
        'federal_futa': { rate: '0.6% on first $7,000', taxId: '12-3456789' },
        'fica_employer': { rate: '7.65% (6.2% SS + 1.45% Medicare)', taxId: '12-3456789' },
        'ny_income': { rate: 'Variable (4% - 10.9%)', taxId: '876543210' },
        'ny_suta': { rate: '4.025% (new employer)', taxId: '7654321-9' }
    };
    
    return `
        <div class="tax-extraction-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Tax Configuration Summary</h3>
            
            <div class="tax-cards-container extracted-taxes" style="display: flex; flex-direction: column; gap: 40px;">
                ${extractedTaxes.map(tax => {
                    const details = taxDetails[tax.type] || { rate: 'Variable', taxId: 'Not configured' };
                    return `
                        <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative; transition: all 0.3s ease;">
                            <div style="margin-bottom: 16px;">
                                <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${tax.name}</h3>
                            </div>
                            
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                    <span style="color: #666;">Jurisdiction</span>
                                    <span style="font-weight: 500; color: #333;">${tax.jurisdiction}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                    <span style="color: #666;">${getTaxIdLabel(tax.type)}</span>
                                    <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                        <input type="text" value="${details.taxId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right;" placeholder="Enter ${getTaxIdLabel(tax.type).toLowerCase()}" />
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                    <span style="color: #666;">Tax Rate</span>
                                    ${details.rateType === 'hidden' && details.rateNote ? 
                                        `<span style="font-weight: 500; color: #333; font-style: italic; font-size: 13px;">${details.rateNote}</span>` :
                                        details.rateType === 'editable' ?
                                        `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                            <input type="text" value="${details.rate}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; text-align: right; font-weight: 500;" />
                                            <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                                        </div>` :
                                        details.rateType === 'readonly' ?
                                        `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                            <span style="font-weight: 500; color: #333; padding: 6px; background: #f5f5f5; border-radius: 4px;">
                                                ${details.rate}
                                            </span>
                                            <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                                        </div>` :
                                        `<span style="font-weight: 500; color: #333;">${details.rate || 'Variable'}</span>`
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
                
                ${taxConfigurationState.confirmedTaxes
                    .filter(tax => !extractedTaxes.find(et => et.type === tax.type))
                    .map(tax => {
                        const details = taxDetails[tax.type] || { rate: 'Variable', taxId: 'Pending setup' };
                        return `
                            <div class="tax-configuration-card newly-added" style="background: #ffffff; border: 2px solid #2e45b7; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(46, 69, 183, 0.15); position: relative; margin-bottom: 16px; transition: all 0.3s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                                    <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">${tax.name}</h3>
                                    <span class="status-badge" style="background: #2e45b7; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                                        Newly Added
                                    </span>
                                </div>
                                
                                <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                        <span style="color: #666;">Jurisdiction</span>
                                        <span style="font-weight: 500; color: #333;">${tax.jurisdiction}</span>
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                        <span style="color: #666;">${getTaxIdLabel(tax.type)}</span>
                                        <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                            <input type="text" value="${details.taxId}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; text-align: right;" placeholder="Enter ${getTaxIdLabel(tax.type).toLowerCase()}" />
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                        <span style="color: #666;">Tax Rate</span>
                                        ${details.rateType === 'hidden' && details.rateNote ? 
                                            `<span style="font-weight: 500; color: #333; font-style: italic; font-size: 13px;">${details.rateNote}</span>` :
                                            details.rateType === 'editable' ?
                                            `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                                <input type="text" value="${details.rate}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; text-align: right; font-weight: 500;" />
                                                <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                                            </div>` :
                                            details.rateType === 'readonly' ?
                                            `<div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                                <span style="font-weight: 500; color: #333; padding: 6px; background: #f5f5f5; border-radius: 4px;">
                                                    ${details.rate}
                                                </span>
                                                <span style="font-size: 12px; color: #999;">${details.rateLabel || ''}</span>
                                            </div>` :
                                            `<span style="font-weight: 500; color: #333;">${details.rate || 'Variable'}</span>`
                                        }
                                    </div>
                                    
                                    ${tax.migrationNote ? `
                                        <div style="height: 1px; background: #e0e0e0; margin: 12px 0;"></div>
                                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                                            <span style="color: #666;">Migration Note</span>
                                            <span style="font-weight: 500; color: #333; font-style: italic; text-align: right; max-width: 60%;">${tax.migrationNote}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
            
            <div class="panel-footer" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: var(--text-secondary); font-size: 14px;">
                    ${taxConfigurationState.step === 1 ? 
                        '' :
                        'Tax configuration in progress...'
                    }
                </p>
            </div>
        </div>
    `;
}

function generateDiscoveryQuestionsPanel() {
    const currentQuestion = taxConfigurationState.currentQuestion;
    let questionTitle = '';
    let questionReason = '';
    
    switch (currentQuestion) {
        case 'unemployment_handling':
            questionTitle = 'Unemployment Tax Handling';
            questionReason = 'Understanding who manages unemployment taxes helps me recommend the right setup.';
            break;
        case 'multistate_employees':
            questionTitle = 'Multi-State Employee Status';
            questionReason = 'Employee permanence affects state tax registration requirements.';
            break;
        case 'employer_taxes':
            questionTitle = 'Employer Tax Management';
            questionReason = 'Knowing how you handle employer taxes prevents duplicate configurations.';
            break;
    }
    
    return `
        <div class="discovery-panel">
            <h3>Quick Questions</h3>
            
            <div class="question-context">
                <h4>Why I'm asking:</h4>
                <p>To suggest only the taxes you actually need, not generic requirements</p>
            </div>
            
            <div class="current-question">
                <h4>Current Question:</h4>
                <div class="question-card">
                    <h5>${questionTitle}</h5>
                    <p>${questionReason}</p>
                </div>
            </div>
            
            <div class="question-progress">
                <p>Question ${taxConfigurationState.step - 1} of 3</p>
            </div>
        </div>
    `;
}

function generateSmartRecommendationsPanel() {
    const recommendations = taxConfigurationState.recommendations || [];
    const skipped = taxConfigurationState.skippedTaxes || [];
    
    return `
        <div class="recommendations-panel">
            <h3>Smart Tax Recommendations</h3>
            
            ${recommendations.length > 0 ? `
                <div class="recommended-section">
                    <h4>🎯 Recommended Additions</h4>
                    ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <h5>${rec.name}</h5>
                            <p class="jurisdiction">→ ${rec.jurisdiction}</p>
                            <div class="reason">
                                <strong>Why needed:</strong> ${rec.reason}
                            </div>
                            <div class="details">
                                <strong>Details:</strong> ${rec.details}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${skipped.length > 0 ? `
                <div class="skipped-section">
                    <h4>❌ Not Needed</h4>
                    ${skipped.map(skip => `
                        <div class="skipped-card">
                            <h5>${skip.name}</h5>
                            <p class="reason">${skip.reason}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${recommendations.length === 0 && skipped.length === 0 ? `
                <div class="no-recommendations">
                    <p>Your current tax setup appears complete based on your answers!</p>
                </div>
            ` : ''}
        </div>
    `;
}

function generateMissingTaxPanel() {
    const required = taxConfigurationState.missingTaxes.filter(tax => tax.required);
    const likely = taxConfigurationState.missingTaxes.filter(tax => !tax.required);
    
    return `
        <div class="missing-taxes-panel">
            <h3>Missing Tax Analysis</h3>
            
            <div class="business-profile">
                <h4>Your Business Profile</h4>
                <p>📍 Based in: ${taxConfigurationState.businessProfile.location}</p>
                <p>👥 Employees in: ${taxConfigurationState.businessProfile.employeeLocations.join(', ')}</p>
                <p>💰 Payroll Size: ${taxConfigurationState.businessProfile.payrollSize}</p>
            </div>
            
            <div class="missing-required">
                <h4>❌ Missing Required</h4>
                ${required.map(tax => `
                    <div class="missing-tax-card required">
                        <h5>${tax.name}</h5>
                        <p class="reason">${tax.reason}</p>
                        <p class="details">${tax.details}</p>
                        <button class="add-btn" onclick="handlePillClick('add-${tax.name.toLowerCase().replace(/\s+/g, '-')}')">Add This Tax</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="missing-likely">
                <h4>⚠️ Likely Needed</h4>
                ${likely.map(tax => `
                    <div class="missing-tax-card likely">
                        <h5>${tax.name}</h5>
                        <p class="reason">${tax.reason}</p>
                        <p class="details">${tax.details}</p>
                        <button class="add-btn" onclick="handlePillClick('add-${tax.name.toLowerCase().replace(/\s+/g, '-')}')">Add This Tax</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateFrequencyPanel() {
    const allTaxes = taxConfigurationState.confirmedTaxes;
    const massachusettsTaxes = allTaxes.filter(tax => tax.jurisdiction && tax.jurisdiction.includes('Massachusetts'));
    const maineTaxes = allTaxes.filter(tax => tax.jurisdiction && tax.jurisdiction.includes('Maine'));
    
    return `
        <div class="frequency-assignment-panel">
            <h3>Deposit Frequencies</h3>
            
            <div class="frequency-cards-container" style="display: flex; flex-direction: column; gap: 20px; max-height: 600px; overflow-y: auto; padding-right: 8px;">
                
                ${massachusettsTaxes.length > 0 ? `
                    <!-- Massachusetts Taxes Card -->
                    <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                        <div style="margin-bottom: 16px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Massachusetts Taxes</h3>
                        </div>
                        
                        <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                            ${massachusettsTaxes.map((tax, index) => `
                                <div style="${index > 0 ? 'padding: 12px 0; border-top: 1px solid #e0e0e0;' : 'padding-bottom: 12px;'}">
                                    <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${tax.name}</div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                        <span style="color: #666;">Payment Frequency</span>
                                        <select class="frequency-select" data-tax-type="${tax.type}" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 120px;" onchange="updateTaxFrequency('${tax.type}', this.value)">
                                            <option value="monthly" ${tax.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                            <option value="quarterly" ${tax.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                                            <option value="semiweekly" ${tax.frequency === 'semiweekly' ? 'selected' : ''}>Semi-weekly</option>
                                            <option value="annual" ${tax.frequency === 'annual' ? 'selected' : ''}>Annual</option>
                                        </select>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${maineTaxes.length > 0 ? `
                    <!-- Maine Taxes Card -->
                    <div class="tax-configuration-card" style="background: #ffffff; border: 2px solid #28a745; border-radius: 8px; padding: 20px; position: relative;">
                        <span style="position: absolute; top: 20px; right: 20px; background: #28a745; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                            NEW - Pending Registration
                        </span>
                        <div style="margin-bottom: 16px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Maine Taxes</h3>
                        </div>
                        
                        <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                            ${maineTaxes.map((tax, index) => `
                                <div style="${index > 0 ? 'padding: 12px 0; border-top: 1px solid #e0e0e0;' : 'padding-bottom: 12px;'}">
                                    <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">${tax.name}</div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                                        <span style="color: #666;">Payment Frequency</span>
                                        <select class="frequency-select" data-tax-type="${tax.type}" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 120px;" onchange="updateTaxFrequency('${tax.type}', this.value)">
                                            <option value="monthly" ${tax.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                            <option value="quarterly" ${tax.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                                            <option value="semiweekly" ${tax.frequency === 'semiweekly' ? 'selected' : ''}>Semi-weekly</option>
                                            <option value="annual" ${tax.frequency === 'annual' ? 'selected' : ''}>Annual</option>
                                        </select>
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

// Update tax frequency when dropdown changes
function updateTaxFrequency(taxType, newFrequency) {
    const tax = taxConfigurationState.confirmedTaxes.find(t => t.type === taxType);
    if (tax) {
        tax.frequency = newFrequency;
        console.log(`Updated ${tax.name} frequency to ${newFrequency}`);
        
        // Regenerate the panel to show updated summary
        updateTaxPanelContent('frequency-assignment');
    }
}

// Confirm frequency assignments
function confirmFrequencyAssignments() {
    // Create confirmation message without the bullet list
    addMessage(`Great! Your deposit frequencies have been configured for Massachusetts and Maine taxes.

These settings will be applied to your UKG payroll system.`, 'assistant');
    
    // Move to the next step
    collectTaxDetails();
}

// Reset frequencies to defaults
function resetFrequencyAssignments() {
    showFrequencyAssignment();
}

function generatePayStatementPreviewPanel() {
    const massachusettsTaxes = taxConfigurationState.confirmedTaxes.filter(tax => tax.jurisdiction && tax.jurisdiction.includes('Massachusetts'));
    const maineTaxes = taxConfigurationState.confirmedTaxes.filter(tax => tax.jurisdiction && tax.jurisdiction.includes('Maine'));
    
    return `
        <div class="pay-statement-preview-panel">
            <h3>Employee Pay Statement Preview</h3>
            <p style="color: #666; margin-bottom: 20px;">How taxes will appear on employee paychecks</p>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Massachusetts Employee Section -->
                <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                    <h4 style="color: #333; margin-bottom: 15px;">Massachusetts Employees</h4>
                    
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">Employee Deductions (Visible on Pay Statement)</div>
                        <div style="border-left: 3px solid #30258D; padding-left: 15px; margin-bottom: 10px;">
                            <div style="padding: 4px 0;">• Federal Income Tax</div>
                            <div style="padding: 4px 0;">• Social Security (6.2%)</div>
                            <div style="padding: 4px 0;">• Medicare (1.45%)</div>
                            <div style="padding: 4px 0; font-weight: 600;">• MA State Income Tax</div>
                            <div style="padding: 4px 0; font-weight: 600;">• MA PFML Employee (0.32%)</div>
                        </div>
                        
                        <div style="font-weight: 600; color: #666; margin-top: 15px; margin-bottom: 10px;">Employer Taxes (Not Shown to Employees)</div>
                        <div style="border-left: 3px solid #dee2e6; padding-left: 15px;">
                            <div style="padding: 4px 0; color: #666;">• MA SUI (2.13%)</div>
                            <div style="padding: 4px 0; color: #666;">• MA PFML Employer (0.31%)</div>
                            <div style="padding: 4px 0; color: #666;">• MA EMAC (0.75%)</div>
                            <div style="padding: 4px 0; color: #666;">• MA WTF (0.056%)</div>
                            <div style="padding: 4px 0; color: #666;">• FICA Match (7.65%)</div>
                        </div>
                    </div>
                </div>
                
                <!-- Maine Employee Section -->
                ${maineTaxes.length > 0 ? `
                <div style="background: #ffffff; border: 2px solid #28a745; border-radius: 8px; padding: 20px; position: relative;">
                    <span style="position: absolute; top: 20px; right: 20px; background: #28a745; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                        NEW
                    </span>
                    <h4 style="color: #333; margin-bottom: 15px;">Maine Employees (Portland Office)</h4>
                    
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">Employee Deductions (Visible on Pay Statement)</div>
                        <div style="border-left: 3px solid #28a745; padding-left: 15px; margin-bottom: 10px;">
                            <div style="padding: 4px 0;">• Federal Income Tax</div>
                            <div style="padding: 4px 0;">• Social Security (6.2%)</div>
                            <div style="padding: 4px 0;">• Medicare (1.45%)</div>
                            <div style="padding: 4px 0; font-weight: 600; color: #28a745;">• ME State Income Tax</div>
                            <div style="padding: 4px 0; font-weight: 600; color: #28a745;">• ME PFML Employee (0.5%)</div>
                        </div>
                        
                        <div style="font-weight: 600; color: #666; margin-top: 15px; margin-bottom: 10px;">Employer Taxes (Not Shown to Employees)</div>
                        <div style="border-left: 3px solid #dee2e6; padding-left: 15px;">
                            <div style="padding: 4px 0; color: #666;">• ME SUTA (2.75%)</div>
                            <div style="padding: 4px 0; color: #666;">• ME PFML Employer (0.5%)</div>
                            <div style="padding: 4px 0; color: #666;">• ME Competitive Skills (0.06%)</div>
                            <div style="padding: 4px 0; color: #666;">• ME Unemployment Admin (0.06%)</div>
                            <div style="padding: 4px 0; color: #666;">• FICA Match (7.65%)</div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateExamplePayStatementPanel() {
    return `
        <div class="example-pay-statement-panel">
            <h3>Sample Employee Pay Statement</h3>
            
            <div style="background: #ffffff; border: 2px solid #333; border-radius: 8px; padding: 25px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #333;">EARNINGS STATEMENT</h2>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; color: #666;">
                        <span>Pay Period: 01/01/2025 - 01/15/2025</span>
                        <span>Payment Date: 01/20/2025</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <!-- Earnings Section -->
                    <div>
                        <h4 style="background: #f8f9fa; padding: 8px; margin: 0 0 10px 0; border-radius: 4px;">EARNINGS</h4>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="padding: 5px 0;">Regular Hours (80 @ $31.25)</td>
                                <td style="text-align: right; font-weight: 600;">$2,500.00</td>
                            </tr>
                            <tr style="border-top: 1px solid #dee2e6;">
                                <td style="padding: 5px 0; font-weight: 600;">Gross Pay</td>
                                <td style="text-align: right; font-weight: 600;">$2,500.00</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Deductions Section -->
                    <div>
                        <h4 style="background: #f8f9fa; padding: 8px; margin: 0 0 10px 0; border-radius: 4px;">DEDUCTIONS</h4>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="padding: 3px 0;">Federal Income Tax</td>
                                <td style="text-align: right;">-$312.50</td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 0;">Social Security</td>
                                <td style="text-align: right;">-$155.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 0;">Medicare</td>
                                <td style="text-align: right;">-$36.25</td>
                            </tr>
                            <tr style="background: #fffbf0;">
                                <td style="padding: 3px 0; font-weight: 600;">MA State Income Tax</td>
                                <td style="text-align: right; font-weight: 600;">-$125.00</td>
                            </tr>
                            <tr style="background: #fffbf0;">
                                <td style="padding: 3px 0; font-weight: 600;">MA PFML</td>
                                <td style="text-align: right; font-weight: 600;">-$8.00</td>
                            </tr>
                            <tr style="border-top: 2px solid #333;">
                                <td style="padding: 5px 0; font-weight: 600;">Total Deductions</td>
                                <td style="text-align: right; font-weight: 600;">-$636.75</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <!-- Net Pay -->
                <div style="background: #30258D; color: white; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center;">
                    <div style="font-size: 14px; margin-bottom: 5px;">NET PAY</div>
                    <div style="font-size: 28px; font-weight: bold;">$1,863.25</div>
                </div>
                
                <!-- YTD Summary -->
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <h4 style="font-size: 14px; color: #666; margin-bottom: 10px;">YEAR-TO-DATE SUMMARY</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 13px;">
                        <div>
                            <div style="color: #666;">YTD Gross</div>
                            <div style="font-weight: 600;">$2,500.00</div>
                        </div>
                        <div>
                            <div style="color: #666;">YTD Deductions</div>
                            <div style="font-weight: 600;">$636.75</div>
                        </div>
                        <div>
                            <div style="color: #666;">YTD Net</div>
                            <div style="font-weight: 600;">$1,863.25</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 6px; border-left: 4px solid #0066cc;">
                <strong>Note for Maine Employees:</strong> Replace "MA State Income Tax" with "ME State Income Tax" and "MA PFML" with "ME PFML" (at 0.5% instead of 0.32%)
            </div>
        </div>
    `;
}

function generateTaxDetailsPanel() {
    return `
        <div class="tax-details-panel">
            <h3>Tax IDs & Final Details</h3>
            
            <div class="tax-details-form">
                <div class="tax-section">
                    <h4>Federal Taxes</h4>
                    
                    <div class="input-group">
                        <label>Federal EIN (XX-XXXXXXX):</label>
                        <input type="text" class="tax-input" placeholder="12-3456789" onchange="updateTaxDetail('federal-ein', this.value)">
                        <span class="help-link" onclick="showEINHelp()">Where to find this?</span>
                    </div>
                </div>
                
                <div class="tax-section">
                    <h4>New Jersey Taxes</h4>
                    
                    <div class="input-group">
                        <label>New Jersey Withholding Tax ID:</label>
                        <input type="text" class="tax-input" placeholder="123456789" onchange="updateTaxDetail('nj-wit-id', this.value)">
                        <span class="help-link" onclick="showNJWITHelp()">How to get this?</span>
                    </div>
                    
                    <div class="input-group">
                        <label>New Jersey SUI Account ID:</label>
                        <input type="text" class="tax-input" placeholder="1234567-8" onchange="updateTaxDetail('nj-sui-id', this.value)">
                    </div>
                    
                    <div class="input-group">
                        <label>New Jersey SUI Rate (%):</label>
                        <input type="number" class="tax-input" step="0.1" placeholder="2.85" onchange="updateTaxDetail('nj-sui-rate', this.value)">
                        <span class="help-text">Your experience rate (employer-specific)</span>
                    </div>
                    
                    <div class="input-group">
                        <label>New Jersey Employer Registration:</label>
                        <input type="text" class="tax-input" placeholder="987654321" onchange="updateTaxDetail('nj-emp-reg', this.value)">
                        <span class="help-text">For SDI, FLI, and SWF</span>
                    </div>
                </div>
                
                <div class="missing-ids-section">
                    <h4>⚠️ Missing Registration</h4>
                    <div class="missing-id-item">
                        <p><strong>New York State Tax ID</strong> - Required for NY employees</p>
                        <div class="input-group">
                            <input type="text" class="tax-input" placeholder="Enter NY tax ID when available">
                            <button class="register-btn" onclick="showNYRegistrationHelp()">How to register?</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="completion-status">
                <h4>Setup Status</h4>
                <div class="status-item">
                    <span class="status-label">Federal Setup:</span>
                    <span class="status-value incomplete">Need EIN</span>
                </div>
                <div class="status-item">
                    <span class="status-label">New Jersey Setup:</span>
                    <span class="status-value incomplete">Need IDs & Rate</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Ready for Payroll:</span>
                    <span class="status-value incomplete">Pending completion</span>
                </div>
            </div>
        </div>
    `;
}

// Helper functions for tax configuration
function updateTaxFrequency(taxId, frequency) {
    taxConfigurationState.depositFrequencies[taxId] = frequency;
    console.log(`Updated ${taxId} frequency to ${frequency}`);
}

function updateTaxDetail(field, value) {
    taxConfigurationState.taxDetails[field] = value;
    console.log(`Updated ${field} to ${value}`);
}

function showEINHelp() {
    addMessage('Your Federal EIN (Employer Identification Number) can be found on:\n• IRS determination letter (CP 575)\n• Previous tax returns (Form 941, 940)\n• IRS correspondence\n• Payroll service statements\n\nIf you don\'t have an EIN yet, you can apply for one at irs.gov/ein', 'ai');
}

function showNJWITHelp() {
    addMessage('Your New Jersey Withholding Tax ID can be found on:\n• New Jersey Division of Taxation correspondence\n• Previous New Jersey tax filings\n• Your business registration documents\n\nTo register: Visit state.nj.us/treasury/taxation or call (609) 292-6400', 'ai');
}

function showNYRegistrationHelp() {
    addMessage('To register for New York State taxes:\n\n1. Visit tax.ny.gov\n2. Complete Form DTF-17 (Application for Registration)\n3. Or call (518) 485-2889\n\nYou\'ll need:\n• Federal EIN\n• Business address\n• First pay date in NY\n• Number of NY employees', 'ai');
}

// Tax information handlers
function showTaxInfo1() {
    addMessage('What additional taxes might I need?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Additional taxes you might need depend on your business:</strong>

<strong>Common additional taxes include:</strong>
• <strong>Federal FUTA</strong> - Federal unemployment tax (if you have employees)
• <strong>FICA Match</strong> - Employer's portion of Social Security and Medicare
• <strong>Local taxes</strong> - Some cities/counties have additional withholding requirements
• <strong>Workers' Compensation</strong> - Required in most states for employee coverage
• <strong>Disability Insurance</strong> - Required in some states beyond what we found

I\'ll help you identify which ones apply to your specific situation when we continue.`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue checking for additional taxes', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showTaxInfo2() {
    addMessage('How do I know if a tax applies to me?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>A tax typically applies to your business if:</strong>

• <strong>Employee location:</strong> You have employees working in a state/locality with that tax
• <strong>Business presence:</strong> You have offices, stores, or operations in that jurisdiction
• <strong>Employee count:</strong> You meet the minimum employee threshold (varies by tax)
• <strong>Industry requirements:</strong> Your industry has specific tax obligations
• <strong>Registration:</strong> You're registered to do business in that state/locality

<strong>Don\'t worry!</strong> I\'ll ask you specific questions to determine which taxes apply to your situation.`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue checking for additional taxes', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showTaxInfo3() {
    addMessage('What happens if I miss a tax?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Missing a required tax can lead to:</strong>

• <strong>Penalties and interest:</strong> Late filing fees that accumulate over time
• <strong>Back payments:</strong> You'll owe all missed payments plus penalties
• <strong>Compliance issues:</strong> Difficulty getting licenses or permits
• <strong>Employee impact:</strong> Incorrect withholdings may affect your employees' returns

<strong>The good news:</strong> We're doing this check now to prevent these issues! It's much easier to set up taxes correctly from the start than to fix them later.

Let's make sure we identify all your tax obligations.`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue checking for additional taxes', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'tax-info-1', text: 'Tell me more about taxes' },
                { action: 'tax-info-2', text: 'How can I avoid penalties?' }
            ]
        });
    }, 800);
    
    return true;
}

// Function to show tax verification steps
function showTaxVerificationSteps() {
    addMessage('How do I verify tax registrations?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Here's how to verify your tax registrations before configuration:</strong>

<strong>1. Gather Your Tax Documents</strong>
• Federal: IRS Letter CP-575 (EIN confirmation)
• State: Tax registration certificates
• Recent tax filings (Form 941, W-2s, state returns)
• Any correspondence from tax agencies

<strong>2. Verify Account Numbers</strong>
• Check your Federal EIN matches IRS records
• Confirm state account numbers with each agency
• Verify unemployment insurance rates and accounts
• Check local tax registrations if applicable

<strong>3. Confirm Active Status</strong>
• Log into federal/state tax portals
• Verify accounts are in good standing
• Check for any outstanding notices
• Confirm current tax rates and frequencies

<strong>4. Cross-Check Employee Locations</strong>
• Match employee work states with tax registrations
• Identify any missing state registrations
• Verify local tax requirements by location

<strong>Important:</strong> Having accurate information prevents payroll delays and compliance issues.`, 'ai', [
            { action: 'ready-for-additional', text: 'I\'ve verified, check for additional taxes', buttonType: 'primary' },
            { action: 'need-help-verifying', text: 'I need help finding this information', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'where-find-tax-docs', text: 'Where do I find these documents?' },
                { action: 'what-if-missing-info', text: 'What if information is missing?' },
                { action: 'can-verify-later', text: 'Can I verify this later?' }
            ]
        });
    }, 800);
    
    return true;
}

// Verification help functions
function showVerificationHelp() {
    addMessage('I need help finding this information', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>No worries! Here's where to start:</strong>

<strong>Contact Your Current Payroll Provider</strong>
They should have all your tax registration information on file. Request:
• A tax setup summary report
• List of all tax accounts and IDs
• Current tax rates and frequencies

<strong>Check Your Business Files</strong>
Look for folders labeled:
• "Tax Documents" or "IRS"
• "State Registrations"
• "Payroll Setup"
• Previous year tax returns

<strong>Online Tax Portals</strong>
• Federal: irs.gov (Business Tax Account)
• New Jersey: state.nj.us/treasury/taxation
• Most states have online business portals

<strong>Quick Tip:</strong> Your accountant or bookkeeper often has copies of all tax registrations.

Would you like to proceed with what information you have, or take time to gather more?`, 'ai', [
            { action: 'ready-for-additional', text: 'Proceed with what I have', buttonType: 'primary' },
            { action: 'pause-to-gather', text: 'I\'ll gather more information first', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showWhereToFindDocs() {
    addMessage('Where do I find these documents?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Common locations for tax documents:</strong>

<strong>📁 Physical Locations</strong>
• Filing cabinet under "Taxes" or "Business Registration"
• Payroll binder or folder
• Accountant's files (call them!)
• Safe or secure document storage

<strong>💻 Digital Locations</strong>
• Email search for "EIN", "tax registration", or "state tax ID"
• Cloud storage (Dropbox, Google Drive) in business folders
• Previous payroll provider's portal
• Accounting software document storage

<strong>🏛️ Request Copies From</strong>
• IRS: Call 1-800-829-4933 for EIN verification
• State tax agencies: Most have business helplines
• Your registered agent (if you have one)
• Previous payroll provider

Most businesses receive these documents when first setting up payroll.`, 'ai', [
            { action: 'ready-for-additional', text: 'Found them, continue', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showMissingInfoGuidance() {
    addMessage('What if information is missing?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>If tax information is missing, here's what to do:</strong>

<strong>🔴 Critical (Must Have)</strong>
• Federal EIN - Call IRS at 1-800-829-4933
• State tax account numbers - Contact state tax agency
• Current tax rates - Check with state unemployment office

<strong>🟡 Important (Can Get Later)</strong>
• Registration certificates - Request duplicates online
• Historical filings - Available from tax agencies
• Rate notices - Can be retrieved from state portals

<strong>🟢 Helpful (Nice to Have)</strong>
• Previous correspondence
• Old tax returns
• Setup documentation

<strong>What we can do now:</strong>
• Configure taxes you have complete information for
• Flag missing items for follow-up
• Add placeholder entries to complete later
• Contact agencies together during setup

The key is starting with what you have - we can always update later!`, 'ai', [
            { action: 'ready-for-additional', text: 'Let\'s work with what I have', buttonType: 'primary' },
            { action: 'help-contact-agencies', text: 'Help me contact agencies', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showVerifyLaterInfo() {
    addMessage('Can I verify this later?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Yes, but here's what you should know:</strong>

<strong>✅ You Can Verify Later If:</strong>
• You have basic information (EIN, state IDs)
• You know which taxes apply to you
• You're not running payroll immediately
• You have time before your first pay date

<strong>⚠️ Risks of Delaying Verification:</strong>
• Incorrect tax calculations
• Penalties for wrong rates
• Delays in first payroll
• Compliance issues

<strong>💡 Recommended Approach:</strong>
1. Set up with information you have now
2. Mark items that need verification
3. Set reminders to complete verification
4. Update before running first payroll

<strong>Important:</strong> All tax information must be verified before your first payroll run to ensure compliance.

How would you like to proceed?`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue with setup now', buttonType: 'primary' },
            { action: 'schedule-verification', text: 'Schedule verification reminder', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Function to show tax setup overview
function showTaxSetupOverview() {
    addMessage('What\'s involved in the complete tax setup process?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Here's your complete tax setup journey (5 main steps):</strong>

<strong>📋 Step 1: Tax Discovery & Verification</strong>
• Review extracted tax registrations
• Verify account numbers and status
• Identify any missing taxes
<em>You are here now!</em>

<strong>🔍 Step 2: Additional Tax Check</strong>
• Smart questions about your business
• Identify required taxes based on your situation
• Add any missing federal, state, or local taxes

<strong>📅 Step 3: Payment Frequency Assignment</strong>
• Set deposit schedules for each tax
• Choose from: Semiweekly, Monthly, Quarterly, Annual
• Match your IRS and state requirements

<strong>📝 Step 4: Tax Details Collection</strong>
• Enter tax account numbers (EIN, state IDs)
• Input current tax rates
• Add any special requirements

<strong>✅ Step 5: Review & Confirmation</strong>
• Final review of all settings
• Validation checks
• Export configuration for payroll

<strong>Time estimate:</strong> Most businesses complete this in 15-20 minutes.

Ready to continue?`, 'ai', [
            { action: 'ready-for-additional', text: 'Yes, let\'s continue', buttonType: 'primary' },
            { action: 'show-verification-steps', text: 'First, show me verification steps', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'can-skip-steps', text: 'Can I skip any steps?' },
                { action: 'what-if-stuck', text: 'What if I get stuck?' },
                { action: 'save-progress', text: 'Will my progress be saved?' }
            ]
        });
    }, 800);
    
    return true;
}

// Function to handle add new tax action
function handleAddNewTax() {
    addMessage('Add new tax', 'user');
    
    setTimeout(() => {
        addMessage('I can help you add a new tax to your configuration. What type of tax would you like to add?\n\n<strong>Common taxes you might need:</strong>\n\n<strong>Federal Taxes:</strong>\n• FUTA (Federal Unemployment Tax)\n• FICA Employer Match\n\n<strong>State Taxes:</strong>\n• Additional state income tax\n• State unemployment (SUTA/SUI)\n• State disability insurance\n• Workers\' compensation\n\n<strong>Local Taxes:</strong>\n• City income tax\n• Local school district tax\n• Municipal taxes\n\nWhich category would you like to explore?', 'ai', [
            { action: 'add-federal-tax', text: 'Add federal tax', buttonType: 'primary' },
            { action: 'add-state-tax', text: 'Add state tax', buttonType: 'primary' },
            { action: 'add-local-tax', text: 'Add local tax', buttonType: 'primary' },
            { action: 'back-to-tax-config', text: 'Go back', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'help-choosing-tax', text: 'Help me choose the right tax' },
                { action: 'tax-requirements-by-state', text: 'What taxes does my state require?' },
                { action: 'tax-thresholds', text: 'When do certain taxes apply?' }
            ]
        });
    }, 800);
    
    return true;
}

// Migration information handlers
function showMigrationInfo1() {
    addMessage('What is UKG migration?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>UKG Migration means transitioning from your previous payroll provider to UKG:</strong>

<strong>What's involved:</strong>
• <strong>Tax Account Transfer:</strong> Moving your existing tax accounts to UKG's system
• <strong>History Import:</strong> Bringing over year-to-date payroll data
• <strong>Registration Updates:</strong> Updating your tax agency contacts
• <strong>Compliance Continuity:</strong> Ensuring no gaps in tax filings

<strong>Why it matters:</strong>
Your previous vendor may have handled taxes automatically. With UKG, we need to ensure all tax obligations are properly configured to avoid penalties or missed filings.`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue with tax setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showMigrationInfo2() {
    addMessage('Why are these taxes important?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Each tax type serves a critical purpose:</strong>

<strong>Unemployment Taxes (FUTA/SUTA):</strong>
• Funds unemployment benefits for laid-off workers
• Mandatory for all employers with W-2 employees
• Rates vary by state and your claims history

<strong>Employer Taxes (FICA Match):</strong>
• Your share of Social Security and Medicare
• Must match employee contributions exactly
• Non-negotiable federal requirement

<strong>State Registrations:</strong>
• Required wherever employees work
• Enables legal payroll operations
• Prevents penalties and business disruptions

Missing any of these can result in significant penalties and back payments.`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue with tax setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showMigrationInfo3() {
    addMessage('What if I\'m not sure?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>No worries! Here's what to do if you're unsure:</strong>

<strong>Common scenarios:</strong>
• <strong>"I think my old vendor handled this"</strong> → Choose "Previous vendor handled this"
• <strong>"I might have documents somewhere"</strong> → Choose "I have accounts separately"
• <strong>"This is all new to me"</strong> → Choose "Need new setup"

<strong>What happens next:</strong>
• We'll guide you through finding the information
• UKG specialists can help with registrations
• We'll ensure nothing gets missed

<strong>Remember:</strong> It's better to be thorough now than discover missing taxes after go-live. We're here to help!`, 'ai', [
            { action: 'ready-for-additional', text: 'Continue with tax setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

// Maine-specific registration information handlers
function showMaineRegistrationTime() {
    addMessage('How long does Maine registration take?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Maine registration typically takes 2-4 weeks:</strong>

<strong>Timeline breakdown:</strong>
• <strong>Maine Revenue Services (Withholding):</strong> 1-2 weeks
  - Online application: 3-5 business days
  - Paper application: 7-10 business days
  - Account activation: Additional 2-3 days

• <strong>Maine Department of Labor (SUI):</strong> 1-2 weeks
  - Initial registration: 5-7 business days
  - Rate determination: Additional 5-7 days
  - First deposit setup: 2-3 days

<strong>Fast-track options:</strong>
• <strong>Expedited processing:</strong> Available for urgent needs (additional fees may apply)
• <strong>UKG assistance:</strong> We can help coordinate with state agencies
• <strong>Temporary withholding:</strong> Start withholding while registration processes

<strong>Important:</strong> You can begin the configuration in UKG while registration is pending. We'll hold the taxes until your accounts are active.`, 'ai', [
            { action: 'add-maine-taxes', text: 'Start Maine tax setup now', buttonType: 'primary' },
            { action: 'configure-while-registering', text: 'Configure while registering', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function showNoRegistrationConsequence() {
    addMessage('What happens if I don\'t register before the next payroll?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Running payroll without Maine registration has serious consequences:</strong>

<strong>Immediate impacts:</strong>
• <strong>Cannot withhold Maine taxes:</strong> Employees become personally liable
• <strong>Penalties accrue:</strong> $50-$500 per employee per pay period
• <strong>Interest charges:</strong> 12% annual rate on unpaid taxes
• <strong>Employee issues:</strong> Under-withholding creates tax problems for workers

<strong>Compliance violations:</strong>
• <strong>State penalties:</strong> Up to $1,000 per occurrence
• <strong>Late filing fees:</strong> 10% of tax amount plus interest
• <strong>Criminal penalties:</strong> Willful failure can result in prosecution

<strong>Your options:</strong>
1. <strong>Delay Maine employees' first payroll</strong> until registration completes
2. <strong>Start registration immediately</strong> and request expedited processing
3. <strong>Use a temporary staffing agency</strong> for Maine employees initially
4. <strong>Withhold at maximum rates</strong> and adjust later (requires employee consent)

<strong>Recommendation:</strong> Start the registration process today. UKG can help you manage the timing to avoid penalties.`, 'ai', [
            { action: 'add-maine-taxes', text: '1. Add Maine taxes now', buttonType: 'primary' },
            { action: 'delay-maine-payroll', text: '2. I\'ll delay Maine payroll' },
            { action: 'need-help-with-timing', text: '3. Help me with timing' }
        ]);
    }, 800);
    
    return true;
}

// New Federal Tax Functions
window.proceedToStateTaxes = function proceedToStateTaxes() {
    // Don't add a duplicate user message - it's already added by sendMessage()
    
    removeAllPills();
    
    setTimeout(() => {
        // Initialize state tax configuration with actual 2025 rates
        taxConfigurationState.currentStep = 'state-income-tax';
        taxConfigurationState.statesTaxes = [
            { 
                state: 'Massachusetts', 
                employees: 50, 
                hasIncomeTax: true,
                incomeTaxId: '5528374', 
                suiAccountId: '8837264', 
                suiRate: '2.13', // 2025 new employer rate (non-construction)
                suiWageBase: '$15,000',
                pfmlAccountId: '8837264', // Usually same as SUI account
                emacAccountId: '7739281',
                workforceTrainingFundRate: '0.056', // 2025 rate
                sdiRate: 'N/A'
            }
        ];
        
        // Show the right panel with state tax details
        updateTaxPanelContent('state-tax-configuration');
        
        addMessage(`<strong>State Income Tax Setup</strong>

I've extracted state tax information from your uploaded tax documents. To ensure that I can accurately set these up for you, please review and update anything that needs changing. All edits save automatically.

<strong>States Requiring Tax Setup:</strong>

✓ Massachusetts (5 taxes)

<strong>Are these state tax details correct?</strong>`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Looks correct, next step', buttonType: 'primary' },
            { action: 'add-another-state', text: 'Add new tax', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS,
            sourceDocuments: {
                count: 2,
                files: [
                    { name: 'Paycom Quarterly Payroll Register_Q12025.xlsx', description: '' },
                    { name: 'Payroll_Register_JantoJun2025.xlsx', description: '' }
                ]
            }
        });
    }, 1000);
    
    return true;
}

function verifyFederalEIN() {
    addMessage('How do we verify tax registrations?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Verifying Your Federal Tax Registrations:</strong>

<strong>Federal EIN (Employer Identification Number):</strong>
• Found on: Form SS-4, IRS correspondence, tax returns
• Format: XX-XXXXXXX (9 digits with hyphen)
• Verify at: IRS Business Account online

<strong>Documents to gather:</strong>
• Most recent Form 941 (Quarterly Federal Tax Return)
• Form 940 (Annual FUTA Return)
• IRS deposit schedule notice
• Power of Attorney (Form 2848) if using a tax professional

<strong>Verification checklist:</strong>
✓ Confirm EIN matches all federal filings
✓ Check deposit schedule (monthly vs semi-weekly)
✓ Verify EFTPS enrollment status
✓ Confirm authorized representatives

<strong>Quick tip:</strong> Your EIN never changes - if you have it on any federal tax document, that\'s your number!`, 'ai', [
            { action: 'federal-taxes-look-good', text: 'Continue with setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showFederalTaxSetupOverview() {
    addMessage('What\'s involved in the complete tax setup process?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Complete Federal Tax Setup Process:</strong>

<strong>Phase 1: Federal Taxes (Current Step)</strong>
✓ Configure Federal Income Tax withholding
✓ Set up FICA (Social Security & Medicare)
✓ Configure FUTA (Federal Unemployment)
✓ Establish deposit schedules

<strong>Phase 2: State Income Taxes (Next)</strong>
• Configure withholding for each state
• Set up state-specific tax tables
• Define deposit frequencies
• Local taxes where applicable

<strong>Phase 3: State Unemployment & Other Taxes</strong>
• SUTA rates and wage bases
• Disability insurance (where required)
• Workers' compensation
• Family leave programs

<strong>Phase 4: Verification & Testing</strong>
• Validate all tax IDs
• Test withholding calculations
• Review deposit schedules
• Confirm filing requirements

<strong>Timeline:</strong> Full setup typically takes 15-20 minutes with all information ready.`, 'ai', [
            { action: 'federal-taxes-look-good', text: 'Continue with setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function showFITFICAFUTAInfo() {
    addMessage('How does UKG handle FIT, FICA, FUTA calculations, withholdings and remittances?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>How UKG Handles Federal Tax Calculations & Remittances:</strong>

<strong>📊 FIT (Federal Income Tax):</strong>
• <strong>Calculations:</strong> UKG uses IRS Publication 15-T tax tables, updated automatically
• <strong>Withholdings:</strong> Based on employee W-4 elections (filing status, allowances, additional withholding)
• <strong>Remittances:</strong> Deposited via EFTPS on your schedule (semi-weekly or monthly)

<strong>🔄 FICA (Social Security & Medicare):</strong>
• <strong>Employee Withholding:</strong>
  - Social Security: 6.2% on wages up to $168,600 (2025 limit)
  - Medicare: 1.45% on all wages
  - Additional Medicare: 0.9% on wages over $200,000
• <strong>Employer Match:</strong> UKG automatically calculates matching 7.65%
• <strong>Remittances:</strong> Combined with FIT deposits via EFTPS

<strong>📋 FUTA (Federal Unemployment Tax):</strong>
• <strong>Calculation:</strong> 0.6% on first $7,000 per employee (after state credit)
• <strong>No employee withholding:</strong> 100% employer-paid
• <strong>Remittances:</strong> Quarterly deposits when liability exceeds $500

<strong>🚀 UKG Automation Features:</strong>
✓ Real-time tax calculations with each payroll run
✓ Automatic EFTPS deposits on required dates
✓ Form 941 quarterly filing preparation
✓ Year-end W-2 and 1099 generation
✓ Tax law updates applied automatically
✓ Penalty avoidance through timely deposits

<strong>IRS Compliance:</strong> UKG maintains SOC 1 Type 2 certification and follows all IRS regulations for electronic filing and deposits.`, 'ai', [
            { action: 'federal-taxes-look-good', text: 'Got it, continue with setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}



// Function to proceed to deposit schedules after Maine decision
function proceedToPaymentSchedules() {
    addMessage('Continue to deposit schedules', 'user');
    
    removeAllPills();
    
    setTimeout(() => {
        showPaymentScheduleConfiguration();
    }, 500);
    
    return true;
}



// Function to show Maine tax recommendation
function showMaineTaxRecommendation() {
    // Set up welcome state to include Maine as an employee state
    if (!window.welcomeState) {
        window.welcomeState = {};
    }
    window.welcomeState.employeeStates = ['Massachusetts', 'Maine'];
    window.welcomeState.employeeCount = 75; // 50 in MA + 25 in ME
    
    // Use the existing business_expansion scenario
    askMigrationQuestion('business_expansion');
    
    return true;
}

// State Tax Functions
function confirmStateTaxes() {
    addMessage('Looks correct, next step', 'user');
    
    removeAllPills();
    
    // Add Massachusetts taxes to confirmedTaxes if not already present
    const stateData = taxConfigurationState.statesTaxes?.[0];
    if (stateData && stateData.state === 'Massachusetts') {
        // Add Massachusetts taxes if they're not already in confirmedTaxes
        const maTaxes = [
            {
                name: 'State Income Tax',
                jurisdiction: 'Massachusetts',
                type: 'ma_sit',
                taxId: stateData.incomeTaxId || '',
                rate: 'Variable',
                frequency: 'monthly',
                confirmed: true
            },
            {
                name: 'SUI',
                jurisdiction: 'Massachusetts', 
                type: 'ma_sui',
                taxId: stateData.suiAccountId || '',
                rate: stateData.suiRate || '2.13',
                frequency: 'quarterly',
                confirmed: true
            },
            {
                name: 'PFML',
                jurisdiction: 'Massachusetts',
                type: 'ma_pfml',
                taxId: stateData.pfmlAccountId || '',
                rate: '0.63',
                frequency: 'quarterly',
                confirmed: true
            },
            {
                name: 'EMAC',
                jurisdiction: 'Massachusetts',
                type: 'ma_emac',
                taxId: stateData.emacAccountId || '',
                rate: '0.75',
                frequency: 'quarterly',
                confirmed: true
            },
            {
                name: 'WTF',
                jurisdiction: 'Massachusetts',
                type: 'ma_wtf',
                rate: stateData.workforceTrainingFundRate || '0.056',
                frequency: 'quarterly',
                confirmed: true
            }
        ];
        
        // Check if MA taxes already exist in confirmedTaxes
        const hasMATaxes = taxConfigurationState.confirmedTaxes.some(tax => 
            tax.jurisdiction === 'Massachusetts'
        );
        
        if (!hasMATaxes) {
            taxConfigurationState.confirmedTaxes.push(...maTaxes);
        }
    }
    
    setTimeout(() => {
        // Add the analyzing message with spinner
        const analyzingMessageId = Date.now();
        const analyzingHtml = `
            <div id="msg-${analyzingMessageId}" class="message ai-message">
                <div class="message-content">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="/static/bryte-logo.svg" alt="Bryte" style="width: 24px; height: 24px;">
                        <span style="color: #666; font-weight: 500;">Bryte is analyzing...</span>
                        <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #e0e0e0; border-top: 2px solid #333; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for spinner animation if not already present
        if (!document.querySelector('#spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add the analyzing message
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.insertAdjacentHTML('beforeend', analyzingHtml);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        // After 3 seconds, show Maine recommendation
        setTimeout(() => {
            // Remove the analyzing message
            const analyzingMsg = document.getElementById(`msg-${analyzingMessageId}`);
            if (analyzingMsg) {
                analyzingMsg.remove();
            }
            
            // Show Maine tax recommendation
            showMaineTaxRecommendation();
        }, 3000);
    }, 1000);
    
    return true;
}

function addAnotherState() {
    addMessage('Add another state', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Add Additional State:</strong>

Which state do you need to add? Common reasons for adding states:
• Remote employees in other states
• New office locations
• Recent business expansion
• Temporary work assignments

Please enter the state name or select from common additions:`, 'ai', [
            { action: 'add-california', text: 'California', buttonType: 'secondary' },
            { action: 'add-texas', text: 'Texas', buttonType: 'secondary' },
            { action: 'add-florida', text: 'Florida', buttonType: 'secondary' },
            { action: 'add-custom-state', text: 'Other state', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

function modifyStateList() {
    addMessage('Modify state list', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Modify State List:</strong>

Current states configured:
• New York - 45 employees
• New Jersey - 38 employees
• Massachusetts - 22 employees
• New Hampshire - 8 employees

What would you like to change?`, 'ai', [
            { action: 'remove-state', text: 'Remove a state', buttonType: 'secondary' },
            { action: 'update-employee-count', text: 'Update employee counts', buttonType: 'secondary' },
            { action: 'add-local-taxes', text: 'Add local taxes', buttonType: 'secondary' },
            { action: 'state-taxes-confirmed', text: 'Actually, this is correct', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

function verifyTaxRegistrations() {
    addMessage('How do we verify tax registrations?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📋 Verifying Tax Registrations:</strong>

<strong>Federal Registration Verification:</strong>
• EIN (Employer Identification Number)
• Found on: Form SS-4, IRS CP-575 notice
• Verify at: IRS Business Account online

<strong>State Tax Registrations to Verify:</strong>

<strong>Massachusetts:</strong>
• MA Withholding Account Number
• Found on: Form M-941, DOR welcome letter
• Verify at: MassTaxConnect online portal

<strong>State Unemployment Insurance:</strong>
• MA SUI Account Number
• Found on: Form M-940, DUA correspondence
• Verify at: Massachusetts UI Online

<strong>Where to Find Your Tax Numbers:</strong>
✓ Previous tax returns (941, 940, state returns)
✓ Registration confirmation letters
✓ Online tax portal accounts
✓ Previous payroll provider reports

<strong>Verification Methods:</strong>
1. Log into each agency's online portal
2. Call the agency with your tax ID
3. Review recent tax correspondence
4. Check with your accountant/tax preparer

<strong>Important:</strong> Having correct tax registration numbers ensures seamless tax deposits and filing in UKG.`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Continue with setup', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function showCompleteTaxSetup() {
    addMessage('What is involved in the complete tax setup process?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📊 Complete Tax Setup Process Overview:</strong>

<strong>Phase 1: Information Gathering (Current Stage)</strong>
✓ Import tax data from previous payroll
✓ Verify federal and state registrations
✓ Confirm tax jurisdictions and rates
✓ Review employee work locations

<strong>Phase 2: Configuration & Validation</strong>
• Enter tax account numbers
• Configure deposit frequencies
• Set up tax payment schedules
• Map tax codes to general ledger

<strong>Phase 3: Employee Setup</strong>
• Import W-4 and state withholding forms
• Set up special tax situations
• Configure multi-state employees
• Handle tax-exempt employees

<strong>Phase 4: Testing & Verification</strong>
• Run test payroll calculations
• Verify tax amounts match prior system
• Review deposit schedules
• Confirm filing requirements

<strong>Phase 5: Go-Live Preparation</strong>
• Enter year-to-date amounts
• Set up banking for tax payments
• Schedule first tax deposits
• Configure tax filing preferences

<strong>Timeline:</strong>
• Information gathering: 1-2 days
• Configuration: 2-3 days
• Testing: 1-2 days
• Total: 4-7 business days

<strong>Support Available:</strong>
✓ UKG implementation specialist guidance
✓ Tax configuration wizard (what we're using now)
✓ Documentation and checklists
✓ Validation tools to catch errors`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Understood, continue', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function showAdditionalInfoNeeded() {
    addMessage('What additional information would I need to provide for tax set up?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📝 Additional Information Needed for Tax Setup:</strong>

<strong>Tax Account Information:</strong>
✓ Federal EIN (Employer ID Number)
✓ State withholding account numbers
✓ State unemployment account numbers
✓ Local tax account numbers (if applicable)
✓ Workers' compensation policy numbers

<strong>Tax Rates & Frequencies:</strong>
✓ State unemployment insurance rates
✓ Workers' compensation rates by class code
✓ Experience rating modifications
✓ Tax deposit frequencies (monthly, semi-weekly, etc.)

<strong>Employee-Specific Information:</strong>
✓ W-4 forms (federal withholding)
✓ State withholding certificates
✓ Tax-exempt status documentation
✓ Multi-state work allocations
✓ Special withholding situations

<strong>Year-to-Date Information (for mid-year starts):</strong>
✓ YTD wages by employee
✓ YTD federal tax withheld
✓ YTD state/local taxes withheld
✓ YTD employer tax payments
✓ Quarterly 941 and state return copies

<strong>Banking Information:</strong>
✓ Tax payment bank account details
✓ EFTPS enrollment (federal taxes)
✓ State electronic payment enrollment
✓ ACH authorization forms

<strong>Documents to Have Ready:</strong>
• Most recent payroll register
• Last quarter's tax returns
• Employee census with addresses
• Previous year's W-2s
• State registration certificates

<strong>Good News:</strong> We've already extracted most of this from your uploaded documents. You'll just need to verify and provide missing account numbers.`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Got it, continue', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function showSSMedicareExemptions() {
    addMessage('Do you have any employees exempted from Social Security and Medicare withholding?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>🏥 Social Security & Medicare Exemptions:</strong>

<strong>Common Exemption Categories:</strong>

<strong>1. Religious Exemptions</strong>
• Ministers/clergy (can opt out with Form 4361)
• Members of recognized religious sects (Form 4029)
• Amish, Mennonite communities often qualify

<strong>2. Student Employees</strong>
• Students working for their school
• Must be enrolled and attending classes
• Exemption applies only to school employment

<strong>3. Foreign Workers</strong>
• F-1, J-1, M-1, Q-1 visa holders (certain conditions)
• Foreign government employees
• Depends on visa type and tax treaties

<strong>4. Government Employees</strong>
• Some state/local government employees
• Hired before April 1, 1986
• Covered by qualifying pension system

<strong>5. Family Employment</strong>
• Children under 18 employed by parents
• Parent employed by child
• Spouse employed by spouse (sole proprietorship)

<strong>How to Handle in UKG:</strong>
✓ Set up special tax codes for exempt employees
✓ Configure exemption reason codes
✓ Maintain supporting documentation
✓ System automatically excludes from FICA calculations

<strong>Important Requirements:</strong>
• Must have valid exemption certificates on file
• Exemptions must be reviewed annually
• Some exemptions are temporary (student status)
• Improper exemptions can result in penalties

<strong>Do any of your employees fall into these categories?</strong>`, 'ai', [
            { action: 'have-exemptions', text: 'Yes, we have exempt employees', buttonType: 'primary' },
            { action: 'no-exemptions', text: 'No, all employees pay FICA', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function handleHaveExemptions() {
    addMessage('Yes, we have exempt employees', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Employee FICA Exemptions - Next Steps:</strong>

I've noted that you have employees exempt from Social Security and Medicare withholding.

<strong>During employee setup, we'll need to:</strong>
• Identify which employees are exempt
• Select the exemption category for each
• Upload supporting documentation
• Configure special tax codes

<strong>Documentation Required:</strong>
✓ Form 4361 for clergy exemptions
✓ Form 4029 for religious exemptions
✓ Student enrollment verification
✓ Visa documentation for foreign workers

<strong>Important:</strong> The system will create a separate tax group for exempt employees to ensure proper payroll processing.

Let's continue with your tax configuration. We'll handle the exemptions during the employee setup phase.`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Continue with setup', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function handleNoExemptions() {
    addMessage('No, all employees pay FICA', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>FICA Configuration Confirmed:</strong>

Perfect! All employees will have standard Social Security and Medicare withholding applied.

<strong>Standard FICA Rates for 2025:</strong>
• Social Security: 6.2% (employee) + 6.2% (employer)
• Medicare: 1.45% (employee) + 1.45% (employer)
• Additional Medicare: 0.9% on wages over $200,000

The system will automatically:
✓ Calculate FICA on all eligible wages
✓ Apply wage base limits ($176,100 for Social Security)
✓ Handle Additional Medicare Tax when applicable
✓ Generate proper tax deposits and filings

Let's continue with your state tax configuration.`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Continue', buttonType: 'primary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: STATE_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function addMaineTaxConfiguration() {
    addMessage('Yes, add', 'user');
    
    removeAllPills();
    
    // IMPORTANT: Keep the tax panel visible - don't hide it
    // Update it to show Maine has been added
    setTimeout(() => {
        // Add Maine to the states list
        if (!taxConfigurationState.statesTaxes) {
            taxConfigurationState.statesTaxes = [];
        }
        
        taxConfigurationState.statesTaxes.push({
            state: 'Maine',
            employees: 1,
            hasIncomeTax: true,
            incomeTaxId: 'PENDING', 
            suiAccountId: 'PENDING',
            suiRate: '',  // Blank - rate pending
            suiWageBase: '$12,000',
            sdiRate: 'N/A'
        });
        
        // Update the panel to show Maine has been added
        generateStateTaxConfigurationPanel();
        
        addMessage(`Perfect! I\'ve added Maine to your tax configuration. The registration requirements have been noted and Sarah Chen\'s tax setup will be ready once you complete the Maine employer registration.

Now let's move on to setting up your deposit frequency schedules.`, 'ai');
        
        // Transition to deposit frequency workflow after a brief pause
        setTimeout(() => {
            // Enter the pay-schedule workflow
            if (window.progressManager) {
                window.progressManager.enterWorkflow('pay-schedule', 0);
            }
            
            // Show deposit schedule configuration with extracted data
            showPaymentScheduleConfiguration();
        }, 1500);
    }, 1000);
    
    return true;
}

function skipMaineTax() {
    addMessage('I\'ll handle this later', 'user');
    
    removeAllPills();
    
    // IMPORTANT: Keep the tax panel visible - don't hide it
    // The panel should remain showing the state tax configuration
    
    setTimeout(() => {
        addMessage(`<strong>Understood - Maine tax setup deferred.</strong>

I've made a note that you'll handle Maine registration separately. 

<div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 12px; margin: 16px 0;">
    <strong>⚠️ Important Reminder:</strong>
    <p style="margin: 8px 0;">Sarah Chen's first payroll must include Maine withholding. Please ensure registration is complete before her first pay date.</p>
</div>

<strong>For your records:</strong>
• Employee: Sarah Chen
• Location: Portland, ME  
• Deadline: Register within 30 days of first payroll
• Required: Maine withholding account & SUI registration

Now let's continue with setting up your deposit frequency schedules.`, 'ai');
        
        // Continue to deposit schedules after a brief pause
        setTimeout(() => {
            // Enter the pay-schedule workflow
            if (window.progressManager) {
                window.progressManager.enterWorkflow('pay-schedule', 0);
            }
            
            // Show deposit schedule configuration
            showPaymentScheduleConfiguration();
        }, 1500);
    }, 1000);
    
    return true;
}

// Maine registration timeline handler
function showMaineRegistrationTimeline() {
    removeAllPills();
    
    setTimeout(() => {
        addMessage(`<strong>Maine Registration Timeline:</strong>

<strong>Typical processing times:</strong>
• Maine Revenue Services (withholding): 3-5 business days online
• Maine Department of Labor (SUI): 5-7 business days
• Total time to complete: 1-2 weeks with all documentation

<strong>Expedited options:</strong>
• Online registration available for immediate account number
• Phone registration: Next business day processing
• UKG can process payroll with pending registrations if applications are submitted

<strong>What you'll need:</strong>
• Federal EIN
• Business formation documents
• Maine business address (can use registered agent)
• Banking information for tax deposits

I recommend starting the registration today to ensure everything is ready before Sarah's first payroll.`, 'ai', [
            { action: 'add-maine-tax', text: 'Yes, add', buttonType: 'primary' },
            { action: 'back-to-maine-decision', text: 'Back to options', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for modifying Maine taxes
function modifyMaineTaxes() {
    addMessage('Edit Maine tax details', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Edit Maine Tax Details</strong>

You can update the Maine tax information in the panel on the right. The editable fields include:
• Maine Withholding ID (when you receive it)
• Maine SUI Account ID (when you receive it)
• SUI Rate (if you have an experience rate)

The other rates are standard Maine rates for 2025 and cannot be modified.

Once you\'ve made your changes, we can continue to deposit frequency setup.`, 'ai', [
            { action: 'confirm-maine-taxes', text: 'Done editing, continue', buttonType: 'primary' },
            { action: 'remove-maine-taxes', text: 'Actually, remove Maine taxes', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for removing Maine taxes
function removeMaineTaxes() {
    addMessage('Remove Maine taxes', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Remove Maine Taxes?</strong>

Are you sure you want to remove Maine tax configuration? This means:
• Sarah Chen (your Portland employee) won't have proper tax withholding
• You'll need to handle Maine taxes manually outside of UKG
• You may face compliance issues if not properly registered

<div style="background: #ffebee; border: 1px solid #ef5350; border-radius: 4px; padding: 12px; margin: 16px 0;">
    <strong>⚠️ Important:</strong> Most companies with Maine employees are required to withhold Maine state taxes.
</div>

What would you like to do?`, 'ai', [
            { action: 'keep-maine-taxes', text: 'Keep Maine taxes', buttonType: 'primary' },
            { action: 'confirm-remove-maine', text: 'Yes, remove them', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for configuring while registering
function showConfigureWhileRegistering() {
    addMessage('I\'m still registering in Maine, can I configure taxes?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Yes, you can configure Maine taxes while registering!</strong>

<div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px; padding: 12px; margin: 16px 0;">
    <strong>✅ Good news:</strong> You can set up the tax configuration now and add your account numbers later when you receive them.
</div>

<strong>Here's how it works:</strong>
1. <strong>Configure now:</strong> Set up all 5 Maine taxes with the correct rates
2. <strong>Leave IDs blank:</strong> The Withholding ID and SUI Account ID fields can stay empty for now
3. <strong>Update later:</strong> Add the account numbers when Maine approves your registration
4. <strong>Before first payroll:</strong> Ensure all IDs are entered before processing Sarah's first paycheck

<strong>Timeline expectation:</strong>
• Maine registration: 2-3 business days online
• Account numbers received: Within 1 week
• Must have before: Sarah's first payroll run

<strong>Pro tip:</strong> Setting up the configuration now means you're ready to go as soon as your registration is approved!`, 'ai', [
            { action: 'confirm-maine-taxes', text: 'Great, continue to deposit frequency', buttonType: 'primary' },
            { action: 'modify-maine-taxes', text: 'Let me check the details first', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for keeping Maine taxes after removal warning
function keepMaineTaxes() {
    addMessage('Keep Maine taxes', 'user');
    
    setTimeout(() => {
        addMessage(`Good decision! Maine taxes will remain configured for your Portland employee.

Let's continue with setting up your deposit frequencies.`, 'ai', [
            { action: 'confirm-maine-taxes', text: 'Continue to deposit frequency', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for confirming Maine tax removal
function confirmRemoveMaineTaxes() {
    addMessage('Yes, remove them', 'user');
    
    // Remove Maine from statesTaxes
    if (taxConfigurationState.statesTaxes) {
        taxConfigurationState.statesTaxes = taxConfigurationState.statesTaxes.filter(
            state => state.state !== 'Maine'
        );
    }
    
    // Remove Maine taxes from confirmedTaxes
    taxConfigurationState.confirmedTaxes = taxConfigurationState.confirmedTaxes.filter(
        tax => !tax.type.startsWith('me_')
    );
    
    // Regenerate the panel
    generateStateTaxConfigurationPanel();
    
    setTimeout(() => {
        addMessage(`Maine taxes have been removed from your configuration.

<div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 12px; margin: 16px 0;">
    <strong>⚠️ Remember:</strong> You'll need to handle Maine tax withholding manually for Sarah Chen until you set up Maine taxes in the system.
</div>

Let's continue with your Massachusetts tax deposit frequencies.`, 'ai', [
            { action: 'proceed-to-deposit-schedules', text: 'Continue to deposit frequency', buttonType: 'primary' },
            { action: 'add-maine-back', text: 'Wait, add Maine back', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Handler for adding Maine back after removal
function addMaineBack() {
    addMessage('Wait, add Maine back', 'user');
    
    // Add Maine back to statesTaxes
    if (!taxConfigurationState.statesTaxes.find(s => s.state === 'Maine')) {
        taxConfigurationState.statesTaxes.push({ 
            state: 'Maine', 
            employees: 25, 
            hasIncomeTax: true,
            incomeTaxId: '', // Empty - not applied yet
            suiAccountId: '', // Empty - not applied yet
            suiRate: '2.75',
            suiWageBase: '$12,000',
            pfmlAccountId: '', // Empty - not applied yet
            competitiveSkillsFundRate: '0.06',
            unemploymentAdminFundRate: '0.06',
            sdiRate: 'N/A',
            newlyAdded: true
        });
    }
    
    // Add Maine taxes back to confirmedTaxes
    const maineTaxes = [
        { name: 'Maine State Income Tax', jurisdiction: 'Maine Revenue Services', type: 'me_income', confirmed: true, newlyAdded: true },
        { name: 'Maine SUTA', jurisdiction: 'Maine Department of Labor', type: 'me_suta', confirmed: true, newlyAdded: true },
        { name: 'Maine PFML', jurisdiction: 'Maine Department of Labor', type: 'me_pfml', confirmed: true, newlyAdded: true },
        { name: 'Maine Competitive Skills Fund', jurisdiction: 'Maine Department of Labor', type: 'me_competitive_skills', confirmed: true, newlyAdded: true },
        { name: 'Maine Unemployment Admin Fund', jurisdiction: 'Maine Department of Labor', type: 'me_unemployment_admin', confirmed: true, newlyAdded: true }
    ];
    
    maineTaxes.forEach(tax => {
        if (!taxConfigurationState.confirmedTaxes.find(t => t.type === tax.type)) {
            taxConfigurationState.confirmedTaxes.push(tax);
        }
    });
    
    // Regenerate the panel
    generateStateTaxConfigurationPanel();
    
    setTimeout(() => {
        addMessage(`Good call! Maine taxes have been added back to your configuration.

All 5 Maine taxes are now set up for Sarah Chen in Portland. You can add the account numbers when you receive them from Maine.

Let's continue with deposit frequency setup.`, 'ai', [
            { action: 'confirm-maine-taxes', text: 'Continue to deposit frequency', buttonType: 'primary' },
            { action: 'modify-maine-taxes', text: 'Review Maine tax details', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}

// Maine tax penalties handler
function showMaineTaxPenalties() {
    removeAllPills();
    
    setTimeout(() => {
        addMessage(`<strong>Consequences of Not Registering Before Payroll:</strong>

<strong>Immediate issues:</strong>
• Cannot legally withhold Maine state income tax
• Unable to remit required employer taxes
• Sarah's paycheck will be incorrect

<strong>Penalties and fines:</strong>
• <strong>Late registration:</strong> $50-$500 per month
• <strong>Failure to withhold:</strong> 100% of unpaid tax becomes employer liability
• <strong>Late payment penalties:</strong> 1.5% per month on unpaid taxes
• <strong>Interest charges:</strong> Current rate of 7% annually

<strong>Employee impact:</strong>
• Sarah would owe estimated taxes quarterly
• Potential underpayment penalties for her
• Complications with her year-end tax filing

<strong>UKG system issues:</strong>
• Cannot configure Maine tax tables without account numbers
• Retroactive adjustments become complex
• May require manual calculations outside the system

<div style="background: #ffebee; border: 1px solid #ef5350; border-radius: 4px; padding: 12px; margin: 16px 0;">
    <strong>⚠️ Bottom line:</strong> Processing payroll without proper registration creates liability and compliance issues that are difficult to correct later.
</div>`, 'ai', [
            { action: 'add-maine-tax', text: 'Yes, add', buttonType: 'primary' },
            { action: 'delay-sarah-start', text: 'Consider delaying Sarah\'s start date', buttonType: 'secondary' }
        ]);
    }, 800);
    
    return true;
}


// Function to show deposit schedule configuration with extracted data
function showPaymentScheduleConfiguration() {
    // Tax deposit schedules based on actual 2025 state requirements
    const extractedSchedules = [
        {
            state: 'Massachusetts',
            taxes: [
                { taxType: 'State Income Tax (SIT)', frequency: 'Monthly' }, // Required for all MA employers with employees earning >$8k/year
                { taxType: 'SUI/Recovery Assessment', frequency: 'Quarterly' }, // Required for most employers
                { taxType: 'PFML (Paid Family & Medical Leave)', frequency: 'Quarterly' }, // Required for most employers
                { taxType: 'EMAC (Employer Medical Assistance)', frequency: 'Quarterly' }, // Required for employers with >5 employees
                { taxType: 'Workforce Training Fund', frequency: 'Quarterly' } // Required for UI payers
            ]
        },
        {
            state: 'Maine',
            taxes: [
                { taxType: 'State Income Tax (SIT)', frequency: 'Monthly' }, // Maine withholding tax
                { taxType: 'SUTA (Unemployment)', frequency: 'Semi-weekly' }, // Maine SUTA
                { taxType: 'Paid Family & Medical Leave', frequency: 'Quarterly' }, // Employee & employer share
                { taxType: 'Competitive Skills Scholarship Fund', frequency: 'Quarterly' }, // SUTA surcharge
                { taxType: 'Unemployment Program Admin Fund', frequency: 'Quarterly' } // SUTA surcharge
            ]
        }
    ];
    
    // IMPORTANT: Keep the right panel open if it already is
    // The Maine tax configuration panel should remain visible
    const tablePanel = document.getElementById('tablePanel');
    if (tablePanel) {
        // Only ensure it's visible, don't replace content if it's already showing tax config
        if (!tablePanel.style.display || tablePanel.style.display === 'none') {
            tablePanel.style.display = 'block';
            tablePanel.classList.remove('hidden');
            tablePanel.classList.add('visible');
        }
    }
    
    // Adjust chat panel width
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        chatPanel.classList.remove('intro-mode');
        chatPanel.classList.add('right-panel-open');
    }
    
    // KEEP THE EXISTING TAX PANEL CONTENT - DON'T REPLACE IT
    // The Maine tax configuration should remain visible
    // Only update if the panel is empty or not showing tax config
    if (tablePanel && !tablePanel.querySelector('.state-tax-panel')) {
        // Generate deposit schedule panel content only if tax panel isn't showing
        tablePanel.innerHTML = `
        <div class="deposit-schedule-panel" style="padding: 24px; background: white; height: 100%; overflow-y: auto;">
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a;">
                    State Tax Deposit Schedules
                </h3>
                <p style="color: #666; font-size: 14px; margin: 0;">
                    Configure deposit frequencies for ${extractedSchedules.length} states
                </p>
            </div>
            
            <div class="schedule-cards-container">
                ${extractedSchedules.map((schedule, index) => generatePaymentScheduleCard(schedule, index)).join('')}
            </div>

        </div>
    `;
    
    // Add AI message
    addMessage(`Based on your tax configuration, here are your tax deposit schedules by state:

Massachusetts (5 tax types)
Maine (5 tax types)

These frequencies are based on 2025 state requirements and your company size.

Would you like to confirm these deposit schedules?`, 'ai', [
        { action: 'confirm-deposit-schedules', text: 'Schedules look correct', buttonType: 'primary' },
        { action: 'modify-deposit-schedules', text: 'Make adjustments', buttonType: 'secondary' }
    ], {
        style: 'two-tier-interactive',
        tierTwoOptions: [
            { action: 'what-is-deposit-schedule', text: 'What is a deposit schedule?' },
            { action: 'how-to-assign-employees', text: 'How do I assign employees?' }
        ]
    });
    }
}

// Function to generate individual deposit schedule card by state
function generatePaymentScheduleCard(stateSchedule, stateIndex) {
    const frequencyOptions = [
        'Weekly',
        'Semi-Monthly', 
        'Monthly',
        'Quarterly',
        'Annual'
    ];
    
    return `
        <div class="tax-configuration-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative; transition: all 0.3s ease; margin-bottom: 20px;">
            <div style="margin-bottom: 16px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">
                    ${stateSchedule.state} Tax Deposit Schedule
                    ${stateSchedule.isRecommended ? '<span style="background: #e3f2fd; color: #1976d2; padding: 3px 10px; border-radius: 4px; font-size: 12px; margin-left: 10px; font-weight: 500;">Recommended</span>' : ''}
                </h3>
                <span style="display: inline-block; margin-top: 4px; font-size: 13px; color: #666;">${stateSchedule.taxes.length} tax types configured</span>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 6px; padding: 16px;">
                ${stateSchedule.taxes.map((tax, taxIndex) => `
                    <div style="${taxIndex > 0 ? 'padding-top: 12px; margin-top: 12px; border-top: 1px solid #e0e0e0;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px;">
                            <span style="color: #666; font-weight: 500;">${tax.taxType}</span>
                            <div style="text-align: right;">
                                <select 
                                    id="deposit-frequency-${stateIndex}-${taxIndex}"
                                    style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; background: white; cursor: pointer; min-width: 150px;"
                                    onchange="updateDepositFrequency('${stateSchedule.state}', '${tax.taxType}', this.value)"
                                >
                                    ${frequencyOptions.map(freq => `
                                        <option value="${freq}" ${freq === tax.frequency ? 'selected' : ''}>
                                            ${freq}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Update deposit frequency function
window.updateDepositFrequency = function updateDepositFrequency(state, taxType, newFrequency) {
    console.log(`Updated ${state} ${taxType} deposit schedule to ${newFrequency}`);
    // In a real implementation, this would update the state and potentially save to backend
}

// Handle deposit schedule confirmation
function confirmPaymentSchedules() {
    addMessage('Schedules look correct', 'user');
    
    removeAllPills();
    
    // Close right panel
    const tablePanel = document.getElementById('tablePanel');
    if (tablePanel) {
        tablePanel.classList.remove('visible');
        tablePanel.classList.add('hidden');
        setTimeout(() => {
            tablePanel.style.display = 'none';
        }, 300);
    }
    
    // Adjust chat panel back to full width
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        chatPanel.classList.remove('right-panel-open');
        chatPanel.classList.add('intro-mode');
    }
    
    setTimeout(() => {
        addMessage(`Excellent! Your deposit schedules have been confirmed:

✓ Semi-Monthly Salary: 45 employees
✓ Weekly Hourly: 68 employees

The next step would typically be to configure the specific deposit rules, holiday adjustments, and direct deposit settings for each schedule.

Your payroll configuration is taking shape nicely! The tax setup and deposit schedules are now in place.`, 'ai', [
            { action: 'continue-to-next-setup', text: 'Continue to next setup', buttonType: 'primary' },
            { action: 'review-configuration', text: 'Review configuration', buttonType: 'secondary' }
        ]);
    }, 1000);
    
    return true;
}

// Handle deposit schedule modification
function modifyPaymentSchedules() {
    addMessage('Make adjustments', 'user');
    
    removeAllPills();
    
    setTimeout(() => {
        addMessage(`Let's adjust your deposit schedules. What would you like to modify?

You can:
• Add a new deposit schedule for a different group
• Change the frequency of an existing schedule
• Adjust which employees are on which schedule
• Modify deposit dates or rules

What changes would you like to make?`, 'ai', [
            { action: 'add-new-schedule', text: 'Add new schedule', buttonType: 'primary' },
            { action: 'change-frequency', text: 'Change frequency', buttonType: 'secondary' },
            { action: 'adjust-assignments', text: 'Adjust employee assignments', buttonType: 'secondary' }
        ]);
    }, 1000);
    
    return true;
}

function showStateTaxRequirements() {
    addMessage('What other state taxes are required?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>Complete State Tax Requirements:</strong>

Beyond income tax, states require various other taxes:

<strong>All States (Universal):</strong>
• State Unemployment Insurance (SUTA)
• Workers' Compensation Insurance

<strong>New York Additional:</strong>
• NY Disability Insurance (DBL)
• NY Paid Family Leave (PFL)
• NYC/Yonkers local tax (if applicable)

<strong>New Jersey Additional:</strong>
• Temporary Disability Insurance (TDI)
• Family Leave Insurance (FLI)
• Workforce Development Fund

<strong>Massachusetts Additional:</strong>
• MA Family and Medical Leave (PFML)
• MA Workforce Training Fund

<strong>New Hampshire:</strong>
• Only SUTA required (no income tax)

<strong>Important:</strong> UKG will help configure all required taxes based on your state registrations. Missing any can result in penalties.`, 'ai', [
            { action: 'state-taxes-confirmed', text: 'Continue with setup', buttonType: 'primary' }
        ]);
    }, 800);
    
    return true;
}

// New functions for tax configuration options
function assignCoworkerToTax() {
    addMessage('Invite a coworker', 'user');
    
    removeAllPills();
    
    setTimeout(() => {
        addMessage(`<strong>Delegate Tax Configuration</strong>

I can help you invite a coworker to handle the tax configuration. They'll need specific permissions to:

• View and edit tax registrations
• Access uploaded tax documents
• Configure state and federal tax settings
• Set up deposit schedules

<strong>Who would you like to invite?</strong>`, 'ai', [
            { action: 'enter-coworker-email', text: 'Enter email address', buttonType: 'primary' },
            { action: 'select-existing-team', text: 'Select from team', buttonType: 'secondary' },
            { action: 'back-to-tax-options', text: 'Back to options', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'what-permissions-needed', text: 'What permissions do they need?' },
                { action: 'can-multiple-work', text: 'Can multiple people work on taxes?' }
            ]
        });
    }, 800);
    
    return true;
}

function workOnOtherConfigurations() {
    addMessage('Work on other configurations', 'user');
    
    removeAllPills();
    
    setTimeout(() => {
        addMessage(`<strong>Other Configuration Options</strong>

While tax configuration is pending, you can work on these other important setup areas:

<strong>Available Configurations:</strong>

• <strong>Pay Schedules</strong> - Set up weekly, bi-weekly, or monthly pay cycles
• <strong>Earning Codes</strong> - Configure regular pay, overtime, bonuses
• <strong>Deductions</strong> - Set up benefits, retirement, garnishments
• <strong>Time & Attendance</strong> - Configure time tracking rules
• <strong>Direct Deposit</strong> - Set up bank account connections

<strong>What would you like to configure?</strong>`, 'ai', [
            { action: 'configure-pay-schedules', text: 'Pay Schedules', buttonType: 'primary' },
            { action: 'configure-earning-codes', text: 'Earning Codes', buttonType: 'secondary' },
            { action: 'configure-deductions', text: 'Deductions', buttonType: 'secondary' },
            { action: 'back-to-tax-options', text: 'Back to taxes', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: [
                { action: 'config-priority-order', text: 'What order should I do these?' },
                { action: 'time-to-complete', text: 'How long does each take?' }
            ]
        });
    }, 800);
    
    return true;
}

// New Related Questions Handler Functions
function showMaineEmployerRegistration() {
    addMessage('How do I register as an employer in Maine?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>📋 Maine Employer Registration Guide</strong>

To register as an employer in Maine, you'll need to complete these steps:

<strong>1. Register with Maine Revenue Services (MRS)</strong>
• Go to maine.gov/revenue
• Register for a Maine Employer Withholding Tax Account
• You'll receive your withholding account number

<strong>2. Register with Maine Department of Labor</strong>
• Register for Maine Unemployment Insurance (SUI)
• Apply for Maine Paid Family and Medical Leave (PFML)
• Register for Competitive Skills Fund and Unemployment Admin Fund

<strong>Required Information:</strong>
• Federal EIN (Employer Identification Number)
• Business name and address
• Date wages first paid in Maine
• Estimated number of Maine employees
• Estimated quarterly wages

<strong>Timeline:</strong>
• Registration typically takes 1-2 weeks
• Some accounts activate immediately online
• Physical letters with account numbers arrive within 10 business days

Would you like me to help you set up these taxes while you complete registration?`, 'ai', [
            { action: 'configure-while-registering', text: 'Yes, configure while registering', buttonType: 'primary' },
            { action: 'wait-for-registration', text: 'Wait until registration is complete', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: DEFAULT_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function showRemoteEmployees() {
    addMessage('What if these employees are remote?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>🏠 Remote Employee Tax Requirements</strong>

Remote employees create unique tax obligations based on where they physically work:

<strong>Key Tax Principles for Remote Workers:</strong>

<strong>1. Work Location Determines Taxes</strong>
• Taxes are based on where the employee physically performs work
• Not where your company is headquartered
• Each state where employees work may require registration

<strong>2. State-Specific Requirements:</strong>

<strong>• States WITH Income Tax</strong>
If remote employees work from these states, you typically need:
- State withholding registration
- State unemployment insurance (SUI)
- State-specific employer taxes

<strong>• States WITHOUT Income Tax</strong>
Alaska, Florida, Nevada, South Dakota, Tennessee, Texas, Washington, Wyoming
- Still require unemployment insurance registration
- May have other employer obligations

<strong>3. Common Remote Work Scenarios:</strong>

<strong>• Full-Time Remote in Another State</strong>
✓ Register in employee's work state
✓ Withhold that state's income tax
✓ Pay that state's unemployment insurance

<strong>• Temporary Remote Work</strong>
✓ Many states have 30-60 day thresholds
✓ Short visits may not trigger requirements
✓ Extended stays create tax obligations

<strong>• Multi-State Remote Workers</strong>
✓ May owe taxes to multiple states
✓ Track days worked in each state
✓ Apply reciprocity agreements if available

<strong>4. Maine-Specific Remote Work:</strong>
If you have remote employees working FROM Maine:
• Must register with Maine Revenue Services
• Withhold Maine income tax
• Pay Maine unemployment insurance (2.75% new employer rate)
• Register for Maine PFML and other state taxes

<strong>Action Items for Remote Employees:</strong>
1. Identify each remote employee's work location(s)
2. Check that state's tax requirements
3. Register in states where you have remote workers
4. Set up appropriate tax withholdings

Do you have remote employees working from specific states?`, 'ai', [
            { action: 'add-remote-state', text: 'Add state for remote employees', buttonType: 'primary' },
            { action: 'continue-without-remote', text: 'No remote employees', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: DEFAULT_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

function showCanChangeLater() {
    addMessage('Can I change this later?', 'user');
    
    setTimeout(() => {
        addMessage(`<strong>✏️ Making Changes After Setup</strong>

Yes, you can modify your tax configuration at any time. Here's what you need to know:

<strong>What You Can Change Anytime:</strong>
✓ Tax account numbers and IDs
✓ SUI/SUTA tax rates (when updated by state)
✓ Deposit frequencies (with IRS/state approval)
✓ Add new state or local taxes
✓ Update wage bases and limits
✓ Correct any data entry errors

<strong>How to Make Changes:</strong>
1. <strong>Through Settings</strong> - Access tax configuration in payroll settings
2. <strong>Before Payroll</strong> - Review and update before each payroll run
3. <strong>Bulk Updates</strong> - Update multiple taxes at once
4. <strong>Effective Dating</strong> - Set when changes should take effect

<strong>Important Considerations:</strong>

<strong>• Mid-Year Changes</strong>
Changes may affect year-to-date calculations
System will recalculate automatically

<strong>• Historical Data</strong>
Past payrolls remain unchanged
Only affects future payroll runs

<strong>• Compliance Updates</strong>
We automatically update standard rates
You only need to update your specific rates (like SUI)

<strong>• Adding New States</strong>
Can add new state taxes anytime
Useful for business expansion or remote employees

<strong>Best Practice:</strong>
Review your tax setup quarterly or when:
• Receiving rate change notices
• Expanding to new states
• Adding new types of employees
• Getting new tax registrations

Should we continue with your current setup?`, 'ai', [
            { action: 'continue-current-setup', text: 'Yes, continue', buttonType: 'primary' },
            { action: 'make-changes-now', text: 'Make changes first', buttonType: 'secondary' }
        ], {
            style: 'two-tier-interactive',
            tierTwoOptions: DEFAULT_TAX_RELATED_QUESTIONS
        });
    }, 800);
    
    return true;
}

// Export functions to window for global access
window.handleTaxConfigurationPill = handleTaxConfigurationPill;
